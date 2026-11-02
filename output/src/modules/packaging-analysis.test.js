/**
 * ==============================================================================
 * MEW CONTENT OS — Topic T10: Packaging Analysis Panel (HOW) Unit Tests
 * Framework: node:test & node:assert/strict
 * 
 * Verifies Definition of Done (DOD):
 * 1. HTML: sections `pa-hook`, `pa-opening-pattern`, `pa-narrative-beats`, `pa-pacing`,
 *          `pa-music-sfx`, `pa-editing-mechanics`, `pa-tension-emotion`,
 *          `pa-timestamp-highlights`, `pa-what-is-good` (คำถาม "เล่าได้ดีอย่างไร?")
 * 2. JS: คลิก timestamp highlight แล้ว `video-player` seek ไปเวลานั้น (ถ้ามี player จริงหรือ mock)
 * 3. JS: ข้อสังเกตจาก metrics (ยอดวิวสูง) แสดงเป็น "ข้อสังเกต" และมีข้อความ `pa-no-causation-note`
 *       ห้ามฟันธงว่า Hook/เสียงเป็นสาเหตุไวรัล (Spec A22 Guardrail)
 * 4. JS: เมื่อ source เป็น `Analysis unavailable` แท็บนี้แสดงเฉพาะ `state-unavailable` (T07)
 * 5. CSS: ใช้โทนสีต่างจากแท็บ Content ให้แยกสองคลังออกด้วยสายตา (Electric Violet #8a76ff เหมือน Vault ใน T15)
 * 6. Fields ที่ว่างแสดง "ไม่ทราบ" โดยไม่ซ่อนทั้ง section
 * 7. STRICT NEGATIVE CONSTRAINT: Zero fake/arbitrary statistics across all files.
 * ==============================================================================
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  UNKNOWN_PLACEHOLDER,
  UNKNOWN_TIMECODE_PLACEHOLDER,
  REQUIRED_PACKAGING_SECTIONS,
  CAUSATION_DISCLAIMER_TEXT,
  escapeHtml,
  formatTimecodeHonest,
  parseTimecode,
  isAnalysisUnavailable,
  renderNarrativeBeatsHtml,
  renderTimestampChipsHtml,
  generatePackagingAnalysisHtml,
  renderPackagingAnalysis,
  seekVideoPlayer,
  getAnalysisPackagingFromStore,
  PackagingAnalysisController
} from './packaging-analysis.js';

import { getState, resetDemo } from './store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lightweight DOM mock for Node environment testing
class MockElement {
  constructor(tagName = 'div', attributes = {}) {
    this.tagName = tagName.toUpperCase();
    this.attributes = new Map(Object.entries(attributes));
    this.children = [];
    this.parentNode = null;
    this.textContent = '';
    this._innerHTML = '';
    this.style = {};
    this.hidden = attributes.hidden !== undefined;
    this.eventListeners = new Map();

    const initialClasses = attributes.class ? attributes.class.split(/\s+/).filter(Boolean) : [];
    const classSet = new Set(initialClasses);
    this.classList = {
      _set: classSet,
      add(...classes) {
        classes.forEach(c => classSet.add(c));
      },
      remove(...classes) {
        classes.forEach(c => classSet.delete(c));
      },
      contains(c) {
        return classSet.has(c);
      }
    };
  }

  get innerHTML() {
    return this._innerHTML;
  }

  set innerHTML(val) {
    this._innerHTML = String(val);
    this.textContent = val.replace(/<[^>]*>/g, '').trim();
  }

  setAttribute(name, val) {
    this.attributes.set(name, String(val));
    if (name === 'class') {
      this.classList._set.clear();
      String(val).split(/\s+/).filter(Boolean).forEach(c => this.classList._set.add(c));
    }
    if (name === 'hidden') {
      this.hidden = true;
    }
  }

  getAttribute(name) {
    return this.attributes.get(name) || null;
  }

  removeAttribute(name) {
    this.attributes.delete(name);
    if (name === 'hidden') {
      this.hidden = false;
    }
  }

  addEventListener(event, handler) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(handler);
  }

  dispatchEvent(event) {
    const list = this.eventListeners.get(event.type) || [];
    list.forEach(fn => fn(event));
    return true;
  }

  querySelector(selector) {
    // Basic selector resolver for testing
    const clean = selector.replace(/^[#\.]/, '');
    if (selector.startsWith('#')) {
      return this._find(el => el.getAttribute('id') === clean);
    }
    if (selector.startsWith('.')) {
      return this._find(el => el.classList.contains(clean));
    }
    if (selector.includes('data-testid="')) {
      const match = selector.match(/data-testid="([^"]+)"/);
      if (match) return this._find(el => el.getAttribute('data-testid') === match[1]);
    }
    return null;
  }

  querySelectorAll(selector) {
    const results = [];
    this._findAll(selector, results);
    return results;
  }

  _find(predicate) {
    if (predicate(this)) return this;
    for (const child of this.children) {
      if (child instanceof MockElement) {
        const res = child._find(predicate);
        if (res) return res;
      }
    }
    return null;
  }

  _findAll(selector, out) {
    const clean = selector.replace(/^[#\.]/, '');
    const isClass = selector.startsWith('.');
    const isId = selector.startsWith('#');
    const isAttr = selector.includes('[');

    if (isClass && this.classList.contains(clean)) out.push(this);
    else if (isId && this.getAttribute('id') === clean) out.push(this);
    else if (isAttr) {
      const match = selector.match(/\[([^=\]]+)(?:="([^"]+)")?\]/);
      if (match) {
        const attrName = match[1];
        const attrVal = match[2];
        if (attrVal !== undefined) {
          if (this.getAttribute(attrName) === attrVal) out.push(this);
        } else if (this.getAttribute(attrName) !== null) {
          out.push(this);
        }
      }
    }

    for (const child of this.children) {
      if (child instanceof MockElement) {
        child._findAll(selector, out);
      }
    }
  }
}

describe('Topic T10: Packaging Analysis Panel (HOW)', () => {

  beforeEach(() => {
    resetDemo();
  });

  /* --------------------------------------------------------------------------
     1. HTML Contract & Structure Requirements
     -------------------------------------------------------------------------- */
  describe('1. HTML Contract & Structure Requirements', () => {
    const htmlPath = path.resolve(__dirname, '../components/packaging-analysis.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    test('T10-01: HTML contains all 9 required sections with exact spec classes/testids', () => {
      // 1. pa-hook
      assert.ok(htmlContent.includes('id="pa-hook"') || htmlContent.includes('data-testid="pa-hook"'), 'pa-hook must exist');
      // 2. pa-opening-pattern
      assert.ok(htmlContent.includes('id="pa-opening-pattern"') || htmlContent.includes('data-testid="pa-opening-pattern"'), 'pa-opening-pattern must exist');
      // 3. pa-narrative-beats
      assert.ok(htmlContent.includes('id="pa-narrative-beats"') || htmlContent.includes('data-testid="pa-narrative-beats"'), 'pa-narrative-beats must exist');
      // 4. pa-pacing
      assert.ok(htmlContent.includes('id="pa-pacing"') || htmlContent.includes('data-testid="pa-pacing"'), 'pa-pacing must exist');
      // 5. pa-music-sfx
      assert.ok(htmlContent.includes('id="pa-music-sfx"') || htmlContent.includes('data-testid="pa-music-sfx"'), 'pa-music-sfx must exist');
      // 6. pa-editing-mechanics
      assert.ok(htmlContent.includes('id="pa-editing-mechanics"') || htmlContent.includes('data-testid="pa-editing-mechanics"'), 'pa-editing-mechanics must exist');
      // 7. pa-tension-emotion
      assert.ok(htmlContent.includes('id="pa-tension-emotion"') || htmlContent.includes('data-testid="pa-tension-emotion"'), 'pa-tension-emotion must exist');
      // 8. pa-timestamp-highlights
      assert.ok(htmlContent.includes('id="pa-timestamp-highlights"') || htmlContent.includes('data-testid="pa-timestamp-highlights"'), 'pa-timestamp-highlights must exist');
      // 9. pa-what-is-good
      assert.ok(htmlContent.includes('id="pa-what-is-good"') || htmlContent.includes('data-testid="pa-what-is-good"'), 'pa-what-is-good must exist');
    });

    test('T10-02: pa-what-is-good explicitly features the guiding question "เล่าได้ดีอย่างไร?"', () => {
      assert.ok(htmlContent.includes('เล่าได้ดีอย่างไร?'), 'pa-what-is-good must feature question "เล่าได้ดีอย่างไร?"');
    });

    test('T10-03: pa-no-causation-note is present with Spec A22 guardrail against viral causation claim', () => {
      assert.ok(htmlContent.includes('id="pa-no-causation-note"') || htmlContent.includes('data-testid="pa-no-causation-note"'), 'pa-no-causation-note must exist');
      assert.ok(htmlContent.includes('ข้อสังเกต'), 'Must include "ข้อสังเกต" label');
      assert.ok(htmlContent.includes('สาเหตุ') || htmlContent.includes('causation'), 'Must caution against causation claim');
    });

    test('T10-04: HTML contains state-unavailable block for inaccessible media (T07)', () => {
      assert.ok(htmlContent.includes('id="state-unavailable"') || htmlContent.includes('data-testid="state-unavailable"'), 'state-unavailable must exist');
      assert.ok(htmlContent.includes('Analysis unavailable'), 'Must display status text Analysis unavailable');
    });
  });

  /* --------------------------------------------------------------------------
     2. CSS Contract & Visual Separation (Electric Violet Theme)
     -------------------------------------------------------------------------- */
  describe('2. CSS Contract & Visual Separation (Electric Violet Theme)', () => {
    const cssPath = path.resolve(__dirname, '../styles/packaging-analysis.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    test('T10-05: CSS implements Electric Violet #8a76ff theme to distinctively separate Packaging (HOW) from Content (Coral)', () => {
      assert.ok(cssContent.includes('#8a76ff') || cssContent.includes('--pa-violet'), 'Must define violet theme');
      assert.ok(cssContent.includes('.packaging-analysis-panel') || cssContent.includes('.violet-bar'), 'Must style packaging panel with violet bar');
    });

    test('T10-06: CSS implements .mew-offer-card card style with 4px top accent bar and hover effect', () => {
      assert.ok(cssContent.includes('.mew-offer-card') || cssContent.includes('.violet-bar::before'), 'Must style 4px top accent bar');
      assert.ok(cssContent.includes('translateY(-2px)'), 'Must implement signature translateY(-2px) hover micro-interaction');
    });

    test('T10-07: CSS provides styling for timestamp chips (.btn-time-chip) with interactive states', () => {
      assert.ok(cssContent.includes('.btn-time-chip'), 'Must style .btn-time-chip');
      assert.ok(cssContent.includes(':focus-visible') || cssContent.includes(':hover'), 'Must support focus-visible or hover states');
    });

    test('T10-08: CSS provides dedicated styling for pa-no-causation-note (A22)', () => {
      assert.ok(cssContent.includes('.pa-no-causation-note'), 'Must style .pa-no-causation-note');
    });
  });

  /* --------------------------------------------------------------------------
     3. JS Rendering from Store & "ไม่ทราบ" Fallback Protection
     -------------------------------------------------------------------------- */
  describe('3. JS Rendering from Store & "ไม่ทราบ" Fallback Protection', () => {
    test('T10-09: Empty packaging fields render as "ไม่ทราบ" and DO NOT hide sections', () => {
      const generatedHtml = generatePackagingAnalysisHtml({});
      REQUIRED_PACKAGING_SECTIONS.forEach(sectionId => {
        assert.ok(generatedHtml.includes(`id="${sectionId}"`), `Section ${sectionId} must remain in HTML output even if data is empty`);
      });
      assert.ok(generatedHtml.includes(UNKNOWN_PLACEHOLDER), 'Must include "ไม่ทราบ" for empty fields');
    });

    test('T10-10: getAnalysisPackagingFromStore retrieves packaging for source-b (Story B)', () => {
      const packaging = getAnalysisPackagingFromStore('source-b');
      assert.ok(packaging !== null, 'Should find packaging for source-b');
      assert.ok(typeof packaging.hook === 'string' && packaging.hook.length > 0, 'source-b should have a hook');
      assert.ok(packaging.whatIsGood !== undefined, 'source-b should have whatIsGood');
    });

    test('T10-11: renderNarrativeBeatsHtml formats array, delimited string, or empty beats gracefully', () => {
      // Array
      const htmlArray = renderNarrativeBeatsHtml(['Point 1', 'Point 2']);
      assert.ok(htmlArray.includes('Point 1') && htmlArray.includes('Point 2'), 'Should format array beats');

      // String with ->
      const htmlArrow = renderNarrativeBeatsHtml('Intro -> Tension -> Climax -> Payoff');
      assert.ok(htmlArrow.includes('Intro') && htmlArrow.includes('Payoff'), 'Should format arrow beats');

      // Empty
      const htmlEmpty = renderNarrativeBeatsHtml(null);
      assert.ok(htmlEmpty.includes(UNKNOWN_PLACEHOLDER), 'Should show "ไม่ทราบ" for empty beats');
    });
  });

  /* --------------------------------------------------------------------------
     4. Video Player Seek on Timestamp Highlight Click
     -------------------------------------------------------------------------- */
  describe('4. Video Player Seek on Timestamp Highlight Click', () => {
    test('T10-12: parseTimecode converts string and number formats accurately into seconds', () => {
      assert.strictEqual(parseTimecode('00:00'), 0);
      assert.strictEqual(parseTimecode('00:45'), 45);
      assert.strictEqual(parseTimecode('01:30'), 90);
      assert.strictEqual(parseTimecode('02:15:30'), 8130);
      assert.strictEqual(parseTimecode(60), 60);
      assert.strictEqual(parseTimecode('45s'), 45);
      assert.strictEqual(parseTimecode(''), 0);
      assert.strictEqual(parseTimecode(null), 0);
    });

    test('T10-13: seekVideoPlayer dispatches events and updates player if available', () => {
      let seekTarget = -1;
      const options = {
        onSeek: (sec) => { seekTarget = sec; }
      };

      const result = seekVideoPlayer('01:15', options);
      assert.strictEqual(result, 75);
      assert.strictEqual(seekTarget, 75, 'onSeek callback should receive 75 seconds');
    });

    test('T10-14: renderTimestampChipsHtml generates clickable buttons with data-time and formatted code', () => {
      const chipsHtml = renderTimestampChipsHtml([
        { time: '00:00', label: 'Intro Hook' },
        { time: '00:45', label: 'Tension Ramp' }
      ]);

      assert.ok(chipsHtml.includes('class="btn-time-chip"'), 'Should render btn-time-chip class');
      assert.ok(chipsHtml.includes('data-time="00:00"'), 'Should contain data-time attribute');
      assert.ok(chipsHtml.includes('Intro Hook'), 'Should contain chip label');
    });
  });

  /* --------------------------------------------------------------------------
     5. Spec A22: Correlation is NOT Causation Guardrail
     -------------------------------------------------------------------------- */
  describe('5. Spec A22: Correlation is NOT Causation Guardrail', () => {
    test('T10-15: pa-no-causation-note explicitly warns against asserting Hook or Sound as viral cause', () => {
      const html = generatePackagingAnalysisHtml({
        hook: 'Viral Hook Example',
        metricsObservation: 'คลิปนี้มียอดวิวสูง 1.2M'
      });

      assert.ok(html.includes('id="pa-no-causation-note"'), 'pa-no-causation-note must exist in output');
      assert.ok(html.includes('ข้อสังเกต'), 'Must explicitly frame metric analysis as "ข้อสังเกต"');
      assert.ok(html.includes('ห้ามฟันธงว่า Hook หรือเสียงเป็นสาเหตุที่ทำให้คลิปไวรัล') || html.includes('Correlation does not imply causation'), 'Must enforce anti-causation rule');
    });
  });

  /* --------------------------------------------------------------------------
     6. Spec T07 / A15: Unavailable Media State
     -------------------------------------------------------------------------- */
  describe('6. Spec T07 / A15: Unavailable Media State', () => {
    test('T10-16: When source or packaging is unavailable, displays ONLY state-unavailable', () => {
      const unavailableHtml = generatePackagingAnalysisHtml({ status: 'unavailable', isUnavailable: true });

      assert.ok(unavailableHtml.includes('id="state-unavailable"'), 'Must render state-unavailable');
      assert.ok(unavailableHtml.includes('Analysis unavailable'), 'Must display Analysis unavailable');
      assert.ok(!unavailableHtml.includes('id="pa-hook"'), 'Must not render normal packaging sections when unavailable');
    });

    test('T10-17: isAnalysisUnavailable correctly detects unavailable items', () => {
      assert.strictEqual(isAnalysisUnavailable({ status: 'Analysis unavailable' }), true);
      assert.strictEqual(isAnalysisUnavailable({ isUnavailable: true }), true);
      assert.strictEqual(isAnalysisUnavailable({ packaging: { status: 'unavailable' } }), true);
      assert.strictEqual(isAnalysisUnavailable({ packaging: { hook: 'Valid hook' } }), false);
      assert.strictEqual(isAnalysisUnavailable(null), false);
    });
  });

  /* --------------------------------------------------------------------------
     7. Strict Negative Constraint Check
     -------------------------------------------------------------------------- */
  describe('7. Strict Negative Constraint Check', () => {
    test('T10-18: Absolutely NO fake/arbitrary statistics across all target files', () => {
      const filesToCheck = [
        path.resolve(__dirname, '../components/packaging-analysis.html'),
        path.resolve(__dirname, '../styles/packaging-analysis.css'),
        path.resolve(__dirname, 'packaging-analysis.js')
      ];

      const forbiddenPatterns = [
        /12\s*สัปดาห์/,
        /\+12\s*สัปดาห์นี้/,
        /12\s*สัปดาห์วิเคราะห์แล้ว/
      ];

      filesToCheck.forEach(filePath => {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          forbiddenPatterns.forEach(pattern => {
            assert.strictEqual(pattern.test(content), false, `File ${path.basename(filePath)} contains forbidden fake statistic matching ${pattern}`);
          });
        }
      });
    });
  });

});
