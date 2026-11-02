#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
==============================================================================
MEW CONTENT OS — REAL-TIME MOBILE & WEB DASHBOARD
==============================================================================
Provides a real-time, responsive mobile and desktop dashboard for monitoring
the Autonomous 2-Agent Engineering Closed-Loop system.

- Local Access:  http://localhost:4000
- Mobile Access: http://<LAN_IP>:4000 (e.g., http://192.168.1.101:4000)
- Endpoints:
    GET /             -> Modern Single-Page Dashboard (Mobile + Desktop)
    GET /api/status   -> Atomic real-time state from .live_state.json
    GET /api/events   -> Event stream of agent actions and tests
    GET /api/file     -> Read code file content on disk for review
==============================================================================
"""

import os
import sys
import json
import time
import socket
import argparse
import urllib.parse
from pathlib import Path
from http.server import HTTPServer, BaseHTTPRequestHandler
import threading
import subprocess

STATE_FILE = Path(".live_state.json")
PLAN_FILE = Path("plan.md")


AGENT_PROC = None

def start_agent_loop():
    global AGENT_PROC
    import urllib.request
    bridge_urls = [
        "http://host.docker.internal:4002/start-powershell",
        "http://localhost:4002/start-powershell"
    ]
    for url in bridge_urls:
        try:
            req = urllib.request.Request(url, data=b"{}", headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=5) as resp:
                res_data = json.loads(resp.read().decode("utf-8"))
                if res_data.get("success"):
                    return True, "สั่งเปิดหน้าต่าง PowerShell บนจอคอมพิวเตอร์เรียบร้อยแล้ว!"
        except Exception:
            pass

    if AGENT_PROC is None or AGENT_PROC.poll() is not None:
        cmd = [sys.executable, "loop_engineer.py", "--agent"]
        AGENT_PROC = subprocess.Popen(cmd)
        try:
            from live_state import LiveStateManager
            LiveStateManager.get().emit_event("Remote Control", "START", "ผู้ใช้กดเริ่มต้นรัน AI Agent จากมือถือผ่านเกตเวย์")
        except Exception:
            pass
        return True, "เริ่มต้นรัน AI Agent เรียบร้อยแล้ว"
    return False, "AI Agent กำลังทำงานอยู่แล้ว"

def stop_agent_loop():
    global AGENT_PROC
    import urllib.request
    bridge_urls = [
        "http://host.docker.internal:4002/stop-powershell",
        "http://localhost:4002/stop-powershell"
    ]
    for url in bridge_urls:
        try:
            req = urllib.request.Request(url, data=b"{}", headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=5) as resp:
                res_data = json.loads(resp.read().decode("utf-8"))
                if res_data.get("success"):
                    return True, res_data.get("message", "สั่งปิด PowerShell และชัตดาวน์ปิดเครื่องคอมพิวเตอร์เรียบร้อยแล้ว!")
        except Exception:
            pass

    if AGENT_PROC is not None and AGENT_PROC.poll() is None:
        try:
            AGENT_PROC.terminate()
            AGENT_PROC.wait(timeout=3)
        except Exception:
            try:
                AGENT_PROC.kill()
            except Exception:
                pass
        AGENT_PROC = None

    try:
        from live_state import LiveStateManager
        LiveStateManager.get().emit_event("Remote Control", "STOP", "📱 ได้รับคำสั่งสั่งหยุด PowerShell และชัตดาวน์ปิดเครื่องคอมพิวเตอร์ (Shutdown PC) จากมือถือ")
        LiveStateManager.get().set_stage("STOPPED")
    except Exception:
        pass

    if sys.platform == "win32":
        try:
            subprocess.Popen(["shutdown", "/s", "/f", "/t", "5", "/c", "ปิดเครื่องคอมพิวเตอร์ตามคำสั่งจากมือถือ (Remote Mobile Shutdown)"])
        except Exception:
            pass

    return True, "สั่งปิด PowerShell และชัตดาวน์ปิดเครื่องคอมพิวเตอร์ (Shutdown PC) ใน 5 วินาทีเรียบร้อยแล้ว!"

def is_agent_running():
    global AGENT_PROC
    return AGENT_PROC is not None and AGENT_PROC.poll() is None

def get_lan_ip() -> str:
    """Detect primary LAN IPv4 address for mobile access display."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.settimeout(0.5)
        # Connect to public DNS address without sending packets
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def get_live_state() -> dict:
    """Reads current live state, or builds fallback from plan.md."""
    if STATE_FILE.exists():
        try:
            return json.loads(STATE_FILE.read_text(encoding="utf-8"))
        except Exception:
            pass

    # Fallback to reading plan.md if .live_state.json does not exist yet
    completed_ids = []
    if PLAN_FILE.exists():
        import re
        p_text = PLAN_FILE.read_text(encoding="utf-8")
        for m in re.finditer(r'- \[x\] \*\*Topic (?:T|t)?(\d+):', p_text, re.I):
            completed_ids.append(int(m.group(1)))

    return {
        "updated_at": time.strftime("%H:%M:%S"),
        "status": "RUNNING",
        "agent_running": is_agent_running(),
        "agent_running": is_agent_running(),
        "active_topic": {
            "id": 6,
            "title": "Research Inbox + Status Badges",
            "stage": "IDLE",
            "iteration": 1,
            "max_iterations": 3,
            "target_files": [
                "src/components/research-inbox.html",
                "src/styles/research-inbox.css",
                "src/modules/research-inbox.js"
            ],
            "elapsed_seconds": 0
        },
        "completed_topic_ids": completed_ids,
        "total_topics": 35,
        "completion_percentage": round((len(completed_ids) / 35.0) * 100, 1),
        "recent_events": [
            {
                "time": time.strftime("%H:%M:%S"),
                "actor": "System",
                "type": "INIT",
                "message": f"Dashboard initialized. {len(completed_ids)}/35 topics verified complete."
            }
        ]
    }

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>MEW Content OS — Live 2-Agent Engineering</title>
  <style>
    :root {
      --bg: #0c0d10;
      --card-bg: #15161b;
      --card-border: #23252d;
      --card-hover: #1c1e25;
      --coral: #ed765b;
      --coral-glow: rgba(237, 118, 91, 0.25);
      --green: #10b981;
      --green-glow: rgba(16, 185, 129, 0.25);
      --amber: #f59e0b;
      --amber-glow: rgba(245, 158, 11, 0.25);
      --blue: #3b82f6;
      --text-main: #f3f4f6;
      --text-muted: #9ca3af;
      --text-dim: #6b7280;
      --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    body {
      background: var(--bg);
      color: var(--text-main);
      font-family: var(--font-sans);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      padding-bottom: 40px;
    }
    header {
      background: rgba(21, 22, 27, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--card-border);
      position: sticky;
      top: 0;
      z-index: 100;
      padding: 12px 16px;
    }
    .header-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-logo {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: linear-gradient(135deg, var(--coral), #d9534f);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 16px;
      color: #fff;
      box-shadow: 0 2px 10px var(--coral-glow);
    }
    .brand-title {
      font-size: 16px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .brand-sub {
      font-size: 11px;
      color: var(--text-muted);
    }
    .live-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 5px 10px;
      border-radius: 20px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      font-size: 11px;
      font-weight: 600;
      color: var(--green);
    }
    .pulse-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--green);
      animation: pulse 1.6s infinite ease-in-out;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.3); }
    }
    main {
      max-width: 1200px;
      margin: 0 auto;
      padding: 16px;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .hero-card {
      background: linear-gradient(145deg, #181920 0%, #131418 100%);
      border: 1px solid var(--card-border);
      border-radius: 14px;
      padding: 18px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    }
    .hero-top {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    @media (min-width: 640px) {
      .hero-top {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
    }
    .hero-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .hero-active-title {
      font-size: 20px;
      font-weight: 800;
      color: #fff;
      margin-top: 4px;
      line-height: 1.3;
    }
    .hero-stage {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      background: var(--amber-glow);
      color: var(--amber);
      border: 1px solid rgba(245, 158, 11, 0.3);
      width: fit-content;
    }
    .progress-bar-container {
      margin-top: 16px;
    }
    .progress-bar-info {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 6px;
    }
    .progress-track {
      background: #20222a;
      height: 10px;
      border-radius: 5px;
      overflow: hidden;
      position: relative;
    }
    .progress-fill {
      background: linear-gradient(90deg, var(--coral), #f59e0b, var(--green));
      height: 100%;
      border-radius: 5px;
      transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      width: 0%;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--card-border);
    }
    @media (min-width: 768px) {
      .meta-grid { grid-template-columns: repeat(4, 1fr); }
    }
    .meta-item {
      background: rgba(0,0,0,0.2);
      border-radius: 8px;
      padding: 10px;
      border: 1px solid rgba(255,255,255,0.03);
    }
    .meta-k {
      font-size: 11px;
      color: var(--text-dim);
      font-weight: 500;
    }
    .meta-v {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-main);
      margin-top: 2px;
      font-family: var(--font-mono);
    }
    .mobile-tip {
      background: rgba(59, 130, 246, 0.08);
      border: 1px dashed rgba(59, 130, 246, 0.3);
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 12px;
      color: #93c5fd;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      word-break: break-all;
    }
    .mobile-tip code {
      background: rgba(0,0,0,0.3);
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 700;
      color: #fff;
    }
    .section-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }
    .topics-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 14px;
    }
    @media (min-width: 900px) {
      .topics-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    .phase-column {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .phase-header {
      font-size: 13px;
      font-weight: 700;
      color: var(--text-muted);
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 8px;
      margin-bottom: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .topic-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 10px;
      border-radius: 8px;
      background: rgba(255,255,255,0.02);
      border: 1px solid transparent;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .topic-card:hover {
      background: var(--card-hover);
      border-color: rgba(255,255,255,0.08);
      transform: translateY(-1px);
    }
    .topic-card.approved {
      border-left: 3px solid var(--green);
    }
    .topic-card.running {
      border-left: 3px solid var(--amber);
      background: rgba(245, 158, 11, 0.06);
    }
    .topic-card.pending {
      border-left: 3px solid var(--card-border);
      opacity: 0.65;
    }
    .topic-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow: hidden;
      padding-right: 8px;
    }
    .topic-num {
      font-size: 11px;
      font-weight: 800;
      font-family: var(--font-mono);
      color: var(--text-dim);
    }
    .topic-name {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-main);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .topic-badge {
      font-size: 10px;
      font-weight: 700;
      padding: 3px 6px;
      border-radius: 4px;
      white-space: nowrap;
    }
    .topic-badge.badge-approved {
      background: rgba(16, 185, 129, 0.15);
      color: var(--green);
    }
    .topic-badge.badge-running {
      background: var(--amber-glow);
      color: var(--amber);
    }
    .topic-badge.badge-pending {
      background: rgba(255,255,255,0.05);
      color: var(--text-dim);
    }
    .feed-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 16px;
    }
    .feed-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 280px;
      overflow-y: auto;
      padding-right: 4px;
    }
    .feed-item {
      font-size: 12px;
      padding: 8px 10px;
      border-radius: 6px;
      background: rgba(0,0,0,0.25);
      border-left: 3px solid var(--card-border);
      display: flex;
      flex-direction: column;
      gap: 2px;
      font-family: var(--font-mono);
    }
    .feed-item.event-APPROVED { border-left-color: var(--green); }
    .feed-item.event-FAILED { border-left-color: #ef4444; }
    .feed-item.event-WORKER_CODING { border-left-color: var(--amber); }
    .feed-item.event-QA_TESTING { border-left-color: var(--blue); }
    .feed-item.event-HEALING { border-left-color: #ec4899; }
    .feed-time {
      font-size: 10px;
      color: var(--text-dim);
    }
    .feed-msg {
      color: var(--text-main);
      word-break: break-word;
    }
  </style>
</head>
<body>
  <header>
    <div class="header-inner">
      <div class="brand">
        <div class="brand-logo">M</div>
        <div>
          <div class="brand-title">MEW Content OS</div>
          <div class="brand-sub">Autonomous 2-Agent Closed Loop</div>
        </div>
      </div>
      <div class="live-badge">
        <span class="pulse-dot"></span>
        <span id="headerStatus">LIVE SYNC</span>
      </div>
    </div>
  </header>

  <main>
    <div class="mobile-tip">
      <span>📱 เปิดดูบนมือถือผ่าน Wi-Fi เดียวกัน: <code id="lanUrl">http://{LAN_IP}:{PORT}</code></span>
      <span id="syncClock" style="font-family: var(--font-mono); font-size: 11px;">00:00:00</span>
    </div>

    <!-- Active Hero Card -->
    
    <!-- Mobile Remote Agent Control Panel -->
    <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--card-border); border-radius: 12px; padding: 12px 16px; display: flex; flex-direction: column; gap: 10px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 13px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">🎮 รีโมตสั่งงาน AI Agent (Cloud Remote Control)</span>
        <span id="agentStatusBadge" style="font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; background: rgba(239, 68, 68, 0.15); color: #ef4444;">IDLE / STOPPED</span>
      </div>
      <div style="display: flex; gap: 10px;">
        <button id="btnStartAgent" onclick="controlAgent('start')" style="flex: 1; padding: 10px 14px; border-radius: 8px; background: var(--green); color: #fff; border: none; font-weight: 700; cursor: pointer; font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 6px; transition: opacity 0.2s;">
          ▶️ สั่งเปิด PowerShell บนคอม
        </button>
        <button id="btnStopAgent" onclick="controlAgent('stop')" style="flex: 1; padding: 10px 14px; border-radius: 8px; background: #dc2626; color: #fff; border: none; font-weight: 700; cursor: pointer; font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 6px; transition: opacity 0.2s;">
          🛑 ปิด PowerShell & ดับเครื่องคอม (Shutdown PC)
        </button>
      </div>
      <div>
        <a href="/app" style="display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 11px 16px; border-radius: 8px; background: linear-gradient(135deg, var(--coral), #e0684d); color: #fff; text-decoration: none; font-weight: 700; font-size: 13.5px; box-shadow: 0 4px 15px rgba(237, 118, 91, 0.35); box-sizing: border-box;">
          🌐 เปิดใช้งานเว็บแอปจริง (Interactive SPA Prototype)
        </a>
      </div>
    </div>

    <div class="hero-card">
      <div class="hero-top">
        <div>
          <div class="hero-label">⚡ กำลังดำเนินการ (Active Topic)</div>
          <div class="hero-active-title" id="activeTopicTitle">กำลังเชื่อมต่อกับ AI Engine...</div>
        </div>
        <div class="hero-stage" id="activeStageBadge">
          <span class="pulse-dot" style="background: currentColor;"></span>
          <span id="activeStageText">INITIALIZING</span>
        </div>
      </div>

      <div class="progress-bar-container">
        <div class="progress-bar-info">
          <span>ความคืบหน้ารวม</span>
          <span id="progressSummary" style="color: var(--green);">0 / 35 (0.0%)</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" id="progressFill"></div>
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-item">
          <div class="meta-k">Agent 1 (QA Lead)</div>
          <div class="meta-v" id="masterRole" style="color: #60a5fa;">Active (Pro)</div>
        </div>
        <div class="meta-item">
          <div class="meta-k">Agent 2 (Coder)</div>
          <div class="meta-v" id="workerRole" style="color: #34d399;">Active (Flash)</div>
        </div>
        <div class="meta-item">
          <div class="meta-k">รอบปัจจุบัน (Iteration)</div>
          <div class="meta-v" id="iterationMeta">1 / 3</div>
        </div>
        <div class="meta-item">
          <div class="meta-k">เวลาสะสมรอบนี้</div>
          <div class="meta-v" id="elapsedMeta">0s (ไม่จำกัดเวลา)</div>
        </div>
      </div>
    </div>

    <!-- 3-Phase Interactive Topic Roadmap -->
    <div class="section-title">🗺️ ผังหัวข้อทั้ง 35 หัวข้อ (Roadmap)</div>
    <div class="topics-grid">
      <div class="phase-column">
        <div class="phase-header">
          <span>ส่วนที่ 1: Research & Entry</span>
          <span id="p1Count" style="color: var(--green);">0/12</span>
        </div>
        <div id="phase1List" style="display:flex; flex-direction:column; gap:6px;"></div>
      </div>

      <div class="phase-column">
        <div class="phase-header">
          <span>ส่วนที่ 2: Vaults & Library</span>
          <span id="p2Count" style="color: var(--green);">0/12</span>
        </div>
        <div id="phase2List" style="display:flex; flex-direction:column; gap:6px;"></div>
      </div>

      <div class="phase-column">
        <div class="phase-header">
          <span>ส่วนที่ 3: Remix & Governance</span>
          <span id="p3Count" style="color: var(--green);">0/11</span>
        </div>
        <div id="phase3List" style="display:flex; flex-direction:column; gap:6px;"></div>
      </div>
    </div>

    <!-- Live Event Feed -->
    <div class="feed-card">
      <div class="section-title" style="margin-bottom: 8px;">📡 บันทึกเหตุการณ์สด (Live AI Activity Feed)</div>
      <div class="feed-list" id="feedList">
        <div class="feed-item">
          <span class="feed-time">--:--:--</span>
          <span class="feed-msg">กำลังรอข้อมูลกิจกรรมล่าสุดจาก AI...</span>
        </div>
      </div>
    </div>
  </main>

  <script>
    const TOPICS_CATALOG = [
      { id: 0, title: "Audit ของเดิม (เทียบสเปก)", phase: 1 },
      { id: 1, title: "App Shell + Navigation Tree", phase: 1 },
      { id: 2, title: "Central Store + Sample Data", phase: 1 },
      { id: 3, title: "Router + Transition Matrix", phase: 1 },
      { id: 4, title: "S00 Overview / Dashboard", phase: 1 },
      { id: 5, title: "S01 Research Entry (URL/Upload)", phase: 1 },
      { id: 6, title: "Research Inbox + Status Badges", phase: 1 },
      { id: 7, title: "URL Dedupe + Unavailable States", phase: 1 },
      { id: 8, title: "S02 Research Detail Layout", phase: 1 },
      { id: 9, title: "Content Analysis Panel (WHAT)", phase: 1 },
      { id: 10, title: "Packaging Analysis Panel (HOW)", phase: 1 },
      { id: 11, title: "Analyze Again (Versioning)", phase: 1 },

      { id: 12, title: "S03 Save Modal UI Chooser", phase: 2 },
      { id: 13, title: "Save Validation + Commit Logic", phase: 2 },
      { id: 14, title: "Save Success + Re-save Lens", phase: 2 },
      { id: 15, title: "S04 Library โครงสองคลัง", phase: 2 },
      { id: 16, title: "Library Cards + Search & Filter", phase: 2 },
      { id: 17, title: "Library Empty States", phase: 2 },
      { id: 18, title: "S05 Saved Reference Detail", phase: 2 },
      { id: 19, title: "S06 Remix Reference Picker", phase: 2 },
      { id: 20, title: "Ingredient Basket Bar (Sticky)", phase: 2 },
      { id: 21, title: "Remix Draft Selection & Lock", phase: 2 },
      { id: 22, title: "S07 Remix Workspace Layout", phase: 2 },
      { id: 23, title: "3-Angle Generator (Original Concepts)", phase: 2 },

      { id: 24, title: "Source Provenance Inspector", phase: 3 },
      { id: 25, title: "Claims & Rights Checker", phase: 3 },
      { id: 26, title: "Refine & Compare Concepts", phase: 3 },
      { id: 27, title: "S08 Concept Detail / Action Matrix", phase: 3 },
      { id: 28, title: "S09 Content Board Kanban", phase: 3 },
      { id: 29, title: "Approve Concept (Immutable)", phase: 3 },
      { id: 30, title: "Provenance Snapshot & Audit Trail", phase: 3 },
      { id: 31, title: "Mobile Behavior & Responsive UX", phase: 3 },
      { id: 32, title: "UX Copy Dictionary Integration", phase: 3 },
      { id: 33, title: "E2E Test D1-D10 + Scenarios", phase: 3 },
      { id: 34, title: "Founder Review Record", phase: 3 }
    ];

    
    async function controlAgent(action) {
      if (action === 'stop') {
        const ok = confirm('⚠️ ยืนยันการปิดเครื่องคอมพิวเตอร์:\nคุณต้องการสั่งหยุด PowerShell และชัตดาวน์ปิดเครื่องคอมพิวเตอร์ (Shutdown PC) ใน 5 วินาทีทันทีใช่หรือไม่?');
        if (!ok) return;
      }
      const btnStart = document.getElementById('btnStartAgent');
      const btnStop = document.getElementById('btnStopAgent');
      const agentBadge = document.getElementById('agentStatusBadge');
      if (btnStart) btnStart.style.opacity = '0.6';
      if (btnStop) btnStop.style.opacity = '0.6';
      if (agentBadge) agentBadge.textContent = action === 'start' ? "⏳ กำลังเริ่ม..." : "⏳ กำลังปิดเครื่องคอม...";
      try {
        const res = await fetch('/api/agent/' + action, { method: 'POST' });
        const data = await res.json();
        if (action === 'stop' && data.success) {
          alert('🔌 ได้รับคำสั่งแล้ว!\nเครื่องคอมพิวเตอร์กำลังชัตดาวน์ปิดเครื่องใน 5 วินาที');
        }
        await updateDashboard();
      } catch (err) {
        console.error('Remote command failed:', err);
      } finally {
        if (btnStart) btnStart.style.opacity = '1';
        if (btnStop) btnStop.style.opacity = '1';
      }
    }

    async function updateDashboard() {
      try {
        const res = await fetch('/api/status?t=' + Date.now());
        if (!res.ok) return;
        const data = await res.json();

        // Update Agent Status Badge
        const isRunning = data.agent_running;
        const agentBadge = document.getElementById('agentStatusBadge');
        if (agentBadge) {
          if (isRunning) {
            agentBadge.textContent = "🟢 รันอยู่ใน PowerShell บนจอคอม (RUNNING)";
            agentBadge.style.background = "rgba(16, 185, 129, 0.2)";
            agentBadge.style.color = "var(--green)";
          } else {
            agentBadge.textContent = "⚪ หยุดพัก (IDLE / STOPPED)";
            agentBadge.style.background = "rgba(239, 68, 68, 0.15)";
            agentBadge.style.color = "#ef4444";
          }
        }

        // Update Clock & Header
        document.getElementById('syncClock').textContent = data.updated_at || new Date().toLocaleTimeString();
        document.getElementById('headerStatus').textContent = data.status || "RUNNING";

        // Update Active Topic
        const active = data.active_topic || {};
        const activeId = active.id ?? -1;
        const activeTitle = active.title || (activeId >= 0 ? `Topic T${String(activeId).padStart(2,'0')}` : "กำลังรัน Closed-Loop...");
        document.getElementById('activeTopicTitle').textContent = `Topic T${String(activeId).padStart(2,'0')}: ${activeTitle}`;

        // Stage
        const stage = active.stage || "RUNNING";
        document.getElementById('activeStageText').textContent = stage;
        const stageBadge = document.getElementById('activeStageBadge');
        if (stage.includes("PASS") || stage.includes("APPROVED")) {
          stageBadge.style.color = "var(--green)";
          stageBadge.style.background = "var(--green-glow)";
        } else if (stage.includes("FAIL") || stage.includes("RETRY")) {
          stageBadge.style.color = "#ef4444";
          stageBadge.style.background = "rgba(239,68,68,0.2)";
        } else {
          stageBadge.style.color = "var(--amber)";
          stageBadge.style.background = "var(--amber-glow)";
        }

        // Progress
        const completedSet = new Set(data.completed_topic_ids || []);
        const total = data.total_topics || 35;
        const pct = ((completedSet.size / total) * 100).toFixed(1);
        document.getElementById('progressSummary').textContent = `${completedSet.size} / ${total} (${pct}%)`;
        document.getElementById('progressFill').style.width = pct + "%";

        // Iteration & Elapsed
        document.getElementById('iterationMeta').textContent = `${active.iteration || 1} / ${active.max_iterations || 3}`;
        const elapsed = active.elapsed_seconds || 0;
        document.getElementById('elapsedMeta').textContent = `${elapsed}s (ไม่จำกัดเวลา)`;

        // Render Topics
        renderRoadmap(completedSet, activeId);

        // Render Events
        renderEvents(data.recent_events || []);
      } catch (err) {
        console.error("Dashboard poll error:", err);
      }
    }

    function renderRoadmap(completedSet, activeId) {
      const p1El = document.getElementById('phase1List');
      const p2El = document.getElementById('phase2List');
      const p3El = document.getElementById('phase3List');

      let p1Html = '', p2Html = '', p3Html = '';
      let p1Done = 0, p2Done = 0, p3Done = 0;

      TOPICS_CATALOG.forEach(t => {
        const isApproved = completedSet.has(t.id);
        const isRunning = (t.id === activeId);
        let cls = 'pending';
        let badgeCls = 'badge-pending';
        let badgeText = '⏳ รอ';

        if (isApproved) {
          cls = 'approved';
          badgeCls = 'badge-approved';
          badgeText = '✅ ผ่าน';
          if (t.phase === 1) p1Done++;
          if (t.phase === 2) p2Done++;
          if (t.phase === 3) p3Done++;
        } else if (isRunning) {
          cls = 'running';
          badgeCls = 'badge-running';
          badgeText = '⚡ รัน';
        }

        const card = `
          <div class="topic-card ${cls}">
            <div class="topic-info">
              <span class="topic-num">T${String(t.id).padStart(2,'0')}</span>
              <span class="topic-name" title="${t.title}">${t.title}</span>
            </div>
            <span class="topic-badge ${badgeCls}">${badgeText}</span>
          </div>
        `;

        if (t.phase === 1) p1Html += card;
        else if (t.phase === 2) p2Html += card;
        else p3Html += card;
      });

      p1El.innerHTML = p1Html;
      p2El.innerHTML = p2Html;
      p3El.innerHTML = p3Html;

      document.getElementById('p1Count').textContent = `${p1Done}/12`;
      document.getElementById('p2Count').textContent = `${p2Done}/12`;
      document.getElementById('p3Count').textContent = `${p3Done}/11`;
    }

    function renderEvents(events) {
      if (!events || events.length === 0) return;
      const feedEl = document.getElementById('feedList');
      feedEl.innerHTML = events.slice(-15).reverse().map(ev => `
        <div class="feed-item event-${ev.type || 'INFO'}">
          <div style="display:flex; justify-content:space-between;">
            <span style="font-weight:700; color:var(--text-muted);">${ev.actor || 'System'}</span>
            <span class="feed-time">${ev.time || ''}</span>
          </div>
          <span class="feed-msg">${ev.message || ''}</span>
        </div>
      `).join('');
    }

    // Auto-poll every 1.5s
    updateDashboard();
    setInterval(updateDashboard, 1500);
  </script>
</body>
</html>
"""

class DashboardHTTPHandler(BaseHTTPRequestHandler):
    lan_ip = "127.0.0.1"
    port = 4000

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == "/" or path == "/index.html":
            html = HTML_TEMPLATE.replace("{LAN_IP}", self.lan_ip).replace("{PORT}", str(self.port))
            data = html.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return

        elif path in ("/app", "/prototype", "/prototype/", "/prototype/index.html", "/prototype/src/index.html", "/src/index.html", "/src/"):
            app_file = Path("src/index.html")
            if not app_file.exists():
                app_file = Path("output/src/index.html")
            if app_file.exists():
                data = app_file.read_bytes()
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)
                return

        elif path == "/api/status":
            state = get_live_state()
            data = json.dumps(state, ensure_ascii=False).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return

        elif path == "/api/file":
            query = urllib.parse.parse_qs(parsed.query)
            rel_file = query.get("path", [""])[0]
            target_path = (Path(".") / rel_file).resolve()
            if target_path.exists() and target_path.is_file():
                try:
                    content = target_path.read_text(encoding="utf-8", errors="replace")
                    data = json.dumps({"path": rel_file, "content": content}, ensure_ascii=False).encode("utf-8")
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json; charset=utf-8")
                    self.send_header("Content-Length", str(len(data)))
                    self.end_headers()
                    self.wfile.write(data)
                    return
                except Exception as e:
                    self.send_error(500, str(e))
                    return
            self.send_error(404, "File not found")
            return

        elif path == "/api/reviews":
            rev_file = Path("founder_reviews.json")
            reviews = []
            if rev_file.exists():
                try:
                    reviews = json.loads(rev_file.read_text(encoding="utf-8"))
                except Exception:
                    reviews = []
            data = json.dumps(reviews, ensure_ascii=False).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return

        # Static assets resolver (handles /prototype/src/*, /prototype/*, /src/*, /styles/*, /modules/*, etc.)
        stripped = path
        if stripped.startswith("/prototype/"):
            stripped = "/" + stripped[len("/prototype/"):]
        if stripped.startswith("/src/"):
            stripped = "/" + stripped[len("/src/"):]

        clean_rel = stripped.lstrip("/")
        candidates = [
            Path("src") / clean_rel,
            Path("output/src") / clean_rel,
            Path(clean_rel),
            Path("src") / path.lstrip("/"),
            Path(path.lstrip("/"))
        ]
        static_file = None
        for cand in candidates:
            if cand.exists() and cand.is_file():
                static_file = cand
                break

        if static_file is not None:
            lower = static_file.name.lower()
            if lower.endswith(".css"):
                mime = "text/css; charset=utf-8"
            elif lower.endswith(".js"):
                mime = "application/javascript; charset=utf-8"
            elif lower.endswith(".json"):
                mime = "application/json; charset=utf-8"
            elif lower.endswith(".png"):
                mime = "image/png"
            elif lower.endswith(".jpg") or lower.endswith(".jpeg"):
                mime = "image/jpeg"
            elif lower.endswith(".svg"):
                mime = "image/svg+xml"
            elif lower.endswith(".ico"):
                mime = "image/x-icon"
            elif lower.endswith(".html"):
                mime = "text/html; charset=utf-8"
            else:
                mime = "application/octet-stream"
            data = static_file.read_bytes()
            self.send_response(200)
            self.send_header("Content-Type", mime)
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return

        self.send_error(404, "Not Found")


    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        if path == "/api/reviews":
            try:
                length = int(self.headers.get("Content-Length", 0))
                body = self.rfile.read(length).decode("utf-8")
                payload = json.loads(body)
                rev_file = Path("founder_reviews.json")
                reviews = []
                if rev_file.exists():
                    try:
                        reviews = json.loads(rev_file.read_text(encoding="utf-8"))
                    except Exception:
                        reviews = []

                if not payload.get("id"):
                    payload["id"] = f"rev-{int(time.time()*1000)}"
                if not payload.get("createdAt"):
                    payload["createdAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ")

                reviews.insert(0, payload)
                rev_file.write_text(json.dumps(reviews, ensure_ascii=False, indent=2), encoding="utf-8")

                try:
                    from live_state import LiveStateManager
                    LiveStateManager.get().emit_event("Founder Review", "FEEDBACK", f"✍️ ได้รับรีวิวชี้จุดแก้ใน '{payload.get('targetName', 'Component')}': {payload.get('comment', '')[:60]}")
                except Exception:
                    pass

                res = json.dumps({"success": True, "review": payload}, ensure_ascii=False).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(res)
                return
            except Exception as e:
                self.send_error(500, str(e))
                return
        elif path == "/api/agent/start":
            success, msg = start_agent_loop()
            res = json.dumps({"success": success, "message": msg}).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(res)
            return
        elif path == "/api/agent/stop":
            success, msg = stop_agent_loop()
            res = json.dumps({"success": success, "message": msg}).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(res)
            return
        self.send_error(404, "Endpoint not found")

    def log_message(self, format, *args):
        # Silence console log spam for /api/status polls
        return

def run_server(host: str = "0.0.0.0", port: int = 4000):
    lan_ip = get_lan_ip()
    DashboardHTTPHandler.lan_ip = lan_ip
    DashboardHTTPHandler.port = port

    server = HTTPServer((host, port), DashboardHTTPHandler)
    print("=" * 70)
    print("  🚀 MEW CONTENT OS — REAL-TIME MOBILE & WEB DASHBOARD")
    print("=" * 70)
    print(f"  [PC Local Access]     http://localhost:{port}")
    print(f"  [Mobile Wi-Fi Access] http://{lan_ip}:{port}")
    print("=" * 70)
    print("  (Auto-refreshes live every 1.5s from .live_state.json | Ctrl+C to exit)\n")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[*] Web Dashboard stopped.")
        server.server_close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="MEW Content OS Real-Time Web & Mobile Dashboard")
    parser.add_argument("--host", type=str, default="0.0.0.0", help="Host interface (default: 0.0.0.0)")
    parser.add_argument("--port", type=int, default=4000, help="Port (default: 4000)")
    args = parser.parse_args()

    run_server(host=args.host, port=args.port)
