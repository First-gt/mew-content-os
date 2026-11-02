# MEW Content OS — UX Copy Guide & Forbidden Terms Dictionary

คู่มือคำศัพท์และข้อความในส่วนประสานผู้ใช้ (UX Copy Dictionary) ของระบบ **MEW Content OS** อ้างอิงตามข้อกำหนดของ Founder UX Spec และกฎเหล็กทั้ง 10 ข้อ เพื่อสร้างความสอดคล้อง ชัดเจน และป้องกันการบิดเบือนสเปกทั้งระบบ

---

## 1. Approved Terminology (คำศัพท์ที่ได้รับอนุมัติอย่างเป็นทางการ)

ข้อความหลักทั้งหมดถูกเก็บและ export จาก [`src/modules/copy.js`](file:///D:/project/src/modules/copy.js) เพื่อให้คอมโพเนนต์หน้าบ้านเรียกใช้อย่างเป็นมาตรฐานเดียวกัน

| Context / Screen | Approved Term (EN) | Approved Term (TH) | คีย์ใน `copy.js` | วัตถุประสงค์และข้อกำหนด |
|---|---|---|---|---|
| Ingestion & Ingestion Action | `Analyze Clip` | `วิเคราะห์คลิป` | `ANALYZE_CLIP` | ผู้ใช้เป็นผู้สั่งวิเคราะห์คลิป ห้ามใช้คำว่า Clone หรือ Copy |
| Inbox Item Status | `Analyzed · Not saved` | `วิเคราะห์แล้ว · ยังไม่ได้เก็บ` | `ANALYZED_NOT_SAVED` | แสดงสถานะว่าวิเคราะห์เสร็จแล้วแต่ยังไม่เข้า Vault (กฎข้อ 1: Analyze ≠ Save) |
| Save Reference Action | `Save to Library` | `บันทึกเข้าคลัง` | `SAVE_TO_LIBRARY` | การตัดสินใจคัดเลือกวัตถุดิบเข้าคลังโดย Founder เท่านั้น |
| Dual-Vault Lenses | `Content (WHAT)`<br>`Packaging (HOW)`<br>`Both` | `สาระ (WHAT)`<br>`จังหวะ (HOW)`<br>`ทั้งสองเลนส์` | `LENSES` | 2 คลังแยกอิสระจากกัน (กฎข้อ 2 & 3) |
| Save WHY Prompt | `Why do you want to save this reference?` | `ทำไมคุณอยากเก็บสิ่งนี้?` | `WHY_PROMPT` | บังคับให้ Founder ระบุเหตุผลเชิงลึกก่อนบันทึก (Both = ต้องกรอก 2 ช่องแยกกัน) |
| Basket & Reference Selection | `Use in Remix` | `นำไปรีมิกซ์` | `USE_IN_REMIX` | การเลือกไอเท็มเข้าตะกร้าวัตถุดิบสำหรับการสังเคราะห์คอนเซปต์ |
| Synthesis Trigger CTA | `Create Original Concepts` | `สังเคราะห์ Original Concepts` | `CREATE_ORIGINAL_CONCEPTS` | สังเคราะห์ไอเดียใหม่ 2–3 แบบ พร้อม source trace (กฎข้อ 6) |
| Script Draft Commitment | `Save Remix Draft` | `บันทึกร่างสคริปต์` | `SAVE_REMIX_DRAFT` | บันทึกร่างสคริปต์โดยไม่ข้ามขั้นตอนไป Publish (กฎข้อ 7) |
| Governance & Approval | `Approve Concept` | `อนุมัติคอนเซปต์` | `APPROVE_CONCEPT` | อนุมัติคอนเซปต์เพื่อส่งมอบเข้าสู่ Director Brief ต่อไป |

---

## 2. Forbidden Terms (คำต้องห้ามเด็ดขาดและเหตุผล)

ข้อกำหนดเชิงลบขั้นเด็ดขาด (Strict Negative Constraints) เพื่อป้องกันความผิดพลาดทางความหมายและความเข้าใจผิดของผู้ใช้:

| Forbidden Term (คำต้องห้าม) | เหตุผลและข้อกำหนดตามสเปก | คำที่ถูกต้องที่ต้องใช้แทน |
|---|---|---|
| ❌ `Clone Clip` | ผิดเจตนารมณ์ระบบ — ระบบไม่ได้ก๊อปปี้คลิปคนอื่น แต่ทำ Original Remix ที่มีอัตลักษณ์ของตนเอง | ใช้ `Analyze Clip` หรือ `Remix` |
| ❌ `Added to Library`<br>*(ขณะที่สถานะยังไม่ save)* | ผิดกฎข้อ 1 (Analyze ≠ Save) — AI ห้ามบันทึกเข้า Vault เอง คลิปที่เพิ่งวิเคราะห์ต้องไม่ถูกแสดงว่าอยู่ในคลัง | ใช้ `Analyzed · Not saved` / `วิเคราะห์แล้ว · ยังไม่ได้เก็บ` |
| ❌ `AI Auto Save` | ห้าม AI บันทึกหรือเลือกของเข้าคลังแทนมนุษย์ การคัดสรรต้องมาจาก Founder พร้อมเหตุผล WHY เสมอ | ใช้ `Save to Library` หลังมนุษย์ตัดสินใจ |
| ❌ `Export`<br>*(แทน Save)* | กฎข้อ 7: การบันทึกคลัง/ร่างสคริปต์คือการ commit ข้อมูลภายในระบบ ไม่ใช่การ Export ไฟล์ออกภายนอก *(ยกเว้นการ Export Director Brief ใน S09 ซึ่งเป็นการ export ไฟล์บรีฟเฉพาะทาง)* | ใช้ `Save to Library` หรือ `Save Remix Draft` |
| ❌ `Publish Now` | ผิดกฎข้อ 7 — ระบบสิ้นสุดที่การส่งต่อ Director Brief สู่ทีมโปรดักชัน ไม่มีปุ่มโพสต์หรือยิงคลิปขึ้นโซเชียลตรงจากเครื่องมือ | ใช้ `Approve Concept` หรือ `Export Director Brief` |
| ❌ `Stitch Source Videos` | ผิดกฎข้อ 6 — ห้ามตัดต่อฟุตเทจต้นฉบับมาเรียงต่อกัน ผลลัพธ์ต้องเป็น Original Concepts ที่เขียนใหม่และอ้างอิง source trace | ใช้ `Create Original Concepts` |
| ❌ `Save Research`<br>*(แทน Save Draft)* | กฎข้อ 7 — มีความสับสนระหว่างการบันทึก Reference กับการบันทึกร่างสคริปต์ | ใช้ `Save to Library` สำหรับคลิป และ `Save Remix Draft` สำหรับสคริปต์ |
| ❌ สถิติปลอม เช่น `12 สัปดาห์`, `+12 สัปดาห์นี้`, `คะแนน AI 95%` | กฎเหล็กห้ามใส่ตัวเลขสถิติปลอมหรือ badge เปอร์เซ็นต์ที่กุขึ้นมาเด็ดขาด | แสดงเฉพาะข้อมูลจริงและ context ตรงไปตรงมา |

---

## 3. การใช้งานในโค้ด JavaScript Frontend

นำเข้าข้อความจาก [`src/modules/copy.js`](file:///D:/project/src/modules/copy.js):

```javascript
import { COPY, getCopy } from './modules/copy.js';

// เข้าถึงออบเจกต์ข้อความโดยตรง
const buttonText = COPY.SAVE_TO_LIBRARY.th; // "บันทึกเข้าคลัง"
const statusBadge = COPY.ANALYZED_NOT_SAVED.en; // "Analyzed · Not saved"

// หรือใช้งานผ่าน getCopy helper
const label = getCopy('ANALYZE_CLIP', 'th'); // "วิเคราะห์คลิป"
```

---

## 4. Linter Script Execution

สคริปต์ [`scripts/lint-copy.js`](file:///D:/project/scripts/lint-copy.js) สแกนไฟล์ UI ทั้งหมดในไดเรกทอรี `src/` ตรวจสอบทั้งคำต้องห้าม สถิติปลอม และข้อความที่ละเมิดกฎ:

```bash
node scripts/lint-copy.js
```

- **Exit code 0**: ผ่านการตรวจสอบ 100% สะอาด ไร้คำต้องห้าม
- **Exit code 1**: พบข้อความที่ละเมิดข้อกำหนด พร้อมระบุไฟล์ บรรทัด และเหตุผลที่ไม่อนุญาต
