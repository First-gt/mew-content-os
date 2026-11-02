#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
==============================================================================
MEW CONTENT OS — HOST ANTIGRAVITY & POWERSHELL BRIDGE SERVICE (PORT 4002)
==============================================================================
Allows Docker / Mobile Gateway to:
1. Invoke Antigravity CLI ('agy.exe') on the Windows host.
2. Launch a genuine, visible PowerShell terminal window on the PC screen on demand!
==============================================================================
"""

import sys
import json
import uuid
import tempfile
import subprocess
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler

class AgyBridgeHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/health" or self.path == "/":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ready", "service": "antigravity-powershell-bridge"}).encode("utf-8"))
            return
        self.send_error(404)

    def do_POST(self):
        if self.path == "/start-powershell":
            try:
                # Spawns a genuine, visible PowerShell window on the Windows desktop running loop_engineer.py
                cmd_str = 'start "MEW Content OS - Agent 1 & Agent 2" powershell.exe -NoExit -Command "Set-Location D:\\project; python loop_engineer.py --agent"'
                subprocess.Popen(cmd_str, shell=True)

                try:
                    from live_state import LiveStateManager
                    LiveStateManager.get().emit_event("Remote Mobile", "START", "📱 สั่งเปิดหน้าต่าง PowerShell บนเครื่องคอมพิวเตอร์ผ่านมือถือเรียบร้อยแล้ว")
                except Exception:
                    pass

                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "success": True,
                    "message": "สั่งเปิดหน้าต่าง PowerShell บนจอคอมพิวเตอร์เรียบร้อยแล้ว!"
                }, ensure_ascii=False).encode("utf-8"))
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}, ensure_ascii=False).encode("utf-8"))
            return

        elif self.path == "/stop-powershell":
            try:
                # Safely terminate python processes running orchestrator_loop or loop_engineer
                subprocess.run(
                    ["powershell", "-Command", "Get-Process python -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match 'loop_engineer|orchestrator' -and $_.CommandLine -notmatch 'web_dashboard|agy_bridge' } | Stop-Process -Force"],
                    capture_output=True
                )
                try:
                    from live_state import LiveStateManager
                    LiveStateManager.get().emit_event("Remote Mobile", "STOP", "📱 ได้รับคำสั่งสั่งหยุด PowerShell และสั่งปิดเครื่องคอมพิวเตอร์ (Shutdown PC) จากมือถือ กำลังปิดเครื่องใน 5 วินาที...")
                    LiveStateManager.get().set_stage("STOPPED")
                except Exception:
                    pass

                # Remote Shutdown PC immediately as requested by the user
                subprocess.Popen(["shutdown", "/s", "/f", "/t", "5", "/c", "ปิดเครื่องคอมพิวเตอร์ตามคำสั่งจากมือถือ (Remote Mobile Shutdown)"])

                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "success": True,
                    "message": "สั่งปิด PowerShell และชัตดาวน์ปิดเครื่องคอมพิวเตอร์ (Shutdown PC) ใน 5 วินาทีเรียบร้อยแล้ว!"
                }, ensure_ascii=False).encode("utf-8"))
            except Exception as e:
                self.send_response(500)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}, ensure_ascii=False).encode("utf-8"))
            return

        elif self.path == "/run":
            try:
                length = int(self.headers.get("Content-Length", 0))
                body = self.rfile.read(length).decode("utf-8")
                data = json.loads(body)

                model = data.get("model", "gemini-3.8-flash-medium")
                prompt = data.get("prompt", "")
                profile_name = data.get("profile_name", "master")

                safe_prompt = prompt
                if len(safe_prompt) > 12000:
                    safe_prompt = safe_prompt[:12000] + "\n...[Context truncated safely for Windows CLI limit]"

                out_f = tempfile.NamedTemporaryFile(mode="w+", encoding="utf-8", delete=False)
                err_f = tempfile.NamedTemporaryFile(mode="w+", encoding="utf-8", delete=False)
                out_p = Path(out_f.name)
                err_p = Path(err_f.name)

                turn_id = uuid.uuid4().hex[:8]
                turn_log = Path(tempfile.gettempdir()) / f"agy_bridge_{turn_id}.log"

                full_cmd = [
                    "agy",
                    "--dangerously-skip-permissions",
                    "--disable-slash-commands",
                    "--model", model,
                    "--log-file", str(turn_log),
                    "--print", safe_prompt
                ]

                p = subprocess.Popen(
                    full_cmd,
                    stdin=subprocess.DEVNULL,
                    stdout=out_f,
                    stderr=err_f,
                    text=True,
                    encoding="utf-8",
                    errors="replace"
                )

                p.wait()

                out_f.close()
                err_f.close()

                stdout_text = out_p.read_text(encoding="utf-8", errors="replace")
                stderr_text = err_p.read_text(encoding="utf-8", errors="replace")

                resp_payload = {
                    "returncode": p.returncode,
                    "stdout": stdout_text.strip(),
                    "stderr": stderr_text.strip()
                }

                resp_bytes = json.dumps(resp_payload, ensure_ascii=False).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(resp_bytes)))
                self.end_headers()
                self.wfile.write(resp_bytes)

            except Exception as e:
                err_payload = json.dumps({"returncode": -1, "stdout": "", "stderr": str(e)}).encode("utf-8")
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(err_payload)

            finally:
                try:
                    out_f.close()
                    err_f.close()
                    if out_p.exists(): out_p.unlink()
                    if err_p.exists(): err_p.unlink()
                    if turn_log.exists(): turn_log.unlink()
                except Exception:
                    pass
            return

        self.send_error(404)

    def log_message(self, format, *args):
        return

def run_bridge(port: int = 4002):
    server = HTTPServer(("0.0.0.0", port), AgyBridgeHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()

if __name__ == "__main__":
    run_bridge()
