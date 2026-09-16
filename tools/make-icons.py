"""The icon: Sansad Bhavan over a gold euro, in colour.

A jewel-toned tile, indigo into teal with a glow behind the building, so the
emblem stands clear of it at a glance — the leather it replaced was blue on
blue and all but vanished on a home screen. The pillars take the hues the
asset-management app draws its bar chart in, around the wheel in order, so
the two apps read as a pair; the pillars are narrow with clear gaps between
them, and the building's stone is dark with a cool rim of light, so each
pillar's colour is the brightest thing on it; the euro is metallic gold with a
dark keyline, which is what keeps it legible at 48px; and the tile is edged
and stitched in gold to match it.

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
    pw = pitch * 0.40
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


def euro_mask(S, cx, cy, size, weight):
    """A euro from an arc and two bars rather than a font, so it draws the
    same everywhere."""
    m = Image.new("L", (S, S), 0)
    d = ImageDraw.Draw(m)
    r = size / 2.0
    d.arc((cx - r, cy - r, cx + r, cy + r), start=42, end=318, fill=255, width=weight)
    for dy, ext in ((-size * 0.15, 0.62), (size * 0.15, 0.52)):
        y = cy + dy
        x0, x1 = cx - r - size * 0.18, cx - r + size * ext
        d.line((x0, y, x1, y), fill=255, width=int(weight * 0.9))
        for xx in (x0, x1):
            d.ellipse((xx - weight * 0.45, y - weight * 0.45, xx + weight * 0.45, y + weight * 0.45), fill=255)
    # round the arc's two ends
    import math
    for ang in (42, 318):
        a = math.radians(ang)
        ex, ey = cx + (r - weight / 2) * math.cos(a), cy + (r - weight / 2) * math.sin(a)
        d.ellipse((ex - weight / 2, ey - weight / 2, ex + weight / 2, ey + weight / 2), fill=255)
    return m


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
    esz = bw * 0.33
    ew = max(4, int(esz * 0.20))
    ecy = (step_bot + ebot) / 2.0 + esz * 0.02
    euro = euro_mask(S, cx, ecy, esz, ew)

    whole = ImageChops.lighter(ImageChops.lighter(stone, mast), euro)
    for m, _, _ in pillars:
        whole = ImageChops.lighter(whole, m)

    # a soft drop shadow lifts the emblem off the tile
    shadow(canvas, whole, S, S * 0.006, S * 0.014, S * 0.012, 0.55)
    # a dark keyline round everything, so the colours never bleed into the tile
    key = outline_of(whole, S * 0.006)
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
    # a thin shadow under the architrave, so the pillars read as standing beneath it
    d = ImageDraw.Draw(canvas)

    # the flag on the mast
    fx0, fy0, fx1, fy1 = flag
    band = (fy1 - fy0) / 3.0
    for i, col in enumerate((SAFFRON, WHITE, INDIA_GREEN)):
        d.rectangle((fx0, fy0 + band * i, fx1, fy0 + band * (i + 1)), fill=col)
    d.rectangle((fx0, fy0, fx1, fy1), outline=KEYLINE, width=max(2, int(S * 0.003)))

    # the euro in gold, with a bright edge along its top
    fill(canvas, euro, vgrad(S, ecy - esz * 0.55, ecy + esz * 0.55,
                             [(0, GOLD_TOP), (0.45, GOLD_MID), (1, GOLD_BOT)]))
    shine = ImageChops.subtract(euro, ImageChops.offset(euro, 0, int(S * 0.006)))
    canvas.paste(Image.new("RGB", (S, S), (255, 250, 220)), (0, 0), shine.point(lambda v: int(v * 0.7)))

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
