/**
 * ==============================================================================
 * MEW CONTENT OS — Library Empty States Unit Tests (Topic T17)
 * Framework: node:test & node:assert/strict
 * ==============================================================================
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { LibraryEmptyController, SAMPLE_LIBRARY_REFERENCES } from './library-empty.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Topic T17: Library Empty States (S04)', () => {
  const htmlPath = path.resolve(__dirname, '../components/library-empty.html');
  const cssPath = path.resolve(__dirname, '../styles/library-empty.css');
  const jsPath = path.resolve(__dirname, './library-empty.js');

  test('T17-01: Target files exist and are non-empty', () => {
    assert.ok(fs.existsSync(htmlPath), 'library-empty.html must exist');
    assert.ok(fs.existsSync(cssPath), 'library-empty.css must exist');
    assert.ok(fs.existsSync(jsPath), 'library-empty.js must exist');

    assert.ok(fs.statSync(htmlPath).size > 100, 'library-empty.html must not be empty');
    assert.ok(fs.statSync(cssPath).size > 100, 'library-empty.css must not be empty');
    assert.ok(fs.statSync(jsPath).size > 100, 'library-empty.js must not be empty');
  });

  test('T17-02: HTML contains all specified empty states, exact titles, and action buttons', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');

    assert.ok(html.includes('id="empty-content-vault"'), 'Must contain empty-content-vault');
    assert.ok(html.includes('id="empty-packaging-vault"'), 'Must contain empty-packaging-vault');
    assert.ok(html.includes('id="empty-no-results"'), 'Must contain empty-no-results');

    // Exact title checks
    assert.ok(html.includes('ยังไม่มี Content Reference'), 'Must contain "ยังไม่มี Content Reference"');
    assert.ok(html.includes('ยังไม่มี Packaging Reference'), 'Must contain "ยังไม่มี Packaging Reference"');
    assert.ok(html.includes('ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหา'), 'Must contain no results message');

    // Action buttons
    assert.ok(html.includes('btn-empty-research'), 'Must contain btn-empty-research');
    assert.ok(html.includes('btn-empty-sample'), 'Must contain btn-empty-sample');
    assert.ok(html.includes('btn-clear-filter') || html.includes('btn-clear-empty-filter'), 'Must contain clear filter button');
  });

  test('T17-03: Strict Negative Constraint: Absolutely NO fake statistics or percentage badges', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    const js = fs.readFileSync(jsPath, 'utf-8');
    const css = fs.readFileSync(cssPath, 'utf-8');

    const fakeStatPattern = /\b\d+\s*สัปดาห์/;
    assert.ok(!fakeStatPattern.test(html), 'library-empty.html must not contain fake time stats');
    assert.ok(!fakeStatPattern.test(js), 'library-empty.js must not contain fake time stats');
    assert.ok(!fakeStatPattern.test(css), 'library-empty.css must not contain fake time stats');

    assert.ok(!html.includes('ai-score-badge'), 'No arbitrary AI score badges allowed');
    assert.ok(!html.includes('score-percentage'), 'No arbitrary percentage badges allowed');
  });

  test('T17-04: loadSampleData merges samples safely without wiping existing user records', () => {
    const ctrl = new LibraryEmptyController();

    const existingUserRecord = [
      { id: 'user-custom-1', title: 'My Custom Note', vaultType: 'content' }
    ];

    const result = ctrl.loadSampleData(existingUserRecord);

    // Existing record must still be present
    assert.ok(result.some(r => r.id === 'user-custom-1'), 'Custom user record must be preserved');
    // Sample items must now be present
    assert.ok(result.some(r => r.id === 'sample-content-1'), 'Sample content must be included');
    assert.ok(result.some(r => r.id === 'sample-packaging-1'), 'Sample packaging must be included');

    // Calling again should not duplicate
    const secondCall = ctrl.loadSampleData(result);
    assert.equal(secondCall.length, result.length, 'Duplicate samples must not be added');
  });

  test('T17-05: Sample data conforms to required fields (title, creator, founderWhy, aiInsight)', () => {
    assert.ok(Array.isArray(SAMPLE_LIBRARY_REFERENCES), 'Sample references must be an array');
    assert.ok(SAMPLE_LIBRARY_REFERENCES.length >= 2, 'Must have at least 2 samples');

    for (const sample of SAMPLE_LIBRARY_REFERENCES) {
      assert.ok(sample.id, 'Sample must have an id');
      assert.ok(sample.vaultType, 'Sample must specify vaultType');
      assert.ok(sample.title, 'Sample must have a title');
      assert.ok(sample.founderWhy, 'Sample must have founderWhy');
      assert.ok(sample.aiInsight, 'Sample must have aiInsight');
    }
  });

  test('T17-06: Empty state logic validates when note count of that tab is strictly 0', () => {
    const ctrl = new LibraryEmptyController({ activeVault: 'content' });

    // isVaultEmpty helper
    const emptyNotes = [];
    assert.equal(ctrl.isVaultEmpty(emptyNotes, 'content'), true);

    const notesWithContent = [
      { id: '1', lens: 'content' }
    ];
    assert.equal(ctrl.isVaultEmpty(notesWithContent, 'content'), false);
    assert.equal(ctrl.isVaultEmpty(notesWithContent, 'packaging'), true);
  });

  test('T17-07: Navigation to S01 triggers research handler callback', () => {
    let navigated = false;
    const ctrl = new LibraryEmptyController({
      onNavigateResearch: () => {
        navigated = true;
      }
    });

    ctrl.handleGoResearch();
    assert.equal(navigated, true, 'handleGoResearch must invoke onNavigateResearch');
  });
});
