/**
 * ==============================================================================
 * MEW CONTENT OS — S07 Remix Workspace Ingredients Unit Tests (Topic T22)
 * Framework: node:test & node:assert/strict
 * ==============================================================================
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { WorkspaceIngredientsController, remixSession, getRemixSession } from './ws-ingredients.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Topic T22: S07 Remix Workspace — Ingredients Panel', () => {
  const htmlPath = path.resolve(__dirname, '../components/ws-ingredients.html');
  const cssPath = path.resolve(__dirname, '../styles/ws-ingredients.css');
  const jsPath = path.resolve(__dirname, './ws-ingredients.js');

  test('T22-01: Target files exist and are non-empty', () => {
    assert.ok(fs.existsSync(htmlPath), 'ws-ingredients.html must exist');
    assert.ok(fs.existsSync(cssPath), 'ws-ingredients.css must exist');
    assert.ok(fs.existsSync(jsPath), 'ws-ingredients.js must exist');

    assert.ok(fs.statSync(htmlPath).size > 100, 'ws-ingredients.html must not be empty');
    assert.ok(fs.statSync(cssPath).size > 100, 'ws-ingredients.css must not be empty');
    assert.ok(fs.statSync(jsPath).size > 100, 'ws-ingredients.js must not be empty');
  });

  test('T22-02: HTML contains ingredients panel, warning box, and card template', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');

    assert.ok(html.includes('id="ws-ingredients"'), 'Must contain ws-ingredients');
    assert.ok(html.includes('id="warn-no-content"'), 'Must contain warn-no-content');
    assert.ok(html.includes('id="tmpl-ws-ingredient-card"'), 'Must contain card template');
    assert.ok(html.includes('borrow-textarea'), 'Must contain borrow-textarea');
    assert.ok(html.includes('founder-note-box'), 'Must contain founder-note-box');
    assert.ok(html.includes('founder-note'), 'Must contain founder-note class');
    assert.ok(html.includes('ws-source-preview-modal'), 'Must contain in-workspace source modal');
  });

  test('T22-03: Strict Negative Constraint: Absolutely NO fake statistics or percentage badges', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    const js = fs.readFileSync(jsPath, 'utf-8');
    const css = fs.readFileSync(cssPath, 'utf-8');

    const fakeStatPattern = /\b\d+\s*สัปดาห์/;
    assert.ok(!fakeStatPattern.test(html), 'ws-ingredients.html must not contain fake time stats');
    assert.ok(!fakeStatPattern.test(js), 'ws-ingredients.js must not contain fake time stats');
    assert.ok(!fakeStatPattern.test(css), 'ws-ingredients.css must not contain fake time stats');

    assert.ok(!html.includes('ai-score-badge'), 'No arbitrary AI score badges allowed');
    assert.ok(!html.includes('score-percentage'), 'No arbitrary percentage badges allowed');
  });

  test('T22-04: Default borrowText is initialized from founderWhy or aiInsight', () => {
    const sample = [
      { id: 'c1', vaultType: 'content', founderWhy: 'Focus on quality over speed' }
    ];

    const ctrl = new WorkspaceIngredientsController({ ingredients: sample });
    assert.equal(ctrl.ingredients[0].borrowText, 'Focus on quality over speed');
    assert.equal(ctrl.ingredients[0].borrowWhat, 'Focus on quality over speed');
  });

  test('T22-05: updateBorrowText modifies borrow instruction and auto-saves', () => {
    let draftEmitted = null;
    const ctrl = new WorkspaceIngredientsController({
      ingredients: [{ id: 'c1', vaultType: 'content', borrowText: 'Old' }],
      onDraftUpdated: (updated) => { draftEmitted = updated; }
    });

    ctrl.updateBorrowText('c1', 'New refined borrowing angle');
    assert.equal(ctrl.ingredients[0].borrowText, 'New refined borrowing angle');
    assert.equal(ctrl.ingredients[0].borrowWhat, 'New refined borrowing angle');
    assert.ok(draftEmitted);
  });

  test('T22-06: hasValidContentIngredient accurately detects content presence', () => {
    const ctrl = new WorkspaceIngredientsController();

    ctrl.setIngredients([{ id: 'p1', vaultType: 'packaging' }]);
    assert.equal(ctrl.hasValidContentIngredient(), false, 'Packaging alone is not valid without Content');

    ctrl.setIngredients([
      { id: 'p1', vaultType: 'packaging' },
      { id: 'c1', vaultType: 'content' }
    ]);
    assert.equal(ctrl.hasValidContentIngredient(), true, 'Content + Packaging is valid');
  });

  test('T22-07: Separates Content (borrow-what) and Packaging (borrow-how) and updates remixSession', () => {
    const sample = [
      { id: 'c101', vaultType: 'content', founderWhy: 'Value first' },
      { id: 'p102', vaultType: 'packaging', founderWhy: 'Punchy 3s hook' }
    ];

    const ctrl = new WorkspaceIngredientsController({ ingredients: sample });
    assert.equal(ctrl.ingredients.length, 2);

    // Content ingredient has borrowWhat
    ctrl.updateBorrowText('c101', 'Borrow deep educational core');
    assert.equal(ctrl.ingredients[0].borrowWhat, 'Borrow deep educational core');

    // Packaging ingredient has borrowHow
    ctrl.updateBorrowText('p102', 'Borrow sensory timer sound');
    assert.equal(ctrl.ingredients[1].borrowHow, 'Borrow sensory timer sound');

    // remixSession.ingredients holds values
    const session = getRemixSession();
    assert.ok(Array.isArray(session.ingredients));
    const foundC = session.ingredients.find(i => i.id === 'c101');
    const foundP = session.ingredients.find(i => i.id === 'p102');
    assert.equal(foundC.borrowWhat, 'Borrow deep educational core');
    assert.equal(foundP.borrowHow, 'Borrow sensory timer sound');
  });

  test('T22-08: Switching panels preserves remixSession.ingredients without loss', () => {
    // Initial workspace panel load with edits
    const ctrl1 = new WorkspaceIngredientsController({
      ingredients: [{ id: 'ref-1', vaultType: 'content', founderWhy: 'Initial WHY' }]
    });
    ctrl1.updateBorrowText('ref-1', 'Founder custom angle that took 10 mins to write');

    // User switches to Direction panel and returns back to Ingredients panel
    const ctrl2 = new WorkspaceIngredientsController({
      ingredients: [{ id: 'ref-1', vaultType: 'content', founderWhy: 'Initial WHY' }]
    });

    // Value MUST NOT be lost or overwritten by default initial WHY
    assert.equal(ctrl2.ingredients[0].borrowText, 'Founder custom angle that took 10 mins to write');
  });
});
