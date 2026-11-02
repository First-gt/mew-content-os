import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  SAVE_ERRORS,
  validateSave,
  commitSave,
  normalizeLenses
} from './save-commit.js';

import { getState, dispatch, resetDemo, setStorageEngine } from './store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory storage mock
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

test.beforeEach(() => {
  setStorageEngine(new MockLocalStorage());
  resetDemo();
});

test('Topic T13: Save Validation + Commit Logic', async (t) => {
  await t.test('1. Contract & File Existence', () => {
    const htmlPath = path.resolve(__dirname, '../components/save-validation.html');
    const cssPath = path.resolve(__dirname, '../styles/save-validation.css');
    const jsPath = path.resolve(__dirname, 'save-commit.js');

    assert.ok(fs.existsSync(htmlPath), 'save-validation.html must exist');
    assert.ok(fs.existsSync(cssPath), 'save-validation.css must exist');
    assert.ok(fs.existsSync(jsPath), 'save-commit.js must exist');

    const html = fs.readFileSync(htmlPath, 'utf8');
    assert.ok(html.includes('err-no-lens') || html.includes('msg-select-at-least-one'), 'HTML must have error container');
    assert.ok(html.includes('err-why-content') || html.includes('why-content'), 'HTML must have why-content error container');
    assert.ok(html.includes('err-why-packaging') || html.includes('why-packaging'), 'HTML must have why-packaging error container');
  });

  await t.test('2. Validation: No lens selected fails with err-no-lens', () => {
    const result = validateSave({
      lenses: [],
      whyContent: 'Some reason',
      whyPackaging: 'Some reason'
    });
    assert.strictEqual(result.isValid, false);
    assert.ok(result.errors.includes(SAVE_ERRORS.NO_LENS));
  });

  await t.test('3. Validation: Content selected without WHY fails with err-why-content', () => {
    const result = validateSave({
      lenses: ['content'],
      whyContent: '   ',
      whyPackaging: ''
    });
    assert.strictEqual(result.isValid, false);
    assert.ok(result.errors.includes(SAVE_ERRORS.WHY_CONTENT));
  });

  await t.test('4. Validation: Packaging selected without WHY fails with err-why-packaging', () => {
    const result = validateSave({
      lenses: ['packaging'],
      whyContent: '',
      whyPackaging: ''
    });
    assert.strictEqual(result.isValid, false);
    assert.ok(result.errors.includes(SAVE_ERRORS.WHY_PACKAGING));
  });

  await t.test('5. Validation: Both selected but one missing WHY blocks save', () => {
    const result = validateSave({
      lenses: ['content', 'packaging'],
      whyContent: 'Reason for content',
      whyPackaging: '   '
    });
    assert.strictEqual(result.isValid, false);
    assert.ok(result.errors.includes(SAVE_ERRORS.WHY_PACKAGING));
    assert.ok(!result.errors.includes(SAVE_ERRORS.WHY_CONTENT));
  });

  await t.test('6. Validation: Valid inputs pass validation', () => {
    const resContent = validateSave({
      lenses: ['content'],
      whyContent: 'Good thesis',
      whyPackaging: ''
    });
    assert.strictEqual(resContent.isValid, true);
    assert.strictEqual(resContent.errors.length, 0);

    const resBoth = validateSave({
      lenses: ['content', 'packaging'],
      whyContent: 'Good thesis',
      whyPackaging: 'High energy hook'
    });
    assert.strictEqual(resBoth.isValid, true);
    assert.strictEqual(resBoth.errors.length, 0);
  });

  await t.test('7. Commit D2: Content-only commits 1 note to Content Vault (no packaging note)', () => {
    const initialNotesCount = getState().savedNotes.length;

    const commitResult = commitSave({
      sourceId: 'source-a',
      lenses: ['content'],
      whyContent: 'Insightful framework',
      whyPackaging: ''
    });

    assert.strictEqual(commitResult.success, true);
    assert.strictEqual(commitResult.notes.length, 1);
    assert.strictEqual(commitResult.notes[0].vaultType, 'content');
    assert.strictEqual(commitResult.notes[0].sourceId, 'source-a');
    assert.strictEqual(commitResult.notes[0].why, 'Insightful framework');

    const updatedNotes = getState().savedNotes;
    assert.strictEqual(updatedNotes.length, initialNotesCount + 1);
    const added = updatedNotes.find(n => n.id === commitResult.notes[0].id);
    assert.ok(added);
    assert.strictEqual(added.vaultType, 'content');
  });

  await t.test('8. Commit D3: Packaging-only commits 1 note to Packaging Vault (no content note)', () => {
    const initialNotesCount = getState().savedNotes.length;

    const commitResult = commitSave({
      sourceId: 'source-b',
      lenses: ['packaging'],
      whyContent: '',
      whyPackaging: 'Punchy visual cadence'
    });

    assert.strictEqual(commitResult.success, true);
    assert.strictEqual(commitResult.notes.length, 1);
    assert.strictEqual(commitResult.notes[0].vaultType, 'packaging');
    assert.strictEqual(commitResult.notes[0].sourceId, 'source-b');
    assert.strictEqual(commitResult.notes[0].why, 'Punchy visual cadence');

    const updatedNotes = getState().savedNotes;
    assert.strictEqual(updatedNotes.length, initialNotesCount + 1);
    const added = updatedNotes.find(n => n.id === commitResult.notes[0].id);
    assert.ok(added);
    assert.strictEqual(added.vaultType, 'packaging');
  });

  await t.test('9. Commit D4: Both lenses commit 2 separate notes with same sourceId', () => {
    const initialNotesCount = getState().savedNotes.length;

    const commitResult = commitSave({
      sourceId: 'source-c',
      lenses: ['content', 'packaging'],
      whyContent: 'Original contrarian perspective',
      whyPackaging: 'Pattern interrupt opening'
    });

    assert.strictEqual(commitResult.success, true);
    assert.strictEqual(commitResult.notes.length, 2);

    const contentNote = commitResult.notes.find(n => n.vaultType === 'content');
    const packagingNote = commitResult.notes.find(n => n.vaultType === 'packaging');

    assert.ok(contentNote, 'Must have a content note');
    assert.ok(packagingNote, 'Must have a packaging note');
    assert.strictEqual(contentNote.sourceId, 'source-c');
    assert.strictEqual(packagingNote.sourceId, 'source-c');
    assert.notStrictEqual(contentNote.id, packagingNote.id);

    const updatedNotes = getState().savedNotes;
    assert.strictEqual(updatedNotes.length, initialNotesCount + 2);
  });

  await t.test('10. Atomic Rollback: Error during commit returns err-save-failed and store is unchanged', () => {
    const stateBefore = JSON.stringify(getState());

    const commitResult = commitSave({
      sourceId: 'source-atomic-test',
      lenses: ['content', 'packaging'],
      whyContent: 'Valid content reasoning',
      whyPackaging: 'Valid packaging reasoning',
      simulateError: true
    });

    assert.strictEqual(commitResult.success, false);
    assert.strictEqual(commitResult.error, SAVE_ERRORS.SAVE_FAILED);
    assert.strictEqual(commitResult.error, 'err-save-failed');

    const stateAfter = JSON.stringify(getState());
    assert.strictEqual(stateAfter, stateBefore, 'Store must remain 100% unchanged after commit error');
  });

  await t.test('11. Canonical Source Protection: Commit never copies or duplicates source/video', () => {
    const sourcesCountBefore = getState().sources.length;

    commitSave({
      sourceId: 'source-a',
      lenses: ['content', 'packaging'],
      whyContent: 'Why content',
      whyPackaging: 'Why packaging'
    });

    const sourcesCountAfter = getState().sources.length;
    assert.strictEqual(sourcesCountAfter, sourcesCountBefore, 'Source count must not increase; source must not be duplicated');
  });

  await t.test('12. Field error isolation: Both with one missing WHY shows error at that field only', () => {
    const resultMissingPkg = validateSave({
      lenses: ['content', 'packaging'],
      whyContent: 'Valid content why',
      whyPackaging: '   '
    });

    assert.strictEqual(resultMissingPkg.isValid, false);
    assert.strictEqual(resultMissingPkg.fieldErrors.whyPackaging, 'err-why-packaging');
    assert.strictEqual(resultMissingPkg.fieldErrors.whyContent, undefined);

    const resultMissingContent = validateSave({
      lenses: ['content', 'packaging'],
      whyContent: '',
      whyPackaging: 'Valid packaging why'
    });

    assert.strictEqual(resultMissingContent.isValid, false);
    assert.strictEqual(resultMissingContent.fieldErrors.whyContent, 'err-why-content');
    assert.strictEqual(resultMissingContent.fieldErrors.whyPackaging, undefined);
  });

  await t.test('13. Strict Negative Constraint Check', () => {
    const files = [
      path.resolve(__dirname, '../components/save-validation.html'),
      path.resolve(__dirname, '../styles/save-validation.css'),
      path.resolve(__dirname, 'save-commit.js')
    ];

    const forbiddenPatterns = [
      /12\s*สัปดาห์/i,
      /\+12\s*สัปดาห์นี้/i,
      /12\s*สัปดาห์วิเคราะห์แล้ว/i,
      /fake-badge/i
    ];

    for (const f of files) {
      const text = fs.readFileSync(f, 'utf8');
      for (const pattern of forbiddenPatterns) {
        assert.strictEqual(
          pattern.test(text),
          false,
          `Forbidden fake statistic pattern ${pattern} found in ${path.basename(f)}`
        );
      }
    }
  });
});
