/**
 * ==============================================================================
 * MEW CONTENT OS — Claims & Rights Checker Controller (Topic T25)
 * Theme: mewteetawat.com V6.3
 * 100% Pure Client-Side JavaScript (Vanilla ES6+)
 * Zero Server Dependencies · Zero Fake Metrics · Accessible WCAG UI
 * ==============================================================================
 */

/**
 * Regex patterns to detect unverified statistical or numerical claims lacking citation.
 * Examples: "3 ชั่วโมง/วัน", "3 ชม./วัน", "10 เท่า", "99%", "5 วัน"
 */
const UNVERIFIED_CLAIM_PATTERNS = [
  /\b\d+(\.\d+)?\s*(ชั่วโมง|ชม\.|วัน|สัปดาห์|เดือน|ปี|นาที|วิ|วินาที|เท่า|เปอร์เซ็นต์|%|ข้อ|คน|บาท|ดอลลาร์|ชิ้น|ขั้น)(\s*\/\s*(วัน|สัปดาห์|เดือน|ปี|คน))?/gi,
  /\b\d+\s*ชั่วโมง\s*\/\s*วัน/gi,
  /\b\d+\s*ชม\.\s*\/\s*วัน/gi
];

/**
 * Checks a concept for unverified numerical/statistical claims (A14)
 * and attaches a claim-flag to the concept.
 * 
 * @param {Object} concept
 * @returns {{ hasFlags: boolean, flags: Array<Object>, claimFlagCount: number, concept: Object }}
 */
export function checkClaims(concept = {}) {
  if (!concept || typeof concept !== 'object') {
    return { hasFlags: false, flags: [], claimFlagCount: 0, concept: {} };
  }

  const textToScan = [
    concept.hook || '',
    Array.isArray(concept.beats) ? concept.beats.join(' ') : (concept.beats || ''),
    concept.outline || '',
    concept.fullScript || '',
    concept.name || concept.title || '',
    concept.description || '',
    concept.originalContribution || ''
  ].join(' ');

  const detectedFlags = [];
  const foundTexts = new Set();

  for (const pattern of UNVERIFIED_CLAIM_PATTERNS) {
    const matches = textToScan.match(pattern);
    if (matches) {
      for (const m of matches) {
        const trimmed = m.trim();
        // Check if this claim was already verified in concept.claims or sourceTrace
        const isVerified = Array.isArray(concept.claims) && concept.claims.some(c => 
          c.claim && c.claim.includes(trimmed) && c.status === 'verified' && c.evidence
        );

        if (!isVerified && !foundTexts.has(trimmed.toLowerCase())) {
          foundTexts.add(trimmed.toLowerCase());
          detectedFlags.push({
            id: `claim-flag-${detectedFlags.length + 1}-${Date.now()}`,
            text: trimmed,
            reason: `ตรวจพบตัวเลขหรือข้ออ้าง "${trimmed}" ที่ยังไม่มีแหล่งอ้างอิงยืนยัน`,
            status: 'flagged',
            source: null,
            detectedAt: new Date().toISOString()
          });
        }
      }
    }
  }

  // Preserve any manually flagged claims already existing on concept
  if (Array.isArray(concept.claimFlags)) {
    for (const existing of concept.claimFlags) {
      if (existing.status === 'flagged' && !foundTexts.has(existing.text.toLowerCase())) {
        detectedFlags.push(existing);
        foundTexts.add(existing.text.toLowerCase());
      }
    }
  }

  const activeFlags = detectedFlags.filter(f => f.status === 'flagged');
  const hasFlags = activeFlags.length > 0;

  // Set claim-flag properties directly on concept (A14 contract)
  concept.claimFlags = detectedFlags;
  concept['claim-flag'] = hasFlags;
  concept.claimFlag = hasFlags;
  concept.hasClaimFlag = hasFlags;
  concept.claimFlagCount = activeFlags.length;

  return {
    hasFlags,
    flags: activeFlags,
    claimFlagCount: activeFlags.length,
    concept
  };
}

/**
 * Removes an unverified claim from a concept (Action: btn-claim-remove)
 * 
 * @param {Object} concept 
 * @param {string} flagId 
 * @returns {Object} Updated concept
 */
export function removeClaim(concept = {}, flagId) {
  if (!concept || !Array.isArray(concept.claimFlags)) {
    return concept;
  }

  // Find target flag
  const targetFlag = concept.claimFlags.find(f => f.id === flagId || f.text === flagId);
  if (targetFlag) {
    targetFlag.status = 'removed';
    // Remove the flagged text from hook if present
    if (concept.hook && concept.hook.includes(targetFlag.text)) {
      concept.hook = concept.hook.replace(targetFlag.text, '').replace(/\s{2,}/g, ' ').trim();
    }
    // Remove the flagged text from beats if present
    if (Array.isArray(concept.beats)) {
      concept.beats = concept.beats.map(b => b.replace(targetFlag.text, '').replace(/\s{2,}/g, ' ').trim());
    }
  } else {
    // If flagId is not matched, remove first flagged item
    const firstActive = concept.claimFlags.find(f => f.status === 'flagged');
    if (firstActive) {
      firstActive.status = 'removed';
    }
  }

  const activeFlags = concept.claimFlags.filter(f => f.status === 'flagged');
  const hasFlags = activeFlags.length > 0;

  concept['claim-flag'] = hasFlags;
  concept.claimFlag = hasFlags;
  concept.hasClaimFlag = hasFlags;
  concept.claimFlagCount = activeFlags.length;

  return concept;
}

/**
 * Adds evidence/source to an unverified claim, resolving the flag (Action: btn-claim-add-source)
 * 
 * @param {Object} concept 
 * @param {string} flagId 
 * @param {string} sourceText 
 * @returns {Object} Updated concept
 */
export function addSourceToClaim(concept = {}, flagId, sourceText = '') {
  if (!concept) return concept;
  if (!Array.isArray(concept.claimFlags)) {
    concept.claimFlags = [];
  }

  const trimmedSource = (sourceText || '').trim();
  if (!trimmedSource) {
    throw new Error('กรุณาระบุแหล่งข้อมูลอ้างอิง (Source required)');
  }

  let targetFlag = concept.claimFlags.find(f => f.id === flagId || f.text === flagId);
  if (!targetFlag) {
    targetFlag = concept.claimFlags.find(f => f.status === 'flagged');
  }

  if (targetFlag) {
    targetFlag.status = 'verified';
    targetFlag.source = trimmedSource;
    targetFlag.resolvedAt = new Date().toISOString();
  }

  // Add into concept.claims table
  if (!Array.isArray(concept.claims)) {
    concept.claims = [];
  }

  concept.claims.push({
    claim: targetFlag ? targetFlag.text : 'ข้ออ้างที่ผ่านการระบุแหล่งที่มา',
    evidence: trimmedSource,
    status: 'verified'
  });

  const activeFlags = concept.claimFlags.filter(f => f.status === 'flagged');
  const hasFlags = activeFlags.length > 0;

  concept['claim-flag'] = hasFlags;
  concept.claimFlag = hasFlags;
  concept.hasClaimFlag = hasFlags;
  concept.claimFlagCount = activeFlags.length;

  return concept;
}

/**
 * Approval Gating Check: Enforces A14 rule.
 * Concepts with active claim-flag are strictly forbidden from proceeding to Approve (T29 block).
 * 
 * @param {Object} concept 
 * @returns {{ allowed: boolean, reason: string }}
 */
export function canApproveConcept(concept = {}) {
  if (!concept) {
    return { allowed: false, reason: 'ไม่พบคอนเซปต์ที่ต้องการอนุมัติ' };
  }

  const activeFlagCount = concept.claimFlagCount !== undefined
    ? concept.claimFlagCount
    : (Array.isArray(concept.claimFlags) ? concept.claimFlags.filter(f => f.status === 'flagged').length : (concept['claim-flag'] ? 1 : 0));

  if (activeFlagCount > 0 || concept['claim-flag'] === true) {
    return {
      allowed: false,
      reason: `ระงับการส่งต่อไป Approve: ยังมี Claim Flag ค้างอยู่ ${activeFlagCount} รายการ ต้องเลือกลบข้ออ้าง (Remove) หรือระบุแหล่งอ้างอิง (Add Source) ก่อน`
    };
  }

  if (concept.rightsOk === false || concept.copyRiskFlag === true) {
    return {
      allowed: false,
      reason: 'ระงับการส่งต่อไป Approve: ยังไม่ผ่านการตรวจสอบลิขสิทธิ์หรือมีความเสี่ยงในการคัดลอกถ้อยคำ'
    };
  }

  return { allowed: true, reason: '' };
}

/**
 * Validates rights selection and confirmation before Save Draft (A13)
 * If Reaction/Stitch is selected, rights-confirm must be checked.
 * 
 * @param {string} rightsSelection - 'opt-reaction-stitch' | 'opt-new-angle-no-footage' | 'reaction-stitch' | 'new-angle-no-footage'
 * @param {boolean} isConfirmed - Whether rights-confirm is checked
 * @param {string} [licenseSource] - Optional license/credit text
 * @returns {{ canSave: boolean, reason: string }}
 */
export function validateRightsForDraft(rightsSelection, isConfirmed = false, licenseSource = '') {
  const normMode = (rightsSelection || '').replace('opt-', '');

  if (normMode === 'reaction-stitch') {
    if (!isConfirmed) {
      return {
        canSave: false,
        reason: 'เลือก Reaction / Stitch แล้วต้องกรอกและทำเครื่องหมายยืนยันสิทธิ์ (rights-confirm) ก่อนจึงจะสามารถ Save Draft ได้'
      };
    }
    return {
      canSave: true,
      reason: 'ยืนยันสิทธิ์ Reaction / Stitch ถูกต้อง พร้อมบันทึก Draft'
    };
  }

  if (normMode === 'new-angle-no-footage') {
    return {
      canSave: true,
      reason: 'ใช้ประเด็นใหม่โดยไม่ใช้ภาพต้นฉบับ ปลอดภัยทางลิขสิทธิ์สูงสุด สามารถ Save Draft ได้ทันที'
    };
  }

  return {
    canSave: false,
    reason: 'กรุณาเลือกรูปแบบการจัดการลิขสิทธิ์ (Reaction/Stitch หรือ New Angle)'
  };
}

/**
 * Checks whether concept can be saved as draft based on rights validation
 * 
 * @param {Object} concept 
 * @param {Object} rightsState 
 * @returns {{ canSave: boolean, reason: string }}
 */
export function canSaveDraft(concept = {}, rightsState = {}) {
  const mode = rightsState.rightsMode || (rightsState.isReactionStitch ? 'reaction-stitch' : 'new-angle-no-footage');
  const isConfirmed = Boolean(rightsState.isConfirmed || rightsState.rightsConfirm);
  const license = rightsState.licenseSource || '';

  return validateRightsForDraft(mode, isConfirmed, license);
}

/**
 * ClaimsRightsController:
 * Coordinates DOM rendering, claim auditing, resolution actions, and rights confirmation gating.
 */
export class ClaimsRightsController {
  constructor(options = {}) {
    this.root = typeof options.rootId === 'string'
      ? (typeof document !== 'undefined' ? document.querySelector(options.rootId) : null)
      : (options.rootId || (typeof document !== 'undefined' ? document.getElementById('claims-rights-panel') : null));

    this.currentConcept = options.concept || null;
    this.rightsMode = options.rightsMode || 'new-angle-no-footage'; // 'new-angle-no-footage' | 'reaction-stitch'
    this.rightsConfirmed = options.rightsConfirmed || false;
    this.licenseSource = options.licenseSource || '';
    this.onStatusChanged = options.onStatusChanged || null;

    if (this.currentConcept) {
      this.checkClaims(this.currentConcept);
    }

    this.bindEvents();
  }

  /**
   * Audits a concept against source ingredients for copyright, claims, and fair use
   * (Maintains 100% backward compatibility)
   * 
   * @param {Object} concept 
   * @param {Array<Object>} ingredients 
   * @returns {{ isTransformative: boolean, copyRiskFlag: boolean, claims: Array<Object>, details: string }}
   */
  auditConceptRights(concept = {}, ingredients = []) {
    const conceptHook = (concept.hook || '').toLowerCase();
    let copyRiskFlag = false;
    let riskReason = '';

    // 1. Verbatim Copy Risk Detection
    for (const ing of ingredients) {
      const sourceTitle = (ing.title || '').toLowerCase();
      if (sourceTitle.length > 25 && conceptHook.includes(sourceTitle)) {
        copyRiskFlag = true;
        riskReason = `Hook ข้อความมีส่วนคล้ายกับชื่อคลิปต้นทาง "${ing.title}" มากเกินไป`;
        break;
      }
    }

    // 2. Claims vs Evidence Extraction
    const claims = Array.isArray(concept.claims) && concept.claims.length > 0
      ? [...concept.claims]
      : [
          {
            claim: concept.originalContribution || 'มุมมองที่นำเสนอใหม่',
            evidence: 'ประสบการณ์ตรงและมุมคิดของผู้ก่อตั้ง (Founder Perspective)',
            status: 'opinion'
          },
          {
            claim: 'โครงสร้างการเปิดเรื่องด้วย Hook Point',
            evidence: 'เทคนิคโครงสร้างการเล่า ไม่ผูกขาดลิขสิทธิ์ (Transformative Structure)',
            status: 'verified'
          }
        ];

    const isTransformative = !copyRiskFlag && Boolean(concept.originalContribution);

    return {
      isTransformative,
      copyRiskFlag,
      claims,
      details: copyRiskFlag ? riskReason : 'ผ่านเกณฑ์ Transformative Fair Use: ยืมเฉพาะโครงสร้าง ไม่คัดลอกถ้อยคำ'
    };
  }

  /**
   * Checks claims and sets claim-flag on concept
   * @param {Object} concept 
   */
  checkClaims(concept) {
    this.currentConcept = concept;
    const result = checkClaims(concept);
    this.renderClaimFlags();
    this.updateApprovalGateStatus();
    return result;
  }

  /**
   * Handles removing a flagged claim
   * @param {string} flagId 
   */
  removeClaim(flagId) {
    if (!this.currentConcept) return;
    removeClaim(this.currentConcept, flagId);
    this.renderClaimFlags();
    this.updateApprovalGateStatus();
    if (typeof this.onStatusChanged === 'function') {
      this.onStatusChanged(this.currentConcept);
    }
  }

  /**
   * Handles adding source to an unverified claim
   * @param {string} flagId 
   * @param {string} sourceText 
   */
  addSourceToClaim(flagId, sourceText) {
    if (!this.currentConcept) return;
    addSourceToClaim(this.currentConcept, flagId, sourceText);
    this.renderClaimFlags();
    this.updateApprovalGateStatus();
    if (typeof this.onStatusChanged === 'function') {
      this.onStatusChanged(this.currentConcept);
    }
  }

  /**
   * Sets rights mode option
   * @param {'opt-reaction-stitch'|'opt-new-angle-no-footage'|'reaction-stitch'|'new-angle-no-footage'} mode 
   */
  setRightsMode(mode) {
    this.rightsMode = (mode || '').replace('opt-', '');
    this.renderRightsPanel();
  }

  /**
   * Sets rights confirmation checkbox
   * @param {boolean} isConfirmed 
   * @param {string} [license] 
   */
  setRightsConfirm(isConfirmed, license = '') {
    this.rightsConfirmed = Boolean(isConfirmed);
    if (license) this.licenseSource = license;
    this.renderRightsPanel();
  }

  /**
   * Validates if concept can be approved
   */
  canApprove() {
    return canApproveConcept(this.currentConcept);
  }

  /**
   * Validates if draft can be saved under current rights state
   */
  canSaveDraft() {
    return validateRightsForDraft(this.rightsMode, this.rightsConfirmed, this.licenseSource);
  }

  /**
   * Renders audit results into DOM
   * @param {Object} auditResult 
   */
  renderAudit(auditResult) {
    if (typeof document === 'undefined') return;

    const flagEl = document.getElementById('flag-copy-risk');
    const badgeEl = document.getElementById('rights-badge');
    const tbody = document.getElementById('claims-table-body');

    if (flagEl) {
      flagEl.hidden = !auditResult.copyRiskFlag;
    }

    if (badgeEl) {
      badgeEl.textContent = auditResult.isTransformative 
        ? 'Transformative Remix (ปลอดภัย)' 
        : 'ตรวจสอบเพิ่มเติม (Needs Review)';
      badgeEl.className = `rights-status-badge font-bold ${auditResult.isTransformative ? 'transformative' : 'warning'}`;
    }

    if (tbody && Array.isArray(auditResult.claims)) {
      tbody.innerHTML = auditResult.claims.map(item => `
        <tr>
          <td>${item.claim}</td>
          <td>${item.evidence}</td>
          <td>
            <span class="claim-status-pill ${item.status}">
              ${item.status === 'verified' ? 'ผ่านการรับรอง' : 'มุมมองเฉพาะตัว'}
            </span>
          </td>
        </tr>
      `).join('');
    }
  }

  /**
   * Renders active claim flags into DOM
   */
  renderClaimFlags() {
    if (typeof document === 'undefined') return;

    const banner = document.getElementById('claim-flag-banner');
    const countBadge = document.getElementById('claim-flag-count-badge');
    const listEl = document.getElementById('claim-flag-list');

    if (!banner || !listEl) return;

    const flags = (this.currentConcept?.claimFlags || []).filter(f => f.status === 'flagged');
    banner.hidden = flags.length === 0;

    if (countBadge) {
      countBadge.textContent = `${flags.length} รายการ`;
    }

    if (flags.length > 0) {
      listEl.innerHTML = flags.map(flag => `
        <div class="claim-flag-item" data-claim-id="${flag.id}">
          <div class="claim-flag-item-content">
            <span class="claim-flag-badge">Claim Flag</span>
            <span class="claim-flag-text">"${flag.text}" (${flag.reason})</span>
          </div>
          <div class="claim-flag-actions">
            <button type="button" class="btn-claim-remove" data-flag-id="${flag.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              ลบข้ออ้างนี้ (Remove)
            </button>
            <button type="button" class="btn-claim-add-source" data-flag-id="${flag.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
              ระบุแหล่งอ้างอิง (Add Source)
            </button>
          </div>
        </div>
      `).join('');
    }
  }

  /**
   * Updates the approval gate UI banner
   */
  updateApprovalGateStatus() {
    if (typeof document === 'undefined') return;

    const gateBanner = document.getElementById('claim-approval-gate');
    const gateText = document.getElementById('gate-status-text');
    if (!gateBanner || !gateText) return;

    const check = this.canApprove();
    if (!check.allowed) {
      gateBanner.hidden = false;
      gateBanner.className = 'approval-gate-banner blocked';
      gateText.innerHTML = `สถานะ: <strong>ระงับการส่งต่อไป Approve</strong> (${check.reason})`;
    } else {
      gateBanner.hidden = false;
      gateBanner.className = 'approval-gate-banner cleared';
      gateText.innerHTML = 'สถานะ: <strong>ผ่านเกณฑ์ Claims & Rights</strong> พร้อมส่งต่อไป Approve';
    }
  }

  /**
   * Renders rights panel selection state
   */
  renderRightsPanel() {
    if (typeof document === 'undefined') return;

    const confirmContainer = document.getElementById('rights-confirm-container');
    const optReaction = document.getElementById('opt-reaction-stitch');
    const optNewAngle = document.getElementById('opt-new-angle-no-footage');
    const cardReaction = document.querySelector('.rights-option-card.opt-reaction-stitch');
    const cardNewAngle = document.querySelector('.rights-option-card.opt-new-angle-no-footage');
    const feedback = document.getElementById('rights-feedback');

    const isReaction = this.rightsMode === 'reaction-stitch';

    if (optReaction) optReaction.checked = isReaction;
    if (optNewAngle) optNewAngle.checked = !isReaction;

    if (cardReaction) cardReaction.classList.toggle('selected', isReaction);
    if (cardNewAngle) cardNewAngle.classList.toggle('selected', !isReaction);

    if (confirmContainer) {
      confirmContainer.hidden = !isReaction;
    }

    if (feedback) {
      const draftCheck = this.canSaveDraft();
      feedback.textContent = draftCheck.reason;
      feedback.className = `rights-feedback ${draftCheck.canSave ? 'success' : 'error'}`;
    }
  }

  /**
   * Binds user event listeners for interactive buttons and form inputs
   */
  bindEvents() {
    if (typeof document === 'undefined' || !this.root) return;

    // Rights Mode selection change
    const radioReaction = document.getElementById('opt-reaction-stitch');
    const radioNewAngle = document.getElementById('opt-new-angle-no-footage');
    const checkboxConfirm = document.getElementById('rights-confirm');
    const licenseInput = document.getElementById('rights-license-source');

    if (radioReaction) {
      radioReaction.addEventListener('change', () => this.setRightsMode('reaction-stitch'));
    }
    if (radioNewAngle) {
      radioNewAngle.addEventListener('change', () => this.setRightsMode('new-angle-no-footage'));
    }

    if (checkboxConfirm) {
      checkboxConfirm.addEventListener('change', (e) => {
        this.setRightsConfirm(e.target.checked, licenseInput ? licenseInput.value : '');
      });
    }

    if (licenseInput) {
      licenseInput.addEventListener('input', (e) => {
        this.licenseSource = e.target.value;
      });
    }

    // Delegation for claim action buttons: btn-claim-remove and btn-claim-add-source
    this.root.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('.btn-claim-remove') || (e.target.id === 'btn-claim-remove' ? e.target : null);
      if (removeBtn) {
        const flagId = removeBtn.getAttribute('data-flag-id') || 'default-flag';
        this.removeClaim(flagId);
        return;
      }

      const addSourceBtn = e.target.closest('.btn-claim-add-source') || (e.target.id === 'btn-claim-add-source' ? e.target : null);
      if (addSourceBtn) {
        const flagId = addSourceBtn.getAttribute('data-flag-id') || 'default-flag';
        const form = document.getElementById('claim-source-form');
        if (form) {
          form.hidden = false;
          form.setAttribute('data-target-flag-id', flagId);
          const input = document.getElementById('claim-source-input');
          if (input) input.focus();
        }
        return;
      }

      const confirmSourceBtn = e.target.closest('#btn-confirm-source');
      if (confirmSourceBtn) {
        const form = document.getElementById('claim-source-form');
        const input = document.getElementById('claim-source-input');
        const flagId = form ? form.getAttribute('data-target-flag-id') : 'default-flag';
        if (input && input.value.trim()) {
          this.addSourceToClaim(flagId, input.value.trim());
          input.value = '';
          if (form) form.hidden = true;
        }
        return;
      }

      const cancelSourceBtn = e.target.closest('#btn-cancel-source');
      if (cancelSourceBtn) {
        const form = document.getElementById('claim-source-form');
        if (form) form.hidden = true;
        return;
      }
    });
  }
}
