/**
 * ==============================================================================
 * MEW CONTENT OS — Ingredient Basket Bar (Topic T20) Unit & DOD Tests
 * Framework: node:test & node:assert/strict
 * ==============================================================================
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { IngredientBarController, IngredientBasketController } from './ingredient-bar.js';
import { getState, dispatch } from './store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Topic T20: Ingredient Basket Bar + Continue Gating (ingredient-bar)', () => {
  const htmlPath = path.resolve(__dirname, '../components/ingredient-bar.html');
  const cssPath = path.resolve(__dirname, '../styles/ingredient-bar.css');
  const jsPath = path.resolve(__dirname, './ingredient-bar.js');

  test('T20-BAR-01: Target files exist and are non-empty', () => {
    assert.ok(fs.existsSync(htmlPath), 'ingredient-bar.html must exist');
    assert.ok(fs.existsSync(cssPath), 'ingredient-bar.css must exist');
    assert.ok(fs.existsSync(jsPath), 'ingredient-bar.js must exist');

    assert.ok(fs.statSync(htmlPath).size > 100, 'ingredient-bar.html must not be empty');
    assert.ok(fs.statSync(cssPath).size > 100, 'ingredient-bar.css must not be empty');
    assert.ok(fs.statSync(jsPath).size > 100, 'ingredient-bar.js must not be empty');
  });

  test('T20-BAR-02: HTML contains sticky bar, Content/Packaging counters, chips list, and gating hint', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');

    assert.ok(html.includes('id="ingredient-bar"'), 'Must contain ingredient-bar');
    assert.ok(html.includes('id="count-content-basket"'), 'Must contain count-content-basket');
    assert.ok(html.includes('id="count-packaging-basket"'), 'Must contain count-packaging-basket');
    assert.ok(html.includes('id="basket-chips-list"'), 'Must contain basket-chips-list');
    assert.ok(html.includes('id="hint-need-content"'), 'Must contain hint-need-content');
    assert.ok(html.includes('id="btn-continue-to-remix"'), 'Must contain btn-continue-to-remix');
  });

  test('T20-BAR-03: HTML template has remove, drag-reorder handle, preview button, and shared source badge', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');

    assert.ok(html.includes('tmpl-basket-chip'), 'Must contain chip template');
    assert.ok(html.includes('btn-remove-chip'), 'Must contain remove chip button');
    assert.ok(html.includes('drag-handle'), 'Must contain drag-reorder handle');
    assert.ok(html.includes('btn-preview-chip'), 'Must contain preview chip button');
    assert.ok(html.includes('both-source-badge'), 'Must contain both-source-badge for A11');
  });

  test('T20-BAR-04: Strict Negative Constraint: Absolutely NO fake statistics or percentage badges', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    const js = fs.readFileSync(jsPath, 'utf-8');
    const css = fs.readFileSync(cssPath, 'utf-8');

    const fakeStatPattern = /\b\d+\s*สัปดาห์/;
    assert.ok(!fakeStatPattern.test(html), 'ingredient-bar.html must not contain fake time stats');
    assert.ok(!fakeStatPattern.test(js), 'ingredient-bar.js must not contain fake time stats');
    assert.ok(!fakeStatPattern.test(css), 'ingredient-bar.css must not contain fake time stats');

    assert.ok(!html.includes('ai-score-badge'), 'No arbitrary AI score badges allowed');
    assert.ok(!html.includes('score-percentage'), 'No arbitrary percentage badges allowed');
  });

  test('T20-BAR-05: Gating requires Content >= 1; Packaging can be 0 (D7/A10)', () => {
    const ctrl = new IngredientBarController({
      initialReferences: []
    });

    // 0 Content, 0 Packaging -> Cannot continue
    assert.equal(ctrl.canContinue(0), false);

    // 0 Content, 2 Packaging -> Cannot continue
    assert.equal(ctrl.canContinue(0), false);

    // 1 Content, 0 Packaging -> Can continue (Packaging = 0 is allowed)
    assert.equal(ctrl.canContinue(1), true);

    // 2 Content, 1 Packaging -> Can continue
    assert.equal(ctrl.canContinue(2), true);
  });

  test('T20-BAR-06: removeReference removes item, updates counts, and unchecks picker checkbox', () => {
    const ctrl = new IngredientBarController({
      initialReferences: [
        { id: 'c1', vaultType: 'content', title: 'Content 1' },
        { id: 'p1', vaultType: 'packaging', title: 'Packaging 1' }
      ]
    });

    assert.equal(ctrl.getCounts().total, 2);
    assert.equal(ctrl.getCounts().contentCount, 1);
    assert.equal(ctrl.getCounts().packagingCount, 1);

    ctrl.removeReference('c1');
    assert.equal(ctrl.getCounts().total, 1);
    assert.equal(ctrl.getCounts().contentCount, 0);
    assert.equal(ctrl.getCounts().packagingCount, 1);
  });

  test('T20-BAR-07: reorderReferences changes actual order and syncs with store remixSelection', () => {
    const ctrl = new IngredientBarController({
      initialReferences: [
        { id: 'c1', vaultType: 'content' },
        { id: 'c2', vaultType: 'content' },
        { id: 'p1', vaultType: 'packaging' }
      ]
    });

    // Initial order
    assert.deepEqual(ctrl.selectedReferences.map(r => r.id), ['c1', 'c2', 'p1']);

    // Reorder: put c2 first, then c1, then p1
    ctrl.reorderReferences(['c2', 'c1', 'p1']);
    assert.deepEqual(ctrl.selectedReferences.map(r => r.id), ['c2', 'c1', 'p1']);

    // Verify store remixSelection received the reordered content array
    const state = getState();
    assert.deepEqual(state.remixSelection.content, ['c2', 'c1']);
  });

  test('T20-BAR-08: getSharedSourceIds identifies Both lenses from same source (A11)', () => {
    const ctrl = new IngredientBarController({
      initialReferences: [
        { id: 'note-e-content', sourceId: 'source-e', vaultType: 'content' },
        { id: 'note-e-packaging', sourceId: 'source-e', vaultType: 'packaging' },
        { id: 'note-independent', sourceId: 'source-indep', vaultType: 'content' }
      ]
    });

    const shared = ctrl.getSharedSourceIds();
    assert.ok(shared.has('source-e'), 'source-e must be recognized as shared across Both lenses (A11)');
    assert.ok(!shared.has('source-indep'), 'source-indep is only present once');
  });

  test('T20-BAR-09: CSS contains sticky positioning and distinct colors for Content and Packaging', () => {
    const css = fs.readFileSync(cssPath, 'utf-8');

    // Sticky
    assert.ok(css.includes('position: sticky'), 'CSS must specify position: sticky');
    assert.ok(css.includes('bottom: 0'), 'CSS must stick to bottom: 0');

    // Distinct chip colors
    assert.ok(css.includes('.chip-content'), 'Must style .chip-content');
    assert.ok(css.includes('.chip-packaging'), 'Must style .chip-packaging');
    assert.ok(css.includes('--coral-accent'), 'Must use coral accent for content');
    assert.ok(css.includes('--violet-accent'), 'Must use violet accent for packaging');
  });
});
