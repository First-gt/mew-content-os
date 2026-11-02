@echo off
title MEW Content OS - Autonomous 2-Agent Loop
color 0B
cls
echo ==============================================================================
echo   MEW CONTENT OS - 2-AGENT CLOSED LOOP (POWERSHELL RUNNER)
echo ==============================================================================
echo.
cd /d D:\project
python loop_engineer.py --agent
echo.
echo ==============================================================================
echo   Loop finished or stopped. Press any key to exit.
echo ==============================================================================
pause >nul
