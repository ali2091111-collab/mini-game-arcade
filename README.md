# Mini Game Arcade

A small, static arcade website with one original, playable game so far: **Slice Rush**, a fruit-slicing mini-game built with plain HTML, CSS and JavaScript only.
No backend, no database, no API key, no paid service, no ads, no accounts, and no external assets.

## What is on the site

- `index.html` — homepage: short introduction and a responsive grid of game cards. Only games that actually work are listed. Right now that is Slice Rush only — no fake cards or Play buttons that lead nowhere.
- `games/slice-rush/index.html` — the dedicated, playable Slice Rush page.
- `about.html`, `contact.html`, `privacy.html`, `terms.html` — info pages, linked from the header and footer of every page.
- `styles.css` — shared responsive layout for phone, tablet and desktop.
- `game.js` — Slice Rush physics, slicing, particles, combo, timer, lives, states and sound.
- `site.js` — only the placeholder contact form's on-page note. It sends nothing anywhere.

## How to play Slice Rush

- Drag your mouse, finger or stylus across a fruit to slice it.
- Each fruit is worth 10 points. Slice fruit quickly, one after another, to build a combo bonus: the 2nd fruit in a quick chain adds +5, the 3rd adds +10, and so on.
- **Do NOT slice a bomb.** A bomb costs one life. You have 3 lives.
- The game lasts 60 seconds. The game ends when time runs out or you lose all 3 lives.
- Buttons: **Start**, **Pause / Resume**, **Restart**, **Sound on / off**, **How to play**.
- Keyboard: `Space` start / pause, `R` restart, `M` sound on / off.
- Sound effects are generated in the browser with Web Audio only after you press a button, and can be muted at any time.

All fruit, bombs, particles and the blade trail are simple shapes drawn in code. Nothing here copies a famous game's branding, artwork or assets.

## Run locally

There is no build step and no `npm install` to run.

```bash
cd mini-game-arcade
python3 -m http.server 8000
```

Then open <http://127.0.0.1:8000/> in your browser. The homepage is at `/`, and Slice Rush is at `/games/slice-rush/`.

Opening `index.html` directly from the file system also works, but serving it locally (above) matches how it behaves when hosted.

## How to add a new game later

Do not add a homepage card until the game is fully playable. For each new game:

1. Create its own folder and page, following the Slice Rush pattern, for example `games/memory-match/index.html` with its own game script (for example `games/memory-match/game.js`) or a shared script if it genuinely fits.
2. Keep the game's assets inside the project, use original artwork only, and make sure mouse, touch and keyboard controls all work, plus start, pause (if applicable), restart and a clear end state.
3. Add a card to the homepage grid in `index.html` only after step 2 is tested: title, an original code-drawn thumbnail/illustration, a short description, and a Play button linking to the game's real page.
4. Add a short controls explanation on the game's own page.
5. Add the new page to the header/footer navigation pattern used by the other pages.
6. Re-run the checks in "Tested" below, including fetching every page from the local server.

## Deploy as a static site on Vercel (not done here — no deployment was made)

This project is already a plain static site, so deployment needs no build command:

1. Put this folder in a Git repository and push it to GitHub.
2. In Vercel, choose **Add New → Project** and import that repository.
3. Set the project root to the folder containing `index.html` (this folder, `mini-game-arcade`).
4. Leave the framework preset as "Other" / static — there is no build command and no output directory to configure for this project.
5. Click **Deploy**, then open the generated `.vercel.app` URL and test the homepage, every info page and the game on desktop and mobile.

No environment variables or secrets are needed. Do not add a `vercel.json` — this plain static structure does not need one, and client-side routing is not used, so a refresh on any page serves a real file. Do not add any ad code unless you separately provide it and confirm where it should go.

## Tested

- `node --check game.js` and `node --check site.js` — both pass.
- Served locally with `python3 -m http.server` and fetched every page — `/`, `/games/slice-rush/`, `/about.html`, `/contact.html`, `/privacy.html`, `/terms.html`, plus `styles.css`, `game.js` and `site.js` — all returned HTTP 200.
- Checked that every internal link target in the HTML files resolves to a file that exists in the project, and that all game control/canvas element IDs required by `game.js` are present on the Slice Rush page.
- Code-reviewed for the full state flow: start, pause/resume, restart, timer expiry, bomb/lives game-over, combo scoring, sound toggle, mouse and touch input, and narrow-mobile layout (2-column HUD, flexible buttons, canvas scaling with `touch-action: none` on the canvas only, so normal page scrolling elsewhere is unaffected).

## Known limitations

- No live-browser playtest was run in this build step (no browser task was used), so visual feel on a real phone should still be confirmed by playing one round after opening the local server URL.
- Scores are kept only in the page session; there is no leaderboard, account or saved high score.
- The contact form is a placeholder: it is not connected to any email or form service and sends nothing. Real contact details are still needed from the site owner before any AdSense step — see "Still needed from the site owner" below.
- Only Slice Rush is playable. Later games (for example Memory Match) must be built as separate, working pages — no placeholder cards.

## Still needed from the site owner (before any AdSense step)

- A real contact email address (and, if a working form is wanted, a chosen form/email service to connect it to). The Contact page currently shows a clearly marked placeholder, not a real address.
- The name of the person or business operating the site, if it is to appear on the About page.
- Confirmation of where any future ad code should go, and the actual AdSense account/code — none has been added, and none should be added until the owner provides it.
- A live deployment URL to test, once the owner deploys (deployment was deliberately not done in this step).
