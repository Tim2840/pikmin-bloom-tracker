@echo off
cd /d "C:\Users\user\Desktop\hexschool_ReactProjects\pikmin-bloom-tracker"
echo === Pushing to GitHub with Windows Credential Manager ===
git -c credential.helper=manager push origin main
echo.
echo === Done. Exit code: %errorlevel% ===
pause
