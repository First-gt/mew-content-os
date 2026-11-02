/**
 * ==============================================================================
 * MEW CONTENT OS — Refine / Compare Concepts Controller (Topic T26)
 * Theme: mewteetawat.com V6.3
 * 100% Pure Client-Side JavaScript (Vanilla ES6+)
 * Zero Server Dependencies · Zero Fake Metrics · Accessible WCAG UI
 * A18 Guarantee: Non-destructive refine without overwriting original concepts
 * DOD: ผู้ใช้เลือก concept เอง — ไม่มี auto-select/auto-approve
 * ==============================================================================
 */

export class ConceptRefineController {
  constructor(options = {}) {
    this.root = typeof options.rootId === 'string'
      ? (typeof document !== 'undefined' ? document.querySelector(options.rootId) : null)
      : (options.rootId || (typeof document !== 'undefined' ? document.getElementById('concept-compare-root') : null));

    this.concepts = Array.isArray(options.initialConcepts)
      ? [...options.initialConcepts]
      : this.getDefaultConcepts();

    // Strict Rule: Manual Selection Only (No auto-select, no auto-approve)
    this.selectedConceptId = options.selectedConceptId || null;
    this.targetConceptId = null;
    this.isCompareMode = options.isCompareMode !== false;

    // Callbacks
    this.onConceptRefined = options.onConceptRefined || null;
    this.onConceptRejected = options.onConceptRejected || null;
    this.onConceptSelected = options.onConceptSelected || null;
    this.onRemixAgain = options.onRemixAgain || null;
    this.onViewToggled = options.onViewToggled || null;

    // Auto initialize if DOM root is found
    if (this.root && typeof document !== 'undefined') {
      this.init();
    }
  }

  /**
   * Safe default concepts for standalone testing or initial view
   * Strictly adheres to negative constraint: Zero fake stats, zero arbitrary weeks.
   */
  getDefaultConcepts() {
    return [
      {
        id: 'c-synth-1',
        name: 'The Counter-Intuitive Truth',
        style: 'ชวนคิด · ท้าทายความเชื่อเดิม',
        hook: 'หยุดพยายามทำให้เพอร์เฟกต์ก่อนโพสต์ ความลับที่คนส่วนใหญ่พลาดไม่ได้อยู่ที่ผลงาน แต่อยู่ที่ความสม่ำเสมอของ Feedback Loop',
        beats: [
          '0:00 - 0:03 : ตั้งคำถามท้าทายความเชื่อเรื่องความสมบูรณ์แบบ',
          '0:04 - 0:18 : เล่ากับดักการปรับแต่งที่ไม่มีวันสิ้นสุด',
          '0:19 - 0:42 : นำเสนอ Founder POV: โพสต์ทันทีเพื่อเรียนรู้จากผู้ฟังจริง',
          '0:43 - 0:60 : มอบ Action Step ชัดเจน: กดส่งคลิปแรกวันนี้'
        ],
        visualSound: 'เปิดด้วย Medium Close-up สลับเสียง Metronome ค่อย ๆ เร่งจังหวะ แล้วตัดเข้าภาพหน้าจอการทำงานจริง',
        originalContribution: 'Founder POV: กล้าล้มเหลวแบบมีระบบ ยิ่งเปิดรับคำวิจารณ์เร็วยิ่งพัฒนาคอนเทนต์ได้ไว',
        sourceTrace: [
          { refId: 'src-1', title: 'Post and forget it', lens: 'content', borrowText: 'แก่นคิดเรื่องลดความกังวลและโพสต์อย่างต่อเนื่อง (WHAT)' },
          { refId: 'src-2', title: 'The Ticking Clock', lens: 'packaging', borrowText: 'ยืมเฉพาะเทคนิคเร่งจังหวะความกระชับช่วงต้นคลิป (HOW)' }
        ],
        cta: 'ลองใช้เทคนิคนี้กับคอนเทนต์ชิ้นต่อไปของคุณ แล้วมาแชร์ผลลัพธ์ในคอมเมนต์',
        isRefined: false
      },
      {
        id: 'c-synth-2',
        name: 'The Contrast Reality',
        style: 'เปรียบเทียบเชิงลึก · ก่อนและหลัง',
        hook: '2 สิ่งที่ครีเอเตอร์ทั่วไปทำ VS สิ่งที่ครีเอเตอร์ระดับท็อปทำต่างกันอย่างสิ้นเชิง',
        beats: [
          '0:00 - 0:03 : แสดงภาพ Split Screen เปรียบเทียบสองแนวทาง',
          '0:04 - 0:20 : วิเคราะห์ความผิดพลาดที่เสียเวลามากที่สุด',
          '0:21 - 0:45 : อธิบายหลักการโฟกัสที่จุดสร้างการเติบโตแท้จริง',
          '0:46 - 0:60 : สรุปเช็คลิสต์ 3 ข้อที่นำไปปรับใช้ได้ทันที'
        ],
        visualSound: 'ภาพ Split Screen ซ้าย-ขวา ชัดเจน พร้อม Sound Effect คลิกสลับประเด็นทุก 3 วินาที',
        originalContribution: 'Founder POV: ทำน้อยแต่ได้มาก จัดลำดับความสำคัญก่อนเริ่มผลิตงาน',
        sourceTrace: [
          { refId: 'src-1', title: 'Post and forget it', lens: 'content', borrowText: 'การลดแรงต้านในการเริ่มต้นทำงาน (WHAT)' },
          { refId: 'src-3', title: 'Visual Comparison Hook', lens: 'packaging', borrowText: 'โครงสร้างเล่าแบบเปรียบเทียบสองมุมมอง (HOW)' }
        ],
        cta: 'บันทึกคลิปนี้ไว้ทบทวนก่อนเริ่มวางแผนคอนเทนต์สัปดาห์หน้า',
        isRefined: false
      }
    ];
  }

  /**
   * Initializes event listeners and renders view
   */
  init() {
    if (!this.root || typeof document === 'undefined') return;

    this.bindToolbarEvents();
    this.bindDialogEvents();
    this.renderCompareView();
  }

  /**
   * Binds toolbar action buttons (btn-compare-concepts, btn-remix-again)
   */
  bindToolbarEvents() {
    const btnCompare = this.root.querySelector('#btn-compare-concepts');
    if (btnCompare) {
      btnCompare.addEventListener('click', () => {
        this.isCompareMode = !this.isCompareMode;
        btnCompare.setAttribute('aria-pressed', String(this.isCompareMode));
        if (typeof this.onViewToggled === 'function') {
          this.onViewToggled(this.isCompareMode);
        }
      });
    }

    const btnRemix = this.root.querySelector('#btn-remix-again');
    if (btnRemix) {
      btnRemix.addEventListener('click', () => {
        if (typeof this.onRemixAgain === 'function') {
          this.onRemixAgain();
        }
      });
    }
  }

  /**
   * Binds refine dialog modal events (btn-refine-angle, btn-reject-concept, quick chips)
   */
  bindDialogEvents() {
    const dialog = this.root.querySelector('#refine-dialog');
    const btnRefine = this.root.querySelector('#btn-refine-angle');
    const btnReject = this.root.querySelector('#btn-reject-concept');
    const btnCancel = this.root.querySelector('#btn-cancel-refine');
    const textarea = this.root.querySelector('#refine-instruction');

    if (btnRefine) {
      btnRefine.addEventListener('click', () => {
        const instruction = textarea ? textarea.value.trim() : '';
        if (!instruction) {
          if (textarea) textarea.focus();
          return;
        }

        const target = this.concepts.find(c => c.id === this.targetConceptId);
        if (target) {
          this.refineAngle(target, instruction);
        }
        this.closeRefineDialog();
      });
    }

    if (btnReject) {
      btnReject.addEventListener('click', () => {
        if (this.targetConceptId) {
          this.rejectConcept(this.targetConceptId);
        }
        this.closeRefineDialog();
      });
    }

    if (btnCancel) {
      btnCancel.addEventListener('click', () => {
        this.closeRefineDialog();
      });
    }

    // Quick suggestion chips
    const chips = this.root.querySelectorAll('.btn-refine-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const text = chip.getAttribute('data-chip');
        if (textarea && text) {
          textarea.value = textarea.value ? `${textarea.value} ${text}` : text;
          textarea.focus();
        }
      });
    });

    // Keyboard support: ESC closes, Ctrl+Enter submits
    if (dialog) {
      dialog.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeRefineDialog();
        } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          if (btnRefine) btnRefine.click();
        }
      });
    }
  }

  /**
   * Opens the refine dialog for a target concept
   * @param {string} conceptId 
   */
  openRefineDialog(conceptId) {
    if (!this.root || typeof document === 'undefined') return;

    this.targetConceptId = conceptId;
    const concept = this.concepts.find(c => c.id === conceptId);
    const dialog = this.root.querySelector('#refine-dialog');
    const nameEl = this.root.querySelector('#refine-target-concept-name');
    const textarea = this.root.querySelector('#refine-instruction');

    if (nameEl && concept) {
      nameEl.textContent = concept.name;
    }

    if (textarea) {
      textarea.value = '';
    }

    if (dialog) {
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
      if (textarea) {
        setTimeout(() => textarea.focus(), 50);
      }
    }
  }

  /**
   * Closes the refine dialog cleanly
   */
  closeRefineDialog() {
    if (!this.root || typeof document === 'undefined') return;

    const dialog = this.root.querySelector('#refine-dialog');
    const textarea = this.root.querySelector('#refine-instruction');

    if (textarea) {
      textarea.value = '';
    }

    if (dialog) {
      if (typeof dialog.close === 'function') {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
      }
    }
    this.targetConceptId = null;
  }

  /**
   * Refines a specific concept based on founder instructions non-destructively (A18).
   * Does NOT force research new clips, does NOT mutate or delete original concept.
   * 
   * @param {Object} concept 
   * @param {string} instruction 
   * @returns {Object} Newly created refined concept
   */
  refineAngle(concept, instruction) {
    if (!concept) throw new Error('Concept is required for refinement');
    const note = (instruction || '').trim();
    if (!note) throw new Error('Refine instruction cannot be empty');

    // Create new refined concept without mutating original
    const refinedConcept = {
      ...concept,
      id: `${concept.id}-refine-${Date.now()}`,
      name: `${concept.name} (Refined)`,
      hook: `[ปรับปรุงตาม: "${note.slice(0, 30)}..."] ${concept.hook}`,
      beats: Array.isArray(concept.beats) 
        ? concept.beats.map(b => `${b} (เน้นประเด็น: ${note.slice(0, 20)})`) 
        : [],
      originalContribution: `${concept.originalContribution || ''} + [Refinement: ${note}]`,
      isRefined: true,
      refineInstruction: note,
      parentConceptId: concept.id,
      style: concept.style || 'ปรับปรุงเฉพาะมุมมอง',
      visualSound: concept.visualSound || '',
      sourceTrace: Array.isArray(concept.sourceTrace) ? [...concept.sourceTrace] : [],
      cta: concept.cta || ''
    };

    // Append right after the parent concept to keep related concepts adjacent
    const parentIdx = this.concepts.findIndex(c => c.id === concept.id);
    if (parentIdx >= 0) {
      this.concepts.splice(parentIdx + 1, 0, refinedConcept);
    } else {
      this.concepts.push(refinedConcept);
    }

    if (typeof this.onConceptRefined === 'function') {
      this.onConceptRefined(refinedConcept);
    }

    this.renderCompareView();
    return refinedConcept;
  }

  /**
   * Rejects a concept cleanly without forcing full research workflow
   * @param {string} conceptId 
   * @returns {boolean}
   */
  rejectConcept(conceptId) {
    const id = conceptId || this.targetConceptId;
    if (!id) return false;

    this.concepts = this.concepts.filter(c => c.id !== id);

    if (this.selectedConceptId === id) {
      this.selectedConceptId = null;
    }

    if (typeof this.onConceptRejected === 'function') {
      this.onConceptRejected(id);
    }

    this.renderCompareView();
    return true;
  }

  /**
   * Strictly manual user selection of a concept.
   * DOD Constraint: ผู้ใช้เลือก concept เอง — ไม่มี auto-select/auto-approve
   * 
   * @param {string} conceptId 
   * @returns {Object|null}
   */
  selectConcept(conceptId) {
    if (!conceptId) return null;
    const found = this.concepts.find(c => c.id === conceptId);
    if (!found) return null;

    this.selectedConceptId = conceptId;

    if (typeof this.onConceptSelected === 'function') {
      this.onConceptSelected(found);
    }

    this.renderCompareView();
    return found;
  }

  /**
   * Builds comparison columns model for side-by-side rendering
   * @param {Array<Object>} concepts 
   * @returns {Array<Object>}
   */
  buildComparisonMatrix(concepts = []) {
    const list = concepts.length > 0 ? concepts : this.concepts;
    return list.slice(0, 3).map(c => ({
      id: c.id,
      name: c.name,
      style: c.style,
      hook: c.hook,
      beatsCount: Array.isArray(c.beats) ? c.beats.length : 0,
      visualSound: c.visualSound,
      sourceTraceCount: Array.isArray(c.sourceTrace) ? c.sourceTrace.length : 0,
      cta: c.cta,
      isRefined: Boolean(c.isRefined),
      isSelected: c.id === this.selectedConceptId
    }));
  }

  /**
   * Renders the 2–3 side-by-side concepts into #compare-view
   */
  renderCompareView() {
    if (!this.root || typeof document === 'undefined') return;

    const container = this.root.querySelector('#compare-view');
    const mobilePillsContainer = this.root.querySelector('#compare-mobile-pills');
    if (!container) return;

    // Handle empty state
    if (this.concepts.length === 0) {
      container.innerHTML = `
        <div class="compare-empty-state">
          <div class="empty-icon-wrap" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="3" width="20" height="18" rx="2"></rect>
              <line x1="12" y1="3" x2="12" y2="21"></line>
            </svg>
          </div>
          <h4 class="empty-title">ไม่มีคอนเซปต์ที่เหลืออยู่ในตาราง</h4>
          <p class="empty-desc">คุณได้ปฏิเสธหรือยังไม่ได้สร้างคอนเซปต์ สามารถกดปุ่ม <strong>"Remix ใหม่อีกครั้ง"</strong> เพื่อสังเคราะห์ชุดใหม่</p>
        </div>
      `;
      if (mobilePillsContainer) mobilePillsContainer.innerHTML = '';
      return;
    }

    // Limit to 3 side-by-side concepts for optimal comparison layout
    const displayConcepts = this.concepts.slice(0, 3);

    // Render mobile switcher pills
    if (mobilePillsContainer) {
      mobilePillsContainer.innerHTML = displayConcepts.map((c, idx) => `
        <button type="button" class="mobile-nav-btn ${idx === 0 ? 'active' : ''}" data-target-id="${c.id}" role="tab" aria-selected="${idx === 0}">
          ${c.isRefined ? 'Refined' : `Concept ${idx + 1}`}
        </button>
      `).join('');

      mobilePillsContainer.querySelectorAll('.mobile-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const targetId = btn.getAttribute('data-target-id');
          mobilePillsContainer.querySelectorAll('.mobile-nav-btn').forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-selected', 'false');
          });
          btn.classList.add('active');
          btn.setAttribute('aria-selected', 'true');

          const targetCol = container.querySelector(`.compare-col[data-concept-id="${targetId}"]`);
          if (targetCol && typeof targetCol.scrollIntoView === 'function') {
            targetCol.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          }
        });
      });
    }

    // Render columns
    container.innerHTML = displayConcepts.map((concept, index) => {
      const isSelected = concept.id === this.selectedConceptId;
      const isRefined = Boolean(concept.isRefined);

      const beatsHtml = Array.isArray(concept.beats) && concept.beats.length > 0
        ? concept.beats.map((beat, bIdx) => `
            <li class="compare-beat-item">
              <span class="beat-bullet-num font-num">0${bIdx + 1}</span>
              <span class="beat-text">${this.escapeHtml(beat)}</span>
            </li>
          `).join('')
        : '<li class="compare-beat-item"><span class="beat-text">ไม่มีกำหนด Beats</span></li>';

      const sourcesHtml = Array.isArray(concept.sourceTrace) && concept.sourceTrace.length > 0
        ? concept.sourceTrace.map(src => `
            <div class="source-trace-pill-item">
              <div class="source-trace-meta">
                <span class="source-lens-badge ${src.lens || 'content'}">${src.lens === 'packaging' ? 'HOW' : 'WHAT'}</span>
                <span class="source-ref-title">${this.escapeHtml(src.title || src.refId)}</span>
              </div>
              <p class="source-borrow-desc">${this.escapeHtml(src.borrowText || 'วัตถุดิบต้นแบบ')}</p>
            </div>
          `).join('')
        : `
          <div class="source-trace-pill-item">
            <span class="source-ref-title">Original POV (สังเคราะห์ใหม่ 100%)</span>
          </div>
        `;

      return `
        <article class="compare-col mew-offer-card" data-concept-id="${concept.id}" data-selected="${isSelected}">
          
          <!-- Column Header -->
          <div class="compare-col-header">
            <div class="compare-col-top-meta">
              <span class="concept-badge-tag ${isRefined ? 'refined' : 'original'}">
                ${isRefined ? '✦ Refined Version' : 'Original Angle'}
              </span>
              ${isSelected ? '<span class="col-selected-badge">✓ เลือกแล้ว (Selected)</span>' : ''}
            </div>
            <div class="compare-col-title-group">
              <h4 class="compare-col-title">${this.escapeHtml(concept.name)}</h4>
              <span class="compare-col-style">${this.escapeHtml(concept.style || 'Original Style')}</span>
            </div>
          </div>

          <!-- Row 1: Hook (3 วินาทีแรก) -->
          <div class="compare-row compare-hook-row">
            <span class="compare-row-label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              <span>Hook Point (3 วินาทีแรก)</span>
            </span>
            <div class="compare-hook-box">
              <p class="compare-hook-text">${this.escapeHtml(concept.hook)}</p>
            </div>
          </div>

          <!-- Row 2: Story Beats -->
          <div class="compare-row compare-beats-row">
            <span class="compare-row-label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
              <span>โครงสร้างการเล่า (Story Beats)</span>
            </span>
            <ol class="compare-beats-list">
              ${beatsHtml}
            </ol>
          </div>

          <!-- Row 3: Source Trace Attribution -->
          <div class="compare-row compare-sources-row">
            <span class="compare-row-label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
              <span>Source Trace (ที่มาวัตถุดิบ WHAT / HOW)</span>
            </span>
            <div class="compare-sources-box">
              <div class="source-trace-pill-list">
                ${sourcesHtml}
              </div>
            </div>
          </div>

          <!-- Row 4: Visual & Sound Cue -->
          <div class="compare-row compare-visual-row">
            <span class="compare-row-label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                <line x1="7" y1="2" x2="7" y2="22"></line>
                <line x1="17" y1="2" x2="17" y2="22"></line>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <line x1="2" y1="7" x2="7" y2="7"></line>
                <line x1="2" y1="17" x2="7" y2="17"></line>
                <line x1="17" y1="17" x2="22" y2="17"></line>
                <line x1="17" y1="7" x2="22" y2="7"></line>
              </svg>
              <span>จังหวะภาพและเสียง (Visual &amp; Sound)</span>
            </span>
            <div class="compare-cue-box">
              ${this.escapeHtml(concept.visualSound || 'ภาพ Medium Close-up คมชัด ดนตรีเสริมความน่าติดตาม')}
            </div>
          </div>

          <!-- Column Actions (Manual Selection, Refine, Reject) -->
          <div class="compare-col-actions">
            <button 
              type="button" 
              class="btn-pill btn-primary btn-select-concept ${isSelected ? 'selected-active' : ''}" 
              data-concept-id="${concept.id}"
              aria-pressed="${isSelected}"
              title="เลือกคอนเซปต์นี้เพื่อนำไปทำสคริปต์ต่อไป"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>${isSelected ? 'คอนเซปต์นี้ถูกเลือกอยู่ (Selected)' : 'เลือกคอนเซปต์นี้ (Select)'}</span>
            </button>

            <div class="compare-actions-subgroup">
              <button 
                type="button" 
                class="btn-pill btn-ghost btn-sm btn-col-refine" 
                data-concept-id="${concept.id}"
                title="เปิดหน้าต่างปรับแต่งมุมมองเฉพาะคอนเซปต์นี้"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <polyline points="1 4 1 10 7 10"></polyline>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                </svg>
                <span>ปรับแต่งมุม (Refine)</span>
              </button>

              <button 
                type="button" 
                class="btn-pill btn-danger-ghost btn-sm btn-col-reject" 
                data-concept-id="${concept.id}"
                title="ปฏิเสธและนำคอนเซปต์นี้ออกโดยไม่ต้องค้นคว้าใหม่"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                <span>ปฏิเสธ (Reject)</span>
              </button>
            </div>
          </div>

        </article>
      `;
    }).join('');

    // Attach column event handlers
    container.querySelectorAll('.btn-select-concept').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-concept-id');
        this.selectConcept(id);
      });
    });

    container.querySelectorAll('.btn-col-refine').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-concept-id');
        this.openRefineDialog(id);
      });
    });

    container.querySelectorAll('.btn-col-reject').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-concept-id');
        this.rejectConcept(id);
      });
    });
  }

  /**
   * Helper to sanitize text for secure HTML insertion
   * @param {string} str 
   * @returns {string}
   */
  escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
