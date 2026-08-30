"""Generate PWA / OG raster assets from HeartWire brand PNGs in assets/brand/."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageEnhance

ROOT = Path(__file__).resolve().parents[1]
BRAND = ROOT / "assets" / "brand"
OUT = ROOT / "public"

MASTER_DARK = BRAND / "master-dark-mode.png"
MASTER_LIGHT = BRAND / "master-light-mode.png"
BG_DARK = (10, 10, 18)  # #0a0a12
BG_LIGHT = (248, 247, 255)  # #F8F7FF

# Fractional crop boxes tuned to the heart mark in each lockup.
CROP = {
    # Heart mark sits lower-left on the horizontal lockups.
    "dark": {"left": 0.045, "top": 0.30, "size_w": 0.26, "size_h": 0.52},
    "light": {"left": 0.065, "top": 0.14, "size_w": 0.28, "size_h": 0.58},
}


def crop_box(img: Image.Image, variant: str) -> tuple[int, int, int, int]:
    spec = CROP[variant]
    w, h = img.size
    side = int(min(w * spec["size_w"], h * spec["size_h"]))
    left = int(w * spec["left"])
    top = int(h * spec["top"])
    return left, top, left + side, top + side


def key_light_background(img: Image.Image) -> Image.Image:
    """Remove pale lockup background."""
    rgba = img.convert("RGBA")
    px = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            if r > 230 and g > 228 and b > 240:
                px[x, y] = (r, g, b, 0)
            elif abs(r - g) < 12 and abs(g - b) < 20 and min(r, g, b) > 210:
                px[x, y] = (r, g, b, 0)
    return rgba


def key_dark_background(img: Image.Image) -> Image.Image:
    """Remove dark lockup backdrop; keeps the neon heart for light UI surfaces."""
    rgba = img.convert("RGBA")
    px = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
            sat = max(r, g, b) - min(r, g, b)
            if lum < 40 or (lum < 78 and sat < 48):
                px[x, y] = (r, g, b, 0)
    return rgba


def fit_square(
    img: Image.Image,
    size: int,
    pad: float = 0.08,
    bg: tuple[int, int, int] | None = BG_DARK,
    transparent: bool = False,
) -> Image.Image:
    if transparent:
        canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    else:
        canvas = Image.new("RGBA", (size, size), (*bg, 255))  # type: ignore[arg-type]
    inner = int(size * (1 - pad * 2))
    copy = img.convert("RGBA")
    copy.thumbnail((inner, inner), Image.Resampling.LANCZOS)
    ox = (size - copy.width) // 2
    oy = (size - copy.height) // 2
    canvas.paste(copy, (ox, oy), copy)
    return canvas


def fit_og(img: Image.Image, w: int = 1200, h: int = 630, bg: tuple[int, int, int] = BG_DARK) -> Image.Image:
    canvas = Image.new("RGBA", (w, h), (*bg, 255))
    copy = img.convert("RGBA")
    scale = min(w * 0.94 / copy.width, h * 0.82 / copy.height)
    nw, nh = int(copy.width * scale), int(copy.height * scale)
    copy = copy.resize((nw, nh), Image.Resampling.LANCZOS)
    ox = (w - nw) // 2
    oy = (h - nh) // 2
    canvas.paste(copy, (ox, oy), copy)
    return canvas


def write_png(path: Path, img: Image.Image) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if img.mode == "RGBA":
        img.save(path, format="PNG", optimize=True)
    else:
        img.convert("RGB").save(path, format="PNG", optimize=True)


def build_mark(master: Path, variant: str) -> Image.Image:
    img = Image.open(master)
    mark = img.crop(crop_box(img, variant))
    mark = ImageEnhance.Sharpness(mark).enhance(1.08)
    if variant == "light":
        mark = key_light_background(mark)
    return mark


def write_raster_set(
    mark: Image.Image,
    *,
    prefix: str,
    bg: tuple[int, int, int],
    logo_name: str | None = None,
) -> None:
    write_png(OUT / f"icon{prefix}-192.png", fit_square(mark, 192, pad=0.06, bg=bg))
    write_png(OUT / f"icon{prefix}-512.png", fit_square(mark, 512, pad=0.06, bg=bg))
    write_png(
        OUT / f"icon{prefix}-512-maskable.png",
        fit_square(mark, 512, pad=0.18, bg=bg),
    )
    apple = OUT / ("apple-touch-icon-light.png" if prefix == "-light" else "apple-touch-icon.png")
    favicon = OUT / (f"favicon{prefix}-32.png" if prefix == "-light" else "favicon-32.png")
    write_png(apple, fit_square(mark, 180, pad=0.06, bg=bg))
    write_png(favicon, fit_square(mark, 32, pad=0.04, bg=bg))
    if logo_name:
        write_png(OUT / logo_name, fit_square(mark, 512, pad=0.04, transparent=True))


def rasterize_light_pwa_from_svg() -> bool:
    """Crisp light-mode PWA icons from vector mark."""
    svg_path = OUT / "icon-light.svg"
    if not svg_path.exists():
        return False

    import subprocess

    sizes = [
        (512, "icon-light-512.png"),
        (192, "icon-light-192.png"),
        (180, "apple-touch-icon-light.png"),
        (32, "favicon-light-32.png"),
        (512, "icon-light-512-maskable.png"),
    ]
    for width, name in sizes:
        try:
            subprocess.run(
                [
                    "npx",
                    "--yes",
                    "@resvg/resvg-js-cli",
                    "--fit-width",
                    str(width),
                    str(svg_path),
                    str(OUT / name),
                ],
                check=True,
                capture_output=True,
                cwd=ROOT,
            )
        except (subprocess.CalledProcessError, FileNotFoundError):
            return False
    return True


def main() -> None:
    if not MASTER_DARK.exists():
        raise SystemExit(f"Missing brand master: {MASTER_DARK}")

    dark_mark = build_mark(MASTER_DARK, "dark")
    neon_mark = key_dark_background(dark_mark.copy())
    neon_mark = ImageEnhance.Color(neon_mark).enhance(1.12)
    neon_mark = ImageEnhance.Contrast(neon_mark).enhance(1.08)

    # Dark PWA / favicon set
    write_raster_set(dark_mark, prefix="", bg=BG_DARK, logo_name="logo-dark.png")
    write_png(BRAND / "icon-dark-1024.png", fit_square(dark_mark, 1024, pad=0.04, bg=BG_DARK))
    write_png(OUT / "og.png", fit_og(Image.open(MASTER_DARK)))

    # In-app logo: neon heart on transparent — readable on light AND dark surfaces
    write_png(OUT / "mark-neon.png", fit_square(neon_mark, 512, pad=0.04, transparent=True))
    write_png(OUT / "mark-neon-32.png", fit_square(neon_mark, 32, pad=0.02, transparent=True))

    if not rasterize_light_pwa_from_svg():
        write_raster_set(dark_mark, prefix="-light", bg=BG_LIGHT, logo_name="logo-light.png")

    if MASTER_LIGHT.exists():
        light_mark = build_mark(MASTER_LIGHT, "light")
        write_png(BRAND / "icon-light-1024.png", fit_square(light_mark, 1024, pad=0.04, bg=BG_LIGHT))

    rasterize_light_pwa_from_svg()

    print("Wrote light + dark brand assets to", OUT)


if __name__ == "__main__":
    main()
