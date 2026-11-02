/**
 * ==============================================================================
 * MEW CONTENT OS — Module: S-ONBOARD (Fullscreen Scanfeed Experience)
 * Reference: https://app.scanfeed.co/
 * Theme: mewteetawat.com V6.3
 * Features:
 *   - Fullscreen Viewport Navigation (Steps 0 to 4)
 *   - Human-like Typewriter Typing & Deleting Engine
 *   - 1-Tap Auto-Advance for Role Selection
 *   - Interactive Niche Chips & Channel Spy Presets
 *   - Persistent LocalStorage Sync with Brand Brain & Research Studio
 * ==============================================================================
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'mew_scanfeed_profile';

  // Rotating phrases for the headline keyword typewriter (Overview-matched)
  const TYPING_PHRASES = [
    'MEW Content OS',
    'Creator Brain V6.3',
    'ระบบวิจัยคลิปไวรัล',
    'สตูดิโอสร้างคอนเทนต์',
    'Creative Engine'
  ];

  class ScanfeedOnboarding {
    constructor() {
      this.currentStep = 0;
      this.profile = {
        name: 'Creator',
        role: 'creator',
        roleLabel: 'Creator & Influencer',
        niches: ['tech', 'business'],
        nicheLabels: ['Tech & AI', 'ธุรกิจ & การเงิน'],
        channelHandle: '@mewteetawat',
        completedAt: null
      };

      // Typewriter state
      this.typewriterActive = true;
      this.phraseIndex = 0;
      this.charIndex = 0;
      this.isDeleting = false;
      this.typeTimer = null;

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
        // Auto-show on first visit
        this.open();
      } else {
        this.applyProfileToOS();
      }
    }

    cacheDom() {
      this.modal = document.getElementById('onboarding-modal');
      this.screens = document.querySelectorAll('.ob-screen');
      this.stepDots = document.querySelectorAll('.ob-step-dot');
      this.typewriterEl = document.getElementById('ob-typewriter-text');

      // Step 0
      this.userNameInput = document.getElementById('ob-user-name');
      this.btnStart = document.getElementById('ob-btn-start');
      this.btnSkip = document.getElementById('ob-btn-skip');

      // Step 1
      this.roleCards = document.querySelectorAll('.ob-role-card');
      this.btnNext1 = document.getElementById('ob-next-1');
      this.btnBack1 = document.getElementById('ob-back-1');

      // Step 2
      this.nicheChips = document.querySelectorAll('.ob-chip');
      this.nicheCounter = document.getElementById('ob-niche-counter');
      this.btnNext2 = document.getElementById('ob-next-2');
      this.btnBack2 = document.getElementById('ob-back-2');

      // Step 3
      this.channelInput = document.getElementById('ob-channel-input');
      this.presetCards = document.querySelectorAll('.ob-preset-card');
      this.btnNext3 = document.getElementById('ob-next-3');
      this.btnBack3 = document.getElementById('ob-back-3');

      // Step 4
      this.sumName = document.getElementById('sum-name');
      this.sumRole = document.getElementById('sum-role');
      this.sumNiches = document.getElementById('sum-niches');
      this.sumChannel = document.getElementById('sum-channel');
      this.btnLaunch = document.getElementById('ob-btn-launch');
    }

    bindEvents() {
      if (this.btnStart) {
        this.btnStart.addEventListener('click', () => {
          if (this.userNameInput && this.userNameInput.value.trim()) {
            this.profile.name = this.userNameInput.value.trim();
          }
          this.goToStep(1);
        });
      }

      if (this.btnSkip) {
        this.btnSkip.addEventListener('click', () => {
          this.saveProfile(true);
          this.close();
        });
      }

      // Step 1: Roles
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

          // 1-Tap Auto-Advance with micro-delay for visual feedback
          setTimeout(() => {
            if (this.currentStep === 1) {
              this.goToStep(2);
            }
          }, 320);
        });
      });

      if (this.btnBack1) this.btnBack1.addEventListener('click', () => this.goToStep(0));
      if (this.btnNext1) this.btnNext1.addEventListener('click', () => this.goToStep(2));

      // Step 2: Niches
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
              // Max 3 reached, replace earliest
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

      if (this.btnBack2) this.btnBack2.addEventListener('click', () => this.goToStep(1));
      if (this.btnNext2) this.btnNext2.addEventListener('click', () => this.goToStep(3));

      // Step 3: Channel Spy
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

      if (this.btnBack3) this.btnBack3.addEventListener('click', () => this.goToStep(2));
      if (this.btnNext3) this.btnNext3.addEventListener('click', () => this.goToStep(4));

      // Step 4: Launch
      if (this.btnLaunch) {
        this.btnLaunch.addEventListener('click', () => {
          this.saveProfile(false);
          this.close();
          this.showWelcomeToast();
          if (typeof window.switchView === 'function') {
            window.switchView('research');
          }
        });
      }
    }

    // ==========================================================================
    // TYPEWRITER ENGINE (Human-like Typing & Deleting)
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
        // Typing characters
        this.charIndex++;
        this.typewriterEl.textContent = currentPhrase.substring(0, this.charIndex);

        if (this.charIndex >= currentPhrase.length) {
          // Finished phrase, pause before deleting
          this.isDeleting = true;
          this.typeTimer = setTimeout(() => this.tickTypewriter(), 2200);
          return;
        }

        // Typing speed with human variance
        const speed = 40 + Math.random() * 30;
        this.typeTimer = setTimeout(() => this.tickTypewriter(), speed);
      } else {
        // Deleting characters
        this.charIndex--;
        this.typewriterEl.textContent = currentPhrase.substring(0, this.charIndex);

        if (this.charIndex <= 0) {
          // Finished deleting, move to next phrase
          this.isDeleting = false;
          this.phraseIndex++;
          this.typeTimer = setTimeout(() => this.tickTypewriter(), 400);
          return;
        }

        // Deleting speed
        this.typeTimer = setTimeout(() => this.tickTypewriter(), 22);
      }
    }

    // ==========================================================================
    // SCREEN NAVIGATION & PROGRESS
    // ==========================================================================
    goToStep(stepIndex) {
      if (stepIndex < 0 || stepIndex >= this.screens.length) return;

      this.currentStep = stepIndex;

      // Update screen active states
      this.screens.forEach((screen, idx) => {
        if (idx === stepIndex) {
          screen.classList.add('ob-screen-active');
        } else {
          screen.classList.remove('ob-screen-active');
        }
      });

      // Update top progress dots
      this.stepDots.forEach((dot, idx) => {
        dot.classList.remove('active', 'completed');
        if (idx === stepIndex) {
          dot.classList.add('active');
        } else if (idx < stepIndex) {
          dot.classList.add('completed');
        }
      });

      // Pause or resume typewriter if on Screen 0
      if (stepIndex === 0) {
        this.startTypewriter();
      } else {
        this.stopTypewriter();
      }

      // Populate Screen 4 Summary
      if (stepIndex === 4) {
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
      // 1. Update Brand Brain button in Header
      const brandBtnLabel = document.getElementById('header-brand-name');
      if (brandBtnLabel) {
        const displayName = this.profile.name ? `${this.profile.name} (${this.profile.roleLabel || 'Creator'})` : 'Brand Brain';
        brandBtnLabel.textContent = displayName;
      }

      // 2. Auto-wire to Research Studio Channel Input
      const channelInput = document.getElementById('creator-channel-input');
      if (channelInput && this.profile.channelHandle) {
        channelInput.value = this.profile.channelHandle;
        channelInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }

    showWelcomeToast() {
      const toastHub = document.getElementById('toast-hub');
      const saveToast = document.getElementById('save-toast');
      const toastTitle = document.getElementById('toast-title');
      const toastDesc = document.getElementById('toast-desc');

      if (saveToast && toastTitle && toastDesc) {
        toastTitle.textContent = `ยินดีต้อนรับ, ${this.profile.name}! 🚀`;
        toastDesc.textContent = `ตั้งค่า Brand Brain สำเร็จ พร้อมแกะรอยช่อง ${this.profile.channelHandle}`;
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
        this.stopTypewriter();
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

  // Global Helpers
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
