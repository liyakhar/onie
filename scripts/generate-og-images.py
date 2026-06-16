#!/usr/bin/env python3
"""Generate OG (1200x630) and apple-touch-icon (180x180) PNGs for Onie."""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OG_DIR = ROOT / "public" / "og"
OG_DIR.mkdir(parents=True, exist_ok=True)

PAPER = (246, 241, 232)
INK = (26, 26, 24)
INK_SOFT = (74, 72, 64)
INK_MUTED = (122, 117, 104)
ACCENT = (200, 160, 60)


def load_font(size: int, bold: bool = False):
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial Bold.ttf" if bold else "/Library/Fonts/Arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def draw_og() -> None:
    w, h = 1200, 630
    img = Image.new("RGB", (w, h), PAPER)
    draw = ImageDraw.Draw(img)
    draw.rectangle((48, 48, w - 48, h - 48), outline=INK, width=2)

    title_font = load_font(108, bold=True)
    subtitle_font = load_font(36)
    kicker_font = load_font(20)

    draw.text((96, 200), "Onie", fill=INK, font=title_font)
    draw.text(
        (96, 330),
        "Agent workflows from people doing the work",
        fill=INK_SOFT,
        font=subtitle_font,
    )
    draw.text(
        (96, 500),
        "PROMPTS · SKILLS · SETUPS · BY FIELD",
        fill=INK_MUTED,
        font=kicker_font,
    )

    out = OG_DIR / "default.png"
    img.save(out, format="PNG", optimize=True)
    print(f"Wrote {out} ({out.stat().st_size // 1024} KB)")


def draw_apple_touch_icon() -> None:
    size = 180
    img = Image.new("RGB", (size, size), PAPER)
    draw = ImageDraw.Draw(img)
    draw.rectangle((12, 12, size - 12, size - 12), outline=INK, width=2)
    font = load_font(52, bold=True)
    draw.text((28, 58), "Onie", fill=INK, font=font)
    out = ROOT / "public" / "apple-touch-icon.png"
    img.save(out, format="PNG", optimize=True)
    print(f"Wrote {out} ({out.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    draw_og()
    draw_apple_touch_icon()
