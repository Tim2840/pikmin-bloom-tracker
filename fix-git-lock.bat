@echo off
cd /d "%~dp0"
echo Removing git lock...
if exist .git\index.lock del /f .git\index.lock
echo Committing changes...
git add src/pages/HomePage.tsx
git commit -m "feat(home): 新增「新增紀錄」Modal 並修正進度卡顯示"
echo Done!
pause
