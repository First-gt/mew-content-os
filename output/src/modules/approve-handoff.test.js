/**
 * ==============================================================================
 * MEW CONTENT OS — Approve Concept & Handoff Gating Unit Tests (Topic T29)
 * Framework: node:test & node:assert/strict
 * ==============================================================================
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ApproveHandoffController, deepFreeze } from './approve-handoff.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Topic T29: Approve Concept & Director Brief Handoff Gating', () => {
  const htmlPath = path.resolve(__dirname, '../components/approve-handoff.html');
  const cssPath = path.resolve(__dirname, '../styles/approve-handoff.css');
  const jsPath = path.resolve(__dirname, './approve-handoff.js');

  test('T29-01: Target files exist and are non-empty', () => {
    assert.ok(fs.existsSync(htmlPath), 'approve-handoff.html must exist');
    assert.ok(fs.existsSync(cssPath), 'approve-handoff.css must exist');
    assert.ok(fs.existsSync(jsPath), 'approve-handoff.js must exist');

    assert.ok(fs.statSync(htmlPath).size > 100, 'approve-handoff.html must not be empty');
    assert.ok(fs.statSync(cssPath).size > 100, 'approve-handoff.css must not be empty');
    assert.ok(fs.statSync(jsPath).size > 100, 'approve-handoff.js must not be empty');
  });

  test('T29-02: HTML contains approve button, gating hint, director brief, and export buttons', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');

    assert.ok(html.includes('id="approve-handoff-root"'), 'Must contain approve-handoff-root');
    assert.ok(html.includes('id="btn-approve-concept"'), 'Must contain btn-approve-concept');
    assert.ok(html.includes('id="hint-approve-blocked"'), 'Must contain hint-approve-blocked');
    assert.ok(html.includes('id="director-brief-section"'), 'Must contain director-brief-section');
    assert.ok(html.includes('id="btn-export-director-brief"'), 'Must contain btn-export-director-brief');
    assert.ok(html.includes('id="btn-send-to-mew-edit"'), 'Must contain btn-send-to-mew-edit');
  });

  test('T29-03: Strict Negative Constraint: Absolutely NO fake statistics or percentage badges', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    const js = fs.readFileSync(jsPath, 'utf-8');
    const css = fs.readFileSync(cssPath, 'utf-8');

    const fakeStatPattern = /\b\d+\s*สัปดาห์/;
    assert.ok(!fakeStatPattern.test(html), 'approve-handoff.html must not contain fake time stats');
    assert.ok(!fakeStatPattern.test(js), 'approve-handoff.js must not contain fake time stats');
    assert.ok(!fakeStatPattern.test(css), 'approve-handoff.css must not contain fake time stats');

    assert.ok(!html.includes('ai-score-badge'), 'No arbitrary AI score badges allowed');
    assert.ok(!html.includes('score-percentage'), 'No arbitrary percentage badges allowed');
  });

  test('T29-04: Button copy is strictly "Approve Concept"', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    assert.ok(html.includes('Approve Concept'), 'Must contain exact copy Approve Concept');
  });

  test('T29-05: canApprove blocks when stage != needs-review or claims/rights unverified', () => {
    const ctrl = new ApproveHandoffController();

    // In Draft -> Blocked
    const draftCard = { stage: 'draft', claimFlagCount: 0, rightsOk: true };
    assert.equal(ctrl.canApprove(draftCard).allowed, false);

    // In Needs Review with Claim Flag -> Blocked
    const flaggedCard = { stage: 'needs-review', claimFlagCount: 1, rightsOk: true };
    assert.equal(ctrl.canApprove(flaggedCard).allowed, false);

    // In Needs Review with copy risk -> Blocked
    const riskyCard = { stage: 'needs-review', claimFlagCount: 0, rightsOk: false };
    assert.equal(ctrl.canApprove(riskyCard).allowed, false);

    // All clean in Needs Review -> Allowed!
    const cleanCard = { stage: 'needs-review', claimFlagCount: 0, rightsOk: true };
    assert.equal(ctrl.canApprove(cleanCard).allowed, true);
  });

  test('T29-06: approveConcept generates deeply immutable revision (Spec A20)', () => {
    const ctrl = new ApproveHandoffController();
    const cleanCard = {
      id: 'c-clean-1',
      title: 'Original Philosophy',
      stage: 'needs-review',
      claimFlagCount: 0,
      rightsOk: true,
      hook: 'Hook',
      beats: ['Beat 1', 'Beat 2']
    };

    const revision = ctrl.approveConcept(cleanCard);

    assert.ok(Object.isFrozen(revision), 'Revision root object must be frozen');
    assert.ok(Object.isFrozen(revision.directorBrief), 'Revision nested directorBrief must be frozen');
    assert.ok(Object.isFrozen(revision.directorBrief.beats), 'Revision nested beats array must be frozen');

    // Attempt to mutate must fail or throw
    assert.throws(() => {
      revision.title = 'Mutated Title';
    }, TypeError);
  });

  test('T29-07: exportDirectorBrief produces valid markdown and json formats', () => {
    const ctrl = new ApproveHandoffController();
    const cleanCard = {
      id: 'c-clean-2',
      title: 'Writing Routine',
      stage: 'needs-review',
      claimFlagCount: 0,
      rightsOk: true,
      hook: 'Stop refreshing views',
      beats: ['Intro', 'Main']
    };

    const revision = ctrl.approveConcept(cleanCard);
    const md = ctrl.exportDirectorBrief(revision, 'markdown');
    const json = ctrl.exportDirectorBrief(revision, 'json');

    assert.ok(md.includes('DIRECTOR BRIEF: Writing Routine'));
    assert.ok(md.includes('Stop refreshing views'));
    assert.ok(JSON.parse(json).revisionNumber);
  });
});
