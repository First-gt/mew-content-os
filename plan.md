# PLAN: MEW Content OS — Research → Save → Remix (Clickable Prototype)

**แหล่งความจริง:** `MEW_Content_OS_Founder_UX_Spec_TH.md` + `MEW_Content_OS_Master_Flow.png`
**สถานะสเปก:** Founder intent ไม่ใช่หลักฐานว่า production ทำงานแล้ว — ห้ามสมมติว่า backend/AI/integration จริงมีอยู่ ถ้าไม่ได้ตรวจ

## กฎเหล็ก (ห้ามตีความใหม่ ถ้าขัดให้หยุดถามผู้ใช้)

1. Analyze ≠ Save — AI ห้าม save เข้า Vault เอง; คลิปที่ analyze แล้วไม่ save ต้องไม่เข้า Vault
2. มี 2 คลังแยกกัน: Content Vault (WHAT) / Packaging Vault (HOW) — ห้ามรวมเป็นคลังเดียว
3. Save ได้ Content / Packaging / Both — ทุกคลังที่เลือกต้องมี WHY ของมนุษย์ (Both = WHY แยก 2 ช่อง)
4. 1 คลิป = 1 Source (canonical) มี note แยกตาม lens; lens หนึ่งห้ามทับอีก lens
5. Remix: Content ≥ 1, Packaging ≥ 0, ไม่จำกัดจำนวน; ห้ามสุ่มเลือก reference แทนมนุษย์
6. Output Remix = แนวคิดต้นฉบับ 2–3 แบบ + source trace ไม่ใช่การเอาวิดีโอเดิมมาต่อกัน
7. Save Research ≠ Save Draft ≠ Approve ≠ Publish ≠ Render
8. ห้ามสร้าง Editor/Worker/Subsystem คู่ขนาน; ห้ามแก้ source บน Acer; ห้ามเปลี่ยน source writer
9. ห้ามใช้ฟุตเทจ/เสียง/เพลง/ตัวเลขของคนอื่นโดยไม่มีสิทธิ์หรือที่มา
10. UX copy ใช้ตามสเปกข้อ 7 เท่านั้น (ดู Topic T32)

## ข้อตกลงการเขียนโค้ด (ใช้กับทุกหัวข้อ)

- ทุกองค์ประกอบที่ต้องตรวจ ต้องมี `data-testid="..."` ตามที่ DOD ระบุ
- State กลางอยู่ที่ `src/modules/store.js` เท่านั้น (ห้ามเก็บ state ซ้ำในหลายไฟล์)
- เปลี่ยนหน้าด้วย `router.go(screenId, params)` จาก `src/modules/router.js` เท่านั้น
- ข้อความ UI ทั้งหมดดึงจาก `src/modules/copy.js` (ห้าม hardcode ในไฟล์อื่น)
- ลำดับทำ: ไล่ตาม Topic ID จากน้อยไปมาก; Topic ที่ขึ้นกับตัวอื่นระบุใน DOD ข้อ "Depends on"

---

- [x] **Topic 0: ตรวจของเดิม (Audit เทียบสเปกกับของจริง)**
  - **DOD**:
    - อ่านสเปก + Master Flow ครบ และอ่านอ้างอิง Notion 3 ลิงก์ในสเปกข้อ 12 (ถ้าเข้าถึงได้)
    - สำรวจโปรเจกต์ปัจจุบัน (ไม่ใช่ Acer) หา Reference Vault, Content Board, Scan Feed/RADAR, Business/Brand Brain, ตัวเชื่อม MEW EDIT — **อ่านอย่างเดียว ห้ามแก้โค้ด**
    - สร้าง `docs/audit.md` เป็นตารางคอลัมน์: `ส่วนประกอบ | มีแล้ว/มีบางส่วน/ไม่มี/ตรวจไม่ได้ | หลักฐาน (path/ลิงก์) | แผน reuse`
    - ทุกแถวที่เข้าถึงไม่ได้ต้องระบุ `ตรวจไม่ได้` ห้ามเดา
    - ส่งให้ผู้ใช้ตรวจก่อนเริ่ม T01 เป็นต้นไป
  - **Target Files**: docs/audit.md
  - **Status**: ✅ COMPLETED

---

- [x] **Topic 1: App Shell + Navigation Tree (โครงหน้า 00–04)**
  - **DOD**:
    - HTML: `<nav data-testid="nav-root">` มี 5 รายการ: `nav-overview`, `nav-research`, `nav-library`, `nav-remix`, `nav-board` เรียงตามสเปกข้อ 3
    - HTML: มี `<main data-testid="screen-outlet">` เป็นที่แสดงหน้า และ `<header data-testid="context-bar">` แสดงชื่อ stage ปัจจุบัน (Research / Save / Ingredients / Remix / Approve)
    - CSS: รายการเมนูที่ active มี class `is-active` และมีสีต่างจากปกติ; `context-bar` มองเห็นตลอด (sticky)
    - JS: คลิกเมนูแล้ว `screen-outlet` เปลี่ยนเนื้อหาโดยไม่ reload หน้า; `context-bar` เปลี่ยนข้อความตามหน้า
    - Founder ชี้หน้าจอใดก็ต้องรู้ stage จาก `context-bar` โดยไม่ต้องอ่านเนื้อหาหน้า
  - **Target Files**: src/components/app-shell.html, src/styles/app-shell.css, src/modules/app-shell.js
  - **Status**: ✅ COMPLETED

---

- [x] **Topic 2: Central Store + Sample Data (Story A–E)**
  - **DOD**:
    - JS: `store.js` export `getState()`, `dispatch(action)`, `subscribe(fn)` และ persist ลง `localStorage` key `mew-content-os-v1` (try/catch เมื่อ storage ใช้ไม่ได้ ให้ fallback in-memory)
    - JS: state shape ประกอบด้วย `sources[]`, `analyses[]` (version), `researchItems[]`, `savedNotes[]` (`{id, sourceId, lens:'content'|'packaging', why, tags, createdAt}`), `remixSelection{content[],packaging[]}`, `concepts[]`, `boardItems[]`, `approvedRevisions[]`
    - JS: `seed()` โหลด sample ตามสเปกข้อ 6: Source A "Post and forget it" (Content-only), Source B "The Ticking Clock" (Packaging-only), Source E (Both), และ C1–C3 / P1–P2 พร้อม WHY ภาษาไทยจากสเปก
    - JS: มีปุ่ม/ฟังก์ชัน `resetDemo()` คืนค่า sample เริ่มต้น
    - ไม่มี HTML/CSS ในหัวข้อนี้ (module ล้วน) — ทดสอบด้วย unit test `store.test.js`: dispatch แล้ว subscriber ถูกเรียก 1 ครั้งต่อ action และ reload แล้ว state ยังอยู่
  - **Target Files**: src/modules/store.js, src/modules/sample-data.js, src/modules/store.test.js
  - **Status**: ✅ COMPLETED

---

- [x] **Topic 3: Router + Transition Matrix**
  - **DOD**:
    - JS: `router.go(screenId, params)` รองรับ screen ID: `S00`–`S09`; ID ที่ไม่รู้จักแสดง `data-testid="screen-not-found"` ไม่ crash
    - JS: `router.back()` กลับหน้าก่อนหน้าโดย selection ใน store ไม่หาย (D10)
    - JS: ตาราง `TRANSITIONS` ใน `router.js` ระบุ `{from, action, to}` ครบทุกปุ่มที่สเปกข้อ 4 กำหนด (Research→S01, Vault→S04, Remix→S06, Save Modal → View in Library/Use in Remix ฯลฯ)
    - เอกสาร `docs/transition-matrix.md` สร้างจาก `TRANSITIONS` ด้วยสคริปต์ `node scripts/gen-matrix.js` (หน้า × ปุ่ม → ไปไหน/state อะไรเปลี่ยน)
    - ไม่มี HTML/CSS ในหัวข้อนี้ — ทดสอบ: ทุกแถวของ `TRANSITIONS` ชี้ไป screen ที่มีอยู่จริง
  - **Target Files**: src/modules/router.js, scripts/gen-matrix.js, docs/transition-matrix.md
  - **Status**: ✅ COMPLETED

---

- [x] **Topic 4: S00 Overview / Dashboard**
  - **DOD**:
    - HTML: ปุ่มหลัก 3 ปุ่ม `btn-research-a-clip`, `btn-open-library`, `btn-start-remix` ตามชื่อใน copy.js
    - HTML: การ์ด `recent-research`, `vault-summary` (แสดงจำนวน Saved Content และ Saved Packaging แยกกัน), `remix-drafts`, `continue-work`
    - CSS: จัดเป็น 4 การ์ดไม่ยัดกราฟยอดวิว/Generator/Timeline ลงหน้าเดียว
    - JS: ตัวเลขใน `vault-summary` มาจาก `savedNotes` ใน store และอัปเดตทันทีหลัง Save
    - JS: `btn-research-a-clip` → S01, `btn-open-library` → S04, `btn-start-remix` → S06, `continue-work` กลับไป state เดิมที่ค้าง
  - **Target Files**: src/components/dashboard.html, src/styles/dashboard.css, src/modules/dashboard.js
  - **Status**: ✅ COMPLETED

---

- [x] **Topic 5: S01 Research Entry (วาง URL / Upload / Scan Feed)**
  - **DOD**:
    - HTML: ช่อง `input-url` + ปุ่ม `btn-analyze-clip`; ปุ่ม `btn-upload-owned` พร้อมข้อความ "Upload a video you own / have permission to use"; แท็บ `tab-scan-feed`
    - HTML: `tab-scan-feed` แสดง `scan-feed-unavailable` พร้อมข้อความตรง ๆ ว่ายังไม่มี adapter ที่ใช้งานได้ (ห้ามทำเหมือนทำงานจริง) จนกว่า flag `scanFeedEnabled` เป็น true
    - CSS: ทั้ง 3 ทางเข้าอยู่ในกลุ่มเดียวกัน อ่านออกว่าเป็นทางเข้าเดียวกันสู่ S02
    - JS: URL ว่าง/รูปแบบผิด → แสดง `error-url-invalid` ไม่เรียก analyze
    - JS: กด `btn-analyze-clip` ด้วย URL ถูกต้อง → สร้าง researchItem สถานะ `Waiting for analysis` แล้วไป S02
  - **Target Files**: src/components/research-entry.html, src/styles/research-entry.css, src/modules/research-entry.js
  - **Status**: ✅ COMPLETED

---

- [x] **Topic 6: Research Inbox + Status Badges**
  - **DOD**:
    - HTML: รายการ `inbox-list` แต่ละแถว `inbox-row-{id}` มี badge `status-badge`
    - JS: รองรับ 7 สถานะตรงตามสเปก: `Waiting for analysis`, `Analyzing`, `Analyzed · Not saved`, `Saved to Content`, `Saved to Packaging`, `Saved to Both`, `Analysis unavailable`
    - JS: สถานะ Saved คำนวณจาก `savedNotes` ของ source นั้น (ไม่เก็บซ้ำ) — Save Content อย่างเดียว = `Saved to Content`; เพิ่ม Packaging ภายหลัง = `Saved to Both` (A05)
    - CSS: แต่ละสถานะมีสี/ไอคอนต่างกัน และ `Analyzed · Not saved` ต้องไม่ดูเหมือนอยู่ใน Library
    - ข้อความบนหน้าบอกชัดว่า Inbox ไม่ใช่ Vault; นับ Inbox ไม่รวมในตัวเลข Vault ที่ Dashboard (A01, A07)
  - **Target Files**: src/components/research-inbox.html, src/styles/research-inbox.css, src/modules/research-inbox.js
  - **Status**: ✅ COMPLETED

---

- [x] **Topic 7: URL Dedupe + Unavailable/Partial Media States**
  - **DOD**:
    - JS: `normalizeUrl(url)` ตัด tracking param/fragment; วาง URL ซ้ำ → เปิด source เดิม ไม่สร้าง source ใหม่ (A16) และแสดง `banner-duplicate-source`
    - JS: ถ้า analyze ใหม่ของ source เดิม → สร้าง analysis version ใหม่ ไม่ลบ version เก่า
    - HTML: `state-unavailable` (เข้าถึงสื่อไม่ได้) และ `state-partial` (ได้ข้อมูลบางส่วน) พร้อมปุ่ม `btn-request-transcript` ขอไฟล์/Transcript ที่มีสิทธิ์
    - JS: เมื่อ unavailable ห้ามแสดงผลวิเคราะห์ภาพ/เสียงปลอม — แท็บ Packaging แสดงข้อความ "วิเคราะห์ไม่ได้" และสถานะเป็น `Analysis unavailable` (A15)
    - CSS: state-unavailable/partial แยกสีออกจากสถานะปกติอย่างชัดเจน
  - **Target Files**: src/components/research-states.html, src/styles/research-states.css, src/modules/url-dedupe.js
  - **Status**: ✅ COMPLETED

---

- [x] **Topic 8: S02 Research Detail — Layout (Player + Tabs)**
  - **DOD**:
    - HTML: ซ้าย `video-player` + `source-meta` (creator, ลิงก์ต้นฉบับ `link-original`, เวลา); ขวา `analysis-panel` มี 2 แท็บ `tab-content-what` และ `tab-packaging-how`
    - HTML: ด้านล่างมี `btn-save-to-library` และ badge `status-badge` (เริ่มต้น `Analyzed · Not saved`)
    - CSS: wireframe 1 ในสเปกข้อ 8 — สองคอลัมน์บนเดสก์ท็อป ซ้อนเป็นคอลัมน์เดียวบนมือถือ
    - JS: สลับแท็บไม่ reload ไม่ทำให้ analysis หาย; ปุ่ม Back กลับ S01 โดยไม่ทำให้ source เข้า Vault (D1)
    - JS: ปุ่ม `btn-save-to-library` เปิด Save Modal (T12) เท่านั้น ไม่ save เอง
  - **Target Files**: src/components/research-detail.html, src/styles/research-detail.css, src/modules/research-detail.js
  - **Status**: ✅ COMPLETED

---

- [x] **Topic 9: Content Analysis Panel (WHAT)**
  - **DOD**:
    - HTML: sections `ca-core-idea`, `ca-audience`, `ca-key-points`, `ca-claims-evidence`, `ca-examples`, `ca-extendable-angles`, `ca-what-is-good` (คำถาม "อะไรดี?")
    - JS: render จาก `analysis.content` ใน store; field ที่ว่างแสดง "ไม่ทราบ" ไม่ซ่อนทั้ง section
    - JS: ถ้าไม่มี timestamp → ซ่อน timecode / แสดง "ไม่ทราบเวลา" ห้ามแต่งเลขเวลา
    - CSS: Claims & Evidence แยกชัดระหว่าง "มีหลักฐาน" กับ "ไม่มีหลักฐาน" (badge `evidence-missing`)
    - ไม่มีปุ่ม Save อัตโนมัติ และไม่มีคะแนน AI บังคับให้ผู้ใช้เลือก (ผู้ใช้ Save เฉพาะ Content แม้ AI ชอบ Packaging ได้)
  - **Target Files**: src/components/content-analysis.html, src/styles/content-analysis.css, src/modules/content-analysis.js
  - **Status**: ✅ COMPLETED

---

- [x] **Topic 10: Packaging Analysis Panel (HOW)**
  - **DOD**:
    - HTML: sections `pa-hook`, `pa-opening-pattern`, `pa-narrative-beats`, `pa-pacing`, `pa-music-sfx`, `pa-editing-mechanics`, `pa-tension-emotion`, `pa-timestamp-highlights`, `pa-what-is-good` (คำถาม "เล่าได้ดีอย่างไร?")
    - JS: คลิก timestamp highlight แล้ว `video-player` seek ไปเวลานั้น (ถ้ามี player จริงหรือ mock ที่รองรับ)
    - JS: ข้อสังเกตจาก metrics (ยอดวิวสูง) แสดงเป็น "ข้อสังเกต" และมีข้อความ `pa-no-causation-note` ห้ามฟันธงว่า Hook/เสียงเป็นสาเหตุไวรัล (A22)
    - JS: เมื่อ source เป็น `Analysis unavailable` แท็บนี้แสดงเฉพาะ state-unavailable (T07)
    - CSS: ใช้โทนสีต่างจากแท็บ Content ให้แยกสองคลังออกด้วยสายตา (ใช้โทนเดียวกันกับ Vault ใน T15)
  - **Target Files**: src/components/packaging-analysis.html, src/styles/packaging-analysis.css, src/modules/packaging-analysis.js
  - **Status**: ✅ COMPLETED

---

- [x] **Topic 11: Analyze Again (Versioning ไม่ทับ Save Note)**
  - **DOD**:
    - HTML: ปุ่ม `btn-analyze-again` และตัวเลือก `select-analysis-version`
    - JS: กด analyze ซ้ำ → เพิ่ม `analyses[]` version ใหม่ (`v2`, `v3`…) ตั้งเป็น current; version เก่ายังดูได้
    - JS: **ห้าม** แก้/ลบ `savedNotes` ใด ๆ ของ source เดียวกัน — test: save → analyze again → savedNotes จำนวนและ `why` เท่าเดิม
    - CSS: version ปัจจุบันมี badge `current`
    - SavedNote เก็บ `analysisVersionId` ที่ใช้ตอน save เพื่อแสดง snapshot ใน S05
  - **Target Files**: src/components/analysis-versions.html, src/styles/analysis-versions.css, src/modules/analysis-versions.js
  - **Status**: ⏳ PENDING

---

- [x] **Topic 12: S03 Save Modal — UI Chooser**
  - **DOD**:
    - HTML: modal `save-modal` หัวข้อ "Save this reference"; checkbox `chk-save-content`, `chk-save-packaging`; ช่อง `why-content` และ `why-packaging` (textarea) ซ่อนจนกว่าจะติ๊กคลังนั้น
    - HTML: ช่อง optional `tags`, `timestamp`, `label`, `collection`; ปุ่ม `btn-confirm-save` และ `btn-cancel-save`
    - CSS: wireframe 2 ในสเปกข้อ 8; ติ๊กทั้งสองแล้วมี textarea 2 ช่องแยกกันชัดเจน (ไม่ใช่ช่องกลางช่องเดียว)
    - JS: ติ๊ก/เลิกติ๊กแสดง/ซ่อน textarea ถูกคลัง และไม่ล้างข้อความที่พิมพ์ไว้เมื่อซ่อนแล้วเปิดใหม่
    - JS: `btn-cancel-save` ปิด modal โดยไม่เปลี่ยน store; ปิดด้วย Esc ได้และ focus กลับที่ `btn-save-to-library`
  - **Target Files**: src/components/save-modal.html, src/styles/save-modal.css, src/modules/save-modal.js
  - **Status**: ✅ COMPLETED

---

- [x] **Topic 13: Save Validation + Commit Logic**
  - **DOD**:
    - JS: `validateSave({lenses, whyContent, whyPackaging})` คืน error ดังนี้ — ไม่เลือกคลัง → `err-no-lens`; ติ๊ก Content แต่ WHY ว่าง/เว้นวรรคล้วน → `err-why-content`; ติ๊ก Packaging แต่ WHY ว่าง → `err-why-packaging`
    - JS: Both ที่ขาด WHY อย่างใดอย่างหนึ่งต้อง block การบันทึก และแสดง error ที่ช่องนั้นเท่านั้น
    - JS: commit สร้าง `savedNote` 1 รายการต่อ lens ที่เลือก ผูก `sourceId` เดียวกัน; **ไม่** คัดลอก source/วิดีโอ
    - JS: ถ้าเกิด error ระหว่างบันทึก → `err-save-failed` และ store ไม่เปลี่ยน (atomic: ทั้งสอง lens สำเร็จหรือไม่สำเร็จทั้งคู่)
    - test: D2 (Content-only → ไม่มี packaging note), D3 (Packaging-only → ไม่มี content note), D4 (Both → 2 notes, 1 source)
  - **Target Files**: src/components/save-validation.html, src/styles/save-validation.css, src/modules/save-commit.js
  - **Status**: ✅ COMPLETED

---

- [x] **Topic 14: Save Success State + Re-save / Add Lens ภายหลัง**
  - **DOD**:
    - HTML: หลังบันทึกแสดง `save-success` ข้อความ `Saved to Content` / `Saved to Packaging` / `Saved to Both` ตามจริง พร้อมปุ่ม `btn-view-in-library` และ `btn-use-in-remix`
    - JS: `btn-view-in-library` ไป S04 แท็บคลังที่เพิ่งเซฟ; `btn-use-in-remix` ไป S06 พร้อมใส่ reference นั้นลงตะกร้าอัตโนมัติ (ผู้ใช้ลบออกได้)
    - JS: เปิด Save Modal กับ source ที่เคย save Content แล้ว → ติ๊ก Content ถูก disable พร้อมข้อความ "เก็บไว้แล้ว" และเพิ่ม Packaging ได้โดย note Content เดิมไม่เปลี่ยน (A05)
    - JS: duplicate save lens เดิมต้องไม่สร้าง note ซ้ำ — เสนอไปแก้ WHY แทน (ลิงก์ไป S05)
    - CSS: ไอคอนยืนยันสำเร็จ + สีแยกตามคลัง
  - **Target Files**: src/components/save-success.html, src/styles/save-success.css, src/modules/save-success.js
  - **Status**: ✅ COMPLETED

---

- [x] **Topic 15: S04 Library — โครงสองคลัง (2 Tabs)**
  - **DOD**:
    - HTML: หน้าเดียวมีแท็บ `tab-content-vault` และ `tab-packaging-vault`; แต่ละแท็บมี `vault-count`
    - JS: แท็บ Content แสดงเฉพาะ `savedNotes` ที่ `lens='content'`; Packaging เฉพาะ `lens='packaging'` (D2/D3: คลิปที่เก็บคลังเดียวไม่ปรากฏอีกคลัง)
    - JS: source ที่เป็น Both ปรากฏทั้งสองแท็บ ด้วย `sourceId` เดียวกัน และแต่ละการ์ดแสดง note ของ lens นั้นเท่านั้น
    - CSS: สองแท็บใช้สีประจำคลังคงที่ (Content / Packaging) ตลอดทั้งแอป
    - คลิปที่ยังเป็น `Analyzed · Not saved` ห้ามแสดงในหน้านี้
  - **Target Files**: src/components/library.html, src/styles/library.css, src/modules/library.js
  - **Status**: ✅ COMPLETED

---

- [x] **Topic 16: Library Cards + Search/Filters**
  - **DOD**:
    - HTML: การ์ด `vault-card-{noteId}` ประกอบด้วย thumbnail, creator, topic/tags, `founder-why`, `ai-insight` (สั้น), `link-source`, saved date, ปุ่ม `btn-use-in-remix`
    - HTML: ช่องค้นหา `search-vault` และตัวกรอง `filter-topic`, `filter-creator`, `filter-tags`, `filter-saved-date`; แท็บ Packaging มีเพิ่ม `filter-hook-type`, `filter-structure`, `filter-sound-pacing`
    - JS: ค้นหา/กรองทำงานเฉพาะภายในแท็บปัจจุบัน; มีปุ่ม `btn-clear-filters`
    - JS: `btn-use-in-remix` เพิ่ม reference ลง `remixSelection` ใน store แล้วแสดง toast `toast-added-to-selection` (ยังไม่ออกจากหน้า)
    - CSS: การ์ดแสดง `founder-why` เด่นกว่า `ai-insight` (ให้เหตุผลมนุษย์เป็นหลัก ไม่ใช่คะแนน AI)
  - **Target Files**: src/components/vault-cards.html, src/styles/vault-cards.css, src/modules/vault-filters.js
  - **Status**: ✅ COMPLETED

---

- [x] **Topic 17: Library Empty States**
  - **DOD**:
    - HTML: `empty-content-vault` ข้อความ "ยังไม่มี Content Reference" + ปุ่ม `btn-empty-research` และ `btn-empty-sample`; `empty-packaging-vault` ในลักษณะเดียวกัน
    - HTML: `empty-no-results` เมื่อค้นหา/กรองแล้วไม่พบ พร้อมปุ่มล้างตัวกรอง
    - JS: `btn-empty-research` → S01; `btn-empty-sample` โหลด sample เพื่อสอนวิธี Save โดยไม่ลบข้อมูลผู้ใช้เดิม
    - JS: empty state ปรากฏเมื่อจำนวน note ของแท็บนั้นเป็น 0 เท่านั้น
    - CSS: empty state ไม่ใช้พื้นที่ทั้งหน้าเกินจำเป็น และอ่านออกว่าแท็บไหนว่าง
  - **Target Files**: src/components/library-empty.html, src/styles/library-empty.css, src/modules/library-empty.js
  - **Status**: ✅ COMPLETED

---

- [x] **Topic 18: S05 Saved Reference Detail (Edit WHY / Remove Lens)**
  - **DOD**:
    - HTML: แสดง original/video, lens ที่เลือก (`selected-lens`), `analysis-snapshot` (ตาม version ตอน save), `founder-why` แก้ไขได้ (`btn-edit-my-note`, `btn-save-note-edit`), timestamps, `note-history`
    - HTML: ปุ่ม `btn-use-in-remix` และ `btn-remove-from-vault`
    - JS: แก้ WHY อัปเดตเฉพาะ note นั้น — ไม่แก้ analysis ต้นฉบับ ไม่ลบ Remix draft เดิม (A06); บันทึกประวัติการแก้ใน `note-history`
    - JS: `btn-remove-from-vault` ลบเฉพาะ lens ปัจจุบัน; lens อีกอันและ source ยังอยู่; มี confirm `confirm-remove`
    - JS: ถ้า reference ถูกใช้ใน Remix draft แล้ว ขึ้นคำเตือน `warn-used-in-draft` และ draft ยังรักษา provenance (ดู T30)
  - **Target Files**: src/components/saved-reference-detail.html, src/styles/saved-reference-detail.css, src/modules/saved-reference-detail.js
  - **Status**: ✅ COMPLETED

---

- [x] **Topic 19: S06 Remix Reference Picker (สองคอลัมน์ multi-select)**
  - **DOD**:
    - HTML: ซ้าย `picker-content` (multi-select C1 C2 C3…) พร้อม search/filter; ขวา `picker-packaging` (P1 P2 P3…) พร้อม search/filter
    - HTML: แต่ละรายการมี checkbox `pick-{noteId}` และปุ่ม `btn-preview-{noteId}` ดู WHY/ที่มา
    - JS: เลือกได้ไม่จำกัดจำนวน (ไม่บังคับ 1:1); ติ๊กแล้ว `remixSelection` ใน store เปลี่ยนทันที
    - JS: เข้าได้ 2 ทาง — `Start Remix` จาก Dashboard (ตะกร้าว่าง) และ `Use in Remix` จาก Vault (มี reference นั้นอยู่แล้ว)
    - JS: **ไม่** มีการเลือก/สุ่มอัตโนมัติ; ถ้ามี `ai-recommend` ต้องเป็น optional และผู้ใช้ติ๊กเองเท่านั้น
  - **Target Files**: src/components/remix-picker.html, src/styles/remix-picker.css, src/modules/remix-picker.js
  - **Status**: ✅ COMPLETED

---

- [x] **Topic 20: Ingredient Basket Bar + Continue Gating**
  - **DOD**:
    - HTML: แถบ `ingredient-bar` แสดง `Content (N)` และ `Packaging (M)` + ชิป `chip-{noteId}` แต่ละอัน มีปุ่ม remove / drag-reorder / preview
    - JS: `btn-continue-to-remix` **disabled** เมื่อ Content = 0 และ enabled เมื่อ Content ≥ 1 (Packaging = 0 ได้ — D7/A10); disabled แสดงข้อความอธิบายเหตุผล `hint-need-content`
    - JS: remove ชิปแล้วติ๊กใน picker ถูกยกเลิกตาม; reorder เปลี่ยนลำดับใน `remixSelection` จริง
    - JS: Source เดียวกันที่เป็น Both เลือกได้ทั้งสอง lens (C(X)+P(X)) และชิปแสดงว่ามาจาก source เดียวกัน (A11)
    - CSS: ชิป Content/Packaging คนละสี; ตะกร้ามองเห็นตลอด (sticky)
  - **Target Files**: src/components/ingredient-bar.html, src/styles/ingredient-bar.css, src/modules/ingredient-bar.js
  - **Status**: ✅ COMPLETED

---

- [x] **Topic 21: Remix Draft Selection — Resume**
  - **DOD**:
    - JS: ตะกร้า (`remixSelection`) persist ลง store/localStorage ทุกครั้งที่เปลี่ยน
    - JS: เลือก C2+P1 → ออกไปหน้าอื่น → กลับมา selection ยังอยู่ (A17/D10)
    - HTML: banner `banner-resume-selection` บอกผู้ใช้ว่ามีตะกร้าค้างอยู่ พร้อมปุ่ม `btn-resume` และ `btn-discard-selection`
    - JS: ห้ามล้างตะกร้าเงียบ ๆ — ล้างได้จากปุ่ม `btn-discard-selection` เท่านั้น (มี confirm)
    - CSS: banner เห็นได้จาก Dashboard (`continue-work`) และจาก S06
  - **Target Files**: src/components/resume-banner.html, src/styles/resume-banner.css, src/modules/remix-resume.js
  - **Status**: ✅ COMPLETED

---

- [x] **Topic 22: S07 Remix Workspace — Ingredients Panel (What / How to borrow)**
  - **DOD**:
    - HTML: panel `ws-ingredients` แสดงการ์ด reference ที่เลือก; แต่ละ Content card มีช่อง `borrow-what-{id}` ("What to borrow?"), แต่ละ Packaging card มี `borrow-how-{id}` ("How to borrow?"); มีช่อง `founder-note`
    - JS: คลิกการ์ดเปิดที่มา (source link + WHY ตอน save) โดยไม่ออกจาก workspace
    - JS: ค่าที่กรอกเก็บใน `remixSession.ingredients[]` และไม่หายเมื่อสลับ panel
    - CSS: แยก Content/Packaging ด้วยสีประจำคลัง; มือถือยุบเป็น section เปิด/ปิดได้ แต่ยังเห็นสรุปว่าผสมอะไรอยู่ (ดู T31)
    - ห้ามซ่อนชื่อ/WHY ของคลิปต้นทางจนผู้ใช้ไม่รู้ว่ากำลังผสมอะไร
  - **Target Files**: src/components/ws-ingredients.html, src/styles/ws-ingredients.css, src/modules/ws-ingredients.js
  - **Status**: ✅ COMPLETED

---

- [x] **Topic 23: S07 Remix Workspace — Direction Panel**
  - **DOD**:
    - HTML: `ws-direction` มีช่อง `dir-audience`, `dir-goal`, `dir-our-pov` ("สิ่งใหม่ที่เราจะพูด"), `dir-tone`, `dir-cta`, `dir-constraints`, `dir-rights`; ส่วน `brand-brain` แสดง Offer / Voice DNA / Proof (อ่านจาก store หรือ mock จนกว่า T00 พบแหล่งจริง)
    - JS: ปุ่ม `btn-generate-concepts` (copy: `Create Original Concepts`) **disabled** จนกว่า `dir-our-pov` และ `dir-audience` ไม่ว่าง และมีเหตุผลแสดงข้างปุ่ม
    - JS: ค่าทั้งหมดเก็บใน `remixSession.direction` และคงอยู่เมื่อกลับมา
    - JS: ช่อง `dir-our-pov` ไม่ถูกเติมโดย AI เอง (ผู้ใช้เป็นคนระบุ POV)
    - CSS: ฟอร์มอ่านง่าย ช่องที่ required มีเครื่องหมายชัดเจน
  - **Target Files**: src/components/ws-direction.html, src/styles/ws-direction.css, src/modules/ws-direction.js
  - **Status**: ✅ COMPLETED

---

- [x] **Topic 24: S07 Remix Workspace — Concept Results + Source Trace**
  - **DOD**:
    - JS: `generateConcepts(selection, direction)` (mock จนกว่าจะต่อ AI จริง) คืน 2–3 concepts ที่ **ต่างกันจริง** (hook ไม่ซ้ำกัน) ใน `concepts[]`
    - HTML: การ์ด `concept-{id}` มี `c-hook`, `c-story-beats`, `c-claim-check`, `c-visual-sound`, `c-original-contribution`, `c-source-trace`, `c-cta`
    - JS: `c-source-trace` แสดงชัดว่า Source Content (C?) / Transferable Packaging (P?) / New Original Value อะไร และลิงก์ไปที่มาของแต่ละชิ้น
    - JS: concept ที่ไม่ได้อ้าง reference ใดเลย หรือคัดลอกประโยค/ซาวด์ของต้นฉบับ ถูกตัดทิ้ง/ติดป้าย `flag-copy-risk`
    - เมื่อ Packaging = 0 concept ต้องไม่อ้าง Packaging ใด ๆ (A10); เมื่อ Packaging ต่างหมวดกับ Content (A12) ต้องยืมเฉพาะวิธีเล่า ไม่ดึงหัวข้อของ Packaging มา
  - **Target Files**: src/components/ws-concepts.html, src/styles/ws-concepts.css, src/modules/ws-concepts.js
  - **Status**: ✅ COMPLETED

---

- [x] **Topic 25: Claims & Rights Checker**
  - **DOD**:
    - JS: `checkClaims(concept)` ตรวจตัวเลข/ข้ออ้างที่ไม่มีแหล่งอ้างอิง (เช่น "3 ชั่วโมง/วัน") แล้วใส่ `claim-flag` ที่ concept; ผู้ใช้เลือก `btn-claim-remove` หรือ `btn-claim-add-source` (ขอหลักฐาน)
    - JS: claim ที่ยัง flag อยู่ ห้ามถูกส่งต่อไป Approve (T29 ต้อง block) (A14)
    - HTML: `rights-panel` แจ้งว่าห้ามใช้เพลง/วิดีโอ/เสียงของคนอื่นโดยไม่มีสิทธิ์; มีทางเลือก `opt-reaction-stitch` ที่นำไป flow ตรวจสิทธิ์ก่อน และ `opt-new-angle-no-footage` (พูดประเด็นใหม่โดยไม่ใช้ภาพต้นฉบับ) (A13)
    - JS: เลือก Reaction/Stitch แล้วต้องกรอก `rights-confirm` ก่อน Save Draft ได้
    - CSS: flag มองเห็นชัดบน concept และใน list
  - **Target Files**: src/components/claims-rights.html, src/styles/claims-rights.css, src/modules/claims-rights.js
  - **Status**: ✅ COMPLETED

---

- [x] **Topic 26: Refine / Compare Concepts**
  - **DOD**:
    - HTML: ปุ่ม `btn-refine-angle`, `btn-remix-again`, `btn-compare-concepts` และมุมมองเปรียบเทียบ `compare-view` แสดง 2–3 concepts เคียงกัน (hook / beats / source trace)
    - JS: `btn-refine-angle` รับข้อความแก้ (`refine-instruction`) แล้วสร้าง concept ใหม่เฉพาะอันนั้น **ไม่** กลับไป Research ใหม่ และไม่ทับ concept เดิม (A18)
    - JS: reject concept ได้ (`btn-reject-concept`) โดยไม่บังคับ research ใหม่
    - JS: ผู้ใช้เลือก concept เอง — ไม่มี auto-select/auto-approve
    - CSS: compare-view บนมือถือเลื่อนแนวนอนหรือสลับทีละอัน
  - **Target Files**: src/components/concept-compare.html, src/styles/concept-compare.css, src/modules/concept-refine.js
  - **Status**: ✅ COMPLETED

---

- [x] **Topic 27: S08 Concept Detail / Script Draft**
  - **DOD**:
    - HTML: `cd-rationale`, `cd-outline`, `cd-script-hook`, `cd-scene-sound`, `cd-proof-required`, `cd-cta`
    - HTML: ช่อง `edit-instruction` รับข้อความธรรมดา เช่น "เพิ่มตัวอย่างจริงจากธุรกิจเรา", "อย่าใช้ตัวเลขที่ไม่มีที่มา", "ทำ suspense ให้น้อยลง" + ปุ่ม `btn-apply-edit`
    - JS: `btn-save-remix-draft` (copy: `Save Remix Draft`) บันทึกลง `boardItems` สถานะ `Draft` และ **ไม่** approve / publish / render
    - JS: draft เก็บ snapshot ของ reference ที่ใช้ + direction ตอนนั้น (ใช้ใน T30)
    - JS: หลัง save แสดง `toast-draft-saved` และลิงก์ไป Content Board
  - **Target Files**: src/components/concept-detail.html, src/styles/concept-detail.css, src/modules/concept-detail.js
  - **Status**: ✅ COMPLETED

---

- [x] **Topic 28: S09 Content Board — Stages**
  - **DOD**:
    - HTML: คอลัมน์ 4 stage ตามสเปก `col-draft`, `col-needs-review`, `col-approved`, `col-ready-for-production`
    - HTML: การ์ดแต่ละใบแสดงชื่อ concept, source trace สั้น ๆ, `claim-flag` count, stage ปัจจุบัน
    - JS: ย้าย Draft → Needs Review ได้ด้วยปุ่ม `btn-submit-review`; ย้ายกลับ Draft ได้ (กรณี "Not yet")
    - JS: การย้ายไป Approved / Ready for Production ทำผ่าน action ใน T29 เท่านั้น (ห้ามลากข้ามโดยตรง)
    - CSS: stage แยกสีและมี count ในหัวคอลัมน์; ไม่มีปุ่ม `Publish` ใด ๆ
  - **Target Files**: src/components/content-board.html, src/styles/content-board.css, src/modules/content-board.js
  - **Status**: ✅ COMPLETED

---

- [x] **Topic 29: Approve Concept (Immutable Revision) + Director Brief + Handoff Gating**
  - **DOD**:
    - JS: `btn-approve-concept` (copy: `Approve Concept`) enabled เมื่ออยู่ใน `Needs Review` และ **ไม่มี** `claim-flag` ค้าง และ rights ผ่าน; ถ้าไม่ผ่านแสดงเหตุผล `hint-approve-blocked`
    - JS: Approve สร้าง `approvedRevisions[]` ใหม่แบบ **immutable** (`Object.freeze` deep) พร้อม Director Brief; แก้ revision นี้ไม่ได้ — แก้ได้ด้วยการสร้าง revision ใหม่เท่านั้น (A20)
    - JS: Approve ไม่ trigger publish หรือ render ใด ๆ
    - HTML: Director Brief แสดง source/rights/constraints; ปุ่ม `btn-export-director-brief` ส่งออกไฟล์ (JSON/Markdown)
    - JS: ปุ่ม `btn-send-to-mew-edit` แสดงเฉพาะเมื่อ flag `mewEditVerified === true` ไม่เช่นนั้นแสดงเฉพาะ `btn-export-director-brief` (A21)
  - **Target Files**: src/components/approve-handoff.html, src/styles/approve-handoff.css, src/modules/approve-handoff.js
  - **Status**: ✅ COMPLETED

---

- [x] **Topic 30: Provenance Snapshot เมื่อ Saved Note ถูกลบ**
  - **DOD**:
    - JS: ตอน Save Remix Draft เก็บ snapshot ของ reference แต่ละชิ้น (`why`, ชื่อ source, ลิงก์, lens, analysis version) ไว้ใน draft เอง
    - JS: ลบ savedNote ที่ draft ใช้อยู่ → draft ยังเปิดได้และ `c-source-trace` ยังแสดงข้อมูลจาก snapshot (A19)
    - HTML: badge `badge-source-unavailable` แสดงเมื่อ note ต้นทางถูกลบแล้ว ไม่ลบข้อมูลเงียบ ๆ
    - JS: ห้ามมี draft ที่ source trace ว่างเปล่าเพราะการลบ note
    - test: ลบ note → เปิด draft เดิม → trace ครบ + badge ขึ้น
  - **Target Files**: src/components/provenance-badge.html, src/styles/provenance-badge.css, src/modules/provenance.js
  - **Status**: ✅ COMPLETED

---

- [x] **Topic 31: Mobile Behavior (Stepper + Sticky Summary)**
  - **DOD**:
    - HTML: Remix Workspace บนมือถือมี `remix-stepper` 3 ขั้น (Ingredients → Direction → Results) พร้อม `sticky-summary`
    - CSS: breakpoint ≤ 768px สลับจาก 3 คอลัมน์เป็น stepper; `sticky-summary` ติดด้านบนหรือล่าง แสดง `Content (N) + Packaging (M)` ตลอด
    - JS: กด `sticky-summary` เปิดรายการ reference ที่ผสมอยู่ (ชื่อ + WHY) ได้ทุกขั้น
    - JS: ไป-กลับระหว่างขั้นแล้วข้อมูลที่กรอกไม่หาย
    - ทุกหน้าหลัก (S01–S09) ไม่มี horizontal scroll ที่ความกว้าง 375px (ตรวจด้วย Playwright)
  - **Target Files**: src/components/remix-mobile.html, src/styles/remix-mobile.css, src/modules/remix-mobile.js
  - **Status**: ✅ COMPLETED

---

- [x] **Topic 32: UX Copy Dictionary + Forbidden-Term Lint**
  - **DOD**:
    - JS: `copy.js` export ข้อความตามสเปกข้อ 7 อย่างน้อย: `Analyze Clip / วิเคราะห์คลิป`, `Analyzed · Not saved / วิเคราะห์แล้ว · ยังไม่ได้เก็บ`, `Save to Library / บันทึกเข้าคลัง`, `Content (WHAT) / Packaging (HOW) / Both`, `ทำไมคุณอยากเก็บสิ่งนี้?`, `Use in Remix / นำไปรีมิกซ์`, `Create Original Concepts`, `Save Remix Draft`, `Approve Concept`
    - สคริปต์ `scripts/lint-copy.js` สแกนทั้ง `src/` แล้ว fail เมื่อพบข้อความต้องห้ามใน UI: `Clone Clip`, `Added to Library` (กับสถานะยังไม่ save), `AI Auto Save`, `Export` (แทน Save), `Publish Now`, `Stitch Source Videos`, `Save Research` (แทน Save Draft)
    - ทุกไฟล์ UI อ่านข้อความจาก `copy.js` — lint ต้องไม่พบ string UI hardcode ในไฟล์อื่น
    - ไม่มี HTML/CSS ในหัวข้อนี้ — ทดสอบด้วย `node scripts/lint-copy.js` exit code 0
  - **Target Files**: src/modules/copy.js, scripts/lint-copy.js, docs/copy-guide.md
  - **Status**: ✅ COMPLETED

---

- [x] **Topic 33: E2E Test D1–D10 + Scenario Coverage**
  - **DOD**:
    - สคริปต์ Playwright `tests/e2e/d1-d10.spec.js` ครอบคลุมครบ 10 เส้นทาง: D1 ไม่ Save, D2 Content-only, D3 Packaging-only, D4 Both+2 WHY, D5 Remix C1+P1, D6 Remix C3+P2 (remove/reorder/inspect), D7 Content-only Remix, D8 Refine→Draft→Board→Approve, D9 duplicate/unavailable/unsupported claim/no rights, D10 Back/Resume
    - ทดสอบ 3 เส้นทางเดโมของ Founder เป็นชุดแยก `demo-3-paths.spec.js`: (1) Save Content only (2) Save Both สอง WHY (3) Remix C3+P2 → concept → Draft
    - `docs/scenario-coverage.md` ตาราง A01–A22 → หน้า/state/test ที่ครอบ ไม่มีแถวว่าง
    - ทุก test ผ่านด้วย `npx playwright test` และ `node scripts/lint-copy.js` ผ่านพร้อมกัน
    - ไม่มี test ใดพึ่งข้อมูลจริงหรือ network ภายนอก (ใช้ sample data จาก T02)
  - **Target Files**: tests/e2e/d1-d10.spec.js, tests/e2e/demo-3-paths.spec.js, docs/scenario-coverage.md
  - **Status**: ✅ COMPLETED

---

- [x] **Topic 34: Founder Review Record + Handoff Summary**
  - **DOD**:
    - สร้าง `docs/founder-review.md` แบ่ง 3 หมวดชัดเจน: **ตามสเปก** / **เสนอเพิ่ม (proposed)** / **ยังไม่ verified** (เช่น backend, AI วิเคราะห์สื่อจริง, Scan Feed, MEW EDIT integration)
    - ทุกรายการอ้างอิง Topic ID และผลทดสอบ (ผ่าน/ไม่ผ่าน)
    - ระบุข้อจำกัดที่ผู้ใช้ต้องรู้ เช่น ตัวเลขและ AI เป็น mock จนกว่าจะต่อของจริง
    - คำถามเปิดสำหรับผู้ใช้ (repo จริง, รูปแบบ prototype, Scan Feed, MEW EDIT, ระดับการวิเคราะห์สื่อจริง) ถูกสรุปเป็นรายการท้ายไฟล์
    - ห้ามรายงานว่า "เสร็จ" ถ้า 3 เส้นทางเดโมใน T33 ยังไม่ผ่านครบ
  - **Target Files**: docs/founder-review.md
  - **Status**: ✅ COMPLETED

---
