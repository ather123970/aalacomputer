# How to overwrite a remote GitHub repo with this workspace and deploy to Vercel

This document shows safe, repeatable steps to replace the contents of the GitHub repo
`https://github.com/ather123970/aalacomputer.git` with the current workspace and then
deploy to Vercel. I cannot perform the push from here for you — you'll run the commands locally.

IMPORTANT SAFETY NOTES
- Force-pushing will replace the remote history and files. Do NOT run this unless you are sure.
- If the remote repository has branch protection enabled, the force push will fail. Temporarily disable
  branch protection or remove the branch protection rule for `main` (or your target branch).

Option A — Quick (PowerShell) automated script

1. From the repository root (this workspace), run the included script:

```powershell
.\push_to_github.ps1 -RemoteUrl "https://github.com/ather123970/aalacomputer.git" -Branch "main"
```

2. The script will ask you to type YES to confirm. It will initialize git if needed, commit all files,
   set the remote, and force-push the current branch to the remote.

Option B — Manual steps (safe, explicit)

```powershell
# 1. Ensure git is installed and you're in repo root
git init
git add -A
git commit -m "Deploy current app - overwrite remote" || echo "No changes to commit"
# 2. Configure remote (replace URL if different)
git remote remove origin 2>$null || echo "no origin"
git remote add origin https://github.com/ather123970/aalacomputer.git
git branch -M main
# 3. Force push (OVERWRITES remote history)
git push -u origin main --force
```

Post-push: Vercel deployment

1. Log into Vercel (https://vercel.com) and import the repository (if you used GitHub the repo will now contain this workspace).
2. In Vercel Project Settings > Environment Variables, add any secrets your backend needs (MONGO_URI, ADMIN_JWT_SECRET, etc.).
3. Deploy. Because this repo contains `vercel.json` and serverless wrappers under `api/`, Vercel will deploy static frontend from `dist/` and the backend as `/api/*` serverless functions.

If you prefer a CI flow (GitHub Actions) or want me to add GitHub Action YAML to automatically push and/or deploy, tell me and I can add it.
