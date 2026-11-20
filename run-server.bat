@echo off
rem GreenBlood TTS server watchdog: restart python server if it ever exits
:loop
E:\Ana\python.exe "%~dp0server.py"
echo server exited (code %errorlevel%), restarting in 3s...
ping -n 4 127.0.0.1 >nul
goto loop
