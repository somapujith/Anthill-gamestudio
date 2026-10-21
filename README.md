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

The opening uses the supplied Anthill Ventures logo, centered for one second before it moves aside to reveal “GAME STUDIOS” with the supplied React Bits ShinyText effect. It fades out at approximately 3.55 seconds, with a 3.7-second hard deadline, before the website animations begin. Skip intro and Escape dismiss it immediately; reduced motion bypasses it. The hero image preloads during the intro, waits for decoding, then opens with a continuous curtain wipe and a gentle camera settle.

1. A film-poster opening built around “Stories worth playing,” with Anton typography and a masked artwork reveal.
2. A light editorial manifesto connecting Indian cinema, Finnish game craft and worldwide ambition.
3. A scroll-driven cinematic scene that moves from characters becoming culture to players living the story, followed by the India × Finland proposition.
4. Three animated world explorations, clearly identified as concept art, and an interactive creative workbench exploring story, world and play.
5. Formal portraits of Rana Daggubati and Prasad Vanga from their official Anthill Ventures profiles.
6. Invitations for storytellers, creators and industry collaborators, with working email links.

Motion includes staggered headline entrances, artwork reveals, parallax, coordinated section entrances, a sticky cinematic transition, magnetic links and animated process changes. The cinematic sequence becomes a readable linear story on phones, on screens shorter than 700px, and when reduced motion is requested. Mobile navigation locks background scrolling and supports keyboard access.

## Source material

The supplied Anthill Game Studios identity provides the illustrative worlds. The user-provided Anthill Ventures logo appears in the header and footer. The supplied studio communication sets the cinema-led narrative. Self-hosted Anton, DM Sans and Space Mono create the active type system. The stylesheet `src/cinematic.css` owns this visual direction over the retained component styles.

Portraits and supported biographies come from Anthill Ventures' official profiles. Prasad's title is explicitly Founder & CEO of Anthill Ventures. Contact options use the organization's published email address. Profile and asset provenance are recorded in public/assets/people-sources.md.

Asset provenance and font licenses are in public/assets/SOURCES.md.

## Verification

Run browser checks through the Playwright CLI:

```sh
npx @playwright/cli -s=anthill open http://localhost:4174/
npx @playwright/cli -s=anthill run-code --filename scripts/redesign-check.cjs
npx @playwright/cli -s=anthill run-code --filename scripts/viewport-audit.cjs
npx @playwright/cli -s=anthill run-code --filename scripts/motion-audit.cjs
npx @playwright/cli -s=anthill run-code --filename scripts/interaction-audit.cjs
npx @playwright/cli -s=anthill run-code --filename scripts/entry-check.cjs
npx @playwright/cli -s=anthill run-code --filename scripts/hero-reveal-check.cjs
npx @playwright/cli -s=anthill run-code --filename scripts/hero-text-check.cjs
```

The check asserts responsive text and overflow at eleven widths from 320px to 1920px, image and anchor integrity, loaded fonts, reduced motion, mobile content order, keyboard navigation, creative process states and contact choices. It also exercises the normal-motion desktop cinematic sequence at three scroll positions and verifies its text transition and sticky positioning. Screenshots are written under output/playwright/.

The viewport audit checks 49 sizes from 320px to 2560px, including both sides of every layout breakpoint and short landscape screens. The motion audit checks every section entrance completes in six portrait, landscape, tablet and desktop configurations, alongside background scroll locking, keyboard focus trapping, reading progress and the correct cinematic layout. The interaction audit checks all craft and contact states with motion enabled at 320px, 768px and 1440px, plus menu anchor navigation and resize cleanup. These checks exercise Chromium's emulated viewports; they do not establish physical-device or cross-browser coverage.

The entry check verifies logo centering, the one-second hold, animated ShinyText, the under-five-second handoff, scrolling restoration, skip controls and reduced motion at four widths. The hero reveal check samples individual animation frames at three widths, including a delayed image response, to catch snapping, opacity flashes and premature reveals. The hero text check samples the intro-to-website handoff to verify the three headline lines reveal without rotation, opacity resets or leftover transforms.
