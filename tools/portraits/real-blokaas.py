# Painted, realistic portraits of Hans and Conny from Tristan's photos (2026-11-28); the photos stay out of the repo (UP points at the uploads folder).
# Semi-realistic portraits from Tristan's photos: light paint smoothing, a warm grade, the background pushed into the
# rivals' lilac with a radial mask, a soft vignette. 256x320 like the other faces.
from PIL import Image, ImageFilter, ImageEnhance, ImageDraw, ImageChops
import numpy as np
UP = 'C:/Users/Tristan/.claude/uploads/96b007c3-739a-497b-b9d9-ee5fb833aa5e/'
OUT = 'C:/repos/sme-blokaas/browser-game/assets/'
jobs = [('hans', UP + 'f2e632ad-17958697371077372693983285241948.jpg', (22, 0, 182, 200), (0.50, 0.40)),
        ('conny', UP + '10067c6f-17958698992253715155337022590876.jpg', (130, 40, 850, 940), (0.52, 0.44))]
for key, src, box, ctr in jobs:
    im = Image.open(src).convert('RGB').crop(box).resize((256, 320), Image.LANCZOS)
    base = im.filter(ImageFilter.MedianFilter(3))
    paint = im.filter(ImageFilter.MedianFilter(5)).filter(ImageFilter.ModeFilter(3)).quantize(56, Image.Quantize.MEDIANCUT).convert('RGB')
    im = Image.blend(base, paint, 0.6).filter(ImageFilter.UnsharpMask(radius=1.4, percent=60, threshold=2))
    # faint ink on the strong edges, like a painted game portrait
    L = np.asarray(im.convert('L').filter(ImageFilter.MedianFilter(3))).astype(np.float32)
    from PIL import ImageFilter as F
    g1 = np.asarray(Image.fromarray(L.astype(np.uint8)).filter(F.GaussianBlur(0.9))).astype(np.float32); g2 = np.asarray(Image.fromarray(L.astype(np.uint8)).filter(F.GaussianBlur(2.0))).astype(np.float32)
    ink = np.clip((g2 - g1 - 3) / 14, 0, 1) * 0.35
    im = Image.fromarray((np.asarray(im).astype(np.float32) * (1 - ink[..., None])).astype(np.uint8))
    im = ImageEnhance.Color(im).enhance(1.08); im = ImageEnhance.Contrast(im).enhance(1.06)
    a = np.asarray(im).astype(np.float32) / 255
    a = a * np.array([1.03, 1.0, 0.95])  # warm
    H, W = 320, 256; yy, xx = np.mgrid[0:H, 0:W]
    d = np.sqrt(((xx / W - ctr[0]) / 0.42) ** 2 + ((yy / H - ctr[1]) / 0.48) ** 2)
    m = np.clip((d - 0.75) / 0.45, 0, 1)[..., None]  # 0 at the face, 1 at the edges
    grey = a.mean(axis=2, keepdims=True)
    lilac = np.array([0.66, 0.56, 0.80]) * (0.55 + 0.6 * grey)
    a = a * (1 - m * 0.8) + lilac * (m * 0.8)
    a *= (1 - 0.35 * np.clip(d - 0.9, 0, 1)[..., None])  # vignette
    out = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8))
    out.save(OUT + f'face_{key}.jpg', quality=90)
print('ok')
