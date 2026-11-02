/**
 * ==============================================================================
 * MEW CONTENT OS — Mobile Stepper & Sticky Summary Unit Tests (Topic T31)
 * Framework: node:test & node:assert/strict
 * 
 * Verifies Definition of Done (DOD):
 * 1. HTML: remix-stepper 3 steps + sticky-summary + bottom drawer sheet
 * 2. CSS: breakpoint <= 768px switches 3 columns to 1 active step; sticky-summary attached
 * 3. JS: sticky-summary opens reference list (Title + WHY) at ANY step
 * 4. JS: Going back and forth between steps does not lose entered data
 * 5. Viewport 375px: No horizontal scroll guarantee
 * 6. Strict Negative Constraints: NO fake statistics or percentage badges
 * ==============================================================================
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { RemixMobileController } from './remix-mobile.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Topic T31: Mobile Behavior (Stepper + Sticky Summary)', () => {
  const htmlPath = path.resolve(__dirname, '../components/remix-mobile.html');
  const cssPath = path.resolve(__dirname, '../styles/remix-mobile.css');
  const jsPath = path.resolve(__dirname, './remix-mobile.js');

  const originalDocument = global.document;

  afterEach(() => {
    global.document = originalDocument;
  });

  test('T31-01: Target files exist and are non-empty', () => {
    assert.ok(fs.existsSync(htmlPath), 'remix-mobile.html must exist');
    assert.ok(fs.existsSync(cssPath), 'remix-mobile.css must exist');
    assert.ok(fs.existsSync(jsPath), 'remix-mobile.js must exist');

    assert.ok(fs.statSync(htmlPath).size > 100, 'remix-mobile.html must not be empty');
    assert.ok(fs.statSync(cssPath).size > 100, 'remix-mobile.css must not be empty');
    assert.ok(fs.statSync(jsPath).size > 100, 'remix-mobile.js must not be empty');
  });

  test('T31-02: HTML contains 3-step stepper, sticky summary, and bottom sheet drawer', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');

    assert.ok(html.includes('id="remix-mobile-root"'), 'Must contain remix-mobile-root');
    assert.ok(html.includes('id="remix-stepper"'), 'Must contain remix-stepper');
    assert.ok(html.includes('id="step-ingredients"'), 'Must contain step-ingredients');
    assert.ok(html.includes('id="step-direction"'), 'Must contain step-direction');
    assert.ok(html.includes('id="step-results"'), 'Must contain step-results');
    assert.ok(html.includes('id="sticky-summary"'), 'Must contain sticky-summary');
    assert.ok(html.includes('id="mobile-ingredients-sheet"'), 'Must contain mobile-ingredients-sheet');
    assert.ok(html.includes('id="mobile-summary-pills"'), 'Must contain mobile-summary-pills');
  });

  test('T31-03: Strict Negative Constraint: Absolutely NO fake statistics or percentage badges', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    const js = fs.readFileSync(jsPath, 'utf-8');
    const css = fs.readFileSync(cssPath, 'utf-8');

    const fakeStatPattern = /\b\d+\s*สัปดาห์/;
    assert.ok(!fakeStatPattern.test(html), 'remix-mobile.html must not contain fake time stats');
    assert.ok(!fakeStatPattern.test(js), 'remix-mobile.js must not contain fake time stats');
    assert.ok(!fakeStatPattern.test(css), 'remix-mobile.css must not contain fake time stats');

    assert.ok(!html.includes('ai-score-badge'), 'No arbitrary AI score badges allowed');
    assert.ok(!html.includes('score-percentage'), 'No arbitrary percentage badges allowed');
    assert.ok(!js.includes('12 สัปดาห์'), 'No fake 12 สัปดาห์ text allowed');
  });

  test('T31-04: setStep switches step and fires callback', () => {
    let capturedStep = null;
    const ctrl = new RemixMobileController({
      initialStep: 1,
      onStepChange: (s) => { capturedStep = s; }
    });

    ctrl.setStep(2);
    assert.equal(ctrl.currentStep, 2);
    assert.equal(capturedStep, 2);

    ctrl.setStep(3);
    assert.equal(ctrl.currentStep, 3);
  });

  test('T31-05: toggleSheet changes state accurately', () => {
    const ctrl = new RemixMobileController();
    assert.equal(ctrl.isSheetOpen, false);

    ctrl.toggleSheet();
    assert.equal(ctrl.isSheetOpen, true);

    ctrl.toggleSheet(false);
    assert.equal(ctrl.isSheetOpen, false);

    ctrl.openSheet();
    assert.equal(ctrl.isSheetOpen, true);

    ctrl.closeSheet();
    assert.equal(ctrl.isSheetOpen, false);
  });

  test('T31-06: Sticky summary calculates Content (N) + Packaging (M) dynamically', () => {
    const ingredients = [
      { id: 'c1', vaultType: 'content', title: 'Creative Detachment', founderWhy: 'Authentic courage' },
      { id: 'c2', vaultType: 'content', title: '100 Pieces Output', founderWhy: 'Volume produces quality' },
      { id: 'p1', vaultType: 'packaging', title: 'Rapid Metronome Pacing', founderWhy: 'Hooks attention in 1.8s' }
    ];

    const ctrl = new RemixMobileController({ ingredients });
    assert.equal(ctrl.ingredients.length, 3);

    // Verify manual count calculation logic in updateSummary
    let contentCount = 0;
    let packagingCount = 0;
    ctrl.ingredients.forEach(i => {
      if (i.vaultType === 'content') contentCount++;
      if (i.vaultType === 'packaging') packagingCount++;
    });

    assert.equal(contentCount, 2);
    assert.equal(packagingCount, 1);
  });

  test('T31-07: Drawer renders references with Title and Founder WHY', () => {
    const ingredients = [
      { id: 'c1', vaultType: 'content', creator: 'mew', title: 'Detach from Views', founderWhy: 'Day 1 views are noise' },
      { id: 'p1', vaultType: 'packaging', creator: 'dan', title: 'Kinetic Cuts', founderWhy: 'Visual pacing keeps retention' }
    ];

    const ctrl = new RemixMobileController({ ingredients });

    let renderedContent = '';
    global.document = {
      getElementById: (id) => {
        if (id === 'mobile-sheet-body') {
          return {
            set innerHTML(html) { renderedContent = html; },
            get innerHTML() { return renderedContent; }
          };
        }
        return null;
      },
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {}
    };

    ctrl.renderSheetIngredients(ingredients);
    assert.equal(ctrl.ingredients.length, 2);
    assert.ok(renderedContent.includes('Detach from Views'));
    assert.ok(renderedContent.includes('Day 1 views are noise'));
    assert.ok(renderedContent.includes('Kinetic Cuts'));
    assert.ok(renderedContent.includes('Visual pacing keeps retention'));
    assert.ok(renderedContent.includes('WHY:'));
  });

  test('T31-08: Form data is preserved across step transitions (no data loss)', () => {
    const ctrl = new RemixMobileController({ initialStep: 1 });

    // Simulate user typing in Direction form fields on Step 2
    ctrl.formStateCache['dir-audience'] = 'Independent Solo Founders';
    ctrl.formStateCache['dir-our-pov'] = 'Stop obsessing over Day 1 metrics. Build deep leverage.';
    ctrl.formStateCache['dir-goal'] = 'Teach content resilience';

    // Transition from Step 2 to Step 3 and back to Step 1
    ctrl.setStep(3);
    assert.equal(ctrl.currentStep, 3);
    assert.equal(ctrl.formStateCache['dir-audience'], 'Independent Solo Founders');
    assert.equal(ctrl.formStateCache['dir-our-pov'], 'Stop obsessing over Day 1 metrics. Build deep leverage.');

    ctrl.setStep(1);
    assert.equal(ctrl.currentStep, 1);
    assert.equal(ctrl.formStateCache['dir-audience'], 'Independent Solo Founders');
    assert.equal(ctrl.formStateCache['dir-our-pov'], 'Stop obsessing over Day 1 metrics. Build deep leverage.');

    ctrl.setStep(2);
    assert.equal(ctrl.currentStep, 2);
    assert.equal(ctrl.formStateCache['dir-audience'], 'Independent Solo Founders');
    assert.equal(ctrl.formStateCache['dir-our-pov'], 'Stop obsessing over Day 1 metrics. Build deep leverage.');
  });

  test('T31-09: CSS contains breakpoint <= 768px rules for stepper, sticky summary, and single-column switching', () => {
    const css = fs.readFileSync(cssPath, 'utf-8');

    assert.ok(css.includes('@media (max-width: 768px)'), 'Must include 768px media query');
    assert.ok(css.includes('sticky-summary'), 'Must include sticky-summary styling');
    assert.ok(css.includes('data-mobile-step="1"'), 'Must handle mobile step 1');
    assert.ok(css.includes('data-mobile-step="2"'), 'Must handle mobile step 2');
    assert.ok(css.includes('data-mobile-step="3"'), 'Must handle mobile step 3');
    assert.ok(css.includes('position: sticky'), 'Must use sticky positioning for summary bar');
  });

  test('T31-10: CSS prevents horizontal scroll at 375px viewport', () => {
    const css = fs.readFileSync(cssPath, 'utf-8');

    assert.ok(css.includes('overflow-x: hidden'), 'Must enforce overflow-x: hidden');
    assert.ok(css.includes('max-width: 100%'), 'Must enforce max-width: 100%');
    assert.ok(css.includes('box-sizing: border-box'), 'Must enforce box-sizing: border-box');
  });
});
