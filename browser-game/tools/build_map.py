"""Upscale the Kaasland concept map 3x and redraw clear region/territory borders and labels."""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

import os
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'kaasland_source.png')
S = 3
base = Image.open(SRC).convert('RGB')
W, H = base.size[0] * S, base.size[1] * S
img = base.resize((W, H), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))

# ---------------------------------------------------------------- geometry (source pixel coords)
REGIONS = {
    'start': dict(col=(235, 240, 245), poly=[(160, 377), (440, 348), (490, 349), (490, 510), (380, 512), (350, 534), (315, 537),
                                             (272, 520), (260, 505), (140, 490), (120, 500), (90, 511), (95, 502), (130, 482), (165, 445)],
                  seeds={'De Natte Worst': (235, 430), 'Spekbuurt': (420, 465), 'Kroketkade': (450, 380), 'Uitjesbuurt': (175, 486)}),
    'lampas': dict(col=(255, 128, 48), poly=[(65, 168), (100, 160), (150, 180), (185, 205), (215, 224), (630, 222), (625, 262), (600, 300),
                                             (560, 330), (510, 345), (440, 350), (160, 377), (165, 445), (130, 482), (95, 502), (85, 520),
                                             (72, 505), (56, 455), (47, 410), (40, 370), (47, 330), (56, 285), (62, 240), (64, 200)],
                   seeds={'Sauzenbuurt': (105, 330), 'Frietwijk': (245, 290), 'Knoflooksteeg': (372, 282), 'Mayonaisemarkt': (480, 240),
                          'Bitterbalbuurt': (575, 268), 'Halve Kip Plein': (470, 322), 'Pindasausplein': (95, 432)}),
    'nosh': dict(col=(110, 235, 110), poly=[(122, 175), (118, 140), (140, 100), (175, 70), (215, 55), (245, 62), (290, 48), (350, 38),
                                            (430, 28), (530, 20), (600, 28), (680, 36), (760, 40), (840, 45), (900, 42), (950, 24), (1020, 6), (1022, 78), (980, 104),
                                            (935, 118), (900, 135), (860, 150), (820, 160), (780, 170), (730, 178), (630, 176), (530, 173),
                                            (430, 176), (370, 176), (300, 152), (255, 175), (250, 205), (215, 215), (170, 205), (135, 190)],
                 seeds={'Joppiehaven': (192, 128), 'Speltpolder': (985, 55), 'Frikandelhaven': (182, 172), 'Havermelkhaven': (320, 112), 'Kombucha-kwartier': (470, 140),
                        'Gembergracht': (585, 135), 'Avocado-akkers': (650, 72), 'Glutenvrije Gaarde': (725, 145), 'Oat-oase': (880, 100), 'Quinoaplantage': (775, 82)}),
    'abd': dict(col=(60, 210, 255), poly=[(708, 222), (800, 214), (880, 214), (968, 237), (948, 262), (968, 310), (947, 326), (955, 365),
                                          (950, 405), (937, 420), (910, 445), (895, 477), (830, 490), (830, 505), (740, 510), (655, 510),
                                          (645, 525), (540, 530), (540, 512), (510, 510), (512, 345), (605, 330), (645, 300), (690, 265)],
                seeds={'Komijnkade': (790, 232), 'Kruidnagelkade': (840, 292), 'Peperhaven': (675, 315), 'Saffraanpier': (918, 352),
                       'Smokkelsloot': (590, 432), 'Containerchaos': (765, 472), 'Kurkumaloods': (562, 372), 'Nootmuskade': (880, 432), 'Kardemomdok': (632, 498), "Kaneelsilo's": (888, 256), 'Paprikapakhuis': (700, 278)}),
}
ORDER = ['start', 'lampas', 'nosh', 'abd']

# territory label positions (sit on top of the old baked-in labels, so these cover them)
TERR_LABELS = {
    'Havermelkhaven': (330, 130), 'Frikandelhaven': (198, 182), 'Kombucha-kwartier': (486, 148), 'Gembergracht': (604, 140),
    'Avocado-akkers': (645, 84), 'Glutenvrije Gaarde': (726, 145), 'Oat-oase': (868, 102),
    'Mayonaisemarkt': (475, 232), 'Frietwijk': (265, 274), 'Knoflooksteeg': (378, 286), 'Sauzenbuurt': (145, 297),
    'Halve Kip Plein': (475, 330), 'Bitterbalbuurt': (575, 286),
    'Spekbuurt': (397, 491), 'De Natte Worst': None, 'Kroketkade': (452, 378), 'Uitjesbuurt': (172, 490),
    'Joppiehaven': (190, 116), 'Speltpolder': (982, 58), "Kaneelsilo's": (895, 258), 'Paprikapakhuis': (706, 284),
    'Pindasausplein': (95, 432), 'Quinoaplantage': (772, 82), 'Kurkumaloods': (562, 372), 'Nootmuskade': (876, 432), 'Kardemomdok': (626, 500),
    'Komijnkade': (767, 242), 'Kruidnagelkade': (835, 294), 'Peperhaven': (687, 321), 'Saffraanpier': (930, 351),
    'Smokkelsloot': (620, 427), 'Containerchaos': (739, 476),
}
TITLES = [  # (title, subtitle, centre, region)
    ('NOSHGEY KARIOT TERRITORY', 'Hipsterheuvel', (500, 101), 'nosh'),
    ('LAMPAS TERRITORY', 'Oud-Vettenburg', (475, 254), 'lampas'),
    ('ABDAVISSIES TERRITORY', 'De Duistere Dokken', (754, 363), 'abd'),
    ('DE NATTE WORST', 'Home base', (292, 407), 'start'),
]
OTHER = [("Eddy's warehouse", (242, 468)), ('De Gouden Molen', (712, 205))]

def sc(p):
    return (p[0] * S, p[1] * S)

# ---------------------------------------------------------------- land mask (not water)
arr = np.asarray(img).astype(np.float32) / 255.0
r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]
mx, mn = arr.max(-1), arr.min(-1)
sat = (mx - mn) / (mx + 1e-6)
water = (b > r + 0.05) & (g > r + 0.02) & (mx < 0.62) & (sat > 0.3)
water_img = Image.fromarray((water * 255).astype(np.uint8)).filter(ImageFilter.MedianFilter(9))
land = np.asarray(water_img) < 128

# ---------------------------------------------------------------- territories (Voronoi inside each region)
terr_id = np.full((H, W), -1, np.int32)
names, regs = [], []
ys, xs = np.mgrid[0:H, 0:W]
for rk in ORDER:
    R = REGIONS[rk]
    m = Image.new('L', (W, H), 0)
    ImageDraw.Draw(m).polygon([sc(p) for p in R['poly']], fill=255)
    mask = np.asarray(m) > 0
    seeds = list(R['seeds'].items())
    best = np.full((H, W), np.inf, np.float32)
    idx = np.full((H, W), -1, np.int32)
    for k, (nm, p) in enumerate(seeds):
        d = (xs - p[0] * S) ** 2 + (ys - p[1] * S) ** 2
        upd = d < best
        best[upd] = d[upd]
        idx[upd] = len(names) + k
    terr_id[mask] = idx[mask]
    for nm, _ in seeds:
        names.append(nm); regs.append(rk)

# fills: alternating tints per territory, only on land
over = np.zeros((H, W, 4), np.float32)
for t, (nm, rk) in enumerate(zip(names, regs)):
    m = (terr_id == t) & land
    c = np.array(REGIONS[rk]['col'], np.float32)
    shade = 1.0 if t % 2 == 0 else 0.62
    over[m, :3] = c * shade
    over[m, 3] = 0.20 if rk != 'start' else 0.14
base_arr = np.asarray(img).astype(np.float32)
a = over[..., 3:4]
base_arr = base_arr * (1 - a) + over[..., :3] * a
img = Image.fromarray(np.clip(base_arr, 0, 255).astype(np.uint8))

# territory borders: where neighbouring pixels belong to different territories of the same region
tb = np.zeros((H, W), bool)
for dy, dx in ((0, 1), (1, 0)):
    a1 = terr_id[: H - dy, : W - dx]
    a2 = terr_id[dy:, dx:]
    diff = (a1 != a2) & (a1 >= 0) & (a2 >= 0)
    tb[: H - dy, : W - dx] |= diff
border_img = Image.fromarray((tb * 255).astype(np.uint8))

def stroke_mask(mask_img, width):
    return mask_img.filter(ImageFilter.MaxFilter(width))

draw_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
# territory borders: dark casing + light dashed-feel solid line in the region colour
for rk in ORDER:
    rm = Image.new('L', (W, H), 0)
    ImageDraw.Draw(rm).polygon([sc(p) for p in REGIONS[rk]['poly']], fill=255)
    rmask = np.asarray(rm) > 0
    local = Image.fromarray(((tb & rmask) * 255).astype(np.uint8))
    casing = stroke_mask(local, 9)
    line = stroke_mask(local, 5)
    col = REGIONS[rk]['col']
    lite = tuple(int(c * 0.45 + 255 * 0.55) for c in col)
    draw_layer.paste((15, 18, 22, 170), (0, 0), casing)
    draw_layer.paste(lite + (255,), (0, 0), line)
img = img.convert('RGBA')
img.alpha_composite(draw_layer)

# region outlines: glow + bright line + dark casing
glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
gd = ImageDraw.Draw(glow)
for rk in ORDER:
    pts = [sc(p) for p in REGIONS[rk]['poly']]
    gd.line(pts + [pts[0]], fill=REGIONS[rk]['col'] + (200,), width=26, joint='curve')
glow = glow.filter(ImageFilter.GaussianBlur(10))
img.alpha_composite(glow)
lines = Image.new('RGBA', (W, H), (0, 0, 0, 0))
ld = ImageDraw.Draw(lines)
for rk in ORDER:
    pts = [sc(p) for p in REGIONS[rk]['poly']]
    ld.line(pts + [pts[0]], fill=(10, 12, 16, 230), width=12, joint='curve')
for rk in ORDER:
    pts = [sc(p) for p in REGIONS[rk]['poly']]
    ld.line(pts + [pts[0]], fill=REGIONS[rk]['col'] + (255,), width=7, joint='curve')
img.alpha_composite(lines)

# ---------------------------------------------------------------- labels
FB = os.path.join(HERE, 'DejaVuSans-Bold.ttf')
FR = os.path.join(HERE, 'DejaVuSans.ttf')
f_terr = ImageFont.truetype(FB, 30)
f_title = ImageFont.truetype(FB, 44)
f_sub = ImageFont.truetype(FR, 30)
lab = Image.new('RGBA', (W, H), (0, 0, 0, 0))
L = ImageDraw.Draw(lab)

BOXES_LAST = [0, 0, 0, 0]
LABEL_BOXES = {}
def plate(cx, cy, lines_, accent=None, pad=14, minw=0, minh=0, lead=0):
    sizes = [L.textbbox((0, 0), t, font=f) for t, f, _ in lines_]
    ws = [s[2] - s[0] for s in sizes]
    hs = [s[3] - s[1] for s in sizes]
    gap = 8
    tw = max(max(ws) + lead, minw)
    th = max(sum(hs) + gap * (len(lines_) - 1), minh)
    x0, y0 = cx - tw / 2 - pad, cy - th / 2 - pad * 0.8
    x1, y1 = cx + tw / 2 + pad, cy + th / 2 + pad * 0.8
    BOXES_LAST[:] = [x0, y0, x1, y1]
    L.rounded_rectangle([x0 + 3, y0 + 4, x1 + 3, y1 + 4], radius=12, fill=(0, 0, 0, 110))
    L.rounded_rectangle([x0, y0, x1, y1], radius=12, fill=(14, 18, 24, 255), outline=(accent or (255, 255, 255)) + (255,), width=3)
    y = cy - (sum(hs) + gap * (len(lines_) - 1)) / 2
    for (t, f, col), w_, h_, s in zip(lines_, ws, hs, sizes):
        L.text((cx - w_ / 2 - s[0] + lead / 2, y - s[1]), t, font=f, fill=col)
        y += h_ + gap

for title, sub, c, rk in TITLES:
    col = REGIONS[rk]['col']
    plate(c[0] * S, c[1] * S, [(title, f_title, col + (255,)), (sub, f_sub, (235, 235, 235, 255))], accent=col, pad=18)
for nm, pos in TERR_LABELS.items():
    if pos is None:
        continue
    rk = regs[names.index(nm)]
    col = REGIONS[rk]['col']
    extra = {'Kombucha-kwartier': dict(minw=310), 'Gembergracht': dict(minh=78, minw=150), 'Spekbuurt': dict(minw=250), 'Havermelkhaven': dict(minw=250), 'Frikandelhaven': dict(minw=250), 'Sauzenbuurt': dict(minw=220)}.get(nm, dict(minw=150))
    plate(pos[0] * S, pos[1] * S, [(nm, f_terr, (255, 255, 255, 255))], accent=col, pad=12, lead=34, **extra)
    LABEL_BOXES[nm] = dict(box=[round(v / S, 1) for v in BOXES_LAST], region=rk, dot=[round((BOXES_LAST[0] + 12 + 17) / S, 1), pos[1]])
plate(OTHER[0][1][0] * S, OTHER[0][1][1] * S, [(OTHER[0][0], f_terr, (255, 255, 255, 255))], accent=(255, 80, 70), pad=12, lead=34)
LABEL_BOXES['De Natte Worst'] = dict(box=[round(v / S, 1) for v in BOXES_LAST], region='start', dot=[round((BOXES_LAST[0] + 12 + 17) / S, 1), OTHER[0][1][1]])
plate(OTHER[1][1][0] * S + 40, OTHER[1][1][1] * S, [(OTHER[1][0], f_title, (255, 205, 60, 255))], accent=(255, 205, 60), pad=16, lead=44)
LABEL_BOXES['De Gouden Molen'] = dict(box=[round(v / S, 1) for v in BOXES_LAST], region='fin', dot=[round((BOXES_LAST[0] + 16 + 22) / S, 1), OTHER[1][1][1]])
import json
json.dump(dict(size=[base.size[0], base.size[1]], labels=LABEL_BOXES), open(os.path.join(HERE, '..', 'assets', 'map_labels.json'), 'w'), indent=0)
img.alpha_composite(lab)

# ---------------------------------------------------------------- legend (covers the old one)
lg = Image.new('RGBA', (W, H), (0, 0, 0, 0))
D = ImageDraw.Draw(lg)
items = [('Home base', REGIONS['start']['col']), ('Lampas', REGIONS['lampas']['col']), ('Noshgey Kariot', REGIONS['nosh']['col']),
         ('Abdavissies', REGIONS['abd']['col']), ('De Gouden Molen', (255, 205, 60))]
x = 330 * S
y0 = 537 * S
widths = [D.textbbox((0, 0), t, font=f_terr)[2] + 70 for t, _ in items]
total = sum(widths) + 30
x = W / 2 - total / 2
D.rounded_rectangle([x - 10, y0, x + total, y0 + 64], radius=14, fill=(14, 18, 24, 225), outline=(255, 255, 255, 120), width=2)
cx = x + 20
for (t, col), w_ in zip(items, widths):
    D.rounded_rectangle([cx, y0 + 18, cx + 28, y0 + 46], radius=6, fill=col + (255,))
    D.text((cx + 40, y0 + 14), t, font=f_terr, fill=(240, 240, 240, 255))
    cx += w_
D.text((W - 40, y0 + 18), 'Lines inside a region = territories to conquer', font=ImageFont.truetype(FR, 24), fill=(230, 230, 230, 230), anchor='ra')
img.alpha_composite(lg)

img.convert('RGB').save(os.path.join(HERE, 'kaasland_map_full.png'), optimize=True)
img.convert('RGB').resize((1600, 893), Image.LANCZOS).save(os.path.join(HERE, '..', 'assets', 'kaasland_map.jpg'), quality=85)
print(W, H, len(names), 'territories')
