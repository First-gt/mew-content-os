#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
==============================================================================
MEW CONTENT OS — LIVE STATE MANAGER
==============================================================================
Provides atomic, direct state publishing between Agent 1 & Agent 2 and all
dashboards (Terminal Live Dashboard and Mobile Web Dashboard).
No more guessing topic status or regex parsing errors.
==============================================================================
"""

import os
import re
import json
import time
from pathlib import Path
from typing import List, Dict, Any, Optional

STATE_PATH = Path(".live_state.json")
LEGACY_STATUS_PATH = Path(".loop_status.json")

class LiveStateManager:
    _instance = None

    def __init__(self, workspace_dir: Optional[Path] = None):
        self.workspace_dir = workspace_dir or Path(".")
        self.start_topic_time = time.time()
        self.state: Dict[str, Any] = self._load_initial_state()

    @classmethod
    def get(cls, workspace_dir: Optional[Path] = None) -> "LiveStateManager":
        if cls._instance is None:
            cls._instance = LiveStateManager(workspace_dir)
        return cls._instance

    def reload(self) -> Dict[str, Any]:
        """Reloads atomic state from .live_state.json on disk to guarantee fresh updates across processes."""
        if STATE_PATH.exists():
            try:
                data = json.loads(STATE_PATH.read_text(encoding="utf-8"))
                if isinstance(data, dict):
                    self.state = data
                    return self.state
            except Exception:
                pass
        return self.state

    def _load_initial_state(self) -> Dict[str, Any]:
        if STATE_PATH.exists():
            try:
                data = json.loads(STATE_PATH.read_text(encoding="utf-8"))
                return data
            except Exception:
                pass

        # Parse from plan.md if available
        completed_ids = []
        plan_p = Path("plan.md")
        if plan_p.exists():
            p_text = plan_p.read_text(encoding="utf-8")
            for m in re.finditer(r'- \[x\] \*\*Topic (?:T|t)?(\d+):', p_text, re.IGNORECASE):
                completed_ids.append(int(m.group(1)))

        completed_ids = sorted(list(set(completed_ids)))

        return {
            "updated_at": time.strftime("%H:%M:%S"),
            "status": "RUNNING",
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
                    "message": f"Live State Initialized. {len(completed_ids)}/35 topics verified completed."
                }
            ]
        }

    def _commit(self) -> None:
        self.state["updated_at"] = time.strftime("%H:%M:%S")
        # Ensure monotone progress: union with disk and plan.md so progress never regresses
        completed = set(self.state.get("completed_topic_ids", []))
        if STATE_PATH.exists():
            try:
                completed.update(json.loads(STATE_PATH.read_text(encoding="utf-8")).get("completed_topic_ids", []))
            except Exception:
                pass
        plan_p = Path("plan.md")
        if plan_p.exists():
            try:
                p_text = plan_p.read_text(encoding="utf-8")
                completed.update([int(m.group(1)) for m in re.finditer(r'- \[x\] \*\*Topic (?:T|t)?(\d+):', p_text, re.IGNORECASE)])
            except Exception:
                pass
        self.state["completed_topic_ids"] = sorted(list(completed))
        completed_cnt = len(self.state["completed_topic_ids"])
        total = self.state.get("total_topics", 35)
        self.state["completion_percentage"] = round((completed_cnt / float(total)) * 100, 1)

        # Atomic file write via temp file
        tmp_path = Path(".live_state.tmp")
        try:
            tmp_path.write_text(json.dumps(self.state, ensure_ascii=False, indent=2), encoding="utf-8")
            if STATE_PATH.exists():
                STATE_PATH.unlink()
            tmp_path.rename(STATE_PATH)
        except Exception:
            try:
                STATE_PATH.write_text(json.dumps(self.state, ensure_ascii=False), encoding="utf-8")
            except Exception:
                pass

        # Legacy status sync for backward compatibility
        try:
            act = self.state.get("active_topic", {})
            LEGACY_STATUS_PATH.write_text(json.dumps({
                "active_topic_id": act.get("id"),
                "active_topic_title": act.get("title"),
                "iteration": act.get("iteration", 1),
                "max_iterations": act.get("max_iterations", 3),
                "status": self.state.get("status", "RUNNING"),
                "time": time.strftime("%H:%M:%S")
            }, ensure_ascii=False), encoding="utf-8")
        except Exception:
            pass

    def emit_event(self, actor: str, event_type: str, message: str) -> None:
        event = {
            "time": time.strftime("%H:%M:%S"),
            "actor": actor,
            "type": event_type,
            "message": message
        }
        events = self.state.setdefault("recent_events", [])
        events.append(event)
        if len(events) > 30:
            self.state["recent_events"] = events[-30:]
        self._commit()

    def set_topic_start(self, topic_id: int, title: str, iteration: int, max_iterations: int, target_files: List[str]) -> None:
        self.start_topic_time = time.time()
        self.state["status"] = "RUNNING"
        self.state["active_topic"] = {
            "id": topic_id,
            "title": title,
            "stage": "WORKER_CODING",
            "iteration": iteration,
            "max_iterations": max_iterations,
            "target_files": target_files,
            "elapsed_seconds": 0
        }
        self.emit_event("Agent 1 (QA Lead)", "START", f"เริ่มดำเนินการ Topic T{topic_id:02d}: {title} (รอบที่ {iteration}/{max_iterations})")

    def set_stage(self, stage: str, details: str = "") -> None:
        act = self.state.setdefault("active_topic", {})
        act["stage"] = stage
        act["elapsed_seconds"] = int(time.time() - self.start_topic_time)
        if details:
            act["details"] = details
        self._commit()

    def set_approved(self, topic_id: int, title: str, iteration: int, files: List[str], summary: str) -> None:
        completed = set(self.state.get("completed_topic_ids", []))
        completed.add(topic_id)
        self.state["completed_topic_ids"] = sorted(list(completed))

        act = self.state.setdefault("active_topic", {})
        act["stage"] = "APPROVED"
        act["elapsed_seconds"] = int(time.time() - self.start_topic_time)

        self.emit_event("Agent 1 (QA Lead)", "APPROVED", f"[PASS] อนุมัติ Topic T{topic_id:02d}: {title} ในรอบที่ {iteration} เรียบร้อยแล้ว! ({len(files)} ไฟล์)")

    def set_retry(self, topic_id: int, iteration: int, reason: str) -> None:
        act = self.state.setdefault("active_topic", {})
        act["stage"] = "RETRYING"
        act["elapsed_seconds"] = int(time.time() - self.start_topic_time)
        self.emit_event("Agent 1 (QA Lead)", "FAILED", f"[RETRY] ตรวจพบข้อผิดพลาดใน Topic T{topic_id:02d} (รอบที่ {iteration}) ส่งฟีดแบ็กให้ Agent 2 แก้ไข: {reason}")

    def set_self_healing(self, topic_id: int, reason: str) -> None:
        act = self.state.setdefault("active_topic", {})
        act["stage"] = "HEALING"
        self.emit_event("Self-Healing Watchdog", "HEALING", f"[RECOVERY] ทำการกู้คืน Topic T{topic_id:02d} อัตโนมัติ: {reason}")

    def sync_from_plan(self) -> None:
        plan_p = Path("plan.md")
        if plan_p.exists():
            p_text = plan_p.read_text(encoding="utf-8")
            done = [int(m.group(1)) for m in re.finditer(r'- \[x\] \*\*Topic (?:T|t)?(\d+):', p_text, re.IGNORECASE)]
            self.state["completed_topic_ids"] = sorted(list(set(done)))
            self._commit()

if __name__ == "__main__":
    mgr = LiveStateManager.get()
    mgr.sync_from_plan()
    print("Live state synchronized. Completed:", mgr.state["completed_topic_ids"])
