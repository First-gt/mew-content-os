"""
Antigravity CLI Multi-Account Credential Manager
=================================================

Enables seamless switching between multiple Google accounts on Antigravity CLI (agy)
without needing API keys or logging out manually.
"""

from __future__ import annotations

import argparse
import ctypes
from ctypes import wintypes
import json
import os
import subprocess
import sys
import time
from pathlib import Path
from typing import Dict, Optional

from rich.console import Console
from rich.panel import Panel
from rich.table import Table

console = Console(safe_box=True, highlight=False)


class CREDENTIAL(ctypes.Structure):
    _fields_ = [
        ('Flags', wintypes.DWORD),
        ('Type', wintypes.DWORD),
        ('TargetName', wintypes.LPWSTR),
        ('Comment', wintypes.LPWSTR),
        ('LastWritten', wintypes.FILETIME),
        ('CredentialBlobSize', wintypes.DWORD),
        ('CredentialBlob', ctypes.c_char_p),
        ('Persist', wintypes.DWORD),
        ('AttributeCount', wintypes.DWORD),
        ('Attributes', ctypes.c_void_p),
        ('TargetAlias', wintypes.LPWSTR),
        ('UserName', wintypes.LPWSTR),
    ]


class AntigravityCredentialManager:
    TARGET = "gemini:antigravity"
    CRED_DIR = Path(__file__).resolve().parent / "credentials"

    @classmethod
    def get_current_blob(cls) -> Optional[bytes]:
        """Reads current credential blob from Windows Credential Manager."""
        if sys.platform != "win32":
            return None
        try:
            import win32cred
            c = win32cred.CredRead(cls.TARGET, win32cred.CRED_TYPE_GENERIC, 0)
            return c.get("CredentialBlob")
        except Exception:
            return None

    @classmethod
    def set_blob(cls, blob: bytes) -> bool:
        """Writes raw credential blob to Windows Credential Manager."""
        if sys.platform != "win32":
            return True
        cred = CREDENTIAL(
            Flags=0,
            Type=1,  # CRED_TYPE_GENERIC
            TargetName=cls.TARGET,
            Comment=None,
            LastWritten=wintypes.FILETIME(0, 0),
            CredentialBlobSize=len(blob),
            CredentialBlob=blob,
            Persist=2,  # CRED_PERSIST_LOCAL_MACHINE
            AttributeCount=0,
            Attributes=None,
            TargetAlias=None,
            UserName='antigravity'
        )
        advapi = getattr(ctypes, 'windll', None)
        if advapi and hasattr(advapi, 'Advapi32'):
            res = advapi.Advapi32.CredWriteW(ctypes.byref(cred), 0)
            return bool(res)
        return True

    @classmethod
    def delete_active_credential(cls) -> bool:
        """Deletes active credential from Windows Credential Manager."""
        if sys.platform != "win32":
            return True
        try:
            import win32cred
            win32cred.CredDelete(cls.TARGET, win32cred.CRED_TYPE_GENERIC, 0)
            return True
        except Exception:
            return False

    @classmethod
    def get_email_from_blob(cls, blob: bytes) -> Optional[str]:
        """Extracts Google email from OAuth token JSON."""
        try:
            data = json.loads(blob.decode('utf-8', errors='replace'))
            return data.get("id_token_email") or data.get("email")
        except Exception:
            return None

    @classmethod
    def save_profile(cls, name: str) -> Optional[str]:
        """Saves current login as a named profile token file."""
        cls.CRED_DIR.mkdir(parents=True, exist_ok=True)
        blob = cls.get_current_blob()
        if not blob:
            return None
        token_file = cls.CRED_DIR / f"{name}.token"
        token_file.write_bytes(blob)
        return cls.get_email_from_blob(blob)

    @classmethod
    def switch_to_profile(cls, name: str) -> bool:
        """Loads named profile token into Windows Credential Manager."""
        token_file = cls.CRED_DIR / f"{name}.token"
        if not token_file.exists():
            return False
        blob = token_file.read_bytes()
        return cls.set_blob(blob)

    @classmethod
    def has_profile(cls, name: str) -> bool:
        return (cls.CRED_DIR / f"{name}.token").exists()

    @classmethod
    def get_profile_email(cls, name: str) -> Optional[str]:
        token_file = cls.CRED_DIR / f"{name}.token"
        if not token_file.exists():
            return None
        return cls.get_email_from_blob(token_file.read_bytes())

    @classmethod
    def list_profiles(cls) -> Dict[str, Optional[str]]:
        cls.CRED_DIR.mkdir(parents=True, exist_ok=True)
        res = {}
        for f in cls.CRED_DIR.glob("*.token"):
            name = f.stem
            res[name] = cls.get_profile_email(name)
        return res

    @classmethod
    def interactive_login(cls, target_profile: str = "master") -> bool:
        """
        Interactively guides the user to log in with an account (master or worker).
        1. Backs up the opposite profile if not already saved.
        2. Temporarily clears active credential.
        3. Spawns agy to trigger browser OAuth login.
        4. Detects new token and saves it as target_profile.token.
        5. Restores worker profile as active.
        """
        other_profile = "worker" if target_profile == "master" else "master"
        console.print(Panel(
            f"[bold cyan]Antigravity Multi-Account Pairing Wizard: '{target_profile.upper()}'[/bold cyan]\n"
            f"[dim]Link Google account for role: {target_profile.upper()} ({'Orchestrator/Boss' if target_profile == 'master' else 'Coder/Worker'})[/dim]",
            border_style="cyan"
        ))

        # 1. Ensure the other profile is safely backed up
        if not cls.has_profile(other_profile):
            other_email = cls.save_profile(other_profile)
            console.print(f"[green][+] {other_profile.capitalize()} account backed up:[/green] {other_email or 'Saved'}")
        else:
            console.print(f"[dim][*] {other_profile.capitalize()} profile already backed up ({cls.get_profile_email(other_profile)})[/dim]")

        # 2. Clear active credential & stale cache
        cls.delete_active_credential()
        cache_dir = Path.home() / ".gemini" / "antigravity-cli" / "cache"
        if cache_dir.exists():
            for f in cache_dir.glob("*"):
                if f.is_file():
                    try:
                        f.unlink()
                    except Exception:
                        pass

        console.print(f"[yellow][*] Opening browser for {target_profile.capitalize()} Google account login...[/yellow]")
        console.print(f"[dim]Please complete login in the opened window with the {target_profile.upper()} account.[/dim]\n")

        # 3. Launch agy in a new window or process to do OAuth
        try:
            # On Windows, start cmd /c agy so user can complete browser OAuth
            proc = subprocess.run(["cmd.exe", "/c", "start", "/wait", "cmd.exe", "/c", "agy"], shell=True)
            time.sleep(2)
        except Exception as e:
            console.print(f"[red]Failed to launch agy: {e}[/red]")
            # Restore other profile before exiting
            cls.switch_to_profile(other_profile)
            return False

        # 4. Check if new credential was saved
        new_blob = cls.get_current_blob()
        if new_blob:
            account_email = cls.get_email_from_blob(new_blob)
            token_file = cls.CRED_DIR / f"{target_profile}.token"
            token_file.write_bytes(new_blob)
            console.print(Panel(
                f"[bold green][PASS] Successfully linked '{target_profile.upper()}' account![/bold green]\n"
                f"Google Email: [bold white]{account_email or 'Detected'}[/bold white]\n"
                f"Saved to: [cyan]{token_file}[/cyan]",
                border_style="green"
            ))
            # 5. Restore worker as default active on this machine
            cls.switch_to_profile("worker")
            console.print(f"[dim][*] Active credential restored to Worker: {cls.get_profile_email('worker')}[/dim]")
            return True
        else:
            console.print(f"[red][FAIL] No new credential detected. Restoring {other_profile} account.[/red]")
            cls.switch_to_profile(other_profile)
            return False


def main():
    parser = argparse.ArgumentParser(description="Antigravity CLI Account Manager")
    parser.add_argument("--list", action="store_true", help="List all saved accounts/profiles.")
    parser.add_argument("--save-master", action="store_true", help="Save current active login as Master account.")
    parser.add_argument("--save-worker", action="store_true", help="Save current active login as Worker account.")
    parser.add_argument("--login-master", action="store_true", help="Pair Google account as Master (Orchestrator) account.")
    parser.add_argument("--login-worker", action="store_true", help="Pair Google account as Worker (Coder) account.")
    parser.add_argument("--switch", type=str, choices=["master", "worker"], help="Switch active credential to specified profile.")

    args = parser.parse_args()

    if args.save_master:
        email = AntigravityCredentialManager.save_profile("master")
        console.print(f"[green][+] Master account saved:[/green] {email or 'Unknown'}")
        return

    if args.save_worker:
        email = AntigravityCredentialManager.save_profile("worker")
        console.print(f"[green][+] Worker account saved:[/green] {email or 'Unknown'}")
        return

    if args.login_master:
        AntigravityCredentialManager.interactive_login("master")
        return

    if args.login_worker:
        AntigravityCredentialManager.interactive_login("worker")
        return

    if args.switch:
        if AntigravityCredentialManager.switch_to_profile(args.switch):
            console.print(f"[green][+] Switched active account to:[/green] [bold]{args.switch}[/bold] ({AntigravityCredentialManager.get_profile_email(args.switch)})")
        else:
            console.print(f"[red][FAIL] Profile '{args.switch}' not found. Run --login-master or --login-worker first.[/red]")
        return

    # Default: list profiles
    profiles = AntigravityCredentialManager.list_profiles()
    table = Table(title="Antigravity CLI Saved Accounts", border_style="cyan")
    table.add_column("Profile Role", style="bold cyan")
    table.add_column("Google Email", style="white")
    table.add_column("Status", justify="center")

    for role in ["master", "worker"]:
        if role in profiles:
            email = profiles[role] or "Configured"
            table.add_row(role.upper(), email, "[bold green]READY[/bold green]")
        else:
            table.add_row(role.upper(), "[dim]Not linked yet[/dim]", "[yellow]PENDING[/yellow]")

    console.print(table)
    if "master" not in profiles:
        console.print("\n[dim]To link master (orchestrator) account: [bold]python orchestrator_loop.py --login-master[/bold][/dim]\n")
    elif "worker" not in profiles:
        console.print("\n[dim]To link worker account: [bold]python orchestrator_loop.py --login-worker[/bold][/dim]\n")


if __name__ == "__main__":
    main()
