/**
 * ==============================================================================
 * MEW CONTENT OS — S07 Remix Workspace Direction Controller (Topic T23)
 * Theme: mewteetawat.com V6.3
 * 100% Pure Client-Side JavaScript (Vanilla ES6+)
 * Zero Server Dependencies · Zero Fake Metrics · Accessible WCAG UI
 * ==============================================================================
 */

import { getState, dispatch, subscribe } from './store.js';
import { router } from './router.js';

export const REMIX_SESSION_STORAGE_KEY = 'mew-remix-session-v1';

export const DEFAULT_BRAND_BRAIN = {
  offer: 'MEW Content OS Platform',
  voiceDna: 'Thoughtful, Practical, No-fluff',
  proof: '100% Originality Guard'
};

export const DEFAULT_DIRECTION = {
  audience: '',
  goal: '',
  ourPov: '',
  tone: 'calm-thoughtful',
  cta: '',
  constraints: '',
  rights: 'ยืมเฉพาะโครงสร้างทางความคิดและเทคนิค ไม่คัดลอกคำพูดหรือทรัพย์สินทางปัญญา'
};

/**
 * Resolves active remixSession from globalThis or localStorage fallback
 * @returns {object}
 */
export function getRemixSession() {
  if (typeof globalThis !== 'undefined' && globalThis.remixSession) {
    if (!globalThis.remixSession.direction) {
      globalThis.remixSession.direction = {};
    }
    return globalThis.remixSession;
  }

  let initial = {
    ingredients: [],
    direction: {},
    lastUpdated: new Date().toISOString()
  };

  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(REMIX_SESSION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          initial = {
            ...initial,
            ...parsed,
            direction: (parsed.direction && typeof parsed.direction === 'object') ? parsed.direction : {}
          };
        }
      }
    }
  } catch (e) {
    // LocalStorage unavailable; fallback to in-memory
  }

  if (typeof globalThis !== 'undefined') {
    globalThis.remixSession = initial;
  }

  return initial;
}

/**
 * Persists active remixSession into globalThis and localStorage
 * @param {object} session 
 * @returns {object}
 */
export function setRemixSession(session) {
  if (!session || typeof session !== 'object') return getRemixSession();

  const target = getRemixSession();
  if (session.ingredients !== undefined) {
    target.ingredients = Array.isArray(session.ingredients) ? session.ingredients : target.ingredients;
  }
  if (session.direction !== undefined) {
    target.direction = { ...target.direction, ...session.direction };
  }
  target.lastUpdated = new Date().toISOString();

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(REMIX_SESSION_STORAGE_KEY, JSON.stringify(target));
    }
  } catch (e) {
    // Quota or access error handled gracefully
  }

  return target;
}

export const remixSession = getRemixSession();

export class WorkspaceDirectionController {
  /**
   * Initializes the Workspace Direction Controller
   * @param {Object} options 
   * @param {HTMLElement|string} [options.rootId]
   * @param {Object} [options.initialDirection]
   * @param {Function} [options.onDirectionChanged]
   * @param {Function} [options.onGenerate]
   */
  constructor(options = {}) {
    this.root = typeof options.rootId === 'string'
      ? (typeof document !== 'undefined' ? document.querySelector(options.rootId) : null)
      : (options.rootId || (typeof document !== 'undefined' ? document.getElementById('ws-direction') : null));

    this.remixSession = getRemixSession();

    // Preserve direction across navigation: Merge defaults -> persisted session.direction -> passed initialDirection
    const sessionDir = (this.remixSession && typeof this.remixSession.direction === 'object')
      ? this.remixSession.direction
      : {};

    this.direction = {
      ...DEFAULT_DIRECTION,
      ...sessionDir,
      ...(options.initialDirection || {})
    };

    // Ensure session holds latest merged direction
    if (this.remixSession) {
      this.remixSession.direction = { ...this.direction };
      setRemixSession(this.remixSession);
    }

    // Strict constraint: AI cannot auto-fill Our POV
    this.preventAIAutoFillOurPov = true;

    this.onDirectionChanged = options.onDirectionChanged || null;
    this.onGenerate = options.onGenerate || null;

    this.brandBrain = this.resolveBrandBrain();

    this.initDOM();
    this.bindEvents();
    this.subscribeStore();
    this.updateUI();
  }

  /**
   * Resolves Brand Brain context from central store or fallback mock
   * @returns {{ offer: string, voiceDna: string, proof: string }}
   */
  resolveBrandBrain() {
    try {
      if (typeof getState === 'function') {
        const state = getState();
        if (state && state.brandBrain) {
          return {
            offer: state.brandBrain.offer || DEFAULT_BRAND_BRAIN.offer,
            voiceDna: state.brandBrain.voiceDna || state.brandBrain.voice || DEFAULT_BRAND_BRAIN.voiceDna,
            proof: state.brandBrain.proof || DEFAULT_BRAND_BRAIN.proof
          };
        }
      }
    } catch (e) {
      // Store not ready or in mock mode
    }

    return { ...DEFAULT_BRAND_BRAIN };
  }

  /**
   * Validates whether direction satisfies gating conditions
   * Rule: audience and ourPov MUST not be empty.
   * @param {Object} [dir] 
   * @returns {boolean}
   */
  canGenerate(dir) {
    const target = dir || this.direction;
    const hasAudience = Boolean(target.audience && target.audience.trim());
    const hasOurPov = Boolean(target.ourPov && target.ourPov.trim());
    return hasAudience && hasOurPov;
  }

  /**
   * Explains reason for gating status alongside the synthesis button
   * @param {Object} [dir] 
   * @returns {string}
   */
  getGatingReason(dir) {
    const target = dir || this.direction;
    const hasAudience = Boolean(target.audience && target.audience.trim());
    const hasOurPov = Boolean(target.ourPov && target.ourPov.trim());

    if (!hasAudience && !hasOurPov) {
      return 'กรุณาระบุ Audience และ Our Unique POV เพื่อปลดล็อกปุ่มสังเคราะห์';
    }
    if (!hasAudience) {
      return 'กรุณาระบุกลุ่มผู้ฟัง / ลูกค้าเป้าหมาย (Audience)';
    }
    if (!hasOurPov) {
      return 'กรุณาระบุสิ่งใหม่ที่เราจะพูด (Our POV) — จุดยืนที่แตกต่างของคุณ';
    }
    return 'พร้อมสำหรับการสังเคราะห์ Original Concepts';
  }

  /**
   * Sets a specific direction field and persists to session immediately
   * @param {string} key 
   * @param {string} value 
   */
  setField(key, value) {
    if (key in this.direction || key === 'ourPov') {
      const sanitizedKey = key === 'dir-our-pov' ? 'ourPov' : key;
      this.direction[sanitizedKey] = value;

      // Persist in remixSession.direction
      if (this.remixSession) {
        if (!this.remixSession.direction) {
          this.remixSession.direction = {};
        }
        this.remixSession.direction[sanitizedKey] = value;
        setRemixSession(this.remixSession);
      }

      // Sync to store
      try {
        if (typeof dispatch === 'function') {
          dispatch({
            type: 'UPDATE_REMIX_DIRECTION',
            payload: { direction: { ...this.direction } }
          });
        }
      } catch (e) {}

      if (typeof this.onDirectionChanged === 'function') {
        this.onDirectionChanged({ ...this.direction });
      }

      this.updateUI();
    }
  }

  /**
   * AI Suggestion Helper - Enforces DOD rule:
   * "ช่อง dir-our-pov ไม่ถูกเติมโดย AI เอง (ผู้ใช้เป็นคนระบุ POV)"
   * @param {string} field 
   * @param {string} value 
   * @returns {boolean} Whether suggestion was allowed
   */
  applyAISuggestion(field, value) {
    if (field === 'ourPov' || field === 'dir-our-pov') {
      console.warn('[DirectionController] AI is strictly forbidden from auto-filling Our POV. Founder must define their own angle.');
      return false;
    }
    this.setField(field, value);
    return true;
  }

  /**
   * Mounts initial DOM values from persisted session
   */
  initDOM() {
    if (typeof document === 'undefined') return;

    const fieldsMap = {
      'dir-audience': this.direction.audience,
      'dir-goal': this.direction.goal,
      'dir-our-pov': this.direction.ourPov,
      'dir-tone': this.direction.tone,
      'dir-cta': this.direction.cta,
      'dir-constraints': this.direction.constraints,
      'dir-rights': this.direction.rights
    };

    Object.entries(fieldsMap).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el && val !== undefined && val !== null) {
        el.value = val;
      }
    });

    this.renderBrandBrain();
  }

  /**
   * Renders Brand Brain context values
   */
  renderBrandBrain() {
    if (typeof document === 'undefined') return;

    const offerEl = document.querySelector('#brand-brain-offer .brain-pill-val');
    const voiceEl = document.querySelector('#brand-brain-voice .brain-pill-val');
    const proofEl = document.querySelector('#brand-brain-proof .brain-pill-val');

    if (offerEl && this.brandBrain.offer) offerEl.textContent = this.brandBrain.offer;
    if (voiceEl && this.brandBrain.voiceDna) voiceEl.textContent = this.brandBrain.voiceDna;
    if (proofEl && this.brandBrain.proof) proofEl.textContent = this.brandBrain.proof;
  }

  /**
   * Attaches event listeners to inputs and action buttons
   */
  bindEvents() {
    if (typeof document === 'undefined') return;

    const inputBindings = [
      { id: 'dir-audience', key: 'audience', event: 'input' },
      { id: 'dir-goal', key: 'goal', event: 'input' },
      { id: 'dir-our-pov', key: 'ourPov', event: 'input' },
      { id: 'dir-tone', key: 'tone', event: 'change' },
      { id: 'dir-cta', key: 'cta', event: 'input' },
      { id: 'dir-constraints', key: 'constraints', event: 'input' },
      { id: 'dir-rights', key: 'rights', event: 'input' }
    ];

    inputBindings.forEach(({ id, key, event }) => {
      const el = document.getElementById(id);
      if (el && !el._boundWsDirection) {
        el._boundWsDirection = true;
        el.addEventListener(event, (e) => {
          this.setField(key, e.target.value);
        });
      }
    });

    // Button Generate concepts click
    const btnGen = document.getElementById('btn-generate-concepts');
    if (btnGen && !btnGen._boundWsDirection) {
      btnGen._boundWsDirection = true;
      btnGen.addEventListener('click', () => {
        this.handleGenerate();
      });
    }

    // Keyboard support: Ctrl+Enter / Cmd+Enter on Our POV textarea
    const povEl = document.getElementById('dir-our-pov');
    if (povEl && !povEl._boundKeydown) {
      povEl._boundKeydown = true;
      povEl.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          if (this.canGenerate()) {
            e.preventDefault();
            this.handleGenerate();
          }
        }
      });
    }
  }

  /**
   * Subscribes to central store changes if store is available
   */
  subscribeStore() {
    if (typeof subscribe === 'function') {
      try {
        this.unsubscribe = subscribe(() => {
          const freshBrain = this.resolveBrandBrain();
          if (
            freshBrain.offer !== this.brandBrain.offer ||
            freshBrain.voiceDna !== this.brandBrain.voiceDna ||
            freshBrain.proof !== this.brandBrain.proof
          ) {
            this.brandBrain = freshBrain;
            this.renderBrandBrain();
          }
        });
      } catch (e) {}
    }
  }

  /**
   * Updates UI state: button disabled status, reason message, and counter
   */
  updateUI() {
    if (typeof document === 'undefined') return;

    const isValid = this.canGenerate();
    const reasonText = this.getGatingReason();

    const btnGen = document.getElementById('btn-generate-concepts');
    const hint = document.getElementById('hint-need-direction');
    const reasonEl = document.getElementById('gating-reason-text');
    const povCounter = document.getElementById('our-pov-counter');

    if (btnGen) {
      btnGen.disabled = !isValid;
      btnGen.setAttribute('aria-disabled', String(!isValid));
    }

    if (hint) {
      if (isValid) {
        hint.classList.add('ready');
      } else {
        hint.classList.remove('ready');
      }
    }

    if (reasonEl) {
      reasonEl.textContent = reasonText;
    }

    if (povCounter) {
      const len = (this.direction.ourPov || '').length;
      povCounter.textContent = `${len} ตัวอักษร`;
    }
  }

  /**
   * Triggers concept generation action
   */
  handleGenerate() {
    if (!this.canGenerate()) return;

    if (typeof this.onGenerate === 'function') {
      this.onGenerate({ ...this.direction });
    } else if (router && typeof router.navigate === 'function') {
      router.navigate('remix-results');
    }
  }

  /**
   * Cleanup method
   */
  destroy() {
    if (typeof this.unsubscribe === 'function') {
      this.unsubscribe();
    }
  }
}
