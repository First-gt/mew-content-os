/**
 * ==============================================================================
 * MEW CONTENT OS — S03 Save Modal (UI Chooser) Controller (Topic T12)
 * Theme: mewteetawat.com V6.3 (Warm Stone, Coral, Violet & Deep Ink)
 * 100% Pure Client-Side JavaScript (Vanilla ES6+) · Zero Server Dependencies
 * 
 * Definition of Done (DOD):
 * - HTML: modal `save-modal` หัวข้อ "Save this reference"; checkbox `chk-save-content`, `chk-save-packaging`;
 *         ช่อง `why-content` และ `why-packaging` (textarea) ซ่อนจนกว่าจะติ๊กคลังนั้น
 * - HTML: ช่อง optional `tags`, `timestamp`, `label`, `collection`; ปุ่ม `btn-confirm-save` และ `btn-cancel-save`
 * - CSS: wireframe 2 ในสเปกข้อ 8; ติ๊กทั้งสองแล้วมี textarea 2 ช่องแยกกันชัดเจน (ไม่ใช่ช่องกลางช่องเดียว)
 * - JS: ติ๊ก/เลิกติ๊กแสดง/ซ่อน textarea ถูกคลัง และไม่ล้างข้อความที่พิมพ์ไว้เมื่อซ่อนแล้วเปิดใหม่
 * - JS: `btn-cancel-save` ปิด modal โดยไม่เปลี่ยน store; ปิดด้วย Esc ได้และ focus กลับที่ `btn-save-to-library`
 * 
 * Strict Negative Constraint:
 * Absolutely NO fake or arbitrary statistics or fake percentage badges.
 * ==============================================================================
 */

import { configureSaveModalForSource } from './save-success.js';

export class SaveModalController {
  /**
   * Initializes the Save Modal Controller
   * @param {Object} options Configuration options
   * @param {HTMLElement|string} [options.modal] Root modal container or selector (defaults to #save-modal)
   * @param {HTMLElement|string} [options.defaultTrigger] Fallback trigger element (defaults to #btn-save-to-library)
   * @param {Function} [options.onSave] Optional callback when reference save is confirmed
   * @param {Function} [options.onCancel] Optional callback when save is cancelled
   */
  constructor(options = {}) {
    this.modalEl = typeof options.modal === 'string'
      ? document.querySelector(options.modal)
      : (options.modal || document.getElementById('save-modal') || document.getElementById('save-decision-modal'));

    this.defaultTriggerSelector = options.defaultTrigger || '#btn-save-to-library';
    this.onSave = options.onSave || null;
    this.onCancel = options.onCancel || null;

    this.activeTrigger = null;
    this.currentClip = null;
    this.isOpen = false;

    // Cache DOM & Bind events if modal root exists
    if (this.modalEl) {
      this.cacheDom();
      this.bindEvents();
    }
  }

  /**
   * Resolves and caches DOM elements within modal
   */
  cacheDom() {
    if (!this.modalEl) return;

    this.dom = {
      // Modal Card
      card: this.modalEl.querySelector('.save-modal-card'),
      title: this.modalEl.querySelector('#save-modal-title, .save-modal-title'),
      btnClose: this.modalEl.querySelector('#btn-close-save-modal, .btn-close-modal'),

      // Context Preview Summary
      clipAvatar: this.modalEl.querySelector('#save-clip-avatar, #summary-avatar-initials'),
      clipCreator: this.modalEl.querySelector('#save-clip-creator, #summary-author'),
      clipDuration: this.modalEl.querySelector('#save-clip-duration, #summary-duration'),
      clipTitle: this.modalEl.querySelector('#save-clip-title, #summary-hook'),

      // Form
      form: this.modalEl.querySelector('#save-modal-form, #save-decision-form'),

      // Checkboxes
      chkSaveContent: this.modalEl.querySelector('#chk-save-content, [data-testid="chk-save-content"], #vault-checkbox-content'),
      chkSavePackaging: this.modalEl.querySelector('#chk-save-packaging, [data-testid="chk-save-packaging"], #vault-checkbox-packaging'),
      vaultError: this.modalEl.querySelector('#vault-selection-error, #vault-empty-alert'),

      // Textareas & Wrappers
      wrapWhyContent: this.modalEl.querySelector('#wrap-why-content, #group-reason-content'),
      wrapWhyPackaging: this.modalEl.querySelector('#wrap-why-packaging, #group-reason-packaging'),
      whyContent: this.modalEl.querySelector('#why-content, [data-testid="why-content"], #input-reason-content'),
      whyPackaging: this.modalEl.querySelector('#why-packaging, [data-testid="why-packaging"], #input-reason-packaging'),
      counterWhyContent: this.modalEl.querySelector('#counter-why-content, #count-reason-content'),
      counterWhyPackaging: this.modalEl.querySelector('#counter-why-packaging, #count-reason-packaging'),
      dualVaultCallout: this.modalEl.querySelector('#dual-vault-callout, #both-vaults-note'),
      errorWhyContent: this.modalEl.querySelector('#error-why-content'),
      errorWhyPackaging: this.modalEl.querySelector('#error-why-packaging'),

      // Optional Metadata
      tags: this.modalEl.querySelector('#tags, [data-testid="tags"]'),
      timestamp: this.modalEl.querySelector('#timestamp, [data-testid="timestamp"]'),
      label: this.modalEl.querySelector('#label, [data-testid="label"]'),
      collection: this.modalEl.querySelector('#collection, [data-testid="collection"]'),
      optionalDetails: this.modalEl.querySelector('#optional-metadata-details'),

      // Action Buttons
      btnCancel: this.modalEl.querySelector('#btn-cancel-save, [data-testid="btn-cancel-save"]'),
      btnConfirm: this.modalEl.querySelector('#btn-confirm-save, [data-testid="btn-confirm-save"], #btn-submit-save')
    };
  }

  /**
   * Binds user events and keyboard handlers
   */
  bindEvents() {
    if (!this.dom) return;

    // 1. Vault Checkboxes Toggle (CRITICAL DOD: reveals/hides textarea without wiping typed text)
    this.dom.chkSaveContent?.addEventListener('change', () => {
      this.handleToggleContent(Boolean(this.dom.chkSaveContent.checked));
    });

    this.dom.chkSavePackaging?.addEventListener('change', () => {
      this.handleTogglePackaging(Boolean(this.dom.chkSavePackaging.checked));
    });

    // 2. Character counters on typing
    this.dom.whyContent?.addEventListener('input', () => {
      this.updateCharCount(this.dom.whyContent, this.dom.counterWhyContent);
      if (this.dom.errorWhyContent) {
        this.dom.errorWhyContent.hidden = true;
      }
    });

    this.dom.whyPackaging?.addEventListener('input', () => {
      this.updateCharCount(this.dom.whyPackaging, this.dom.counterWhyPackaging);
      if (this.dom.errorWhyPackaging) {
        this.dom.errorWhyPackaging.hidden = true;
      }
    });

    // 3. Cancel Button (CRITICAL DOD: closes modal WITHOUT modifying store, returns focus to btn-save-to-library)
    this.dom.btnCancel?.addEventListener('click', (e) => {
      e.preventDefault();
      this.cancel();
    });

    // 4. Close 'X' Button
    this.dom.btnClose?.addEventListener('click', (e) => {
      e.preventDefault();
      this.cancel();
    });

    // 5. Confirm Save Button / Form Submit
    this.dom.form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleConfirmSave();
    });

    this.dom.btnConfirm?.addEventListener('click', (e) => {
      // If button is outside form or type="button"
      if (this.dom.btnConfirm.getAttribute('type') === 'button') {
        e.preventDefault();
        this.handleConfirmSave();
      }
    });

    // 6. Backdrop click to close (returns focus to btn-save-to-library)
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) {
        this.cancel();
      }
    });

    // 7. Global Keyboard Handling (Escape & Focus Trap)
    this.handleKeyDown = this.handleKeyDown.bind(this);
    window.addEventListener('keydown', this.handleKeyDown);

    // 8. Custom Window Event Listener for external triggers
    this.handleOpenEvent = (e) => {
      const clip = e?.detail || null;
      this.open(clip);
    };
    window.addEventListener('mew:open-save-modal', this.handleOpenEvent);
  }

  /**
   * Toggles visibility of Content WHY field without clearing typed content
   * @param {boolean} isChecked 
   */
  handleToggleContent(isChecked) {
    if (!this.dom?.wrapWhyContent) return;

    if (isChecked) {
      this.dom.wrapWhyContent.hidden = false;
      this.dom.wrapWhyContent.removeAttribute('hidden');
      if (this.dom.vaultError) this.dom.vaultError.hidden = true;
      // Focus textarea smoothly if user just checked it
      setTimeout(() => this.dom.whyContent?.focus(), 50);
    } else {
      this.dom.wrapWhyContent.hidden = true;
      this.dom.wrapWhyContent.setAttribute('hidden', '');
      // NOTICE: Do NOT wipe this.dom.whyContent.value! (Requirement: ไม่ล้างข้อความที่พิมพ์ไว้)
    }

    this.syncDualVaultUI();
  }

  /**
   * Toggles visibility of Packaging WHY field without clearing typed content
   * @param {boolean} isChecked 
   */
  handleTogglePackaging(isChecked) {
    if (!this.dom?.wrapWhyPackaging) return;

    if (isChecked) {
      this.dom.wrapWhyPackaging.hidden = false;
      this.dom.wrapWhyPackaging.removeAttribute('hidden');
      if (this.dom.vaultError) this.dom.vaultError.hidden = true;
      // Focus textarea smoothly if user just checked it
      setTimeout(() => this.dom.whyPackaging?.focus(), 50);
    } else {
      this.dom.wrapWhyPackaging.hidden = true;
      this.dom.wrapWhyPackaging.setAttribute('hidden', '');
      // NOTICE: Do NOT wipe this.dom.whyPackaging.value! (Requirement: ไม่ล้างข้อความที่พิมพ์ไว้)
    }

    this.syncDualVaultUI();
  }

  /**
   * Synchronizes callout when both vaults are checked (Wireframe 2)
   */
  syncDualVaultUI() {
    const isContentChecked = Boolean(this.dom?.chkSaveContent?.checked);
    const isPackagingChecked = Boolean(this.dom?.chkSavePackaging?.checked);

    if (this.dom?.dualVaultCallout) {
      if (isContentChecked && isPackagingChecked) {
        this.dom.dualVaultCallout.hidden = false;
        this.dom.dualVaultCallout.removeAttribute('hidden');
      } else {
        this.dom.dualVaultCallout.hidden = true;
        this.dom.dualVaultCallout.setAttribute('hidden', '');
      }
    }
  }

  /**
   * Updates live character counter
   * @param {HTMLTextAreaElement} textarea 
   * @param {HTMLElement} counterEl 
   */
  updateCharCount(textarea, counterEl) {
    if (!textarea || !counterEl) return;
    const length = (textarea.value || '').length;
    counterEl.textContent = `${length} ตัวอักษร`;
  }

  /**
   * Handles keyboard events (Escape to close and return focus; Tab to trap focus)
   * @param {KeyboardEvent} e 
   */
  handleKeyDown(e) {
    if (!this.isOpen) return;

    if (e.key === 'Escape' || e.key === 'Esc') {
      e.preventDefault();
      this.cancel();
      return;
    }

    // Accessible Focus Trap within dialog
    if (e.key === 'Tab') {
      this.trapFocus(e);
    }
  }

  /**
   * Traps Tab focus inside the active modal
   * @param {KeyboardEvent} e 
   */
  trapFocus(e) {
    if (!this.modalEl) return;

    const focusableSelectors = [
      'button:not([disabled]):not([hidden])',
      'input:not([disabled]):not([hidden]):not([type="hidden"])',
      'textarea:not([disabled]):not([hidden])',
      'select:not([disabled]):not([hidden])',
      '[tabindex]:not([tabindex="-1"]):not([disabled])'
    ].join(', ');

    const focusableElements = Array.from(this.modalEl.querySelectorAll(focusableSelectors))
      .filter(el => {
        // Element and its parents must be visible
        return el.offsetParent !== null || el.offsetWidth > 0 || el.offsetHeight > 0;
      });

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }

  /**
   * Opens the Save Modal with optional clip data
   * @param {Object} [clipData] Source clip preview data
   * @param {HTMLElement} [triggerEl] Element that triggered the modal
   */
  open(clipData = null, triggerEl = null) {
    if (!this.modalEl) return;

    // Cache the trigger element that opened the modal (defaults to #btn-save-to-library)
    this.activeTrigger = triggerEl 
      || document.querySelector(this.defaultTriggerSelector) 
      || (typeof document !== 'undefined' ? document.activeElement : null);

    if (clipData) {
      this.setClipPreview(clipData);
      
      // Topic T14: Pre-check already saved lenses for Re-save / Add Lens (A05)
      const sourceId = clipData?.id || clipData?.sourceId || null;
      if (sourceId && this.modalEl) {
        try {
          configureSaveModalForSource(this.modalEl, sourceId);
        } catch (err) {
          // Safe fallback for test mock elements
        }
      }
    }

    // Reveal modal
    this.modalEl.hidden = false;
    this.modalEl.removeAttribute('hidden');
    this.modalEl.setAttribute('aria-hidden', 'false');
    this.isOpen = true;

    // Sync dual vault UI state
    this.syncDualVaultUI();

    // Prevent background scroll
    if (typeof document !== 'undefined' && document.body) {
      document.body.style.overflow = 'hidden';
    }

    // Set initial focus: first checked box or title
    setTimeout(() => {
      const focusTarget = this.dom?.chkSaveContent || this.dom?.btnClose;
      focusTarget?.focus();
    }, 60);

    // Dispatch open event
    const event = new CustomEvent('mew:save-modal-opened', {
      bubbles: true,
      detail: { clip: this.currentClip }
    });
    window.dispatchEvent(event);
  }

  /**
   * Closes modal, restores scroll and returns focus to trigger
   */
  close() {
    if (!this.modalEl) return;

    this.modalEl.hidden = true;
    this.modalEl.setAttribute('hidden', '');
    this.modalEl.setAttribute('aria-hidden', 'true');
    this.isOpen = false;

    // Restore background scroll
    if (typeof document !== 'undefined' && document.body) {
      document.body.style.overflow = '';
    }

    // CRITICAL DOD: return focus to btn-save-to-library (or cached trigger)
    this.returnFocusToTrigger();

    // Dispatch close event
    const event = new CustomEvent('mew:save-modal-closed', { bubbles: true });
    window.dispatchEvent(event);
  }

  /**
   * Cancels the modal action WITHOUT changing the store
   */
  cancel() {
    // Invoke optional user callback
    if (typeof this.onCancel === 'function') {
      try {
        this.onCancel();
      } catch (err) {
        console.warn('[SaveModal] onCancel callback error:', err);
      }
    }

    // Close modal and return focus
    this.close();

    // Dispatch cancelled event
    const event = new CustomEvent('mew:save-cancelled', { bubbles: true });
    window.dispatchEvent(event);
  }

  /**
   * Returns focus to #btn-save-to-library or the element that triggered the modal
   */
  returnFocusToTrigger() {
    let target = this.activeTrigger;
    const isTargetConnected = target && (typeof document !== 'undefined' && typeof document?.body?.contains === 'function' 
      ? document.body.contains(target) 
      : true);

    if (!target || typeof target.focus !== 'function' || !isTargetConnected) {
      target = typeof document !== 'undefined' ? document.querySelector(this.defaultTriggerSelector) : null;
    }

    if (target && typeof target.focus === 'function') {
      try {
        target.focus();
      } catch (err) {
        // Safe fallback in restricted environments
      }
    }
  }

  /**
   * Sets clip preview metadata
   * @param {Object} clip 
   */
  setClipPreview(clip) {
    if (!clip) return;
    this.currentClip = clip;

    if (this.dom?.clipCreator && clip.creator || clip.author) {
      this.dom.clipCreator.textContent = clip.creator || clip.author;
    }
    if (this.dom?.clipDuration && clip.duration) {
      this.dom.clipDuration.textContent = clip.duration;
    }
    if (this.dom?.clipTitle && (clip.title || clip.hook)) {
      this.dom.clipTitle.textContent = `"${clip.title || clip.hook}"`;
    }
    if (this.dom?.clipAvatar) {
      const name = clip.creator || clip.author || 'CR';
      const initials = name
        .split(' ')
        .map(w => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
      this.dom.clipAvatar.textContent = initials || 'CR';
    }
    if (this.dom?.timestamp && clip.duration) {
      this.dom.timestamp.placeholder = clip.duration;
    }
  }

  /**
   * Validates selection and dispatches confirmed save payload
   */
  handleConfirmSave() {
    const isContent = Boolean(this.dom?.chkSaveContent?.checked);
    const isPackaging = Boolean(this.dom?.chkSavePackaging?.checked);

    // Verify at least one vault is selected
    if (!isContent && !isPackaging) {
      if (this.dom?.vaultError) {
        this.dom.vaultError.hidden = false;
        this.dom.vaultError.removeAttribute('hidden');
      }
      return;
    }

    const payload = {
      sourceId: this.currentClip?.id || null,
      clip: this.currentClip,
      saveContent: isContent,
      savePackaging: isPackaging,
      whyContent: this.dom?.whyContent?.value || '',
      whyPackaging: this.dom?.whyPackaging?.value || '',
      tags: this.dom?.tags?.value || '',
      timestamp: this.dom?.timestamp?.value || '',
      label: this.dom?.label?.value || '',
      collection: this.dom?.collection?.value || '',
      savedAt: new Date().toISOString()
    };

    // Invoke user callback if present
    if (typeof this.onSave === 'function') {
      try {
        this.onSave(payload);
      } catch (err) {
        console.warn('[SaveModal] onSave callback error:', err);
      }
    }

    // Dispatch reference saved event
    const event = new CustomEvent('mew:reference-saved', {
      bubbles: true,
      detail: payload
    });
    window.dispatchEvent(event);

    // Close modal and return focus to btn-save-to-library
    this.close();
  }

  /**
   * Destroys instance and cleans up event listeners
   */
  destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeyDown);
      window.removeEventListener('mew:open-save-modal', this.handleOpenEvent);
    }
    this.isOpen = false;
  }
}

/**
 * Convenience helper to initialize the Save Modal
 * @param {Object} options 
 * @returns {SaveModalController}
 */
export function initSaveModal(options = {}) {
  const controller = new SaveModalController(options);
  if (typeof window !== 'undefined') {
    window.saveModalController = controller;
  }
  return controller;
}

// Auto-mount in browser if modal DOM exists on page load
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (document.getElementById('save-modal') || document.getElementById('save-decision-modal')) {
        initSaveModal();
      }
    });
  } else {
    if (document.getElementById('save-modal') || document.getElementById('save-decision-modal')) {
      initSaveModal();
    }
  }
}
