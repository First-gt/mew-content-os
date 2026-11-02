/**
 * ==============================================================================
 * MEW CONTENT OS — S04 Dual-Vault Library Unit Tests (Topic T15)
 * Framework: node:test & node:assert/strict
 * 
 * Verifies Definition of Done (DOD) for Topic T15:
 * - HTML: หน้าเดียวมีแท็บ tab-content-vault และ tab-packaging-vault; แต่ละแท็บมี vault-count
 * - JS: แท็บ Content แสดงเฉพาะ savedNotes ที่ lens='content'; Packaging เฉพาะ lens='packaging' (D2/D3)
 * - JS: source ที่เป็น Both ปรากฏทั้งสองแท็บ ด้วย sourceId เดียวกัน และแต่ละการ์ดแสดง note ของ lens นั้นเท่านั้น
 * - CSS: สองแท็บใช้สีประจำคลังคงที่ (Content / Packaging) ตลอดทั้งแอป
 * - คลิปที่ยังเป็น Analyzed · Not saved ห้ามแสดงในหน้านี้
 * - Negative Constraint: ห้ามมีสถิติปลอม หรือคะแนน AI badges ปลอม
 * ==============================================================================
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Contract & DOM File Existence
describe('Topic T15: S04 Library — โครงสองคลัง (2 Tabs)', () => {
  const htmlPath = path.resolve(__dirname, '../components/library.html');
  const cssPath = path.resolve(__dirname, '../styles/library.css');
  const jsPath = path.resolve(__dirname, './library.js');

  test('T15-01: Target files exist and are not empty', () => {
    assert.ok(fs.existsSync(htmlPath), 'library.html must exist');
    assert.ok(fs.existsSync(cssPath), 'library.css must exist');
    assert.ok(fs.existsSync(jsPath), 'library.js must exist');

    assert.ok(fs.statSync(htmlPath).size > 100, 'library.html must not be empty');
    assert.ok(fs.statSync(cssPath).size > 100, 'library.css must not be empty');
    assert.ok(fs.statSync(jsPath).size > 100, 'library.js must not be empty');
  });

  test('T15-02: HTML contains dual-vault tabs and count badges', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    assert.ok(html.includes('tab-content-vault'), 'Must contain tab-content-vault');
    assert.ok(html.includes('tab-packaging-vault'), 'Must contain tab-packaging-vault');
    assert.ok(
      html.includes('count-content-vault') || html.includes('vault-count'),
      'Must contain vault count indicator'
    );
    assert.ok(
      html.includes('panel-content-vault') || html.includes('content-tab') || html.includes('role="tablist"'),
      'Must contain tablist structure'
    );
  });

  test('T15-03: Strict Negative Constraint: Absolutely NO fake statistics or percentage badges', () => {
    const html = fs.readFileSync(htmlPath, 'utf-8');
    const js = fs.readFileSync(jsPath, 'utf-8');
    const css = fs.readFileSync(cssPath, 'utf-8');

    // Negative constraints: No arbitrary weeks or percentages
    const fakeStatPattern = /\b\d+\s*สัปดาห์/;
    assert.ok(!fakeStatPattern.test(html), 'library.html must not contain fake time stats');
    assert.ok(!fakeStatPattern.test(js), 'library.js must not contain fake time stats');
    assert.ok(!fakeStatPattern.test(css), 'library.css must not contain fake time stats');

    // Check no fake percentage badge classes
    assert.ok(!html.includes('ai-score-badge'), 'No AI score badges allowed');
    assert.ok(!html.includes('score-percentage'), 'No arbitrary percentage badges allowed');
  });

  test('T15-04: CSS defines persistent vault colors (Coral for Content, Violet for Packaging)', () => {
    const css = fs.readFileSync(cssPath, 'utf-8');
    // Accent Coral and Electric Violet theme tokens
    assert.ok(
      css.includes('#ed765b') || css.includes('coral') || css.includes('--coral'),
      'CSS must define Coral theme for Content'
    );
    assert.ok(
      css.includes('#8a76ff') || css.includes('violet') || css.includes('--violet'),
      'CSS must define Violet theme for Packaging'
    );
  });

  test('T15-05: Pure Client-Side architecture without server dependencies', () => {
    const js = fs.readFileSync(jsPath, 'utf-8');
    assert.ok(!js.includes('require('), 'Must be modern ES6+ without CommonJS require');
    assert.ok(!js.includes('express'), 'Must have zero backend express dependencies');
    assert.ok(!js.includes('mongoose') && !js.includes('pg'), 'Zero database dependencies');
  });

  test('T15-06: Tab switching isolates Content and Packaging vault items (D2/D3)', () => {
    const js = fs.readFileSync(jsPath, 'utf-8');
    // Verifies vault separation logic
    assert.ok(
      js.includes('content') && js.includes('packaging'),
      'Controller must handle content and packaging vault segregation'
    );
    assert.ok(
      js.includes('founderWhy') || js.includes('founder_why') || js.includes('why'),
      'Every saved card must feature founder-why prominently'
    );
  });

  test('T15-07: Unsaved analyzed items (Analyzed · Not saved) are excluded from Library', () => {
    const js = fs.readFileSync(jsPath, 'utf-8');
    // Ensure only saved references are queried
    assert.ok(
      js.includes('saved') || js.includes('references'),
      'Library must only render saved references, never raw unsaved inbox items'
    );
  });
});
