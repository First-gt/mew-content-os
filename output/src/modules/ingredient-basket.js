/**
 * ==============================================================================
 * MEW CONTENT OS — Ingredient Basket Bar Controller (Topic T20)
 * Theme: mewteetawat.com V6.3
 * 100% Pure Client-Side JavaScript (Vanilla ES6+)
 * Zero Server Dependencies · Zero Fake Metrics · Accessible WCAG UI
 * ==============================================================================
 */

import { getState, dispatch, subscribe } from './store.js';
import { router } from './router.js';

export class IngredientBarController {
  constructor(options = {}) {
    this.root = typeof options.rootId === 'string'
      ? (typeof document !== 'undefined' ? document.querySelector(options.rootId) : null)
      : (options.rootId || (typeof document !== 'undefined' ? document.getElementById('ingredient-bar') : null));

    this._hasExplicitInitialReferences = Array.isArray(options.initialReferences);
    this.selectedReferences = [...(options.initialReferences || [])];
    this.onSelectionChanged = options.onSelectionChanged || null;
    this.onContinue = options.onContinue || null;
    this._draggedNoteId = null;
    this._isInternalDispatch = false;

    // Auto-sync with central store if initialReferences not explicitly passed
    if (!this._hasExplicitInitialReferences && typeof getState === 'function') {
      try {
        this.syncFromStore();
      } catch (e) {}
    }

    // Subscribe to store updates (only for store-driven instances)
    if (typeof subscribe === 'function') {
      this._unsubscribeStore = subscribe(() => {
        this.handleStoreUpdated();
      });
    }

    if (typeof document !== 'undefined') {
      this.bindEvents();
      this.updateUI();
    }
  }

  /**
   * Evaluates if recipe can proceed to synthesis (D7/A10 Gating)
   * Rule: Content count must be >= 1. Packaging can be 0.
   * @param {number} contentCount 
   * @returns {boolean}
   */
  canContinue(contentCount) {
    return (contentCount || 0) >= 1;
  }

  /**
   * Sets current references in basket
   * @param {Array<Object>} references 
   */
  setReferences(references) {
    this.selectedReferences = Array.isArray(references) ? [...references] : [];
    this.updateUI();
  }

  /**
   * Synchronizes basket references from Central Store remixSelection & savedNotes
   */
  syncFromStore() {
    const state = getState();
    if (!state || !state.remixSelection) return;

    const contentIds = Array.isArray(state.remixSelection.content) ? state.remixSelection.content : [];
    const packagingIds = Array.isArray(state.remixSelection.packaging) ? state.remixSelection.packaging : [];
    const savedNotes = Array.isArray(state.savedNotes) ? state.savedNotes : [];
    const researchItems = Array.isArray(state.researchItems) ? state.researchItems : [];

    const notesMap = new Map(savedNotes.map(n => [n.id, n]));
    const sourcesMap = new Map(researchItems.map(s => [s.sourceId || s.id, s]));

    const refs = [];

    // Add Content references in order
    for (const cId of contentIds) {
      const note = notesMap.get(cId);
      const source = note ? sourcesMap.get(note.sourceId) : null;
      refs.push({
        id: cId,
        noteId: cId,
        lens: 'content',
        vaultType: 'content',
        title: note?.title || (note?.why ? note.why.slice(0, 48) + '...' : cId),
        why: note?.why || '',
        tags: note?.tags || [],
        sourceId: note?.sourceId || '',
        sourceTitle: source?.title || source?.topic || ''
      });
    }

    // Add Packaging references in order
    for (const pId of packagingIds) {
      const note = notesMap.get(pId);
      const source = note ? sourcesMap.get(note.sourceId) : null;
      refs.push({
        id: pId,
        noteId: pId,
        lens: 'packaging',
        vaultType: 'packaging',
        title: note?.title || (note?.why ? note.why.slice(0, 48) + '...' : pId),
        why: note?.why || '',
        tags: note?.tags || [],
        sourceId: note?.sourceId || '',
        sourceTitle: source?.title || source?.topic || ''
      });
    }

    this.selectedReferences = refs;
  }

  /**
   * Handles store notification
   */
  handleStoreUpdated() {
    if (this._isInternalDispatch) return;
    if (this._hasExplicitInitialReferences) return;

    const state = getState();
    if (!state || !state.remixSelection) return;

    const currentIds = new Set(this.selectedReferences.map(r => r.id || r.noteId));
    const storeContent = state.remixSelection.content || [];
    const storePackaging = state.remixSelection.packaging || [];
    const storeAll = [...storeContent, ...storePackaging];

    const changed = storeAll.length !== currentIds.size || storeAll.some(id => !currentIds.has(id));
    if (changed) {
      this.syncFromStore();
      this.updateUI();
    }
  }

  /**
   * Removes a chip from the basket and unchecks it in the picker
   * @param {string} noteId 
   */
  removeReference(noteId) {
    if (!noteId) return;

    const removedItem = this.selectedReferences.find(r => (r.id || r.noteId) === noteId);
    const itemLens = removedItem ? (removedItem.vaultType || removedItem.lens) : null;

    this.selectedReferences = this.selectedReferences.filter(r => (r.id || r.noteId) !== noteId);

    // Sync with central store safely
    try {
      this._isInternalDispatch = true;
      if (itemLens === 'content' || itemLens === 'packaging') {
        dispatch({
          type: 'REMOVE_REMIX_INGREDIENT',
          payload: { lens: itemLens, noteId }
        });
      } else {
        const state = getState();
        const content = (state.remixSelection?.content || []).filter(id => id !== noteId);
        const packaging = (state.remixSelection?.packaging || []).filter(id => id !== noteId);
        dispatch({
          type: 'SET_REMIX_SELECTION',
          payload: {
            content,
            packaging,
            referenceIds: this.selectedReferences.map(r => r.id || r.noteId)
          }
        });
      }
    } catch (e) {
    } finally {
      this._isInternalDispatch = false;
    }

    // Uncheck in picker DOM if active
    if (typeof document !== 'undefined') {
      const pickerCheckboxes = document.querySelectorAll(
        `#pick-${noteId}, input[type="checkbox"][data-note-id="${noteId}"], .picker-checkbox[data-note-id="${noteId}"]`
      );
      pickerCheckboxes.forEach(cb => {
        cb.checked = false;
        const row = cb.closest('.picker-item-row');
        if (row) {
          row.classList.remove('selected');
        }
      });

      // Also dispatch a custom event for any listening picker controllers
      document.dispatchEvent(new CustomEvent('remix-ingredient-removed', {
        detail: { noteId, lens: itemLens }
      }));
    }

    if (typeof this.onSelectionChanged === 'function') {
      this.onSelectionChanged(this.selectedReferences);
    }

    this.updateUI();
  }

  /**
   * Reorders items in basket and persists change to Central Store
   * @param {Array<string>} orderedIds 
   */
  reorderReferences(orderedIds) {
    if (!Array.isArray(orderedIds)) return;
    const refMap = new Map(this.selectedReferences.map(r => [r.id || r.noteId, r]));
    const reordered = [];

    for (const id of orderedIds) {
      if (refMap.has(id)) {
        reordered.push(refMap.get(id));
      }
    }

    // Keep any remaining references not explicitly mentioned
    for (const ref of this.selectedReferences) {
      const id = ref.id || ref.noteId;
      if (!orderedIds.includes(id)) {
        reordered.push(ref);
      }
    }

    this.selectedReferences = reordered;

    // Persist new order into central store remixSelection
    try {
      this._isInternalDispatch = true;
      const content = this.selectedReferences
        .filter(r => (r.vaultType || r.lens) === 'content' || (r.vaultType || r.lens) === 'both')
        .map(r => r.id || r.noteId);
      const packaging = this.selectedReferences
        .filter(r => (r.vaultType || r.lens) === 'packaging' || (r.vaultType || r.lens) === 'both')
        .map(r => r.id || r.noteId);

      dispatch({
        type: 'SET_REMIX_SELECTION',
        payload: {
          content,
          packaging,
          referenceIds: this.selectedReferences.map(r => r.id || r.noteId)
        }
      });
    } catch (e) {
    } finally {
      this._isInternalDispatch = false;
    }

    if (typeof this.onSelectionChanged === 'function') {
      this.onSelectionChanged(this.selectedReferences);
    }

    this.updateUI();
  }

  /**
   * Counts selected references split by lens
   * @returns {{ contentCount: number, packagingCount: number, total: number }}
   */
  getCounts() {
    let contentCount = 0;
    let packagingCount = 0;

    for (const ref of this.selectedReferences) {
      const lens = ref.vaultType || ref.lens;
      if (lens === 'content') contentCount++;
      else if (lens === 'packaging') packagingCount++;
      else if (lens === 'both') {
        contentCount++;
        packagingCount++;
      }
    }

    return {
      contentCount,
      packagingCount,
      total: this.selectedReferences.length
    };
  }

  /**
   * Identifies if multiple chips share the exact same sourceId (A11)
   * This handles the requirement: Source เดียวกันที่เป็น Both เลือกได้ทั้งสอง lens (C(X)+P(X))
   * และชิปแสดงว่ามาจาก source เดียวกัน
   * @returns {Set<string>} Set of sourceIds with multiple lenses in basket
   */
  getSharedSourceIds() {
    const sourceCount = new Map();
    for (const ref of this.selectedReferences) {
      const sId = ref.sourceId || ref.id;
      if (sId) {
        sourceCount.set(sId, (sourceCount.get(sId) || 0) + 1);
      }
    }

    const shared = new Set();
    for (const [sId, count] of sourceCount.entries()) {
      if (count > 1) shared.add(sId);
    }
    return shared;
  }

  /**
   * Renders the ingredient chips inside #basket-chips-list
   */
  renderChips() {
    if (typeof document === 'undefined') return;

    const chipsList = document.getElementById('basket-chips-list');
    if (!chipsList) return;

    const tmpl = document.getElementById('tmpl-basket-chip');
    chipsList.innerHTML = '';

    if (this.selectedReferences.length === 0) {
      const hint = document.createElement('span');
      hint.className = 'empty-basket-hint';
      hint.id = 'empty-basket-hint';
      hint.textContent = 'ยังไม่ได้เลือกวัตถุดิบ';
      chipsList.appendChild(hint);
      return;
    }

    const sharedSourceIds = this.getSharedSourceIds();

    this.selectedReferences.forEach((ref, index) => {
      const id = ref.id || ref.noteId || `note-${index}`;
      const lens = ref.vaultType || ref.lens || 'content';
      const isShared = (ref.sourceId && sharedSourceIds.has(ref.sourceId)) || sharedSourceIds.has(id);

      let chipEl;
      if (tmpl && tmpl.content) {
        const clone = tmpl.content.cloneNode(true);
        chipEl = clone.querySelector('.ingredient-chip');
      } else {
        chipEl = document.createElement('div');
        chipEl.className = 'ingredient-chip';
      }

      chipEl.id = `chip-${id}`;
      chipEl.dataset.testid = `chip-${id}`;
      chipEl.dataset.noteId = id;
      chipEl.dataset.lens = lens;
      chipEl.classList.add(`chip-${lens}`);
      chipEl.setAttribute('draggable', 'true');
      chipEl.setAttribute('role', 'listitem');
      chipEl.setAttribute('tabindex', '0');

      // Lens Tag
      const lensTag = chipEl.querySelector('.chip-lens-tag');
      if (lensTag) {
        lensTag.textContent = lens === 'content' ? 'Content' : 'Packaging';
      }

      // Title
      const titleEl = chipEl.querySelector('.chip-title');
      if (titleEl) {
        titleEl.textContent = ref.title || ref.why || id;
      }

      // Shared Source Badge (A11)
      const bothBadge = chipEl.querySelector('.both-source-badge');
      if (bothBadge) {
        if (isShared) {
          bothBadge.hidden = false;
          bothBadge.title = 'วัตถุดิบนี้มาจากคลิปเดียวกับอีก Lens หนึ่งในตะกร้า';
        } else {
          bothBadge.hidden = true;
        }
      }

      // Drag Handle / Drag Events
      this._attachDragEvents(chipEl, id);

      // Preview Button
      const btnPreview = chipEl.querySelector('.btn-preview-chip');
      if (btnPreview) {
        btnPreview.setAttribute('data-note-id', id);
        btnPreview.setAttribute('aria-label', `ดูตัวอย่าง ${ref.title || id}`);
        btnPreview.addEventListener('click', (e) => {
          e.stopPropagation();
          this.showPreview(id);
        });
      }

      // Remove Button
      const btnRemove = chipEl.querySelector('.btn-remove-chip');
      if (btnRemove) {
        btnRemove.setAttribute('data-note-id', id);
        btnRemove.setAttribute('aria-label', `นำ ${ref.title || id} ออกจากตะกร้า`);
        btnRemove.addEventListener('click', (e) => {
          e.stopPropagation();
          this.removeReference(id);
        });
      }

      chipsList.appendChild(chipEl);
    });
  }

  /**
   * Attaches drag-and-drop reordering events to a chip element
   * @private
   */
  _attachDragEvents(chipEl, noteId) {
    chipEl.addEventListener('dragstart', (e) => {
      this._draggedNoteId = noteId;
      chipEl.classList.add('is-dragging');
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', noteId);
      }
    });

    chipEl.addEventListener('dragend', () => {
      this._draggedNoteId = null;
      chipEl.classList.remove('is-dragging');
      const allChips = document.querySelectorAll('.ingredient-chip');
      allChips.forEach(c => c.classList.remove('drag-over'));
    });

    chipEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'move';
      }
      chipEl.classList.add('drag-over');
    });

    chipEl.addEventListener('dragleave', () => {
      chipEl.classList.remove('drag-over');
    });

    chipEl.addEventListener('drop', (e) => {
      e.preventDefault();
      chipEl.classList.remove('drag-over');
      const sourceId = this._draggedNoteId || (e.dataTransfer ? e.dataTransfer.getData('text/plain') : null);
      const targetId = noteId;

      if (!sourceId || sourceId === targetId) return;

      const currentOrder = this.selectedReferences.map(r => r.id || r.noteId);
      const sourceIndex = currentOrder.indexOf(sourceId);
      const targetIndex = currentOrder.indexOf(targetId);

      if (sourceIndex === -1 || targetIndex === -1) return;

      currentOrder.splice(sourceIndex, 1);
      currentOrder.splice(targetIndex, 0, sourceId);

      this.reorderReferences(currentOrder);
    });
  }

  /**
   * Shows detailed modal preview of an ingredient
   * @param {string} noteId 
   */
  showPreview(noteId) {
    if (typeof document === 'undefined') return;

    const modal = document.getElementById('ingredient-preview-modal');
    if (!modal) return;

    let note = this.selectedReferences.find(r => (r.id || r.noteId) === noteId);

    // Fallback to store if not fully populated
    if (!note || !note.why) {
      try {
        const state = getState();
        const found = (state.savedNotes || []).find(n => n.id === noteId);
        if (found) note = { ...note, ...found };
      } catch (e) {}
    }

    if (!note) return;

    const card = modal.querySelector('.preview-modal-card');
    const lensBadge = document.getElementById('preview-lens-badge');
    const sourceBadge = document.getElementById('preview-source-badge');
    const titleEl = document.getElementById('preview-modal-title');
    const whyEl = document.getElementById('preview-founder-why');
    const tagsList = document.getElementById('preview-tags-list');
    const sourceMeta = document.getElementById('preview-source-meta');

    const lens = note.vaultType || note.lens || 'content';
    const isShared = (note.sourceId && this.getSharedSourceIds().has(note.sourceId)) || this.getSharedSourceIds().has(note.id || noteId);

    if (card) {
      card.classList.toggle('lens-packaging', lens === 'packaging');
    }

    if (lensBadge) {
      lensBadge.textContent = lens === 'content' ? 'Content: สาระหลัก' : 'Packaging: กลวิธีเล่า';
    }

    if (sourceBadge) {
      sourceBadge.hidden = !isShared;
    }

    if (titleEl) {
      titleEl.textContent = note.title || noteId;
    }

    if (whyEl) {
      whyEl.textContent = note.why || 'ไม่มีบันทึกเหตุผลที่เลือก';
    }

    if (tagsList) {
      tagsList.innerHTML = '';
      const tags = Array.isArray(note.tags) ? note.tags : [];
      tags.forEach(t => {
        const span = document.createElement('span');
        span.className = 'preview-tag-pill font-num';
        span.textContent = t;
        tagsList.appendChild(span);
      });
    }

    if (sourceMeta) {
      sourceMeta.textContent = note.sourceTitle ? `จากคลิป: ${note.sourceTitle}` : (note.sourceId ? `Source ID: ${note.sourceId}` : '');
    }

    modal.hidden = false;

    // Focus close button
    const btnClose = document.getElementById('btn-close-preview');
    if (btnClose) btnClose.focus();
  }

  /**
   * Closes ingredient preview modal
   */
  closePreview() {
    if (typeof document === 'undefined') return;
    const modal = document.getElementById('ingredient-preview-modal');
    if (modal) {
      modal.hidden = true;
    }
  }

  /**
   * Updates DOM counters, gating states, and chip rendering
   */
  updateUI() {
    if (typeof document === 'undefined') return;

    const counts = this.getCounts();
    const canProceed = this.canContinue(counts.contentCount);

    const btnContinue = document.getElementById('btn-continue-to-remix');
    const hintNeedContent = document.getElementById('hint-need-content');
    const countContentEl = document.getElementById('count-content-basket');
    const countPackagingEl = document.getElementById('count-packaging-basket');

    if (btnContinue) {
      btnContinue.disabled = !canProceed;
      btnContinue.setAttribute('aria-disabled', String(!canProceed));
    }

    if (hintNeedContent) {
      hintNeedContent.hidden = canProceed;
    }

    if (countContentEl) {
      countContentEl.textContent = `Content (${counts.contentCount})`;
    }

    if (countPackagingEl) {
      countPackagingEl.textContent = `Packaging (${counts.packagingCount})`;
    }

    this.renderChips();
  }

  /**
   * Handles continue click to navigate to S07 Remix Workspace
   */
  handleContinue() {
    const counts = this.getCounts();
    if (!this.canContinue(counts.contentCount)) return;

    if (typeof this.onContinue === 'function') {
      this.onContinue(this.selectedReferences);
    } else if (router && typeof router.navigate === 'function') {
      router.navigate('remix-workspace');
    }
  }

  /**
   * Binds UI events
   */
  bindEvents() {
    if (typeof document === 'undefined') return;

    const btnContinue = document.getElementById('btn-continue-to-remix');
    if (btnContinue) {
      btnContinue.addEventListener('click', () => {
        this.handleContinue();
      });
    }

    const btnClosePreview = document.getElementById('btn-close-preview');
    const previewBackdrop = document.getElementById('preview-modal-backdrop');

    if (btnClosePreview) {
      btnClosePreview.addEventListener('click', () => this.closePreview());
    }

    if (previewBackdrop) {
      previewBackdrop.addEventListener('click', () => this.closePreview());
    }

    // Keyboard support (Escape to close preview)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closePreview();
      }
    });
  }

  /**
   * Cleans up listeners
   */
  destroy() {
    if (typeof this._unsubscribeStore === 'function') {
      this._unsubscribeStore();
    }
  }
}

// Alias for backwards compatibility
export { IngredientBarController as IngredientBasketController };
