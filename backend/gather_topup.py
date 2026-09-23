"""Top up gallery photos for specific forts using Wikimedia Commons categories."""
import urllib.request, json, io, time, re
from pathlib import Path
from PIL import Image

OUT = Path("/app/frontend/public/forts")
MANIFEST = Path("/app/backend/fort_images.json")
manifest = json.loads(MANIFEST.read_text())

HDR = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    "Referer": "https://commons.wikimedia.org/",
}
API_HDR = {"User-Agent": "KaalChakra/1.0 (educational)"}
SKIP = re.compile(r"(map|locator|flag|logo|icon|commons|edit|osm|location|district|\.svg|panorama_view|wikidata)", re.I)

# fort -> list of candidate Commons categories, and how many extra we want
TARGETS = {
    "rajgad": (["Rajgad", "Rajgad Fort"], 3),
    "torna": (["Torna fort", "Torna Fort", "Torna"], 2),
}


def api(url):
    for _ in range(5):
        try:
            req = urllib.request.Request(url, headers=API_HDR)
            return json.load(urllib.request.urlopen(req, timeout=25))
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(10); continue
            raise
    return {}


def imginfo(fileTitle):
    u = ("https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo"
         "&iiprop=url&iiurlwidth=1400&titles=" + urllib.parse.quote(fileTitle))
    d = api(u)
    pages = (d.get("query", {}) or {}).get("pages", {})
    for _, p in pages.items():
        ii = p.get("imageinfo")
        if ii:
            return ii[0].get("thumburl") or ii[0].get("url")
    return None


def download(url, dest, min_w=500):
    for _ in range(3):
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
                time.sleep(10); continue
            raise
    return False


import urllib.parse
for slug, (cats, want) in TARGETS.items():
    existing = len(manifest.get(slug, [f"/forts/{slug}.jpg"]))
    n = existing + 1
    got = 0
    for cat in cats:
        if got >= want:
            break
        u = ("https://commons.wikimedia.org/w/api.php?action=query&format=json&list=categorymembers"
             "&cmtype=file&cmlimit=30&cmtitle=" + urllib.parse.quote("Category:" + cat))
        d = api(u)
        members = (d.get("query", {}) or {}).get("categorymembers", [])
        for m in members:
            if got >= want:
                break
            ttl = m.get("title", "")
            if SKIP.search(ttl) or not re.search(r"\.(jpe?g|png)$", ttl, re.I):
                continue
            url = imginfo(ttl)
            if not url:
                continue
            try:
                if download(url, OUT / f"{slug}-{n}.jpg"):
                    manifest.setdefault(slug, [f"/forts/{slug}.jpg"]).append(f"/forts/{slug}-{n}.jpg")
                    print(f"[ok] {slug}-{n} <- {ttl}", flush=True)
                    n += 1; got += 1
                    time.sleep(2)
            except Exception as e:
                print(f"[skip] {slug} {ttl}: {e}", flush=True)
    print(f"== {slug}: now {len(manifest[slug])} photos", flush=True)

MANIFEST.write_text(json.dumps(manifest, indent=2))
print("DONE")
