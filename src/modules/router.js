/**
 * ==============================================================================
 * MEW CONTENT OS — Module: Central App Router & Transition Matrix (Topic T03)
 * Reference: mewteetawat.com V6.3 & MEW_Content_OS_Founder_UX_Spec_TH.md Section 4
 * Pure Client-Side JavaScript (ES6+ Module) · Zero Server Dependencies
 * 
 * Definition of Done (DOD) Checklist:
 * - JS: `router.go(screenId, params)` supports screen IDs `S00`–`S09`.
 *       Unknown ID displays `data-testid="screen-not-found"` without crashing.
 * - JS: `router.back()` returns to previous screen with store selection preserved (D10).
 * - JS: `TRANSITIONS` table specifies `{from, action, to}` covering all buttons
 *       stipulated in Spec Section 4 (Research→S01, Vault→S04, Remix→S06, Save Modal, etc.).
 * - Docs: `docs/transition-matrix.md` generated from `TRANSITIONS` via `node scripts/gen-matrix.js`.
 * - Test: Every row in `TRANSITIONS` strictly points to an existing screen in SCREENS.
 * ==============================================================================
 */

import { getState } from './store.js';

/**
 * Screen Registry: S00 through S09
 * Canonical metadata for all screens in the MEW Content OS pipeline.
 */
export const SCREENS = Object.freeze({
  S00: {
    id: 'S00',
    code: 'S00',
    name: 'Overview (Dashboard)',
    stage: 'Overview',
    theme: 'overview',
    title: '00 Overview / Dashboard',
    subtitle: 'ภาพรวมระบบคอนเทนต์: คลังวิจัย, สถานะวัตถุดิบ 2 คลัง และดราฟต์รีมิกซ์ล่าสุด',
    alias: 'overview',
    description: 'รู้ว่ามีงานอะไร และเข้า workflow ต่อได้ทันที ไม่ใช่แค่กราฟยอดวิว'
  },
  S01: {
    id: 'S01',
    code: 'S01',
    name: 'Research Entry & Inbox',
    stage: 'Research',
    theme: 'research',
    title: '01 Research Entry / Inbox',
    subtitle: 'พาคลิปเข้าหน้าตรวจสอบและวิเคราะห์ (URL / Upload / Scan Feed)',
    alias: 'research',
    description: 'พาคลิปเข้าหน้าตรวจสอบและวิเคราะห์ พร้อมสถานะ 7 แบบใน Inbox'
  },
  S02: {
    id: 'S02',
    code: 'S02',
    name: 'Research Detail / AI Analysis',
    stage: 'Research',
    theme: 'research',
    title: '02 Research Detail / AI Analysis',
    subtitle: 'วิเคราะห์สองเลนส์ WHAT (สาระ) vs HOW (ลีลา) พร้อมหลักฐานและไทม์โค้ด',
    alias: 'research-detail',
    description: 'ให้ผู้ใช้เข้าใจทั้ง WHAT และ HOW ก่อนตัดสินใจเก็บ'
  },
  S03: {
    id: 'S03',
    code: 'S03',
    name: 'Save to Library (Modal / Gate)',
    stage: 'Save Gate',
    theme: 'save',
    title: '03 Save to Library Modal',
    subtitle: 'Human Save Gate: Founder เลือกเก็บ Content, Packaging หรือ Both พร้อมระบุ WHY',
    alias: 'save',
    description: 'ให้คนเป็นเจ้าของเหตุผลในการเก็บ Reference เข้าสู่ 2 Vaults แยกกัน'
  },
  S04: {
    id: 'S04',
    code: 'S04',
    name: 'Library (2 Vaults: Content & Packaging)',
    stage: 'Ingredients',
    theme: 'ingredients',
    title: '04 Reference Library',
    subtitle: 'คลังวัตถุดิบ 2 คลัง (Content Vault & Packaging Vault) พร้อมระบบค้นหาและตัวกรอง',
    alias: 'library',
    description: 'หาและหยิบ Reference มาใช้ในงานใหม่ได้จริง แยกสาระออกจากวิธีเล่า'
  },
  S05: {
    id: 'S05',
    code: 'S05',
    name: 'Saved Reference Detail',
    stage: 'Ingredients',
    theme: 'ingredients',
    title: '05 Saved Reference Detail',
    subtitle: 'ดูรายละเอียด Reference ที่บันทึกไว้, แก้ไข Founder WHY และจัดการ Lens',
    alias: 'saved-detail',
    description: 'อ่าน “ทำไมตอนนั้นฉันถึง Save” แล้วนำไปใช้ต่อ พร้อมประวัติการแก้ไข'
  },
  S06: {
    id: 'S06',
    code: 'S06',
    name: 'Remix Reference Picker',
    stage: 'Remix',
    theme: 'remix',
    title: '06 Remix Reference Picker',
    subtitle: 'เลือกวัตถุดิบจากทั้ง 2 คลังลงตะกร้า (Content >= 1, Packaging >= 0)',
    alias: 'remix',
    description: 'หยิบวัตถุดิบจากคลังได้หลายชิ้นตามใจผู้ใช้ ไม่จำกัดอัตราส่วน 1:1'
  },
  S07: {
    id: 'S07',
    code: 'S07',
    name: 'Remix Workspace / Synthesis',
    stage: 'Remix',
    theme: 'remix',
    title: '07 Remix Workspace',
    subtitle: 'สตูดิโอรีมิกซ์: ผสมผสานวัตถุดิบ + ทิศทางแบรนด์ สังเคราะห์ Original Concepts 2-3 แบบ',
    alias: 'remix-workspace',
    description: 'สร้างเรื่องใหม่จากการแยก WHAT + HOW อย่างแท้จริง พร้อม Claims & Rights Checker'
  },
  S08: {
    id: 'S08',
    code: 'S08',
    name: 'Concept Detail / Script Draft',
    stage: 'Remix',
    theme: 'remix',
    title: '08 Concept Detail & Script',
    subtitle: 'พัฒนาไอเดียเป็นสคริปต์ฉบับร่าง (Hook, Outline, Scene/Sound, Proof, CTA)',
    alias: 'concept-detail',
    description: 'เปลี่ยน Idea เป็นงานที่จะถ่ายและตัดได้ บันทึกเป็น Remix Draft'
  },
  S09: {
    id: 'S09',
    code: 'S09',
    name: 'Content Board / Handoff',
    stage: 'Approve',
    theme: 'approve',
    title: '09 Content Board & Handoff',
    subtitle: 'บอร์ดติดตามขั้นตอนอนุมัติบท (Draft -> Needs Review -> Approved -> Production)',
    alias: 'board',
    description: 'เก็บเวอร์ชันและจัดขั้นตอนอนุมัติอย่างปลอดภัย พร้อม Director Brief Handoff'
  }
});

/**
 * Screen transition mapping table:
 * Exhaustive mapping of all screen buttons & interactions defined in Spec Section 4.
 * Structure: { from, action, to, buttonLabel, stateChange, description }
 */
export const TRANSITIONS = Object.freeze([
  // ----------------------------------------------------------------------------
  // S00: Overview / Dashboard
  // ----------------------------------------------------------------------------
  {
    from: 'S00',
    action: 'btn-research-a-clip',
    to: 'S01',
    buttonLabel: 'Research a Clip',
    stateChange: 'None',
    description: 'นำทางสู่ทางเข้าวิจัยคลิปต้นฉบับ S01'
  },
  {
    from: 'S00',
    action: 'btn-open-library',
    to: 'S04',
    buttonLabel: 'Open My Library',
    stateChange: 'None',
    description: 'เปิดดูคลังวัตถุดิบ 2 คลัง (Content Vault & Packaging Vault) ใน S04'
  },
  {
    from: 'S00',
    action: 'btn-start-remix',
    to: 'S06',
    buttonLabel: 'Start Remix',
    stateChange: 'None',
    description: 'เริ่มต้นกระบวนการเลือกวัตถุดิบสำหรับรีมิกซ์ใน S06'
  },
  {
    from: 'S00',
    action: 'btn-continue-work',
    to: 'S06',
    buttonLabel: 'Continue work',
    stateChange: 'None (resumes preserved remixSelection)',
    description: 'กลับไปทำงานค้างต่อ โดยรักษารายการที่เลือกไว้ใน store (D10)'
  },
  {
    from: 'S00',
    action: 'btn-view-recent-research',
    to: 'S02',
    buttonLabel: 'View Recent Research',
    stateChange: 'activeSourceId: sets clicked research item context',
    description: 'เปิดหน้ารายละเอียดการวิเคราะห์ของคลิปที่เคยวิเคราะห์ไว้'
  },
  {
    from: 'S00',
    action: 'btn-view-remix-draft',
    to: 'S08',
    buttonLabel: 'View Remix Draft',
    stateChange: 'activeConceptId: sets draft context',
    description: 'เปิดดูบทดราฟต์รีมิกซ์ล่าสุดที่บันทึกไว้ใน S08'
  },
  {
    from: 'S00',
    action: 'nav-research',
    to: 'S01',
    buttonLabel: '01 Research',
    stateChange: 'None',
    description: 'คลิกเมนูหลักเพื่อไปหน้า Research'
  },
  {
    from: 'S00',
    action: 'nav-library',
    to: 'S04',
    buttonLabel: '02 My Library',
    stateChange: 'None',
    description: 'คลิกเมนูหลักเพื่อไปหน้า Library'
  },
  {
    from: 'S00',
    action: 'nav-remix',
    to: 'S06',
    buttonLabel: '03 Remix Studio',
    stateChange: 'None',
    description: 'คลิกเมนูหลักเพื่อไปหน้า Remix'
  },
  {
    from: 'S00',
    action: 'nav-board',
    to: 'S09',
    buttonLabel: '04 Content Board',
    stateChange: 'None',
    description: 'คลิกเมนูหลักเพื่อไปหน้า Content Board'
  },

  // ----------------------------------------------------------------------------
  // S01: Research Entry / Inbox
  // ----------------------------------------------------------------------------
  {
    from: 'S01',
    action: 'btn-analyze-clip',
    to: 'S02',
    buttonLabel: 'Analyze Clip',
    stateChange: 'researchItems: creates research item with status "Waiting for analysis" -> "Analyzing" -> "Analyzed · Not saved"',
    description: 'ส่ง URL เข้าวิเคราะห์และเปิดหน้า Research Detail S02'
  },
  {
    from: 'S01',
    action: 'btn-upload-owned',
    to: 'S02',
    buttonLabel: 'Upload Owned Video',
    stateChange: 'sources: registers owned video; researchItems: creates item',
    description: 'อัปโหลดวิดีโอที่เป็นเจ้าของ/มีสิทธิ์ใช้งาน เข้าวิเคราะห์ใน S02'
  },
  {
    from: 'S01',
    action: 'btn-open-inbox-row',
    to: 'S02',
    buttonLabel: 'Open Inbox Item',
    stateChange: 'activeSourceId: loads selected research inbox item',
    description: 'เปิดดูรายละเอียดและผลวิเคราะห์ของคลิปใน Inbox'
  },
  {
    from: 'S01',
    action: 'btn-back-overview',
    to: 'S00',
    buttonLabel: 'Back to Overview',
    stateChange: 'None',
    description: 'ย้อนกลับไปหน้า Overview Dashboard'
  },

  // ----------------------------------------------------------------------------
  // S02: Research Detail / AI Analysis
  // ----------------------------------------------------------------------------
  {
    from: 'S02',
    action: 'btn-save-to-library',
    to: 'S03',
    buttonLabel: 'Save to Library',
    stateChange: 'None (opens Human Save Gate modal)',
    description: 'เปิดหน้าต่าง Save to Library (S03) ให้มนุษย์เลือกคลังและใส่ WHY'
  },
  {
    from: 'S02',
    action: 'btn-back-to-research',
    to: 'S01',
    buttonLabel: 'Back to Research',
    stateChange: 'None (video NOT saved to Vault, remains in Inbox as Analyzed · Not saved - D1)',
    description: 'ออกจากหน้าวิเคราะห์โดยไม่เซฟ คลิปจะไม่เข้า Vault ตามกฎเหล็กข้อ 1 และ D1'
  },
  {
    from: 'S02',
    action: 'btn-analyze-again',
    to: 'S02',
    buttonLabel: 'Analyze Again',
    stateChange: 'analyses: appends new version (v2, v3) without altering existing savedNotes',
    description: 'ขอให้ AI วิเคราะห์ซ้ำ สร้างเวอร์ชันใหม่โดยไม่ลบหรือทับ Save Note เดิม (T11)'
  },
  {
    from: 'S02',
    action: 'tab-content-what',
    to: 'S02',
    buttonLabel: 'Content (WHAT)',
    stateChange: 'activeTab: "content"',
    description: 'สลับดูแผงวิเคราะห์สาระหลัก / ข้อคิด / ประเด็น'
  },
  {
    from: 'S02',
    action: 'tab-packaging-how',
    to: 'S02',
    buttonLabel: 'Packaging (HOW)',
    stateChange: 'activeTab: "packaging"',
    description: 'สลับดูแผงวิเคราะห์วิธีเล่า / Hook / Pacing / SFX / จังหวะตัดต่อ'
  },

  // ----------------------------------------------------------------------------
  // S03: Save to Library (Modal / Gate)
  // ----------------------------------------------------------------------------
  {
    from: 'S03',
    action: 'btn-confirm-save',
    to: 'S03',
    buttonLabel: 'Confirm Save to Library',
    stateChange: 'savedNotes: creates 1 note per selected lens (content/packaging/both) with Founder WHY; updates source status to Saved',
    description: 'บันทึก Note เข้า Vault ตามเลนส์ที่เลือกพร้อมเหตุผลของมนุษย์ และแสดงหน้าสำเร็จ'
  },
  {
    from: 'S03',
    action: 'btn-cancel-save',
    to: 'S02',
    buttonLabel: 'Cancel',
    stateChange: 'None',
    description: 'ยกเลิกการบันทึก ปิด modal และกลับสู่หน้า S02 โดย store ไม่เปลี่ยนแปลง'
  },
  {
    from: 'S03',
    action: 'btn-view-in-library',
    to: 'S04',
    buttonLabel: 'View in Library',
    stateChange: 'activeVaultTab: set to newly saved lens ("content" or "packaging")',
    description: 'หลังบันทึกสำเร็จ เปิดไปดู Reference ใน Library คลังที่เพิ่งเซฟ'
  },
  {
    from: 'S03',
    action: 'btn-use-in-remix',
    to: 'S06',
    buttonLabel: 'Use in Remix',
    stateChange: 'remixSelection: automatically adds saved note to basket (T14)',
    description: 'หลังบันทึกสำเร็จ นำ Reference นี้ใส่ตะกร้าวัตถุดิบทันทีแล้วไปหน้า Remix S06'
  },
  {
    from: 'S03',
    action: 'btn-edit-existing-note',
    to: 'S05',
    buttonLabel: 'Edit Existing Note',
    stateChange: 'activeNoteId: sets existing note context',
    description: 'กรณีคลิปเคยถูกบันทึกในเลนส์นั้นแล้ว เสนอให้นำทางไปแก้ไข WHY ใน S05'
  },

  // ----------------------------------------------------------------------------
  // S04: Library (2 Vaults: Content & Packaging)
  // ----------------------------------------------------------------------------
  {
    from: 'S04',
    action: 'tab-content-vault',
    to: 'S04',
    buttonLabel: 'Content Vault',
    stateChange: 'activeVault: "content"',
    description: 'สลับไปดูคลังสิ่งที่เขาพูด (WHAT)'
  },
  {
    from: 'S04',
    action: 'tab-packaging-vault',
    to: 'S04',
    buttonLabel: 'Packaging Vault',
    stateChange: 'activeVault: "packaging"',
    description: 'สลับไปดูคลังวิธีที่เขาเล่า (HOW)'
  },
  {
    from: 'S04',
    action: 'btn-vault-card',
    to: 'S05',
    buttonLabel: 'View Saved Reference',
    stateChange: 'activeNoteId: sets selected note context',
    description: 'คลิกการ์ดในคลังเพื่อเปิดดูรายละเอียด Reference ใน S05'
  },
  {
    from: 'S04',
    action: 'btn-use-in-remix',
    to: 'S06',
    buttonLabel: 'Use in Remix',
    stateChange: 'remixSelection: adds reference noteId to content/packaging array',
    description: 'หยิบ Reference จากคลังใส่ตะกร้ารีมิกซ์และเปิดไป S06'
  },
  {
    from: 'S04',
    action: 'btn-start-remix',
    to: 'S06',
    buttonLabel: 'Start Remix with Basket',
    stateChange: 'None (proceeds with current remixSelection)',
    description: 'เปิดสตูดิโอรีมิกซ์ด้วยวัตถุดิบทั้งหมดที่มีในตะกร้าปัจจุบัน'
  },
  {
    from: 'S04',
    action: 'btn-empty-research',
    to: 'S01',
    buttonLabel: 'Research a Clip',
    stateChange: 'None',
    description: 'เมื่อคลังว่างเปล่า คลิกเพื่อไปเริ่มค้นหาคลิปใหม่ใน S01'
  },
  {
    from: 'S04',
    action: 'btn-empty-sample',
    to: 'S04',
    buttonLabel: 'Load Sample References',
    stateChange: 'savedNotes: seeds founder sample references (Story A, B, E)',
    description: 'โหลดตัวอย่างอ้างอิงเพื่อสอนวิธีใช้งานโดยไม่ลบข้อมูลเดิม'
  },
  {
    from: 'S04',
    action: 'btn-back',
    to: 'S00',
    buttonLabel: 'Back to Overview',
    stateChange: 'None',
    description: 'ย้อนกลับไปหน้า Overview Dashboard'
  },

  // ----------------------------------------------------------------------------
  // S05: Saved Reference Detail
  // ----------------------------------------------------------------------------
  {
    from: 'S05',
    action: 'btn-back-to-library',
    to: 'S04',
    buttonLabel: 'Back to Library',
    stateChange: 'None',
    description: 'ย้อนกลับไปหน้าคลังวัตถุดิบ S04'
  },
  {
    from: 'S05',
    action: 'btn-use-in-remix',
    to: 'S06',
    buttonLabel: 'Use in Remix',
    stateChange: 'remixSelection: adds current reference to basket',
    description: 'เพิ่มรายการนี้ลงตะกร้ารีมิกซ์แล้วไปหน้า S06'
  },
  {
    from: 'S05',
    action: 'btn-save-note-edit',
    to: 'S05',
    buttonLabel: 'Save Note Edit',
    stateChange: 'savedNotes: updates WHY and logs edit in note-history; does NOT alter analysis or drafts (A06)',
    description: 'บันทึกการแก้ไข Founder WHY โดยไม่กระทบผลวิเคราะห์หรือดราฟต์ที่ใช้อยู่'
  },
  {
    from: 'S05',
    action: 'btn-remove-from-vault',
    to: 'S04',
    buttonLabel: 'Remove from This Vault',
    stateChange: 'savedNotes: deletes note for current lens only; retains other lens and source (A05/T18)',
    description: 'ลบ Reference ออกจากคลังนี้เฉพาะเลนส์ปัจจุบัน แล้วกลับไปหน้า S04'
  },

  // ----------------------------------------------------------------------------
  // S06: Remix Reference Picker
  // ----------------------------------------------------------------------------
  {
    from: 'S06',
    action: 'btn-continue-to-remix',
    to: 'S07',
    buttonLabel: 'Continue to Remix',
    stateChange: 'remixSession: initializes active remix workspace with chosen ingredients',
    description: 'เมื่อเลือก Content >= 1 (Packaging >= 0) ปลดล็อกปุ่มไปสู่ Remix Workspace S07'
  },
  {
    from: 'S06',
    action: 'btn-back-to-library',
    to: 'S04',
    buttonLabel: 'Back to Library',
    stateChange: 'None (remixSelection strictly preserved in store - D10)',
    description: 'ย้อนกลับไปหน้า Library โดยรายการที่เลือกในตะกร้าไม่สูญหาย'
  },
  {
    from: 'S06',
    action: 'btn-browse-vault',
    to: 'S04',
    buttonLabel: 'Browse Vault for More',
    stateChange: 'None (remixSelection preserved)',
    description: 'เปิดคลังเพื่อค้นหาวัตถุดิบเพิ่มเติม โดยไม่ล้างตะกร้า'
  },
  {
    from: 'S06',
    action: 'btn-discard-selection',
    to: 'S06',
    buttonLabel: 'Discard Selection',
    stateChange: 'remixSelection: resets content and packaging arrays to empty after user confirmation',
    description: 'ล้างรายการในตะกร้าวัตถุดิบทั้งหมดหลังจากผู้ใช้กดยืนยัน'
  },

  // ----------------------------------------------------------------------------
  // S07: Remix Workspace / Synthesis
  // ----------------------------------------------------------------------------
  {
    from: 'S07',
    action: 'btn-back-to-picker',
    to: 'S06',
    buttonLabel: 'Back to Ingredients Picker',
    stateChange: 'None (remixSelection strictly preserved - D10)',
    description: 'ย้อนกลับไปปรับเปลี่ยนวัตถุดิบในตะกร้า โดยข้อมูลที่กรอกไว้ไม่สูญหาย'
  },
  {
    from: 'S07',
    action: 'btn-generate-concepts',
    to: 'S07',
    buttonLabel: 'Create Original Concepts',
    stateChange: 'concepts: generates 2-3 distinct original concepts with source trace, hooks, and story beats',
    description: 'สั่งสังเคราะห์แนวคิดต้นฉบับ 2-3 แบบที่แตกต่างกันจริงตามทิศทางของ Founder'
  },
  {
    from: 'S07',
    action: 'btn-remix-again',
    to: 'S07',
    buttonLabel: 'Remix Again',
    stateChange: 'concepts: regenerates concepts based on updated direction',
    description: 'สั่งรีมิกซ์ซ้ำเพื่อสร้างมุมมองใหม่'
  },
  {
    from: 'S07',
    action: 'btn-refine-angle',
    to: 'S07',
    buttonLabel: 'Refine This Angle',
    stateChange: 'concepts: refines specific concept with instruction without restarting research (A18)',
    description: 'ปรับแต่งเฉพาะแนวคิดที่เลือกโดยไม่ต้องวิจัยใหม่และไม่ลบทับอันเดิม'
  },
  {
    from: 'S07',
    action: 'btn-open-concept-detail',
    to: 'S08',
    buttonLabel: 'Open Concept Script Draft',
    stateChange: 'activeConceptId: sets selected concept for script expansion',
    description: 'เลือก Concept เพื่อนำไปพัฒนาเป็นโครงบทสคริปต์ฉบับเต็มใน S08'
  },
  {
    from: 'S07',
    action: 'btn-save-as-draft',
    to: 'S09',
    buttonLabel: 'Save as Draft to Board',
    stateChange: 'boardItems: appends item with stage "Draft" and provenance snapshots',
    description: 'บันทึกเป็นดราฟต์ลง Content Board ใน S09'
  },

  // ----------------------------------------------------------------------------
  // S08: Concept Detail / Script Draft
  // ----------------------------------------------------------------------------
  {
    from: 'S08',
    action: 'btn-back-to-workspace',
    to: 'S07',
    buttonLabel: 'Back to Remix Workspace',
    stateChange: 'None',
    description: 'ย้อนกลับไปหน้า Remix Workspace S07'
  },
  {
    from: 'S08',
    action: 'btn-apply-edit',
    to: 'S08',
    buttonLabel: 'Apply Edit',
    stateChange: 'concepts/boardItems: updates script text, hooks, scene directions based on natural language instruction',
    description: 'ปรับแก้บทสคริปต์ด้วยคำสั่งภาษาธรรมดาของ Founder'
  },
  {
    from: 'S08',
    action: 'btn-save-remix-draft',
    to: 'S09',
    buttonLabel: 'Save Remix Draft',
    stateChange: 'boardItems: commits draft to board with stage "Draft" and immutable provenance snapshots; does NOT approve or publish',
    description: 'บันทึกดราฟต์บทลง Content Board (S09) โดยยังไม่อนุมัติหรือเรนเดอร์ใดๆ'
  },
  {
    from: 'S08',
    action: 'btn-view-source-trace',
    to: 'S05',
    buttonLabel: 'View Source Reference',
    stateChange: 'activeNoteId: opens provenance reference snapshot',
    description: 'คลิกดูที่มาของวัตถุดิบ (Source Trace) ในหน้า Saved Reference Detail S05'
  },

  // ----------------------------------------------------------------------------
  // S09: Content Board / Handoff
  // ----------------------------------------------------------------------------
  {
    from: 'S09',
    action: 'btn-submit-review',
    to: 'S09',
    buttonLabel: 'Submit for Review',
    stateChange: 'boardItems: transitions item stage from "Draft" to "Needs Review"',
    description: 'ส่งบทจากร่างเข้าสู่ขั้นตอนรอตรวจพิจารณา (Needs Review)'
  },
  {
    from: 'S09',
    action: 'btn-return-to-draft',
    to: 'S09',
    buttonLabel: 'Return to Draft',
    stateChange: 'boardItems: transitions item stage from "Needs Review" back to "Draft"',
    description: 'ส่งบทกลับไปแก้ไขในขั้นตอนดราฟต์'
  },
  {
    from: 'S09',
    action: 'btn-approve-concept',
    to: 'S09',
    buttonLabel: 'Approve Concept',
    stateChange: 'boardItems: stage -> "Approved"; approvedRevisions: appends deep-frozen immutable revision + Director Brief (A20)',
    description: 'Founder อนุมัติบทสร้างเวอร์ชัน immutable revision และ Director Brief โดยไม่ publish อัตโนมัติ'
  },
  {
    from: 'S09',
    action: 'btn-open-concept-draft',
    to: 'S08',
    buttonLabel: 'Open Draft in Script Editor',
    stateChange: 'activeConceptId: sets draft context',
    description: 'คลิกการ์ดบนบอร์ดเพื่อเปิดดูหรือแก้ไขบทใน S08'
  },
  {
    from: 'S09',
    action: 'btn-start-new-remix',
    to: 'S06',
    buttonLabel: 'New Remix',
    stateChange: 'None',
    description: 'เริ่มสร้างงานรีมิกซ์ชิ้นใหม่จากคลัง'
  },
  {
    from: 'S09',
    action: 'btn-export-director-brief',
    to: 'S09',
    buttonLabel: 'Export Director Brief',
    stateChange: 'None (triggers client-side file download JSON/Markdown)',
    description: 'ส่งออกไฟล์บรีฟผู้กำกับพร้อมรายละเอียดแหล่งที่มาและข้อจำกัดสิทธิ์'
  },
  {
    from: 'S09',
    action: 'btn-send-to-mew-edit',
    to: 'S09',
    buttonLabel: 'Send to MEW EDIT',
    stateChange: 'handoff: triggers handoff only when verified; otherwise displays transparent blocked notice (A21)',
    description: 'ส่งต่องานตัดต่อเมื่อ integration ได้รับการยืนยันแล้ว'
  },
  {
    from: 'S09',
    action: 'btn-back-to-remix',
    to: 'S07',
    buttonLabel: 'Back to Remix Workspace',
    stateChange: 'None',
    description: 'ย้อนกลับไปหน้า Remix Workspace'
  }
]);

/**
 * Normalizes input to uppercase canonical Screen ID format (e.g. 's00' -> 'S00').
 * @param {string} id 
 * @returns {string}
 */
export function normalizeScreenId(id) {
  if (!id) return '';
  const trimmed = String(id).trim();
  // Check alias match (e.g. 'overview' -> 'S00')
  const lower = trimmed.toLowerCase();
  for (const key of Object.keys(SCREENS)) {
    if (SCREENS[key].alias.toLowerCase() === lower || key.toLowerCase() === lower) {
      return key;
    }
  }
  return trimmed.toUpperCase();
}

/**
 * Validates whether a screen ID exists in SCREENS.
 * @param {string} screenId 
 * @returns {boolean}
 */
export function isValidScreenId(screenId) {
  const normalized = normalizeScreenId(screenId);
  return Boolean(SCREENS[normalized]);
}

/**
 * Central Router Class
 */
class Router {
  constructor() {
    this.currentScreen = 'S00';
    this.currentParams = {};
    this.historyStack = [{ screenId: 'S00', params: {} }];
    this.listeners = new Set();
    this.SCREENS = SCREENS;
    this.TRANSITIONS = TRANSITIONS;
    this.isInitialized = false;
  }

  /**
   * Initializes browser listeners for hashchange and DOM events.
   */
  init() {
    if (this.isInitialized) return;

    if (typeof window !== 'undefined') {
      // Sync from hash on initial load or popstate
      window.addEventListener('popstate', () => this.syncFromHash());
      window.addEventListener('hashchange', () => this.syncFromHash());

      // Global click handler for data-navigate / data-router-action
      if (typeof document !== 'undefined') {
        document.addEventListener('click', (e) => {
          const actionBtn = e.target.closest('[data-router-action]');
          if (actionBtn) {
            e.preventDefault();
            const action = actionBtn.getAttribute('data-router-action');
            this.trigger(action);
            return;
          }

          const navBtn = e.target.closest('[data-screen-target]');
          if (navBtn) {
            e.preventDefault();
            const target = navBtn.getAttribute('data-screen-target');
            this.go(target);
            return;
          }
        });
      }

      this.syncFromHash();
    }

    this.isInitialized = true;
  }

  /**
   * Primary Navigation Method
   * Supports screen IDs: S00 - S09.
   * Unknown ID displays element with data-testid="screen-not-found" without crashing.
   * 
   * @param {string} screenId - Target screen ID (e.g. 'S00', 'S01', ..., 'S09')
   * @param {object} [params={}] - Route parameters
   * @param {boolean} [replace=false] - If true, replaces current history entry instead of pushing
   * @returns {{ success: boolean, screenId: string, params: object, error?: string }}
   */
  go(screenId, params = {}, replace = false) {
    const normalizedId = normalizeScreenId(screenId);

    // 1. Check if screen exists in SCREENS registry
    if (!SCREENS[normalizedId]) {
      console.warn(`[Router] Screen "${screenId}" (normalized: "${normalizedId}") not found. Rendering fallback without crashing.`);
      
      // Render fallback DOM element with data-testid="screen-not-found"
      this.renderScreenNotFound(screenId);

      // Notify listeners of the not-found condition
      this.notifyListeners(normalizedId, params, { notFound: true, requestedId: screenId });

      return {
        success: false,
        screenId: normalizedId,
        params,
        error: 'SCREEN_NOT_FOUND',
        requestedId: screenId
      };
    }

    // 2. Remove any previous screen-not-found fallback element
    this.removeScreenNotFound();

    // 3. Update router history
    if (replace) {
      if (this.historyStack.length > 0) {
        this.historyStack[this.historyStack.length - 1] = { screenId: normalizedId, params: { ...params } };
      } else {
        this.historyStack.push({ screenId: normalizedId, params: { ...params } });
      }
    } else {
      // Don't push identical consecutive entries
      const last = this.historyStack[this.historyStack.length - 1];
      if (!last || last.screenId !== normalizedId || JSON.stringify(last.params) !== JSON.stringify(params)) {
        this.historyStack.push({ screenId: normalizedId, params: { ...params } });
      }
    }

    this.currentScreen = normalizedId;
    this.currentParams = { ...params };

    // 4. Update DOM & URL if in browser
    this.updateDom(normalizedId, params);

    // 5. Notify all subscribers (Store selection remains completely untouched)
    this.notifyListeners(normalizedId, params);

    return {
      success: true,
      screenId: normalizedId,
      params: this.currentParams
    };
  }

  /**
   * Back Navigation
   * Returns to previous screen in history stack.
   * CRITICAL GUARANTEE (D10): Selection in store remains intact and preserved.
   * 
   * @returns {{ success: boolean, screenId: string, params: object }}
   */
  back() {
    if (this.historyStack.length > 1) {
      // Pop current screen
      this.historyStack.pop();
      const previous = this.historyStack[this.historyStack.length - 1];
      
      // Navigate to previous screen without pushing new history entry
      return this.go(previous.screenId, previous.params, true);
    }

    // Fallback: stay on current screen or go to S00 if stack has 1 or fewer entries
    if (this.currentScreen !== 'S00') {
      return this.go('S00', {}, true);
    }

    return {
      success: true,
      screenId: this.currentScreen,
      params: this.currentParams
    };
  }

  /**
   * Triggers a transition based on current screen and action button name.
   * @param {string} action - Action identifier (e.g. 'btn-research-a-clip')
   * @param {object} [extraParams={}] - Optional parameters
   * @returns {{ success: boolean, screenId: string, params: object }}
   */
  trigger(action, extraParams = {}) {
    const transition = this.findTransition(this.currentScreen, action);
    if (transition) {
      return this.go(transition.to, { ...extraParams, triggerAction: action });
    }
    console.warn(`[Router] No defined transition from "${this.currentScreen}" for action "${action}".`);
    return {
      success: false,
      screenId: this.currentScreen,
      params: this.currentParams,
      error: 'NO_MATCHING_TRANSITION'
    };
  }

  /**
   * Finds matching transition in TRANSITIONS table.
   * @param {string} from - Source screen ID
   * @param {string} action - Action identifier
   * @returns {object|undefined}
   */
  findTransition(from, action) {
    const normFrom = normalizeScreenId(from);
    return TRANSITIONS.find(t => t.from === normFrom && t.action === action);
  }

  /**
   * Renders the unknown screen element with data-testid="screen-not-found".
   * Guaranteed not to crash whether in browser DOM or simulated test environment.
   * @param {string} unknownId 
   */
  renderScreenNotFound(unknownId) {
    if (typeof document === 'undefined') return;

    // Find screen outlet container or document body
    const outlet = document.querySelector('[data-testid="screen-outlet"]') ||
                   document.getElementById('screen-outlet') ||
                   document.body;

    if (!outlet) return;

    // Hide other screens
    const screens = outlet.querySelectorAll('.screen-view, [data-screen], [data-screen-id]');
    screens.forEach(s => {
      s.classList.remove('is-active');
      s.style.display = 'none';
    });

    // Check if not-found element already exists
    let notFoundEl = document.querySelector('[data-testid="screen-not-found"]');
    if (!notFoundEl) {
      notFoundEl = document.createElement('div');
      notFoundEl.setAttribute('data-testid', 'screen-not-found');
      notFoundEl.className = 'mew-screen-not-found mew-offer-card';
      notFoundEl.style.cssText = 'padding: 48px 24px; text-align: center; margin: 32px auto; max-width: 600px; border: 1px solid var(--stone-line, #e7e3de); background: #ffffff; border-radius: 12px;';
      outlet.appendChild(notFoundEl);
    }

    notFoundEl.style.display = 'block';
    notFoundEl.innerHTML = `
      <div style="width: 44px; height: 44px; border-radius: 50%; background: #fee2e2; color: #dc2626; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-weight: bold; font-size: 20px;">!</div>
      <h2 style="font-family: 'Prompt', sans-serif; font-size: 20px; font-weight: 700; color: #11110f; margin-bottom: 8px;">ไม่พบหน้าที่ต้องการ (Screen Not Found)</h2>
      <p style="color: #6b6762; font-size: 14px; margin-bottom: 24px; line-height: 1.6;">
        รหัสหน้าจอ <code style="background: #f4f2ee; padding: 2px 6px; border-radius: 4px; font-weight: 600; color: #ae4f3a;">${unknownId}</code> ไม่อยู่ในสารบบของ MEW Content OS (รองรับ S00–S09)
      </p>
      <button type="button" class="btn-pill btn-primary" onclick="window.router?.go('S00')" style="background: #11110f; color: #ffffff; border: none; padding: 10px 24px; border-radius: 9999px; font-size: 14px; font-weight: 600; cursor: pointer;">
        กลับสู่ Overview Dashboard (S00)
      </button>
    `;
  }

  /**
   * Removes screen-not-found DOM element if present.
   */
  removeScreenNotFound() {
    if (typeof document === 'undefined') return;
    const notFoundEl = document.querySelector('[data-testid="screen-not-found"]');
    if (notFoundEl) {
      notFoundEl.style.display = 'none';
      if (notFoundEl.parentNode) {
        notFoundEl.parentNode.removeChild(notFoundEl);
      }
    }
  }

  /**
   * Updates DOM screens, context bar, and URL hash.
   * @param {string} screenId 
   * @param {object} params 
   */
  updateDom(screenId, params) {
    if (typeof document === 'undefined') return;

    const screenConfig = SCREENS[screenId];
    if (!screenConfig) return;

    // 1. Update active screen view in outlet
    const outlet = document.querySelector('[data-testid="screen-outlet"]') || document.getElementById('screen-outlet');
    if (outlet) {
      outlet.setAttribute('data-active-screen', screenId);

      const allScreens = outlet.querySelectorAll('.screen-view, [data-screen], [data-screen-id]');
      allScreens.forEach(sec => {
        const secId = (sec.getAttribute('data-screen-id') || sec.getAttribute('data-screen') || sec.id.replace(/^screen-/, '')).toUpperCase();
        const aliasMatch = screenConfig.alias && sec.id === `screen-${screenConfig.alias}`;
        
        if (secId === screenId || aliasMatch) {
          sec.classList.add('is-active');
          sec.removeAttribute('hidden');
          sec.style.display = 'block';
        } else {
          sec.classList.remove('is-active');
          sec.setAttribute('hidden', 'true');
          sec.style.display = 'none';
        }
      });
    }

    // 2. Update Context Bar Stage
    const stageDisplays = document.querySelectorAll('[data-testid="stage-name"], #stage-name');
    stageDisplays.forEach(el => {
      el.textContent = screenConfig.stage;
    });

    const stageBadges = document.querySelectorAll('[data-testid="current-stage-badge"], #current-stage-badge');
    stageBadges.forEach(el => {
      el.setAttribute('data-stage-theme', screenConfig.theme);
    });

    const subtextEl = document.getElementById('stage-subtext');
    if (subtextEl) {
      subtextEl.textContent = screenConfig.subtitle;
    }

    // 3. Update Navigation Tree active state
    const navItems = document.querySelectorAll('[data-testid="nav-root"] button, [data-testid="nav-root"] a, .nav-tree-item');
    navItems.forEach(item => {
      const target = item.getAttribute('data-target') || item.getAttribute('data-screen-target') || '';
      const testId = item.getAttribute('data-testid') || '';
      const isMatch = target.toUpperCase() === screenId ||
                      target.toLowerCase() === screenConfig.alias ||
                      testId === `nav-${screenConfig.alias}`;

      if (isMatch) {
        item.classList.add('is-active', 'active');
        item.setAttribute('aria-current', 'page');
      } else {
        item.classList.remove('is-active', 'active');
        item.removeAttribute('aria-current');
      }
    });

    // 4. Update browser URL hash cleanly without page jump
    if (typeof window !== 'undefined' && window.location) {
      const currentHash = (window.location.hash || '').replace('#', '');
      if (currentHash !== screenId && currentHash !== screenConfig.alias) {
        window.history.pushState(null, '', `#${screenId}`);
      }
    }

    // 5. Scroll to top smoothly
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Synchronizes active route from window.location.hash.
   */
  syncFromHash() {
    if (typeof window === 'undefined') return;
    const hash = (window.location.hash || '').replace('#', '').trim();
    if (!hash) {
      this.go('S00', {}, true);
      return;
    }
    const normalized = normalizeScreenId(hash);
    if (SCREENS[normalized]) {
      this.go(normalized, {}, true);
    } else {
      this.go(hash, {}, true);
    }
  }

  /**
   * Subscribes a callback to route change events.
   * @param {function(string, object, object?): void} fn 
   * @returns {function(): void} Unsubscribe function
   */
  subscribe(fn) {
    if (typeof fn !== 'function') return () => {};
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  /**
   * Notifies all subscribers of a route change.
   * @param {string} screenId 
   * @param {object} params 
   * @param {object} [meta={}] 
   */
  notifyListeners(screenId, params, meta = {}) {
    // Confirm store selection is preserved (D10 safety assertion)
    const currentStore = getState ? getState() : null;
    const preservedSelection = currentStore ? currentStore.remixSelection : null;

    this.listeners.forEach(fn => {
      try {
        fn(screenId, params, { ...meta, preservedSelection });
      } catch (err) {
        console.error('[Router] Error in route change listener:', err);
      }
    });

    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('mew:route-change', {
        detail: { screenId, params, meta, preservedSelection, timestamp: Date.now() }
      }));
    }
  }

  /**
   * Returns the current screen ID.
   * @returns {string}
   */
  getCurrentScreen() {
    return this.currentScreen;
  }

  /**
   * Returns the current params object.
   * @returns {object}
   */
  getCurrentParams() {
    return { ...this.currentParams };
  }

  /**
   * Returns a copy of the router history stack.
   * @returns {Array<{screenId: string, params: object}>}
   */
  getHistory() {
    return this.historyStack.map(h => ({ ...h, params: { ...h.params } }));
  }

  /**
   * Resets router state to default S00 (useful in unit testing).
   */
  reset() {
    this.currentScreen = 'S00';
    this.currentParams = {};
    this.historyStack = [{ screenId: 'S00', params: {} }];
    this.removeScreenNotFound();
  }
}

// Singleton Router instance
export const router = new Router();

// Named exports for ease of import
export const go = (screenId, params) => router.go(screenId, params);
export const back = () => router.back();
export const trigger = (action, params) => router.trigger(action, params);
export const getCurrentScreen = () => router.getCurrentScreen();
export const getCurrentParams = () => router.getCurrentParams();
export const subscribe = (fn) => router.subscribe(fn);

// Attach globally for browser / window console access
if (typeof window !== 'undefined') {
  window.router = router;
  window.AppRouter = router;
  const existingSwitchView = typeof window.switchView === 'function' ? window.switchView : null;
  window.switchView = (target) => {
    if (existingSwitchView) {
      existingSwitchView(target);
    }
    return router.go(target);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => router.init());
  } else {
    router.init();
  }
}
