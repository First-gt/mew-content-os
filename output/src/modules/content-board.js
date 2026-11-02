/**
 * ==============================================================================
 * MEW CONTENT OS — S09 Content Board Controller (Topic T28)
 * Theme: mewteetawat.com V6.3
 * 100% Pure Client-Side JavaScript (Vanilla ES6+)
 * Zero Server Dependencies · Zero Fake Metrics · Accessible WCAG UI
 * ==============================================================================
 */

import { getState, dispatch } from './store.js';

export const BOARD_STAGES = {
  DRAFT: 'draft',
  NEEDS_REVIEW: 'needs-review',
  APPROVED: 'approved',
  READY_FOR_PRODUCTION: 'ready-for-production'
};

/**
 * Normalizes stage string to standard BOARD_STAGES enum key
 * @param {string} stage 
 * @returns {string}
 */
export function normalizeStage(stage) {
  if (!stage) return BOARD_STAGES.DRAFT;
  const s = String(stage).toLowerCase().trim().replace(/[\s_]+/g, '-');
  if (s === 'draft') return BOARD_STAGES.DRAFT;
  if (s === 'needs-review' || s === 'review' || s === 'needsreview') return BOARD_STAGES.NEEDS_REVIEW;
  if (s === 'approved') return BOARD_STAGES.APPROVED;
  if (s === 'ready-for-production' || s === 'ready' || s === 'production' || s === 'readyforproduction') {
    return BOARD_STAGES.READY_FOR_PRODUCTION;
  }
  return BOARD_STAGES.DRAFT;
}

/**
 * Returns human-readable metadata for each stage
 * @param {string} stage 
 * @returns {{ label: string, color: string, isGated: boolean }}
 */
export function getStageMeta(stage) {
  const norm = normalizeStage(stage);
  switch (norm) {
    case BOARD_STAGES.DRAFT:
      return { label: 'Draft', color: 'neutral', isGated: false };
    case BOARD_STAGES.NEEDS_REVIEW:
      return { label: 'Needs Review', color: 'amber', isGated: false };
    case BOARD_STAGES.APPROVED:
      return { label: 'Approved', color: 'coral', isGated: true };
    case BOARD_STAGES.READY_FOR_PRODUCTION:
      return { label: 'Ready for Production', color: 'violet', isGated: true };
    default:
      return { label: 'Draft', color: 'neutral', isGated: false };
  }
}

export class ContentBoardController {
  constructor(options = {}) {
    this.root = typeof options.rootId === 'string'
      ? (typeof document !== 'undefined' ? document.querySelector(options.rootId) : null)
      : (options.rootId || (typeof document !== 'undefined' ? document.getElementById('content-board-root') : null));

    this.cards = Array.isArray(options.initialCards)
      ? [...options.initialCards]
      : this.loadInitialCards();

    this.onStageChanged = options.onStageChanged || null;
    this.onActionBlocked = options.onActionBlocked || null;
    this.draggedCardId = null;

    if (this.root) {
      this.init();
    }
  }

  /**
   * Initializes DOM bindings and renders initial state
   */
  init() {
    this.bindEvents();
    this.render();
    this.updateCounters();
  }

  /**
   * Loads initial cards from store or localStorage if available
   * @returns {Array<Object>}
   */
  loadInitialCards() {
    try {
      if (typeof getState === 'function') {
        const state = getState();
        if (Array.isArray(state?.boardItems) && state.boardItems.length > 0) {
          return [...state.boardItems];
        }
      }
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('mew_content_board_items');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      }
    } catch (e) {
      // Storage unavailable fallback
    }
    return [];
  }

  /**
   * Sets all board cards
   * @param {Array<Object>} cards 
   */
  setCards(cards) {
    this.cards = Array.isArray(cards) ? [...cards] : [];
    this.render();
    this.updateCounters();
  }

  /**
   * Adds or updates a card on the board
   * @param {Object} card 
   */
  addCard(card) {
    if (!card || !card.id) return;
    const existingIndex = this.cards.findIndex(c => String(c.id) === String(card.id));
    if (existingIndex >= 0) {
      this.cards[existingIndex] = { ...this.cards[existingIndex], ...card, updatedAt: new Date().toISOString() };
    } else {
      this.cards.unshift({
        stage: BOARD_STAGES.DRAFT,
        ...card,
        updatedAt: new Date().toISOString()
      });
    }

    try {
      dispatch({
        type: 'ADD_BOARD_ITEM',
        payload: card
      });
    } catch (e) {}

    this.persistCards();
    this.render();
    this.updateCounters();
  }

  /**
   * Submits card for review: Moves Draft -> Needs Review
   * @param {string} cardId 
   * @returns {boolean}
   */
  submitForReview(cardId) {
    const card = this.cards.find(c => String(c.id) === String(cardId));
    if (!card) return false;

    const currentStage = normalizeStage(card.stage);
    if (currentStage !== BOARD_STAGES.DRAFT) {
      return false;
    }

    card.stage = BOARD_STAGES.NEEDS_REVIEW;
    card.updatedAt = new Date().toISOString();

    // Dispatch update to store
    try {
      dispatch({
        type: 'UPDATE_BOARD_CARD_STAGE',
        payload: { cardId, stage: BOARD_STAGES.NEEDS_REVIEW }
      });
      dispatch({
        type: 'UPDATE_BOARD_ITEM',
        payload: { id: cardId, stage: BOARD_STAGES.NEEDS_REVIEW }
      });
    } catch (e) {}

    this.persistCards();

    if (typeof this.onStageChanged === 'function') {
      this.onStageChanged(cardId, BOARD_STAGES.NEEDS_REVIEW);
    }

    this.render();
    this.updateCounters();
    return true;
  }

  /**
   * Returns card from Needs Review back to Draft ("Not yet" case)
   * @param {string} cardId 
   * @returns {boolean}
   */
  returnToDraft(cardId) {
    const card = this.cards.find(c => String(c.id) === String(cardId));
    if (!card) return false;

    const currentStage = normalizeStage(card.stage);
    if (currentStage !== BOARD_STAGES.NEEDS_REVIEW) {
      return false;
    }

    card.stage = BOARD_STAGES.DRAFT;
    card.updatedAt = new Date().toISOString();

    try {
      dispatch({
        type: 'UPDATE_BOARD_CARD_STAGE',
        payload: { cardId, stage: BOARD_STAGES.DRAFT }
      });
      dispatch({
        type: 'UPDATE_BOARD_ITEM',
        payload: { id: cardId, stage: BOARD_STAGES.DRAFT }
      });
    } catch (e) {}

    this.persistCards();

    if (typeof this.onStageChanged === 'function') {
      this.onStageChanged(cardId, BOARD_STAGES.DRAFT);
    }

    this.render();
    this.updateCounters();
    return true;
  }

  /**
   * Moves a card to target stage with strict governance gating.
   * Direct drag or moving to Approved / Ready for Production is strictly blocked
   * and must only be performed through authorized T29 governance actions.
   * 
   * @param {string} cardId 
   * @param {string} targetStage 
   * @param {Object} [auth] 
   * @returns {{ success: boolean, reason?: string }}
   */
  moveToStage(cardId, targetStage, auth = {}) {
    const normTarget = normalizeStage(targetStage);
    const card = this.cards.find(c => String(c.id) === String(cardId));
    if (!card) {
      return { success: false, reason: 'ไม่พบคอนเทนต์ที่ระบุ' };
    }

    // STRICT GOVERNANCE RULE:
    // Moving to Approved or Ready for Production is forbidden unless authorized by T29 Claims & Rights Audit
    if (normTarget === BOARD_STAGES.APPROVED || normTarget === BOARD_STAGES.READY_FOR_PRODUCTION) {
      const isAuthorized = auth.authorizedByT29 === true || auth.fromT29 === true || auth.approved === true;
      if (!isAuthorized) {
        const errorReason = 'การย้ายไป Approved หรือ Ready for Production ทำผ่าน action ใน T29 เท่านั้น (ห้ามลากข้ามโดยตรง)';
        if (typeof this.onActionBlocked === 'function') {
          this.onActionBlocked(cardId, normTarget, errorReason);
        }
        this.showToast(errorReason, 'warning');
        return { success: false, reason: errorReason };
      }
    }

    // Moving to Needs Review
    if (normTarget === BOARD_STAGES.NEEDS_REVIEW) {
      const ok = this.submitForReview(cardId);
      return { success: ok, reason: ok ? '' : 'สามารถส่งตรวจได้จากขั้นตอน Draft เท่านั้น' };
    }

    // Moving to Draft
    if (normTarget === BOARD_STAGES.DRAFT) {
      const ok = this.returnToDraft(cardId);
      return { success: ok, reason: ok ? '' : 'สามารถส่งกลับแก้ไขได้จากขั้นตอน Needs Review เท่านั้น' };
    }

    // Authorized transition to Approved / Ready for Production
    card.stage = normTarget;
    card.updatedAt = new Date().toISOString();

    try {
      dispatch({
        type: 'UPDATE_BOARD_CARD_STAGE',
        payload: { cardId, stage: normTarget }
      });
      dispatch({
        type: 'UPDATE_BOARD_ITEM',
        payload: { id: cardId, stage: normTarget }
      });
    } catch (e) {}

    this.persistCards();

    if (typeof this.onStageChanged === 'function') {
      this.onStageChanged(cardId, normTarget);
    }

    this.render();
    this.updateCounters();
    return { success: true };
  }

  /**
   * Persists cards array to localStorage safely
   */
  persistCards() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('mew_content_board_items', JSON.stringify(this.cards));
      }
    } catch (e) {}
  }

  /**
   * Groups cards by stage
   * @returns {Object<string, Array<Object>>}
   */
  getCardsByStage() {
    const grouped = {
      [BOARD_STAGES.DRAFT]: [],
      [BOARD_STAGES.NEEDS_REVIEW]: [],
      [BOARD_STAGES.APPROVED]: [],
      [BOARD_STAGES.READY_FOR_PRODUCTION]: []
    };

    for (const card of this.cards) {
      const stage = normalizeStage(card.stage);
      if (grouped[stage]) {
        grouped[stage].push(card);
      } else {
        grouped[BOARD_STAGES.DRAFT].push(card);
      }
    }

    return grouped;
  }

  /**
   * Updates column count badges in DOM
   */
  updateCounters() {
    if (typeof document === 'undefined') return;

    const grouped = this.getCardsByStage();
    const countDraft = document.getElementById('count-stage-draft');
    const countReview = document.getElementById('count-stage-review');
    const countApproved = document.getElementById('count-stage-approved');
    const countProduction = document.getElementById('count-stage-production');

    if (countDraft) countDraft.textContent = String(grouped[BOARD_STAGES.DRAFT].length);
    if (countReview) countReview.textContent = String(grouped[BOARD_STAGES.NEEDS_REVIEW].length);
    if (countApproved) countApproved.textContent = String(grouped[BOARD_STAGES.APPROVED].length);
    if (countProduction) countProduction.textContent = String(grouped[BOARD_STAGES.READY_FOR_PRODUCTION].length);
  }

  /**
   * Renders cards into their respective Kanban columns
   */
  render() {
    if (typeof document === 'undefined') return;

    const lists = {
      [BOARD_STAGES.DRAFT]: document.getElementById('list-stage-draft'),
      [BOARD_STAGES.NEEDS_REVIEW]: document.getElementById('list-stage-review'),
      [BOARD_STAGES.APPROVED]: document.getElementById('list-stage-approved'),
      [BOARD_STAGES.READY_FOR_PRODUCTION]: document.getElementById('list-stage-production')
    };

    const grouped = this.getCardsByStage();
    const tmpl = document.getElementById('tmpl-board-card');

    for (const [stage, listEl] of Object.entries(lists)) {
      if (!listEl) continue;
      listEl.innerHTML = '';

      const stageCards = grouped[stage] || [];

      if (stageCards.length === 0) {
        const placeholder = document.createElement('div');
        placeholder.className = 'col-empty-placeholder';
        const emptyLabels = {
          [BOARD_STAGES.DRAFT]: 'ยังไม่มีงานในสถานะ Draft<br>สร้างไอเดียใหม่จาก Remix Workspace',
          [BOARD_STAGES.NEEDS_REVIEW]: 'ไม่มีงานที่รอตรวจทาน<br>ส่งตรวจงานจากคอลัมน์ Draft',
          [BOARD_STAGES.APPROVED]: 'ไม่มีงานที่อนุมัติแล้ว<br>ต้องผ่านการตรวจทานใน T29',
          [BOARD_STAGES.READY_FOR_PRODUCTION]: 'ยังไม่มีงานที่พร้อมถ่ายทำ<br>เมื่ออนุมัติและเสร็จสิ้นบรีฟผู้กำกับ'
        };
        placeholder.innerHTML = emptyLabels[stage] || 'ว่าง';
        listEl.appendChild(placeholder);
        continue;
      }

      for (const card of stageCards) {
        const cardEl = this.createCardElement(card, tmpl);
        listEl.appendChild(cardEl);
      }
    }
  }

  /**
   * Builds DOM element for an individual card
   * @param {Object} card 
   * @param {HTMLTemplateElement|null} tmpl 
   * @returns {HTMLElement}
   */
  createCardElement(card, tmpl) {
    let el;
    if (tmpl && tmpl.content && tmpl.content.firstElementChild) {
      el = tmpl.content.firstElementChild.cloneNode(true);
    } else {
      el = document.createElement('article');
      el.className = 'board-card mew-offer-card';
    }

    const cardId = String(card.id || `card-${Date.now()}`);
    const stage = normalizeStage(card.stage);
    const meta = getStageMeta(stage);

    el.id = `card-${cardId}`;
    el.setAttribute('data-card-id', cardId);
    el.setAttribute('data-stage', stage);
    el.setAttribute('role', 'listitem');
    el.tabIndex = 0;

    // Draggable only for editable stages (Draft & Needs Review)
    if (stage === BOARD_STAGES.DRAFT || stage === BOARD_STAGES.NEEDS_REVIEW) {
      el.setAttribute('draggable', 'true');
    } else {
      el.removeAttribute('draggable');
    }

    // Title
    const titleEl = el.querySelector('.card-title');
    if (titleEl) {
      titleEl.textContent = card.title || card.name || 'Untitled Concept';
    }

    // Stage Pill
    const stagePill = el.querySelector('.card-stage-pill');
    if (stagePill) {
      stagePill.textContent = meta.label;
    }

    // Claim Flag Count
    const flagCount = typeof card.claimFlagCount === 'number'
      ? card.claimFlagCount
      : (Array.isArray(card.claimFlags) ? card.claimFlags.length : 0);

    const flagWrap = el.querySelector('.claim-flag-wrap, .claim-flag');
    const flagCountEl = el.querySelector('.claim-flag-count');
    if (flagCountEl) {
      flagCountEl.textContent = String(flagCount);
    }
    if (flagWrap) {
      if (flagCount > 0) {
        flagWrap.classList.add('has-flags');
        flagWrap.setAttribute('title', `พบข้ออ้างที่รอตรวจสอบ ${flagCount} จุด`);
      } else {
        flagWrap.classList.remove('has-flags');
        flagWrap.setAttribute('title', 'ตรวจสอบข้ออ้างครบถ้วนแล้ว');
      }
    }

    // Source Trace Summary
    const traceEl = el.querySelector('.trace-summary');
    if (traceEl) {
      let traceText = card.sourceTrace || card.sourceSummary || '';
      if (!traceText) {
        if (card.sourceWhat || card.sourceHow) {
          traceText = `${card.sourceWhat ? `Content: ${card.sourceWhat}` : ''}${card.sourceWhat && card.sourceHow ? ' | ' : ''}${card.sourceHow ? `Packaging: ${card.sourceHow}` : ''}`;
        } else if (card.provenance?.sources?.length) {
          traceText = card.provenance.sources.map(s => s.title || s.url).join(', ');
        } else {
          traceText = 'Remix Workshop Synthesis (C+P)';
        }
      }
      traceEl.textContent = traceText;
    }

    // Buttons visibility based on stage
    const btnSubmit = el.querySelector('.btn-submit-review, [data-action="submit-review"]');
    const btnBack = el.querySelector('.btn-back-to-draft, [data-action="back-to-draft"]');
    const govBadge = el.querySelector('.stage-governance-badge');

    if (stage === BOARD_STAGES.DRAFT) {
      if (btnSubmit) btnSubmit.hidden = false;
      if (btnBack) btnBack.hidden = true;
      if (govBadge) govBadge.hidden = true;
    } else if (stage === BOARD_STAGES.NEEDS_REVIEW) {
      if (btnSubmit) btnSubmit.hidden = true;
      if (btnBack) btnBack.hidden = false;
      if (govBadge) govBadge.hidden = true;
    } else {
      // Approved or Ready for Production: No draft/submit buttons
      if (btnSubmit) btnSubmit.hidden = true;
      if (btnBack) btnBack.hidden = true;
      if (govBadge) {
        govBadge.hidden = false;
        const badgeText = govBadge.querySelector('.badge-text') || govBadge;
        badgeText.textContent = stage === BOARD_STAGES.APPROVED ? 'อนุมัติผ่าน T29 แล้ว' : 'พร้อมถ่ายทำ (Director Brief Lock)';
      }
    }

    return el;
  }

  /**
   * Binds user events: button clicks, keyboard, and drag-and-drop
   */
  bindEvents() {
    if (!this.root || typeof document === 'undefined') return;

    // Click Delegation for stage transitions
    this.root.addEventListener('click', (e) => {
      const submitBtn = e.target.closest('[data-action="submit-review"], .btn-submit-review');
      if (submitBtn) {
        e.preventDefault();
        const cardEl = submitBtn.closest('[data-card-id]');
        if (cardEl) {
          const cardId = cardEl.getAttribute('data-card-id');
          this.submitForReview(cardId);
        }
        return;
      }

      const backBtn = e.target.closest('[data-action="back-to-draft"], .btn-back-to-draft');
      if (backBtn) {
        e.preventDefault();
        const cardEl = backBtn.closest('[data-card-id]');
        if (cardEl) {
          const cardId = cardEl.getAttribute('data-card-id');
          this.returnToDraft(cardId);
        }
        return;
      }
    });

    // Drag and Drop Delegation
    this.root.addEventListener('dragstart', (e) => {
      const cardEl = e.target.closest('.board-card');
      if (cardEl) {
        const cardId = cardEl.getAttribute('data-card-id');
        this.draggedCardId = cardId;
        cardEl.classList.add('dragging');
        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', cardId);
        }
      }
    });

    this.root.addEventListener('dragend', (e) => {
      const cardEl = e.target.closest('.board-card');
      if (cardEl) {
        cardEl.classList.remove('dragging');
      }
      this.draggedCardId = null;
      const columns = this.root.querySelectorAll('.kanban-column');
      columns.forEach(col => col.classList.remove('drag-over', 'drop-blocked'));
    });

    this.root.addEventListener('dragover', (e) => {
      const column = e.target.closest('.kanban-column');
      if (!column) return;
      e.preventDefault();

      const stage = column.getAttribute('data-stage') || column.id?.replace('col-', '');
      const normStage = normalizeStage(stage);

      if (e.dataTransfer) {
        if (normStage === BOARD_STAGES.APPROVED || normStage === BOARD_STAGES.READY_FOR_PRODUCTION) {
          e.dataTransfer.dropEffect = 'none';
          column.classList.add('drop-blocked');
        } else {
          e.dataTransfer.dropEffect = 'move';
          column.classList.add('drag-over');
        }
      }
    });

    this.root.addEventListener('dragleave', (e) => {
      const column = e.target.closest('.kanban-column');
      if (column && !column.contains(e.relatedTarget)) {
        column.classList.remove('drag-over', 'drop-blocked');
      }
    });

    this.root.addEventListener('drop', (e) => {
      const column = e.target.closest('.kanban-column');
      if (!column) return;
      e.preventDefault();

      column.classList.remove('drag-over', 'drop-blocked');
      const cardId = this.draggedCardId || (e.dataTransfer ? e.dataTransfer.getData('text/plain') : null);
      if (!cardId) return;

      const targetStageAttr = column.getAttribute('data-stage') || column.id?.replace('col-', '');
      const normTarget = normalizeStage(targetStageAttr);

      // Handle Governance Gating
      if (normTarget === BOARD_STAGES.APPROVED || normTarget === BOARD_STAGES.READY_FOR_PRODUCTION) {
        this.showToast('การย้ายไป Approved หรือ Ready for Production ทำผ่าน action ใน T29 เท่านั้น (ห้ามลากข้ามโดยตรง)', 'warning');
        return;
      }

      if (normTarget === BOARD_STAGES.NEEDS_REVIEW) {
        this.submitForReview(cardId);
      } else if (normTarget === BOARD_STAGES.DRAFT) {
        this.returnToDraft(cardId);
      }
    });
  }

  /**
   * Displays non-intrusive accessible toast feedback
   * @param {string} message 
   * @param {'info'|'warning'|'error'} [type] 
   */
  showToast(message, type = 'info') {
    if (typeof document === 'undefined') return;

    let container = document.getElementById('board-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'board-toast-container';
      container.className = 'board-toast-container';
      container.setAttribute('aria-live', 'polite');
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `board-toast toast-${type}`;
    toast.textContent = message;

    container.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 4000);
  }
}

// Auto-register on window if running in browser
if (typeof window !== 'undefined') {
  window.ContentBoardController = ContentBoardController;
  window.BOARD_STAGES = BOARD_STAGES;
  window.normalizeStage = normalizeStage;
}
