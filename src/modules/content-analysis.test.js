/**
 * ==============================================================================
 * MEW CONTENT OS — Topic T09: Content Analysis Panel (WHAT) Unit Tests
 * Framework: node:test & node:assert/strict
 * 
 * Verifies Definition of Done (DOD):
 * 1. HTML: sections `ca-core-idea`, `ca-audience`, `ca-key-points`, `ca-claims-evidence`,
 *          `ca-examples`, `ca-extendable-angles`, `ca-what-is-good` (คำถาม "อะไรดี?")
 * 2. JS: render จาก `analysis.content` ใน store; field ที่ว่างแสดง "ไม่ทราบ" ไม่ซ่อนทั้ง section
 * 3. JS: ถ้าไม่มี timestamp → ซ่อน timecode / แสดง "ไม่ทราบเวลา" ห้ามแต่งเลขเวลา
 * 4. CSS: Claims & Evidence แยกชัดระหว่าง "มีหลักฐาน" กับ "ไม่มีหลักฐาน" (badge `evidence-missing`)
 * 5. ไม่มีปุ่ม Save อัตโนมัติ และไม่มีคะแนน AI บังคับให้ผู้ใช้เลือก (ผู้ใช้ Save เฉพาะ Content แม้ AI ชอบ Packaging ได้)
 * 6. STRICT NEGATIVE CONSTRAINT: Zero fake/arbitrary statistics.
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
  REQUIRED_CONTENT_SECTIONS,
  formatTimecodeHonest,
  hasEvidence,
  renderTimecodeBadge,
  renderClaimItemHtml,
  generateContentAnalysisHtml,
  renderContentAnalysis,
  getAnalysisContentFromStore,
  ContentAnalysisController
} from './content-analysis.js';

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

  querySelector(selector) {
    return findFirst(this, selector);
  }

  querySelectorAll(selector) {
    const results = [];
    findAll(this, selector, results);
    return results;
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }
}

function matchesSelector(el, sel) {
  if (sel.startsWith('#')) {
    return el.getAttribute('id') === sel.slice(1);
  }
  if (sel.startsWith('.')) {
    return el.classList.contains(sel.slice(1));
  }
  if (sel.startsWith('[') && sel.endsWith(']')) {
    const inside = sel.slice(1, -1);
    if (inside.includes('=')) {
      const [attr, val] = inside.split('=').map(s => s.replace(/["']/g, '').trim());
      return el.getAttribute(attr) === val;
    }
    return el.attributes.has(inside);
  }
  return el.tagName.toLowerCase() === sel.toLowerCase();
}

function findFirst(root, selector) {
  for (const part of selector.split(',').map(s => s.trim())) {
    if (matchesSelector(root, part)) return root;
    for (const child of root.children) {
      const found = findFirst(child, part);
      if (found) return found;
    }
  }
  return null;
}

function findAll(root, selector, acc) {
  for (const part of selector.split(',').map(s => s.trim())) {
    for (const child of root.children) {
      if (matchesSelector(child, part)) {
        acc.push(child);
      }
      findAll(child, selector, acc);
    }
  }
}

describe('Topic T09: Content Analysis Panel (WHAT)', () => {
  let htmlContent = '';
  let cssContent = '';

  beforeEach(() => {
    resetDemo();
    const htmlPath = path.resolve(__dirname, '../components/content-analysis.html');
    const cssPath = path.resolve(__dirname, '../styles/content-analysis.css');
    htmlContent = fs.readFileSync(htmlPath, 'utf8');
    cssContent = fs.readFileSync(cssPath, 'utf8');
  });

  describe('1. HTML Contract & Structure Requirements', () => {
    test('T09-01: HTML contains all 7 mandatory sections with exact spec classes/testids', () => {
      // 1. ca-core-idea
      assert.ok(htmlContent.includes('ca-core-idea'), 'ca-core-idea section must exist in HTML');
      assert.ok(htmlContent.includes('id="ca-core-idea"') || htmlContent.includes('data-testid="ca-core-idea"'));

      // 2. ca-audience
      assert.ok(htmlContent.includes('ca-audience'), 'ca-audience section must exist in HTML');
      assert.ok(htmlContent.includes('id="ca-audience"') || htmlContent.includes('data-testid="ca-audience"'));

      // 3. ca-key-points
      assert.ok(htmlContent.includes('ca-key-points'), 'ca-key-points section must exist in HTML');
      assert.ok(htmlContent.includes('id="ca-key-points"') || htmlContent.includes('data-testid="ca-key-points"'));

      // 4. ca-claims-evidence
      assert.ok(htmlContent.includes('ca-claims-evidence'), 'ca-claims-evidence section must exist in HTML');
      assert.ok(htmlContent.includes('id="ca-claims-evidence"') || htmlContent.includes('data-testid="ca-claims-evidence"'));

      // 5. ca-examples
      assert.ok(htmlContent.includes('ca-examples'), 'ca-examples section must exist in HTML');
      assert.ok(htmlContent.includes('id="ca-examples"') || htmlContent.includes('data-testid="ca-examples"'));

      // 6. ca-extendable-angles
      assert.ok(htmlContent.includes('ca-extendable-angles'), 'ca-extendable-angles section must exist in HTML');
      assert.ok(htmlContent.includes('id="ca-extendable-angles"') || htmlContent.includes('data-testid="ca-extendable-angles"'));

      // 7. ca-what-is-good
      assert.ok(htmlContent.includes('ca-what-is-good'), 'ca-what-is-good section must exist in HTML');
      assert.ok(htmlContent.includes('id="ca-what-is-good"') || htmlContent.includes('data-testid="ca-what-is-good"'));
    });

    test('T09-02: ca-what-is-good explicitly features the guiding question "อะไรดี?"', () => {
      assert.ok(
        htmlContent.includes('อะไรดี?') || htmlContent.includes('อะไรดี'),
        'ca-what-is-good section must clearly state the question "อะไรดี?"'
      );
    });

    test('T09-03: No auto-save buttons and no arbitrary AI score/percentage badges exist', () => {
      // Must NOT contain auto-save trigger buttons
      assert.ok(!htmlContent.includes('data-auto-save'), 'No auto-save data attribute');
      assert.ok(!htmlContent.includes('btn-auto-save'), 'No auto-save button class');

      // Must NOT contain arbitrary AI scores (e.g. "AI Score: 95%", "คะแนน AI")
      assert.ok(!htmlContent.includes('ai-score'), 'No ai-score badge');
      assert.ok(!htmlContent.includes('ai-rating'), 'No ai-rating badge');
      assert.ok(!htmlContent.includes('คะแนน AI'), 'No forced AI score text');
    });
  });

  describe('2. CSS Contract & Claims-Evidence Visual Distinction', () => {
    test('T09-04: CSS defines badge `evidence-missing` clearly differentiated from verified evidence', () => {
      assert.ok(cssContent.includes('.evidence-missing'), 'CSS must define .evidence-missing class');
      assert.ok(cssContent.includes('.evidence-verified') || cssContent.includes('.evidence-present'), 'CSS must define verified evidence styling');
      
      // Check for theme colors
      assert.ok(cssContent.includes('--ca-coral') || cssContent.includes('#ed765b'), 'CSS must use coral accent');
      assert.ok(cssContent.includes('.ca-what-is-good'), 'CSS must include styling for ca-what-is-good');
    });

    test('T09-05: CSS implements .mew-offer-card coral accent bar and responsive styles', () => {
      assert.ok(cssContent.includes('.content-analysis-panel') || cssContent.includes('.mew-offer-card'));
      assert.ok(cssContent.includes('@media (max-width:'), 'CSS must include responsive media queries');
      assert.ok(cssContent.includes('prefers-reduced-motion'), 'CSS must support reduced motion');
    });
  });

  describe('3. JS Rendering from Store & "ไม่ทราบ" Fallback Protection', () => {
    test('T09-06: Empty content fields render as "ไม่ทราบ" and DO NOT hide the section', () => {
      // Build a mock container containing all 7 sections
      const root = new MockElement('div', { id: 'test-content-root' });
      REQUIRED_CONTENT_SECTIONS.forEach(id => {
        const sec = new MockElement('section', { id, class: `analysis-section ${id}` });
        const box = new MockElement('div', { id: id.replace('ca-', 'content-') });
        sec.appendChild(box);
        root.appendChild(sec);
      });

      // Render completely empty content
      const emptyContent = {
        coreIdea: '',
        audience: null,
        keyPoints: [],
        claimsAndEvidence: [],
        examples: '',
        extendableAngles: [],
        whatIsGood: undefined
      };

      renderContentAnalysis(root, emptyContent);

      // Verify each section is NOT hidden
      REQUIRED_CONTENT_SECTIONS.forEach(id => {
        const sec = root.querySelector(`#${id}`);
        assert.ok(sec, `Section #${id} must exist`);
        assert.equal(sec.hidden, false, `Section #${id} must NOT be hidden`);
        assert.ok(!sec.classList.contains('hidden'), `Section #${id} must not have class hidden`);
      });

      // Verify fields display "ไม่ทราบ"
      const coreIdeaBox = root.querySelector('#content-core-idea');
      assert.ok(coreIdeaBox.innerHTML.includes(UNKNOWN_PLACEHOLDER), 'Empty coreIdea must display "ไม่ทราบ"');

      const audienceBox = root.querySelector('#content-audience');
      assert.ok(audienceBox.innerHTML.includes(UNKNOWN_PLACEHOLDER), 'Empty audience must display "ไม่ทราบ"');

      const keyPointsBox = root.querySelector('#content-key-points');
      assert.ok(keyPointsBox.innerHTML.includes(UNKNOWN_PLACEHOLDER), 'Empty keyPoints must display "ไม่ทราบ"');

      const claimsBox = root.querySelector('#content-claims-evidence');
      assert.ok(claimsBox.innerHTML.includes(UNKNOWN_PLACEHOLDER), 'Empty claimsAndEvidence must display "ไม่ทราบ"');

      const examplesBox = root.querySelector('#content-examples');
      assert.ok(examplesBox.innerHTML.includes(UNKNOWN_PLACEHOLDER), 'Empty examples must display "ไม่ทราบ"');

      const anglesBox = root.querySelector('#content-extendable-angles');
      assert.ok(anglesBox.innerHTML.includes(UNKNOWN_PLACEHOLDER), 'Empty extendableAngles must display "ไม่ทราบ"');

      const whatIsGoodBox = root.querySelector('#content-what-is-good');
      assert.ok(whatIsGoodBox.innerHTML.includes(UNKNOWN_PLACEHOLDER), 'Empty whatIsGood must display "ไม่ทราบ"');
    });

    test('T09-07: getAnalysisContentFromStore retrieves active analysis for source-a from store', () => {
      const content = getAnalysisContentFromStore('source-a');
      assert.ok(content, 'source-a content must exist in store');
      assert.ok(content.coreIdea.includes('อย่าคอยเปิดยอด'));
      assert.ok(content.whatIsGood.includes('Mindset'));
    });
  });

  describe('4. Timecode Honesty (No Invented Timestamps)', () => {
    test('T09-08: formatTimecodeHonest formats valid timestamps honestly', () => {
      assert.equal(formatTimecodeHonest(75), '01:15');
      assert.equal(formatTimecodeHonest('01:30'), '01:30');
      assert.equal(formatTimecodeHonest('45s'), '00:45');
    });

    test('T09-09: Missing timestamp returns null and displays "ไม่ทราบเวลา" or hides without faking numbers', () => {
      assert.equal(formatTimecodeHonest(null), null);
      assert.equal(formatTimecodeHonest(undefined), null);
      assert.equal(formatTimecodeHonest(''), null);

      // Default badge renders "ไม่ทราบเวลา"
      const missingBadge = renderTimecodeBadge(null);
      assert.ok(missingBadge.includes(UNKNOWN_TIMECODE_PLACEHOLDER), 'Must display "ไม่ทราบเวลา"');
      assert.ok(!/\b\d{2}:\d{2}\b/.test(missingBadge), 'Strictly NO invented timestamp numbers');

      // Optional hidden mode renders hidden timecode
      const hiddenBadge = renderTimecodeBadge(null, { hideWhenMissing: true });
      assert.ok(hiddenBadge.includes('hidden') || hiddenBadge.includes('timecode-hidden'), 'Must hide timecode');
      assert.ok(!/\b\d{2}:\d{2}\b/.test(hiddenBadge), 'Strictly NO invented timestamp numbers');
    });
  });

  describe('5. Claims & Evidence Verification and `evidence-missing` Badge', () => {
    test('T09-10: hasEvidence correctly identifies claims lacking evidence', () => {
      assert.equal(hasEvidence({ claim: 'Claim 1', evidence: 'ไม่มีหลักฐานยืนยัน' }), false);
      assert.equal(hasEvidence({ claim: 'Claim 2', evidence: 'ประสบการณ์ตรงของผู้พูด (ไม่มีตัวเลขงานวิจัยรองรับชัดเจน)' }), false);
      assert.equal(hasEvidence({ claim: 'Claim 3', evidence: '' }), false);
      assert.equal(hasEvidence({ claim: 'Claim 4', evidenceMissing: true }), false);
      assert.equal(hasEvidence({ claim: 'Claim 5', hasEvidence: false }), false);

      // Verified evidence
      assert.equal(hasEvidence({ claim: 'Claim 6', evidence: 'ผลการศึกษาจาก MIT Sloan Review ปี 2024' }), true);
      assert.equal(hasEvidence({ claim: 'Claim 7', hasEvidence: true }), true);
    });

    test('T09-11: renderClaimItemHtml renders badge `evidence-missing` for unverified claims', () => {
      const unverifiedItem = {
        claim: 'การเปิดดูยอดลดประสิทธิภาพ',
        evidence: 'ประสบการณ์ตรงของผู้พูด (ไม่มีตัวเลขงานวิจัยรองรับชัดเจน)'
      };

      const html = renderClaimItemHtml(unverifiedItem, 0);
      assert.ok(html.includes('class="evidence-tag evidence-missing"'), 'Must contain evidence-missing badge');
      assert.ok(html.includes('ไม่มีหลักฐาน'), 'Must state "ไม่มีหลักฐาน"');
    });

    test('T09-12: renderClaimItemHtml renders badge `evidence-verified` for verified claims', () => {
      const verifiedItem = {
        claim: 'การนอนหลับส่งผลต่อสมาธิ',
        evidence: 'รายงานจาก Sleep Foundation ปี 2023',
        hasEvidence: true
      };

      const html = renderClaimItemHtml(verifiedItem, 0);
      assert.ok(html.includes('class="evidence-tag evidence-verified"'), 'Must contain evidence-verified badge');
      assert.ok(html.includes('มีหลักฐาน'), 'Must state "มีหลักฐาน"');
    });
  });

  describe('6. Strict Negative Constraint Check', () => {
    test('T09-13: Absolutely NO fake/arbitrary statistics across all target files', () => {
      const modulePath = path.resolve(__dirname, 'content-analysis.js');
      const moduleContent = fs.readFileSync(modulePath, 'utf8');

      const prohibitedPatterns = [
        /12\s*สัปดาห์/,
        /\+12\s*สัปดาห์นี้/,
        /12\s*สัปดาห์วิเคราะห์แล้ว/
      ];

      for (const pattern of prohibitedPatterns) {
        assert.ok(!pattern.test(htmlContent), `HTML must not contain fake stats matching ${pattern}`);
        assert.ok(!pattern.test(cssContent), `CSS must not contain fake stats matching ${pattern}`);
        assert.ok(!pattern.test(moduleContent), `JS module must not contain fake stats matching ${pattern}`);
      }
    });
  });
});
