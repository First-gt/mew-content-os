/**
 * ==============================================================================
 * MEW CONTENT OS — S07 Remix Workspace Direction Unit Tests (Topic T23)
 * Framework: node:test & node:assert/strict
 * ==============================================================================
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { 
  WorkspaceDirectionController,
  remixSession,
  getRemixSession,
  setRemixSession,
  DEFAULT_BRAND_BRAIN
} from './ws-direction.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Topic T23: S07 Remix Workspace — Direction Panel', () => {
  const htmlPath = path.resolve(__dirname, '../components/ws-direction.html');
  const cssPath = path.resolve(__dirname, '../styles/ws-direction.css');
  const jsPath = path.resolve(__dirname, './ws-direction.js');

  test('T23-01: Target files exist and are non-empty', () => {
    assert.ok(fs.existsSync(htmlPath), 'ws-direction.html must exist');
    assert.ok(fs.existsSync(cssPath), 'ws-direction.css must exist');
    assert.ok(fs.existsSync(jsPath), 'ws-direction.js must exist');

    assert.ok(fs.statSync(htmlPath).size > 100, 'ws-direction.html must not be empty');
    assert.ok(fs.statSync(cssPath).size > 100, 'ws-direction.css must not be empty');
    assert.ok(fs.statSync(jsPath).size > 100, 'ws-direction.js must not be empty');
  });

  test('T23-02: HTML contains all specified form fields, brand brain, and gating button', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');

    // Direction inputs
    assert.ok(html.includes('id="dir-audience"'), 'Must contain dir-audience');
    assert.ok(html.includes('id="dir-goal"'), 'Must contain dir-goal');
    assert.ok(html.includes('id="dir-our-pov"'), 'Must contain dir-our-pov');
    assert.ok(html.includes('id="dir-tone"'), 'Must contain dir-tone');
    assert.ok(html.includes('id="dir-cta"'), 'Must contain dir-cta');
    assert.ok(html.includes('id="dir-constraints"'), 'Must contain dir-constraints');
    assert.ok(html.includes('id="dir-rights"'), 'Must contain dir-rights');

    // Brand Brain & Button
    assert.ok(html.includes('id="brand-brain"'), 'Must contain brand-brain');
    assert.ok(html.includes('id="btn-generate-concepts"'), 'Must contain btn-generate-concepts');
    assert.ok(html.includes('id="hint-need-direction"'), 'Must contain hint-need-direction');
  });

  test('T23-03: Strict Negative Constraint: Absolutely NO fake statistics or percentage badges', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    const js = fs.readFileSync(jsPath, 'utf-8');
    const css = fs.readFileSync(cssPath, 'utf-8');

    const fakeStatPattern = /\b\d+\s*สัปดาห์/;
    assert.ok(!fakeStatPattern.test(html), 'ws-direction.html must not contain fake time stats');
    assert.ok(!fakeStatPattern.test(js), 'ws-direction.js must not contain fake time stats');
    assert.ok(!fakeStatPattern.test(css), 'ws-direction.css must not contain fake time stats');

    assert.ok(!html.includes('ai-score-badge'), 'No arbitrary AI score badges allowed');
    assert.ok(!html.includes('score-percentage'), 'No arbitrary percentage badges allowed');
  });

  test('T23-04: Button copy is strictly "Create Original Concepts"', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    assert.ok(
      html.includes('Create Original Concepts'),
      'Button label must be strictly Create Original Concepts'
    );
  });

  test('T23-05: Gating requires both audience and ourPov to be non-empty', () => {
    const ctrl = new WorkspaceDirectionController();

    // Reset fields
    ctrl.setField('audience', '');
    ctrl.setField('ourPov', '');

    // Empty state -> False
    assert.equal(ctrl.canGenerate(), false);

    // Only audience -> False
    ctrl.setField('audience', 'Solo Founders');
    assert.equal(ctrl.canGenerate(), false);

    // Only ourPov -> False
    ctrl.setField('audience', '');
    ctrl.setField('ourPov', 'Focus on 100 quality pieces');
    assert.equal(ctrl.canGenerate(), false);

    // Both audience and ourPov -> True!
    ctrl.setField('audience', 'Solo Founders');
    assert.equal(ctrl.canGenerate(), true);
  });

  test('T23-06: All values persist in remixSession.direction across switches and reinstantiation', () => {
    const ctrl1 = new WorkspaceDirectionController();
    ctrl1.setField('audience', 'Creator Economy Builders');
    ctrl1.setField('goal', 'Shift mindset from vanity metrics to assets');
    ctrl1.setField('ourPov', 'Real creator leverage is built through 100 durable essays');
    ctrl1.setField('tone', 'direct-punchy');
    ctrl1.setField('cta', 'Share your perspective below');
    ctrl1.setField('constraints', 'No hype, no fabricated numbers');
    ctrl1.setField('rights', 'Structure inspiration only');

    // Verify remixSession.direction was updated
    const session = getRemixSession();
    assert.equal(session.direction.audience, 'Creator Economy Builders');
    assert.equal(session.direction.ourPov, 'Real creator leverage is built through 100 durable essays');
    assert.equal(session.direction.tone, 'direct-punchy');
    assert.equal(session.direction.cta, 'Share your perspective below');

    // Simulate returning to the workspace (re-instantiating controller)
    const ctrl2 = new WorkspaceDirectionController();
    assert.equal(ctrl2.direction.audience, 'Creator Economy Builders');
    assert.equal(ctrl2.direction.ourPov, 'Real creator leverage is built through 100 durable essays');
    assert.equal(ctrl2.direction.tone, 'direct-punchy');
    assert.equal(ctrl2.canGenerate(), true);
  });

  test('T23-07: Strict Rule: dir-our-pov cannot be auto-filled by AI', () => {
    const ctrl = new WorkspaceDirectionController();
    ctrl.setField('ourPov', 'Authentic founder conviction');

    // Attempting to auto-fill ourPov via AI suggestion must be rejected
    const applied = ctrl.applyAISuggestion('ourPov', 'AI Generated generic text');
    assert.equal(applied, false, 'AI suggestion must be rejected for ourPov');
    assert.equal(ctrl.direction.ourPov, 'Authentic founder conviction', 'Our POV must remain untouched by AI');

    // Other non-POV fields may accept AI assist
    const appliedTone = ctrl.applyAISuggestion('tone', 'analytical');
    assert.equal(appliedTone, true);
    assert.equal(ctrl.direction.tone, 'analytical');
  });

  test('T23-08: Gating reason clearly explains what is missing', () => {
    const ctrl = new WorkspaceDirectionController();
    ctrl.setField('audience', '');
    ctrl.setField('ourPov', '');

    const reasonBoth = ctrl.getGatingReason();
    assert.ok(reasonBoth.includes('Audience') && reasonBoth.includes('POV'));

    ctrl.setField('audience', 'Solo Founders');
    const reasonPov = ctrl.getGatingReason();
    assert.ok(reasonPov.includes('POV'));

    ctrl.setField('audience', '');
    ctrl.setField('ourPov', 'Unique founder thesis');
    const reasonAud = ctrl.getGatingReason();
    assert.ok(reasonAud.includes('Audience'));

    ctrl.setField('audience', 'Solo Founders');
    const reasonReady = ctrl.getGatingReason();
    assert.ok(reasonReady.includes('พร้อม'));
  });

  test('T23-09: Brand Brain provides Offer, Voice DNA, and Proof', () => {
    const ctrl = new WorkspaceDirectionController();
    assert.ok(ctrl.brandBrain.offer, 'Brand Brain must have Offer');
    assert.ok(ctrl.brandBrain.voiceDna, 'Brand Brain must have Voice DNA');
    assert.ok(ctrl.brandBrain.proof, 'Brand Brain must have Proof');

    const html = fs.readFileSync(htmlPath, 'utf-8');
    assert.ok(html.includes('Offer'), 'HTML must display Offer label');
    assert.ok(html.includes('Voice DNA'), 'HTML must display Voice DNA label');
    assert.ok(html.includes('Proof'), 'HTML must display Proof label');
  });

  test('T23-10: CSS contains .mew-offer-card styling, required markers, and responsive rules', () => {
    const css = fs.readFileSync(cssPath, 'utf-8');
    assert.ok(css.includes('.mew-offer-card'), 'CSS must include .mew-offer-card');
    assert.ok(css.includes('.req-star'), 'CSS must style .req-star');
    assert.ok(css.includes('--coral-accent'), 'CSS must use coral accent variable');
    assert.ok(css.includes('@media (prefers-reduced-motion: reduce)'), 'CSS must support reduced motion');
  });
});
