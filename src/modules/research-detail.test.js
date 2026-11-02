/**
 * ==============================================================================
 * MEW CONTENT OS — S02 Research Detail Layout Unit Tests (Topic T08)
 * Framework: node:test & node:assert/strict
 * 
 * Verifies Definition of Done (DOD):
 * - HTML: ซ้าย video-player + source-meta (creator, ลิงก์ต้นฉบับ link-original, เวลา)
 *         ขวา analysis-panel มี 2 แท็บ tab-content-what และ tab-packaging-how
 * - HTML: ด้านล่างมี btn-save-to-library และ badge status-badge (เริ่มต้น Analyzed · Not saved)
 * - CSS: wireframe 1 ในสเปกข้อ 8 — สองคอลัมน์บนเดสก์ท็อป ซ้อนเป็นคอลัมน์เดียวบนมือถือ
 * - JS: สลับแท็บไม่ reload ไม่ทำให้ analysis หาย; ปุ่ม Back กลับ S01 โดยไม่ทำให้ source เข้า Vault (D1)
 * - JS: ปุ่ม btn-save-to-library เปิด Save Modal (T12) เท่านั้น ไม่ save เอง
 * 
 * Strict Negative Constraint:
 * Absolutely NO fake/arbitrary statistics or fake percentage badges.
 * ==============================================================================
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  ResearchDetailController,
  formatTime
} from './research-detail.js';

import { getState, dispatch, resetDemo } from './store.js';
import { router } from './router.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock DOM elements for unit tests in Node
class MockElement {
  constructor(tagName = 'div', attributes = {}) {
    this.tagName = tagName.toUpperCase();
    this.attributes = new Map(Object.entries(attributes));
    this.children = [];
    this.parentNode = null;
    this.textContent = '';
    this.value = attributes.value || '';
    this.style = {};
    this.eventListeners = new Map();
    this.tabIndex = 0;
    this.hidden = attributes.hidden !== undefined;

    const initialClasses = attributes.class ? attributes.class.split(/\s+/).filter(Boolean) : [];
    const classSet = new Set(initialClasses);
    this.classList = {
      _set: classSet,
      add(...classes) {
        classes.forEach(c => classSet.add(c));
      },
      remove(...classes) {
        classes.forEach(c => classSet.delete(c));
      },
      toggle(c, force) {
        if (force === undefined) {
          if (classSet.has(c)) {
            classSet.delete(c);
            return false;
          } else {
            classSet.add(c);
            return true;
          }
        } else if (force) {
          classSet.add(c);
          return true;
        } else {
          classSet.delete(c);
          return false;
        }
      },
      contains(c) {
        return classSet.has(c);
      },
      has(c) {
        return classSet.has(c);
      }
    };
  }

  setAttribute(name, val) {
    this.attributes.set(name, String(val));
    if (name === 'class') {
      this.classList._set.clear();
      String(val).split(/\s+/).filter(Boolean).forEach(c => this.classList._set.add(c));
    }
    if (name === 'hidden') {
      this.hidden = true;
    }
  }

  getAttribute(name) {
    return this.attributes.get(name) || null;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
    if (name === 'hidden') {
      this.hidden = false;
    }
  }

  addEventListener(type, listener) {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }
    this.eventListeners.get(type).push(listener);
  }

  dispatchEvent(event) {
    const listeners = this.eventListeners.get(event.type) || [];
    for (const listener of listeners) {
      listener(event);
    }
    return true;
  }

  querySelector(selector) {
    return findFirst(this, selector);
  }

  querySelectorAll(selector) {
    const results = [];
    findAll(this, selector, results);
    return results;
  }

  closest(selector) {
    let curr = this;
    while (curr) {
      if (matchesSelector(curr, selector)) return curr;
      curr = curr.parentNode;
    }
    return null;
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }
}

function matchesSelector(el, sel) {
  if (sel.startsWith('#')) {
    return el.getAttribute('id') === sel.slice(1);
  }
  if (sel.startsWith('.')) {
    return el.classList.contains(sel.slice(1));
  }
  if (sel.startsWith('[') && sel.endsWith(']')) {
    const inside = sel.slice(1, -1);
    if (inside.includes('=')) {
      const [attr, val] = inside.split('=').map(s => s.replace(/["']/g, '').trim());
      return el.getAttribute(attr) === val;
    }
    return el.attributes.has(inside);
  }
  return el.tagName.toLowerCase() === sel.toLowerCase();
}

function findFirst(root, selector) {
  for (const part of selector.split(',').map(s => s.trim())) {
    if (matchesSelector(root, part)) return root;
    for (const child of root.children) {
      const found = findFirst(child, part);
      if (found) return found;
    }
  }
  return null;
}

function findAll(root, selector, acc) {
  for (const part of selector.split(',').map(s => s.trim())) {
    for (const child of root.children) {
      if (matchesSelector(child, part)) {
        acc.push(child);
      }
      findAll(child, selector, acc);
    }
  }
}

describe('Topic T08: S02 Research Detail — Layout (Player + Tabs)', () => {
  let htmlContent = '';
  let cssContent = '';

  beforeEach(() => {
    resetDemo();
    const htmlPath = path.resolve(__dirname, '../components/research-detail.html');
    const cssPath = path.resolve(__dirname, '../styles/research-detail.css');
    htmlContent = fs.readFileSync(htmlPath, 'utf8');
    cssContent = fs.readFileSync(cssPath, 'utf8');
  });

  describe('1. HTML Contract & Structure Requirements', () => {
    test('T08-01: HTML contains left video-player and source-meta with creator, link-original, and duration', () => {
      // Left side elements: video-player, source-meta
      assert.ok(htmlContent.includes('id="video-player"') || htmlContent.includes('data-testid="video-player"'), 'video-player must exist in HTML');
      assert.ok(htmlContent.includes('id="source-meta"') || htmlContent.includes('data-testid="source-meta"'), 'source-meta must exist in HTML');

      // Metadata elements: creator, link-original, time/duration
      assert.ok(htmlContent.includes('id="meta-creator"') || htmlContent.includes('data-testid="meta-creator"') || htmlContent.includes('id="meta-creator-name"'), 'creator element must exist');
      assert.ok(htmlContent.includes('id="link-original"') || htmlContent.includes('data-testid="link-original"'), 'link-original must exist');
      assert.ok(htmlContent.includes('id="meta-duration"') || htmlContent.includes('data-testid="meta-duration"'), 'duration element must exist');
    });

    test('T08-02: HTML contains right analysis-panel with 2 tabs: tab-content-what and tab-packaging-how', () => {
      // Right side analysis-panel
      assert.ok(htmlContent.includes('id="analysis-panel"') || htmlContent.includes('data-testid="analysis-panel"'), 'analysis-panel must exist');

      // 2 Tabs
      assert.ok(htmlContent.includes('id="tab-content-what"') || htmlContent.includes('data-testid="tab-content-what"'), 'tab-content-what must exist');
      assert.ok(htmlContent.includes('id="tab-packaging-how"') || htmlContent.includes('data-testid="tab-packaging-how"'), 'tab-packaging-how must exist');

      // Corresponding tabpanels
      assert.ok(htmlContent.includes('id="panel-content-what"') || htmlContent.includes('data-testid="panel-content-what"'), 'panel-content-what must exist');
      assert.ok(htmlContent.includes('id="panel-packaging-how"') || htmlContent.includes('data-testid="panel-packaging-how"'), 'panel-packaging-how must exist');
    });

    test('T08-03: HTML contains bottom action bar with btn-save-to-library and status-badge starting as "Analyzed · Not saved"', () => {
      // Bottom save button
      assert.ok(htmlContent.includes('id="btn-save-to-library"') || htmlContent.includes('data-testid="btn-save-to-library"'), 'btn-save-to-library must exist');

      // Status badge and initial text
      assert.ok(htmlContent.includes('id="status-badge"') || htmlContent.includes('data-testid="status-badge"'), 'status-badge must exist');
      assert.ok(htmlContent.includes('Analyzed · Not saved') || htmlContent.includes('Analyzed &middot; Not saved'), 'status-badge must initialize with "Analyzed · Not saved"');

      // Back button returning to S01
      assert.ok(htmlContent.includes('btn-back-to-research') || htmlContent.includes('data-action="btn-back-to-research"'), 'back button to S01 must exist');
    });
  });

  describe('2. CSS Wireframe 1 & Responsive Styling Contract', () => {
    test('T08-04: CSS implements wireframe 1 two-column grid on desktop and stacks to single column on mobile', () => {
      // Grid specification
      assert.ok(cssContent.includes('.research-detail-grid'), 'Must define .research-detail-grid');
      assert.ok(cssContent.includes('grid-template-columns'), 'Must define grid-template-columns');

      // Responsive media query for mobile stack
      assert.ok(cssContent.includes('@media (max-width:'), 'Must contain media query for mobile responsiveness');
      assert.ok(cssContent.includes('grid-template-columns: 1fr'), 'Mobile query must stack to single column (1fr)');
    });

    test('T08-05: CSS implements mewteetawat.com V6.3 theme styling and .mew-offer-card accents', () => {
      // Theme colors
      assert.ok(cssContent.includes('--v6-paper: #fbfaf8') || cssContent.includes('#fbfaf8'), 'Palette must include #fbfaf8');
      assert.ok(cssContent.includes('--v6-ink: #11110f') || cssContent.includes('#11110f'), 'Palette must include deep ink #11110f');
      assert.ok(cssContent.includes('--v6-coral: #ed765b') || cssContent.includes('#ed765b'), 'Palette must include accent coral #ed765b');
      assert.ok(cssContent.includes('--v6-violet: #8a76ff') || cssContent.includes('#8a76ff'), 'Palette must include electric violet #8a76ff');

      // .mew-offer-card styling
      assert.ok(cssContent.includes('.mew-offer-card'), 'Must define .mew-offer-card style');
      assert.ok(cssContent.includes('coral-accent') || cssContent.includes('coral-bar') || cssContent.includes('violet-bar'), 'Must support accent bars');
      assert.ok(cssContent.includes('translateY(-2px)'), 'Cards or buttons must support translateY(-2px) hover interaction');
    });

    test('T08-06: CSS supports WCAG accessibility with focus states and prefers-reduced-motion', () => {
      assert.ok(cssContent.includes(':focus-visible'), 'Must define visible focus states for keyboard users');
      assert.ok(cssContent.includes('@media (prefers-reduced-motion: reduce)'), 'Must include prefers-reduced-motion query');
    });
  });

  describe('3. JS Tab Switching & Analysis Preservation', () => {
    test('T08-07: Switching tabs toggles between Content (WHAT) and Packaging (HOW) without reload or data loss', () => {
      // Create Mock Container
      const container = new MockElement('div', { id: 'screen-research-detail' });
      const tabWhat = new MockElement('button', { id: 'tab-content-what', class: 'pill-tab-button coral-tab active', 'aria-selected': 'true' });
      const tabHow = new MockElement('button', { id: 'tab-packaging-how', class: 'pill-tab-button violet-tab', 'aria-selected': 'false' });
      const panelWhat = new MockElement('div', { id: 'panel-content-what', class: 'analysis-tab-panel panel-content-what' });
      const panelHow = new MockElement('div', { id: 'panel-packaging-how', class: 'analysis-tab-panel panel-packaging-how', hidden: '' });
      const whatCoreIdea = new MockElement('div', { id: 'content-core-idea' });
      const howHook = new MockElement('div', { id: 'packaging-hook' });

      whatCoreIdea.textContent = 'โพสต์เสร็จอย่าคอยเปิดยอดทุกชั่วโมง';
      howHook.textContent = 'คำถามสะกิดใจเรื่องการเปิดเช็กยอด';

      panelWhat.appendChild(whatCoreIdea);
      panelHow.appendChild(howHook);
      container.appendChild(tabWhat);
      container.appendChild(tabHow);
      container.appendChild(panelWhat);
      container.appendChild(panelHow);

      const controller = new ResearchDetailController(container);

      // Initially on content tab
      assert.strictEqual(controller.activeTab, 'content');
      assert.strictEqual(tabWhat.getAttribute('aria-selected'), 'true');
      assert.strictEqual(panelWhat.hidden, false);

      // Switch to packaging tab
      controller.switchTab('packaging');
      assert.strictEqual(controller.activeTab, 'packaging');
      assert.strictEqual(tabWhat.getAttribute('aria-selected'), 'false');
      assert.strictEqual(tabHow.getAttribute('aria-selected'), 'true');
      assert.strictEqual(panelWhat.hidden, true);
      assert.strictEqual(panelHow.hidden, false);

      // Verify analysis content in both panels remains completely intact
      assert.ok(whatCoreIdea.textContent.includes('โพสต์เสร็จอย่าคอยเปิดยอดทุกชั่วโมง'));
      assert.ok(howHook.textContent.includes('คำถามสะกิดใจเรื่องการเปิดเช็กยอด'));

      // Switch back to content tab
      controller.switchTab('content');
      assert.strictEqual(controller.activeTab, 'content');
      assert.strictEqual(tabWhat.getAttribute('aria-selected'), 'true');
      assert.strictEqual(tabHow.getAttribute('aria-selected'), 'false');
      assert.strictEqual(panelWhat.hidden, false);
      assert.strictEqual(panelHow.hidden, true);
    });
  });

  describe('4. JS Back Button & Vault Protection (D1)', () => {
    test('T08-08: Back button navigates to S01 and strictly does NOT save source to Vault (D1)', () => {
      const container = new MockElement('div', { id: 'screen-research-detail' });
      const btnBack = new MockElement('button', { id: 'btn-back-to-research', class: 'btn-back-to-research' });
      container.appendChild(btnBack);

      const controller = new ResearchDetailController(container);

      const initialSavedNotesCount = getState().savedNotes.length;
      let navigatedScreen = null;

      // Track router.go
      const originalGo = router.go;
      router.go = (screenId) => {
        navigatedScreen = screenId;
      };

      try {
        controller.handleBackToResearch();

        // Must navigate to S01
        assert.strictEqual(navigatedScreen, 'S01', 'Must navigate back to S01');

        // Strictly verify D1: source is NOT saved to Vault
        const finalSavedNotesCount = getState().savedNotes.length;
        assert.strictEqual(finalSavedNotesCount, initialSavedNotesCount, 'D1: savedNotes count must remain strictly unchanged');
      } finally {
        router.go = originalGo;
      }
    });
  });

  describe('5. JS Save Button & Human Gate (T12)', () => {
    test('T08-09: btn-save-to-library strictly opens Save Modal (T12) and does NOT save by itself', () => {
      const container = new MockElement('div', { id: 'screen-research-detail' });
      const btnSave = new MockElement('button', { id: 'btn-save-to-library' });
      container.appendChild(btnSave);

      const controller = new ResearchDetailController(container);
      controller.loadSource('source-a');

      let modalOpenedWithClip = null;

      // Mock window global
      globalThis.window = {
        saveModalController: {
          open: (clip) => {
            modalOpenedWithClip = clip;
          }
        },
        dispatchEvent: () => {}
      };

      const initialSavedNotesCount = getState().savedNotes.length;

      try {
        controller.handleSaveToLibrary();

        // Verified: opens modal with clip metadata
        assert.ok(modalOpenedWithClip !== null, 'Must invoke openSaveModal');
        assert.strictEqual(modalOpenedWithClip.id, 'source-a');
        assert.strictEqual(modalOpenedWithClip.author, 'Creator A');

        // Verified: does NOT save to vault by itself
        const finalSavedNotesCount = getState().savedNotes.length;
        assert.strictEqual(finalSavedNotesCount, initialSavedNotesCount, 'btn-save-to-library must not save by itself');
      } finally {
        delete globalThis.window;
      }
    });
  });

  describe('6. Status Badge & Store Synchronization', () => {
    test('T08-10: Status badge defaults to "Analyzed · Not saved" when unsaved, and updates when note is saved', () => {
      const container = new MockElement('div', { id: 'screen-research-detail' });
      const statusBadge = new MockElement('div', { id: 'status-badge', class: 'status-badge' });
      const statusBadgeText = new MockElement('span', { id: 'status-badge-text' });
      statusBadge.appendChild(statusBadgeText);
      container.appendChild(statusBadge);

      const controller = new ResearchDetailController(container);
      
      // Load source-x (which has no saved notes initially)
      controller.loadSource('source-x');
      assert.ok(statusBadgeText.textContent.includes('Analyzed'), 'Should include Analyzed');
      assert.ok(statusBadge.classList.contains('status-analyzed-not-saved'));

      // Dispatch SAVE_NOTE for source-x to Content Vault
      dispatch({
        type: 'SAVE_NOTE',
        payload: {
          id: 'note-test-source-x-content',
          sourceId: 'source-x',
          lens: 'content',
          why: 'Test content why reason'
        }
      });

      controller.syncStatusWithStore();
      assert.strictEqual(statusBadgeText.textContent, 'Saved to Content');
      assert.ok(statusBadge.classList.contains('status-saved-content'));
    });
  });

  describe('7. Strict Negative Constraint Check', () => {
    test('T08-11: Zero fake/arbitrary statistics across all target files', () => {
      const forbiddenPhrases = [
        '12 สัปดาห์',
        '+12 สัปดาห์นี้',
        '12 สัปดาห์วิเคราะห์แล้ว',
        '+18% สัปดาห์นี้',
        '+24% สัปดาห์นี้'
      ];

      const jsPath = path.resolve(__dirname, 'research-detail.js');
      const jsContent = fs.readFileSync(jsPath, 'utf8');

      for (const phrase of forbiddenPhrases) {
        assert.ok(!htmlContent.includes(phrase), `HTML must not contain forbidden phrase "${phrase}"`);
        assert.ok(!cssContent.includes(phrase), `CSS must not contain forbidden phrase "${phrase}"`);
        assert.ok(!jsContent.includes(phrase), `JS must not contain forbidden phrase "${phrase}"`);
      }
    });
  });
});
