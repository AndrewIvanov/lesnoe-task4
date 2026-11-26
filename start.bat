@echo off
cd /d "%~dp0"
where py >nul 2>nul
if errorlevel 1 goto python
start "" http://localhost:8000
py -3 -m http.server 8000 --bind 127.0.0.1
 goto end
:python
start "" http://localhost:8000
python -m http.server 8000 --bind 127.0.0.1
:end
pause
