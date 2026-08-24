"""Draft icon: the whole tile is the wallet — dark distressed leather edge to
edge, with Sansad Bhavan tooled into it above a small euro.

No backdrop: the hide is the icon, so there is no frame around it and nothing
to go transparent on iOS. Stitching runs inset from all four edges the way it
does on the real thing.

The emblem is drawn as a single mask and then tooled in three passes — a dark
groove where the die bit, the hide itself slightly lifted inside it, and a rim
of light along the top-left with shadow opposite. Doing it by mask rather than
by stroking three times keeps every pass in exact register.

Run with `python tools/make-icons.py` from the repo root to regenerate
icons/ after changing anything here.
"""
from PIL import Image, ImageDraw, ImageFilter, ImageChops
import os, random, sys

OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "icons")

# the hide, from the near-black creases to the rust-lit high spots
HIDE_0 = (33, 19, 12)
HIDE_1 = (74, 44, 28)
HIDE_2 = (124, 75, 47)
HIDE_3 = (178, 112, 69)

EDGE   = (26, 14,  9)
THREAD = (196, 132, 72)


def noise(S, cells, seed, blur=0):
    rnd = random.Random(seed)
    small = Image.new("L", (cells, cells))
    small.putdata([rnd.randrange(256) for _ in range(cells * cells)])
    big = small.resize((S, S), Image.BICUBIC)
    return big.filter(ImageFilter.GaussianBlur(blur)) if blur else big


def blotches(S, n, seed, rmin, rmax, dark=True):
    rnd = random.Random(seed)
    im = Image.new("L", (S, S), 128)
    d = ImageDraw.Draw(im)
    for _ in range(n):
        cx, cy = rnd.uniform(0, S), rnd.uniform(0, S)
        r = rnd.uniform(rmin, rmax) * S
        v = rnd.randrange(20, 70) if dark else rnd.randrange(190, 240)
        d.ellipse((cx - r, cy - r * rnd.uniform(0.5, 1.0),
                   cx + r * rnd.uniform(0.6, 1.4), cy + r), fill=v)
    return im.filter(ImageFilter.GaussianBlur(S * 0.020))


def scuffs(S, seed, n=26):
    """Scratches and crease lines, the marks a wallet picks up in a pocket."""
    rnd = random.Random(seed)
    im = Image.new("L", (S, S), 128)
    d = ImageDraw.Draw(im)
    for _ in range(n):
        x0, y0 = rnd.uniform(0, S), rnd.uniform(0, S)
        ln = rnd.uniform(0.08, 0.42) * S
        ang = rnd.uniform(-0.5, 0.5) + (0 if rnd.random() < 0.7 else 1.4)
        wgt = max(1, int(S * rnd.uniform(0.0012, 0.004)))
        dark = rnd.random() < 0.72
        d.line((x0, y0, x0 + ln, y0 + ln * ang * 0.4),
               fill=rnd.randrange(56, 104) if dark else rnd.randrange(158, 196),
               width=wgt)
    return im.filter(ImageFilter.GaussianBlur(S * 0.0022))


def ramp4(S, light):
    c0 = Image.new("RGB", (S, S), HIDE_0)
    c1 = Image.new("RGB", (S, S), HIDE_1)
    c2 = Image.new("RGB", (S, S), HIDE_2)
    c3 = Image.new("RGB", (S, S), HIDE_3)
    a = Image.composite(c1, c0, light.point(lambda v: max(0, min(255, (v - 20) * 3))))
    b = Image.composite(c2, a,  light.point(lambda v: max(0, min(255, (v - 110) * 3))))
    return Image.composite(c3, b,  light.point(lambda v: max(0, min(255, (v - 185) * 4))))


def hide(S, seed):
    g1 = noise(S, 5,  seed,     blur=S * 0.013)
    g2 = noise(S, 13, seed + 1, blur=S * 0.006)
    g3 = noise(S, 37, seed + 2, blur=S * 0.002)
    g4 = noise(S, 97, seed + 3, blur=S * 0.0008)
    light = Image.blend(g1, g2, 0.42)
    light = Image.blend(light, g3, 0.26)
    light = Image.blend(light, g4, 0.14)
    light = ImageChops.multiply(light, blotches(S, 16, seed + 11, 0.08, 0.34).point(
        lambda v: 104 + v // 2))
    light = ImageChops.screen(light, blotches(S, 4, seed + 21, 0.05, 0.13, dark=False).point(
        lambda v: max(0, v - 168)))
    light = ImageChops.multiply(light, scuffs(S, seed + 31).point(
        lambda v: min(255, 138 + v // 2)))
    light = light.point(lambda v: int(255 * (v / 255.0) ** 1.06))
    return ramp4(S, light)


def rr_mask(S, box, r):
    m = Image.new("L", (S, S), 0)
    ImageDraw.Draw(m).rounded_rectangle(box, radius=r, fill=255)
    return m


def parliament(d, cx, cy, w, h):
    """Sansad Bhavan in elevation: a shallow dome over a ring of columns on a
    stepped plinth. Simplified hard, because at 192px anything finer silts up.
    Laid out as one top-to-bottom stack so the bands can never invert."""
    # every level as a fraction of h, measured down from the centre
    MAST_TOP   = -0.66
    DOME_TOP   = -0.50
    DOME_BOT   = -0.30
    DRUM_BOT   = -0.24
    ARCH_BOT   = -0.15
    COL_BOT    =  0.20
    PLINTH_BOT =  0.30
    STEP_BOT   =  0.40

    def yy(f):
        return cy + h * f

    # flag mast and finial
    d.rectangle((cx - w * 0.013, yy(MAST_TOP), cx + w * 0.013, yy(DOME_TOP)), fill=255)
    d.ellipse((cx - w * 0.032, yy(MAST_TOP) - w * 0.032,
               cx + w * 0.032, yy(MAST_TOP) + w * 0.032), fill=255)

    # the dome: the upper half of an ellipse, wider than it is tall
    dw = w * 0.38
    dh = (yy(DOME_BOT) - yy(DOME_TOP))
    d.chord((cx - dw / 2, yy(DOME_TOP), cx + dw / 2, yy(DOME_TOP) + dh * 2),
            start=180, end=360, fill=255)
    # the drum it stands on
    d.rectangle((cx - dw * 0.60, yy(DOME_BOT), cx + dw * 0.60, yy(DRUM_BOT)), fill=255)

    # architrave over the colonnade
    aw = w * 0.94
    d.rectangle((cx - aw / 2, yy(DRUM_BOT), cx + aw / 2, yy(ARCH_BOT)), fill=255)

    # the colonnade — the ring of pillars, read straight on
    n = 9
    span = aw * 0.88
    pitch = span / n
    pw = pitch * 0.44
    for i in range(n):
        px = cx - span / 2 + pitch * (i + 0.5)
        d.rectangle((px - pw / 2, yy(ARCH_BOT), px + pw / 2, yy(COL_BOT)), fill=255)

    # plinth, and the step below it
    d.rectangle((cx - aw * 0.52, yy(COL_BOT), cx + aw * 0.52, yy(PLINTH_BOT)), fill=255)
    d.rectangle((cx - aw * 0.60, yy(PLINTH_BOT), cx + aw * 0.60, yy(STEP_BOT)), fill=255)


def euro(d, cx, cy, size, weight):
    """A euro from an arc and two bars rather than a font, so it renders the
    same everywhere and every tooling pass lines up exactly."""
    r = size / 2.0
    d.arc((cx - r, cy - r, cx + r, cy + r), start=40, end=320, fill=255, width=weight)
    for dy, ext in ((-size * 0.17, 0.60), (size * 0.15, 0.50)):
        yy = cy + dy
        x0, x1 = cx - r - size * 0.17, cx - r + size * ext
        d.line((x0, yy, x1, yy), fill=255, width=weight)
        for xx in (x0, x1):
            d.ellipse((xx - weight / 2, yy - weight / 2,
                       xx + weight / 2, yy + weight / 2), fill=255)


def emblem_mask(S, cx, cy, w, h, esz, ew):
    m = Image.new("L", (S, S), 0)
    d = ImageDraw.Draw(m)
    parliament(d, cx, cy, w, h)
    euro(d, cx, cy + h * 0.72, esz, ew)
    return m


def draw(px, maskable=False):
    S = px * 4
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))

    # the hide fills the tile; only the corners are cut
    rad = 0 if maskable else int(S * 0.225)
    mask = rr_mask(S, (0, 0, S, S), rad)
    panel = hide(S, 5)

    # ---- the emblem, tooled in ----
    inset = S * 0.22 if maskable else S * 0.155
    bw = S - inset * 2
    cy = S * (0.48 if maskable else 0.44)
    bh = bw * 0.52
    esz = bw * 0.155
    ew = max(3, int(esz * 0.19))
    off = max(3, int(S * 0.0075))

    face = emblem_mask(S, S / 2, cy, bw, bh, esz, ew)
    groove = face.filter(ImageFilter.GaussianBlur(off * 1.1)).point(
        lambda v: min(255, v * 3))
    panel = Image.composite(Image.new("RGB", (S, S), (18, 10, 6)), panel, groove)
    panel = Image.composite(
        ImageChops.screen(hide(S, 61), Image.new("RGB", (S, S), (34, 20, 12))),
        panel, face.filter(ImageFilter.GaussianBlur(off * 0.3)))
    lit = ImageChops.subtract(face, ImageChops.offset(face, off, off))
    dim = ImageChops.subtract(face, ImageChops.offset(face, -off, -off))
    panel = Image.composite(Image.new("RGB", (S, S), (196, 128, 80)), panel,
                            lit.filter(ImageFilter.GaussianBlur(off * 0.45)))
    panel = Image.composite(Image.new("RGB", (S, S), (38, 21, 13)), panel,
                            dim.filter(ImageFilter.GaussianBlur(off * 0.45)))

    img.paste(panel, (0, 0), mask)
    d = ImageDraw.Draw(img)

    # ---- stitching, inset from all four edges ----
    if not maskable:
        st = max(2, int(S * 0.0055))
        gap = S * 0.021
        m1, m2 = S * 0.055, S * 0.092
        for inset_px in (m1, m2):
            a, b = inset_px, S - inset_px
            n = max(2, int((b - a) / gap))
            for i in range(n + 1):
                t = a + (b - a) * i / n
                d.line((t - st * 1.1, a, t + st * 1.1, a), fill=THREAD, width=st)
                d.line((t - st * 1.1, b, t + st * 1.1, b), fill=THREAD, width=st)
                d.line((a, t - st * 1.1, a, t + st * 1.1), fill=THREAD, width=st)
                d.line((b, t - st * 1.1, b, t + st * 1.1), fill=THREAD, width=st)

        # burnished cut edge round the tile
        d.rounded_rectangle((0, 0, S - 1, S - 1), radius=rad, outline=EDGE,
                            width=max(3, int(S * 0.007)))

    return img.resize((px, px), Image.LANCZOS)


os.makedirs(OUT, exist_ok=True)
draw(512).save(os.path.join(OUT, "icon-512.png"))
draw(192).save(os.path.join(OUT, "icon-192.png"))
draw(180).save(os.path.join(OUT, "apple-touch-icon.png"))
draw(512, maskable=True).save(os.path.join(OUT, "icon-maskable-512.png"))
print("wrote 4 icons to", OUT)
