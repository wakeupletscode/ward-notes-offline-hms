@echo off
setlocal
title Ward Notes — Offline-First Clinical EHR (Port 8080)

echo ============================================================
echo   Ward Notes — Offline-First Hospital Management System
echo ============================================================

:: 1. Auto-detect JAVA_HOME if not already set
if not defined JAVA_HOME (
  for /d %%D in ("C:\Program Files\Java\jdk*" "C:\Program Files\Eclipse Adoptium\jdk*" "C:\Program Files\Microsoft\jdk*") do (
    if exist "%%~fD\bin\java.exe" set "JAVA_HOME=%%~fD"
  )
)
if defined JAVA_HOME set "PATH=%JAVA_HOME%\bin;%PATH%"

:: 2. Check if Maven is available; if not, check/install into %USERPROFILE%\.maven
where mvn >nul 2>nul
if %errorlevel% neq 0 (
  if exist "%USERPROFILE%\.maven\apache-maven-3.9.9\bin\mvn.cmd" (
    set "PATH=%USERPROFILE%\.maven\apache-maven-3.9.9\bin;%PATH%"
  ) else (
    echo [Setup] Apache Maven not found on PATH. Downloading Maven 3.9.9 automatically...
    powershell -NoProfile -ExecutionPolicy Bypass -Command ^
      "$m='%USERPROFILE%\.maven'; New-Item -ItemType Directory -Force -Path $m | Out-Null; " ^
      "$z=\"$m\mvn.zip\"; Invoke-WebRequest -Uri 'https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.9/apache-maven-3.9.9-bin.zip' -OutFile $z; " ^
      "Expand-Archive -Path $z -DestinationPath $m -Force; Remove-Item $z -Force"
    set "PATH=%USERPROFILE%\.maven\apache-maven-3.9.9\bin;%PATH%"
  )
)

echo.
echo Starting Spring Boot server on http://localhost:8080 ...
echo (Your browser will open automatically in a few seconds. Press Ctrl+C to stop.)
echo.

start "" cmd /c "timeout /t 6 /nobreak >nul & start http://localhost:8080"
cd /d "%~dp0offline-app"
call mvn spring-boot:run
pause
