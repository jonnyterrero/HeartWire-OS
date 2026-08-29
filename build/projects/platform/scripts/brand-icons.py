"""Generate PWA / OG raster assets from HeartWire brand PNGs in assets/brand/."""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageEnhance

ROOT = Path(__file__).resolve().parents[1]
BRAND = ROOT / "assets" / "brand"
OUT = ROOT / "public"

MIDNIGHT_ICON = BRAND / "icon-midnight-biome-1024.png"
SOLAR_ICON = BRAND / "icon-solar-amber-1024.png"
MIDNIGHT_MASTER = BRAND / "master-midnight-biome-2048.png"
SOLAR_MASTER = BRAND / "master-solar-amber-2048.png"

HYBRID_ICON = BRAND / "icon-hybrid-1024.png"
HYBRID_MASTER = BRAND / "master-hybrid-2048.png"

BG_DARK = (11, 20, 17)  # Midnight Biome canvas
SOLAR_BG = (249, 249, 244)  # Solar Amber cream


def _dist(c1: tuple[int, int, int], c2: tuple[int, int, int]) -> float:
    return sum((a - b) ** 2 for a, b in zip(c1, c2, strict=True)) ** 0.5


def key_background(img: Image.Image, bg: tuple[int, int, int], tol: float = 42) -> Image.Image:
    """Make near-background pixels transparent."""
    rgba = img.convert("RGBA")
    px = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            if _dist((r, g, b), bg) <= tol:
                px[x, y] = (r, g, b, 0)
    return rgba


def resize_to(img: Image.Image, size: tuple[int, int]) -> Image.Image:
    if img.size == size:
        return img
    return img.resize(size, Image.Resampling.LANCZOS)


def build_hybrid_icon(size: int = 1024) -> Image.Image:
    """Midnight dark canvas + Solar forest greens/orange over teal structure."""
    midnight = resize_to(Image.open(MIDNIGHT_ICON), (size, size))
    solar = resize_to(Image.open(SOLAR_ICON), (size, size))

    mid_fg = key_background(midnight, BG_DARK, tol=36)
    solar_fg = key_background(solar, SOLAR_BG, tol=48)

    canvas = Image.new("RGBA", (size, size), (*BG_DARK, 255))
    canvas.paste(mid_fg, (0, 0), mid_fg)

    # Solar layer: warmer greens + amber nodes on dark
    solar_layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    solar_layer.paste(solar_fg, (0, 0), solar_fg)
    solar_layer = ImageEnhance.Color(solar_layer).enhance(1.12)
    canvas = Image.alpha_composite(canvas, Image.blend(
        Image.new("RGBA", (size, size), (0, 0, 0, 0)),
        solar_layer,
        0.38,
    ))

    # Slight teal lift on the midnight base so it reads as a deliberate blend
    teal_glow = ImageEnhance.Brightness(mid_fg).enhance(1.04)
    canvas = Image.alpha_composite(
        canvas,
        Image.blend(Image.new("RGBA", (size, size), (0, 0, 0, 0)), teal_glow, 0.22),
    )
    return canvas


def build_hybrid_master(w: int = 2048, h: int = 2048) -> Image.Image:
    """Dark lockup: midnight layout with solar wordmark warmth."""
    midnight = resize_to(Image.open(MIDNIGHT_MASTER), (w, h))
    solar = resize_to(Image.open(SOLAR_MASTER), (w, h))

    mid_fg = key_background(midnight, BG_DARK, tol=40)
    solar_fg = key_background(solar, SOLAR_BG, tol=52)

    canvas = Image.new("RGBA", (w, h), (*BG_DARK, 255))
    canvas.paste(mid_fg, (0, 0), mid_fg)

    solar_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    solar_layer.paste(solar_fg, (0, 0), solar_fg)
    canvas = Image.alpha_composite(canvas, Image.blend(
        Image.new("RGBA", (w, h), (0, 0, 0, 0)),
        solar_layer,
        0.32,
    ))
    return canvas


def ensure_hybrid_sources() -> tuple[Image.Image, Image.Image]:
    BRAND.mkdir(parents=True, exist_ok=True)
    icon = build_hybrid_icon(1024)
    master = build_hybrid_master(2048, 2048)
    icon.save(HYBRID_ICON, format="PNG", optimize=True)
    master.save(HYBRID_MASTER, format="PNG", optimize=True)
    return icon, master


def fit_square(img: Image.Image, size: int, pad: float = 0.08) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), (*BG_DARK, 255))
    inner = int(size * (1 - pad * 2))
    copy = img.convert("RGBA")
    copy.thumbnail((inner, inner), Image.Resampling.LANCZOS)
    ox = (size - copy.width) // 2
    oy = (size - copy.height) // 2
    canvas.paste(copy, (ox, oy), copy)
    return canvas


def fit_og(img: Image.Image, w: int = 1200, h: int = 630) -> Image.Image:
    canvas = Image.new("RGBA", (w, h), (*BG_DARK, 255))
    copy = img.convert("RGBA")
    scale = min(w * 0.92 / copy.width, h * 0.78 / copy.height)
    nw, nh = int(copy.width * scale), int(copy.height * scale)
    copy = copy.resize((nw, nh), Image.Resampling.LANCZOS)
    ox = (w - nw) // 2
    oy = (h - nh) // 2
    canvas.paste(copy, (ox, oy), copy)
    return canvas


def write_png(path: Path, img: Image.Image) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    img.convert("RGB").save(path, format="PNG", optimize=True)


def main() -> None:
    for path in (MIDNIGHT_ICON, SOLAR_ICON, MIDNIGHT_MASTER, SOLAR_MASTER):
        if not path.exists():
            raise SystemExit(f"Missing brand source: {path}")

    icon, og_master = ensure_hybrid_sources()

    write_png(OUT / "icon-192.png", fit_square(icon, 192, pad=0.06))
    write_png(OUT / "icon-512.png", fit_square(icon, 512, pad=0.06))
    write_png(OUT / "icon-512-maskable.png", fit_square(icon, 512, pad=0.18))
    write_png(OUT / "apple-touch-icon.png", fit_square(icon, 180, pad=0.06))
    write_png(OUT / "favicon-32.png", fit_square(icon, 32, pad=0.04))
    write_png(OUT / "og.png", fit_og(og_master))

    print("Wrote hybrid brand assets to", OUT)
    print("  sources:", HYBRID_ICON, HYBRID_MASTER)


if __name__ == "__main__":
    main()
