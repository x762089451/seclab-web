@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================================
echo   SEC//LAB 局域网共享（同一 WiFi 下的手机/电脑可访问）
echo ============================================================
echo.
echo 本机 IP（记下 IPv4 地址那一行，通常是 192.168.x.x）：
ipconfig | findstr /i "IPv4"
echo.
echo 然后让手机/同事在同一 WiFi 下打开：
echo     http://你的IPv4地址:8099
echo.
echo 第一次运行时 Windows 会弹防火墙提示，勾选「专用网络」并点「允许访问」
echo 关闭这个黑窗口即停止共享
echo ============================================================
echo.
python -m http.server 8099 --bind 0.0.0.0
echo.
echo 已停止共享。
pause
