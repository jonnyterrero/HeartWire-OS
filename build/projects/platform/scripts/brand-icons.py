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


def crop_mark(img: Image.Image) -> Image.Image:
    """Square crop around the heart icon on the left of a horizontal lockup."""
    w, h = img.size
    side = int(min(w * 0.26, h * 0.72))
    left = int(w * 0.055)
    top = (h - side) // 2
    return img.crop((left, top, left + side, top + side))


def fit_square(img: Image.Image, size: int, pad: float = 0.08, bg: tuple[int, int, int] = BG_DARK) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), (*bg, 255))
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
    img.convert("RGB").save(path, format="PNG", optimize=True)


def build_icon_from_master(master: Path, bg: tuple[int, int, int]) -> Image.Image:
    img = Image.open(master)
    mark = crop_mark(img)
    mark = ImageEnhance.Sharpness(mark).enhance(1.05)
    return fit_square(mark, 1024, pad=0.04, bg=bg)


def main() -> None:
    if not MASTER_DARK.exists():
        raise SystemExit(f"Missing brand master: {MASTER_DARK}")

    dark_master = Image.open(MASTER_DARK)
    icon = build_icon_from_master(MASTER_DARK, BG_DARK)

    if MASTER_LIGHT.exists():
        light_icon = build_icon_from_master(MASTER_LIGHT, BG_LIGHT)
        write_png(BRAND / "icon-light-1024.png", light_icon)
        write_png(OUT / "icon-light-512.png", fit_square(light_icon, 512, pad=0.06, bg=BG_LIGHT))

    write_png(BRAND / "icon-dark-1024.png", icon)
    write_png(OUT / "icon-192.png", fit_square(icon, 192, pad=0.06))
    write_png(OUT / "icon-512.png", fit_square(icon, 512, pad=0.06))
    write_png(OUT / "icon-512-maskable.png", fit_square(icon, 512, pad=0.18))
    write_png(OUT / "apple-touch-icon.png", fit_square(icon, 180, pad=0.06))
    write_png(OUT / "favicon-32.png", fit_square(icon, 32, pad=0.04))
    write_png(OUT / "og.png", fit_og(dark_master))

    print("Wrote brand assets to", OUT)


if __name__ == "__main__":
    main()
