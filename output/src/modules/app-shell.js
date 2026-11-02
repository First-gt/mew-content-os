/**
 * ==============================================================================
 * MEW CONTENT OS — App Shell & Navigation Tree Controller (Topic T01)
 * Theme: mewteetawat.com V6.3
 * Pure Client-Side JavaScript (ES6+ Module) · Zero Server Dependencies
 * 
 * Definition of Done (DOD) Checklist:
 * - HTML: <nav data-testid="nav-root"> with 5 items in strict spec 3 order:
 *         nav-overview, nav-research, nav-library, nav-remix, nav-board
 * - HTML: <main data-testid="screen-outlet"> and sticky <header data-testid="context-bar">
 * - CSS: Active nav item has class `is-active` and distinct styling; context-bar is sticky
 * - JS: Clicking nav items switches screen-outlet views without reload; context-bar updates stage
 * - Founder glances at screen -> immediately knows stage without reading content
 * ==============================================================================
 */

/**
 * Screen to Stage mapping and metadata.
 * Reflects the 5 primary stages according to spec:
 * Research / Save / Ingredients / Remix / Approve (plus 00 Overview Dashboard)
 */
export const STAGE_CONFIG = {
  overview: {
    id: 'overview',
    navId: 'nav-overview',
    screenId: 'screen-overview',
    stageName: 'Overview',
    theme: 'overview',
    title: '00 Overview / Dashboard',
    subtitle: 'ภาพรวมระบบคอนเทนต์: คลังวิจัย, สถานะวัตถุดิบ 2 คลัง และดราฟต์รีมิกซ์ล่าสุด',
    stepIndex: 0
  },
  research: {
    id: 'research',
    navId: 'nav-research',
    screenId: 'screen-research',
    stageName: 'Research',
    theme: 'research',
    title: '01 Research Studio',
    subtitle: 'Phase 1: Research Entry & AI Dual-Lens Analysis (WHAT สาระ vs HOW ลีลา)',
    stepIndex: 1
  },
  library: {
    id: 'library',
    navId: 'nav-library',
    screenId: 'screen-library',
    stageName: 'Ingredients',
    theme: 'ingredients',
    title: '02 My Library / Dual-Vault',
    subtitle: 'Phase 2: คลังวัตถุดิบทางความคิด (Content Vault & Packaging Vault) พร้อม Founder WHY',
    stepIndex: 3
  },
  remix: {
    id: 'remix',
    navId: 'nav-remix',
    screenId: 'screen-remix',
    stageName: 'Remix',
    theme: 'remix',
    title: '03 Remix Studio',
    subtitle: 'Phase 3: Multi-Source Creative Synthesis (Content N + Packaging N สู่ Original Concepts)',
    stepIndex: 4
  },
  board: {
    id: 'board',
    navId: 'nav-board',
    screenId: 'screen-board',
    stageName: 'Approve',
    theme: 'approve',
    title: '04 Content Board',
    subtitle: 'Phase 4: บอร์ดติดตามสถานะอนุมัติบท (Draft -> Needs Review -> Approved -> Production)',
    stepIndex: 5
  },
  save: {
    id: 'save',
    stageName: 'Save',
    theme: 'save',
    title: 'Human Save Gate (S03)',
    subtitle: 'Human Save Gate: Founder เลือกเก็บ Content, Packaging หรือ Both พร้อมระบุเหตุผล WHY',
    stepIndex: 2
  }
};

class AppShellManager {
  constructor() {
    this.currentScreen = 'overview';
    this.currentStage = 'Overview';
    this.previousStageBeforeModal = null;
    this.isInitialized = false;

    // Cache DOM Elements
    this.dom = {
      navRoot: null,
      contextBar: null,
      screenOutlet: null,
      stageNameDisplays: [],
      stageBadges: [],
      stageSubtext: null,
      stepperNodes: [],
      navItems: [],
      screens: [],
      saveModal: null
    };
  }

  /**
   * Initializes the App Shell, queries elements, attaches event listeners,
   * and synchronizes initial view from URL hash.
   */
  init() {
    if (this.isInitialized) return;

    this.cacheDom();
    this.bindEvents();
    this.syncFromHash();

    this.isInitialized = true;
    console.info('[AppShell] Initialized successfully with 5-stage navigation tree.');
  }

  cacheDom() {
    this.dom.navRoot = document.querySelector('[data-testid="nav-root"]');
    this.dom.contextBar = document.querySelector('[data-testid="context-bar"]');
    this.dom.screenOutlet = document.querySelector('[data-testid="screen-outlet"]');
    
    // Stage displays inside context-bar
    this.dom.stageNameDisplays = document.querySelectorAll(
      '[data-testid="stage-name"], #stage-name, .stage-name-display'
    );
    this.dom.stageBadges = document.querySelectorAll(
      '[data-testid="current-stage-badge"], #current-stage-badge, .stage-badge-pill'
    );
    this.dom.stageSubtext = document.getElementById('stage-subtext');
    this.dom.stepperNodes = document.querySelectorAll('.stepper-node');

    // Nav items
    this.dom.navItems = document.querySelectorAll(
      '[data-testid="nav-root"] [data-testid^="nav-"], [data-testid="nav-root"] .nav-tree-item, [data-testid="nav-root"] button, [data-testid="nav-root"] a'
    );

    // Screens inside screen-outlet
    if (this.dom.screenOutlet) {
      this.dom.screens = this.dom.screenOutlet.querySelectorAll(
        '.screen-view, [data-screen]'
      );
    }

    // Save gate modal
    this.dom.saveModal = document.getElementById('save-gate-modal');
  }

  bindEvents() {
    // 1. Navigation clicks via delegation on nav-root
    if (this.dom.navRoot) {
      this.dom.navRoot.addEventListener('click', (e) => {
        const item = e.target.closest('[data-target], [data-testid^="nav-"], a[href^="#"]');
        if (!item) return;

        e.preventDefault();
        const targetScreen = this.extractScreenId(item);
        if (targetScreen) {
          this.navigateTo(targetScreen);
        }
      });

      // Keyboard arrow navigation inside nav-root (WCAG accessibility)
      this.dom.navRoot.addEventListener('keydown', (e) => {
        this.handleNavKeydown(e);
      });
    }

    // 2. Global clicks for [data-navigate] buttons (e.g. hero CTA buttons)
    document.addEventListener('click', (e) => {
      const navBtn = e.target.closest('[data-navigate]');
      if (navBtn) {
        e.preventDefault();
        const dest = navBtn.getAttribute('data-navigate');
        this.navigateTo(dest);
        return;
      }

      // Quick trigger for Save Gate simulation
      const openSaveBtn = e.target.closest('[data-action="open-save-gate"]');
      if (openSaveBtn) {
        e.preventDefault();
        this.openSaveGateModal();
        return;
      }

      // Close modal button
      const closeSaveBtn = e.target.closest('[data-action="close-save-gate"]');
      if (closeSaveBtn) {
        e.preventDefault();
        this.closeSaveGateModal();
        return;
      }
    });

    // 3. Browser History popstate / hashchange
    window.addEventListener('popstate', () => this.syncFromHash());
    window.addEventListener('hashchange', () => this.syncFromHash());

    // 4. Modal escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.dom.saveModal && this.dom.saveModal.classList.contains('is-open')) {
        this.closeSaveGateModal();
      }
    });
  }

  /**
   * Resolves the target screen id from clicked element attributes.
   */
  extractScreenId(element) {
    if (element.hasAttribute('data-target')) {
      return element.getAttribute('data-target');
    }
    const testId = element.getAttribute('data-testid');
    if (testId && testId.startsWith('nav-')) {
      return testId.replace('nav-', '');
    }
    const href = element.getAttribute('href');
    if (href && href.startsWith('#')) {
      return href.replace('#', '').replace(/^screen-/, '').replace(/^view-/, '');
    }
    return null;
  }

  /**
   * Keyboard accessible navigation within the nav tree.
   */
  handleNavKeydown(e) {
    const items = Array.from(this.dom.navItems);
    if (!items.length) return;

    const currentIndex = items.findIndex(item => item === document.activeElement);
    if (currentIndex === -1) return;

    let targetIndex = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      targetIndex = (currentIndex + 1) % items.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      targetIndex = (currentIndex - 1 + items.length) % items.length;
    } else if (e.key === 'Home') {
      e.preventDefault();
      targetIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      targetIndex = items.length - 1;
    }

    if (targetIndex !== null && items[targetIndex]) {
      items[targetIndex].focus();
    }
  }

  /**
   * Primary navigation method: switches views and updates context bar.
   * @param {string} targetScreen - 'overview' | 'research' | 'library' | 'remix' | 'board'
   */
  navigateTo(targetScreen) {
    if (!targetScreen) targetScreen = 'overview';
    const cleanId = String(targetScreen).toLowerCase().trim().replace(/^screen-/, '').replace(/^nav-/, '');
    const config = STAGE_CONFIG[cleanId] || STAGE_CONFIG.overview;

    this.currentScreen = config.id;

    // 1. Update Navigation Tree active state (.is-active)
    this.updateNavItems(config);

    // 2. Update Screen Outlet visibility without reload
    this.updateScreenOutlet(config);

    // 3. Update Sticky Context Bar with Current Stage
    this.setStage(config.stageName, config.subtitle, config.theme, config.stepIndex);

    // 4. Update Browser URL Hash cleanly
    if (typeof window !== 'undefined' && window.location && window.location.hash !== '#' + config.id) {
      if (window.history && window.history.pushState) {
        window.history.pushState(null, '', '#' + config.id);
      }
    }

    // 5. Smooth scroll screen-outlet to top
    if (this.dom.screenOutlet && typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 6. Dispatch Custom Events for external modules
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('mew:stage-change', {
        detail: {
          stage: config.stageName,
          screen: config.id,
          theme: config.theme,
          timestamp: Date.now()
        }
      }));

      window.dispatchEvent(new CustomEvent('mew:view-changed', {
        detail: {
          view: config.id,
          stage: config.stageName,
          timestamp: Date.now()
        }
      }));
    }
  }

  /**
   * Sets the active state on the navigation items.
   * Active item has class `is-active` and `active` with aria-current="page".
   */
  updateNavItems(config) {
    if (!this.dom.navItems || !this.dom.navItems.length) {
      if (typeof document !== 'undefined') {
        this.dom.navItems = document.querySelectorAll(
          '[data-testid="nav-root"] [data-testid^="nav-"], [data-testid="nav-root"] .nav-tree-item, [data-testid="nav-root"] button, [data-testid="nav-root"] a'
        );
      } else {
        this.dom.navItems = [];
      }
    }

    this.dom.navItems.forEach((item) => {
      const itemScreenId = this.extractScreenId(item);
      const isMatch = (itemScreenId === config.id) || 
                      (item.id === config.navId) || 
                      (item.getAttribute('data-testid') === config.navId);

      if (isMatch) {
        item.classList.add('is-active', 'active');
        item.setAttribute('aria-current', 'page');
      } else {
        item.classList.remove('is-active', 'active');
        item.removeAttribute('aria-current');
      }
    });
  }

  /**
   * Switches screens within the <main data-testid="screen-outlet">.
   */
  updateScreenOutlet(config) {
    if (!this.dom.screenOutlet) {
      if (typeof document !== 'undefined') {
        this.dom.screenOutlet = document.querySelector('[data-testid="screen-outlet"]');
      }
    }
    if (!this.dom.screenOutlet) return;

    const screens = this.dom.screenOutlet.querySelectorAll('.screen-view, [data-screen]');
    screens.forEach((screen) => {
      const screenId = screen.getAttribute('data-screen') || screen.id.replace(/^screen-/, '');
      if (screenId === config.id) {
        screen.classList.add('is-active');
        screen.removeAttribute('hidden');
        screen.style.display = 'block';
      } else {
        screen.classList.remove('is-active');
        screen.setAttribute('hidden', 'until-found');
        screen.style.display = 'none';
      }
    });
  }

  /**
   * Updates the sticky <header data-testid="context-bar"> to display the current stage.
   * Founder glanceability: Stage name is prominently highlighted.
   * 
   * @param {string} stageName - 'Research' | 'Save' | 'Ingredients' | 'Remix' | 'Approve' | 'Overview'
   * @param {string} [subtitle] - Optional descriptive subtitle
   * @param {string} [theme] - Color theme identifier
   * @param {number} [stepIndex] - 0 to 5 for pipeline stepper
   */
  setStage(stageName, subtitle, theme = null, stepIndex = null) {
    this.currentStage = stageName;

    // Determine theme if not provided
    if (!theme) {
      const found = Object.values(STAGE_CONFIG).find(
        c => c.stageName.toLowerCase() === stageName.toLowerCase()
      );
      theme = found ? found.theme : stageName.toLowerCase();
      if (stepIndex === null && found) {
        stepIndex = found.stepIndex;
      }
    }

    // 1. Update text displays
    if (!this.dom.stageNameDisplays.length && typeof document !== 'undefined') {
      this.dom.stageNameDisplays = document.querySelectorAll(
        '[data-testid="stage-name"], #stage-name, .stage-name-display'
      );
    }
    this.dom.stageNameDisplays.forEach(el => {
      el.textContent = stageName;
    });

    // 2. Update badge theme attributes
    if (!this.dom.stageBadges.length && typeof document !== 'undefined') {
      this.dom.stageBadges = document.querySelectorAll(
        '[data-testid="current-stage-badge"], #current-stage-badge, .stage-badge-pill'
      );
    }
    this.dom.stageBadges.forEach(badge => {
      badge.setAttribute('data-stage-theme', theme);
    });

    // 3. Update subtitle
    if (this.dom.stageSubtext && subtitle) {
      this.dom.stageSubtext.textContent = subtitle;
    }

    // 4. Update Pipeline Stepper indicator
    if (!this.dom.stepperNodes.length && typeof document !== 'undefined') {
      this.dom.stepperNodes = document.querySelectorAll('.stepper-node');
    }
    this.dom.stepperNodes.forEach(node => {
      const nodeStage = node.getAttribute('data-stage');
      if (nodeStage && nodeStage.toLowerCase() === stageName.toLowerCase()) {
        node.classList.add('is-current');
        node.classList.remove('is-passed');
      } else {
        node.classList.remove('is-current');
      }
    });

    // 5. Accessible screen reader announcement
    const liveRegion = typeof document !== 'undefined' ? document.getElementById('stage-announcer') : null;
    if (liveRegion) {
      liveRegion.textContent = `Stage changed to ${stageName}`;
    }
  }

  /**
   * Opens the Human Save Gate modal and sets the current stage to "Save".
   */
  openSaveGateModal(itemData = {}) {
    if (!this.dom.saveModal) {
      this.dom.saveModal = document.getElementById('save-gate-modal');
    }
    if (!this.dom.saveModal) return;

    this.previousStageBeforeModal = this.currentStage;
    this.setStage(STAGE_CONFIG.save.stageName, STAGE_CONFIG.save.subtitle, STAGE_CONFIG.save.theme, STAGE_CONFIG.save.stepIndex);

    this.dom.saveModal.classList.add('is-open');
    this.dom.saveModal.setAttribute('aria-hidden', 'false');

    // Focus first interactive element
    const firstRadio = this.dom.saveModal.querySelector('input[type="radio"]');
    if (firstRadio) firstRadio.focus();
  }

  /**
   * Closes the Human Save Gate modal and restores previous stage.
   */
  closeSaveGateModal() {
    if (!this.dom.saveModal) return;

    this.dom.saveModal.classList.remove('is-open');
    this.dom.saveModal.setAttribute('aria-hidden', 'true');

    // Restore previous screen's stage
    if (this.previousStageBeforeModal) {
      const config = Object.values(STAGE_CONFIG).find(c => c.stageName === this.previousStageBeforeModal);
      if (config) {
        this.setStage(config.stageName, config.subtitle, config.theme, config.stepIndex);
      } else {
        this.navigateTo(this.currentScreen);
      }
      this.previousStageBeforeModal = null;
    }
  }

  /**
   * Synchronizes active screen from window.location.hash on page load or history traversal.
   */
  syncFromHash() {
    const rawHash = (window.location.hash || '').replace('#', '').trim();
    if (rawHash && STAGE_CONFIG[rawHash]) {
      this.navigateTo(rawHash);
    } else {
      this.navigateTo('overview');
    }
  }

  getCurrentStage() {
    return this.currentStage;
  }

  getCurrentScreen() {
    return this.currentScreen;
  }
}

// Instantiate singleton
export const appShell = new AppShellManager();

export function initAppShell() {
  appShell.init();
  return appShell;
}

export function navigateTo(screenId) {
  appShell.navigateTo(screenId);
}

export function setStage(stageName, subtitle, theme, stepIndex) {
  appShell.setStage(stageName, subtitle, theme, stepIndex);
}

export function getCurrentStage() {
  return appShell.getCurrentStage();
}

export function getCurrentScreen() {
  return appShell.getCurrentScreen();
}

export function openSaveGateModal(itemData) {
  appShell.openSaveGateModal(itemData);
}

export function closeSaveGateModal() {
  appShell.closeSaveGateModal();
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => appShell.init());
  } else {
    appShell.init();
  }
}
