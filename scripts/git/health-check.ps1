# Quick diagnostic for git + OneDrive + GitHub sync health.
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

. "$PSScriptRoot\guard-lib.ps1"

$repoRoot = Get-RepoRoot
Set-Location $repoRoot

Write-Host ''
Write-Host 'HeartWire OS git health check' -ForegroundColor Cyan
Write-Host "Repository: $repoRoot"
Write-Host ''

function Write-Check {
    param(
        [string]$Label,
        [bool]$Ok,
        [string]$Detail
    )

    $status = if ($Ok) { 'OK' } else { 'WARN' }
    $color = if ($Ok) { 'Green' } else { 'Yellow' }
    Write-Host ("[{0}] {1}" -f $status, $Label) -ForegroundColor $color
    if ($Detail) {
        Write-Host ("      {0}" -f $Detail) -ForegroundColor DarkGray
    }
}

$inOneDrive = Test-OneDrivePath -Path $repoRoot
Write-Check -Label 'Path location' -Ok (-not $inOneDrive) -Detail $(if ($inOneDrive) { 'Repo is under OneDrive (higher sync conflict risk)' } else { 'Repo is outside OneDrive' })

$remoteUrl = git remote get-url origin 2>$null
$hasOrigin = [bool]$remoteUrl
Write-Check -Label 'GitHub remote' -Ok $hasOrigin -Detail $(if ($hasOrigin) { "origin -> $remoteUrl" } else { 'No origin remote configured' })

$branch = git branch --show-current 2>$null
$upstream = git rev-parse --abbrev-ref '@{u}' 2>$null
$aheadBehind = git rev-list --left-right --count "@{u}...HEAD" 2>$null
if ($upstream -and $aheadBehind) {
    $parts = $aheadBehind -split '\s+'
    $behind = [int]$parts[0]
    $ahead = [int]$parts[1]
    Write-Check -Label 'Branch sync' -Ok ($behind -eq 0) -Detail ("branch=$branch upstream=$upstream ahead=$ahead behind=$behind")
} else {
    Write-Check -Label 'Branch sync' -Ok $false -Detail ("branch=$branch (no upstream tracking branch)")
}

$hooksPath = git config --local --get core.hooksPath 2>$null
$expectedHooks = 'scripts/git/hooks'
Write-Check -Label 'Git hooks' -Ok ($hooksPath -eq $expectedHooks) -Detail $(if ($hooksPath) { "core.hooksPath=$hooksPath" } else { 'Guards not installed — run setup-onedrive-guards.ps1' })

$longPaths = git config --local --get core.longpaths 2>$null
Write-Check -Label 'Long paths' -Ok ($longPaths -eq 'true') -Detail ("core.longpaths=$longPaths")

$porcelain = @(git status --porcelain 2>$null)
$deletions = @($porcelain | Where-Object { $_ -match '^..D|^ D' }).Count
$mods = $porcelain.Count
Write-Check -Label 'Working tree' -Ok ($deletions -lt 100) -Detail ("$mods changed entries, $deletions deletions")

if ($deletions -ge 100) {
    Write-Host ''
    Write-Host 'Recovery commands:' -ForegroundColor Yellow
    Write-Host '  git restore .'
    Write-Host '  git clean -fd   # only if you intend to remove untracked files'
    Write-Host '  Pause OneDrive sync first if restore hangs.'
    Write-Host ''
}

Write-Host ''
Write-Host 'Done.' -ForegroundColor Cyan
Write-Host ''
