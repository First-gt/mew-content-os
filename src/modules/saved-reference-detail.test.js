/**
 * ==============================================================================
 * MEW CONTENT OS — S05 Saved Reference Detail Unit Tests (Topic T18)
 * Framework: node:test & node:assert/strict
 * ==============================================================================
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { SavedReferenceDetailController } from './saved-reference-detail.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Topic T18: S05 Saved Reference Detail (Edit WHY / Remove Lens)', () => {
  const htmlPath = path.resolve(__dirname, '../components/saved-reference-detail.html');
  const cssPath = path.resolve(__dirname, '../styles/saved-reference-detail.css');
  const jsPath = path.resolve(__dirname, './saved-reference-detail.js');

  test('T18-01: Target files exist and are non-empty', () => {
    assert.ok(fs.existsSync(htmlPath), 'saved-reference-detail.html must exist');
    assert.ok(fs.existsSync(cssPath), 'saved-reference-detail.css must exist');
    assert.ok(fs.existsSync(jsPath), 'saved-reference-detail.js must exist');

    assert.ok(fs.statSync(htmlPath).size > 100, 'saved-reference-detail.html must not be empty');
    assert.ok(fs.statSync(cssPath).size > 100, 'saved-reference-detail.css must not be empty');
    assert.ok(fs.statSync(jsPath).size > 100, 'saved-reference-detail.js must not be empty');
  });

  test('T18-02: HTML contains all required elements for detail, edit, history, and gating', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');

    // Selected Lens & Snapshot
    assert.ok(html.includes('id="selected-lens"'), 'Must contain selected-lens');
    assert.ok(html.includes('id="analysis-snapshot"'), 'Must contain analysis-snapshot');

    // Editable WHY elements
    assert.ok(html.includes('id="btn-edit-my-note"'), 'Must contain btn-edit-my-note');
    assert.ok(html.includes('id="btn-save-note-edit"'), 'Must contain btn-save-note-edit');
    assert.ok(html.includes('id="textarea-founder-why"'), 'Must contain textarea-founder-why');

    // History and Warning
    assert.ok(html.includes('id="note-history"'), 'Must contain note-history');
    assert.ok(html.includes('id="warn-used-in-draft"'), 'Must contain warn-used-in-draft');

    // Actions & Confirm
    assert.ok(html.includes('id="btn-use-in-remix"'), 'Must contain btn-use-in-remix');
    assert.ok(html.includes('id="btn-remove-from-vault"'), 'Must contain btn-remove-from-vault');
    assert.ok(html.includes('id="confirm-remove"'), 'Must contain confirm-remove dialog');
  });

  test('T18-03: Strict Negative Constraint: Absolutely NO fake statistics or percentage badges', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    const js = fs.readFileSync(jsPath, 'utf-8');
    const css = fs.readFileSync(cssPath, 'utf-8');

    const fakeStatPattern = /\b\d+\s*สัปดาห์/;
    assert.ok(!fakeStatPattern.test(html), 'saved-reference-detail.html must not contain fake time stats');
    assert.ok(!fakeStatPattern.test(js), 'saved-reference-detail.js must not contain fake time stats');
    assert.ok(!fakeStatPattern.test(css), 'saved-reference-detail.css must not contain fake time stats');

    assert.ok(!html.includes('ai-score-badge'), 'No arbitrary AI score badges allowed');
    assert.ok(!html.includes('score-percentage'), 'No arbitrary percentage badges allowed');
  });

  test('T18-04: editWhy updates note non-destructively and logs history entry (A06)', () => {
    const ctrl = new SavedReferenceDetailController();
    const initialNote = {
      id: 'note-101',
      sourceId: 'src-1',
      lens: 'content',
      founderWhy: 'Initial thought',
      history: []
    };

    ctrl.setNote(initialNote);
    const updated = ctrl.editWhy('Refined founder perspective with more depth');

    assert.equal(updated.founderWhy, 'Refined founder perspective with more depth');
    assert.equal(updated.history.length, 1, 'History must record exactly 1 edit');
    assert.equal(updated.history[0].previousText, 'Initial thought');
    assert.equal(updated.history[0].newText, 'Refined founder perspective with more depth');
    assert.ok(updated.history[0].timestamp, 'History entry must have timestamp');
  });

  test('T18-05: removeFromVault triggers callback with target noteId', () => {
    let removedId = null;
    const ctrl = new SavedReferenceDetailController({
      onNoteRemoved: (id) => { removedId = id; }
    });

    ctrl.setNote({ id: 'note-to-remove', lens: 'packaging' });
    const success = ctrl.removeFromVault();

    assert.ok(success);
    assert.equal(removedId, 'note-to-remove');
  });

  test('T18-06: isUsedInDrafts correctly identifies draft dependencies', () => {
    const ctrl = new SavedReferenceDetailController();
    const sampleDrafts = [
      { id: 'draft-1', title: 'Draft One', ingredients: [{ id: 'note-used' }] },
      { id: 'draft-2', title: 'Draft Two', ingredients: [{ id: 'other-note' }] }
    ];

    assert.ok(ctrl.isUsedInDrafts('note-used', sampleDrafts), 'Should detect note is in draft-1');
    assert.ok(!ctrl.isUsedInDrafts('note-unused', sampleDrafts), 'Should return false for unused note');
  });

  test('T18-07: editWhy validates inputs and throws descriptive errors on empty content', () => {
    const ctrl = new SavedReferenceDetailController();
    assert.throws(() => {
      ctrl.editWhy('Some text without active note');
    }, /No active note to edit/);

    ctrl.setNote({ id: 'note-202', lens: 'content', why: 'Existing note' });
    assert.throws(() => {
      ctrl.editWhy('');
    }, /WHY text cannot be empty/);
    assert.throws(() => {
      ctrl.editWhy('   ');
    }, /WHY text cannot be empty/);
  });

  test('T18-08: Sequential edits accumulate in history without overwriting previous versions', () => {
    const ctrl = new SavedReferenceDetailController();
    ctrl.setNote({
      id: 'note-sequential',
      lens: 'packaging',
      founderWhy: 'First version'
    });

    ctrl.editWhy('Second version');
    ctrl.editWhy('Third version');

    assert.equal(ctrl.currentNote.founderWhy, 'Third version');
    assert.equal(ctrl.currentNote.history.length, 2);
    assert.equal(ctrl.currentNote.history[0].previousText, 'First version');
    assert.equal(ctrl.currentNote.history[0].newText, 'Second version');
    assert.equal(ctrl.currentNote.history[1].previousText, 'Second version');
    assert.equal(ctrl.currentNote.history[1].newText, 'Third version');
  });

  test('T18-09: isUsedInDrafts supports varied draft ingredient schemas', () => {
    const ctrl = new SavedReferenceDetailController();
    const drafts = [
      { id: 'd1', ingredients: ['string-id-ref'] },
      { id: 'd2', ingredients: [{ noteId: 'note-id-ref' }] },
      { id: 'd3', selectedReferences: [{ referenceId: 'ref-id-match' }] }
    ];

    assert.ok(ctrl.isUsedInDrafts('string-id-ref', drafts));
    assert.ok(ctrl.isUsedInDrafts('note-id-ref', drafts));
    assert.ok(ctrl.isUsedInDrafts('ref-id-match', drafts));
    assert.ok(!ctrl.isUsedInDrafts('not-found-id', drafts));
  });

  test('T18-10: escapeHtml neutralizes potential XSS tags in history records', () => {
    const ctrl = new SavedReferenceDetailController();
    const dangerous = '<script>alert("xss")</script>&"test"';
    const clean = ctrl.escapeHtml(dangerous);

    assert.ok(!clean.includes('<script>'));
    assert.ok(clean.includes('&lt;script&gt;'));
    assert.ok(clean.includes('&amp;'));
  });

  test('T18-11: HTML contains original video frame and external link indicators', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    assert.ok(html.includes('id="source-info-card"'), 'Must have source info card');
    assert.ok(html.includes('id="source-link"'), 'Must have link to original clip');
    assert.ok(html.includes('id="video-preview-wrapper"'), 'Must have video preview wrapper');
    assert.ok(html.includes('id="btn-back-to-library"'), 'Must have back to library button');
  });

  test('T18-12: CSS implements Mewteetawat V6.3 design system variables and offer card styling', () => {
    const css = fs.readFileSync(cssPath, 'utf-8');
    assert.ok(css.includes('--canvas-bg: #fbfaf8'), 'Must define paper canvas #fbfaf8');
    assert.ok(css.includes('--surface-soft: #f4f2ee'), 'Must define surface soft #f4f2ee');
    assert.ok(css.includes('--stone-line: #e7e3de'), 'Must define stone line #e7e3de');
    assert.ok(css.includes('--deep-ink: #11110f'), 'Must define deep ink #11110f');
    assert.ok(css.includes('--coral-accent: #ed765b'), 'Must define coral accent #ed765b');
    assert.ok(css.includes('--electric-violet: #8a76ff'), 'Must define electric violet #8a76ff');
    assert.ok(css.includes('.mew-offer-card'), 'Must style .mew-offer-card');
    assert.ok(css.includes('translateY(-2px)'), 'Must include hover translateY(-2px)');
  });
});
