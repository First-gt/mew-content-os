/**
 * ==============================================================================
 * MEW CONTENT OS — S08 Concept Detail & Script Draft Unit Tests (Topic T27)
 * Framework: node:test & node:assert/strict
 * ==============================================================================
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ConceptDetailController } from './concept-detail.js';
import { getState, resetDemo, setStorageEngine } from './store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class MockLocalStorage {
  constructor() { this.store = new Map(); }
  getItem(key) { return this.store.get(key) || null; }
  setItem(key, value) { this.store.set(key, String(value)); }
  removeItem(key) { this.store.delete(key); }
  clear() { this.store.clear(); }
}

describe('Topic T27: S08 Concept Detail / Script Draft', () => {
  const htmlPath = path.resolve(__dirname, '../components/concept-detail.html');
  const cssPath = path.resolve(__dirname, '../styles/concept-detail.css');
  const jsPath = path.resolve(__dirname, './concept-detail.js');

  beforeEach(() => {
    global.localStorage = new MockLocalStorage();
    setStorageEngine(global.localStorage);
    resetDemo();
  });

  test('T27-01: Target files exist and are non-empty', () => {
    assert.ok(fs.existsSync(htmlPath), 'concept-detail.html must exist');
    assert.ok(fs.existsSync(cssPath), 'concept-detail.css must exist');
    assert.ok(fs.existsSync(jsPath), 'concept-detail.js must exist');

    assert.ok(fs.statSync(htmlPath).size > 100, 'concept-detail.html must not be empty');
    assert.ok(fs.statSync(cssPath).size > 100, 'concept-detail.css must not be empty');
    assert.ok(fs.statSync(jsPath).size > 100, 'concept-detail.js must not be empty');
  });

  test('T27-02: HTML contains all specified blueprint elements and script editor', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');

    // Blueprint components
    assert.ok(html.includes('id="cd-rationale"'), 'Must contain cd-rationale');
    assert.ok(html.includes('id="cd-outline"'), 'Must contain cd-outline');
    assert.ok(html.includes('id="cd-script-hook"'), 'Must contain cd-script-hook');
    assert.ok(html.includes('id="cd-scene-sound"'), 'Must contain cd-scene-sound');
    assert.ok(html.includes('id="cd-proof-required"'), 'Must contain cd-proof-required');
    assert.ok(html.includes('id="cd-cta"'), 'Must contain cd-cta');

    // Script editor
    assert.ok(html.includes('id="script-editor"'), 'Must contain script-editor');
    assert.ok(html.includes('id="btn-save-script-draft"'), 'Must contain btn-save-script-draft');
  });

  test('T27-03: Strict Negative Constraint: Absolutely NO fake statistics or percentage badges', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    const js = fs.readFileSync(jsPath, 'utf-8');
    const css = fs.readFileSync(cssPath, 'utf-8');

    const fakeStatPattern = /\b\d+\s*สัปดาห์/;
    assert.ok(!fakeStatPattern.test(html), 'concept-detail.html must not contain fake time stats');
    assert.ok(!fakeStatPattern.test(js), 'concept-detail.js must not contain fake time stats');
    assert.ok(!fakeStatPattern.test(css), 'concept-detail.css must not contain fake time stats');

    assert.ok(!html.includes('ai-score-badge'), 'No arbitrary AI score badges allowed');
    assert.ok(!html.includes('score-percentage'), 'No arbitrary percentage badges allowed');
  });

  test('T27-04: saveScriptDraft saves draft non-destructively without modifying original concept (A19)', () => {
    const originalConcept = {
      id: 'c-orig-100',
      name: 'Original Concept',
      hook: 'Original Hook'
    };

    const ctrl = new ConceptDetailController({ concept: originalConcept });
    const draft = ctrl.saveScriptDraft('Edited Hook for Script', 'Full voiceover text and cues...');

    assert.equal(draft.conceptId, 'c-orig-100');
    assert.equal(draft.scriptHook, 'Edited Hook for Script');
    assert.equal(originalConcept.hook, 'Original Hook', 'Original concept must remain unmutated');
    assert.ok(draft.savedAt);
  });

  test('T27-05: HTML contains edit-instruction, btn-apply-edit, btn-save-remix-draft, toast-draft-saved, and Content Board link', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');

    // edit-instruction field and apply button
    assert.ok(html.includes('id="edit-instruction"'), 'Must contain edit-instruction');
    assert.ok(html.includes('id="btn-apply-edit"'), 'Must contain btn-apply-edit');

    // btn-save-remix-draft with copy "Save Remix Draft"
    assert.ok(html.includes('id="btn-save-remix-draft"'), 'Must contain btn-save-remix-draft');
    assert.ok(html.includes('Save Remix Draft'), 'Must contain button copy "Save Remix Draft"');

    // toast-draft-saved and Content Board link
    assert.ok(html.includes('id="toast-draft-saved"'), 'Must contain toast-draft-saved');
    assert.ok(html.includes('Content Board'), 'Must reference Content Board in toast or navigation');
    assert.ok(html.includes('id="link-to-content-board"') || html.includes('href="#content-board"'), 'Must link to Content Board');
  });

  test('T27-06: saveRemixDraft commits to boardItems with stage "Draft" and DOES NOT approve/publish/render', () => {
    const concept = {
      id: 'c-remix-200',
      title: 'Remix Concept 200',
      hook: 'Hook for remix 200'
    };

    const ctrl = new ConceptDetailController({
      concept,
      initialScript: 'Draft script content here...'
    });

    const boardItem = ctrl.saveRemixDraft();

    // Verify stage is strictly Draft
    assert.equal(boardItem.stage, 'Draft');
    assert.equal(boardItem.status, 'Draft');

    // Verify STRICTLY not approved, not published, not rendered
    assert.equal(boardItem.isApproved, false, 'Draft must NOT be approved');
    assert.equal(boardItem.approved, false, 'Draft must NOT be approved');
    assert.equal(boardItem.published, false, 'Draft must NOT be published');
    assert.equal(boardItem.rendered, false, 'Draft must NOT be rendered');

    // Check store boardItems contains this item
    const state = getState();
    const storedItem = state.boardItems.find(b => b.id === boardItem.id);
    assert.ok(storedItem, 'boardItem must be stored in state.boardItems');
    assert.equal(storedItem.stage, 'Draft');
  });

  test('T27-07: saveRemixDraft preserves snapshot of references used + direction at that moment (for T30)', () => {
    const concept = {
      id: 'c-snap-300',
      title: 'Snapshot Test Concept',
      hook: 'Snapshot Hook'
    };
    const testReferences = [
      { id: 'note-1', title: 'Why Detachment Works', founderWhy: 'Long term brand', sourceUrl: 'https://example.com/1', vaultType: 'content' },
      { id: 'note-2', title: 'Fast Pacing Beat', founderWhy: 'Quick cuts', sourceUrl: 'https://example.com/2', vaultType: 'packaging' }
    ];
    const testDirection = {
      audience: 'Indie Hackers',
      ourPov: 'Authentic 100-build discipline',
      cta: 'Subscribe to series'
    };

    const ctrl = new ConceptDetailController({
      concept,
      references: testReferences,
      direction: testDirection
    });

    const boardItem = ctrl.saveRemixDraft();

    // Check reference snapshot
    assert.ok(Array.isArray(boardItem.referencesSnapshot), 'Must contain referencesSnapshot');
    assert.equal(boardItem.referencesSnapshot.length, 2);
    assert.equal(boardItem.referencesSnapshot[0].title, 'Why Detachment Works');
    assert.equal(boardItem.referencesSnapshot[0].why, 'Long term brand');

    // Check direction snapshot
    assert.ok(boardItem.directionSnapshot, 'Must contain directionSnapshot');
    assert.equal(boardItem.directionSnapshot.audience, 'Indie Hackers');
    assert.equal(boardItem.directionSnapshot.ourPov, 'Authentic 100-build discipline');
    assert.ok(boardItem.directionSnapshot.capturedAt, 'Direction snapshot must have captured timestamp');
  });

  test('T27-08: applyEdit updates draft based on natural language instruction non-destructively', () => {
    const originalConcept = {
      id: 'c-edit-400',
      title: 'Original Title',
      hook: 'คุณรู้ไหมว่าเราทำได้',
      proofRequired: 'หลักฐานเบื้องต้น'
    };

    const ctrl = new ConceptDetailController({
      concept: originalConcept,
      initialScript: 'บทดั้งเดิม'
    });

    // 1. เพิ่มตัวอย่างจริงจากธุรกิจเรา
    ctrl.applyEdit('เพิ่มตัวอย่างจริงจากธุรกิจเรา');
    assert.ok(ctrl.scriptDraft.proofRequired.includes('เคสจริงในธุรกิจ'));
    assert.ok(ctrl.scriptDraft.fullScript.includes('[ตัวอย่างจริงจากธุรกิจ]'));

    // 2. อย่าใช้ตัวเลขที่ไม่มีที่มา
    ctrl.applyEdit('อย่าใช้ตัวเลขที่ไม่มีที่มา');
    assert.ok(ctrl.scriptDraft.proofRequired.includes('ตัดตัวเลขลอยๆ'));

    // 3. ทำ suspense ให้น้อยลง
    ctrl.applyEdit('ทำ suspense ให้น้อยลง');
    assert.ok(ctrl.scriptDraft.sceneSound.includes('ลดการบิ้วท์อารมณ์'));

    // Ensure original concept was NOT mutated
    assert.equal(originalConcept.hook, 'คุณรู้ไหมว่าเราทำได้');
    assert.equal(originalConcept.proofRequired, 'หลักฐานเบื้องต้น');
  });
});
