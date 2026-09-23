"""
One-off script: generate historical "reconstruction" images for each fort using
OpenAI gpt-image-1 via the Emergent universal key, and save them as PNGs into
the frontend public folder for the "Then vs Now" slider.

Run:  cd /app/backend && python generate_reconstructions.py
"""
import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration

OUT_DIR = Path("/app/frontend/public/reconstructions")
OUT_DIR.mkdir(parents=True, exist_ok=True)

API_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

STYLE = (
    "painterly historical reconstruction illustration, warm cinematic golden light, "
    "highly detailed, wide establishing shot, majestic and awe-inspiring, 17th century "
    "Maratha era, saffron flags, no text, no watermark, no people close-up"
)

PROMPTS = {
    "shivneri": (
        "A majestic 17th-century Maratha hill fort Shivneri in its prime near Junnar, seven "
        "fortified stone gateways ascending a triangular green hill, watchtowers and ramparts, "
        f"lush monsoon greenery, golden dawn light. {STYLE}"
    ),
    "torna": (
        "A colossal 17th-century Maratha hill fort Torna (Prachandagad) at its peak, massive "
        "stone ramparts running along a very high ridge in the Sahyadri mountains, misty valleys "
        f"far below, warm morning light. {STYLE}"
    ),
    "rajgad": (
        "A grand 17th-century Maratha capital hill fort Rajgad in its glory, three fortified "
        "mountain spurs and a central citadel (Balekilla), palaces, gateways and long ramparts, "
        f"dramatic sunset over the Sahyadri range. {STYLE}"
    ),
    "pratapgad": (
        "A dramatic 17th-century Maratha hill fort Pratapgad in its prime above the Konkan "
        "escarpment, layered stone fortifications and bastions, a hilltop temple, dense green "
        f"forests and rolling clouds, golden light. {STYLE}"
    ),
    "sinhagad": (
        "A rugged 17th-century Maratha hill fort Sinhagad (Kondhana) at its peak, steep cliffs and "
        "massive fortified gateways, watchtowers and stone walls, moody dramatic dusk sky. "
        f"{STYLE}"
    ),
    "raigad": (
        "A regal 17th-century Maratha capital fort Raigad in its glory, royal court buildings, a "
        "grand stone stairway and the Nagarkhana gateway, a market street, royal saffron flags, "
        f"majestic plateau rising above clouds, golden coronation-era light. {STYLE}"
    ),
}


async def main():
    if not API_KEY:
        raise SystemExit("EMERGENT_LLM_KEY not set")
    gen = OpenAIImageGeneration(api_key=API_KEY)
    for slug, prompt in PROMPTS.items():
        out = OUT_DIR / f"{slug}.png"
        if out.exists() and out.stat().st_size > 1000:
            print(f"[skip] {slug} already exists ({out.stat().st_size} bytes)")
            continue
        print(f"[gen ] {slug} ...", flush=True)
        try:
            images = await gen.generate_images(prompt=prompt, model="gpt-image-1", number_of_images=1)
            if images:
                with open(out, "wb") as f:
                    f.write(images[0])
                print(f"[ok  ] {slug} -> {out} ({out.stat().st_size} bytes)", flush=True)
            else:
                print(f"[fail] {slug}: no image returned", flush=True)
        except Exception as e:
            print(f"[fail] {slug}: {e}", flush=True)


if __name__ == "__main__":
    asyncio.run(main())
