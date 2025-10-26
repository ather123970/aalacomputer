<#
Force-push this workspace to a remote GitHub repository.

USAGE (PowerShell):
  .\push_to_github.ps1 -RemoteUrl "https://github.com/ather123970/aalacomputer.git" -Branch "main"

This script will:
 - initialize a git repo if one does not exist
 - add and commit all files
 - set the remote origin to the provided URL
 - force-push the current branch to the remote (OVERWRITES remote history)

WARNING: This will overwrite the remote repository history and files. Make sure you
understand the consequences. Disable branch protection on the remote if needed.
#>

param(
    [string]$RemoteUrl = "https://github.com/ather123970/aalacomputer.git",
    [string]$Branch = "main"
)

function Run-Git([string]$cmd) {
    Write-Host "> git $cmd"
    $ps = git $cmd 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "git command failed:" $ps -ForegroundColor Red
        exit $LASTEXITCODE
    }
}

Write-Host "Preparing to push current workspace to: $RemoteUrl (branch: $Branch)" -ForegroundColor Yellow

if (-not (Test-Path ".git")) {
    Write-Host "No .git folder found — initializing a new git repository." -ForegroundColor Cyan
    git init
}

Run-Git "add -A"

# Allow an empty commit message if nothing changed
try {
    Run-Git "commit -m \"Deploy current app - overwrite remote\""
} catch {
    Write-Host "No changes to commit or commit failed — continuing." -ForegroundColor Cyan
}

# Set (or reset) origin
try { git remote remove origin 2>$null } catch {}
Run-Git "remote add origin $RemoteUrl"

Run-Git "branch -M $Branch"

Write-Host "About to FORCE push the current branch to the remote. This will overwrite remote history." -ForegroundColor Red
Write-Host "If the remote repo has branch protection enabled, the push will fail. Disable branch protection or remove the protection rule first." -ForegroundColor Red

$confirm = Read-Host "Type YES to proceed"
if ($confirm -ne 'YES') {
    Write-Host "Aborted by user." -ForegroundColor Yellow
    exit 1
}

Run-Git "push -u origin $Branch --force"

Write-Host "Push complete. If you intend to use Vercel, go to the Vercel Dashboard and connect the repo." -ForegroundColor Green
