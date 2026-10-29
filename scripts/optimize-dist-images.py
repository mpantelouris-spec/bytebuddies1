#!/usr/bin/env python3
"""
Shrink the big images in dist/ after `vite build` so the site works on slow connections.

The original art in public/ is never touched; only the copies in dist/ are replaced.
  - Sprites (assets/characters/**.png): longest side 640 px, 256-colour PNG with transparency.
    (They are drawn at most ~200 px on the 480x360 stage.)
  - Stage / track backgrounds: longest side 1440 px (stage) or 2048 px (3D tracks);
    JPEGs re-saved at quality 82, PNGs as 256-colour PNGs.
Results are cached in node_modules/.cache/bb-img-opt, so later builds only redo changed files.

Usage: python3 scripts/optimize-dist-images.py [dist]
"""
import hashlib
import os
import shutil
import sys
from concurrent.futures import ProcessPoolExecutor

try:
    from PIL import Image
except ImportError:  # building somewhere without Pillow: ship the full-size images rather than fail
    print('optimize-dist-images: Pillow not installed (pip3 install Pillow) - images left full size')
    sys.exit(0)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'dist'))
CACHE = os.path.join(ROOT, 'node_modules', '.cache', 'bb-img-opt')
RECIPE = 'v1'  # bump to redo every image

RULES = [
    # (folder under dist, longest side)
    ('assets/characters', 640),
    ('assets/backgrounds/stage', 1440),
    ('assets/backgrounds/tracks', 2048),
]


def fit(im, longest):
    w, h = im.size
    k = longest / max(w, h)
    if k >= 1:
        return im
    return im.resize((max(1, round(w * k)), max(1, round(h * k))), Image.LANCZOS)


def optimise(job):
    path, longest = job
    st = os.stat(path)
    # Vite copies public/ afresh each build (new mtimes), so key on the file's contents
    with open(path, 'rb') as fh:
        head = fh.read(1 << 20)
    key = hashlib.sha1(f'{RECIPE}|{st.st_size}|{longest}|'.encode() + head).hexdigest()
    cached = os.path.join(CACHE, key + os.path.splitext(path)[1].lower())
    if os.path.exists(cached):
        shutil.copyfile(cached, path)
        return st.st_size, os.path.getsize(path)
    before = st.st_size
    ext = os.path.splitext(path)[1].lower()
    tmp = path + '.opt' + ext
    try:
        with Image.open(path) as src:
            src.load()
            if ext in ('.jpg', '.jpeg'):
                fit(src.convert('RGB'), longest).save(tmp, 'JPEG', quality=82, optimize=True, progressive=True)
            else:
                has_alpha = src.mode in ('RGBA', 'LA') or (src.mode == 'P' and 'transparency' in src.info)
                im = fit(src.convert('RGBA' if has_alpha else 'RGB'), longest)
                if has_alpha:
                    q = im.quantize(colors=256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.FLOYDSTEINBERG)
                else:
                    q = im.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG)
                q.save(tmp, 'PNG', optimize=True)
        if os.path.getsize(tmp) < before:
            os.replace(tmp, path)
        else:
            os.remove(tmp)
    except Exception as e:  # leave the original in place if anything goes wrong
        print('  skip', path[len(DIST) + 1:], '-', e)
        if os.path.exists(tmp):
            os.remove(tmp)
        return before, before
    os.makedirs(CACHE, exist_ok=True)
    shutil.copyfile(path, cached)
    return before, os.path.getsize(path)


def main():
    jobs = []
    for folder, longest in RULES:
        base = os.path.join(DIST, folder)
        for dirpath, _, files in os.walk(base):
            if os.sep + 'thumbs' in dirpath:
                continue
            for f in files:
                if f.lower().endswith(('.png', '.jpg', '.jpeg')):
                    jobs.append((os.path.join(dirpath, f), longest))
    if not jobs:
        print('optimize-dist-images: nothing to do')
        return
    before = after = 0
    with ProcessPoolExecutor() as pool:
        for b, a in pool.map(optimise, jobs, chunksize=4):
            before += b
            after += a
    print(f'optimize-dist-images: {len(jobs)} images, {before / 1e6:.0f} MB -> {after / 1e6:.0f} MB')


if __name__ == '__main__':
    main()
