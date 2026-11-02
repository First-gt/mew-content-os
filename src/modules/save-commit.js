/**
 * ==============================================================================
 * MEW CONTENT OS — Save Validation + Commit Logic (Topic T13)
 * Theme: mewteetawat.com V6.3 (Warm Stone, Coral, Violet & Deep Ink)
 * 100% Pure Client-Side JavaScript (Vanilla ES6+) · Zero Server Dependencies
 * 
 * Definition of Done (DOD):
 * - JS: `validateSave({lenses, whyContent, whyPackaging})` คืน error ดังนี้:
 *       - ไม่เลือกคลัง → `err-no-lens`
 *       - ติ๊ก Content แต่ WHY ว่าง/เว้นวรรคล้วน → `err-why-content`
 *       - ติ๊ก Packaging แต่ WHY ว่าง → `err-why-packaging`
 * - JS: Both ที่ขาด WHY อย่างใดอย่างหนึ่งต้อง block การบันทึก และแสดง error ที่ช่องนั้นเท่านั้น
 * - JS: commit สร้าง `savedNote` 1 รายการต่อ lens ที่เลือก ผูก `sourceId` เดียวกัน; **ไม่** คัดลอก source/วิดีโอ
 * - JS: ถ้าเกิด error ระหว่างบันทึก → `err-save-failed` และ store ไม่เปลี่ยน (atomic: ทั้งสอง lens สำเร็จหรือไม่สำเร็จทั้งคู่)
 * - test: D2 (Content-only → ไม่มี packaging note), D3 (Packaging-only → ไม่มี content note), D4 (Both → 2 notes, 1 source)
 * 
 * Strict Negative Constraint:
 * Absolutely NO fake or arbitrary statistics or fake badges.
 * ==============================================================================
 */

import { getState, dispatch } from './store.js';

/**
 * Standard error codes per specification
 */
export const SAVE_ERRORS = {
  NO_LENS: 'err-no-lens',
  WHY_CONTENT: 'err-why-content',
  WHY_PACKAGING: 'err-why-packaging',
  SAVE_FAILED: 'err-save-failed'
};

/**
 * Custom Validation Result that behaves cleanly as:
 * - A string primitive for direct comparisons (e.g., `result == 'err-no-lens'`)
 * - An object with `.valid`, `.isValid`, `.error`, `.errors`, and `.fieldErrors`
 */
export class ValidationResult extends String {
  /**
   * @param {string|null} primaryError 
   * @param {string[]} allErrors 
   * @param {Record<string, string>} fieldErrors 
   * @param {boolean} valid 
   */
  constructor(primaryError = null, allErrors = [], fieldErrors = {}, valid = false) {
    super(primaryError || '');
    this.valid = Boolean(valid);
    this.isValid = Boolean(valid);
    this.error = primaryError || null;
    this.errors = Array.isArray(allErrors) ? allErrors : (primaryError ? [primaryError] : []);
    this.fieldErrors = fieldErrors || {};
  }

  /**
   * Checks if specific error code exists in errors
   * @param {string} code 
   * @returns {boolean}
   */
  hasError(code) {
    return this.errors.includes(code);
  }

  /**
   * Custom primitive coercion
   */
  [Symbol.toPrimitive](hint) {
    if (hint === 'boolean') {
      return this.valid;
    }
    return this.error || '';
  }

  toString() {
    return this.error || '';
  }

  valueOf() {
    return this.error || '';
  }
}

/**
 * Normalizes input lenses into a clean array ['content', 'packaging']
 * @param {any} lenses 
 * @param {Object} [fallbackOptions] 
 * @returns {string[]}
 */
export function normalizeLenses(lenses, fallbackOptions = {}) {
  const result = new Set();

  if (Array.isArray(lenses)) {
    for (const item of lenses) {
      if (typeof item === 'string') {
        const lower = item.trim().toLowerCase();
        if (lower === 'both') {
          result.add('content');
          result.add('packaging');
        } else if (lower === 'content' || lower === 'packaging') {
          result.add(lower);
        }
      }
    }
  } else if (typeof lenses === 'string') {
    const lower = lenses.trim().toLowerCase();
    if (lower === 'both') {
      result.add('content');
      result.add('packaging');
    } else if (lower === 'content' || lower === 'packaging') {
      result.add(lower);
    }
  } else if (lenses && typeof lenses === 'object') {
    if (lenses.content || lenses.saveContent) result.add('content');
    if (lenses.packaging || lenses.savePackaging) result.add('packaging');
  }

  // Check fallback options
  if (result.size === 0 && fallbackOptions && typeof fallbackOptions === 'object') {
    if (fallbackOptions.saveContent) result.add('content');
    if (fallbackOptions.savePackaging) result.add('packaging');
  }

  return Array.from(result);
}

/**
 * Validates save input according to Topic T13 Definition of Done:
 * - ไม่เลือกคลัง → `err-no-lens`
 * - ติ๊ก Content แต่ WHY ว่าง/เว้นวรรคล้วน → `err-why-content`
 * - ติ๊ก Packaging แต่ WHY ว่าง → `err-why-packaging`
 * - Both ที่ขาด WHY อย่างใดอย่างหนึ่งต้อง block การบันทึก และแสดง error ที่ช่องนั้นเท่านั้น
 * 
 * @param {Object} options
 * @param {string[]|string|object} options.lenses Selected lenses ('content', 'packaging', or both)
 * @param {string} [options.whyContent] Founder WHY for Content Vault
 * @param {string} [options.whyPackaging] Founder WHY for Packaging Vault
 * @param {string} [options.why] Single fallback WHY if single lens is passed
 * @returns {ValidationResult}
 */
export function validateSave(options = {}) {
  const rawLenses = options?.lenses !== undefined ? options.lenses : options;
  const lenses = normalizeLenses(rawLenses, options);

  const errors = [];
  const fieldErrors = {};

  // 1. Requirement: ไม่เลือกคลัง → err-no-lens
  if (lenses.length === 0) {
    errors.push(SAVE_ERRORS.NO_LENS);
    fieldErrors.lens = SAVE_ERRORS.NO_LENS;
    return new ValidationResult(SAVE_ERRORS.NO_LENS, errors, fieldErrors, false);
  }

  const isContent = lenses.includes('content');
  const isPackaging = lenses.includes('packaging');

  // Support single 'why' field fallback if whyContent or whyPackaging not directly specified
  const whyContentRaw = options?.whyContent !== undefined 
    ? options.whyContent 
    : (isContent && !isPackaging && options?.why !== undefined ? options.why : '');

  const whyPackagingRaw = options?.whyPackaging !== undefined 
    ? options.whyPackaging 
    : (isPackaging && !isContent && options?.why !== undefined ? options.why : '');

  const isContentEmpty = typeof whyContentRaw !== 'string' || whyContentRaw.trim().length === 0;
  const isPackagingEmpty = typeof whyPackagingRaw !== 'string' || whyPackagingRaw.trim().length === 0;

  // 2. Requirement: ติ๊ก Content แต่ WHY ว่าง/เว้นวรรคล้วน → err-why-content
  if (isContent && isContentEmpty) {
    errors.push(SAVE_ERRORS.WHY_CONTENT);
    fieldErrors.whyContent = SAVE_ERRORS.WHY_CONTENT;
  }

  // 3. Requirement: ติ๊ก Packaging แต่ WHY ว่าง → err-why-packaging
  if (isPackaging && isPackagingEmpty) {
    errors.push(SAVE_ERRORS.WHY_PACKAGING);
    fieldErrors.whyPackaging = SAVE_ERRORS.WHY_PACKAGING;
  }

  // 4. Requirement: Both ที่ขาด WHY อย่างใดอย่างหนึ่งต้อง block การบันทึก และแสดง error ที่ช่องนั้นเท่านั้น
  // (Notice: if isContent and isPackaging are both true, and only one is empty,
  // fieldErrors will strictly contain ONLY that missing field's error)
  if (errors.length > 0) {
    const primaryError = errors[0];
    return new ValidationResult(primaryError, errors, fieldErrors, false);
  }

  // All valid!
  return new ValidationResult(null, [], {}, true);
}

/**
 * Commits reference save into Central Store according to Topic T13:
 * - Commit สร้าง `savedNote` 1 รายการต่อ lens ที่เลือก ผูก `sourceId` เดียวกัน
 * - **ไม่** คัดลอก source/วิดีโอ (canonical source preserved, no clone)
 * - ถ้าเกิด error ระหว่างบันทึก → `err-save-failed` และ store ไม่เปลี่ยน (atomic rollback)
 * 
 * @param {Object} payload 
 * @param {string} payload.sourceId Canonical source identifier
 * @param {string[]|string} payload.lenses Lenses to commit ('content', 'packaging', or both)
 * @param {string} [payload.whyContent] Founder reason for Content
 * @param {string} [payload.whyPackaging] Founder reason for Packaging
 * @param {string|string[]} [payload.tags] Optional tags
 * @param {string} [payload.timestamp] Optional timecode
 * @param {string} [payload.label] Optional reference label
 * @param {string} [payload.collection] Optional collection name
 * @param {string} [payload.analysisVersionId] Version of analysis used at save time
 * @param {boolean} [payload.simulateError] Testing flag to simulate failure and verify atomic rollback
 * @param {boolean} [payload.simulateFailOnSecondNote] Testing flag for partial-failure atomic rollback
 * @returns {{ success: boolean, committed: boolean, error: string|null, errors?: string[], fieldErrors?: object, notes?: object[], sourceId?: string, lenses?: string[] }}
 */
export function commitSave(payload = {}) {
  if (!payload || typeof payload !== 'object') {
    return {
      success: false,
      committed: false,
      error: SAVE_ERRORS.NO_LENS,
      errors: [SAVE_ERRORS.NO_LENS],
      fieldErrors: { lens: SAVE_ERRORS.NO_LENS }
    };
  }

  const {
    sourceId,
    tags = [],
    timestamp = null,
    label = null,
    collection = null,
    analysisVersionId = null,
    simulateError = false,
    simulateFailOnSecondNote = false
  } = payload;

  if (!sourceId || typeof sourceId !== 'string') {
    return {
      success: false,
      committed: false,
      error: SAVE_ERRORS.SAVE_FAILED,
      message: 'Missing canonical sourceId'
    };
  }

  // 1. Validation check
  const validation = validateSave(payload);
  if (!validation.valid) {
    return {
      success: false,
      committed: false,
      error: validation.error,
      errors: validation.errors,
      fieldErrors: validation.fieldErrors
    };
  }

  const normalizedLenses = normalizeLenses(payload.lenses, payload);

  // 2. Snapshot store state before any mutation (Guarantees Atomic Transaction)
  const previousState = JSON.parse(JSON.stringify(getState()));
  const initialSourcesCount = (previousState.sources || []).length;

  // 3. Prepare notes to commit (1 note per selected lens, sharing exact canonical sourceId)
  const notesToCreate = normalizedLenses.map(lens => {
    const isContent = lens === 'content';
    const why = isContent ? (payload.whyContent || '').trim() : (payload.whyPackaging || '').trim();
    const uniqueSuffix = Math.random().toString(36).substring(2, 8);
    const noteId = `note-${sourceId}-${lens}-${Date.now()}-${uniqueSuffix}`;

    const formattedTags = Array.isArray(tags)
      ? tags
      : (typeof tags === 'string' && tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []);

    return {
      id: noteId,
      sourceId: sourceId, // MUST share canonical sourceId
      lens: lens,
      vaultType: lens,
      why: why,
      founderWhy: why,
      tags: formattedTags,
      timestamp: timestamp || null,
      label: label || null,
      collection: collection || null,
      analysisVersionId: analysisVersionId || null,
      createdAt: new Date().toISOString()
    };
  });

  // 4. Atomic Execution Block
  try {
    if (simulateError) {
      throw new Error('Simulated atomic save failure before commit');
    }

    const committedNotes = [];

    for (let i = 0; i < notesToCreate.length; i++) {
      const note = notesToCreate[i];

      // Atomic verification check: simulate failure on 2nd note if requested
      if (simulateFailOnSecondNote && i === 1) {
        throw new Error('Simulated atomic failure during second note commit');
      }

      // Dispatch SAVE_NOTE into Central Store
      dispatch({
        type: 'SAVE_NOTE',
        payload: note
      });

      committedNotes.push(note);
    }

    // Verify critical DOD: **ไม่** คัดลอก source/วิดีโอ (sources length must not increase)
    const currentState = getState();
    const currentSourcesCount = (currentState.sources || []).length;
    if (currentSourcesCount > initialSourcesCount) {
      throw new Error('Violation: Source was cloned or duplicated during save commit');
    }

    // Double check that all created notes were committed
    const allPresent = committedNotes.every(cn => 
      (currentState.savedNotes || []).some(sn => sn.id === cn.id)
    );
    if (!allPresent) {
      throw new Error('Store note verification failed');
    }

    // Dispatch DOM event for reactive UI updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mew:save-committed', {
        bubbles: true,
        detail: {
          sourceId,
          lenses: normalizedLenses,
          notes: committedNotes
        }
      }));
    }

    const contentNote = committedNotes.find(n => n.vaultType === 'content') || null;
    const packagingNote = committedNotes.find(n => n.vaultType === 'packaging') || null;

    return {
      success: true,
      committed: true,
      error: null,
      notes: committedNotes,
      contentNote: contentNote,
      packagingNote: packagingNote,
      sourceId: sourceId,
      lenses: normalizedLenses
    };

  } catch (err) {
    // ATOMIC ROLLBACK:
    // If any error occurs during saving, restore store to previous state intact
    dispatch({
      type: 'HYDRATE',
      payload: previousState
    });

    console.warn('[SaveCommit] Atomic rollback executed due to save error:', err.message);

    return {
      success: false,
      committed: false,
      error: SAVE_ERRORS.SAVE_FAILED,
      message: err.message || 'Save operation failed'
    };
  }
}

// Convenience alias
export const commit = commitSave;

/**
 * ==============================================================================
 * SaveValidationUIController
 * Interactive Client-Side Controller for Save Validation & Commit UI
 * ==============================================================================
 */
export class SaveValidationUIController {
  /**
   * @param {Object} options 
   * @param {HTMLElement|string} [options.container] Root container or selector
   * @param {string} [options.sourceId] Canonical source ID (defaults to 'source-a')
   */
  constructor(options = {}) {
    this.container = typeof options.container === 'string'
      ? document.querySelector(options.container)
      : (options.container || document.getElementById('save-validation-panel') || document.body);

    this.sourceId = options.sourceId || 'source-a';
    this.cacheDom();
    this.bindEvents();
    this.updateLiveInspector();
  }

  cacheDom() {
    if (!this.container) return;

    this.dom = {
      // Checkboxes
      chkContent: this.container.querySelector('#chk-save-content, [data-testid="chk-save-content"]'),
      chkPackaging: this.container.querySelector('#chk-save-packaging, [data-testid="chk-save-packaging"]'),

      // Error containers
      errNoLens: this.container.querySelector('#err-no-lens, [data-testid="err-no-lens"]'),
      errWhyContent: this.container.querySelector('#err-why-content, [data-testid="err-why-content"]'),
      errWhyPackaging: this.container.querySelector('#err-why-packaging, [data-testid="err-why-packaging"]'),
      errSaveFailed: this.container.querySelector('#err-save-failed, [data-testid="err-save-failed"]'),

      // Textareas & Wrappers
      wrapWhyContent: this.container.querySelector('#wrap-why-content, [data-testid="wrap-why-content"]'),
      wrapWhyPackaging: this.container.querySelector('#wrap-why-packaging, [data-testid="wrap-why-packaging"]'),
      whyContent: this.container.querySelector('#why-content, [data-testid="why-content"]'),
      whyPackaging: this.container.querySelector('#why-packaging, [data-testid="why-packaging"]'),
      counterWhyContent: this.container.querySelector('#counter-why-content'),
      counterWhyPackaging: this.container.querySelector('#counter-why-packaging'),

      // Optional metadata
      tags: this.container.querySelector('#tags, [data-testid="tags"]'),
      timestamp: this.container.querySelector('#timestamp, [data-testid="timestamp"]'),
      label: this.container.querySelector('#label, [data-testid="label"]'),
      collection: this.container.querySelector('#collection, [data-testid="collection"]'),

      // Action buttons
      btnValidate: this.container.querySelector('#btn-validate-save, [data-testid="btn-validate-save"]'),
      btnCommit: this.container.querySelector('#btn-commit-save, [data-testid="btn-commit-save"]'),
      btnReset: this.container.querySelector('#btn-reset-form, [data-testid="btn-reset-form"]'),

      // Test scenario presets
      btnPresetD2: this.container.querySelector('#btn-preset-d2, [data-testid="btn-preset-d2"]'),
      btnPresetD3: this.container.querySelector('#btn-preset-d3, [data-testid="btn-preset-d3"]'),
      btnPresetD4: this.container.querySelector('#btn-preset-d4, [data-testid="btn-preset-d4"]'),
      btnSimulateFail: this.container.querySelector('#btn-simulate-fail, [data-testid="btn-simulate-fail"]'),

      // Live Inspector
      commitStatusBadge: this.container.querySelector('#commit-status-badge'),
      commitNotesList: this.container.querySelector('#commit-notes-list'),
      canonicalSourceStatus: this.container.querySelector('#canonical-source-status')
    };
  }

  bindEvents() {
    if (!this.dom) return;

    // Toggle Content lens
    this.dom.chkContent?.addEventListener('change', () => {
      const isChecked = Boolean(this.dom.chkContent.checked);
      if (this.dom.wrapWhyContent) {
        this.dom.wrapWhyContent.hidden = !isChecked;
      }
      if (isChecked && this.dom.errNoLens) {
        this.hideError(this.dom.errNoLens);
      }
      if (isChecked) {
        setTimeout(() => this.dom.whyContent?.focus(), 50);
      }
    });

    // Toggle Packaging lens
    this.dom.chkPackaging?.addEventListener('change', () => {
      const isChecked = Boolean(this.dom.chkPackaging.checked);
      if (this.dom.wrapWhyPackaging) {
        this.dom.wrapWhyPackaging.hidden = !isChecked;
      }
      if (isChecked && this.dom.errNoLens) {
        this.hideError(this.dom.errNoLens);
      }
      if (isChecked) {
        setTimeout(() => this.dom.whyPackaging?.focus(), 50);
      }
    });

    // Character counter & clear error on typing
    this.dom.whyContent?.addEventListener('input', () => {
      this.updateCounter(this.dom.whyContent, this.dom.counterWhyContent);
      if (this.dom.whyContent.value.trim().length > 0 && this.dom.errWhyContent) {
        this.hideError(this.dom.errWhyContent);
      }
    });

    this.dom.whyPackaging?.addEventListener('input', () => {
      this.updateCounter(this.dom.whyPackaging, this.dom.counterWhyPackaging);
      if (this.dom.whyPackaging.value.trim().length > 0 && this.dom.errWhyPackaging) {
        this.hideError(this.dom.errWhyPackaging);
      }
    });

    // Validate button
    this.dom.btnValidate?.addEventListener('click', (e) => {
      e.preventDefault();
      this.runValidationUI();
    });

    // Commit button
    this.dom.btnCommit?.addEventListener('click', (e) => {
      e.preventDefault();
      this.runCommitUI();
    });

    // Reset button
    this.dom.btnReset?.addEventListener('click', (e) => {
      e.preventDefault();
      this.resetForm();
    });

    // Test scenario presets
    this.dom.btnPresetD2?.addEventListener('click', (e) => {
      e.preventDefault();
      this.applyPresetD2();
    });

    this.dom.btnPresetD3?.addEventListener('click', (e) => {
      e.preventDefault();
      this.applyPresetD3();
    });

    this.dom.btnPresetD4?.addEventListener('click', (e) => {
      e.preventDefault();
      this.applyPresetD4();
    });

    this.dom.btnSimulateFail?.addEventListener('click', (e) => {
      e.preventDefault();
      this.runCommitUI({ simulateError: true });
    });
  }

  showError(el) {
    if (!el) return;
    el.hidden = false;
    el.removeAttribute('hidden');
    el.classList.add('is-visible');
  }

  hideError(el) {
    if (!el) return;
    el.hidden = true;
    el.setAttribute('hidden', '');
    el.classList.remove('is-visible');
  }

  clearAllErrors() {
    this.hideError(this.dom?.errNoLens);
    this.hideError(this.dom?.errWhyContent);
    this.hideError(this.dom?.errWhyPackaging);
    this.hideError(this.dom?.errSaveFailed);

    this.dom?.whyContent?.classList.remove('has-error');
    this.dom?.whyPackaging?.classList.remove('has-error');
  }

  updateCounter(textarea, counterEl) {
    if (!textarea || !counterEl) return;
    const len = (textarea.value || '').length;
    counterEl.textContent = `${len} ตัวอักษร`;
  }

  runValidationUI() {
    this.clearAllErrors();

    const lenses = [];
    if (this.dom?.chkContent?.checked) lenses.push('content');
    if (this.dom?.chkPackaging?.checked) lenses.push('packaging');

    const whyContent = this.dom?.whyContent?.value || '';
    const whyPackaging = this.dom?.whyPackaging?.value || '';

    const result = validateSave({ lenses, whyContent, whyPackaging });

    if (!result.valid) {
      if (result.fieldErrors.lens && this.dom?.errNoLens) {
        this.showError(this.dom.errNoLens);
      }
      if (result.fieldErrors.whyContent && this.dom?.errWhyContent) {
        this.showError(this.dom.errWhyContent);
        this.dom?.whyContent?.classList.add('has-error');
      }
      if (result.fieldErrors.whyPackaging && this.dom?.errWhyPackaging) {
        this.showError(this.dom.errWhyPackaging);
        this.dom?.whyPackaging?.classList.add('has-error');
      }
      return false;
    }

    return true;
  }

  runCommitUI(overrides = {}) {
    const isValid = this.runValidationUI();
    if (!isValid && !overrides.simulateError) return;

    const lenses = [];
    if (this.dom?.chkContent?.checked) lenses.push('content');
    if (this.dom?.chkPackaging?.checked) lenses.push('packaging');

    const payload = {
      sourceId: this.sourceId,
      lenses,
      whyContent: this.dom?.whyContent?.value || '',
      whyPackaging: this.dom?.whyPackaging?.value || '',
      tags: this.dom?.tags?.value || '',
      timestamp: this.dom?.timestamp?.value || '',
      label: this.dom?.label?.value || '',
      collection: this.dom?.collection?.value || '',
      ...overrides
    };

    const commitResult = commitSave(payload);

    if (!commitResult.success) {
      if (commitResult.error === SAVE_ERRORS.SAVE_FAILED && this.dom?.errSaveFailed) {
        this.showError(this.dom.errSaveFailed);
      }
    } else {
      this.clearAllErrors();
    }

    this.updateLiveInspector(commitResult);
  }

  applyPresetD2() {
    this.clearAllErrors();
    if (this.dom?.chkContent) this.dom.chkContent.checked = true;
    if (this.dom?.chkPackaging) this.dom.chkPackaging.checked = false;
    if (this.dom?.wrapWhyContent) this.dom.wrapWhyContent.hidden = false;
    if (this.dom?.wrapWhyPackaging) this.dom.wrapWhyPackaging.hidden = true;

    if (this.dom?.whyContent) {
      this.dom.whyContent.value = 'ชอบแก่นคิดเรื่อง Transformation ไม่ใช่แค่ขายฟีเจอร์สินค้า';
      this.updateCounter(this.dom.whyContent, this.dom.counterWhyContent);
    }
  }

  applyPresetD3() {
    this.clearAllErrors();
    if (this.dom?.chkContent) this.dom.chkContent.checked = false;
    if (this.dom?.chkPackaging) this.dom.chkPackaging.checked = true;
    if (this.dom?.wrapWhyContent) this.dom.wrapWhyContent.hidden = true;
    if (this.dom?.wrapWhyPackaging) this.dom.wrapWhyPackaging.hidden = false;

    if (this.dom?.whyPackaging) {
      this.dom.whyPackaging.value = 'ชอบจังหวะเปิดคลิปตัดเร็ว พร้อม Sound SFX Whoosh ใน 2 วินาทีแรก';
      this.updateCounter(this.dom.whyPackaging, this.dom.counterWhyPackaging);
    }
  }

  applyPresetD4() {
    this.clearAllErrors();
    if (this.dom?.chkContent) this.dom.chkContent.checked = true;
    if (this.dom?.chkPackaging) this.dom.chkPackaging.checked = true;
    if (this.dom?.wrapWhyContent) this.dom.wrapWhyContent.hidden = false;
    if (this.dom?.wrapWhyPackaging) this.dom.wrapWhyPackaging.hidden = false;

    if (this.dom?.whyContent) {
      this.dom.whyContent.value = 'นำปรัชญา Mindset เรื่อง High-Ticket Offer ไปแตกบทความ';
      this.updateCounter(this.dom.whyContent, this.dom.counterWhyContent);
    }
    if (this.dom?.whyPackaging) {
      this.dom.whyPackaging.value = 'เลียนแบบการแบ่งครึ่งจอแสดง Before/After ในจังหวะคลี่คลายปัญหา';
      this.updateCounter(this.dom.whyPackaging, this.dom.counterWhyPackaging);
    }
  }

  resetForm() {
    this.clearAllErrors();
    if (this.dom?.chkContent) this.dom.chkContent.checked = false;
    if (this.dom?.chkPackaging) this.dom.chkPackaging.checked = false;
    if (this.dom?.wrapWhyContent) this.dom.wrapWhyContent.hidden = true;
    if (this.dom?.wrapWhyPackaging) this.dom.wrapWhyPackaging.hidden = true;

    if (this.dom?.whyContent) {
      this.dom.whyContent.value = '';
      this.updateCounter(this.dom.whyContent, this.dom.counterWhyContent);
    }
    if (this.dom?.whyPackaging) {
      this.dom.whyPackaging.value = '';
      this.updateCounter(this.dom.whyPackaging, this.dom.counterWhyPackaging);
    }
  }

  updateLiveInspector(lastCommitResult = null) {
    const state = getState();
    const sourceNotes = (state.savedNotes || []).filter(n => n.sourceId === this.sourceId);

    if (this.dom?.canonicalSourceStatus) {
      const hasContent = sourceNotes.some(n => n.lens === 'content');
      const hasPackaging = sourceNotes.some(n => n.lens === 'packaging');
      let statusText = 'Analyzed · Not saved';
      if (hasContent && hasPackaging) statusText = 'Saved to Both';
      else if (hasContent) statusText = 'Saved to Content';
      else if (hasPackaging) statusText = 'Saved to Packaging';

      this.dom.canonicalSourceStatus.textContent = statusText;
    }

    if (this.dom?.commitStatusBadge) {
      if (lastCommitResult) {
        if (lastCommitResult.success) {
          this.dom.commitStatusBadge.textContent = 'Committed Successfully (Atomic OK)';
          this.dom.commitStatusBadge.className = 'status-badge success';
        } else {
          this.dom.commitStatusBadge.textContent = `Commit Failed: ${lastCommitResult.error} (Rolled back)`;
          this.dom.commitStatusBadge.className = 'status-badge error';
        }
      }
    }

    if (this.dom?.commitNotesList) {
      if (sourceNotes.length === 0) {
        this.dom.commitNotesList.innerHTML = '<li class="empty-note-item">ยังไม่มี note ที่บันทึกสำหรับ Source นี้</li>';
      } else {
        this.dom.commitNotesList.innerHTML = sourceNotes.map(n => `
          <li class="note-audit-item ${n.lens}">
            <div class="note-audit-head">
              <span class="badge-pill ${n.lens === 'content' ? 'coral' : 'violet'}">${n.lens.toUpperCase()}</span>
              <span class="note-id-tag font-num">${n.id}</span>
            </div>
            <p class="note-why-preview">"${n.why}"</p>
            <div class="note-meta-foot">
              <span>sourceId: <strong>${n.sourceId}</strong></span>
              <span class="meta-dot">·</span>
              <span>บันทึกเมื่อ: ${new Date(n.createdAt).toLocaleTimeString('th-TH')}</span>
            </div>
          </li>
        `).join('');
      }
    }
  }
}

/**
 * Convenience helper to initialize the Save Validation Controller
 * @param {HTMLElement|string} [container] 
 * @param {Object} [options] 
 * @returns {SaveValidationUIController}
 */
export function initSaveValidation(container, options = {}) {
  const controller = new SaveValidationUIController({ container, ...options });
  if (typeof window !== 'undefined') {
    window.saveValidationController = controller;
  }
  return controller;
}

// Auto-mount in browser if component DOM exists on page load
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (document.getElementById('save-validation-panel')) {
        initSaveValidation('#save-validation-panel');
      }
    });
  } else {
    if (document.getElementById('save-validation-panel')) {
      initSaveValidation('#save-validation-panel');
    }
  }
}
