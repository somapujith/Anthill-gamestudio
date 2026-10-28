# Asset sources

## Crystal hero artwork

`hero-crystal-{480,960,1280}.{avif,webp}` is a transparent rendered interpretation of the user's supplied faceted crystal Anthill symbol reference, produced with image generation and exported at responsive sizes. The dark sapphire body, prismatic cyan/pink/peach edges and optical facets follow that reference. The source generated PNG remains outside the repository; these optimized assets are self-contained.

`hero-nebula.webp` is an offline procedural violet/pink nebula texture with blue lower wisps. Both hero images animate only through CSS transforms; no image-generation service or procedural shader runs in the browser.

## Pixel studio logo

`studio-logo.webp` is the Anthill Game Studios pixel lockup extracted from the top-left of page 1 of the supplied `Anthill-Game-Studios-Identity.pdf`. Its dark presentation backdrop is removed with a luminance alpha mask, retaining the original stepped symbol and lettering in cream. `studio-symbol.webp` and `studio-wordmark.webp` split that same lockup at its existing gap for the introductory reveal. All three use lossless WebP and are used for the studio branding.

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
- Bodoni Moda files are retained from the prior design and are not loaded by the current website.

## Cinema-led redesign typography

- `anton.woff2`: Anton regular, Latin subset. Downloaded from the official Google Fonts CSS API and Google Fonts CDN for the October 2026 redesign. Source: https://fonts.googleapis.com/css2?family=Anton&display=swap and https://fonts.gstatic.com/s/anton/v27/1Ptgg87LROyAm3Kz-C8.woff2
- `anton-OFL.txt`: SIL Open Font License from https://github.com/google/fonts/blob/main/ofl/anton/OFL.txt
- The active type system uses Anton for film-poster display headings, existing DM Sans for readable body text and Space Mono for supporting labels. Oxanium and Space Grotesk remain archived assets.
- The scroll-driven cinematic sequence reuses the supplied `mass-heroes.webp` concept art. No new commercial film imagery or generated portraits are introduced.

## Scalable studio identity

- `studio-logo.svg`, `studio-wordmark.svg` and `studio-symbol.svg` contain transparent vector outlines traced from the approved corresponding WebP assets. They preserve the existing pixel artwork and lettering, without substituting a font or inventing a new lockup.
- The source alpha silhouette is traced at its 50% boundary; collinear segments are combined and holes retain even-odd filling. The SVG files contain paths, with no embedded raster images, filters or external font dependencies.
- `scripts/prepare-brand-vectors.py` reproduces these assets using Pillow. The website uses the SVG versions for its header, footer, introduction and decorative studio marks. The WebP sources remain available as provenance.
- The 3D hero samples the same SVG symbol for its stepped outline. Its clean material uses lighting and shallow bevels rather than the previous grain/bump texture.
- The current storytelling sequence uses supplied `frames.webp` identity artwork; the three world chapters retain their original concept-art assets.
