"""The icon: Sansad Bhavan over a gold euro, in colour.

A jewel-toned tile, indigo into teal with a glow behind the building, so the
emblem stands clear of it at a glance — the leather it replaced was blue on
blue and all but vanished on a home screen. The pillars take the hues the
asset-management app draws its bar chart in, around the wheel in order, so
the two apps read as a pair; the pillars are narrow with clear gaps between
them, and the building's stone is dark with a cool rim of light, so each
pillar's colour is the brightest thing on it; the euro is asset-management's
own lean glyph in gold, embossed as a rounded raised stroke and kept clear of
the steps; and the tile is edged and stitched in gold to match it.

Everything is drawn as masks and filled with gradients at four times the
size, then scaled down, so every edge is antialiased and every layer stays in
register. The maskable cut drops the rim and stitching and keeps the emblem
inside the safe zone.

Run with `python tools/make-icons.py` from the repo root to regenerate
icons/ after changing anything here.
"""
from PIL import Image, ImageDraw, ImageFilter, ImageChops
import colorsys, os, random, sys

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "icons")

# the tile: royal purple at the top left, through indigo, into teal
BG_A = (58, 24, 118)
BG_B = (0, 112, 128)
GLOW = (120, 190, 255)

# Pillar hues from asset-management's chart palette (Home loan, Property,
# Gold, PPF / EPF, Fixed deposit, Bank account, Other, Vehicle, Debt), in
# order round the wheel. Same saturation as there; lighter, because there
# they sit on a card and here they have to glow on a dark tile.
PILLAR_HUES = [4, 18, 46, 124, 180, 214, 261, 299, 330]
PILLAR_SAT = 0.82

# The stone is dark, so the pillars are the brightest thing on the building;
# a cool rim along its top edges keeps it from sinking into the tile.
STONE_TOP = (52, 56, 92)
STONE_BOT = (20, 22, 42)
STONE_RIM = (150, 160, 230)
KEYLINE = (10, 16, 40)

GOLD_TOP = (255, 236, 150)
GOLD_MID = (245, 186, 48)
GOLD_BOT = (176, 110, 16)

SAFFRON = (255, 153, 51)
INDIA_GREEN = (19, 136, 8)
WHITE = (255, 255, 255)


def hsl(h, s, l):
    r, g, b = colorsys.hls_to_rgb(h / 360.0, l, s)
    return (int(r * 255), int(g * 255), int(b * 255))


def vgrad(S, y0, y1, stops):
    """A vertical gradient across the tile, `stops` as (position 0-1, colour)."""
    im = Image.new("RGB", (1, S))
    px = im.load()
    for y in range(S):
        t = 0.0 if y1 == y0 else max(0.0, min(1.0, (y - y0) / float(y1 - y0)))
        for i in range(len(stops) - 1):
            (p0, c0), (p1, c1) = stops[i], stops[i + 1]
            if t <= p1 or i == len(stops) - 2:
                u = 0.0 if p1 == p0 else max(0.0, min(1.0, (t - p0) / (p1 - p0)))
                px[0, y] = tuple(int(c0[k] + (c1[k] - c0[k]) * u) for k in range(3))
                break
    return im.resize((S, S))


def diag_bg(S):
    """Indigo into teal along the diagonal, with a soft glow behind the emblem
    and the faintest grain so the flat colour does not band."""
    small = 64
    im = Image.new("RGB", (small, small))
    px = im.load()
    for y in range(small):
        for x in range(small):
            t = (x + y) / (2.0 * (small - 1))
            px[x, y] = tuple(int(BG_A[k] + (BG_B[k] - BG_A[k]) * t) for k in range(3))
    bg = im.resize((S, S), Image.BICUBIC)
    glow = Image.new("L", (S, S), 0)
    ImageDraw.Draw(glow).ellipse((S * 0.14, S * 0.10, S * 0.86, S * 0.70), fill=150)
    glow = glow.filter(ImageFilter.GaussianBlur(S * 0.12))
    bg = Image.composite(ImageChops.screen(bg, Image.new("RGB", (S, S), GLOW)), bg,
                         glow.point(lambda v: v * 0.55))
    rnd = random.Random(7)
    g = Image.new("L", (96, 96))
    g.putdata([rnd.randrange(256) for _ in range(96 * 96)])
    g = g.resize((S, S), Image.BICUBIC).filter(ImageFilter.GaussianBlur(S * 0.004))
    return Image.composite(Image.new("RGB", (S, S), (255, 255, 255)), bg, g.point(lambda v: v * 0.035))


def rr_mask(S, box, r):
    m = Image.new("L", (S, S), 0)
    ImageDraw.Draw(m).rounded_rectangle(box, radius=r, fill=255)
    return m


def fill(canvas, mask, colour_img):
    canvas.paste(colour_img, (0, 0), mask)


def outline_of(mask, px):
    """The mask grown by px, less itself: a keyline round the shape."""
    k = max(3, int(px) * 2 + 1)
    return ImageChops.subtract(mask.filter(ImageFilter.MaxFilter(k)), mask)


def building(S, cx, cy, w, h):
    """Masks for the parts of Sansad Bhavan: stone (dome, drum, architrave,
    plinth, steps), each pillar on its own, and the mast. Levels are fractions
    of h measured down from the centre, stacked top to bottom so no band can
    cross another."""
    MAST_TOP, DOME_TOP, DOME_BOT, DRUM_BOT = -0.70, -0.50, -0.30, -0.23
    ARCH_BOT, COL_BOT, PLINTH_BOT, STEP_BOT = -0.13, 0.20, 0.30, 0.40
    yy = lambda f: cy + h * f

    stone = Image.new("L", (S, S), 0)
    d = ImageDraw.Draw(stone)
    dw = w * 0.40
    dh = yy(DOME_BOT) - yy(DOME_TOP)
    d.chord((cx - dw / 2, yy(DOME_TOP), cx + dw / 2, yy(DOME_TOP) + dh * 2), start=180, end=360, fill=255)
    d.rectangle((cx - dw * 0.60, yy(DOME_BOT), cx + dw * 0.60, yy(DRUM_BOT)), fill=255)
    aw = w * 0.96
    d.rounded_rectangle((cx - aw / 2, yy(DRUM_BOT), cx + aw / 2, yy(ARCH_BOT)), radius=h * 0.02, fill=255)
    d.rounded_rectangle((cx - aw * 0.52, yy(COL_BOT), cx + aw * 0.52, yy(PLINTH_BOT)), radius=h * 0.015, fill=255)
    d.rounded_rectangle((cx - aw * 0.60, yy(PLINTH_BOT), cx + aw * 0.60, yy(STEP_BOT)), radius=h * 0.015, fill=255)

    pillars = []
    n = len(PILLAR_HUES)
    span = aw * 0.90
    pitch = span / n
    pw = pitch * 0.30
    for i in range(n):
        m = Image.new("L", (S, S), 0)
        px = cx - span / 2 + pitch * (i + 0.5)
        ImageDraw.Draw(m).rounded_rectangle((px - pw / 2, yy(ARCH_BOT) - h * 0.01, px + pw / 2, yy(COL_BOT) + h * 0.01),
                                            radius=pw * 0.28, fill=255)
        pillars.append((m, yy(ARCH_BOT), yy(COL_BOT)))

    mast = Image.new("L", (S, S), 0)
    md = ImageDraw.Draw(mast)
    md.rectangle((cx - w * 0.011, yy(MAST_TOP), cx + w * 0.011, yy(DOME_TOP) + h * 0.02), fill=255)
    flag = (cx + w * 0.011, yy(MAST_TOP), cx + w * 0.011 + w * 0.15, yy(MAST_TOP) + w * 0.10)
    return stone, pillars, mast, flag, yy(STEP_BOT)


# The euro is asset-management's: the same lean glyph from the same font, the
# same gold run top-left to bottom-right and the same cast shadow, so the two
# icons carry one currency sign rather than two drawings of it. It is shaped
# further here, as a rounded raised stroke (see curved_emboss), where
# asset-management bevels only its edges. Segoe UI Semibold is a Windows font,
# as it is there.
EURO_FONTS = ("C:/Windows/Fonts/seguisb.ttf", "C:/Windows/Fonts/segoeui.ttf",
              "C:/Windows/Fonts/arialbd.ttf", "C:/Windows/Fonts/arial.ttf")
EMBOSS_HI, EMBOSS_LO = (247, 220, 138), (150, 110, 20)


def euro_mask(S, cx, cy, height):
    """The € from the font, scaled so the glyph itself is `height` tall and
    centred on its own ink rather than on the font's line box."""
    from PIL import ImageFont
    font = None
    for path in EURO_FONTS:
        try:
            probe = ImageFont.truetype(path, 400)
            b = probe.getbbox("€")
            if b[2] > b[0]:
                font = ImageFont.truetype(path, max(8, int(400 * height / float(b[3] - b[1]))))
                break
        except OSError:
            continue
    if font is None:
        raise SystemExit("no font with a euro sign found")
    x0, y0, x1, y1 = font.getbbox("€")
    m = Image.new("L", (S, S), 0)
    ImageDraw.Draw(m).text((cx - (x0 + x1) / 2.0, cy - (y0 + y1) / 2.0), "€", font=font, fill=255)
    return m


def lit(S, a, b, box):
    """A gradient from `a` at the top-left of the box to `b` at its bottom-right,
    weighted toward the vertical, the way asset-management lights its gold."""
    x0, y0, x1, y1 = [int(v) for v in box]
    n = 64
    small = Image.new("RGB", (n, n))
    px = small.load()
    for y in range(n):
        for x in range(n):
            t = min(1.0, (x / (n - 1.0)) * 0.4 + (y / (n - 1.0)) * 0.6)
            px[x, y] = tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3))
    g = Image.new("RGB", (S, S), b)
    g.paste(small.resize((max(1, x1 - x0), max(1, y1 - y0)), Image.BICUBIC), (x0, y0))
    return g


def curved_emboss(canvas, mask, S, glyph_h):
    """Shades a shape as though it were pressed up from behind: rounded, not
    bevelled.

    A height map is made by blurring the shape into itself — highest along
    the middle of each stroke, falling away to its edges — and the slope of
    that surface is read against a light from the top-left. Slopes that face
    it take a pale gold, slopes that face away a deep brown, and the steepest
    lit ones a near-white glint, which is what makes the surface read as
    curved rather than cut."""
    r = glyph_h * 0.075          # how far the curve reaches in from each edge
    d = max(1, round(glyph_h * 0.018))
    height = ImageChops.multiply(mask.filter(ImageFilter.GaussianBlur(r)), mask)
    ahead = ImageChops.offset(height, -d, -d)          # the surface one step toward the light
    facing = ImageChops.multiply(ImageChops.subtract(ahead, height), mask)
    away = ImageChops.multiply(ImageChops.subtract(height, ahead), mask)
    gain = 8.0
    canvas.paste(Image.new("RGB", (S, S), (255, 240, 185)), (0, 0),
                 facing.point(lambda v: min(235, int(v * gain))))
    canvas.paste(Image.new("RGB", (S, S), (58, 34, 4)), (0, 0),
                 away.point(lambda v: min(225, int(v * gain))))
    glint = facing.point(lambda v: 0 if v * gain < 150 else min(255, int((v * gain - 150) * 2.2)))
    canvas.paste(Image.new("RGB", (S, S), (255, 252, 236)), (0, 0),
                 glint.filter(ImageFilter.GaussianBlur(d * 0.6)))
    # a fine dark lip round the foot, where the raised shape meets the tile
    lip = ImageChops.multiply(ImageChops.subtract(mask, mask.filter(ImageFilter.MinFilter(3))), mask)
    canvas.paste(Image.new("RGB", (S, S), (70, 44, 8)), (0, 0), lip.point(lambda v: int(v * 0.6)))


def shadow(canvas, mask, S, dx, dy, blur, strength):
    sh = ImageChops.offset(mask, int(dx), int(dy)).filter(ImageFilter.GaussianBlur(blur))
    canvas.paste(Image.new("RGB", (S, S), (0, 0, 0)), (0, 0), sh.point(lambda v: int(v * strength)))


def draw(px, maskable=False):
    S = px * 4
    rad = 0 if maskable else int(S * 0.225)
    canvas = diag_bg(S)

    inset = S * 0.22 if maskable else S * 0.15
    bw = S - inset * 2
    bh = bw * 0.54
    cy = S * (0.47 if maskable else 0.43)
    cx = S / 2

    stone, pillars, mast, flag, step_bot = building(S, cx, cy, bw, bh)
    ebot = S * (0.84 if maskable else 0.89)
    ecy = (step_bot + ebot) / 2.0
    euro_h = (ebot - step_bot) * 0.62
    euro = euro_mask(S, cx, ecy, euro_h)

    building_mask = ImageChops.lighter(stone, mast)
    for m, _, _ in pillars:
        building_mask = ImageChops.lighter(building_mask, m)

    # a soft drop shadow lifts the building off the tile
    shadow(canvas, building_mask, S, S * 0.006, S * 0.014, S * 0.012, 0.55)
    # a dark keyline round it, so the colours never bleed into the tile; the
    # euro has none, being embossed — its bevel and shadow are its edge
    key = outline_of(building_mask, S * 0.006)
    canvas.paste(Image.new("RGB", (S, S), KEYLINE), (0, 0), key)

    # stone, lit from above
    fill(canvas, stone, vgrad(S, cy - bh * 0.5, step_bot, [(0, STONE_TOP), (1, STONE_BOT)]))
    rim = ImageChops.subtract(stone, ImageChops.offset(stone, 0, int(S * 0.005)))
    canvas.paste(Image.new("RGB", (S, S), STONE_RIM), (0, 0), rim.point(lambda v: int(v * 0.75)))
    fill(canvas, mast, Image.new("RGB", (S, S), GOLD_MID))

    # the pillars, each its own colour, glossy: light at the top, deep at the foot
    for (m, top, bot), hue in zip(pillars, PILLAR_HUES):
        g = vgrad(S, top, bot, [(0, hsl(hue, PILLAR_SAT, 0.70)), (0.45, hsl(hue, PILLAR_SAT, 0.56)),
                                (1, hsl(hue, PILLAR_SAT, 0.40))])
        fill(canvas, m, g)
        # a narrow highlight down the left of each pillar
        hl = ImageChops.subtract(m, ImageChops.offset(m, int(S * 0.006), 0))
        canvas.paste(Image.new("RGB", (S, S), (255, 255, 255)), (0, 0), hl.point(lambda v: int(v * 0.45)))
    d = ImageDraw.Draw(canvas)

    # the flag on the mast
    fx0, fy0, fx1, fy1 = flag
    band = (fy1 - fy0) / 3.0
    for i, col in enumerate((SAFFRON, WHITE, INDIA_GREEN)):
        d.rectangle((fx0, fy0 + band * i, fx1, fy0 + band * (i + 1)), fill=col)
    d.rectangle((fx0, fy0, fx1, fy1), outline=KEYLINE, width=max(2, int(S * 0.003)))

    # the euro, embossed in gold: cast shadow, gold lit from the top-left,
    # then shaped as a rounded, raised stroke rather than a flat one
    shadow(canvas, euro, S, S * 0.0039, S * 0.0098, S * 0.0098, 0.65)
    fill(canvas, euro, lit(S, EMBOSS_HI, EMBOSS_LO, euro.getbbox() or (0, 0, S, S)))
    curved_emboss(canvas, euro, S, euro_h)

    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    img.paste(canvas, (0, 0), rr_mask(S, (0, 0, S, S), rad))

    if not maskable:
        # stitching in gold, two rows inset from the edge, drawn on a layer of
        # its own and cut to the tile so no stitch lands outside a corner
        layer = Image.new("RGBA", (S, S), (0, 0, 0, 0))
        d = ImageDraw.Draw(layer)
        st = max(2, int(S * 0.0055))
        gap = S * 0.021
        for inset_px, col in ((S * 0.058, (246, 196, 82)), (S * 0.092, (214, 160, 58))):
            a, b = inset_px, S - inset_px
            n = max(2, int((b - a) / gap))
            for i in range(n + 1):
                t = a + (b - a) * i / n
                d.line((t - st * 1.1, a, t + st * 1.1, a), fill=col, width=st)
                d.line((t - st * 1.1, b, t + st * 1.1, b), fill=col, width=st)
                d.line((a, t - st * 1.1, a, t + st * 1.1), fill=col, width=st)
                d.line((b, t - st * 1.1, b, t + st * 1.1), fill=col, width=st)
        tile = rr_mask(S, (0, 0, S, S), rad)
        img.paste(layer, (0, 0), ImageChops.multiply(layer.split()[3], tile))
        # a gold rim round the tile, bright at the top and deeper at the foot
        rim_w = max(4, int(S * 0.016))
        ring = ImageChops.subtract(rr_mask(S, (0, 0, S, S), rad),
                                   rr_mask(S, (rim_w, rim_w, S - rim_w, S - rim_w), max(0, rad - rim_w)))
        img.paste(vgrad(S, 0, S, [(0, GOLD_TOP), (0.5, GOLD_MID), (1, GOLD_BOT)]), (0, 0), ring)

    return img.resize((px, px), Image.LANCZOS)


os.makedirs(OUT, exist_ok=True)
draw(512).save(os.path.join(OUT, "icon-512.png"))
draw(192).save(os.path.join(OUT, "icon-192.png"))
draw(180).save(os.path.join(OUT, "apple-touch-icon.png"))
draw(512, maskable=True).save(os.path.join(OUT, "icon-maskable-512.png"))
print("wrote 4 icons to", OUT)
