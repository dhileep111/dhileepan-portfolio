"""Turn a raw website screenshot into the site's project image (1600x1000 WebP).

Usage:
  python scripts/process-screenshots.py <input.png> <project-slug> <name> [--top PX]

  --top PX   pixels to cut off the top first (e.g. browser tabs + address bar if
             you took a full-window screenshot). Not needed for a page-only capture.

Output: public/projects/<project-slug>/<name>.webp
Names the site expects: see `sites[].image` in src/content/projects.ts.
Take screenshots of the PUBLIC page only (no extensions, tabs, logins or dashboards).
"""
import sys
from pathlib import Path
from PIL import Image

args = sys.argv[1:]
top = 0
if "--top" in args:
    i = args.index("--top"); top = int(args[i + 1]); del args[i:i + 2]
src, slug, name = args
im = Image.open(src).convert("RGB")
im = im.crop((0, top, im.width, im.height))
target = 1.6  # 16:10, cropped from the top of the page (the hero)
h = min(im.height, round(im.width / target))
im = im.crop((0, 0, im.width, h)).resize((1600, round(1600 * h / im.width)), Image.LANCZOS)
if im.height != 1000:
    canvas = Image.new("RGB", (1600, 1000), "white"); canvas.paste(im, (0, 0)); im = canvas
out = Path("public/projects") / slug / f"{name}.webp"
out.parent.mkdir(parents=True, exist_ok=True)
im.save(out, "WEBP", quality=82, method=6)
print(f"wrote {out} ({out.stat().st_size // 1024} KB)")
