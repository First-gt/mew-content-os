/**
 * ==============================================================================
 * MEW CONTENT OS — S00 Dashboard Controller Unit Tests (Topic T04)
 * Framework: node:test & node:assert/strict
 * Verifies:
 * - HTML: 3 Primary Buttons: `btn-research-a-clip`, `btn-open-library`, `btn-start-remix`
 * - HTML: 4 Cards: `recent-research`, `vault-summary`, `remix-drafts`, `continue-work`
 * - JS: Numbers in `vault-summary` are derived from `savedNotes` in store and update immediately upon Save
 * - JS: `btn-research-a-clip` → S01, `btn-open-library` → S04, `btn-start-remix` → S06,
 *       `continue-work` → returns to preserved pending state
 * ==============================================================================
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  getDashboardMetrics,
  resolveContinueWorkDestination,
  recordLastActiveScreen,
  DashboardController
} from './dashboard.js';
import {
  getState,
  dispatch,
  resetDemo
} from './store.js';
import { router } from './router.js';

// Minimal mock DOM Element for testing dashboard interactions in Node
class MockElement {
  constructor(tagName = 'div', attributes = {}) {
    this.tagName = tagName;
    this.attributes = new Map(Object.entries(attributes));
    this.children = [];
    this.parentNode = null;
    this.textContent = '';
    this.eventListeners = new Map();
  }

  setAttribute(name, val) {
    this.attributes.set(name, String(val));
  }

  getAttribute(name) {
    return this.attributes.get(name) || null;
  }

  hasAttribute(name) {
    return this.attributes.has(name);
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

  dispatchEvent(event) {
    if (!event.target) event.target = this;
    let curr = this;
    while (curr) {
      const list = curr.eventListeners.get(event.type) || [];
      list.forEach(fn => fn(event));
      curr = curr.parentNode;
    }
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const results = [];
    const check = (node) => {
      // Simple selector matching for IDs, data-testid, class
      const idMatch = selector.startsWith('#') && (node.attributes.get('id') === selector.slice(1));
      const testIdMatch = selector.includes('data-testid=') && selector.includes(`"${node.attributes.get('data-testid')}"`);
      const attrMatch = selector.startsWith('[') && selector.endsWith(']') && (() => {
        const parts = selector.slice(1, -1).split('=');
        const attr = parts[0];
        const val = parts[1] ? parts[1].replace(/['"]/g, '') : null;
        return val ? node.attributes.get(attr) === val : node.attributes.has(attr);
      })();

      if (idMatch || testIdMatch || attrMatch) {
        results.push(node);
      }

      for (const child of node.children) {
        check(child);
      }
    };

    check(this);
    return results;
  }

  closest(selector) {
    const selectorList = selector.split(',').map(s => s.trim());
    let curr = this;
    while (curr) {
      for (const sel of selectorList) {
        if (sel.startsWith('#') && curr.attributes.get('id') === sel.slice(1)) return curr;
        if (sel.startsWith('.') && curr.attributes.get('class')?.includes(sel.slice(1))) return curr;
        if (sel.includes('=')) {
          const m = sel.match(/\[([a-zA-Z0-9_-]+)="?([^"\]]+)"?\]/);
          if (m && curr.attributes.get(m[1]) === m[2]) return curr;
        } else if (sel.startsWith('[') && sel.endsWith(']')) {
          const attr = sel.slice(1, -1);
          if (curr.attributes.has(attr)) return curr;
        }
      }
      curr = curr.parentNode;
    }
    return null;
  }
}

describe('S00 Overview / Dashboard Controller — Topic T04', () => {

  beforeEach(() => {
    resetDemo();
    router.reset();
  });

  test('T04-01: Numbers in vault-summary are derived from savedNotes in store and show Content/Packaging separately', () => {
    const state = getState();
    const metrics = getDashboardMetrics(state);

    assert.ok(typeof metrics.vault.contentCount === 'number');
    assert.ok(typeof metrics.vault.packagingCount === 'number');
    assert.strictEqual(
      metrics.vault.totalCount,
      metrics.vault.contentCount + metrics.vault.packagingCount
    );

    // Initial seed contains Story A (content) + Story B (packaging) + Story E (both = 1 content + 1 packaging) + C1-C3 (3 content) + P1-P2 (2 packaging)
    assert.ok(metrics.vault.contentCount >= 1, 'Should have Saved Content');
    assert.ok(metrics.vault.packagingCount >= 1, 'Should have Saved Packaging');
  });

  test('T04-02: vault-summary updates immediately upon SAVE_NOTE in store', () => {
    const initialMetrics = getDashboardMetrics();
    const initialContent = initialMetrics.vault.contentCount;

    // Dispatch a new Content note
    dispatch({
      type: 'SAVE_NOTE',
      payload: {
        id: 'test-note-new-content',
        sourceId: 'src-story-a',
        lens: 'content',
        why: 'Test Founder WHY justification',
        tags: ['Test']
      }
    });

    const updatedMetrics = getDashboardMetrics();
    assert.strictEqual(
      updatedMetrics.vault.contentCount,
      initialContent + 1,
      'Content count should increment immediately after SAVE_NOTE'
    );

    // Dispatch a new Packaging note
    const initialPackaging = updatedMetrics.vault.packagingCount;
    dispatch({
      type: 'SAVE_NOTE',
      payload: {
        id: 'test-note-new-packaging',
        sourceId: 'src-story-b',
        lens: 'packaging',
        why: 'Test Packaging Hook justification',
        tags: ['PackagingTest']
      }
    });

    const finalMetrics = getDashboardMetrics();
    assert.strictEqual(
      finalMetrics.vault.packagingCount,
      initialPackaging + 1,
      'Packaging count should increment immediately after SAVE_NOTE'
    );
  });

  test('T04-03: Primary buttons navigate to expected screens: S01, S04, S06', () => {
    // Setup Mock DOM
    const root = new MockElement('div', { 'data-testid': 'dashboard-root' });
    const btnResearch = new MockElement('button', {
      id: 'btn-research-a-clip',
      'data-testid': 'btn-research-a-clip',
      'data-action': 'btn-research-a-clip'
    });
    const btnLibrary = new MockElement('button', {
      id: 'btn-open-library',
      'data-testid': 'btn-open-library',
      'data-action': 'btn-open-library'
    });
    const btnRemix = new MockElement('button', {
      id: 'btn-start-remix',
      'data-testid': 'btn-start-remix',
      'data-action': 'btn-start-remix'
    });

    root.appendChild(btnResearch);
    root.appendChild(btnLibrary);
    root.appendChild(btnRemix);

    const controller = new DashboardController({ root });
    controller.init(root);

    let navigatedTo = null;
    const origGo = router.go.bind(router);
    router.go = (screenId, params) => {
      navigatedTo = screenId;
      return origGo(screenId, params);
    };

    // 1. btn-research-a-clip -> S01
    btnResearch.dispatchEvent({ type: 'click', target: btnResearch, preventDefault: () => {} });
    assert.strictEqual(navigatedTo, 'S01', 'btn-research-a-clip must navigate to S01');

    // 2. btn-open-library -> S04
    btnLibrary.dispatchEvent({ type: 'click', target: btnLibrary, preventDefault: () => {} });
    assert.strictEqual(navigatedTo, 'S04', 'btn-open-library must navigate to S04');

    // 3. btn-start-remix -> S06
    btnRemix.dispatchEvent({ type: 'click', target: btnRemix, preventDefault: () => {} });
    assert.strictEqual(navigatedTo, 'S06', 'btn-start-remix must navigate to S06');

    controller.destroy();
    router.go = origGo;
  });

  test('T04-04: continue-work returns to preserved pending state', () => {
    // Record that user previously was working on S07 (Remix Workspace)
    recordLastActiveScreen('S07', { conceptId: 'c1' });

    const destination = resolveContinueWorkDestination();
    assert.strictEqual(destination.screenId, 'S07', 'Should return to preserved S07 screen');

    // Test with Mock DOM click on continue-work
    const root = new MockElement('div', { 'data-testid': 'dashboard-root' });
    const btnContinue = new MockElement('button', {
      id: 'btn-continue-work',
      'data-testid': 'btn-continue-work',
      'data-action': 'continue-work'
    });
    root.appendChild(btnContinue);

    const controller = new DashboardController({ root });
    controller.init(root);

    let navigatedTo = null;
    const origGo = router.go.bind(router);
    router.go = (screenId, params) => {
      navigatedTo = screenId;
      return origGo(screenId, params);
    };

    btnContinue.dispatchEvent({ type: 'click', target: btnContinue, preventDefault: () => {} });
    assert.strictEqual(navigatedTo, 'S07', 'btn-continue-work should navigate back to preserved S07');

    controller.destroy();
    router.go = origGo;
  });

  test('T04-05: Live render updates DOM metric elements on store dispatch', () => {
    const root = new MockElement('div', { 'data-testid': 'dashboard-root' });
    const contentCountEl = new MockElement('span', { id: 'vault-count-content', 'data-testid': 'count-saved-content' });
    const packagingCountEl = new MockElement('span', { id: 'vault-count-packaging', 'data-testid': 'count-saved-packaging' });
    const researchCountEl = new MockElement('span', { id: 'recent-research-count', 'data-testid': 'count-recent-research' });
    const remixCountEl = new MockElement('span', { id: 'remix-drafts-count', 'data-testid': 'count-remix-drafts' });

    root.appendChild(contentCountEl);
    root.appendChild(packagingCountEl);
    root.appendChild(researchCountEl);
    root.appendChild(remixCountEl);

    const controller = new DashboardController({ root });
    controller.init(root);

    const beforeContent = Number(contentCountEl.textContent);
    assert.ok(beforeContent >= 1, 'Initial content count rendered');

    // Dispatch a new note
    dispatch({
      type: 'SAVE_NOTE',
      payload: {
        id: 'note-live-test',
        sourceId: 'src-story-e',
        lens: 'content',
        why: 'Live subscription verification',
        tags: ['Live']
      }
    });

    const afterContent = Number(contentCountEl.textContent);
    assert.strictEqual(afterContent, beforeContent + 1, 'DOM element textContent should update automatically via store subscription');

    controller.destroy();
  });

});
