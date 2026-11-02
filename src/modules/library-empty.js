/**
 * ==============================================================================
 * MEW CONTENT OS — Library Empty States Controller (Topic T17)
 * Theme: mewteetawat.com V6.3
 * 100% Pure Client-Side JavaScript (Vanilla ES6+)
 * Zero Server Dependencies · Zero Fake Metrics · Accessible WCAG UI
 * ==============================================================================
 */

import { getState, dispatch } from './store.js';
import { router } from './router.js';

export const SAMPLE_LIBRARY_REFERENCES = [
  {
    id: 'sample-content-1',
    sourceId: 'source-sample-1',
    vaultType: 'content',
    lens: 'content',
    title: 'Post and forget it',
    subtitle: 'ทำไมการปล่อยคอนเทนต์แล้วเลิกนั่งเฝ้ายอดวิว ถึงทำให้สร้างสรรค์งานที่ดีกว่าได้ในระยะยาว',
    creator: 'Mew Teetawat',
    creatorAvatar: 'MT',
    sourceUrl: 'https://youtube.com/watch?v=sample1',
    thumbnailUrl: '',
    duration: '2:15 นาที',
    tags: ['Mindset', 'Creator Economy', 'Creative Longevity'],
    founderWhy: 'ตรงกับปรัชญาของเรา: คอนเทนต์ที่ดีเกิดจากความสม่ำเสมอและปล่อยวาง ไม่ใช่การ refresh ดูยอดวิวทุก 5 นาที',
    why: 'ตรงกับปรัชญาของเรา: คอนเทนต์ที่ดีเกิดจากความสม่ำเสมอและปล่อยวาง ไม่ใช่การ refresh ดูยอดวิวทุก 5 นาที',
    aiInsight: 'แก่นความคิดมุ่งเน้น Decoupling creation from outcome validation',
    savedAt: '2026-10-31T09:00:00.000Z',
    createdAt: '2026-10-31T09:00:00.000Z'
  },
  {
    id: 'sample-packaging-1',
    sourceId: 'source-sample-2',
    vaultType: 'packaging',
    lens: 'packaging',
    title: 'The Ticking Clock',
    subtitle: 'เริ่มต้นด้วยเสียงนับถอยหลัง 5 วินาทีก่อนพูดประโยคแรก สร้าง retention สูงสุด',
    creator: 'Ali Abdaal',
    creatorAvatar: 'AA',
    sourceUrl: 'https://youtube.com/watch?v=sample2',
    thumbnailUrl: '',
    duration: '0:58 นาที',
    tags: ['Hook Technique', 'Pacing', 'Sound Design'],
    founderWhy: 'เทคนิค Sound Pacing ดีมาก การใช้จังหวะเคาะเวลานับถอยหลังเร่งความรู้สึก FOMO ของคนดู',
    why: 'เทคนิค Sound Pacing ดีมาก การใช้จังหวะเคาะเวลานับถอยหลังเร่งความรู้สึก FOMO ของคนดู',
    aiInsight: 'จังหวะโครงสร้างแบบ Sensory Hook ใช้ Metronome/Ticking clock sound',
    savedAt: '2026-10-31T10:00:00.000Z',
    createdAt: '2026-10-31T10:00:00.000Z'
  }
];

export class LibraryEmptyController {
  /**
   * @param {Object} options
   * @param {string|HTMLElement} [options.rootId] Root container id or element
   * @param {'content'|'packaging'} [options.activeVault='content'] Active vault tab
   * @param {Function} [options.onSampleLoaded] Callback when sample data is loaded
   * @param {Function} [options.onNavigateResearch] Callback when navigation to S01 is requested
   * @param {Function} [options.onClearFilters] Callback when filters are cleared
   */
  constructor(options = {}) {
    this.root = typeof options.rootId === 'string'
      ? (typeof document !== 'undefined' ? document.querySelector(options.rootId) : null)
      : (options.rootId || (typeof document !== 'undefined' ? document.getElementById('library-empty-states-root') : null));

    this.activeVault = options.activeVault || 'content';
    this.onSampleLoaded = options.onSampleLoaded || null;
    this.onNavigateResearch = options.onNavigateResearch || null;
    this.onClearFilters = options.onClearFilters || null;

    if (this.root) {
      this.bindEvents(this.root);
    }
  }

  /**
   * Binds click and keyboard handlers to action buttons in empty states
   * @param {HTMLElement} [container] 
   */
  bindEvents(container = this.root) {
    if (!container || typeof container.querySelectorAll !== 'function') return;

    // Research buttons -> S01
    const researchBtns = container.querySelectorAll('.btn-empty-research, [data-action="go-research"]');
    researchBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleGoResearch();
      });
    });

    // Sample data buttons -> Load sample safely without wiping user records
    const sampleBtns = container.querySelectorAll('.btn-empty-sample, [data-action="load-sample"]');
    sampleBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleLoadSample();
      });
    });

    // Clear filters button
    const clearBtn = container.querySelector('#btn-clear-empty-filter, .btn-clear-filter, [data-action="clear-filters"]');
    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleClearFilters();
      });
    }
  }

  /**
   * Sets the active vault tab ('content' | 'packaging')
   * @param {'content'|'packaging'} vault 
   */
  setActiveVault(vault) {
    if (vault === 'content' || vault === 'packaging') {
      this.activeVault = vault;
    }
  }

  /**
   * Evaluates and updates empty states visibility
   * Rule: Tab empty state appears ONLY when the total note count of that tab is strictly 0.
   * If total items > 0 but search/filter returned 0, show the no-results state.
   * 
   * @param {number} totalVaultItems Total items in current vault (unfiltered count)
   * @param {number} filteredItemsCount Items matching current search/filter
   * @param {boolean} isFiltered Whether any search/filter is actively applied
   */
  updateState(totalVaultItems, filteredItemsCount, isFiltered = false) {
    if (typeof document === 'undefined') return;

    const contentEmptyEl = document.getElementById('empty-content-vault');
    const packagingEmptyEl = document.getElementById('empty-packaging-vault');
    const noResultsEl = document.getElementById('empty-no-results');

    // Reset all states
    if (contentEmptyEl) contentEmptyEl.hidden = true;
    if (packagingEmptyEl) packagingEmptyEl.hidden = true;
    if (noResultsEl) noResultsEl.hidden = true;

    // Case 1: Vault itself has 0 items (Note count of this tab is 0)
    if (totalVaultItems === 0) {
      if (this.activeVault === 'content' && contentEmptyEl) {
        contentEmptyEl.hidden = false;
      } else if (this.activeVault === 'packaging' && packagingEmptyEl) {
        packagingEmptyEl.hidden = false;
      }
      return;
    }

    // Case 2: Vault has items, but search/filter yielded 0 results
    if (totalVaultItems > 0 && filteredItemsCount === 0 && isFiltered) {
      if (noResultsEl) {
        noResultsEl.hidden = false;
      }
    }
  }

  /**
   * Evaluates whether a vault is empty from a list of notes
   * @param {Array<Object>} notes
   * @param {'content'|'packaging'} vault
   * @returns {boolean}
   */
  isVaultEmpty(notes = [], vault = this.activeVault) {
    if (!Array.isArray(notes)) return true;
    const tabNotes = notes.filter(n => (n.lens || n.vaultType) === vault);
    return tabNotes.length === 0;
  }

  /**
   * Action handler: navigate to S01 Research
   */
  handleGoResearch() {
    // 1. Invoke custom callback if provided
    if (typeof this.onNavigateResearch === 'function') {
      this.onNavigateResearch();
      return;
    }

    // 2. Client-side router navigation
    if (router && typeof router.navigate === 'function') {
      router.navigate('research');
      return;
    }

    // 3. Fallback: Dispatch DOM custom event for app shell
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mew:navigate', {
        detail: { step: 's01', screen: 'research' }
      }));

      // 4. Try clicking S01 navigation tab directly if present
      const navResearch = document.querySelector('[data-step="s01"], [data-nav="research"], #nav-research');
      if (navResearch && typeof navResearch.click === 'function') {
        navResearch.click();
      }
    }
  }

  /**
   * Action handler: loads sample data safely from current storage
   */
  handleLoadSample() {
    let existingList = [];

    // Check store or localStorage
    try {
      const stored = localStorage.getItem('mew_saved_references') || localStorage.getItem('mew_saved_notes');
      if (stored) {
        existingList = JSON.parse(stored);
      }
    } catch (e) {
      existingList = [];
    }

    if (existingList.length === 0 && typeof getState === 'function') {
      const state = getState();
      if (state && Array.isArray(state.savedNotes)) {
        existingList = state.savedNotes;
      }
    }

    const merged = this.loadSampleData(existingList);

    // Dispatch app-level events so views refresh seamlessly
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mew:sample-loaded', { detail: { references: merged } }));
      window.dispatchEvent(new CustomEvent('mew:reference-saved', { detail: { references: merged } }));
    }
  }

  /**
   * Action handler: loads sample data without wiping user's existing records
   * @param {Array<Object>} existingReferences 
   * @returns {Array<Object>} Updated list with samples merged safely
   */
  loadSampleData(existingReferences = []) {
    const existingList = Array.isArray(existingReferences) ? existingReferences : [];
    const existingIds = new Set(existingList.map(r => r.id));

    // Filter samples that are not yet present
    const newSamples = SAMPLE_LIBRARY_REFERENCES.filter(s => !existingIds.has(s.id));
    const merged = [...existingList, ...newSamples];

    // Persist to store if available
    if (typeof dispatch === 'function') {
      newSamples.forEach(sample => {
        try {
          dispatch({
            type: 'SAVE_NOTE',
            payload: {
              sourceId: sample.sourceId || sample.id,
              lens: sample.lens || sample.vaultType,
              why: sample.founderWhy || sample.why,
              tags: sample.tags || [],
              note: sample
            }
          });
        } catch (e) {
          // ignore if action type mismatch
        }
      });
    }

    // Persist to localStorage
    try {
      localStorage.setItem('mew_saved_references', JSON.stringify(merged));
      localStorage.setItem('mew_saved_notes', JSON.stringify(merged));
    } catch (e) {
      // safe fallback
    }

    if (typeof this.onSampleLoaded === 'function') {
      this.onSampleLoaded(merged);
    }

    return merged;
  }

  /**
   * Action handler: clear filters
   */
  handleClearFilters() {
    if (typeof this.onClearFilters === 'function') {
      this.onClearFilters();
      return;
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mew:clear-filters'));

      // Reset search input in DOM if present
      const searchInput = document.getElementById('input-library-search');
      if (searchInput) {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      }

      // Reset active tag chips
      const chips = document.querySelectorAll('.tag-filter-chip');
      chips.forEach((c, idx) => {
        if (idx === 0) c.classList.add('active');
        else c.classList.remove('active');
      });
    }
  }
}
