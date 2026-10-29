@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================================
echo   SEC//LAB 本地预览服务器
echo   地址:   http://127.0.0.1:8099
echo   停止:   关闭这个黑窗口，或按 Ctrl+C
echo ============================================================
echo.
timeout /t 1 >nul
start "" "http://127.0.0.1:8099"
python -m http.server 8099 --bind 127.0.0.1
echo.
echo 服务已停止。
pause
