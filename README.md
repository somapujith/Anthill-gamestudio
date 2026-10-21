# Anthill Game Studios

A presentation-ready studio introduction built with React, Vite, GSAP and Lenis.

## Local development

```sh
npm install
npm run dev -- --port 5174
```

## Present the production build

```sh
npm run build
npm run present
```

Open http://localhost:4174/ and use normal browser zoom. All artwork and fonts are self-hosted, so the built website has no external asset or API dependency. Keep this terminal running during the presentation. Stop with Ctrl+C.

## The experience

1. A clear cinematic opening with original Indian-world artwork, the official logo and a direct studio proposition.
2. A studio manifesto rooted in Indian cinema, culture and mythology.
3. Three animated world explorations, clearly identified as concept art.
4. A creative workbench exploring story, world and play, followed by the studio's creative principles.
5. Formal portraits of Rana Daggubati and Prasad Vanga from their official Anthill Ventures profiles.
6. Invitations for storytellers, creators and industry collaborators, with working email links.

The website contains no playable games, artificial loading sequence, popup gallery or FAQ accordion. Motion respects the reduced-motion preference. Mobile navigation and invitation choices support keyboard access.

## Source material

The supplied Anthill Game Studios identity provides the illustrative worlds. The user-provided Anthill Ventures logo appears in the header and footer. The public-facing content presents a game studio, with no proposal, financing or investment narrative. Self-hosted Oxanium and Space Grotesk fonts create the digital visual direction.

Portraits and supported biographies come from Anthill Ventures' official profiles. Prasad's title is explicitly Founder & CEO of Anthill Ventures. Contact options use the organization's published email address. Profile and asset provenance are recorded in public/assets/people-sources.md.

Asset provenance and font licenses are in public/assets/SOURCES.md.

## Verification

Run browser checks through the Playwright CLI:

```sh
npx @playwright/cli -s=anthill open http://localhost:4174/
npx @playwright/cli -s=anthill run-code --filename scripts/presentation-check.cjs
npx @playwright/cli -s=anthill run-code --filename scripts/presentation-interactions.cjs
```

The checks cover responsive text and overflow, images, fonts, reduced motion, navigation, creative process states and contact choices. Screenshots are written under output/playwright/.
