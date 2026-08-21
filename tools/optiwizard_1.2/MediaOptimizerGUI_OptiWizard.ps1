<#
=============================================================================================
 OPTIWIZARD - MEDIA 1.0 (LAUNCHER & RUNTIME SCRIPT)
 Launches the compiled native x64 Windows WPF OptiWizard.exe or compiles it on-the-fly
 if missing.
 Zero-Mojibake 7-Bit ASCII Standard Enforced.
=============================================================================================
#>

$scriptDir = $PSScriptRoot
if (-not $scriptDir) { $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition }
if (-not $scriptDir) { $scriptDir = (Get-Location).Path }

$exePath = Join-Path $scriptDir "OptiWizard.exe"
$buildScript = Join-Path $scriptDir "build_optiwizard.ps1"

if (-not (Test-Path -LiteralPath $exePath)) {
    Write-Host "[OPTIWIZARD] OptiWizard.exe not found. Compiling native binary..." -ForegroundColor Cyan
    if (Test-Path -LiteralPath $buildScript) {
        & powershell.exe -ExecutionPolicy Bypass -File $buildScript
    }
}

if (Test-Path -LiteralPath $exePath) {
    Write-Host "[OPTIWIZARD] Starting OptiWizard - Media 1.0..." -ForegroundColor Green
    Start-Process -FilePath $exePath
} else {
    Write-Host "[ERROR] Could not start or build OptiWizard.exe" -ForegroundColor Red
}
