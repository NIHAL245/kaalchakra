"""Gather real photos for museum items from Wikimedia Commons (thumbnail-based).

Uses the Commons API imageinfo `iiurlwidth` to fetch THUMBNAIL urls (served from
upload.wikimedia.org/.../thumb/...), which are far less rate-limited than original
files. For each item it searches the File namespace, filters out irrelevant/vector
files, downloads up to 3 relevant raster thumbnails to
/app/frontend/public/museum/{slug}.jpg (+ -2, -3) and writes museum_images.json.

Run:  cd /app/backend && python gather_museum_photos.py
"""
import urllib.request
import urllib.parse
import json
import io
import time
import re
from pathlib import Path
from PIL import Image

from museum_data import ITEMS

OUT_DIR = Path("/app/frontend/public/museum")
OUT_DIR.mkdir(parents=True, exist_ok=True)
MANIFEST = Path(__file__).parent / "museum_images.json"

API = "https://commons.wikimedia.org/w/api.php"
API_HDR = {"User-Agent": "KaalChakra/1.0 (educational; contact admin@kaalchakra.example)"}
IMG_HDR = {
    "User-Agent": "KaalChakra/1.0 (educational; contact admin@kaalchakra.example)",
    "Accept": "image/*,*/*;q=0.8",
    "Referer": "https://commons.wikimedia.org/",
}

# Skip clearly irrelevant files (places named after people, vectors, logos, maps).
SKIP = re.compile(
    r"(terminus|railway|station|airport|metro|express|road|bridge|university|college|"
    r"stadium|hospital|market|street|building|junction|\.svg|\.ogg|\.webm|map|locator|"
    r"logo|icon|coat[_ ]of[_ ]arms|flag[_ ]of|template|wikidata|banner|panorama|nagar|"
    r"chowk|garden|park|statue[_ ]of|memorial|stamp|postage)",
    re.I,
)


def api_get(params, tries=6):
    url = API + "?" + urllib.parse.urlencode(params)
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=API_HDR)
            return json.load(urllib.request.urlopen(req, timeout=30))
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(8 + i * 4)
                continue
            raise
        except Exception:
            time.sleep(3)
    return {}


def search_thumbs(query, width=1000, limit=14):
    """Return list of (index, thumburl, title) for relevant raster files."""
    data = api_get({
        "action": "query",
        "format": "json",
        "generator": "search",
        "gsrsearch": f"{query} filetype:bitmap",
        "gsrnamespace": "6",
        "gsrlimit": str(limit),
        "prop": "imageinfo",
        "iiprop": "url|size|mime",
        "iiurlwidth": str(width),
    })
    pages = (data.get("query", {}) or {}).get("pages", {}) or {}
    out = []
    for p in pages.values():
        title = p.get("title", "")
        ii = (p.get("imageinfo") or [{}])[0]
        thumb = ii.get("thumburl") or ""
        w = ii.get("width", 0)
        mime = ii.get("mime", "")
        idx = p.get("index", 999)
        if not thumb:
            continue
        if SKIP.search(title):
            continue
        if mime not in ("image/jpeg", "image/png"):
            continue
        if w and w < 400:
            continue
        out.append((idx, thumb, title))
    out.sort(key=lambda x: x[0])
    return out


def download(url, dest):
    for i in range(4):
        try:
            req = urllib.request.Request(url, headers=IMG_HDR)
            data = urllib.request.urlopen(req, timeout=60).read()
            img = Image.open(io.BytesIO(data)).convert("RGB")
            w, h = img.size
            if w < 300:
                return False
            img.save(dest, "JPEG", quality=85, optimize=True)
            return True
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(6 + i * 4)
                continue
            return False
        except Exception:
            return False
    return False


def main():
    manifest = {}
    for item in ITEMS:
        slug = item["slug"]
        query = item.get("wiki") or item["name"]
        print(f"[{slug}] '{query}'", flush=True)
        results = search_thumbs(query)
        saved = []
        n = 0
        seen = set()
        for idx, thumb, title in results:
            if n >= 3:
                break
            key = re.sub(r"[ _]", "", title.lower())
            if key in seen:
                continue
            seen.add(key)
            suffix = "" if n == 0 else f"-{n+1}"
            dest = OUT_DIR / f"{slug}{suffix}.jpg"
            if download(thumb, dest):
                saved.append(f"/museum/{slug}{suffix}.jpg")
                print(f"    + {dest.name}  <- {title}", flush=True)
                n += 1
            time.sleep(1.5)
        if not saved:
            print(f"    !! none for {slug}", flush=True)
        manifest[slug] = saved
        time.sleep(2.0)

    MANIFEST.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")
    total = sum(len(v) for v in manifest.values())
    print(f"\nWrote {MANIFEST}: {total} images across {len(manifest)} items.", flush=True)


if __name__ == "__main__":
    main()
