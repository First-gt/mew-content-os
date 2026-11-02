#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
==============================================================================
LOOP ENGINEER (borntodev edition)
"อย่ามัวแต่นั่ง Prompt ให้ตีกรอบและสั่งให้ AI รัน Loop ตรวจสอบจริงทีละหัวข้อ"
==============================================================================
Autonomous Closed-Loop Engineering CLI for MEW CONTENT OS
Based on the 8 Pillars from borntodev:
  1. Scheduling & Automation (Routine / Event / Trigger)
  2. Task Discovery & Triage (plan.md backlog & scope filtering)
  3. Task Decomposition (1 รอบ = 1 หัวข้อ, escape Dumb Zone, DOD definition)
  4. Orchestration (Architect QA vs Worker Coder roles)
  5. Verification & Closed Loop (Deterministic Node/Static test gates, Anti-Doom Loop)
  6. Isolation (Workspace boundary preservation)
  7. Connectors & Tooling (Terminal execution, Stdin pipe, Multi-account CLI)
  8. Persistent Memory (plan.md checklist state tracking with [x])

Usage:
  python loop_engineer.py                     # รันแบบอัตโนมัติทีละหัวข้อตามลำดับใน plan.md
  python loop_engineer.py --agent             # Alias สำหรับรันโหมด Agent อัตโนมัติ
  python loop_engineer.py --status            # ดูตารางสรุปสถานะและ DOD ทุกหัวข้องาน
  python loop_engineer.py --watch             # เปิดโหมด Routine เฝ้าตรวจจับงานใหม่ใน plan.md
  python loop_engineer.py --task "..."        # สั่งให้ AI ร่างและทำ Topic ใหม่ตามบรีฟ
  python loop_engineer.py --assemble          # ประกอบ components เข้าสู่ index.html
  python loop_engineer.py --topic 0           # รันเฉพาะหัวข้อเดี่ยว (เช่น หัวข้อที่ 0 หรือ 2)
==============================================================================
"""

import sys
import subprocess
from pathlib import Path

def main():
    script_path = Path(__file__).parent / "orchestrator_loop.py"
    if not script_path.exists():
        print(f"[!] Error: ไม่พบไฟล์ orchestrator_loop.py: {script_path}")
        sys.exit(1)

    cmd = [sys.executable, str(script_path)]

    raw_args = sys.argv[1:]

    # Support aliases and clean flags
    processed_args = []
    has_plan = False

    plan_check_flags = ["--plan", "--blueprint", "-h", "--help", "--status", "--live", "--web", "--port", "--list-accounts", "--login-master", "--login-worker", "--save-master", "--save-worker", "--assemble"]

    for arg in raw_args:
        if arg in plan_check_flags:
            has_plan = True
        processed_args.append(arg)

    cmd.extend(processed_args)

    if not has_plan:
        cmd.extend(["--plan", "plan.md"])

    try:
        proc = subprocess.run(cmd)
        sys.exit(proc.returncode)
    except KeyboardInterrupt:
        print("\n[*] ยกเลิกการทำงาน Loop Engineer เรียบร้อยแล้ว")
        sys.exit(0)

if __name__ == "__main__":
    main()
