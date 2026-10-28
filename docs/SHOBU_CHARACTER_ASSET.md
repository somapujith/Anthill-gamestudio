# Shobu character asset

Generated with the built-in image generation tool using a transparent background. Saved atlas: `public/assets/shobu-atlas.webp`. The official portrait and existing Prasad atlas were supplied as identity and style references respectively. See `public/assets/people-sources.md` for attribution.

The delivered atlas is 1774 × 887 pixels (four columns, two rows). Its alpha channel is preserved in the lossless WebP conversion. Runtime CSS scales the figure to align with the existing characters; frames 2–5 provide the four-step walking gait. The source portrait fallback is `public/assets/shobu-yarlagadda.webp`.

## Final prompt

Use case: identity-preserve / game sprite asset.
Create one production-ready transparent RGBA sprite atlas of Shobu Yarlagadda, based on reference image 1 for his recognizable facial identity. Reference image 2 is STYLE AND GRID REFERENCE ONLY: match its polished detailed pixel-art human character style, grounded proportions, crisp pixel clusters, shading and consistent cell registration, but do not copy that man's face or blue suit.
Exact atlas layout: 4 columns by 2 rows, total canvas 2048 by 1024 pixels, eight equal 512 by 512 cells. Each cell has generous transparent padding, one full-body instance of THE SAME man at identical scale. Head near y=110, shoe baseline near y=478 within each cell. Nothing may touch or cross a cell boundary. No cell lines, labels, captions, text, logos, scenery, floor, props, drop shadow or watermark. Real transparency, not black or checkerboard.
Subject: match Shobu's face in reference 1, clean-shaven, short dark hair with gray at temples, receding hairline, thin rimless rectangular glasses. White long-sleeved button-down shirt, sleeves casually rolled to forearms, charcoal trousers, black shoes. Consistent face, glasses, outfit, body proportions and lighting in every frame. Professional, friendly, natural posture. Match the existing atlas's detailed pixel-art texture, not a smooth vector or photoreal person.
Frames, reading left to right across top row then bottom row:
0: neutral standing, three-quarter front facing slightly right, feet together comfortably, arms relaxed.
1: same standing pose with a very slight weight shift and natural breathing.
2: WALK CYCLE A, three-quarter rightward walking IN PLACE, left foot clearly forward and right leg back, right arm counter-swings forward.
3: WALK CYCLE B, passing pose, legs pass under the hips, trailing heel lifted, natural counter-swing.
4: WALK CYCLE C, opposite stride, right foot clearly forward and left leg back, left arm counter-swings forward.
5: WALK CYCLE D, opposite passing pose, legs passing under hips, trailing heel lifted.
6: back to relaxed standing, small natural weight shift.
7: relaxed standing facing slightly right, consistent friendly expression.
The walking poses in frames 2,3,4,5 MUST be genuinely different leg and arm positions forming a readable continuous four-frame walk cycle. Keep the character centered within each cell: lateral movement will be added in the website. Do not duplicate the same standing pose for walking. Preserve the full body and registered head and foot heights across frames.
