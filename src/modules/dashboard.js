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
                  document.querySelector('.dashboard-container') ||
                  document.getElementById('view-overview') ||
                  document.getElementById('screen-s00') ||
                  document.querySelector('[data-screen="S00"]');
    }

    if (!this.root && typeof document === 'undefined') {
      return this;
    }

    this.bindEvents();
    this.applyBrightCardTheme();
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
          this.applyBrightCardTheme();
          this.render();
        }
      });
    }

    this.initTypewriter();

    this.isInitialized = true;
    return this;
  }

  /**
   * Ensures all cards in S00 Dashboard & Overview have bright, airy colors
   */
  applyBrightCardTheme() {
    if (typeof document === 'undefined') return;

    const styleId = 'mew-s00-bright-card-theme';
    let styleEl = document.getElementById(styleId);
    const targetParent = document.body || document.head;
    if (!styleEl && targetParent) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      targetParent.appendChild(styleEl);
    } else if (styleEl && document.body && styleEl.parentNode !== document.body) {
      document.body.appendChild(styleEl);
    }
    if ( styleEl ) {
      styleEl.textContent = `
        html body #view-overview#view-overview,
        html body #screen-s00#screen-s00,
        html body [data-screen="S00"][data-screen="S00"],
        html body #view-overview,
        html body #screen-s00,
        html body [data-screen="S00"],
        #view-overview,
        #screen-s00,
        [data-screen="S00"],
        #dashboard-root,
        .dashboard-container {
          --bg-primary: #ffffff !important;
          --bg-secondary: #ffffff !important;
          --bg-tertiary: #f8fffc !important;
          --bg-elevated: #ffffff !important;
          --bg-surface: #ffffff !important;
          --bg-panel: #ffffff !important;
          --bg-card: #ffffff !important;
          --bg-card-hover: #ffffff !important;
          --bg-glass: rgba(255, 255, 255, 1) !important;
          --card-bg: #ffffff !important;
          --surface-bg: #ffffff !important;
          --panel-bg: #ffffff !important;
          --mew-surface: #ffffff !important;
          --mew-card: #ffffff !important;
          --mew-bg: #ffffff !important;
          --surface-1: #ffffff !important;
          --surface-2: #ffffff !important;
          --surface-3: #f0fdf4 !important;
          --text-primary: #0f172a !important;
          --text-secondary: #1e293b !important;
          --text-muted: #334155 !important;
          --border-color: #a7f3d0 !important;
          --border-subtle: #d1fae5 !important;
          background: #ffffff !important;
          background-color: #ffffff !important;
          background-image: radial-gradient(circle at 50% 0%, #ffffff 0%, #ffffff 90%, #f0fdf4 100%) !important;
          color: #0f172a !important;
        }
        html body #view-overview#view-overview .dashboard-hero,
        html body #view-overview .dashboard-hero,
        html body #screen-s00 .dashboard-hero,
        html body [data-screen="S00"] .dashboard-hero,
        #view-overview .dashboard-hero,
        #dashboard-root .dashboard-hero,
        .dashboard-container .dashboard-hero {
          background: linear-gradient(135deg, #ffffff 0%, #ffffff 94%, #f8fffc 100%) !important;
          background-color: #ffffff !important;
          border: 1.5px solid #a7f3d0 !important;
          border-top: 4px solid #34d399 !important;
          border-radius: 24px !important;
          padding: 32px 36px !important;
          box-shadow: 0 12px 32px rgba(52, 211, 153, 0.14), 0 4px 12px rgba(52, 211, 153, 0.06), inset 0 0 0 2px #ffffff, inset 0 0 36px #ffffff !important;
          color: #0f172a !important;
          filter: brightness(1.02) !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
        }
        #view-overview .dashboard-hero .hero-content,
        .dashboard-container .dashboard-hero .hero-content {
          display: flex !important;
          flex-direction: column !important;
          gap: 14px !important;
          max-width: 860px !important;
          margin: 0 !important;
        }
        #view-overview .dashboard-hero .hero-eyebrow-row,
        .dashboard-container .dashboard-hero .hero-eyebrow-row {
          display: flex !important;
          flex-wrap: wrap !important;
          align-items: center !important;
          gap: 10px !important;
          margin-bottom: 2px !important;
        }
        #view-overview .dashboard-hero .badge-kicker,
        #view-overview .dashboard-hero .badge-pill,
        .dashboard-container .dashboard-hero .badge-kicker,
        .dashboard-container .dashboard-hero .badge-pill {
          display: inline-flex !important;
          align-items: center !important;
          gap: 6px !important;
          padding: 5px 12px !important;
          border-radius: 999px !important;
          font-size: 0.75rem !important;
          font-weight: 700 !important;
          line-height: 1.25 !important;
          background: #f0fdf4 !important;
          color: #059669 !important;
          border: 1px solid #a7f3d0 !important;
          box-shadow: 0 2px 6px rgba(52, 211, 153, 0.08) !important;
        }
        #view-overview .dashboard-hero .hero-title,
        .dashboard-container .dashboard-hero .hero-title {
          color: #0f172a !important;
          margin: 0 !important;
          line-height: 1.2 !important;
        }
        #view-overview .dashboard-hero #typewriter-text,
        .dashboard-container .dashboard-hero #typewriter-text,
        #view-overview .dashboard-hero .mew-gradient-text,
        .dashboard-container .dashboard-hero .mew-gradient-text {
          color: #10b981 !important;
          background: linear-gradient(135deg, #10b981 0%, #34d399 100%) !important;
          -webkit-background-clip: text !important;
          background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
          border-right: 3px solid #34d399 !important;
          padding-right: 4px !important;
          animation: mew-caret-blink 0.85s step-end infinite !important;
        }
        @keyframes mew-caret-blink {
          from, to { border-color: transparent; }
          50% { border-color: #34d399; }
        }
        #view-overview .dashboard-hero .hero-subtitle,
        .dashboard-container .dashboard-hero .hero-subtitle {
          color: #334155 !important;
          margin: 0 !important;
          line-height: 1.65 !important;
          font-size: 1.02rem !important;
        }
        #view-overview .dashboard-hero .hero-subtitle strong,
        .dashboard-container .dashboard-hero .hero-subtitle strong {
          color: #059669 !important;
          background: #f0fdf4 !important;
          border: 1px solid #a7f3d0 !important;
          padding: 1px 6px !important;
          border-radius: 6px !important;
        }
        #view-overview .dashboard-hero .hero-actions,
        #dashboard-root .dashboard-hero .hero-actions,
        .dashboard-container .dashboard-hero .hero-actions {
          display: none !important;
        }
        #view-overview .summary-grid,
        .dashboard-container .summary-grid {
          display: grid !important;
          grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
          gap: 18px !important;
          align-items: stretch !important;
          margin-top: 24px !important;
        }
        @media (max-width: 1100px) {
          #view-overview .summary-grid,
          .dashboard-container .summary-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: 640px) {
          #view-overview .summary-grid,
          .dashboard-container .summary-grid {
            grid-template-columns: minmax(0, 1fr) !important;
          }
        }
        html body #view-overview#view-overview .summary-card,
        html body #view-overview#view-overview .mew-offer-card,
        html body #view-overview#view-overview .panel-card,
        html body #view-overview#view-overview .card,
        html body #view-overview#view-overview .dashboard-card,
        html body #view-overview#view-overview .overview-card,
        html body #view-overview#view-overview .stat-card,
        html body #view-overview#view-overview .kpi-card,
        html body #view-overview#view-overview .bento-card,
        html body #view-overview#view-overview .coral-accent,
        html body #view-overview#view-overview .violet-bar,
        html body #view-overview#view-overview .violet-accent,
        html body #view-overview#view-overview .ink-accent,
        html body #view-overview .summary-card,
        html body #view-overview .mew-offer-card,
        html body #view-overview .panel-card,
        html body #view-overview .summary-grid > [data-navigate="research"],
        html body #view-overview .summary-grid > [data-navigate="library"],
        html body #view-overview .summary-grid > [data-navigate="remix"],
        #view-overview .summary-card,
        #view-overview .mew-offer-card,
        #view-overview .panel-card,
        #view-overview .summary-grid > article,
        #view-overview .summary-grid > div,
        #view-overview #card-recent-research,
        #view-overview #card-vault-summary,
        #view-overview #card-remix-drafts,
        #view-overview #card-continue-work,
        #dashboard-root .summary-card,
        #dashboard-root .mew-offer-card,
        #dashboard-root .panel-card,
        .dashboard-container .summary-card,
        .dashboard-container .mew-offer-card,
        .dashboard-container .panel-card {
          background: #ffffff !important;
          background-color: #ffffff !important;
          background-image: linear-gradient(135deg, #ffffff 0%, #ffffff 95%, #f8fffc 100%) !important;
          border: 1.5px solid #a7f3d0 !important;
          border-top: 4px solid #34d399 !important;
          border-radius: 20px !important;
          box-shadow: 0 12px 30px rgba(52, 211, 153, 0.14), 0 4px 10px rgba(52, 211, 153, 0.06), inset 0 0 0 2px #ffffff, inset 0 0 36px #ffffff !important;
          color: #0f172a !important;
          opacity: 1 !important;
          filter: brightness(1.02) !important;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease !important;
        }
        html body #view-overview .summary-card-inner,
        html body #view-overview .summary-card-header,
        html body #view-overview .summary-card-footer,
        html body #view-overview .vault-breakdown-container,
        .dashboard-container .summary-card-inner,
        .dashboard-container .summary-card-header,
        .dashboard-container .summary-card-footer,
        .dashboard-container .vault-breakdown-container {
          background: transparent !important;
          background-color: transparent !important;
          background-image: none !important;
          border: none !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          filter: none !important;
          color: #0f172a !important;
        }
        html body #view-overview .summary-card-footer,
        .dashboard-container .summary-card-footer {
          border-top: 1px solid #dcfce7 !important;
        }
        #view-overview .summary-card:hover,
        .dashboard-container .summary-card:hover,
        #view-overview .mew-offer-card:hover,
        .dashboard-container .mew-offer-card:hover {
          background: #ffffff !important;
          background-image: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%) !important;
          border-color: #34d399 !important;
          box-shadow: 0 18px 40px rgba(52, 211, 153, 0.2), 0 4px 12px rgba(52, 211, 153, 0.08), inset 0 0 36px #ffffff, inset 0 0 0 2px #ffffff !important;
          transform: translateY(-2px);
        }
        #view-overview .summary-card::before,
        #view-overview .summary-card::after,
        #view-overview .mew-offer-card::before,
        #view-overview .mew-offer-card::after,
        #view-overview .panel-card::before,
        #view-overview .panel-card::after,
        .dashboard-container .summary-card::before,
        .dashboard-container .summary-card::after,
        .dashboard-container .mew-offer-card::before,
        .dashboard-container .mew-offer-card::after {
          background: none !important;
          opacity: 0 !important;
          display: none !important;
        }
        html body #view-overview .card-preview-box,
        html body #view-overview .card-preview-box.continue-box,
        html body #view-overview .vault-sub-stat,
        html body #view-overview .pipeline-item,
        html body #view-overview .empty-state,
        .dashboard-container .card-preview-box,
        .dashboard-container .card-preview-box.continue-box,
        .dashboard-container .vault-sub-stat,
        .dashboard-container .pipeline-item,
        .dashboard-container .empty-state {
          background: #ffffff !important;
          background-color: #ffffff !important;
          background-image: linear-gradient(135deg, #ffffff 0%, #ffffff 94%, #f8fffc 100%) !important;
          border: 1.5px solid #a7f3d0 !important;
          box-shadow: 0 4px 14px rgba(52, 211, 153, 0.1), inset 0 0 28px #ffffff !important;
          color: #0f172a !important;
        }
        html body #view-overview .summary-card-title,
        html body #view-overview .preview-item-title,
        html body #view-overview .continue-context-headline,
        .dashboard-container .summary-card-title,
        .dashboard-container .preview-item-title,
        .dashboard-container .continue-context-headline {
          color: #0f172a !important;
          background: transparent !important;
          background-color: transparent !important;
          background-image: none !important;
          border: none !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          filter: none !important;
          padding: 0 !important;
          margin: 0 !important;
          width: 100% !important;
          text-align: left !important;
          line-height: 1.35 !important;
        }
        html body #view-overview .vault-stat-label,
        .dashboard-container .vault-stat-label {
          color: #0f172a !important;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          margin: 0 !important;
          width: auto !important;
          flex: 1 1 auto !important;
          text-align: left !important;
          line-height: 1.35 !important;
          font-weight: 600 !important;
        }
        html body #view-overview .summary-card-desc,
        html body #view-overview .summary-metric-unit,
        html body #view-overview .vault-stat-unit,
        .dashboard-container .summary-card-desc,
        .dashboard-container .summary-metric-unit,
        .dashboard-container .vault-stat-unit {
          color: #334155 !important;
          background: transparent !important;
          background-color: transparent !important;
          background-image: none !important;
          border: none !important;
          border-radius: 0 !important;
          box-shadow: none !important;
          filter: none !important;
          padding: 0 !important;
          margin: 0 !important;
          text-align: left !important;
          line-height: 1.55 !important;
        }
        html body #view-overview .summary-metric-number,
        html body #view-overview .vault-stat-number,
        html body #view-overview .footer-action-label,
        html body #view-overview .footer-arrow,
        .dashboard-container .summary-metric-number,
        .dashboard-container .vault-stat-number,
        .dashboard-container .footer-action-label,
        .dashboard-container .footer-arrow {
          color: #10b981 !important;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        #view-overview .summary-card .summary-icon-wrap,
        .dashboard-container .summary-card .summary-icon-wrap {
          width: 40px !important;
          height: 40px !important;
          min-width: 40px !important;
          border-radius: 12px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          flex-shrink: 0 !important;
          background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%) !important;
          background-color: #ffffff !important;
          color: #10b981 !important;
          border: 1.5px solid #a7f3d0 !important;
        }
        #view-overview .summary-card .badge-pill,
        #view-overview .summary-status-pill,
        #view-overview .preview-badge,
        #view-overview .vault-stat-tag,
        .dashboard-container .summary-card .badge-pill,
        .dashboard-container .summary-status-pill,
        .dashboard-container .preview-badge,
        .dashboard-container .vault-stat-tag {
          background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%) !important;
          background-color: #ffffff !important;
          color: #059669 !important;
          border: 1px solid #a7f3d0 !important;
        }
        #view-overview .btn-continue-work,
        .dashboard-container .btn-continue-work {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          gap: 8px !important;
          width: 100% !important;
          padding: 10px 16px !important;
          border-radius: 999px !important;
          font-size: 0.875rem !important;
          font-weight: 700 !important;
          cursor: pointer !important;
          background: linear-gradient(135deg, #34d399 0%, #10b981 100%) !important;
          color: #ffffff !important;
          border: none !important;
          box-shadow: 0 6px 18px rgba(52, 211, 153, 0.35) !important;
        }
        #view-overview .btn-continue-work span,
        #view-overview .btn-continue-work .footer-arrow,
        .dashboard-container .btn-continue-work span,
        .dashboard-container .btn-continue-work .footer-arrow {
          color: #ffffff !important;
        }
        #view-overview .summary-status-pill,
        .dashboard-container .summary-status-pill {
          display: inline-flex !important;
          align-items: center !important;
          gap: 6px !important;
          padding: 5px 12px !important;
          border-radius: 999px !important;
          font-size: 0.8125rem !important;
          font-weight: 700 !important;
          line-height: 1.25 !important;
        }
        #view-overview .status-dot.green,
        .dashboard-container .status-dot.green {
          width: 8px !important;
          height: 8px !important;
          border-radius: 999px !important;
          background: #34d399 !important;
          display: inline-block !important;
          flex-shrink: 0 !important;
        }
        .card-step-kicker {
          display: inline !important;
          font-weight: 800 !important;
          letter-spacing: 0.02em !important;
          color: #059669 !important;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        #card-recent-research[data-step="ข้อ 1"],
        .card-recent-research[data-step="ข้อ 1"],
        [data-step="ข้อ 1"] {
          border-top: 4px solid #34d399 !important;
          border-radius: 20px !important;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease !important;
        }
        #card-recent-research[data-step="ข้อ 1"]:hover,
        .card-recent-research[data-step="ข้อ 1"]:hover,
        [data-step="ข้อ 1"]:hover {
          border-color: #34d399 !important;
          box-shadow: 0 18px 40px rgba(52, 211, 153, 0.22), 0 4px 12px rgba(52, 211, 153, 0.08), inset 0 0 36px #ffffff !important;
          transform: translateY(-2px) !important;
        }
        html body #view-overview .summary-card,
        .dashboard-container .summary-card,
        html body #view-overview #card-recent-research,
        html body #view-overview #card-vault-summary,
        html body #view-overview #card-remix-drafts,
        html body #view-overview #card-continue-work,
        html body #view-overview .summary-grid > [data-navigate="research"],
        .dashboard-container #card-recent-research {
          position: relative;
          border-top: 4px solid #34d399 !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-between !important;
          align-items: stretch !important;
          gap: 12px !important;
          padding: 24px !important;
          box-sizing: border-box !important;
          text-align: left !important;
          overflow: hidden !important;
        }
        html body #view-overview .summary-card-inner,
        .dashboard-container .summary-card-inner {
          display: flex !important;
          flex-direction: column !important;
          justify-content: flex-start !important;
          align-items: stretch !important;
          flex: 1 1 auto !important;
          gap: 12px !important;
          width: 100% !important;
          height: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
          box-sizing: border-box !important;
          text-align: left !important;
        }
        html body #view-overview .summary-card-header,
        .dashboard-container .summary-card-header {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          justify-content: space-between !important;
          gap: 10px !important;
          width: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
          box-sizing: border-box !important;
        }
        html body #view-overview .summary-card .badge-pill,
        .dashboard-container .summary-card .badge-pill {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 4px !important;
          padding: 5px 12px !important;
          margin: 0 !important;
          border-radius: 999px !important;
          line-height: 1.25 !important;
          white-space: nowrap !important;
          text-align: center !important;
          box-sizing: border-box !important;
          flex-shrink: 0 !important;
        }
        html body #view-overview .summary-metric-row,
        .dashboard-container .summary-metric-row {
          display: flex !important;
          flex-direction: row !important;
          align-items: baseline !important;
          justify-content: flex-start !important;
          gap: 8px !important;
          width: 100% !important;
          padding: 0 !important;
          margin: 2px 0 !important;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          box-sizing: border-box !important;
          text-align: left !important;
        }
        html body #view-overview .summary-metric-number,
        .dashboard-container .summary-metric-number {
          font-size: 2.25rem !important;
          font-weight: 800 !important;
          line-height: 1 !important;
          color: #10b981 !important;
          font-family: var(--v6-font-num, 'Inter', sans-serif) !important;
          letter-spacing: -0.02em !important;
        }
        html body #view-overview .summary-metric-unit,
        .dashboard-container .summary-metric-unit {
          font-size: 0.875rem !important;
          font-weight: 600 !important;
          line-height: 1.2 !important;
          color: #475569 !important;
          align-self: baseline !important;
        }
        html body #view-overview .summary-card-title,
        .dashboard-container .summary-card-title {
          font-size: 1.125rem !important;
          font-weight: 700 !important;
          color: #0f172a !important;
          line-height: 1.35 !important;
          margin: 0 !important;
          padding: 0 !important;
          text-align: left !important;
          letter-spacing: -0.01em !important;
        }
        html body #view-overview .summary-card-desc,
        .dashboard-container .summary-card-desc {
          font-size: 0.875rem !important;
          color: #475569 !important;
          line-height: 1.55 !important;
          margin: 0 !important;
          padding: 0 !important;
          text-align: left !important;
        }
        html body #view-overview .card-preview-box,
        .dashboard-container .card-preview-box {
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          align-items: stretch !important;
          gap: 8px !important;
          padding: 12px 14px !important;
          border-radius: 12px !important;
          background: #ffffff !important;
          border: 1.5px solid #bbf7d0 !important;
          box-shadow: 0 4px 16px rgba(52, 211, 153, 0.1), inset 0 0 18px #ffffff !important;
          width: 100% !important;
          box-sizing: border-box !important;
          margin: auto 0 0 0 !important;
          text-align: left !important;
        }
        html body #view-overview .vault-breakdown-container,
        .dashboard-container .vault-breakdown-container {
          display: grid !important;
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          gap: 10px !important;
          width: 100% !important;
          margin: auto 0 0 0 !important;
          box-sizing: border-box !important;
        }
        html body #view-overview .vault-sub-stat,
        .dashboard-container .vault-sub-stat {
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-between !important;
          gap: 6px !important;
          padding: 10px 12px !important;
          border-radius: 12px !important;
          box-sizing: border-box !important;
        }
        html body #view-overview .vault-sub-header,
        .dashboard-container .vault-sub-header {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          flex-wrap: wrap !important;
          gap: 4px !important;
          width: 100% !important;
        }
        html body #view-overview .vault-stat-metric,
        .dashboard-container .vault-stat-metric {
          display: flex !important;
          align-items: baseline !important;
          gap: 6px !important;
          margin-top: 2px !important;
        }
        html body #view-overview .vault-stat-number,
        .dashboard-container .vault-stat-number {
          font-size: 1.5rem !important;
          font-weight: 800 !important;
          line-height: 1 !important;
          color: #10b981 !important;
        }
        html body #view-overview .vault-stat-unit,
        .dashboard-container .vault-stat-unit {
          font-size: 0.75rem !important;
          font-weight: 600 !important;
          color: #475569 !important;
        }
        html body #view-overview .vault-stat-tag,
        .dashboard-container .vault-stat-tag {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 2px 7px !important;
          border-radius: 999px !important;
          font-size: 0.65rem !important;
          font-weight: 700 !important;
          line-height: 1.2 !important;
        }
        html body #view-overview .preview-item-meta,
        .dashboard-container .preview-item-meta {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          gap: 8px !important;
          width: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
          box-sizing: border-box !important;
        }
        html body #view-overview .preview-item-title,
        .dashboard-container .preview-item-title {
          font-size: 0.875rem !important;
          font-weight: 600 !important;
          color: #0f172a !important;
          line-height: 1.45 !important;
          width: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
          text-align: left !important;
          word-break: break-word !important;
          white-space: normal !important;
          display: -webkit-box !important;
          -webkit-line-clamp: 2 !important;
          -webkit-box-orient: vertical !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }
        #view-overview .preview-badge,
        .dashboard-container .preview-badge {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 3px 10px !important;
          border-radius: 999px !important;
          font-size: 0.6875rem !important;
          font-weight: 700 !important;
          line-height: 1.25 !important;
          white-space: nowrap !important;
          background: #f0fdf4 !important;
          color: #059669 !important;
          border: 1px solid #a7f3d0 !important;
        }
        #view-overview .preview-date,
        .dashboard-container .preview-date {
          font-size: 0.75rem !important;
          font-weight: 500 !important;
          color: #10b981 !important;
        }
        #view-overview .summary-card-footer,
        .dashboard-container .summary-card-footer {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          padding-top: 14px !important;
          margin-top: auto !important;
          border-top: 1px solid #dcfce7 !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        #view-overview .panel-card .pipeline-item-meta,
        .dashboard-container .panel-card .pipeline-item-meta {
          display: flex !important;
          flex-wrap: wrap !important;
          align-items: center !important;
          gap: 8px !important;
          color: #6b7280 !important;
          font-size: 0.8125rem !important;
        }
        #view-overview .panel-card .pipeline-item-meta span,
        #view-overview .panel-card .pipeline-item-meta .pipeline-item-tag,
        #view-overview .panel-card .pipeline-item-meta .badge-pill,
        #view-overview .panel-card .pipeline-item-meta .pipeline-item-time,
        .dashboard-container .panel-card .pipeline-item-meta span,
        .dashboard-container .panel-card .pipeline-item-meta .pipeline-item-tag,
        .dashboard-container .panel-card .pipeline-item-meta .badge-pill,
        .dashboard-container .panel-card .pipeline-item-meta .pipeline-item-time {
          background: transparent !important;
          background-color: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          border-radius: 0 !important;
          color: #6b7280 !important;
          font-weight: 400 !important;
          font-size: 0.8125rem !important;
        }
      `;
    }

    const containers = [];
    if (this.root) containers.push(this.root);
    const allS00 = document.querySelectorAll('#view-overview, #dashboard-root, .dashboard-container, #screen-s00, [data-screen="S00"], [data-testid="dashboard-root"]');
    allS00.forEach((el) => {
      if (!containers.includes(el)) containers.push(el);
    });

    containers.forEach((container) => {
      container.style.setProperty('--bg-card', '#ffffff', 'important');
      container.style.setProperty('--card-bg', '#ffffff', 'important');
      container.style.setProperty('--surface-bg', '#ffffff', 'important');
      container.style.setProperty('--mew-surface', '#ffffff', 'important');
      container.style.setProperty('background', '#ffffff', 'important');
      container.style.setProperty('background-color', '#ffffff', 'important');
      container.style.setProperty('opacity', '1', 'important');
      container.style.setProperty('filter', 'none', 'important');

      const heroes = container.querySelectorAll('.dashboard-hero');
      heroes.forEach((hero) => {
        hero.style.setProperty('background', 'linear-gradient(135deg, #ffffff 0%, #ffffff 94%, #f8fffc 100%)', 'important');
        hero.style.setProperty('background-color', '#ffffff', 'important');
        hero.style.setProperty('border', '1.5px solid #a7f3d0', 'important');
        hero.style.setProperty('border-top', '4px solid #34d399', 'important');
        hero.style.setProperty('border-radius', '24px', 'important');
        hero.style.setProperty('padding', '32px 36px', 'important');
        hero.style.setProperty('box-shadow', '0 12px 32px rgba(52, 211, 153, 0.14), 0 4px 12px rgba(52, 211, 153, 0.06), inset 0 0 0 2px #ffffff, inset 0 0 36px #ffffff', 'important');
        hero.style.setProperty('color', '#0f172a', 'important');
        hero.style.setProperty('filter', 'brightness(1.02)', 'important');
      });

      const heroActions = container.querySelectorAll('.dashboard-hero .hero-actions');
      heroActions.forEach((actions) => {
        actions.style.setProperty('display', 'none', 'important');
        actions.setAttribute('aria-hidden', 'true');
      });

      const cards = container.querySelectorAll('.summary-card, .mew-offer-card, .panel-card, .card, .dashboard-card, .overview-card, .stat-card, .kpi-card, .bento-card, [data-testid="recent-research"], [data-testid="vault-summary"], [data-testid="remix-drafts"], [data-testid="continue-work"], #card-recent-research, #card-vault-summary, #card-remix-drafts, #card-continue-work, .summary-grid > article, .summary-grid > div');
      cards.forEach((card) => {
        if (card.classList.contains('summary-card-inner') || card.classList.contains('summary-card-header') || card.classList.contains('summary-card-footer') || card.classList.contains('card-preview-box') || card.classList.contains('card-step-kicker') || card.classList.contains('summary-card-title') || card.classList.contains('summary-card-desc')) return;
        if (card.parentElement && card.parentElement.closest('.summary-card, .mew-offer-card')) return;
        card.style.setProperty('background', '#ffffff', 'important');
        card.style.setProperty('background-color', '#ffffff', 'important');
        card.style.setProperty('background-image', 'linear-gradient(135deg, #ffffff 0%, #ffffff 95%, #f8fffc 100%)', 'important');
        card.style.setProperty('border', '1.5px solid #a7f3d0', 'important');
        card.style.setProperty('border-top', '4px solid #34d399', 'important');
        card.style.setProperty('border-radius', '20px', 'important');
        card.style.setProperty('box-shadow', '0 12px 30px rgba(52, 211, 153, 0.14), 0 4px 10px rgba(52, 211, 153, 0.06), inset 0 0 0 2px #ffffff, inset 0 0 36px #ffffff', 'important');
        card.style.setProperty('color', '#0f172a', 'important');
        card.style.setProperty('opacity', '1', 'important');
        card.style.setProperty('filter', 'brightness(1.02)', 'important');
        if (card.classList.contains('summary-card') || card.closest('.summary-grid')) {
          card.style.setProperty('display', 'flex', 'important');
          card.style.setProperty('flex-direction', 'column', 'important');
          card.style.setProperty('justify-content', 'space-between', 'important');
          card.style.setProperty('align-items', 'stretch', 'important');
          card.style.setProperty('gap', '12px', 'important');
          card.style.setProperty('padding', '24px', 'important');
          card.style.setProperty('box-sizing', 'border-box', 'important');
          card.style.setProperty('text-align', 'left', 'important');
        }
      });

      const summaryCards = container.querySelectorAll('.summary-grid > article, .summary-grid > div, .summary-card');
      const stepMap = [
        { selector: '#card-recent-research, [data-testid="recent-research"], .summary-grid > [data-navigate="research"]', label: 'ข้อ 1', idx: 0 },
        { selector: '#card-vault-summary, [data-testid="vault-summary"], .summary-grid > [data-navigate="library"]', label: 'ข้อ 2', idx: 1 },
        { selector: '#card-remix-drafts, [data-testid="remix-drafts"], .summary-grid > [data-navigate="remix"]', label: 'ข้อ 3', idx: 2 },
        { selector: '#card-continue-work, [data-testid="continue-work"]', label: 'ข้อ 4', idx: 3 }
      ];
      stepMap.forEach(({ selector, label, idx }) => {
        const cardEl = container.querySelector(selector) || summaryCards[idx];
        if (!cardEl) return;
        cardEl.setAttribute('data-step', label);
        const badgeEl = cardEl.querySelector('.summary-card-header .badge-pill, .badge-pill');
        if (badgeEl && !badgeEl.querySelector('.card-step-kicker') && !badgeEl.textContent.includes(label)) {
          const rawText = badgeEl.textContent.trim();
          badgeEl.innerHTML = `<strong class="card-step-kicker">${label}</strong> · ${rawText}`;
        }
      });

      const cardInners = container.querySelectorAll('.summary-card-inner, .summary-card-header, .summary-card-footer, .vault-breakdown-container, .summary-card-title, .summary-card-desc, .summary-metric-row, .summary-metric-number, .summary-metric-unit, .vault-stat-unit, .vault-stat-number, .vault-stat-label, .card-step-kicker');
      cardInners.forEach((inner) => {
        inner.style.setProperty('background', 'transparent', 'important');
        inner.style.setProperty('background-color', 'transparent', 'important');
        inner.style.setProperty('background-image', 'none', 'important');
        if (!inner.classList.contains('summary-card-footer')) {
          inner.style.setProperty('border', 'none', 'important');
        }
        inner.style.setProperty('border-radius', '0', 'important');
        inner.style.setProperty('box-shadow', 'none', 'important');
        inner.style.setProperty('filter', 'none', 'important');
      });

      const subBoxes = container.querySelectorAll('.card-preview-box, .continue-box, .vault-sub-stat, .pipeline-item, .vault-mini-card, .mini-card, .empty-state');
      subBoxes.forEach((box) => {
        box.style.setProperty('background', '#ffffff', 'important');
        box.style.setProperty('background-color', '#ffffff', 'important');
        box.style.setProperty('background-image', 'linear-gradient(135deg, #ffffff 0%, #ffffff 94%, #f8fffc 100%)', 'important');
        box.style.setProperty('border', '1.5px solid #a7f3d0', 'important');
        box.style.setProperty('border-radius', '12px', 'important');
        box.style.setProperty('box-shadow', '0 4px 14px rgba(52, 211, 153, 0.1), inset 0 0 28px #ffffff', 'important');
        box.style.setProperty('color', '#0f172a', 'important');
      });
    });
  }

  /**
   * Initializes rotating typewriter animation for the hero heading
   */
  initTypewriter() {
    if (typeof window === 'undefined') return;
    let el = (this.root && this.root.querySelector('#typewriter-text')) ||
             document.getElementById('typewriter-text') ||
             (this.root && this.root.querySelector('.hero-title .mew-gradient-text'));
    if (!el && typeof document !== 'undefined') {
      const heroTitle = (this.root && this.root.querySelector('#overview-heading, .hero-title, .dashboard-hero h1')) ||
                        document.getElementById('overview-heading');
      if (heroTitle) {
        let existingSpan = heroTitle.querySelector('span, em');
        if (!existingSpan && heroTitle.textContent && heroTitle.textContent.includes('into ')) {
          const parts = heroTitle.textContent.split('into ');
          heroTitle.innerHTML = `${parts[0]}into <span id="typewriter-text" class="mew-gradient-text">${parts.slice(1).join('into ').trim() || 'Actionable DNA'}</span>`;
          existingSpan = heroTitle.querySelector('#typewriter-text');
        }
        if (existingSpan) {
          existingSpan.id = 'typewriter-text';
          existingSpan.classList.add('mew-gradient-text');
          el = existingSpan;
        }
      }
    }
    if (!el) return;

    if (this.typewriterTimer) {
      clearTimeout(this.typewriterTimer);
      this.typewriterTimer = null;
    }

    const phrases = [
      'Actionable DNA',
      'Actionable Data',
      'Original Concepts',
      'Founder Authority',
      'High-Retention Hooks',
      'Strategic Assets'
    ];
    let phraseIndex = 0;
    let charIndex = phrases[0].length;
    let isDeleting = true;
    let typingSpeed = 70;

    el.textContent = phrases[0];

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

    this.typewriterTimer = setTimeout(tick, 1800);
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

    this.applyBrightCardTheme();
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
      if (researchDateEl) {
        const sd = metrics.research.latestSource.createdAt ? new Date(metrics.research.latestSource.createdAt) : null;
        researchDateEl.textContent = sd ? sd.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) : 'ล่าสุด';
      }
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
