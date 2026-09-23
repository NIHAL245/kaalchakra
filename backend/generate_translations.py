"""
One-off script: translate all fort content + quiz questions into Hindi (hi) and
Marathi (mr) using the Emergent universal LLM key, and cache the result in
content_translations.json so runtime never needs to hit the LLM for translations.

Run:  cd /app/backend && python generate_translations.py
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
from seed_data import FORTS, QUIZ_QUESTIONS

API_KEY = os.environ.get("EMERGENT_LLM_KEY", "")
OUT = ROOT / "content_translations.json"

LANGS = {
    "hi": ("Hindi", "Devanagari"),
    "mr": ("Marathi", "Devanagari"),
}

PROVIDER = "openai"
MODEL = "gpt-5.4"


def _strip_json(text):
    text = text.strip()
    # remove code fences if present
    text = re.sub(r"^```(?:json)?", "", text).strip()
    text = re.sub(r"```$", "", text).strip()
    # grab the first {...} block
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1:
        text = text[start : end + 1]
    return text


async def translate_json(payload, lang_code):
    lang_name, script = LANGS[lang_code]
    system = (
        f"You are an expert translator of Indian educational and historical content into "
        f"{lang_name} ({script} script). Translate ONLY the string values of the given JSON "
        f"into natural, respectful, historically appropriate {lang_name}. Preserve the JSON "
        f"structure and all keys exactly. Keep years and numbers as-is. Well-known proper nouns "
        f"(Shivaji Maharaj, fort names, people) should be written in {script}. Do NOT add any "
        f"commentary. Return ONLY valid minified JSON."
    )
    chat = LlmChat(api_key=API_KEY, session_id=f"tx-{lang_code}", system_message=system).with_model(
        PROVIDER, MODEL
    )
    msg = "Translate the string values of this JSON:\n" + json.dumps(payload, ensure_ascii=False)
    resp = await chat.send_message(UserMessage(text=msg))
    raw = resp if isinstance(resp, str) else str(resp)
    try:
        return json.loads(_strip_json(raw))
    except Exception as e:
        print(f"    !! JSON parse failed ({lang_code}): {e}\n    raw: {raw[:200]}")
        return None


def fort_payload(f):
    return {
        "hook": f.get("hook", ""),
        "era": f.get("era", ""),
        "region": f.get("region", ""),
        "description": f.get("description", ""),
        "narration_text": f.get("narration_text", ""),
        "quick_facts": f.get("quick_facts", []),
        "timeline": [{"title": t["title"], "body": t["body"]} for t in f.get("timeline", [])],
    }


def quiz_payload(q):
    return {
        "prompt": q["prompt"],
        "options": q["options"],
        "explanation": q["explanation"],
    }


async def main():
    if not API_KEY:
        raise SystemExit("EMERGENT_LLM_KEY not set")

    existing = {}
    if OUT.exists():
        try:
            existing = json.loads(OUT.read_text(encoding="utf-8"))
        except Exception:
            existing = {}

    result = {"forts": existing.get("forts", {}), "quizzes": existing.get("quizzes", {})}

    # Forts
    for f in FORTS:
        slug = f["slug"]
        result["forts"].setdefault(slug, {})
        for lang in LANGS:
            if result["forts"][slug].get(lang):
                print(f"[skip] fort {slug} {lang}")
                continue
            print(f"[gen ] fort {slug} {lang} ...", flush=True)
            tx = await translate_json(fort_payload(f), lang)
            if tx:
                result["forts"][slug][lang] = tx
                OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
                print(f"[ok  ] fort {slug} {lang}", flush=True)

    # Quizzes (stable id = q-{index})
    for i, q in enumerate(QUIZ_QUESTIONS):
        qid = f"q-{i}"
        result["quizzes"].setdefault(qid, {})
        for lang in LANGS:
            if result["quizzes"][qid].get(lang):
                print(f"[skip] quiz {qid} {lang}")
                continue
            print(f"[gen ] quiz {qid} {lang} ...", flush=True)
            tx = await translate_json(quiz_payload(q), lang)
            if tx:
                result["quizzes"][qid][lang] = tx
                OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
                print(f"[ok  ] quiz {qid} {lang}", flush=True)

    print("DONE ->", OUT)


if __name__ == "__main__":
    asyncio.run(main())
