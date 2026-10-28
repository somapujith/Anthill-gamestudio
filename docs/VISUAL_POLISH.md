# Studio visual pass

The visual pass preserves the approved studio identity, four V2 characters, Indian-content positioning and existing profile/contact actions.

## Changes

- Compact mobile hero composition shows the entire 3D mark with the headline and primary action in the checked portrait viewports.
- A single beveled extrusion replaces the earlier field of small boxes. Its rotation slows near the front-facing view, with restrained reflections and a clean surface.
- The five-second introduction moves its flat mark toward the measured hero mark before fading. Skip, Escape and reduced-motion completion restore interaction and scrolling.
- The header remains available while scrolling, includes People, and retains the Our craft indicator through the DNA section.
- World chapters use poster, panorama and reversed split compositions. The storytelling section uses separate supplied identity artwork.
- Process tabs show a storyboard, spatial blockout and interaction diagram. The India–Nordics band includes a stepped Hyderabad–Helsinki connection.
- Four compact character cards share aligned stages and visible names/roles. Rana and Prasad retain their sourced biographies and links inside accessible disclosure controls.
- Contact options have stronger selected states and consistent action sizing. The footer presents a large official lockup and the studio locations.
- Removed hero labels and interaction-instruction text stay removed.

## Sharp logo assets

`studio-logo.svg`, `studio-wordmark.svg` and `studio-symbol.svg` replace scaled raster assets throughout the site. They are transparent path outlines of the approved pixel artwork, with no embedded images, font dependencies or blur filters. The original WebP assets remain as provenance.

`python scripts/prepare-brand-vectors.py` regenerates them with Pillow. Python is not required for the production website build.

Browser rasterization at the original dimensions matched all source alpha-mask pixels: 28,944 lockup pixels, 23,038 wordmark pixels and 5,906 symbol pixels, with zero silhouette differences. Header and footer lockups were inspected at 200px and 1,160px rendered widths. The 3D material no longer uses the heavy grain/bump texture or broad glow filters.

## Validation

- Production build passes. Vite retains a size warning for the separately loaded Three.js chunk.
- Chromium viewport checks cover 320, 360, 390, 600, 601, 768, 900, 901, 1024, 1440 and 1920px widths, plus 844 × 390 landscape. No horizontal overflow or clipped character names was found.
- At 390 × 844, the hero sculpture container ends around 646px from the viewport top. At 1440 × 1000, the default people section is about 1,101px tall, compared with about 2,717px before the pass.
- Intro duration measured about 4.9 seconds from the browser test's observation point. Handoff, Skip, Escape and live reduced-motion completion pass.
- Hero rotation, pause/resume, all four character gestures, repeated activation, approval reactions, keyboard input, offscreen suspension and missing-atlas fallbacks pass.
- SVG loading, unchanged silhouettes, unavailable WebGL and context loss/restoration pass.
- Sticky navigation, mobile People navigation, menu focus restoration, biography disclosures, all process states and all contact states pass.
- A focused static text-contrast check found and corrected the pale heading on the cream Mumbai panel and the route caption on red. After correction it reported no failures across 199 sampled text elements. Image-overlay contrast and full accessibility conformance require separate manual assessment.
- No JavaScript page errors occurred in the recorded functional runs. The software WebGL renderer emitted a non-fatal Three.js shader precision warning during environment-map preparation.

Checks are in `scripts/visual-pass-check.cjs`, `scripts/brand-vector-check.cjs`, `scripts/entry-check.cjs`, `scripts/hero-reveal-check.cjs`, `scripts/hero-fallback-check.cjs`, `scripts/characters-check.cjs` and `scripts/characters-edge-check.cjs`. These files are Playwright CLI callbacks, matching the repository's existing check format.

Screenshots and raw run logs are kept locally in the ignored `output/playwright/visual-pass/` directory. Viewport emulation does not establish physical-device or cross-browser coverage.
