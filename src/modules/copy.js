/**
 * ==============================================================================
 * MEW CONTENT OS — UX Copy Dictionary (Topic T32)
 * Theme: mewteetawat.com V6.3
 * 100% Pure Client-Side JavaScript (Vanilla ES6+)
 * Zero Server Dependencies · Zero Fake Metrics · Accessible WCAG UI
 * 
 * Sources of Truth:
 * - MEW_Content_OS_Founder_UX_Spec_TH.md (Spec Rule 7: UX Copy Specifications)
 * - Rule 1: Analyze ≠ Save (AI never auto-saves to Vault)
 * - Rule 2: Two discrete vaults: Content Vault (WHAT) / Packaging Vault (HOW)
 * - Rule 3: Save can be Content / Packaging / Both (Dual WHY fields required for Both)
 * - Rule 6: Original Concepts 2-3 hooks + source trace
 * - Rule 7: Reference Ingestion vs Draft vs Approval vs Director Brief Handoff
 * ==============================================================================
 */

export const COPY = {
  // S00 Overview / Dashboard Primary Actions (Topic T04)
  RESEARCH_A_CLIP: {
    en: 'Research a Clip',
    th: 'วิจัยคลิป'
  },
  OPEN_LIBRARY: {
    en: 'Open My Library',
    th: 'เปิดคลังวัตถุดิบ'
  },
  START_REMIX: {
    en: 'Start Remix',
    th: 'เริ่มรีมิกซ์'
  },
  CONTINUE_WORK: {
    en: 'Continue work',
    th: 'ทำงานต่อ'
  },

  // S01 Research Inbox & S02 Ingestion
  ANALYZE_CLIP: {
    en: 'Analyze Clip',
    th: 'วิเคราะห์คลิป'
  },
  ANALYZED_NOT_SAVED: {
    en: 'Analyzed · Not saved',
    th: 'วิเคราะห์แล้ว · ยังไม่ได้เก็บ'
  },

  // S03 Save Modal (UI Chooser)
  SAVE_TO_LIBRARY: {
    en: 'Save to Library',
    th: 'บันทึกเข้าคลัง'
  },
  LENSES: {
    CONTENT: 'Content (WHAT)',
    PACKAGING: 'Packaging (HOW)',
    BOTH: 'Both'
  },
  WHY_PROMPT: {
    th: 'ทำไมคุณอยากเก็บสิ่งนี้?',
    en: 'Why do you want to save this reference?'
  },

  // S04 Library & S06 Multi-ingredient Basket
  USE_IN_REMIX: {
    en: 'Use in Remix',
    th: 'นำไปรีมิกซ์'
  },

  // S07 Remix Workspace
  CREATE_ORIGINAL_CONCEPTS: {
    en: 'Create Original Concepts',
    th: 'สังเคราะห์ Original Concepts'
  },
  SAVE_REMIX_DRAFT: {
    en: 'Save Remix Draft',
    th: 'บันทึกร่างสคริปต์'
  },

  // S09 Content Board Governance
  APPROVE_CONCEPT: {
    en: 'Approve Concept',
    th: 'อนุมัติคอนเซปต์'
  }
};

// Named Exports for Direct Ergonomic Imports
export const RESEARCH_A_CLIP = COPY.RESEARCH_A_CLIP;
export const OPEN_LIBRARY = COPY.OPEN_LIBRARY;
export const START_REMIX = COPY.START_REMIX;
export const CONTINUE_WORK = COPY.CONTINUE_WORK;
export const ANALYZE_CLIP = COPY.ANALYZE_CLIP;
export const ANALYZED_NOT_SAVED = COPY.ANALYZED_NOT_SAVED;
export const SAVE_TO_LIBRARY = COPY.SAVE_TO_LIBRARY;
export const LENSES = COPY.LENSES;
export const WHY_PROMPT = COPY.WHY_PROMPT;
export const USE_IN_REMIX = COPY.USE_IN_REMIX;
export const CREATE_ORIGINAL_CONCEPTS = COPY.CREATE_ORIGINAL_CONCEPTS;
export const SAVE_REMIX_DRAFT = COPY.SAVE_REMIX_DRAFT;
export const APPROVE_CONCEPT = COPY.APPROVE_CONCEPT;

/**
 * Returns localized string based on locale preference (default: 'th')
 * @param {string} key - Key in COPY dictionary
 * @param {'th'|'en'} locale - Locale code
 * @returns {string}
 */
export function getCopy(key, locale = 'th') {
  const item = COPY[key];
  if (!item) return key;
  if (typeof item === 'string') return item;
  return item[locale] || item.th || item.en || key;
}

export default COPY;
