@echo off
title AI Chat

echo Starting AI Chat...
echo.

echo [1/2] Starting server (port 3000)...
start "AI Chat Server" cmd /c "cd /d %~dp0server && npm run dev"

echo Waiting for server to be ready...
timeout /t 3 /nobreak >nul

echo [2/2] Starting client (port 5173)...
start "AI Chat Client" cmd /c "cd /d %~dp0client && npm run dev"

timeout /t 2 /nobreak >nul

echo Opening browser...
start http://localhost:5173

echo.
echo Both server and client are running.
echo Close the two console windows to stop.

exit 0
