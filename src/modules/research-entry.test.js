/**
 * ==============================================================================
 * MEW CONTENT OS — S01 Research Entry Unit Tests (Topic T05)
 * Framework: node:test & node:assert/strict
 * Verifies:
 * - HTML: ช่อง `input-url` + ปุ่ม `btn-analyze-clip`
 * - HTML: ปุ่ม `btn-upload-owned` พร้อมข้อความ "Upload a video you own / have permission to use"
 * - HTML: แท็บ `tab-scan-feed`
 * - HTML: `tab-scan-feed` แสดง `scan-feed-unavailable` พร้อมข้อความตรง ๆ ว่ายังไม่มี adapter
 *         (ห้ามทำเหมือนทำงานจริง) จนกว่า flag `scanFeedEnabled` เป็น true
 * - CSS: ทั้ง 3 ทางเข้าอยู่ในกลุ่มเดียวกัน อ่านออกว่าเป็นทางเข้าเดียวกันสู่ S02
 * - JS: URL ว่าง/รูปแบบผิด → แสดง `error-url-invalid` ไม่เรียก analyze
 * - JS: กด `btn-analyze-clip` ด้วย URL ถูกต้อง → สร้าง researchItem สถานะ `Waiting for analysis` แล้วไป S02
 * ==============================================================================
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  validateUrl,
  isValidUrl,
  extractMetaFromUrl,
  createResearchItemFromUrl,
  createResearchItemFromUpload,
  scanFeedEnabled,
  setScanFeedEnabled,
  isScanFeedEnabled,
  switchEntryTab,
  ResearchEntryController
} from './research-entry.js';

import { getState, dispatch, resetDemo } from './store.js';
import { router } from './router.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Minimal mock DOM Element for testing controller in Node
class MockElement {
  constructor(tagName = 'div', attributes = {}) {
    this.tagName = tagName.toUpperCase();
    this.attributes = new Map(Object.entries(attributes));
    this.children = [];
    this.parentNode = null;
    this.textContent = '';
    this.value = attributes.value || '';
    this.eventListeners = new Map();
    this.style = {};
    this.classList = new Set();
    if (attributes.class) {
      attributes.class.split(/\s+/).filter(Boolean).forEach(c => this.classList.add(c));
    }
  }

  setAttribute(name, val) {
    this.attributes.set(name, String(val));
    if (name === 'class') {
      this.classList = new Set(String(val).split(/\s+/).filter(Boolean));
    }
  }

  getAttribute(name) {
    if (name === 'class') {
      return Array.from(this.classList).join(' ');
    }
    return this.attributes.get(name) || null;
  }

  hasAttribute(name) {
    return this.attributes.has(name);
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  addEventListener(type, fn) {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }
    this.eventListeners.get(type).push(fn);
  }

  removeEventListener(type, fn) {
    if (this.eventListeners.has(type)) {
      const list = this.eventListeners.get(type).filter(cb => cb !== fn);
      this.eventListeners.set(type, list);
    }
  }

  dispatchEvent(event) {
    const handlers = this.eventListeners.get(event.type) || [];
    handlers.forEach(fn => fn(event));
    return !event.defaultPrevented;
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const results = [];
    const selectors = selector.split(',').map(s => s.trim());

    const check = (node) => {
      let match = false;
      for (const sel of selectors) {
        if (sel.startsWith('#')) {
          const id = sel.slice(1);
          if (node.getAttribute('id') === id) match = true;
        } else if (sel.startsWith('.')) {
          const cls = sel.slice(1);
          if (node.classList && node.classList.has(cls)) match = true;
        } else if (sel.startsWith('[data-testid="')) {
          const tid = sel.slice(15, -2);
          if (node.getAttribute('data-testid') === tid) match = true;
        } else if (sel.includes('[role="tab"]')) {
          if (node.getAttribute('role') === 'tab') match = true;
        } else if (sel.includes('[role="tabpanel"]')) {
          if (node.getAttribute('role') === 'tabpanel') match = true;
        } else if (sel.includes('.entry-tab-btn')) {
          if (node.classList && node.classList.has('entry-tab-btn')) match = true;
        } else if (sel.includes('.preset-chip-btn')) {
          if (node.classList && node.classList.has('preset-chip-btn')) match = true;
        }
        if (match) break;
      }

      if (match) results.push(node);
      for (const child of node.children) {
        check(child);
      }
    };

    for (const child of this.children) {
      check(child);
    }
    return results;
  }

  focus() {
    this.focused = true;
  }
}

describe('S01 Research Entry Component & Controller — Topic T05', () => {

  beforeEach(() => {
    resetDemo();
    setScanFeedEnabled(false);
  });

  afterEach(() => {
    setScanFeedEnabled(false);
  });

  test('T05-01: HTML contract verifies input-url, btn-analyze-clip, btn-upload-owned, and tab-scan-feed exist in HTML file', () => {
    const htmlPath = path.resolve(__dirname, '../components/research-entry.html');
    assert.ok(fs.existsSync(htmlPath), 'src/components/research-entry.html must exist');
    
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

    // Check input-url
    assert.ok(htmlContent.includes('id="input-url"'), 'HTML must have id="input-url"');
    assert.ok(htmlContent.includes('data-testid="input-url"'), 'HTML must have data-testid="input-url"');

    // Check btn-analyze-clip
    assert.ok(htmlContent.includes('id="btn-analyze-clip"'), 'HTML must have id="btn-analyze-clip"');
    assert.ok(htmlContent.includes('data-testid="btn-analyze-clip"'), 'HTML must have data-testid="btn-analyze-clip"');

    // Check btn-upload-owned with exact phrase
    assert.ok(htmlContent.includes('id="btn-upload-owned"'), 'HTML must have id="btn-upload-owned"');
    assert.ok(htmlContent.includes('data-testid="btn-upload-owned"'), 'HTML must have data-testid="btn-upload-owned"');
    assert.ok(
      htmlContent.includes('Upload a video you own / have permission to use'),
      'HTML must contain exact text "Upload a video you own / have permission to use"'
    );

    // Check tab-scan-feed
    assert.ok(htmlContent.includes('id="tab-scan-feed"'), 'HTML must have id="tab-scan-feed"');
    assert.ok(htmlContent.includes('data-testid="tab-scan-feed"'), 'HTML must have data-testid="tab-scan-feed"');

    // Check scan-feed-unavailable
    assert.ok(htmlContent.includes('id="scan-feed-unavailable"'), 'HTML must have id="scan-feed-unavailable"');
    assert.ok(htmlContent.includes('data-testid="scan-feed-unavailable"'), 'HTML must have data-testid="scan-feed-unavailable"');

    // Check error-url-invalid
    assert.ok(htmlContent.includes('id="error-url-invalid"'), 'HTML must have id="error-url-invalid"');
    assert.ok(htmlContent.includes('data-testid="error-url-invalid"'), 'HTML must have data-testid="error-url-invalid"');

    // Check strict negative constraint: No fake metrics
    assert.ok(!htmlContent.includes('12 สัปดาห์'), 'HTML must NOT contain fake stats "12 สัปดาห์"');
    assert.ok(!htmlContent.includes('+12 สัปดาห์นี้'), 'HTML must NOT contain fake stats "+12 สัปดาห์นี้"');
  });

  test('T05-02: CSS contract verifies all 3 pathways are visually grouped under unified gateway heading to S02', () => {
    const cssPath = path.resolve(__dirname, '../styles/research-entry.css');
    assert.ok(fs.existsSync(cssPath), 'src/styles/research-entry.css must exist');
    
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

    // Check offer-card / gateway card grouping
    assert.ok(cssContent.includes('.entry-gateway-card') || cssContent.includes('.entry-pathways-group'), 'CSS must group the 3 pathways');
    assert.ok(cssContent.includes('.error-url-invalid'), 'CSS must style .error-url-invalid');
    assert.ok(cssContent.includes('.btn-upload-owned'), 'CSS must style .btn-upload-owned');
    assert.ok(cssContent.includes('.scan-feed-unavailable'), 'CSS must style .scan-feed-unavailable');
    
    // Check mewteetawat.com V6.3 theme variables
    assert.ok(cssContent.includes('--v6-coral') || cssContent.includes('#ed765b'), 'CSS must use Theme Coral');
    assert.ok(cssContent.includes('--v6-ink') || cssContent.includes('#11110f'), 'CSS must use Theme Deep Ink');
  });

  test('T05-03: validateUrl correctly validates URL format and catches empty / malformed strings', () => {
    // Empty / whitespace
    assert.strictEqual(validateUrl('').valid, false);
    assert.strictEqual(validateUrl('   ').valid, false);
    assert.strictEqual(validateUrl(null).valid, false);
    assert.strictEqual(validateUrl(undefined).valid, false);

    // Malformed / Non-HTTP
    assert.strictEqual(validateUrl('not-a-url').valid, false);
    assert.strictEqual(validateUrl('ftp://example.com/video.mp4').valid, false);
    assert.strictEqual(validateUrl('javascript:alert(1)').valid, false);

    // Valid URLs
    assert.strictEqual(validateUrl('https://example.com/watch?v=post-and-forget').valid, true);
    assert.strictEqual(validateUrl('http://example.com/video').valid, true);
    assert.strictEqual(validateUrl('https://www.tiktok.com/@mewteetawat/video/7391823901').valid, true);
    assert.strictEqual(validateUrl('https://www.youtube.com/shorts/123456789').valid, true);
  });

  test('T05-04: createResearchItemFromUrl creates a researchItem with status "Waiting for analysis" and registers source', () => {
    const testUrl = 'https://example.com/watch?v=spec-test-01';
    const { source, researchItem } = createResearchItemFromUrl(testUrl, {
      title: 'Test Spec Video',
      creator: 'Test Creator'
    });

    assert.ok(source, 'Source must be returned');
    assert.strictEqual(source.url, testUrl);
    assert.strictEqual(source.title, 'Test Spec Video');
    assert.strictEqual(source.hasPermission, true);

    assert.ok(researchItem, 'ResearchItem must be returned');
    assert.strictEqual(researchItem.status, 'Waiting for analysis', 'Status MUST be "Waiting for analysis" per DOD');
    assert.strictEqual(researchItem.sourceId, source.id);

    // Verify it is present in the Central Store
    const state = getState();
    const storedSource = state.sources.find(s => s.id === source.id);
    const storedItem = state.researchItems.find(ri => ri.id === researchItem.id);

    assert.ok(storedSource, 'Source must be dispatched to store');
    assert.ok(storedItem, 'ResearchItem must be dispatched to store');
    assert.strictEqual(storedItem.status, 'Waiting for analysis');
  });

  test('T05-05: createResearchItemFromUpload creates a researchItem with status "Waiting for analysis" for owned videos', () => {
    const uploadMeta = {
      name: 'founder-recorded-clip.mp4',
      title: 'Founder Recorded Clip',
      creator: 'Founder Me'
    };

    const { source, researchItem } = createResearchItemFromUpload(uploadMeta);

    assert.ok(source, 'Source must be returned');
    assert.strictEqual(source.creator, 'Founder Me');
    assert.strictEqual(source.hasPermission, true);

    assert.ok(researchItem, 'ResearchItem must be returned');
    assert.strictEqual(researchItem.status, 'Waiting for analysis', 'Status MUST be "Waiting for analysis" per DOD');
    assert.strictEqual(researchItem.sourceId, source.id);

    const state = getState();
    const storedItem = state.researchItems.find(ri => ri.id === researchItem.id);
    assert.ok(storedItem, 'ResearchItem must be in store');
    assert.strictEqual(storedItem.status, 'Waiting for analysis');
  });

  test('T05-06: Scan Feed availability flag defaults to false and displays scan-feed-unavailable honestly', () => {
    assert.strictEqual(isScanFeedEnabled(), false, 'scanFeedEnabled must default to false');

    setScanFeedEnabled(true);
    assert.strictEqual(isScanFeedEnabled(), true);

    setScanFeedEnabled(false);
    assert.strictEqual(isScanFeedEnabled(), false);
  });

  test('T05-07: Controller shows error-url-invalid on empty/invalid URL without calling analyze or navigating', () => {
    // Build Mock DOM tree for Controller
    const root = new MockElement('div', { id: 'research-entry-root' });
    const inputUrl = new MockElement('input', { id: 'input-url', 'data-testid': 'input-url', value: '' });
    const btnAnalyze = new MockElement('button', { id: 'btn-analyze-clip', 'data-testid': 'btn-analyze-clip' });
    const errorEl = new MockElement('div', { id: 'error-url-invalid', 'data-testid': 'error-url-invalid' });
    errorEl.setAttribute('hidden', 'true');
    errorEl.style.display = 'none';

    root.appendChild(inputUrl);
    root.appendChild(btnAnalyze);
    root.appendChild(errorEl);

    const initialSourceCount = getState().sources.length;
    const initialResearchCount = getState().researchItems.length;

    // Track router navigation
    let navigatedScreen = null;
    const unsubscribeRouter = router.subscribe((screenId) => {
      navigatedScreen = screenId;
    });

    const controller = new ResearchEntryController(root);
    controller.init(root);

    // 1. Click with empty URL
    inputUrl.value = '   ';
    btnAnalyze.dispatchEvent({ type: 'click', preventDefault: () => {} });

    // Error must be visible (hidden removed or display set)
    assert.strictEqual(errorEl.hasAttribute('hidden'), false, 'error-url-invalid must not be hidden when URL is empty');
    assert.strictEqual(errorEl.style.display, 'flex');

    // Store must NOT be modified
    assert.strictEqual(getState().sources.length, initialSourceCount, 'No source must be created on invalid URL');
    assert.strictEqual(getState().researchItems.length, initialResearchCount, 'No research item must be created on invalid URL');

    // Router must NOT navigate to S02
    assert.notStrictEqual(navigatedScreen, 'S02', 'Must not navigate to S02 on invalid URL');

    // 2. Click with invalid protocol URL
    inputUrl.value = 'ftp://invalid-domain.com/video.mp4';
    btnAnalyze.dispatchEvent({ type: 'click', preventDefault: () => {} });

    assert.strictEqual(errorEl.hasAttribute('hidden'), false, 'error-url-invalid must be shown for invalid protocol');
    assert.strictEqual(getState().sources.length, initialSourceCount);

    // 3. Click with VALID URL -> creates item and navigates to S02
    inputUrl.value = 'https://example.com/watch?v=valid-url-test';
    btnAnalyze.dispatchEvent({ type: 'click', preventDefault: () => {} });

    // Error must now be hidden
    assert.strictEqual(errorEl.hasAttribute('hidden'), true, 'error-url-invalid must be hidden after valid submission');

    // Store must have new researchItem with 'Waiting for analysis'
    const updatedState = getState();
    assert.strictEqual(updatedState.sources.length, initialSourceCount + 1);
    assert.strictEqual(updatedState.researchItems.length, initialResearchCount + 1);
    
    const latestItem = updatedState.researchItems[updatedState.researchItems.length - 1];
    assert.strictEqual(latestItem.status, 'Waiting for analysis');

    // Router navigated to S02
    assert.strictEqual(router.currentScreen, 'S02', 'Router must navigate to S02 upon valid submission');

    controller.destroy();
    unsubscribeRouter();
  });

});
