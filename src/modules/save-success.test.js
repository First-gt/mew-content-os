/**
 * ==============================================================================
 * MEW CONTENT OS — Save Success State + Re-save / Add Lens Unit Tests (Topic T14)
 * Framework: node:test & node:assert/strict
 * 
 * Verifies Definition of Done (DOD):
 * - HTML: หลังบันทึกแสดง `save-success` ข้อความ `Saved to Content` / `Saved to Packaging` / `Saved to Both` ตามจริง
 *         พร้อมปุ่ม `btn-view-in-library` และ `btn-use-in-remix`
 * - JS: `btn-view-in-library` ไป S04 แท็บคลังที่เพิ่งเซฟ; `btn-use-in-remix` ไป S06 พร้อมใส่ reference นั้นลงตะกร้าอัตโนมัติ (ผู้ใช้ลบออกได้)
 * - JS: เปิด Save Modal กับ source ที่เคย save Content แล้ว → ติ๊ก Content ถูก disable พร้อมข้อความ "เก็บไว้แล้ว" และเพิ่ม Packaging ได้โดย note Content เดิมไม่เปลี่ยน (A05)
 * - JS: duplicate save lens เดิมต้องไม่สร้าง note ซ้ำ — เสนอไปแก้ WHY แทน (ลิงก์ไป S05)
 * - CSS: ไอคอนยืนยันสำเร็จ + สีแยกตามคลัง
 * 
 * Strict Negative Constraint:
 * Absolutely NO fake or arbitrary statistics or fake percentage badges.
 * ==============================================================================
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  SAVE_STATUS_TITLES,
  checkExistingSaveState,
  preventDuplicateSave,
  configureSaveModalForSource,
  addLensToSource,
  handleViewInLibrary,
  handleUseInRemix,
  SaveSuccessController
} from './save-success.js';

import { getState, dispatch, resetDemo, setStorageEngine } from './store.js';
import { router } from './router.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-Memory Storage Mock
class MockLocalStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.get(key) || null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

// Mock DOM Element for testing UI manipulation in Node
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
    this.hidden = attributes.hidden !== undefined;
    this.checked = Boolean(attributes.checked);
    this.disabled = Boolean(attributes.disabled);

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
      contains(c) {
        return classSet.has(c);
      }
    };
  }

  getAttribute(attr) {
    return this.attributes.get(attr) ?? null;
  }

  setAttribute(attr, val) {
    this.attributes.set(attr, String(val));
    if (attr === 'hidden') this.hidden = true;
  }

  removeAttribute(attr) {
    this.attributes.delete(attr);
    if (attr === 'hidden') this.hidden = false;
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  remove() {
    if (this.parentNode) {
      const idx = this.parentNode.children.indexOf(this);
      if (idx >= 0) this.parentNode.children.splice(idx, 1);
      this.parentNode = null;
    }
  }

  closest(selector) {
    let curr = this;
    while (curr) {
      if (selector.startsWith('.') && curr.classList.contains(selector.slice(1))) return curr;
      if (selector.toLowerCase() === curr.tagName.toLowerCase()) return curr;
      curr = curr.parentNode;
    }
    return null;
  }

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const results = [];
    const cleanSel = selector.trim();

    const matches = (node) => {
      if (cleanSel.includes(',')) {
        return cleanSel.split(',').some(part => {
          const p = part.trim();
          if (p.startsWith('#')) return node.attributes.get('id') === p.slice(1);
          if (p.startsWith('.')) return node.classList.contains(p.slice(1));
          if (p.startsWith('[data-testid=')) {
            const val = p.match(/\[data-testid=["']?([^"'\]]+)["']?\]/)?.[1];
            return node.attributes.get('data-testid') === val;
          }
          return false;
        });
      }
      if (cleanSel.startsWith('#')) return node.attributes.get('id') === cleanSel.slice(1);
      if (cleanSel.startsWith('.')) return node.classList.contains(cleanSel.slice(1));
      if (cleanSel.startsWith('[data-testid=')) {
        const val = cleanSel.match(/\[data-testid=["']?([^"'\]]+)["']?\]/)?.[1];
        return node.attributes.get('data-testid') === val;
      }
      if (cleanSel.toLowerCase() === node.tagName.toLowerCase()) return true;
      return false;
    };

    const traverse = (node) => {
      for (const child of node.children) {
        if (matches(child)) results.push(child);
        traverse(child);
      }
    };

    traverse(this);
    return results;
  }

  addEventListener(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  click() {
    const handlers = this.eventListeners.get('click') || [];
    const event = { preventDefault() {}, target: this };
    handlers.forEach(h => h(event));
  }
}

describe('Topic T14: Save Success State + Re-save / Add Lens ภายหลัง', () => {
  let mockStorage;

  beforeEach(() => {
    mockStorage = new MockLocalStorage();
    setStorageEngine(mockStorage);
    resetDemo();

    // Mock global window/localStorage for node test environment
    globalThis.localStorage = mockStorage;
  });

  // ----------------------------------------------------------------------------
  // 1. CONTRACT & FILE EXISTENCE (DOD)
  // ----------------------------------------------------------------------------
  test('1. Contract & File Existence', () => {
    const htmlPath = path.resolve(__dirname, '../components/save-success.html');
    const cssPath = path.resolve(__dirname, '../styles/save-success.css');
    const jsPath = path.resolve(__dirname, 'save-success.js');

    assert.ok(fs.existsSync(htmlPath), 'save-success.html must exist');
    assert.ok(fs.existsSync(cssPath), 'save-success.css must exist');
    assert.ok(fs.existsSync(jsPath), 'save-success.js must exist');

    const html = fs.readFileSync(htmlPath, 'utf8');
    assert.ok(html.includes('id="save-success"') || html.includes('save-success'), 'Must contain save-success container');
    assert.ok(html.includes('btn-view-in-library'), 'Must contain btn-view-in-library');
    assert.ok(html.includes('btn-use-in-remix'), 'Must contain btn-use-in-remix');
  });

  // ----------------------------------------------------------------------------
  // 2. HTML STATUS TITLES (Saved to Content / Packaging / Both)
  // ----------------------------------------------------------------------------
  test('2. HTML Status Titles: Saved to Content, Packaging, Both', () => {
    const html = fs.readFileSync(path.resolve(__dirname, '../components/save-success.html'), 'utf8');

    // Title element exists
    assert.ok(html.includes('save-success-title'), 'Must have save-success-title element');
    
    // Verifies the exact required strings are present as valid states in controller / html
    assert.strictEqual(SAVE_STATUS_TITLES.CONTENT, 'Saved to Content');
    assert.strictEqual(SAVE_STATUS_TITLES.PACKAGING, 'Saved to Packaging');
    assert.strictEqual(SAVE_STATUS_TITLES.BOTH, 'Saved to Both');
  });

  // ----------------------------------------------------------------------------
  // 3. NAVIGATION: btn-view-in-library navigates to S04 with active vault tab
  // ----------------------------------------------------------------------------
  test('3. btn-view-in-library goes to S04 on the active tab of newly saved lens', () => {
    let routedScreen = null;
    let routedParams = null;

    // Spy on router.go
    const originalGo = router.go;
    router.go = (screenId, params) => {
      routedScreen = screenId;
      routedParams = params;
    };

    try {
      // 3.1 Content saved -> navigates to S04 on 'content' tab
      handleViewInLibrary('content', { sourceId: 'source-a' });
      assert.strictEqual(routedScreen, 'S04', 'Must route to S04');
      assert.strictEqual(routedParams.activeVaultTab, 'content', 'Must set activeVaultTab to content');

      // 3.2 Packaging saved -> navigates to S04 on 'packaging' tab
      handleViewInLibrary('packaging', { sourceId: 'source-b' });
      assert.strictEqual(routedScreen, 'S04', 'Must route to S04');
      assert.strictEqual(routedParams.activeVaultTab, 'packaging', 'Must set activeVaultTab to packaging');

      // 3.3 Both saved -> defaults to content tab
      handleViewInLibrary(['content', 'packaging'], { sourceId: 'source-e' });
      assert.strictEqual(routedScreen, 'S04', 'Must route to S04');
      assert.strictEqual(routedParams.activeVaultTab, 'content');
    } finally {
      router.go = originalGo;
    }
  });

  // ----------------------------------------------------------------------------
  // 4. BASKET: btn-use-in-remix goes to S06 and adds reference into basket
  // ----------------------------------------------------------------------------
  test('4. btn-use-in-remix goes to S06 and automatically adds reference to basket (user can remove it)', () => {
    let routedScreen = null;
    let routedParams = null;

    const originalGo = router.go;
    router.go = (screenId, params) => {
      routedScreen = screenId;
      routedParams = params;
    };

    try {
      const testNote = {
        id: 'test-note-c100',
        sourceId: 'source-test-remix',
        lens: 'content',
        why: 'Insight to use in remix'
      };

      const result = handleUseInRemix(testNote, { sourceId: 'source-test-remix', title: 'Test Title' });
      assert.ok(result, 'handleUseInRemix must succeed');

      // Check router destination
      assert.strictEqual(routedScreen, 'S06', 'Must route to S06 Remix Studio');

      // Check Central Store remixSelection updated
      const state = getState();
      assert.ok(state.remixSelection.content.includes('test-note-c100'), 'Note ID must be in remixSelection.content');

      // Check localStorage mew_remix_basket updated
      const storedBasket = JSON.parse(mockStorage.getItem('mew_remix_basket') || '[]');
      assert.ok(storedBasket.some(item => item.id === 'test-note-c100'), 'Note must be stored in mew_remix_basket');

      // Verify User Can Remove It Later (Standard Store dispatch)
      dispatch({
        type: 'TOGGLE_REMIX_INGREDIENT',
        payload: { lens: 'content', noteId: 'test-note-c100' }
      });
      const stateAfterRemove = getState();
      assert.ok(!stateAfterRemove.remixSelection.content.includes('test-note-c100'), 'User must be able to remove it from basket');
    } finally {
      router.go = originalGo;
    }
  });

  // ----------------------------------------------------------------------------
  // 5. RE-SAVE / ADD LENS (A05): Opening modal with previously saved Content source
  // ----------------------------------------------------------------------------
  test('5. Re-save/Add Lens: Source previously saved in Content has Content disabled ("เก็บไว้แล้ว") and allows adding Packaging without modifying Content note (A05)', () => {
    // Story A: 'source-a' is already saved in Content in seed data
    const existing = checkExistingSaveState('source-a');
    assert.strictEqual(existing.hasContent, true, 'source-a must have Content saved');
    assert.strictEqual(existing.hasPackaging, false, 'source-a must not have Packaging saved');
    const originalContentWhy = existing.contentNote.why;

    // Build Mock Modal DOM
    const modal = new MockElement('div', { id: 'save-modal' });
    const cardContent = new MockElement('label', { class: 'vault-choice-card choice-content' });
    const chkContent = new MockElement('input', { id: 'chk-save-content', type: 'checkbox' });
    cardContent.appendChild(chkContent);

    const cardPackaging = new MockElement('label', { class: 'vault-choice-card choice-packaging' });
    const chkPackaging = new MockElement('input', { id: 'chk-save-packaging', type: 'checkbox' });
    cardPackaging.appendChild(chkPackaging);

    modal.appendChild(cardContent);
    modal.appendChild(cardPackaging);

    // Run configureSaveModalForSource
    const configResult = configureSaveModalForSource(modal, 'source-a');
    assert.ok(configResult.hasContent, 'Must identify existing content');

    // Content Checkbox MUST be disabled and checked
    assert.strictEqual(chkContent.disabled, true, 'Content checkbox must be disabled when already saved');
    assert.strictEqual(chkContent.checked, true, 'Content checkbox must be checked to indicate already saved');

    // "เก็บไว้แล้ว" badge MUST be rendered
    const badgeContent = modal.querySelector('#badge-already-saved-content');
    assert.ok(badgeContent, 'Must render badge-already-saved-content');
    assert.strictEqual(badgeContent.textContent, 'เก็บไว้แล้ว');

    // Packaging Checkbox MUST remain ENABLED and interactive!
    assert.strictEqual(chkPackaging.disabled, false, 'Packaging checkbox must remain enabled for adding lens');

    // Now Add Packaging Lens (A05)
    const addResult = addLensToSource('source-a', 'packaging', 'New packaging WHY note for story A');
    assert.ok(addResult.success, 'addLensToSource must succeed');
    assert.strictEqual(addResult.updatedStatus, 'Saved to Both', 'Status should update to Saved to Both');

    // A05 NON-DESTRUCTIVE GUARANTEE: The original Content Note MUST NOT be modified or deleted!
    const updatedState = getState();
    const sourceANotes = updatedState.savedNotes.filter(n => n.sourceId === 'source-a');
    assert.strictEqual(sourceANotes.length, 2, 'source-a must now have exactly 2 notes sharing sourceId');

    const preservedContentNote = sourceANotes.find(n => n.lens === 'content');
    const newPackagingNote = sourceANotes.find(n => n.lens === 'packaging');

    assert.ok(preservedContentNote, 'Content note must still exist');
    assert.strictEqual(preservedContentNote.why, originalContentWhy, 'Original Content WHY must remain completely unchanged (A05)');
    assert.ok(newPackagingNote, 'Packaging note must exist');
    assert.strictEqual(newPackagingNote.why, 'New packaging WHY note for story A');
  });

  // ----------------------------------------------------------------------------
  // 6. DUPLICATE LENS PREVENTION: Must not create duplicate note, offers S05
  // ----------------------------------------------------------------------------
  test('6. Duplicate Save Lens Prevention: Must not create duplicate note — offers to edit WHY in S05 instead', () => {
    // 'source-a' already has 'content' note
    const dupCheck = preventDuplicateSave('source-a', 'content');
    assert.strictEqual(dupCheck.isDuplicate, true, 'Must detect duplicate lens');
    assert.ok(dupCheck.duplicateLenses.includes('content'), 'Duplicate lenses list must include content');
    assert.ok(dupCheck.message.includes('duplicate save lens เดิมต้องไม่สร้าง note ซ้ำ'), 'Message must contain exact warning');
    assert.ok(dupCheck.message.includes('S05'), 'Message must offer link to S05');

    // Attempting to addLensToSource with duplicate lens MUST be blocked
    const notesCountBefore = getState().savedNotes.length;
    const addDupResult = addLensToSource('source-a', 'content', 'Duplicate reason');

    assert.strictEqual(addDupResult.success, false, 'Duplicate lens addition must fail');
    assert.strictEqual(addDupResult.error, 'err-duplicate-lens');
    assert.strictEqual(getState().savedNotes.length, notesCountBefore, 'savedNotes count must not change');
  });

  // ----------------------------------------------------------------------------
  // 7. CSS CONTRACT: Confirmation Icon & Colors Separated by Vault
  // ----------------------------------------------------------------------------
  test('7. CSS Contract: Confirmation Icon & Colors Separated by Vault', () => {
    const css = fs.readFileSync(path.resolve(__dirname, '../styles/save-success.css'), 'utf8');

    // Confirmation Icon styling
    assert.ok(css.includes('.save-success-icon-wrap'), 'Must style .save-success-icon-wrap');
    assert.ok(css.includes('coral-vault'), 'Must have coral vault styles');
    assert.ok(css.includes('packaging-vault') || css.includes('violet-vault'), 'Must have violet packaging vault styles');
    assert.ok(css.includes('both-vault') || css.includes('dual-vault'), 'Must have both/dual vault styles');

    // Buttons styling
    assert.ok(css.includes('.btn-view-in-library'), 'Must style .btn-view-in-library');
    assert.ok(css.includes('.btn-use-in-remix'), 'Must style .btn-use-in-remix');
    assert.ok(css.includes('.badge-already-saved'), 'Must style .badge-already-saved ("เก็บไว้แล้ว")');
  });

  // ----------------------------------------------------------------------------
  // 8. STRICT NEGATIVE CONSTRAINT CHECK: No Fake Statistics
  // ----------------------------------------------------------------------------
  test('8. Strict Negative Constraint Check: No fake statistics or arbitrary percentages', () => {
    const html = fs.readFileSync(path.resolve(__dirname, '../components/save-success.html'), 'utf8');
    const css = fs.readFileSync(path.resolve(__dirname, '../styles/save-success.css'), 'utf8');
    const js = fs.readFileSync(path.resolve(__dirname, 'save-success.js'), 'utf8');

    const forbiddenPatterns = [
      '12 สัปดาห์',
      '+12 สัปดาห์นี้',
      '12 สัปดาห์วิเคราะห์แล้ว',
      '94%',
      '88%'
    ];

    for (const pattern of forbiddenPatterns) {
      assert.ok(!html.includes(pattern), `save-success.html must not include forbidden pattern: ${pattern}`);
      assert.ok(!css.includes(pattern), `save-success.css must not include forbidden pattern: ${pattern}`);
      assert.ok(!js.includes(pattern), `save-success.js must not include forbidden pattern: ${pattern}`);
    }
  });
});
