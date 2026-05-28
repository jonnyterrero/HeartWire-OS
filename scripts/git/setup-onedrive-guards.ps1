# One-time setup for HeartWire OS git safety guards (OneDrive + GitHub).
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

. "$PSScriptRoot\guard-lib.ps1"

$repoRoot = Get-RepoRoot
Set-Location $repoRoot

Write-Host "HeartWire OS git guard setup" -ForegroundColor Cyan
Write-Host "Repository: $repoRoot"
Write-Host ''

$gitConfigs = @{
    'core.longpaths' = 'true'
    'core.fscache' = 'false'
    'core.fsmonitor' = 'false'
    'core.untrackedCache' = 'false'
    'core.preloadindex' = 'false'
    'core.autocrlf' = 'true'
    'core.hooksPath' = 'scripts/git/hooks'
    'feature.manyFiles' = 'true'
    'index.threads' = '1'
    'fetch.prune' = 'true'
    'pull.rebase' = 'false'
}

foreach ($entry in $gitConfigs.GetEnumerator()) {
    git config --local $entry.Key $entry.Value | Out-Null
    Write-Host ("  set {0} = {1}" -f $entry.Key, $entry.Value) -ForegroundColor DarkGray
}

Write-Host ''
Write-Host 'Installed guards:' -ForegroundColor Green
Write-Host '  - pre-commit: blocks accidental mass deletions'
Write-Host '  - pre-push: blocks force-push to main/master'
Write-Host ''
Write-Host 'Run health check:' -ForegroundColor Green
Write-Host '  pwsh -File scripts/git/health-check.ps1'
Write-Host ''

if (Test-OneDrivePath -Path $repoRoot) {
    Write-Host 'OneDrive detected. Recommended manual steps:' -ForegroundColor Yellow
    Write-Host '  1. Right-click this repo folder -> OneDrive -> Always keep on this device'
    Write-Host '  2. Avoid git reset/checkout while OneDrive is actively syncing'
    Write-Host '  3. For heavy git work, pause OneDrive sync temporarily'
    Write-Host '  4. Long-term: keep active dev clones outside OneDrive (e.g. C:\Dev\HeartWire-OS)'
    Write-Host ''
}

$longPaths = Get-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem' -Name 'LongPathsEnabled' -ErrorAction SilentlyContinue
if ($longPaths -and $longPaths.LongPathsEnabled -eq 1) {
    Write-Host 'Windows long paths: enabled' -ForegroundColor Green
} else {
    Write-Host 'Windows long paths: disabled (enable in Group Policy or registry for deep coursework paths)' -ForegroundColor Yellow
}

& "$PSScriptRoot\health-check.ps1"
