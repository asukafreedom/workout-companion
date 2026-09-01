# Workout Companion

Phone-first offline PWA for a fixed weekly training plan: 3D muscle guide,
set-by-set lifting log with double-progression nudges, rest timer,
body-weight trend, nutrition card. All data stays on-device (localStorage);
back up via Plan → Export.

## Develop

    npm install
    npm run dev      # dev server
    npm test         # vitest
    npm run build    # typecheck + production build

## Deploy (GitHub Pages)

This folder is designed to be its own GitHub repo. From the parent repo:

    git subtree split --prefix workout-companion -b workout-app
    # create an empty GitHub repo, then:
    git push <remote-url> workout-app:main

Then enable Pages: repo Settings → Pages → Source: GitHub Actions.
The included workflow builds and deploys on every push. On your phone,
open the Pages URL once and "Add to Home Screen" — it works offline
after that.

## Changing the program

Edit `src/data/plan.ts` (exercises, sets/reps, muscle maps, cues) and push.
