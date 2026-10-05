"""Turn a raw website screenshot into the site's project image (1600px-wide WebP).

Usage:
  python scripts/process-screenshots.py <input.png> <project-slug> <name> [--top PX] [--bottom PX] [--right PX]

  --top/--bottom/--right  pixels to cut off each edge first: browser tabs + address bar,
                          the Windows taskbar, the scrollbar. Not needed for page-only captures.

Output: public/projects/<project-slug>/<name>.webp  (prints the width x height to put in
`sites[]` in src/content/projects.ts so the page reserves the right space).
Take screenshots of the PUBLIC page only, logged out (no admin bar, extensions, tabs or dashboards).
"""
import sys
from pathlib import Path
from PIL import Image

args = sys.argv[1:]
cut = {"--top": 0, "--bottom": 0, "--right": 0}
for k in cut:
    if k in args:
        i = args.index(k); cut[k] = int(args[i + 1]); del args[i:i + 2]
src, slug, name = args
im = Image.open(src).convert("RGB")
im = im.crop((0, cut["--top"], im.width - cut["--right"], im.height - cut["--bottom"]))
im = im.resize((1600, round(im.height * 1600 / im.width)), Image.LANCZOS)
out = Path("public/projects") / slug / f"{name}.webp"
out.parent.mkdir(parents=True, exist_ok=True)
im.save(out, "WEBP", quality=82, method=6)
print(f"wrote {out} ({out.stat().st_size // 1024} KB) -> width: {im.width}, height: {im.height}")
