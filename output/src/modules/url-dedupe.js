/**
 * ==============================================================================
 * MEW CONTENT OS — URL Dedupe & Media States Controller (Topic T07)
 * Pure Client-Side JavaScript (ES6+ Module) · Zero Server Dependencies
 * Theme: mewteetawat.com V6.3
 * 
 * References:
 * - MEW_Content_OS_Founder_UX_Spec_TH.md (Spec A15, A16, D9)
 * - plan.md (Topic T07)
 * 
 * Definition of Done (DOD) Checklist:
 * - JS: normalizeUrl(url) ตัด tracking param/fragment; วาง URL ซ้ำ → เปิด source เดิม
 *       ไม่สร้าง source ใหม่ (A16) และแสดง banner-duplicate-source
 * - JS: ถ้า analyze ใหม่ของ source เดิม → สร้าง analysis version ใหม่ ไม่ลบ version เก่า
 * - HTML: state-unavailable (เข้าถึงสื่อไม่ได้) และ state-partial (ได้ข้อมูลบางส่วน)
 *         พร้อมปุ่ม btn-request-transcript ขอไฟล์/Transcript ที่มีสิทธิ์
 * - JS: เมื่อ unavailable ห้ามแสดงผลวิเคราะห์ภาพ/เสียงปลอม — แท็บ Packaging
 *         แสดงข้อความ "วิเคราะห์ไม่ได้" และสถานะเป็น Analysis unavailable (A15)
 * - CSS: state-unavailable/partial แยกสีออกจากสถานะปกติอย่างชัดเจน
 * 
 * Strict Negative Constraint:
 * Absolutely NO fake or arbitrary statistics (e.g. "arbitrary weeks", "+arbitrary weeksนี้").
 * ==============================================================================
 */

import { getState, dispatch } from './store.js';
import { router, go as routerGo } from './router.js';

/**
 * Standard list of marketing, ad, and social sharing tracking query parameters
 * that must be stripped during URL normalization.
 */
export const TRACKING_PARAMS = Object.freeze(new Set([
  // UTM parameters
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
  'utm_source_platform',
  'utm_creative_format',
  'utm_marketing_tactic',
  'utm_reader',
  'utm_name',
  // Social media & Ad click IDs
  'fbclid',
  'gclid',
  'gclsrc',
  'dclid',
  'wbraid',
  'gbraid',
  'msclkid',
  'igshid',
  'igsh',
  'ttclid',
  // Platform share tokens & internal referral features
  'si',          // YouTube share identifier
  'feature',     // YouTube feature tracking (e.g. feature=share, feature=youtu.be)
  'ref',
  'ref_src',
  'ref_url',
  'trk',
  'tracking_id',
  'track_id',
  // Marketing automation trackers
  '_hsenc',
  '_hsmi',
  'mc_cid',
  'mc_eid',
  // Twitter / X / Other social share trackers
  'spm',
  'yclid',
  'wickedid',
  's_kwcid'
]));

/**
 * Normalizes a raw video URL string:
 * 1. Trims whitespace and strips hash fragments (`#...`)
 * 2. Normalizes scheme and host to lowercase
 * 3. Removes 'www.' prefix for consistency
 * 4. Strips standard ports (:80, :443)
 * 5. Canonicalizes short URLs (e.g. youtu.be/<id> -> youtube.com/watch?v=<id>)
 * 6. Strips known tracking query parameters (UTM, fbclid, igshid, si, feature, etc.)
 * 7. Alphabetically sorts remaining valid query parameters
 * 8. Strips trailing slashes from pathnames (except root '/')
 * 
 * @param {string} rawUrl - Raw input URL from user
 * @returns {string} Normalized canonical URL
 * @throws {Error} When URL is empty or malformed
 */
export function normalizeUrl(rawUrl) {
  if (typeof rawUrl !== 'string') {
    throw new TypeError('URL must be a non-empty string');
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    throw new Error('URL_EMPTY: URL cannot be blank');
  }

  // Parse URL safely
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch (err) {
    throw new Error(`URL_MALFORMED: Invalid URL format (${err.message})`);
  }

  // Ensure valid HTTP / HTTPS protocol
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error(`INVALID_PROTOCOL: Protocol must be http: or https:, got ${parsed.protocol}`);
  }

  // 1. Strip fragment / hash completely
  parsed.hash = '';

  // 2. Normalize protocol to lowercase
  let protocol = parsed.protocol.toLowerCase();

  // 3. Normalize host: lowercase and strip 'www.'
  let host = parsed.hostname.toLowerCase().replace(/^www\./, '');

  // Strip standard default ports
  if ((protocol === 'http:' && parsed.port === '80') || (protocol === 'https:' && parsed.port === '443')) {
    parsed.port = '';
  }

  let pathname = parsed.pathname;

  // 4. Handle YouTube canonicalization
  // Map youtu.be/<id> -> youtube.com/watch?v=<id>
  if (host === 'youtu.be') {
    const videoId = pathname.replace(/^\/+/, '').split('/')[0];
    host = 'youtube.com';
    pathname = '/watch';
    if (videoId) {
      parsed.searchParams.set('v', videoId);
    }
  }

  // 5. Filter out tracking parameters and sort remaining params
  const cleanParams = new URLSearchParams();
  const sortedKeys = Array.from(parsed.searchParams.keys()).sort();

  for (const key of sortedKeys) {
    const lowerKey = key.toLowerCase();
    // Check against tracking parameter blacklist
    if (TRACKING_PARAMS.has(lowerKey)) {
      continue;
    }
    // Also skip any parameter matching regex patterns like utm_*
    if (/^utm_/i.test(key)) {
      continue;
    }
    
    // Preserve legitimate parameters (e.g. 'v' for YouTube, 't' if media timestamp)
    const values = parsed.searchParams.getAll(key);
    for (const val of values) {
      cleanParams.append(key, val);
    }
  }

  // 6. Normalize pathname (remove trailing slashes unless root '/')
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.replace(/\/+$/, '');
  }

  // Construct canonical normalized URL
  const searchString = cleanParams.toString();
  const querySuffix = searchString ? `?${searchString}` : '';
  const portSuffix = parsed.port ? `:${parsed.port}` : '';

  return `${protocol}//${host}${portSuffix}${pathname}${querySuffix}`;
}

/**
 * Checks whether a parameter name is a recognized tracking parameter.
 * @param {string} paramName 
 * @returns {boolean}
 */
export function isTrackingParam(paramName) {
  if (!paramName || typeof paramName !== 'string') return false;
  const lower = paramName.toLowerCase();
  return TRACKING_PARAMS.has(lower) || /^utm_/i.test(lower);
}

/**
 * Searches the store or provided list of sources for an existing source
 * whose normalized URL matches the incoming raw URL (A16 Deduplication Check).
 * 
 * @param {string} rawUrl - Incoming URL to test
 * @param {Array<object>} [sourcesList] - Optional custom sources array
 * @returns {object|null} Matched existing source object or null
 */
export function findDuplicateSource(rawUrl, sourcesList = null) {
  if (!rawUrl) return null;

  let normalizedInput;
  try {
    normalizedInput = normalizeUrl(rawUrl);
  } catch {
    return null;
  }

  const sources = Array.isArray(sourcesList) 
    ? sourcesList 
    : (getState().sources || []);

  for (const source of sources) {
    if (!source || !source.url) continue;
    try {
      const normalizedExisting = normalizeUrl(source.url);
      if (normalizedExisting === normalizedInput) {
        return source;
      }
    } catch {
      // If an existing source has unparseable url, fall back to exact string match
      if (source.url.trim() === rawUrl.trim()) {
        return source;
      }
    }
  }

  return null;
}

/**
 * Ingests a URL with full A16 deduplication compliance:
 * - Normalizes URL and cuts tracking parameters / fragments
 * - If URL already exists in sources:
 *     1. Opens existing source (does NOT create a new source)
 *     2. Renders / returns banner-duplicate-source
 *     3. Returns existing source and researchItem
 * - If URL is new:
 *     1. Creates a new canonical source in store
 *     2. Creates a new researchItem with status 'Waiting for analysis'
 *     3. Dispatches ADD_SOURCE and ADD_RESEARCH_ITEM
 * 
 * @param {string} rawUrl 
 * @param {object} [options={}] - Options: extraMeta, navigate, onDuplicate, onNew
 * @returns {{ isDuplicate: boolean, source: object, researchItem: object, bannerData?: object }}
 */
export function ingestUrlWithDedupe(rawUrl, options = {}) {
  const normalized = normalizeUrl(rawUrl);
  const state = getState();
  const existingSource = findDuplicateSource(normalized, state.sources);

  // CASE 1: DUPLICATE SOURCE DETECTED (A16)
  if (existingSource) {
    // Locate corresponding research item
    const existingItem = (state.researchItems || []).find(
      item => item.sourceId === existingSource.id
    ) || {
      id: `item-${existingSource.id}`,
      sourceId: existingSource.id,
      status: 'Analyzed · Not saved'
    };

    // Locate analysis versions if any
    const existingAnalyses = (state.analyses || []).filter(
      a => a.sourceId === existingSource.id
    );

    const bannerData = {
      isDuplicate: true,
      existingSourceId: existingSource.id,
      title: existingSource.title,
      creator: existingSource.creator,
      url: existingSource.url,
      versionCount: Math.max(1, existingAnalyses.length),
      message: 'พบ URL ซ้ำในระบบ: เปิดข้อมูลเดิมให้อัตโนมัติ (ไม่สร้าง source ซ้ำซ้อน)'
    };

    // Callback notification
    if (typeof options.onDuplicate === 'function') {
      options.onDuplicate(bannerData);
    }

    // Auto-render banner in DOM if container exists
    if (typeof document !== 'undefined') {
      renderDuplicateBanner(existingSource);
    }

    // Optional navigation to S02
    if (options.navigate) {
      if (typeof router !== 'undefined' && typeof router.go === 'function') {
        router.go('S02', { sourceId: existingSource.id, itemId: existingItem.id, duplicate: true });
      } else {
        routerGo('S02', { sourceId: existingSource.id, itemId: existingItem.id, duplicate: true });
      }
    }

    return {
      isDuplicate: true,
      source: existingSource,
      researchItem: existingItem,
      bannerData
    };
  }

  // CASE 2: NOVEL SOURCE (Create new source and research item)
  const extra = options.extraMeta || {};
  const sourceId = extra.id || `source-url-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  // Default readable metadata
  const defaultTitle = extra.title || extractFallbackTitle(normalized);
  const defaultCreator = extra.creator || extractFallbackCreator(normalized);

  const newSource = {
    id: sourceId,
    title: defaultTitle,
    creator: defaultCreator,
    url: normalized,
    duration: extra.duration || '02:00',
    thumbnail: extra.thumbnail || 'assets/video_preview.png',
    hasPermission: true,
    tags: extra.tags || ['Research', 'Reference'],
    createdAt: new Date().toISOString()
  };

  const newResearchItem = {
    id: `item-${sourceId}`,
    sourceId: sourceId,
    status: 'Waiting for analysis',
    createdAt: new Date().toISOString()
  };

  dispatch({ type: 'ADD_SOURCE', payload: newSource });
  dispatch({ type: 'ADD_RESEARCH_ITEM', payload: newResearchItem });

  if (typeof options.onNew === 'function') {
    options.onNew({ source: newSource, researchItem: newResearchItem });
  }

  if (options.navigate) {
    if (typeof router !== 'undefined' && typeof router.go === 'function') {
      router.go('S02', { sourceId: newSource.id, itemId: newResearchItem.id });
    } else {
      routerGo('S02', { sourceId: newSource.id, itemId: newResearchItem.id });
    }
  }

  return {
    isDuplicate: false,
    source: newSource,
    researchItem: newResearchItem
  };
}

/**
 * Re-analyzes an existing source by creating a NEW analysis version
 * WITHOUT deleting or overwriting any previous versions (A16 requirement).
 * 
 * @param {string} sourceId - The sourceId to create a new analysis for
 * @param {object} [analysisPayload={}] - Optional new analysis content / packaging data
 * @returns {{ newAnalysis: object, version: number, allVersions: Array<object> }}
 */
export function createAnalysisVersion(sourceId, analysisPayload = {}) {
  if (!sourceId) {
    throw new Error('sourceId is required to create an analysis version');
  }

  const state = getState();
  const existingAnalyses = (state.analyses || []).filter(a => a.sourceId === sourceId);

  // Compute next version strictly incremented
  const maxVersion = existingAnalyses.reduce((max, a) => {
    const v = Number(a.version) || 1;
    return v > max ? v : max;
  }, 0);

  const nextVersion = maxVersion + 1;
  const analysisId = `analysis-${sourceId}-v${nextVersion}`;

  const newAnalysis = {
    id: analysisId,
    sourceId: sourceId,
    version: nextVersion,
    createdAt: new Date().toISOString(),
    isReanalysis: true,
    previousVersionId: existingAnalyses.length > 0 ? existingAnalyses[existingAnalyses.length - 1].id : null,
    content: analysisPayload.content || {
      coreIdea: `Re-analysis (v${nextVersion}) of source reference`,
      audience: 'General Audience',
      keyPoints: ['Updated synthesis with enhanced focus on founder application.'],
      claimsAndEvidence: [],
      examples: [],
      extendableAngles: [],
      whatIsGood: 'Updated core idea'
    },
    packaging: analysisPayload.packaging || {
      hook: 'Re-analyzed opening hook structure',
      openingPattern: 'Enhanced hook pattern',
      beats: 'Problem -> Context -> Resolution',
      pacing: 'Dynamic',
      musicSfx: 'Ambient background',
      editingMechanics: 'Clean cuts',
      timestampHighlights: [],
      whatIsGood: 'Pacing and structural clarity'
    }
  };

  // Dispatch to store: ADD_ANALYSIS appends the new analysis without mutating existing versions
  dispatch({ type: 'ADD_ANALYSIS', payload: newAnalysis });

  // Update researchItem active status to 'Analyzed · Not saved'
  const matchingItem = (state.researchItems || []).find(ri => ri.sourceId === sourceId);
  if (matchingItem) {
    dispatch({
      type: 'UPDATE_RESEARCH_ITEM',
      payload: {
        id: matchingItem.id,
        status: 'Analyzed · Not saved',
        activeAnalysisId: analysisId,
        updatedAt: new Date().toISOString()
      }
    });
  }

  const updatedAnalyses = (getState().analyses || []).filter(a => a.sourceId === sourceId);

  return {
    newAnalysis,
    version: nextVersion,
    allVersions: updatedAnalyses
  };
}

/**
 * Retrieves all historical analysis versions for a specific source.
 * Sorted chronologically by version number.
 * 
 * @param {string} sourceId 
 * @returns {Array<object>}
 */
export function getAnalysisVersions(sourceId) {
  if (!sourceId) return [];
  const analyses = getState().analyses || [];
  return analyses
    .filter(a => a.sourceId === sourceId)
    .sort((a, b) => (Number(a.version) || 1) - (Number(b.version) || 1));
}

/**
 * Handles media unavailable state strictly adhering to Spec A15:
 * When media or audio is inaccessible:
 * - Updates research item status to 'Analysis unavailable'
 * - Packages tab MUST display 'วิเคราะห์ไม่ได้'
 * - Stored analysis packaging status set to 'unavailable'
 * - Absolutely forbids generating fake waveforms, fake hooks, or fake pacing metrics.
 * 
 * @param {string} sourceId 
 * @param {string} [reason=''] 
 * @returns {object} Updated analysis and item
 */
export function markMediaUnavailable(sourceId, reason = '') {
  if (!sourceId) throw new Error('sourceId is required');

  const defaultReason = reason || 'เข้าถึงสื่อ/เสียงไม่ได้ตามหลักความซื่อสัตย์ ไม่สร้างข้อมูลวิเคราะห์เท็จ (A15)';

  // Update researchItem status
  const state = getState();
  const matchingItem = (state.researchItems || []).find(ri => ri.sourceId === sourceId);
  if (matchingItem) {
    dispatch({
      type: 'UPDATE_RESEARCH_ITEM',
      payload: {
        id: matchingItem.id,
        status: 'Analysis unavailable',
        unavailableReason: defaultReason,
        updatedAt: new Date().toISOString()
      }
    });
  }

  // Create an honest unavailable analysis record
  const unavailableAnalysis = {
    id: `analysis-${sourceId}-unavailable`,
    sourceId: sourceId,
    version: 1,
    createdAt: new Date().toISOString(),
    isUnavailable: true,
    content: {
      coreIdea: 'ไม่สามารถดึงสาระได้สมบูรณ์ เนื่องจากไม่สามารถเข้าถึงไฟล์สื่อต้นฉบับ',
      audience: 'ไม่ทราบ',
      keyPoints: [],
      claimsAndEvidence: [],
      examples: [],
      extendableAngles: [],
      whatIsGood: 'ไม่ทราบ'
    },
    packaging: {
      status: 'unavailable',
      label: 'Analysis unavailable',
      labelTh: 'วิเคราะห์ไม่ได้',
      reason: defaultReason,
      hasVideoAudio: false,
      packagingBlocked: true,
      hook: null,
      openingPattern: null,
      beats: null,
      pacing: null,
      musicSfx: null,
      editingMechanics: null,
      timestampHighlights: [],
      whatIsGood: null
    }
  };

  dispatch({ type: 'ADD_ANALYSIS', payload: unavailableAnalysis });

  return {
    status: 'Analysis unavailable',
    analysis: unavailableAnalysis
  };
}

/**
 * Marks media as partially accessible:
 * Content (WHAT) is partially extracted from subtitles or meta,
 * but Packaging (HOW) cannot be generated without full audio/video access.
 * 
 * @param {string} sourceId 
 * @param {object} [partialContent={}] 
 * @returns {object}
 */
export function markMediaPartial(sourceId, partialContent = {}) {
  if (!sourceId) throw new Error('sourceId is required');

  const partialAnalysis = {
    id: `analysis-${sourceId}-partial`,
    sourceId: sourceId,
    version: 1,
    createdAt: new Date().toISOString(),
    isPartial: true,
    content: {
      coreIdea: partialContent.coreIdea || 'สาระหลักบางส่วนจากคำบรรยาย (Partial Transcript)',
      audience: partialContent.audience || 'ทั่วไป',
      keyPoints: partialContent.keyPoints || ['ถอดรหัสได้เฉพาะข้อมูลข้อความบางส่วน'],
      claimsAndEvidence: [],
      examples: [],
      extendableAngles: [],
      whatIsGood: 'ข้อมูลบางส่วน'
    },
    packaging: {
      status: 'unavailable',
      label: 'Analysis unavailable',
      labelTh: 'วิเคราะห์ไม่ได้',
      reason: 'เข้าถึงเฉพาะข้อความ ไม่สามารถวิเคราะห์ลีลาเสียงและภาพได้ (A15)',
      hasVideoAudio: false,
      packagingBlocked: true,
      hook: null,
      openingPattern: null,
      beats: null,
      pacing: null,
      musicSfx: null,
      editingMechanics: null,
      timestampHighlights: [],
      whatIsGood: null
    }
  };

  dispatch({ type: 'ADD_ANALYSIS', payload: partialAnalysis });

  return {
    status: 'Partial Analysis',
    analysis: partialAnalysis
  };
}

/**
 * Pure DOM UI Helper: Renders the A16 duplicate banner in the DOM.
 * If element with id 'banner-duplicate-source' already exists, unhides it and fills data;
 * otherwise creates and prepends it to the container.
 * 
 * @param {object} source - The existing duplicate source record
 * @param {HTMLElement} [containerEl] - Target container (defaults to #research-entry-root or document.body)
 * @returns {HTMLElement} The banner element
 */
export function renderDuplicateBanner(source, containerEl = null) {
  if (typeof document === 'undefined') return null;

  const targetContainer = containerEl 
    || document.querySelector('#research-entry-root, [data-testid="research-entry-root"], .research-entry-container')
    || document.body;

  let banner = document.querySelector('#banner-duplicate-source, [data-testid="banner-duplicate-source"]');

  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'banner-duplicate-source';
    banner.setAttribute('data-testid', 'banner-duplicate-source');
    banner.className = 'mew-offer-card banner-duplicate-source';
    banner.setAttribute('role', 'alert');
    banner.setAttribute('aria-live', 'polite');
    targetContainer.prepend(banner);
  }

  const existingAnalyses = (getState().analyses || []).filter(a => a.sourceId === source.id);
  const versionCount = Math.max(1, existingAnalyses.length);

  banner.removeAttribute('hidden');
  banner.style.display = 'block';

  banner.innerHTML = `
    <div class="banner-duplicate-inner">
      <div class="banner-header-row">
        <div class="banner-badge-group">
          <span class="badge-pill violet-accent">A16 Canonical Duplicate</span>
          <span class="badge-status-inline">พบ URL ซ้ำในระบบ</span>
        </div>
        <button type="button" class="btn-dismiss-duplicate" id="btn-dismiss-duplicate-banner" data-testid="btn-dismiss-duplicate-banner" aria-label="ปิดการแจ้งเตือน">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="banner-body-content">
        <div class="banner-icon-box" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
        </div>
        <div class="banner-text-group">
          <h3 class="banner-title">ลิงก์นี้มีอยู่ในคลังอ้างอิงแล้ว — เปิดข้อมูลเดิมให้อัตโนมัติ</h3>
          <p class="banner-desc">
            ระบบป้องกันการสร้าง source ซ้ำซ้อนตามหลักความซื่อสัตย์ของข้อมูล (Spec A16) คุณสามารถเปิดดูข้อมูลที่วิเคราะห์ไว้แล้ว หรือสั่งวิเคราะห์ใหม่เพื่อสร้าง Analysis Version ใหม่ได้
          </p>
          <div class="banner-meta-pill-box">
            <span class="meta-tag"><strong>คลิปเดิม:</strong> ${escapeHtml(source.title || 'Untitled Source')}</span>
            <span class="meta-tag"><strong>ผู้สร้าง:</strong> ${escapeHtml(source.creator || 'Unknown')}</span>
            <span class="meta-tag"><strong>Version ที่มี:</strong> v${versionCount}</span>
          </div>
        </div>
      </div>

      <div class="banner-actions-row">
        <button type="button" class="btn-pill btn-primary btn-open-existing-source" id="btn-open-existing-source" data-testid="btn-open-existing-source">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="15 3 21 3 21 9"></polyline>
            <polyline points="9 21 3 21 3 15"></polyline>
            <line x1="21" y1="3" x2="14" y2="10"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
          <span>เปิดดูข้อมูลเดิม &rarr; S02</span>
        </button>

        <button type="button" class="btn-pill btn-ghost btn-reanalyze-source" id="btn-reanalyze-source" data-testid="btn-reanalyze-source">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
          <span>วิเคราะห์ใหม่ (สร้าง v${versionCount + 1})</span>
        </button>
      </div>
    </div>
  `;

  // Attach button interactions
  const btnOpen = banner.querySelector('#btn-open-existing-source');
  if (btnOpen) {
    btnOpen.onclick = () => {
      if (typeof router !== 'undefined' && typeof router.go === 'function') {
        router.go('S02', { sourceId: source.id });
      } else {
        routerGo('S02', { sourceId: source.id });
      }
    };
  }

  const btnReanalyze = banner.querySelector('#btn-reanalyze-source');
  if (btnReanalyze) {
    btnReanalyze.onclick = () => {
      createAnalysisVersion(source.id);
      if (typeof router !== 'undefined' && typeof router.go === 'function') {
        router.go('S02', { sourceId: source.id, reanalyzed: true });
      } else {
        routerGo('S02', { sourceId: source.id, reanalyzed: true });
      }
    };
  }

  const btnDismiss = banner.querySelector('#btn-dismiss-duplicate-banner');
  if (btnDismiss) {
    btnDismiss.onclick = () => {
      banner.setAttribute('hidden', 'true');
      banner.style.display = 'none';
    };
  }

  return banner;
}

/**
 * Pure DOM UI Helper: Renders the honest "วิเคราะห์ไม่ได้" state into the Packaging tab.
 * Strictly avoids showing any fake waveform, fake hook metrics, or arbitrary statistics.
 * 
 * @param {HTMLElement} packagingContainerEl 
 * @param {object} [options={}] 
 * @returns {HTMLElement}
 */
export function applyUnavailablePackaging(packagingContainerEl, options = {}) {
  if (!packagingContainerEl) return null;

  const reason = options.reason || 'เข้าถึงสื่อ/เสียงไม่ได้ตามหลักความซื่อสัตย์ ไม่สร้างข้อมูลวิเคราะห์เท็จ (A15)';
  const sourceId = options.sourceId || '';

  packagingContainerEl.innerHTML = `
    <div class="packaging-unavailable-notice" id="packaging-unavailable-notice" data-testid="packaging-unavailable-notice" role="region" aria-label="แท็บ Packaging: วิเคราะห์ไม่ได้">
      <div class="notice-badge-row">
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
        <span class="badge-kicker-coral">Spec ข้อ 0 &amp; A15 Honesty Guarantee</span>
      </div>

      <div class="notice-headline-group">
        <h3 class="notice-title">วิเคราะห์ไม่ได้</h3>
        <p class="notice-desc">
          ระบบไม่สามารถเข้าถึงไฟล์วิดีโอหรือสัญญาณเสียงความละเอียดสูงได้ จึงไม่สามารถถอดรหัสลีลา (HOW), จังหวะ (Pacing) หรือโครงสร้าง Hook ได้อย่างถูกต้อง
        </p>
        <p class="notice-subdesc">
          <strong>หลักความซื่อสัตย์ของ MEW:</strong> ระบบจะไม่แกล้งทำเสมือนว่าวิเคราะห์เสียงหรือภาพได้จริง และจะไม่สุ่มสร้างตัวเลขหรือผลวิเคราะห์ปลอมเด็ดขาด
        </p>
      </div>

      <div class="notice-reason-box">
        <span class="reason-icon" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </span>
        <span class="reason-text">${escapeHtml(reason)}</span>
      </div>

      <div class="notice-actions-group">
        <button type="button" class="btn-pill btn-primary btn-request-transcript" id="btn-request-transcript" data-testid="btn-request-transcript" data-source-id="${escapeHtml(sourceId)}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span>ขอไฟล์/Transcript ที่มีสิทธิ์</span>
        </button>

        <button type="button" class="btn-pill btn-ghost btn-upload-owned-fallback" id="btn-upload-owned-fallback">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <span>อัปโหลดคลิปที่คุณมีสิทธิ์แทน</span>
        </button>
      </div>
    </div>
  `;

  // Attach request transcript action
  const btnReq = packagingContainerEl.querySelector('#btn-request-transcript, [data-testid="btn-request-transcript"]');
  if (btnReq) {
    btnReq.onclick = () => {
      openTranscriptRequestModal({ sourceId });
    };
  }

  const btnUpload = packagingContainerEl.querySelector('#btn-upload-owned-fallback');
  if (btnUpload) {
    btnUpload.onclick = () => {
      if (typeof router !== 'undefined' && typeof router.go === 'function') {
        router.go('S01', { tab: 'upload' });
      } else {
        routerGo('S01', { tab: 'upload' });
      }
    };
  }

  return packagingContainerEl;
}

/**
 * Pure DOM UI Helper: Opens the Transcript Request Modal.
 * @param {object} [context={}] 
 */
export function openTranscriptRequestModal(context = {}) {
  if (typeof document === 'undefined') return;

  let modal = document.querySelector('#modal-request-transcript, [data-testid="modal-request-transcript"]');
  if (modal) {
    modal.removeAttribute('hidden');
    modal.classList.add('active');
    modal.style.display = 'flex';

    const sourceInput = modal.querySelector('#transcript-modal-source-id');
    if (sourceInput && context.sourceId) {
      sourceInput.value = context.sourceId;
    }

    const firstFocusable = modal.querySelector('button, input, textarea');
    if (firstFocusable) firstFocusable.focus();
  }
}

/**
 * Pure DOM UI Helper: Closes the Transcript Request Modal.
 */
export function closeTranscriptRequestModal() {
  if (typeof document === 'undefined') return;
  const modal = document.querySelector('#modal-request-transcript, [data-testid="modal-request-transcript"]');
  if (modal) {
    modal.setAttribute('hidden', 'true');
    modal.classList.remove('active');
    modal.style.display = 'none';
  }
}

/**
 * Fallback Title generator from clean URL
 */
function extractFallbackTitle(url) {
  try {
    const p = new URL(url);
    if (p.hostname.includes('youtube') || p.hostname.includes('youtu.be')) {
      return 'YouTube Reference Video';
    }
    if (p.hostname.includes('tiktok')) {
      return 'TikTok Reference Video';
    }
    if (p.hostname.includes('instagram')) {
      return 'Instagram Reels Reference';
    }
    return `Reference Video (${p.hostname})`;
  } catch {
    return 'Online Video Reference';
  }
}

/**
 * Fallback Creator generator from clean URL
 */
function extractFallbackCreator(url) {
  try {
    const p = new URL(url);
    return p.hostname.replace(/^www\./, '');
  } catch {
    return 'Online Creator';
  }
}

/**
 * Simple HTML escape helper
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
