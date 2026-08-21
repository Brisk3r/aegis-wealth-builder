# ==============================================================================
# OPTIWIZARD MEDIA 1.0 - BUILD SCRIPT
# Compiles OptiWizard.cs into a native x64 Windows WPF executable (OptiWizard.exe)
# ==============================================================================

param (
    [string]$OutputExe = "OptiWizard.exe"
)

$ErrorActionPreference = "Stop"

$scriptDir = $PSScriptRoot
if (-not $scriptDir) { $scriptDir = (Get-Location).Path }

$csFile = Join-Path $scriptDir "OptiWizard.cs"
$exeFile = Join-Path $scriptDir $OutputExe

if (-not (Test-Path -LiteralPath $csFile)) {
    Write-Host "[ERROR] Source file not found: $csFile" -ForegroundColor Red
    exit 1
}

$csc = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
$wpfDir = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\WPF"
$netDir = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319"

if (-not (Test-Path -LiteralPath $csc)) {
    Write-Host "[ERROR] C# Compiler not found at: $csc" -ForegroundColor Red
    exit 1
}

$refs = @(
    "$netDir\System.dll",
    "$netDir\System.Core.dll",
    "$netDir\System.Data.dll",
    "$netDir\System.Xml.dll",
    "$netDir\System.Xaml.dll",
    "$netDir\System.Windows.Forms.dll",
    "$netDir\System.Drawing.dll",
    "$wpfDir\WindowsBase.dll",
    "$wpfDir\PresentationCore.dll",
    "$wpfDir\PresentationFramework.dll"
)

$compilerArgs = @(
    "/nologo",
    "/target:winexe",
    "/platform:x64",
    "/optimize+",
    "/r:$netDir\System.dll",
    "/r:$netDir\System.Core.dll",
    "/r:$netDir\System.Data.dll",
    "/r:$netDir\System.Xml.dll",
    "/r:$netDir\System.Xaml.dll",
    "/r:$netDir\System.Windows.Forms.dll",
    "/r:$netDir\System.Drawing.dll",
    "/r:$wpfDir\WindowsBase.dll",
    "/r:$wpfDir\PresentationCore.dll",
    "/r:$wpfDir\PresentationFramework.dll",
    "/out:$exeFile",
    $csFile
)

$icoFile = Join-Path $scriptDir "app_icon.ico"
if (Test-Path -LiteralPath $icoFile) {
    $compilerArgs = @("/win32icon:$icoFile") + $compilerArgs
}

Write-Host "[BUILD] Compiling OptiWizard - Media 1.2..." -ForegroundColor Cyan

& $csc $compilerArgs

if (Test-Path -LiteralPath $exeFile) {
    $exeSize = (Get-Item -LiteralPath $exeFile).Length
    Write-Host "[SUCCESS] OptiWizard.exe compiled successfully! Size: $exeSize bytes." -ForegroundColor Green
} else {
    Write-Host "[ERROR] Build failed. OptiWizard.exe was not created." -ForegroundColor Red
    exit 1
}
