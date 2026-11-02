/**
 * ==============================================================================
 * MEW CONTENT OS — S00 Overview / Dashboard Controller (Topic T04)
 * Pure Client-Side JavaScript (ES6+ Module) · Zero Server Dependencies
 * Theme: mewteetawat.com V6.3
 * 
 * Definition of Done (DOD):
 * - HTML: 3 Primary Buttons: `btn-research-a-clip`, `btn-open-library`, `btn-start-remix`
 * - HTML: 4 Cards: `recent-research`, `vault-summary` (separate Saved Content & Saved Packaging),
 *         `remix-drafts`, `continue-work`
 * - CSS: 4-card clean layout without stuffing view count graphs / generator / timeline
 * - JS: Numbers in `vault-summary` are derived from `savedNotes` in store and update immediately upon Save
 * - JS: `btn-research-a-clip` → S01, `btn-open-library` → S04, `btn-start-remix` → S06,
 *       `continue-work` → returns to preserved pending state
 * ==============================================================================
 */

import { getState, subscribe as subscribeStore } from './store.js';
import { router, go as routerGo } from './router.js';

export const STORAGE_LAST_ACTIVE_SCREEN = 'mew_last_active_screen';
export const STORAGE_LAST_ACTIVE_PARAMS = 'mew_last_active_params';

/**
 * In-memory fallback for last active state tracking
 */
let inMemoryLastActive = {
  screenId: null,
  params: {}
};

/**
 * Safely persists the last active screen when navigating outside of S00.
 * @param {string} screenId 
 * @param {object} [params={}] 
 */
export function recordLastActiveScreen(screenId, params = {}) {
  if (!screenId || screenId === 'S00' || screenId.toUpperCase() === 'S00') return;

  inMemoryLastActive = { screenId, params: { ...params } };

  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.setItem(STORAGE_LAST_ACTIVE_SCREEN, screenId);
      window.sessionStorage.setItem(STORAGE_LAST_ACTIVE_PARAMS, JSON.stringify(params));
    }
  } catch (err) {
    // SessionStorage restricted or unavailable; in-memory fallback active
  }
}

/**
 * Retrieves the preserved last active screen and params.
 * @returns {{ screenId: string|null, params: object }}
 */
export function getPreservedLastActiveScreen() {
  if (inMemoryLastActive.screenId) {
    return { ...inMemoryLastActive };
  }

  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const screenId = window.sessionStorage.getItem(STORAGE_LAST_ACTIVE_SCREEN);
      const paramsRaw = window.sessionStorage.getItem(STORAGE_LAST_ACTIVE_PARAMS);
      let params = {};
      if (paramsRaw) {
        try {
          params = JSON.parse(paramsRaw);
        } catch {
          params = {};
        }
      }
      if (screenId) {
        return { screenId, params };
      }
    }
  } catch (err) {
    // Ignore storage read errors
  }

  return { screenId: null, params: {} };
}

/**
 * Computes dashboard metrics directly from the store state.
 * Strictly honest data from store — zero fake or arbitrary metrics.
 * 
 * @param {object} [state] - Current store state
 * @returns {object} Calculated metrics object
 */
export function getDashboardMetrics(state = getState()) {
  const currentState = state || {};
  const notes = Array.isArray(currentState.savedNotes) ? currentState.savedNotes : [];
  const researchItems = Array.isArray(currentState.researchItems) ? currentState.researchItems : [];
  const sources = Array.isArray(currentState.sources) ? currentState.sources : [];
  const concepts = Array.isArray(currentState.concepts) ? currentState.concepts : [];
  const remixSelection = currentState.remixSelection || { content: [], packaging: [] };

  // Vault Summary: separate counts for Saved Content (WHAT) and Saved Packaging (HOW)
  const savedContentCount = notes.filter(n => n.lens === 'content').length;
  const savedPackagingCount = notes.filter(n => n.lens === 'packaging').length;
  const totalSavedNotesCount = notes.length;

  // Recent Research: items currently in inbox / research pipeline
  const recentResearchCount = researchItems.length > 0 ? researchItems.length : sources.length;
  const latestResearchItem = researchItems.length > 0 ? researchItems[researchItems.length - 1] : null;
  const latestSource = sources.length > 0 ? sources[sources.length - 1] : null;

  // Remix Drafts: synthesized concepts
  const remixDraftsCount = concepts.length;
  const latestConcept = concepts.length > 0 ? concepts[concepts.length - 1] : null;

  // Continue Work Target Resolution
  const preserved = getPreservedLastActiveScreen();
  let continueTarget = preserved.screenId;
  let continueParams = preserved.params;
  let continueLabel = 'พร้อมทำงานต่อ';
  let continueSubtext = 'รักษาสเตทเดิมใน Store';

  const selectedContentCount = Array.isArray(remixSelection.content) ? remixSelection.content.length : 0;
  const selectedPackagingCount = Array.isArray(remixSelection.packaging) ? remixSelection.packaging.length : 0;
  const totalBasketCount = selectedContentCount + selectedPackagingCount;

  if (continueTarget) {
    continueLabel = `กลับสู่หน้า ${continueTarget}`;
    continueSubtext = totalBasketCount > 0 
      ? `เลือกไว้: ${totalBasketCount} วัตถุดิบในตะกร้า`
      : 'งานที่เปิดค้างไว้ล่าสุด';
  } else if (totalBasketCount > 0) {
    continueTarget = 'S06';
    continueParams = {};
    continueLabel = 'กลับสู่ Remix Studio';
    continueSubtext = `เลือกไว้: ${totalBasketCount} วัตถุดิบในตะกร้า`;
  } else if (remixDraftsCount > 0) {
    continueTarget = 'S08';
    continueParams = latestConcept ? { conceptId: latestConcept.id } : {};
    continueLabel = 'กลับสู่ Remix Draft ล่าสุด';
    continueSubtext = latestConcept ? latestConcept.title : 'ดูร่างแนวคิด';
  } else if (recentResearchCount > 0) {
    continueTarget = 'S01';
    continueParams = {};
    continueLabel = 'กลับสู่ Research Studio';
    continueSubtext = latestResearchItem ? `${latestResearchItem.status}` : 'ตรวจสอบคลิป';
  } else {
    continueTarget = 'S01';
    continueParams = {};
    continueLabel = 'เริ่มวิจัยคลิปใหม่';
    continueSubtext = 'นำเข้าคลิปแรกเพื่อเริ่มระบบ';
  }

  return {
    vault: {
      contentCount: savedContentCount,
      packagingCount: savedPackagingCount,
      totalCount: totalSavedNotesCount
    },
    research: {
      count: recentResearchCount,
      latestItem: latestResearchItem,
      latestSource
    },
    remix: {
      draftsCount: remixDraftsCount,
      latestConcept
    },
    continueWork: {
      targetScreen: continueTarget,
      params: continueParams,
      label: continueLabel,
      subtext: continueSubtext,
      totalBasketCount
    }
  };
}

/**
 * Resolves the destination screen for the "continue-work" action.
 * @param {object} [state]
 * @returns {{ screenId: string, params: object }}
 */
export function resolveContinueWorkDestination(state = getState()) {
  const metrics = getDashboardMetrics(state);
  return {
    screenId: metrics.continueWork.targetScreen || 'S01',
    params: metrics.continueWork.params || {}
  };
}

/**
 * S00 Overview / Dashboard Controller
 */
export class DashboardController {
  constructor(options = {}) {
    this.root = typeof options.root === 'string' 
      ? (typeof document !== 'undefined' ? document.querySelector(options.root) : null)
      : (options.root || null);

    this.unsubscribeStore = null;
    this.unsubscribeRouter = null;
    this.boundClickHandler = this.handleClick.bind(this);
    this.boundKeyHandler = this.handleKeydown.bind(this);
    this.isInitialized = false;
  }

  /**
   * Initializes the dashboard controller, binds events, and subscribes to store.
   * @param {HTMLElement} [rootElement]
   */
  init(rootElement) {
    if (rootElement) {
      this.root = rootElement;
    } else if (!this.root && typeof document !== 'undefined') {
      this.root = document.querySelector('[data-testid="dashboard-root"]') ||
                  document.getElementById('dashboard-root') ||
                  document.querySelector('#view-overview .dashboard-container') ||
                  document.querySelector('.dashboard-container');
    }

    if (!this.root && typeof document === 'undefined') {
      return this;
    }

    this.bindEvents();
    this.render();

    // Subscribe to central Store updates: numbers update immediately upon Save
    if (typeof subscribeStore === 'function') {
      this.unsubscribeStore = subscribeStore((nextState) => {
        this.render(nextState);
      });
    }

    // Subscribe to Router route changes to record last active screen
    if (router && typeof router.subscribe === 'function') {
      this.unsubscribeRouter = router.subscribe((screenId, params) => {
        if (screenId && screenId !== 'S00' && screenId.toUpperCase() !== 'S00') {
          recordLastActiveScreen(screenId, params);
        } else if (screenId === 'S00' || screenId.toUpperCase() === 'S00') {
          this.render();
        }
      });
    }

    this.initTypewriter();

    this.isInitialized = true;
    return this;
  }

  /**
   * Initializes rotating typewriter animation for the hero heading
   */
  initTypewriter() {
    if (typeof window === 'undefined') return;
    const el = document.getElementById('typewriter-text');
    if (!el) return;

    if (this.typewriterTimer) {
      clearTimeout(this.typewriterTimer);
      this.typewriterTimer = null;
    }

    const phrases = [
      'Actionable Data',
      'Actionable DNA',
      'Original Concepts',
      'Founder Authority',
      'High-Retention Hooks',
      'Strategic Assets'
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 70;

    el.textContent = '';

    const tick = () => {
      const currentPhrase = phrases[phraseIndex];
      if (isDeleting) {
        el.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 35;
      } else {
        el.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 70;
      }

      if (!isDeleting && charIndex === currentPhrase.length) {
        isDeleting = true;
        typingSpeed = 2000; // Pause after completing phrase
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typingSpeed = 350; // Pause before typing next
      }

      this.typewriterTimer = setTimeout(tick, typingSpeed);
    };

    this.typewriterTimer = setTimeout(tick, 200);
  }

  /**
   * Binds user event listeners with event delegation.
   */
  bindEvents() {
    if (!this.root) return;

    this.root.addEventListener('click', this.boundClickHandler);
    this.root.addEventListener('keydown', this.boundKeyHandler);
  }

  /**
   * Unbinds user events and cleans up subscriptions.
   */
  destroy() {
    if (this.root) {
      this.root.removeEventListener('click', this.boundClickHandler);
      this.root.removeEventListener('keydown', this.boundKeyHandler);
    }

    if (typeof this.unsubscribeStore === 'function') {
      this.unsubscribeStore();
      this.unsubscribeStore = null;
    }

    if (typeof this.unsubscribeRouter === 'function') {
      this.unsubscribeRouter();
      this.unsubscribeRouter = null;
    }

    if (this.typewriterTimer) {
      clearTimeout(this.typewriterTimer);
      this.typewriterTimer = null;
    }

    this.isInitialized = false;
  }

  /**
   * Renders and updates all live numbers and dynamic contexts on the dashboard.
   * @param {object} [state]
   */
  render(state = getState()) {
    if (!this.root) return;

    const metrics = getDashboardMetrics(state);

    // 1. Update Vault Summary: Saved Content and Saved Packaging separately
    const contentCountEl = this.root.querySelector('[data-testid="count-saved-content"], #vault-count-content');
    if (contentCountEl) {
      contentCountEl.textContent = String(metrics.vault.contentCount);
    }

    const packagingCountEl = this.root.querySelector('[data-testid="count-saved-packaging"], #vault-count-packaging');
    if (packagingCountEl) {
      packagingCountEl.textContent = String(metrics.vault.packagingCount);
    }

    // 2. Update Recent Research Count & Snippet
    const researchCountEl = this.root.querySelector('[data-testid="count-recent-research"], #recent-research-count');
    if (researchCountEl) {
      researchCountEl.textContent = String(metrics.research.count);
    }

    const researchStatusEl = this.root.querySelector('#recent-research-status');
    const researchDateEl = this.root.querySelector('#recent-research-date');
    const researchTitleEl = this.root.querySelector('#recent-research-title');

    if (metrics.research.latestItem) {
      if (researchStatusEl) researchStatusEl.textContent = metrics.research.latestItem.status || 'Analyzed';
      if (researchDateEl) {
        const d = metrics.research.latestItem.createdAt ? new Date(metrics.research.latestItem.createdAt) : null;
        researchDateEl.textContent = d ? d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) : 'ล่าสุด';
      }
      if (researchTitleEl) {
        researchTitleEl.textContent = metrics.research.latestItem.title || metrics.research.latestItem.url || 'คลิปที่วิจัยล่าสุด';
      }
    } else if (metrics.research.latestSource) {
      if (researchStatusEl) researchStatusEl.textContent = 'วิจัยแล้ว';
      if (researchTitleEl) researchTitleEl.textContent = metrics.research.latestSource.title || 'คลิปอ้างอิงล่าสุด';
    }

    // 3. Update Remix Drafts Count & Snippet
    const remixDraftsCountEl = this.root.querySelector('[data-testid="count-remix-drafts"], #remix-drafts-count');
    if (remixDraftsCountEl) {
      remixDraftsCountEl.textContent = String(metrics.remix.draftsCount);
    }

    const remixTitleEl = this.root.querySelector('#remix-drafts-title');
    const remixDateEl = this.root.querySelector('#remix-drafts-date');
    if (metrics.remix.latestConcept) {
      if (remixTitleEl) remixTitleEl.textContent = metrics.remix.latestConcept.title || 'Original Concept';
      if (remixDateEl) {
        const cd = metrics.remix.latestConcept.createdAt ? new Date(metrics.remix.latestConcept.createdAt) : null;
        remixDateEl.textContent = cd ? cd.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) : 'ล่าสุด';
      }
    }

    // 4. Update Continue Work State
    const continueStageEl = this.root.querySelector('#continue-work-stage-name');
    const continueTitleEl = this.root.querySelector('#continue-work-title');
    const continueSubEl = this.root.querySelector('#continue-work-sub');

    if (continueStageEl) continueStageEl.textContent = metrics.continueWork.label;
    if (continueTitleEl) continueTitleEl.textContent = metrics.continueWork.label;
    if (continueSubEl) continueSubEl.textContent = metrics.continueWork.subtext;
  }

  /**
   * Handles click events for primary buttons and cards.
   * @param {MouseEvent} event 
   */
  handleClick(event) {
    const target = event.target;
    if (!target) return;

    // 1. Primary Action Buttons
    // Button 1: btn-research-a-clip -> S01
    const btnResearch = target.closest('#btn-research-a-clip, [data-testid="btn-research-a-clip"], [data-action="btn-research-a-clip"]');
    if (btnResearch) {
      event.preventDefault();
      this.navigateTo('S01');
      return;
    }

    // Button 2: btn-open-library -> S04
    const btnLibrary = target.closest('#btn-open-library, [data-testid="btn-open-library"], [data-action="btn-open-library"]');
    if (btnLibrary) {
      event.preventDefault();
      this.navigateTo('S04');
      return;
    }

    // Button 3: btn-start-remix -> S06
    const btnRemix = target.closest('#btn-start-remix, [data-testid="btn-start-remix"], [data-action="btn-start-remix"]');
    if (btnRemix) {
      event.preventDefault();
      this.navigateTo('S06');
      return;
    }

    // Continue Work CTA button
    const btnContinue = target.closest('#btn-continue-work, [data-testid="btn-continue-work"], [data-action="continue-work"]');
    if (btnContinue) {
      event.preventDefault();
      this.handleContinueWork();
      return;
    }

    // 2. Interactive Operational Cards
    const cardContinue = target.closest('#card-continue-work, [data-testid="continue-work"]');
    if (cardContinue) {
      event.preventDefault();
      this.handleContinueWork();
      return;
    }

    const cardResearch = target.closest('#card-recent-research, [data-testid="recent-research"]');
    if (cardResearch) {
      event.preventDefault();
      const state = getState();
      const hasAnalyzed = state?.researchItems?.some(ri => ri.status && ri.status.includes('Analyzed'));
      this.navigateTo(hasAnalyzed ? 'S02' : 'S01');
      return;
    }

    const cardVault = target.closest('#card-vault-summary, [data-testid="vault-summary"]');
    if (cardVault) {
      event.preventDefault();
      this.navigateTo('S04');
      return;
    }

    const cardRemixDrafts = target.closest('#card-remix-drafts, [data-testid="remix-drafts"]');
    if (cardRemixDrafts) {
      event.preventDefault();
      const state = getState();
      const hasConcepts = Array.isArray(state?.concepts) && state.concepts.length > 0;
      this.navigateTo(hasConcepts ? 'S08' : 'S06');
      return;
    }
  }

  /**
   * Keyboard accessibility for cards and buttons (Enter / Space).
   * @param {KeyboardEvent} event 
   */
  handleKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      const activeEl = document?.activeElement;
      if (activeEl && this.root?.contains(activeEl)) {
        if (activeEl.matches('.summary-card, .btn-pill, [role="button"]')) {
          event.preventDefault();
          activeEl.click();
        }
      }
    }
  }

  /**
   * Executes continue-work logic: restores preserved state or resolves best next step.
   */
  handleContinueWork() {
    const destination = resolveContinueWorkDestination();
    this.navigateTo(destination.screenId, destination.params);
  }

  /**
   * Navigates safely via router or window fallback.
   * @param {string} screenId 
   * @param {object} [params={}] 
   */
  navigateTo(screenId, params = {}) {
    if (router && typeof router.go === 'function') {
      router.go(screenId, params);
      return;
    }
    if (typeof routerGo === 'function') {
      routerGo(screenId, params);
      return;
    }
    if (typeof window !== 'undefined' && window.router && typeof window.router.go === 'function') {
      window.router.go(screenId, params);
      return;
    }
    if (typeof window !== 'undefined' && typeof window.location !== 'undefined') {
      window.location.hash = `#${screenId.toLowerCase()}`;
    }
  }
}

// Singleton Controller Instance
export const dashboardController = new DashboardController();

/**
 * Initializes the dashboard module on a container.
 * @param {HTMLElement|string} [container] 
 * @returns {DashboardController}
 */
export function initDashboard(container) {
  const root = typeof container === 'string'
    ? (typeof document !== 'undefined' ? document.querySelector(container) : null)
    : (container || null);

  return dashboardController.init(root);
}

/**
 * Destroys the dashboard controller instance.
 */
export function destroyDashboard() {
  dashboardController.destroy();
}

/**
 * Standalone helper to trigger a dashboard re-render.
 * @param {object} [state]
 */
export function updateDashboard(state) {
  dashboardController.render(state);
}

// Auto-initialize in browser environment if DOM is ready
if (typeof window !== 'undefined') {
  window.DashboardController = DashboardController;
  window.dashboardController = dashboardController;
  window.initDashboard = initDashboard;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initDashboard();
    });
  } else {
    initDashboard();
  }
}
