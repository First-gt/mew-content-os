/**
 * ==============================================================================
 * MEW CONTENT OS — Remix Resume Controller (Topic T21)
 * Theme: mewteetawat.com V6.3
 * 100% Pure Client-Side JavaScript (Vanilla ES6+)
 * Zero Server Dependencies · Zero Fake Metrics · Accessible WCAG UI
 * ==============================================================================
 */

import { getState, dispatch, subscribe } from './store.js';
import { router } from './router.js';

export const STORAGE_KEY = 'mew_remix_active_selection';

export class RemixResumeController {
  /**
   * @param {Object} options 
   * @param {string|HTMLElement} [options.rootId] - Root container selector or element
   * @param {Function} [options.onResume] - Callback invoked when resuming
   * @param {Function} [options.onDiscard] - Callback invoked when selection is discarded
   * @param {boolean} [options.autoSyncStore=true] - Whether to auto-sync with central store
   */
  constructor(options = {}) {
    this.root = typeof options.rootId === 'string'
      ? (typeof document !== 'undefined' ? document.querySelector(options.rootId) : null)
      : (options.rootId || (typeof document !== 'undefined' ? document.getElementById('resume-banner-root') : null));

    this.onResume = options.onResume || null;
    this.onDiscard = options.onDiscard || null;
    this.unsubscribeStore = null;

    // Auto-bind UI listeners if in DOM environment
    if (typeof document !== 'undefined') {
      this.bindEvents();
    }

    // Auto-sync with central store & hydrate if enabled
    if (options.autoSyncStore !== false) {
      this.initStoreSync();
    }
  }

  /**
   * Persists active selection to localStorage
   * Handles both Array format (e.g. ['ref-c1', 'ref-p1']) and Object format ({ content: [], packaging: [] })
   * @param {Array<string|Object>|Object} selection 
   */
  persistSelection(selection) {
    if (!selection) return;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
      }
    } catch (e) {
      console.warn('[RemixResume] Failed to persist selection to localStorage:', e);
    }
  }

  /**
   * Retrieves active selection from localStorage
   * @returns {Array<any>|Object}
   */
  getPersistedSelection() {
    try {
      if (typeof localStorage === 'undefined') return [];
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return parsed || [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Normalizes selection into structured object { content: string[], packaging: string[] }
   * @returns {{ content: string[], packaging: string[] }}
   */
  getNormalizedSelection() {
    const raw = this.getPersistedSelection();
    if (!raw) return { content: [], packaging: [] };

    if (Array.isArray(raw)) {
      const content = [];
      const packaging = [];
      for (const item of raw) {
        const id = typeof item === 'object' && item !== null ? item.id : String(item);
        if (id.includes('-p') || id.startsWith('p') || (typeof item === 'object' && item.lens === 'packaging')) {
          packaging.push(id);
        } else {
          content.push(id);
        }
      }
      return { content, packaging };
    }

    if (typeof raw === 'object') {
      return {
        content: Array.isArray(raw.content) ? [...raw.content] : [],
        packaging: Array.isArray(raw.packaging) ? [...raw.packaging] : []
      };
    }

    return { content: [], packaging: [] };
  }

  /**
   * Returns the total count of ingredients in active selection
   * @returns {number}
   */
  getTotalCount() {
    const raw = this.getPersistedSelection();
    if (Array.isArray(raw)) return raw.length;
    if (typeof raw === 'object' && raw !== null) {
      const c = Array.isArray(raw.content) ? raw.content.length : 0;
      const p = Array.isArray(raw.packaging) ? raw.packaging.length : 0;
      return c + p;
    }
    return 0;
  }

  /**
   * Checks whether there is a pending selection with at least 1 item
   * @returns {boolean}
   */
  hasPendingSelection() {
    return this.getTotalCount() > 0;
  }

  /**
   * Discards the pending selection and clears storage.
   * Note: Accidental silent clearing is prohibited. Discarding requires confirmation.
   * @param {Object} [options]
   * @param {boolean} [options.skipConfirm=false] - Programmatic override for tests or confirmed actions
   */
  discardSelection(options = {}) {
    const skipConfirm = options.skipConfirm || (typeof window === 'undefined');

    if (!skipConfirm && typeof window !== 'undefined') {
      const confirmDialog = document.getElementById('discard-confirm-dialog');
      if (confirmDialog) {
        confirmDialog.hidden = false;
        const confirmBtn = document.getElementById('btn-confirm-discard');
        if (confirmBtn) confirmBtn.focus();
        return false;
      }

      // Fallback native confirm if dialog element does not exist
      const ok = window.confirm('คุณแน่ใจหรือไม่ว่าต้องการล้างตะกร้าวัตถุดิบทั้งหมด? รายการที่เลือกไว้จะหายไป');
      if (!ok) return false;
    }

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {}

    try {
      if (typeof dispatch === 'function') {
        dispatch({
          type: 'CLEAR_REMIX_SELECTION'
        });
        dispatch({
          type: 'SET_REMIX_SELECTION',
          payload: { content: [], packaging: [] }
        });
      }
    } catch (e) {}

    if (typeof document !== 'undefined') {
      const banner = document.getElementById('banner-resume-selection');
      if (banner) banner.hidden = true;

      const confirmDialog = document.getElementById('discard-confirm-dialog');
      if (confirmDialog) confirmDialog.hidden = true;
    }

    if (typeof this.onDiscard === 'function') {
      this.onDiscard();
    }

    return true;
  }

  /**
   * Resumes the selection and navigates to Remix Studio (S06)
   */
  resumeSelection() {
    const items = this.getPersistedSelection();
    const normalized = this.getNormalizedSelection();

    // Rehydrate central store if store is currently empty
    try {
      if (typeof getState === 'function' && typeof dispatch === 'function') {
        const state = getState();
        const storeContentCount = state?.remixSelection?.content?.length || 0;
        const storePackagingCount = state?.remixSelection?.packaging?.length || 0;

        if (storeContentCount === 0 && storePackagingCount === 0 && (normalized.content.length > 0 || normalized.packaging.length > 0)) {
          dispatch({
            type: 'SET_REMIX_SELECTION',
            payload: {
              content: normalized.content,
              packaging: normalized.packaging
            }
          });
        }
      }
    } catch (e) {}

    if (typeof this.onResume === 'function') {
      this.onResume(items);
    } else if (router && typeof router.navigate === 'function') {
      router.navigate('remix');
    }
  }

  /**
   * Updates the banner visibility and counter display with accessibility attributes
   */
  updateBannerUI() {
    if (typeof document === 'undefined') return;

    const banner = document.getElementById('banner-resume-selection');
    const countEl = document.getElementById('resume-items-count');
    const breakdownEl = document.getElementById('resume-breakdown-text');
    const chipsContainer = document.getElementById('resume-chips-preview');

    const total = this.getTotalCount();
    const isVisible = total > 0;

    if (banner) {
      banner.hidden = !isVisible;
    }

    if (countEl) {
      countEl.textContent = `${total} รายการ`;
    }

    const normalized = this.getNormalizedSelection();
    if (breakdownEl) {
      if (normalized.content.length > 0 || normalized.packaging.length > 0) {
        breakdownEl.hidden = false;
        breakdownEl.textContent = `C:${normalized.content.length} + P:${normalized.packaging.length}`;
      } else {
        breakdownEl.hidden = true;
      }
    }

    // Render chips preview if container exists
    if (chipsContainer && isVisible) {
      let chipsHtml = '';
      const state = (typeof getState === 'function') ? getState() : null;
      const savedNotes = state?.savedNotes || [];

      // Render content chips
      normalized.content.forEach((id) => {
        const note = savedNotes.find(n => n.id === id);
        const title = note?.title || id;
        chipsHtml += `<span class="resume-chip chip-content" title="${title}">Content: ${title}</span>`;
      });

      // Render packaging chips
      normalized.packaging.forEach((id) => {
        const note = savedNotes.find(n => n.id === id);
        const title = note?.title || id;
        chipsHtml += `<span class="resume-chip chip-packaging" title="${title}">Packaging: ${title}</span>`;
      });

      chipsContainer.innerHTML = chipsHtml;
    } else if (chipsContainer) {
      chipsContainer.innerHTML = '';
    }
  }

  /**
   * Initializes store synchronization & state hydration across page navigations (A17/D10)
   */
  initStoreSync() {
    if (typeof getState !== 'function') return;

    // 1. Initial Hydration: If localStorage has selection but Store is empty, hydrate Store
    try {
      const state = getState();
      const persisted = this.getPersistedSelection();
      const normalized = this.getNormalizedSelection();
      const storeHasItems = (state?.remixSelection?.content?.length || 0) + (state?.remixSelection?.packaging?.length || 0) > 0;

      if (!storeHasItems && (normalized.content.length > 0 || normalized.packaging.length > 0)) {
        if (typeof dispatch === 'function') {
          dispatch({
            type: 'SET_REMIX_SELECTION',
            payload: {
              content: normalized.content,
              packaging: normalized.packaging
            }
          });
        }
      } else if (storeHasItems && !Array.isArray(persisted) && (!persisted.content || persisted.content.length === 0)) {
        // If store already has items on load, persist to localStorage
        this.persistSelection(state.remixSelection);
      }
    } catch (e) {}

    // 2. Subscribe to Central Store changes: persist to localStorage every time selection changes
    if (typeof subscribe === 'function') {
      this.unsubscribeStore = subscribe((nextState) => {
        if (!nextState || !nextState.remixSelection) return;

        const selection = nextState.remixSelection;
        const total = (selection.content?.length || 0) + (selection.packaging?.length || 0);

        if (total > 0) {
          this.persistSelection(selection);
        } else {
          // Only clear localStorage if store explicitly emptied
          try {
            if (typeof localStorage !== 'undefined') {
              localStorage.removeItem(STORAGE_KEY);
            }
          } catch (e) {}
        }

        this.updateBannerUI();
      });
    }

    // Initial UI sync
    this.updateBannerUI();
  }

  /**
   * Binds click and keyboard events to banner controls
   */
  bindEvents() {
    if (typeof document === 'undefined') return;

    // Resume button
    const resumeBtn = document.getElementById('btn-resume');
    if (resumeBtn && !resumeBtn._hasResumeListener) {
      resumeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.resumeSelection();
      });
      resumeBtn._hasResumeListener = true;
    }

    // Discard button (triggers confirmation prompt)
    const discardBtn = document.getElementById('btn-discard-selection');
    if (discardBtn && !discardBtn._hasDiscardListener) {
      discardBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const dialog = document.getElementById('discard-confirm-dialog');
        if (dialog) {
          dialog.hidden = false;
          const confirmBtn = document.getElementById('btn-confirm-discard');
          if (confirmBtn) confirmBtn.focus();
        } else {
          this.discardSelection({ skipConfirm: false });
        }
      });
      discardBtn._hasDiscardListener = true;
    }

    // Confirm discard action
    const confirmBtn = document.getElementById('btn-confirm-discard');
    if (confirmBtn && !confirmBtn._hasConfirmListener) {
      confirmBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.discardSelection({ skipConfirm: true });
      });
      confirmBtn._hasConfirmListener = true;
    }

    // Cancel discard action
    const cancelBtn = document.getElementById('btn-cancel-discard');
    if (cancelBtn && !cancelBtn._hasCancelListener) {
      cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const dialog = document.getElementById('discard-confirm-dialog');
        if (dialog) dialog.hidden = true;
        if (discardBtn) discardBtn.focus();
      });
      cancelBtn._hasCancelListener = true;
    }

    // Keyboard support: Escape cancels dialog
    if (!document._hasResumeDialogEscListener) {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          const dialog = document.getElementById('discard-confirm-dialog');
          if (dialog && !dialog.hidden) {
            dialog.hidden = true;
            if (discardBtn) discardBtn.focus();
          }
        }
      });
      document._hasResumeDialogEscListener = true;
    }
  }

  /**
   * Destroys listeners and cleans up subscriptions
   */
  destroy() {
    if (typeof this.unsubscribeStore === 'function') {
      this.unsubscribeStore();
      this.unsubscribeStore = null;
    }
  }
}

/**
 * Convenience helper to initialize the remix resume banner controller
 * @param {Object} options 
 * @returns {RemixResumeController}
 */
export function initRemixResume(options = {}) {
  return new RemixResumeController(options);
}
