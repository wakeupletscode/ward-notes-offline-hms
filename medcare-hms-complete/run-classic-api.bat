@echo off
setlocal
title MedCare HMS — Classic REST API (Port 8081)

echo ============================================================
echo   MedCare HMS — Classic REST API Backend (Port 8081)
echo ============================================================

if not defined JAVA_HOME (
  for /d %%D in ("C:\Program Files\Java\jdk*" "C:\Program Files\Eclipse Adoptium\jdk*" "C:\Program Files\Microsoft\jdk*") do (
    if exist "%%~fD\bin\java.exe" set "JAVA_HOME=%%~fD"
  )
)
if defined JAVA_HOME set "PATH=%JAVA_HOME%\bin;%PATH%"

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

cd /d "%~dp0classic\backend"
call mvn spring-boot:run
pause
