/**
 * ==============================================================================
 * MEW CONTENT OS — S06 Remix Reference Picker Controller (Topic T19)
 * Theme: mewteetawat.com V6.3
 * 100% Pure Client-Side JavaScript (Vanilla ES6+)
 * Zero Server Dependencies · Zero Fake Metrics · Accessible WCAG AA/AAA UI
 * ==============================================================================
 */

import { getState, dispatch } from './store.js';
import { SAMPLE_SAVED_NOTES, SAMPLE_SOURCES } from './sample-data.js';

export class RemixPickerController {
  /**
   * Initializes the Two-Column Remix Reference Picker Controller
   * Handles two primary entry paths:
   * 1. 'Start Remix' from Dashboard: starts with empty basket (mode: 'start')
   * 2. 'Use in Remix' from Vault: starts with that reference note pre-selected (mode: 'use-in-remix')
   * 
   * Strict Rule: Absolutely NO automatic or randomized selections.
   * AI Recommendations are 100% optional and require manual user opt-in.
   * 
   * @param {Object} options 
   * @param {HTMLElement|string} [options.rootId] Root container or selector
   * @param {'start'|'use-in-remix'|'default'} [options.mode='default'] Entry path mode
   * @param {Array<string>|string} [options.initialSelection] Initial note IDs to pick
   * @param {Array<Object>} [options.references] Custom reference notes list
   * @param {Function} [options.onSelectionChange] Callback on selection change
   * @param {Function} [options.onPreview] Callback when previewing WHY
   */
  constructor(options = {}) {
    this.root = typeof options.rootId === 'string'
      ? (typeof document !== 'undefined' ? document.querySelector(options.rootId) : null)
      : (options.rootId || (typeof document !== 'undefined' ? document.getElementById('remix-picker-root') : null));

    this.mode = options.mode || 'default';
    this.onSelectionChange = options.onSelectionChange || null;
    this.onPreview = options.onPreview || null;
    this.contentQuery = '';
    this.packagingQuery = '';
    this.lastFocusedElement = null;

    // Load available references (from options, store savedNotes, or sample fallback)
    this.references = this._resolveReferences(options.references);

    // Initialize selection according to entry path
    this.selectedIds = new Set();
    this._initializeSelection(options);

    // Bind DOM events if in browser
    if (typeof document !== 'undefined' && this.root) {
      this.init();
    }
  }

  /**
   * Resolves reference list from options, store, or sample data
   * @private
   */
  _resolveReferences(customRefs) {
    if (Array.isArray(customRefs) && customRefs.length > 0) {
      return customRefs;
    }

    try {
      const state = getState();
      if (state && Array.isArray(state.savedNotes) && state.savedNotes.length > 0) {
        return state.savedNotes.map(note => {
          const src = (state.sources || []).find(s => s.id === note.sourceId) || {};
          return {
            id: note.id,
            sourceId: note.sourceId,
            vaultType: note.lens,
            lens: note.lens,
            title: src.title || note.id,
            creator: src.creator || 'Creator',
            founderWhy: note.why || '',
            why: note.why || '',
            tags: note.tags || src.tags || [],
            sourceUrl: src.url || ''
          };
        });
      }
    } catch (e) {
      // Safe fallback
    }

    // Default sample fallback
    return (SAMPLE_SAVED_NOTES || []).map(note => {
      const src = (SAMPLE_SOURCES || []).find(s => s.id === note.sourceId) || {};
      return {
        id: note.id,
        sourceId: note.sourceId,
        vaultType: note.lens,
        lens: note.lens,
        title: src.title || note.id,
        creator: src.creator || 'Creator',
        founderWhy: note.why || '',
        why: note.why || '',
        tags: note.tags || src.tags || [],
        sourceUrl: src.url || ''
      };
    });
  }

  /**
   * Initializes selection based on entry mode:
   * - 'start': Empty basket (from Dashboard)
   * - 'use-in-remix': Contains specific reference from Vault
   * - default: Uses options.initialSelection || []
   * @private
   */
  _initializeSelection(options) {
    if (options.initialSelection) {
      const initial = Array.isArray(options.initialSelection)
        ? options.initialSelection
        : [options.initialSelection];
      this.selectedIds = new Set(initial.filter(Boolean));
      this._syncStore();
      return;
    }

    if (options.mode === 'use-in-remix') {
      try {
        const state = getState();
        if (state && state.remixSelection) {
          const contentIds = Array.isArray(state.remixSelection.content) ? state.remixSelection.content : [];
          const packagingIds = Array.isArray(state.remixSelection.packaging) ? state.remixSelection.packaging : [];
          const combined = [...contentIds, ...packagingIds];
          this.selectedIds = new Set(combined);
          return;
        }
      } catch (e) {}
    }

    // Default: Empty selection (e.g. Start Remix or fresh instance)
    this.selectedIds = new Set();
  }

  /**
   * Toggles selection state of a reference note
   * Allows unlimited selections without enforcing a 1:1 ratio.
   * Ticking immediately dispatches state change to the store.
   * 
   * @param {string} noteId 
   * @param {'content'|'packaging'} [lens] 
   * @returns {boolean} Whether item is now selected
   */
  toggleSelection(noteId, lens) {
    if (!noteId) return false;

    const isNowSelected = !this.selectedIds.has(noteId);

    if (isNowSelected) {
      this.selectedIds.add(noteId);
    } else {
      this.selectedIds.delete(noteId);
    }

    // Determine lens if not provided
    const resolvedLens = lens || this._getLensForId(noteId);

    // Sync with central store immediately
    this._syncStore(noteId, resolvedLens, isNowSelected);

    // Update DOM if browser
    if (typeof document !== 'undefined') {
      this._updateItemDOM(noteId, isNowSelected);
      this.updateCounters(this.references);
    }

    // Trigger callback
    if (typeof this.onSelectionChange === 'function') {
      this.onSelectionChange(Array.from(this.selectedIds));
    }

    return isNowSelected;
  }

  /**
   * Checks if an item is selected
   * @param {string} noteId 
   * @returns {boolean}
   */
  isSelected(noteId) {
    return this.selectedIds.has(noteId);
  }

  /**
   * Adds an item to selection
   * @param {string} noteId 
   * @param {'content'|'packaging'} [lens] 
   */
  addSelection(noteId, lens) {
    if (!this.selectedIds.has(noteId)) {
      this.toggleSelection(noteId, lens);
    }
  }

  /**
   * Removes an item from selection
   * @param {string} noteId 
   * @param {'content'|'packaging'} [lens] 
   */
  removeSelection(noteId, lens) {
    if (this.selectedIds.has(noteId)) {
      this.toggleSelection(noteId, lens);
    }
  }

  /**
   * Clears all selections
   */
  clearSelection() {
    this.selectedIds.clear();

    try {
      dispatch({
        type: 'SET_REMIX_SELECTION',
        payload: {
          content: [],
          packaging: [],
          referenceIds: []
        }
      });
      dispatch({ type: 'CLEAR_REMIX_SELECTION' });
    } catch (e) {}

    if (typeof document !== 'undefined') {
      const allCheckboxes = (this.root || document).querySelectorAll('.picker-checkbox');
      allCheckboxes.forEach(cb => {
        cb.checked = false;
      });

      const allRows = (this.root || document).querySelectorAll('.picker-item-row');
      allRows.forEach(row => {
        row.classList.remove('selected');
      });

      this.updateCounters(this.references);
    }

    if (typeof this.onSelectionChange === 'function') {
      this.onSelectionChange([]);
    }
  }

  /**
   * Resolves lens ('content'|'packaging') for a note ID
   * @private
   */
  _getLensForId(noteId) {
    const found = this.references.find(r => r.id === noteId);
    if (found) {
      return found.vaultType || found.lens || 'content';
    }
    if (noteId.startsWith('p') || noteId.includes('-p') || noteId.includes('packaging')) {
      return 'packaging';
    }
    return 'content';
  }

  /**
   * Syncs current selection to Central Store
   * @private
   */
  _syncStore() {
    try {
      const content = [];
      const packaging = [];

      for (const id of this.selectedIds) {
        const itemLens = this._getLensForId(id);
        if (itemLens === 'packaging') {
          packaging.push(id);
        } else {
          content.push(id);
        }
      }

      dispatch({
        type: 'SET_REMIX_SELECTION',
        payload: {
          content,
          packaging,
          referenceIds: Array.from(this.selectedIds)
        }
      });
    } catch (e) {
      // Safe fallback if dispatch is mocked or absent
    }
  }

  /**
   * Updates DOM attributes of an individual item row
   * @private
   */
  _updateItemDOM(noteId, isSelected) {
    const rootEl = this.root || document;
    const checkbox = rootEl.querySelector(`#pick-${noteId}`) || rootEl.querySelector(`[data-note-id="${noteId}"] input[type="checkbox"]`);
    if (checkbox) {
      checkbox.checked = isSelected;
    }

    const row = rootEl.querySelector(`[data-note-id="${noteId}"]`);
    if (row) {
      if (isSelected) {
        row.classList.add('selected');
      } else {
        row.classList.remove('selected');
      }
    }
  }

  /**
   * Filters references for a specific column based on search query
   * @param {Array<Object>} references 
   * @param {'content'|'packaging'} lens 
   * @returns {Array<Object>}
   */
  filterList(references, lens) {
    const list = Array.isArray(references) && references.length > 0 ? references : this.references;
    if (!Array.isArray(list)) return [];

    const rawQuery = (lens === 'content' ? this.contentQuery : this.packagingQuery) || '';
    const query = rawQuery.toLowerCase().trim();

    return list.filter(ref => {
      // Must match lens or be both
      const refLens = ref.vaultType || ref.lens;
      if (refLens !== lens && refLens !== 'both') return false;

      if (!query) return true;

      const title = (ref.title || '').toLowerCase();
      const creator = (ref.creator || '').toLowerCase();
      const why = (ref.founderWhy || ref.why || '').toLowerCase();
      const tags = Array.isArray(ref.tags) ? ref.tags.join(' ').toLowerCase() : '';

      return title.includes(query) || creator.includes(query) || why.includes(query) || tags.includes(query);
    });
  }

  /**
   * Counts currently selected items split by lens
   * @param {Array<Object>} allReferences 
   * @returns {{ contentCount: number, packagingCount: number, total: number }}
   */
  getSelectionCounts(allReferences = []) {
    let contentCount = 0;
    let packagingCount = 0;

    const list = allReferences.length > 0 ? allReferences : this.references;
    const refMap = new Map((list || []).map(r => [r.id, r]));

    for (const id of this.selectedIds) {
      const ref = refMap.get(id);
      if (ref) {
        const lens = ref.vaultType || ref.lens;
        if (lens === 'content') {
          contentCount++;
        } else if (lens === 'packaging') {
          packagingCount++;
        } else if (lens === 'both') {
          contentCount++;
          packagingCount++;
        } else {
          contentCount++;
        }
      } else {
        // Fallback guess based on id
        if (id.startsWith('p') || id.includes('-p') || id.includes('packaging')) {
          packagingCount++;
        } else {
          contentCount++;
        }
      }
    }

    return {
      contentCount,
      packagingCount,
      total: this.selectedIds.size
    };
  }

  /**
   * Updates DOM counter elements
   * @param {Array<Object>} allReferences 
   */
  updateCounters(allReferences = []) {
    if (typeof document === 'undefined') return;

    const counts = this.getSelectionCounts(allReferences);
    const contentCounterEl = document.getElementById('count-picked-content');
    const packagingCounterEl = document.getElementById('count-picked-packaging');

    if (contentCounterEl) {
      contentCounterEl.textContent = `เลือกแล้ว ${counts.contentCount} ชิ้น`;
    }
    if (packagingCounterEl) {
      packagingCounterEl.textContent = `เลือกแล้ว ${counts.packagingCount} ชิ้น`;
    }
  }

  /**
   * Displays the WHY/ที่มา preview modal for an item
   * @param {string} noteId 
   */
  showPreview(noteId) {
    if (typeof document === 'undefined') return;

    const ref = this.references.find(r => r.id === noteId);
    if (!ref) return;

    this.lastFocusedElement = document.activeElement;

    const modal = document.getElementById('picker-preview-modal');
    if (!modal) return;

    const titleEl = document.getElementById('preview-item-title');
    const creatorEl = document.getElementById('preview-item-creator');
    const whyEl = document.getElementById('preview-item-why');
    const borrowEl = document.getElementById('preview-item-borrow');
    const tagsEl = document.getElementById('preview-item-tags');
    const lensBadge = document.getElementById('preview-lens-badge');
    const confirmBtn = document.getElementById('btn-confirm-toggle-pick');

    if (titleEl) titleEl.textContent = ref.title || 'Untitled Reference';
    if (creatorEl) creatorEl.textContent = `โดย ${ref.creator || 'Creator'}`;
    if (whyEl) whyEl.textContent = ref.founderWhy || ref.why || 'ไม่มีบันทึก Founder WHY';

    const isPackaging = (ref.vaultType || ref.lens) === 'packaging';
    if (lensBadge) {
      lensBadge.textContent = isPackaging ? 'Packaging Vault (HOW)' : 'Content Vault (WHAT)';
      lensBadge.className = `badge-pill ${isPackaging ? 'violet' : 'coral'}`;
    }

    if (borrowEl) {
      borrowEl.textContent = isPackaging
        ? (ref.howToBorrow || 'นำเทคนิคและจังหวะการเล่ามาปรับใช้กับบริบทของเรา')
        : (ref.whatToBorrow || 'นำแก่นคิดและสาระหลักมาต่อยอดเป็นคอนเทนต์ใหม่');
    }

    if (tagsEl) {
      tagsEl.innerHTML = '';
      const tags = Array.isArray(ref.tags) ? ref.tags : [];
      tags.forEach(t => {
        const span = document.createElement('span');
        span.className = 'item-tag-pill';
        span.textContent = t;
        tagsEl.appendChild(span);
      });
    }

    if (confirmBtn) {
      const isSelected = this.isSelected(noteId);
      confirmBtn.textContent = isSelected ? 'นำออกจากตะกร้า Remix' : 'เลือกชิ้นนี้เข้าตะกร้า Remix';
      confirmBtn.className = isSelected ? 'btn-pill btn-ghost' : 'btn-pill btn-primary';
      confirmBtn.onclick = () => {
        this.toggleSelection(noteId, ref.vaultType || ref.lens);
        this.closePreview();
      };
    }

    modal.hidden = false;
    modal.removeAttribute('hidden');

    const closeBtn = document.getElementById('btn-close-preview');
    if (closeBtn) closeBtn.focus();

    if (typeof this.onPreview === 'function') {
      this.onPreview(ref);
    }
  }

  /**
   * Closes the preview modal
   */
  closePreview() {
    if (typeof document === 'undefined') return;

    const modal = document.getElementById('picker-preview-modal');
    if (modal) {
      modal.hidden = true;
      modal.setAttribute('hidden', '');
    }

    if (this.lastFocusedElement && typeof this.lastFocusedElement.focus === 'function') {
      this.lastFocusedElement.focus();
    }
  }

  /**
   * Renders reference lists dynamically into the two columns
   * @param {Array<Object>} [references] 
   */
  render(references) {
    if (typeof document === 'undefined') return;

    if (Array.isArray(references)) {
      this.references = references;
    }

    const contentCol = document.getElementById('list-picker-content');
    const packagingCol = document.getElementById('list-picker-packaging');

    if (contentCol) {
      const contentItems = this.filterList(this.references, 'content');
      this._renderColumnItems(contentCol, contentItems, 'content');
    }

    if (packagingCol) {
      const packagingItems = this.filterList(this.references, 'packaging');
      this._renderColumnItems(packagingCol, packagingItems, 'packaging');
    }

    this.updateCounters(this.references);
  }

  /**
   * Renders items for a column
   * @private
   */
  _renderColumnItems(container, items, lens) {
    container.innerHTML = '';

    if (items.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'picker-empty-state';
      emptyDiv.textContent = 'ไม่พบวัตถุดิบที่ตรงกับคำค้นหา';
      emptyDiv.style.padding = '24px';
      emptyDiv.style.textAlign = 'center';
      emptyDiv.style.color = 'var(--muted-text)';
      emptyDiv.style.fontSize = '0.9rem';
      container.appendChild(emptyDiv);
      return;
    }

    const tmpl = document.getElementById('tmpl-picker-item');

    items.forEach(item => {
      let rowEl;
      if (tmpl && tmpl.content) {
        rowEl = tmpl.content.firstElementChild.cloneNode(true);
      } else {
        rowEl = document.createElement('article');
        rowEl.className = 'picker-item-row';
        rowEl.innerHTML = `
          <div class="picker-check-wrap">
            <input type="checkbox" class="picker-checkbox" />
          </div>
          <div class="picker-item-body">
            <div class="item-meta-row">
              <span class="item-creator"></span>
              <span class="item-tag-pill"></span>
            </div>
            <h4 class="item-title"></h4>
            <p class="item-why-snippet"></p>
          </div>
          <div class="picker-item-actions">
            <button type="button" class="btn-pill btn-ghost btn-sm btn-preview">
              <span>ดู WHY/ที่มา</span>
            </button>
          </div>
        `;
      }

      rowEl.dataset.noteId = item.id;
      rowEl.dataset.lens = lens;

      const checkbox = rowEl.querySelector('.picker-checkbox');
      if (checkbox) {
        checkbox.id = `pick-${item.id}`;
        checkbox.name = `pick-${item.id}`;
        checkbox.dataset.testid = `pick-${item.id}`;
        checkbox.dataset.noteId = item.id;
        checkbox.dataset.lens = lens;
        checkbox.checked = this.isSelected(item.id);
        checkbox.setAttribute('aria-label', `เลือก ${item.title || item.id} เข้าตะกร้า Remix`);

        checkbox.addEventListener('change', () => {
          this.toggleSelection(item.id, lens);
        });
      }

      if (this.isSelected(item.id)) {
        rowEl.classList.add('selected');
      }

      // Title & Creator
      const titleEl = rowEl.querySelector('.item-title');
      if (titleEl) titleEl.textContent = item.title || item.id;

      const creatorEl = rowEl.querySelector('.item-creator');
      if (creatorEl) creatorEl.textContent = item.creator || 'Creator';

      // WHY Snippet
      const whyEl = rowEl.querySelector('.item-why-snippet');
      if (whyEl) whyEl.textContent = item.founderWhy || item.why || '';

      // Tag
      const tagEl = rowEl.querySelector('.item-tag-pill');
      if (tagEl) {
        const firstTag = Array.isArray(item.tags) && item.tags.length > 0 ? item.tags[0] : '';
        if (firstTag) {
          tagEl.textContent = firstTag;
        } else {
          tagEl.remove();
        }
      }

      // Preview Button
      const previewBtn = rowEl.querySelector('.btn-preview');
      if (previewBtn) {
        previewBtn.id = `btn-preview-${item.id}`;
        previewBtn.dataset.testid = `btn-preview-${item.id}`;
        previewBtn.dataset.noteId = item.id;
        previewBtn.setAttribute('aria-label', `ดู WHY/ที่มา ของ ${item.title || item.id}`);
        previewBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.showPreview(item.id);
        });
      }

      // Clicking row toggles selection (except when clicking preview)
      rowEl.addEventListener('click', (e) => {
        if (e.target.closest('.btn-preview') || e.target.closest('.picker-checkbox')) {
          return;
        }
        this.toggleSelection(item.id, lens);
      });

      container.appendChild(rowEl);
    });
  }

  /**
   * Initializes event listeners for search inputs, buttons, and keyboard navigation
   */
  init() {
    if (typeof document === 'undefined') return;

    const rootEl = this.root || document;

    // Content Search Input
    const searchContent = rootEl.querySelector('#search-picker-content');
    if (searchContent) {
      searchContent.addEventListener('input', (e) => {
        this.contentQuery = e.target.value;
        const contentCol = rootEl.querySelector('#list-picker-content');
        if (contentCol) {
          const items = this.filterList(this.references, 'content');
          this._renderColumnItems(contentCol, items, 'content');
        }
      });
    }

    // Packaging Search Input
    const searchPackaging = rootEl.querySelector('#search-picker-packaging');
    if (searchPackaging) {
      searchPackaging.addEventListener('input', (e) => {
        this.packagingQuery = e.target.value;
        const packagingCol = rootEl.querySelector('#list-picker-packaging');
        if (packagingCol) {
          const items = this.filterList(this.references, 'packaging');
          this._renderColumnItems(packagingCol, items, 'packaging');
        }
      });
    }

    // Pre-rendered Checkboxes binding
    const checkboxes = rootEl.querySelectorAll('.picker-checkbox');
    checkboxes.forEach(cb => {
      const noteId = cb.dataset.noteId || cb.id.replace(/^pick-/, '');
      const lens = cb.dataset.lens || this._getLensForId(noteId);
      cb.checked = this.isSelected(noteId);

      const parentRow = cb.closest('.picker-item-row');
      if (parentRow && this.isSelected(noteId)) {
        parentRow.classList.add('selected');
      }

      cb.addEventListener('change', () => {
        this.toggleSelection(noteId, lens);
      });
    });

    // Pre-rendered Item Rows Click
    const itemRows = rootEl.querySelectorAll('.picker-item-row');
    itemRows.forEach(row => {
      const noteId = row.dataset.noteId;
      const lens = row.dataset.lens || this._getLensForId(noteId);
      row.addEventListener('click', (e) => {
        if (e.target.closest('.btn-preview') || e.target.closest('.picker-checkbox')) {
          return;
        }
        this.toggleSelection(noteId, lens);
      });
    });

    // Pre-rendered Preview Buttons
    const previewButtons = rootEl.querySelectorAll('.btn-preview');
    previewButtons.forEach(btn => {
      const noteId = btn.dataset.noteId || btn.id.replace(/^btn-preview-/, '');
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showPreview(noteId);
      });
    });

    // Preview Modal Close Buttons
    const closeButtons = rootEl.querySelectorAll('[data-action="close-preview"]');
    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.closePreview();
      });
    });

    // Modal Backdrop Click
    const modalBackdrop = rootEl.querySelector('#picker-preview-modal');
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) {
          this.closePreview();
        }
      });
    }

    // Keyboard Accessibility (Escape to close preview)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('picker-preview-modal');
        if (modal && !modal.hidden) {
          this.closePreview();
        }
      }
    });

    // Initial Counters update
    this.updateCounters(this.references);
  }
}
