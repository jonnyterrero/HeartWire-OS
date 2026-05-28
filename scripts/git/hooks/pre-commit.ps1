# Blocks accidental mass deletions and warns when committing from OneDrive.
. "$PSScriptRoot\..\guard-lib.ps1"

if (Test-GuardBypassEnabled) {
    exit 0
}

$repoRoot = Get-RepoRoot
$staged = Get-StagedNameStatus
$warnings = @()

if (Test-OneDrivePath -Path $repoRoot) {
    $warnings += 'Repository lives under OneDrive. Pause sync before large git operations if files hang or conflict.'
}

$massDeleteReason = Test-MassDeletionRisk -NameStatusLines $staged
if ($massDeleteReason) {
    Write-GuardFailure -Title 'Commit blocked to prevent accidental repo wipe.' -Details @(
        $massDeleteReason,
        'Review with: git diff --cached --name-status | Select-Object -First 30',
        'Recover working tree with: git restore .',
        'If deletions are intentional, rerun with HEARTWIRE_GIT_GUARD_SKIP=1.'
    )
    exit 1
}

if ($warnings.Count -gt 0) {
    Write-Host ''
    Write-Host 'HEARTWIRE GIT GUARD: OneDrive notice' -ForegroundColor Yellow
    foreach ($line in $warnings) {
        Write-Host "  - $line" -ForegroundColor DarkYellow
    }
    Write-Host ''
}

exit 0
