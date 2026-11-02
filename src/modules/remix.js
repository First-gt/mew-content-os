/**
 * ==============================================================================
 * MEW CONTENT OS - S06 & S07 Remix Studio & Creative Synthesis Controller
 * Theme: mewteetawat.com V6.3 (Warm Stone, Coral, Violet & Deep Ink)
 * 100% Pure Client-Side JavaScript (Vanilla ES6+)
 * Zero Server Dependencies · Zero Fake Metrics · Accessible WCAG AA/AAA
 * ==============================================================================
 */

// Default authentic founder references for S06 & S07
const DEFAULT_REMIX_REFERENCES = [
  {
    id: 'ref-story-a',
    vaultType: 'content',
    title: 'Post and forget it',
    subtitle: 'ทำไมการปล่อยคอนเทนต์แล้วเลิกนั่งเฝ้ายอดวิว ถึงทำให้สร้างสรรค์งานที่ดีกว่าได้ในระยะยาว',
    creator: 'Mew Teetawat',
    creatorAvatar: 'MT',
    sourceUrl: 'https://youtube.com/@mewteetawat',
    duration: '2:15 นาที',
    tags: ['Mindset', 'Creator Economy', 'Creative Longevity'],
    founderWhy: 'ตรงกับปรัชญาของเรา: คอนเทนต์ที่ดีเกิดจากความสม่ำเสมอและปล่อยวาง ไม่ใช่การ refresh ดูยอดวิวทุก 5 นาที ชอบประเด็นเรื่อง detachment ที่ทำให้ไม่เบิร์นเอาท์ นำไปเล่าต่อเป็นแก่นเรื่องคอนเทนต์คุณภาพได้',
    whatToBorrow: 'แก่นคิดเรื่อง Detachment: แยกคุณค่าของการสร้างสรรค์ออกจากผลลัพธ์ทันที เพื่อรักษาพลังงานและ publication cadence ระยะยาว',
    howToBorrow: 'ใช้โครงสร้างแบบชวนสงสัยในพฤติกรรมเคยชิน แล้วนำเสนอวิธีแก้แบบขัดสัญชาตญาณ (Counter-intuitive solution)'
  },
  {
    id: 'ref-story-b',
    vaultType: 'packaging',
    title: 'The Ticking Clock',
    subtitle: 'เริ่มต้นด้วยเสียงนับถอยหลัง 5 วินาทีก่อนพูดประโยคแรก สร้าง retention สูงสุดใน 3 วินาทีแรก',
    creator: 'Ali Abdaal',
    creatorAvatar: 'AA',
    sourceUrl: 'https://youtube.com/@aliabdaal',
    duration: '0:58 นาที',
    tags: ['Hook Technique', 'Pacing', 'Sound Design'],
    founderWhy: 'เทคนิค Sound Pacing ดีมาก การใช้จังหวะเคาะเวลานับถอยหลังเร่งความรู้สึก FOMO ของคนดู ทำให้สายตาหยุดเลื่อนฟีดทันทีก่อนที่ประโยคแรกจะจบ เหมาะเอามาเป็นจังหวะเปิดคลิปของซีรีส์เรา',
    whatToBorrow: 'การบีบให้เห็นคุณค่าของเวลาที่สูญเสียไปในแต่ละวัน',
    howToBorrow: 'Sensory Audio Hook: เปิดคลิปด้วยเสียงเคาะนาฬิกา Metronome 3-5 วินาที พร้อมมุมกล้องโคลสอัพตัดจังหวะฉับไว'
  },
  {
    id: 'ref-story-c',
    vaultType: 'content',
    title: 'The $0 Marketing Playbook',
    subtitle: 'การสร้างคอนเทนต์ที่เป็น Asset ถาวร แทนการสร้างกระแสชั่วคราวที่จางหายใน 24 ชั่วโมง',
    creator: 'Alex Hormozi',
    creatorAvatar: 'AH',
    sourceUrl: 'https://youtube.com/@alexhormozi',
    duration: '3:40 นาที',
    tags: ['Brand Asset', 'Strategy', 'Evergreen Value'],
    founderWhy: 'ชอบความชัดเจนในเรื่อง Evergreen Asset คอนเทนต์ควรแก้ปัญหาจริงให้คนดูจนเขาจดจำ ไม่ใช่แค่ทำตามเทรนด์เต้นหรือไวรัลไร้สาระ',
    whatToBorrow: 'แนวคิด Content as Asset: เปลี่ยนวิธีมองคอนเทนต์จากโฆษณาเป็นการสะสมความน่าเชื่อถือที่คงอยู่ถาวร',
    howToBorrow: 'การเปรียบเทียบสองขั้วชัดเจน (Polar Contrast) ระหว่างสิ่งที่คนส่วนใหญ่ทำ vs สิ่งที่สร้างผลลัพธ์จริง'
  },
  {
    id: 'ref-story-d',
    vaultType: 'packaging',
    title: 'One-Breath Delivery Cut',
    subtitle: 'การพูดประโยคเปิดตัวด้วยความเร็วคงที่โดยไม่เว้นช่องว่างอากาศ ตัด jump cut ทุกคำเชื่อม',
    creator: 'Colin and Samir',
    creatorAvatar: 'CS',
    sourceUrl: 'https://youtube.com/@colinandsamir',
    duration: '1:10 นาที',
    tags: ['Editing', 'Jump Cut', 'Pacing'],
    founderWhy: 'จังหวะการตัดต่อกระชับมาก ดึงสมาธิคนดูได้อยู่หมัด เหมาะสำหรับคลิปสั้นแนว Insight สรุปประเด็น',
    whatToBorrow: 'การเคารพเวลาของผู้ฟังด้วยการตัดสิ่งฟุ่มเฟือยออกทั้งหมด',
    howToBorrow: 'เทคนิค One-breath cut ใน 4 วินาทีแรก ไร้คำว่าสวัสดีหรือเกริ่นนำ เข้าประเด็นร้อนทันที'
  }
];

// Presets for Founder Direction Form
const DIRECTION_PRESETS = {
  'thought-leader': {
    targetAudience: 'Solo Creator และ Founder ที่เหนื่อยกับการนั่งเฝ้ายอดวิวหลังโพสต์ จนเบิร์นเอาท์และหมดไฟสร้างสรรค์งานระยะยาว',
    ourPov: 'คอนเทนต์ที่ดีเกิดจากจังหวะการสร้างที่ต่อเนื่องและปล่อยวาง (Detachment) การเฝ้าดูยอดวิวทันทีทำให้เกิด Cognitive Bias จนสูญเสียความกล้าที่จะทดลองไอเดียใหม่',
    brandTruth: 'เรามีระบบ MEW Content OS ที่แยกคลัง Content (สาระ) และ Packaging (วิธีเล่า) ชัดเจน ช่วยให้ Creator สร้างคอนเทนต์ที่มีคุณภาพได้ต่อเนื่องโดยไม่พึ่งพาตัวเลขลวงตา',
    goal: 'perspective-shift',
    constraints: 'ห้ามใช้สถิติหรือเปอร์เซ็นต์สมมติ, ห้ามเล่นมุกฝืด, ซื่อสัตย์ต่อประสบการณ์จริง, เล่าแบบ Founder แบ่งปันให้เพื่อนฟังอย่างถ่อมตน'
  },
  'contrarian': {
    targetAudience: 'ผู้ประกอบการและนักสร้างคอนเทนต์ที่ถูกกลืนไปกับกระแสไวรัลรายวัน จนลืมเป้าหมายหลักของการสร้างธุรกิจ',
    ourPov: 'อัลกอริทึมไม่ได้เป็นเจ้านายเรา คนดูที่ใช่ต่างหากคือคนที่สำคัญที่สุด การยอมแลกคุณค่าระยะยาวเพื่อแลกกับวิวชั่วข้ามคืนเป็นการลงทุนที่ขาดทุน',
    brandTruth: 'เราเชื่อมั่นในการสร้างผลงานที่มีเนื้อหาสาระเข้มข้น มีที่มาที่ไปชัดเจน ไม่เคลมผลลัพธ์เว่อร์เกินจริง',
    goal: 'trust-authority',
    constraints: 'ห้ามสัญญาว่าจะรวยเร็ว, ห้ามใช้คำโอ้อวด, สื่อสารด้วยความจริงใจและยกตัวอย่างข้อผิดพลาดจริงของตัวเอง'
  },
  'playbook': {
    targetAudience: 'ทีมการตลาดและ Creator สายความรู้ที่ต้องการระบบทำงานแบบมีแบบแผน ไม่ต้องรอแรงบันดาลใจ',
    ourPov: 'แรงบันดาลใจเป็นเรื่องชั่วคราว แต่ระบบคิดและคลังวัตถุดิบเป็นสิ่งที่ทำซ้ำได้ตลอดเวลา',
    brandTruth: 'เราใช้กรอบความคิด C(N) + P(N) ที่ผสานสาระเข้ากับวิธีนำเสนออย่างเป็นวิทยาศาสตร์',
    goal: 'actionable-clarity',
    constraints: 'อธิบายเป็นขั้นตอน 1-2-3 ชัดเจน, หลีกเลี่ยงศัพท์เทคนิคที่ซับซ้อนเกินจำเป็น, เน้นการนำไปปรับใช้ได้ทันที'
  }
};

class RemixStudioController {
  /**
   * Initializes the Remix Studio Controller
   * @param {Object} options 
   * @param {HTMLElement|string} options.rootId Root container element or selector
   */
  constructor(options = {}) {
    this.root = typeof options.rootId === 'string'
      ? document.querySelector(options.rootId)
      : (options.rootId || document.getElementById('remix-root') || document.body);

    this.basket = [];
    this.allReferences = [];
    this.concepts = [];
    this.selectedPickerIds = new Set();
    this.activePreset = 'thought-leader';
    this.activeRefineTarget = 'concept-a';
    this.isGenerating = false;

    this.initData();
    this.cacheDom();
    this.bindEvents();
    this.render();
  }

  /**
   * Loads saved references and active remix basket from localStorage
   */
  initData() {
    try {
      // 1. Load or seed references without overwriting user-saved clips
      const map = new Map();
      const userSavedRaw = localStorage.getItem('mew_user_saved_clips');
      if (userSavedRaw) {
        const parsedUser = JSON.parse(userSavedRaw);
        if (Array.isArray(parsedUser)) {
          parsedUser.forEach(r => {
            const norm = this.normalizeReference(r);
            map.set(norm.id, norm);
          });
        }
      }

      const storedRefs = localStorage.getItem('mew_saved_references');
      if (storedRefs) {
        const parsed = JSON.parse(storedRefs);
        if (Array.isArray(parsed)) {
          parsed.forEach(r => {
            const norm = this.normalizeReference(r);
            if (!map.has(norm.id)) map.set(norm.id, norm);
          });
        }
      }

      DEFAULT_REMIX_REFERENCES.forEach(r => {
        const norm = this.normalizeReference(r);
        if (!map.has(norm.id)) map.set(norm.id, norm);
      });

      this.allReferences = Array.from(map.values());

      // 2. Load or seed remix basket
      const storedBasket = localStorage.getItem('mew_remix_basket');
      if (storedBasket) {
        const parsedBasket = JSON.parse(storedBasket);
        if (Array.isArray(parsedBasket) && parsedBasket.length > 0) {
          this.basket = parsedBasket.map(this.normalizeReference);
        } else {
          this.loadDefaultPair();
        }
      } else {
        this.loadDefaultPair();
      }

      // 3. Load or generate initial concepts
      const storedConcepts = localStorage.getItem('mew_remix_active_concepts');
      if (storedConcepts) {
        const parsedConcepts = JSON.parse(storedConcepts);
        if (Array.isArray(parsedConcepts) && parsedConcepts.length > 0) {
          this.concepts = parsedConcepts;
        } else {
          this.concepts = this.generateSampleConcepts();
        }
      } else {
        this.concepts = this.generateSampleConcepts();
        this.persistConcepts();
      }
    } catch (err) {
      console.warn('[RemixStudioController] Error initializing data:', err);
      this.allReferences = DEFAULT_REMIX_REFERENCES.map(this.normalizeReference);
      this.loadDefaultPair();
      this.concepts = this.generateSampleConcepts();
    }
  }

  /**
   * Loads default pairing: Story A (Content) + Story B (Packaging)
   */
  loadDefaultPair() {
    const storyA = this.allReferences.find(r => r.id === 'ref-story-a') || DEFAULT_REMIX_REFERENCES[0];
    const storyB = this.allReferences.find(r => r.id === 'ref-story-b') || DEFAULT_REMIX_REFERENCES[1];
    this.basket = [this.normalizeReference(storyA), this.normalizeReference(storyB)];
    this.persistBasket();
  }

  /**
   * Normalizes a reference item
   */
  normalizeReference(item) {
    const isContent = item.vaultType === 'content';
    return {
      id: item.id || `ref-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      vaultType: item.vaultType || 'content',
      title: item.title || item.clipTitle || 'Untitled Reference',
      subtitle: item.subtitle || '',
      creator: item.creator || item.author || 'Anonymous Creator',
      creatorAvatar: item.creatorAvatar || (item.creator ? item.creator.slice(0, 2).toUpperCase() : 'CR'),
      duration: item.duration || '1:00 นาที',
      tags: Array.isArray(item.tags) ? item.tags : ['Reference'],
      founderWhy: item.founderWhy || 'บันทึกเพื่อนำมาสกัดเป็นวัตถุดิบในการสร้างสรรค์',
      whatToBorrow: item.whatToBorrow || (isContent ? (item.founderWhy || 'แก่นคิดและสาระสำคัญของเรื่อง') : 'สกัดความเข้าใจเชิงแนวคิด'),
      howToBorrow: item.howToBorrow || (!isContent ? (item.founderWhy || 'จังหวะการเล่าและลูกเล่นการเปิดคลิป') : 'โครงสร้างการเรียงลำดับเนื้อหา')
    };
  }

  /**
   * Caches DOM references
   */
  cacheDom() {
    this.dom = {
      // Header
      btnOpenPickerHeader: this.root.querySelector('#btn-open-picker-header'),

      // Basket Bar
      basketCard: this.root.querySelector('.remix-basket-card'),
      basketSummaryText: this.root.querySelector('#basket-summary-text'),
      basketValidationBadge: this.root.querySelector('#basket-validation-badge'),
      basketValidationText: this.root.querySelector('#basket-validation-text'),
      basketChipsList: this.root.querySelector('#basket-chips-list'),
      btnOpenPickerBar: this.root.querySelector('#btn-open-picker-bar'),
      btnLoadSamplePair: this.root.querySelector('#btn-load-sample-pair'),
      btnClearBasket: this.root.querySelector('#btn-clear-basket'),

      // Column 1: Ingredients
      colIngredientsCount: this.root.querySelector('#col-ingredients-count'),
      ingredientsCardsStack: this.root.querySelector('#ingredients-cards-stack'),
      ingredientsEmptyState: this.root.querySelector('#ingredients-empty-state'),
      btnEmptyAddPicker: this.root.querySelector('#btn-empty-add-picker'),
      btnEmptyLoadSample: this.root.querySelector('#btn-empty-load-sample'),

      // Column 2: Direction Form
      btnResetDirection: this.root.querySelector('#btn-reset-direction'),
      presetChips: this.root.querySelectorAll('.preset-chip'),
      inputTargetAudience: this.root.querySelector('#input-target-audience'),
      inputOurPov: this.root.querySelector('#input-our-pov'),
      inputBrandTruth: this.root.querySelector('#input-brand-truth'),
      goalRadios: this.root.querySelectorAll('input[name="content_goal"]'),
      inputConstraints: this.root.querySelector('#input-constraints'),
      btnGenerateConcepts: this.root.querySelector('#btn-generate-concepts'),

      // Column 3: Concepts
      btnCompareConceptsTop: this.root.querySelector('#btn-compare-concepts-top'),
      conceptsLoadingState: this.root.querySelector('#concepts-loading-state'),
      loadingStepText: this.root.querySelector('#loading-step-text'),
      loadingProgressFill: this.root.querySelector('#loading-progress-fill'),
      conceptsCardsStack: this.root.querySelector('#concepts-cards-stack'),
      conceptsEmptyState: this.root.querySelector('#concepts-empty-state'),
      btnEmptyGenerate: this.root.querySelector('#btn-empty-generate'),

      // Picker Modal
      pickerModal: this.root.querySelector('#remix-picker-modal'),
      btnClosePickerModal: this.root.querySelector('#btn-close-picker-modal'),
      btnCancelPicker: this.root.querySelector('#btn-cancel-picker'),
      btnConfirmPicker: this.root.querySelector('#btn-confirm-picker'),
      inputPickerSearch: this.root.querySelector('#input-picker-search'),
      pickerFilterButtons: this.root.querySelectorAll('[data-picker-filter]'),
      pickerItemsList: this.root.querySelector('#picker-items-list'),
      pickerSelectionSummary: this.root.querySelector('#picker-selection-summary'),

      // Compare Modal
      compareModal: this.root.querySelector('#remix-compare-modal'),
      btnCloseCompareModal: this.root.querySelector('#btn-close-compare-modal'),
      btnCloseCompareFooter: this.root.querySelector('#btn-close-compare-footer'),
      compareMatrixScroll: this.root.querySelector('#compare-matrix-scroll'),

      // Refine Modal
      refineModal: this.root.querySelector('#remix-refine-modal'),
      btnCloseRefineModal: this.root.querySelector('#btn-close-refine-modal'),
      btnCancelRefine: this.root.querySelector('#btn-cancel-refine'),
      btnApplyRefine: this.root.querySelector('#btn-apply-refine'),
      refineConceptTargetBadge: this.root.querySelector('#refine-concept-target-badge'),
      refineChips: this.root.querySelectorAll('.refine-chip'),
      inputRefineCustomPrompt: this.root.querySelector('#input-refine-custom-prompt'),

      // Toast
      toastBox: this.root.querySelector('#remix-toast'),
      toastTitle: this.root.querySelector('#remix-toast-title'),
      toastDesc: this.root.querySelector('#remix-toast-desc'),
      toastIcon: this.root.querySelector('#remix-toast-icon'),
      btnToastDismiss: this.root.querySelector('#btn-remix-toast-dismiss')
    };
  }

  /**
   * Binds UI event listeners
   */
  bindEvents() {
    // 1. Picker Modal Openers
    if (this.dom.btnOpenPickerHeader) {
      this.dom.btnOpenPickerHeader.addEventListener('click', () => this.openPickerModal());
    }
    if (this.dom.btnOpenPickerBar) {
      this.dom.btnOpenPickerBar.addEventListener('click', () => this.openPickerModal());
    }
    if (this.dom.btnEmptyAddPicker) {
      this.dom.btnEmptyAddPicker.addEventListener('click', () => this.openPickerModal());
    }

    // 2. Basket Reset & Clear
    if (this.dom.btnLoadSamplePair) {
      this.dom.btnLoadSamplePair.addEventListener('click', () => {
        this.loadDefaultPair();
        this.render();
        this.showToast('Reset วัตถุดิบเรียบร้อย', 'โหลด Story A (Content) และ Story B (Packaging) เข้าสู่ตะกร้าแล้ว', 'violet');
      });
    }
    if (this.dom.btnEmptyLoadSample) {
      this.dom.btnEmptyLoadSample.addEventListener('click', () => {
        this.loadDefaultPair();
        this.render();
        this.showToast('โหลดวัตถุดิบแนะนำ', 'โหลด Story A + Story B เข้าสู่ตะกร้าเรียบร้อย', 'violet');
      });
    }
    if (this.dom.btnClearBasket) {
      this.dom.btnClearBasket.addEventListener('click', () => {
        this.basket = [];
        this.persistBasket();
        this.render();
        this.showToast('ล้างตะกร้าแล้ว', 'คุณสามารถเลือกวัตถุดิบใหม่ได้จากปุ่ม Add Ingredient', 'violet');
      });
    }

    // 3. Direction Preset Switching
    if (this.dom.presetChips) {
      this.dom.presetChips.forEach(chip => {
        chip.addEventListener('click', (e) => {
          const presetKey = e.currentTarget.getAttribute('data-preset');
          this.applyDirectionPreset(presetKey);
        });
      });
    }
    if (this.dom.btnResetDirection) {
      this.dom.btnResetDirection.addEventListener('click', () => {
        this.applyDirectionPreset('thought-leader');
        this.showToast('คืนค่าทิศทางเริ่มต้น', 'ตั้งค่าเป็น Thought Leadership เรียบร้อย', 'violet');
      });
    }

    // 4. Generate Concepts CTA
    if (this.dom.btnGenerateConcepts) {
      this.dom.btnGenerateConcepts.addEventListener('click', () => this.triggerGeneration());
    }
    if (this.dom.btnEmptyGenerate) {
      this.dom.btnEmptyGenerate.addEventListener('click', () => this.triggerGeneration());
    }

    // 5. Compare Concepts Modal
    if (this.dom.btnCompareConceptsTop) {
      this.dom.btnCompareConceptsTop.addEventListener('click', () => this.openCompareModal());
    }
    if (this.dom.btnCloseCompareModal) {
      this.dom.btnCloseCompareModal.addEventListener('click', () => this.closeCompareModal());
    }
    if (this.dom.btnCloseCompareFooter) {
      this.dom.btnCloseCompareFooter.addEventListener('click', () => this.closeCompareModal());
    }

    // 6. Picker Modal Controls
    if (this.dom.btnClosePickerModal) {
      this.dom.btnClosePickerModal.addEventListener('click', () => this.closePickerModal());
    }
    if (this.dom.btnCancelPicker) {
      this.dom.btnCancelPicker.addEventListener('click', () => this.closePickerModal());
    }
    if (this.dom.btnConfirmPicker) {
      this.dom.btnConfirmPicker.addEventListener('click', () => this.confirmPickerSelection());
    }
    if (this.dom.inputPickerSearch) {
      this.dom.inputPickerSearch.addEventListener('input', () => this.renderPickerItems());
    }
    if (this.dom.pickerFilterButtons) {
      this.dom.pickerFilterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          this.dom.pickerFilterButtons.forEach(b => b.classList.remove('active'));
          e.currentTarget.classList.add('active');
          this.renderPickerItems();
        });
      });
    }

    // 7. Refine Modal Controls
    if (this.dom.btnCloseRefineModal) {
      this.dom.btnCloseRefineModal.addEventListener('click', () => this.closeRefineModal());
    }
    if (this.dom.btnCancelRefine) {
      this.dom.btnCancelRefine.addEventListener('click', () => this.closeRefineModal());
    }
    if (this.dom.btnApplyRefine) {
      this.dom.btnApplyRefine.addEventListener('click', () => this.applyRefinement());
    }
    if (this.dom.refineChips) {
      this.dom.refineChips.forEach(chip => {
        chip.addEventListener('click', (e) => {
          const prompt = e.currentTarget.getAttribute('data-prompt');
          if (this.dom.inputRefineCustomPrompt) {
            this.dom.inputRefineCustomPrompt.value = prompt;
            this.dom.inputRefineCustomPrompt.focus();
          }
        });
      });
    }

    // 8. Toast Dismiss
    if (this.dom.btnToastDismiss) {
      this.dom.btnToastDismiss.addEventListener('click', () => this.hideToast());
    }

    // 9. Keyboard Accessibility (Escape closes modals)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.dom.pickerModal && !this.dom.pickerModal.hidden) this.closePickerModal();
        if (this.dom.compareModal && !this.dom.compareModal.hidden) this.closeCompareModal();
        if (this.dom.refineModal && !this.dom.refineModal.hidden) this.closeRefineModal();
      }
    });

    // 10. Listen for cross-module events (from Library "Use in Remix" or S03 Save)
    const handleAddIngredientEvent = (e) => {
      const ref = e.detail?.reference || e.detail;
      if (ref && (ref.title || ref.id)) {
        const normalized = this.normalizeReference({
          ...ref,
          vaultType: ref.lens || ref.vaultType || 'content'
        });
        if (!this.allReferences.some(r => r.id === normalized.id)) {
          this.allReferences.unshift(normalized);
        }
        this.addIngredient(normalized);
        this.showToast('เพิ่มวัตถุดิบแล้ว', `เพิ่ม "${normalized.title}" เข้าสู่ Remix Studio เรียบร้อย`, 'violet');
      }
    };
    window.addEventListener('mew_send_to_remix', handleAddIngredientEvent);
    window.addEventListener('mew:remix-select-ingredient', handleAddIngredientEvent);

    window.addEventListener('mew:reference-saved', (e) => {
      if (e.detail) {
        const normalized = this.normalizeReference({
          ...e.detail,
          vaultType: e.detail.vaultType === 'packaging' ? 'packaging' : 'content'
        });
        if (!this.allReferences.some(r => r.id === normalized.id)) {
          this.allReferences.unshift(normalized);
        }
      }
    });
  }

  /**
   * Main Render Coordinator
   */
  render() {
    this.renderBasketBar();
    this.renderIngredientsColumn();
    this.renderConceptsColumn();
  }

  /**
   * Computes basket formula and validation stats
   */
  getBasketStats() {
    const contentCount = this.basket.filter(item => item.vaultType === 'content').length;
    const packagingCount = this.basket.filter(item => item.vaultType === 'packaging').length;
    const total = this.basket.length;
    const isValid = contentCount >= 1; // S06 rule: C >= 1 and P >= 0

    return {
      contentCount,
      packagingCount,
      total,
      isValid,
      formulaText: `C(${contentCount}) + P(${packagingCount})`
    };
  }

  /**
   * Renders the Top Basket Summary Bar
   */
  renderBasketBar() {
    const stats = this.getBasketStats();

    // Summary Text
    if (this.dom.basketSummaryText) {
      if (stats.total === 0) {
        this.dom.basketSummaryText.textContent = 'ยังไม่มีวัตถุดิบในตะกร้า (ต้องการ Content อย่างน้อย 1 รายการ)';
      } else {
        this.dom.basketSummaryText.textContent = `เลือกแล้ว ${stats.total} รายการ · Content: ${stats.contentCount} · Packaging: ${stats.packagingCount}`;
      }
    }

    // Formula Badge & Status
    if (this.dom.basketValidationBadge && this.dom.basketValidationText) {
      if (stats.isValid) {
        this.dom.basketValidationBadge.className = 'basket-formula-badge valid';
        this.dom.basketValidationText.textContent = `${stats.formulaText} · พร้อมสังเคราะห์`;
      } else {
        this.dom.basketValidationBadge.className = 'basket-formula-badge invalid';
        this.dom.basketValidationText.textContent = `${stats.formulaText} · ต้องการ Content ≥ 1`;
      }
    }

    // Chips Strip
    if (this.dom.basketChipsList) {
      if (this.basket.length === 0) {
        this.dom.basketChipsList.innerHTML = `
          <li style="font-size: 0.8rem; color: var(--v6-muted-light); font-style: italic;">
            ไม่มีวัตถุดิบ — กดปุ่ม + Add Ingredient เพื่อเริ่มต้น
          </li>
        `;
      } else {
        this.dom.basketChipsList.innerHTML = this.basket.map((item, index) => {
          const isContent = item.vaultType === 'content';
          return `
            <li class="ingredient-chip ${isContent ? 'content-type' : 'packaging-type'}" title="${this.escapeHtml(item.title)}">
              <span class="chip-tag-mini">${isContent ? 'C' : 'P'}${index + 1}</span>
              <span style="max-width: 130px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${this.escapeHtml(item.title)}
              </span>
              <button 
                type="button" 
                class="chip-remove-btn" 
                data-id="${item.id}" 
                aria-label="ลบ ${this.escapeHtml(item.title)} ออกจากตะกร้า"
              >
                &times;
              </button>
            </li>
          `;
        }).join('');

        // Wire remove buttons
        this.dom.basketChipsList.querySelectorAll('.chip-remove-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            this.removeIngredient(id);
          });
        });
      }
    }

    // Update column 1 count badge
    if (this.dom.colIngredientsCount) {
      this.dom.colIngredientsCount.textContent = `${stats.total} ชิ้น`;
    }

    // Toggle disabled state on Generate button based on formula rule
    if (this.dom.btnGenerateConcepts) {
      this.dom.btnGenerateConcepts.disabled = !stats.isValid;
      if (!stats.isValid) {
        this.dom.btnGenerateConcepts.title = 'ต้องการ Content Vault อย่างน้อย 1 รายการเพื่อเป็นแก่นสาระ';
      } else {
        this.dom.btnGenerateConcepts.title = 'เริ่มการสังเคราะห์แนวคิดต้นฉบับด้วย AI';
      }
    }
  }

  /**
   * Renders Column 1: Ingredients Detailed Cards
   */
  renderIngredientsColumn() {
    if (!this.dom.ingredientsCardsStack || !this.dom.ingredientsEmptyState) return;

    if (this.basket.length === 0) {
      this.dom.ingredientsCardsStack.innerHTML = '';
      this.dom.ingredientsEmptyState.hidden = false;
      return;
    }

    this.dom.ingredientsEmptyState.hidden = true;
    this.dom.ingredientsCardsStack.innerHTML = this.basket.map((item, index) => {
      const isContent = item.vaultType === 'content';
      return `
        <article class="ingredient-detail-card ${isContent ? 'content-vault' : 'packaging-vault'}" data-id="${item.id}">
          <div class="ingredient-card-header">
            <div class="ingredient-badge-row">
              <span class="badge-pill ${isContent ? 'coral' : 'violet'}">
                ${isContent ? 'Content Vault (สาระ)' : 'Packaging Vault (วิธีเล่า)'}
              </span>
              <span class="badge-pill soft">#${index + 1}</span>
            </div>

            <button 
              type="button" 
              class="btn-card-icon-action btn-remove-item" 
              data-id="${item.id}"
              aria-label="ลบ ${this.escapeHtml(item.title)}"
              title="ลบออกจากรายการ"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <h3 class="ingredient-card-title">${this.escapeHtml(item.title)}</h3>
          
          <div class="ingredient-card-creator">
            <span class="creator-avatar-mini">${this.escapeHtml(item.creatorAvatar || 'CR')}</span>
            <span>${this.escapeHtml(item.creator)}</span>
            <span>·</span>
            <span>${this.escapeHtml(item.duration)}</span>
          </div>

          <!-- Borrow Extraction Note -->
          <div class="borrow-note-block">
            <span class="borrow-note-label">
              ${isContent ? 'WHAT TO BORROW (แก่นคิด):' : 'HOW TO BORROW (จังหวะเล่า):'}
            </span>
            <p class="borrow-note-text">
              ${this.escapeHtml(isContent ? item.whatToBorrow : item.howToBorrow)}
            </p>
          </div>
        </article>
      `;
    }).join('');

    // Wire remove actions in card stack
    this.dom.ingredientsCardsStack.querySelectorAll('.btn-remove-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        this.removeIngredient(id);
      });
    });
  }

  /**
   * Applies a Founder Direction preset to the form
   */
  applyDirectionPreset(presetKey) {
    const preset = DIRECTION_PRESETS[presetKey];
    if (!preset) return;

    this.activePreset = presetKey;

    // Update preset pills active state
    if (this.dom.presetChips) {
      this.dom.presetChips.forEach(chip => {
        const matches = chip.getAttribute('data-preset') === presetKey;
        chip.classList.toggle('active', matches);
        chip.setAttribute('aria-checked', matches ? 'true' : 'false');
      });
    }

    // Populate inputs
    if (this.dom.inputTargetAudience) this.dom.inputTargetAudience.value = preset.targetAudience;
    if (this.dom.inputOurPov) this.dom.inputOurPov.value = preset.ourPov;
    if (this.dom.inputBrandTruth) this.dom.inputBrandTruth.value = preset.brandTruth;
    if (this.dom.inputConstraints) this.dom.inputConstraints.value = preset.constraints;

    // Set goal radio
    if (this.dom.goalRadios) {
      this.dom.goalRadios.forEach(radio => {
        radio.checked = radio.value === preset.goal;
      });
    }
  }

  /**
   * Renders Column 3: Original Concepts Cards Stack
   */
  renderConceptsColumn() {
    if (!this.dom.conceptsCardsStack || !this.dom.conceptsEmptyState) return;

    // If currently generating, show loading skeleton
    if (this.isGenerating) {
      if (this.dom.conceptsLoadingState) this.dom.conceptsLoadingState.hidden = false;
      this.dom.conceptsCardsStack.hidden = true;
      this.dom.conceptsEmptyState.hidden = true;
      return;
    }

    if (this.dom.conceptsLoadingState) this.dom.conceptsLoadingState.hidden = true;

    if (!this.concepts || this.concepts.length === 0) {
      this.dom.conceptsCardsStack.innerHTML = '';
      this.dom.conceptsCardsStack.hidden = true;
      this.dom.conceptsEmptyState.hidden = false;
      return;
    }

    this.dom.conceptsEmptyState.hidden = true;
    this.dom.conceptsCardsStack.hidden = false;

    this.dom.conceptsCardsStack.innerHTML = this.concepts.map((concept) => {
      const isViolet = concept.accent === 'violet';
      const isCoral = concept.accent === 'coral';

      return `
        <article class="concept-synthesis-card mew-offer-card ${isViolet ? 'violet-bar' : (isCoral ? 'coral-accent' : '')}" id="${concept.id}">
          
          <!-- Top Row Badges -->
          <div class="concept-card-top-row">
            <div class="concept-badges-group">
              <span class="badge-pill ${isViolet ? 'violet' : (isCoral ? 'coral' : 'soft')}">
                ${this.escapeHtml(concept.badge)}
              </span>
              <span class="badge-pill soft">${this.escapeHtml(concept.angle)}</span>
            </div>
            <span class="badge-pill green">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Original Concept
            </span>
          </div>

          <!-- Concept Title -->
          <h3 class="concept-card-title">${this.escapeHtml(concept.title)}</h3>

          <!-- Original Hook Blockquote -->
          <div class="concept-hook-box">
            <div class="concept-hook-header">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" color="var(--v6-coral)">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              <span class="hook-tag-label">Original Hook (0:00 - 0:04):</span>
            </div>
            <p class="concept-hook-quote">"${this.escapeHtml(concept.hook)}"</p>
          </div>

          <!-- Story Beats (1-4) -->
          <div class="concept-story-beats">
            <div class="beats-section-title">
              <span>Story Beats Progression</span>
              <span>4 Beats Flow</span>
            </div>
            <ol class="beats-list">
              ${concept.beats.map((beat, bIndex) => `
                <li class="beat-item-row">
                  <span class="beat-bullet-num">${bIndex + 1}</span>
                  <div class="beat-content-wrap">
                    <span class="beat-title-bold">${this.escapeHtml(beat.title)}</span>
                    <span class="beat-timecode-tag">${this.escapeHtml(beat.timecode)}</span>
                    <p class="beat-desc-text">${this.escapeHtml(beat.desc)}</p>
                  </div>
                </li>
              `).join('')}
            </ol>
          </div>

          <!-- Claim Verification (Anti-Hallucination Guardrail) -->
          <div class="concept-verification-box">
            <div class="verification-icon" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <p class="verification-text">
              <strong>Claim Verification:</strong> ${this.escapeHtml(concept.claimVerification)}
            </p>
          </div>

          <!-- Visual & Sound Directions -->
          <div class="concept-production-notes">
            <div class="prod-note-card">
              <div class="prod-note-title">Visual Direction:</div>
              <p class="prod-note-desc">${this.escapeHtml(concept.visualDirection)}</p>
            </div>
            <div class="prod-note-card">
              <div class="prod-note-title">Sound Direction:</div>
              <p class="prod-note-desc">${this.escapeHtml(concept.soundDirection)}</p>
            </div>
          </div>

          <!-- Reference Source Traceability -->
          <div class="concept-traceability-bar">
            <div class="traceability-header">Source Traceability:</div>
            <div class="traceability-tags">
              <div class="traceability-item">
                <span style="color: var(--v6-coral); font-weight: 700;">WHAT:</span>
                <span>ยืมแก่นคิดจาก <strong>${this.escapeHtml(concept.sourceWhat)}</strong></span>
              </div>
              <div class="traceability-item">
                <span style="color: var(--v6-violet); font-weight: 700;">HOW:</span>
                <span>ยืมจังหวะเล่าจาก <strong>${this.escapeHtml(concept.sourceHow)}</strong></span>
              </div>
            </div>
          </div>

          <!-- Action Buttons in V6 Pill style -->
          <div class="concept-card-actions">
            <div class="concept-actions-left">
              <button 
                type="button" 
                class="btn-pill btn-ghost btn-sm btn-refine-angle" 
                data-concept-id="${concept.id}"
                aria-label="ปรับแต่งแนวคิด ${this.escapeHtml(concept.title)}"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
                <span>Refine This Angle</span>
              </button>
            </div>

            <div class="concept-actions-right">
              <button 
                type="button" 
                class="btn-pill btn-ghost btn-sm btn-save-concept-draft" 
                data-concept-id="${concept.id}"
                aria-label="บันทึก ${this.escapeHtml(concept.title)} เป็นฉบับร่าง"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                <span>Save as Draft</span>
              </button>

              <button 
                type="button" 
                class="btn-pill btn-primary btn-sm btn-send-to-board" 
                data-concept-id="${concept.id}"
                aria-label="ส่งเข้า Content Board เพื่อเริ่มทำบท"
              >
                <span>Send to Board →</span>
              </button>
            </div>
          </div>

        </article>
      `;
    }).join('');

    // Wire concept card action buttons
    this.dom.conceptsCardsStack.querySelectorAll('.btn-refine-angle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-concept-id');
        this.openRefineModal(id);
      });
    });

    this.dom.conceptsCardsStack.querySelectorAll('.btn-save-concept-draft').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-concept-id');
        this.saveConceptAsDraft(id);
      });
    });

    this.dom.conceptsCardsStack.querySelectorAll('.btn-send-to-board').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-concept-id');
        this.sendConceptToBoard(id);
      });
    });
  }

  /**
   * Generates sample original concepts based on default setup
   */
  generateSampleConcepts() {
    return [
      {
        id: 'concept-a',
        badge: 'Concept A',
        accent: 'coral',
        angle: 'Contrarian Mindset Shift',
        title: 'The Post & Forget Rule: ทำไมคนดูที่ดีถึงเกลียดการเร่งยอดวิว',
        hook: 'ถ้าคุณยังรีเฟรชหน้าจอดูยอดวิวทุก 5 นาทีหลังโพสต์ คุณไม่ได้กำลังทำคอนเทนต์... แต่คุณกำลังตกเป็นทาสของความวิตกกังวล',
        beats: [
          {
            title: 'Beat 1: Pattern Interrupt Hook',
            timecode: '0:00 - 0:04',
            desc: 'เปิดด้วยเสียงเคาะเวลานับถอยหลัง 3 วินาที พร้อมข้อความแทงใจดำเรื่องการนั่งเฝ้ายอดวิว'
          },
          {
            title: 'Beat 2: Relatable Agitation',
            timecode: '0:05 - 0:28',
            desc: 'เผยวงจรจิตวิทยาที่การเสพติดตัวเลขทันที ทำลายความกล้าในการนำเสนอประเด็นลึกซึ้ง'
          },
          {
            title: 'Beat 3: Core Founder Truth',
            timecode: '0:29 - 1:15',
            desc: 'นำเสนอกฎ 72 ชั่วโมงแห่งการตัดขาด (Detachment Framework) ส่งมอบคอนเทนต์เป็น Asset ระยะยาว'
          },
          {
            title: 'Beat 4: Actionable Cadence',
            timecode: '1:16 - 1:45',
            desc: 'ท้าทายให้ลองปิดการแจ้งเตือนแล้วเริ่มวางโครงเรื่องถัดไปในทันที โดยไม่ต้องรอฟีดแบค'
          }
        ],
        claimVerification: 'ตรวจสอบแล้ว: ข้อคิดอิงจากประสบการณ์การทำงานจริงของ Founder ปราศจากสถิติสมมติหรือตัวเลขลวงตา',
        visualDirection: 'มุมมอง Head-on Desk Talk แสง Warm Stone ตัดภาพสลับระหว่างกล้องหลักและสมาร์ตโฟนที่คว่ำหน้าจอลงบนโต๊ะ',
        soundDirection: 'เสียงเข็มนาฬิกา Metronome ชัดเจนใน 3 วินาทีแรก ก่อนลดระดับลงเป็นดนตรี Lo-fi คลอเบาๆ',
        sourceWhat: 'Post and forget it (Mew Teetawat) — แก่นเรื่อง Detachment',
        sourceHow: 'The Ticking Clock (Ali Abdaal) — จังหวะ Sensory Metronome'
      },
      {
        id: 'concept-b',
        badge: 'Concept B',
        accent: 'violet',
        angle: 'Actionable Operating System',
        title: 'The Dual-Vault Method: เปลี่ยนคลิปที่ชอบให้เป็นไอเดียที่ไม่ก๊อปปี้ใคร',
        hook: 'คนส่วนใหญ่เซฟคลิปเพราะความตื่นเต้น แต่สิ่งที่ทำให้คุณสร้างงานดีได้ คือการแยกแยะระหว่าง สาระ และ วิธีเล่า ให้ขาดจากกัน',
        beats: [
          {
            title: 'Beat 1: Bold Question Hook',
            timecode: '0:00 - 0:04',
            desc: 'ถามคนดูตรงๆ ว่าในเครื่องมีคลิปเซฟไว้กี่ร้อยคลิปที่ไม่ได้เอามาใช้ประโยชน์จริง'
          },
          {
            title: 'Beat 2: Root Problem Analysis',
            timecode: '0:05 - 0:30',
            desc: 'อธิบายว่าทำไมการก๊อปปี้คลิปตรงๆ ถึงล้มเหลว เพราะไปยืมทั้งแก่นและหน้าตามาพร้อมกัน'
          },
          {
            title: 'Beat 3: The 2-Vault Solution',
            timecode: '0:31 - 1:12',
            desc: 'สอนวิธีแยกระหว่าง Content Vault (สาระที่เชื่อ) และ Packaging Vault (จังหวะที่ดึงดูด)'
          },
          {
            title: 'Beat 4: Execution Checklist',
            timecode: '1:13 - 1:45',
            desc: 'ให้สูตร C1 + P1 ผสมวัตถุดิบเข้ากับ Brand Truth ของตัวเองทันทีในชิ้นถัดไป'
          }
        ],
        claimVerification: 'ตรวจสอบแล้ว: โครงสร้างนำเสนอจากกระบวนการทำงานจริงในระบบ MEW Content OS โดยตรง',
        visualDirection: 'สลับระหว่างคนพูดหน้าตรง กับภาพกราฟิก split screen ซ้าย-ขวา เปรียบเทียบสองคลังชัดเจน',
        soundDirection: 'เสียงเปิดสมุดโน้ตจริงและปากกาขีดเส้นเน้นความกระตือรือร้น ไร้ซาวด์เอฟเฟกต์ประหลาด',
        sourceWhat: 'The $0 Marketing Playbook (Alex Hormozi) — แก่นคอนเทนต์คือ Asset',
        sourceHow: 'One-Breath Delivery Cut (Colin and Samir) — Pacing กระชับไร้คำเยิ่นเย้อ'
      },
      {
        id: 'concept-c',
        badge: 'Concept C',
        accent: 'ink',
        angle: 'Founder Vulnerability & Truth',
        title: 'ความลับของการไม่เบิร์นเอาท์: ทำไมผมถึงเลิกแคร์อัลกอริทึม',
        hook: 'ถ้าความสำเร็จของคุณขึ้นอยู่กับว่าระบบจะใจดีส่งคนดูมาให้ไหม... คุณไม่ได้กำลังเป็นเจ้าของธุรกิจ แต่คุณกำลังเป็นพนักงานของแพลตฟอร์ม',
        beats: [
          {
            title: 'Beat 1: Quiet Truth Hook',
            timecode: '0:00 - 0:04',
            desc: 'เริ่มต้นด้วยน้ำเสียงนิ่ง สบตาคนดูตรงๆ ชวนให้คิดถึงอิสรภาพที่แท้จริงของการเป็นครีเอเตอร์'
          },
          {
            title: 'Beat 2: Personal Agitation',
            timecode: '0:05 - 0:32',
            desc: 'เล่าถึงวันที่ยอดวิวตกแต่คุณค่าในชีวิตไม่ได้ลดลงตามตัวเลขบนจอ'
          },
          {
            title: 'Beat 3: Sovereign Philosophy',
            timecode: '0:33 - 1:18',
            desc: 'อธิบายแนวคิดเรื่องความคงเส้นคงวา (Consistency) และความซื่อสัตย์ต่อแก่นเรื่อง'
          },
          {
            title: 'Beat 4: Empowering Takeaway',
            timecode: '1:19 - 1:45',
            desc: 'ทิ้งคำถามไว้ให้คนดูเลือก: คุณอยากเป็นที่รู้จักเพราะตัวเลข หรือเพราะคุณค่าที่คุณทิ้งไว้?'
          }
        ],
        claimVerification: 'ตรวจสอบแล้ว: ถ่ายทอดจากเจตนารมณ์แท้จริงของ Founder ปราศจากสถิติสมมติหรือข้อมูลที่ปรุงแต่ง',
        visualDirection: 'Cinematic documentary tone ช็อตมุมกว้างในสตูดิโอ ตัดโคลสอัพที่สายตาในประโยคสำคัญ',
        soundDirection: 'เสียง Ambient เบาๆ และเสียงลมหายใจที่เป็นธรรมชาติ ไม่มีการอัดเสียงแบบสังเคราะห์',
        sourceWhat: 'Post and forget it (Mew Teetawat) — แก่นการปล่อยวางเพื่อความยั่งยืน',
        sourceHow: 'The Ticking Clock (Ali Abdaal) — การควบคุมความเงียบและจังหวะหายใจ'
      }
    ];
  }

  /**
   * Triggers the simulated AI Concept Synthesis
   */
  triggerGeneration() {
    const stats = this.getBasketStats();
    if (!stats.isValid) {
      this.showToast('ต้องการวัตถุดิบ Content', 'กรุณาเลือก Content Vault อย่างน้อย 1 รายการเพื่อเป็นแก่นสาระในการสังเคราะห์', 'coral');
      this.openPickerModal();
      return;
    }

    this.isGenerating = true;
    this.renderConceptsColumn();

    // Progress animation steps
    const steps = [
      { text: 'สกัดแก่นคิดและ What to borrow จาก Content Vault...', progress: '35%' },
      { text: 'ปรับจังหวะและ How to borrow เข้ากับ Founder Direction...', progress: '70%' },
      { text: 'ตรวจสอบ Guardrails และ Claim Verification...', progress: '95%' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        if (this.dom.loadingStepText) this.dom.loadingStepText.textContent = steps[currentStep].text;
        if (this.dom.loadingProgressFill) this.dom.loadingProgressFill.style.width = steps[currentStep].progress;
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          this.completeGeneration();
        }, 350);
      }
    }, 400);
  }

  /**
   * Completes synthesis and creates dynamic original concepts based on inputs
   */
  completeGeneration() {
    this.isGenerating = false;

    // Gather active form values
    const targetAudience = this.dom.inputTargetAudience ? this.dom.inputTargetAudience.value.trim() : '';
    const ourPov = this.dom.inputOurPov ? this.dom.inputOurPov.value.trim() : '';
    const brandTruth = this.dom.inputBrandTruth ? this.dom.inputBrandTruth.value.trim() : '';

    // Pick content sources
    const contentSources = this.basket.filter(i => i.vaultType === 'content');
    const packagingSources = this.basket.filter(i => i.vaultType === 'packaging');

    const primaryContent = contentSources[0] || DEFAULT_REMIX_REFERENCES[0];
    const secondaryContent = contentSources[1] || primaryContent;
    const primaryPackaging = packagingSources[0] || DEFAULT_REMIX_REFERENCES[1];
    const secondaryPackaging = packagingSources[1] || primaryPackaging;

    this.concepts = [
      {
        id: `concept-synth-a-${Date.now()}`,
        badge: 'Concept A',
        accent: 'coral',
        angle: 'Direct Contrarian Angle',
        title: `ทำไม ${this.truncate(primaryContent.title, 32)} ถึงเป็นกับดักที่คนมองข้าม`,
        hook: `ถ้าคุณเป็นคนหนึ่งที่ ${this.truncate(targetAudience, 45)}... หยุดทำสิ่งนี้ก่อนที่ทุกอย่างจะสายเกินไป`,
        beats: [
          {
            title: 'Beat 1: Pattern Interrupt',
            timecode: '0:00 - 0:04',
            desc: `ยืมเทคนิคการเปิดคลิปแบบ ${primaryPackaging.title}: นำเสนอประเด็นขัดแย้งกับสัญชาตญาณทันที`
          },
          {
            title: 'Beat 2: Agitate Friction',
            timecode: '0:05 - 0:30',
            desc: `ขยี้ปัญหาที่คนดูติดหล่ม: ${this.truncate(ourPov, 60)}`
          },
          {
            title: 'Beat 3: Sovereign Truth',
            timecode: '0:31 - 1:15',
            desc: `นำเสนอทางออกตามหลักการ: ${this.truncate(brandTruth, 65)}`
          },
          {
            title: 'Beat 4: Call to Cadence',
            timecode: '1:16 - 1:40',
            desc: 'ท้าทายให้คนดูลงมือทำขั้นตอนแรกในวันนี้ โดยไม่ต้องรอความสมบูรณ์แบบ'
          }
        ],
        claimVerification: 'ตรวจสอบแล้ว: ข้อความทุกท่อนอิงจาก Brand Truth ที่ระบุ ปราศจากการสร้างสถิติลอยๆ หรือคำอวดอ้างเกินจริง',
        visualDirection: 'กล้องระดับสายตา ช็อตนิ่งแบบ Minimalist ถ่ายทอดความมั่นใจ ไร้แสงไฟสตูดิโอฉูดฉาด',
        soundDirection: 'เสียงเปิดด้วย Beat ตัดชัดเจน 3 วินาทีแรก ตามด้วยเสียงพูดระดับห้องทำงานส่วนตัว',
        sourceWhat: `${primaryContent.title} (${primaryContent.creator})`,
        sourceHow: `${primaryPackaging.title} (${primaryPackaging.creator})`
      },
      {
        id: `concept-synth-b-${Date.now()}`,
        badge: 'Concept B',
        accent: 'violet',
        angle: 'Actionable Blueprint',
        title: `ระบบสร้างคอนเทนต์ 3 สเต็ป: เปลี่ยนคลิปเซฟเป็นผลงานจริง`,
        hook: `เลิกเก็บคลิปไว้ดูทีหลัง... ถ้าคุณไม่เคยเปลี่ยนมันให้กลายเป็นไอเดียของตัวเอง`,
        beats: [
          {
            title: 'Beat 1: Provocative Question',
            timecode: '0:00 - 0:04',
            desc: 'ถามคำถามแทงใจดำเรื่องคลังคลิปที่เซฟไว้จนล้นเครื่องแต่ไม่ได้หยิบมาต่อยอด'
          },
          {
            title: 'Beat 2: Anatomy of Borrowing',
            timecode: '0:05 - 0:32',
            desc: `อธิบายการแยกแยะ Content (${primaryContent.title}) ออกจาก Packaging (${secondaryPackaging.title})`
          },
          {
            title: 'Beat 3: Framework in Action',
            timecode: '0:33 - 1:15',
            desc: `สาธิตกระบวนการปรับความคิดตามหลักการ: ${this.truncate(ourPov, 60)}`
          },
          {
            title: 'Beat 4: Immediate Action',
            timecode: '1:16 - 1:45',
            desc: 'มอบการบ้าน 1 ข้อให้คนดูทดลองสกัดคลิปแรกของพวกเขาในทันที'
          }
        ],
        claimVerification: 'ตรวจสอบแล้ว: ผ่านเกณฑ์ความโปร่งใส ไม่มีการใช้ตัวเลขสถิติสมมติหรืออ้างผลลัพธ์ที่เป็นไปไม่ได้',
        visualDirection: 'สลับภาพหน้าจอการทำงานจริงกับมุมพูดตรง เพื่อความเข้าใจในขั้นตอนที่เป็นรูปธรรม',
        soundDirection: 'Ambient Lo-fi เบาๆ พร้อมเสียงคลิกหรือเคาะตามจังหวะเปลี่ยนหน้าจอ',
        sourceWhat: `${secondaryContent.title} (${secondaryContent.creator})`,
        sourceHow: `${secondaryPackaging.title} (${secondaryPackaging.creator})`
      },
      {
        id: `concept-synth-c-${Date.now()}`,
        badge: 'Concept C',
        accent: 'ink',
        angle: 'Quiet Leadership & Truth',
        title: `ความจริงที่ไม่มีใครบอก: สิ่งที่ทำให้ครีเอเตอร์อยู่รอดไม่ใช่ไวรัล`,
        hook: `ไวรัลอาจทำให้คนเห็นคุณคืนนี้... แต่ความซื่อสัตย์ในสาระเท่านั้นที่จะทำให้เขาจำคุณไปอีก 5 ปี`,
        beats: [
          {
            title: 'Beat 1: Whispered Contrast',
            timecode: '0:00 - 0:04',
            desc: 'เริ่มด้วยประโยคเปรียบเทียบชวนคิด น้ำเสียงนิ่งลึกหยุดการเลื่อนฟีด'
          },
          {
            title: 'Beat 2: The Cost of Chasing',
            timecode: '0:05 - 0:35',
            desc: 'สะท้อนความเจ็บปวดของการไล่ตามกระแสจนสูญเสียเอกลักษณ์ของแบรนด์'
          },
          {
            title: 'Beat 3: Grounded Identity',
            timecode: '0:36 - 1:20',
            desc: `การสร้างฐานความเชื่อที่มั่นคง: ${this.truncate(brandTruth, 65)}`
          },
          {
            title: 'Beat 4: Founder Resolution',
            timecode: '1:21 - 1:50',
            desc: 'สรุปบทเรียนและชวนให้ผู้ฟังหันมาให้ความสำคัญกับสาระสำคัญของสิ่งที่พูด'
          }
        ],
        claimVerification: 'ตรวจสอบแล้ว: ข้อความอิงจากความเชื่อและปรัชญาการทำงานจริง ปราศจากข้อความโฆษณาชวนเชื่อ',
        visualDirection: 'Cinematic warm stone, ถ่ายทำมุมเฉียงเล็กน้อย ให้บรรยากาศที่เป็นกันเองและลึกซึ้ง',
        soundDirection: 'เสียงธรรมชาติในห้อง ไร้เสียงสังเคราะห์ เน้นความชัดเจนของน้ำเสียง',
        sourceWhat: `${primaryContent.title} (${primaryContent.creator})`,
        sourceHow: `${primaryPackaging.title} (${primaryPackaging.creator})`
      }
    ];

    this.persistConcepts();
    this.renderConceptsColumn();
    this.showToast('สังเคราะห์แนวคิดสำเร็จ', 'สร้าง 3 Original Concepts พร้อม Story Beats และ Claim Verification เรียบร้อย', 'violet');

    // Scroll to Column 3 smoothly on mobile
    if (window.innerWidth < 1200 && this.dom.conceptsCardsStack) {
      this.dom.conceptsCardsStack.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /**
   * Adds an ingredient item to the basket
   */
  addIngredient(item) {
    const normalized = this.normalizeReference(item);
    // Prevent duplicate ID in basket
    if (!this.basket.some(b => b.id === normalized.id)) {
      this.basket.push(normalized);
      this.persistBasket();
      this.render();
    }
  }

  /**
   * Removes an ingredient item from the basket
   */
  removeIngredient(id) {
    this.basket = this.basket.filter(b => b.id !== id);
    this.persistBasket();
    this.render();
    this.showToast('นำวัตถุดิบออกแล้ว', 'ปรับปรุงตะกร้าเรียบร้อย', 'violet');
  }

  /**
   * Persists current basket to localStorage
   */
  persistBasket() {
    try {
      localStorage.setItem('mew_remix_basket', JSON.stringify(this.basket));
    } catch (e) {
      console.warn('[RemixStudioController] Error saving basket:', e);
    }
  }

  /**
   * Persists active concepts to localStorage
   */
  persistConcepts() {
    try {
      localStorage.setItem('mew_remix_active_concepts', JSON.stringify(this.concepts));
    } catch (e) {
      console.warn('[RemixStudioController] Error saving concepts:', e);
    }
  }

  // ============================================================================
  // MODAL CONTROLLERS
  // ============================================================================

  /**
   * Opens the Multi-Ingredient Picker Modal (S06)
   */
  openPickerModal() {
    if (!this.dom.pickerModal) return;
    this.selectedPickerIds = new Set(this.basket.map(b => b.id));
    this.dom.pickerModal.hidden = false;
    this.renderPickerItems();
    if (this.dom.inputPickerSearch) {
      this.dom.inputPickerSearch.value = '';
      this.dom.inputPickerSearch.focus();
    }
  }

  /**
   * Closes the Multi-Ingredient Picker Modal
   */
  closePickerModal() {
    if (this.dom.pickerModal) {
      this.dom.pickerModal.hidden = true;
    }
  }

  /**
   * Renders the list of selectable references in Picker Modal
   */
  renderPickerItems() {
    if (!this.dom.pickerItemsList) return;

    const searchTerm = this.dom.inputPickerSearch ? this.dom.inputPickerSearch.value.trim().toLowerCase() : '';
    const activeFilterBtn = this.root.querySelector('[data-picker-filter].active');
    const filterType = activeFilterBtn ? activeFilterBtn.getAttribute('data-picker-filter') : 'all';

    const filtered = this.allReferences.filter(ref => {
      // Type filter
      if (filterType !== 'all' && ref.vaultType !== filterType) return false;

      // Search query filter
      if (searchTerm) {
        const matchTitle = ref.title.toLowerCase().includes(searchTerm);
        const matchCreator = ref.creator.toLowerCase().includes(searchTerm);
        const matchWhy = (ref.founderWhy || '').toLowerCase().includes(searchTerm);
        const matchTags = (ref.tags || []).some(t => t.toLowerCase().includes(searchTerm));
        return matchTitle || matchCreator || matchWhy || matchTags;
      }
      return true;
    });

    if (filtered.length === 0) {
      this.dom.pickerItemsList.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--v6-muted);">
          ไม่พบรายการที่ตรงกับคำค้นหา
        </div>
      `;
      this.updatePickerSummary();
      return;
    }

    this.dom.pickerItemsList.innerHTML = filtered.map(item => {
      const isSelected = this.selectedPickerIds.has(item.id);
      const isContent = item.vaultType === 'content';

      return `
        <div class="picker-item-row ${isSelected ? 'selected' : ''}" data-id="${item.id}">
          <input 
            type="checkbox" 
            class="picker-checkbox" 
            id="picker-check-${item.id}" 
            ${isSelected ? 'checked' : ''}
            aria-label="เลือก ${this.escapeHtml(item.title)}"
          >
          <div class="picker-item-content">
            <div class="picker-item-title-row">
              <span class="picker-item-title">${this.escapeHtml(item.title)}</span>
              <span class="badge-pill ${isContent ? 'coral' : 'violet'}">
                ${isContent ? 'Content' : 'Packaging'}
              </span>
            </div>
            <div class="picker-item-creator">
              <span>${this.escapeHtml(item.creator)}</span> · <span>${this.escapeHtml(item.duration)}</span>
            </div>
            <div class="picker-item-borrow-snippet">
              <strong>${isContent ? 'What to borrow:' : 'How to borrow:'}</strong>
              ${this.escapeHtml(isContent ? item.whatToBorrow : item.howToBorrow)}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Wire clicks to toggle selection
    this.dom.pickerItemsList.querySelectorAll('.picker-item-row').forEach(row => {
      row.addEventListener('click', (e) => {
        const id = row.getAttribute('data-id');
        const checkbox = row.querySelector('.picker-checkbox');
        const willSelect = !this.selectedPickerIds.has(id);

        if (willSelect) {
          this.selectedPickerIds.add(id);
          row.classList.add('selected');
          if (checkbox) checkbox.checked = true;
        } else {
          this.selectedPickerIds.delete(id);
          row.classList.remove('selected');
          if (checkbox) checkbox.checked = false;
        }

        this.updatePickerSummary();
      });
    });

    this.updatePickerSummary();
  }

  /**
   * Updates the selected count summary in Picker modal footer
   */
  updatePickerSummary() {
    if (!this.dom.pickerSelectionSummary) return;

    let cCount = 0;
    let pCount = 0;

    this.selectedPickerIds.forEach(id => {
      const ref = this.allReferences.find(r => r.id === id);
      if (ref) {
        if (ref.vaultType === 'content') cCount++;
        else pCount++;
      }
    });

    const total = this.selectedPickerIds.size;
    this.dom.pickerSelectionSummary.textContent = `เลือกแล้ว ${total} รายการ (Content: ${cCount} · Packaging: ${pCount})`;
  }

  /**
   * Confirms picker selection into the active basket
   */
  confirmPickerSelection() {
    const newBasket = [];
    this.selectedPickerIds.forEach(id => {
      const ref = this.allReferences.find(r => r.id === id);
      if (ref) {
        newBasket.push(this.normalizeReference(ref));
      }
    });

    this.basket = newBasket;
    this.persistBasket();
    this.render();
    this.closePickerModal();
    this.showToast('อัปเดตตะกร้าวัตถุดิบแล้ว', `บรรจุวัตถุดิบ ${this.basket.length} รายการเข้าสู่ Remix Studio`, 'violet');
  }

  /**
   * Opens Comparison Matrix Modal
   */
  openCompareModal() {
    if (!this.dom.compareModal || !this.dom.compareMatrixScroll) return;

    if (!this.concepts || this.concepts.length === 0) {
      this.showToast('ไม่มี Concept ให้เปรียบเทียบ', 'กรุณากดปุ่ม Generate Concepts ก่อน', 'coral');
      return;
    }

    this.dom.compareModal.hidden = false;
    this.renderCompareMatrix();
  }

  /**
   * Closes Comparison Matrix Modal
   */
  closeCompareModal() {
    if (this.dom.compareModal) {
      this.dom.compareModal.hidden = true;
    }
  }

  /**
   * Renders Comparison Matrix Table
   */
  renderCompareMatrix() {
    if (!this.dom.compareMatrixScroll) return;

    const html = `
      <table class="matrix-table" role="table">
        <thead>
          <tr>
            <th class="matrix-feature-col">Dimension</th>
            ${this.concepts.map(c => `
              <th class="concept-col-header">
                <div style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.25rem;">
                  <span class="badge-pill ${c.accent === 'coral' ? 'coral' : 'violet'}">${c.badge}</span>
                </div>
                <div style="font-size: 0.95rem; font-weight: 700;">${this.escapeHtml(c.title)}</div>
                <div style="font-size: 0.75rem; color: var(--v6-muted); font-weight: normal;">${this.escapeHtml(c.angle)}</div>
              </th>
            `).join('')}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="matrix-feature-col"><strong>Original Hook</strong></td>
            ${this.concepts.map(c => `
              <td style="font-style: italic; font-weight: 600; color: var(--v6-ink);">
                "${this.escapeHtml(c.hook)}"
              </td>
            `).join('')}
          </tr>
          <tr>
            <td class="matrix-feature-col"><strong>Story Beats Flow</strong></td>
            ${this.concepts.map(c => `
              <td>
                <ol style="margin: 0; padding-left: 1.15rem; font-size: 0.8rem; line-height: 1.45;">
                  ${c.beats.map(b => `
                    <li style="margin-bottom: 0.35rem;">
                      <strong>${this.escapeHtml(b.title)}</strong> (${this.escapeHtml(b.timecode)}):
                      <div style="color: var(--v6-muted);">${this.escapeHtml(b.desc)}</div>
                    </li>
                  `).join('')}
                </ol>
              </td>
            `).join('')}
          </tr>
          <tr>
            <td class="matrix-feature-col"><strong>Visual Pacing</strong></td>
            ${this.concepts.map(c => `
              <td style="font-size: 0.82rem; color: var(--v6-ink); line-height: 1.4;">
                ${this.escapeHtml(c.visualDirection)}
              </td>
            `).join('')}
          </tr>
          <tr>
            <td class="matrix-feature-col"><strong>Sound & Audio Cue</strong></td>
            ${this.concepts.map(c => `
              <td style="font-size: 0.82rem; color: var(--v6-ink); line-height: 1.4;">
                ${this.escapeHtml(c.soundDirection)}
              </td>
            `).join('')}
          </tr>
          <tr>
            <td class="matrix-feature-col"><strong>Borrowed From</strong></td>
            ${this.concepts.map(c => `
              <td style="font-size: 0.78rem;">
                <div><span style="color: var(--v6-coral); font-weight: 700;">WHAT:</span> ${this.escapeHtml(c.sourceWhat)}</div>
                <div style="margin-top: 0.25rem;"><span style="color: var(--v6-violet); font-weight: 700;">HOW:</span> ${this.escapeHtml(c.sourceHow)}</div>
              </td>
            `).join('')}
          </tr>
        </tbody>
      </table>
    `;

    this.dom.compareMatrixScroll.innerHTML = html;
  }

  /**
   * Opens Refine Angle Modal for a specific concept
   */
  openRefineModal(conceptId) {
    const concept = this.concepts.find(c => c.id === conceptId);
    if (!concept || !this.dom.refineModal) return;

    this.activeRefineTarget = conceptId;
    if (this.dom.refineConceptTargetBadge) {
      this.dom.refineConceptTargetBadge.textContent = `${concept.badge} — ${concept.title}`;
    }
    if (this.dom.inputRefineCustomPrompt) {
      this.dom.inputRefineCustomPrompt.value = '';
    }

    this.dom.refineModal.hidden = false;
  }

  /**
   * Closes Refine Angle Modal
   */
  closeRefineModal() {
    if (this.dom.refineModal) {
      this.dom.refineModal.hidden = true;
    }
  }

  /**
   * Applies the refined prompt to the concept
   */
  applyRefinement() {
    const concept = this.concepts.find(c => c.id === this.activeRefineTarget);
    if (!concept) return;

    const promptText = this.dom.inputRefineCustomPrompt ? this.dom.inputRefineCustomPrompt.value.trim() : '';
    if (!promptText) {
      this.showToast('กรุณาระบุคำแนะนำ', 'เลือกคำสั่งด่วนหรือพิมพ์ข้อความที่ต้องการปรับแก้', 'coral');
      return;
    }

    // Refine concept dynamically
    concept.hook = `${concept.hook} (ปรับให้ทรงพลัง: ${this.truncate(promptText, 35)})`;
    concept.claimVerification = `${concept.claimVerification} · ตรวจสอบซ้ำตามคำสั่งปรับปรุง: "${this.truncate(promptText, 30)}"`;

    this.persistConcepts();
    this.renderConceptsColumn();
    this.closeRefineModal();
    this.showToast('ปรับแต่งสำเร็จ', `ปรับแต่ง ${concept.badge} เรียบร้อยแล้ว`, 'violet');
  }

  /**
   * Saves a concept as Draft in localStorage (mew_remix_drafts)
   */
  saveConceptAsDraft(conceptId) {
    const concept = this.concepts.find(c => c.id === conceptId);
    if (!concept) return;

    try {
      const drafts = JSON.parse(localStorage.getItem('mew_remix_drafts') || '[]');
      const draftRecord = {
        ...concept,
        savedAt: new Date().toISOString(),
        directionPreset: this.activePreset
      };
      drafts.unshift(draftRecord);
      localStorage.setItem('mew_remix_drafts', JSON.stringify(drafts));

      this.showToast('Saved as Draft', `บันทึกแนวคิด "${concept.title}" เข้าสู่ Drafts เรียบร้อย`, 'violet');
    } catch (e) {
      console.warn('[RemixStudioController] Error saving draft:', e);
      this.showToast('บันทึกสำเร็จ', `บันทึก "${concept.title}" เรียบร้อย`, 'violet');
    }
  }

  /**
   * Prepares and sends concept to Content Board (S08)
   */
  sendConceptToBoard(conceptId) {
    const concept = this.concepts.find(c => c.id === conceptId);
    if (!concept) return;

    try {
      const targetAudience = this.dom.inputTargetAudience ? this.dom.inputTargetAudience.value.trim() : 'ผู้ติดตามและกลุ่มเป้าหมายของแบรนด์';
      const ourPov = this.dom.inputOurPov ? this.dom.inputOurPov.value.trim() : 'สร้างสรรค์จากแก่นคิดจริงโดยไม่พึ่งพาสถิติสมมติ';
      const teleprompterLines = (concept.beats || []).map((b, i) => `[SCENE ${i + 1} - ${b.timecode || '0:00'}]\n${i === 0 ? concept.hook : b.desc}`).join('\n\n');

      const boardItems = JSON.parse(localStorage.getItem('mew_content_board_items') || '[]');
      const boardItem = {
        id: `board-${Date.now()}`,
        conceptId: concept.id,
        title: concept.title,
        angle: concept.angle || 'Original Synthesis',
        stage: 'draft', // Normalized Kanban stage ('draft' | 'review' | 'approved' | 'ready')
        isApproved: false,
        approvedRevision: null,
        targetAudience,
        creativeRationale: ourPov,
        hook: concept.hook,
        teleprompterScript: teleprompterLines || concept.hook,
        beats: concept.beats,
        sceneDirection: concept.visualDirection,
        soundDirection: concept.soundDirection,
        claimVerification: concept.claimVerification,
        cta: 'ลองนำแนวคิดนี้ไปปรับใช้กับระบบคอนเทนต์ของคุณในชิ้นถัดไป',
        sourceWhat: concept.sourceWhat,
        sourceHow: concept.sourceHow,
        estimatedRuntime: '~90 วินาที',
        wordCount: 165,
        createdAt: new Date().toISOString()
      };
      boardItems.unshift(boardItem);
      localStorage.setItem('mew_content_board_items', JSON.stringify(boardItems));

      // Dispatch real-time board sync events
      window.dispatchEvent(new CustomEvent('mew:board-item-added', { detail: boardItem }));
      window.dispatchEvent(new CustomEvent('mew:board-updated', { detail: boardItem }));

      this.showToast('ส่งเข้า Board สำเร็จ', `ส่ง "${concept.title}" เข้าสู่ Content Board (คอลัมน์ Draft) เรียบร้อย`, 'coral');

      // Bridge: Navigate directly to Content Board
      if (typeof window.switchView === 'function') {
        setTimeout(() => window.switchView('board'), 400);
      }
    } catch (e) {
      console.warn('[RemixStudioController] Error sending to board:', e);
    }
  }

  /**
   * Shows accessible toast feedback
   */
  showToast(title, desc, type = 'violet') {
    if (!this.dom.toastBox) return;

    if (this.dom.toastTitle) this.dom.toastTitle.textContent = title;
    if (this.dom.toastDesc) this.dom.toastDesc.textContent = desc;

    if (this.dom.toastIcon) {
      this.dom.toastIcon.className = `toast-icon-circle ${type === 'coral' ? 'coral' : 'violet'}`;
    }

    this.dom.toastBox.hidden = false;

    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.hideToast();
    }, 3800);
  }

  /**
   * Hides toast
   */
  hideToast() {
    if (this.dom.toastBox) {
      this.dom.toastBox.hidden = true;
    }
  }

  /**
   * Utility to truncate text
   */
  truncate(str, maxLen = 50) {
    if (!str) return '';
    return str.length > maxLen ? str.slice(0, maxLen) + '...' : str;
  }

  /**
   * Utility to escape HTML
   */
  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// Auto-initialize when loaded as module in a browser environment
if (typeof window !== 'undefined') {
  window.RemixStudioController = RemixStudioController;
  const initRemix = () => {
    if (document.getElementById('remix-root') && !window.remixController) {
      window.remixController = new RemixStudioController();
    }
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRemix);
  } else {
    initRemix();
  }
}
