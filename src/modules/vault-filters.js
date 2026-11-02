/**
 * ==============================================================================
 * MEW CONTENT OS — Vault Cards & Filters Controller (Topic T16)
 * Theme: mewteetawat.com V6.3 (Warm Stone, Coral, Violet & Deep Ink)
 * 100% Pure Client-Side JavaScript (Vanilla ES6+)
 * Zero Server Dependencies · Zero Fake Metrics · Accessible WCAG UI
 * ==============================================================================
 */

import { getState, dispatch } from './store.js';

export class VaultFiltersController {
  /**
   * Initializes the Vault Filters & Cards Controller
   * @param {Object} options 
   * @param {string|HTMLElement} [options.rootId]
   * @param {'content'|'packaging'} [options.activeVault='content']
   * @param {Function} [options.onSelectionChange]
   * @param {Function} [options.onFilterChange]
   * @param {Array<Object>} [options.references]
   */
  constructor(options = {}) {
    this.root = typeof options.rootId === 'string'
      ? (typeof document !== 'undefined' ? document.querySelector(options.rootId) : null)
      : (options.rootId || (typeof document !== 'undefined' ? document.getElementById('vault-filter-toolbar') : null));

    this.activeVault = options.activeVault || 'content'; // 'content' | 'packaging'
    this.filters = {
      search: '',
      topic: 'all',
      creator: 'all',
      tags: 'all',
      savedDate: 'all',
      hookType: 'all',
      structure: 'all',
      soundPacing: 'all'
    };

    this.toastTimer = null;
    this.onSelectionChange = options.onSelectionChange || null;
    this.onFilterChange = options.onFilterChange || null;
    this.references = Array.isArray(options.references) ? [...options.references] : [];

    if (typeof document !== 'undefined') {
      this.bindEvents();
      this.syncPackagingFiltersVisibility();
    }
  }

  /**
   * Sets the active vault tab ('content' or 'packaging')
   * @param {'content'|'packaging'} vaultType 
   */
  setActiveVault(vaultType) {
    if (vaultType !== 'content' && vaultType !== 'packaging') return;
    this.activeVault = vaultType;
    this.syncPackagingFiltersVisibility();
  }

  /**
   * Shows or hides packaging-specific filters based on the active vault
   */
  syncPackagingFiltersVisibility() {
    if (typeof document === 'undefined') return;
    const pkgFilters = document.getElementById('packaging-extra-filters');
    if (pkgFilters) {
      pkgFilters.hidden = this.activeVault !== 'packaging';
    }
  }

  /**
   * Updates a single filter state
   * @param {string} key 
   * @param {string} value 
   */
  setFilter(key, value) {
    if (key in this.filters) {
      this.filters[key] = value;
    }
  }

  /**
   * Clears all filters back to default values
   */
  clearFilters() {
    this.filters = {
      search: '',
      topic: 'all',
      creator: 'all',
      tags: 'all',
      savedDate: 'all',
      hookType: 'all',
      structure: 'all',
      soundPacing: 'all'
    };

    if (typeof document !== 'undefined') {
      const searchInput = document.getElementById('search-vault');
      if (searchInput) searchInput.value = '';

      const filterIds = [
        'filter-topic',
        'filter-creator',
        'filter-tags',
        'filter-saved-date',
        'filter-hook-type',
        'filter-structure',
        'filter-sound-pacing'
      ];

      filterIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = 'all';
      });
    }

    if (typeof this.onFilterChange === 'function') {
      this.onFilterChange(this.filters);
    }
  }

  /**
   * Filters a list of references based on current filter settings and active vault
   * @param {Array<Object>} references 
   * @returns {Array<Object>}
   */
  filterReferences(references) {
    const list = Array.isArray(references) ? references : this.references;
    if (!Array.isArray(list)) return [];

    return list.filter(ref => {
      // 1. Vault Type segregation: must match active tab strictly
      const refVault = ref.vaultType || ref.lens;
      if (refVault !== this.activeVault && refVault !== 'both') {
        return false;
      }

      // 2. Search query (matches title, subtitle, creator, tags, founderWhy, aiInsight)
      if (this.filters.search && this.filters.search.trim()) {
        const query = this.filters.search.toLowerCase().trim();
        const title = (ref.title || '').toLowerCase();
        const subtitle = (ref.subtitle || '').toLowerCase();
        const creator = (ref.creator || '').toLowerCase();
        const why = (ref.founderWhy || ref.why || '').toLowerCase();
        const ai = (ref.aiInsight || '').toLowerCase();
        const tags = Array.isArray(ref.tags) ? ref.tags.join(' ').toLowerCase() : '';

        const match = title.includes(query) ||
                      subtitle.includes(query) ||
                      creator.includes(query) ||
                      why.includes(query) ||
                      ai.includes(query) ||
                      tags.includes(query);
        if (!match) return false;
      }

      // 3. Filter Topic
      if (this.filters.topic && this.filters.topic !== 'all') {
        const refTopic = ref.topic || (ref.tags && ref.tags[0]) || '';
        if (refTopic.toLowerCase() !== this.filters.topic.toLowerCase()) return false;
      }

      // 4. Filter Creator
      if (this.filters.creator && this.filters.creator !== 'all') {
        if ((ref.creator || '').toLowerCase() !== this.filters.creator.toLowerCase()) return false;
      }

      // 5. Filter Tags
      if (this.filters.tags && this.filters.tags !== 'all') {
        const tags = Array.isArray(ref.tags) ? ref.tags.map(t => String(t).toLowerCase()) : [];
        if (!tags.includes(this.filters.tags.toLowerCase())) return false;
      }

      // 6. Filter Saved Date
      if (this.filters.savedDate && this.filters.savedDate !== 'all') {
        const savedTime = ref.savedAt || ref.createdAt;
        if (savedTime) {
          const date = new Date(savedTime);
          const now = new Date();
          const diffHours = (now - date) / (1000 * 60 * 60);
          if (this.filters.savedDate === 'today' && diffHours > 24) return false;
          if (this.filters.savedDate === 'week' && diffHours > 24 * 7) return false;
          if (this.filters.savedDate === 'month' && diffHours > 24 * 30) return false;
        }
      }

      // 7. Packaging Specific Filters
      if (this.activeVault === 'packaging') {
        if (this.filters.hookType && this.filters.hookType !== 'all') {
          const hook = (ref.hookType || '').toLowerCase();
          if (hook !== this.filters.hookType.toLowerCase()) return false;
        }
        if (this.filters.structure && this.filters.structure !== 'all') {
          const struct = (ref.structure || '').toLowerCase();
          if (struct !== this.filters.structure.toLowerCase()) return false;
        }
        if (this.filters.soundPacing && this.filters.soundPacing !== 'all') {
          const pacing = (ref.soundPacing || '').toLowerCase();
          if (pacing !== this.filters.soundPacing.toLowerCase()) return false;
        }
      }

      return true;
    });
  }

  /**
   * Adds reference to Remix basket in store and triggers toast without leaving page
   * @param {Object|string} referenceOrId 
   */
  handleUseInRemix(referenceOrId) {
    let refId = typeof referenceOrId === 'string' ? referenceOrId : (referenceOrId?.id || referenceOrId?.noteId);
    if (!refId) return;

    // Resolve lens
    let lens = this.activeVault;
    try {
      const state = typeof getState === 'function' ? getState() : null;
      if (state && Array.isArray(state.savedNotes)) {
        const note = state.savedNotes.find(n => n.id === refId || n.sourceId === refId);
        if (note && note.lens) {
          lens = note.lens;
        }
      }
    } catch (e) {
      // ignore
    }

    if (typeof referenceOrId === 'object' && (referenceOrId.lens || referenceOrId.vaultType)) {
      lens = referenceOrId.lens || referenceOrId.vaultType;
    }

    // Dispatch action to store
    try {
      if (typeof dispatch === 'function') {
        dispatch({
          type: 'ADD_REMIX_INGREDIENT',
          payload: { lens, noteId: refId }
        });
        dispatch({
          type: 'ADD_TO_REMIX_SELECTION',
          payload: { referenceId: refId, lens, noteId: refId }
        });
      }
    } catch (e) {
      // Store dispatch fallback
    }

    // Trigger toast notification without leaving the current screen
    this.showToast('toast-added-to-selection');

    if (typeof this.onSelectionChange === 'function') {
      this.onSelectionChange(refId);
    }
  }

  /**
   * Displays toast notification and auto-hides after duration
   * @param {string} toastId 
   */
  showToast(toastId = 'toast-added-to-selection') {
    if (typeof document === 'undefined') return;
    const toast = document.getElementById(toastId);
    if (!toast) return;

    toast.hidden = false;
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.hidden = true;
    }, 3500);
  }

  /**
   * Explicitly hides toast notification
   * @param {string} toastId 
   */
  hideToast(toastId = 'toast-added-to-selection') {
    if (typeof document === 'undefined') return;
    const toast = document.getElementById(toastId);
    if (toast) {
      toast.hidden = true;
    }
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }

  /**
   * Dynamically populates topic, creator, and tag filter options based on references
   * @param {Array<Object>} references 
   */
  populateFilterOptions(references) {
    if (typeof document === 'undefined') return;
    const items = Array.isArray(references) ? references : this.references;
    const currentVaultItems = items.filter(r => (r.vaultType || r.lens) === this.activeVault);

    const topics = new Set();
    const creators = new Set();
    const tags = new Set();

    currentVaultItems.forEach(item => {
      if (item.topic) topics.add(item.topic);
      if (item.creator) creators.add(item.creator);
      if (Array.isArray(item.tags)) {
        item.tags.forEach(t => tags.add(t));
      }
    });

    const populateSelect = (id, set, defaultText) => {
      const select = document.getElementById(id);
      if (!select) return;
      const currentVal = select.value;
      select.innerHTML = `<option value="all">${defaultText}</option>`;
      set.forEach(val => {
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = val;
        select.appendChild(opt);
      });
      if (set.has(currentVal)) {
        select.value = currentVal;
      }
    };

    populateSelect('filter-topic', topics, 'ทุกหัวข้อ');
    populateSelect('filter-creator', creators, 'ผู้สร้างทั้งหมด');
    populateSelect('filter-tags', tags, 'ทุกแท็ก');
  }

  /**
   * Renders reference cards into a target container
   * @param {Array<Object>} references 
   * @param {HTMLElement|string} [container] 
   */
  renderCards(references, container = null) {
    if (typeof document === 'undefined') return;
    const target = typeof container === 'string'
      ? document.querySelector(container)
      : (container || document.getElementById('vault-cards-grid'));

    if (!target) return;

    const items = this.filterReferences(references);
    const template = document.getElementById('tmpl-vault-card');

    if (!template) return;

    target.innerHTML = '';

    items.forEach(item => {
      const clone = template.content.cloneNode(true);
      const article = clone.querySelector('.vault-card');
      const noteId = item.noteId || item.id;

      if (article) {
        article.id = `vault-card-${noteId}`;
        article.setAttribute('data-note-id', noteId);
        article.classList.add(this.activeVault === 'packaging' ? 'violet-accent' : 'coral-accent');
      }

      const thumbnail = clone.querySelector('.card-thumbnail');
      if (thumbnail) {
        thumbnail.src = item.thumbnailUrl || (this.activeVault === 'content' ? 'assets/video_preview.png' : '');
        thumbnail.alt = item.title || 'Preview thumbnail';
      }

      const duration = clone.querySelector('.card-duration');
      if (duration) duration.textContent = item.duration || '1:00 นาที';

      const avatar = clone.querySelector('.creator-avatar');
      if (avatar) avatar.textContent = item.creatorAvatar || (item.creator ? item.creator.slice(0, 2).toUpperCase() : 'CR');

      const creator = clone.querySelector('.creator-name');
      if (creator) creator.textContent = item.creator || 'Creator';

      const savedDate = clone.querySelector('.saved-date');
      if (savedDate) savedDate.textContent = item.formattedDate || 'บันทึกเมื่อเร็วๆ นี้';

      const title = clone.querySelector('.card-title');
      if (title) title.textContent = item.title || 'Untitled Reference';

      const subtitle = clone.querySelector('.card-subtitle');
      if (subtitle) subtitle.textContent = item.subtitle || '';

      const tagsContainer = clone.querySelector('.card-tags-list');
      if (tagsContainer && Array.isArray(item.tags)) {
        item.tags.forEach(t => {
          const pill = document.createElement('span');
          pill.className = 'tag-pill';
          pill.textContent = t;
          tagsContainer.appendChild(pill);
        });
      }

      const whyText = clone.querySelector('.founder-why-text');
      if (whyText) whyText.textContent = item.founderWhy || item.why || 'บันทึกเหตุผลโดย Founder';

      const aiText = clone.querySelector('.ai-insight-text');
      if (aiText) aiText.textContent = item.aiInsight || 'สรุปย่อการวิเคราะห์';

      const sourceLink = clone.querySelector('.link-source');
      if (sourceLink) {
        sourceLink.href = item.sourceUrl || item.url || '#';
      }

      const remixBtn = clone.querySelector('.btn-use-in-remix');
      if (remixBtn) {
        remixBtn.setAttribute('data-id', noteId);
      }

      target.appendChild(clone);
    });
  }

  /**
   * Binds UI event listeners to controls
   */
  bindEvents() {
    if (typeof document === 'undefined') return;

    // Search input
    const searchInput = document.getElementById('search-vault');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.setFilter('search', e.target.value);
        if (typeof this.onFilterChange === 'function') {
          this.onFilterChange(this.filters);
        }
      });
    }

    // Filters row
    const filterIds = [
      { id: 'filter-topic', key: 'topic' },
      { id: 'filter-creator', key: 'creator' },
      { id: 'filter-tags', key: 'tags' },
      { id: 'filter-saved-date', key: 'savedDate' },
      { id: 'filter-hook-type', key: 'hookType' },
      { id: 'filter-structure', key: 'structure' },
      { id: 'filter-sound-pacing', key: 'soundPacing' }
    ];

    filterIds.forEach(({ id, key }) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', (e) => {
          this.setFilter(key, e.target.value);
          if (typeof this.onFilterChange === 'function') {
            this.onFilterChange(this.filters);
          }
        });
      }
    });

    // Clear filters button
    const btnClear = document.getElementById('btn-clear-filters');
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        this.clearFilters();
      });
    }

    // Delegated click handler for "Use in Remix" buttons
    const grid = document.getElementById('vault-cards-grid');
    if (grid) {
      grid.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-use-in-remix');
        if (btn) {
          e.preventDefault();
          const card = btn.closest('.vault-card');
          const noteId = btn.getAttribute('data-id') || card?.getAttribute('data-note-id') || card?.id?.replace('vault-card-', '');
          if (noteId) {
            this.handleUseInRemix(noteId);
          }
        }
      });
    }
  }
}
