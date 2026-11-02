/**
 * ==============================================================================
 * MEW CONTENT OS — Save Success State + Re-save / Add Lens Logic (Topic T14)
 * Theme: mewteetawat.com V6.3 (Warm Stone, Coral, Violet & Deep Ink)
 * 100% Pure Client-Side JavaScript (Vanilla ES6+) · Zero Server Dependencies
 * 
 * Definition of Done (DOD):
 * - HTML: หลังบันทึกแสดง `save-success` ข้อความ `Saved to Content` / `Saved to Packaging` / `Saved to Both` ตามจริง
 *         พร้อมปุ่ม `btn-view-in-library` และ `btn-use-in-remix`
 * - JS: `btn-view-in-library` ไป S04 แท็บคลังที่เพิ่งเซฟ; `btn-use-in-remix` ไป S06 พร้อมใส่ reference นั้นลงตะกร้าอัตโนมัติ (ผู้ใช้ลบออกได้)
 * - JS: เปิด Save Modal กับ source ที่เคย save Content แล้ว → ติ๊ก Content ถูก disable พร้อมข้อความ "เก็บไว้แล้ว" และเพิ่ม Packaging ได้โดย note Content เดิมไม่เปลี่ยน (A05)
 * - JS: duplicate save lens เดิมต้องไม่สร้าง note ซ้ำ — เสนอไปแก้ WHY แทน (ลิงก์ไป S05)
 * - CSS: ไอคอนยืนยันสำเร็จ + สีแยกตามคลัง
 * 
 * Strict Negative Constraint:
 * Absolutely NO fake or arbitrary statistics or fake percentage badges.
 * ==============================================================================
 */

import { getState, dispatch } from './store.js';
import { SCREENS, router } from './router.js';

/**
 * Standard Save Status Titles
 */
export const SAVE_STATUS_TITLES = {
  CONTENT: 'Saved to Content',
  PACKAGING: 'Saved to Packaging',
  BOTH: 'Saved to Both'
};

/**
 * Checks existing saved notes in Central Store for a given sourceId
 * @param {string} sourceId Canonical source ID
 * @param {object} [customState] Optional explicit store state override
 * @returns {{
 *   sourceId: string,
 *   hasContent: boolean,
 *   hasPackaging: boolean,
 *   isBoth: boolean,
 *   contentNote: object|null,
 *   packagingNote: object|null,
 *   notes: object[]
 * }}
 */
export function checkExistingSaveState(sourceId, customState = null) {
  if (!sourceId) {
    return {
      sourceId: null,
      hasContent: false,
      hasPackaging: false,
      isBoth: false,
      contentNote: null,
      packagingNote: null,
      notes: []
    };
  }

  const state = customState || (typeof getState === 'function' ? getState() : { savedNotes: [] });
  const allNotes = Array.isArray(state?.savedNotes) ? state.savedNotes : [];
  const sourceNotes = allNotes.filter(n => n.sourceId === sourceId);

  const contentNote = sourceNotes.find(n => n.lens === 'content') || null;
  const packagingNote = sourceNotes.find(n => n.lens === 'packaging') || null;

  const hasContent = Boolean(contentNote);
  const hasPackaging = Boolean(packagingNote);
  const isBoth = hasContent && hasPackaging;

  return {
    sourceId,
    hasContent,
    hasPackaging,
    isBoth,
    contentNote,
    packagingNote,
    notes: sourceNotes
  };
}

/**
 * Prevents duplicate save: Checks if saving a target lens would duplicate an existing note.
 * Requirement: duplicate save lens เดิมต้องไม่สร้าง note ซ้ำ — เสนอไปแก้ WHY แทน (ลิงก์ไป S05)
 * 
 * @param {string} sourceId Canonical source ID
 * @param {string|string[]} targetLens Lens or lenses to be saved ('content', 'packaging', or both)
 * @param {object} [customState]
 * @returns {{
 *   isDuplicate: boolean,
 *   duplicateLenses: string[],
 *   allowedLenses: string[],
 *   existingNotes: object[],
 *   message: string|null,
 *   editNoteId: string|null
 * }}
 */
export function preventDuplicateSave(sourceId, targetLens, customState = null) {
  const existing = checkExistingSaveState(sourceId, customState);
  
  const targetList = Array.isArray(targetLens)
    ? targetLens.map(l => String(l).trim().toLowerCase())
    : (typeof targetLens === 'string'
        ? (targetLens.toLowerCase() === 'both' ? ['content', 'packaging'] : [targetLens.toLowerCase()])
        : []);

  const duplicateLenses = [];
  const allowedLenses = [];
  let editNoteId = null;

  for (const lens of targetList) {
    if (lens === 'content' && existing.hasContent) {
      duplicateLenses.push('content');
      editNoteId = existing.contentNote?.id || editNoteId;
    } else if (lens === 'packaging' && existing.hasPackaging) {
      duplicateLenses.push('packaging');
      editNoteId = existing.packagingNote?.id || editNoteId;
    } else if (['content', 'packaging'].includes(lens)) {
      allowedLenses.push(lens);
    }
  }

  const isDuplicate = duplicateLenses.length > 0;
  const message = isDuplicate
    ? 'duplicate save lens เดิมต้องไม่สร้าง note ซ้ำ — เสนอไปแก้ WHY แทน (ลิงก์ไป S05)'
    : null;

  return {
    isDuplicate,
    duplicateLenses,
    allowedLenses,
    existingNotes: existing.notes,
    message,
    editNoteId
  };
}

/**
 * Configures the Save Modal UI according to existing saved state for a source:
 * Requirement:
 * - เปิด Save Modal กับ source ที่เคย save Content แล้ว → ติ๊ก Content ถูก disable พร้อมข้อความ "เก็บไว้แล้ว"
 *   และเพิ่ม Packaging ได้โดย note Content เดิมไม่เปลี่ยน (A05)
 * - duplicate save lens เดิมต้องไม่สร้าง note ซ้ำ — เสนอไปแก้ WHY แทน (ลิงก์ไป S05)
 * 
 * @param {HTMLElement} modalEl Root modal container (e.g. #save-modal)
 * @param {string} sourceId Canonical source ID
 * @param {object} [options]
 * @returns {object} Existing save state report
 */
export function configureSaveModalForSource(modalEl, sourceId, options = {}) {
  if (!modalEl || typeof modalEl.querySelector !== 'function') return null;

  const existing = checkExistingSaveState(sourceId, options.storeState);

  // Helper to safely create an element across browser, jsdom or mock environments
  const createElement = (tagName, className = '', id = '') => {
    let el = null;
    if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
      el = document.createElement(tagName);
    } else if (options.document && typeof options.document.createElement === 'function') {
      el = options.document.createElement(tagName);
    } else if (modalEl.ownerDocument && typeof modalEl.ownerDocument.createElement === 'function') {
      el = modalEl.ownerDocument.createElement(tagName);
    } else if (typeof modalEl.constructor === 'function') {
      el = new modalEl.constructor(tagName);
    }

    if (el) {
      if (className) {
        if (el.classList?.add) {
          className.split(/\s+/).filter(Boolean).forEach(c => el.classList.add(c));
        } else {
          el.className = className;
        }
      }
      if (id) {
        if (typeof el.setAttribute === 'function') {
          el.setAttribute('id', id);
        } else {
          el.id = id;
        }
      }
    }
    return el;
  };

  // Checkbox references
  const chkContent = modalEl.querySelector('#chk-save-content, [data-testid="chk-save-content"]');
  const chkPackaging = modalEl.querySelector('#chk-save-packaging, [data-testid="chk-save-packaging"]');

  // Label cards or wraps
  const cardContent = chkContent ? chkContent.closest('.vault-choice-card, label') : null;
  const cardPackaging = chkPackaging ? chkPackaging.closest('.vault-choice-card, label') : null;

  // Why textarea wraps
  const wrapWhyContent = modalEl.querySelector('#wrap-why-content, #group-reason-content');
  const wrapWhyPackaging = modalEl.querySelector('#wrap-why-packaging, #group-reason-packaging');

  // Remove any previous badges or advisory messages
  if (typeof modalEl.querySelectorAll === 'function') {
    modalEl.querySelectorAll('.badge-already-saved-dynamic, .resave-advice-dynamic').forEach(el => {
      if (typeof el.remove === 'function') el.remove();
    });
  }

  // 1. CONTENT VAULT PRE-CHECK
  if (chkContent) {
    if (existing.hasContent) {
      chkContent.disabled = true;
      chkContent.checked = true;
      cardContent?.classList?.add('is-already-saved');

      // Inject "เก็บไว้แล้ว" badge
      const badge = createElement('span', 'badge-already-saved badge-already-saved-dynamic', 'badge-already-saved-content');
      if (badge) {
        badge.textContent = 'เก็บไว้แล้ว';
        badge.setAttribute('data-testid', 'badge-already-saved-content');
        const targetBox = cardContent?.querySelector('.vault-choice-top') || cardContent || chkContent.parentElement || chkContent.parentNode;
        targetBox?.appendChild(badge);
      }

      // Advisory notice with link to S05
      const adviceBox = createElement('div', 'resave-advice-dynamic resave-advice-content');
      if (adviceBox) {
        adviceBox.innerHTML = `
          <p class="advice-text">
            <span>คลิปนี้บันทึกใน Content Vault แล้ว (เก็บไว้แล้ว) — เสนอไปแก้ WHY แทน:</span>
            <button type="button" class="btn-link-edit-why" id="btn-edit-why-content-s05" data-testid="btn-edit-why-s05" data-note-id="${existing.contentNote?.id || ''}">
              แก้ไข WHY ใน S05 &rarr;
            </button>
          </p>
        `;
        cardContent?.appendChild(adviceBox);

        adviceBox.querySelector('#btn-edit-why-content-s05')?.addEventListener('click', (e) => {
          e.preventDefault();
          navigateToS05(existing.contentNote?.id, sourceId, 'content');
        });
      }

      // Keep textarea hidden or read-only
      if (wrapWhyContent) {
        wrapWhyContent.hidden = true;
        wrapWhyContent.setAttribute('hidden', '');
      }
    } else {
      chkContent.disabled = false;
      chkContent.checked = false;
      cardContent?.classList?.remove('is-already-saved');
    }
  }

  // 2. PACKAGING VAULT PRE-CHECK
  if (chkPackaging) {
    if (existing.hasPackaging) {
      chkPackaging.disabled = true;
      chkPackaging.checked = true;
      cardPackaging?.classList?.add('is-already-saved');

      // Inject "เก็บไว้แล้ว" badge
      const badge = createElement('span', 'badge-already-saved violet badge-already-saved-dynamic', 'badge-already-saved-packaging');
      if (badge) {
        badge.textContent = 'เก็บไว้แล้ว';
        badge.setAttribute('data-testid', 'badge-already-saved-packaging');
        const targetBox = cardPackaging?.querySelector('.vault-choice-top') || cardPackaging || chkPackaging.parentElement || chkPackaging.parentNode;
        targetBox?.appendChild(badge);
      }

      // Advisory notice with link to S05
      const adviceBox = createElement('div', 'resave-advice-dynamic resave-advice-packaging');
      if (adviceBox) {
        adviceBox.innerHTML = `
          <p class="advice-text">
            <span>คลิปนี้บันทึกใน Packaging Vault แล้ว (เก็บไว้แล้ว) — เสนอไปแก้ WHY แทน:</span>
            <button type="button" class="btn-link-edit-why" id="btn-edit-why-packaging-s05" data-testid="btn-edit-why-s05" data-note-id="${existing.packagingNote?.id || ''}">
              แก้ไข WHY ใน S05 &rarr;
            </button>
          </p>
        `;
        cardPackaging?.appendChild(adviceBox);

        adviceBox.querySelector('#btn-edit-why-packaging-s05')?.addEventListener('click', (e) => {
          e.preventDefault();
          navigateToS05(existing.packagingNote?.id, sourceId, 'packaging');
        });
      }

      if (wrapWhyPackaging) {
        wrapWhyPackaging.hidden = true;
        wrapWhyPackaging.setAttribute('hidden', '');
      }
    } else {
      chkPackaging.disabled = false;
      chkPackaging.checked = false;
      cardPackaging?.classList?.remove('is-already-saved');
    }
  }

  // 3. BOTH VAULTS ALREADY SAVED CASE
  const submitBtn = modalEl.querySelector('#btn-confirm-save, [data-testid="btn-confirm-save"]');
  if (existing.isBoth) {
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.setAttribute('title', 'บันทึกครบทั้งสองคลังแล้ว — เสนอไปแก้ WHY แทน (ลิงก์ไป S05)');
    }
  } else if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.removeAttribute('title');
  }

  return existing;
}

/**
 * Adds a new lens to an existing source without modifying or deleting existing notes (A05)
 * 
 * @param {string} sourceId Canonical source ID
 * @param {string} newLens 'content' or 'packaging'
 * @param {string} why Founder WHY reason
 * @param {object} [metadata] Optional metadata (tags, timestamp, label, collection)
 * @returns {{ success: boolean, note: object|null, error: string|null, updatedStatus: string }}
 */
export function addLensToSource(sourceId, newLens, why, metadata = {}) {
  if (!sourceId || !newLens || !why || !why.trim()) {
    return {
      success: false,
      note: null,
      error: 'Missing required fields for adding lens',
      updatedStatus: null
    };
  }

  const normalizedLens = String(newLens).trim().toLowerCase();
  if (!['content', 'packaging'].includes(normalizedLens)) {
    return {
      success: false,
      note: null,
      error: 'Invalid lens type',
      updatedStatus: null
    };
  }

  // Check duplicate lens prevention
  const duplicateCheck = preventDuplicateSave(sourceId, normalizedLens);
  if (duplicateCheck.isDuplicate) {
    return {
      success: false,
      note: null,
      error: 'err-duplicate-lens',
      message: duplicateCheck.message,
      editNoteId: duplicateCheck.editNoteId,
      updatedStatus: null
    };
  }

  // Preserve existing notes snapshot (A05 non-destructive guarantee)
  const existingBefore = checkExistingSaveState(sourceId);

  const uniqueSuffix = Math.random().toString(36).substring(2, 8);
  const noteId = `note-${sourceId}-${normalizedLens}-${Date.now()}-${uniqueSuffix}`;

  const formattedTags = Array.isArray(metadata.tags)
    ? metadata.tags
    : (typeof metadata.tags === 'string' && metadata.tags ? metadata.tags.split(',').map(t => t.trim()).filter(Boolean) : []);

  const newNote = {
    id: noteId,
    sourceId: sourceId,
    lens: normalizedLens,
    vaultType: normalizedLens,
    why: why.trim(),
    tags: formattedTags,
    timestamp: metadata.timestamp || null,
    label: metadata.label || null,
    collection: metadata.collection || null,
    analysisVersionId: metadata.analysisVersionId || null,
    createdAt: new Date().toISOString()
  };

  // Dispatch SAVE_NOTE to Central Store
  if (typeof dispatch === 'function') {
    dispatch({
      type: 'SAVE_NOTE',
      payload: newNote
    });
  }

  // Verify non-destructive guarantee
  const existingAfter = checkExistingSaveState(sourceId);
  const updatedStatus = existingAfter.isBoth ? 'Saved to Both' : (normalizedLens === 'content' ? 'Saved to Content' : 'Saved to Packaging');

  // Dispatch custom window event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mew:lens-added', {
      bubbles: true,
      detail: {
        sourceId,
        addedLens: normalizedLens,
        note: newNote,
        preservedNotes: existingBefore.notes,
        status: updatedStatus
      }
    }));
  }

  return {
    success: true,
    note: newNote,
    error: null,
    updatedStatus
  };
}

/**
 * Handles navigation to S04 Library on the newly saved lens tab
 * Requirement: btn-view-in-library ไป S04 แท็บคลังที่เพิ่งเซฟ
 * 
 * @param {string|string[]} savedLens 'content' | 'packaging' | 'both'
 * @param {object} [options]
 * @returns {boolean}
 */
export function handleViewInLibrary(savedLens, options = {}) {
  // Determine target vault tab
  let targetTab = 'content';

  if (Array.isArray(savedLens)) {
    if (savedLens.includes('packaging') && !savedLens.includes('content')) {
      targetTab = 'packaging';
    } else {
      targetTab = 'content';
    }
  } else if (typeof savedLens === 'string') {
    const lower = savedLens.toLowerCase();
    if (lower === 'packaging') {
      targetTab = 'packaging';
    } else {
      targetTab = 'content';
    }
  }

  // 1. If DOM tab button exists on page, activate it
  if (typeof document !== 'undefined') {
    const tabSelector = targetTab === 'packaging' ? '#tab-packaging-vault' : '#tab-content-vault';
    const tabBtn = document.querySelector(tabSelector);
    if (tabBtn && typeof tabBtn.click === 'function') {
      try {
        tabBtn.click();
      } catch (err) {
        // Safe fallback
      }
    }
  }

  // 2. Call Router to S04
  if (typeof router?.go === 'function') {
    router.go('S04', {
      activeVaultTab: targetTab,
      sourceId: options.sourceId || null
    });
  }

  // 3. Dispatch Custom Window Event for any listeners
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mew:navigate-library', {
      bubbles: true,
      detail: {
        targetTab,
        savedLens,
        sourceId: options.sourceId || null
      }
    }));
  }

  return true;
}

/**
 * Handles adding newly saved reference to the Remix basket and navigating to S06
 * Requirement: btn-use-in-remix ไป S06 พร้อมใส่ reference นั้นลงตะกร้าอัตโนมัติ (ผู้ใช้ลบออกได้)
 * 
 * @param {object|object[]} notes Saved note or array of notes
 * @param {object} [options]
 * @returns {boolean}
 */
export function handleUseInRemix(notes, options = {}) {
  const noteList = Array.isArray(notes) ? notes : (notes ? [notes] : []);
  if (noteList.length === 0) return false;

  const addedIngredients = [];

  for (const note of noteList) {
    if (!note || !note.id || !note.lens) continue;

    // 1. Dispatch ADD_REMIX_INGREDIENT to central store
    if (typeof dispatch === 'function') {
      dispatch({
        type: 'ADD_REMIX_INGREDIENT',
        payload: {
          lens: note.lens,
          noteId: note.id
        }
      });
    }

    // 2. Add to localStorage `mew_remix_basket` so S06 Remix Studio loads it seamlessly
    if (typeof localStorage !== 'undefined') {
      try {
        const rawBasket = localStorage.getItem('mew_remix_basket');
        const basket = rawBasket ? JSON.parse(rawBasket) : [];
        if (Array.isArray(basket)) {
          const exists = basket.some(b => b.id === note.id);
          if (!exists) {
            basket.push({
              id: note.id,
              sourceId: note.sourceId || options.sourceId || null,
              vaultType: note.lens,
              why: note.why || '',
              tags: note.tags || [],
              title: options.clip?.title || options.title || `Ref: ${note.sourceId || note.id}`,
              creator: options.clip?.creator || options.creator || 'Creator Ref',
              duration: options.clip?.duration || options.duration || '1:00',
              timestamp: note.timestamp || null,
              addedAt: new Date().toISOString()
            });
            localStorage.setItem('mew_remix_basket', JSON.stringify(basket));
          }
        }
      } catch (err) {
        console.warn('[SaveSuccess] LocalStorage write failed for remix basket:', err);
      }
    }

    addedIngredients.push(note);
  }

  // 3. Dispatch Custom Window Event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mew:add-to-remix-basket', {
      bubbles: true,
      detail: {
        addedIngredients,
        sourceId: options.sourceId || null
      }
    }));
  }

  // 4. Navigate to S06 via Router
  if (typeof router?.go === 'function') {
    router.go('S06', {
      sourceId: options.sourceId || null,
      addedIngredients
    });
  }

  return true;
}

/**
 * Navigates to S05 to edit Founder WHY of an existing note
 * @param {string} noteId 
 * @param {string} sourceId 
 * @param {string} lens 
 */
export function navigateToS05(noteId, sourceId, lens) {
  if (typeof router?.go === 'function') {
    router.go('S05', {
      activeNoteId: noteId,
      sourceId: sourceId,
      lens: lens
    });
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mew:navigate-s05-edit-why', {
      bubbles: true,
      detail: { noteId, sourceId, lens }
    }));
  }
}

/**
 * Controller for Managing the Save Success State & Dialog
 */
export class SaveSuccessController {
  /**
   * @param {Object} options 
   * @param {HTMLElement|string} [options.container] Target container or selector (defaults to #save-success)
   * @param {Function} [options.onViewInLibrary]
   * @param {Function} [options.onUseInRemix]
   */
  constructor(options = {}) {
    this.container = typeof options.container === 'string'
      ? document.querySelector(options.container)
      : (options.container || document.getElementById('save-success'));

    this.onViewInLibrary = options.onViewInLibrary || null;
    this.onUseInRemix = options.onUseInRemix || null;

    this.activeData = null;

    if (this.container) {
      this.cacheDom();
      this.bindEvents();
    }

    this.bindGlobalListeners();
  }

  /**
   * Caches DOM elements inside save-success
   */
  cacheDom() {
    if (!this.container) return;

    this.dom = {
      card: this.container.classList.contains('save-success-card') ? this.container : this.container.querySelector('.save-success-card'),
      accentBar: this.container.querySelector('#save-success-accent-bar'),
      iconWrap: this.container.querySelector('#save-success-icon-wrap, [data-testid="save-success-icon"]'),
      vaultPill: this.container.querySelector('#save-success-vault-pill, [data-testid="save-success-vault-pill"]'),
      title: this.container.querySelector('#save-success-title, [data-testid="save-success-title"]'),
      desc: this.container.querySelector('#save-success-desc, [data-testid="save-success-desc"]'),
      
      // Source Preview
      clipAvatar: this.container.querySelector('#save-success-clip-avatar'),
      clipCreator: this.container.querySelector('#save-success-clip-creator'),
      clipDuration: this.container.querySelector('#save-success-clip-duration'),
      clipTitle: this.container.querySelector('#save-success-clip-title'),

      // WHY Previews
      previewContent: this.container.querySelector('#success-preview-content'),
      previewPackaging: this.container.querySelector('#success-preview-packaging'),
      textWhyContent: this.container.querySelector('#success-text-why-content'),
      textWhyPackaging: this.container.querySelector('#success-text-why-packaging'),

      // A05 Callout & Duplicate Notice
      a05Callout: this.container.querySelector('#save-success-a05-callout, [data-testid="save-success-a05-callout"]'),
      duplicateNotice: this.container.querySelector('#save-duplicate-notice, [data-testid="save-duplicate-notice"]'),
      btnEditExistingWhy: this.container.querySelector('#btn-edit-existing-why, [data-testid="btn-edit-why-s05"]'),

      // Buttons
      btnViewInLibrary: this.container.querySelector('#btn-view-in-library, [data-testid="btn-view-in-library"]'),
      btnUseInRemix: this.container.querySelector('#btn-use-in-remix, [data-testid="btn-use-in-remix"]'),
      btnClose: this.container.querySelector('#btn-close-save-success, [data-testid="btn-close-save-success"]')
    };
  }

  /**
   * Binds interaction events to action buttons
   */
  bindEvents() {
    if (!this.dom) return;

    // 1. btn-view-in-library
    this.dom.btnViewInLibrary?.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleViewInLibraryClick();
    });

    // 2. btn-use-in-remix
    this.dom.btnUseInRemix?.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleUseInRemixClick();
    });

    // 3. btn-edit-existing-why (Go to S05)
    this.dom.btnEditExistingWhy?.addEventListener('click', (e) => {
      e.preventDefault();
      const noteId = this.activeData?.editNoteId || this.activeData?.notes?.[0]?.id;
      navigateToS05(noteId, this.activeData?.sourceId, this.activeData?.lens);
    });

    // 4. Close button
    this.dom.btnClose?.addEventListener('click', (e) => {
      e.preventDefault();
      this.hide();
    });
  }

  /**
   * Listens to system-wide save events to auto-present success state
   */
  bindGlobalListeners() {
    if (typeof window === 'undefined') return;

    this.onSaveCommitted = (e) => {
      const detail = e?.detail;
      if (detail) {
        this.render(detail);
        this.show();
      }
    };

    window.addEventListener('mew:save-committed', this.onSaveCommitted);
  }

  /**
   * Renders the Success UI with the committed payload
   * @param {Object} data
   * @param {string} data.sourceId
   * @param {string[]|string} data.lenses
   * @param {object[]} [data.notes]
   * @param {object} [data.clip]
   * @param {boolean} [data.isAddLens] Flag indicating A05 Add Lens update
   * @param {boolean} [data.isDuplicate] Flag indicating duplicate lens block
   */
  render(data = {}) {
    if (!this.container) return;
    this.cacheDom();
    this.activeData = data;

    const lenses = Array.isArray(data.lenses) ? data.lenses : (data.lenses ? [data.lenses] : ['content']);
    const isContent = lenses.includes('content');
    const isPackaging = lenses.includes('packaging');
    const isBoth = isContent && isPackaging || lenses.includes('both') || data.isBoth;

    // 1. Determine Actual Real Status Heading
    let titleText = SAVE_STATUS_TITLES.CONTENT;
    let vaultClass = 'content-vault';
    let pillText = 'Content Vault';
    let pillClass = 'coral';

    if (isBoth) {
      titleText = SAVE_STATUS_TITLES.BOTH;
      vaultClass = 'both-vault';
      pillText = 'Both Vaults (Dual-Lens)';
      pillClass = 'dual';
    } else if (isPackaging) {
      titleText = SAVE_STATUS_TITLES.PACKAGING;
      vaultClass = 'packaging-vault';
      pillText = 'Packaging Vault';
      pillClass = 'violet';
    }

    if (this.dom.title) {
      this.dom.title.textContent = titleText;
    }

    // Apply color styling to container & icon
    this.container.classList.remove('content-vault', 'packaging-vault', 'both-vault', 'coral-vault', 'violet-vault', 'dual-vault');
    this.container.classList.add(vaultClass);

    if (this.dom.iconWrap) {
      this.dom.iconWrap.className = `save-success-icon-wrap ${vaultClass}`;
    }

    if (this.dom.vaultPill) {
      this.dom.vaultPill.className = `badge-pill ${pillClass}`;
      this.dom.vaultPill.textContent = pillText;
    }

    // 2. Render Source Details
    const clip = data.clip || {};
    if (this.dom.clipCreator) this.dom.clipCreator.textContent = clip.creator || clip.author || 'Creator Ref';
    if (this.dom.clipDuration) this.dom.clipDuration.textContent = clip.duration || '0:48 นาที';
    if (this.dom.clipTitle) this.dom.clipTitle.textContent = `"${clip.title || clip.hook || 'Original Source Reference'}"`;
    if (this.dom.clipAvatar) {
      const name = clip.creator || clip.author || 'CR';
      this.dom.clipAvatar.textContent = name.slice(0, 2).toUpperCase();
    }

    // 3. Render WHY Previews
    const notes = Array.isArray(data.notes) ? data.notes : [];
    const contentNote = notes.find(n => n.lens === 'content') || (isContent ? { why: data.whyContent } : null);
    const packagingNote = notes.find(n => n.lens === 'packaging') || (isPackaging ? { why: data.whyPackaging } : null);

    if (this.dom.previewContent && this.dom.textWhyContent) {
      if (contentNote && contentNote.why) {
        this.dom.previewContent.hidden = false;
        this.dom.textWhyContent.textContent = `"${contentNote.why}"`;
      } else {
        this.dom.previewContent.hidden = true;
      }
    }

    if (this.dom.previewPackaging && this.dom.textWhyPackaging) {
      if (packagingNote && packagingNote.why) {
        this.dom.previewPackaging.hidden = false;
        this.dom.textWhyPackaging.textContent = `"${packagingNote.why}"`;
      } else {
        this.dom.previewPackaging.hidden = true;
      }
    }

    // 4. A05 Re-save Advisory Callout
    if (this.dom.a05Callout) {
      if (data.isAddLens) {
        this.dom.a05Callout.hidden = false;
        this.dom.a05Callout.removeAttribute('hidden');
      } else {
        this.dom.a05Callout.hidden = true;
        this.dom.a05Callout.setAttribute('hidden', '');
      }
    }

    // 5. Duplicate Notice
    if (this.dom.duplicateNotice) {
      if (data.isDuplicate) {
        this.dom.duplicateNotice.hidden = false;
        this.dom.duplicateNotice.removeAttribute('hidden');
      } else {
        this.dom.duplicateNotice.hidden = true;
        this.dom.duplicateNotice.setAttribute('hidden', '');
      }
    }
  }

  /**
   * Action: View in Library (S04)
   */
  handleViewInLibraryClick() {
    if (typeof this.onViewInLibrary === 'function') {
      this.onViewInLibrary(this.activeData);
    }
    const lenses = this.activeData?.lenses || 'content';
    handleViewInLibrary(lenses, { sourceId: this.activeData?.sourceId });
  }

  /**
   * Action: Use in Remix (S06)
   */
  handleUseInRemixClick() {
    if (typeof this.onUseInRemix === 'function') {
      this.onUseInRemix(this.activeData);
    }
    const notes = this.activeData?.notes || [];
    handleUseInRemix(notes, {
      sourceId: this.activeData?.sourceId,
      clip: this.activeData?.clip
    });
  }

  show() {
    if (!this.container) return;
    this.container.hidden = false;
    this.container.removeAttribute('hidden');
    this.container.setAttribute('aria-hidden', 'false');
  }

  hide() {
    if (!this.container) return;
    this.container.hidden = true;
    this.container.setAttribute('hidden', '');
    this.container.setAttribute('aria-hidden', 'true');
  }

  destroy() {
    if (typeof window !== 'undefined' && this.onSaveCommitted) {
      window.removeEventListener('mew:save-committed', this.onSaveCommitted);
    }
  }
}

/**
 * Convenience helper to initialize Save Success
 * @param {Object} options 
 * @returns {SaveSuccessController}
 */
export function initSaveSuccess(options = {}) {
  const controller = new SaveSuccessController(options);
  if (typeof window !== 'undefined') {
    window.saveSuccessController = controller;
  }
  return controller;
}

// Auto mount in browser
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (document.getElementById('save-success')) {
        initSaveSuccess();
      }
    });
  } else {
    if (document.getElementById('save-success')) {
      initSaveSuccess();
    }
  }
}
