/**
 * ==============================================================================
 * MEW CONTENT OS — Router & Transition Matrix Unit Tests (Topic T03)
 * Framework: node:test & node:assert/strict
 * Reference: MEW_Content_OS_Founder_UX_Spec_TH.md Section 4 & plan.md Topic T03
 * 
 * Verifies:
 * 1. router.go(screenId, params) supports S00 through S09.
 * 2. router.go(unknownId) displays element with data-testid="screen-not-found" and does NOT crash.
 * 3. router.back() navigates to previous screen with store selection preserved (D10).
 * 4. TRANSITIONS table specifies {from, action, to} covering all buttons from Spec Section 4.
 * 5. Every single transition row points to an existing screen in SCREENS.
 * ==============================================================================
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  router,
  SCREENS,
  TRANSITIONS,
  normalizeScreenId,
  isValidScreenId
} from './router.js';
import { getState, dispatch, seed, resetDemo } from './store.js';

// Minimal mock DOM for headless testing of data-testid="screen-not-found"
class MockDOMElement {
  constructor(tagName = 'div') {
    this.tagName = tagName;
    this.attributes = new Map();
    this.children = [];
    this.classList = new Set();
    this.style = {};
    this.parentNode = null;
    this.innerHTML = '';
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name) || null;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      child.parentNode = null;
    }
    return child;
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const results = [];
    const check = (el) => {
      let match = false;
      if (selector.startsWith('[data-testid="')) {
        const testId = selector.slice(14, -2);
        if (el.getAttribute('data-testid') === testId) match = true;
      } else if (selector.startsWith('[data-screen="')) {
        const screen = selector.slice(14, -2);
        if (el.getAttribute('data-screen') === screen) match = true;
      } else if (selector.startsWith('#')) {
        const id = selector.slice(1);
        if (el.getAttribute('id') === id) match = true;
      } else if (selector.startsWith('.')) {
        const cls = selector.slice(1);
        if (el.classList.has(cls)) match = true;
      }
      if (match) results.push(el);
      el.children.forEach(check);
    };
    this.children.forEach(check);
    return results;
  }
}

describe('Router & Transition Matrix — Topic T03', () => {
  let originalDocument;
  let mockOutlet;

  beforeEach(() => {
    router.reset();
    resetDemo();

    // Setup minimal document mock
    originalDocument = globalThis.document;
    const body = new MockDOMElement('body');
    mockOutlet = new MockDOMElement('main');
    mockOutlet.setAttribute('data-testid', 'screen-outlet');
    body.appendChild(mockOutlet);

    globalThis.document = {
      body,
      createElement: (tag) => new MockDOMElement(tag),
      querySelector: (sel) => body.querySelector(sel),
      querySelectorAll: (sel) => body.querySelectorAll(sel),
      getElementById: (id) => body.querySelector(`#${id}`)
    };
  });

  afterEach(() => {
    globalThis.document = originalDocument;
  });

  // Test 1: S00 - S09 Screen support
  test('T03-01: router.go(screenId, params) supports all screens S00 through S09', () => {
    const expectedScreens = ['S00', 'S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07', 'S08', 'S09'];

    for (const screenId of expectedScreens) {
      assert.ok(SCREENS[screenId], `Screen definition for ${screenId} must exist`);
      
      const result = router.go(screenId, { testParam: screenId });
      assert.strictEqual(result.success, true, `Navigation to ${screenId} should succeed`);
      assert.strictEqual(result.screenId, screenId);
      assert.strictEqual(router.getCurrentScreen(), screenId);
      assert.strictEqual(router.getCurrentParams().testParam, screenId);
    }
  });

  // Test 2: Unknown screen displays data-testid="screen-not-found" and does NOT crash
  test('T03-02: router.go(unknownId) displays data-testid="screen-not-found" and does NOT crash', () => {
    assert.doesNotThrow(() => {
      const result = router.go('S99_UNKNOWN');
      assert.strictEqual(result.success, false);
      assert.strictEqual(result.error, 'SCREEN_NOT_FOUND');
    });

    // Check DOM has element with data-testid="screen-not-found"
    const notFoundEl = globalThis.document.querySelector('[data-testid="screen-not-found"]');
    assert.ok(notFoundEl, 'Should render element with data-testid="screen-not-found" in DOM');
    assert.strictEqual(notFoundEl.getAttribute('data-testid'), 'screen-not-found');

    // Navigating back to a valid screen clears the not-found element
    router.go('S00');
    const clearedEl = globalThis.document.querySelector('[data-testid="screen-not-found"]');
    assert.strictEqual(clearedEl, null, 'Navigating to valid screen should remove not-found element');
  });

  // Test 3: router.back() restores previous screen
  test('T03-03: router.back() navigates to previous screen in history stack', () => {
    router.go('S00');
    router.go('S01', { source: 'dashboard' });
    router.go('S02', { sourceId: 'src-101' });

    assert.strictEqual(router.getCurrentScreen(), 'S02');

    // Back to S01
    const back1 = router.back();
    assert.strictEqual(back1.success, true);
    assert.strictEqual(router.getCurrentScreen(), 'S01');
    assert.strictEqual(router.getCurrentParams().source, 'dashboard');

    // Back to S00
    const back2 = router.back();
    assert.strictEqual(back2.success, true);
    assert.strictEqual(router.getCurrentScreen(), 'S00');
  });

  // Test 4: router.back() preserves store selection (D10 Non-Negotiable Guarantee)
  test('T03-04: D10 — router.back() and router.go() strictly preserve store.remixSelection', () => {
    // 1. Setup sample state and select ingredients in store
    seed();
    dispatch({
      type: 'TOGGLE_REMIX_INGREDIENT',
      payload: { lens: 'content', noteId: 'note-sample-c1' }
    });
    dispatch({
      type: 'TOGGLE_REMIX_INGREDIENT',
      payload: { lens: 'packaging', noteId: 'note-sample-p1' }
    });

    const initialStoreState = getState();
    const initialSelection = { ...initialStoreState.remixSelection };
    assert.ok(initialSelection.content.includes('note-sample-c1'));
    assert.ok(initialSelection.packaging.includes('note-sample-p1'));

    // 2. Perform extensive multi-screen navigation
    router.go('S06'); // Remix Picker
    router.go('S04'); // Browse Library
    router.go('S05', { noteId: 'note-sample-c1' }); // Detail
    router.go('S01'); // Research
    router.back();    // Back to S05
    router.back();    // Back to S04
    router.back();    // Back to S06

    // 3. Verify store state was completely untouched by router
    const currentStoreState = getState();
    assert.deepStrictEqual(
      currentStoreState.remixSelection.content,
      initialSelection.content,
      'Content selection in store must remain strictly intact across navigation'
    );
    assert.deepStrictEqual(
      currentStoreState.remixSelection.packaging,
      initialSelection.packaging,
      'Packaging selection in store must remain strictly intact across navigation'
    );
  });

  // Test 5: Every transition in TRANSITIONS points to an existing screen in SCREENS
  test('T03-05: Every row of TRANSITIONS points to an existing screen in SCREENS', () => {
    assert.ok(TRANSITIONS.length > 0, 'TRANSITIONS table must not be empty');

    for (const [idx, t] of TRANSITIONS.entries()) {
      assert.ok(
        SCREENS[t.from],
        `Row #${idx + 1} (${t.action}): Source screen "${t.from}" must exist in SCREENS`
      );
      assert.ok(
        SCREENS[t.to],
        `Row #${idx + 1} (${t.action}): Destination screen "${t.to}" must exist in SCREENS`
      );
      assert.ok(t.action, `Row #${idx + 1}: Must have an action identifier`);
      assert.ok(t.buttonLabel, `Row #${idx + 1}: Must have a buttonLabel`);
      assert.ok(t.stateChange, `Row #${idx + 1}: Must describe stateChange in store`);
    }
  });

  // Test 6: TRANSITIONS table contains all mandatory spec transitions from Section 4
  test('T03-06: TRANSITIONS contains all required transitions from Founder UX Spec Section 4', () => {
    // S00: Research -> S01, Vault -> S04, Remix -> S06
    const s00Research = TRANSITIONS.find(t => t.from === 'S00' && t.action === 'btn-research-a-clip');
    assert.ok(s00Research && s00Research.to === 'S01', 'S00 must have btn-research-a-clip -> S01');

    const s00Vault = TRANSITIONS.find(t => t.from === 'S00' && t.action === 'btn-open-library');
    assert.ok(s00Vault && s00Vault.to === 'S04', 'S00 must have btn-open-library -> S04');

    const s00Remix = TRANSITIONS.find(t => t.from === 'S00' && t.action === 'btn-start-remix');
    assert.ok(s00Remix && s00Remix.to === 'S06', 'S00 must have btn-start-remix -> S06');

    // S02 -> S03 Save to Library
    const s02Save = TRANSITIONS.find(t => t.from === 'S02' && t.action === 'btn-save-to-library');
    assert.ok(s02Save && s02Save.to === 'S03', 'S02 must have btn-save-to-library -> S03');

    // S03 Save Modal -> View in Library (S04) & Use in Remix (S06)
    const s03ViewLib = TRANSITIONS.find(t => t.from === 'S03' && t.action === 'btn-view-in-library');
    assert.ok(s03ViewLib && s03ViewLib.to === 'S04', 'S03 must have btn-view-in-library -> S04');

    const s03UseRemix = TRANSITIONS.find(t => t.from === 'S03' && t.action === 'btn-use-in-remix');
    assert.ok(s03UseRemix && s03UseRemix.to === 'S06', 'S03 must have btn-use-in-remix -> S06');

    // S06 Picker -> S07 Workspace
    const s06Continue = TRANSITIONS.find(t => t.from === 'S06' && t.action === 'btn-continue-to-remix');
    assert.ok(s06Continue && s06Continue.to === 'S07', 'S06 must have btn-continue-to-remix -> S07');

    // S08 Script Draft -> S09 Content Board
    const s08SaveDraft = TRANSITIONS.find(t => t.from === 'S08' && t.action === 'btn-save-remix-draft');
    assert.ok(s08SaveDraft && s08SaveDraft.to === 'S09', 'S08 must have btn-save-remix-draft -> S09');

    // S09 Approve Concept
    const s09Approve = TRANSITIONS.find(t => t.from === 'S09' && t.action === 'btn-approve-concept');
    assert.ok(s09Approve && s09Approve.to === 'S09', 'S09 must have btn-approve-concept -> S09');
  });

  // Test 7: router.subscribe() receives route events
  test('T03-07: router.subscribe() receives notifications on navigation', () => {
    let callCount = 0;
    let lastScreen = null;
    let lastParams = null;

    const unsubscribe = router.subscribe((screenId, params) => {
      callCount++;
      lastScreen = screenId;
      lastParams = params;
    });

    router.go('S01', { q: 'test-query' });
    assert.strictEqual(callCount, 1);
    assert.strictEqual(lastScreen, 'S01');
    assert.strictEqual(lastParams.q, 'test-query');

    unsubscribe();
    router.go('S04');
    assert.strictEqual(callCount, 1, 'Unsubscribed listener should not receive further calls');
  });
});
