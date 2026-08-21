@echo off
title OptiWizard - Media 1.0 Launcher
cd /d "%~dp0"
if exist "%~dp0OptiWizard.exe" (
    start "" "%~dp0OptiWizard.exe"
) else (
    echo [OPTIWIZARD] Compiling binary...
    powershell.exe -ExecutionPolicy Bypass -File "%~dp0build_optiwizard.ps1"
    start "" "%~dp0OptiWizard.exe"
)
exit
