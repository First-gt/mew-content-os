/**
 * ==============================================================================
 * MEW CONTENT OS — S03 Save Modal Unit Tests (Topic T12)
 * Framework: node:test & node:assert/strict
 * 
 * Verifies Definition of Done (DOD):
 * - HTML: modal `save-modal` หัวข้อ "Save this reference"; checkbox `chk-save-content`, `chk-save-packaging`;
 *         ช่อง `why-content` และ `why-packaging` (textarea) ซ่อนจนกว่าจะติ๊กคลังนั้น
 * - HTML: ช่อง optional `tags`, `timestamp`, `label`, `collection`; ปุ่ม `btn-confirm-save` และ `btn-cancel-save`
 * - CSS: wireframe 2 ในสเปกข้อ 8; ติ๊กทั้งสองแล้วมี textarea 2 ช่องแยกกันชัดเจน (ไม่ใช่ช่องกลางช่องเดียว)
 * - JS: ติ๊ก/เลิกติ๊กแสดง/ซ่อน textarea ถูกคลัง และไม่ล้างข้อความที่พิมพ์ไว้เมื่อซ่อนแล้วเปิดใหม่
 * - JS: `btn-cancel-save` ปิด modal โดยไม่เปลี่ยน store; ปิดด้วย Esc ได้และ focus กลับที่ `btn-save-to-library`
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

import { SaveModalController } from './save-modal.js';
import { getState, resetDemo } from './store.js';

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
    this.checked = Boolean(attributes.checked);

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

  querySelector(selector) {
    return this.querySelectorAll(selector)[0] || null;
  }

  querySelectorAll(selector) {
    const results = [];
    const cleanSel = selector.trim();

    const matches = (node) => {
      // Multiple comma-separated selectors
      if (cleanSel.includes(',')) {
        return cleanSel.split(',').some(part => {
          const p = part.trim();
          if (p.startsWith('#')) return node.attributes.get('id') === p.slice(1);
          if (p.startsWith('.')) return node.classList.contains(p.slice(1));
          if (p.startsWith('[data-testid=')) {
            const val = p.match(/\[data-testid=["']?([^"'\]]+)["']?\]/)?.[1];
            return node.attributes.get('data-testid') === val;
          }
          return node.tagName.toLowerCase() === p.toLowerCase();
        });
      }

      if (cleanSel.startsWith('#')) {
        return node.attributes.get('id') === cleanSel.slice(1);
      }
      if (cleanSel.startsWith('.')) {
        return node.classList.contains(cleanSel.slice(1));
      }
      if (cleanSel.startsWith('[data-testid=')) {
        const val = cleanSel.match(/\[data-testid=["']?([^"'\]]+)["']?\]/)?.[1];
        return node.attributes.get('data-testid') === val;
      }
      return node.tagName.toLowerCase() === cleanSel.toLowerCase();
    };

    const traverse = (node) => {
      for (const child of node.children) {
        if (matches(child)) {
          results.push(child);
        }
        traverse(child);
      }
    };

    traverse(this);
    return results;
  }

  addEventListener(type, listener) {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }
    this.eventListeners.get(type).push(listener);
  }

  dispatchEvent(event) {
    event.target = this;
    const listeners = this.eventListeners.get(event.type) || [];
    for (const l of listeners) {
      l(event);
    }
    return !event.defaultPrevented;
  }

  focus() {
    MockDocument.activeElement = this;
  }
}

class MockDocument {
  static activeElement = null;
  constructor(root) {
    this.root = root;
    this.body = root;
  }

  getElementById(id) {
    return this.root.querySelector(`#${id}`);
  }

  querySelector(sel) {
    return this.root.querySelector(sel);
  }

  querySelectorAll(sel) {
    return this.root.querySelectorAll(sel);
  }
}

describe('Topic T12: S03 Save Modal — UI Chooser', () => {

  const htmlPath = path.resolve(__dirname, '../components/save-modal.html');
  const cssPath = path.resolve(__dirname, '../styles/save-modal.css');
  let htmlContent = '';
  let cssContent = '';

  beforeEach(() => {
    htmlContent = fs.readFileSync(htmlPath, 'utf8');
    cssContent = fs.readFileSync(cssPath, 'utf8');
  });

  describe('1. HTML Contract & Elements (DOD)', () => {
    test('T12-01: HTML file exists and contains save-modal dialog container', () => {
      assert.ok(fs.existsSync(htmlPath), 'src/components/save-modal.html must exist');
      assert.match(htmlContent, /id=["']save-modal["']/, 'Must contain id="save-modal"');
      assert.match(htmlContent, /role=["']dialog["']/, 'Must have role="dialog"');
      assert.match(htmlContent, /aria-modal=["']true["']/, 'Must have aria-modal="true"');
      assert.match(htmlContent, /data-testid=["']save-modal["']/, 'Must have data-testid="save-modal"');
    });

    test('T12-02: HTML contains heading "Save this reference"', () => {
      assert.match(htmlContent, /Save this reference/, 'Must contain heading "Save this reference"');
      assert.match(htmlContent, /id=["']save-modal-title["']/, 'Must have id="save-modal-title"');
    });

    test('T12-03: HTML contains checkboxes chk-save-content and chk-save-packaging', () => {
      assert.match(htmlContent, /id=["']chk-save-content["']/, 'Must contain id="chk-save-content"');
      assert.match(htmlContent, /data-testid=["']chk-save-content["']/, 'Must contain data-testid="chk-save-content"');
      assert.match(htmlContent, /id=["']chk-save-packaging["']/, 'Must contain id="chk-save-packaging"');
      assert.match(htmlContent, /data-testid=["']chk-save-packaging["']/, 'Must contain data-testid="chk-save-packaging"');
    });

    test('T12-04: HTML contains textareas why-content and why-packaging hidden initially', () => {
      assert.match(htmlContent, /id=["']why-content["']/, 'Must contain id="why-content"');
      assert.match(htmlContent, /data-testid=["']why-content["']/, 'Must contain data-testid="why-content"');
      assert.match(htmlContent, /id=["']why-packaging["']/, 'Must contain id="why-packaging"');
      assert.match(htmlContent, /data-testid=["']why-packaging["']/, 'Must contain data-testid="why-packaging"');
      
      // Both wrappers should have hidden initially until checked
      assert.match(htmlContent, /id=["']wrap-why-content["'][^>]*hidden/, 'why-content wrap must be hidden until checked');
      assert.match(htmlContent, /id=["']wrap-why-packaging["'][^>]*hidden/, 'why-packaging wrap must be hidden until checked');
    });

    test('T12-05: HTML contains optional metadata inputs: tags, timestamp, label, collection', () => {
      assert.match(htmlContent, /id=["']tags["']/, 'Must contain id="tags"');
      assert.match(htmlContent, /data-testid=["']tags["']/, 'Must contain data-testid="tags"');

      assert.match(htmlContent, /id=["']timestamp["']/, 'Must contain id="timestamp"');
      assert.match(htmlContent, /data-testid=["']timestamp["']/, 'Must contain data-testid="timestamp"');

      assert.match(htmlContent, /id=["']label["']/, 'Must contain id="label"');
      assert.match(htmlContent, /data-testid=["']label["']/, 'Must contain data-testid="label"');

      assert.match(htmlContent, /id=["']collection["']/, 'Must contain id="collection"');
      assert.match(htmlContent, /data-testid=["']collection["']/, 'Must contain data-testid="collection"');
    });

    test('T12-06: HTML contains action buttons btn-confirm-save and btn-cancel-save', () => {
      assert.match(htmlContent, /id=["']btn-confirm-save["']/, 'Must contain id="btn-confirm-save"');
      assert.match(htmlContent, /data-testid=["']btn-confirm-save["']/, 'Must contain data-testid="btn-confirm-save"');

      assert.match(htmlContent, /id=["']btn-cancel-save["']/, 'Must contain id="btn-cancel-save"');
      assert.match(htmlContent, /data-testid=["']btn-cancel-save["']/, 'Must contain data-testid="btn-cancel-save"');
    });

    test('T12-07: STRICT NEGATIVE CONSTRAINT - Zero fake statistics', () => {
      assert.doesNotMatch(htmlContent, /12 สัปดาห์/, 'Forbidden fake metric "12 สัปดาห์" found');
      assert.doesNotMatch(htmlContent, /\+12 สัปดาห์นี้/, 'Forbidden fake metric "+12 สัปดาห์นี้" found');
      assert.doesNotMatch(htmlContent, /12 สัปดาห์วิเคราะห์แล้ว/, 'Forbidden fake metric found');
    });
  });

  describe('2. CSS Wireframe 2 & Theme Contracts (DOD)', () => {
    test('T12-08: CSS file exists and styles wireframe 2 distinct reasoning containers', () => {
      assert.ok(fs.existsSync(cssPath), 'src/styles/save-modal.css must exist');
      assert.match(cssContent, /\.save-modal-card/, 'Must style .save-modal-card');
      assert.match(cssContent, /\.content-reason-card/, 'Must style .content-reason-card');
      assert.match(cssContent, /\.packaging-reason-card/, 'Must style .packaging-reason-card');
      assert.match(cssContent, /\.dual-vault-callout/, 'Must style .dual-vault-callout for distinct dual boxes');
    });

    test('T12-09: CSS adheres to mewteetawat.com V6.3 palette & buttons', () => {
      assert.match(cssContent, /#ed765b/i, 'Must contain Coral accent #ed765b');
      assert.match(cssContent, /#8a76ff/i, 'Must contain Violet accent #8a76ff');
      assert.match(cssContent, /#11110f/i, 'Must contain Deep Ink #11110f');
      assert.match(cssContent, /\.btn-primary-ink/, 'Must style Primary Ink button');
      assert.match(cssContent, /\.btn-mew-ghost/, 'Must style Ghost button');
      assert.match(cssContent, /subtleSlideUp/, 'Must define subtleSlideUp animation');
    });
  });

  describe('3. JavaScript Behavior & Interactive State (DOD)', () => {
    function setupMockDOM() {
      const root = new MockElement('div', { id: 'root' });

      // Modal container
      const modal = new MockElement('div', { id: 'save-modal', class: 'save-modal-backdrop', hidden: '' });
      const card = new MockElement('div', { class: 'save-modal-card mew-offer-card' });
      const title = new MockElement('h2', { id: 'save-modal-title' });
      title.textContent = 'Save this reference';
      const btnClose = new MockElement('button', { id: 'btn-close-save-modal' });

      // Form & Checkboxes
      const form = new MockElement('form', { id: 'save-modal-form' });
      const chkContent = new MockElement('input', { id: 'chk-save-content', type: 'checkbox' });
      const chkPackaging = new MockElement('input', { id: 'chk-save-packaging', type: 'checkbox' });

      // Textareas & Wraps
      const wrapContent = new MockElement('div', { id: 'wrap-why-content', hidden: '' });
      const whyContent = new MockElement('textarea', { id: 'why-content' });
      const counterContent = new MockElement('span', { id: 'counter-why-content' });
      wrapContent.appendChild(whyContent);
      wrapContent.appendChild(counterContent);

      const wrapPackaging = new MockElement('div', { id: 'wrap-why-packaging', hidden: '' });
      const whyPackaging = new MockElement('textarea', { id: 'why-packaging' });
      const counterPackaging = new MockElement('span', { id: 'counter-why-packaging' });
      wrapPackaging.appendChild(whyPackaging);
      wrapPackaging.appendChild(counterPackaging);

      const dualCallout = new MockElement('div', { id: 'dual-vault-callout', hidden: '' });

      // Optional Fields
      const tags = new MockElement('input', { id: 'tags' });
      const timestamp = new MockElement('input', { id: 'timestamp' });
      const label = new MockElement('input', { id: 'label' });
      const collection = new MockElement('input', { id: 'collection' });

      // Action Buttons
      const btnCancel = new MockElement('button', { id: 'btn-cancel-save' });
      const btnConfirm = new MockElement('button', { id: 'btn-confirm-save' });

      // Assemble card
      card.appendChild(title);
      card.appendChild(btnClose);
      form.appendChild(chkContent);
      form.appendChild(chkPackaging);
      form.appendChild(wrapContent);
      form.appendChild(wrapPackaging);
      form.appendChild(dualCallout);
      form.appendChild(tags);
      form.appendChild(timestamp);
      form.appendChild(label);
      form.appendChild(collection);
      form.appendChild(btnCancel);
      form.appendChild(btnConfirm);
      card.appendChild(form);
      modal.appendChild(card);

      // Trigger button in page
      const btnSaveToLibrary = new MockElement('button', { id: 'btn-save-to-library' });

      root.appendChild(btnSaveToLibrary);
      root.appendChild(modal);

      const mockDoc = new MockDocument(root);
      global.document = mockDoc;
      global.window = {
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => {}
      };

      return {
        root,
        modal,
        btnSaveToLibrary,
        chkContent,
        chkPackaging,
        wrapContent,
        wrapPackaging,
        whyContent,
        whyPackaging,
        counterContent,
        counterPackaging,
        dualCallout,
        btnCancel,
        btnConfirm
      };
    }

    test('T12-10: Checkbox toggles textarea visibility without erasing previously typed text', () => {
      const dom = setupMockDOM();
      const controller = new SaveModalController({ modal: dom.modal });

      // Initially both hidden
      assert.equal(dom.wrapContent.hidden, true);
      assert.equal(dom.wrapPackaging.hidden, true);

      // Check Content
      dom.chkContent.checked = true;
      dom.chkContent.dispatchEvent({ type: 'change' });
      assert.equal(dom.wrapContent.hidden, false, 'wrap-why-content should be visible when chk-save-content is checked');

      // User types reasoning into why-content
      dom.whyContent.value = 'ชอบแนวคิดแก้ปัญหา transformation';
      dom.whyContent.dispatchEvent({ type: 'input' });

      // Uncheck Content
      dom.chkContent.checked = false;
      dom.chkContent.dispatchEvent({ type: 'change' });
      assert.equal(dom.wrapContent.hidden, true, 'wrap-why-content should be hidden when unchecked');

      // Check Content again: CRITICAL DOD -> Must NOT clear previously typed text
      dom.chkContent.checked = true;
      dom.chkContent.dispatchEvent({ type: 'change' });
      assert.equal(dom.wrapContent.hidden, false);
      assert.equal(dom.whyContent.value, 'ชอบแนวคิดแก้ปัญหา transformation', 'Must preserve typed text in why-content when toggled');

      // Check Packaging
      dom.chkPackaging.checked = true;
      dom.chkPackaging.dispatchEvent({ type: 'change' });
      assert.equal(dom.wrapPackaging.hidden, false);

      dom.whyPackaging.value = 'ชอบจังหวะตัดต่อเร็ว';
      dom.whyPackaging.dispatchEvent({ type: 'input' });

      // Both are checked -> Dual callout visible
      assert.equal(dom.dualCallout.hidden, false, 'dual-vault-callout should be visible when both vaults are checked');

      // Uncheck Packaging and check again
      dom.chkPackaging.checked = false;
      dom.chkPackaging.dispatchEvent({ type: 'change' });
      assert.equal(dom.wrapPackaging.hidden, true);

      dom.chkPackaging.checked = true;
      dom.chkPackaging.dispatchEvent({ type: 'change' });
      assert.equal(dom.whyPackaging.value, 'ชอบจังหวะตัดต่อเร็ว', 'Must preserve typed text in why-packaging when toggled');
    });

    test('T12-11: btn-cancel-save closes modal WITHOUT modifying store and returns focus to btn-save-to-library', () => {
      const dom = setupMockDOM();
      const controller = new SaveModalController({ modal: dom.modal });

      // Mock store initial state
      const initialStoreState = JSON.stringify(getState());

      // Open modal with trigger as btn-save-to-library
      controller.open({ id: 'test-source' }, dom.btnSaveToLibrary);
      assert.equal(dom.modal.hidden, false, 'Modal should be open');

      // Click btn-cancel-save
      dom.btnCancel.dispatchEvent({ type: 'click', preventDefault: () => {} });

      // Verify modal is closed
      assert.equal(dom.modal.hidden, true, 'Modal should be closed after cancel');

      // Verify store was not changed
      assert.equal(JSON.stringify(getState()), initialStoreState, 'Store must not be modified when cancelled');

      // Verify focus returned to btn-save-to-library
      assert.equal(MockDocument.activeElement, dom.btnSaveToLibrary, 'Focus must return to btn-save-to-library');
    });

    test('T12-12: Escape key closes modal and returns focus to btn-save-to-library', () => {
      const dom = setupMockDOM();
      const controller = new SaveModalController({ modal: dom.modal });

      controller.open({ id: 'test-source' }, dom.btnSaveToLibrary);
      assert.equal(dom.modal.hidden, false);

      // Trigger Escape key
      controller.handleKeyDown({
        key: 'Escape',
        preventDefault: () => {}
      });

      // Modal closed and focus returned
      assert.equal(dom.modal.hidden, true, 'Modal must close on Escape key');
      assert.equal(MockDocument.activeElement, dom.btnSaveToLibrary, 'Focus must return to btn-save-to-library');
    });
  });

});
