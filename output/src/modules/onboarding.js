/**
 * ==============================================================================
 * MEW CONTENT OS — Module: S-ONBOARD (Fullscreen Scanfeed Experience)
 * Reference: https://app.scanfeed.co/
 * Theme: mewteetawat.com V6.3
 * Features:
 *   - Fullscreen Viewport Navigation (Steps 0 to 8)
 *   - Business Profile Foundation & Account Access
 *   - Payment & Subscription Pass (Starter, Pro, Agency)
 *   - Scanfeed-style Dynamic Welcome & Setup Typewriter Transition
 *   - Inspiring Creator Motivation Screen (Frosted Glass & Dynamic Typewriter)
 *   - 1-Tap Auto-Advance for Role Selection
 *   - Interactive Niche Chips & Channel Spy Presets
 *   - Final Launch lands directly on Overview Dashboard
 * ==============================================================================
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'mew_scanfeed_profile';

  // Rotating phrases for the welcome headline keyword typewriter (Overview-matched)
  const TYPING_PHRASES = [
    'MEW Content OS',
    'Creator Brain V6.3',
    'ระบบวิจัยคลิปไวรัล',
    'สตูดิโอสร้างคอนเทนต์',
    'Creative Engine'
  ];

  // Rotating phrases for Business Profile guidance banner
  const BIZ_TYPING_PHRASES = [
    'บอกเล่าสินค้าหรือบริการหลักของคุณ',
    'ระบุกลุ่มลูกค้าเป้าหมายที่คุณอยากเข้าถึง',
    'ใส่จุดแข็งและปัญหาสำคัญที่แบรนด์ช่วยแก้ไข',
    'AI จะใช้ข้อมูลนี้สร้างสคริปต์ที่ขายได้จริง'
  ];

  // Inspiring Motivation Message for Creators & Founders (types once and finishes/stops)
  const INSPIRE_MESSAGE = 'คุณไม่ต้องเริ่มจากศูนย์อีกต่อไป ทุกคลิปไวรัลและไอเดียสคริปต์พร้อมให้คุณต่อยอดได้ทันที';
  const INSPIRE_QUOTES = [INSPIRE_MESSAGE];

  class ScanfeedOnboarding {
    constructor() {
      this.currentStep = 0;
      this.profile = {
        name: 'Creator',
        email: 'creator@brandfounder.co',
        businessDesc: 'แบรนด์สกินแคร์ออร์แกนิก สำหรับคนเป็นสิว ผิวแพ้ง่าย ปราศจากน้ำหอม เน้นสารสกัดธรรมชาติ ผลวิจัยรับรอง',
        targetAudience: 'คนวัยทำงานอายุ 22-38 ปี ที่ต้องการแก้ปัญหาสิวและผิวแพ้ง่ายอย่างปลอดภัย',
        brandUsp: 'สารสกัดธรรมชาติ 100% มีผลวิจัยรับรอง ปราศจากสารระคายเคือง 8 ชนิด',
        plan: 'pro',
        planLabel: 'Brand Founder Pro (฿990/ด.)',
        planPrice: 990,
        paid: true,
        role: 'founder',
        roleLabel: 'เจ้าของธุรกิจ (Brand Founder)',
        niches: ['tech', 'business'],
        nicheLabels: ['Tech & AI', 'ธุรกิจ & การเงิน'],
        channelHandle: '@mewteetawat',
        completedAt: null
      };

      // Typewriter state (Welcome Screen)
      this.typewriterActive = true;
      this.phraseIndex = 0;
      this.charIndex = 0;
      this.isDeleting = false;
      this.typeTimer = null;

      // Typewriter state (Business Profile Screen)
      this.bizTypewriterActive = false;
      this.bizPhraseIndex = 0;
      this.bizCharIndex = 0;
      this.bizIsDeleting = false;
      this.bizTypeTimer = null;

      // Transition animation state
      this.transTimer = null;

      // Inspiring Motivation Typewriter state
      this.inspireTypewriterActive = false;
      this.inspireQuoteIndex = 0;
      this.inspireCharIndex = 0;
      this.inspireIsDeleting = false;
      this.inspireTimer = null;

      this.init();
    }

    init() {
      this.cacheDom();
      this.bindEvents();
      this.loadSavedProfile();
      this.startTypewriter();

      // Check if first-time user
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        this.open();
      } else {
        this.applyProfileToOS();
      }
    }

    cacheDom() {
      this.modal = document.getElementById('onboarding-modal');
      this.screens = document.querySelectorAll('.ob-screen');
      this.typewriterEl = document.getElementById('ob-typewriter-text');

      // Step 0: Welcome
      this.userNameInput = document.getElementById('ob-user-name');
      this.btnStart = document.getElementById('ob-btn-start');

      // Step 1: Business Profile
      this.bizTypewriterEl = document.getElementById('ob-biz-typewriter-text');
      this.bizDescInput = document.getElementById('ob-biz-desc');
      this.bizAudienceInput = document.getElementById('ob-biz-audience');
      this.bizUspInput = document.getElementById('ob-biz-usp');
      this.userEmailInput = document.getElementById('ob-user-email');
      this.bizChips = document.querySelectorAll('.ob-biz-chip');
      this.btnNextBiz = document.getElementById('ob-next-biz');
      this.btnBackBiz = document.getElementById('ob-back-biz');

      // Step 2: Payment & Checkout
      this.planCards = document.querySelectorAll('.ob-plan-card');
      this.btnPayMethodCard = document.getElementById('btn-pay-method-card');
      this.btnPayMethodQr = document.getElementById('btn-pay-method-qr');
      this.payFormCard = document.getElementById('pay-form-card');
      this.payFormQr = document.getElementById('pay-form-qr');
      this.checkoutPlanTitle = document.getElementById('checkout-plan-title');
      this.checkoutPlanPrice = document.getElementById('checkout-plan-price');
      this.checkoutTotal = document.getElementById('checkout-total');
      this.btnPay = document.getElementById('ob-btn-pay');
      this.paySpinner = document.getElementById('pay-spinner');
      this.payBtnLabel = document.getElementById('pay-btn-label');
      this.btnBackPay = document.getElementById('ob-back-pay');

      // Step 3: Scanfeed Transition
      this.transTypedLine = document.getElementById('ob-trans-typed-line');
      this.transTypedSub = document.getElementById('ob-trans-typed-sub');
      this.tcheck1 = document.getElementById('tcheck-1');
      this.tcheck2 = document.getElementById('tcheck-2');
      this.tcheck3 = document.getElementById('tcheck-3');
      this.transProgressFill = document.getElementById('trans-progress-fill');
      this.btnTransNext = document.getElementById('ob-btn-trans-next');

      // Step 4: Inspiring Motivation Screen (1:1 Scanfeed Zen)
      this.inspireScreen = document.getElementById('ob-screen-inspire');
      this.inspireZenBox = document.getElementById('scanfeed-zen-box');
      this.inspireHeadlineEl = document.querySelector('.scanfeed-zen-headline');
      this.inspireUserName = document.getElementById('ob-inspire-user-name');
      this.inspireTypewriterEl = document.getElementById('ob-inspire-typewriter-text');
      this.inspireCloseBtn = document.getElementById('ob-inspire-close');
      this.inspireHint = document.getElementById('ob-inspire-hint');
      this.inspireSpacebarPopup = document.getElementById('ob-inspire-spacebar-popup');
      this.btnInspireNext = document.getElementById('ob-btn-inspire-next');
      this.btnBackInspire = document.getElementById('ob-back-inspire');

      // Step 5: Role Selection
      this.roleCards = document.querySelectorAll('.ob-role-card');
      this.btnNext1 = document.getElementById('ob-next-1');
      this.btnBack1 = document.getElementById('ob-back-1');

      // Step 6: Content Niches
      this.nicheChips = document.querySelectorAll('.ob-chip');
      this.nicheCounter = document.getElementById('ob-niche-counter');
      this.btnNext2 = document.getElementById('ob-next-2');
      this.btnBack2 = document.getElementById('ob-back-2');

      // Step 7: Channel Spy
      this.channelInput = document.getElementById('ob-channel-input');
      this.presetCards = document.querySelectorAll('.ob-preset-card');
      this.btnNext3 = document.getElementById('ob-next-3');
      this.btnBack3 = document.getElementById('ob-back-3');

      // Step 8: Launch Summary
      this.sumName = document.getElementById('sum-name');
      this.sumEmail = document.getElementById('sum-email');
      this.sumPlan = document.getElementById('sum-plan');
      this.sumBusiness = document.getElementById('sum-business');
      this.sumRole = document.getElementById('sum-role');
      this.sumNiches = document.getElementById('sum-niches');
      this.sumChannel = document.getElementById('sum-channel');
      this.btnLaunch = document.getElementById('ob-btn-launch');
    }

    bindEvents() {
      // Step 0: Welcome -> Go to Business Profile (Step 1)
      if (this.btnStart) {
        this.btnStart.addEventListener('click', () => {
          if (this.userNameInput && this.userNameInput.value.trim()) {
            this.profile.name = this.userNameInput.value.trim();
          }
          this.goToStep(1);
        });
      }

      // Step 1: Business Profile Preset Chips
      this.bizChips.forEach(chip => {
        chip.addEventListener('click', () => {
          this.bizChips.forEach(c => c.classList.remove('selected', 'active'));
          chip.classList.add('selected', 'active');

          const desc = chip.getAttribute('data-desc');
          const aud = chip.getAttribute('data-aud');
          const usp = chip.getAttribute('data-usp');

          if (desc && this.bizDescInput) {
            this.bizDescInput.value = desc;
            this.profile.businessDesc = desc;
          }
          if (aud && this.bizAudienceInput) {
            this.bizAudienceInput.value = aud;
            this.profile.targetAudience = aud;
          }
          if (usp && this.bizUspInput) {
            this.bizUspInput.value = usp;
            this.profile.brandUsp = usp;
          }
        });
      });

      // Step 1 Live Sync
      if (this.bizDescInput) {
        this.bizDescInput.addEventListener('input', (e) => {
          this.profile.businessDesc = e.target.value.trim();
        });
      }
      if (this.bizAudienceInput) {
        this.bizAudienceInput.addEventListener('input', (e) => {
          this.profile.targetAudience = e.target.value.trim();
        });
      }
      if (this.bizUspInput) {
        this.bizUspInput.addEventListener('input', (e) => {
          this.profile.brandUsp = e.target.value.trim();
        });
      }
      if (this.userEmailInput) {
        this.userEmailInput.addEventListener('input', (e) => {
          this.profile.email = e.target.value.trim();
        });
      }

      // Step 1 Navigation
      if (this.btnBackBiz) this.btnBackBiz.addEventListener('click', () => this.goToStep(0));
      if (this.btnNextBiz) {
        this.btnNextBiz.addEventListener('click', () => {
          if (this.bizDescInput && this.bizDescInput.value.trim()) {
            this.profile.businessDesc = this.bizDescInput.value.trim();
          }
          if (this.bizAudienceInput && this.bizAudienceInput.value.trim()) {
            this.profile.targetAudience = this.bizAudienceInput.value.trim();
          }
          if (this.bizUspInput && this.bizUspInput.value.trim()) {
            this.profile.brandUsp = this.bizUspInput.value.trim();
          }
          if (this.userEmailInput && this.userEmailInput.value.trim()) {
            this.profile.email = this.userEmailInput.value.trim();
          }
          this.goToStep(2); // Go to Payment Step
        });
      }

      // Step 2: Payment Plan Selection
      this.planCards.forEach(card => {
        card.addEventListener('click', () => {
          this.planCards.forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');

          const planKey = card.getAttribute('data-plan');
          const price = parseInt(card.getAttribute('data-price') || '990', 10);
          const nameEl = card.querySelector('.plan-name');
          const planName = nameEl ? nameEl.textContent.trim() : 'Brand Founder Pro';

          this.profile.plan = planKey;
          this.profile.planPrice = price;
          this.profile.planLabel = `${planName} (฿${price}/ด.)`;

          if (this.checkoutPlanTitle) this.checkoutPlanTitle.textContent = `${planName} (รายเดือน)`;
          if (this.checkoutPlanPrice) this.checkoutPlanPrice.textContent = `฿${price.toFixed(2)}`;
          if (this.checkoutTotal) this.checkoutTotal.textContent = `฿${price}`;
          if (this.payBtnLabel) this.payBtnLabel.textContent = `ชำระเงิน ฿${price} และเปิดใช้งาน Brand Brain`;
        });
      });

      // Step 2: Payment Methods toggle
      if (this.btnPayMethodCard && this.btnPayMethodQr) {
        this.btnPayMethodCard.addEventListener('click', () => {
          this.btnPayMethodCard.classList.add('active');
          this.btnPayMethodQr.classList.remove('active');
          if (this.payFormCard) this.payFormCard.style.display = 'block';
          if (this.payFormQr) this.payFormQr.style.display = 'none';
        });

        this.btnPayMethodQr.addEventListener('click', () => {
          this.btnPayMethodQr.classList.add('active');
          this.btnPayMethodCard.classList.remove('active');
          if (this.payFormCard) this.payFormCard.style.display = 'none';
          if (this.payFormQr) this.payFormQr.style.display = 'block';
        });
      }

      // Step 2: Pay Button
      if (this.btnPay) {
        this.btnPay.addEventListener('click', () => {
          if (this.paySpinner) this.paySpinner.style.display = 'inline-block';
          if (this.payBtnLabel) this.payBtnLabel.textContent = 'กำลังยืนยันการชำระเงิน...';
          this.btnPay.disabled = true;

          setTimeout(() => {
            this.profile.paid = true;
            if (this.paySpinner) this.paySpinner.style.display = 'none';
            if (this.payBtnLabel) this.payBtnLabel.textContent = `ชำระเงินสำเร็จ ฿${this.profile.planPrice}`;
            this.btnPay.disabled = false;
            this.goToStep(3); // Go to Scanfeed Transition Step
          }, 450);
        });
      }

      if (this.btnBackPay) this.btnBackPay.addEventListener('click', () => this.goToStep(1));

      // Step 3: Scanfeed Transition Next Button -> Go to Inspiring Screen (Step 4)
      if (this.btnTransNext) {
        this.btnTransNext.addEventListener('click', () => {
          this.goToStep(4);
        });
      }

      // Step 4: Inspiring Motivation Screen
      if (this.btnInspireNext) {
        this.btnInspireNext.addEventListener('click', () => {
          this.goToStep(5); // Advance to Roles
        });
      }
      if (this.btnBackInspire) {
        this.btnBackInspire.addEventListener('click', () => {
          this.goToStep(3);
        });
      }
      if (this.inspireCloseBtn) {
        this.inspireCloseBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.goToStep(5);
        });
      }
      // Click anywhere on Step 4 screen/container to advance
      if (this.inspireZenBox) {
        this.inspireZenBox.addEventListener('click', () => {
          if (this.currentStep === 4) {
            this.goToStep(5);
          }
        });
      } else if (this.inspireScreen) {
        this.inspireScreen.addEventListener('click', () => {
          if (this.currentStep === 4) {
            this.goToStep(5);
          }
        });
      }

      // Spacebar or Enter anywhere to advance from Step 4
      document.addEventListener('keydown', (e) => {
        if (this.currentStep === 4) {
          if (e.code === 'Space' || e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            this.goToStep(5);
          }
        }
      });

      // Step 5: Roles (Auto-advance to Step 6)
      this.roleCards.forEach(card => {
        card.addEventListener('click', () => {
          this.roleCards.forEach(c => {
            c.classList.remove('selected');
            c.setAttribute('aria-checked', 'false');
          });
          card.classList.add('selected');
          card.setAttribute('aria-checked', 'true');

          const roleKey = card.dataset.role;
          const roleTitle = card.querySelector('.role-title')?.textContent.trim() || roleKey;
          this.profile.role = roleKey;
          this.profile.roleLabel = roleTitle;

          if (this.btnNext1) this.btnNext1.disabled = false;

          // 1-Tap Auto-Advance
          setTimeout(() => {
            if (this.currentStep === 5) {
              this.goToStep(6);
            }
          }, 320);
        });
      });

      if (this.btnBack1) this.btnBack1.addEventListener('click', () => this.goToStep(4));
      if (this.btnNext1) this.btnNext1.addEventListener('click', () => this.goToStep(6));

      // Step 6: Niches
      this.nicheChips.forEach(chip => {
        chip.addEventListener('click', () => {
          const niche = chip.dataset.niche;
          const isSelected = chip.classList.contains('selected');

          if (isSelected) {
            chip.classList.remove('selected');
            chip.setAttribute('aria-pressed', 'false');
            this.profile.niches = this.profile.niches.filter(n => n !== niche);
            this.profile.nicheLabels = this.profile.nicheLabels.filter(label => label !== chip.querySelector('.chip-name')?.textContent.trim());
          } else {
            if (this.profile.niches.length >= 3) {
              const firstNiche = this.profile.niches.shift();
              this.profile.nicheLabels.shift();
              const firstChip = document.querySelector(`.ob-chip[data-niche="${firstNiche}"]`);
              if (firstChip) {
                firstChip.classList.remove('selected');
                firstChip.setAttribute('aria-pressed', 'false');
              }
            }
            chip.classList.add('selected');
            chip.setAttribute('aria-pressed', 'true');
            this.profile.niches.push(niche);
            const label = chip.querySelector('.chip-name')?.textContent.trim() || niche;
            this.profile.nicheLabels.push(label);
          }

          this.updateNicheCounter();
        });
      });

      if (this.btnBack2) this.btnBack2.addEventListener('click', () => this.goToStep(5));
      if (this.btnNext2) this.btnNext2.addEventListener('click', () => this.goToStep(7));

      // Step 7: Channel Spy
      if (this.channelInput) {
        this.channelInput.addEventListener('input', (e) => {
          let val = e.target.value.trim();
          if (val && !val.startsWith('@')) {
            val = '@' + val;
          }
          this.profile.channelHandle = val || '@mewteetawat';
        });
      }

      this.presetCards.forEach(card => {
        card.addEventListener('click', () => {
          this.presetCards.forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          const handle = card.dataset.handle;
          this.profile.channelHandle = handle;
          if (this.channelInput) {
            this.channelInput.value = handle.replace(/^@/, '');
          }
        });
      });

      if (this.btnBack3) this.btnBack3.addEventListener('click', () => this.goToStep(6));
      if (this.btnNext3) this.btnNext3.addEventListener('click', () => this.goToStep(8));

      // Step 8: Launch -> Land on Overview
      if (this.btnLaunch) {
        this.btnLaunch.addEventListener('click', () => {
          this.saveProfile(false);
          this.close();
          this.showWelcomeToast();
          if (typeof window.switchView === 'function') {
            window.switchView('overview');
          }
        });
      }
    }

    // ==========================================================================
    // TYPEWRITER ENGINES
    // ==========================================================================
    startTypewriter() {
      if (!this.typewriterEl) return;
      this.typewriterActive = true;
      this.charIndex = 0;
      this.isDeleting = false;
      this.typewriterEl.textContent = '';
      if (this.typeTimer) clearTimeout(this.typeTimer);
      this.typeTimer = setTimeout(() => this.tickTypewriter(), 200);
    }

    stopTypewriter() {
      this.typewriterActive = false;
      if (this.typeTimer) {
        clearTimeout(this.typeTimer);
        this.typeTimer = null;
      }
    }

    tickTypewriter() {
      if (!this.typewriterActive || !this.typewriterEl) return;
      const currentPhrase = TYPING_PHRASES[this.phraseIndex % TYPING_PHRASES.length];

      if (!this.isDeleting) {
        this.charIndex++;
        this.typewriterEl.textContent = currentPhrase.substring(0, this.charIndex);

        if (this.charIndex >= currentPhrase.length) {
          this.isDeleting = true;
          this.typeTimer = setTimeout(() => this.tickTypewriter(), 2200);
          return;
        }

        const speed = 40 + Math.random() * 30;
        this.typeTimer = setTimeout(() => this.tickTypewriter(), speed);
      } else {
        this.charIndex--;
        this.typewriterEl.textContent = currentPhrase.substring(0, this.charIndex);

        if (this.charIndex <= 0) {
          this.isDeleting = false;
          this.phraseIndex++;
          this.typeTimer = setTimeout(() => this.tickTypewriter(), 400);
          return;
        }

        this.typeTimer = setTimeout(() => this.tickTypewriter(), 22);
      }
    }

    startBizTypewriter() {
      if (!this.bizTypewriterEl) return;
      this.bizTypewriterActive = true;
      this.bizCharIndex = 0;
      this.bizIsDeleting = false;
      this.bizTypewriterEl.textContent = '';
      if (this.bizTypeTimer) clearTimeout(this.bizTypeTimer);
      this.bizTypeTimer = setTimeout(() => this.tickBizTypewriter(), 200);
    }

    stopBizTypewriter() {
      this.bizTypewriterActive = false;
      if (this.bizTypeTimer) {
        clearTimeout(this.bizTypeTimer);
        this.bizTypeTimer = null;
      }
    }

    tickBizTypewriter() {
      if (!this.bizTypewriterActive || !this.bizTypewriterEl) return;
      const currentPhrase = BIZ_TYPING_PHRASES[this.bizPhraseIndex % BIZ_TYPING_PHRASES.length];

      if (!this.bizIsDeleting) {
        this.bizCharIndex++;
        this.bizTypewriterEl.textContent = currentPhrase.substring(0, this.bizCharIndex);

        if (this.bizCharIndex >= currentPhrase.length) {
          this.bizIsDeleting = true;
          this.bizTypeTimer = setTimeout(() => this.tickBizTypewriter(), 2400);
          return;
        }

        const speed = 40 + Math.random() * 25;
        this.bizTypeTimer = setTimeout(() => this.tickBizTypewriter(), speed);
      } else {
        this.bizCharIndex--;
        this.bizTypewriterEl.textContent = currentPhrase.substring(0, this.bizCharIndex);

        if (this.bizCharIndex <= 0) {
          this.bizIsDeleting = false;
          this.bizPhraseIndex++;
          this.bizTypeTimer = setTimeout(() => this.tickBizTypewriter(), 450);
          return;
        }

        this.bizTypeTimer = setTimeout(() => this.tickBizTypewriter(), 20);
      }
    }

    // Scanfeed Transition Sequential Typewriter Animation
    startTransTypewriter() {
      if (this.transTimer) clearTimeout(this.transTimer);

      const userName = this.profile.name || 'Creator';
      const line1 = `ชำระเงินสำเร็จเรียบร้อย ยินดีต้อนรับครับ คุณ ${userName}! 🎉`;
      const subline = 'ระบบกำลังเชื่อมโยงฐานข้อมูลธุรกิจของคุณเข้ากับ AI Content Engine...';

      if (this.transTypedLine) this.transTypedLine.textContent = '';
      if (this.transTypedSub) this.transTypedSub.textContent = '';
      if (this.transProgressFill) this.transProgressFill.style.width = '20%';

      if (this.tcheck1) this.tcheck1.className = 'trans-check-item done';
      if (this.tcheck2) this.tcheck2.className = 'trans-check-item';
      if (this.tcheck3) this.tcheck3.className = 'trans-check-item';

      let i = 0;
      const typeMainLine = () => {
        if (!this.transTypedLine) return;
        if (i < line1.length) {
          this.transTypedLine.textContent = line1.substring(0, i + 1);
          i++;
          this.transTimer = setTimeout(typeMainLine, 35);
        } else {
          if (this.transProgressFill) this.transProgressFill.style.width = '65%';
          if (this.tcheck2) {
            this.tcheck2.className = 'trans-check-item done';
            const badge = this.tcheck2.querySelector('.check-badge');
            if (badge) badge.textContent = '✓';
          }

          let j = 0;
          const typeSubLine = () => {
            if (!this.transTypedSub) return;
            if (j < subline.length) {
              this.transTypedSub.textContent = subline.substring(0, j + 1);
              j++;
              this.transTimer = setTimeout(typeSubLine, 25);
            } else {
              if (this.transProgressFill) this.transProgressFill.style.width = '100%';
              if (this.tcheck3) {
                this.tcheck3.className = 'trans-check-item done';
                const badge = this.tcheck3.querySelector('.check-badge');
                if (badge) badge.textContent = '✓';
              }
            }
          };
          this.transTimer = setTimeout(typeSubLine, 300);
        }
      };

      this.transTimer = setTimeout(typeMainLine, 150);
    }

    stopTransTypewriter() {
      if (this.transTimer) {
        clearTimeout(this.transTimer);
        this.transTimer = null;
      }
    }

    // Inspiring Motivation Typewriter (1:1 Scanfeed 4-messages sequence: types, pauses, erases -> stops on 4th + popup)
    startInspireTypewriter() {
      if (!this.inspireTypewriterEl) return;
      this.inspireTypewriterActive = true;
      this.inspireQuoteIndex = 0;
      this.inspireCharIndex = 0;
      this.inspireIsDeleting = false;
      this.inspireTypewriterEl.textContent = '';
      if (this.inspireHeadlineEl) {
        this.inspireHeadlineEl.classList.remove('zen-fade-out');
      }
      if (this.inspireSpacebarPopup) {
        this.inspireSpacebarPopup.classList.remove('popup-visible');
      }
      if (this.inspireTimer) clearTimeout(this.inspireTimer);
      this.inspireTimer = setTimeout(() => this.tickInspireTypewriter(), 220);
    }

    stopInspireTypewriter() {
      this.inspireTypewriterActive = false;
      if (this.inspireTimer) {
        clearTimeout(this.inspireTimer);
        this.inspireTimer = null;
      }
      if (this.inspireHeadlineEl) {
        this.inspireHeadlineEl.classList.remove('zen-fade-out');
      }
      if (this.inspireSpacebarPopup) {
        this.inspireSpacebarPopup.classList.remove('popup-visible');
      }
    }

    tickInspireTypewriter() {
      if (!this.inspireTypewriterActive || !this.inspireTypewriterEl) return;

      const userName = (this.profile && this.profile.name) ? this.profile.name : 'Creator';
      const messages = [
        `ยินดีต้อนรับกลับมาครับ คุณ${userName}`,
        'การทำคอนเทนต์ที่ดี ไม่ใช่การเดา แต่คือการถอดรหัสสิ่งที่เวิร์ก',
        'AI เตรียมโครงสร้างคลิปไวรัลกว่า 400+ รายการ พร้อมให้คุณต่อยอดแล้ว',
        'คุณไม่ต้องเริ่มจากศูนย์อีกต่อไป มาเปลี่ยนยอดวิวให้เป็นยอดขายจริงไปด้วยกัน'
      ];

      const currentMessage = messages[this.inspireQuoteIndex % messages.length];

      if (!this.inspireIsDeleting) {
        this.inspireCharIndex++;
        this.inspireTypewriterEl.textContent = currentMessage.substring(0, this.inspireCharIndex);

        if (this.inspireCharIndex >= currentMessage.length) {
          // Check if this is the 4th message (index 3)
          if (this.inspireQuoteIndex >= messages.length - 1) {
            // Finished all 4 messages! Wait briefly then advance to the next screen automatically
            this.inspireTypewriterActive = false;
            if (this.inspireTimer) {
              clearTimeout(this.inspireTimer);
              this.inspireTimer = null;
            }
            if (this.inspireSpacebarPopup) {
              this.inspireSpacebarPopup.classList.add('popup-visible');
            }
            this.inspireTimer = setTimeout(() => {
              if (this.currentStep === 4) {
                this.goToStep(5);
              }
            }, 2100);
            return;
          }

          // Message 1: Smooth fade-out transition
          if (this.inspireQuoteIndex === 0) {
            this.inspireTimer = setTimeout(() => {
              if (!this.inspireTypewriterActive) return;
              if (this.inspireHeadlineEl) {
                this.inspireHeadlineEl.classList.add('zen-fade-out');
              }
              this.inspireTimer = setTimeout(() => {
                if (!this.inspireTypewriterActive) return;
                this.inspireTypewriterEl.textContent = '';
                if (this.inspireHeadlineEl) {
                  this.inspireHeadlineEl.classList.remove('zen-fade-out');
                }
                this.inspireQuoteIndex++;
                this.inspireCharIndex = 0;
                this.inspireIsDeleting = false;
                this.inspireTimer = setTimeout(() => this.tickInspireTypewriter(), 320);
              }, 280);
            }, 1600);
            return;
          }

          // Messages 2 & 3: Pause then erase back letter by letter
          const pauseTime = 1800;
          this.inspireIsDeleting = true;
          this.inspireTimer = setTimeout(() => this.tickInspireTypewriter(), pauseTime);
          return;
        }

        const speed = 34 + Math.random() * 16;
        this.inspireTimer = setTimeout(() => this.tickInspireTypewriter(), speed);
      } else {
        // Deleting characters back
        this.inspireCharIndex--;
        this.inspireTypewriterEl.textContent = currentMessage.substring(0, this.inspireCharIndex);

        if (this.inspireCharIndex <= 0) {
          this.inspireIsDeleting = false;
          this.inspireQuoteIndex++;
          this.inspireTimer = setTimeout(() => this.tickInspireTypewriter(), 320);
          return;
        }

        const deleteSpeed = 15;
        this.inspireTimer = setTimeout(() => this.tickInspireTypewriter(), deleteSpeed);
      }
    }

    // ==========================================================================
    // SCREEN NAVIGATION & PROGRESS
    // ==========================================================================
    goToStep(stepIndex) {
      if (stepIndex < 0 || stepIndex >= this.screens.length) return;

      this.currentStep = stepIndex;

      // Toggle Scanfeed Zen mode (Fullscreen 100vh canvas without top nav)
      if (this.modal) {
        if (stepIndex === 4) {
          this.modal.classList.add('ob-mode-zen');
          this.modal.scrollTop = 0;
          if (typeof window !== 'undefined') window.scrollTo(0, 0);
          if (document.documentElement) document.documentElement.scrollTop = 0;
          if (document.body) document.body.scrollTop = 0;
        } else {
          this.modal.classList.remove('ob-mode-zen');
        }
      }

      // Update screen active states
      this.screens.forEach((screen, idx) => {
        if (idx === stepIndex) {
          screen.classList.add('ob-screen-active');
        } else {
          screen.classList.remove('ob-screen-active');
        }
      });

      // Control typewriter animations per screen
      if (stepIndex === 0) {
        this.startTypewriter();
        this.stopBizTypewriter();
        this.stopTransTypewriter();
        this.stopInspireTypewriter();
      } else if (stepIndex === 1) {
        this.stopTypewriter();
        this.startBizTypewriter();
        this.stopTransTypewriter();
        this.stopInspireTypewriter();
      } else if (stepIndex === 3) {
        this.stopTypewriter();
        this.stopBizTypewriter();
        this.startTransTypewriter();
        this.stopInspireTypewriter();
      } else if (stepIndex === 4) {
        this.stopTypewriter();
        this.stopBizTypewriter();
        this.stopTransTypewriter();
        this.startInspireTypewriter();
      } else {
        this.stopTypewriter();
        this.stopBizTypewriter();
        this.stopTransTypewriter();
        this.stopInspireTypewriter();
      }

      // Populate Step 8 Summary
      if (stepIndex === 8) {
        this.renderSummary();
      }
    }

    updateNicheCounter() {
      const count = this.profile.niches.length;
      if (this.nicheCounter) {
        this.nicheCounter.textContent = `เลือกแล้ว ${count} จาก 3 หมวด`;
      }
      if (this.btnNext2) {
        this.btnNext2.disabled = count === 0;
      }
    }

    renderSummary() {
      if (this.sumName) this.sumName.textContent = this.profile.name || 'Creator';
      if (this.sumEmail) this.sumEmail.textContent = this.profile.email || 'creator@brandfounder.co';
      if (this.sumPlan) this.sumPlan.textContent = this.profile.planLabel || 'Brand Founder Pro (฿990/ด.)';
      if (this.sumBusiness) {
        const raw = this.profile.businessDesc || 'แบรนด์สกินแคร์ออร์แกนิก สำหรับคนเป็นสิว ผิวแพ้ง่าย';
        this.sumBusiness.textContent = raw.length > 55 ? raw.slice(0, 52) + '...' : raw;
      }
      if (this.sumRole) this.sumRole.textContent = this.profile.roleLabel || 'Creator & Influencer';
      if (this.sumNiches) {
        this.sumNiches.textContent = this.profile.nicheLabels.length > 0
          ? this.profile.nicheLabels.join(', ')
          : 'ธุรกิจ & การเงิน, Tech & AI';
      }
      if (this.sumChannel) this.sumChannel.textContent = this.profile.channelHandle || '@mewteetawat';
    }

    // ==========================================================================
    // PERSISTENCE & OS SYNC
    // ==========================================================================
    loadSavedProfile() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const data = JSON.parse(raw);
          this.profile = Object.assign(this.profile, data);
          this.syncUiFromProfile();
        }
      } catch (e) {
        console.warn('Could not parse saved onboarding profile:', e);
      }
    }

    syncUiFromProfile() {
      if (this.userNameInput && this.profile.name) {
        this.userNameInput.value = this.profile.name;
      }

      if (this.userEmailInput && this.profile.email) {
        this.userEmailInput.value = this.profile.email;
      }

      if (this.bizDescInput && this.profile.businessDesc) {
        this.bizDescInput.value = this.profile.businessDesc;
      }
      if (this.bizAudienceInput && this.profile.targetAudience) {
        this.bizAudienceInput.value = this.profile.targetAudience;
      }
      if (this.bizUspInput && this.profile.brandUsp) {
        this.bizUspInput.value = this.profile.brandUsp;
      }

      if (this.profile.role) {
        this.roleCards.forEach(c => {
          if (c.dataset.role === this.profile.role) {
            c.classList.add('selected');
            c.setAttribute('aria-checked', 'true');
          } else {
            c.classList.remove('selected');
            c.setAttribute('aria-checked', 'false');
          }
        });
        if (this.btnNext1) this.btnNext1.disabled = false;
      }

      if (this.profile.niches && this.profile.niches.length > 0) {
        this.nicheChips.forEach(chip => {
          if (this.profile.niches.includes(chip.dataset.niche)) {
            chip.classList.add('selected');
            chip.setAttribute('aria-pressed', 'true');
          } else {
            chip.classList.remove('selected');
            chip.setAttribute('aria-pressed', 'false');
          }
        });
        this.updateNicheCounter();
      }

      if (this.channelInput && this.profile.channelHandle) {
        this.channelInput.value = this.profile.channelHandle.replace(/^@/, '');
        this.presetCards.forEach(c => {
          if (c.dataset.handle === this.profile.channelHandle) {
            c.classList.add('active');
          } else {
            c.classList.remove('active');
          }
        });
      }
    }

    saveProfile(isSkip = false) {
      this.profile.completedAt = new Date().toISOString();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.profile));
      } catch (e) {
        console.warn('LocalStorage save failed:', e);
      }
      this.applyProfileToOS();
    }

    applyProfileToOS() {
      const brandBtnLabel = document.getElementById('header-brand-name');
      if (brandBtnLabel) {
        const displayName = this.profile.name ? `${this.profile.name} (${this.profile.roleLabel || 'Creator'})` : 'Brand Brain';
        brandBtnLabel.textContent = displayName;
      }

      const channelInput = document.getElementById('creator-channel-input');
      if (channelInput && this.profile.channelHandle) {
        channelInput.value = this.profile.channelHandle;
        channelInput.dispatchEvent(new Event('input', { bubbles: true }));
      }

      const remixAudience = document.getElementById('input-target-audience');
      if (remixAudience && this.profile.targetAudience) {
        remixAudience.value = this.profile.targetAudience;
        remixAudience.dispatchEvent(new Event('input', { bubbles: true }));
      }
      const remixBrandTruth = document.getElementById('input-brand-truth');
      if (remixBrandTruth && this.profile.businessDesc) {
        remixBrandTruth.value = `${this.profile.businessDesc} ${this.profile.brandUsp ? '• ' + this.profile.brandUsp : ''}`.trim();
        remixBrandTruth.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }

    showWelcomeToast() {
      const toastHub = document.getElementById('toast-hub');
      const saveToast = document.getElementById('save-toast');
      const toastTitle = document.getElementById('toast-title');
      const toastDesc = document.getElementById('toast-desc');

      if (saveToast && toastTitle && toastDesc) {
        toastTitle.textContent = `ยินดีต้อนรับ, ${this.profile.name}! 🚀`;
        toastDesc.textContent = `เปิดใช้งานแพ็กเกจ ${this.profile.planLabel} และเชื่อมต่อ Brand Brain เรียบร้อย`;
        saveToast.hidden = false;

        setTimeout(() => {
          saveToast.hidden = true;
        }, 5000);
      }
    }

    open() {
      if (this.modal) {
        this.modal.style.display = 'flex';
        this.goToStep(0);
      }
    }

    close() {
      if (this.modal) {
        this.modal.style.display = 'none';
        this.modal.classList.remove('ob-mode-zen');
        this.stopTypewriter();
        this.stopBizTypewriter();
        this.stopTransTypewriter();
        this.stopInspireTypewriter();
      }
    }
  }

  // Global Singleton instance
  let instance = null;

  function initOnboarding() {
    if (!instance) {
      instance = new ScanfeedOnboarding();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOnboarding);
  } else {
    initOnboarding();
  }

  window.openOnboardingModal = function () {
    if (instance) {
      instance.open();
    } else {
      initOnboarding();
      if (instance) instance.open();
    }
  };

  window.openFullscreenOnboarding = window.openOnboardingModal;
  window.ScanfeedOnboarding = ScanfeedOnboarding;
})();
