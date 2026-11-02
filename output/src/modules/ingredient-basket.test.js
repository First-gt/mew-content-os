/**
 * ==============================================================================
 * MEW CONTENT OS — Ingredient Basket Bar Unit Tests (Topic T20)
 * Framework: node:test & node:assert/strict
 * ==============================================================================
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { IngredientBasketController } from './ingredient-basket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Topic T20: Ingredient Basket Bar + Continue Gating (S06)', () => {
  const htmlPath = path.resolve(__dirname, '../components/ingredient-basket.html');
  const cssPath = path.resolve(__dirname, '../styles/ingredient-basket.css');
  const jsPath = path.resolve(__dirname, './ingredient-basket.js');

  test('T20-01: Target files exist and are non-empty', () => {
    assert.ok(fs.existsSync(htmlPath), 'ingredient-basket.html must exist');
    assert.ok(fs.existsSync(cssPath), 'ingredient-basket.css must exist');
    assert.ok(fs.existsSync(jsPath), 'ingredient-basket.js must exist');

    assert.ok(fs.statSync(htmlPath).size > 100, 'ingredient-basket.html must not be empty');
    assert.ok(fs.statSync(cssPath).size > 100, 'ingredient-basket.css must not be empty');
    assert.ok(fs.statSync(jsPath).size > 100, 'ingredient-basket.js must not be empty');
  });

  test('T20-02: HTML contains sticky bar, counters, chips list, and gating hint', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');

    assert.ok(html.includes('id="ingredient-bar"'), 'Must contain ingredient-bar');
    assert.ok(html.includes('id="count-content-basket"'), 'Must contain count-content-basket');
    assert.ok(html.includes('id="count-packaging-basket"'), 'Must contain count-packaging-basket');
    assert.ok(html.includes('id="basket-chips-list"'), 'Must contain basket-chips-list');
    assert.ok(html.includes('id="hint-need-content"'), 'Must contain hint-need-content');
    assert.ok(html.includes('id="btn-continue-to-remix"'), 'Must contain btn-continue-to-remix');
  });

  test('T20-03: Strict Negative Constraint: Absolutely NO fake statistics or percentage badges', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    const js = fs.readFileSync(jsPath, 'utf-8');
    const css = fs.readFileSync(cssPath, 'utf-8');

    const fakeStatPattern = /\b\d+\s*สัปดาห์/;
    assert.ok(!fakeStatPattern.test(html), 'ingredient-basket.html must not contain fake time stats');
    assert.ok(!fakeStatPattern.test(js), 'ingredient-basket.js must not contain fake time stats');
    assert.ok(!fakeStatPattern.test(css), 'ingredient-basket.css must not contain fake time stats');

    assert.ok(!html.includes('ai-score-badge'), 'No arbitrary AI score badges allowed');
    assert.ok(!html.includes('score-percentage'), 'No arbitrary percentage badges allowed');
  });

  test('T20-04: Gating requires Content >= 1; Packaging can be 0 (D7/A10)', () => {
    const ctrl = new IngredientBasketController();

    // 0 Content, 0 Packaging -> Cannot continue
    assert.equal(ctrl.canContinue(0), false);

    // 0 Content, 2 Packaging -> Cannot continue (Must have at least 1 Content)
    assert.equal(ctrl.canContinue(0), false);

    // 1 Content, 0 Packaging -> Can continue!
    assert.equal(ctrl.canContinue(1), true);

    // 2 Content, 1 Packaging -> Can continue!
    assert.equal(ctrl.canContinue(2), true);
  });

  test('T20-05: removeReference removes item and updates counts', () => {
    const ctrl = new IngredientBasketController({
      initialReferences: [
        { id: 'c1', vaultType: 'content' },
        { id: 'p1', vaultType: 'packaging' }
      ]
    });

    assert.equal(ctrl.getCounts().total, 2);
    ctrl.removeReference('c1');
    assert.equal(ctrl.getCounts().total, 1);
    assert.equal(ctrl.getCounts().contentCount, 0);
    assert.equal(ctrl.getCounts().packagingCount, 1);
  });

  test('T20-06: getSharedSourceIds identifies items sharing the same source (A11)', () => {
    const ctrl = new IngredientBasketController({
      initialReferences: [
        { id: 'note-c-1', sourceId: 'source-100', vaultType: 'content' },
        { id: 'note-p-1', sourceId: 'source-100', vaultType: 'packaging' },
        { id: 'note-c-2', sourceId: 'source-200', vaultType: 'content' }
      ]
    });

    const shared = ctrl.getSharedSourceIds();
    assert.ok(shared.has('source-100'), 'source-100 must be identified as shared');
    assert.ok(!shared.has('source-200'), 'source-200 is only present once');
  });
});
