/**
 * ==============================================================================
 * MEW CONTENT OS — S01 Research Entry Controller (Topic T05)
 * Pure Client-Side JavaScript (ES6+ Module) · Zero Server Dependencies
 * Theme: mewteetawat.com V6.3
 * 
 * Definition of Done (DOD) Checklist:
 * - HTML: ช่อง `input-url` + ปุ่ม `btn-analyze-clip`; ปุ่ม `btn-upload-owned`
 *         พร้อมข้อความ "Upload a video you own / have permission to use"; แท็บ `tab-scan-feed`
 * - HTML: `tab-scan-feed` แสดง `scan-feed-unavailable` พร้อมข้อความตรง ๆ ว่ายังไม่มี adapter ที่ใช้งานได้
 *         (ห้ามทำเหมือนทำงานจริง) จนกว่า flag `scanFeedEnabled` เป็น true
 * - CSS: ทั้ง 3 ทางเข้าอยู่ในกลุ่มเดียวกัน อ่านออกว่าเป็นทางเข้าเดียวกันสู่ S02
 * - JS: URL ว่าง/รูปแบบผิด → แสดง `error-url-invalid` ไม่เรียก analyze
 * - JS: กด `btn-analyze-clip` ด้วย URL ถูกต้อง → สร้าง researchItem สถานะ `Waiting for analysis` แล้วไป S02
 * 
 * Strict Negative Constraint:
 * Absolutely NO fake or arbitrary statistics (e.g. "arbitrary weeks", "+arbitrary weeksนี้").
 * ==============================================================================
 */

import { getState, dispatch } from './store.js';
import { router, go as routerGo } from './router.js';

/**
 * Scan Feed Adapter Availability Flag
 * UX Spec Section 0 & S01: Honesty principle strictly requires no fake scraping or hallucinated feed
 * unless a real platform adapter is actively enabled.
 */
export let scanFeedEnabled = false;

/**
 * Updates the scanFeedEnabled state.
 * @param {boolean} enabled 
 */
export function setScanFeedEnabled(enabled) {
  scanFeedEnabled = Boolean(enabled);
  // If in browser DOM, sync active view
  if (typeof document !== 'undefined') {
    syncScanFeedDom();
  }
}

/**
 * Gets the current scanFeedEnabled state.
 * @returns {boolean}
 */
export function isScanFeedEnabled() {
  return scanFeedEnabled;
}

/**
 * Validates a video URL string.
 * Must be non-empty, properly formatted, and use HTTP or HTTPS protocol.
 * 
 * @param {string} urlString 
 * @returns {{ valid: boolean, error?: string, normalizedUrl?: string }}
 */
export function validateUrl(urlString) {
  if (typeof urlString !== 'string') {
    return { valid: false, error: 'URL_EMPTY' };
  }

  const trimmed = urlString.trim();
  if (!trimmed) {
    return { valid: false, error: 'URL_EMPTY' };
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, error: 'INVALID_PROTOCOL' };
    }
    // Must contain a hostname with at least one dot or localhost
    if (!parsed.hostname || (!parsed.hostname.includes('.') && parsed.hostname !== 'localhost')) {
      return { valid: false, error: 'INVALID_HOSTNAME' };
    }
    return { valid: true, normalizedUrl: parsed.href };
  } catch {
    return { valid: false, error: 'URL_MALFORMED' };
  }
}

/**
 * Convenient boolean check for valid URL.
 * @param {string} urlString 
 * @returns {boolean}
 */
export function isValidUrl(urlString) {
  return validateUrl(urlString).valid;
}

/**
 * Extracts a readable title and creator hint from a URL.
 * @param {string} urlString 
 * @returns {{ title: string, creator: string }}
 */
export function extractMetaFromUrl(urlString) {
  try {
    const parsed = new URL(urlString.trim());
    const hostname = parsed.hostname.replace(/^www\./, '');
    
    // TikTok
    if (hostname.includes('tiktok.com')) {
      const match = parsed.pathname.match(/@([^/]+)/);
      const creator = match ? `@${match[1]}` : 'TikTok Creator';
      return { title: `TikTok Reference (${creator})`, creator };
    }

    // YouTube / Shorts
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      if (parsed.pathname.includes('/shorts/')) {
        return { title: 'YouTube Shorts Reference', creator: 'YouTube Creator' };
      }
      return { title: 'YouTube Video Reference', creator: 'YouTube Creator' };
    }

    // Instagram Reels
    if (hostname.includes('instagram.com')) {
      return { title: 'Instagram Reels Reference', creator: 'Instagram Creator' };
    }

    // Generic Web Video
    return {
      title: `Reference Clip (${hostname})`,
      creator: hostname
    };
  } catch {
    return {
      title: 'New Video Reference',
      creator: 'Online Creator'
    };
  }
}

/**
 * Creates a source record and a researchItem in the store with status 'Waiting for analysis'.
 * 
 * @param {string} urlString - Validated HTTP/HTTPS URL
 * @param {object} [extraMeta={}] - Optional metadata overrides
 * @returns {{ source: object, researchItem: object }}
 */
export function createResearchItemFromUrl(urlString, extraMeta = {}) {
  const validation = validateUrl(urlString);
  if (!validation.valid) {
    throw new Error(`Cannot create research item: ${validation.error}`);
  }

  const cleanUrl = validation.normalizedUrl || urlString.trim();
  const defaultMeta = extractMetaFromUrl(cleanUrl);

  const sourceId = extraMeta.id || `source-url-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  
  const source = {
    id: sourceId,
    title: extraMeta.title || defaultMeta.title,
    creator: extraMeta.creator || defaultMeta.creator,
    url: cleanUrl,
    duration: extraMeta.duration || '02:00',
    thumbnail: extraMeta.thumbnail || 'assets/video_preview.png',
    hasPermission: true,
    tags: extraMeta.tags || ['Research', 'Reference'],
    createdAt: new Date().toISOString()
  };

  // Status MUST be 'Waiting for analysis' according to DOD
  const researchItem = {
    id: `item-${sourceId}`,
    sourceId: sourceId,
    status: 'Waiting for analysis',
    createdAt: new Date().toISOString()
  };

  // Dispatch to store
  dispatch({ type: 'ADD_SOURCE', payload: source });
  dispatch({ type: 'ADD_RESEARCH_ITEM', payload: researchItem });

  return { source, researchItem };
}

/**
 * Creates a source and researchItem for an owned video file.
 * 
 * @param {File|object} fileOrMeta - File instance or metadata object
 * @returns {{ source: object, researchItem: object }}
 */
export function createResearchItemFromUpload(fileOrMeta = {}) {
  const fileName = fileOrMeta.name || fileOrMeta.title || 'Owned Video Reference';
  const sourceId = fileOrMeta.id || `source-owned-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  
  let videoUrl = 'assets/video_preview.png';
  if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function' && fileOrMeta instanceof File) {
    try {
      videoUrl = URL.createObjectURL(fileOrMeta);
    } catch {
      videoUrl = `file://${fileName}`;
    }
  } else if (fileOrMeta.url) {
    videoUrl = fileOrMeta.url;
  }

  const source = {
    id: sourceId,
    title: fileName.replace(/\.[^/.]+$/, ''),
    creator: fileOrMeta.creator || 'Founder (Owned Video)',
    url: videoUrl,
    duration: fileOrMeta.duration || '01:30',
    thumbnail: 'assets/video_preview.png',
    hasPermission: true,
    tags: fileOrMeta.tags || ['Owned Video', 'Permission Granted'],
    createdAt: new Date().toISOString()
  };

  // Status MUST be 'Waiting for analysis' according to DOD
  const researchItem = {
    id: `item-${sourceId}`,
    sourceId: sourceId,
    status: 'Waiting for analysis',
    createdAt: new Date().toISOString()
  };

  dispatch({ type: 'ADD_SOURCE', payload: source });
  dispatch({ type: 'ADD_RESEARCH_ITEM', payload: researchItem });

  return { source, researchItem };
}

/**
 * Synchronizes Scan Feed UI depending on the scanFeedEnabled flag.
 */
export function syncScanFeedDom(rootElement = document) {
  if (!rootElement) return;

  const unavailableEl = rootElement.querySelector('#scan-feed-unavailable, [data-testid="scan-feed-unavailable"]');
  const activeContentEl = rootElement.querySelector('#scan-feed-active-content, [data-testid="scan-feed-active-content"]');
  const badgeEl = rootElement.querySelector('#tab-scan-badge');

  if (unavailableEl && activeContentEl) {
    if (scanFeedEnabled) {
      unavailableEl.setAttribute('hidden', 'true');
      unavailableEl.style.display = 'none';
      activeContentEl.removeAttribute('hidden');
      activeContentEl.style.display = 'block';
      if (badgeEl) {
        badgeEl.textContent = 'Active';
        badgeEl.className = 'tab-pill-badge green';
      }
    } else {
      unavailableEl.removeAttribute('hidden');
      unavailableEl.style.display = 'flex';
      activeContentEl.setAttribute('hidden', 'true');
      activeContentEl.style.display = 'none';
      if (badgeEl) {
        badgeEl.textContent = 'Adapter Needed';
        badgeEl.className = 'tab-pill-badge';
      }
    }
  }
}

/**
 * Switches the active pathway tab inside the Research Entry gateway.
 * 
 * @param {'url'|'upload'|'scan-feed'} tabName 
 * @param {HTMLElement} [rootElement=document] 
 */
export function switchEntryTab(tabName, rootElement = document) {
  if (!rootElement) return;

  const tabs = rootElement.querySelectorAll('.entry-tab-btn, [role="tab"]');
  const panels = rootElement.querySelectorAll('.pathway-panel, [role="tabpanel"]');

  tabs.forEach(tab => {
    const target = tab.getAttribute('data-tab-target') || (tab.id || '').replace(/^tab-/, '');
    const isActive = target === tabName;
    
    if (isActive) {
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
    } else {
      tab.classList.remove('active');
      tab.setAttribute('aria-selected', 'false');
    }
  });

  panels.forEach(panel => {
    const panelId = panel.id;
    const isTarget = panelId === `panel-${tabName}`;
    
    if (isTarget) {
      panel.classList.add('active');
      panel.removeAttribute('hidden');
      panel.style.display = 'block';
    } else {
      panel.classList.remove('active');
      panel.setAttribute('hidden', 'true');
      panel.style.display = 'none';
    }
  });

  if (tabName === 'scan-feed') {
    syncScanFeedDom(rootElement);
  }
}

/**
 * Controller class for S01 Research Entry component
 */
export class ResearchEntryController {
  constructor(rootElement = null) {
    this.root = rootElement;
    this.selectedFile = null;
    this.boundHandlers = [];
  }

  /**
   * Initializes all DOM bindings and listeners.
   * @param {HTMLElement} [rootElement] 
   */
  init(rootElement) {
    if (rootElement) {
      this.root = rootElement;
    } else if (!this.root && typeof document !== 'undefined') {
      this.root = document.querySelector('#research-entry-root, [data-testid="research-entry-root"]') || document.body;
    }

    if (!this.root) return;

    this.bindEvents();
    syncScanFeedDom(this.root);
  }

  /**
   * Binds event listeners for tabs, analyze button, upload button, presets, and errors.
   */
  bindEvents() {
    if (!this.root) return;

    // 1. Tab buttons click
    const tabBtns = this.root.querySelectorAll('.entry-tab-btn, [role="tab"]');
    tabBtns.forEach(btn => {
      const handler = (e) => {
        e.preventDefault();
        const tabTarget = btn.getAttribute('data-tab-target') || (btn.id || '').replace(/^tab-/, '');
        switchEntryTab(tabTarget, this.root);
      };
      btn.addEventListener('click', handler);
      this.boundHandlers.push({ el: btn, type: 'click', fn: handler });
    });

    // 2. URL Form Submit & Analyze Button
    const formUrl = this.root.querySelector('#form-url-ingest');
    const btnAnalyze = this.root.querySelector('#btn-analyze-clip, [data-testid="btn-analyze-clip"]');
    const inputUrl = this.root.querySelector('#input-url, [data-testid="input-url"]');
    const errorEl = this.root.querySelector('#error-url-invalid, [data-testid="error-url-invalid"]');

    const handleAnalyze = (e) => {
      if (e) e.preventDefault();
      const urlValue = inputUrl ? inputUrl.value : '';
      const validation = validateUrl(urlValue);

      if (!validation.valid) {
        // Show error-url-invalid; DO NOT call analyze or navigate
        if (errorEl) {
          errorEl.removeAttribute('hidden');
          errorEl.style.display = 'flex';
          
          const descEl = errorEl.querySelector('#error-url-text');
          if (descEl) {
            if (validation.error === 'URL_EMPTY') {
              descEl.textContent = 'กรุณาระบุ URL วิดีโอ ไม่สามารถเว้นว่างได้';
            } else {
              descEl.textContent = 'รูปแบบ URL ไม่ถูกต้อง กรุณาระบุ URL ที่ขึ้นต้นด้วย http:// หรือ https://';
            }
          }
        }
        if (inputUrl && typeof inputUrl.focus === 'function') {
          inputUrl.focus();
        }
        return false;
      }

      // Hide error
      if (errorEl) {
        errorEl.setAttribute('hidden', 'true');
        errorEl.style.display = 'none';
      }

      // Create researchItem with 'Waiting for analysis'
      const { source, researchItem } = createResearchItemFromUrl(urlValue);

      // Navigate to S02
      if (typeof router !== 'undefined' && typeof router.go === 'function') {
        router.go('S02', { sourceId: source.id, itemId: researchItem.id });
      } else {
        routerGo('S02', { sourceId: source.id, itemId: researchItem.id });
      }

      return true;
    };

    if (btnAnalyze) {
      btnAnalyze.addEventListener('click', handleAnalyze);
      this.boundHandlers.push({ el: btnAnalyze, type: 'click', fn: handleAnalyze });
    }

    if (formUrl) {
      formUrl.addEventListener('submit', handleAnalyze);
      this.boundHandlers.push({ el: formUrl, type: 'submit', fn: handleAnalyze });
    }

    // Clear error on input typing
    if (inputUrl) {
      const inputHandler = () => {
        if (errorEl && !errorEl.hasAttribute('hidden')) {
          errorEl.setAttribute('hidden', 'true');
          errorEl.style.display = 'none';
        }
      };
      inputUrl.addEventListener('input', inputHandler);
      this.boundHandlers.push({ el: inputUrl, type: 'input', fn: inputHandler });
    }

    // 3. Quick Presets buttons
    const presetBtns = this.root.querySelectorAll('.preset-chip-btn');
    presetBtns.forEach(pBtn => {
      const pHandler = (e) => {
        e.preventDefault();
        const presetUrl = pBtn.getAttribute('data-preset-url');
        if (inputUrl && presetUrl) {
          inputUrl.value = presetUrl;
          if (errorEl) {
            errorEl.setAttribute('hidden', 'true');
            errorEl.style.display = 'none';
          }
          inputUrl.focus();
        }
      };
      pBtn.addEventListener('click', pHandler);
      this.boundHandlers.push({ el: pBtn, type: 'click', fn: pHandler });
    });

    // 4. Upload Owned Video Button & File Input
    const btnUploadOwned = this.root.querySelector('#btn-upload-owned, [data-testid="btn-upload-owned"]');
    const inputFileOwned = this.root.querySelector('#input-file-owned, [data-testid="input-file-owned"]');
    const uploadDropArea = this.root.querySelector('#upload-zone-droparea');
    const fileStatusBox = this.root.querySelector('#upload-file-status');
    const fileNameEl = this.root.querySelector('#uploaded-file-name');
    const fileSizeEl = this.root.querySelector('#uploaded-file-size');
    const btnProceedUpload = this.root.querySelector('#btn-proceed-upload');

    const handleUploadClick = (e) => {
      if (e) e.preventDefault();
      if (inputFileOwned) {
        inputFileOwned.click();
      }
    };

    if (btnUploadOwned) {
      btnUploadOwned.addEventListener('click', handleUploadClick);
      this.boundHandlers.push({ el: btnUploadOwned, type: 'click', fn: handleUploadClick });
    }

    const handleFileChosen = (file) => {
      if (!file) return;
      this.selectedFile = file;

      if (fileStatusBox && fileNameEl) {
        fileNameEl.textContent = file.name;
        if (fileSizeEl) {
          const mb = (file.size / (1024 * 1024)).toFixed(1);
          fileSizeEl.textContent = `${mb} MB`;
        }
        fileStatusBox.removeAttribute('hidden');
        fileStatusBox.style.display = 'flex';
      }
    };

    if (inputFileOwned) {
      const fileChangeHandler = (e) => {
        const file = e.target.files && e.target.files[0];
        handleFileChosen(file);
      };
      inputFileOwned.addEventListener('change', fileChangeHandler);
      this.boundHandlers.push({ el: inputFileOwned, type: 'change', fn: fileChangeHandler });
    }

    // Drag and drop support
    if (uploadDropArea) {
      const dragOverHandler = (e) => {
        e.preventDefault();
        uploadDropArea.classList.add('dragover');
      };
      const dragLeaveHandler = (e) => {
        e.preventDefault();
        uploadDropArea.classList.remove('dragover');
      };
      const dropHandler = (e) => {
        e.preventDefault();
        uploadDropArea.classList.remove('dragover');
        const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
        if (file) {
          handleFileChosen(file);
        }
      };

      uploadDropArea.addEventListener('dragover', dragOverHandler);
      uploadDropArea.addEventListener('dragleave', dragLeaveHandler);
      uploadDropArea.addEventListener('drop', dropHandler);

      this.boundHandlers.push(
        { el: uploadDropArea, type: 'dragover', fn: dragOverHandler },
        { el: uploadDropArea, type: 'dragleave', fn: dragLeaveHandler },
        { el: uploadDropArea, type: 'drop', fn: dropHandler }
      );
    }

    // Proceed to analysis with selected file
    if (btnProceedUpload) {
      const proceedHandler = (e) => {
        e.preventDefault();
        if (this.selectedFile) {
          const { source, researchItem } = createResearchItemFromUpload(this.selectedFile);
          if (typeof router !== 'undefined' && typeof router.go === 'function') {
            router.go('S02', { sourceId: source.id, itemId: researchItem.id });
          } else {
            routerGo('S02', { sourceId: source.id, itemId: researchItem.id });
          }
        }
      };
      btnProceedUpload.addEventListener('click', proceedHandler);
      this.boundHandlers.push({ el: btnProceedUpload, type: 'click', fn: proceedHandler });
    }

    // 5. Switch to URL from Scan Feed
    const btnSwitchToUrl = this.root.querySelector('#btn-switch-to-url');
    if (btnSwitchToUrl) {
      const switchHandler = (e) => {
        e.preventDefault();
        switchEntryTab('url', this.root);
        if (inputUrl) inputUrl.focus();
      };
      btnSwitchToUrl.addEventListener('click', switchHandler);
      this.boundHandlers.push({ el: btnSwitchToUrl, type: 'click', fn: switchHandler });
    }

    // 6. Back to Overview Button
    const btnBack = this.root.querySelector('#btn-back-overview, [data-testid="btn-back-overview"]');
    if (btnBack) {
      const backHandler = (e) => {
        e.preventDefault();
        if (typeof router !== 'undefined' && typeof router.go === 'function') {
          router.go('S00');
        } else {
          routerGo('S00');
        }
      };
      btnBack.addEventListener('click', backHandler);
      this.boundHandlers.push({ el: btnBack, type: 'click', fn: backHandler });
    }
  }

  /**
   * Destroys all registered listeners to prevent memory leaks.
   */
  destroy() {
    this.boundHandlers.forEach(({ el, type, fn }) => {
      if (el && typeof el.removeEventListener === 'function') {
        el.removeEventListener(type, fn);
      }
    });
    this.boundHandlers = [];
    this.selectedFile = null;
  }
}

/**
 * Singleton instance of controller
 */
export const researchEntryController = new ResearchEntryController();

/**
 * Auto-initialize on browser load if DOM ready
 */
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      researchEntryController.init();
    });
  } else {
    researchEntryController.init();
  }
}
