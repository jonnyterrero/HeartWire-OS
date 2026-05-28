# Shared helpers for HeartWire OS git safety guards.
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-RepoRoot {
    $root = git rev-parse --show-toplevel 2>$null
    if (-not $root) {
        throw 'Not inside a git repository.'
    }
    return $root.Trim()
}

function Test-OneDrivePath {
    param([string]$Path)
    return ($Path -match '(?i)onedrive')
}

function Get-StagedNameStatus {
    $lines = git diff --cached --name-status --no-renames 2>$null
    if (-not $lines) {
        return @()
    }
    return @($lines)
}

function Get-StagedDeletionCount {
    param([string[]]$NameStatusLines)
    return @($NameStatusLines | Where-Object { $_ -match '^D\s' }).Count
}

function Test-MassDeletionRisk {
    param(
        [string[]]$NameStatusLines,
        [int]$DeletionThreshold = 100,
        [double]$RatioThreshold = 0.5
    )

    $deletions = Get-StagedDeletionCount -NameStatusLines $NameStatusLines
    if ($deletions -eq 0) {
        return $null
    }

    if ($deletions -ge $DeletionThreshold) {
        return "Staged deletions ($deletions) exceed threshold ($DeletionThreshold)."
    }

    $trackedCountText = git ls-files 2>$null | Measure-Object -Line
    $trackedCount = [int]$trackedCountText.Lines
    if ($trackedCount -gt 0) {
        $ratio = $deletions / $trackedCount
        if ($ratio -ge $RatioThreshold) {
            $pct = [math]::Round($ratio * 100, 1)
            return "Staged deletions ($deletions / $trackedCount tracked files, $pct%) look like an accidental wipe."
        }
    }

    return $null
}

function Write-GuardFailure {
    param(
        [string]$Title,
        [string[]]$Details,
        [string]$OverrideHint = 'Set HEARTWIRE_GIT_GUARD_SKIP=1 to bypass once.'
    )

    Write-Host ''
    Write-Host "HEARTWIRE GIT GUARD: $Title" -ForegroundColor Red
    foreach ($line in $Details) {
        Write-Host "  - $line" -ForegroundColor Yellow
    }
    Write-Host "  $OverrideHint" -ForegroundColor DarkYellow
    Write-Host ''
}

function Test-GuardBypassEnabled {
    return ($env:HEARTWIRE_GIT_GUARD_SKIP -eq '1')
}
