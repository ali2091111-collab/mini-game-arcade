# Deployment readiness — Mini Game Arcade (Prompt 4 check)

Checked 2026-10-30 against the actual files in this folder. Nothing below claims a deployment succeeded — no site has been deployed yet.

## Project type
- Plain static HTML / CSS / JavaScript. No framework, no package.json, no build step.
- Project root = the folder containing `index.html` (this folder).
- Pages: `/` (homepage), `/games/slice-rush/` (Slice Rush), `/about.html`, `/contact.html`, `/privacy.html`, `/terms.html`.
- All assets are local and relative (`styles.css`, `game.js`, `site.js`). No external URLs in the game code, no backend, no database, no API key, no secret.

## Vercel settings (dashboard, when the user is ready)
- Import the GitHub repository containing this folder (see GitHub steps below).
- Framework preset: Other / static (no preset needed).
- Build command: none (leave empty — there is nothing to build).
- Output directory: none / project root (do not set `dist` — there is no Vite build).
- Install command: none.
- `vercel.json`: NOT needed. Routes are plain files, so refreshing a game page does not need a rewrite.
- Environment variables: none needed. Never paste secrets into client-side code.

## GitHub preparation (Prompt 5)
- Suggested repository name: `mini-game-arcade`.
- `.gitignore` in this folder excludes OS clutter and any future build output; there is no `node_modules` or secret file to exclude in this static project.
- The repository is NOT created yet and nothing has been pushed. Exact commands for the user, run from this folder, once they have created an empty repository on GitHub:

```bash
git init
git add .
git commit -m "Initial mini-game arcade"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with the real repository URL. Do not rerun `git init` or add a remote if the folder is already a Git repository — check `git status` first.

## What still needs the user before any live deployment
1. A GitHub account and an empty `mini-game-arcade` repository (or an existing one they choose).
2. A Vercel account, connected to that GitHub account, to import the repository.
3. Real contact details and an operator name for the Contact/About pages before any AdSense step (currently placeholders — see README.md).
4. No AdSense code is added in this project, and none should be added until the user supplies the actual account/code and confirms placement, with the Privacy Policy updated to match.

## Local test already done
- Served with `python3 -m http.server` and fetched `/`, `/games/slice-rush/`, `/about.html`, `/contact.html`, `/privacy.html`, `/terms.html`, `/styles.css`, `/game.js`, `/site.js` — all HTTP 200.
- `node --check game.js` and `node --check site.js` — both pass.
- All element IDs the game needs are present on the Slice Rush page.
- One real round on a phone/desktop after deployment is still worth confirming for touch feel.
