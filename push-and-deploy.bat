@echo off
echo === PikLog 部署助手 ===
echo.
cd /d "%~dp0"

echo [1/2] 推送程式碼到 GitHub...
git push origin main
if errorlevel 1 (
    echo 推送失敗，請確認 GitHub 登入狀態。
    pause
    exit /b 1
)
echo 推送成功！
echo.
echo [2/2] 請到瀏覽器完成 Vercel 部署：
echo   1. 開啟 https://vercel.com/new
echo   2. 點 "Import Git Repository"
echo   3. 選 pikmin-bloom-tracker
echo   4. Framework Preset 選 Vite
echo   5. 點 Deploy
echo.
echo 部署完成後，Vercel 會給你一個 https 網址。
echo 用手機瀏覽器開啟那個網址，就可以安裝 App 了！
echo.
start https://vercel.com/new
pause
