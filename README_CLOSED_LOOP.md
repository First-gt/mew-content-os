# Autonomous 2-Agent Closed-Loop Engineering System
## Antigravity CLI Dual-Account Edition (Zero API Key) & Thai Interface

ระบบวิศวกรรม 2-Agent Closed Loop อัตโนมัติในภาษา Python ขับเคลื่อนด้วย **Google Antigravity CLI (`agy`)**:
- **Agent 1 (Orchestrator / Master / QA Tester)**: `blokg6910@gmail.com` (Google AI Pro) — ใช้โมเดล **Gemini 4 Argon** (`gemini-4-argon-high`) ถือ Blueprint สั่งงานและตรวจ QA
- **Agent 2 (Worker / Frontend Coder)**: `blokgamwer@gmail.com` — ใช้โมเดล **Gemini 3.8 Flash** (`gemini-3.8-flash-medium`) โค้ด HTML5, Modern CSS, Client-side JS
- **โหมดการทำงาน:** **ไม่จำกัดเวลา (Unlimited Execution)** รองรับการรันลูปต่อเนื่องทั้งวันโดยไม่โดนตัดเวลา มีนาฬิกา Heartbeat นับเวลาสดใน Terminal ป้องกันการค้าง และส่งข้อมูลผ่าน STDIN ป้องกัน WinError 206

---

## ตรวจสอบสถานะบัญชี (Account Status)

```powershell
python orchestrator_loop.py --list-accounts
```

| บทบาท (Role) | หน้าที่ | บัญชี Google | โมเดลเริ่มต้น | สถานะ |
|---|---|---|---|---|
| **MASTER** | Agent 1 (หัวหน้า / QA Tester) | `blokg6910@gmail.com` (Google AI Pro) | `gemini-4-argon-high` | **พร้อมใช้งาน (READY)** |
| **WORKER** | Agent 2 (ช่างเขียนโค้ด / Coder) | `blokgamwer@gmail.com` | `gemini-3.8-flash-high` | **พร้อมใช้งาน (READY)** |

---

## คำสั่งสำหรับรันระบบ (Commands)

### แบบที่ 1: แนะนำที่สุด (Dual-Account Multi-Tier)
Agent 1 ใช้ Gemini 4 Argon สั่งงานและตรวจ QA ส่วน Agent 2 ใช้ Gemini 3.8 Flash เขียนโค้ดเร็วและไม่มีปัญหาโควต้าชนกัน:
```powershell
python orchestrator_loop.py --provider agy-cli --model gemini-4-argon-high
```

### แบบที่ 2: ใช้บัญชี Google AI Pro (Gemini 4 Argon) ทั้ง 2 ตัว
หากต้องการให้ทั้ง Agent 1 และ Agent 2 ใช้ Argon ทั้งคู่จากบัญชี `blokg6910@gmail.com`:
```powershell
python orchestrator_loop.py --provider agy-cli --model gemini-4-argon-high --share-master
```

### รันเฉพาะบางหัวข้อ (Scope Control)
```powershell
# รันเฉพาะหัวข้อที่ 1 (Dashboard)
python orchestrator_loop.py --provider agy-cli --start-topic 1 --end-topic 1

# รันตั้งแต่หัวข้อที่ 2 เป็นต้นไป
python orchestrator_loop.py --provider agy-cli --start-topic 2
```
