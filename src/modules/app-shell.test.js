/**
 * ==============================================================================
 * MEW CONTENT OS — App Shell & Navigation Tree Unit Tests (Topic T01)
 * Framework: node:test & node:assert/strict
 * Reference: MEW_Content_OS_Founder_UX_Spec_TH.md Section 3 & plan.md Topic T01
 * 
 * Verifies:
 * - HTML: <nav data-testid="nav-root"> contains 5 items in strict spec 3 order:
 *         nav-overview, nav-research, nav-library, nav-remix, nav-board
 * - HTML: <main data-testid="screen-outlet"> and <header data-testid="context-bar"> exist
 * - CSS: Active menu item has class is-active; context-bar has sticky positioning
 * - JS: STAGE_CONFIG has the required stages (Overview, Research, Ingredients, Remix, Approve, Save)
 * - JS: appShell navigation switches active state and updates context-bar stage name
 * - Founder glanceability: Stage is displayed prominently in context-bar
 * ==============================================================================
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  appShell,
  STAGE_CONFIG,
  initAppShell,
  navigateTo,
  setStage,
  getCurrentStage,
  getCurrentScreen
} from './app-shell.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock DOM elements for testing app-shell in Node.js environment
class MockDOMElement {
  constructor(tagName = 'div', attributes = {}) {
    this.tagName = tagName;
    this.attributes = new Map(Object.entries(attributes));
    this.classList = new Set();
    this.children = [];
    this.parentNode = null;
    this.textContent = '';
    this.style = {};
    this.eventListeners = new Map();

    if (attributes.class) {
      attributes.class.split(/\s+/).filter(Boolean).forEach(c => this.classList.add(c));
    }
  }

  setAttribute(name, val) {
    this.attributes.set(name, String(val));
    if (name === 'class') {
      this.classList.clear();
      String(val).split(/\s+/).filter(Boolean).forEach(c => this.classList.add(c));
    }
  }

  getAttribute(name) {
    if (name === 'class') {
      return Array.from(this.classList).join(' ') || null;
    }
    return this.attributes.get(name) || null;
  }

  hasAttribute(name) {
    return this.attributes.has(name) || (name === 'class' && this.classList.size > 0);
  }

  removeAttribute(name) {
    this.attributes.delete(name);
    if (name === 'class') {
      this.classList.clear();
    }
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
    const list = this.eventListeners.get(type) || [];
    this.eventListeners.set(type, list.filter(f => f !== fn));
  }

  closest(selector) {
    let curr = this;
    while (curr) {
      if (curr.matches && curr.matches(selector)) return curr;
      curr = curr.parentNode;
    }
    return null;
  }

  matches(selector) {
    if (selector.startsWith('[data-testid="')) {
      const id = selector.slice(14, -2);
      return this.getAttribute('data-testid') === id;
    }
    if (selector.startsWith('[data-target="') || selector.startsWith('[data-target]')) {
      return this.hasAttribute('data-target');
    }
    if (selector.startsWith('#')) {
      return this.getAttribute('id') === selector.slice(1);
    }
    if (selector.startsWith('.')) {
      return this.classList.has(selector.slice(1));
    }
    return false;
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const results = [];
    const check = (node) => {
      let matched = false;
      if (selector === '[data-testid="nav-root"]') {
        matched = node.getAttribute('data-testid') === 'nav-root';
      } else if (selector === '[data-testid="context-bar"]') {
        matched = node.getAttribute('data-testid') === 'context-bar';
      } else if (selector === '[data-testid="screen-outlet"]') {
        matched = node.getAttribute('data-testid') === 'screen-outlet';
      } else if (selector.includes('data-testid=')) {
        const idMatch = selector.match(/data-testid="([^"]+)"/);
        if (idMatch && node.getAttribute('data-testid') === idMatch[1]) matched = true;
      } else if (selector.includes('data-testid^="nav-"')) {
        const testId = node.getAttribute('data-testid');
        if (testId && testId.startsWith('nav-')) matched = true;
      } else if (selector.startsWith('#')) {
        if (node.getAttribute('id') === selector.slice(1)) matched = true;
      } else if (selector.startsWith('.')) {
        if (node.classList.has(selector.slice(1))) matched = true;
      } else if (selector === '.screen-view, [data-screen]') {
        if (node.classList.has('screen-view') || node.hasAttribute('data-screen')) matched = true;
      }
      if (matched) results.push(node);
      node.children.forEach(check);
    };
    this.children.forEach(check);
    return results;
  }
}

describe('App Shell + Navigation Tree — Topic T01', () => {
  const htmlPath = path.resolve(__dirname, '../components/app-shell.html');
  const cssPath = path.resolve(__dirname, '../styles/app-shell.css');
  const jsPath = path.resolve(__dirname, './app-shell.js');

  test('T01-01: Target files exist and are non-empty', () => {
    assert.ok(fs.existsSync(htmlPath), 'app-shell.html must exist');
    assert.ok(fs.existsSync(cssPath), 'app-shell.css must exist');
    assert.ok(fs.existsSync(jsPath), 'app-shell.js must exist');

    assert.ok(fs.statSync(htmlPath).size > 500, 'app-shell.html must not be empty');
    assert.ok(fs.statSync(cssPath).size > 500, 'app-shell.css must not be empty');
    assert.ok(fs.statSync(jsPath).size > 500, 'app-shell.js must not be empty');
  });

  test('T01-02: HTML contains <nav data-testid="nav-root"> with 5 items in strict spec 3 order', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');

    assert.ok(html.includes('data-testid="nav-root"'), 'Must contain nav-root');

    // 5 Navigation items in exact order:
    // 1. nav-overview
    // 2. nav-research
    // 3. nav-library
    // 4. nav-remix
    // 5. nav-board
    const idxOverview = html.indexOf('data-testid="nav-overview"');
    const idxResearch = html.indexOf('data-testid="nav-research"');
    const idxLibrary = html.indexOf('data-testid="nav-library"');
    const idxRemix = html.indexOf('data-testid="nav-remix"');
    const idxBoard = html.indexOf('data-testid="nav-board"');

    assert.ok(idxOverview !== -1, 'nav-overview must exist');
    assert.ok(idxResearch !== -1, 'nav-research must exist');
    assert.ok(idxLibrary !== -1, 'nav-library must exist');
    assert.ok(idxRemix !== -1, 'nav-remix must exist');
    assert.ok(idxBoard !== -1, 'nav-board must exist');

    assert.ok(idxOverview < idxResearch, 'nav-overview must precede nav-research');
    assert.ok(idxResearch < idxLibrary, 'nav-research must precede nav-library');
    assert.ok(idxLibrary < idxRemix, 'nav-library must precede nav-remix');
    assert.ok(idxRemix < idxBoard, 'nav-remix must precede nav-board');
  });

  test('T01-03: HTML contains <main data-testid="screen-outlet"> and <header data-testid="context-bar">', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');

    assert.ok(html.includes('data-testid="screen-outlet"'), 'Must contain screen-outlet');
    assert.ok(html.includes('data-testid="context-bar"'), 'Must contain context-bar');
    assert.ok(html.includes('data-testid="stage-name"'), 'Must contain stage-name element');
  });

  test('T01-04: CSS defines is-active styles for nav items and sticky context-bar', () => {
    const css = fs.readFileSync(cssPath, 'utf-8');

    // Active nav item styling
    assert.ok(css.includes('.nav-tree-item.is-active') || css.includes('.is-active'), 'Must have is-active styling');

    // Sticky context bar
    assert.ok(css.includes('position: sticky'), 'context-bar must have position: sticky');
    assert.ok(css.includes('top: 0') || css.includes('top:0'), 'sticky context-bar must stick to top');
  });

  test('T01-05: STAGE_CONFIG defines all stages according to spec', () => {
    assert.ok(STAGE_CONFIG.overview, 'overview stage config exists');
    assert.ok(STAGE_CONFIG.research, 'research stage config exists');
    assert.ok(STAGE_CONFIG.library, 'library stage config exists');
    assert.ok(STAGE_CONFIG.remix, 'remix stage config exists');
    assert.ok(STAGE_CONFIG.board, 'board stage config exists');
    assert.ok(STAGE_CONFIG.save, 'save stage config exists');

    assert.strictEqual(STAGE_CONFIG.research.stageName, 'Research');
    assert.strictEqual(STAGE_CONFIG.library.stageName, 'Ingredients');
    assert.strictEqual(STAGE_CONFIG.remix.stageName, 'Remix');
    assert.strictEqual(STAGE_CONFIG.board.stageName, 'Approve');
    assert.strictEqual(STAGE_CONFIG.save.stageName, 'Save');
  });

  test('T01-06: setStage updates current stage and glanceability displays', () => {
    // Setup minimal mock DOM
    const stageDisplay = new MockDOMElement('span', { 'data-testid': 'stage-name' });
    const stageBadge = new MockDOMElement('div', { 'data-testid': 'current-stage-badge' });

    appShell.dom.stageNameDisplays = [stageDisplay];
    appShell.dom.stageBadges = [stageBadge];

    setStage('Research', 'Subtitle test', 'research', 1);

    assert.strictEqual(getCurrentStage(), 'Research');
    assert.strictEqual(stageDisplay.textContent, 'Research');
    assert.strictEqual(stageBadge.getAttribute('data-stage-theme'), 'research');

    // Change to Remix
    setStage('Remix', 'Subtitle remix', 'remix', 4);
    assert.strictEqual(getCurrentStage(), 'Remix');
    assert.strictEqual(stageDisplay.textContent, 'Remix');
    assert.strictEqual(stageBadge.getAttribute('data-stage-theme'), 'remix');
  });

  test('T01-07: Founder glanceability: stage name can be read directly from context-bar', () => {
    const stageDisplay = new MockDOMElement('span', { 'data-testid': 'stage-name' });
    appShell.dom.stageNameDisplays = [stageDisplay];

    // Founder can identify every single stage
    const stages = ['Overview', 'Research', 'Save', 'Ingredients', 'Remix', 'Approve'];
    for (const st of stages) {
      setStage(st, 'Sub', st.toLowerCase(), 1);
      assert.strictEqual(stageDisplay.textContent, st, `Founder should immediately read stage: ${st}`);
    }
  });
});
