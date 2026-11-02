/**
 * ==============================================================================
 * MEW CONTENT OS — Remix Resume Unit Tests (Topic T21)
 * Framework: node:test & node:assert/strict
 * ==============================================================================
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { RemixResumeController } from './remix-resume.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-Memory Storage Mock for Node environment
class MockLocalStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.get(key) || null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

describe('Topic T21: Remix Draft Selection — Resume (S06)', () => {
  const htmlPath = path.resolve(__dirname, '../components/resume-banner.html');
  const cssPath = path.resolve(__dirname, '../styles/resume-banner.css');
  const jsPath = path.resolve(__dirname, './remix-resume.js');

  beforeEach(() => {
    global.localStorage = new MockLocalStorage();
  });

  test('T21-01: Target files exist and are non-empty', () => {
    assert.ok(fs.existsSync(htmlPath), 'resume-banner.html must exist');
    assert.ok(fs.existsSync(cssPath), 'resume-banner.css must exist');
    assert.ok(fs.existsSync(jsPath), 'remix-resume.js must exist');

    assert.ok(fs.statSync(htmlPath).size > 100, 'resume-banner.html must not be empty');
    assert.ok(fs.statSync(cssPath).size > 100, 'resume-banner.css must not be empty');
    assert.ok(fs.statSync(jsPath).size > 100, 'remix-resume.js must not be empty');
  });

  test('T21-02: HTML contains resume banner and action buttons', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');

    assert.ok(html.includes('id="banner-resume-selection"'), 'Must contain banner-resume-selection');
    assert.ok(html.includes('id="btn-resume"'), 'Must contain btn-resume');
    assert.ok(html.includes('id="btn-discard-selection"'), 'Must contain btn-discard-selection');
  });

  test('T21-03: Strict Negative Constraint: Absolutely NO fake statistics or percentage badges', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    const js = fs.readFileSync(jsPath, 'utf-8');
    const css = fs.readFileSync(cssPath, 'utf-8');

    const fakeStatPattern = /\b\d+\s*สัปดาห์/;
    assert.ok(!fakeStatPattern.test(html), 'resume-banner.html must not contain fake time stats');
    assert.ok(!fakeStatPattern.test(js), 'remix-resume.js must not contain fake time stats');
    assert.ok(!fakeStatPattern.test(css), 'resume-banner.css must not contain fake time stats');

    assert.ok(!html.includes('ai-score-badge'), 'No arbitrary AI score badges allowed');
    assert.ok(!html.includes('score-percentage'), 'No arbitrary percentage badges allowed');
  });

  test('T21-04: persistSelection and getPersistedSelection retain selection across sessions (A17/D10)', () => {
    const ctrl = new RemixResumeController();

    const sampleSelection = ['ref-c1', 'ref-c2', 'ref-p1'];
    ctrl.persistSelection(sampleSelection);

    assert.equal(ctrl.hasPendingSelection(), true);
    const retrieved = ctrl.getPersistedSelection();
    assert.deepEqual(retrieved, sampleSelection);
  });

  test('T21-05: discardSelection clears persisted items', () => {
    const ctrl = new RemixResumeController();
    ctrl.persistSelection(['item-1', 'item-2']);

    assert.equal(ctrl.hasPendingSelection(), true);
    ctrl.discardSelection();

    assert.equal(ctrl.hasPendingSelection(), false);
    assert.deepEqual(ctrl.getPersistedSelection(), []);
  });

  test('T21-06: resumeSelection triggers onResume callback with items', () => {
    let resumedItems = null;
    const ctrl = new RemixResumeController({
      onResume: (items) => { resumedItems = items; }
    });

    ctrl.persistSelection(['c1', 'p1']);
    ctrl.resumeSelection();

    assert.deepEqual(resumedItems, ['c1', 'p1']);
  });
});
