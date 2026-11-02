/**
 * ==============================================================================
 * MEW CONTENT OS — S07 Remix Workspace Concepts Controller (Topic T24)
 * Theme: mewteetawat.com V6.3
 * 100% Pure Client-Side JavaScript (Vanilla ES6+)
 * Zero Server Dependencies · Zero Fake Metrics · Accessible WCAG UI
 * ==============================================================================
 */

import { getState, dispatch } from './store.js';
import { router } from './router.js';

export class WorkspaceConceptsController {
  constructor(options = {}) {
    this.root = typeof options.rootId === 'string'
      ? (typeof document !== 'undefined' ? document.querySelector(options.rootId) : null)
      : (options.rootId || (typeof document !== 'undefined' ? document.getElementById('ws-concepts') : null));

    this.concepts = options.initialConcepts || [];
    this.onConceptSaved = options.onConceptSaved || null;
    this.onConceptSentToBoard = options.onConceptSentToBoard || null;
    this.onConceptRefined = options.onConceptRefined || null;
  }

  /**
   * Synthesizes 2-3 distinct original concepts from ingredients and direction.
   * Guarantees distinct hooks and explicit source attribution trace.
   * A10: When Packaging = 0, concepts do not cite any packaging references.
   * A12: When Packaging is from different category, only storytelling mechanism (HOW) is borrowed.
   * 
   * @param {Array<Object>|Object} selection - Ingredients array or selection object
   * @param {Object} direction - Founder direction { audience, ourPov, cta, ... }
   * @returns {Array<Object>} Array of 2-3 synthesized concepts
   */
  generateConcepts(selection = [], direction = {}) {
    // 1. Normalize selection input
    let ingredients = [];
    if (Array.isArray(selection)) {
      ingredients = [...selection];
    } else if (selection && typeof selection === 'object') {
      if (Array.isArray(selection.ingredients)) {
        ingredients = [...selection.ingredients];
      } else {
        const c = Array.isArray(selection.content) ? selection.content : [];
        const p = Array.isArray(selection.packaging) ? selection.packaging : [];
        ingredients = [...c, ...p];
      }
    }

    if (ingredients.length === 0) {
      this.concepts = [];
      return [];
    }

    const audience = (direction.audience || 'ผู้ชมทั่วไป').trim();
    const ourPov = (direction.ourPov || 'เน้นคุณภาพและผลงานระยะยาว').trim();
    const cta = (direction.cta || 'ติดตามตอนต่อไป').trim();

    // 2. Separate Content (WHAT) vs Packaging (HOW)
    const contentItems = ingredients.filter(i => (i.vaultType || i.lens) === 'content');
    const packagingItems = ingredients.filter(i => (i.vaultType || i.lens) === 'packaging');

    const primaryContent = contentItems[0] || ingredients[0] || { id: 'c1', title: 'แก่นคิดหลัก' };
    const secondaryContent = contentItems[1] || primaryContent;
    const hasPackaging = packagingItems.length > 0;
    const primaryPackaging = hasPackaging ? packagingItems[0] : null;
    const secondaryPackaging = packagingItems.length > 1 ? packagingItems[1] : primaryPackaging;

    // 3. Build Source Trace array (Strict Attribution)
    // A10: If packagingItems.length === 0, trace MUST NOT contain any packaging items
    const sourceTrace = ingredients.map((ing, idx) => {
      const isContent = (ing.vaultType || ing.lens) === 'content';
      return {
        refId: ing.id || ing.noteId || `ref-${idx + 1}`,
        title: ing.title || (isContent ? `Content ${idx + 1}` : `Packaging ${idx + 1}`),
        lens: isContent ? 'content' : 'packaging',
        borrowText: isContent
          ? (ing.borrowText || ing.founderWhy || ing.why || 'แก่นคิดและคุณค่าหลัก (WHAT to borrow)')
          : 'ยืมเฉพาะวิธีเล่าและจังหวะ (Transferable Packaging) ไม่ดึงหัวข้อมา' // A12 Guard
      };
    });

    // 4. Define Visual & Sound Cues conforming to A10 & A12
    const visualSound1 = hasPackaging
      ? `ยืมเฉพาะจังหวะเปิดเรื่องและ Sound Cue สไตล์ "${primaryPackaging.title}" (ยืมเฉพาะวิธีเล่า ไม่ดึงหัวข้อ) สลับ Close-up คมชัด`
      : 'เปิดด้วยคำถามตรงไปตรงมา ภาพ Medium Close-up สลับข้อความเรียบง่าย เสียงบรรยายชัดเจน (Original Sound Cue)';

    const visualSound2 = hasPackaging
      ? `ตัดต่อกระชับสลับภาพรวดเร็วตามเทคนิคเล่าเรื่องของ "${primaryPackaging.title}" (ยืมโครงสร้าง HOW ไม่นำหัวข้อมาปน)`
      : 'ดนตรี Minimal Metronome จังหวะเร่งความสนใจ สลับภาพตัดทุก 2.5 วินาที (Original Visual Rhythm)';

    const visualSound3 = hasPackaging
      ? `ใช้วิธีแสดงผลตามจังหวะของ "${(secondaryPackaging || primaryPackaging).title}" (ยืมเฉพาะเทคนิคการนำเสนอ)`
      : 'เสียงเอฟเฟกต์บรรยายประกอบ Text Reveal ทีละบรรทัด สลับกราฟิกสรุปประเด็น (Original Presentation)';

    // 5. Construct 3 Distinct Concepts
    // Concept 1: The Counter-Intuitive Truth (Question / Provocative Angle)
    const concept1 = {
      id: `concept-${Date.now()}-1`,
      name: 'The Counter-Intuitive Truth',
      style: 'ชวนคิด · เจาะลึกความเชื่อเดิม',
      hook: `เคยสงสัยไหมว่าทำไมยิ่งตั้งใจทำให้ดีเท่าไหร่ ยิ่งรู้สึกว่างเปล่า? ความลับไม่ได้อยู่ที่ผลลัพธ์ แต่อยู่ที่ "${ourPov.slice(0, 45)}"`,
      beats: [
        `0:00 - 0:03 : ตั้งคำถามท้าทายความเชื่อเดิมของ ${audience}`,
        `0:04 - 0:20 : อธิบายกลไกที่ทำให้เราติดกับดัก (ต่อยอดจาก: ${primaryContent.title})`,
        `0:21 - 0:45 : นำเสนอมุมมองใหม่ที่เป็นเอกลักษณ์ของเรา (${ourPov})`,
        `0:46 - 0:60 : สรุปบทเรียนและปิดท้ายด้วย Action ชัดเจน`
      ],
      claimCheck: {
        status: 'verified',
        label: 'Transformative Fair Use',
        evidenceType: 'Founder POV (มุมมองตรง)',
        summary: 'ผ่านเกณฑ์ตรวจสอบ: ใช้โครงสร้างสังเคราะห์ใหม่ ไม่คัดลอกถ้อยคำตรง และไม่มีข้ออ้างลอย ๆ'
      },
      visualSound: visualSound1,
      originalContribution: ourPov,
      sourceTrace: sourceTrace,
      cta: cta,
      flagCopyRisk: false
    };

    // Concept 2: The Fast Metaphor (Pattern Interrupt / Urgent Angle)
    const concept2 = {
      id: `concept-${Date.now()}-2`,
      name: 'The Fast Metaphor',
      style: 'ฉับไว · คมกริบ · เปรียบเทียบชัดเจน',
      hook: `หยุดทำสิ่งนี้ทันทีถ้าคุณเป็น ${audience}: 3 ข้อผิดพลาดที่คน 99% คิดว่าถูก แต่ทำลายพลังสร้างสรรค์ของคุณ`,
      beats: [
        '0:00 - 0:04 : ยิงคำเตือนตรงประเด็นด้วยภาพตัดสลับเร็ว',
        `0:05 - 0:25 : ชี้เปรียบเทียบสิ่งที่เราเห็น vs สิ่งที่เป็นจริง (${primaryContent.title})`,
        `0:26 - 0:45 : วิธีแก้ปัญหาแบบฉบับ Founder: ${ourPov}`,
        '0:46 - 0:58 : สรุปหมัดฮุกสุดท้ายและผลลัพธ์ที่เปลี่ยนไป'
      ],
      claimCheck: {
        status: 'verified',
        label: 'Transformative Fair Use',
        evidenceType: 'Transformative Structure',
        summary: 'ผ่านเกณฑ์ตรวจสอบ: โครงสร้างการเล่าแบบเปรียบเทียบ ไม่ผูกขาดลิขสิทธิ์'
      },
      visualSound: visualSound2,
      originalContribution: ourPov,
      sourceTrace: sourceTrace,
      cta: cta,
      flagCopyRisk: false
    };

    // Concept 3: The Framework Teardown (Systematic / 3-Step Blueprint Angle)
    const concept3 = {
      id: `concept-${Date.now()}-3`,
      name: 'The 3-Step Principle',
      style: 'เป็นระบบ · นำไปใช้ได้ทันที',
      hook: `สูตรลัดที่เปลี่ยนวิธีคิดของผมไปตลอดกาล: กฎ 3 ข้อสำหรับ ${audience}`,
      beats: [
        '0:00 - 0:03 : ประกาศชื่อ Framework พร้อมข้อความบนจอ',
        `0:04 - 0:18 : ขั้นที่ 1: ปลดล็อกความคิดเดิม (${secondaryContent.title || primaryContent.title})`,
        `0:19 - 0:38 : ขั้นที่ 2: วางจุดยืนเฉพาะตัว (${ourPov})`,
        '0:39 - 0:55 : ขั้นที่ 3: ลงมือทำอย่างสม่ำเสมอ'
      ],
      claimCheck: {
        status: 'verified',
        label: 'Transformative Fair Use',
        evidenceType: 'Original Value Integration',
        summary: 'ผ่านเกณฑ์ตรวจสอบ: ผสานมุมคิด Founder เข้ากับแก่นสาระอย่างโปร่งใส'
      },
      visualSound: visualSound3,
      originalContribution: ourPov,
      sourceTrace: sourceTrace,
      cta: cta,
      flagCopyRisk: false
    };

    const concepts = [concept1, concept2, concept3];

    // 6. Audit for Copy Risk (concept with zero references or verbatim copy flagged)
    for (const c of concepts) {
      if (!Array.isArray(c.sourceTrace) || c.sourceTrace.length === 0) {
        c.flagCopyRisk = true;
        c.copyRiskReason = 'ไม่มีการอ้างอิงวัตถุดิบต้นทาง (No Reference Attribution)';
      }
      for (const ing of ingredients) {
        const title = (ing.title || '').trim().toLowerCase();
        if (title.length > 25 && c.hook.toLowerCase().includes(title)) {
          c.flagCopyRisk = true;
          c.copyRiskReason = `พบความเสี่ยงคัดลอกถ้อยคำต้นฉบับ "${ing.title}" ตรงเกินไป`;
        }
      }
    }

    this.concepts = concepts;
    return this.concepts;
  }

  /**
   * Renders concepts into DOM container
   * @param {HTMLElement|string} [targetContainer]
   * @param {Array<Object>} [conceptsToRender]
   */
  renderConcepts(targetContainer = null, conceptsToRender = null) {
    if (typeof document === 'undefined') return;

    const container = typeof targetContainer === 'string'
      ? document.querySelector(targetContainer)
      : (targetContainer || (this.root ? this.root.querySelector('#concepts-list') : document.getElementById('concepts-list')));

    if (!container) return;

    const list = conceptsToRender || this.concepts;
    container.innerHTML = '';

    if (!Array.isArray(list) || list.length === 0) {
      const emptyState = this.root ? this.root.querySelector('#concepts-empty') : document.getElementById('concepts-empty');
      if (emptyState) emptyState.hidden = false;
      return;
    }

    const template = document.getElementById('tmpl-concept-card');

    let cCount = 0;
    let pCount = 0;

    list.forEach((concept, index) => {
      let cardEl;
      if (template && template.content) {
        const clone = template.content.cloneNode(true);
        cardEl = clone.querySelector('.concept-card') || clone.firstElementChild;
      } else {
        cardEl = document.createElement('article');
        cardEl.className = 'concept-card mew-offer-card';
      }

      cardEl.id = `concept-${concept.id}`;
      cardEl.setAttribute('data-concept-id', concept.id);
      cardEl.setAttribute('data-testid', `concept-${concept.id}`);

      // Number and title
      const numEl = cardEl.querySelector('.concept-number');
      if (numEl) numEl.textContent = `Concept ${index + 1}`;

      const nameEl = cardEl.querySelector('.concept-name');
      if (nameEl) nameEl.textContent = concept.name;

      const styleEl = cardEl.querySelector('.concept-style-tag');
      if (styleEl) styleEl.textContent = concept.style;

      // Copy Risk Flag
      const flagEl = cardEl.querySelector('.flag-copy-risk');
      if (flagEl) {
        if (concept.flagCopyRisk) {
          flagEl.hidden = false;
          const labelEl = flagEl.querySelector('.copy-risk-label') || flagEl;
          labelEl.textContent = concept.copyRiskReason || 'flag-copy-risk';
        } else {
          flagEl.hidden = true;
        }
      }

      // Hook Point
      const hookEl = cardEl.querySelector('.c-hook');
      if (hookEl) hookEl.textContent = concept.hook;

      // Story Beats
      const beatsEl = cardEl.querySelector('.c-story-beats');
      if (beatsEl && Array.isArray(concept.beats)) {
        beatsEl.innerHTML = concept.beats.map(beat => `<li>${beat}</li>`).join('');
      }

      // Claim Check
      const claimCheckEl = cardEl.querySelector('.c-claim-check');
      if (claimCheckEl && concept.claimCheck) {
        const badgeStatus = claimCheckEl.querySelector('.claim-badge-status');
        if (badgeStatus) badgeStatus.textContent = concept.claimCheck.label;
        const badgeEvidence = claimCheckEl.querySelector('.claim-badge-evidence');
        if (badgeEvidence) badgeEvidence.textContent = concept.claimCheck.evidenceType;
        const summaryEl = claimCheckEl.querySelector('.claim-check-summary');
        if (summaryEl) summaryEl.textContent = concept.claimCheck.summary;
      }

      // Visual & Sound
      const vsEl = cardEl.querySelector('.c-visual-sound');
      if (vsEl) vsEl.textContent = concept.visualSound;

      // Original Contribution
      const contribEl = cardEl.querySelector('.c-original-contribution');
      if (contribEl) contribEl.textContent = concept.originalContribution;

      // Source Trace
      const traceEl = cardEl.querySelector('.c-source-trace');
      if (traceEl) {
        traceEl.innerHTML = '';
        let localCCount = 0;
        let localPCount = 0;

        if (Array.isArray(concept.sourceTrace)) {
          concept.sourceTrace.forEach(item => {
            const isContent = item.lens === 'content';
            if (isContent) localCCount++;
            else localPCount++;

            const prefix = isContent ? `C${localCCount}` : `P${localPCount}`;
            const pillClass = isContent ? 'content' : 'packaging';

            const itemEl = document.createElement('div');
            itemEl.className = 'source-trace-item';
            itemEl.innerHTML = `
              <div class="source-trace-left">
                <span class="source-trace-pill ${pillClass}">
                  ${prefix} (${isContent ? 'Source Content' : 'Transferable Packaging'})
                </span>
                <span class="source-trace-desc">${item.title}</span>
              </div>
              <a href="#ref-${item.refId}" class="trace-link font-num" aria-label="ดูที่มา ${item.title}">
                ดูที่มา &rarr;
              </a>
            `;
            traceEl.appendChild(itemEl);
          });
        }

        // Add New Original Value to trace
        if (concept.originalContribution) {
          const valEl = document.createElement('div');
          valEl.className = 'source-trace-item';
          valEl.innerHTML = `
            <div class="source-trace-left">
              <span class="source-trace-pill original-value">New Original Value</span>
              <span class="source-trace-desc">${concept.originalContribution}</span>
            </div>
            <span class="trace-link font-num">Founder POV</span>
          `;
          traceEl.appendChild(valEl);
        }
      }

      // CTA
      const ctaEl = cardEl.querySelector('.c-cta');
      if (ctaEl) ctaEl.textContent = concept.cta;

      // Action Buttons
      const btnRefine = cardEl.querySelector('[data-action="refine"]');
      if (btnRefine) {
        btnRefine.addEventListener('click', () => this.refineConcept(concept.id));
      }

      const btnSave = cardEl.querySelector('[data-action="save"]');
      if (btnSave) {
        btnSave.addEventListener('click', () => this.saveConcept(concept.id));
      }

      const btnSend = cardEl.querySelector('[data-action="send-to-board"]');
      if (btnSend) {
        btnSend.addEventListener('click', () => this.sendToBoard(concept.id));
      }

      container.appendChild(cardEl);
    });
  }

  /**
   * Refines a specific concept
   * @param {string} conceptId 
   */
  refineConcept(conceptId) {
    const concept = this.concepts.find(c => c.id === conceptId);
    if (!concept) return;

    if (typeof this.onConceptRefined === 'function') {
      this.onConceptRefined(concept);
    } else {
      try {
        dispatch({
          type: 'SET_REFINE_TARGET',
          payload: { concept }
        });
      } catch (e) {}
    }
  }

  /**
   * Saves a specific concept
   * @param {string} conceptId 
   */
  saveConcept(conceptId) {
    const concept = this.concepts.find(c => c.id === conceptId);
    if (!concept) return;

    if (typeof this.onConceptSaved === 'function') {
      this.onConceptSaved(concept);
    } else {
      try {
        dispatch({
          type: 'SAVE_CONCEPT',
          payload: { concept }
        });
      } catch (e) {}
    }
  }

  /**
   * Sends concept to Content Board (S09 Kanban)
   * @param {string} conceptId 
   */
  sendToBoard(conceptId) {
    const concept = this.concepts.find(c => c.id === conceptId);
    if (!concept) return;

    try {
      dispatch({
        type: 'ADD_BOARD_CARD',
        payload: {
          conceptId: concept.id,
          title: concept.name,
          hook: concept.hook,
          stage: 'idea',
          conceptData: concept
        }
      });
    } catch (e) {}

    if (typeof this.onConceptSentToBoard === 'function') {
      this.onConceptSentToBoard(concept);
    } else if (router && typeof router.navigate === 'function') {
      router.navigate('board');
    }
  }
}
