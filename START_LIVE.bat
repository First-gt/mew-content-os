@echo off
title MEW Content OS - Live Realtime Dashboard
color 0A
cls
echo ==============================================================================
echo   MEW CONTENT OS - LIVE REALTIME DASHBOARD (35 TOPICS)
echo ==============================================================================
echo.
cd /d D:\project
python loop_engineer.py --live
echo.
pause
