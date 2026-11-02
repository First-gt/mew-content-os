/**
 * ==============================================================================
 * MEW CONTENT OS — S08 Concept Detail & Script Draft Controller (Topic T27)
 * Theme: mewteetawat.com V6.3
 * 100% Pure Client-Side JavaScript (Vanilla ES6+)
 * Zero Server Dependencies · Zero Fake Metrics · Accessible WCAG UI
 * ==============================================================================
 */

import { getState, dispatch } from './store.js';
import { ProvenanceManager } from './provenance.js';
import { SAVE_REMIX_DRAFT } from './copy.js';

export class ConceptDetailController {
  constructor(options = {}) {
    this.root = typeof options.rootId === 'string'
      ? (typeof document !== 'undefined' ? document.querySelector(options.rootId) : null)
      : (options.rootId || (typeof document !== 'undefined' ? document.getElementById('concept-detail-root') : null));

    this.currentConcept = options.concept ? { ...options.concept } : null;
    this.references = Array.isArray(options.references || options.ingredients)
      ? [...(options.references || options.ingredients)]
      : [];
    this.direction = options.direction ? { ...options.direction } : null;

    // Resolve missing references or direction from store if available
    try {
      const state = getState();
      if (this.references.length === 0 && state?.remixSession?.ingredients?.length) {
        this.references = [...state.remixSession.ingredients];
      }
      if (!this.direction && state?.remixSession?.direction) {
        this.direction = { ...state.remixSession.direction };
      }
    } catch (e) {}

    const concept = this.currentConcept || {};
    this.scriptDraft = {
      conceptId: concept.id || 'default-concept',
      scriptHook: options.initialHook || concept.hook || concept.scriptHook || '',
      fullScript: options.initialScript || concept.fullScript || concept.script || '',
      rationale: concept.rationale || '',
      outline: Array.isArray(concept.outline) ? [...concept.outline] : [],
      sceneSound: concept.sceneSound || '',
      proofRequired: concept.proofRequired || '',
      cta: concept.cta || '',
      lastSaved: null
    };

    this.onDraftSaved = options.onDraftSaved || null;
    this.onEditApplied = options.onEditApplied || null;

    if (typeof document !== 'undefined' && this.root) {
      this.initDOM();
    }
  }

  /**
   * Sets the active concept non-destructively and updates editable draft fields
   * @param {Object} concept 
   */
  setConcept(concept) {
    if (!concept) {
      this.currentConcept = null;
      return;
    }

    // Keep original concept unmutated
    this.currentConcept = { ...concept };

    this.scriptDraft.conceptId = concept.id || this.scriptDraft.conceptId;
    if (!this.scriptDraft.scriptHook || this.scriptDraft.scriptHook === '') {
      this.scriptDraft.scriptHook = concept.hook || concept.scriptHook || '';
    }
    if (!this.scriptDraft.fullScript || this.scriptDraft.fullScript === '') {
      this.scriptDraft.fullScript = concept.fullScript || concept.script || '';
    }
    this.scriptDraft.rationale = concept.rationale || this.scriptDraft.rationale;
    this.scriptDraft.outline = Array.isArray(concept.outline) ? [...concept.outline] : this.scriptDraft.outline;
    this.scriptDraft.sceneSound = concept.sceneSound || this.scriptDraft.sceneSound;
    this.scriptDraft.proofRequired = concept.proofRequired || this.scriptDraft.proofRequired;
    this.scriptDraft.cta = concept.cta || this.scriptDraft.cta;

    if (typeof document !== 'undefined' && this.root) {
      this.render();
    }
  }

  /**
   * Sets references for provenance snapshot
   * @param {Array<Object>} refs 
   */
  setReferences(refs) {
    this.references = Array.isArray(refs) ? [...refs] : [];
    this.updateSnapshotBadge();
  }

  /**
   * Sets direction parameters for snapshot
   * @param {Object} dir 
   */
  setDirection(dir) {
    this.direction = dir ? { ...dir } : null;
    this.updateSnapshotBadge();
  }

  /**
   * Saves script draft non-destructively without modifying original concept (Spec A19)
   * Maintained for backward compatibility with existing tests and scripts.
   * @param {string} [hookText] 
   * @param {string} [fullText] 
   * @returns {Object} Draft record
   */
  saveScriptDraft(hookText, fullText) {
    if (hookText !== undefined) this.scriptDraft.scriptHook = hookText;
    if (fullText !== undefined) this.scriptDraft.fullScript = fullText;
    this.scriptDraft.lastSaved = new Date().toISOString();

    const draftRecord = {
      conceptId: this.currentConcept?.id || this.scriptDraft.conceptId || 'default-concept',
      scriptHook: this.scriptDraft.scriptHook,
      fullScript: this.scriptDraft.fullScript,
      savedAt: this.scriptDraft.lastSaved
    };

    // Dispatch save draft to store
    try {
      dispatch({
        type: 'SAVE_SCRIPT_DRAFT',
        payload: draftRecord
      });
    } catch (e) {}

    // Persist to localStorage
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`mew_script_draft_${draftRecord.conceptId}`, JSON.stringify(draftRecord));
      }
    } catch (e) {}

    if (typeof this.onDraftSaved === 'function') {
      this.onDraftSaved(draftRecord);
    }

    return draftRecord;
  }

  /**
   * Saves Remix Draft to Content Board (S09 / Topic T27 DOD):
   * - Saves to boardItems with stage 'Draft'
   * - Strictly does NOT approve, publish, or render
   * - Stores snapshot of references + direction at that moment (used in T30)
   * - Shows toast-draft-saved with link to Content Board
   * @param {Object} [customOptions]
   * @returns {Object} Saved board item record
   */
  saveRemixDraft(customOptions = {}) {
    // Sync current values from DOM if available
    if (typeof document !== 'undefined') {
      const hookEl = document.getElementById('cd-script-hook');
      const scriptEl = document.getElementById('script-editor');
      if (hookEl && hookEl.value !== undefined) this.scriptDraft.scriptHook = hookEl.value;
      if (scriptEl && scriptEl.value !== undefined) this.scriptDraft.fullScript = scriptEl.value;
    }

    this.scriptDraft.lastSaved = new Date().toISOString();

    // 1. Snapshot references used (using ProvenanceManager from T30)
    let refSnapshots = [];
    try {
      if (typeof ProvenanceManager?.createSnapshot === 'function') {
        refSnapshots = ProvenanceManager.createSnapshot(this.references);
      } else {
        refSnapshots = this.references.map(ref => ({
          refId: ref.id || ref.noteId,
          sourceId: ref.sourceId || ref.id,
          title: ref.title || 'Untitled Reference',
          why: ref.founderWhy || ref.why || '',
          sourceUrl: ref.sourceUrl || '',
          lens: ref.vaultType || ref.lens || 'content',
          analysisVersion: ref.analysisVersionId || ref.version || 'v1.0',
          snapshottedAt: new Date().toISOString()
        }));
      }
    } catch (e) {
      refSnapshots = [];
    }

    // 2. Snapshot direction used at this moment
    const dirSnapshot = this.direction ? {
      audience: this.direction.audience || '',
      ourPov: this.direction.ourPov || '',
      cta: this.direction.cta || '',
      tone: this.direction.tone || '',
      capturedAt: new Date().toISOString()
    } : {
      audience: '',
      ourPov: '',
      cta: '',
      tone: '',
      capturedAt: new Date().toISOString()
    };

    const conceptId = this.currentConcept?.id || this.scriptDraft.conceptId || `concept-${Date.now()}`;
    const boardItemId = customOptions.id || `board-item-${Date.now()}`;

    // 3. Construct board item strictly in 'Draft' stage (NOT approved / published / rendered)
    const boardItem = {
      id: boardItemId,
      conceptId: conceptId,
      title: this.currentConcept?.name || this.currentConcept?.title || 'Original Script Draft',
      scriptHook: this.scriptDraft.scriptHook,
      fullScript: this.scriptDraft.fullScript,
      stage: 'Draft',
      status: 'Draft',
      isApproved: false,
      approved: false,
      published: false,
      rendered: false,
      sourceTrace: refSnapshots,
      referencesSnapshot: refSnapshots,
      directionSnapshot: dirSnapshot,
      rationale: this.scriptDraft.rationale || this.currentConcept?.rationale || '',
      outline: Array.isArray(this.scriptDraft.outline) ? [...this.scriptDraft.outline] : (this.currentConcept?.outline || []),
      sceneSound: this.scriptDraft.sceneSound || this.currentConcept?.sceneSound || '',
      proofRequired: this.scriptDraft.proofRequired || this.currentConcept?.proofRequired || '',
      cta: this.scriptDraft.cta || this.currentConcept?.cta || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 4. Dispatch ADD_BOARD_ITEM to store
    try {
      dispatch({
        type: 'ADD_BOARD_ITEM',
        payload: boardItem
      });
    } catch (e) {}

    // Also dispatch SAVE_SCRIPT_DRAFT for state sync
    try {
      dispatch({
        type: 'SAVE_SCRIPT_DRAFT',
        payload: {
          conceptId: boardItem.conceptId,
          scriptHook: boardItem.scriptHook,
          fullScript: boardItem.fullScript,
          savedAt: boardItem.updatedAt
        }
      });
    } catch (e) {}

    // 5. Persist to localStorage board items
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = JSON.parse(localStorage.getItem('mew_content_board_items') || '[]');
        const updated = Array.isArray(stored) ? stored.filter(b => b.id !== boardItem.id) : [];
        updated.unshift(boardItem);
        localStorage.setItem('mew_content_board_items', JSON.stringify(updated));
        localStorage.setItem(`mew_script_draft_${boardItem.conceptId}`, JSON.stringify(boardItem));
      }
    } catch (e) {}

    // 6. Show toast notification in DOM
    this.showToastDraftSaved();

    if (typeof this.onDraftSaved === 'function') {
      this.onDraftSaved(boardItem);
    }

    return boardItem;
  }

  /**
   * Applies plain text natural language edit instruction (e.g. Founder guidance)
   * Examples:
   * - "เพิ่มตัวอย่างจริงจากธุรกิจเรา"
   * - "อย่าใช้ตัวเลขที่ไม่มีที่มา"
   * - "ทำ suspense ให้น้อยลง"
   * @param {string} instruction 
   * @returns {Object} Updated scriptDraft
   */
  applyEdit(instruction) {
    if (!instruction || typeof instruction !== 'string' || instruction.trim() === '') {
      return this.scriptDraft;
    }

    const text = instruction.trim();

    // 1. Instruction: เพิ่มตัวอย่างจริงจากธุรกิจเรา / ตัวอย่างจริง
    if (text.includes('ตัวอย่างจริง') || text.includes('ธุรกิจเรา')) {
      const realCaseNote = 'หลักฐานจากเคสจริงในธุรกิจ: แสดงขั้นตอนการทำงานเบื้องหลัง ตัวอย่างผลงานจริง และข้อเท็จจริงที่ตรวจสอบได้ ไม่กล่าวอ้างเกินจริง';
      this.scriptDraft.proofRequired = realCaseNote;

      const businessExampleSection = '\n\n[ตัวอย่างจริงจากธุรกิจ]: เล่าขั้นตอนที่เราแก้ปัญหานี้ให้ลูกค้าจริง แสดงสิ่งที่เกิดขึ้นจริงโดยไม่ใช้สถิติลอยๆ';
      if (!this.scriptDraft.fullScript.includes('[ตัวอย่างจริงจากธุรกิจ]')) {
        this.scriptDraft.fullScript = (this.scriptDraft.fullScript ? this.scriptDraft.fullScript.trim() : '') + businessExampleSection;
      }
    }

    // 2. Instruction: อย่าใช้ตัวเลขที่ไม่มีที่มา / ไม่มีที่มา / สถิติ
    if (text.includes('อย่าใช้ตัวเลขที่ไม่มีที่มา') || text.includes('ไม่มีที่มา') || text.includes('สถิติ')) {
      const honestProofNote = 'ตัดตัวเลขลอยๆ ที่ไม่มีแหล่งอ้างอิงชัดเจนออก มุ่งเน้นการเล่าเรื่องเชิงระบบและข้อเท็จจริงที่พิสูจน์ได้';
      this.scriptDraft.proofRequired = honestProofNote;

      // Cleanse vague stat phrasing if present
      if (this.scriptDraft.scriptHook) {
        this.scriptDraft.scriptHook = this.scriptDraft.scriptHook
          .replace(/[\d]+%|[\d]+\s*เท่า/g, 'อย่างเห็นได้ชัด')
          .trim();
      }
    }

    // 3. Instruction: ทำ suspense ให้น้อยลง / suspense
    if (text.includes('suspense') || text.includes('ลด suspense') || text.includes('ตื่นเต้นน้อยลง')) {
      this.scriptDraft.sceneSound = 'ลดการบิ้วท์อารมณ์หรือความตึงเครียดเกินจริง ปรับจังหวะภาพให้สงบ เป็นธรรมชาติ และเปิดประเด็นตรงไปตรงมา';
      
      if (this.scriptDraft.scriptHook && !this.scriptDraft.scriptHook.startsWith('ข้อเท็จจริงคือ:')) {
        this.scriptDraft.scriptHook = 'ข้อเท็จจริงคือ: ' + this.scriptDraft.scriptHook.replace(/^(คุณรู้ไหมว่า|ความจริงที่น่าตกใจคือ)\s*/, '');
      }
    }

    // Generic instruction fallback if none of specific keywords matched
    if (!text.includes('ตัวอย่างจริง') && !text.includes('ธุรกิจเรา') && !text.includes('ไม่มีที่มา') && !text.includes('suspense')) {
      const note = `[คำแนะนำจาก Founder]: ${text}`;
      if (!this.scriptDraft.fullScript.includes(note)) {
        this.scriptDraft.fullScript = (this.scriptDraft.fullScript ? this.scriptDraft.fullScript.trim() : '') + `\n\n${note}`;
      }
    }

    // Reflect changes in DOM if present
    if (typeof document !== 'undefined') {
      const hookEl = document.getElementById('cd-script-hook');
      if (hookEl) hookEl.value = this.scriptDraft.scriptHook;

      const scriptEl = document.getElementById('script-editor');
      if (scriptEl) scriptEl.value = this.scriptDraft.fullScript;

      const proofEl = document.getElementById('cd-proof-required');
      if (proofEl) proofEl.textContent = this.scriptDraft.proofRequired;

      const soundEl = document.getElementById('cd-scene-sound');
      if (soundEl) soundEl.textContent = this.scriptDraft.sceneSound;

      const statusEl = document.getElementById('edit-applied-status');
      if (statusEl) {
        statusEl.textContent = `ปรับปรุงบทตามคำสั่งแล้ว: "${text.length > 25 ? text.slice(0, 25) + '...' : text}"`;
      }
    }

    if (typeof this.onEditApplied === 'function') {
      this.onEditApplied(this.scriptDraft, text);
    }

    return this.scriptDraft;
  }

  /**
   * Shows toast notification that draft has been saved to Content Board
   */
  showToastDraftSaved() {
    if (typeof document === 'undefined') return;

    const toast = document.getElementById('toast-draft-saved');
    if (!toast) return;

    toast.removeAttribute('hidden');
    toast.style.display = 'block';

    const closeBtn = document.getElementById('btn-close-toast');
    if (closeBtn && !closeBtn._hasClickListener) {
      closeBtn._hasClickListener = true;
      closeBtn.addEventListener('click', () => {
        toast.setAttribute('hidden', 'true');
        toast.style.display = 'none';
      });
    }
  }

  /**
   * Updates snapshot badge summary display in DOM
   */
  updateSnapshotBadge() {
    if (typeof document === 'undefined') return;

    const countEl = document.getElementById('snap-ref-count');
    if (countEl) {
      countEl.textContent = `References: ${this.references.length} ชิ้น`;
    }

    const dirEl = document.getElementById('snap-dir-status');
    if (dirEl) {
      dirEl.textContent = this.direction?.audience
        ? `Audience: ${this.direction.audience}`
        : 'Direction: บันทึกพร้อมดราฟต์';
    }
  }

  /**
   * Renders data into DOM elements
   */
  render() {
    if (typeof document === 'undefined') return;

    const titleEl = document.getElementById('cd-title');
    if (titleEl && (this.currentConcept?.title || this.currentConcept?.name)) {
      titleEl.textContent = this.currentConcept.title || this.currentConcept.name;
    }

    const subtagEl = document.getElementById('cd-subtag');
    if (subtagEl && this.currentConcept?.id) {
      subtagEl.textContent = `Concept ID: #${this.currentConcept.id} · Script Draft`;
    }

    const rationaleEl = document.getElementById('cd-rationale');
    if (rationaleEl && this.scriptDraft.rationale) {
      rationaleEl.textContent = this.scriptDraft.rationale;
    }

    const outlineEl = document.getElementById('cd-outline');
    if (outlineEl && Array.isArray(this.scriptDraft.outline) && this.scriptDraft.outline.length > 0) {
      outlineEl.innerHTML = this.scriptDraft.outline.map(item => `<li>${item}</li>`).join('');
    }

    const sceneSoundEl = document.getElementById('cd-scene-sound');
    if (sceneSoundEl && this.scriptDraft.sceneSound) {
      sceneSoundEl.textContent = this.scriptDraft.sceneSound;
    }

    const proofEl = document.getElementById('cd-proof-required');
    if (proofEl && this.scriptDraft.proofRequired) {
      proofEl.textContent = this.scriptDraft.proofRequired;
    }

    const ctaEl = document.getElementById('cd-cta');
    if (ctaEl && this.scriptDraft.cta) {
      ctaEl.textContent = this.scriptDraft.cta;
    }

    const hookEl = document.getElementById('cd-script-hook');
    if (hookEl && this.scriptDraft.scriptHook) {
      hookEl.value = this.scriptDraft.scriptHook;
    }

    const scriptEl = document.getElementById('script-editor');
    if (scriptEl && this.scriptDraft.fullScript) {
      scriptEl.value = this.scriptDraft.fullScript;
    }

    this.updateSnapshotBadge();
  }

  /**
   * Initializes event listeners and bindings
   */
  initDOM() {
    if (typeof document === 'undefined') return;

    this.render();

    // Hook up Save Remix Draft button
    const btnSaveRemix = document.getElementById('btn-save-remix-draft');
    if (btnSaveRemix && !btnSaveRemix._hasClickListener) {
      btnSaveRemix._hasClickListener = true;
      btnSaveRemix.addEventListener('click', () => {
        this.saveRemixDraft();
      });
    }

    // Hook up Save Script Draft button (backward compatibility)
    const btnSaveScript = document.getElementById('btn-save-script-draft');
    if (btnSaveScript && !btnSaveScript._hasClickListener) {
      btnSaveScript._hasClickListener = true;
      btnSaveScript.addEventListener('click', () => {
        const hook = document.getElementById('cd-script-hook')?.value;
        const script = document.getElementById('script-editor')?.value;
        this.saveScriptDraft(hook, script);
      });
    }

    // Hook up Apply Edit button
    const btnApplyEdit = document.getElementById('btn-apply-edit');
    const editInstructionInput = document.getElementById('edit-instruction');
    if (btnApplyEdit && !btnApplyEdit._hasClickListener) {
      btnApplyEdit._hasClickListener = true;
      btnApplyEdit.addEventListener('click', () => {
        const text = editInstructionInput?.value;
        if (text) {
          this.applyEdit(text);
          if (editInstructionInput) editInstructionInput.value = '';
        }
      });
    }

    // Hook up Quick chips
    const chipButtons = document.querySelectorAll('.quick-chip-btn');
    chipButtons.forEach(btn => {
      if (!btn._hasClickListener) {
        btn._hasClickListener = true;
        btn.addEventListener('click', () => {
          const instruction = btn.getAttribute('data-instruction');
          if (instruction && editInstructionInput) {
            editInstructionInput.value = instruction;
            editInstructionInput.focus();
          }
        });
      }
    });

    // Hook up input changes to scriptDraft
    const hookEl = document.getElementById('cd-script-hook');
    if (hookEl && !hookEl._hasInputListener) {
      hookEl._hasInputListener = true;
      hookEl.addEventListener('input', () => {
        this.scriptDraft.scriptHook = hookEl.value;
      });
    }

    const scriptEl = document.getElementById('script-editor');
    if (scriptEl && !scriptEl._hasInputListener) {
      scriptEl._hasInputListener = true;
      scriptEl.addEventListener('input', () => {
        this.scriptDraft.fullScript = scriptEl.value;
      });
    }
  }
}
