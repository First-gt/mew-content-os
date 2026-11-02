/**
 * ==============================================================================
 * MEW CONTENT OS — S09 Content Board Unit Tests (Topic T28)
 * Framework: node:test & node:assert/strict
 * ==============================================================================
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ContentBoardController, BOARD_STAGES, normalizeStage } from './content-board.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Topic T28: S09 Content Board — 4 Stages', () => {
  const htmlPath = path.resolve(__dirname, '../components/content-board.html');
  const cssPath = path.resolve(__dirname, '../styles/content-board.css');
  const jsPath = path.resolve(__dirname, './content-board.js');

  test('T28-01: Target files exist and are non-empty', () => {
    assert.ok(fs.existsSync(htmlPath), 'content-board.html must exist');
    assert.ok(fs.existsSync(cssPath), 'content-board.css must exist');
    assert.ok(fs.existsSync(jsPath), 'content-board.js must exist');

    assert.ok(fs.statSync(htmlPath).size > 100, 'content-board.html must not be empty');
    assert.ok(fs.statSync(cssPath).size > 100, 'content-board.css must not be empty');
    assert.ok(fs.statSync(jsPath).size > 100, 'content-board.js must not be empty');
  });

  test('T28-02: HTML contains all 4 stage columns and board card template', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');

    assert.ok(html.includes('id="col-draft"'), 'Must contain col-draft');
    assert.ok(html.includes('id="col-needs-review"'), 'Must contain col-needs-review');
    assert.ok(html.includes('id="col-approved"'), 'Must contain col-approved');
    assert.ok(html.includes('id="col-ready-for-production"'), 'Must contain col-ready-for-production');
    assert.ok(html.includes('id="tmpl-board-card"'), 'Must contain tmpl-board-card');
  });

  test('T28-03: Strict Negative Constraint: Absolutely NO fake statistics or percentage badges', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    const js = fs.readFileSync(jsPath, 'utf-8');
    const css = fs.readFileSync(cssPath, 'utf-8');

    const fakeStatPattern = /\b\d+\s*สัปดาห์/;
    assert.ok(!fakeStatPattern.test(html), 'content-board.html must not contain fake time stats');
    assert.ok(!fakeStatPattern.test(js), 'content-board.js must not contain fake time stats');
    assert.ok(!fakeStatPattern.test(css), 'content-board.css must not contain fake time stats');

    assert.ok(!html.includes('ai-score-badge'), 'No arbitrary AI score badges allowed');
    assert.ok(!html.includes('score-percentage'), 'No arbitrary percentage badges allowed');
    assert.ok(!html.toLowerCase().includes('publish'), 'No publish buttons allowed anywhere');
  });

  test('T28-04: submitForReview transitions card from Draft to Needs Review', () => {
    let captured = null;
    const ctrl = new ContentBoardController({
      initialCards: [{ id: 'card-1', title: 'Test Idea', stage: BOARD_STAGES.DRAFT }],
      onStageChanged: (id, stage) => { captured = { id, stage }; }
    });

    const success = ctrl.submitForReview('card-1');
    assert.ok(success);
    assert.equal(ctrl.cards[0].stage, BOARD_STAGES.NEEDS_REVIEW);
    assert.deepEqual(captured, { id: 'card-1', stage: BOARD_STAGES.NEEDS_REVIEW });
  });

  test('T28-05: returnToDraft transitions card from Needs Review back to Draft', () => {
    const ctrl = new ContentBoardController({
      initialCards: [{ id: 'card-1', title: 'Test Idea', stage: BOARD_STAGES.NEEDS_REVIEW }]
    });

    const success = ctrl.returnToDraft('card-1');
    assert.ok(success);
    assert.equal(ctrl.cards[0].stage, BOARD_STAGES.DRAFT);
  });

  test('T28-06: getCardsByStage groups cards accurately across all 4 stages', () => {
    const ctrl = new ContentBoardController({
      initialCards: [
        { id: '1', stage: BOARD_STAGES.DRAFT },
        { id: '2', stage: BOARD_STAGES.NEEDS_REVIEW },
        { id: '3', stage: BOARD_STAGES.APPROVED },
        { id: '4', stage: BOARD_STAGES.READY_FOR_PRODUCTION }
      ]
    });

    const grouped = ctrl.getCardsByStage();
    assert.equal(grouped[BOARD_STAGES.DRAFT].length, 1);
    assert.equal(grouped[BOARD_STAGES.NEEDS_REVIEW].length, 1);
    assert.equal(grouped[BOARD_STAGES.APPROVED].length, 1);
    assert.equal(grouped[BOARD_STAGES.READY_FOR_PRODUCTION].length, 1);
  });

  test('T28-07: moveToStage strictly BLOCKS direct transition to Approved or Ready for Production without T29 action', () => {
    let blockedReason = '';
    const ctrl = new ContentBoardController({
      initialCards: [{ id: 'card-test', stage: BOARD_STAGES.NEEDS_REVIEW }],
      onActionBlocked: (id, stage, reason) => { blockedReason = reason; }
    });

    // Attempting direct move to Approved without T29 authorization
    const resApproved = ctrl.moveToStage('card-test', BOARD_STAGES.APPROVED);
    assert.equal(resApproved.success, false);
    assert.ok(resApproved.reason.includes('T29'));
    assert.equal(ctrl.cards[0].stage, BOARD_STAGES.NEEDS_REVIEW);

    // Attempting direct move to Ready for Production without T29 authorization
    const resProd = ctrl.moveToStage('card-test', BOARD_STAGES.READY_FOR_PRODUCTION);
    assert.equal(resProd.success, false);
    assert.ok(resProd.reason.includes('T29'));
    assert.equal(ctrl.cards[0].stage, BOARD_STAGES.NEEDS_REVIEW);
  });

  test('T28-08: moveToStage permits Approved or Ready for Production ONLY when authorizedByT29', () => {
    const ctrl = new ContentBoardController({
      initialCards: [{ id: 'card-auth', stage: BOARD_STAGES.NEEDS_REVIEW }]
    });

    const res = ctrl.moveToStage('card-auth', BOARD_STAGES.APPROVED, { authorizedByT29: true });
    assert.equal(res.success, true);
    assert.equal(ctrl.cards[0].stage, BOARD_STAGES.APPROVED);
  });

  test('T28-09: HTML template includes concept title, source trace, claim-flag, and stage pill', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');

    assert.ok(html.includes('class="card-title"'), 'Template must have card-title');
    assert.ok(html.includes('class="card-source-trace"'), 'Template must have card-source-trace');
    assert.ok(html.includes('class="claim-flag'), 'Template must have claim-flag');
    assert.ok(html.includes('class="card-stage-pill'), 'Template must have card-stage-pill');
    assert.ok(html.includes('btn-submit-review'), 'Template must have btn-submit-review');
    assert.ok(html.includes('btn-back-to-draft'), 'Template must have btn-back-to-draft');
  });

  test('T28-10: CSS separates stages by color, counts headers, and defines mew-offer-card style', () => {
    const css = fs.readFileSync(cssPath, 'utf-8');

    assert.ok(css.includes('.col-indicator-bar.neutral'), 'Must style neutral indicator');
    assert.ok(css.includes('.col-indicator-bar.amber'), 'Must style amber indicator');
    assert.ok(css.includes('.col-indicator-bar.coral'), 'Must style coral indicator');
    assert.ok(css.includes('.col-indicator-bar.violet'), 'Must style violet indicator');
    assert.ok(css.includes('.col-count'), 'Must style column count badge');
    assert.ok(css.includes('.mew-offer-card'), 'Must style mew-offer-card');
    assert.ok(!css.toLowerCase().includes('publish'), 'CSS must not have any publish buttons');
  });

  test('T28-11: normalizeStage handles case variations and hyphens reliably', () => {
    assert.equal(normalizeStage('Draft'), BOARD_STAGES.DRAFT);
    assert.equal(normalizeStage('needs-review'), BOARD_STAGES.NEEDS_REVIEW);
    assert.equal(normalizeStage('Needs Review'), BOARD_STAGES.NEEDS_REVIEW);
    assert.equal(normalizeStage('Approved'), BOARD_STAGES.APPROVED);
    assert.equal(normalizeStage('Ready for Production'), BOARD_STAGES.READY_FOR_PRODUCTION);
    assert.equal(normalizeStage('ready-for-production'), BOARD_STAGES.READY_FOR_PRODUCTION);
  });
});
