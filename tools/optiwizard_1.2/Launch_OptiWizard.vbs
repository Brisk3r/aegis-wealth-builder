Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")
ScriptDir = FSO.GetParentFolderName(WScript.ScriptFullName)
ExePath = ScriptDir & "\OptiWizard.exe"
WshShell.CurrentDirectory = ScriptDir
WshShell.Run """" & ExePath & """", 1, False
