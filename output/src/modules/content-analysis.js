/**
 * ==============================================================================
 * MEW CONTENT OS — Content Analysis Panel (WHAT) Controller (Topic T09)
 * Pure Client-Side JavaScript (ES6+ Module) · Zero Server Dependencies
 * Theme: mewteetawat.com V6.3
 * 
 * Definition of Done (DOD):
 * - HTML sections:
 *     1. `ca-core-idea`: แก่นความคิด (Core Idea)
 *     2. `ca-audience`: กลุ่มเป้าหมาย (Target Audience)
 *     3. `ca-key-points`: ประเด็นหลัก (Key Points)
 *     4. `ca-claims-evidence`: ข้ออ้างและหลักฐาน (Claims & Evidence)
 *     5. `ca-examples`: ตัวอย่างประกอบ (Examples Cited)
 *     6. `ca-extendable-angles`: มุมต่อยอดสู่ธุรกิจเรา (Extendable Angles)
 *     7. `ca-what-is-good`: คำถาม "อะไรดี?" (What is Good)
 * - JS: Render จาก `analysis.content` ใน store; field ที่ว่างแสดง "ไม่ทราบ" ไม่ซ่อนทั้ง section
 * - JS: ถ้าไม่มี timestamp → ซ่อน timecode / แสดง "ไม่ทราบเวลา" ห้ามแต่งเลขเวลา
 * - CSS: Claims & Evidence แยกชัดระหว่าง "มีหลักฐาน" กับ "ไม่มีหลักฐาน" (badge `evidence-missing`)
 * - ไม่มีปุ่ม Save อัตโนมัติ และไม่มีคะแนน AI บังคับให้ผู้ใช้เลือก (ผู้ใช้ Save เฉพาะ Content แม้ AI ชอบ Packaging ได้)
 * 
 * STRICT NEGATIVE CONSTRAINT:
 * Absolutely NO fake or arbitrary statistics or fake percentage badges.
 * ==============================================================================
 */

import { getState, subscribe } from './store.js';

/**
 * Fallback placeholder label for any empty or unspecified field.
 */
export const UNKNOWN_PLACEHOLDER = 'ไม่ทราบ';

/**
 * Fallback placeholder label for missing timecode.
 */
export const UNKNOWN_TIMECODE_PLACEHOLDER = 'ไม่ทราบเวลา';

/**
 * Required section identifiers for Content (WHAT) analysis.
 */
export const REQUIRED_CONTENT_SECTIONS = Object.freeze([
  'ca-core-idea',
  'ca-audience',
  'ca-key-points',
  'ca-claims-evidence',
  'ca-examples',
  'ca-extendable-angles',
  'ca-what-is-good'
]);

/**
 * Safely escapes HTML entities to prevent injection.
 * @param {*} value 
 * @returns {string}
 */
export function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Honestly formats a timecode without guessing or inventing arbitrary numbers.
 * Returns null if timestamp is absent, empty, or invalid.
 * 
 * @param {string|number|null|undefined} time 
 * @returns {string|null}
 */
export function formatTimecodeHonest(time) {
  if (time === null || time === undefined || time === '') {
    return null;
  }

  if (typeof time === 'number') {
    if (isNaN(time) || time < 0) return null;
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  if (typeof time === 'string') {
    const clean = time.trim();
    if (!clean) return null;

    // Standard mm:ss or hh:mm:ss format
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(clean)) {
      return clean;
    }

    // Number with optional 's' suffix
    const num = Number(clean.toLowerCase().replace('s', ''));
    if (!isNaN(num) && num >= 0) {
      const m = Math.floor(num / 60);
      const s = Math.floor(num % 60);
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    return null;
  }

  return null;
}

/**
 * Determines whether a claim item has verified, supporting evidence.
 * Explicitly distinguishes "มีหลักฐาน" from "ไม่มีหลักฐาน".
 * 
 * @param {object} item 
 * @returns {boolean}
 */
export function hasEvidence(item) {
  if (!item || typeof item !== 'object') return false;

  // Explicit boolean overrides
  if (typeof item.hasEvidence === 'boolean') {
    return item.hasEvidence;
  }
  if (item.evidenceMissing === true) {
    return false;
  }

  const evidenceText = item.evidence;
  if (!evidenceText || typeof evidenceText !== 'string') {
    return false;
  }

  const normalized = evidenceText.trim().toLowerCase();
  if (
    normalized === '' ||
    normalized === UNKNOWN_PLACEHOLDER.toLowerCase() ||
    normalized === 'ไม่มี' ||
    normalized === 'ไม่มีหลักฐาน' ||
    normalized.includes('ไม่มีหลักฐาน') ||
    normalized.includes('ไม่มีตัวเลขงานวิจัยรองรับ') ||
    normalized.includes('no evidence') ||
    normalized.includes('unverified')
  ) {
    return false;
  }

  return true;
}

/**
 * Generates markup for timecode display.
 * If time is absent: either renders "ไม่ทราบเวลา" or hides the element.
 * Strictly NEVER generates a fabricated timestamp!
 * 
 * @param {string|number|null|undefined} time 
 * @param {object} [options={}]
 * @param {boolean} [options.hideWhenMissing=false]
 * @returns {string}
 */
export function renderTimecodeBadge(time, options = {}) {
  const { hideWhenMissing = false } = options;
  const formatted = formatTimecodeHonest(time);

  if (formatted) {
    return `<span class="claim-timecode font-num" data-time="${escapeHtml(formatted)}" aria-label="เวลาในคลิป ${escapeHtml(formatted)}">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
      <span>${escapeHtml(formatted)}</span>
    </span>`;
  }

  if (hideWhenMissing) {
    return `<span class="claim-timecode timecode-hidden" hidden aria-hidden="true"></span>`;
  }

  return `<span class="claim-timecode timecode-unknown" data-timecode-status="unknown" title="ไม่มีการระบุเวลาในคลิป">
    <span>${UNKNOWN_TIMECODE_PLACEHOLDER}</span>
  </span>`;
}

/**
 * Generates markup for Claims & Evidence list item with distinct badges.
 * 
 * @param {object} item 
 * @param {number} index 
 * @param {object} [options={}]
 * @returns {string}
 */
export function renderClaimItemHtml(item, index = 0, options = {}) {
  if (!item || typeof item !== 'object') {
    return `
      <div class="claim-item-card empty-claim-box">
        <span class="empty-field-text">${UNKNOWN_PLACEHOLDER}</span>
      </div>
    `;
  }

  const claimText = (typeof item.claim === 'string' && item.claim.trim())
    ? item.claim.trim()
    : (typeof item === 'string' && item.trim() ? item.trim() : UNKNOWN_PLACEHOLDER);

  const timestamp = item.time || item.timestamp || item.timecode;
  const timecodeHtml = renderTimecodeBadge(timestamp, options);

  const isVerified = hasEvidence(item);
  const evidenceBadgeHtml = isVerified
    ? `<span class="evidence-tag evidence-verified" data-testid="evidence-verified" aria-label="ข้ออ้างนี้มีหลักฐานประกอบ">มีหลักฐาน</span>`
    : `<span class="evidence-tag evidence-missing" data-testid="evidence-missing" aria-label="ข้ออ้างนี้ไม่มีหลักฐานยืนยัน">ไม่มีหลักฐาน</span>`;

  const evidenceStatement = (typeof item.evidence === 'string' && item.evidence.trim())
    ? item.evidence.trim()
    : (isVerified ? UNKNOWN_PLACEHOLDER : 'ไม่มีการระบุตัวเลข ข้อมูลวิจัย หรือหลักฐานยืนยันในคลิปนี้');

  const cardMissingClass = !isVerified ? ' has-missing-evidence' : '';

  return `
    <article class="claim-item-card${cardMissingClass}" data-claim-index="${index}" aria-label="ข้ออ้างและหลักฐานข้อที่ ${index + 1}">
      <div class="claim-row">
        <div class="claim-meta-bar">
          <span class="claim-tag">ข้ออ้าง (Claim)</span>
          ${timecodeHtml}
        </div>
        <p class="claim-statement">${escapeHtml(claimText)}</p>
      </div>
      <div class="evidence-row">
        <div class="evidence-header">
          ${evidenceBadgeHtml}
        </div>
        <p class="evidence-statement${!isVerified ? ' missing-text' : ''}">${escapeHtml(evidenceStatement)}</p>
      </div>
    </article>
  `;
}

/**
 * Generates the full HTML markup for the Content Analysis Panel (WHAT).
 * 
 * @param {object|null|undefined} content 
 * @param {object} [options={}]
 * @returns {string}
 */
export function generateContentAnalysisHtml(content = null, options = {}) {
  const c = content || {};

  // 1. Core Idea
  const coreIdeaText = (typeof c.coreIdea === 'string' && c.coreIdea.trim())
    ? escapeHtml(c.coreIdea.trim())
    : `<span class="empty-field-text">${UNKNOWN_PLACEHOLDER}</span>`;

  // 2. Target Audience
  const audienceText = (typeof c.audience === 'string' && c.audience.trim())
    ? escapeHtml(c.audience.trim())
    : `<span class="empty-field-text">${UNKNOWN_PLACEHOLDER}</span>`;

  // 3. Key Points
  let keyPointsHtml = `<li class="empty-list-item"><span class="empty-field-text">${UNKNOWN_PLACEHOLDER}</span></li>`;
  if (Array.isArray(c.keyPoints) && c.keyPoints.length > 0) {
    const validPoints = c.keyPoints.filter(p => typeof p === 'string' && p.trim().length > 0);
    if (validPoints.length > 0) {
      keyPointsHtml = validPoints
        .map(kp => `<li>${escapeHtml(kp.trim())}</li>`)
        .join('');
    }
  }

  // 4. Claims & Evidence
  let claimsHtml = `
    <div class="claim-item-card empty-claim-box">
      <span class="empty-field-text">${UNKNOWN_PLACEHOLDER}</span>
    </div>
  `;
  if (Array.isArray(c.claimsAndEvidence) && c.claimsAndEvidence.length > 0) {
    claimsHtml = c.claimsAndEvidence
      .map((item, idx) => renderClaimItemHtml(item, idx, options))
      .join('');
  }

  // 5. Examples Cited
  let examplesText = `<span class="empty-field-text">${UNKNOWN_PLACEHOLDER}</span>`;
  if (Array.isArray(c.examples) && c.examples.length > 0) {
    const validEx = c.examples.map(ex => (typeof ex === 'string' ? ex.trim() : String(ex))).filter(Boolean);
    if (validEx.length > 0) {
      examplesText = escapeHtml(validEx.join(', '));
    }
  } else if (typeof c.examples === 'string' && c.examples.trim()) {
    examplesText = escapeHtml(c.examples.trim());
  }

  // 6. Extendable Angles
  let extendableAnglesHtml = `<li class="empty-list-item"><span class="empty-field-text">${UNKNOWN_PLACEHOLDER}</span></li>`;
  if (Array.isArray(c.extendableAngles) && c.extendableAngles.length > 0) {
    const validAngles = c.extendableAngles.filter(a => typeof a === 'string' && a.trim().length > 0);
    if (validAngles.length > 0) {
      extendableAnglesHtml = validAngles
        .map(angle => `<li>${escapeHtml(angle.trim())}</li>`)
        .join('');
    }
  }

  // 7. What is Good (คำถาม "อะไรดี?")
  const whatIsGoodText = (typeof c.whatIsGood === 'string' && c.whatIsGood.trim())
    ? escapeHtml(c.whatIsGood.trim())
    : `<span class="empty-field-text">${UNKNOWN_PLACEHOLDER}</span>`;

  return `
    <div class="content-analysis-panel mew-offer-card coral-bar" id="content-analysis-panel" data-testid="content-analysis-panel" role="region" aria-label="Content Analysis (WHAT)">
      <header class="content-panel-header">
        <div class="content-header-main">
          <div class="header-badge-row">
            <span class="badge-pill coral-accent">Content Lens (WHAT)</span>
            <span class="panel-kicker-tag font-num">Deconstruction 01</span>
          </div>
          <h2 class="content-panel-title">สาระสำคัญ &amp; แก่นเนื้อหา</h2>
          <p class="content-panel-desc">ถอดรหัสสิ่งที่มีประโยชน์แท้จริง (<strong>WHAT</strong>) โดยแยกขาดจากวิธีการเล่า (<strong>HOW</strong>)</p>
        </div>
        <aside class="founder-agency-callout" aria-label="หลักการอิสระในการตัดสินใจของ Founder">
          <div class="callout-icon" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
          <div class="callout-content">
            <strong class="callout-title">Independent Vault Save</strong>
            <span class="callout-text">คุณมีอิสระในการ Save เฉพาะ Content แม้จะไม่ชอบ Packaging (ปราศจากการให้เกรดหรือการบังคับใดๆ)</span>
          </div>
        </aside>
      </header>

      <!-- 01: Core Idea -->
      <section class="analysis-section ca-core-idea" id="ca-core-idea" data-testid="ca-core-idea" aria-labelledby="heading-ca-core-idea">
        <div class="section-header-row">
          <h3 class="section-badge-title coral-kicker" id="heading-ca-core-idea">
            <span class="section-step-num font-num">01</span>
            <span>Core Idea (แก่นความคิด)</span>
          </h3>
          <span class="section-caption-label">ความคิดหลัก 1 ประโยคที่เป็นหัวใจของคลิป</span>
        </div>
        <div class="analysis-card-box core-idea-box" id="content-core-idea" data-testid="content-core-idea">
          ${coreIdeaText}
        </div>
      </section>

      <!-- 02: Target Audience -->
      <section class="analysis-section ca-audience" id="ca-audience" data-testid="ca-audience" aria-labelledby="heading-ca-audience">
        <div class="section-header-row">
          <h3 class="section-badge-title coral-kicker" id="heading-ca-audience">
            <span class="section-step-num font-num">02</span>
            <span>Target Audience (กลุ่มผู้ฟังเป้าหมาย)</span>
          </h3>
          <span class="section-caption-label">คนที่สาระนี้ตั้งใจสื่อสารโดยตรง</span>
        </div>
        <div class="analysis-card-box" id="content-audience" data-testid="content-audience">
          ${audienceText}
        </div>
      </section>

      <!-- 03: Key Points -->
      <section class="analysis-section ca-key-points" id="ca-key-points" data-testid="ca-key-points" aria-labelledby="heading-ca-key-points">
        <div class="section-header-row">
          <h3 class="section-badge-title coral-kicker" id="heading-ca-key-points">
            <span class="section-step-num font-num">03</span>
            <span>Key Points (ประเด็นหลักที่นำเสนอ)</span>
          </h3>
          <span class="section-caption-label">ข้อสรุปย่อยที่ประกอบขึ้นเป็นแก่นความคิด</span>
        </div>
        <ul class="analysis-bullet-list" id="content-key-points" data-testid="content-key-points">
          ${keyPointsHtml}
        </ul>
      </section>

      <!-- 04: Claims & Evidence -->
      <section class="analysis-section ca-claims-evidence" id="ca-claims-evidence" data-testid="ca-claims-evidence" aria-labelledby="heading-ca-claims-evidence">
        <div class="section-header-row">
          <h3 class="section-badge-title coral-kicker" id="heading-ca-claims-evidence">
            <span class="section-step-num font-num">04</span>
            <span>Claims &amp; Evidence (ข้ออ้างและหลักฐาน)</span>
          </h3>
          <span class="section-caption-label">ตรวจสอบความน่าเชื่อถือ แยกข้ออ้างลอยๆ ออกจากหลักฐานจริง</span>
        </div>
        <div class="claims-list-wrapper" id="content-claims-evidence" data-testid="content-claims-evidence">
          ${claimsHtml}
        </div>
      </section>

      <!-- 05: Examples Cited -->
      <section class="analysis-section ca-examples" id="ca-examples" data-testid="ca-examples" aria-labelledby="heading-ca-examples">
        <div class="section-header-row">
          <h3 class="section-badge-title coral-kicker" id="heading-ca-examples">
            <span class="section-step-num font-num">05</span>
            <span>Examples Cited (ตัวอย่างประกอบ)</span>
          </h3>
          <span class="section-caption-label">เคส กรณีศึกษา หรือเหตุการณ์จริงที่ยกขึ้นมาอธิบาย</span>
        </div>
        <div class="analysis-card-box muted-bg" id="content-examples" data-testid="content-examples">
          ${examplesText}
        </div>
      </section>

      <!-- 06: Extendable Angles -->
      <section class="analysis-section ca-extendable-angles" id="ca-extendable-angles" data-testid="ca-extendable-angles" aria-labelledby="heading-ca-extendable-angles">
        <div class="section-header-row">
          <h3 class="section-badge-title coral-kicker" id="heading-ca-extendable-angles">
            <span class="section-step-num font-num">06</span>
            <span>Extendable Angles (มุมมองต่อยอดสู่ธุรกิจของเรา)</span>
          </h3>
          <span class="section-caption-label">ไอเดียการประยุกต์หรือเชื่อมโยงเข้ากับ Brand/Offer ของตนเอง</span>
        </div>
        <ul class="analysis-bullet-list highlight-list" id="content-extendable-angles" data-testid="content-extendable-angles">
          ${extendableAnglesHtml}
        </ul>
      </section>

      <!-- 07: What is Good (คำถาม "อะไรดี?") -->
      <section class="analysis-section ca-what-is-good" id="ca-what-is-good" data-testid="ca-what-is-good" aria-labelledby="heading-ca-what-is-good">
        <div class="section-header-row">
          <h3 class="section-badge-title good-kicker" id="heading-ca-what-is-good">
            <span class="section-step-num font-num">07</span>
            <span class="question-primary">What is Good? (อะไรดี?)</span>
          </h3>
          <span class="section-caption-label">คำถามหลัก: ทำไมสาระและแก่นคิดนี้ถึงมีคุณค่าควรแก่การเก็บเข้าคลัง Content</span>
        </div>
        <div class="good-insight-box coral-tint" id="content-what-is-good" data-testid="content-what-is-good">
          ${whatIsGoodText}
        </div>
      </section>
    </div>
  `;
}

/**
 * Renders content data into an existing DOM container or target element.
 * Strictly guarantees that empty fields display "ไม่ทราบ" without hiding any section!
 * 
 * @param {HTMLElement|string} target 
 * @param {object|null|undefined} contentData 
 * @param {object} [options={}]
 * @returns {boolean}
 */
export function renderContentAnalysis(target, contentData, options = {}) {
  const root = typeof target === 'string'
    ? (typeof document !== 'undefined' ? document.querySelector(target) : null)
    : target;

  if (!root) return false;

  const c = contentData || {};

  // Cache or resolve targets within root
  const dom = {
    coreIdea: root.querySelector('#content-core-idea, [data-testid="content-core-idea"]'),
    audience: root.querySelector('#content-audience, [data-testid="content-audience"]'),
    keyPoints: root.querySelector('#content-key-points, [data-testid="content-key-points"]'),
    claimsEvidence: root.querySelector('#content-claims-evidence, [data-testid="content-claims-evidence"]'),
    examples: root.querySelector('#content-examples, [data-testid="content-examples"]'),
    extendableAngles: root.querySelector('#content-extendable-angles, [data-testid="content-extendable-angles"]'),
    whatIsGood: root.querySelector('#content-what-is-good, [data-testid="content-what-is-good"]')
  };

  // Ensure all 7 sections remain visible (NEVER hide section when fields are empty)
  REQUIRED_CONTENT_SECTIONS.forEach(sectionId => {
    const sec = root.querySelector(`#${sectionId}, .${sectionId}, [data-testid="${sectionId}"]`);
    if (sec) {
      if (typeof sec.removeAttribute === 'function') sec.removeAttribute('hidden');
      if (sec.classList && typeof sec.classList.remove === 'function') sec.classList.remove('is-hidden', 'hidden');
      if (sec.style && sec.style.display === 'none') sec.style.display = '';
    }
  });

  // 1. Core Idea
  if (dom.coreIdea) {
    if (typeof c.coreIdea === 'string' && c.coreIdea.trim()) {
      dom.coreIdea.textContent = c.coreIdea.trim();
    } else {
      dom.coreIdea.innerHTML = `<span class="empty-field-text">${UNKNOWN_PLACEHOLDER}</span>`;
    }
  }

  // 2. Audience
  if (dom.audience) {
    if (typeof c.audience === 'string' && c.audience.trim()) {
      dom.audience.textContent = c.audience.trim();
    } else {
      dom.audience.innerHTML = `<span class="empty-field-text">${UNKNOWN_PLACEHOLDER}</span>`;
    }
  }

  // 3. Key Points
  if (dom.keyPoints) {
    if (Array.isArray(c.keyPoints) && c.keyPoints.length > 0) {
      const validPoints = c.keyPoints.filter(p => typeof p === 'string' && p.trim().length > 0);
      if (validPoints.length > 0) {
        dom.keyPoints.innerHTML = validPoints
          .map(kp => `<li>${escapeHtml(kp.trim())}</li>`)
          .join('');
      } else {
        dom.keyPoints.innerHTML = `<li class="empty-list-item"><span class="empty-field-text">${UNKNOWN_PLACEHOLDER}</span></li>`;
      }
    } else {
      dom.keyPoints.innerHTML = `<li class="empty-list-item"><span class="empty-field-text">${UNKNOWN_PLACEHOLDER}</span></li>`;
    }
  }

  // 4. Claims & Evidence
  if (dom.claimsEvidence) {
    if (Array.isArray(c.claimsAndEvidence) && c.claimsAndEvidence.length > 0) {
      dom.claimsEvidence.innerHTML = c.claimsAndEvidence
        .map((item, idx) => renderClaimItemHtml(item, idx, options))
        .join('');
    } else {
      dom.claimsEvidence.innerHTML = `
        <div class="claim-item-card empty-claim-box">
          <span class="empty-field-text">${UNKNOWN_PLACEHOLDER}</span>
        </div>
      `;
    }
  }

  // 5. Examples Cited
  if (dom.examples) {
    if (Array.isArray(c.examples) && c.examples.length > 0) {
      const valid = c.examples.map(ex => (typeof ex === 'string' ? ex.trim() : String(ex))).filter(Boolean);
      dom.examples.textContent = valid.length > 0 ? valid.join(', ') : UNKNOWN_PLACEHOLDER;
    } else if (typeof c.examples === 'string' && c.examples.trim()) {
      dom.examples.textContent = c.examples.trim();
    } else {
      dom.examples.innerHTML = `<span class="empty-field-text">${UNKNOWN_PLACEHOLDER}</span>`;
    }
  }

  // 6. Extendable Angles
  if (dom.extendableAngles) {
    if (Array.isArray(c.extendableAngles) && c.extendableAngles.length > 0) {
      const valid = c.extendableAngles.filter(a => typeof a === 'string' && a.trim().length > 0);
      if (valid.length > 0) {
        dom.extendableAngles.innerHTML = valid
          .map(angle => `<li>${escapeHtml(angle.trim())}</li>`)
          .join('');
      } else {
        dom.extendableAngles.innerHTML = `<li class="empty-list-item"><span class="empty-field-text">${UNKNOWN_PLACEHOLDER}</span></li>`;
      }
    } else {
      dom.extendableAngles.innerHTML = `<li class="empty-list-item"><span class="empty-field-text">${UNKNOWN_PLACEHOLDER}</span></li>`;
    }
  }

  // 7. What is Good (คำถาม "อะไรดี?")
  if (dom.whatIsGood) {
    if (typeof c.whatIsGood === 'string' && c.whatIsGood.trim()) {
      dom.whatIsGood.textContent = c.whatIsGood.trim();
    } else {
      dom.whatIsGood.innerHTML = `<span class="empty-field-text">${UNKNOWN_PLACEHOLDER}</span>`;
    }
  }

  return true;
}

/**
 * Retrieves the latest analysis for a given source ID from the central store.
 * 
 * @param {string} sourceId 
 * @returns {object|null}
 */
export function getAnalysisContentFromStore(sourceId) {
  try {
    const state = getState();
    if (!state || !Array.isArray(state.analyses)) return null;

    // Find analyses for this source, sorted by version descending
    const sourceAnalyses = state.analyses
      .filter(a => a.sourceId === sourceId)
      .sort((a, b) => (b.version || 1) - (a.version || 1));

    if (sourceAnalyses.length === 0) return null;
    return sourceAnalyses[0]?.content || null;
  } catch (err) {
    console.warn('[ContentAnalysis] Failed to read from store:', err?.message || err);
    return null;
  }
}

/**
 * Controller class for managing the Content Analysis Panel (WHAT).
 */
export class ContentAnalysisController {
  /**
   * @param {HTMLElement|string} [container=null]
   * @param {object} [options={}]
   */
  constructor(container = null, options = {}) {
    this.root = typeof container === 'string'
      ? (typeof document !== 'undefined' ? document.querySelector(container) : null)
      : (container || (typeof document !== 'undefined' ? document.getElementById('panel-content-what') : null));

    this.options = options;
    this.currentSourceId = null;
    this.currentContent = null;
    this.unsubscribeStore = null;
  }

  /**
   * Initializes the controller and binds store listener.
   * @param {string} [sourceId] 
   */
  init(sourceId = null) {
    if (sourceId) {
      this.loadSource(sourceId);
    }

    if (typeof subscribe === 'function') {
      this.unsubscribeStore = subscribe(() => {
        if (this.currentSourceId) {
          const fresh = getAnalysisContentFromStore(this.currentSourceId);
          if (fresh) {
            this.setContent(fresh);
          }
        }
      });
    }
  }

  /**
   * Loads content from store for a given source ID.
   * @param {string} sourceId 
   */
  loadSource(sourceId) {
    this.currentSourceId = sourceId;
    const content = getAnalysisContentFromStore(sourceId);
    this.setContent(content);
  }

  /**
   * Sets content object and updates DOM.
   * @param {object|null} content 
   */
  setContent(content) {
    this.currentContent = content;
    if (this.root) {
      renderContentAnalysis(this.root, content, this.options);
    }
  }

  /**
   * Destroys listeners and cleans up resources.
   */
  destroy() {
    if (typeof this.unsubscribeStore === 'function') {
      this.unsubscribeStore();
      this.unsubscribeStore = null;
    }
  }
}
