# Asset sources

Illustrations come from the supplied Anthill identity document. The official logo was supplied separately by the user. Current people photography comes from Anthill Ventures' official profiles; see people-sources.md. No generated people photography is used.

## Anthill brand illustrations

Source: `Anthill-Game-Studios-Identity.pdf` in project root.

- `portal.webp` ? page 1, stepped Anthill portal.
- `energy.webp` ? page 2, neon energy and stepped structure.
- `anthill.webp` ? page 3, illuminated Anthill symbol.
- `terrain.webp` ? page 4, cropped clean illuminated landscape strip.
- `frames.webp` ? page 5, nested stepped portals.
- `mass-heroes.webp` ? page 6, cinematic pixel brawler world.
- `mumbai.webp` ? page 7, illustrated Mumbai motorcycle world.
- `myth.webp` ? page 8, mythological post-collapse world.
- `wordmark.webp` ? actual Anthill Game Studios brand lockup as rendered from page 1.

Illustrations are cropped to remove baked presentation headings and page borders, then encoded as WebP. Game world imagery is concept art from the identity document.

## Archived people assets (not used by the current website)

Source: `Infuse_Deck_Proposal_draft (1).pdf`, page 9. Actual embedded photos, extracted and encoded as WebP:

- `juha.webp` ? Juha Huhtakallio.
- `jani.webp` ? Jani Joenniemi.

## Self-hosted fonts

Downloaded from the official Google Fonts CSS API and Google Fonts CDN on 2026-10-21. Latin subsets only.

- `display.woff2` ? Bodoni Moda, normal variable weight 400?900 (requested display range: 700?900).
- `body.woff2` ? DM Sans, normal variable weight 100?1000 (requested body range: 400?700).
- `mono.woff2` ? Space Mono, normal weight 400.

Official metadata: https://fonts.google.com/specimen/Bodoni+Moda, https://fonts.google.com/specimen/DM+Sans, https://fonts.google.com/specimen/Space+Mono

SIL Open Font License files are preserved as `bodonimoda-OFL.txt`, `dmsans-OFL.txt`, and `spacemono-OFL.txt`, downloaded from https://github.com/google/fonts/tree/main/ofl.

## Official Anthill Ventures logo

Source: user-provided `Anthill Ventures Logo.png` (1010 x 240 RGBA). `official-logo.png` / `.webp` trim transparent outer padding only (613 x 212); original white text, red symbol, and alpha preserved. `official-symbol.png` / `.webp` extract the original red symbol for header lockups (152 x 212). WebP assets use lossless compression.

## Presentation redesign additions

- display-italic.woff2: Bodoni Moda italic Latin font, sourced from the official Google Fonts CSS API on 2026-10-21; same SIL Open Font License.
- The hero uses the supplied Mumbai creative-direction artwork with CSS lighting and gentle camera drift. No new stock or generated imagery is used.

## Current digital studio typography and portraits

- `gaming-display.woff2`: Oxanium, normal variable weight 200–800, Latin subset.
- `gaming-body.woff2`: Space Grotesk, normal variable weight 300–700, Latin subset.
- Both downloaded from the official Google Fonts CSS API and CDN on 2026-10-21. Variable weight axes were verified with fontTools.
- Font information: https://fonts.google.com/specimen/Oxanium and https://fonts.google.com/specimen/Space+Grotesk
- SIL Open Font Licenses are preserved as `oxanium-OFL.txt` and `spacegrotesk-OFL.txt`, from the official google/fonts repository.
- `rana-daggubati.webp` and `prasad-vanga.webp`: formal portraits from official Anthill Ventures profiles. Exact original image URLs and biography references are in `people-sources.md`.
- Bodoni Moda and DM Sans files are retained from the prior design and are not loaded by the current website.
