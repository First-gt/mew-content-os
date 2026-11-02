# รายงานการตรวจของเดิม (Audit เทียบสเปกกับของจริง) — Topic T00

เอกสารนี้จัดทำขึ้นตามข้อกำหนด **Topic T00** เพื่อตรวจสอบและเปรียบเทียบข้อกำหนดจาก `mew_handoff/MEW_Content_OS_Founder_UX_Spec_TH.md` และ Master Flow (`docs/mew-flow/assets/master-flow.png`, `docs/mew-flow/index.html`) กับส่วนประกอบที่มีอยู่จริงใน Repository ปัจจุบัน (`D:\project`) โดยเป็นการ **อ่านอย่างเดียว ไม่มีการดัดแปลงโค้ดระบบที่มีอยู่เดิม**

---

## ตารางสรุปการ Audit ระบบ (System Components Audit Matrix)

| ส่วนประกอบ | มีแล้ว/มีบางส่วน/ไม่มี/ตรวจไม่ได้ | หลักฐาน (path/ลิงก์) | แผน reuse |
|---|---|---|---|
| **Reference Vault** (Content Vault & Packaging Vault แยกอิสระ 2 มุมมอง) | **มีบางส่วน** | - `src/components/library.html`<br>- `src/modules/library.js`<br>- `src/styles/library.css`<br>- `output/src/components/library.html` | Reuse โครงสร้าง UI และการแสดง Card แยก 2 แท็บ (Content / Packaging) พร้อมระบบ Search & Tag filter นำมาเชื่อมต่อกับ State Store กลาง (`src/modules/store.js`), ระบบ Router (`src/modules/router.js`), ข้อความ UX Copy กลาง (`src/modules/copy.js`) พร้อมใส่ `data-testid` ครบถ้วน และปรับแต่งการแสดงผลตาม Mew V6.3 Design Tokens |
| **Content Board** (4 Stages: Draft, Needs Review, Approved, Ready for Production) | **มีบางส่วน** | - `src/components/content_board.html`<br>- `src/modules/content_board.js`<br>- `src/styles/content_board.css`<br>- `output/src/components/content_board.html` | Reuse โครงสร้าง Kanban Board 4 คอลัมน์ และ Modal แสดง Script Draft / Director Brief นำมาเชื่อมต่อกับ Central Store เพื่อควบคุม Stage Transition อย่างรัดกุม โดยแยกกระบวนการบันทึก Draft ออกจากการ Approve อย่างเด็ดขาด |
| **Scan Feed / RADAR** (ระบบค้นหาและวิเคราะห์คลิป) | **มีบางส่วน** | - `index.html` (Step 2: Scan Feed, `.sp-radar` animation & visual classes)<br>- `src/components/research.html`<br>- `src/modules/research.js` | Reuse คลาสสไตล์และแอนิเมชัน RADAR Pulse จาก `index.html` นำมาใช้ในหน้า Research Entry (S01 แท็บ Scan Feed) ในรูปแบบ Client-side Discovery จำลองที่โปร่งใส ไม่เปิด background worker หรือสร้าง API ภายนอกคู่ขนาน |
| **Business / Brand Brain** (Brand DNA, Value Proposition, Target Audience, Tone of Voice) | **มีบางส่วน** | - `src/components/onboarding.html`<br>- `src/modules/onboarding.js`<br>- `src/components/remix.html` (ส่วน Brand Context ใน Direction) | Reuse โครงสร้างฟิลด์และ Form layout ของ Brand Brain มาเก็บไว้ใน Client State เพื่อดึงไปแสดงผลและประยุกต์ใช้ใน Remix Studio (S07 ส่วน Creative Synthesis Direction) |
| **ตัวเชื่อม MEW EDIT** (MEW EDIT Integration / Auto-Cut Handoff) | **ไม่มี** | ไม่พบคลาส, API Adapter หรือ Integration Connector ไปยัง MEW EDIT ภายนอกในโค้ดปัจจุบัน (มีเพียงการกล่าวถึงในสเปกข้อ 4 หน้า S09 และผัง Master Flow) | สเปกข้อกำหนดระบุชัดเจนว่า "หาก Integration ยังไม่พร้อม ให้ระบุตรงไปตรงมา" จึงจัดทำฟังก์ชัน **Export Director Brief** (JSON/Markdown) ให้ Founder คัดลอก/ส่งต่อได้ทันที พร้อมปุ่มสถานะ `Send to MEW EDIT (Integration Disconnected / Manual Export Only)` โดยไม่สร้างการเชื่อมต่อหรือข้อมูลหลอก |
| **อ้างอิง Notion 1:** MEW Content OS V6 | **ตรวจไม่ได้** | `https://app.notion.com/p/3faaa78b0c7881e3b1b4f8ba7cac94ea` | **ตรวจไม่ได้**: ลิงก์เป็น Private Notion Workspace ภายใน ต้องล็อกอินด้วยบัญชีและสิทธิ์ของ Founder เท่านั้น จึงไม่สามารถเข้าถึงเนื้อหาได้ |
| **อ้างอิง Notion 2:** Social Media OS + Vault | **ตรวจไม่ได้** | `https://app.notion.com/p/3e7aa78b0c78814ab288dfab29b23748` | **ตรวจไม่ได้**: ลิงก์เป็น Private Notion Workspace ภายใน ต้องล็อกอินด้วยบัญชีและสิทธิ์ของ Founder เท่านั้น จึงไม่สามารถเข้าถึงเนื้อหาได้ |
| **อ้างอิง Notion 3:** Content Clone Engine UI Spec | **ตรวจไม่ได้** | `https://app.notion.com/p/3efaa78b0c7881fbbd77d3676d99b8c0` | **ตรวจไม่ได้**: ลิงก์เป็น Private Notion Workspace ภายใน ต้องล็อกอินด้วยบัญชีและสิทธิ์ของ Founder เท่านั้น จึงไม่สามารถเข้าถึงเนื้อหาได้ |
| **Creator Lab Third-party Reference** (ต้นแบบวิเคราะห์ IG Reels) | **มีแล้ว** (สำหรับอ้างอิง) | `creator_lab/creator-lab-main/README.md`, `creator_lab/creator-lab-main/lib/pipeline.mjs`, `creator_lab/creator-lab-main/public/app.js` | ใช้ศึกษาโครงสร้าง Hook Patterns และ Script Breakdowns สำหรับจัดฟิลด์ AI Packaging Decode ในฝั่งหน้าบ้าน โดยคงสถาปัตยกรรมเป็น Pure Client-Side 100% |
| **Interactive Master Flow Guide** (ผังและสเก็ตช์ไอเดีย Founder) | **มีแล้ว** | - `docs/mew-flow/index.html`<br>- `docs/mew-flow/assets/master-flow.png`<br>- `docs/mew-flow/assets/sketch-1-vaults.png` | ใช้เป็น Visual Reference ลำดับ Flow และการออกแบบ Context Bar, Step Indicators และ Transition States ตลอดทั้งระบบ |

---

## สรุปแนวทางการดำเนินงานสำหรับ T01 เป็นต้นไป

1. **สถาปัตยกรรม Pure Frontend (หน้าบ้านล้วน 100%)**:
   - ใช้ Semantic HTML5, Modern CSS, และ Vanilla JavaScript (ES6+ Modules)
   - ปราศจาก backend/server code, Node/Express, Python API, หรือ database engine ภายนอก
   - เก็บ State รวมศูนย์ที่ `src/modules/store.js` พร้อมฟังก์ชัน `seed()` และ `resetDemo()`
2. **Theme & Design System (mewteetawat.com V6.3)**:
   - Palette: Paper/Canvas `#fbfaf8`, Soft Surface `#f4f2ee`, Stone Line `#e7e3de`, Deep Ink `#11110f`, Muted `#6b6762`, Accent Coral `#ed765b`, Kicker Coral `#ae4f3a`, Electric Violet `#8a76ff`
   - Cards: สไตล์ `.mew-offer-card` (พื้นขาว `#ffffff`, เส้นขอบ 1px `#e7e3de`, ขอบบนสีเน้น 4px, เงา `0 18px 50px rgba(17,17,15,0.05)`, hover `translateY(-2px)`)
   - Buttons: Primary CTA แคปซูลมน (Pill) สี Deep Ink `#11110f` ตัวอักษรสีขาว, Ghost button พื้นขาวขอบเส้น
3. **ข้อปฏิบัติตามกฎเหล็กและข้อห้ามอย่างเคร่งครัด**:
   - **ห้ามใส่สถิติหรือตัวเลขลอยๆ**: ไม่ใส่ "12 สัปดาห์", "+12 สัปดาห์นี้" หรือเปอร์เซ็นต์ปลอม
   - **แยก 2 Vault เด็ดขาด**: Content Vault (WHAT) และ Packaging Vault (HOW)
   - **บังคับใส่ WHY**: ทุกครั้งที่มีการ Save (หากเลือก Both ต้องระบุ 2 เหตุผลแยกช่องชัดเจน)
   - **รวมศูนย์ UX Copy**: ใช้ข้อความ UI ตามสเปกข้อ 7 ผ่านโมดูล `src/modules/copy.js` เท่านั้น
