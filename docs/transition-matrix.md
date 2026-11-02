# MEW CONTENT OS — Screen-to-Screen Transition Matrix

> **แหล่งความจริง:** `MEW_Content_OS_Founder_UX_Spec_TH.md` (หัวข้อที่ 4: Screen-by-Screen UX Contract)  
> **เครื่องมือสร้าง:** สร้างอัตโนมัติจาก `src/modules/router.js` โดยสคริปต์ `node scripts/gen-matrix.js`  
> **วันที่สร้าง:** 2026-11-01T15:28:27.288Z  
> **สถานะการตรวจสอบ:** ✅ ทุกแถวของตารางเชื่อมโยงไปยังหน้าจอที่มีอยู่จริง 100% (S00–S09)

---

## 1. สรุปภาพรวม (System Architecture Overview)

| รายการ | จำนวน | รายละเอียด |
|---|:---:|---|
| **จำนวนหน้าจอทั้งหมด (Screens)** | **10** | S00 ถึง S09 ครบตามสเปกข้อ 4 |
| **จำนวนปุ่มและการกระทำ (Transitions)** | **58** | ครบทุกปุ่มหลักและปุ่มทางเลือก |
| **Stage Pipeline** | **5 Stages** | Overview, Research, Save Gate, Ingredients, Remix, Approve |
| **กฎเหล็กการเปลี่ยนหน้า (D10)** | **Preserved** | การกด Back หรือเปลี่ยนหน้า จะไม่ทำให้ `remixSelection` ใน store สูญหาย |

## 2. ตารางสารบบหน้าจอ (Screen Registry: S00–S09)

| รหัสจอ | ชื่อหน้าจอ | ขั้นตอน (Stage) | โทนสี | หน้าที่หลัก (UX Job Description) |
|:---:|---|:---:|:---:|---|
| **S00** | **Overview (Dashboard)** | `Overview` | `overview` | รู้ว่ามีงานอะไร และเข้า workflow ต่อได้ทันที ไม่ใช่แค่กราฟยอดวิว |
| **S01** | **Research Entry & Inbox** | `Research` | `research` | พาคลิปเข้าหน้าตรวจสอบและวิเคราะห์ พร้อมสถานะ 7 แบบใน Inbox |
| **S02** | **Research Detail / AI Analysis** | `Research` | `research` | ให้ผู้ใช้เข้าใจทั้ง WHAT และ HOW ก่อนตัดสินใจเก็บ |
| **S03** | **Save to Library (Modal / Gate)** | `Save Gate` | `save` | ให้คนเป็นเจ้าของเหตุผลในการเก็บ Reference เข้าสู่ 2 Vaults แยกกัน |
| **S04** | **Library (2 Vaults: Content & Packaging)** | `Ingredients` | `ingredients` | หาและหยิบ Reference มาใช้ในงานใหม่ได้จริง แยกสาระออกจากวิธีเล่า |
| **S05** | **Saved Reference Detail** | `Ingredients` | `ingredients` | อ่าน “ทำไมตอนนั้นฉันถึง Save” แล้วนำไปใช้ต่อ พร้อมประวัติการแก้ไข |
| **S06** | **Remix Reference Picker** | `Remix` | `remix` | หยิบวัตถุดิบจากคลังได้หลายชิ้นตามใจผู้ใช้ ไม่จำกัดอัตราส่วน 1:1 |
| **S07** | **Remix Workspace / Synthesis** | `Remix` | `remix` | สร้างเรื่องใหม่จากการแยก WHAT + HOW อย่างแท้จริง พร้อม Claims & Rights Checker |
| **S08** | **Concept Detail / Script Draft** | `Remix` | `remix` | เปลี่ยน Idea เป็นงานที่จะถ่ายและตัดได้ บันทึกเป็น Remix Draft |
| **S09** | **Content Board / Handoff** | `Approve` | `approve` | เก็บเวอร์ชันและจัดขั้นตอนอนุมัติอย่างปลอดภัย พร้อม Director Brief Handoff |

---

## 3. ตารางความสัมพันธ์การเปลี่ยนหน้าแบบละเอียด (Master Transition Matrix)

ตารางนี้ระบุความสัมพันธ์: **หน้าเริ่มต้น (From) × ปุ่มที่กด (Action/Button) → หน้าปลายทาง (To) พร้อม State ที่เปลี่ยนแปลงใน Store**

| จากหน้า (From) | รหัสปุ่ม (Action ID) | ข้อความบนปุ่ม (UI Copy) | ไปหน้า (To) | การเปลี่ยนแปลง State ใน Store | วัตถุประสงค์ UX (UX Intent) |
|:---:|---|---|:---:|---|---|
| **S00**<br>(Overview (Dashboard)) | `btn-research-a-clip` | **Research a Clip** | **S01**<br>(Research Entry & Inbox) | `None` | นำทางสู่ทางเข้าวิจัยคลิปต้นฉบับ S01 |
| **S00**<br>(Overview (Dashboard)) | `btn-open-library` | **Open My Library** | **S04**<br>(Library (2 Vaults: Content & Packaging)) | `None` | เปิดดูคลังวัตถุดิบ 2 คลัง (Content Vault & Packaging Vault) ใน S04 |
| **S00**<br>(Overview (Dashboard)) | `btn-start-remix` | **Start Remix** | **S06**<br>(Remix Reference Picker) | `None` | เริ่มต้นกระบวนการเลือกวัตถุดิบสำหรับรีมิกซ์ใน S06 |
| **S00**<br>(Overview (Dashboard)) | `btn-continue-work` | **Continue work** | **S06**<br>(Remix Reference Picker) | `None (resumes preserved remixSelection)` | กลับไปทำงานค้างต่อ โดยรักษารายการที่เลือกไว้ใน store (D10) |
| **S00**<br>(Overview (Dashboard)) | `btn-view-recent-research` | **View Recent Research** | **S02**<br>(Research Detail / AI Analysis) | `activeSourceId: sets clicked research item context` | เปิดหน้ารายละเอียดการวิเคราะห์ของคลิปที่เคยวิเคราะห์ไว้ |
| **S00**<br>(Overview (Dashboard)) | `btn-view-remix-draft` | **View Remix Draft** | **S08**<br>(Concept Detail / Script Draft) | `activeConceptId: sets draft context` | เปิดดูบทดราฟต์รีมิกซ์ล่าสุดที่บันทึกไว้ใน S08 |
| **S00**<br>(Overview (Dashboard)) | `nav-research` | **01 Research** | **S01**<br>(Research Entry & Inbox) | `None` | คลิกเมนูหลักเพื่อไปหน้า Research |
| **S00**<br>(Overview (Dashboard)) | `nav-library` | **02 My Library** | **S04**<br>(Library (2 Vaults: Content & Packaging)) | `None` | คลิกเมนูหลักเพื่อไปหน้า Library |
| **S00**<br>(Overview (Dashboard)) | `nav-remix` | **03 Remix Studio** | **S06**<br>(Remix Reference Picker) | `None` | คลิกเมนูหลักเพื่อไปหน้า Remix |
| **S00**<br>(Overview (Dashboard)) | `nav-board` | **04 Content Board** | **S09**<br>(Content Board / Handoff) | `None` | คลิกเมนูหลักเพื่อไปหน้า Content Board |
| **S01**<br>(Research Entry & Inbox) | `btn-analyze-clip` | **Analyze Clip** | **S02**<br>(Research Detail / AI Analysis) | `researchItems: creates research item with status "Waiting for analysis" -> "Analyzing" -> "Analyzed · Not saved"` | ส่ง URL เข้าวิเคราะห์และเปิดหน้า Research Detail S02 |
| **S01**<br>(Research Entry & Inbox) | `btn-upload-owned` | **Upload Owned Video** | **S02**<br>(Research Detail / AI Analysis) | `sources: registers owned video; researchItems: creates item` | อัปโหลดวิดีโอที่เป็นเจ้าของ/มีสิทธิ์ใช้งาน เข้าวิเคราะห์ใน S02 |
| **S01**<br>(Research Entry & Inbox) | `btn-open-inbox-row` | **Open Inbox Item** | **S02**<br>(Research Detail / AI Analysis) | `activeSourceId: loads selected research inbox item` | เปิดดูรายละเอียดและผลวิเคราะห์ของคลิปใน Inbox |
| **S01**<br>(Research Entry & Inbox) | `btn-back-overview` | **Back to Overview** | **S00**<br>(Overview (Dashboard)) | `None` | ย้อนกลับไปหน้า Overview Dashboard |
| **S02**<br>(Research Detail / AI Analysis) | `btn-save-to-library` | **Save to Library** | **S03**<br>(Save to Library (Modal / Gate)) | `None (opens Human Save Gate modal)` | เปิดหน้าต่าง Save to Library (S03) ให้มนุษย์เลือกคลังและใส่ WHY |
| **S02**<br>(Research Detail / AI Analysis) | `btn-back-to-research` | **Back to Research** | **S01**<br>(Research Entry & Inbox) | `None (video NOT saved to Vault, remains in Inbox as Analyzed · Not saved - D1)` | ออกจากหน้าวิเคราะห์โดยไม่เซฟ คลิปจะไม่เข้า Vault ตามกฎเหล็กข้อ 1 และ D1 |
| **S02**<br>(Research Detail / AI Analysis) | `btn-analyze-again` | **Analyze Again** | **S02**<br>(Research Detail / AI Analysis) | `analyses: appends new version (v2, v3) without altering existing savedNotes` | ขอให้ AI วิเคราะห์ซ้ำ สร้างเวอร์ชันใหม่โดยไม่ลบหรือทับ Save Note เดิม (T11) |
| **S02**<br>(Research Detail / AI Analysis) | `tab-content-what` | **Content (WHAT)** | **S02**<br>(Research Detail / AI Analysis) | `activeTab: "content"` | สลับดูแผงวิเคราะห์สาระหลัก / ข้อคิด / ประเด็น |
| **S02**<br>(Research Detail / AI Analysis) | `tab-packaging-how` | **Packaging (HOW)** | **S02**<br>(Research Detail / AI Analysis) | `activeTab: "packaging"` | สลับดูแผงวิเคราะห์วิธีเล่า / Hook / Pacing / SFX / จังหวะตัดต่อ |
| **S03**<br>(Save to Library (Modal / Gate)) | `btn-confirm-save` | **Confirm Save to Library** | **S03**<br>(Save to Library (Modal / Gate)) | `savedNotes: creates 1 note per selected lens (content/packaging/both) with Founder WHY; updates source status to Saved` | บันทึก Note เข้า Vault ตามเลนส์ที่เลือกพร้อมเหตุผลของมนุษย์ และแสดงหน้าสำเร็จ |
| **S03**<br>(Save to Library (Modal / Gate)) | `btn-cancel-save` | **Cancel** | **S02**<br>(Research Detail / AI Analysis) | `None` | ยกเลิกการบันทึก ปิด modal และกลับสู่หน้า S02 โดย store ไม่เปลี่ยนแปลง |
| **S03**<br>(Save to Library (Modal / Gate)) | `btn-view-in-library` | **View in Library** | **S04**<br>(Library (2 Vaults: Content & Packaging)) | `activeVaultTab: set to newly saved lens ("content" or "packaging")` | หลังบันทึกสำเร็จ เปิดไปดู Reference ใน Library คลังที่เพิ่งเซฟ |
| **S03**<br>(Save to Library (Modal / Gate)) | `btn-use-in-remix` | **Use in Remix** | **S06**<br>(Remix Reference Picker) | `remixSelection: automatically adds saved note to basket (T14)` | หลังบันทึกสำเร็จ นำ Reference นี้ใส่ตะกร้าวัตถุดิบทันทีแล้วไปหน้า Remix S06 |
| **S03**<br>(Save to Library (Modal / Gate)) | `btn-edit-existing-note` | **Edit Existing Note** | **S05**<br>(Saved Reference Detail) | `activeNoteId: sets existing note context` | กรณีคลิปเคยถูกบันทึกในเลนส์นั้นแล้ว เสนอให้นำทางไปแก้ไข WHY ใน S05 |
| **S04**<br>(Library (2 Vaults: Content & Packaging)) | `tab-content-vault` | **Content Vault** | **S04**<br>(Library (2 Vaults: Content & Packaging)) | `activeVault: "content"` | สลับไปดูคลังสิ่งที่เขาพูด (WHAT) |
| **S04**<br>(Library (2 Vaults: Content & Packaging)) | `tab-packaging-vault` | **Packaging Vault** | **S04**<br>(Library (2 Vaults: Content & Packaging)) | `activeVault: "packaging"` | สลับไปดูคลังวิธีที่เขาเล่า (HOW) |
| **S04**<br>(Library (2 Vaults: Content & Packaging)) | `btn-vault-card` | **View Saved Reference** | **S05**<br>(Saved Reference Detail) | `activeNoteId: sets selected note context` | คลิกการ์ดในคลังเพื่อเปิดดูรายละเอียด Reference ใน S05 |
| **S04**<br>(Library (2 Vaults: Content & Packaging)) | `btn-use-in-remix` | **Use in Remix** | **S06**<br>(Remix Reference Picker) | `remixSelection: adds reference noteId to content/packaging array` | หยิบ Reference จากคลังใส่ตะกร้ารีมิกซ์และเปิดไป S06 |
| **S04**<br>(Library (2 Vaults: Content & Packaging)) | `btn-start-remix` | **Start Remix with Basket** | **S06**<br>(Remix Reference Picker) | `None (proceeds with current remixSelection)` | เปิดสตูดิโอรีมิกซ์ด้วยวัตถุดิบทั้งหมดที่มีในตะกร้าปัจจุบัน |
| **S04**<br>(Library (2 Vaults: Content & Packaging)) | `btn-empty-research` | **Research a Clip** | **S01**<br>(Research Entry & Inbox) | `None` | เมื่อคลังว่างเปล่า คลิกเพื่อไปเริ่มค้นหาคลิปใหม่ใน S01 |
| **S04**<br>(Library (2 Vaults: Content & Packaging)) | `btn-empty-sample` | **Load Sample References** | **S04**<br>(Library (2 Vaults: Content & Packaging)) | `savedNotes: seeds founder sample references (Story A, B, E)` | โหลดตัวอย่างอ้างอิงเพื่อสอนวิธีใช้งานโดยไม่ลบข้อมูลเดิม |
| **S04**<br>(Library (2 Vaults: Content & Packaging)) | `btn-back` | **Back to Overview** | **S00**<br>(Overview (Dashboard)) | `None` | ย้อนกลับไปหน้า Overview Dashboard |
| **S05**<br>(Saved Reference Detail) | `btn-back-to-library` | **Back to Library** | **S04**<br>(Library (2 Vaults: Content & Packaging)) | `None` | ย้อนกลับไปหน้าคลังวัตถุดิบ S04 |
| **S05**<br>(Saved Reference Detail) | `btn-use-in-remix` | **Use in Remix** | **S06**<br>(Remix Reference Picker) | `remixSelection: adds current reference to basket` | เพิ่มรายการนี้ลงตะกร้ารีมิกซ์แล้วไปหน้า S06 |
| **S05**<br>(Saved Reference Detail) | `btn-save-note-edit` | **Save Note Edit** | **S05**<br>(Saved Reference Detail) | `savedNotes: updates WHY and logs edit in note-history; does NOT alter analysis or drafts (A06)` | บันทึกการแก้ไข Founder WHY โดยไม่กระทบผลวิเคราะห์หรือดราฟต์ที่ใช้อยู่ |
| **S05**<br>(Saved Reference Detail) | `btn-remove-from-vault` | **Remove from This Vault** | **S04**<br>(Library (2 Vaults: Content & Packaging)) | `savedNotes: deletes note for current lens only; retains other lens and source (A05/T18)` | ลบ Reference ออกจากคลังนี้เฉพาะเลนส์ปัจจุบัน แล้วกลับไปหน้า S04 |
| **S06**<br>(Remix Reference Picker) | `btn-continue-to-remix` | **Continue to Remix** | **S07**<br>(Remix Workspace / Synthesis) | `remixSession: initializes active remix workspace with chosen ingredients` | เมื่อเลือก Content >= 1 (Packaging >= 0) ปลดล็อกปุ่มไปสู่ Remix Workspace S07 |
| **S06**<br>(Remix Reference Picker) | `btn-back-to-library` | **Back to Library** | **S04**<br>(Library (2 Vaults: Content & Packaging)) | `None (remixSelection strictly preserved in store - D10)` | ย้อนกลับไปหน้า Library โดยรายการที่เลือกในตะกร้าไม่สูญหาย |
| **S06**<br>(Remix Reference Picker) | `btn-browse-vault` | **Browse Vault for More** | **S04**<br>(Library (2 Vaults: Content & Packaging)) | `None (remixSelection preserved)` | เปิดคลังเพื่อค้นหาวัตถุดิบเพิ่มเติม โดยไม่ล้างตะกร้า |
| **S06**<br>(Remix Reference Picker) | `btn-discard-selection` | **Discard Selection** | **S06**<br>(Remix Reference Picker) | `remixSelection: resets content and packaging arrays to empty after user confirmation` | ล้างรายการในตะกร้าวัตถุดิบทั้งหมดหลังจากผู้ใช้กดยืนยัน |
| **S07**<br>(Remix Workspace / Synthesis) | `btn-back-to-picker` | **Back to Ingredients Picker** | **S06**<br>(Remix Reference Picker) | `None (remixSelection strictly preserved - D10)` | ย้อนกลับไปปรับเปลี่ยนวัตถุดิบในตะกร้า โดยข้อมูลที่กรอกไว้ไม่สูญหาย |
| **S07**<br>(Remix Workspace / Synthesis) | `btn-generate-concepts` | **Create Original Concepts** | **S07**<br>(Remix Workspace / Synthesis) | `concepts: generates 2-3 distinct original concepts with source trace, hooks, and story beats` | สั่งสังเคราะห์แนวคิดต้นฉบับ 2-3 แบบที่แตกต่างกันจริงตามทิศทางของ Founder |
| **S07**<br>(Remix Workspace / Synthesis) | `btn-remix-again` | **Remix Again** | **S07**<br>(Remix Workspace / Synthesis) | `concepts: regenerates concepts based on updated direction` | สั่งรีมิกซ์ซ้ำเพื่อสร้างมุมมองใหม่ |
| **S07**<br>(Remix Workspace / Synthesis) | `btn-refine-angle` | **Refine This Angle** | **S07**<br>(Remix Workspace / Synthesis) | `concepts: refines specific concept with instruction without restarting research (A18)` | ปรับแต่งเฉพาะแนวคิดที่เลือกโดยไม่ต้องวิจัยใหม่และไม่ลบทับอันเดิม |
| **S07**<br>(Remix Workspace / Synthesis) | `btn-open-concept-detail` | **Open Concept Script Draft** | **S08**<br>(Concept Detail / Script Draft) | `activeConceptId: sets selected concept for script expansion` | เลือก Concept เพื่อนำไปพัฒนาเป็นโครงบทสคริปต์ฉบับเต็มใน S08 |
| **S07**<br>(Remix Workspace / Synthesis) | `btn-save-as-draft` | **Save as Draft to Board** | **S09**<br>(Content Board / Handoff) | `boardItems: appends item with stage "Draft" and provenance snapshots` | บันทึกเป็นดราฟต์ลง Content Board ใน S09 |
| **S08**<br>(Concept Detail / Script Draft) | `btn-back-to-workspace` | **Back to Remix Workspace** | **S07**<br>(Remix Workspace / Synthesis) | `None` | ย้อนกลับไปหน้า Remix Workspace S07 |
| **S08**<br>(Concept Detail / Script Draft) | `btn-apply-edit` | **Apply Edit** | **S08**<br>(Concept Detail / Script Draft) | `concepts/boardItems: updates script text, hooks, scene directions based on natural language instruction` | ปรับแก้บทสคริปต์ด้วยคำสั่งภาษาธรรมดาของ Founder |
| **S08**<br>(Concept Detail / Script Draft) | `btn-save-remix-draft` | **Save Remix Draft** | **S09**<br>(Content Board / Handoff) | `boardItems: commits draft to board with stage "Draft" and immutable provenance snapshots; does NOT approve or publish` | บันทึกดราฟต์บทลง Content Board (S09) โดยยังไม่อนุมัติหรือเรนเดอร์ใดๆ |
| **S08**<br>(Concept Detail / Script Draft) | `btn-view-source-trace` | **View Source Reference** | **S05**<br>(Saved Reference Detail) | `activeNoteId: opens provenance reference snapshot` | คลิกดูที่มาของวัตถุดิบ (Source Trace) ในหน้า Saved Reference Detail S05 |
| **S09**<br>(Content Board / Handoff) | `btn-submit-review` | **Submit for Review** | **S09**<br>(Content Board / Handoff) | `boardItems: transitions item stage from "Draft" to "Needs Review"` | ส่งบทจากร่างเข้าสู่ขั้นตอนรอตรวจพิจารณา (Needs Review) |
| **S09**<br>(Content Board / Handoff) | `btn-return-to-draft` | **Return to Draft** | **S09**<br>(Content Board / Handoff) | `boardItems: transitions item stage from "Needs Review" back to "Draft"` | ส่งบทกลับไปแก้ไขในขั้นตอนดราฟต์ |
| **S09**<br>(Content Board / Handoff) | `btn-approve-concept` | **Approve Concept** | **S09**<br>(Content Board / Handoff) | `boardItems: stage -> "Approved"; approvedRevisions: appends deep-frozen immutable revision + Director Brief (A20)` | Founder อนุมัติบทสร้างเวอร์ชัน immutable revision และ Director Brief โดยไม่ publish อัตโนมัติ |
| **S09**<br>(Content Board / Handoff) | `btn-open-concept-draft` | **Open Draft in Script Editor** | **S08**<br>(Concept Detail / Script Draft) | `activeConceptId: sets draft context` | คลิกการ์ดบนบอร์ดเพื่อเปิดดูหรือแก้ไขบทใน S08 |
| **S09**<br>(Content Board / Handoff) | `btn-start-new-remix` | **New Remix** | **S06**<br>(Remix Reference Picker) | `None` | เริ่มสร้างงานรีมิกซ์ชิ้นใหม่จากคลัง |
| **S09**<br>(Content Board / Handoff) | `btn-export-director-brief` | **Export Director Brief** | **S09**<br>(Content Board / Handoff) | `None (triggers client-side file download JSON/Markdown)` | ส่งออกไฟล์บรีฟผู้กำกับพร้อมรายละเอียดแหล่งที่มาและข้อจำกัดสิทธิ์ |
| **S09**<br>(Content Board / Handoff) | `btn-send-to-mew-edit` | **Send to MEW EDIT** | **S09**<br>(Content Board / Handoff) | `handoff: triggers handoff only when verified; otherwise displays transparent blocked notice (A21)` | ส่งต่องานตัดต่อเมื่อ integration ได้รับการยืนยันแล้ว |
| **S09**<br>(Content Board / Handoff) | `btn-back-to-remix` | **Back to Remix Workspace** | **S07**<br>(Remix Workspace / Synthesis) | `None` | ย้อนกลับไปหน้า Remix Workspace |

---

## 4. รายละเอียดปุ่มและการนำทางแยกตามหน้าจอ (Screen Breakdown)

### S00 — Overview (Dashboard)

- **Stage:** `Overview`  
- **หน้าที่:** รู้ว่ามีงานอะไร และเข้า workflow ต่อได้ทันที ไม่ใช่แค่กราฟยอดวิว  
- **คำอธิบายย่อย:** ภาพรวมระบบคอนเทนต์: คลังวิจัย, สถานะวัตถุดิบ 2 คลัง และดราฟต์รีมิกซ์ล่าสุด  

#### ปุ่มที่กดออกจากหน้านี้ (10 รายการ):

| รหัสปุ่ม (Action) | ข้อความ (Label) | ปลายทาง (To) | State ที่เปลี่ยนใน Store |
|---|---|:---:|---|
| `btn-research-a-clip` | Research a Clip | **S01** (Research Entry & Inbox) | `None` |
| `btn-open-library` | Open My Library | **S04** (Library (2 Vaults: Content & Packaging)) | `None` |
| `btn-start-remix` | Start Remix | **S06** (Remix Reference Picker) | `None` |
| `btn-continue-work` | Continue work | **S06** (Remix Reference Picker) | `None (resumes preserved remixSelection)` |
| `btn-view-recent-research` | View Recent Research | **S02** (Research Detail / AI Analysis) | `activeSourceId: sets clicked research item context` |
| `btn-view-remix-draft` | View Remix Draft | **S08** (Concept Detail / Script Draft) | `activeConceptId: sets draft context` |
| `nav-research` | 01 Research | **S01** (Research Entry & Inbox) | `None` |
| `nav-library` | 02 My Library | **S04** (Library (2 Vaults: Content & Packaging)) | `None` |
| `nav-remix` | 03 Remix Studio | **S06** (Remix Reference Picker) | `None` |
| `nav-board` | 04 Content Board | **S09** (Content Board / Handoff) | `None` |

#### ทางเข้าสู่หน้านี้จากหน้าอื่น (2 ทางเข้า):

| มาจากหน้า (From) | ผ่านปุ่ม (Action) | ข้อความปุ่ม |
|:---:|---|---|
| **S01** (Research Entry & Inbox) | `btn-back-overview` | Back to Overview |
| **S04** (Library (2 Vaults: Content & Packaging)) | `btn-back` | Back to Overview |

---

### S01 — Research Entry & Inbox

- **Stage:** `Research`  
- **หน้าที่:** พาคลิปเข้าหน้าตรวจสอบและวิเคราะห์ พร้อมสถานะ 7 แบบใน Inbox  
- **คำอธิบายย่อย:** พาคลิปเข้าหน้าตรวจสอบและวิเคราะห์ (URL / Upload / Scan Feed)  

#### ปุ่มที่กดออกจากหน้านี้ (4 รายการ):

| รหัสปุ่ม (Action) | ข้อความ (Label) | ปลายทาง (To) | State ที่เปลี่ยนใน Store |
|---|---|:---:|---|
| `btn-analyze-clip` | Analyze Clip | **S02** (Research Detail / AI Analysis) | `researchItems: creates research item with status "Waiting for analysis" -> "Analyzing" -> "Analyzed · Not saved"` |
| `btn-upload-owned` | Upload Owned Video | **S02** (Research Detail / AI Analysis) | `sources: registers owned video; researchItems: creates item` |
| `btn-open-inbox-row` | Open Inbox Item | **S02** (Research Detail / AI Analysis) | `activeSourceId: loads selected research inbox item` |
| `btn-back-overview` | Back to Overview | **S00** (Overview (Dashboard)) | `None` |

#### ทางเข้าสู่หน้านี้จากหน้าอื่น (4 ทางเข้า):

| มาจากหน้า (From) | ผ่านปุ่ม (Action) | ข้อความปุ่ม |
|:---:|---|---|
| **S00** (Overview (Dashboard)) | `btn-research-a-clip` | Research a Clip |
| **S00** (Overview (Dashboard)) | `nav-research` | 01 Research |
| **S02** (Research Detail / AI Analysis) | `btn-back-to-research` | Back to Research |
| **S04** (Library (2 Vaults: Content & Packaging)) | `btn-empty-research` | Research a Clip |

---

### S02 — Research Detail / AI Analysis

- **Stage:** `Research`  
- **หน้าที่:** ให้ผู้ใช้เข้าใจทั้ง WHAT และ HOW ก่อนตัดสินใจเก็บ  
- **คำอธิบายย่อย:** วิเคราะห์สองเลนส์ WHAT (สาระ) vs HOW (ลีลา) พร้อมหลักฐานและไทม์โค้ด  

#### ปุ่มที่กดออกจากหน้านี้ (5 รายการ):

| รหัสปุ่ม (Action) | ข้อความ (Label) | ปลายทาง (To) | State ที่เปลี่ยนใน Store |
|---|---|:---:|---|
| `btn-save-to-library` | Save to Library | **S03** (Save to Library (Modal / Gate)) | `None (opens Human Save Gate modal)` |
| `btn-back-to-research` | Back to Research | **S01** (Research Entry & Inbox) | `None (video NOT saved to Vault, remains in Inbox as Analyzed · Not saved - D1)` |
| `btn-analyze-again` | Analyze Again | **S02** (Research Detail / AI Analysis) | `analyses: appends new version (v2, v3) without altering existing savedNotes` |
| `tab-content-what` | Content (WHAT) | **S02** (Research Detail / AI Analysis) | `activeTab: "content"` |
| `tab-packaging-how` | Packaging (HOW) | **S02** (Research Detail / AI Analysis) | `activeTab: "packaging"` |

#### ทางเข้าสู่หน้านี้จากหน้าอื่น (5 ทางเข้า):

| มาจากหน้า (From) | ผ่านปุ่ม (Action) | ข้อความปุ่ม |
|:---:|---|---|
| **S00** (Overview (Dashboard)) | `btn-view-recent-research` | View Recent Research |
| **S01** (Research Entry & Inbox) | `btn-analyze-clip` | Analyze Clip |
| **S01** (Research Entry & Inbox) | `btn-upload-owned` | Upload Owned Video |
| **S01** (Research Entry & Inbox) | `btn-open-inbox-row` | Open Inbox Item |
| **S03** (Save to Library (Modal / Gate)) | `btn-cancel-save` | Cancel |

---

### S03 — Save to Library (Modal / Gate)

- **Stage:** `Save Gate`  
- **หน้าที่:** ให้คนเป็นเจ้าของเหตุผลในการเก็บ Reference เข้าสู่ 2 Vaults แยกกัน  
- **คำอธิบายย่อย:** Human Save Gate: Founder เลือกเก็บ Content, Packaging หรือ Both พร้อมระบุ WHY  

#### ปุ่มที่กดออกจากหน้านี้ (5 รายการ):

| รหัสปุ่ม (Action) | ข้อความ (Label) | ปลายทาง (To) | State ที่เปลี่ยนใน Store |
|---|---|:---:|---|
| `btn-confirm-save` | Confirm Save to Library | **S03** (Save to Library (Modal / Gate)) | `savedNotes: creates 1 note per selected lens (content/packaging/both) with Founder WHY; updates source status to Saved` |
| `btn-cancel-save` | Cancel | **S02** (Research Detail / AI Analysis) | `None` |
| `btn-view-in-library` | View in Library | **S04** (Library (2 Vaults: Content & Packaging)) | `activeVaultTab: set to newly saved lens ("content" or "packaging")` |
| `btn-use-in-remix` | Use in Remix | **S06** (Remix Reference Picker) | `remixSelection: automatically adds saved note to basket (T14)` |
| `btn-edit-existing-note` | Edit Existing Note | **S05** (Saved Reference Detail) | `activeNoteId: sets existing note context` |

#### ทางเข้าสู่หน้านี้จากหน้าอื่น (1 ทางเข้า):

| มาจากหน้า (From) | ผ่านปุ่ม (Action) | ข้อความปุ่ม |
|:---:|---|---|
| **S02** (Research Detail / AI Analysis) | `btn-save-to-library` | Save to Library |

---

### S04 — Library (2 Vaults: Content & Packaging)

- **Stage:** `Ingredients`  
- **หน้าที่:** หาและหยิบ Reference มาใช้ในงานใหม่ได้จริง แยกสาระออกจากวิธีเล่า  
- **คำอธิบายย่อย:** คลังวัตถุดิบ 2 คลัง (Content Vault & Packaging Vault) พร้อมระบบค้นหาและตัวกรอง  

#### ปุ่มที่กดออกจากหน้านี้ (8 รายการ):

| รหัสปุ่ม (Action) | ข้อความ (Label) | ปลายทาง (To) | State ที่เปลี่ยนใน Store |
|---|---|:---:|---|
| `tab-content-vault` | Content Vault | **S04** (Library (2 Vaults: Content & Packaging)) | `activeVault: "content"` |
| `tab-packaging-vault` | Packaging Vault | **S04** (Library (2 Vaults: Content & Packaging)) | `activeVault: "packaging"` |
| `btn-vault-card` | View Saved Reference | **S05** (Saved Reference Detail) | `activeNoteId: sets selected note context` |
| `btn-use-in-remix` | Use in Remix | **S06** (Remix Reference Picker) | `remixSelection: adds reference noteId to content/packaging array` |
| `btn-start-remix` | Start Remix with Basket | **S06** (Remix Reference Picker) | `None (proceeds with current remixSelection)` |
| `btn-empty-research` | Research a Clip | **S01** (Research Entry & Inbox) | `None` |
| `btn-empty-sample` | Load Sample References | **S04** (Library (2 Vaults: Content & Packaging)) | `savedNotes: seeds founder sample references (Story A, B, E)` |
| `btn-back` | Back to Overview | **S00** (Overview (Dashboard)) | `None` |

#### ทางเข้าสู่หน้านี้จากหน้าอื่น (7 ทางเข้า):

| มาจากหน้า (From) | ผ่านปุ่ม (Action) | ข้อความปุ่ม |
|:---:|---|---|
| **S00** (Overview (Dashboard)) | `btn-open-library` | Open My Library |
| **S00** (Overview (Dashboard)) | `nav-library` | 02 My Library |
| **S03** (Save to Library (Modal / Gate)) | `btn-view-in-library` | View in Library |
| **S05** (Saved Reference Detail) | `btn-back-to-library` | Back to Library |
| **S05** (Saved Reference Detail) | `btn-remove-from-vault` | Remove from This Vault |
| **S06** (Remix Reference Picker) | `btn-back-to-library` | Back to Library |
| **S06** (Remix Reference Picker) | `btn-browse-vault` | Browse Vault for More |

---

### S05 — Saved Reference Detail

- **Stage:** `Ingredients`  
- **หน้าที่:** อ่าน “ทำไมตอนนั้นฉันถึง Save” แล้วนำไปใช้ต่อ พร้อมประวัติการแก้ไข  
- **คำอธิบายย่อย:** ดูรายละเอียด Reference ที่บันทึกไว้, แก้ไข Founder WHY และจัดการ Lens  

#### ปุ่มที่กดออกจากหน้านี้ (4 รายการ):

| รหัสปุ่ม (Action) | ข้อความ (Label) | ปลายทาง (To) | State ที่เปลี่ยนใน Store |
|---|---|:---:|---|
| `btn-back-to-library` | Back to Library | **S04** (Library (2 Vaults: Content & Packaging)) | `None` |
| `btn-use-in-remix` | Use in Remix | **S06** (Remix Reference Picker) | `remixSelection: adds current reference to basket` |
| `btn-save-note-edit` | Save Note Edit | **S05** (Saved Reference Detail) | `savedNotes: updates WHY and logs edit in note-history; does NOT alter analysis or drafts (A06)` |
| `btn-remove-from-vault` | Remove from This Vault | **S04** (Library (2 Vaults: Content & Packaging)) | `savedNotes: deletes note for current lens only; retains other lens and source (A05/T18)` |

#### ทางเข้าสู่หน้านี้จากหน้าอื่น (3 ทางเข้า):

| มาจากหน้า (From) | ผ่านปุ่ม (Action) | ข้อความปุ่ม |
|:---:|---|---|
| **S03** (Save to Library (Modal / Gate)) | `btn-edit-existing-note` | Edit Existing Note |
| **S04** (Library (2 Vaults: Content & Packaging)) | `btn-vault-card` | View Saved Reference |
| **S08** (Concept Detail / Script Draft) | `btn-view-source-trace` | View Source Reference |

---

### S06 — Remix Reference Picker

- **Stage:** `Remix`  
- **หน้าที่:** หยิบวัตถุดิบจากคลังได้หลายชิ้นตามใจผู้ใช้ ไม่จำกัดอัตราส่วน 1:1  
- **คำอธิบายย่อย:** เลือกวัตถุดิบจากทั้ง 2 คลังลงตะกร้า (Content >= 1, Packaging >= 0)  

#### ปุ่มที่กดออกจากหน้านี้ (4 รายการ):

| รหัสปุ่ม (Action) | ข้อความ (Label) | ปลายทาง (To) | State ที่เปลี่ยนใน Store |
|---|---|:---:|---|
| `btn-continue-to-remix` | Continue to Remix | **S07** (Remix Workspace / Synthesis) | `remixSession: initializes active remix workspace with chosen ingredients` |
| `btn-back-to-library` | Back to Library | **S04** (Library (2 Vaults: Content & Packaging)) | `None (remixSelection strictly preserved in store - D10)` |
| `btn-browse-vault` | Browse Vault for More | **S04** (Library (2 Vaults: Content & Packaging)) | `None (remixSelection preserved)` |
| `btn-discard-selection` | Discard Selection | **S06** (Remix Reference Picker) | `remixSelection: resets content and packaging arrays to empty after user confirmation` |

#### ทางเข้าสู่หน้านี้จากหน้าอื่น (9 ทางเข้า):

| มาจากหน้า (From) | ผ่านปุ่ม (Action) | ข้อความปุ่ม |
|:---:|---|---|
| **S00** (Overview (Dashboard)) | `btn-start-remix` | Start Remix |
| **S00** (Overview (Dashboard)) | `btn-continue-work` | Continue work |
| **S00** (Overview (Dashboard)) | `nav-remix` | 03 Remix Studio |
| **S03** (Save to Library (Modal / Gate)) | `btn-use-in-remix` | Use in Remix |
| **S04** (Library (2 Vaults: Content & Packaging)) | `btn-use-in-remix` | Use in Remix |
| **S04** (Library (2 Vaults: Content & Packaging)) | `btn-start-remix` | Start Remix with Basket |
| **S05** (Saved Reference Detail) | `btn-use-in-remix` | Use in Remix |
| **S07** (Remix Workspace / Synthesis) | `btn-back-to-picker` | Back to Ingredients Picker |
| **S09** (Content Board / Handoff) | `btn-start-new-remix` | New Remix |

---

### S07 — Remix Workspace / Synthesis

- **Stage:** `Remix`  
- **หน้าที่:** สร้างเรื่องใหม่จากการแยก WHAT + HOW อย่างแท้จริง พร้อม Claims & Rights Checker  
- **คำอธิบายย่อย:** สตูดิโอรีมิกซ์: ผสมผสานวัตถุดิบ + ทิศทางแบรนด์ สังเคราะห์ Original Concepts 2-3 แบบ  

#### ปุ่มที่กดออกจากหน้านี้ (6 รายการ):

| รหัสปุ่ม (Action) | ข้อความ (Label) | ปลายทาง (To) | State ที่เปลี่ยนใน Store |
|---|---|:---:|---|
| `btn-back-to-picker` | Back to Ingredients Picker | **S06** (Remix Reference Picker) | `None (remixSelection strictly preserved - D10)` |
| `btn-generate-concepts` | Create Original Concepts | **S07** (Remix Workspace / Synthesis) | `concepts: generates 2-3 distinct original concepts with source trace, hooks, and story beats` |
| `btn-remix-again` | Remix Again | **S07** (Remix Workspace / Synthesis) | `concepts: regenerates concepts based on updated direction` |
| `btn-refine-angle` | Refine This Angle | **S07** (Remix Workspace / Synthesis) | `concepts: refines specific concept with instruction without restarting research (A18)` |
| `btn-open-concept-detail` | Open Concept Script Draft | **S08** (Concept Detail / Script Draft) | `activeConceptId: sets selected concept for script expansion` |
| `btn-save-as-draft` | Save as Draft to Board | **S09** (Content Board / Handoff) | `boardItems: appends item with stage "Draft" and provenance snapshots` |

#### ทางเข้าสู่หน้านี้จากหน้าอื่น (3 ทางเข้า):

| มาจากหน้า (From) | ผ่านปุ่ม (Action) | ข้อความปุ่ม |
|:---:|---|---|
| **S06** (Remix Reference Picker) | `btn-continue-to-remix` | Continue to Remix |
| **S08** (Concept Detail / Script Draft) | `btn-back-to-workspace` | Back to Remix Workspace |
| **S09** (Content Board / Handoff) | `btn-back-to-remix` | Back to Remix Workspace |

---

### S08 — Concept Detail / Script Draft

- **Stage:** `Remix`  
- **หน้าที่:** เปลี่ยน Idea เป็นงานที่จะถ่ายและตัดได้ บันทึกเป็น Remix Draft  
- **คำอธิบายย่อย:** พัฒนาไอเดียเป็นสคริปต์ฉบับร่าง (Hook, Outline, Scene/Sound, Proof, CTA)  

#### ปุ่มที่กดออกจากหน้านี้ (4 รายการ):

| รหัสปุ่ม (Action) | ข้อความ (Label) | ปลายทาง (To) | State ที่เปลี่ยนใน Store |
|---|---|:---:|---|
| `btn-back-to-workspace` | Back to Remix Workspace | **S07** (Remix Workspace / Synthesis) | `None` |
| `btn-apply-edit` | Apply Edit | **S08** (Concept Detail / Script Draft) | `concepts/boardItems: updates script text, hooks, scene directions based on natural language instruction` |
| `btn-save-remix-draft` | Save Remix Draft | **S09** (Content Board / Handoff) | `boardItems: commits draft to board with stage "Draft" and immutable provenance snapshots; does NOT approve or publish` |
| `btn-view-source-trace` | View Source Reference | **S05** (Saved Reference Detail) | `activeNoteId: opens provenance reference snapshot` |

#### ทางเข้าสู่หน้านี้จากหน้าอื่น (3 ทางเข้า):

| มาจากหน้า (From) | ผ่านปุ่ม (Action) | ข้อความปุ่ม |
|:---:|---|---|
| **S00** (Overview (Dashboard)) | `btn-view-remix-draft` | View Remix Draft |
| **S07** (Remix Workspace / Synthesis) | `btn-open-concept-detail` | Open Concept Script Draft |
| **S09** (Content Board / Handoff) | `btn-open-concept-draft` | Open Draft in Script Editor |

---

### S09 — Content Board / Handoff

- **Stage:** `Approve`  
- **หน้าที่:** เก็บเวอร์ชันและจัดขั้นตอนอนุมัติอย่างปลอดภัย พร้อม Director Brief Handoff  
- **คำอธิบายย่อย:** บอร์ดติดตามขั้นตอนอนุมัติบท (Draft -> Needs Review -> Approved -> Production)  

#### ปุ่มที่กดออกจากหน้านี้ (8 รายการ):

| รหัสปุ่ม (Action) | ข้อความ (Label) | ปลายทาง (To) | State ที่เปลี่ยนใน Store |
|---|---|:---:|---|
| `btn-submit-review` | Submit for Review | **S09** (Content Board / Handoff) | `boardItems: transitions item stage from "Draft" to "Needs Review"` |
| `btn-return-to-draft` | Return to Draft | **S09** (Content Board / Handoff) | `boardItems: transitions item stage from "Needs Review" back to "Draft"` |
| `btn-approve-concept` | Approve Concept | **S09** (Content Board / Handoff) | `boardItems: stage -> "Approved"; approvedRevisions: appends deep-frozen immutable revision + Director Brief (A20)` |
| `btn-open-concept-draft` | Open Draft in Script Editor | **S08** (Concept Detail / Script Draft) | `activeConceptId: sets draft context` |
| `btn-start-new-remix` | New Remix | **S06** (Remix Reference Picker) | `None` |
| `btn-export-director-brief` | Export Director Brief | **S09** (Content Board / Handoff) | `None (triggers client-side file download JSON/Markdown)` |
| `btn-send-to-mew-edit` | Send to MEW EDIT | **S09** (Content Board / Handoff) | `handoff: triggers handoff only when verified; otherwise displays transparent blocked notice (A21)` |
| `btn-back-to-remix` | Back to Remix Workspace | **S07** (Remix Workspace / Synthesis) | `None` |

#### ทางเข้าสู่หน้านี้จากหน้าอื่น (3 ทางเข้า):

| มาจากหน้า (From) | ผ่านปุ่ม (Action) | ข้อความปุ่ม |
|:---:|---|---|
| **S00** (Overview (Dashboard)) | `nav-board` | 04 Content Board |
| **S07** (Remix Workspace / Synthesis) | `btn-save-as-draft` | Save as Draft to Board |
| **S08** (Concept Detail / Script Draft) | `btn-save-remix-draft` | Save Remix Draft |

---

## 5. ตารางเมทริกซ์สองมิติข้ามหน้าจอ (2D Screen-to-Screen Grid)

แถวแนวนอน = หน้าเริ่มต้น (From) | แถวแนวตั้ง = หน้าปลายทาง (To)

| From \ To | **S00** | **S01** | **S02** | **S03** | **S04** | **S05** | **S06** | **S07** | **S08** | **S09** |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **S00** | - | ✅ (2) | ✅ (1) | - | ✅ (2) | - | ✅ (3) | - | ✅ (1) | ✅ (1) |
| **S01** | ✅ (1) | - | ✅ (3) | - | - | - | - | - | - | - |
| **S02** | - | ✅ (1) | ✅ (3) | ✅ (1) | - | - | - | - | - | - |
| **S03** | - | - | ✅ (1) | ✅ (1) | ✅ (1) | ✅ (1) | ✅ (1) | - | - | - |
| **S04** | ✅ (1) | ✅ (1) | - | - | ✅ (3) | ✅ (1) | ✅ (2) | - | - | - |
| **S05** | - | - | - | - | ✅ (2) | ✅ (1) | ✅ (1) | - | - | - |
| **S06** | - | - | - | - | ✅ (2) | - | ✅ (1) | ✅ (1) | - | - |
| **S07** | - | - | - | - | - | - | ✅ (1) | ✅ (3) | ✅ (1) | ✅ (1) |
| **S08** | - | - | - | - | - | ✅ (1) | - | ✅ (1) | ✅ (1) | ✅ (1) |
| **S09** | - | - | - | - | - | - | ✅ (1) | ✅ (1) | ✅ (1) | ✅ (5) |

---

## 6. รายงานการตรวจสอบความถูกต้อง (Automated Verification Report)

- [x] **ตรวจสอบความถูกต้อง 100%**: ทุกแถวในตาราง `TRANSITIONS` ชี้ไปยังหน้าจอในสารบบ `SCREENS` ที่มีอยู่จริง
- [x] **ไม่มี Dead-End หรือ Broken Links**: ทุกหน้ามีทางไปต่อหรือปุ่ม Back ตามหลักการ D10
- [x] **Store Selection Preservation (D10)**: ทุกการเปลี่ยนหน้าและการกด Back ไม่กระทบค่า `remixSelection` ใน store
- [x] **Human Save Gate Enforcement**: การออกจาก S02 โดยไม่บันทึก (ไป S01 หรือ S00) จะไม่นำคลิปเข้า Vault โดยเด็ดขาด
- [x] **Immutable Revision Guard**: ปุ่ม Approve Concept ใน S09 บันทึกลง `approvedRevisions` แบบ Object.freeze ล็อกไม่ให้แก้ไข

