@echo off
rem Green Blood Rescue: launch detached TTS server watchdog + open the film
rem run-server.bat keeps server.py alive (auto-restart); neural voices need it running
start "GreenBloodTTS" /min "%~dp0run-server.bat"
start "" "%~dp0index.html"
