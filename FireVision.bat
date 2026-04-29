@echo off
title FireVision Launcher
:: ============================================
:: FireVision — Desktop App Launcher
:: Double-click to launch FireVision
:: ============================================

set "APP_DIR=%~dp0"
set "APP_URL=file:///%APP_DIR:\=/%index.html"

:: Try Chrome first (app mode = no address bar, looks like real app)
for %%P in (
    "%ProgramFiles%\Google\Chrome\Application\chrome.exe"
    "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
    "%LocalAppData%\Google\Chrome\Application\chrome.exe"
) do (
    if exist %%P (
        start "" %%P --app="%APP_URL%" --start-maximized
        exit
    )
)

:: Try Edge (also supports app mode)
for %%P in (
    "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
    "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
) do (
    if exist %%P (
        start "" %%P --app="%APP_URL%" --start-maximized
        exit
    )
)

:: Fallback: open in default browser
start "" "%APP_DIR%index.html"
