#Requires -Version 5.1
<#
.SYNOPSIS
  Stable Windows install for BizCode (pnpm workspaces).

.DESCRIPTION
  Mitigates common Windows EPERM/ENOENT failures during pnpm's atomic renames into
  node_modules without disabling Windows Defender real-time protection or Tamper Protection.

  Safe actions only:
  - Optional Defender path exclusions (project root + pnpm store) when elevation is available
  - Remove leftover *_tmp_* directories under node_modules
  - Retry pnpm install with hardlinks (fast) and bounded attempts

  Does NOT:
  - Disable real-time protection
  - Disable Tamper Protection
  - Change global Windows security policy beyond scoped path exclusions

.PARAMETER MaxAttempts
  Maximum install attempts (default 5).

.PARAMETER SkipDefenderExclusions
  Do not attempt Add-MpPreference exclusions.

.PARAMETER FrozenLockfile
  Pass --frozen-lockfile to pnpm (recommended for CI-parity local installs).

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\scripts\install-windows.ps1 -FrozenLockfile
#>
[CmdletBinding()]
param(
  [ValidateRange(1, 20)]
  [int]$MaxAttempts = 5,
  [switch]$SkipDefenderExclusions,
  [switch]$FrozenLockfile
)

$ErrorActionPreference = 'Stop'
$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $RepoRoot

function Write-Step([string]$Message) {
  Write-Host "[install-windows] $Message" -ForegroundColor Cyan
}

function Write-WarnStep([string]$Message) {
  Write-Host "[install-windows] $Message" -ForegroundColor Yellow
}

function Get-PnpmStorePath {
  try {
    $path = (& pnpm store path 2>$null | Select-Object -First 1)
    if ($path) { return $path.Trim() }
  } catch { }
  return $null
}

function Clear-PnpmTmpDirs {
  $nm = Join-Path $RepoRoot 'node_modules'
  if (-not (Test-Path $nm)) { return }
  Get-ChildItem $nm -Directory -Filter '*_tmp_*' -Force -ErrorAction SilentlyContinue |
    ForEach-Object {
      Write-Step "Removing leftover $($_.Name)"
      Remove-Item $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
    }
}

function Try-AddDefenderExclusions {
  if ($SkipDefenderExclusions) {
    Write-Step 'Skipping Defender exclusions (-SkipDefenderExclusions).'
    return
  }

  $store = Get-PnpmStorePath
  $storeRoot = if ($store) { Split-Path $store -Parent } else { $null }
  $paths = @([string]$RepoRoot)
  if ($storeRoot) { $paths += $storeRoot }

  $script = @'
param([string[]]$Paths)
$ErrorActionPreference = "Stop"
foreach ($p in $Paths) {
  if ($p) { Add-MpPreference -ExclusionPath $p -ErrorAction Stop }
}
'@
  $tmp = Join-Path $env:TEMP ("bizcode-defender-exclusions-{0}.ps1" -f [guid]::NewGuid().ToString('N'))
  Set-Content -Path $tmp -Value $script -Encoding UTF8
  try {
    Write-Step 'Requesting elevation to add Defender path exclusions (project + pnpm store only)...'
    $argList = @(
      '-NoProfile',
      '-ExecutionPolicy', 'Bypass',
      '-File', $tmp,
      '-Paths'
    ) + $paths
    $p = Start-Process -FilePath 'powershell.exe' -Verb RunAs -Wait -PassThru -ArgumentList $argList
    if ($p.ExitCode -eq 0) {
      Write-Step 'Defender path exclusions applied (or already present).'
    } else {
      Write-WarnStep "Elevated exclusion step exited with code $($p.ExitCode). Continuing without new exclusions."
    }
  } catch {
    Write-WarnStep "Could not elevate for Defender exclusions: $($_.Exception.Message)"
    Write-WarnStep 'Continue: add exclusions manually for this repo and the pnpm store, or re-run with admin UAC accepted.'
  } finally {
    Remove-Item $tmp -Force -ErrorAction SilentlyContinue
  }
}

function Invoke-PnpmInstall {
  # Important: do not `return` after a native command that writes to the success
  # stream — PowerShell would merge stdout into the return value and break -eq 0.
  $pnpmArgs = @('install', '--package-import-method', 'hardlink')
  if ($FrozenLockfile) { $pnpmArgs += '--frozen-lockfile' }
  Write-Step ("Running: pnpm {0}" -f ($pnpmArgs -join ' '))
  & pnpm @pnpmArgs | Out-Host
  return [int]$LASTEXITCODE
}

Write-Step "Repo: $RepoRoot"
Write-Step "Node: $(node --version 2>$null)"
Write-Step "pnpm: $(pnpm --version 2>$null)"

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  Write-Error 'pnpm not found. Run: corepack enable'
  exit 1
}

Try-AddDefenderExclusions

$ok = $false
for ($i = 1; $i -le $MaxAttempts; $i++) {
  Clear-PnpmTmpDirs
  Write-Step "Attempt $i of $MaxAttempts"
  $code = Invoke-PnpmInstall
  if ($code -eq 0) {
    $ok = $true
    break
  }
  Write-WarnStep "pnpm install failed with exit code $code"
  Start-Sleep -Seconds ([Math]::Min(5 * $i, 20))
}

Clear-PnpmTmpDirs

if (-not $ok) {
  Write-Host ''
  Write-Host 'INSTALL FAILED after retries.' -ForegroundColor Red
  Write-Host 'Still failing with EPERM/ENOENT on Windows usually means a file lock on node_modules.' -ForegroundColor Yellow
  Write-Host 'Checklist:' -ForegroundColor Yellow
  Write-Host '  1. Confirm Cursor/VS Code files.watcherExclude includes **/node_modules/** (repo settings).'
  Write-Host '  2. Add Windows Defender exclusions for this repo and the pnpm store (UAC).'
  Write-Host '  3. Close other terminals/tools watching this folder and re-run this script.'
  Write-Host '  4. As last resort: close the IDE, run this script from an external PowerShell, reopen the IDE.'
  exit 1
}

$critical = @('express', 'vitest', 'tsx', 'lint-staged', 'typescript')
$missing = @()
foreach ($name in $critical) {
  if (-not (Test-Path (Join-Path $RepoRoot "node_modules\$name"))) {
    $missing += $name
  }
}

if ($missing.Count -gt 0) {
  Write-Error ("Install reported success but missing packages: {0}" -f ($missing -join ', '))
  exit 1
}

Write-Host ''
Write-Host 'INSTALL OK' -ForegroundColor Green
Write-Step 'Critical packages present; you can run tests and local tooling.'
exit 0
