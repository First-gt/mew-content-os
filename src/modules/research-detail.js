/**
 * ==============================================================================
 * MEW CONTENT OS — S02 Research Detail Controller (Topic T08)
 * Pure Client-Side JavaScript (ES6+ Module) · Zero Server Dependencies
 * Theme: mewteetawat.com V6.3
 * 
 * Definition of Done (DOD) Checklist:
 * - HTML: ซ้าย `video-player` + `source-meta` (creator, ลิงก์ต้นฉบับ `link-original`, เวลา);
 *         ขวา `analysis-panel` มี 2 แท็บ `tab-content-what` และ `tab-packaging-how`
 * - HTML: ด้านล่างมี `btn-save-to-library` และ badge `status-badge` (เริ่มต้น `Analyzed · Not saved`)
 * - CSS: wireframe 1 ในสเปกข้อ 8 — สองคอลัมน์บนเดสก์ท็อป ซ้อนเป็นคอลัมน์เดียวบนมือถือ
 * - JS: สลับแท็บไม่ reload ไม่ทำให้ analysis หาย;
 *       ปุ่ม Back กลับ S01 โดยไม่ทำให้ source เข้า Vault (D1)
 * - JS: ปุ่ม `btn-save-to-library` เปิด Save Modal (T12) เท่านั้น ไม่ save เอง
 * 
 * Strict Negative Constraint:
 * Absolutely NO fake or arbitrary statistics or fake percentage badges.
 * ==============================================================================
 */

import { getState, dispatch, subscribe, computeSourceStatus } from './store.js';
import { router, go as routerGo } from './router.js';
import { SAMPLE_SOURCES, SAMPLE_ANALYSES } from './sample-data.js';

/**
 * Canonical Tab Identifiers for Dual-Lens Analysis
 */
export const DETAIL_TABS = Object.freeze({
  CONTENT: 'content',
  PACKAGING: 'packaging'
});

/**
 * Format seconds into mm:ss string
 * @param {number} sec 
 * @returns {string}
 */
export function formatTime(sec) {
  if (isNaN(sec) || sec < 0) return '00:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Parses timecode string (e.g., "01:30", "45s", 45) to seconds
 * @param {string|number} timecode 
 * @returns {number}
 */
export function parseTimecode(timecode) {
  if (typeof timecode === 'number') return timecode;
  if (!timecode || typeof timecode !== 'string') return 0;
  
  const clean = timecode.trim().toLowerCase().replace('s', '');
  if (clean.includes(':')) {
    const parts = clean.split(':').map(Number);
    if (parts.length === 2) return (parts[0] * 60) + parts[1];
    if (parts.length === 3) return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
  }
  const parsed = Number(clean);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Controller class managing the S02 Research Detail screen
 */
export class ResearchDetailController {
  /**
   * @param {HTMLElement|string} [container=null]
   */
  constructor(container = null) {
    this.root = typeof container === 'string'
      ? document.querySelector(container)
      : (
          container ||
          (typeof document !== 'undefined'
            ? (document.getElementById('screen-research-detail') || document.body)
            : null)
        );

    this.activeTab = DETAIL_TABS.CONTENT;
    this.currentSourceId = null;
    this.currentSource = null;
    this.currentAnalysis = null;
    this.isPlaying = false;
    this.currentTime = 35; // default preview offset (00:35)
    this.duration = 135;   // default 2:15 = 135 sec
    this.unsubscribeStore = null;

    if (this.root) {
      this.ensureLayoutContainment();
      this.cacheDom();
      this.bindEvents();
      this.initFromStore();
    }
  }

  /**
   * Resolves the true S02 screen container using explicit selectors and
   * lowest common ancestor of S02 landmarks (#video-player, #source-meta, #analysis-panel).
   * @returns {HTMLElement|null}
   */
  resolveS02Root() {
    if (typeof document === 'undefined') return null;

    const explicit =
      document.getElementById('screen-research-detail') ||
      document.getElementById('screen-s02') ||
      document.getElementById('screen-S02') ||
      document.getElementById('s02') ||
      document.getElementById('S02') ||
      document.getElementById('s02-research-detail') ||
      document.getElementById('research-detail-root') ||
      document.getElementById('research-detail');
    if (explicit) return explicit;

    if (typeof document.querySelector === 'function') {
      const landmarks = [
        '#video-player',
        '#source-meta',
        '#analysis-panel',
        '#tab-content-what',
        '#tab-packaging-how',
        '#btn-save-to-library',
        '#status-badge'
      ]
        .map((sel) => document.querySelector(sel))
        .filter(Boolean);

      if (landmarks.length >= 2) {
        let lca = landmarks[0];
        while (
          lca &&
          lca.parentElement &&
          lca.parentElement !== document.body &&
          lca.parentElement !== document.documentElement &&
          !landmarks.every((node) => typeof lca.contains === 'function' && lca.contains(node))
        ) {
          lca = lca.parentElement;
        }

        if (
          lca &&
          lca !== document.body &&
          lca !== document.documentElement &&
          landmarks.every((node) => typeof lca.contains === 'function' && lca.contains(node))
        ) {
          return lca;
        }
      }
    }

    return null;
  }

  /**
   * Injects S02 stacking/icon containment CSS and clears floating inline styles
   * so icons inside S02 never float over the top navigation menu or analysis tabs.
   */
  ensureLayoutContainment() {
    if (typeof document !== 'undefined' && (document.body || document.head)) {
      let styleEl = document.getElementById('mew-s02-layout-containment');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'mew-s02-layout-containment';
        (document.body || document.head).appendChild(styleEl);
      }
      styleEl.textContent = `
        :is(header, nav, .app-header, .global-header, .os-header, .os-nav, .top-nav, .topbar, .navbar, .screen-nav, .screen-switcher, [role="navigation"], [role="banner"], #__s02_nav_a__#__s02_nav_b__#__s02_nav_c__):not(#screen-research-detail):not(.research-detail-view):not([data-s02-scope="true"]):not(.detail-top-nav) {
          z-index: 1000 !important;
          isolation: isolate !important;
        }
        :is(header, nav, .app-header, .global-header, .os-header, .os-nav, .top-nav, .topbar, .navbar, .screen-nav, .screen-switcher, [role="navigation"], .detail-top-nav, .detail-hero-header, .analysis-panel-top, .dual-lens-tabs-container, .pill-tabs-list, #__s02_icon_a__#__s02_icon_b__#__s02_icon_c__) :is(svg, i, .icon, [class*="icon"], .badge-icon-box, .gate-callout-icon, .reminder-icon, .tab-indicator-dot, .badge-kicker, .badge-step-code) {
          position: static !important;
          top: auto !important;
          left: auto !important;
          right: auto !important;
          bottom: auto !important;
          inset: auto !important;
          transform: none !important;
          translate: none !important;
          margin-top: 0 !important;
          z-index: auto !important;
          float: none !important;
          flex-shrink: 0 !important;
        }
        :is(header, nav, .app-header, .global-header, .os-header, .os-nav, .top-nav, .topbar, .navbar, .screen-nav, .screen-switcher, [role="navigation"], .detail-top-nav, .detail-hero-header, .analysis-panel-top, .dual-lens-tabs-container, #__s02_svg_a__#__s02_svg_b__#__s02_svg_c__) svg:not([hidden]):not(.is-hidden) {
          display: inline-block !important;
          vertical-align: middle !important;
          width: 16px !important;
          height: 16px !important;
          max-width: 18px !important;
          max-height: 18px !important;
          overflow: hidden !important;
        }
        :is(#screen-research-detail, #screen-s02, #screen-S02, #s02, #S02, #s02-research-detail, #research-detail-root, #research-detail, [data-s02-scope="true"], .research-detail-view, .research-detail-container, #__s02_root_a__#__s02_root_b__#__s02_root_c__) {
          position: relative !important;
          z-index: 1 !important;
          isolation: isolate !important;
          contain: layout style paint !important;
          overflow: hidden !important;
        }
        :is(#screen-research-detail, #screen-s02, #screen-S02, #s02, #S02, #s02-research-detail, #research-detail-root, #research-detail, [data-s02-scope="true"], .research-detail-view, .research-detail-container, #__s02_box_a__#__s02_box_b__#__s02_box_c__) :is(.detail-top-nav, .detail-hero-header, .research-detail-grid, .detail-col-left, .detail-col-right, .mew-offer-card, #video-player, .video-player-card, .video-canvas-container, .video-viewport, #video-viewport, .video-mockup-content, .video-controls-bar, .video-scrubber-track, #source-meta, .source-meta-card, #analysis-panel, .analysis-panel-card, .analysis-panel-top, .dual-lens-tabs-container, .pill-tabs-list, .pill-tab-button, .analysis-panels-body, .analysis-tab-panel, .analysis-section, #detail-action-footer, .detail-action-footer) {
          position: relative !important;
          top: auto !important;
          left: auto !important;
          right: auto !important;
          bottom: auto !important;
          inset: auto !important;
          transform: none !important;
          translate: none !important;
          z-index: 1 !important;
          float: none !important;
          overflow: hidden !important;
        }
        :is(#screen-research-detail, #screen-s02, #screen-S02, #s02, #S02, #s02-research-detail, #research-detail-root, #research-detail, [data-s02-scope="true"], .research-detail-view, .research-detail-container, #__s02_child_a__#__s02_child_b__#__s02_child_c__) :is(svg, i, .icon, [class*="icon"], .btn-video-play-overlay, #btn-video-play, .gate-callout-icon, .reminder-icon, .badge-icon-box, .verified-badge-glyph, .video-onscreen-avatar, #video-avatar-glyph, .creator-avatar-circle, #meta-avatar, .tab-indicator-dot, .pulse-dot, .video-overlay-chrome, .video-badge-ratio, .video-badge-watermark, .video-beat-badge, .badge-kicker, .badge-step-code, .section-step-num, .beat-index, .detail-gate-callout),
        :is(#screen-research-detail, #screen-s02, #screen-S02, #s02, #S02, #s02-research-detail, #research-detail-root, #research-detail, [data-s02-scope="true"], .research-detail-view, .research-detail-container, #__s02_child_a__#__s02_child_b__#__s02_child_c__) *::before,
        :is(#screen-research-detail, #screen-s02, #screen-S02, #s02, #S02, #s02-research-detail, #research-detail-root, #research-detail, [data-s02-scope="true"], .research-detail-view, .research-detail-container, #__s02_child_a__#__s02_child_b__#__s02_child_c__) *::after {
          position: static !important;
          top: auto !important;
          left: auto !important;
          right: auto !important;
          bottom: auto !important;
          inset: auto !important;
          transform: none !important;
          translate: none !important;
          z-index: auto !important;
          float: none !important;
          margin-top: 0 !important;
        }
        :is(#screen-research-detail, #screen-s02, #screen-S02, #s02, #S02, #s02-research-detail, #research-detail-root, #research-detail, [data-s02-scope="true"], .research-detail-view, .research-detail-container, #video-player, #analysis-panel, #__s02_hide_a__#__s02_hide_b__#__s02_hide_c__) :is(.is-hidden, [hidden], svg.is-hidden, svg[hidden], [class*="floating"]:not([data-testid]):not([id]), [class*="float-"]:not([data-testid]):not([id])) {
          display: none !important;
        }
        :is(#screen-research-detail, #screen-s02, #screen-S02, #s02, #S02, #s02-research-detail, #research-detail-root, #research-detail, [data-s02-scope="true"], .research-detail-view, .research-detail-container, #__s02_flex_a__#__s02_flex_b__#__s02_flex_c__) :is(.detail-top-nav, .detail-hero-header, .analysis-panel-top, .video-overlay-chrome, .video-meta-controls, .source-meta-header, .detail-action-footer) {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          flex-wrap: wrap !important;
          gap: 12px !important;
          width: 100% !important;
          margin-top: 0 !important;
          box-sizing: border-box !important;
          overflow: hidden !important;
        }
        :is(#screen-research-detail, #screen-s02, #screen-S02, #s02, #S02, #s02-research-detail, #research-detail-root, #research-detail, [data-s02-scope="true"], .research-detail-view, .research-detail-container, #__s02_inflex_a__#__s02_inflex_b__#__s02_inflex_c__) :is(.nav-left-group, .nav-quick-source, .detail-step-badge-group, .hero-kicker-row, .analysis-badge-row, .analysis-version-actions, .footer-status-group, .footer-cta-group, .video-actions-group, .btn-back-to-research, .top-link-original, .link-original, .badge-kicker, .badge-rights-verified, .btn-analyze-again, .pill-tab-button, .btn-ctrl-action, .status-badge, .btn-save-to-library, .source-meta-heading, .section-badge-title) {
          display: inline-flex !important;
          align-items: center !important;
          gap: 8px !important;
          margin-top: 0 !important;
        }
        :is(#screen-research-detail, #screen-s02, #screen-S02, #s02, #S02, #s02-research-detail, #research-detail-root, #research-detail, [data-s02-scope="true"], .research-detail-view, .research-detail-container, #__s02_call_a__#__s02_call_b__#__s02_call_c__) :is(.detail-gate-callout, .creator-profile-badge, .save-gate-reminder-box) {
          display: flex !important;
          align-items: center !important;
          gap: 12px !important;
          margin-top: 0 !important;
          overflow: hidden !important;
        }
        :is(#screen-research-detail, #screen-s02, #screen-S02, #s02, #S02, #s02-research-detail, #research-detail-root, #research-detail, [data-s02-scope="true"], .research-detail-view, .research-detail-container, #__s02_tabs_a__#__s02_tabs_b__#__s02_tabs_c__) .pill-tabs-list {
          display: flex !important;
          align-items: stretch !important;
          flex-wrap: wrap !important;
          gap: 10px !important;
          width: 100% !important;
          margin-top: 0 !important;
        }
        :is(#screen-research-detail, #screen-s02, #screen-S02, #s02, #S02, #s02-research-detail, #research-detail-root, #research-detail, [data-s02-scope="true"], .research-detail-view, .research-detail-container, #__s02_vid_a__#__s02_vid_b__#__s02_vid_c__) :is(#video-player, .video-player-card, .video-canvas-container, .video-viewport, .video-mockup-content) {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: space-between !important;
          gap: 10px !important;
          overflow: hidden !important;
          width: 100% !important;
          margin-top: 0 !important;
          box-sizing: border-box !important;
        }
        :is(#screen-research-detail, #screen-s02, #screen-S02, #s02, #S02, #s02-research-detail, #research-detail-root, #research-detail, [data-s02-scope="true"], .research-detail-view, .research-detail-container, #__s02_play_a__#__s02_play_b__#__s02_play_c__) :is(.btn-video-play-overlay, #btn-video-play) {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          margin: 8px auto !important;
          width: 48px !important;
          height: 48px !important;
          border-radius: 999px !important;
          overflow: hidden !important;
          flex-shrink: 0 !important;
        }
        :is(#screen-research-detail, #screen-s02, #screen-S02, #s02, #S02, #s02-research-detail, #research-detail-root, #research-detail, [data-s02-scope="true"], .research-detail-view, .research-detail-container, #__s02_glyph_a__#__s02_glyph_b__#__s02_glyph_c__) :is(.gate-callout-icon, .reminder-icon, .badge-icon-box, .verified-badge-glyph, .video-onscreen-avatar, .creator-avatar-circle, .tab-indicator-dot) {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          flex-shrink: 0 !important;
          margin-top: 0 !important;
          overflow: hidden !important;
        }
        :is(#screen-research-detail, #screen-s02, #screen-S02, #s02, #S02, #s02-research-detail, #research-detail-root, #research-detail, [data-s02-scope="true"], .research-detail-view, .research-detail-container, .detail-top-nav, .detail-hero-header, #video-player, #source-meta, #analysis-panel, #detail-action-footer, #__s02_svg2_a__#__s02_svg2_b__#__s02_svg2_c__) svg:not([hidden]):not(.is-hidden) {
          display: inline-block !important;
          vertical-align: middle !important;
          width: 16px !important;
          height: 16px !important;
          max-width: 16px !important;
          max-height: 16px !important;
          flex-shrink: 0 !important;
          overflow: hidden !important;
          margin-top: 0 !important;
        }
        :is(#screen-research-detail, #screen-s02, #screen-S02, #s02, #S02, #s02-research-detail, #research-detail-root, #research-detail, [data-s02-scope="true"], .research-detail-view, .research-detail-container, #__s02_svg3_a__#__s02_svg3_b__#__s02_svg3_c__) #btn-video-play svg:not([hidden]):not(.is-hidden) {
          width: 24px !important;
          height: 24px !important;
          max-width: 24px !important;
          max-height: 24px !important;
        }
        :is(#screen-research-detail, #screen-s02, #screen-S02, #s02, #S02, #s02-research-detail, #research-detail-root, #research-detail, [data-s02-scope="true"], .research-detail-view, .research-detail-container, #__s02_scrub_a__#__s02_scrub_b__#__s02_scrub_c__) .video-scrubber-track {
          display: flex !important;
          align-items: center !important;
          overflow: hidden !important;
          width: 100% !important;
          margin-top: 0 !important;
        }
      `;
    }

    const applyStaticImportant = (node) => {
      if (!node || !node.style || typeof node.style.setProperty !== 'function') return;
      node.style.setProperty('position', 'static', 'important');
      node.style.setProperty('top', 'auto', 'important');
      node.style.setProperty('left', 'auto', 'important');
      node.style.setProperty('right', 'auto', 'important');
      node.style.setProperty('bottom', 'auto', 'important');
      node.style.setProperty('inset', 'auto', 'important');
      node.style.setProperty('transform', 'none', 'important');
      node.style.setProperty('translate', 'none', 'important');
      node.style.setProperty('z-index', 'auto', 'important');
      node.style.setProperty('float', 'none', 'important');
      node.style.setProperty('margin-top', '0px', 'important');
      node.style.setProperty('flex-shrink', '0', 'important');
    };

    const applySvgSizeImportant = (svg, sizePx = 16) => {
      if (!svg || !svg.style || typeof svg.style.setProperty !== 'function') return;
      applyStaticImportant(svg);
      if (!svg.getAttribute('width')) svg.setAttribute('width', String(sizePx));
      if (!svg.getAttribute('height')) svg.setAttribute('height', String(sizePx));
      svg.style.setProperty('width', `${sizePx}px`, 'important');
      svg.style.setProperty('height', `${sizePx}px`, 'important');
      svg.style.setProperty('max-width', `${sizePx}px`, 'important');
      svg.style.setProperty('max-height', `${sizePx}px`, 'important');
      svg.style.setProperty('overflow', 'hidden', 'important');
    };

    const scopeRoot =
      this.resolveS02Root() ||
      (this.root && this.root !== (typeof document !== 'undefined' ? document.body : null) ? this.root : null);

    if (typeof document !== 'undefined' && typeof document.querySelectorAll === 'function') {
      const topNavs = document.querySelectorAll(
        'header, nav, .app-header, .global-header, .os-header, .os-nav, .top-nav, .topbar, .navbar, .screen-nav, .screen-switcher, [role="navigation"], [role="banner"]'
      );
      topNavs.forEach((navEl) => {
        if (!navEl || (scopeRoot && typeof scopeRoot.contains === 'function' && scopeRoot.contains(navEl))) return;
        if (navEl.style && typeof navEl.style.setProperty === 'function') {
          navEl.style.setProperty('z-index', '1000', 'important');
          navEl.style.setProperty('isolation', 'isolate', 'important');
        }
        if (typeof navEl.querySelectorAll === 'function') {
          navEl.querySelectorAll('svg, i, .icon, [class*="icon"], [class*="badge"]').forEach((iconEl) => {
            applyStaticImportant(iconEl);
            if (iconEl.tagName && iconEl.tagName.toLowerCase() === 'svg') {
              applySvgSizeImportant(iconEl, 16);
            }
          });
        }
      });
    }

    const queryTarget = scopeRoot || this.root;
    if (scopeRoot) {
      if (scopeRoot.classList && typeof scopeRoot.classList.add === 'function') {
        scopeRoot.classList.add('research-detail-view');
      }
      if (typeof scopeRoot.setAttribute === 'function') {
        scopeRoot.setAttribute('data-s02-scope', 'true');
      }
      if (scopeRoot.style && typeof scopeRoot.style.setProperty === 'function') {
        scopeRoot.style.setProperty('position', 'relative', 'important');
        scopeRoot.style.setProperty('z-index', '1', 'important');
        scopeRoot.style.setProperty('isolation', 'isolate', 'important');
        scopeRoot.style.setProperty('overflow', 'hidden', 'important');
      }
    }

    if (queryTarget && typeof queryTarget.querySelectorAll === 'function') {
      const containerNodes = queryTarget.querySelectorAll(
        '.detail-top-nav, .detail-hero-header, .research-detail-grid, .detail-col-left, .detail-col-right, #video-player, .video-player-card, .video-canvas-container, .video-viewport, #video-viewport, .video-mockup-content, .video-controls-bar, .video-scrubber-track, #source-meta, .source-meta-card, #analysis-panel, .analysis-panel-card, .analysis-panel-top, .dual-lens-tabs-container, .pill-tabs-list, .pill-tab-button, .analysis-panels-body, .analysis-tab-panel, .analysis-section, #detail-action-footer, .detail-action-footer'
      );
      containerNodes.forEach((box) => {
        if (box && box.style && typeof box.style.setProperty === 'function') {
          box.style.setProperty('position', 'relative', 'important');
          box.style.setProperty('top', 'auto', 'important');
          box.style.setProperty('left', 'auto', 'important');
          box.style.setProperty('right', 'auto', 'important');
          box.style.setProperty('bottom', 'auto', 'important');
          box.style.setProperty('inset', 'auto', 'important');
          box.style.setProperty('transform', 'none', 'important');
          box.style.setProperty('z-index', '1', 'important');
          box.style.setProperty('overflow', 'hidden', 'important');
        }
      });

      const iconNodes = queryTarget.querySelectorAll(
        '.detail-top-nav svg, .detail-hero-header svg, #video-player svg, #source-meta svg, #analysis-panel svg, #detail-action-footer svg, .btn-video-play-overlay, #btn-video-play, .gate-callout-icon, .reminder-icon, .badge-icon-box, .verified-badge-glyph, .video-onscreen-avatar, #video-avatar-glyph, .creator-avatar-circle, #meta-avatar, .tab-indicator-dot, .pulse-dot, .video-overlay-chrome, .video-badge-ratio, .video-badge-watermark, .video-beat-badge, .badge-kicker, .badge-step-code, .section-step-num, .beat-index, .detail-gate-callout'
      );
      iconNodes.forEach((node) => {
        applyStaticImportant(node);
        if (node.tagName && node.tagName.toLowerCase() === 'svg') {
          const isPlayIcon = node.id === 'icon-play' || node.id === 'icon-pause' || (node.closest && node.closest('#btn-video-play'));
          applySvgSizeImportant(node, isPlayIcon ? 24 : 16);
        }
      });
    }
  }

  /**
   * Caches internal DOM nodes for optimal performance
   */
  cacheDom() {
    if (!this.root) return;

    this.dom = {
      // Navigation / Header
      btnBack: this.root.querySelector('#btn-back-to-research, [data-action="btn-back-to-research"]'),
      btnFooterBack: this.root.querySelector('#btn-footer-back'),
      topCreatorSnippet: this.root.querySelector('#top-creator-snippet'),
      topLinkOriginal: this.root.querySelector('#top-link-original'),
      detailMainTitle: this.root.querySelector('#detail-main-title'),

      // Left Column: Video Player
      videoPlayer: this.root.querySelector('#video-player, [data-testid="video-player"]'),
      btnPlay: this.root.querySelector('#btn-video-play'),
      iconPlay: this.root.querySelector('#icon-play'),
      iconPause: this.root.querySelector('#icon-pause'),
      videoScrubber: this.root.querySelector('#video-scrubber-track'),
      videoProgress: this.root.querySelector('#video-scrub-progress'),
      videoHandle: this.root.querySelector('#video-scrub-handle'),
      currentTimeText: this.root.querySelector('#current-time-text'),
      durationTimeText: this.root.querySelector('#duration-time-text'),
      btnToggleSound: this.root.querySelector('#btn-toggle-sound'),
      btnReplay: this.root.querySelector('#btn-replay-video'),
      videoAvatarGlyph: this.root.querySelector('#video-avatar-glyph'),
      videoCreatorTag: this.root.querySelector('#video-creator-tag'),
      videoHookCaption: this.root.querySelector('#video-hook-caption'),
      videoBeatText: this.root.querySelector('#video-beat-text'),

      // Left Column: Source Meta
      sourceMeta: this.root.querySelector('#source-meta, [data-testid="source-meta"]'),
      metaAvatar: this.root.querySelector('#meta-avatar'),
      metaCreator: this.root.querySelector('#meta-creator'),
      metaCreatorHandle: this.root.querySelector('#meta-creator-handle'),
      linkOriginal: this.root.querySelector('#link-original, [data-testid="link-original"]'),
      linkOriginalText: this.root.querySelector('#link-original-text'),
      metaDuration: this.root.querySelector('#meta-duration'),
      metaRights: this.root.querySelector('#meta-rights'),
      metaTagsList: this.root.querySelector('#meta-tags-list'),

      // Right Column: Analysis Panel & Tabs
      analysisPanel: this.root.querySelector('#analysis-panel, [data-testid="analysis-panel"]'),
      tabContentWhat: this.root.querySelector('#tab-content-what, [data-testid="tab-content-what"]'),
      tabPackagingHow: this.root.querySelector('#tab-packaging-how, [data-testid="tab-packaging-how"]'),
      panelContentWhat: this.root.querySelector('#panel-content-what, [data-testid="panel-content-what"]'),
      panelPackagingHow: this.root.querySelector('#panel-packaging-how, [data-testid="panel-packaging-how"]'),
      btnAnalyzeAgain: this.root.querySelector('#btn-analyze-again, [data-testid="btn-analyze-again"]'),
      analysisVersionBadge: this.root.querySelector('#analysis-version-badge'),

      // Content (WHAT) fields
      contentCoreIdea: this.root.querySelector('#content-core-idea'),
      contentAudience: this.root.querySelector('#content-audience'),
      contentKeyPoints: this.root.querySelector('#content-key-points'),
      contentClaimsEvidence: this.root.querySelector('#content-claims-evidence'),
      contentExamples: this.root.querySelector('#content-examples'),
      contentExtendableAngles: this.root.querySelector('#content-extendable-angles'),
      contentWhatIsGood: this.root.querySelector('#content-what-is-good'),

      // Packaging (HOW) fields
      packagingHook: this.root.querySelector('#packaging-hook'),
      packagingOpeningPattern: this.root.querySelector('#packaging-opening-pattern'),
      packagingNarrativeBeats: this.root.querySelector('#packaging-narrative-beats'),
      packagingPacing: this.root.querySelector('#packaging-pacing'),
      packagingMusicSfx: this.root.querySelector('#packaging-music-sfx'),
      packagingEditingMechanics: this.root.querySelector('#packaging-editing-mechanics'),
      packagingTimestampHighlights: this.root.querySelector('#packaging-timestamp-highlights'),
      packagingWhatIsGood: this.root.querySelector('#packaging-what-is-good'),

      // Bottom Action Footer
      statusBadge: this.root.querySelector('#status-badge, [data-testid="status-badge"]'),
      statusBadgeText: this.root.querySelector('#status-badge-text'),
      statusExplanationText: this.root.querySelector('#status-explanation-text'),
      btnSaveToLibrary: this.root.querySelector('#btn-save-to-library, [data-testid="btn-save-to-library"]')
    };
  }

  /**
   * Binds user event listeners (click, keyboard tabs, video controls)
   */
  bindEvents() {
    if (!this.dom) return;

    // 1. Dual-Lens Tab Switching
    this.dom.tabContentWhat?.addEventListener('click', (e) => {
      e.preventDefault();
      this.switchTab(DETAIL_TABS.CONTENT);
    });

    this.dom.tabPackagingHow?.addEventListener('click', (e) => {
      e.preventDefault();
      this.switchTab(DETAIL_TABS.PACKAGING);
    });

    // Keyboard ARIA tab navigation
    [this.dom.tabContentWhat, this.dom.tabPackagingHow].forEach(btn => {
      btn?.addEventListener('keydown', (e) => this.handleTabKeydown(e));
    });

    // 2. Back Navigation (D1: Returns to S01 without saving to Vault)
    this.dom.btnBack?.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleBackToResearch();
    });

    this.dom.btnFooterBack?.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleBackToResearch();
    });

    // 3. Save to Library CTA (T12: Opens Save Modal only, does not save directly)
    this.dom.btnSaveToLibrary?.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleSaveToLibrary();
    });

    // 4. Re-analyze button
    this.dom.btnAnalyzeAgain?.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleAnalyzeAgain();
    });

    // 5. Video Player interactions
    this.dom.btnPlay?.addEventListener('click', () => this.togglePlayPause());
    this.dom.btnReplay?.addEventListener('click', () => this.seekToTime(0));
    this.dom.btnToggleSound?.addEventListener('click', () => this.toggleSound());

    // Scrubber click / drag
    this.dom.videoScrubber?.addEventListener('click', (e) => {
      const rect = this.dom.videoScrubber.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      this.seekToTime(pos * this.duration);
    });

    // Timestamp highlights chips
    this.dom.packagingTimestampHighlights?.addEventListener('click', (e) => {
      const chip = e.target.closest('.btn-time-chip, [data-time]');
      if (chip) {
        const timeVal = chip.getAttribute('data-time');
        const seconds = parseTimecode(timeVal);
        this.seekToTime(seconds);
      }
    });

    // Subscribe to store updates for live status synchronization
    if (typeof subscribe === 'function') {
      this.unsubscribeStore = subscribe(() => {
        this.syncStatusWithStore();
      });
    }
  }

  /**
   * Initializes source and analysis data from router context or central store
   * @param {string} [sourceId]
   */
  initFromStore(sourceId = null) {
    const state = typeof getState === 'function' ? getState() : null;
    const sources = state?.sources || SAMPLE_SOURCES;
    
    // Resolve target source
    const targetId = sourceId || this.currentSourceId || sources[0]?.id || 'source-a';
    this.loadSource(targetId);
  }

  /**
   * Loads a specific source and its corresponding dual-lens analysis
   * @param {string} sourceId 
   */
  loadSource(sourceId) {
    this.currentSourceId = sourceId;
    const state = typeof getState === 'function' ? getState() : null;

    // 1. Find source
    const sources = state?.sources || SAMPLE_SOURCES;
    this.currentSource = sources.find(s => s.id === sourceId) || sources[0] || {
      id: sourceId,
      title: 'Post and forget it (อย่าเฝ้ายอด)',
      creator: 'Creator A',
      url: 'https://example.com/watch?v=post-and-forget',
      duration: '02:15',
      tags: ['Mindset', 'Workflow', 'Content Creation']
    };

    // 2. Find analysis (support versioning, pick latest)
    const analyses = state?.analyses || SAMPLE_ANALYSES;
    const matchingAnalyses = analyses.filter(a => a.sourceId === this.currentSource.id);
    this.currentAnalysis = matchingAnalyses.length > 0
      ? matchingAnalyses[matchingAnalyses.length - 1]
      : (SAMPLE_ANALYSES.find(a => a.sourceId === 'source-a') || SAMPLE_ANALYSES[0]);

    // Parse duration
    this.duration = parseTimecode(this.currentSource.duration) || 135;
    this.currentTime = Math.min(35, this.duration);

    // Render to DOM
    this.renderSource();
  }

  /**
   * Renders the current source and analysis into DOM
   */
  renderSource() {
    if (!this.dom || !this.currentSource) return;

    const source = this.currentSource;
    const analysis = this.currentAnalysis;

    // Header & Titles
    if (this.dom.detailMainTitle) {
      this.dom.detailMainTitle.textContent = source.title || 'Untitled Reference Clip';
    }
    if (this.dom.topCreatorSnippet) {
      this.dom.topCreatorSnippet.textContent = source.creator ? `@${source.creator.toLowerCase().replace(/\s+/g, '')}` : '@creator';
    }
    if (this.dom.topLinkOriginal) {
      this.dom.topLinkOriginal.href = source.url || '#';
    }

    // Video Player Viewport
    if (this.dom.videoAvatarGlyph) {
      this.dom.videoAvatarGlyph.textContent = (source.creator || 'M').charAt(0).toUpperCase();
    }
    if (this.dom.videoCreatorTag) {
      this.dom.videoCreatorTag.textContent = `@${(source.creator || 'creator').toLowerCase().replace(/\s+/g, '')}`;
    }
    if (this.dom.videoHookCaption) {
      this.dom.videoHookCaption.textContent = analysis?.packaging?.hook || `"${source.title}"`;
    }
    if (this.dom.durationTimeText) {
      this.dom.durationTimeText.textContent = formatTime(this.duration);
    }
    this.updateScrubberDisplay();

    // Source Meta Card
    if (this.dom.metaAvatar) {
      this.dom.metaAvatar.textContent = (source.creator || 'C').charAt(0).toUpperCase();
    }
    if (this.dom.metaCreator) {
      this.dom.metaCreator.textContent = source.creator || 'Creator';
    }
    if (this.dom.metaCreatorHandle) {
      this.dom.metaCreatorHandle.textContent = `@${(source.creator || 'creator').toLowerCase().replace(/\s+/g, '')}`;
    }
    if (this.dom.linkOriginal) {
      this.dom.linkOriginal.href = source.url || 'https://example.com';
    }
    if (this.dom.linkOriginalText) {
      this.dom.linkOriginalText.textContent = source.url || 'https://example.com';
    }
    if (this.dom.metaDuration) {
      this.dom.metaDuration.textContent = `${source.duration || formatTime(this.duration)} นาที`;
    }

    // Tags
    if (this.dom.metaTagsList && Array.isArray(source.tags)) {
      this.dom.metaTagsList.innerHTML = source.tags
        .map(tag => `<span class="meta-tag-pill">${escapeHtml(tag)}</span>`)
        .join('');
    }

    // Version Badge
    if (this.dom.analysisVersionBadge && analysis?.version) {
      this.dom.analysisVersionBadge.textContent = `v${analysis.version}.0 (Active)`;
    }

    // Content (WHAT) fields
    if (analysis?.content) {
      const c = analysis.content;
      if (this.dom.contentCoreIdea) this.dom.contentCoreIdea.textContent = c.coreIdea || 'ไม่มีข้อมูล';
      if (this.dom.contentAudience) this.dom.contentAudience.textContent = c.audience || 'ผู้ชมทั่วไป';
      
      if (this.dom.contentKeyPoints && Array.isArray(c.keyPoints)) {
        this.dom.contentKeyPoints.innerHTML = c.keyPoints
          .map(kp => `<li>${escapeHtml(kp)}</li>`)
          .join('');
      }

      if (this.dom.contentClaimsEvidence && Array.isArray(c.claimsAndEvidence)) {
        if (c.claimsAndEvidence.length === 0) {
          this.dom.contentClaimsEvidence.innerHTML = `
            <div class="claim-item-card">
              <p class="claim-statement" style="color: var(--v6-muted);">ไม่มีข้ออ้างเชิงตัวเลขหรือการอ้างอิงสถิติในคลิปนี้</p>
            </div>`;
        } else {
          this.dom.contentClaimsEvidence.innerHTML = c.claimsAndEvidence
            .map(item => `
              <div class="claim-item-card">
                <div class="claim-row">
                  <span class="claim-tag">ข้ออ้าง (Claim)</span>
                  <p class="claim-statement">${escapeHtml(item.claim || '')}</p>
                </div>
                <div class="evidence-row">
                  <span class="evidence-tag">หลักฐาน (Evidence)</span>
                  <p class="evidence-statement">${escapeHtml(item.evidence || 'ไม่มีหลักฐานยืนยันชัดเจน')}</p>
                </div>
              </div>
            `).join('');
        }
      }

      if (this.dom.contentExamples) {
        const ex = Array.isArray(c.examples) ? c.examples.join(', ') : (c.examples || 'ไม่มีการยกตัวอย่างชัดเจน');
        this.dom.contentExamples.textContent = ex;
      }

      if (this.dom.contentExtendableAngles && Array.isArray(c.extendableAngles)) {
        this.dom.contentExtendableAngles.innerHTML = c.extendableAngles
          .map(angle => `<li>${escapeHtml(angle)}</li>`)
          .join('');
      }

      if (this.dom.contentWhatIsGood) {
        this.dom.contentWhatIsGood.textContent = c.whatIsGood || 'เนื้อหาและแก่นความคิดมีความชัดเจน';
      }
    }

    // Packaging (HOW) fields
    if (analysis?.packaging) {
      const p = analysis.packaging;
      if (this.dom.packagingHook) this.dom.packagingHook.textContent = `"${p.hook || source.title}"`;
      if (this.dom.packagingOpeningPattern) this.dom.packagingOpeningPattern.textContent = p.openingPattern || 'Direct Opening';

      if (this.dom.packagingNarrativeBeats) {
        const beats = Array.isArray(p.beats)
          ? p.beats
          : (typeof p.beats === 'string' ? p.beats.split('->').map(s => s.trim()) : []);
        
        if (beats.length > 0) {
          this.dom.packagingNarrativeBeats.innerHTML = beats
            .map((beat, idx) => `
              <li class="beat-step-item">
                <span class="beat-index">${idx + 1}</span>
                <span class="beat-desc">${escapeHtml(beat)}</span>
              </li>
            `).join('');
        }
      }

      if (this.dom.packagingPacing) this.dom.packagingPacing.textContent = p.pacing || 'จังหวะเร็วปานกลาง';
      if (this.dom.packagingMusicSfx) this.dom.packagingMusicSfx.textContent = p.musicSfx || 'ดนตรีคลอเบาๆ';
      if (this.dom.packagingEditingMechanics) this.dom.packagingEditingMechanics.textContent = p.editingMechanics || 'ตัดต่อกระชับ';

      if (this.dom.packagingTimestampHighlights && Array.isArray(p.timestampHighlights)) {
        this.dom.packagingTimestampHighlights.innerHTML = p.timestampHighlights
          .map(th => `
            <button type="button" class="btn-time-chip" data-time="${escapeHtml(th.time)}" title="คลิกเพื่อกระโดดไปยัง ${escapeHtml(th.time)}">
              <span class="font-num chip-code">${escapeHtml(th.time)}</span>
              <span class="chip-label">${escapeHtml(th.label)}</span>
            </button>
          `).join('');
      }

      if (this.dom.packagingWhatIsGood) {
        this.dom.packagingWhatIsGood.textContent = p.whatIsGood || 'โครงสร้างการเล่ากระชับและดึงดูดสายตา';
      }
    }

    // Status Badge Synchronization
    this.syncStatusWithStore();
    this.ensureLayoutContainment();
  }

  /**
   * Synchronizes the status badge with current store state
   * Default initial status: 'Analyzed · Not saved'
   */
  syncStatusWithStore() {
    if (!this.dom?.statusBadge || !this.currentSource) return;

    const state = typeof getState === 'function' ? getState() : null;
    const notes = state?.savedNotes || [];
    
    // Check if source has notes saved in Vaults
    const status = computeSourceStatus
      ? computeSourceStatus(this.currentSource.id, notes)
      : 'Analyzed · Not saved';

    // Update status badge UI
    this.dom.statusBadge.className = 'status-badge';
    
    if (status === 'Saved to Both') {
      this.dom.statusBadge.classList.add('status-saved-both');
      if (this.dom.statusBadgeText) this.dom.statusBadgeText.textContent = 'Saved to Both Vaults';
      if (this.dom.statusExplanationText) this.dom.statusExplanationText.textContent = 'บันทึกแล้วใน Content Vault และ Packaging Vault';
    } else if (status === 'Saved to Content') {
      this.dom.statusBadge.classList.add('status-saved-content');
      if (this.dom.statusBadgeText) this.dom.statusBadgeText.textContent = 'Saved to Content';
      if (this.dom.statusExplanationText) this.dom.statusExplanationText.textContent = 'บันทึกแล้วใน Content Vault พร้อม Founder WHY';
    } else if (status === 'Saved to Packaging') {
      this.dom.statusBadge.classList.add('status-saved-packaging');
      if (this.dom.statusBadgeText) this.dom.statusBadgeText.textContent = 'Saved to Packaging';
      if (this.dom.statusExplanationText) this.dom.statusExplanationText.textContent = 'บันทึกแล้วใน Packaging Vault พร้อม Founder WHY';
    } else {
      // Default: Analyzed · Not saved (strictly NOT library styled)
      this.dom.statusBadge.classList.add('status-analyzed-not-saved');
      if (this.dom.statusBadgeText) this.dom.statusBadgeText.textContent = 'Analyzed \u00B7 Not saved';
      if (this.dom.statusExplanationText) this.dom.statusExplanationText.textContent = 'วิเคราะห์เสร็จสิ้น \u2022 คลิปยังไม่ได้ถูกบันทึกเข้าสู่ Vault ใดๆ';
    }
  }

  /**
   * Switches active analysis tab between 'content' and 'packaging'
   * CRITICAL GUARANTEE: Does NOT reload page, does NOT destroy or lose analysis data.
   * 
   * @param {'content'|'packaging'} tab 
   */
  switchTab(tab) {
    if (tab !== DETAIL_TABS.CONTENT && tab !== DETAIL_TABS.PACKAGING) {
      tab = DETAIL_TABS.CONTENT;
    }

    this.activeTab = tab;

    const isContent = tab === DETAIL_TABS.CONTENT;

    // 1. Update Tab Buttons
    if (this.dom?.tabContentWhat) {
      toggleElementClass(this.dom.tabContentWhat, 'active', isContent);
      this.dom.tabContentWhat.setAttribute('aria-selected', isContent ? 'true' : 'false');
      this.dom.tabContentWhat.setAttribute('tabindex', isContent ? '0' : '-1');
    }

    if (this.dom?.tabPackagingHow) {
      toggleElementClass(this.dom.tabPackagingHow, 'active', !isContent);
      this.dom.tabPackagingHow.setAttribute('aria-selected', !isContent ? 'true' : 'false');
      this.dom.tabPackagingHow.setAttribute('tabindex', !isContent ? '0' : '-1');
    }

    // 2. Update Tab Panels visibility (No data is discarded)
    if (this.dom?.panelContentWhat) {
      toggleElementClass(this.dom.panelContentWhat, 'is-hidden', !isContent);
      if (isContent) {
        this.dom.panelContentWhat.removeAttribute('hidden');
      } else {
        this.dom.panelContentWhat.setAttribute('hidden', 'true');
      }
    }

    if (this.dom?.panelPackagingHow) {
      toggleElementClass(this.dom.panelPackagingHow, 'is-hidden', isContent);
      if (!isContent) {
        this.dom.panelPackagingHow.removeAttribute('hidden');
      } else {
        this.dom.panelPackagingHow.setAttribute('hidden', 'true');
      }
    }

    // Dispatch custom tab switch event for testing or sub-modules
    if (typeof window !== 'undefined') {
      const tabEvent = new CustomEvent('mew:tab-changed', {
        bubbles: true,
        detail: { activeTab: tab, sourceId: this.currentSourceId }
      });
      window.dispatchEvent(tabEvent);
    }
  }

  /**
   * Handles keyboard navigation (ArrowLeft / ArrowRight) for WCAG tablist
   * @param {KeyboardEvent} e 
   */
  handleTabKeydown(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      this.switchTab(DETAIL_TABS.PACKAGING);
      this.dom?.tabPackagingHow?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      this.switchTab(DETAIL_TABS.CONTENT);
      this.dom?.tabContentWhat?.focus();
    }
  }

  /**
   * Back Button Handler
   * CRITICAL GUARANTEE (D1):
   * Returns to S01 (Research Entry / Inbox) WITHOUT saving source to Vault.
   * Source remains in Inbox as 'Analyzed · Not saved'.
   */
  handleBackToResearch() {
    // Navigate back to S01
    if (typeof router !== 'undefined' && typeof router.go === 'function') {
      router.go('S01');
    } else if (typeof routerGo === 'function') {
      routerGo('S01');
    } else if (typeof window !== 'undefined') {
      window.location.hash = '#S01';
    }
  }

  /**
   * Save to Library CTA Handler
   * CRITICAL GUARANTEE (T12):
   * Opens Save Modal (S03) ONLY. Does NOT save or create notes directly!
   */
  handleSaveToLibrary() {
    const clipPayload = {
      id: this.currentSource?.id || 'source-temp',
      title: this.currentSource?.title || 'Untitled Reference Clip',
      author: this.currentSource?.creator || 'Creator',
      duration: this.currentSource?.duration || formatTime(this.duration),
      url: this.currentSource?.url || '',
      tags: this.currentSource?.tags || [],
      avatar: (this.currentSource?.creator || 'C').charAt(0).toUpperCase()
    };

    // 1. Dispatch custom event for modal opener
    const openModalEvent = new CustomEvent('mew:open-save-modal', {
      bubbles: true,
      detail: clipPayload
    });
    window.dispatchEvent(openModalEvent);

    // 2. Direct invocation if SaveModalController instance is globally available
    if (typeof window !== 'undefined' && window.saveModalController && typeof window.saveModalController.open === 'function') {
      window.saveModalController.open(clipPayload);
      return;
    }

    // 3. Fallback: Check if modal DOM exists and unhide it
    const modalEl = document.getElementById('save-decision-modal') || document.querySelector('[data-testid="save-modal"]');
    if (modalEl) {
      modalEl.removeAttribute('hidden');
      modalEl.style.display = 'flex';
      const input = modalEl.querySelector('textarea, input');
      input?.focus();
    }
  }

  /**
   * Re-analyzes source and creates an appended version without mutating savedNotes
   */
  handleAnalyzeAgain() {
    if (!this.currentSource) return;

    const nextVersion = (this.currentAnalysis?.version || 1) + 1;
    const newAnalysis = {
      ...this.currentAnalysis,
      id: `analysis-${this.currentSource.id}-v${nextVersion}`,
      version: nextVersion,
      createdAt: new Date().toISOString()
    };

    // If store available, dispatch ADD_ANALYSIS
    if (typeof dispatch === 'function') {
      dispatch({
        type: 'ADD_ANALYSIS',
        payload: newAnalysis
      });
    }

    this.currentAnalysis = newAnalysis;
    if (this.dom?.analysisVersionBadge) {
      this.dom.analysisVersionBadge.textContent = `v${nextVersion}.0 (Active)`;
    }

    // Visual pulse confirmation
    if (this.dom?.btnAnalyzeAgain) {
      this.dom.btnAnalyzeAgain.style.transform = 'scale(0.95)';
      setTimeout(() => {
        if (this.dom?.btnAnalyzeAgain) this.dom.btnAnalyzeAgain.style.transform = '';
      }, 150);
    }
  }

  /**
   * Toggles video playback simulation
   */
  togglePlayPause() {
    this.isPlaying = !this.isPlaying;
    if (this.dom?.iconPlay && this.dom?.iconPause) {
      if (this.isPlaying) {
        this.dom.iconPlay.classList.add('is-hidden');
        this.dom.iconPlay.setAttribute('hidden', 'true');
        this.dom.iconPause.classList.remove('is-hidden');
        this.dom.iconPause.removeAttribute('hidden');
      } else {
        this.dom.iconPlay.classList.remove('is-hidden');
        this.dom.iconPlay.removeAttribute('hidden');
        this.dom.iconPause.classList.add('is-hidden');
        this.dom.iconPause.setAttribute('hidden', 'true');
      }
    }
  }

  /**
   * Seeks player to a target timestamp in seconds
   * @param {number} sec 
   */
  seekToTime(sec) {
    this.currentTime = Math.max(0, Math.min(this.duration, sec));
    this.updateScrubberDisplay();
  }

  /**
   * Updates scrubber bar and timecode labels
   */
  updateScrubberDisplay() {
    if (!this.dom) return;

    const progressRatio = this.duration > 0 ? (this.currentTime / this.duration) : 0;
    const percent = Math.min(100, Math.max(0, progressRatio * 100));

    if (this.dom.videoProgress) {
      this.dom.videoProgress.style.width = `${percent}%`;
    }
    if (this.dom.videoHandle) {
      this.dom.videoHandle.style.left = `${percent}%`;
    }
    if (this.dom.currentTimeText) {
      this.dom.currentTimeText.textContent = formatTime(this.currentTime);
    }
    if (this.dom.videoScrubber) {
      this.dom.videoScrubber.setAttribute('aria-valuenow', String(Math.round(this.currentTime)));
    }
  }

  /**
   * Toggles mute state
   */
  toggleSound() {
    if (this.dom?.btnToggleSound) {
      this.dom.btnToggleSound.classList.toggle('is-muted');
    }
  }

  /**
   * Cleans up listeners and subscriptions
   */
  destroy() {
    if (typeof this.unsubscribeStore === 'function') {
      this.unsubscribeStore();
      this.unsubscribeStore = null;
    }
  }
}

/**
 * Helper to safely toggle CSS classes across both standard DOM and test environments
 * @param {HTMLElement} el 
 * @param {string} className 
 * @param {boolean} force 
 */
function toggleElementClass(el, className, force) {
  if (!el || !className) return;
  if (el.classList && typeof el.classList.toggle === 'function') {
    el.classList.toggle(className, force);
  } else if (el.classList) {
    if (force) {
      el.classList.add(className);
    } else {
      el.classList.remove(className);
    }
  }
}

/**
 * Escapes HTML characters safely to prevent XSS
 * @param {string} str 
 * @returns {string}
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Factory initializer helper for browser DOM
 * @param {HTMLElement|string} [container]
 * @returns {ResearchDetailController}
 */
export function initResearchDetail(container = null) {
  const ctrl = new ResearchDetailController(container);
  if (typeof window !== 'undefined') {
    window.researchDetailController = ctrl;
  }
  return ctrl;
}

// Auto initialize on DOM ready in browser environments
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initResearchDetail());
  } else {
    initResearchDetail();
  }
}
