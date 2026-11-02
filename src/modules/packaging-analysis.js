/**
 * ==============================================================================
 * MEW CONTENT OS — Packaging Analysis Panel (HOW) Controller (Topic T10)
 * Pure Client-Side JavaScript (ES6+ Module) · Zero Server Dependencies
 * Theme: mewteetawat.com V6.3
 * 
 * Definition of Done (DOD):
 * - HTML sections:
 *     1. `pa-hook`: ประโยคเปิดสะกดคนดู (The Hook)
 *     2. `pa-opening-pattern`: โครงสร้างฉากเปิด (Opening Pattern)
 *     3. `pa-narrative-beats`: จังหวะลำดับเรื่องเล่า (Narrative Beats)
 *     4. `pa-pacing`: จังหวะและความเร็วในการเล่า (Pacing)
 *     5. `pa-music-sfx`: ดนตรีและเสียงประกอบ (Music & SFX)
 *     6. `pa-editing-mechanics`: กลเม็ดงานตัดต่อ (Editing Mechanics)
 *     7. `pa-tension-emotion`: การไต่ระดับอารมณ์และความตึงเครียด (Tension & Emotion)
 *     8. `pa-timestamp-highlights`: ไทม์โค้ดจุดสำคัญ (Timestamp Highlights)
 *     9. `pa-what-is-good`: คำถาม "เล่าได้ดีอย่างไร?" (What is Good)
 * - JS: คลิก timestamp highlight แล้ว `video-player` seek ไปเวลานั้น (ถ้ามี player จริงหรือ mock)
 * - JS: ข้อสังเกตจาก metrics (ยอดวิวสูง) แสดงเป็น "ข้อสังเกต" และมีข้อความ `pa-no-causation-note`
 *       ห้ามฟันธงว่า Hook/เสียงเป็นสาเหตุไวรัล (Spec A22 Guardrail - Correlation is NOT causation)
 * - JS: เมื่อ source เป็น `Analysis unavailable` แท็บนี้แสดงเฉพาะ `state-unavailable` (T07)
 * - CSS: ใช้โทนสีต่างจากแท็บ Content ให้แยกสองคลังออกด้วยสายตา (Electric Violet #8a76ff theme)
 * - Fields ที่ว่างแสดง "ไม่ทราบ" โดยไม่ซ่อนทั้ง section
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
 * Spec A22 standard observation disclaimer text.
 * Strictly prevents the viral causation fallacy.
 */
export const CAUSATION_DISCLAIMER_TEXT = 'ข้อสังเกต: แม้คลิปต้นทางจะมียอดรับชมสูง เทคนิค Hook หรือเสียงที่พบเป็นเพียง "ข้อสังเกตเชิงโครงสร้าง" เท่านั้น ห้ามฟันธงว่า Hook หรือเสียงเป็นสาเหตุที่ทำให้คลิปไวรัล (Correlation does not imply causation) ปัจจัยความสำเร็จขึ้นกับบริบทภายนอกและอัลกอริทึมที่ไม่อาจชี้ชัดได้';

/**
 * The 9 required section identifiers for Packaging (HOW) analysis.
 */
export const REQUIRED_PACKAGING_SECTIONS = Object.freeze([
  'pa-hook',
  'pa-opening-pattern',
  'pa-narrative-beats',
  'pa-pacing',
  'pa-music-sfx',
  'pa-editing-mechanics',
  'pa-tension-emotion',
  'pa-timestamp-highlights',
  'pa-what-is-good'
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
 * Honest timecode formatter: converts seconds to MM:SS string without guessing.
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

    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(clean)) {
      return clean;
    }

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
 * Parses a timecode string or number into seconds integer.
 * 
 * @param {string|number|null|undefined} val 
 * @returns {number}
 */
export function parseTimecode(val) {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return Math.max(0, isNaN(val) ? 0 : val);

  const clean = String(val).trim().toLowerCase().replace('s', '');
  if (!clean) return 0;

  if (clean.includes(':')) {
    const parts = clean.split(':').map(p => parseInt(p, 10));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return (parts[0] * 60) + parts[1];
    }
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
    }
  }

  const num = parseFloat(clean);
  return isNaN(num) ? 0 : Math.max(0, Math.round(num));
}

/**
 * Checks whether an analysis or source object is marked as unavailable (T07 / A15).
 * 
 * @param {object|null|undefined} data 
 * @returns {boolean}
 */
export function isAnalysisUnavailable(data) {
  if (!data) return false;
  if (data.status === 'Analysis unavailable' || data.status === 'unavailable') return true;
  if (data.isUnavailable === true) return true;
  if (data.packaging && (data.packaging.status === 'unavailable' || data.packaging.isUnavailable === true)) {
    return true;
  }
  return false;
}

/**
 * Seeks video-player to the specified timestamp in seconds.
 * Supports native <video>, mock players, and dispatches custom events.
 * 
 * @param {number|string} time 
 * @param {object} [options={}]
 * @returns {number}
 */
export function seekVideoPlayer(time, options = {}) {
  const seconds = parseTimecode(time);

  // 1. Check for options-provided seek callback
  if (typeof options.onSeek === 'function') {
    options.onSeek(seconds);
  }

  // 2. Check for global researchDetailController or videoPlayer instance
  if (typeof window !== 'undefined') {
    if (window.researchDetailController && typeof window.researchDetailController.seekToTime === 'function') {
      window.researchDetailController.seekToTime(seconds);
    } else if (window.videoPlayer && typeof window.videoPlayer.seekTo === 'function') {
      window.videoPlayer.seekTo(seconds);
    }
  }

  // 3. Query DOM for video player elements
  if (typeof document !== 'undefined') {
    const playerContainer = options.playerElement || 
      document.querySelector('#video-player, [data-testid="video-player"]');

    if (playerContainer) {
      const videoEl = playerContainer.querySelector('video') || document.querySelector('video');
      if (videoEl && typeof videoEl.currentTime === 'number') {
        try {
          videoEl.currentTime = seconds;
        } catch {
          // Gracefully continue if media not loaded
        }
      }

      // Update time text if present
      const timeDisplay = playerContainer.querySelector('#current-time-text') || 
        document.querySelector('#current-time-text');
      if (timeDisplay) {
        const formatted = formatTimecodeHonest(seconds) || '00:00';
        timeDisplay.textContent = formatted;
      }

      // Update scrubber if duration is available
      const durationAttr = playerContainer.getAttribute('data-duration');
      const duration = durationAttr ? parseFloat(durationAttr) : 180;
      if (duration > 0) {
        const ratio = Math.min(1, Math.max(0, seconds / duration));
        const pct = (ratio * 100).toFixed(1) + '%';
        const progress = playerContainer.querySelector('#video-scrub-progress');
        const handle = playerContainer.querySelector('#video-scrub-handle');
        if (progress) progress.style.width = pct;
        if (handle) handle.style.left = pct;
      }

      // Dispatch custom seek event from player container
      if (typeof playerContainer.dispatchEvent === 'function') {
        try {
          const seekEvent = new CustomEvent('video-seek', {
            bubbles: true,
            detail: { seconds, time: seconds }
          });
          playerContainer.dispatchEvent(seekEvent);
        } catch {
          // CustomEvent mock fallback
        }
      }
    }

    // Dispatch global window seek event
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      try {
        window.dispatchEvent(new CustomEvent('mew:seek', { detail: { seconds, time: seconds } }));
      } catch {
        // Fallback for environments without full CustomEvent
      }
    }
  }

  return seconds;
}

/**
 * Generates narrative beats step items as HTML.
 * Handles arrays, structured objects, or string delimited beats.
 * 
 * @param {Array|string|null|undefined} beats 
 * @returns {string}
 */
export function renderNarrativeBeatsHtml(beats) {
  if (!beats) {
    return `<li class="empty-list-item"><span class="empty-field-text">${UNKNOWN_PLACEHOLDER}</span></li>`;
  }

  let list = [];

  if (Array.isArray(beats)) {
    list = beats;
  } else if (typeof beats === 'string') {
    const raw = beats.trim();
    if (!raw) {
      return `<li class="empty-list-item"><span class="empty-field-text">${UNKNOWN_PLACEHOLDER}</span></li>`;
    }
    if (raw.includes('->')) {
      list = raw.split('->').map(s => s.trim()).filter(Boolean);
    } else if (raw.includes('\n')) {
      list = raw.split('\n').map(s => s.trim()).filter(Boolean);
    } else {
      list = [raw];
    }
  }

  if (list.length === 0) {
    return `<li class="empty-list-item"><span class="empty-field-text">${UNKNOWN_PLACEHOLDER}</span></li>`;
  }

  return list.map((item, idx) => {
    let desc = '';
    if (typeof item === 'string') {
      desc = item.replace(/^\d+[\.\)]\s*/, '').trim();
    } else if (typeof item === 'object' && item !== null) {
      desc = item.desc || item.text || item.label || JSON.stringify(item);
    } else {
      desc = String(item);
    }

    return `
      <li class="beat-step-item" data-beat-index="${idx + 1}">
        <span class="beat-index font-num">${idx + 1}</span>
        <span class="beat-desc">${escapeHtml(desc || UNKNOWN_PLACEHOLDER)}</span>
      </li>
    `;
  }).join('');
}

/**
 * Generates clickable timestamp chips HTML.
 * 
 * @param {Array|null|undefined} highlights 
 * @returns {string}
 */
export function renderTimestampChipsHtml(highlights) {
  if (!Array.isArray(highlights) || highlights.length === 0) {
    return `<span class="empty-field-text">${UNKNOWN_PLACEHOLDER}</span>`;
  }

  const validChips = highlights.filter(h => h && (h.time !== undefined || h.label !== undefined));
  if (validChips.length === 0) {
    return `<span class="empty-field-text">${UNKNOWN_PLACEHOLDER}</span>`;
  }

  return validChips.map((h) => {
    const timeFormatted = formatTimecodeHonest(h.time) || UNKNOWN_TIMECODE_PLACEHOLDER;
    const rawTime = h.time !== undefined ? h.time : '0';
    const label = (h.label || h.title || '').trim();

    return `
      <button 
        type="button" 
        class="btn-time-chip" 
        data-time="${escapeHtml(rawTime)}" 
        data-testid="btn-time-chip"
        title="คลิกเพื่อกระโดดไปยังช่วง ${escapeHtml(timeFormatted)}"
        aria-label="กระโดดไปยัง ${escapeHtml(timeFormatted)} ${escapeHtml(label)}"
      >
        <span class="chip-code font-num">${escapeHtml(timeFormatted)}</span>
        <span class="chip-label">${escapeHtml(label || UNKNOWN_PLACEHOLDER)}</span>
      </button>
    `;
  }).join('');
}

/**
 * Generates the complete HTML markup for the Packaging Analysis panel (HOW).
 * 
 * @param {object|null|undefined} packagingData 
 * @param {object} [options={}]
 * @returns {string}
 */
export function generatePackagingAnalysisHtml(packagingData, options = {}) {
  const p = packagingData || {};
  const isUnavailable = isAnalysisUnavailable(p) || options.isUnavailable === true;

  if (isUnavailable) {
    return `
      <div 
        class="packaging-analysis-panel mew-offer-card violet-bar" 
        id="packaging-analysis-panel" 
        data-testid="packaging-analysis-panel" 
        role="region" 
        aria-label="Packaging Analysis (HOW)"
      >
        <section 
          class="packaging-state-unavailable" 
          id="state-unavailable" 
          data-testid="state-unavailable" 
          aria-labelledby="heading-state-unavailable" 
          role="region"
        >
          <div class="state-card-inner">
            <div class="state-badge-row">
              <span class="status-badge status-unavailable" data-testid="status-badge-unavailable">
                <span class="badge-icon-box" aria-hidden="true">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                  </svg>
                </span>
                <span class="badge-text">Analysis unavailable</span>
                <span class="badge-sub-th">(วิเคราะห์ไม่ได้)</span>
              </span>
              <span class="badge-spec-callout">Spec A15 &amp; T07 Honesty Protection</span>
            </div>
            <div class="state-headline-block">
              <div class="state-icon-large" aria-hidden="true">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  <line x1="2" y1="2" x2="22" y2="22" stroke-width="2.2"></line>
                </svg>
              </div>
              <div class="state-copy-group">
                <h3 id="heading-state-unavailable" class="state-title">วิเคราะห์ไม่ได้ &mdash; เข้าถึงไฟล์ภาพหรือเสียงต้นฉบับไม่ได้</h3>
                <p class="state-desc">แท็บ Packaging แสดงสถานะเป็น <code>Analysis unavailable</code> และระบุข้อความ "วิเคราะห์ไม่ได้" เนื่องจากไม่มีสัญญาณภาพหรือเสียงสำหรับถอด Hook, Pacing หรือ Sound Effects</p>
                <p class="state-subdesc">ตามหลักความซื่อสัตย์ทางข้อมูลของ MEW Content OS ระบบจะไม่สร้างผลวิเคราะห์ลีลาหรือคลื่นเสียงปลอมขึ้นมาเองโดยไม่มีหลักฐานจริง</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  // 1. Hook
  const hookText = (typeof p.hook === 'string' && p.hook.trim())
    ? `&ldquo;${escapeHtml(p.hook.trim())}&rdquo;`
    : `<span class="empty-field-text">${UNKNOWN_PLACEHOLDER}</span>`;

  // 2. Opening Pattern
  const openingPatternText = (typeof p.openingPattern === 'string' && p.openingPattern.trim())
    ? escapeHtml(p.openingPattern.trim())
    : `<span class="empty-field-text">${UNKNOWN_PLACEHOLDER}</span>`;

  // 3. Narrative Beats
  const beatsHtml = renderNarrativeBeatsHtml(p.beats);

  // 4. Pacing
  const pacingText = (typeof p.pacing === 'string' && p.pacing.trim())
    ? escapeHtml(p.pacing.trim())
    : `<span class="empty-field-text">${UNKNOWN_PLACEHOLDER}</span>`;

  // 5. Music & SFX
  const musicSfxVal = p.musicSfx || p.musicAndSfx || p.sound;
  const musicSfxText = (typeof musicSfxVal === 'string' && musicSfxVal.trim())
    ? escapeHtml(musicSfxVal.trim())
    : `<span class="empty-field-text">${UNKNOWN_PLACEHOLDER}</span>`;

  // 6. Editing Mechanics
  const editingMechanicsText = (typeof p.editingMechanics === 'string' && p.editingMechanics.trim())
    ? escapeHtml(p.editingMechanics.trim())
    : `<span class="empty-field-text">${UNKNOWN_PLACEHOLDER}</span>`;

  // 7. Tension & Emotion
  const tensionVal = p.tensionEmotion || p.tension || p.emotion;
  const tensionText = (typeof tensionVal === 'string' && tensionVal.trim())
    ? escapeHtml(tensionVal.trim())
    : `<span class="empty-field-text">${UNKNOWN_PLACEHOLDER}</span>`;

  // 8. Timestamp Highlights
  const timestampHighlightsHtml = renderTimestampChipsHtml(p.timestampHighlights);

  // 9. What is Good (คำถาม "เล่าได้ดีอย่างไร?")
  const whatIsGoodText = (typeof p.whatIsGood === 'string' && p.whatIsGood.trim())
    ? escapeHtml(p.whatIsGood.trim())
    : `<span class="empty-field-text">${UNKNOWN_PLACEHOLDER}</span>`;

  // Spec A22 Observation Text (Always includes anti-causation guardrail rule)
  const mandatoryGuardrail = '<strong>ห้ามฟันธงว่า Hook หรือเสียงเป็นสาเหตุที่ทำให้คลิปไวรัล</strong> (Correlation does not imply causation) ปัจจัยความสำเร็จขึ้นกับบริบทภายนอกและอัลกอริทึมที่ไม่อาจชี้ชัดได้';
  const observationBody = (typeof p.metricsObservation === 'string' && p.metricsObservation.trim())
    ? `${escapeHtml(p.metricsObservation.trim())} &mdash; ${mandatoryGuardrail}`
    : CAUSATION_DISCLAIMER_TEXT;

  return `
    <div 
      class="packaging-analysis-panel mew-offer-card violet-bar" 
      id="packaging-analysis-panel" 
      data-testid="packaging-analysis-panel" 
      role="region" 
      aria-label="Packaging Analysis (HOW)"
    >
      <header class="packaging-panel-header">
        <div class="packaging-header-main">
          <div class="header-badge-row">
            <span class="badge-pill violet-accent">Packaging Lens (HOW)</span>
            <span class="panel-kicker-tag font-num">Deconstruction 02</span>
          </div>
          <h2 class="packaging-panel-title">ลีลา โครงสร้าง &amp; เทคนิคการนำเสนอ</h2>
          <p class="packaging-panel-desc">ถอดรหัสวิธีการนำเสนอ รูปแบบการเล่า การเปิดคลิป จังหวะ และการตัดต่อ (<strong>HOW</strong>) โดยแยกขาดจากสาระ (<strong>WHAT</strong>)</p>
        </div>

        <aside class="founder-agency-callout violet-agency-callout" aria-label="หลักการอิสระในการตัดสินใจของ Founder">
          <div class="callout-icon" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
          <div class="callout-content">
            <strong class="callout-title">Independent Vault Save</strong>
            <span class="callout-text">คุณมีสิทธิ์ Save เฉพาะ Packaging เข้าคลังลีลา แม้สาระของคลิปจะไม่เกี่ยวกับธุรกิจของเราเลยก็ตาม (Story B) ปราศจากการบังคับใดๆ</span>
          </div>
        </aside>

        <!-- Spec A22 Guardrail: pa-no-causation-note -->
        <aside 
          class="pa-no-causation-note" 
          id="pa-no-causation-note" 
          data-testid="pa-no-causation-note" 
          role="note" 
          aria-label="ข้อสังเกตและข้อควรระวังเรื่องความสัมพันธ์ไม่ใช่สาเหตุ (A22)"
        >
          <div class="causation-icon-box" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div class="causation-content">
            <div class="causation-header-row">
              <strong class="causation-title">ข้อสังเกตเชิงลีลา (ไม่ใช่ข้อสรุปเชิงสาเหตุ)</strong>
              <span class="badge-pill causation-spec-badge">Spec A22</span>
            </div>
            <p class="causation-text" id="pa-causation-text">
              <span class="observation-highlight">ข้อสังเกต:</span> ${observationBody}
            </p>
          </div>
        </aside>
      </header>

      <div class="packaging-sections-body" id="packaging-sections-body">
        <!-- 01: pa-hook -->
        <section class="analysis-section pa-hook" id="pa-hook" data-testid="pa-hook" aria-labelledby="heading-pa-hook">
          <div class="section-header-row">
            <h3 class="section-badge-title violet-kicker" id="heading-pa-hook">
              <span class="section-step-num font-num">01</span>
              <span>The Hook (ประโยคเปิดสะกดคนดู)</span>
            </h3>
            <span class="section-caption-label">3-5 วินาทีแรกที่หยุดนิ้วโป้งผู้ชม</span>
          </div>
          <div class="analysis-card-box hook-quote-box" id="packaging-hook" data-testid="packaging-hook">
            ${hookText}
          </div>
        </section>

        <!-- 02: pa-opening-pattern -->
        <section class="analysis-section pa-opening-pattern" id="pa-opening-pattern" data-testid="pa-opening-pattern" aria-labelledby="heading-pa-opening-pattern">
          <div class="section-header-row">
            <h3 class="section-badge-title violet-kicker" id="heading-pa-opening-pattern">
              <span class="section-step-num font-num">02</span>
              <span>Opening Pattern (โครงสร้างฉากเปิด)</span>
            </h3>
            <span class="section-caption-label">รูปแบบและเทคนิคการวางเฟรมแรกของวิดีโอ</span>
          </div>
          <div class="analysis-card-box" id="packaging-opening-pattern" data-testid="packaging-opening-pattern">
            ${openingPatternText}
          </div>
        </section>

        <!-- 03: pa-narrative-beats -->
        <section class="analysis-section pa-narrative-beats" id="pa-narrative-beats" data-testid="pa-narrative-beats" aria-labelledby="heading-pa-narrative-beats">
          <div class="section-header-row">
            <h3 class="section-badge-title violet-kicker" id="heading-pa-narrative-beats">
              <span class="section-step-num font-num">03</span>
              <span>Narrative Beats (จังหวะลำดับเรื่องเล่า)</span>
            </h3>
            <span class="section-caption-label">เส้นเรื่องและลำดับการพาคนดูจากจุดเริ่มต้นสู่บทสรุป</span>
          </div>
          <ol class="beats-step-timeline" id="packaging-narrative-beats" data-testid="packaging-narrative-beats">
            ${beatsHtml}
          </ol>
        </section>

        <!-- 04: pa-pacing -->
        <section class="analysis-section pa-pacing" id="pa-pacing" data-testid="pa-pacing" aria-labelledby="heading-pa-pacing">
          <div class="section-header-row">
            <h3 class="section-badge-title violet-kicker" id="heading-pa-pacing">
              <span class="section-step-num font-num">04</span>
              <span>Pacing (จังหวะและความเร็วในการเล่า)</span>
            </h3>
            <span class="section-caption-label">ความเร็วของการตัด การเว้นวรรค และอัตราการป้อนข้อมูล</span>
          </div>
          <div class="analysis-card-box" id="packaging-pacing" data-testid="packaging-pacing">
            ${pacingText}
          </div>
        </section>

        <!-- 05: pa-music-sfx -->
        <section class="analysis-section pa-music-sfx" id="pa-music-sfx" data-testid="pa-music-sfx" aria-labelledby="heading-pa-music-sfx">
          <div class="section-header-row">
            <h3 class="section-badge-title violet-kicker" id="heading-pa-music-sfx">
              <span class="section-step-num font-num">05</span>
              <span>Music &amp; Sound Design (ดนตรีและเสียงประกอบ)</span>
            </h3>
            <span class="section-caption-label">เสียงบรรยากาศ ดนตรีคลอ และ SFX ที่ขับเคลื่อนอารมณ์</span>
          </div>
          <div class="analysis-card-box muted-bg" id="packaging-music-sfx" data-testid="packaging-music-sfx">
            ${musicSfxText}
          </div>
        </section>

        <!-- 06: pa-editing-mechanics -->
        <section class="analysis-section pa-editing-mechanics" id="pa-editing-mechanics" data-testid="pa-editing-mechanics" aria-labelledby="heading-pa-editing-mechanics">
          <div class="section-header-row">
            <h3 class="section-badge-title violet-kicker" id="heading-pa-editing-mechanics">
              <span class="section-step-num font-num">06</span>
              <span>Editing Mechanics (กลเม็ดงานตัดต่อ)</span>
            </h3>
            <span class="section-caption-label">เทคนิค Jump Cut, Punch Zoom, Overlay หรือ Split Screen</span>
          </div>
          <div class="analysis-card-box" id="packaging-editing-mechanics" data-testid="packaging-editing-mechanics">
            ${editingMechanicsText}
          </div>
        </section>

        <!-- 07: pa-tension-emotion -->
        <section class="analysis-section pa-tension-emotion" id="pa-tension-emotion" data-testid="pa-tension-emotion" aria-labelledby="heading-pa-tension-emotion">
          <div class="section-header-row">
            <h3 class="section-badge-title violet-kicker" id="heading-pa-tension-emotion">
              <span class="section-step-num font-num">07</span>
              <span>Tension &amp; Emotion (การไต่ระดับอารมณ์)</span>
            </h3>
            <span class="section-caption-label">กราฟอารมณ์ การสร้างความสงสัย ความขัดแย้ง และจุดคลี่คลาย</span>
          </div>
          <div class="analysis-card-box tension-box" id="packaging-tension-emotion" data-testid="packaging-tension-emotion">
            ${tensionText}
          </div>
        </section>

        <!-- 08: pa-timestamp-highlights (Clickable to seek video player) -->
        <section class="analysis-section pa-timestamp-highlights" id="pa-timestamp-highlights" data-testid="pa-timestamp-highlights" aria-labelledby="heading-pa-timestamp-highlights">
          <div class="section-header-row">
            <h3 class="section-badge-title violet-kicker" id="heading-pa-timestamp-highlights">
              <span class="section-step-num font-num">08</span>
              <span>Timestamp Highlights (ไทม์โค้ดจุดสำคัญ)</span>
            </h3>
            <span class="section-caption-label">คลิกปุ่มเพื่อกระโดดไปยังช่วงเวลานั้นบน Video Player ทันที</span>
          </div>
          <div class="timestamp-chips-list" id="packaging-timestamp-highlights" data-testid="packaging-timestamp-highlights">
            ${timestampHighlightsHtml}
          </div>
        </section>

        <!-- 09: pa-what-is-good (คำถาม "เล่าได้ดีอย่างไร?") -->
        <section class="analysis-section pa-what-is-good" id="pa-what-is-good" data-testid="pa-what-is-good" aria-labelledby="heading-pa-what-is-good">
          <div class="section-header-row">
            <h3 class="section-badge-title good-kicker" id="heading-pa-what-is-good">
              <span class="section-step-num font-num">09</span>
              <span class="question-primary">What is Good? (เล่าได้ดีอย่างไร?)</span>
            </h3>
            <span class="section-caption-label">คำถามหลัก: ทำไมลีลาและกลวิธีนำเสนอนี้ถึงมีคุณค่าควรแก่การเก็บเข้าคลัง Packaging</span>
          </div>
          <div class="good-insight-box violet-tint" id="packaging-what-is-good" data-testid="packaging-what-is-good">
            ${whatIsGoodText}
          </div>
        </section>
      </div>
    </div>
  `;
}

/**
 * Renders packaging data into an existing DOM container or target element.
 * Guarantees that:
 * 1. When source is 'Analysis unavailable', renders only state-unavailable (T07 / A15).
 * 2. All 9 sections exist and empty fields render "ไม่ทราบ" without hiding sections.
 * 3. Clicking any timestamp chip seeks the video-player.
 * 4. Spec A22 pa-no-causation-note is properly displayed.
 * 
 * @param {HTMLElement|string} target 
 * @param {object|null|undefined} packagingData 
 * @param {object} [options={}]
 * @returns {boolean}
 */
export function renderPackagingAnalysis(target, packagingData, options = {}) {
  const root = typeof target === 'string'
    ? (typeof document !== 'undefined' ? document.querySelector(target) : null)
    : target;

  if (!root) return false;

  const p = packagingData || {};
  const isUnavailable = isAnalysisUnavailable(p) || options.isUnavailable === true;

  const unavailableEl = root.querySelector('#state-unavailable, [data-testid="state-unavailable"]');
  const sectionsBody = root.querySelector('#packaging-sections-body, .packaging-sections-body');

  // Handle Unavailable State (T07 / A15)
  if (isUnavailable) {
    if (sectionsBody) {
      if (typeof sectionsBody.setAttribute === 'function') sectionsBody.setAttribute('hidden', 'true');
      if (sectionsBody.style) sectionsBody.style.display = 'none';
    }

    // Hide all normal 9 sections
    REQUIRED_PACKAGING_SECTIONS.forEach(id => {
      const el = root.querySelector(`#${id}, .${id}, [data-testid="${id}"]`);
      if (el) {
        if (typeof el.setAttribute === 'function') el.setAttribute('hidden', 'true');
        if (el.style) el.style.display = 'none';
      }
    });

    // Reveal or insert state-unavailable
    if (unavailableEl) {
      if (typeof unavailableEl.removeAttribute === 'function') unavailableEl.removeAttribute('hidden');
      if (unavailableEl.classList && typeof unavailableEl.classList.remove === 'function') {
        unavailableEl.classList.remove('is-hidden', 'hidden');
      }
      if (unavailableEl.style) unavailableEl.style.display = '';
    } else {
      root.innerHTML = generatePackagingAnalysisHtml(p, { isUnavailable: true });
    }
    return true;
  }

  // Normal Available State: Ensure state-unavailable is hidden
  if (unavailableEl) {
    if (typeof unavailableEl.setAttribute === 'function') unavailableEl.setAttribute('hidden', 'true');
    if (unavailableEl.classList && typeof unavailableEl.classList.add === 'function') {
      unavailableEl.classList.add('is-hidden');
    }
    if (unavailableEl.style) unavailableEl.style.display = 'none';
  }

  if (sectionsBody) {
    if (typeof sectionsBody.removeAttribute === 'function') sectionsBody.removeAttribute('hidden');
    if (sectionsBody.style && sectionsBody.style.display === 'none') sectionsBody.style.display = '';
  }

  // Ensure all 9 sections are unhidden (NEVER hide a section due to missing fields)
  REQUIRED_PACKAGING_SECTIONS.forEach(sectionId => {
    const sec = root.querySelector(`#${sectionId}, .${sectionId}, [data-testid="${sectionId}"]`);
    if (sec) {
      if (typeof sec.removeAttribute === 'function') sec.removeAttribute('hidden');
      if (sec.classList && typeof sec.classList.remove === 'function') sec.classList.remove('is-hidden', 'hidden');
      if (sec.style && sec.style.display === 'none') sec.style.display = '';
    }
  });

  // Resolve DOM elements
  const dom = {
    hook: root.querySelector('#packaging-hook, [data-testid="packaging-hook"]'),
    openingPattern: root.querySelector('#packaging-opening-pattern, [data-testid="packaging-opening-pattern"]'),
    beats: root.querySelector('#packaging-narrative-beats, [data-testid="packaging-narrative-beats"]'),
    pacing: root.querySelector('#packaging-pacing, [data-testid="packaging-pacing"]'),
    musicSfx: root.querySelector('#packaging-music-sfx, [data-testid="packaging-music-sfx"]'),
    editingMechanics: root.querySelector('#packaging-editing-mechanics, [data-testid="packaging-editing-mechanics"]'),
    tensionEmotion: root.querySelector('#packaging-tension-emotion, [data-testid="packaging-tension-emotion"]'),
    timestampHighlights: root.querySelector('#packaging-timestamp-highlights, [data-testid="packaging-timestamp-highlights"]'),
    whatIsGood: root.querySelector('#packaging-what-is-good, [data-testid="packaging-what-is-good"]'),
    causationNote: root.querySelector('#pa-no-causation-note, [data-testid="pa-no-causation-note"]'),
    causationText: root.querySelector('#pa-causation-text')
  };

  // If container is empty, populate full HTML template first
  if (!dom.hook && !dom.whatIsGood) {
    root.innerHTML = generatePackagingAnalysisHtml(p, options);
    // Re-bind listeners on fresh markup
    bindTimestampSeekingEvents(root, options);
    return true;
  }

  // 1. Hook
  if (dom.hook) {
    if (typeof p.hook === 'string' && p.hook.trim()) {
      dom.hook.textContent = `"${p.hook.trim()}"`;
    } else {
      dom.hook.innerHTML = `<span class="empty-field-text">${UNKNOWN_PLACEHOLDER}</span>`;
    }
  }

  // 2. Opening Pattern
  if (dom.openingPattern) {
    if (typeof p.openingPattern === 'string' && p.openingPattern.trim()) {
      dom.openingPattern.textContent = p.openingPattern.trim();
    } else {
      dom.openingPattern.innerHTML = `<span class="empty-field-text">${UNKNOWN_PLACEHOLDER}</span>`;
    }
  }

  // 3. Narrative Beats
  if (dom.beats) {
    dom.beats.innerHTML = renderNarrativeBeatsHtml(p.beats);
  }

  // 4. Pacing
  if (dom.pacing) {
    if (typeof p.pacing === 'string' && p.pacing.trim()) {
      dom.pacing.textContent = p.pacing.trim();
    } else {
      dom.pacing.innerHTML = `<span class="empty-field-text">${UNKNOWN_PLACEHOLDER}</span>`;
    }
  }

  // 5. Music & SFX
  if (dom.musicSfx) {
    const musicVal = p.musicSfx || p.musicAndSfx || p.sound;
    if (typeof musicVal === 'string' && musicVal.trim()) {
      dom.musicSfx.textContent = musicVal.trim();
    } else {
      dom.musicSfx.innerHTML = `<span class="empty-field-text">${UNKNOWN_PLACEHOLDER}</span>`;
    }
  }

  // 6. Editing Mechanics
  if (dom.editingMechanics) {
    if (typeof p.editingMechanics === 'string' && p.editingMechanics.trim()) {
      dom.editingMechanics.textContent = p.editingMechanics.trim();
    } else {
      dom.editingMechanics.innerHTML = `<span class="empty-field-text">${UNKNOWN_PLACEHOLDER}</span>`;
    }
  }

  // 7. Tension & Emotion
  if (dom.tensionEmotion) {
    const tensionVal = p.tensionEmotion || p.tension || p.emotion;
    if (typeof tensionVal === 'string' && tensionVal.trim()) {
      dom.tensionEmotion.textContent = tensionVal.trim();
    } else {
      dom.tensionEmotion.innerHTML = `<span class="empty-field-text">${UNKNOWN_PLACEHOLDER}</span>`;
    }
  }

  // 8. Timestamp Highlights
  if (dom.timestampHighlights) {
    dom.timestampHighlights.innerHTML = renderTimestampChipsHtml(p.timestampHighlights);
  }

  // 9. What is Good (คำถาม "เล่าได้ดีอย่างไร?")
  if (dom.whatIsGood) {
    if (typeof p.whatIsGood === 'string' && p.whatIsGood.trim()) {
      dom.whatIsGood.textContent = p.whatIsGood.trim();
    } else {
      dom.whatIsGood.innerHTML = `<span class="empty-field-text">${UNKNOWN_PLACEHOLDER}</span>`;
    }
  }

  // Spec A22 Guardrail: Ensure pa-no-causation-note is unhidden and styled
  if (dom.causationNote) {
    if (typeof dom.causationNote.removeAttribute === 'function') {
      dom.causationNote.removeAttribute('hidden');
    }
    if (dom.causationNote.style && dom.causationNote.style.display === 'none') {
      dom.causationNote.style.display = '';
    }
  }

  // Bind click-to-seek listeners
  bindTimestampSeekingEvents(root, options);

  return true;
}

/**
 * Attaches event listeners to timestamp highlight buttons within the target container.
 * 
 * @param {HTMLElement} root 
 * @param {object} [options={}]
 */
export function bindTimestampSeekingEvents(root, options = {}) {
  if (!root || typeof root.querySelectorAll !== 'function') return;

  const chips = root.querySelectorAll('.btn-time-chip, [data-time], [data-seek-time]');
  chips.forEach(chip => {
    // Avoid double attaching
    if (chip._hasSeekListener) return;
    chip._hasSeekListener = true;

    chip.addEventListener('click', (e) => {
      e.preventDefault();
      const timeVal = chip.getAttribute('data-time') || 
                      chip.getAttribute('data-seek-time') || 
                      chip.textContent;
      const seconds = parseTimecode(timeVal);

      // Visual feedback: toggle active chip
      chips.forEach(c => c.classList?.remove('is-active'));
      chip.classList?.add('is-active');

      seekVideoPlayer(seconds, options);
    });
  });
}

/**
 * Retrieves the packaging analysis object from store state by sourceId or activeSource.
 * 
 * @param {string} [sourceId] 
 * @returns {object|null}
 */
export function getAnalysisPackagingFromStore(sourceId) {
  try {
    const state = getState();
    if (!state) return null;

    const id = sourceId || state.activeSourceId;
    if (!id) return null;

    // First check researchItems status
    const item = Array.isArray(state.researchItems) 
      ? state.researchItems.find(it => it.sourceId === id || it.id === id)
      : null;

    if (item && item.status === 'Analysis unavailable') {
      return { status: 'unavailable', isUnavailable: true };
    }

    // Look for matching analysis in state.analyses
    if (Array.isArray(state.analyses)) {
      const match = state.analyses.find(a => a.sourceId === id || a.id === id);
      if (match) {
        if (match.isUnavailable || match.status === 'Analysis unavailable') {
          return { status: 'unavailable', isUnavailable: true };
        }
        return match.packaging || null;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * PackagingAnalysisController Class
 * Manages rendering, store subscriptions, and video player seek interactions.
 */
export class PackagingAnalysisController {
  constructor(rootElement, options = {}) {
    this.root = typeof rootElement === 'string'
      ? document.querySelector(rootElement)
      : rootElement;
    this.options = options;
    this.unsubscribeStore = null;
    this.currentPackaging = null;
  }

  init(sourceId) {
    if (!this.root) return false;

    const data = getAnalysisPackagingFromStore(sourceId);
    this.render(data);

    if (typeof subscribe === 'function') {
      this.unsubscribeStore = subscribe(() => {
        const updated = getAnalysisPackagingFromStore(sourceId);
        this.render(updated);
      });
    }

    return true;
  }

  render(packagingData) {
    this.currentPackaging = packagingData;
    return renderPackagingAnalysis(this.root, packagingData, this.options);
  }

  seekTo(seconds) {
    return seekVideoPlayer(seconds, this.options);
  }

  destroy() {
    if (typeof this.unsubscribeStore === 'function') {
      this.unsubscribeStore();
      this.unsubscribeStore = null;
    }
  }
}
