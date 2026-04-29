' ============================================
' FireVision — Silent Desktop Launcher
' Double-click to launch FireVision as an app
' ============================================
Dim shell, fso, appDir, appUrl, browserPath

Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get the folder this script is in
appDir = fso.GetParentFolderName(WScript.ScriptFullName)
appUrl = "file:///" & Replace(appDir, "\", "/") & "/index.html"

' Try Chrome (app mode = clean window, no address bar)
Dim chromePaths
chromePaths = Array( _
    shell.ExpandEnvironmentStrings("%ProgramFiles%") & "\Google\Chrome\Application\chrome.exe", _
    shell.ExpandEnvironmentStrings("%ProgramFiles(x86)%") & "\Google\Chrome\Application\chrome.exe", _
    shell.ExpandEnvironmentStrings("%LocalAppData%") & "\Google\Chrome\Application\chrome.exe" _
)

Dim p
For Each p In chromePaths
    If fso.FileExists(p) Then
        shell.Run """" & p & """ --app=""" & appUrl & """ --start-maximized", 1, False
        WScript.Quit
    End If
Next

' Try Edge
Dim edgePaths
edgePaths = Array( _
    shell.ExpandEnvironmentStrings("%ProgramFiles(x86)%") & "\Microsoft\Edge\Application\msedge.exe", _
    shell.ExpandEnvironmentStrings("%ProgramFiles%") & "\Microsoft\Edge\Application\msedge.exe" _
)

For Each p In edgePaths
    If fso.FileExists(p) Then
        shell.Run """" & p & """ --app=""" & appUrl & """ --start-maximized", 1, False
        WScript.Quit
    End If
Next

' Fallback: open in default browser
shell.Run appDir & "\index.html", 1, False
