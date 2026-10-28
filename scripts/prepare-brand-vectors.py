"""Trace the approved pixel artwork to scalable, transparent SVG outlines."""
from pathlib import Path
from PIL import Image

ASSETS = Path(__file__).resolve().parents[1] / "public" / "assets"


def outline(image):
    mask = image.convert("RGBA")
    width, height = mask.size
    alpha = mask.getchannel("A")
    edges = {}

    def occupied(x, y):
        return 0 <= x < width and 0 <= y < height and alpha.getpixel((x, y)) >= 128

    def edge(start, end):
        edges.setdefault(start, []).append(end)

    for y in range(height):
        for x in range(width):
            if not occupied(x, y):
                continue
            if not occupied(x, y - 1):
                edge((x, y), (x + 1, y))
            if not occupied(x + 1, y):
                edge((x + 1, y), (x + 1, y + 1))
            if not occupied(x, y + 1):
                edge((x + 1, y + 1), (x, y + 1))
            if not occupied(x - 1, y):
                edge((x, y + 1), (x, y))

    paths = []
    while edges:
        start = next(iter(edges))
        point = start
        contour = []
        while True:
            contour.append(point)
            candidates = edges[point]
            end = candidates.pop()
            if not candidates:
                del edges[point]
            point = end
            if point == start:
                break
        corners = []
        for i, (x, y) in enumerate(contour):
            previous = contour[i - 1]
            following = contour[(i + 1) % len(contour)]
            if (x - previous[0]) * (following[1] - y) != (y - previous[1]) * (following[0] - x):
                corners.append((x, y))
        if len(corners) >= 3:
            paths.append("M" + "L".join(f"{x} {y}" for x, y in corners) + "Z")
    return width, height, "".join(paths)


for name in ("studio-logo", "studio-wordmark", "studio-symbol"):
    width, height, path = outline(Image.open(ASSETS / f"{name}.webp"))
    label = "Anthill Game Studios" if name != "studio-symbol" else "Anthill pixel symbol"
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" '
        f'viewBox="0 0 {width} {height}" role="img" aria-label="{label}">'
        f'<path fill="#f0eee6" fill-rule="evenodd" d="{path}"/></svg>\n'
    )
    (ASSETS / f"{name}.svg").write_text(svg, encoding="utf-8")
    print(f"{name}.svg: {width} x {height}, {len(svg):,} bytes")
