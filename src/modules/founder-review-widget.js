/**
 * ==============================================================================
 * MEW CONTENT OS — Founder Review & Pinpoint Fix Widget (Client Controller)
 * ==============================================================================
 * Allows the Founder to visually pinpoint specific UI areas/blocks, write focused
 * reviews/fix instructions, trigger instant Gemini 4 Argon auto-fix via the
 * dashboard server, and switch to Client Hand-off Mode for clean delivery.
 * ==============================================================================
 */

export const STORAGE_KEY = 'mew_founder_reviews_v1';
export const CLIENT_MODE_KEY = 'mew_review_client_mode_v1';
export const CLOUD_RELAY_TOPIC = 'mew-content-os-pinpoint-v6';
export const CLOUD_RELAY_URL = 'https://ntfy.sh/mew-content-os-pinpoint-v6';

export const INSPECTABLE_BLOCKS_SELECTOR = [
  '.mew-offer-card',
  '.summary-card',
  '.panel-card',
  '.pipeline-item',
  '.kg-idea-card',
  '.kg-warning-banner',
  '.keep-going-modal',
  '.dashboard-hero',
  '.kpi-card',
  '.research-card',
  '.vault-card',
  '.basket-bar',
  '.board-column',
  '[data-review-block]',
  'header',
  'section',
  '.view-section'
].join(', ');

export const SECTION_MAP = [
  { id: 'view-overview', label: 'S00: Dashboard & Overview', file: 'src/components/dashboard.html, src/modules/dashboard.js' },
  { id: 'keep-going-modal', label: 'S00: Keep-Going Reminder & 20 Lifesaver Ideas Modal', file: 'src/modules/keep-going-modal.js, src/styles/keep-going-modal.css, src/index.html' },
  { id: 'view-research-entry', label: 'S01: Research Entry (URL / Upload / Feed)', file: 'src/components/research-entry.html, src/modules/research-entry.js' },
  { id: 'view-research-inbox', label: 'S01: Research Inbox & Badges', file: 'src/components/research-inbox.html, src/modules/research-inbox.js' },
  { id: 'view-research-detail', label: 'S02: Research Detail & Analysis Tabs', file: 'src/components/research-detail.html, src/modules/research-detail.js' },
  { id: 'modal-save-decision', label: 'S03: Save Decision Modal (Dual WHY)', file: 'src/components/save-modal.html, src/modules/save-commit.js' },
  { id: 'view-library', label: 'S04: Library (Dual-Vault Content & Packaging)', file: 'src/components/library.html, src/modules/library.js' },
  { id: 'view-saved-detail', label: 'S05: Saved Reference Detail', file: 'src/components/saved-reference-detail.html, src/modules/saved-reference-detail.js' },
  { id: 'modal-remix-picker', label: 'S06: Remix Reference Picker', file: 'src/components/remix-picker.html, src/modules/remix-picker.js' },
  { id: 'view-remix-workspace', label: 'S07: Remix Workspace (Ingredients, Direction, Concepts)', file: 'src/components/ws-ingredients.html, src/modules/ws-direction.js' },
  { id: 'view-concept-detail', label: 'S08: Concept Detail & Script Draft', file: 'src/components/concept-detail.html, src/modules/concept-detail.js' },
  { id: 'view-content-board', label: 'S09: Content Board & Director Brief', file: 'src/components/content-board.html, src/modules/content-board.js' },
  { id: 'app-header-shell', label: 'Global: Header, Navigation & App Shell', file: 'src/components/app-shell.html, src/styles/main.css' }
];

const IGNORED_CLASSES = new Set([
  'founder-inspect-hover',
  'founder-inspect-selected',
  'founder-has-pin',
  'is-active',
  'is-open'
]);

/**
 * Computes a specific CSS selector for a clicked DOM element.
 */
export function buildSelectorForElement(el) {
  if (!el || typeof el !== 'object') return '';

  if (el.id && typeof el.id === 'string' && el.id.trim()) {
    return `#${el.id.trim()}`;
  }

  const getAttr = (name) => (typeof el.getAttribute === 'function' ? el.getAttribute(name) : el[name] || el.dataset?.[name.replace(/^data-/, '').replace(/-([a-z])/g, (_, c) => c.toUpperCase())]);

  const ideaId = getAttr('data-idea-id');
  if (ideaId) {
    return `[data-idea-id="${ideaId}"]`;
  }

  const reviewBlock = getAttr('data-review-block');
  if (reviewBlock) {
    return `[data-review-block="${reviewBlock}"]`;
  }

  const navAttr = getAttr('data-navigate');
  if (navAttr) {
    return `[data-navigate="${navAttr}"]`;
  }

  const tag = String(el.tagName || 'div').toLowerCase();
  const rawClass = typeof el.className === 'string' ? el.className : '';
  const classes = rawClass
    .split(/\s+/)
    .map(c => c.trim())
    .filter(c => c && !IGNORED_CLASSES.has(c))
    .slice(0, 2);

  let selector = tag + (classes.length ? '.' + classes.join('.') : '');

  const parent = el.parentElement;
  if (parent && parent.children) {
    const siblings = Array.from(parent.children).filter(
      child => String(child.tagName || '').toLowerCase() === tag
    );
    if (siblings.length > 1) {
      const idx = siblings.indexOf(el);
      if (idx !== -1) {
        selector += `:nth-of-type(${idx + 1})`;
      }
    }
    if (parent.id && typeof parent.id === 'string' && parent.id.trim()) {
      selector = `#${parent.id.trim()} > ${selector}`;
    }
  }

  return selector;
}

/**
 * Extracts a short 80-character text snippet from an element.
 */
export function extractBlockSnippet(el) {
  if (!el || typeof el !== 'object') return '';
  const raw = String(el.textContent || '').replace(/\s+/g, ' ').trim();
  return raw.slice(0, 80);
}

export class FounderReviewWidget {
  constructor(options = {}) {
    this.storage = options.storage || (typeof localStorage !== 'undefined' ? localStorage : null);
    this.apiEndpoint = options.apiEndpoint || '/api/reviews';
    this.cloudRelayUrl = options.cloudRelayUrl !== undefined ? options.cloudRelayUrl : CLOUD_RELAY_URL;
    this.fetchImpl = options.fetch || (typeof fetch !== 'undefined' ? fetch.bind(globalThis) : null);
    this.location = options.location || null;
    this.reviews = this.loadReviews();
    this.isInspectMode = false;
    this.selectedTarget = null;
    this.selectedElement = null;
    this.currentTab = 'new'; // 'new' | 'history'
    this.container = null;
    this.pollTimer = null;
    this._boundGlobalEvents = false;
  }

  loadReviews() {
    if (!this.storage) return [];
    try {
      const data = this.storage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveReviews() {
    if (!this.storage) return;
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(this.reviews));
    } catch (e) {
      console.error('[FounderReview] Save error:', e);
    }
  }

  /* ==========================================================================
     Client Hand-off Mode (Hide review UI for real end clients)
     ========================================================================== */

  isClientMode() {
    if (!this.storage) return Boolean(this._clientMode);
    try {
      return this.storage.getItem(CLIENT_MODE_KEY) === '1';
    } catch (e) {
      return Boolean(this._clientMode);
    }
  }

  enableClientMode() {
    this._clientMode = true;
    if (this.storage) {
      try {
        this.storage.setItem(CLIENT_MODE_KEY, '1');
      } catch (e) {}
    }
    this.stopPinpointInspector();
    this.closeBlockPopover();
    this.closeDrawer();
    this.clearDroppedPins();

    if (typeof document !== 'undefined') {
      const host = document.getElementById('founder-review-widget-host');
      if (host) {
        host.setAttribute('hidden', '');
        host.classList.add('is-client-mode');
        host.style.setProperty('display', 'none', 'important');
      }
    }

    this.showToast('🙈 เข้าสู่โหมดส่งลูกค้าจริงแล้ว (เติม ?review=1 ท้าย URL เพื่อเปิดปุ่มรีวิวกลับมา)');
    return true;
  }

  disableClientMode() {
    this._clientMode = false;
    if (this.storage) {
      try {
        this.storage.removeItem(CLIENT_MODE_KEY);
      } catch (e) {}
    }

    if (typeof document !== 'undefined') {
      const host = document.getElementById('founder-review-widget-host');
      if (host) {
        host.removeAttribute('hidden');
        host.classList.remove('is-client-mode');
        host.style.removeProperty('display');
      }
    }

    if (this.container) {
      this.render();
      this.renderDroppedPins();
    }
    return false;
  }

  checkUrlUnlock(locOverride = null) {
    const loc = locOverride || this.location || (typeof window !== 'undefined' ? window.location : null);
    if (!loc) return false;
    const search = String(loc.search || '');
    const hash = String(loc.hash || '');
    if (search.includes('review=1') || hash.includes('review=1')) {
      this.disableClientMode();
      if (typeof document !== 'undefined') {
        const obModal = document.getElementById('onboarding-modal');
        if (obModal) obModal.style.display = 'none';
      }
      return true;
    }
    return false;
  }

  /* ==========================================================================
     Block Selector & Snippet Helpers
     ========================================================================== */

  buildSelectorForElement(el) {
    return buildSelectorForElement(el);
  }

  extractSnippet(el) {
    return extractBlockSnippet(el);
  }

  /* ==========================================================================
     Reviews CRUD & Auto-Fix Sync
     ========================================================================== */

  addReview(payload) {
    if (!payload || !payload.comment || !payload.comment.trim()) {
      throw new Error('กรุณาระบุรายละเอียดที่ต้องการให้ปรับปรุง');
    }

    const targetSection = SECTION_MAP.find(s => s.id === payload.sectionId) || {
      id: payload.sectionId || 'custom',
      label: payload.targetName || 'ส่วนที่เลือกบนหน้าจอ',
      file: payload.file || 'src/'
    };

    const review = {
      id: 'rev-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      sectionId: targetSection.id,
      targetName: payload.targetName || targetSection.label,
      relatedFiles: payload.file || targetSection.file,
      selector: payload.selector || null,
      snippet: payload.snippet || null,
      type: payload.type || 'design', // 'design' | 'logic' | 'copy' | 'feature'
      comment: payload.comment.trim(),
      status: 'PENDING', // PENDING | IN_PROGRESS | RESOLVED
      createdAt: new Date().toISOString()
    };

    this.reviews.unshift(review);
    this.saveReviews();
    this.syncToServer(review);
    this.renderDroppedPins();
    return review;
  }

  updateReviewStatus(id, status, extra = {}) {
    const rev = this.reviews.find(r => r.id === id);
    if (!rev) return null;
    const prevStatus = rev.status;
    rev.status = status;
    Object.assign(rev, extra);
    this.saveReviews();

    if (prevStatus !== 'RESOLVED' && status === 'RESOLVED') {
      this.showToast(`✅ ลูกน้อง Gemini 4 Argon แก้ไขจุด '${rev.targetName}' เสร็จแล้ว! กดรีเฟรชเพื่อดูผลลัพธ์`);
    }

    if (this.container) {
      this.render();
      this.renderDroppedPins();
    }
    return rev;
  }

  retriggerReview(id) {
    const rev = this.reviews.find(r => r.id === id);
    if (!rev) return null;
    rev.status = 'PENDING';
    delete rev.resolvedAt;
    this.saveReviews();
    this.render();
    this.renderDroppedPins();
    this.syncToServer(rev);
    this.showToast(`🔁 ส่งคำสั่งให้ลูกน้องแก้จุด '${rev.targetName}' ซ้ำอีกครั้งแล้ว`);
    return rev;
  }

  deleteReview(id) {
    this.reviews = this.reviews.filter(r => r.id !== id);
    this.saveReviews();
    this.render();
    this.renderDroppedPins();

    if (this.fetchImpl) {
      try {
        Promise.resolve(this.fetchImpl(`${this.apiEndpoint}?id=${encodeURIComponent(id)}`, { method: 'DELETE' })).catch(() => {});
      } catch (e) {}
    }
  }

  generateAIPrompt(review) {
    if (!review) return '';
    return [
      `🎯 **คำสั่งจาก Founder ให้ AI แก้ไขเฉพาะจุด (Pinpoint Fix)**`,
      `==================================================`,
      `📌 **พื้นที่เป้าหมาย**: ${review.targetName} (${review.sectionId})`,
      review.selector ? `🎯 **CSS Selector เฉพาะจุด**: ${review.selector}` : null,
      review.snippet ? `💬 **ข้อความในบล็อก**: "${review.snippet}"` : null,
      `📁 **ไฟล์ที่เกี่ยวข้อง**: ${review.relatedFiles}`,
      `🏷️ **ประเภทการแก้ไข**: ${this.getTypeLabel(review.type)}`,
      `📝 **คำสั่ง / สิ่งที่ต้องการให้ปรับปรุง**:`,
      `"${review.comment}"`,
      `--------------------------------------------------`,
      `⚠️ **ข้อจำกัดสำคัญ**: ปรับปรุงเฉพาะโค้ดในไฟล์เป้าหมายด้านบนตามที่ระบุ ห้ามแก้ไขโครงสร้างส่วนอื่นที่ผ่านการอนุมัติแล้ว`,
      `==================================================`
    ].filter(Boolean).join('\n');
  }

  getTypeLabel(type) {
    switch (type) {
      case 'design': return '🎨 ปรับปรุงหน้าตา / ดีไซน์ (Design & UI)';
      case 'logic': return '⚙️ แก้ไขการทำงาน / บั๊ก (Logic & Bug)';
      case 'copy': return '✍️ แก้ไขข้อความ (Copywriting)';
      case 'feature': return '💡 เสนอฟีเจอร์เพิ่ม (Feature)';
      default: return '📌 รีวิวทั่วไป (Review)';
    }
  }

  getStatusMeta(status) {
    switch (status) {
      case 'IN_PROGRESS':
        return {
          badgeText: '⚡ ลูกน้อง Argon กำลังแก้โค้ด...',
          pinText: '⚡ กำลังแก้',
          cls: 'status-in-progress'
        };
      case 'RESOLVED':
        return {
          badgeText: '✅ แก้เสร็จแล้ว',
          pinText: '✅ แก้แล้ว',
          cls: 'status-resolved'
        };
      case 'FAILED':
        return {
          badgeText: '⚠️ แก้ไม่สำเร็จ (กดสั่งแก้ซ้ำได้)',
          pinText: '⚠️ ลองใหม่',
          cls: 'status-failed'
        };
      case 'PENDING':
      default:
        return {
          badgeText: '⏳ รอส่งลูกน้อง',
          pinText: '⏳',
          cls: 'status-pending'
        };
    }
  }

  getEffectiveApiEndpoint() {
    if (
      this.apiEndpoint === '/api/reviews' &&
      typeof window !== 'undefined' &&
      window.location &&
      window.location.protocol === 'file:'
    ) {
      return 'http://127.0.0.1:4545/api/reviews';
    }
    return this.apiEndpoint;
  }

  async syncToServer(review) {
    if (!this.fetchImpl) return null;
    let syncedReview = null;
    const endpoint = this.getEffectiveApiEndpoint();

    try {
      const res = await this.fetchImpl(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review)
      });
      if (res && res.ok && typeof res.json === 'function') {
        const data = await res.json();
        if (data && data.ok && data.review) {
          this.updateReviewStatus(review.id, data.review.status || 'IN_PROGRESS', {
            startedAt: data.review.startedAt || new Date().toISOString()
          });
          this.startPolling();
          syncedReview = data.review;
        }
      }
    } catch (e) {
      // Local server unreachable (e.g. remote user on GitHub Pages / different internet)
    }

    if (!syncedReview && this.cloudRelayUrl && !(this.cloudRelayBackoffUntil && Date.now() < this.cloudRelayBackoffUntil)) {
      try {
        const relayRes = await this.fetchImpl(this.cloudRelayUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventType: 'NEW_REVIEW', review })
        });
        if (relayRes && relayRes.status === 429) {
          this.cloudRelayBackoffUntil = Date.now() + 5 * 60 * 1000;
        } else if (relayRes && relayRes.ok) {
          const startedAt = new Date().toISOString();
          this.updateReviewStatus(review.id, 'IN_PROGRESS', { startedAt });
          this.startPolling();
          syncedReview = this.reviews.find(r => r.id === review.id) || review;
        }
      } catch (e) {
        // Non-blocking fallback: reviews are already safe in localStorage
      }
    }

    return syncedReview;
  }

  startPolling(intervalMs = 2500) {
    if (this.pollTimer) return;
    if (typeof setInterval === 'undefined') return;
    const hasActive = this.reviews.some(r => r.status === 'PENDING' || r.status === 'IN_PROGRESS');
    if (!hasActive) return;

    this.pollTimer = setInterval(() => {
      this.pollServerStatus();
    }, intervalMs);
    if (this.pollTimer && typeof this.pollTimer.unref === 'function') {
      this.pollTimer.unref();
    }
  }

  stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  applyServerReviews(srvReviews) {
    if (!Array.isArray(srvReviews)) return false;
    let changed = false;
    for (const srvRev of srvReviews) {
      if (!srvRev || !srvRev.id || !srvRev.status) continue;
      const local = this.reviews.find(r => r.id === srvRev.id);
      if (local && local.status !== srvRev.status) {
        const wasResolved = local.status === 'RESOLVED';
        local.status = srvRev.status;
        if (srvRev.resolvedAt) local.resolvedAt = srvRev.resolvedAt;
        if (srvRev.resolutionNote) local.resolutionNote = srvRev.resolutionNote;
        changed = true;

        if (!wasResolved && srvRev.status === 'RESOLVED') {
          this.showToast(`✅ ลูกน้อง Gemini 4 Argon แก้ไขจุด '${local.targetName}' เสร็จแล้ว! กดรีเฟรชเพื่อดูผลลัพธ์`);
        }
      }
    }
    return changed;
  }

  async pollServerStatus() {
    if (!this.fetchImpl) return;
    let changed = false;
    let localOk = false;
    const endpoint = this.getEffectiveApiEndpoint();

    try {
      const res = await this.fetchImpl(`${endpoint}?t=${Date.now()}`);
      if (res && res.ok && typeof res.json === 'function') {
        localOk = true;
        const data = await res.json();
        if (data && Array.isArray(data.reviews)) {
          if (this.applyServerReviews(data.reviews)) {
            changed = true;
          }
        }
      }
    } catch (e) {
      // Ignore local server error when user is remote
    }

    const pendingLocal = this.reviews.find(r => r.status === 'PENDING');
    if (pendingLocal && localOk) {
      await this.syncToServer(pendingLocal);
    }

    if (!localOk && this.cloudRelayUrl && !(this.cloudRelayBackoffUntil && Date.now() < this.cloudRelayBackoffUntil)) {
      try {
        const relayRes = await this.fetchImpl(`${this.cloudRelayUrl}/json?poll=1&since=30m`);
        if (relayRes && relayRes.status === 429) {
          this.cloudRelayBackoffUntil = Date.now() + 5 * 60 * 1000;
        } else if (relayRes && relayRes.ok && typeof relayRes.text === 'function') {
          const text = await relayRes.text();
          const latestById = new Map();
          for (const rawLine of String(text || '').split('\n')) {
            const line = rawLine.trim();
            if (!line) continue;
            try {
              const envelope = JSON.parse(line);
              let payload = null;
              if (envelope && typeof envelope.message === 'string') {
                payload = JSON.parse(envelope.message);
              } else if (envelope && typeof envelope.message === 'object' && envelope.message !== null) {
                payload = envelope.message;
              } else if (envelope && envelope.eventType) {
                payload = envelope;
              }
              if (payload && payload.eventType === 'STATUS_UPDATE' && payload.review && payload.review.id) {
                latestById.set(payload.review.id, payload.review);
              }
            } catch (e) {
              // Ignore non-JSON or unrelated lines
            }
          }
          if (latestById.size > 0 && this.applyServerReviews(Array.from(latestById.values()))) {
            changed = true;
          }
        }
      } catch (e) {
        // Ignore transient network errors during cloud relay polling
      }
    }

    if (changed) {
      this.saveReviews();
      this.render();
      this.renderDroppedPins();
    }

    const stillActive = this.reviews.some(r => r.status === 'PENDING' || r.status === 'IN_PROGRESS');
    if (!stillActive) {
      this.stopPolling();
    }
  }

  /* ==========================================================================
     Lifecycle & Global Pinpoint Inspection
     ========================================================================== */

  init(container = typeof document !== 'undefined' ? document.body : null) {
    this.checkUrlUnlock();
    if (typeof document === 'undefined' || !container) return;
    this.container = container;
    this.render();
    this.renderDroppedPins();
    this.bindGlobalEvents();

    if (!this.isClientMode() && this.reviews.some(r => r.status === 'PENDING' || r.status === 'IN_PROGRESS')) {
      this.startPolling();
    }
  }

  bindGlobalEvents() {
    if (this._boundGlobalEvents || typeof document === 'undefined') return;
    this._boundGlobalEvents = true;

    // Hover highlight during pinpoint inspect mode
    document.addEventListener('mouseover', (e) => {
      if (!this.isInspectMode || this.isClientMode()) return;
      if (e.target.closest?.('.founder-review-drawer, .founder-review-trigger, .founder-block-popover, .founder-dropped-pin')) return;

      const card = e.target.closest?.(INSPECTABLE_BLOCKS_SELECTOR) || e.target;
      document.querySelectorAll('.founder-inspect-hover').forEach(el => el.classList.remove('founder-inspect-hover'));
      card.classList.add('founder-inspect-hover');
    });

    document.addEventListener('click', (e) => {
      if (!this.isInspectMode || this.isClientMode()) return;
      if (e.target.closest?.('.founder-review-drawer, .founder-review-trigger, .founder-block-popover, .founder-dropped-pin')) return;

      e.preventDefault();
      e.stopPropagation();

      const el = e.target.closest?.(INSPECTABLE_BLOCKS_SELECTOR) || e.target;
      this.selectElementTarget(el);
      this.stopPinpointInspector();
      this.openBlockPopover(el, this.selectedTarget);
    }, true);
  }

  startPinpointInspector() {
    if (this.isClientMode()) return;
    this.isInspectMode = true;
    this.closeBlockPopover();
    if (typeof document !== 'undefined') {
      const obModal = document.getElementById('onboarding-modal');
      if (obModal) obModal.style.display = 'none';
      document.body.classList.add('founder-inspect-mode');
    }
    this.closeDrawer();
    this.showToast('🎯 เข้าสู่โหมดชี้จุด: คลิกที่การ์ดหรือบล็อกใดก็ได้บนหน้าจอเพื่อสั่งลูกน้องแก้เฉพาะจุด');
  }

  stopPinpointInspector() {
    this.isInspectMode = false;
    if (typeof document !== 'undefined') {
      document.body.classList.remove('founder-inspect-mode');
      document.querySelectorAll('.founder-inspect-hover').forEach(el => el.classList.remove('founder-inspect-hover'));
    }
  }

  selectElementTarget(el) {
    if (!el) return null;

    if (typeof document !== 'undefined') {
      document.querySelectorAll('.founder-inspect-selected').forEach(node => node.classList.remove('founder-inspect-selected'));
    }
    el.classList?.add('founder-inspect-selected');
    this.selectedElement = el;

    const selector = this.buildSelectorForElement(el);
    const snippet = this.extractSnippet(el);

    // Match section or modal
    const kgModal = el.closest?.('#keep-going-modal, .keep-going-modal, .kg-idea-card, .kg-warning-banner');
    const section = kgModal
      ? { id: 'keep-going-modal' }
      : (el.closest?.('section[id], [id^="view-"], [id^="modal-"]') || el);

    const matchedSection = SECTION_MAP.find(s =>
      section.id && (section.id === s.id || section.id.includes(s.id.replace('view-', '')))
    );

    // Build a descriptive block label
    const headingEl = el.querySelector?.('h1, h2, h3, h4, .kg-idea-title, .card-title, strong');
    const headingText = headingEl ? String(headingEl.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 45) : '';
    const ariaLabel = el.getAttribute?.('aria-label') || el.getAttribute?.('data-review-block') || '';

    let blockLabel = ariaLabel || headingText || '';
    if (!blockLabel && matchedSection) {
      blockLabel = matchedSection.label;
    } else if (blockLabel && matchedSection && !blockLabel.includes(matchedSection.label)) {
      blockLabel = `${matchedSection.label} — ${blockLabel}`;
    } else if (!blockLabel) {
      blockLabel = snippet ? `บล็อก "${snippet.slice(0, 36)}"` : (selector || 'ส่วนประกอบที่เลือก');
    }

    this.selectedTarget = {
      sectionId: matchedSection ? matchedSection.id : (section.id || 'custom'),
      targetName: blockLabel,
      file: matchedSection ? matchedSection.file : 'src/',
      selector,
      snippet
    };

    if (this.container) {
      this.render();
    }
    return this.selectedTarget;
  }

  /* ==========================================================================
     Inline Floating Block Review Popover (#founder-block-popover)
     ========================================================================== */

  openBlockPopover(anchorEl, targetInfo = this.selectedTarget) {
    if (typeof document === 'undefined' || this.isClientMode()) return;
    this.closeBlockPopover(false);

    const target = targetInfo || this.selectedTarget || SECTION_MAP[0];
    const popover = document.createElement('div');
    popover.id = 'founder-block-popover';
    popover.className = 'founder-block-popover';
    popover.setAttribute('role', 'dialog');
    popover.setAttribute('aria-label', 'เขียนรีวิวชี้จุดแก้เฉพาะบล็อก');

    popover.innerHTML = `
      <div class="founder-popover-header">
        <div class="founder-popover-title">📌 บล็อกที่เลือก: ${this.escapeHtml(target.targetName)}</div>
        <button type="button" class="founder-popover-close" id="btn-popover-close" aria-label="ปิด">✕</button>
      </div>
      ${target.selector || target.snippet ? `
        <div class="founder-popover-meta">
          ${target.selector ? `<code class="founder-popover-selector">${this.escapeHtml(target.selector)}</code>` : ''}
          ${target.snippet ? `<div class="founder-popover-snippet">"${this.escapeHtml(target.snippet)}"</div>` : ''}
        </div>
      ` : ''}
      <form id="founder-popover-form" class="founder-popover-form">
        <div class="founder-popover-row">
          <label for="founder-popover-type" class="founder-popover-label">ประเภทการแก้:</label>
          <select id="founder-popover-type" class="founder-select founder-popover-select">
            <option value="design">🎨 ดีไซน์ / หน้าตา (Design)</option>
            <option value="copy">✍️ ข้อความ / คำพูด (Copy)</option>
            <option value="logic">⚙️ การทำงาน / บั๊ก (Logic)</option>
            <option value="feature">💡 เพิ่มฟีเจอร์ (Feature)</option>
          </select>
        </div>
        <textarea
          id="founder-popover-comment"
          class="founder-textarea founder-popover-textarea"
          placeholder="พิมพ์สั่งลูกน้องได้เลย เช่น 'เปลี่ยนสีปุ่มเป็นสีเขียวมรกต', 'แก้คำในบรรทัดนี้ให้กระชับขึ้น'..."
          required
        ></textarea>
        <div class="founder-popover-actions">
          <button type="submit" class="founder-btn-primary founder-popover-submit" id="btn-popover-submit">
            🚀 สั่งลูกน้องแก้จุดนี้ทันที
          </button>
          <button type="button" class="founder-btn-secondary founder-popover-cancel" id="btn-popover-cancel">
            ยกเลิก
          </button>
        </div>
      </form>
    `;

    document.body.appendChild(popover);

    // Position next to clicked block
    if (anchorEl && typeof anchorEl.getBoundingClientRect === 'function') {
      const rect = anchorEl.getBoundingClientRect();
      const popWidth = 360;
      const popHeight = 310;
      const vw = window.innerWidth || 1280;
      const vh = window.innerHeight || 800;

      let top = rect.bottom + 10;
      if (top + popHeight > vh - 16) {
        top = Math.max(16, rect.top - popHeight - 10);
      }
      let left = rect.left;
      if (left + popWidth > vw - 16) {
        left = Math.max(16, vw - popWidth - 16);
      }
      popover.style.top = `${Math.round(top)}px`;
      popover.style.left = `${Math.round(left)}px`;
    } else {
      popover.style.top = '90px';
      popover.style.right = '24px';
    }

    const closeHandler = () => this.closeBlockPopover(true);
    popover.querySelector('#btn-popover-close')?.addEventListener('click', closeHandler);
    popover.querySelector('#btn-popover-cancel')?.addEventListener('click', closeHandler);

    const form = popover.querySelector('#founder-popover-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const type = popover.querySelector('#founder-popover-type')?.value || 'design';
      const comment = popover.querySelector('#founder-popover-comment')?.value || '';
      try {
        const rev = this.addReview({
          sectionId: target.sectionId,
          targetName: target.targetName,
          file: target.file,
          selector: target.selector,
          snippet: target.snippet,
          type,
          comment
        });
        this.closeBlockPopover(true);
        this.showToast(`🚀 ส่งคำสั่งแก้จุด "${rev.targetName}" ให้ลูกน้อง Gemini 4 Argon แล้ว!`);
        this.currentTab = 'history';
        this.render();
        this.renderDroppedPins();
      } catch (err) {
        if (typeof alert !== 'undefined') alert(err.message);
      }
    });

    const textarea = popover.querySelector('#founder-popover-comment');
    textarea?.focus?.();
  }

  closeBlockPopover(clearSelection = true) {
    if (typeof document === 'undefined') return;
    const existing = document.getElementById('founder-block-popover');
    if (existing) existing.remove();
    if (clearSelection) {
      document.querySelectorAll('.founder-inspect-selected').forEach(node => node.classList.remove('founder-inspect-selected'));
      this.selectedElement = null;
    }
  }

  /* ==========================================================================
     Numbered Pin Badges on Target Blocks (.founder-dropped-pin)
     ========================================================================== */

  clearDroppedPins() {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('.founder-dropped-pin').forEach(pin => pin.remove());
  }

  renderDroppedPins() {
    if (typeof document === 'undefined') return;
    this.clearDroppedPins();
    if (this.isClientMode()) return;

    const total = this.reviews.length;
    this.reviews.forEach((rev, idx) => {
      const pinNum = total - idx;
      let targetEl = null;
      if (rev.selector) {
        try {
          targetEl = document.querySelector(rev.selector);
        } catch (e) {}
      }
      if (!targetEl && rev.sectionId) {
        targetEl = document.getElementById(rev.sectionId);
      }
      if (!targetEl) return;

      targetEl.classList?.add('founder-has-pin');
      const meta = this.getStatusMeta(rev.status);
      const pin = document.createElement('button');
      pin.type = 'button';
      pin.className = `founder-dropped-pin ${meta.cls}`;
      pin.setAttribute('data-review-id', rev.id);
      pin.title = `${rev.targetName}: ${rev.comment}`;
      pin.textContent = `#${pinNum} ${meta.pinText}`;

      pin.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.openDrawer('history');
      });

      targetEl.appendChild(pin);
    });
  }

  /* ==========================================================================
     Drawer UI & Rendering
     ========================================================================== */

  openDrawer(tab = 'new') {
    if (this.isClientMode()) return;
    this.currentTab = tab;
    this.render();
    if (typeof document !== 'undefined') {
      const obModal = document.getElementById('onboarding-modal');
      if (obModal) obModal.style.display = 'none';
      const drawer = document.getElementById('founder-review-drawer');
      if (drawer) {
        drawer.classList.add('is-open');
        drawer.removeAttribute('hidden');
      }
    }
  }

  closeDrawer() {
    if (typeof document === 'undefined') return;
    const drawer = document.getElementById('founder-review-drawer');
    if (drawer) {
      drawer.classList.remove('is-open');
    }
  }

  toggleDrawer() {
    if (typeof document === 'undefined') return;
    const obModal = document.getElementById('onboarding-modal');
    if (obModal) obModal.style.display = 'none';
    const drawer = document.getElementById('founder-review-drawer');
    if (drawer && drawer.classList.contains('is-open')) {
      this.closeDrawer();
    } else {
      this.openDrawer(this.currentTab);
    }
  }

  showToast(msg) {
    this.lastToastMessage = msg;
    if (typeof document === 'undefined' || !document.body) return;
    let toast = document.getElementById('founder-review-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'founder-review-toast';
      toast.style.cssText = 'position:fixed;top:1.5rem;right:1.5rem;background:#11110f;color:#ffffff;padding:0.75rem 1.25rem;border-radius:8px;font-size:0.875rem;font-weight:600;z-index:999999;box-shadow:0 10px 25px rgba(0,0,0,0.2);transition:opacity 0.2s ease;';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.display = 'block';
    toast.style.opacity = '1';
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => { toast.style.display = 'none'; }, 200);
    }, 3500);
  }

  render() {
    if (typeof document === 'undefined' || !this.container) return;

    let host = document.getElementById('founder-review-widget-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'founder-review-widget-host';
      host.setAttribute?.('style', 'position: relative; z-index: 2147483645;');
      this.container.appendChild(host);
    }

    if (this.isClientMode()) {
      host.setAttribute('hidden', '');
      host.classList.add('is-client-mode');
      host.style.setProperty('display', 'none', 'important');
      this.clearDroppedPins();
      return;
    }

    host.removeAttribute('hidden');
    host.classList.remove('is-client-mode');
    host.style.removeProperty('display');
    host.style.position = 'relative';
    host.style.zIndex = '2147483645';

    const wasOpen = host.querySelector('#founder-review-drawer')?.classList.contains('is-open');
    const pendingCount = this.reviews.length;
    const selected = this.selectedTarget || SECTION_MAP[0];

    host.innerHTML = `
      <!-- Floating Trigger Buttons -->
      <button type="button" class="founder-review-trigger" id="btn-founder-quick-inspect" style="bottom: 4.8rem;" title="คลิกเพื่อจิ้มชี้จุดบนหน้าเว็บทันที (1-Click Pinpoint)">
        <span>🎯</span>
        <span>จิ้มชี้จุดแก้ทันที</span>
      </button>
      <button type="button" class="founder-review-trigger" id="btn-founder-review-toggle" title="เขียนรีวิว / ระบุจุดที่ต้องแก้ไขให้ AI">
        <span>✍️</span>
        <span>เขียนรีวิวชี้จุดแก้</span>
        ${pendingCount > 0 ? `<span class="founder-review-badge">${pendingCount}</span>` : ''}
      </button>

      <!-- Review Drawer -->
      <aside class="founder-review-drawer ${wasOpen ? 'is-open' : ''}" id="founder-review-drawer" role="dialog" aria-modal="true" aria-labelledby="founder-drawer-title">
        <header class="founder-review-header">
          <h2 class="founder-review-title" id="founder-drawer-title">
            <span>✍️</span> Founder Review & Pinpoint Fix
          </h2>
          <button type="button" class="founder-review-close" id="btn-founder-review-close" aria-label="ปิด">✕</button>
        </header>

        <nav class="founder-review-tabs" role="tablist">
          <button type="button" class="founder-review-tab ${this.currentTab === 'new' ? 'is-active' : ''}" id="tab-founder-new">
            ✏️ เขียนรีวิวจุดใหม่
          </button>
          <button type="button" class="founder-review-tab ${this.currentTab === 'history' ? 'is-active' : ''}" id="tab-founder-history">
            📋 ประวัติที่สั่งไว้ (${pendingCount})
          </button>
        </nav>

        <div class="founder-review-body">
          ${this.currentTab === 'new' ? this.renderNewForm(selected) : this.renderHistoryList()}
        </div>

        <footer class="founder-review-footer">
          <button type="button" class="founder-client-mode-btn" id="btn-founder-client-mode" title="ซ่อนปุ่มรีวิวและหมุดทั้งหมดเพื่อส่งมอบให้ลูกค้าจริง">
            🙈 โหมดส่งลูกค้าจริง (ซ่อนปุ่มรีวิว)
          </button>
        </footer>
      </aside>
    `;

    this.bindDomEvents(host);
  }

  renderNewForm(selected) {
    return `
      <form id="founder-review-form">
        <button type="button" class="founder-btn-inspect" id="btn-founder-inspect-trigger">
          <span>🎯</span> คลิกที่นี่เพื่อ "จิ้มชี้จุดบนหน้าเว็บจริง"
        </button>

        <div class="founder-form-group">
          <label class="founder-form-label" for="founder-section-select">1. พื้นที่ / ส่วนประกอบที่ต้องการแก้ไข</label>
          <select class="founder-select" id="founder-section-select">
            ${SECTION_MAP.map(s => `
              <option value="${s.id}" ${s.id === selected.sectionId ? 'selected' : ''}>
                ${s.label}
              </option>
            `).join('')}
          </select>
        </div>

        ${selected.selector ? `
          <div class="founder-form-group">
            <label class="founder-form-label">บล็อกที่จิ้มเลือกไว้เฉพาะจุด</label>
            <div class="founder-target-pill">
              <span>📌</span> <code>${this.escapeHtml(selected.selector)}</code>
            </div>
          </div>
        ` : ''}

        <div class="founder-form-group">
          <label class="founder-form-label">ไฟล์ต้นทางที่ AI จะแก้ไข (ไม่กระทบส่วนอื่น)</label>
          <div class="founder-target-pill">
            <span>📁</span> <span id="founder-target-files">${selected.file || 'src/'}</span>
          </div>
        </div>

        <div class="founder-form-group">
          <label class="founder-form-label" for="founder-review-type">2. ประเภทการปรับปรุง</label>
          <select class="founder-select" id="founder-review-type">
            <option value="design">🎨 ปรับปรุงหน้าตา / ดีไซน์ (Design & UI)</option>
            <option value="logic">⚙️ แก้ไขพฤติกรรม / ฟังก์ชัน (Logic & Bug)</option>
            <option value="copy">✍️ ปรับข้อความ / ถ้อยคำ (Copywriting)</option>
            <option value="feature">💡 เสนอเพิ่มความสามารถใหม่ (New Feature)</option>
          </select>
        </div>

        <div class="founder-form-group">
          <label class="founder-form-label" for="founder-review-comment">3. รายละเอียดที่ต้องการให้แก้ (เขียนรีวิว)</label>
          <textarea 
            class="founder-textarea" 
            id="founder-review-comment" 
            placeholder="พิมพ์บอกสิ่งที่ต้องการให้ปรับปรุงตรงนี้ เช่น 'ปรับสีปุ่มให้สว่างขึ้น', 'ย้ายตำแหน่งการ์ดนี้ไปไว้ด้านบน', 'แก้อาการเปิดหน้าแล้วเด้งป๊อปอัป'..."
            required
          ></textarea>
        </div>

        <div class="founder-btn-row">
          <button type="submit" class="founder-btn-primary" id="btn-founder-submit-review">
            🚀 สั่งลูกน้องแก้จุดนี้ทันที
          </button>
          <button type="button" class="founder-btn-secondary" id="btn-founder-cancel-review">
            ยกเลิก
          </button>
        </div>
      </form>
    `;
  }

  renderHistoryList() {
    if (this.reviews.length === 0) {
      return `
        <div style="text-align:center;padding:2.5rem 1rem;color:var(--v6-muted,#6b6762);">
          <div style="font-size:2rem;margin-bottom:0.5rem;">📝</div>
          <p style="font-weight:600;margin-bottom:0.25rem;">ยังไม่มีรายการรีวิวที่สั่งไว้</p>
          <p style="font-size:0.8rem;">คลิกแท็บ "เขียนรีวิวจุดใหม่" เพื่อระบุส่วนที่ต้องการปรับปรุงได้เลยครับ</p>
        </div>
      `;
    }

    return this.reviews.map(r => {
      const statusMeta = this.getStatusMeta(r.status);
      return `
        <div class="founder-review-card ${statusMeta.cls}" data-review-id="${r.id}">
          <div class="founder-card-meta">
            <span class="founder-type-tag">${this.getTypeLabel(r.type).split(' ')[0]} ${r.type.toUpperCase()}</span>
            <span class="founder-status-badge ${statusMeta.cls}">${statusMeta.badgeText}</span>
            <span class="founder-time-tag">${new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div class="founder-target-name">📌 ${this.escapeHtml(r.targetName)}</div>
          ${r.selector ? `<div class="founder-card-selector"><code>${this.escapeHtml(r.selector)}</code></div>` : ''}
          <p class="founder-comment-text">${this.escapeHtml(r.comment)}</p>
          ${r.resolutionNote ? `<div class="founder-resolution-note">🤖 สรุปการแก้: ${this.escapeHtml(r.resolutionNote)}</div>` : ''}
          ${r.status === 'RESOLVED' ? `
            <div class="founder-resolved-bar">
              <button type="button" class="founder-reload-btn" data-action="reload-page" data-id="${r.id}">
                🔄 รีเฟรชหน้าเว็บดูผล
              </button>
              <button type="button" class="founder-retrigger-btn" data-action="retrigger" data-id="${r.id}">
                🔁 สั่งแก้ซ้ำ
              </button>
            </div>
          ` : ''}
          <div class="founder-card-actions">
            <button type="button" class="founder-copy-ai-btn" data-action="copy-prompt" data-id="${r.id}" title="คัดลอก Prompt สำหรับส่งให้ AI">
              📋 ก๊อปปี้คำสั่งให้ AI
            </button>
            <button type="button" class="founder-delete-btn" data-action="delete" data-id="${r.id}">
              ลบ
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  bindDomEvents(host) {
    host.querySelector('#btn-founder-quick-inspect')?.addEventListener('click', () => this.startPinpointInspector());
    host.querySelector('#btn-founder-review-toggle')?.addEventListener('click', () => this.toggleDrawer());
    host.querySelector('#btn-founder-review-close')?.addEventListener('click', () => this.closeDrawer());

    host.querySelector('#btn-founder-client-mode')?.addEventListener('click', () => {
      this.enableClientMode();
    });

    host.querySelector('#tab-founder-new')?.addEventListener('click', () => {
      this.currentTab = 'new';
      this.render();
    });

    host.querySelector('#tab-founder-history')?.addEventListener('click', () => {
      this.currentTab = 'history';
      this.render();
    });

    host.querySelector('#btn-founder-inspect-trigger')?.addEventListener('click', () => {
      this.startPinpointInspector();
    });

    const select = host.querySelector('#founder-section-select');
    if (select) {
      select.addEventListener('change', (e) => {
        const matched = SECTION_MAP.find(s => s.id === e.target.value);
        if (matched) {
          this.selectedTarget = {
            sectionId: matched.id,
            targetName: matched.label,
            file: matched.file,
            selector: null,
            snippet: null
          };
          const targetSpan = host.querySelector('#founder-target-files');
          if (targetSpan) targetSpan.textContent = matched.file;
        }
      });
    }

    const form = host.querySelector('#founder-review-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const sectionId = host.querySelector('#founder-section-select')?.value;
        const type = host.querySelector('#founder-review-type')?.value;
        const comment = host.querySelector('#founder-review-comment')?.value;
        const matched = SECTION_MAP.find(s => s.id === sectionId) || this.selectedTarget;
        const useSelectedBlock = this.selectedTarget && this.selectedTarget.sectionId === sectionId;

        try {
          const rev = this.addReview({
            sectionId: sectionId,
            targetName: useSelectedBlock ? this.selectedTarget.targetName : matched?.label,
            file: useSelectedBlock ? this.selectedTarget.file : matched?.file,
            selector: useSelectedBlock ? this.selectedTarget.selector : null,
            snippet: useSelectedBlock ? this.selectedTarget.snippet : null,
            type: type,
            comment: comment
          });

          this.showToast(`✅ บันทึกรีวิวสำหรับ "${rev.targetName}" และสั่งลูกน้องแก้ไขแล้ว!`);
          this.selectedTarget = null;
          this.currentTab = 'history';
          this.render();
        } catch (err) {
          if (typeof alert !== 'undefined') alert(err.message);
        }
      });
    }

    host.querySelector('#btn-founder-cancel-review')?.addEventListener('click', () => {
      this.closeDrawer();
    });

    // History actions
    host.querySelectorAll('[data-action="reload-page"]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (typeof window !== 'undefined' && window.location && typeof window.location.reload === 'function') {
          window.location.reload();
        }
      });
    });

    host.querySelectorAll('[data-action="retrigger"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        this.retriggerReview(id);
      });
    });

    host.querySelectorAll('[data-action="copy-prompt"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const rev = this.reviews.find(r => r.id === id);
        if (rev) {
          const prompt = this.generateAIPrompt(rev);
          if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(prompt);
            this.showToast('📋 คัดลอกคำสั่งพร้อมส่งให้ AI แก้ไขเฉพาะจุดแล้ว!');
          }
        }
      });
    });

    host.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const shouldDelete = typeof confirm === 'function' ? confirm('คุณต้องการลบรีวิวนี้ใช่หรือไม่?') : true;
        if (shouldDelete) {
          this.deleteReview(id);
          this.showToast('🗑️ ลบรายการรีวิวเรียบร้อยแล้ว');
        }
      });
    });
  }
}

// Auto-initialize when in browser environment
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  window.FounderReviewWidget = FounderReviewWidget;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const widget = new FounderReviewWidget();
      widget.init();
      window.founderReviewInstance = widget;
    });
  } else {
    const widget = new FounderReviewWidget();
    widget.init();
    window.founderReviewInstance = widget;
  }
}
