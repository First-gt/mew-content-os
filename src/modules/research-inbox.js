/**
 * ==============================================================================
 * MEW CONTENT OS — S01 Research Inbox & Status Badges Module (Topic T06)
 * Pure Client-Side JavaScript (ES6+ Module) · Zero Server Dependencies
 * Theme: mewteetawat.com V6.3
 * 
 * Definition of Done (DOD) Checklist:
 * - HTML: รายการ `inbox-list` แต่ละแถว `inbox-row-{id}` มี badge `status-badge`
 * - JS: รองรับ 7 สถานะตรงตามสเปก:
 *       1) 'Waiting for analysis'
 *       2) 'Analyzing'
 *       3) 'Analyzed · Not saved'
 *       4) 'Saved to Content'
 *       5) 'Saved to Packaging'
 *       6) 'Saved to Both'
 *       7) 'Analysis unavailable'
 * - JS: สถานะ Saved คำนวณจาก `savedNotes` ของ source นั้น (ไม่เก็บซ้ำ) —
 *       Save Content อย่างเดียว = `Saved to Content`;
 *       เพิ่ม Packaging ภายหลัง = `Saved to Both` (A05)
 * - CSS: แต่ละสถานะมีสี/ไอคอนต่างกัน และ `Analyzed · Not saved` ต้องไม่ดูเหมือนอยู่ใน Library
 * - ข้อความบนหน้าบอกชัดว่า Inbox ไม่ใช่ Vault; นับ Inbox ไม่รวมในตัวเลข Vault ที่ Dashboard (A01, A07)
 * 
 * Strict Negative Constraint:
 * Absolutely NO fake/arbitrary statistics (e.g. "arbitrary weeks", "+arbitrary weeksนี้").
 * ==============================================================================
 */

import { getState, dispatch } from './store.js';
import { router } from './router.js';

/**
 * 7 Official Spec Statuses for Research Items
 * Canonical string constants matching Founder UX Spec Section 4 & plan.md
 */
export const RESEARCH_STATUSES = Object.freeze({
  WAITING: 'Waiting for analysis',
  ANALYZING: 'Analyzing',
  ANALYZED_NOT_SAVED: 'Analyzed · Not saved',
  SAVED_CONTENT: 'Saved to Content',
  SAVED_PACKAGING: 'Saved to Packaging',
  SAVED_BOTH: 'Saved to Both',
  UNAVAILABLE: 'Analysis unavailable'
});

/**
 * Normalizes any variation of status string (handles different dot types or casing)
 * @param {string} status 
 * @returns {string}
 */
export function normalizeStatus(status) {
  if (!status || typeof status !== 'string') {
    return RESEARCH_STATUSES.ANALYZED_NOT_SAVED;
  }
  const trimmed = status.trim();
  // Normalize dot variations for "Analyzed · Not saved"
  if (/^Analyzed\s*[\u00B7\u2022\u2219\.\-]\s*Not\s*saved$/i.test(trimmed)) {
    return RESEARCH_STATUSES.ANALYZED_NOT_SAVED;
  }
  if (/^Waiting\s+for\s+analysis$/i.test(trimmed)) {
    return RESEARCH_STATUSES.WAITING;
  }
  if (/^Analyzing$/i.test(trimmed)) {
    return RESEARCH_STATUSES.ANALYZING;
  }
  if (/^Saved\s+to\s+Content$/i.test(trimmed)) {
    return RESEARCH_STATUSES.SAVED_CONTENT;
  }
  if (/^Saved\s+to\s+Packaging$/i.test(trimmed)) {
    return RESEARCH_STATUSES.SAVED_PACKAGING;
  }
  if (/^Saved\s+to\s+Both$/i.test(trimmed)) {
    return RESEARCH_STATUSES.SAVED_BOTH;
  }
  if (/^Analysis\s+unavailable$/i.test(trimmed)) {
    return RESEARCH_STATUSES.UNAVAILABLE;
  }
  return trimmed;
}

/**
 * Visual & Functional Metadata Configuration for all 7 statuses
 */
export const STATUS_CONFIG = Object.freeze({
  [RESEARCH_STATUSES.WAITING]: {
    key: 'waiting',
    label: RESEARCH_STATUSES.WAITING,
    labelTh: 'รอการวิเคราะห์',
    badgeClass: 'status-waiting',
    description: 'คลิปถูกนำเข้าสู่คิวแล้ว รอส่งเข้า AI Dual-Lens Engine',
    isSaved: false,
    inLibrary: false,
    icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>`
  },
  [RESEARCH_STATUSES.ANALYZING]: {
    key: 'analyzing',
    label: RESEARCH_STATUSES.ANALYZING,
    labelTh: 'กำลังวิเคราะห์',
    badgeClass: 'status-analyzing',
    description: 'กำลังถอดรหัสสองเลนส์ WHAT (สาระ) vs HOW (ลีลาวิธีเล่า)',
    isSaved: false,
    inLibrary: false,
    icon: `<svg class="spin-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>`
  },
  [RESEARCH_STATUSES.ANALYZED_NOT_SAVED]: {
    key: 'analyzed-not-saved',
    label: RESEARCH_STATUSES.ANALYZED_NOT_SAVED,
    labelTh: 'วิเคราะห์แล้ว · ยังไม่บันทึก',
    badgeClass: 'status-analyzed-not-saved',
    description: 'วิเคราะห์เสร็จสมบูรณ์ แต่ยังไม่ได้กด Save เข้า Vault (ยังไม่อยู่ใน Library)',
    isSaved: false,
    inLibrary: false, // Strictly false: MUST NOT look like it's in Library
    icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke-dasharray="3 3"/><circle cx="12" cy="12" r="2"/></svg>`
  },
  [RESEARCH_STATUSES.SAVED_CONTENT]: {
    key: 'saved-content',
    label: RESEARCH_STATUSES.SAVED_CONTENT,
    labelTh: 'บันทึกเข้า Content Vault',
    badgeClass: 'status-saved-content',
    description: 'บันทึกสาระ/ไอเดีย (WHAT) เข้า Content Vault พร้อมระบุเหตุผล WHY เรียบร้อย',
    isSaved: true,
    inLibrary: true,
    icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`
  },
  [RESEARCH_STATUSES.SAVED_PACKAGING]: {
    key: 'saved-packaging',
    label: RESEARCH_STATUSES.SAVED_PACKAGING,
    labelTh: 'บันทึกเข้า Packaging Vault',
    badgeClass: 'status-saved-packaging',
    description: 'บันทึกลีลา/Hook/SFX (HOW) เข้า Packaging Vault พร้อมระบุเหตุผล WHY เรียบร้อย',
    isSaved: true,
    inLibrary: true,
    icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>`
  },
  [RESEARCH_STATUSES.SAVED_BOTH]: {
    key: 'saved-both',
    label: RESEARCH_STATUSES.SAVED_BOTH,
    labelTh: 'บันทึกเข้าทั้ง 2 คลัง',
    badgeClass: 'status-saved-both',
    description: 'บันทึกทั้งสาระ (Content) และลีลา (Packaging) เข้าทั้ง 2 คลัง โดยแชร์ source เดียวกัน',
    isSaved: true,
    inLibrary: true,
    icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
  },
  [RESEARCH_STATUSES.UNAVAILABLE]: {
    key: 'unavailable',
    label: RESEARCH_STATUSES.UNAVAILABLE,
    labelTh: 'วิเคราะห์ไม่ได้',
    badgeClass: 'status-unavailable',
    description: 'เข้าถึงสื่อ/เสียงไม่ได้ตามหลักความซื่อสัตย์ ไม่สร้างข้อมูลวิเคราะห์เท็จ (A15)',
    isSaved: false,
    inLibrary: false,
    icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`
  }
});

/**
 * Computes saved status purely from savedNotes of a given sourceId (A05 requirement).
 * - Only Content notes saved => 'Saved to Content'
 * - Only Packaging notes saved => 'Saved to Packaging'
 * - Both Content and Packaging notes saved => 'Saved to Both'
 * - No notes saved => null (not saved in vault)
 * 
 * @param {string} sourceId 
 * @param {Array<object>} savedNotes 
 * @returns {string|null}
 */
export function computeSavedStatusFromNotes(sourceId, savedNotes = []) {
  if (!sourceId || !Array.isArray(savedNotes)) return null;

  const notesForSource = savedNotes.filter(note => note && note.sourceId === sourceId);
  if (notesForSource.length === 0) return null;

  const hasContent = notesForSource.some(n => n.lens === 'content');
  const hasPackaging = notesForSource.some(n => n.lens === 'packaging');

  if (hasContent && hasPackaging) {
    return RESEARCH_STATUSES.SAVED_BOTH;
  }
  if (hasContent) {
    return RESEARCH_STATUSES.SAVED_CONTENT;
  }
  if (hasPackaging) {
    return RESEARCH_STATUSES.SAVED_PACKAGING;
  }
  return null;
}

/**
 * Computes the authoritative status for a research item.
 * Prioritizes actual savedNotes in the vault:
 * If savedNotes exist for the source -> returns appropriate 'Saved to ...' status.
 * If no savedNotes exist:
 *   - Preserves non-saved statuses: 'Waiting for analysis', 'Analyzing', 'Analysis unavailable'
 *   - Otherwise defaults to 'Analyzed · Not saved'
 * 
 * @param {object} item - Research item record
 * @param {Array<object>} [savedNotes=[]] - Saved notes from store
 * @returns {string} One of the 7 canonical RESEARCH_STATUSES
 */
export function computeItemStatus(item, savedNotes = []) {
  if (!item) return RESEARCH_STATUSES.ANALYZED_NOT_SAVED;

  const sourceId = item.sourceId;
  const savedStatus = computeSavedStatusFromNotes(sourceId, savedNotes);

  // If saved notes exist in the vault, they strictly determine the Saved status (A05)
  if (savedStatus) {
    return savedStatus;
  }

  // If no saved notes exist, inspect the item's raw status
  const normalizedRaw = normalizeStatus(item.status);

  // Transient / Ingestion / Failure states that haven't been analyzed yet
  if (
    normalizedRaw === RESEARCH_STATUSES.WAITING ||
    normalizedRaw === RESEARCH_STATUSES.ANALYZING ||
    normalizedRaw === RESEARCH_STATUSES.UNAVAILABLE
  ) {
    return normalizedRaw;
  }

  // Any other state without saved notes is strictly "Analyzed · Not saved"
  return RESEARCH_STATUSES.ANALYZED_NOT_SAVED;
}

/**
 * Summarizes counts across the Inbox and explicitly compares them against Vault counts.
 * Strictly adheres to A01 & A07: Inbox counts DO NOT inflate or mix into Vault counts!
 * 
 * @param {object} state - Global state object from store
 * @returns {object} Summary counts breakdown
 */
export function getInboxSummary(state = {}) {
  const researchItems = Array.isArray(state.researchItems) ? state.researchItems : [];
  const savedNotes = Array.isArray(state.savedNotes) ? state.savedNotes : [];

  const counts = {
    totalInbox: researchItems.length,
    waiting: 0,
    analyzing: 0,
    analyzedNotSaved: 0,
    savedContent: 0,
    savedPackaging: 0,
    savedBoth: 0,
    unavailable: 0,
    
    // Explicit Vault Metrics (Dashboard Reference Count)
    vault: {
      contentNotesCount: savedNotes.filter(n => n.lens === 'content').length,
      packagingNotesCount: savedNotes.filter(n => n.lens === 'packaging').length,
      totalSavedNotes: savedNotes.length,
      distinctSavedSources: new Set(savedNotes.map(n => n.sourceId)).size
    }
  };

  researchItems.forEach(item => {
    const status = computeItemStatus(item, savedNotes);
    switch (status) {
      case RESEARCH_STATUSES.WAITING:
        counts.waiting++;
        break;
      case RESEARCH_STATUSES.ANALYZING:
        counts.analyzing++;
        break;
      case RESEARCH_STATUSES.ANALYZED_NOT_SAVED:
        counts.analyzedNotSaved++;
        break;
      case RESEARCH_STATUSES.SAVED_CONTENT:
        counts.savedContent++;
        break;
      case RESEARCH_STATUSES.SAVED_PACKAGING:
        counts.savedPackaging++;
        break;
      case RESEARCH_STATUSES.SAVED_BOTH:
        counts.savedBoth++;
        break;
      case RESEARCH_STATUSES.UNAVAILABLE:
        counts.unavailable++;
        break;
      default:
        counts.analyzedNotSaved++;
    }
  });

  return counts;
}

/**
 * Filters and searches research inbox items.
 * 
 * @param {Array<object>} items 
 * @param {Array<object>} sources 
 * @param {Array<object>} savedNotes 
 * @param {object} options - { filterStatus, query, sort }
 * @returns {Array<object>} Enriched filtered items
 */
export function filterInboxItems(items = [], sources = [], savedNotes = [], options = {}) {
  const { filterStatus = 'all', query = '', sort = 'newest' } = options;
  const sourcesMap = new Map(sources.map(s => [s.id, s]));

  // 1. Enrich items with source and computed status
  const enriched = items.map(item => {
    const source = sourcesMap.get(item.sourceId) || {
      id: item.sourceId,
      title: 'Untitled Source Clip',
      creator: 'Unknown Creator',
      url: '',
      thumbnail: 'assets/video_preview.png',
      tags: []
    };
    const computedStatus = computeItemStatus(item, savedNotes);
    const itemNotes = savedNotes.filter(n => n.sourceId === item.sourceId);

    return {
      ...item,
      source,
      computedStatus,
      statusConfig: STATUS_CONFIG[computedStatus] || STATUS_CONFIG[RESEARCH_STATUSES.ANALYZED_NOT_SAVED],
      savedNotes: itemNotes
    };
  });

  // 2. Filter by status
  let filtered = enriched;
  if (filterStatus && filterStatus !== 'all') {
    filtered = filtered.filter(row => {
      if (filterStatus === 'saved') {
        return row.computedStatus === RESEARCH_STATUSES.SAVED_CONTENT ||
               row.computedStatus === RESEARCH_STATUSES.SAVED_PACKAGING ||
               row.computedStatus === RESEARCH_STATUSES.SAVED_BOTH;
      }
      return row.computedStatus === filterStatus || row.statusConfig.key === filterStatus;
    });
  }

  // 3. Filter by search query
  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    filtered = filtered.filter(row => {
      const title = (row.source.title || '').toLowerCase();
      const creator = (row.source.creator || '').toLowerCase();
      const url = (row.source.url || '').toLowerCase();
      const tags = (row.source.tags || []).join(' ').toLowerCase();
      const statusLabel = row.computedStatus.toLowerCase();
      return title.includes(q) || creator.includes(q) || url.includes(q) || tags.includes(q) || statusLabel.includes(q);
    });
  }

  // 4. Sort
  filtered.sort((a, b) => {
    if (sort === 'oldest') {
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    }
    // Default newest first
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  return filtered;
}

/**
 * Generates HTML string for a single status badge
 * @param {string} status 
 * @param {object} [options={}]
 * @returns {string}
 */
export function renderStatusBadge(status, options = {}) {
  const normStatus = normalizeStatus(status);
  const config = STATUS_CONFIG[normStatus] || STATUS_CONFIG[RESEARCH_STATUSES.ANALYZED_NOT_SAVED];
  const extraClass = options.extraClass ? ` ${options.extraClass}` : '';
  const testId = options.testId || 'status-badge';

  return `
    <span 
      class="status-badge ${config.badgeClass}${extraClass}" 
      data-testid="${testId}" 
      data-status="${normStatus}"
      data-status-key="${config.key}"
      title="${config.description}"
    >
      <span class="badge-icon-box" aria-hidden="true">${config.icon}</span>
      <span class="badge-text">${config.label}</span>
      <span class="badge-sub-th" aria-hidden="true">(${config.labelTh})</span>
    </span>
  `.trim();
}

/**
 * Generates HTML string for a single inbox row
 * Strict DOD requirements:
 * - Row element ID: `inbox-row-{id}`
 * - Row testid: `inbox-row-{id}`
 * - Status badge testid: `status-badge`
 * - Class `status-badge`
 * 
 * @param {object} item - Research item
 * @param {object} source - Source metadata
 * @param {Array<object>} savedNotes - All saved notes
 * @returns {string} HTML string
 */
export function renderInboxRow(item, source = {}, savedNotes = []) {
  if (!item) return '';

  const itemId = item.id || `item-${Date.now()}`;
  const sourceId = item.sourceId || source.id || 'unknown';
  const computedStatus = computeItemStatus(item, savedNotes);
  const statusCfg = STATUS_CONFIG[computedStatus] || STATUS_CONFIG[RESEARCH_STATUSES.ANALYZED_NOT_SAVED];
  
  const title = source.title || 'Untitled Reference Clip';
  const creator = source.creator || 'Unknown Creator';
  const duration = source.duration || '--:--';
  const url = source.url || '';
  const tags = Array.isArray(source.tags) ? source.tags : [];
  
  const notesForSource = savedNotes.filter(n => n.sourceId === sourceId);
  const hasContentNote = notesForSource.some(n => n.lens === 'content');
  const hasPackagingNote = notesForSource.some(n => n.lens === 'packaging');

  // Format date readable
  let dateFormatted = 'Recently';
  if (item.createdAt) {
    try {
      const d = new Date(item.createdAt);
      dateFormatted = d.toLocaleDateString('th-TH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      dateFormatted = 'Recently';
    }
  }

  // Row modifier class for styling
  const rowClassModifier = `row-status-${statusCfg.key}`;

  return `
    <li 
      class="inbox-row ${rowClassModifier}" 
      id="inbox-row-${itemId}" 
      data-testid="inbox-row-${itemId}"
      data-item-id="${itemId}"
      data-source-id="${sourceId}"
      data-status="${computedStatus}"
    >
      <div class="row-main-wrap">
        
        <!-- Column 1: Video Preview & Duration -->
        <div class="row-media-col">
          <div class="row-thumbnail-box">
            <img 
              src="${source.thumbnail || 'assets/video_preview.png'}" 
              alt="${title}"
              class="row-thumb-img"
              loading="lazy"
              onerror="this.style.opacity='0.4'; this.parentElement.classList.add('thumb-fallback');"
            />
            <span class="row-duration-pill">${duration}</span>
            <span class="thumb-watermark-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            </span>
          </div>
        </div>

        <!-- Column 2: Source Details & Provenance -->
        <div class="row-info-col">
          <div class="row-header-meta">
            <span class="row-creator-name">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              ${creator}
            </span>
            <span class="row-date-badge">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
              ${dateFormatted}
            </span>
          </div>

          <h3 class="row-title">
            <button 
              type="button" 
              class="row-title-btn btn-open-inbox-row" 
              data-action="btn-open-inbox-row" 
              data-target="S02" 
              data-source-id="${sourceId}"
              data-item-id="${itemId}"
              title="คลิกเพื่อเปิดหน้า S02 Research Detail"
            >
              ${title}
            </button>
          </h3>

          <div class="row-footer-meta">
            ${url ? `
              <a href="${url}" target="_blank" rel="noopener noreferrer" class="row-url-link" title="เปิดดูคลิปต้นฉบับ">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                <span>Original Link</span>
              </a>
            ` : ''}

            <!-- Tags -->
            <div class="row-tags-wrap" aria-label="หมวดหมู่">
              ${tags.slice(0, 3).map(tag => `<span class="row-tag">#${tag}</span>`).join('')}
            </div>
          </div>
        </div>

        <!-- Column 3: Status Badge & Vault Notes Indicators -->
        <div class="row-status-col">
          
          <!-- Canonical Status Badge (DOD requirement) -->
          <div class="status-badge-container">
            ${renderStatusBadge(computedStatus, { testId: 'status-badge' })}
          </div>

          <!-- Vault Lens Indicators (if saved) -->
          <div class="vault-indicators-wrap">
            ${hasContentNote ? `
              <span class="vault-lens-chip content-chip" title="บันทึกเข้า Content Vault แล้ว">
                <span class="chip-dot"></span>
                <span>Content Vault</span>
              </span>
            ` : ''}
            ${hasPackagingNote ? `
              <span class="vault-lens-chip packaging-chip" title="บันทึกเข้า Packaging Vault แล้ว">
                <span class="chip-dot"></span>
                <span>Packaging Vault</span>
              </span>
            ` : ''}
            ${!hasContentNote && !hasPackagingNote && computedStatus === RESEARCH_STATUSES.ANALYZED_NOT_SAVED ? `
              <span class="vault-lens-chip not-saved-chip" title="ยังไม่ถูกบันทึกเข้า Vault ใด ๆ">
                <span class="chip-dot"></span>
                <span>Not in Vault</span>
              </span>
            ` : ''}
          </div>

        </div>

        <!-- Column 4: Action Buttons -->
        <div class="row-actions-col">
          <button 
            type="button" 
            class="btn-row-action btn-inspect btn-open-inbox-row" 
            data-action="btn-open-inbox-row" 
            data-target="S02" 
            data-source-id="${sourceId}"
            data-item-id="${itemId}"
            aria-label="เปิดหน้าวิเคราะห์คลิป ${title}"
          >
            <span>Open S02</span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

          <!-- Interactive A05 Test Shortcut -->
          <button 
            type="button" 
            class="btn-row-ghost btn-simulate-a05" 
            data-action="simulate-a05" 
            data-source-id="${sourceId}"
            title="ทดสอบเงื่อนไข A05: เพิ่ม Lens สลับสถานะ Saved"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14"></path>
            </svg>
            <span>Toggle Lens (A05)</span>
          </button>
        </div>

      </div>
    </li>
  `.trim();
}

/**
 * Controller class for S01 Research Inbox UI
 */
export class ResearchInboxController {
  constructor(options = {}) {
    this.root = null;
    this.listContainer = null;
    this.filterTabs = [];
    this.searchInput = null;
    this.summaryDisplays = {};
    
    this.currentFilter = options.initialFilter || 'all';
    this.currentQuery = '';
    this.currentSort = 'newest';
    
    this.unsubscribeStore = null;
    this.isMounted = false;

    // Bind methods
    this.handleStoreChange = this.handleStoreChange.bind(this);
    this.handleFilterClick = this.handleFilterClick.bind(this);
    this.handleSearchInput = this.handleSearchInput.bind(this);
    this.handleRowAction = this.handleRowAction.bind(this);
  }

  /**
   * Mounts controller to DOM container
   * @param {HTMLElement|string} rootOrSelector 
   */
  mount(rootOrSelector) {
    if (typeof document === 'undefined') return this;

    const el = typeof rootOrSelector === 'string'
      ? document.querySelector(rootOrSelector)
      : rootOrSelector;

    if (!el) {
      console.warn('[ResearchInbox] Mount target not found:', rootOrSelector);
      return this;
    }

    this.root = el;
    this.initElements();
    this.bindEvents();
    this.render();

    // Subscribe to store updates
    if (typeof getState === 'function') {
      const state = getState();
      if (state && typeof state.subscribe === 'function') {
        this.unsubscribeStore = state.subscribe(this.handleStoreChange);
      }
    }

    this.isMounted = true;
    return this;
  }

  /**
   * Finds and caches DOM elements within root
   */
  initElements() {
    if (!this.root) return;

    this.listContainer = this.root.querySelector('#inbox-list, [data-testid="inbox-list"]');
    this.filterTabs = Array.from(this.root.querySelectorAll('[data-inbox-filter]'));
    this.searchInput = this.root.querySelector('#input-inbox-search, [data-testid="input-inbox-search"]');
    
    // Summary tally nodes
    this.summaryDisplays = {
      total: this.root.querySelector('[data-tally="total"]'),
      waiting: this.root.querySelector('[data-tally="waiting"]'),
      analyzing: this.root.querySelector('[data-tally="analyzing"]'),
      analyzedNotSaved: this.root.querySelector('[data-tally="analyzed-not-saved"]'),
      savedContent: this.root.querySelector('[data-tally="saved-content"]'),
      savedPackaging: this.root.querySelector('[data-tally="saved-packaging"]'),
      savedBoth: this.root.querySelector('[data-tally="saved-both"]'),
      unavailable: this.root.querySelector('[data-tally="unavailable"]'),
      vaultContent: this.root.querySelector('[data-tally="vault-content"]'),
      vaultPackaging: this.root.querySelector('[data-tally="vault-packaging"]'),
      vaultTotal: this.root.querySelector('[data-tally="vault-total"]')
    };
  }

  /**
   * Binds user event listeners
   */
  bindEvents() {
    if (!this.root) return;

    // Filter tab buttons
    this.filterTabs.forEach(btn => {
      btn.addEventListener('click', this.handleFilterClick);
    });

    // Search input
    if (this.searchInput) {
      this.searchInput.addEventListener('input', this.handleSearchInput);
    }

    // Inbox list delegated clicks
    if (this.listContainer) {
      this.listContainer.addEventListener('click', this.handleRowAction);
    }

    // Clear search button
    const clearBtn = this.root.querySelector('#btn-clear-search');
    if (clearBtn && this.searchInput) {
      clearBtn.addEventListener('click', () => {
        this.searchInput.value = '';
        this.currentQuery = '';
        this.renderList();
      });
    }

    // A05 Demo simulation button in header
    const demoA05Btn = this.root.querySelector('#btn-demo-a05');
    if (demoA05Btn) {
      demoA05Btn.addEventListener('click', () => this.runA05DemoSequence());
    }
  }

  /**
   * Store change subscriber callback
   */
  handleStoreChange() {
    this.render();
  }

  /**
   * Filter tab click handler
   * @param {Event} e 
   */
  handleFilterClick(e) {
    const target = e.currentTarget;
    const filter = target.getAttribute('data-inbox-filter') || 'all';

    this.currentFilter = filter;
    this.filterTabs.forEach(t => {
      const active = t === target;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    this.renderList();
  }

  /**
   * Search input handler (debounced)
   * @param {Event} e 
   */
  handleSearchInput(e) {
    this.currentQuery = e.target.value || '';
    this.renderList();
  }

  /**
   * Handles delegated actions on inbox rows
   * @param {Event} e 
   */
  handleRowAction(e) {
    const button = e.target.closest('button, [data-action]');
    if (!button) return;

    const action = button.getAttribute('data-action') || '';
    const sourceId = button.getAttribute('data-source-id') || '';
    const itemId = button.getAttribute('data-item-id') || '';

    // Action 1: Open S02 Research Detail
    if (action === 'btn-open-inbox-row' || button.classList.contains('btn-open-inbox-row')) {
      if (typeof router !== 'undefined' && typeof router.go === 'function') {
        router.go('S02', { sourceId, itemId });
      }
      return;
    }

    // Action 2: Simulate A05 toggle
    if (action === 'simulate-a05') {
      this.toggleSourceLensForA05(sourceId);
      return;
    }
  }

  /**
   * Demonstrates Spec Scenario A05:
   * "เคย Save Content แล้วกลับมาเพิ่ม Packaging -> เพิ่ม Packaging note โดยคง Content note เดิม"
   * Status automatically transitions from 'Saved to Content' -> 'Saved to Both'
   * 
   * @param {string} sourceId 
   */
  toggleSourceLensForA05(sourceId) {
    if (!sourceId) return;

    const state = typeof getState === 'function' ? getState() : { savedNotes: [] };
    const notes = state.savedNotes.filter(n => n.sourceId === sourceId);
    const hasContent = notes.some(n => n.lens === 'content');
    const hasPackaging = notes.some(n => n.lens === 'packaging');

    if (!hasContent && !hasPackaging) {
      // Step 1: Save Content
      dispatch({
        type: 'SAVE_NOTE',
        payload: {
          id: `note-${sourceId}-content-${Date.now()}`,
          sourceId: sourceId,
          lens: 'content',
          why: 'ชอบสาระหลักและข้อคิดจากคลิปนี้ (A05 Step 1: Saved to Content)',
          tags: ['A05-Test', 'Content'],
          createdAt: new Date().toISOString()
        }
      });
    } else if (hasContent && !hasPackaging) {
      // Step 2: Add Packaging later (A05 key requirement)
      dispatch({
        type: 'SAVE_NOTE',
        payload: {
          id: `note-${sourceId}-packaging-${Date.now()}`,
          sourceId: sourceId,
          lens: 'packaging',
          why: 'กลับมาเพิ่มมุมมองเทคนิคการเล่าและจังหวะตัดต่อ (A05 Step 2: Now Saved to Both)',
          tags: ['A05-Test', 'Packaging'],
          createdAt: new Date().toISOString()
        }
      });
    } else {
      // Step 3: Reset notes for this source back to Not Saved for endless cycling
      notes.forEach(n => {
        dispatch({ type: 'DELETE_NOTE', payload: n.id });
      });
    }

    this.render();
  }

  /**
   * Executes a complete automated A05 demonstration
   */
  runA05DemoSequence() {
    const state = typeof getState === 'function' ? getState() : { sources: [] };
    const testSource = (state.sources && state.sources[0]) || { id: 'source-demo' };
    this.toggleSourceLensForA05(testSource.id);
  }

  /**
   * Full render of summary metrics and filtered items list
   */
  render() {
    this.renderSummary();
    this.renderList();
  }

  /**
   * Renders summary tallies into DOM
   */
  renderSummary() {
    if (!this.root) return;

    const state = typeof getState === 'function' ? getState() : {};
    const summary = getInboxSummary(state);

    if (this.summaryDisplays.total) this.summaryDisplays.total.textContent = summary.totalInbox;
    if (this.summaryDisplays.waiting) this.summaryDisplays.waiting.textContent = summary.waiting;
    if (this.summaryDisplays.analyzing) this.summaryDisplays.analyzing.textContent = summary.analyzing;
    if (this.summaryDisplays.analyzedNotSaved) this.summaryDisplays.analyzedNotSaved.textContent = summary.analyzedNotSaved;
    if (this.summaryDisplays.savedContent) this.summaryDisplays.savedContent.textContent = summary.savedContent;
    if (this.summaryDisplays.savedPackaging) this.summaryDisplays.savedPackaging.textContent = summary.savedPackaging;
    if (this.summaryDisplays.savedBoth) this.summaryDisplays.savedBoth.textContent = summary.savedBoth;
    if (this.summaryDisplays.unavailable) this.summaryDisplays.unavailable.textContent = summary.unavailable;

    // Vault tallies (Demonstrating Inbox is separate from Vault - A01, A07)
    if (this.summaryDisplays.vaultContent) this.summaryDisplays.vaultContent.textContent = summary.vault.contentNotesCount;
    if (this.summaryDisplays.vaultPackaging) this.summaryDisplays.vaultPackaging.textContent = summary.vault.packagingNotesCount;
    if (this.summaryDisplays.vaultTotal) this.summaryDisplays.vaultTotal.textContent = summary.vault.totalSavedNotes;
  }

  /**
   * Renders list of rows into #inbox-list
   */
  renderList() {
    if (!this.listContainer) return;

    const state = typeof getState === 'function' ? getState() : { researchItems: [], sources: [], savedNotes: [] };
    const items = state.researchItems || [];
    const sources = state.sources || [];
    const savedNotes = state.savedNotes || [];

    const filtered = filterInboxItems(items, sources, savedNotes, {
      filterStatus: this.currentFilter,
      query: this.currentQuery,
      sort: this.currentSort
    });

    if (filtered.length === 0) {
      this.listContainer.innerHTML = `
        <li class="inbox-empty-row" data-testid="inbox-empty-state">
          <div class="empty-state-card">
            <span class="empty-icon" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <h4 class="empty-title">ไม่พบคลิปในหมวดนี้</h4>
            <p class="empty-desc">
              ${this.currentQuery ? `ไม่มีคลิปที่ตรงกับคำค้นหา "${this.currentQuery}"` : 'ยังไม่มีคลิปในสถานะนี้ใน Research Inbox'}
            </p>
            <button type="button" class="btn-pill btn-ghost btn-sm" id="btn-reset-filters">
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        </li>
      `;

      const resetBtn = this.listContainer.querySelector('#btn-reset-filters');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.currentFilter = 'all';
          this.currentQuery = '';
          if (this.searchInput) this.searchInput.value = '';
          this.filterTabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-inbox-filter') === 'all'));
          this.renderList();
        });
      }
      return;
    }

    // Render HTML rows
    const rowsHtml = filtered.map(row => {
      return renderInboxRow(row, row.source, savedNotes);
    }).join('\n');

    this.listContainer.innerHTML = rowsHtml;
  }

  /**
   * Destroys controller and cleans up listeners
   */
  destroy() {
    if (typeof this.unsubscribeStore === 'function') {
      this.unsubscribeStore();
      this.unsubscribeStore = null;
    }
    this.isMounted = false;
  }
}

/**
 * Convenience auto-initializer for standalone browser usage
 */
export function initResearchInbox(rootSelector = '#research-inbox-root') {
  if (typeof document === 'undefined') return null;
  const controller = new ResearchInboxController();
  return controller.mount(rootSelector);
}
