/**
 * ==============================================================================
 * MEW CONTENT OS — Refine / Compare Concepts Unit Tests (Topic T26)
 * Framework: node:test & node:assert/strict
 * ==============================================================================
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ConceptRefineController } from './concept-refine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Topic T26: Refine / Compare Concepts', () => {
  const htmlPath = path.resolve(__dirname, '../components/concept-compare.html');
  const cssPath = path.resolve(__dirname, '../styles/concept-compare.css');
  const jsPath = path.resolve(__dirname, './concept-refine.js');

  test('T26-01: Target files exist and are non-empty', () => {
    assert.ok(fs.existsSync(htmlPath), 'concept-compare.html must exist');
    assert.ok(fs.existsSync(cssPath), 'concept-compare.css must exist');
    assert.ok(fs.existsSync(jsPath), 'concept-refine.js must exist');

    assert.ok(fs.statSync(htmlPath).size > 100, 'concept-compare.html must not be empty');
    assert.ok(fs.statSync(cssPath).size > 100, 'concept-compare.css must not be empty');
    assert.ok(fs.statSync(jsPath).size > 100, 'concept-refine.js must not be empty');
  });

  test('T26-02: HTML contains compare toolbar, matrix view, and refine dialog elements', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');

    assert.ok(html.includes('id="concept-compare-root"'), 'Must contain concept-compare-root');
    assert.ok(html.includes('id="btn-compare-concepts"'), 'Must contain btn-compare-concepts');
    assert.ok(html.includes('id="btn-remix-again"'), 'Must contain btn-remix-again');
    assert.ok(html.includes('id="compare-view"'), 'Must contain compare-view');
    assert.ok(html.includes('id="refine-dialog"'), 'Must contain refine-dialog');
    assert.ok(html.includes('id="refine-instruction"'), 'Must contain refine-instruction');
    assert.ok(html.includes('id="btn-refine-angle"'), 'Must contain btn-refine-angle');
    assert.ok(html.includes('id="btn-reject-concept"'), 'Must contain btn-reject-concept');
  });

  test('T26-03: Strict Negative Constraint: Absolutely NO fake statistics or percentage badges', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    const js = fs.readFileSync(jsPath, 'utf-8');
    const css = fs.readFileSync(cssPath, 'utf-8');

    const fakeStatPattern = /\b\d+\s*สัปดาห์/;
    assert.ok(!fakeStatPattern.test(html), 'concept-compare.html must not contain fake time stats');
    assert.ok(!fakeStatPattern.test(js), 'concept-refine.js must not contain fake time stats');
    assert.ok(!fakeStatPattern.test(css), 'concept-compare.css must not contain fake time stats');

    assert.ok(!html.includes('ai-score-badge'), 'No arbitrary AI score badges allowed');
    assert.ok(!html.includes('score-percentage'), 'No arbitrary percentage badges allowed');
  });

  test('T26-04: refineAngle creates new version non-destructively without overwriting original (A18)', () => {
    const ctrl = new ConceptRefineController();
    const originalConcept = {
      id: 'c-orig-1',
      name: 'Counter Truth',
      hook: 'Original hook',
      beats: ['Beat 1', 'Beat 2'],
      originalContribution: 'Original POV'
    };

    const refined = ctrl.refineAngle(originalConcept, 'Make it more urgent and actionable');

    assert.notEqual(refined.id, originalConcept.id, 'Refined concept must receive new unique ID');
    assert.equal(refined.parentConceptId, originalConcept.id);
    assert.ok(refined.hook.includes('Make it more urgent'));
    assert.equal(originalConcept.hook, 'Original hook', 'Original concept must remain unmutated');
  });

  test('T26-05: rejectConcept removes concept without requiring fresh research', () => {
    const ctrl = new ConceptRefineController({
      initialConcepts: [
        { id: 'c1', name: 'Concept 1' },
        { id: 'c2', name: 'Concept 2' }
      ]
    });

    const success = ctrl.rejectConcept('c1');
    assert.ok(success);
    assert.equal(ctrl.concepts.length, 1);
    assert.equal(ctrl.concepts[0].id, 'c2');
  });

  test('T26-06: buildComparisonMatrix summarizes side-by-side concepts accurately', () => {
    const ctrl = new ConceptRefineController({
      initialConcepts: [
        { id: 'c1', name: 'Concept 1', beats: ['1', '2'], sourceTrace: [{}] },
        { id: 'c2', name: 'Concept 2', beats: ['1'], sourceTrace: [{}, {}] }
      ]
    });

    const matrix = ctrl.buildComparisonMatrix();
    assert.equal(matrix.length, 2);
    assert.equal(matrix[0].beatsCount, 2);
    assert.equal(matrix[1].sourceTraceCount, 2);
  });

  test('T26-07: DOD - Manual concept selection: user selects manually with NO auto-select / auto-approve', () => {
    const ctrl = new ConceptRefineController({
      initialConcepts: [
        { id: 'c1', name: 'Concept 1' },
        { id: 'c2', name: 'Concept 2' }
      ]
    });

    // Default must be unselected (no auto-select)
    assert.equal(ctrl.selectedConceptId, null, 'Must not auto-select concept on initialization');

    // User selects concept manually
    let selectedEventPayload = null;
    ctrl.onConceptSelected = (c) => { selectedEventPayload = c; };

    const selected = ctrl.selectConcept('c2');
    assert.equal(ctrl.selectedConceptId, 'c2');
    assert.equal(selected.id, 'c2');
    assert.equal(selectedEventPayload.id, 'c2');

    // Rejecting currently selected concept resets selected state
    ctrl.rejectConcept('c2');
    assert.equal(ctrl.selectedConceptId, null, 'Rejection of selected concept resets selection cleanly');
  });

  test('T26-08: DOD - CSS responsive rules for mobile compare-view horizontal scroll and switcher', () => {
    const css = fs.readFileSync(cssPath, 'utf-8');
    assert.ok(css.includes('@media (max-width: 768px)'), 'Must contain 768px mobile media query');
    assert.ok(css.includes('scroll-snap-type'), 'Must support scroll-snap on mobile');
    assert.ok(css.includes('overflow-x'), 'Must support horizontal scroll on mobile');
    assert.ok(css.includes('.compare-mobile-nav'), 'Must contain mobile switcher navigation styling');
  });

  test('T26-09: A18 Guarantee - refineAngle preserves both original and refined in concepts list', () => {
    const c1 = { id: 'c1', name: 'Concept 1', hook: 'H1', beats: ['B1'], originalContribution: 'POV1' };
    const ctrl = new ConceptRefineController({ initialConcepts: [c1] });

    assert.equal(ctrl.concepts.length, 1);
    const refined = ctrl.refineAngle(c1, 'Focus on early beginners');

    // Both original and refined exist side-by-side
    assert.equal(ctrl.concepts.length, 2, 'Both original and refined concepts must exist side-by-side');
    assert.equal(ctrl.concepts[0].id, 'c1');
    assert.equal(ctrl.concepts[1].id, refined.id);
  });
});
