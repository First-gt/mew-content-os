/**
 * ==============================================================================
 * MEW CONTENT OS — S06 Remix Reference Picker Unit Tests (Topic T19)
 * Framework: node:test & node:assert/strict
 * ==============================================================================
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { RemixPickerController } from './remix-picker.js';
import { getState, dispatch, seed } from './store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Topic T19: S06 Remix Reference Picker (Two Columns)', () => {
  const htmlPath = path.resolve(__dirname, '../components/remix-picker.html');
  const cssPath = path.resolve(__dirname, '../styles/remix-picker.css');
  const jsPath = path.resolve(__dirname, './remix-picker.js');

  beforeEach(() => {
    seed();
  });

  test('T19-01: Target files exist and are non-empty', () => {
    assert.ok(fs.existsSync(htmlPath), 'remix-picker.html must exist');
    assert.ok(fs.existsSync(cssPath), 'remix-picker.css must exist');
    assert.ok(fs.existsSync(jsPath), 'remix-picker.js must exist');

    assert.ok(fs.statSync(htmlPath).size > 100, 'remix-picker.html must not be empty');
    assert.ok(fs.statSync(cssPath).size > 100, 'remix-picker.css must not be empty');
    assert.ok(fs.statSync(jsPath).size > 100, 'remix-picker.js must not be empty');
  });

  test('T19-02: HTML contains two distinct columns, search inputs, and item template', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');

    // Columns
    assert.ok(html.includes('id="picker-content"'), 'Must contain picker-content column');
    assert.ok(html.includes('id="picker-packaging"'), 'Must contain picker-packaging column');

    // Counters
    assert.ok(html.includes('id="count-picked-content"'), 'Must contain count-picked-content');
    assert.ok(html.includes('id="count-picked-packaging"'), 'Must contain count-picked-packaging');

    // Searches
    assert.ok(html.includes('id="search-picker-content"'), 'Must contain content search');
    assert.ok(html.includes('id="search-picker-packaging"'), 'Must contain packaging search');

    // Template
    assert.ok(html.includes('id="tmpl-picker-item"'), 'Must contain item template');
    assert.ok(html.includes('picker-checkbox'), 'Must contain picker-checkbox');
    assert.ok(html.includes('btn-preview'), 'Must contain btn-preview');
  });

  test('T19-03: Strict Negative Constraint: Absolutely NO fake statistics or percentage badges', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    const js = fs.readFileSync(jsPath, 'utf-8');
    const css = fs.readFileSync(cssPath, 'utf-8');

    const fakeStatPattern = /\b\d+\s*สัปดาห์/;
    assert.ok(!fakeStatPattern.test(html), 'remix-picker.html must not contain fake time stats');
    assert.ok(!fakeStatPattern.test(js), 'remix-picker.js must not contain fake time stats');
    assert.ok(!fakeStatPattern.test(css), 'remix-picker.css must not contain fake time stats');

    assert.ok(!html.includes('ai-score-badge'), 'No arbitrary AI score badges allowed');
    assert.ok(!html.includes('score-percentage'), 'No arbitrary percentage badges allowed');
  });

  test('T19-04: Flexible selection allows picking only content, only packaging, or both', () => {
    const ctrl = new RemixPickerController();

    ctrl.toggleSelection('c1');
    assert.ok(ctrl.isSelected('c1'), 'c1 should be selected');
    assert.equal(ctrl.selectedIds.size, 1);

    ctrl.toggleSelection('p1');
    assert.ok(ctrl.isSelected('p1'), 'p1 should be selected');
    assert.equal(ctrl.selectedIds.size, 2);

    // Toggle off
    ctrl.toggleSelection('c1');
    assert.ok(!ctrl.isSelected('c1'), 'c1 should now be unselected');
    assert.equal(ctrl.selectedIds.size, 1);
  });

  test('T19-05: getSelectionCounts calculates accurate counts per column', () => {
    const sampleRefs = [
      { id: 'c1', vaultType: 'content' },
      { id: 'c2', vaultType: 'content' },
      { id: 'p1', vaultType: 'packaging' },
      { id: 'b1', vaultType: 'both' }
    ];

    const ctrl = new RemixPickerController({ initialSelection: ['c1', 'p1'] });
    const counts = ctrl.getSelectionCounts(sampleRefs);

    assert.equal(counts.contentCount, 1);
    assert.equal(counts.packagingCount, 1);
    assert.equal(counts.total, 2);
  });

  test('T19-06: filterList filters accurately by column lens and search query', () => {
    const sampleRefs = [
      { id: 'c1', vaultType: 'content', title: 'Deep Focus', founderWhy: 'Great mindset' },
      { id: 'p1', vaultType: 'packaging', title: 'Ticking Metronome', founderWhy: 'Audio cue' }
    ];

    const ctrl = new RemixPickerController();
    const contentItems = ctrl.filterList(sampleRefs, 'content');
    assert.equal(contentItems.length, 1);
    assert.equal(contentItems[0].id, 'c1');

    const packagingItems = ctrl.filterList(sampleRefs, 'packaging');
    assert.equal(packagingItems.length, 1);
    assert.equal(packagingItems[0].id, 'p1');
  });

  test('T19-07: HTML contains pick-{noteId} checkboxes and btn-preview-{noteId} preview triggers', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');

    // Pattern requirements from DOD: pick-{noteId} and btn-preview-{noteId}
    assert.ok(html.includes('pick-{noteId}'), 'Template must have pick-{noteId}');
    assert.ok(html.includes('btn-preview-{noteId}'), 'Template must have btn-preview-{noteId}');

    // Sample rendered items
    assert.ok(html.includes('id="pick-note-a"'), 'Must have pick-note-a');
    assert.ok(html.includes('id="pick-note-b"'), 'Must have pick-note-b');
    assert.ok(html.includes('id="btn-preview-note-a"'), 'Must have btn-preview-note-a');
    assert.ok(html.includes('id="btn-preview-note-b"'), 'Must have btn-preview-note-b');

    // Preview modal and WHY label
    assert.ok(html.includes('id="picker-preview-modal"'), 'Must include preview modal');
    assert.ok(html.includes('Founder WHY') || html.includes('ดู WHY/ที่มา'), 'Must feature Founder WHY preview');
  });

  test('T19-08: Two Entry Points: Start Remix (empty basket) vs Use in Remix (with reference)', () => {
    // Path 1: Start Remix from Dashboard (empty basket)
    const startCtrl = new RemixPickerController({ mode: 'start' });
    assert.equal(startCtrl.selectedIds.size, 0, 'Start Remix should start with empty basket');

    // Path 2: Use in Remix from Vault (with reference)
    const useCtrl = new RemixPickerController({
      mode: 'use-in-remix',
      initialSelection: ['note-c2']
    });
    assert.ok(useCtrl.isSelected('note-c2'), 'Use in Remix must pre-populate selected reference');
    assert.equal(useCtrl.selectedIds.size, 1);
  });

  test('T19-09: Toggling an item immediately dispatches to Central Store remixSelection', () => {
    const ctrl = new RemixPickerController({ mode: 'start' });
    assert.equal(ctrl.selectedIds.size, 0);

    ctrl.toggleSelection('note-c2', 'content');
    const storeState = getState();
    assert.ok(storeState.remixSelection.content.includes('note-c2'), 'Store remixSelection.content must immediately update');

    ctrl.toggleSelection('note-c2', 'content');
    const updatedStoreState = getState();
    assert.ok(!updatedStoreState.remixSelection.content.includes('note-c2'), 'Toggling off must immediately remove from store');
  });

  test('T19-10: Strict Rule: No automatic/random selection, AI recommendation banner is optional', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    assert.ok(html.includes('AI Recommend (Optional)'), 'AI Recommend must be marked as Optional');

    // A fresh instance without initialSelection must not randomly select anything
    const ctrl = new RemixPickerController({ mode: 'start' });
    assert.equal(ctrl.selectedIds.size, 0, 'No automatic or random selection allowed');
  });
});
