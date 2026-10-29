@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo   SEC//LAB 正在用默认浏览器打开...
echo   如果浏览器没反应，请手动双击 index.html
echo.
start "" "index.html"
