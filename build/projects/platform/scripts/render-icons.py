"""Legacy procedural icons — prefer scripts/brand-icons.py when brand PNGs exist."""
from __future__ import annotations

import math
import struct
import zlib
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "public"


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def heart_points(cx: int, cy: int, s: float) -> list[tuple[float, float]]:
    # Approximate the SVG heart as a dense polygon.
    pts: list[tuple[float, float]] = []
    for i in range(80):
        t = i / 79 * 2 * math.pi
        x = 16 * math.sin(t) ** 3
        y = (
            13 * math.cos(t)
            - 5 * math.cos(2 * t)
            - 2 * math.cos(3 * t)
            - math.cos(4 * t)
        )
        pts.append((cx + x * s, cy - y * s))
    return pts


def fill_poly(px: bytearray, w: int, h: int, pts: list[tuple[float, float]], rgb: tuple[int, int, int]) -> None:
    if len(pts) < 3:
        return
    min_y = max(0, int(min(p[1] for p in pts)))
    max_y = min(h - 1, int(max(p[1] for p in pts)))
    for y in range(min_y, max_y + 1):
        xs: list[float] = []
        for i, (x1, y1) in enumerate(pts):
            x2, y2 = pts[(i + 1) % len(pts)]
            if (y1 <= y < y2) or (y2 <= y < y1):
                t = (y - y1) / (y2 - y1) if y2 != y1 else 0
                xs.append(x1 + t * (x2 - x1))
        xs.sort()
        for i in range(0, len(xs) - 1, 2):
            x_start = max(0, int(xs[i]))
            x_end = min(w - 1, int(xs[i + 1]))
            for x in range(x_start, x_end + 1):
                o = (y * w + x) * 3
                px[o : o + 3] = bytes(rgb)


def fill_round_rect(
    px: bytearray, w: int, h: int, x0: int, y0: int, x1: int, y1: int, r: int, rgb: tuple[int, int, int]
) -> None:
    r = min(r, (x1 - x0) // 2, (y1 - y0) // 2)
    for y in range(max(0, y0), min(h, y1)):
        for x in range(max(0, x0), min(w, x1)):
            dx = 0
            dy = 0
            if x < x0 + r:
                dx = x0 + r - x
            elif x >= x1 - r:
                dx = x - (x1 - r - 1)
            if y < y0 + r:
                dy = y0 + r - y
            elif y >= y1 - r:
                dy = y - (y1 - r - 1)
            if dx and dy and dx * dx + dy * dy > r * r:
                continue
            o = (y * w + x) * 3
            px[o : o + 3] = bytes(rgb)


def write_png(path: Path, w: int, h: int, rgb: bytes) -> None:
    def chunk(tag: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    raw = b"".join(b"\x00" + rgb[y * w * 3 : (y + 1) * w * 3] for y in range(h))
    path.write_bytes(
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(raw, 9))
        + chunk(b"IEND", b"")
    )


def render_icon(size: int) -> bytes:
    px = bytearray([0x19, 0x19, 0x19] * (size * size))
    r = int(size * 96 / 512)
    fill_round_rect(px, size, size, 0, 0, size, size, r, (0x19, 0x19, 0x19))
    scale = size / 512
    heart = heart_points(int(256 * scale), int(250 * scale), 7.2 * scale)
    fill_poly(px, size, size, heart, (0x2E, 0xAA, 0xDC))
    # cap / "wire" bar
    bw = int(152 * scale)
    bh = int(48 * scale)
    cx, cy = size // 2, int(132 * scale)
    fill_round_rect(
        px, size, size, cx - bw // 2, cy - bh // 2, cx + bw // 2, cy + bh // 2, int(16 * scale), (0x2E, 0xAA, 0xDC)
    )
    return bytes(px)


def render_og(w: int = 1200, h: int = 630) -> bytes:
    px = bytearray([0x19, 0x19, 0x19] * (w * h))
    icon = render_icon(256)
    ox, oy = 120, (h - 256) // 2
    for y in range(256):
        for x in range(256):
            src = (y * 256 + x) * 3
            dst = ((oy + y) * w + (ox + x)) * 3
            px[dst : dst + 3] = icon[src : src + 3]
    # simple "H" block on the right of the icon as text substitute if fonts missing —
    # draw HeartWire OS as block letters
    def blit_rect(x0: int, y0: int, x1: int, y1: int, rgb: tuple[int, int, int]) -> None:
        for y in range(max(0, y0), min(h, y1)):
            for x in range(max(0, x0), min(w, x1)):
                o = (y * w + x) * 3
                px[o : o + 3] = bytes(rgb)

    # Title bar letters: HEARTWIRE OS
    # Draw a teal accent line and white wordmark using scaled pixel font
    FONT = {
        "A": ["01110", "10001", "11111", "10001", "10001"],
        "B": ["11110", "10001", "11110", "10001", "11110"],
        "C": ["01111", "10000", "10000", "10000", "01111"],
        "L": ["10000", "10000", "10000", "10000", "11111"],
        "P": ["11110", "10001", "11110", "10000", "10000"],
        "U": ["10001", "10001", "10001", "10001", "01110"],
        "E": ["11111", "10000", "11110", "10000", "11111"],
        "H": ["10001", "10001", "11111", "10001", "10001"],
        "I": ["11111", "00100", "00100", "00100", "11111"],
        "O": ["01110", "10001", "10001", "10001", "01110"],
        "R": ["11110", "10001", "11110", "10010", "10001"],
        "S": ["01111", "10000", "01110", "00001", "11110"],
        "T": ["11111", "00100", "00100", "00100", "00100"],
        "W": ["10001", "10001", "10101", "10101", "01010"],
        " ": ["00000", "00000", "00000", "00000", "00000"],
    }
    word = "HEARTWIRE OS"
    scale = 8
    start_x = 420
    start_y = 250
    gap = 2
    x = start_x
    for ch in word:
        glyph = FONT.get(ch, FONT[" "])
        for gy, row in enumerate(glyph):
            for gx, bit in enumerate(row):
                if bit == "1":
                    blit_rect(
                        x + gx * scale,
                        start_y + gy * scale,
                        x + (gx + 1) * scale,
                        start_y + (gy + 1) * scale,
                        (0xE8, 0xEE, 0xF2),
                    )
        x += (5 + gap) * scale
    # subtitle
    sub = "PUBLIC BETA"
    sx = start_x
    sy = start_y + 5 * scale + 24
    sscale = 4
    for ch in sub:
        glyph = FONT.get(ch, FONT[" "])
        for gy, row in enumerate(glyph):
            for gx, bit in enumerate(row):
                if bit == "1":
                    blit_rect(
                        sx + gx * sscale,
                        sy + gy * sscale,
                        sx + (gx + 1) * sscale,
                        sy + (gy + 1) * sscale,
                        (0x2E, 0xAA, 0xDC),
                    )
        sx += (5 + gap) * sscale
    return bytes(px)


def render_icon_maskable(size: int = 512) -> bytes:
    """Maskable icon: logo in the center 80% safe zone on brand background."""
    px = bytearray([0x19, 0x19, 0x19] * (size * size))
    inner = int(size * 0.72)
    icon = render_icon(inner)
    ox = (size - inner) // 2
    oy = (size - inner) // 2
    for y in range(inner):
        for x in range(inner):
            src = (y * inner + x) * 3
            dst = ((oy + y) * size + (ox + x)) * 3
            px[dst : dst + 3] = icon[src : src + 3]
    return bytes(px)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    write_png(OUT / "icon-192.png", 192, 192, render_icon(192))
    write_png(OUT / "icon-512.png", 512, 512, render_icon(512))
    write_png(OUT / "icon-512-maskable.png", 512, 512, render_icon_maskable(512))
    write_png(OUT / "apple-touch-icon.png", 180, 180, render_icon(180))
    write_png(OUT / "og.png", 1200, 630, render_og())
    print(
        "wrote",
        OUT / "icon-192.png",
        OUT / "icon-512.png",
        OUT / "icon-512-maskable.png",
        OUT / "apple-touch-icon.png",
        OUT / "og.png",
    )


if __name__ == "__main__":
    main()
