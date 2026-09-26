"""
One-off: translate museum item + category content into Hindi (hi) and Marathi (mr)
using the Emergent universal LLM key, cached in museum_translations.json so runtime
never needs the LLM.

Run:  cd /app/backend && python generate_museum_translations.py
"""
import asyncio
import json
import os
import re
from pathlib import Path
from dotenv import load_dotenv

ROOT = Path(__file__).parent
load_dotenv(ROOT / ".env")

from emergentintegrations.llm.chat import LlmChat, UserMessage
from museum_data import ITEMS, CATEGORIES

API_KEY = os.environ.get("EMERGENT_LLM_KEY", "")
OUT = ROOT / "museum_translations.json"

LANGS = {"hi": ("Hindi", "Devanagari"), "mr": ("Marathi", "Devanagari")}
PROVIDER = "openai"
MODEL = "gpt-5.4"


def _strip_json(text):
    text = text.strip()
    text = re.sub(r"^```(?:json)?", "", text).strip()
    text = re.sub(r"```$", "", text).strip()
    start, end = text.find("{"), text.rfind("}")
    if start != -1 and end != -1:
        text = text[start:end + 1]
    return text


async def translate(payload, lang_code):
    lang_name, script = LANGS[lang_code]
    system = (
        f"You are an expert translator of Indian historical content into {lang_name} "
        f"({script} script). Translate ONLY the string values of the given JSON into natural, "
        f"respectful {lang_name}. Preserve JSON structure and keys exactly. Keep years/numbers as-is. "
        f"Proper nouns (Shivaji Maharaj, Bhavani, place & artifact names) in {script}. "
        f"Return ONLY valid minified JSON, no commentary."
    )
    chat = LlmChat(api_key=API_KEY, session_id=f"mtx-{lang_code}", system_message=system).with_model(PROVIDER, MODEL)
    msg = "Translate the string values of this JSON:\n" + json.dumps(payload, ensure_ascii=False)
    resp = await chat.send_message(UserMessage(text=msg))
    raw = resp if isinstance(resp, str) else str(resp)
    try:
        return json.loads(_strip_json(raw))
    except Exception as e:
        print(f"    !! parse failed ({lang_code}): {e}\n    raw: {raw[:160]}")
        return None


def item_payload(it):
    return {
        "hook": it.get("hook", ""),
        "era": it.get("era", ""),
        "description": it.get("description", ""),
        "quick_facts": it.get("quick_facts", []),
    }


def cat_payload(c):
    return {"name": c.get("name", ""), "tagline": c.get("tagline", "")}


async def main():
    out = {"items": {}, "categories": {}}
    # existing cache (resume support)
    if OUT.exists():
        try:
            out = json.loads(OUT.read_text(encoding="utf-8"))
            out.setdefault("items", {})
            out.setdefault("categories", {})
        except Exception:
            pass

    for c in CATEGORIES:
        slug = c["slug"]
        out["categories"].setdefault(slug, {})
        for lang in LANGS:
            if out["categories"][slug].get(lang):
                continue
            print(f"[cat {slug}] {lang}")
            tx = await translate(cat_payload(c), lang)
            if tx:
                out["categories"][slug][lang] = tx
                OUT.write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding="utf-8")

    for it in ITEMS:
        slug = it["slug"]
        out["items"].setdefault(slug, {})
        for lang in LANGS:
            if out["items"][slug].get(lang):
                continue
            print(f"[item {slug}] {lang}")
            tx = await translate(item_payload(it), lang)
            if tx:
                out["items"][slug][lang] = tx
                OUT.write_text(json.dumps(out, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"\nWrote {OUT}")


if __name__ == "__main__":
    asyncio.run(main())
