/**
 * ==============================================================================
 * MEW CONTENT OS — Claims & Rights Checker Unit Tests (Topic T25)
 * Framework: node:test & node:assert/strict
 * ==============================================================================
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  ClaimsRightsController,
  checkClaims,
  removeClaim,
  addSourceToClaim,
  canApproveConcept,
  validateRightsForDraft,
  canSaveDraft
} from './claims-rights.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Topic T25: Claims & Rights Checker', () => {
  const htmlPath = path.resolve(__dirname, '../components/claims-rights.html');
  const cssPath = path.resolve(__dirname, '../styles/claims-rights.css');
  const jsPath = path.resolve(__dirname, './claims-rights.js');

  test('T25-01: Target files exist and are non-empty', () => {
    assert.ok(fs.existsSync(htmlPath), 'claims-rights.html must exist');
    assert.ok(fs.existsSync(cssPath), 'claims-rights.css must exist');
    assert.ok(fs.existsSync(jsPath), 'claims-rights.js must exist');

    assert.ok(fs.statSync(htmlPath).size > 100, 'claims-rights.html must not be empty');
    assert.ok(fs.statSync(cssPath).size > 100, 'claims-rights.css must not be empty');
    assert.ok(fs.statSync(jsPath).size > 100, 'claims-rights.js must not be empty');
  });

  test('T25-02: HTML contains all required elements for claims and rights auditing', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');

    assert.ok(html.includes('id="claims-rights-panel"'), 'Must contain claims-rights-panel');
    assert.ok(html.includes('id="rights-badge"'), 'Must contain rights-badge');
    assert.ok(html.includes('id="flag-copy-risk"'), 'Must contain flag-copy-risk');
    assert.ok(html.includes('id="claims-table"'), 'Must contain claims-table');
    assert.ok(html.includes('id="claims-table-body"'), 'Must contain claims-table-body');
    assert.ok(html.includes('id="transformative-breakdown"'), 'Must contain transformative-breakdown');
  });

  test('T25-03: Strict Negative Constraint: Absolutely NO fake statistics or percentage badges', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    const js = fs.readFileSync(jsPath, 'utf-8');
    const css = fs.readFileSync(cssPath, 'utf-8');

    const fakeStatPattern = /\b\d+\s*สัปดาห์/;
    assert.ok(!fakeStatPattern.test(html), 'claims-rights.html must not contain fake time stats');
    assert.ok(!fakeStatPattern.test(js), 'claims-rights.js must not contain fake time stats');
    assert.ok(!fakeStatPattern.test(css), 'claims-rights.css must not contain fake time stats');

    assert.ok(!html.includes('ai-score-badge'), 'No arbitrary AI score badges allowed');
    assert.ok(!html.includes('score-percentage'), 'No arbitrary percentage badges allowed');
  });

  test('T25-04: auditConceptRights detects transformative status and flags copy risk', () => {
    const ctrl = new ClaimsRightsController();

    const cleanConcept = {
      hook: 'Different perspective on consistency and focus',
      originalContribution: 'Our new philosophy on creative rest'
    };

    const sourceIngredients = [
      { id: '1', title: 'Why you should post daily and ignore haters completely' }
    ];

    const cleanResult = ctrl.auditConceptRights(cleanConcept, sourceIngredients);
    assert.equal(cleanResult.isTransformative, true);
    assert.equal(cleanResult.copyRiskFlag, false);

    // Concept with exact verbatim copy
    const copiedConcept = {
      hook: 'Why you should post daily and ignore haters completely without thinking',
      originalContribution: 'None'
    };

    const copiedResult = ctrl.auditConceptRights(copiedConcept, sourceIngredients);
    assert.equal(copiedResult.copyRiskFlag, true, 'Should flag exact copied phrase');
  });

  test('T25-05: Claims vs Evidence separation categorizes claims objectively', () => {
    const ctrl = new ClaimsRightsController();
    const result = ctrl.auditConceptRights({ originalContribution: 'Unique angle' }, []);

    assert.ok(Array.isArray(result.claims));
    assert.ok(result.claims.length >= 2);
    assert.ok(result.claims.some(c => c.status === 'opinion'));
    assert.ok(result.claims.some(c => c.status === 'verified'));
  });

  test('T25-06: checkClaims(concept) detects unreferenced numbers (e.g. "3 ชั่วโมง/วัน") and sets claim-flag on concept (A14)', () => {
    const conceptWithClaim = {
      id: 'c-test-1',
      title: 'เคล็ดลับเพิ่มผลผลิต',
      hook: 'รู้หรือไม่ว่าถ้าเราอ่านหนังสือ 3 ชั่วโมง/วัน จะเปลี่ยนชีวิตคุณ',
      beats: ['0:00 - 0:03 เปิดประเด็น 3 ชั่วโมง/วัน']
    };

    const result = checkClaims(conceptWithClaim);

    assert.equal(result.hasFlags, true, 'Must detect unverified claim');
    assert.ok(result.claimFlagCount > 0, 'Flag count must be greater than 0');
    assert.equal(conceptWithClaim['claim-flag'], true, 'Concept must have claim-flag set to true');
    assert.equal(conceptWithClaim.hasClaimFlag, true, 'Concept must have hasClaimFlag set to true');
    assert.ok(Array.isArray(conceptWithClaim.claimFlags), 'concept.claimFlags must be an array');
    assert.ok(conceptWithClaim.claimFlags.some(f => f.text.includes('3 ชั่วโมง/วัน')), 'Must identify "3 ชั่วโมง/วัน" specifically');
  });

  test('T25-07: User actions: btn-claim-remove removes unverified claim and btn-claim-add-source resolves flag with evidence', () => {
    // 1. Remove Claim
    const conceptToRemove = {
      id: 'c-test-2',
      hook: 'ทำงาน 3 ชั่วโมง/วัน ได้ผลลัพธ์คุ้มค่า'
    };
    checkClaims(conceptToRemove);
    assert.equal(conceptToRemove['claim-flag'], true);

    const targetFlagId = conceptToRemove.claimFlags[0].id;
    removeClaim(conceptToRemove, targetFlagId);
    assert.equal(conceptToRemove['claim-flag'], false, 'Flag must be cleared after removing claim');
    assert.equal(conceptToRemove.claimFlagCount, 0, 'Flag count must become 0');

    // 2. Add Source
    const conceptToAddSource = {
      id: 'c-test-3',
      hook: 'นอนหลับ 8 ชั่วโมง เพื่อสมองที่เฉียบคม'
    };
    checkClaims(conceptToAddSource);
    assert.equal(conceptToAddSource['claim-flag'], true);

    const flagToResolve = conceptToAddSource.claimFlags[0].id;
    addSourceToClaim(conceptToAddSource, flagToResolve, 'รายงานวิจัยสถาบันการนอนหลับแห่งชาติ 2024');
    assert.equal(conceptToAddSource['claim-flag'], false, 'Flag must be resolved after adding source');
    assert.equal(conceptToAddSource.claimFlagCount, 0);
    assert.ok(conceptToAddSource.claims.some(c => c.evidence === 'รายงานวิจัยสถาบันการนอนหลับแห่งชาติ 2024'), 'Evidence must be stored in claims table');
  });

  test('T25-08: Claim with active flag is BLOCKED from approval (T29 Approve Block / A14)', () => {
    const unverifiedConcept = {
      id: 'c-test-4',
      stage: 'needs-review',
      hook: 'ฝึกเขียนโค้ด 3 ชั่วโมง/วัน เก่งแน่นอน'
    };
    checkClaims(unverifiedConcept);

    // Check via claims-rights canApproveConcept
    const check1 = canApproveConcept(unverifiedConcept);
    assert.equal(check1.allowed, false, 'Must block approval when claim is flagged');
    assert.ok(check1.reason.includes('Claim Flag'), 'Reason must mention Claim Flag blocking');

    // Cleared claim becomes unblocked
    const clearedConcept = {
      id: 'c-test-5',
      stage: 'needs-review',
      hook: 'แนวทางการฝึกฝนทักษะอย่างมีวินัย',
      'claim-flag': false,
      hasClaimFlag: false,
      claimFlagCount: 0
    };
    const check2 = canApproveConcept(clearedConcept);
    assert.equal(check2.allowed, true, 'Clean concept without claim flags must be unblocked');
  });

  test('T25-09: HTML contains rights-panel, opt-reaction-stitch, opt-new-angle-no-footage, and rights-confirm (A13)', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');

    assert.ok(html.includes('id="rights-panel"'), 'HTML must contain rights-panel');
    assert.ok(html.includes('ห้ามใช้เพลง/วิดีโอ/เสียงของคนอื่นโดยไม่มีสิทธิ์'), 'Must state strict rights prohibition notice');
    assert.ok(html.includes('opt-reaction-stitch'), 'Must contain opt-reaction-stitch option');
    assert.ok(html.includes('opt-new-angle-no-footage'), 'Must contain opt-new-angle-no-footage option');
    assert.ok(html.includes('id="rights-confirm"'), 'Must contain rights-confirm input element');
    assert.ok(html.includes('btn-claim-remove'), 'Must contain btn-claim-remove');
    assert.ok(html.includes('btn-claim-add-source'), 'Must contain btn-claim-add-source');
  });

  test('T25-10: Selecting Reaction/Stitch requires rights-confirm before Save Draft is allowed (A13)', () => {
    // 1. Reaction / Stitch without confirmation -> BLOCKED
    const reactionNoConfirm = validateRightsForDraft('opt-reaction-stitch', false);
    assert.equal(reactionNoConfirm.canSave, false, 'Save Draft must be blocked when Reaction/Stitch is not confirmed');
    assert.ok(reactionNoConfirm.reason.includes('rights-confirm'));

    // 2. Reaction / Stitch WITH confirmation -> ALLOWED
    const reactionWithConfirm = validateRightsForDraft('opt-reaction-stitch', true, 'CC-BY-4.0 License');
    assert.equal(reactionWithConfirm.canSave, true, 'Save Draft must be allowed when rights-confirm is checked');

    // 3. New Angle No Footage -> ALLOWED immediately without requiring rights-confirm
    const newAngle = validateRightsForDraft('opt-new-angle-no-footage', false);
    assert.equal(newAngle.canSave, true, 'New angle without footage must allow Save Draft immediately');

    // 4. canSaveDraft helper test
    assert.equal(canSaveDraft({}, { rightsMode: 'reaction-stitch', rightsConfirm: false }).canSave, false);
    assert.equal(canSaveDraft({}, { rightsMode: 'reaction-stitch', rightsConfirm: true }).canSave, true);
    assert.equal(canSaveDraft({}, { rightsMode: 'new-angle-no-footage' }).canSave, true);
  });

  test('T25-11: CSS contains styles for claim-flag, buttons, and rights panel', () => {
    const css = fs.readFileSync(cssPath, 'utf-8');

    assert.ok(css.includes('.claim-flag'), 'CSS must style .claim-flag');
    assert.ok(css.includes('.btn-claim-remove'), 'CSS must style .btn-claim-remove');
    assert.ok(css.includes('.btn-claim-add-source'), 'CSS must style .btn-claim-add-source');
    assert.ok(css.includes('.rights-panel'), 'CSS must style .rights-panel');
    assert.ok(css.includes('.rights-confirm'), 'CSS must style .rights-confirm');
    assert.ok(css.includes('.opt-reaction-stitch'), 'CSS must style .opt-reaction-stitch');
    assert.ok(css.includes('.opt-new-angle-no-footage'), 'CSS must style .opt-new-angle-no-footage');
  });
});
