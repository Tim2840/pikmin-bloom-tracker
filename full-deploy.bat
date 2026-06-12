@echo off
cd /d "C:\Users\user\Desktop\hexschool_ReactProjects\pikmin-bloom-tracker"
set LOGFILE=C:\Users\user\Desktop\hexschool_ReactProjects\pikmin-bloom-tracker\full-deploy-result.txt

echo === PikLog Full Deploy === > "%LOGFILE%"
echo %date% %time% >> "%LOGFILE%"
echo. >> "%LOGFILE%"

:: Step 1: Push
echo === Step 1: Git Push === >> "%LOGFILE%"
git -c credential.helper=manager push origin main >> "%LOGFILE%" 2>&1
echo Push exit: %errorlevel% >> "%LOGFILE%"
echo. >> "%LOGFILE%"

:: Step 2: Extract token from Windows Credential Manager
echo === Step 2: Extract Token === >> "%LOGFILE%"
echo protocol=https> "%TEMP%\piklog-cred-in.txt"
echo host=github.com>> "%TEMP%\piklog-cred-in.txt"
echo.>> "%TEMP%\piklog-cred-in.txt"
git -c credential.helper=manager credential fill < "%TEMP%\piklog-cred-in.txt" > "%TEMP%\piklog-cred-out.txt" 2>&1

set GH_TOKEN=
for /f "tokens=2 delims==" %%a in ('findstr /i "^password" "%TEMP%\piklog-cred-out.txt"') do set GH_TOKEN=%%a

if "%GH_TOKEN%"=="" (
    echo ERROR: Could not extract token >> "%LOGFILE%"
    echo Please enable GitHub Pages manually: >> "%LOGFILE%"
    echo https://github.com/Tim2840/pikmin-bloom-tracker/settings/pages >> "%LOGFILE%"
) else (
    echo Token extracted OK >> "%LOGFILE%"
    echo. >> "%LOGFILE%"

    :: Step 3: Enable GitHub Pages
    echo === Step 3: Enable GitHub Pages === >> "%LOGFILE%"
    curl -s -w "\nHTTP_STATUS:%%{http_code}" -X POST ^
      -H "Authorization: Bearer %GH_TOKEN%" ^
      -H "Accept: application/vnd.github+json" ^
      -H "X-GitHub-Api-Version: 2022-11-28" ^
      "https://api.github.com/repos/Tim2840/pikmin-bloom-tracker/pages" ^
      -d "{\"build_type\":\"workflow\"}" >> "%LOGFILE%" 2>&1
    echo. >> "%LOGFILE%"

    :: If Pages already exists, try PATCH to update build_type
    curl -s -w "\nHTTP_STATUS:%%{http_code}" -X PUT ^
      -H "Authorization: Bearer %GH_TOKEN%" ^
      -H "Accept: application/vnd.github+json" ^
      -H "X-GitHub-Api-Version: 2022-11-28" ^
      "https://api.github.com/repos/Tim2840/pikmin-bloom-tracker/pages" ^
      -d "{\"build_type\":\"workflow\"}" >> "%LOGFILE%" 2>&1
    echo. >> "%LOGFILE%"
)

echo === Done === >> "%LOGFILE%"
echo %date% %time% >> "%LOGFILE%"
type "%LOGFILE%"
pause
