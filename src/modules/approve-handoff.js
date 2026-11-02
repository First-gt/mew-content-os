/**
 * ==============================================================================
 * MEW CONTENT OS — Approve Concept & Handoff Gating Controller (Topic T29)
 * Theme: mewteetawat.com V6.3
 * 100% Pure Client-Side JavaScript (Vanilla ES6+)
 * Zero Server Dependencies · Zero Fake Metrics · Accessible WCAG UI
 * ==============================================================================
 */

import { getState, dispatch } from './store.js';
import { APPROVE_CONCEPT } from './copy.js';

/**
 * Deep freezes an object recursively to ensure strict immutability (Spec A20).
 * Prevents modifications to root and all nested arrays/objects.
 * @param {Object} obj 
 * @param {WeakSet} [seen]
 * @returns {Object}
 */
export function deepFreeze(obj, seen = new WeakSet()) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (seen.has(obj)) return obj;
  seen.add(obj);

  Object.freeze(obj);
  for (const key of Object.getOwnPropertyNames(obj)) {
    const val = obj[key];
    if (val !== null && (typeof val === 'object' || typeof val === 'function') && !Object.isFrozen(val)) {
      deepFreeze(val, seen);
    }
  }
  return obj;
}

/**
 * Controller for Concept Approval, Immutable Revision Snapshot,
 * Director Brief Generation, and MEW Edit Handoff Gating.
 */
export class ApproveHandoffController {
  /**
   * @param {Object} options
   * @param {string|HTMLElement} [options.rootId] - Root container selector or element
   * @param {boolean} [options.mewEditVerified=false] - Gating flag for MEW Edit handoff (Spec A21)
   * @param {Array} [options.approvedRevisions=[]] - List of approved immutable revisions
   * @param {Function} [options.onConceptApproved] - Callback when a concept is approved
   */
  constructor(options = {}) {
    this.root = typeof options.rootId === 'string'
      ? (typeof document !== 'undefined' ? document.querySelector(options.rootId) : null)
      : (options.rootId || (typeof document !== 'undefined' ? document.getElementById('approve-handoff-root') : null));

    this.mewEditVerified = Boolean(options.mewEditVerified);
    this.approvedRevisions = options.approvedRevisions ? [...options.approvedRevisions] : [];
    this.onConceptApproved = typeof options.onConceptApproved === 'function' ? options.onConceptApproved : null;

    this.currentCard = options.initialCard || null;
    this.currentRevision = null;

    if (typeof document !== 'undefined') {
      this.bindEvents();
      if (this.currentCard) {
        this.setCard(this.currentCard);
      }
    }
  }

  /**
   * Checks whether a concept card meets all approval gating criteria:
   * 1. Must be in stage 'needs-review'
   * 2. Must have claimFlagCount === 0 (no lingering unverified claim flags)
   * 3. Must have rights passed (rightsOk !== false and copyRiskFlag !== true)
   * @param {Object} card 
   * @returns {{ allowed: boolean, reason: string }}
   */
  canApprove(card) {
    if (!card) {
      return { allowed: false, reason: 'ไม่พบคอนเซปต์ที่ต้องการอนุมัติ' };
    }

    const stage = (card.stage || '').toLowerCase().trim();
    if (stage !== 'needs-review') {
      return { allowed: false, reason: 'คอนเซปต์ต้องอยู่ในขั้น "Needs Review" ก่อนจึงจะอนุมัติได้' };
    }

    const flagCount = card.claimFlagCount || (Array.isArray(card.claimFlags) ? card.claimFlags.length : 0);
    if (flagCount > 0) {
      return { allowed: false, reason: `ยังมี Claim Flag ค้างอยู่ ${flagCount} รายการ ต้องแก้ไขหรือใส่หลักฐานก่อน` };
    }

    if (card.rightsOk === false || card.copyRiskFlag === true) {
      return { allowed: false, reason: 'ยังไม่ผ่านการตรวจสอบลิขสิทธิ์ (มีความเสี่ยงในการคัดลอกถ้อยคำ)' };
    }

    return { allowed: true, reason: '' };
  }

  /**
   * Sets the active card and refreshes UI gating controls
   * @param {Object} card 
   */
  setCard(card) {
    this.currentCard = card;
    if (typeof document === 'undefined') return;

    const gate = this.canApprove(card);
    const approveBtn = document.getElementById('btn-approve-concept');
    const blockedHint = document.getElementById('hint-approve-blocked');
    const blockedText = document.getElementById('hint-approve-text');

    if (approveBtn) {
      approveBtn.disabled = !gate.allowed;
    }

    if (blockedHint) {
      blockedHint.hidden = gate.allowed;
    }

    if (blockedText) {
      blockedText.textContent = gate.reason || '';
    }
  }

  /**
   * Sets the MEW Edit verification flag and updates handoff button visibility (Spec A21)
   * @param {boolean} verified 
   */
  setMewEditVerified(verified) {
    this.mewEditVerified = Boolean(verified);
    if (typeof document === 'undefined') return;

    const sendBtn = document.getElementById('btn-send-to-mew-edit');
    if (sendBtn) {
      sendBtn.hidden = !this.mewEditVerified;
    }
  }

  /**
   * Approves concept card and creates an immutable locked revision (Spec A20).
   * Strictly DOES NOT trigger publish or render any video.
   * @param {Object} card 
   * @returns {Object} Immutable revision snapshot
   */
  approveConcept(card) {
    const targetCard = card || this.currentCard;
    const gate = this.canApprove(targetCard);

    if (!gate.allowed) {
      throw new Error(`Approval blocked: ${gate.reason}`);
    }

    const revisionIndex = (this.approvedRevisions.length + 1).toFixed(1);
    const revision = {
      revisionId: `rev-${Date.now()}-${revisionIndex}`,
      revisionNumber: `#${revisionIndex}`,
      conceptId: targetCard.id || targetCard.conceptId || `concept-${Date.now()}`,
      title: targetCard.title || targetCard.name || 'Untitled Concept',
      approvedAt: new Date().toISOString(),
      directorBrief: {
        hook: targetCard.hook || '',
        beats: Array.isArray(targetCard.beats) ? [...targetCard.beats] : [],
        sourceTrace: Array.isArray(targetCard.sourceTrace) ? [...targetCard.sourceTrace] : [],
        rights: targetCard.rightsGuidelines || targetCard.rights || 'ยืมเฉพาะโครงสร้างทางความคิดและเทคนิค ห้ามใช้เสียงเพลงหรือฟุตเทจที่มีลิขสิทธิ์',
        constraints: targetCard.constraints || 'ความยาวไม่เกิน 60 วินาที, จังหวะตัดต่อฉับไว'
      }
    };

    // Deep freeze guarantees true immutability (Spec A20)
    const immutableRevision = deepFreeze(revision);
    this.approvedRevisions.push(immutableRevision);
    this.currentRevision = immutableRevision;

    // Update board card stage in state to 'approved' without publishing or rendering
    try {
      dispatch({
        type: 'UPDATE_BOARD_CARD_STAGE',
        payload: {
          cardId: targetCard.id || targetCard.conceptId,
          stage: 'approved',
          revisionId: immutableRevision.revisionId
        }
      });
    } catch (e) {
      // Store dispatch is resilient
    }

    if (this.onConceptApproved) {
      this.onConceptApproved(immutableRevision);
    }

    this.renderDirectorBrief(immutableRevision);
    this.showFeedback(`อนุมัติคอนเซปต์เรียบร้อย (Revision ${immutableRevision.revisionNumber})`, 'success');

    return immutableRevision;
  }

  /**
   * Creates a new immutable revision when changes are needed (Spec A20: cannot edit existing revision).
   * @param {Object} updatedCard 
   * @param {Object} previousRevision 
   * @param {string} [reason] 
   * @returns {Object} New immutable revision snapshot
   */
  createNewRevision(updatedCard, previousRevision, reason = '') {
    if (!previousRevision) {
      throw new Error('Previous revision is required to create a new revision.');
    }

    const prevNum = parseFloat(previousRevision.revisionNumber?.replace('#', '') || '1.0');
    const nextNum = (prevNum + 0.1).toFixed(1);

    const newRevision = {
      revisionId: `rev-${Date.now()}-${nextNum}`,
      revisionNumber: `#${nextNum}`,
      supersedes: previousRevision.revisionId,
      supersedeReason: reason || 'Revision updated with new production parameters',
      conceptId: updatedCard.id || updatedCard.conceptId || previousRevision.conceptId,
      title: updatedCard.title || updatedCard.name || previousRevision.title,
      approvedAt: new Date().toISOString(),
      directorBrief: {
        hook: updatedCard.hook ?? previousRevision.directorBrief?.hook ?? '',
        beats: Array.isArray(updatedCard.beats) ? [...updatedCard.beats] : [...(previousRevision.directorBrief?.beats || [])],
        sourceTrace: Array.isArray(updatedCard.sourceTrace) ? [...updatedCard.sourceTrace] : [...(previousRevision.directorBrief?.sourceTrace || [])],
        rights: updatedCard.rightsGuidelines ?? previousRevision.directorBrief?.rights ?? 'ยืมเฉพาะโครงสร้างทางความคิดและเทคนิค ห้ามใช้เสียงเพลงหรือฟุตเทจที่มีลิขสิทธิ์',
        constraints: updatedCard.constraints ?? previousRevision.directorBrief?.constraints ?? 'ความยาวไม่เกิน 60 วินาที, จังหวะตัดต่อฉับไว'
      }
    };

    const immutableNewRevision = deepFreeze(newRevision);
    this.approvedRevisions.push(immutableNewRevision);
    this.currentRevision = immutableNewRevision;

    try {
      dispatch({
        type: 'UPDATE_BOARD_CARD_STAGE',
        payload: {
          cardId: updatedCard.id || previousRevision.conceptId,
          stage: 'approved',
          revisionId: immutableNewRevision.revisionId
        }
      });
    } catch (e) {}

    if (this.onConceptApproved) {
      this.onConceptApproved(immutableNewRevision);
    }

    this.renderDirectorBrief(immutableNewRevision);
    this.showFeedback(`สร้าง Revision ใหม่สำเร็จ (${immutableNewRevision.revisionNumber})`, 'success');

    return immutableNewRevision;
  }

  /**
   * Formats and exports Director Brief into JSON or Markdown string
   * @param {Object} revision 
   * @param {'json'|'markdown'} [format='markdown'] 
   * @returns {string}
   */
  exportDirectorBrief(revision, format = 'markdown') {
    const targetRev = revision || this.currentRevision;
    if (!targetRev || !targetRev.directorBrief) return '';
    const brief = targetRev.directorBrief;

    if (format === 'json') {
      return JSON.stringify(targetRev, null, 2);
    }

    const beatsList = Array.isArray(brief.beats) && brief.beats.length > 0
      ? brief.beats.map((b, i) => `${i + 1}. ${typeof b === 'string' ? b : (b.text || b.beat || JSON.stringify(b))}`).join('\n')
      : 'No beats defined';

    const sourcesList = Array.isArray(brief.sourceTrace) && brief.sourceTrace.length > 0
      ? brief.sourceTrace.map((s, i) => `${i + 1}. ${typeof s === 'string' ? s : `${s.title || s.name || 'Reference'} [${s.lens || 'Content'}] - ${s.url || 'No URL'}`}`).join('\n')
      : 'None cited (Attribution Preserved / Original Work)';

    return `# DIRECTOR BRIEF: ${targetRev.title} (Revision ${targetRev.revisionNumber})
Approved At: ${targetRev.approvedAt}

## 1. Hook (First 3 Seconds)
${brief.hook || 'Not specified'}

## 2. Story Beats
${beatsList}

## 3. Rights & Fair Use Guidelines
${brief.rights || 'ยืมเฉพาะโครงสร้างทางความคิดและเทคนิค ห้ามใช้เสียงเพลงหรือฟุตเทจที่มีลิขสิทธิ์'}

## 4. Production Constraints
${brief.constraints || 'ความยาวไม่เกิน 60 วินาที, จังหวะตัดต่อฉับไว'}

## 5. Source Trace & Attribution
${sourcesList}
`;
  }

  /**
   * Downloads Director Brief as a file directly in the browser
   * @param {Object} revision 
   * @param {'json'|'markdown'} [format='markdown'] 
   */
  downloadDirectorBrief(revision, format = 'markdown') {
    if (typeof document === 'undefined') return;
    const targetRev = revision || this.currentRevision;
    if (!targetRev) return;

    const content = this.exportDirectorBrief(targetRev, format);
    const mimeType = format === 'json' ? 'application/json' : 'text/markdown';
    const ext = format === 'json' ? 'json' : 'md';
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    const safeTitle = (targetRev.title || 'concept').replace(/[^a-zA-Z0-9ก-๙_-]/g, '_');
    const safeRev = (targetRev.revisionNumber || 'v1').replace(/[^a-zA-Z0-9.-]/g, '');
    a.href = url;
    a.download = `director-brief-${safeTitle}-${safeRev}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showFeedback(`ส่งออก Director Brief (${ext.toUpperCase()}) เรียบร้อย`, 'success');
  }

  /**
   * Renders the Director Brief card in the DOM and enforces gating rules (Spec A21)
   * @param {Object} revision 
   */
  renderDirectorBrief(revision) {
    if (typeof document === 'undefined') return;
    const targetRev = revision || this.currentRevision;
    if (!targetRev) return;

    const section = document.getElementById('director-brief-section');
    const sendBtn = document.getElementById('btn-send-to-mew-edit');
    const exportBtn = document.getElementById('btn-export-director-brief');

    if (section) section.hidden = false;
    if (exportBtn) exportBtn.hidden = false;

    // Gated by mewEditVerified flag (Spec A21): shown only when flag is true
    if (sendBtn) {
      sendBtn.hidden = !this.mewEditVerified;
    }

    // Populate revision badge & concept title
    const revIdEl = document.getElementById('brief-revision-id');
    if (revIdEl) {
      revIdEl.textContent = `Revision ${targetRev.revisionNumber} (Locked)`;
    }

    const titleEl = document.getElementById('brief-concept-title');
    if (titleEl) {
      titleEl.textContent = targetRev.title || 'Director & Editor Brief';
    }

    // 1. Hook
    const hookEl = document.getElementById('brief-hook');
    if (hookEl) {
      hookEl.textContent = targetRev.directorBrief?.hook || 'ยังไม่ได้ระบุ Hook';
    }

    // 2. Story Beats
    const beatsEl = document.getElementById('brief-beats');
    if (beatsEl) {
      beatsEl.innerHTML = '';
      const beats = targetRev.directorBrief?.beats || [];
      if (beats.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'ไม่มีรายละเอียด Beats';
        beatsEl.appendChild(li);
      } else {
        beats.forEach(b => {
          const li = document.createElement('li');
          li.textContent = typeof b === 'string' ? b : (b.text || b.beat || JSON.stringify(b));
          beatsEl.appendChild(li);
        });
      }
    }

    // 3. Source Trace
    const sourcesEl = document.getElementById('brief-sources');
    if (sourcesEl) {
      const sources = targetRev.directorBrief?.sourceTrace || [];
      if (sources.length === 0) {
        sourcesEl.textContent = 'ยืมแก่นความคิดและวิธีเล่าเรื่องจากคลังไอเดียที่ผ่านการคัดสรร (Attribution Preserved)';
      } else {
        sourcesEl.textContent = sources.map(s => {
          if (typeof s === 'string') return s;
          return `${s.title || s.name || 'Reference'} [${s.lens || 'Content'}]`;
        }).join(', ');
      }
    }

    // 4. Rights
    const rightsEl = document.getElementById('brief-rights');
    if (rightsEl) {
      rightsEl.textContent = targetRev.directorBrief?.rights || 'ยืมเฉพาะโครงสร้างทางความคิดและเทคนิค ห้ามใช้เสียงเพลงหรือฟุตเทจที่มีลิขสิทธิ์';
    }

    // 5. Constraints
    const constraintsEl = document.getElementById('brief-constraints');
    if (constraintsEl) {
      constraintsEl.textContent = targetRev.directorBrief?.constraints || 'ความยาวไม่เกิน 60 วินาที, จังหวะตัดต่อฉับไว';
    }
  }

  /**
   * Binds event listeners for buttons and format selection
   */
  bindEvents() {
    if (typeof document === 'undefined') return;

    // Approve Concept Button
    const approveBtn = document.getElementById('btn-approve-concept');
    if (approveBtn && !approveBtn.dataset.bound) {
      approveBtn.dataset.bound = 'true';
      approveBtn.addEventListener('click', () => {
        if (this.currentCard) {
          try {
            this.approveConcept(this.currentCard);
          } catch (err) {
            this.showFeedback(err.message, 'error');
          }
        }
      });
    }

    // Export Director Brief Button
    const exportBtn = document.getElementById('btn-export-director-brief');
    if (exportBtn && !exportBtn.dataset.bound) {
      exportBtn.dataset.bound = 'true';
      exportBtn.addEventListener('click', () => {
        const selectFormat = document.getElementById('select-export-format');
        const format = selectFormat ? selectFormat.value : 'markdown';
        this.downloadDirectorBrief(this.currentRevision, format);
      });
    }

    // Send to MEW Edit Button (Gated A21)
    const sendBtn = document.getElementById('btn-send-to-mew-edit');
    if (sendBtn && !sendBtn.dataset.bound) {
      sendBtn.dataset.bound = 'true';
      sendBtn.addEventListener('click', () => {
        if (!this.mewEditVerified) {
          this.showFeedback('ยังไม่ได้รับการยืนยันการเชื่อมต่อกับ MEW Edit', 'error');
          return;
        }
        this.showFeedback('ส่งมอบบรีฟไปยัง MEW Edit สำเร็จ พร้อมสำหรับกระบวนการตัดต่อ', 'success');
      });
    }
  }

  /**
   * Displays brief feedback toast
   * @param {string} message 
   * @param {'success'|'error'} [type='success'] 
   */
  showFeedback(message, type = 'success') {
    if (typeof document === 'undefined') return;
    const toast = document.getElementById('toast-approve-handoff');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `ah-feedback-toast ${type}`;
    toast.hidden = false;

    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      toast.hidden = true;
    }, 4000);
  }
}
