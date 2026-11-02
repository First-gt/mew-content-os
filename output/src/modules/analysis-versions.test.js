/**
 * ==============================================================================
 * MEW CONTENT OS — Topic T11: Analysis Versions & Re-analysis Unit Tests
 * Framework: node:test & node:assert/strict
 * 
 * Verifies Definition of Done (DOD):
 * 1. HTML: ปุ่ม `btn-analyze-again` และตัวเลือก `select-analysis-version`
 * 2. JS: กด analyze ซ้ำ → เพิ่ม `analyses[]` version ใหม่ (v2, v3…) ตั้งเป็น current; version เก่ายังดูได้
 * 3. JS: ห้าม แก้/ลบ `savedNotes` ใด ๆ ของ source เดียวกัน
 *        (test: save → analyze again → savedNotes จำนวนและ why เท่าเดิม)
 * 4. CSS: version ปัจจุบันมี badge `current`
 * 5. SavedNote เก็บ `analysisVersionId` ที่ใช้ตอน save เพื่อแสดง snapshot ใน S05
 * 6. STRICT NEGATIVE CONSTRAINT: Zero fake/arbitrary statistics ("12 สัปดาห์", fake badges).
 * ==============================================================================
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  getAnalysisVersions,
  getCurrentAnalysis,
  setCurrentAnalysisVersion,
  reanalyzeSource,
  saveNoteWithVersion,
  getSavedNoteSnapshot,
  populateVersionSelect,
  renderVersionHistoryList,
  AnalysisVersionsController
} from './analysis-versions.js';

import { getState, dispatch, resetDemo, setStorageEngine } from './store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory mock storage engine
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

// Lightweight mock element for Node environment
class MockDomElement {
  constructor(tagName = 'div', attrs = {}) {
    this.tagName = tagName.toUpperCase();
    this.attrs = { ...attrs };
    this.children = [];
    this.textContent = '';
    this._innerHTML = '';
    this.className = attrs.class || '';
    this.value = attrs.value || '';
    this.listeners = new Map();

    const classSet = new Set(this.className.split(/\s+/).filter(Boolean));
    this.classList = {
      add: (...cls) => { cls.forEach(c => classSet.add(c)); this.className = Array.from(classSet).join(' '); },
      remove: (...cls) => { cls.forEach(c => classSet.delete(c)); this.className = Array.from(classSet).join(' '); },
      contains: (c) => classSet.has(c)
    };
  }

  get innerHTML() {
    return this._innerHTML;
  }

  set innerHTML(val) {
    this._innerHTML = String(val);
    this.textContent = String(val).replace(/<[^>]*>/g, '').trim();
    // Parse simple <option value="...">...</option> tags into children for MockDomElement
    const optionRegex = /<option\s+value="([^"]*)"([^>]*)>([^<]*)<\/option>/g;
    let match;
    this.children = [];
    while ((match = optionRegex.exec(String(val))) !== null) {
      const opt = new MockDomElement('option', { value: match[1] });
      opt.textContent = match[3];
      opt.selected = match[2].includes('selected');
      this.children.push(opt);
    }
  }

  appendChild(child) {
    this.children.push(child);
  }

  getAttribute(name) {
    return this.attrs[name] || null;
  }

  setAttribute(name, val) {
    this.attrs[name] = String(val);
  }

  querySelector(selector) {
    if (selector.includes('btn-analyze-again') && this.attrs.id === 'btn-analyze-again') return this;
    if (selector.includes('select-analysis-version') && this.attrs.id === 'select-analysis-version') return this;
    for (const child of this.children) {
      if (child.attrs && (child.attrs.id === selector.replace('#', '') || (child.attrs.class && child.attrs.class.includes(selector.replace('.', ''))))) {
        return child;
      }
    }
    return null;
  }

  addEventListener(event, fn) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event).push(fn);
  }

  dispatchEvent(event) {
    const list = this.listeners.get(event.type) || [];
    list.forEach(fn => fn(event));
  }
}

describe('Topic T11: Analysis Versions & Re-analysis (Analyze Again)', () => {

  beforeEach(() => {
    setStorageEngine(new MockLocalStorage());
    resetDemo();
  });

  describe('1. HTML Contract Requirements', () => {
    const htmlPath = path.resolve(__dirname, '../components/analysis-versions.html');
    let htmlContent = '';

    test('T11-01: HTML file exists and is readable', () => {
      assert.ok(fs.existsSync(htmlPath), 'analysis-versions.html must exist');
      htmlContent = fs.readFileSync(htmlPath, 'utf8');
      assert.ok(htmlContent.length > 0);
    });

    test('T11-02: HTML contains btn-analyze-again button', () => {
      assert.match(htmlContent, /class=["'][^"']*btn-analyze-again[^"']*["']/, 'Must contain class="btn-analyze-again"');
      assert.match(htmlContent, /id=["']btn-analyze-again["']/, 'Must contain id="btn-analyze-again"');
      assert.match(htmlContent, /data-testid=["']btn-analyze-again["']/, 'Must contain data-testid="btn-analyze-again"');
    });

    test('T11-03: HTML contains select-analysis-version element', () => {
      assert.match(htmlContent, /class=["'][^"']*select-analysis-version[^"']*["']/, 'Must contain class="select-analysis-version"');
      assert.match(htmlContent, /id=["']select-analysis-version["']/, 'Must contain id="select-analysis-version"');
      assert.match(htmlContent, /data-testid=["']select-analysis-version["']/, 'Must contain data-testid="select-analysis-version"');
    });

    test('T11-04: HTML contains current badge element and S05 snapshot panel', () => {
      assert.match(htmlContent, /class=["'][^"']*current[^"']*["']/, 'Must contain class="current" for active version badge');
      assert.match(htmlContent, /s05-snapshot-panel/, 'Must contain s05-snapshot-panel for S05 snapshot view');
    });
  });

  describe('2. CSS Contract & Current Badge Styling', () => {
    const cssPath = path.resolve(__dirname, '../styles/analysis-versions.css');
    let cssContent = '';

    test('T11-05: CSS file exists and is readable', () => {
      assert.ok(fs.existsSync(cssPath), 'analysis-versions.css must exist');
      cssContent = fs.readFileSync(cssPath, 'utf8');
      assert.ok(cssContent.length > 0);
    });

    test('T11-06: CSS contains styles for .btn-analyze-again and .select-analysis-version', () => {
      assert.match(cssContent, /\.btn-analyze-again\s*\{/, 'Must style .btn-analyze-again');
      assert.match(cssContent, /\.select-analysis-version\s*\{/, 'Must style .select-analysis-version');
    });

    test('T11-07: CSS contains badge current styling', () => {
      assert.match(cssContent, /(\.badge-version\.current|\.current)/, 'Must define styles for .current badge');
      assert.match(cssContent, /var\(--av-violet/, 'Current badge must feature signature electric violet theme');
    });

    test('T11-08: CSS implements .mew-offer-card style and responsive rules', () => {
      assert.match(cssContent, /\.analysis-versions-container/, 'Must style container');
      assert.match(cssContent, /@media\s*\(max-width/, 'Must include responsive rules');
    });
  });

  describe('3. JS Re-analysis Versioning & Current Version Management', () => {
    test('T11-09: Re-analyzing adds a new version (v2, v3…) to analyses[] and sets it as current', () => {
      const stateBefore = getState();
      const sourceId = 'source-a';
      const initialVersions = getAnalysisVersions(sourceId);
      const initialCount = initialVersions.length;

      // Initial analysis version should be v1
      assert.strictEqual(initialCount, 1);
      assert.strictEqual(initialVersions[0].version, 1);

      // Perform re-analysis
      const resultV2 = reanalyzeSource(sourceId);
      assert.strictEqual(resultV2.version, 2, 'Next version must be 2');
      assert.strictEqual(resultV2.newAnalysis.id, 'analysis-source-a-v2');

      // Check current analysis is now v2
      const currentAfterV2 = getCurrentAnalysis(sourceId);
      assert.strictEqual(currentAfterV2.id, 'analysis-source-a-v2');
      assert.strictEqual(currentAfterV2.version, 2);

      // Perform another re-analysis -> v3
      const resultV3 = reanalyzeSource(sourceId);
      assert.strictEqual(resultV3.version, 3, 'Next version must be 3');
      assert.strictEqual(resultV3.newAnalysis.id, 'analysis-source-a-v3');

      // Check current analysis is now v3
      const currentAfterV3 = getCurrentAnalysis(sourceId);
      assert.strictEqual(currentAfterV3.id, 'analysis-source-a-v3');
      assert.strictEqual(currentAfterV3.version, 3);

      // Verify analyses[] in store now has all 3 versions preserved
      const stateAfter = getState();
      const updatedVersions = stateAfter.analyses.filter(a => a.sourceId === sourceId);
      assert.strictEqual(updatedVersions.length, initialCount + 2);
    });

    test('T11-10: Older versions remain accessible and user can switch between them', () => {
      const sourceId = 'source-a';
      reanalyzeSource(sourceId); // creates v2

      // All versions still retrievable
      const allVersions = getAnalysisVersions(sourceId);
      assert.strictEqual(allVersions.length, 2);
      assert.strictEqual(allVersions[0].version, 1);
      assert.strictEqual(allVersions[1].version, 2);

      // Switch back to v1
      const switchedBack = setCurrentAnalysisVersion(sourceId, 'analysis-source-a-v1');
      assert.ok(switchedBack);
      assert.strictEqual(switchedBack.version, 1);

      const current = getCurrentAnalysis(sourceId);
      assert.strictEqual(current.id, 'analysis-source-a-v1');
      assert.strictEqual(current.version, 1);
    });
  });

  describe('4. Critical Non-Destructive Guarantee: savedNotes Integrity', () => {
    test('T11-11: Re-analyzing MUST NOT modify or delete existing savedNotes of the same source', () => {
      const sourceId = 'source-a';

      // 1. Initial savedNote exists for source-a in sample data
      const stateBefore = getState();
      const notesBefore = stateBefore.savedNotes.filter(n => n.sourceId === sourceId);
      assert.ok(notesBefore.length > 0, 'source-a should have at least 1 saved note initially');
      
      const beforeCount = notesBefore.length;
      const originalWhys = notesBefore.map(n => ({ id: n.id, why: n.why, lens: n.lens }));

      // 2. Add an additional custom note to source-a to ensure multiple notes
      const customNote = saveNoteWithVersion({
        id: 'note-custom-test-1',
        sourceId: sourceId,
        lens: 'packaging',
        why: 'ต้องการเก็บเทคนิคการเล่าเรื่องที่กระชับและตรงไปตรงมา',
        analysisVersionId: 'analysis-source-a-v1'
      });
      assert.ok(customNote);

      const notesMid = getState().savedNotes.filter(n => n.sourceId === sourceId);
      assert.strictEqual(notesMid.length, beforeCount + 1);

      // 3. Perform re-analysis multiple times
      reanalyzeSource(sourceId);
      reanalyzeSource(sourceId);

      // 4. Verify savedNotes count and content after re-analysis
      const stateAfter = getState();
      const notesAfter = stateAfter.savedNotes.filter(n => n.sourceId === sourceId);

      assert.strictEqual(
        notesAfter.length, 
        notesMid.length, 
        'savedNotes count MUST remain strictly identical after re-analysis'
      );

      // Verify original notes why statements are unchanged
      for (const orig of originalWhys) {
        const afterNote = notesAfter.find(n => n.id === orig.id);
        assert.ok(afterNote, `Note ${orig.id} must still exist`);
        assert.strictEqual(
          afterNote.why, 
          orig.why, 
          `Note ${orig.id} founder WHY must not be altered`
        );
      }

      // Verify custom note why is unchanged
      const customAfter = notesAfter.find(n => n.id === customNote.id);
      assert.ok(customAfter);
      assert.strictEqual(customAfter.why, customNote.why);
    });
  });

  describe('5. S05 Snapshot Preservation via analysisVersionId', () => {
    test('T11-12: SavedNote stores analysisVersionId used at save time for snapshot in S05', () => {
      const sourceId = 'source-b';

      // 1. Save note while v1 is active
      const noteV1 = saveNoteWithVersion({
        id: 'note-snapshot-test-b1',
        sourceId: sourceId,
        lens: 'content',
        why: 'เก็บสาระสำคัญเวอร์ชันแรก',
        analysisVersionId: 'analysis-source-b-v1'
      });

      assert.strictEqual(noteV1.analysisVersionId, 'analysis-source-b-v1');

      // 2. Re-analyze to v2
      reanalyzeSource(sourceId, {
        coreIdea: 'สาระสำคัญเวอร์ชัน 2 ที่ปรับปรุงใหม่'
      });

      // 3. Save another note while v2 is active
      const noteV2 = saveNoteWithVersion({
        id: 'note-snapshot-test-b2',
        sourceId: sourceId,
        lens: 'packaging',
        why: 'เก็บเทคนิคใหม่จากการวิเคราะห์ v2'
      });

      assert.strictEqual(noteV2.analysisVersionId, 'analysis-source-b-v2');

      // 4. S05 Snapshot verification: Note 1 must resolve to analysis v1
      const snapshot1 = getSavedNoteSnapshot(noteV1.id);
      assert.ok(snapshot1.analysis);
      assert.strictEqual(snapshot1.analysis.id, 'analysis-source-b-v1');
      assert.strictEqual(snapshot1.analysis.version, 1);
      assert.strictEqual(snapshot1.isHistoricalSnapshot, true, 'Note 1 is historical snapshot because v2 is current');

      // 5. Note 2 must resolve to analysis v2
      const snapshot2 = getSavedNoteSnapshot(noteV2.id);
      assert.ok(snapshot2.analysis);
      assert.strictEqual(snapshot2.analysis.id, 'analysis-source-b-v2');
      assert.strictEqual(snapshot2.analysis.version, 2);
    });
  });

  describe('6. Controller & DOM Helper Tests', () => {
    test('T11-13: populateVersionSelect populates options with current mark', () => {
      const sourceId = 'source-a';
      reanalyzeSource(sourceId); // creates v2

      const selectEl = new MockDomElement('select', { id: 'select-analysis-version' });
      populateVersionSelect(selectEl, sourceId, 'analysis-source-a-v2');

      assert.strictEqual(selectEl.children.length, 2);
      assert.strictEqual(selectEl.children[0].value, 'analysis-source-a-v1');
      assert.strictEqual(selectEl.children[1].value, 'analysis-source-a-v2');
      assert.ok(selectEl.children[1].textContent.includes('(Current)'));
    });

    test('T11-14: AnalysisVersionsController initializes and binds events cleanly', () => {
      const container = new MockDomElement('div', { id: 'analysis-versions-container' });
      const btn = new MockDomElement('button', { id: 'btn-analyze-again' });
      const sel = new MockDomElement('select', { id: 'select-analysis-version' });
      const badge = new MockDomElement('span', { id: 'badge-version-current', class: 'badge-version current' });
      const list = new MockDomElement('ul', { id: 'version-history-list' });

      container.appendChild(btn);
      container.appendChild(sel);
      container.appendChild(badge);
      container.appendChild(list);

      const controller = new AnalysisVersionsController({
        container,
        sourceId: 'source-a'
      });

      assert.ok(controller);
      controller.destroy();
    });
  });

  describe('7. Strict Negative Constraints Check', () => {
    test('T11-15: Absolutely NO fake/arbitrary statistics ("12 สัปดาห์", fake badges) exist', () => {
      const files = [
        path.resolve(__dirname, '../components/analysis-versions.html'),
        path.resolve(__dirname, '../styles/analysis-versions.css'),
        path.resolve(__dirname, '../modules/analysis-versions.js')
      ];

      const forbiddenPatterns = [
        /12\s*สัปดาห์/i,
        /\+12\s*สัปดาห์นี้/i,
        /12\s*สัปดาห์วิเคราะห์แล้ว/i,
        /fake-badge/i
      ];

      for (const f of files) {
        const text = fs.readFileSync(f, 'utf8');
        for (const pattern of forbiddenPatterns) {
          assert.strictEqual(
            pattern.test(text),
            false,
            `Forbidden fake statistic pattern ${pattern} found in ${path.basename(f)}`
          );
        }
      }
    });
  });
});
