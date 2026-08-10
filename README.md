# ZYPHOR'26 — Setup Notes

## Replace these placeholders before launch
1. **Logo** — `index.html` has `ZYPHOR_LOGO_HERE` in the hero. Swap it for an `<img>` tag once the real logo is ready.
2. **Payment QR code** — drop your QR image at `assets/payment-qr.png`. It will appear automatically; until then a `QR_CODE_IMAGE_HERE` placeholder shows in its place.
3. **Host passcode** — open `host.js` and change `HOST_PASSCODE` (currently `ZYPHOR26HOST`) to something private. This is a client-side gate only — it deters casual access, it is not real authentication.

## How the "one page, linked by team name" flow works
- `index.html` now has **one combined flow**: About → Select Domain → Team & Registration Details → Payment → Confirm. There's no separate problem-statement page and no Google Form redirect.
- On "Confirm Team," everything (domain choice + registration details + payment screenshot) is saved as **one record** in the browser's `localStorage`, under the key `zyphor26_teams`, keyed by the team name.
- `host.html` is the **hidden organizer dashboard** — it's not linked from the navigation anywhere. It reads that same `zyphor26_teams` data, so every row already has the domain and registration fields linked together by team name. It supports search, domain filter, screenshot preview, CSV export, and delete.

## Important limitation to know about
`localStorage` lives **only in the browser/device that filled the form**. It is not a shared server database — so `host.html` will only show registrations submitted from the same browser. This is fine for a demo or a single reception laptop collecting entries, but for a real multi-device rollout (any participant's phone/laptop → one shared organizer view), you'd want to point `readTeams()`/`writeTeams()` in `script.js` and `host.js` at a real backend — Firebase Firestore is a natural fit here and mirrors what you already know from Aeris.
