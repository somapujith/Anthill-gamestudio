# Anthill Game Studios

A cinematic, communication-led concept website built with React, Vite, GSAP and Lenis.

## Run locally

```sh
npm install
npm run dev -- --port 5174
```

Production build: `npm run build`. Preview the build: `npm run preview`.

## Experience

- Official supplied Anthill Ventures logo and artwork extracted from the Anthill Game Studios identity.
- Creative vision, proposal-sourced opportunity figures, Indian–Nordic collaboration, project structure, revenue model, team and contact links.
- GSAP typography sequences, scroll-linked illustrations, animated connection diagram, ambient pixels, counters, magnetic links and reactive art cards.
- Mobile navigation, creative-direction dialogs and FAQ accordions. There are no playable games or game controls.
- Self-hosted fonts and images, keyboard support and reduced-motion styling.

## Source material

The supplied `Anthill-Game-Studios-Identity.pdf` provides the visual language and illustrative worlds. `Infuse_Deck_Proposal_draft (1).pdf` provides the proposed collaboration and commercial model, contacts and cited opportunity figures. Figures are attributed to that draft and are not presented as a live market-data feed. The documents do not establish a formal corporate relationship between the two brands.

Asset provenance and font licenses are in `public/assets/SOURCES.md`.

## Browser verification

The scripts in `scripts/` run through `@playwright/cli run-code --filename <script>`. They inspect responsive text, document overflow, image loading, navigation, creative-direction dialogs, FAQ behavior and motion. Screenshots are written to the ignored `output/playwright/` directory.
