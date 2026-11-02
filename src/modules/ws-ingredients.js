/**
 * ==============================================================================
 * MEW CONTENT OS — S07 Remix Workspace Ingredients Controller (Topic T22)
 * Theme: mewteetawat.com V6.3 (Warm Stone, Coral, Violet & Deep Ink)
 * 100% Pure Client-Side JavaScript (Vanilla ES6+)
 * Zero Server Dependencies · Zero Fake Metrics · Accessible WCAG UI
 * ==============================================================================
 */

import { getState, dispatch } from './store.js';

export const REMIX_SESSION_STORAGE_KEY = 'mew_remix_session';

/**
 * Global/Module-level remixSession object
 * Stores active workspace state: ingredients[], direction, and active drafts
 */
export const remixSession = (() => {
  if (typeof globalThis !== 'undefined' && globalThis.remixSession) {
    return globalThis.remixSession;
  }
  let initial = { ingredients: [], lastUpdated: new Date().toISOString() };
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(REMIX_SESSION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.ingredients)) {
          initial = parsed;
        }
      }
    }
  } catch (e) {
    // LocalStorage unavailable; fallback to in-memory
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.remixSession = initial;
  }
  return initial;
})();

/**
 * Safe accessor for active remix session
 * @returns {object}
 */
export function getRemixSession() {
  if (typeof globalThis !== 'undefined' && globalThis.remixSession) {
    return globalThis.remixSession;
  }
  return remixSession;
}

/**
 * Safe mutator for active remix session
 * @param {object} session 
 */
export function setRemixSession(session) {
  if (!session || typeof session !== 'object') return;
  const target = getRemixSession();
  target.ingredients = Array.isArray(session.ingredients) ? session.ingredients : target.ingredients;
  target.lastUpdated = new Date().toISOString();
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(REMIX_SESSION_STORAGE_KEY, JSON.stringify(target));
    }
  } catch (e) {}
}

export class WorkspaceIngredientsController {
  /**
   * Initializes the Workspace Ingredients Controller
   * @param {Object} options 
   * @param {HTMLElement|string} [options.rootId]
   * @param {Array<Object>} [options.ingredients]
   * @param {Function} [options.onIngredientsChanged]
   * @param {Function} [options.onDraftUpdated]
   * @param {Function} [options.onViewSource]
   */
  constructor(options = {}) {
    this.root = typeof options.rootId === 'string'
      ? (typeof document !== 'undefined' ? document.querySelector(options.rootId) : null)
      : (options.rootId || (typeof document !== 'undefined' ? document.getElementById('ws-ingredients') : null));

    this.remixSession = getRemixSession();
    this.ingredients = [];

    // Prioritize passed ingredients; otherwise fall back to persisted remixSession.ingredients
    if (Array.isArray(options.ingredients) && options.ingredients.length > 0) {
      this.setIngredients(options.ingredients);
    } else if (Array.isArray(this.remixSession.ingredients) && this.remixSession.ingredients.length > 0) {
      this.setIngredients(this.remixSession.ingredients);
    }

    this.onIngredientsChanged = options.onIngredientsChanged || null;
    this.onDraftUpdated = options.onDraftUpdated || null;
    this.onViewSource = options.onViewSource || null;

    this.activeModalIngredient = null;
    this.initEvents();
  }

  /**
   * Initializes or sets ingredients list, merging with session draft to preserve edits
   * @param {Array<Object>} list 
   */
  setIngredients(list) {
    if (!Array.isArray(list)) return;

    this.ingredients = list.map(item => {
      const copy = { ...item };
      const noteId = copy.id || copy.noteId;
      const lens = (copy.vaultType || copy.lens || 'content').toLowerCase();

      // Check existing session for preserved user-typed borrow instructions
      const sessionMatch = Array.isArray(this.remixSession.ingredients)
        ? this.remixSession.ingredients.find(ing => (ing.id || ing.noteId) === noteId)
        : null;

      if (sessionMatch && sessionMatch.borrowText !== undefined) {
        copy.borrowText = sessionMatch.borrowText;
      } else if (!copy.borrowText) {
        if (lens === 'packaging') {
          copy.borrowText = copy.howToBorrow || copy.founderWhy || copy.why || copy.aiInsight || '';
        } else {
          copy.borrowText = copy.whatToBorrow || copy.founderWhy || copy.why || copy.aiInsight || '';
        }
      }

      // Explicitly separate borrowWhat vs borrowHow
      if (lens === 'packaging') {
        copy.borrowHow = copy.borrowText;
      } else {
        copy.borrowWhat = copy.borrowText;
      }

      return copy;
    });

    // Synchronize to remixSession.ingredients
    this.remixSession.ingredients = this.ingredients;
    setRemixSession(this.remixSession);

    this.render();
    this.updateUI();
  }

  /**
   * Updates borrow text for an ingredient and persists immediately in remixSession
   * @param {string} noteId 
   * @param {string} newText 
   */
  updateBorrowText(noteId, newText) {
    const item = this.ingredients.find(ing => (ing.id || ing.noteId) === noteId);
    if (!item) return;

    const trimmed = (newText || '').trim();
    item.borrowText = trimmed;
    const lens = (item.vaultType || item.lens || 'content').toLowerCase();

    if (lens === 'packaging') {
      item.borrowHow = trimmed;
    } else {
      item.borrowWhat = trimmed;
    }

    // Persist to remixSession.ingredients
    if (this.remixSession && Array.isArray(this.remixSession.ingredients)) {
      const sessionItem = this.remixSession.ingredients.find(ing => (ing.id || ing.noteId) === noteId);
      if (sessionItem) {
        sessionItem.borrowText = trimmed;
        if (lens === 'packaging') sessionItem.borrowHow = trimmed;
        else sessionItem.borrowWhat = trimmed;
      } else {
        this.remixSession.ingredients.push({ ...item });
      }
      setRemixSession(this.remixSession);
    }

    // Auto-save to central store draft
    try {
      dispatch({
        type: 'UPDATE_REMIX_DRAFT_INGREDIENT',
        payload: {
          noteId,
          borrowText: item.borrowText,
          borrowWhat: item.borrowWhat,
          borrowHow: item.borrowHow
        }
      });
    } catch (e) {
      // Non-blocking store dispatch
    }

    if (typeof this.onDraftUpdated === 'function') {
      this.onDraftUpdated(this.ingredients);
    }
  }

  /**
   * Removes an ingredient from the workspace
   * @param {string} noteId 
   * @returns {boolean} Whether at least 1 Content ingredient remains
   */
  removeIngredient(noteId) {
    this.ingredients = this.ingredients.filter(ing => (ing.id || ing.noteId) !== noteId);

    if (this.remixSession && Array.isArray(this.remixSession.ingredients)) {
      this.remixSession.ingredients = this.remixSession.ingredients.filter(ing => (ing.id || ing.noteId) !== noteId);
      setRemixSession(this.remixSession);
    }

    const hasContent = this.hasValidContentIngredient();
    this.render();
    this.updateUI();

    if (typeof this.onIngredientsChanged === 'function') {
      this.onIngredientsChanged(this.ingredients);
    }

    return hasContent;
  }

  /**
   * Checks whether at least one Content ingredient is present
   * @returns {boolean}
   */
  hasValidContentIngredient() {
    return this.ingredients.some(ing => {
      const lens = (ing.vaultType || ing.lens || '').toLowerCase();
      return lens === 'content' || lens === 'both';
    });
  }

  /**
   * Opens in-workspace source preview modal without navigating away
   * Shows source link, creator, and original founder WHY note
   * @param {string} noteId 
   */
  openSourceModal(noteId) {
    const item = this.ingredients.find(ing => (ing.id || ing.noteId) === noteId);
    if (!item || typeof document === 'undefined') return;

    this.activeModalIngredient = item;
    const modal = document.getElementById('ws-source-preview-modal');
    if (!modal) return;

    const lens = (item.vaultType || item.lens || 'content').toLowerCase();
    const titleEl = document.getElementById('modal-source-title');
    const subtitleEl = document.getElementById('modal-source-subtitle');
    const creatorEl = document.getElementById('modal-source-creator');
    const lensEl = document.getElementById('modal-source-lens');
    const whyEl = document.getElementById('modal-source-why');
    const linkEl = document.getElementById('modal-source-link');
    const tagsContainer = document.getElementById('modal-source-tags');

    if (titleEl) titleEl.textContent = item.title || 'Untitled Reference';
    if (subtitleEl) subtitleEl.textContent = item.subtitle || '';
    if (creatorEl) creatorEl.textContent = item.creator ? `โดย ${item.creator}` : 'ไม่ระบุผู้สร้าง';

    if (lensEl) {
      lensEl.textContent = lens === 'packaging' ? 'Packaging Vault' : 'Content Vault';
      lensEl.className = `lens-badge ${lens === 'packaging' ? 'badge-packaging' : 'badge-content'}`;
    }

    if (whyEl) {
      // Must clearly display founder why without hiding
      const authenticWhy = item.founderWhy || item.why || item.note || 'ไม่มีการระบุข้อความตอนบันทึก';
      whyEl.textContent = authenticWhy;
    }

    if (linkEl) {
      const url = item.sourceUrl || item.url || '#';
      linkEl.href = url;
      linkEl.target = '_blank';
      linkEl.rel = 'noopener noreferrer';
      const linkText = document.getElementById('modal-source-link-text');
      if (linkText) {
        linkText.textContent = url.includes('youtube.com') || url.includes('youtu.be')
          ? 'เปิดดูคลิปต้นฉบับบน YouTube ↗'
          : 'เปิดดูที่มาต้นฉบับ ↗';
      }
    }

    if (tagsContainer) {
      tagsContainer.innerHTML = '';
      const tags = Array.isArray(item.tags) ? item.tags : [];
      if (tags.length > 0) {
        tags.forEach(t => {
          const pill = document.createElement('span');
          pill.className = 'tag-pill';
          pill.textContent = `#${t}`;
          tagsContainer.appendChild(pill);
        });
      } else {
        const span = document.createElement('span');
        span.className = 'source-link-disclaimer';
        span.textContent = 'ไม่มีแท็กเพิ่มเติม';
        tagsContainer.appendChild(span);
      }
    }

    modal.hidden = false;
    document.body.classList.add('modal-open');

    // Accessibility: Focus close button
    const closeBtn = document.getElementById('btn-close-source-modal');
    if (closeBtn) closeBtn.focus();

    if (typeof this.onViewSource === 'function') {
      this.onViewSource(item);
    }
  }

  /**
   * Closes the in-workspace source preview modal
   */
  closeSourceModal() {
    if (typeof document === 'undefined') return;
    const modal = document.getElementById('ws-source-preview-modal');
    if (modal) {
      modal.hidden = true;
    }
    document.body.classList.remove('modal-open');
    this.activeModalIngredient = null;
  }

  /**
   * Binds global and DOM event listeners
   */
  initEvents() {
    if (typeof document === 'undefined') return;

    // Close source modal triggers
    const closeBtn = document.getElementById('btn-close-source-modal');
    const dismissBtn = document.getElementById('btn-modal-dismiss');
    const backdrop = document.getElementById('modal-source-backdrop');

    if (closeBtn) closeBtn.onclick = () => this.closeSourceModal();
    if (dismissBtn) dismissBtn.onclick = () => this.closeSourceModal();
    if (backdrop) backdrop.onclick = () => this.closeSourceModal();

    // Keyboard ESC listener
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeModalIngredient) {
        this.closeSourceModal();
      }
    });

    // Mobile collapsible toggle all groups button
    const toggleGroupsBtn = document.getElementById('btn-toggle-all-groups');
    if (toggleGroupsBtn) {
      toggleGroupsBtn.onclick = () => {
        const detailsList = document.querySelectorAll('.ingredient-group-details');
        const anyOpen = Array.from(detailsList).some(d => d.open);
        detailsList.forEach(d => { d.open = !anyOpen; });
        toggleGroupsBtn.setAttribute('aria-expanded', String(!anyOpen));
      };
    }
  }

  /**
   * Updates warning box, counts, and mobile summary
   */
  updateUI() {
    if (typeof document === 'undefined') return;

    const hasContent = this.hasValidContentIngredient();
    const warnBox = document.getElementById('warn-no-content');
    const badge = document.getElementById('ingredient-total-badge');
    const contentCountBadge = document.getElementById('content-count-badge');
    const packagingCountBadge = document.getElementById('packaging-count-badge');
    const mobileSummaryLabel = document.getElementById('ws-summary-mix-label');

    if (warnBox) {
      warnBox.hidden = hasContent;
    }

    if (badge) {
      badge.textContent = `วัตถุดิบทั้งหมด ${this.ingredients.length} ชิ้น`;
    }

    const contentCount = this.ingredients.filter(ing => {
      const lens = (ing.vaultType || ing.lens || '').toLowerCase();
      return lens === 'content' || lens === 'both';
    }).length;

    const packagingCount = this.ingredients.filter(ing => {
      const lens = (ing.vaultType || ing.lens || '').toLowerCase();
      return lens === 'packaging';
    }).length;

    if (contentCountBadge) {
      contentCountBadge.textContent = `${contentCount} รายการ`;
    }

    if (packagingCountBadge) {
      packagingCountBadge.textContent = `${packagingCount} รายการ`;
    }

    if (mobileSummaryLabel) {
      mobileSummaryLabel.textContent = `Content (${contentCount}) + Packaging (${packagingCount})`;
    }
  }

  /**
   * Renders ingredient cards into Content and Packaging groups and unified list
   */
  render() {
    if (typeof document === 'undefined') return;

    const template = document.getElementById('tmpl-ws-ingredient-card');
    const contentContainer = document.getElementById('content-ingredients-list');
    const packagingContainer = document.getElementById('packaging-ingredients-list');
    const unifiedContainer = document.getElementById('ws-ingredients-list');

    if (contentContainer) contentContainer.innerHTML = '';
    if (packagingContainer) packagingContainer.innerHTML = '';
    if (unifiedContainer) unifiedContainer.innerHTML = '';

    if (!template) return;

    let contentCount = 0;
    let packagingCount = 0;

    this.ingredients.forEach(item => {
      const noteId = item.id || item.noteId;
      const lens = (item.vaultType || item.lens || 'content').toLowerCase();
      const card = this.buildCardElement(template, item, noteId, lens);

      if (lens === 'packaging') {
        packagingCount++;
        if (packagingContainer) packagingContainer.appendChild(card);
      } else {
        contentCount++;
        if (contentContainer) contentContainer.appendChild(card);
      }

      // Append clone to unified fallback list as well
      if (unifiedContainer) {
        const unifiedCard = card.cloneNode(true);
        this.bindCardEvents(unifiedCard, item, noteId, lens);
        unifiedContainer.appendChild(unifiedCard);
      }
    });

    // Empty state notices
    if (contentContainer && contentCount === 0) {
      const empty = document.createElement('div');
      empty.className = 'group-empty-state';
      empty.textContent = 'ยังไม่มี Content Ingredient ในห้องปรุง (คลิก Browse Vault เพื่อเพิ่ม)';
      contentContainer.appendChild(empty);
    }

    if (packagingContainer && packagingCount === 0) {
      const empty = document.createElement('div');
      empty.className = 'group-empty-state';
      empty.textContent = 'ไม่มี Packaging Ingredient (สามารถผสม Content ล้วน หรือหยิบยืมเทคนิคเล่าเพิ่มได้)';
      packagingContainer.appendChild(empty);
    }
  }

  /**
   * Builds an individual card DOM node from template
   * @param {HTMLTemplateElement} template 
   * @param {Object} item 
   * @param {string} noteId 
   * @param {string} lens 
   * @returns {HTMLElement}
   */
  buildCardElement(template, item, noteId, lens) {
    const clone = template.content.cloneNode(true);
    const card = clone.querySelector('.ws-ingredient-card');
    if (!card) return clone;

    card.dataset.noteId = noteId;
    card.dataset.lens = lens;

    // Badges & Creator
    const lensBadge = card.querySelector('.lens-badge');
    if (lensBadge) {
      lensBadge.textContent = lens === 'packaging' ? 'Packaging' : 'Content';
    }

    const creatorEl = card.querySelector('.ingredient-creator');
    if (creatorEl) {
      creatorEl.textContent = item.creator ? `โดย ${item.creator}` : '';
    }

    // Title (Must NOT be hidden)
    const titleEl = card.querySelector('.ingredient-title');
    if (titleEl) {
      titleEl.textContent = item.title || 'Untitled Reference';
    }

    const durationEl = card.querySelector('.ingredient-duration');
    if (durationEl) {
      durationEl.textContent = item.duration || '';
    }

    // Founder Note from save time (Must NOT be hidden)
    const founderNoteText = card.querySelector('.founder-note-text');
    if (founderNoteText) {
      founderNoteText.textContent = item.founderWhy || item.why || item.note || 'ไม่มีโน้ตเพิ่มเติมตอนบันทึก';
    }

    // Borrow field configuration: borrow-what-{id} for content, borrow-how-{id} for packaging
    const borrowWrap = card.querySelector('.borrow-field-wrap');
    const labelEl = card.querySelector('.borrow-label');
    const textareaEl = card.querySelector('.borrow-textarea');
    const hintEl = card.querySelector('.borrow-field-hint');

    const inputId = lens === 'packaging' ? `borrow-how-${noteId}` : `borrow-what-${noteId}`;
    const labelText = lens === 'packaging'
      ? 'How to borrow? (เทคนิคและจังหวะการเล่าที่หยิบยืม)'
      : 'What to borrow? (สาระและแก่นคิดที่หยิบยืม)';
    const placeholder = lens === 'packaging'
      ? 'ระบุเทคนิคการเปิดคลิป (Hook), จังหวะภาพและเสียง, หรือโครงสร้างการเล่าที่ต้องการหยิบยืม...'
      : 'ระบุสาระสำคัญ, บทเรียน, หรือข้อคิดหลักที่ต้องการหยิบยืมมาผสมกับมุมมองของเรา...';

    if (labelEl) {
      labelEl.htmlFor = inputId;
      labelEl.textContent = labelText;
    }

    if (textareaEl) {
      textareaEl.id = inputId;
      textareaEl.name = inputId;
      textareaEl.dataset.testid = inputId;
      textareaEl.placeholder = placeholder;
      textareaEl.value = item.borrowText || '';
    }

    if (hintEl) {
      hintEl.textContent = lens === 'packaging'
        ? 'หยิบยืมเฉพาะโครงสร้างและสไตล์ ไม่คัดลอกถ้อยคำ'
        : 'หยิบยืมเฉพาะแก่นคิด ผสมผสานกับ Our POV ของเรา';
    }

    this.bindCardEvents(card, item, noteId, lens);
    return card;
  }

  /**
   * Binds interaction events for an ingredient card
   * @param {HTMLElement} card 
   * @param {Object} item 
   * @param {string} noteId 
   * @param {string} lens 
   */
  bindCardEvents(card, item, noteId, lens) {
    const textarea = card.querySelector('.borrow-textarea');
    if (textarea) {
      textarea.addEventListener('input', (e) => {
        this.updateBorrowText(noteId, e.target.value);
      });
      textarea.addEventListener('change', (e) => {
        this.updateBorrowText(noteId, e.target.value);
      });
    }

    // Remove button
    const removeBtn = card.querySelector('.btn-remove-ingredient');
    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeIngredient(noteId);
      });
    }

    // View source buttons (in-workspace modal trigger)
    const viewSourceBtns = card.querySelectorAll('[data-action="view-source"]');
    viewSourceBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openSourceModal(noteId);
      });
    });
  }
}
