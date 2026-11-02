/**
 * ==============================================================================
 * MEW CONTENT OS — UX Copy Dictionary Unit Tests (Topic T32)
 * Framework: node:test & node:assert/strict
 * ==============================================================================
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { COPY, getCopy } from './copy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Topic T32: UX Copy Dictionary + Forbidden-Term Lint', () => {
  const copyJsPath = path.resolve(__dirname, './copy.js');
  const lintJsPath = path.resolve(__dirname, '../../scripts/lint-copy.js');
  const guideMdPath = path.resolve(__dirname, '../../docs/copy-guide.md');

  test('T32-01: Target files exist and are non-empty', () => {
    assert.ok(fs.existsSync(copyJsPath), 'copy.js must exist');
    assert.ok(fs.existsSync(lintJsPath), 'lint-copy.js must exist');
    assert.ok(fs.existsSync(guideMdPath), 'copy-guide.md must exist');

    assert.ok(fs.statSync(copyJsPath).size > 100, 'copy.js must not be empty');
    assert.ok(fs.statSync(lintJsPath).size > 100, 'lint-copy.js must not be empty');
    assert.ok(fs.statSync(guideMdPath).size > 100, 'copy-guide.md must not be empty');
  });

  test('T32-02: copy.js exports all approved copy strings according to spec rule 7', () => {
    // S00 Overview / Dashboard
    assert.equal(COPY.RESEARCH_A_CLIP.en, 'Research a Clip');
    assert.equal(COPY.OPEN_LIBRARY.en, 'Open My Library');
    assert.equal(COPY.START_REMIX.en, 'Start Remix');
    assert.equal(COPY.CONTINUE_WORK.en, 'Continue work');

    // S01 & S02
    assert.equal(COPY.ANALYZE_CLIP.en, 'Analyze Clip');
    assert.equal(COPY.ANALYZE_CLIP.th, 'วิเคราะห์คลิป');
    assert.equal(COPY.ANALYZED_NOT_SAVED.en, 'Analyzed · Not saved');
    assert.equal(COPY.ANALYZED_NOT_SAVED.th, 'วิเคราะห์แล้ว · ยังไม่ได้เก็บ');

    // S03 Save Modal
    assert.equal(COPY.SAVE_TO_LIBRARY.en, 'Save to Library');
    assert.equal(COPY.SAVE_TO_LIBRARY.th, 'บันทึกเข้าคลัง');
    assert.equal(COPY.LENSES.CONTENT, 'Content (WHAT)');
    assert.equal(COPY.LENSES.PACKAGING, 'Packaging (HOW)');
    assert.equal(COPY.LENSES.BOTH, 'Both');
    assert.equal(COPY.WHY_PROMPT.th, 'ทำไมคุณอยากเก็บสิ่งนี้?');

    // S04 & S06
    assert.equal(COPY.USE_IN_REMIX.en, 'Use in Remix');
    assert.equal(COPY.USE_IN_REMIX.th, 'นำไปรีมิกซ์');

    // S07 Remix Workspace
    assert.equal(COPY.CREATE_ORIGINAL_CONCEPTS.en, 'Create Original Concepts');
    assert.equal(COPY.SAVE_REMIX_DRAFT.en, 'Save Remix Draft');

    // S09 Content Board
    assert.equal(COPY.APPROVE_CONCEPT.en, 'Approve Concept');
  });

  test('T32-03: getCopy helper retrieves accurate localization', () => {
    assert.equal(getCopy('ANALYZE_CLIP', 'en'), 'Analyze Clip');
    assert.equal(getCopy('ANALYZE_CLIP', 'th'), 'วิเคราะห์คลิป');
  });

  test('T32-04: copy-guide.md documents forbidden terms and rationale', () => {
    const guide = fs.readFileSync(guideMdPath, 'utf-8');
    assert.ok(guide.includes('Clone Clip'));
    assert.ok(guide.includes('AI Auto Save'));
    assert.ok(guide.includes('Publish Now'));
    assert.ok(guide.includes('Stitch Source Videos'));
  });
});
