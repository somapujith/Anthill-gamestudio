# Anthill Game Studios — V2

The supplied `New/Anthill-Gaming-Studios-New/project` website is integrated at the repository root on branch `V2`: Play Beyond opening, aurora background, rotating metal logo, world dialogs, ethos sequence, interactive team characters, collaboration tabs and scribble mode.

## Run

```sh
npm install
npm run dev
```

For a production preview:

```sh
npm run build
npm run present
```

Open http://localhost:4174/. Vite builds into `dist/`, and the existing Vercel configuration still applies. Artwork, fonts and audio are self-hosted. Only clicking Rana requests the impact sound; there is no background music. Contact links open an email application.

## Edit

- `index.html` owns the active page and ordered stylesheet/script references.
- `public/` contains the supplied styles, browser scripts and assets. The active runtime is `app.js`, `impact-v8.js`, `studio-v7.js`, `aurora-v8.js`, `strips-v7.js` and `polish-v9.js`.
- `public/assets/` retains the supplied assets alongside existing provenance records and font license notices.
- The previous React implementation remains in `src/` for reference and is not mounted by V2. Its five-second intro is superseded by the supplied opening.

The original import folder is a local reference, not a build dependency. A clean checkout of `V2` runs without it. Historical styles and scripts from the supplied package are retained; `index.html` determines which ones are active.

## Verify

```sh
npm run check
npm run build
npx @playwright/cli -s=anthill-v2 open http://localhost:4174/ --browser chrome
npx @playwright/cli -s=anthill-v2 run-code --filename scripts/v2-check.cjs
```

The static check validates anchors, unique IDs, local HTML/CSS references and loaded script syntax. The browser check covers responsive layout, artwork, fonts, world dialogs, keyboard tabs, team actions, animation pause, scribble drawing, reduced motion and the canvas fallback when WebGL is unavailable. Screenshots go into `output/playwright/`. Older browser checks target the previous React site and should be run on `main`.

Browser checks use emulated Chromium viewports; they do not establish physical-device or cross-browser coverage.
