"""Gather up to 3 EXTRA Wikimedia photos per fort (skipping the primary), with
429 backoff + dedup. Writes /forts/{slug}-N.jpg and /app/backend/fort_images.json.
Coords already captured in /app/backend/fort_coords.json.
"""
import urllib.request, json, io, time, re
from pathlib import Path
from PIL import Image

FORTS = {
    "shivneri": "Shivneri",
    "torna": "Torna_Fort",
    "rajgad": "Rajgad_Fort",
    "pratapgad": "Pratapgad",
    "sinhagad": "Sinhagad",
    "raigad": "Raigad_Fort",
}
# Normalized filenames of the primary photo already saved as {slug}.jpg (to skip)
PRIMARY = {
    "shivneri": "shivnerifort1.jpg",
    "torna": "tornafortakakilleprachangad.jpg",
    "rajgad": "suvelamachi,rajgadfort,maharashtra,indiajuly2015.jpg",
    "pratapgad": "pratapgadthefortofvalour.jpg",
    "sinhagad": "sinhagad.jpg",
    "raigad": "nagarkhana,raigadfort,india.jpg",
}
OUT = Path("/app/frontend/public/forts")
HDR = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    "Accept": "image/*,*/*;q=0.8",
    "Referer": "https://en.wikipedia.org/",
}
API_HDR = {"User-Agent": "KaalChakra/1.0 (educational)"}
SKIP = re.compile(r"(map|locator|flag|logo|icon|commons|edit|wiki|osm|location|district|_india\.svg|panorama_view_icon)", re.I)


def norm(t):
    return re.sub(r"[ _]", "", t.replace("File:", "")).lower()


def get_json(url, tries=5):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=API_HDR)
            return json.load(urllib.request.urlopen(req, timeout=25))
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(12)
                continue
            raise
    raise RuntimeError("rate limited")


def download_img(url, dest, min_w=500, tries=4):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=HDR)
            data = urllib.request.urlopen(req, timeout=60).read()
            img = Image.open(io.BytesIO(data)).convert("RGB")
            w, h = img.size
            if w < min_w:
                return False
            if w > 1400:
                img = img.resize((1400, int(h * 1400 / w)))
            img.save(dest, "JPEG", quality=84, optimize=True)
            return True
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(12)
                continue
            raise
    return False


manifest = {}
for slug, title in FORTS.items():
    gallery = [f"/forts/{slug}.jpg"]
    seen = {PRIMARY[slug]}
    n = 2
    try:
        ml = get_json(f"https://en.wikipedia.org/api/rest_v1/page/media-list/{title}")
        for it in ml.get("items", []):
            if n > 4:
                break
            if it.get("type") != "image":
                continue
            ttl = it.get("title", "")
            nm = norm(ttl)
            if nm in seen or SKIP.search(ttl) or not re.search(r"\.(jpe?g|png)$", ttl, re.I):
                continue
            srcset = it.get("srcset") or []
            if not srcset:
                continue
            src = srcset[-1].get("src", "")
            if src.startswith("//"):
                src = "https:" + src
            try:
                if download_img(src, OUT / f"{slug}-{n}.jpg"):
                    gallery.append(f"/forts/{slug}-{n}.jpg")
                    seen.add(nm)
                    print(f"[ok] {slug}-{n} <- {ttl}", flush=True)
                    n += 1
                    time.sleep(5)
            except Exception as e:
                print(f"[skip] {slug} {ttl}: {e}", flush=True)
                time.sleep(5)
    except Exception as e:
        print(f"[warn] {slug}: {e}", flush=True)
    manifest[slug] = gallery
    print(f"== {slug}: {len(gallery)} photos", flush=True)
    time.sleep(3)

Path("/app/backend/fort_images.json").write_text(json.dumps(manifest, indent=2))
print("DONE")
