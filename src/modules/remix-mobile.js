/**
 * ==============================================================================
 * MEW CONTENT OS — Mobile Stepper & Sticky Summary Controller (Topic T31)
 * Theme: mewteetawat.com V6.3 (Stone, Coral, Violet, Deep Ink)
 * 100% Pure Client-Side JavaScript (Vanilla ES6+)
 * Zero Server Dependencies · Zero Fake Metrics · Accessible WCAG UI
 * ==============================================================================
 */

export class RemixMobileController {
  /**
   * Initializes the Mobile Remix Controller
   * @param {Object} [options={}]
   * @param {HTMLElement|string} [options.rootId] Root container selector or element
   * @param {HTMLElement|string} [options.workspaceId] Workspace grid selector or element
   * @param {number} [options.initialStep=1] Starting step (1: Ingredients, 2: Direction, 3: Results)
   * @param {Array<Object>} [options.ingredients=[]] Mixed references basket
   * @param {Function} [options.onStepChange] Callback invoked when step changes
   */
  constructor(options = {}) {
    this.root = typeof options.rootId === 'string'
      ? (typeof document !== 'undefined' && document.querySelector ? document.querySelector(options.rootId) : null)
      : (options.rootId || (typeof document !== 'undefined' && document.getElementById ? document.getElementById('remix-mobile-root') : null));

    this.workspace = typeof options.workspaceId === 'string'
      ? (typeof document !== 'undefined' && document.querySelector ? document.querySelector(options.workspaceId) : null)
      : (options.workspaceId || (typeof document !== 'undefined' && document.getElementById ? document.getElementById('remix-workspace') : null));

    this.currentStep = options.initialStep && options.initialStep >= 1 && options.initialStep <= 3 
      ? options.initialStep 
      : 1;

    this.ingredients = Array.isArray(options.ingredients) ? options.ingredients : [];
    this.isSheetOpen = false;
    this.onStepChange = options.onStepChange || null;

    // Cache form values to guarantee zero data loss when going back and forth between steps
    this.formStateCache = {};

    this.initDOM();
  }

  /**
   * Bind event listeners and set initial DOM state
   * @returns {RemixMobileController}
   */
  initDOM() {
    if (typeof document === 'undefined') return this;

    // Resolve DOM elements if root was loaded dynamically
    if (!this.root && typeof document.getElementById === 'function') {
      this.root = document.getElementById('remix-mobile-root');
    }
    if (!this.workspace && typeof document.getElementById === 'function') {
      this.workspace = document.getElementById('remix-workspace');
    }

    // Bind Stepper Step Buttons
    if (typeof document.querySelector === 'function') {
      [1, 2, 3].forEach(step => {
        const stepBtn = document.querySelector(`[data-step="${step}"]`);
        if (stepBtn && typeof stepBtn.addEventListener === 'function') {
          stepBtn.addEventListener('click', (e) => {
            if (e && typeof e.preventDefault === 'function') e.preventDefault();
            this.setStep(step);
          });
        }
      });
    }

    // Bind Sequential Prev/Next Buttons
    if (typeof document.getElementById === 'function') {
      const prevBtn = document.getElementById('btn-mobile-prev-step');
      if (prevBtn && typeof prevBtn.addEventListener === 'function') {
        prevBtn.addEventListener('click', (e) => {
          if (e && typeof e.preventDefault === 'function') e.preventDefault();
          this.prevStep();
        });
      }

      const nextBtn = document.getElementById('btn-mobile-next-step');
      if (nextBtn && typeof nextBtn.addEventListener === 'function') {
        nextBtn.addEventListener('click', (e) => {
          if (e && typeof e.preventDefault === 'function') e.preventDefault();
          this.nextStep();
        });
      }

      // Bind Sticky Summary Click (Opens Bottom Sheet at ANY step)
      const summaryBar = document.getElementById('sticky-summary');
      if (summaryBar && typeof summaryBar.addEventListener === 'function') {
        summaryBar.addEventListener('click', () => {
          this.openSheet();
        });

        // Keyboard support: Enter or Space opens drawer
        summaryBar.addEventListener('keydown', (e) => {
          if (e && (e.key === 'Enter' || e.key === ' ')) {
            if (typeof e.preventDefault === 'function') e.preventDefault();
            this.openSheet();
          }
        });
      }

      const triggerBtn = document.getElementById('btn-open-mobile-sheet');
      if (triggerBtn && typeof triggerBtn.addEventListener === 'function') {
        triggerBtn.addEventListener('click', (e) => {
          if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
          this.openSheet();
        });
      }

      // Bind Bottom Sheet Close Actions
      const closeBtn = document.getElementById('btn-close-sheet');
      if (closeBtn && typeof closeBtn.addEventListener === 'function') {
        closeBtn.addEventListener('click', (e) => {
          if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
          this.closeSheet();
        });
      }

      const closeActionBtn = document.getElementById('btn-close-sheet-action');
      if (closeActionBtn && typeof closeActionBtn.addEventListener === 'function') {
        closeActionBtn.addEventListener('click', (e) => {
          if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
          this.closeSheet();
        });
      }

      const backdrop = document.getElementById('sheet-backdrop');
      if (backdrop && typeof backdrop.addEventListener === 'function') {
        backdrop.addEventListener('click', (e) => {
          if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
          this.closeSheet();
        });
      }
    }

    // Global keyboard listener: Escape closes sheet
    if (typeof document.addEventListener === 'function') {
      document.addEventListener('keydown', (e) => {
        if (e && e.key === 'Escape' && this.isSheetOpen) {
          this.closeSheet();
        }
      });
    }

    // Initialize UI with initial step and summary counts
    this.setStep(this.currentStep);
    this.updateSummary();

    return this;
  }

  /**
   * Captures active form values before switching steps to guarantee zero data loss
   */
  saveFormState() {
    if (typeof document === 'undefined' || typeof document.querySelector !== 'function') return;

    const formSelectors = ['#direction-form', '#ws-direction', '#remix-workspace'];
    formSelectors.forEach(selector => {
      const formEl = document.querySelector(selector);
      if (!formEl || typeof formEl.querySelectorAll !== 'function') return;

      const inputs = formEl.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        const key = input.id || input.name;
        if (!key) return;

        if (input.type === 'checkbox') {
          this.formStateCache[key] = input.checked;
        } else if (input.type === 'radio') {
          if (input.checked) {
            this.formStateCache[input.name] = input.value;
          }
        } else {
          this.formStateCache[key] = input.value;
        }
      });
    });

    // Also persist into global remixSession if present
    if (typeof globalThis !== 'undefined' && globalThis.remixSession && globalThis.remixSession.direction) {
      if (this.formStateCache['dir-audience'] !== undefined) {
        globalThis.remixSession.direction.audience = this.formStateCache['dir-audience'];
      }
      if (this.formStateCache['dir-our-pov'] !== undefined) {
        globalThis.remixSession.direction.ourPov = this.formStateCache['dir-our-pov'];
      }
      if (this.formStateCache['dir-goal'] !== undefined) {
        globalThis.remixSession.direction.goal = this.formStateCache['dir-goal'];
      }
      if (this.formStateCache['dir-tone'] !== undefined) {
        globalThis.remixSession.direction.tone = this.formStateCache['dir-tone'];
      }
      if (this.formStateCache['dir-cta'] !== undefined) {
        globalThis.remixSession.direction.cta = this.formStateCache['dir-cta'];
      }
    }
  }

  /**
   * Restores cached form values after returning to a step
   */
  restoreFormState() {
    if (typeof document === 'undefined') return;

    Object.entries(this.formStateCache).forEach(([key, val]) => {
      const el = (typeof document.getElementById === 'function' ? document.getElementById(key) : null)
        || (typeof document.querySelector === 'function' ? document.querySelector(`[name="${key}"]`) : null);
      if (!el) return;

      if (el.type === 'checkbox') {
        el.checked = Boolean(val);
      } else if (el.type === 'radio') {
        if (typeof document.querySelector === 'function') {
          const matchingRadio = document.querySelector(`input[name="${key}"][value="${val}"]`);
          if (matchingRadio) matchingRadio.checked = true;
        }
      } else {
        if (el.value !== val) {
          el.value = val;
          if (typeof el.dispatchEvent === 'function' && typeof Event !== 'undefined') {
            el.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
      }
    });
  }

  /**
   * Sets active mobile step (1: Ingredients, 2: Direction, 3: Results)
   * Preserves form values before & after switching
   * @param {number} step
   */
  setStep(step) {
    if (step < 1 || step > 3) return;

    // 1. Save all form inputs before switching
    this.saveFormState();

    this.currentStep = step;

    if (typeof document !== 'undefined') {
      // 2. Update Stepper Header Tabs
      if (typeof document.querySelector === 'function') {
        [1, 2, 3].forEach(s => {
          const btn = document.querySelector(`[data-step="${s}"]`);
          if (btn) {
            if (s === step) {
              if (btn.classList && typeof btn.classList.add === 'function') btn.classList.add('active');
              if (typeof btn.setAttribute === 'function') btn.setAttribute('aria-current', 'step');
            } else {
              if (btn.classList && typeof btn.classList.remove === 'function') btn.classList.remove('active');
              if (typeof btn.removeAttribute === 'function') btn.removeAttribute('aria-current');
            }
          }
        });
      }

      // 3. Update Workspace Grid data-mobile-step attribute (switches active column <= 768px via CSS)
      if (!this.workspace && typeof document.getElementById === 'function') {
        this.workspace = document.getElementById('remix-workspace');
      }
      if (this.workspace && typeof this.workspace.setAttribute === 'function') {
        this.workspace.setAttribute('data-mobile-step', String(step));
      }

      // Also set on root container for styling hooks
      if (!this.root && typeof document.getElementById === 'function') {
        this.root = document.getElementById('remix-mobile-root');
      }
      if (this.root && typeof this.root.setAttribute === 'function') {
        this.root.setAttribute('data-current-step', String(step));
      }

      // 4. Update Prev / Next Buttons & Step Indicator
      if (typeof document.getElementById === 'function') {
        const prevBtn = document.getElementById('btn-mobile-prev-step');
        const nextBtn = document.getElementById('btn-mobile-next-step');
        const prevLabel = document.getElementById('btn-mobile-prev-label');
        const nextLabel = document.getElementById('btn-mobile-next-label');
        const stepIndicator = document.getElementById('mobile-step-indicator');

        if (step === 1) {
          if (prevBtn && prevBtn.style) prevBtn.style.visibility = 'hidden';
          if (nextBtn && nextBtn.style) {
            nextBtn.style.visibility = 'visible';
            if (nextLabel) nextLabel.textContent = 'ถัดไป: กำหนดทิศทาง';
          }
          if (stepIndicator) stepIndicator.textContent = 'ขั้นที่ 1 จาก 3: วัตถุดิบ';
        } else if (step === 2) {
          if (prevBtn && prevBtn.style) {
            prevBtn.style.visibility = 'visible';
            if (prevLabel) prevLabel.textContent = 'วัตถุดิบ';
          }
          if (nextBtn && nextBtn.style) {
            nextBtn.style.visibility = 'visible';
            if (nextLabel) nextLabel.textContent = 'ถัดไป: ผลลัพธ์';
          }
          if (stepIndicator) stepIndicator.textContent = 'ขั้นที่ 2 จาก 3: ทิศทาง';
        } else if (step === 3) {
          if (prevBtn && prevBtn.style) {
            prevBtn.style.visibility = 'visible';
            if (prevLabel) prevLabel.textContent = 'ทิศทาง';
          }
          if (nextBtn && nextBtn.style) {
            nextBtn.style.visibility = 'hidden';
          }
          if (stepIndicator) stepIndicator.textContent = 'ขั้นที่ 3 จาก 3: ผลลัพธ์';
        }
      }

      // 5. Restore form values to guarantee zero data loss
      this.restoreFormState();
    }

    if (typeof this.onStepChange === 'function') {
      this.onStepChange(this.currentStep);
    }
  }

  /**
   * Advance to next step (if not on step 3)
   */
  nextStep() {
    if (this.currentStep < 3) {
      this.setStep(this.currentStep + 1);
    }
  }

  /**
   * Return to previous step (if not on step 1)
   */
  prevStep() {
    if (this.currentStep > 1) {
      this.setStep(this.currentStep - 1);
    }
  }

  /**
   * Updates sticky summary counts: Content (N) + Packaging (M)
   * @param {number} [contentCount] 
   * @param {number} [packagingCount] 
   */
  updateSummary(contentCount, packagingCount) {
    let c = contentCount;
    let p = packagingCount;

    // Calculate from ingredients array if counts not passed directly
    if (typeof c !== 'number' || typeof p !== 'number') {
      c = 0;
      p = 0;
      this.ingredients.forEach(item => {
        const lens = (item.vaultType || item.lens || '').toLowerCase();
        if (lens === 'content') c++;
        else if (lens === 'packaging') p++;
      });
    }

    if (typeof document === 'undefined' || typeof document.getElementById !== 'function') return;

    const summaryText = `Content (${c}) + Packaging (${p})`;

    const pillsEl = document.getElementById('mobile-summary-pills');
    if (pillsEl) {
      pillsEl.textContent = summaryText;
    }

    const sheetCountEl = document.getElementById('sheet-summary-count');
    if (sheetCountEl) {
      sheetCountEl.textContent = summaryText;
    }
  }

  /**
   * Sets ingredients list and updates summary and drawer content
   * @param {Array<Object>} ingredients 
   */
  setIngredients(ingredients = []) {
    this.ingredients = Array.isArray(ingredients) ? ingredients : [];
    this.updateSummary();
    if (this.isSheetOpen) {
      this.renderSheetIngredients(this.ingredients);
    }
  }

  /**
   * Toggles drawer bottom sheet
   * @param {boolean} [forceState] 
   */
  toggleSheet(forceState) {
    this.isSheetOpen = typeof forceState === 'boolean' ? forceState : !this.isSheetOpen;

    if (typeof document !== 'undefined' && typeof document.getElementById === 'function') {
      const sheet = document.getElementById('mobile-ingredients-sheet');
      if (sheet) {
        sheet.hidden = !this.isSheetOpen;
      }

      if (this.isSheetOpen) {
        this.renderSheetIngredients(this.ingredients);
      }
    }
  }

  /**
   * Opens the drawer sheet
   */
  openSheet() {
    this.toggleSheet(true);
  }

  /**
   * Closes the drawer sheet
   */
  closeSheet() {
    this.toggleSheet(false);
  }

  /**
   * Renders ingredient items inside bottom sheet (shows Title + Founder WHY)
   * Accessible at ANY step
   * @param {Array<Object>} [ingredients] 
   */
  renderSheetIngredients(ingredients = this.ingredients) {
    this.ingredients = Array.isArray(ingredients) ? ingredients : [];
    if (typeof document === 'undefined' || typeof document.getElementById !== 'function') return;

    const body = document.getElementById('mobile-sheet-body');
    if (!body) return;

    if (this.ingredients.length === 0) {
      body.innerHTML = '<p class="empty-hint">ยังไม่มีวัตถุดิบในตะกร้า</p>';
      return;
    }

    body.innerHTML = this.ingredients.map(ing => {
      const lens = (ing.vaultType || ing.lens || 'content').toLowerCase();
      const isContent = lens === 'content';
      const lensLabel = isContent ? 'CONTENT' : 'PACKAGING';
      const lensClass = isContent ? 'content-item' : 'packaging-item';
      const creator = ing.creator ? `@${ing.creator.replace(/^@/, '')}` : '';
      const title = ing.title || ing.name || 'ไม่มีชื่อบันทึก';
      const why = ing.founderWhy || ing.why || 'ไม่มีบันทึก WHY';
      const borrowTip = ing.borrowText || (isContent ? 'ยืมหลักคิด / แกนสาระ (WHAT)' : 'ยืมจังหวะ / วิธีเล่า (HOW)');

      return `
        <article class="sheet-ingredient-item ${lensClass}">
          <div class="sheet-item-header">
            <span class="sheet-lens-tag ${lens}">${lensLabel}</span>
            ${creator ? `<span class="sheet-creator">${creator}</span>` : ''}
          </div>
          <h5 class="sheet-item-title">${this.escapeHtml(title)}</h5>
          <p class="sheet-why"><strong>WHY:</strong> ${this.escapeHtml(why)}</p>
          <p class="sheet-borrow-tip"><em>นำไปใช้:</em> ${this.escapeHtml(borrowTip)}</p>
        </article>
      `;
    }).join('');
  }

  /**
   * Safe HTML string escaper
   * @param {string} str 
   * @returns {string}
   */
  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
