/**
 * ==============================================================================
 * MEW CONTENT OS — Founder Review & Pinpoint Fix Widget (Client Controller)
 * ==============================================================================
 * Allows the Founder to visually pinpoint specific UI areas, write focused
 * reviews/fix instructions, and generate targeted AI prompts to fix only
 * the requested area without altering approved sections.
 * ==============================================================================
 */

const STORAGE_KEY = 'mew_founder_reviews_v1';

export const SECTION_MAP = [
  { id: 'view-overview', label: 'S00: Dashboard & Overview', file: 'src/components/dashboard.html, src/modules/dashboard.js' },
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

export class FounderReviewWidget {
  constructor(options = {}) {
    this.storage = options.storage || (typeof localStorage !== 'undefined' ? localStorage : null);
    this.apiEndpoint = options.apiEndpoint || '/api/reviews';
    this.reviews = this.loadReviews();
    this.isInspectMode = false;
    this.selectedTarget = null;
    this.currentTab = 'new'; // 'new' | 'history'
    this.container = null;
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
      relatedFiles: targetSection.file,
      selector: payload.selector || null,
      type: payload.type || 'design', // 'design' | 'logic' | 'copy' | 'feature'
      comment: payload.comment.trim(),
      status: 'PENDING', // PENDING | IN_PROGRESS | RESOLVED
      createdAt: new Date().toISOString()
    };

    this.reviews.unshift(review);
    this.saveReviews();
    this.syncToServer(review);
    return review;
  }

  deleteReview(id) {
    this.reviews = this.reviews.filter(r => r.id !== id);
    this.saveReviews();
    this.render();
  }

  generateAIPrompt(review) {
    if (!review) return '';
    return [
      `🎯 **คำสั่งจาก Founder ให้ AI แก้ไขเฉพาะจุด (Pinpoint Fix)**`,
      `==================================================`,
      `📌 **พื้นที่เป้าหมาย**: ${review.targetName} (${review.sectionId})`,
      `📁 **ไฟล์ที่เกี่ยวข้อง**: ${review.relatedFiles}`,
      `🏷️ **ประเภทการแก้ไข**: ${this.getTypeLabel(review.type)}`,
      `📝 **คำสั่ง / สิ่งที่ต้องการให้ปรับปรุง**:`,
      `"${review.comment}"`,
      `--------------------------------------------------`,
      `⚠️ **ข้อจำกัดสำคัญ**: ปรับปรุงเฉพาะโค้ดในไฟล์เป้าหมายด้านบนตามที่ระบุ ห้ามแก้ไขโครงสร้างส่วนอื่นที่ผ่านการอนุมัติแล้ว`,
      `==================================================`
    ].join('\n');
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

  async syncToServer(review) {
    if (typeof fetch === 'undefined') return;
    try {
      await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review)
      });
    } catch (e) {
      // Non-blocking fallback: reviews are already safe in localStorage
    }
  }

  init(container = document.body) {
    if (typeof document === 'undefined') return;
    this.container = container;
    this.render();
    this.bindGlobalEvents();
  }

  bindGlobalEvents() {
    // Hover highlight during pinpoint inspect mode
    document.addEventListener('mouseover', (e) => {
      if (!this.isInspectMode) return;
      if (e.target.closest('.founder-review-drawer, .founder-review-trigger')) return;

      const card = e.target.closest('.kpi-card, .view-section, .research-card, .vault-card, .basket-bar, .board-column, header, section, .mew-offer-card') || e.target;
      document.querySelectorAll('.founder-inspect-hover').forEach(el => el.classList.remove('founder-inspect-hover'));
      card.classList.add('founder-inspect-hover');
    });

    document.addEventListener('click', (e) => {
      if (!this.isInspectMode) return;
      if (e.target.closest('.founder-review-drawer, .founder-review-trigger')) return;

      e.preventDefault();
      e.stopPropagation();

      const el = e.target.closest('.kpi-card, .view-section, .research-card, .vault-card, .basket-bar, .board-column, header, section, .mew-offer-card') || e.target;
      this.selectElementTarget(el);
      this.stopPinpointInspector();
      this.openDrawer('new');
    }, true);
  }

  startPinpointInspector() {
    this.isInspectMode = true;
    document.body.classList.add('founder-inspect-mode');
    this.closeDrawer();
    this.showToast('🎯 เข้าสู่โหมดชี้จุด: คลิกที่ส่วนใดก็ได้บนหน้าจอเพื่อเริ่มเขียนรีวิว');
  }

  stopPinpointInspector() {
    this.isInspectMode = false;
    document.body.classList.remove('founder-inspect-mode');
    document.querySelectorAll('.founder-inspect-hover').forEach(el => el.classList.remove('founder-inspect-hover'));
  }

  selectElementTarget(el) {
    if (!el) return;
    let label = el.getAttribute('aria-label') || el.id || el.className;
    if (typeof label === 'string') {
      label = label.replace('founder-inspect-hover', '').trim();
    }
    const section = el.closest('section[id]') || el;
    const matchedSection = SECTION_MAP.find(s => section.id && section.id.includes(s.id.replace('view-', '')));

    this.selectedTarget = {
      sectionId: matchedSection ? matchedSection.id : (section.id || 'custom'),
      targetName: matchedSection ? matchedSection.label : (label || 'ส่วนประกอบที่เลือก'),
      file: matchedSection ? matchedSection.file : 'src/'
    };
    this.render();
  }

  openDrawer(tab = 'new') {
    this.currentTab = tab;
    const drawer = document.getElementById('founder-review-drawer');
    if (drawer) {
      drawer.classList.add('is-open');
      drawer.removeAttribute('hidden');
    }
    this.render();
  }

  closeDrawer() {
    const drawer = document.getElementById('founder-review-drawer');
    if (drawer) {
      drawer.classList.remove('is-open');
    }
  }

  toggleDrawer() {
    const drawer = document.getElementById('founder-review-drawer');
    if (drawer && drawer.classList.contains('is-open')) {
      this.closeDrawer();
    } else {
      this.openDrawer();
    }
  }

  showToast(msg) {
    if (typeof document === 'undefined') return;
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
      this.container.appendChild(host);
    }

    const pendingCount = this.reviews.length;
    const selected = this.selectedTarget || SECTION_MAP[0];

    host.innerHTML = `
      <!-- Floating Trigger Button -->
      <button type="button" class="founder-review-trigger" id="btn-founder-review-toggle" title="เขียนรีวิว / ระบุจุดที่ต้องแก้ไขให้ AI">
        <span>✍️</span>
        <span>เขียนรีวิวชี้จุดแก้</span>
        ${pendingCount > 0 ? `<span class="founder-review-badge">${pendingCount}</span>` : ''}
      </button>

      <!-- Review Drawer -->
      <aside class="founder-review-drawer" id="founder-review-drawer" role="dialog" aria-modal="true" aria-labelledby="founder-drawer-title">
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
            บันทึกรีวิวให้ AI แก้ไข
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

    return this.reviews.map(r => `
      <div class="founder-review-card" data-review-id="${r.id}">
        <div class="founder-card-meta">
          <span class="founder-type-tag">${this.getTypeLabel(r.type).split(' ')[0]} ${r.type.toUpperCase()}</span>
          <span class="founder-time-tag">${new Date(r.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
        <div class="founder-target-name">📌 ${r.targetName}</div>
        <p class="founder-comment-text">${this.escapeHtml(r.comment)}</p>
        <div class="founder-card-actions">
          <button type="button" class="founder-copy-ai-btn" data-action="copy-prompt" data-id="${r.id}" title="คัดลอก Prompt สำหรับส่งให้ AI">
            📋 ก๊อปปี้คำสั่งให้ AI
          </button>
          <button type="button" class="founder-delete-btn" data-action="delete" data-id="${r.id}">
            ลบ
          </button>
        </div>
      </div>
    `).join('');
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  bindDomEvents(host) {
    host.querySelector('#btn-founder-review-toggle')?.addEventListener('click', () => this.toggleDrawer());
    host.querySelector('#btn-founder-review-close')?.addEventListener('click', () => this.closeDrawer());

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
          this.selectedTarget = matched;
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

        try {
          const rev = this.addReview({
            sectionId: sectionId,
            targetName: matched?.label,
            file: matched?.file,
            type: type,
            comment: comment
          });

          this.showToast(`✅ บันทึกรีวิวสำหรับ "${rev.targetName}" เรียบร้อยแล้ว!`);
          this.selectedTarget = null;
          this.currentTab = 'history';
          this.render();
        } catch (err) {
          alert(err.message);
        }
      });
    }

    host.querySelector('#btn-founder-cancel-review')?.addEventListener('click', () => {
      this.closeDrawer();
    });

    // History actions
    host.querySelectorAll('[data-action="copy-prompt"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const rev = this.reviews.find(r => r.id === id);
        if (rev) {
          const prompt = this.generateAIPrompt(rev);
          if (navigator.clipboard) {
            navigator.clipboard.writeText(prompt);
            this.showToast('📋 คัดลอกคำสั่งพร้อมส่งให้ AI แก้ไขเฉพาะจุดแล้ว!');
          } else {
            prompt.select?.();
          }
        }
      });
    });

    host.querySelectorAll('[data-action="delete"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        if (confirm('คุณต้องการลบรีวิวนี้ใช่หรือไม่?')) {
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
