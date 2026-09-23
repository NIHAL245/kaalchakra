"""
One-off: translate the English UI strings into Hindi & Marathi via the Emergent key
and write /app/frontend/src/i18n/ui.json  ({ en, hi, mr }).

Run:  cd /app/backend && python generate_ui_translations.py
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

API_KEY = os.environ.get("EMERGENT_LLM_KEY", "")
OUT = Path("/app/frontend/src/i18n/ui.json")
OUT.parent.mkdir(parents=True, exist_ok=True)

PROVIDER, MODEL = "openai", "gpt-5.4"

EN = {
    "app_tagline": "Maratha Heritage in AR",
    "retry": "Try again",
    "lang_label": "Language",

    "nav_home": "Home",
    "nav_explore": "Explore",
    "nav_quiz": "Quiz",
    "nav_leaderboard": "Leaderboard",
    "nav_ask": "Ask the King",

    "home_badge": "WebAR \u00b7 no app install required",
    "home_title_pre": "Journey through the forts of",
    "home_title_highlight": "Chhatrapati Shivaji Maharaj",
    "home_subtitle": "KaalChakra brings Maratha history to life. Summon 3D forts in augmented reality, hear their stories, explore their timelines, and test your knowledge \u2014 all from your browser.",
    "home_start": "Start exploring",
    "home_ask": "Ask the King",
    "home_features_title": "A living history lesson",
    "home_features_subtitle": "Five ways KaalChakra makes the past unforgettable.",
    "feat_ar_title": "Markerless AR",
    "feat_ar_body": "Place a 3D fort right in your room \u2014 no printed cards needed.",
    "feat_narr_title": "Narrated stories",
    "feat_narr_body": "Listen to each fort's tale with built-in narration and captions.",
    "feat_timeline_title": "Interactive timeline",
    "feat_timeline_body": "Walk through the key years, battles and turning points.",
    "feat_quiz_title": "Quizzes & badges",
    "feat_quiz_body": "Test your knowledge and climb the leaderboard.",
    "feat_ask_title": "Ask the King",
    "feat_ask_body": "Chat with an AI court historian about Shivaji and the forts.",
    "home_featured_title": "Featured forts",
    "home_featured_subtitle": "Begin your journey with these landmarks.",
    "home_view_all": "View all",
    "home_how_title": "How it works",
    "step1_title": "Choose a fort",
    "step1_body": "Browse iconic Maratha forts from Shivneri to Raigad.",
    "step2_title": "View in AR & listen",
    "step2_body": "Rotate the 3D model, place it in AR, and hear its story.",
    "step3_title": "Test & compete",
    "step3_body": "Take the quiz, earn a badge, and top the leaderboard.",

    "explore_title": "Explore the forts",
    "explore_subtitle": "Tap any fort to view it in 3D, in AR, and hear its story.",
    "explore_error": "We couldn't load the forts.",
    "explore_empty": "No forts available yet. Check back soon.",
    "card_explore": "Explore",

    "fort_all_forts": "All forts",
    "fort_play": "Play narration",
    "fort_pause": "Pause",
    "fort_resume": "Resume",
    "fort_narrating": "Narrating",
    "fort_narr_unsupported": "Narration isn't supported in this browser \u2014 you can still read the story below.",
    "fort_about": "About",
    "fort_timeline": "Timeline",
    "fort_thennow": "Then vs Now",
    "fort_quick_facts": "Quick facts",
    "fort_model_placeholder": "Placeholder 3D model \u2014 real fort scans (.glb) drop in here.",
    "fort_take_quiz": "Take the quiz",
    "fort_ask_about": "Ask about this fort",
    "fort_drag_hint": "3D \u00b7 drag to rotate",
    "fort_view_ar": "View in AR",
    "fort_not_found": "This fort could not be found.",
    "fort_back": "Back to forts",
    "thennow_then": "Then",
    "thennow_now": "Now",
    "thennow_hint": "Drag the handle to compare",
    "thennow_then_label": "Reconstruction \u00b7 in its prime",
    "thennow_now_label": "Present day",
    "thennow_ai_note": "The \u201cThen\u201d image is an AI-generated reconstruction, shown for illustration.",

    "quiz_title_general": "Maratha history quiz",
    "quiz_title_fort": "{fort} quiz",
    "quiz_preparing": "Preparing your questions\u2026",
    "quiz_count": "{count} questions \u00b7 answer, learn, and climb the leaderboard.",
    "quiz_playing_as": "Playing as",
    "quiz_start": "Start quiz",
    "quiz_back_fort": "Back to fort",
    "quiz_qprogress": "Question {current} of {total}",
    "quiz_answered": "{count} answered",
    "quiz_next": "Next",
    "quiz_finish": "Finish",
    "quiz_submitting": "Submitting\u2026",
    "quiz_your_badge": "Your badge",
    "quiz_view_leaderboard": "View leaderboard",
    "quiz_try_again": "Try again",
    "quiz_review_title": "Review your answers",
    "quiz_correct_answer": "Correct answer:",
    "quiz_your_answer": "Your answer:",
    "quiz_submit_error": "Could not submit quiz",
    "quiz_submit_error_desc": "Please try again.",

    "lb_title": "Leaderboard",
    "lb_subtitle": "Top history champions across all quizzes.",
    "lb_rank": "Rank",
    "lb_player": "Player",
    "lb_quiz": "Quiz",
    "lb_score": "Score",
    "lb_badge": "Badge",
    "lb_empty_title": "No champions yet",
    "lb_empty_body": "Be the first to take a quiz and claim the top spot.",
    "lb_take_quiz": "Take a quiz",

    "ask_title": "Ask the King",
    "ask_subtitle": "Your court historian on Shivaji Maharaj & the Maratha forts",
    "ask_focused": "focused on {fort}",
    "ask_namaskar": "Namaskar! Ask me anything.",
    "ask_empty_body": "From the forts of the Sahyadri to the courts of Raigad \u2014 I am here to share the story.",
    "ask_qp1": "Who was Chhatrapati Shivaji Maharaj?",
    "ask_qp2": "Tell me about the Battle of Pratapgad.",
    "ask_qp3": "Why is Sinhagad famous?",
    "ask_qp4": "What happened at Raigad in 1674?",
    "ask_placeholder": "Ask about a fort, a battle, or the King\u2026",
    "ask_disclaimer": "Responses are AI-generated for learning \u2014 please verify important facts with trusted sources.",
    "ask_thinking": "The King is thinking\u2026",
    "ask_error_title": "The King is resting",
    "ask_error_desc": "Please try again in a moment.",

    "name_title": "What shall we call you?",
    "name_desc": "Your name will appear on the leaderboard as you conquer quizzes.",
    "name_label": "Your name",
    "name_placeholder": "e.g. Tanaji",
    "name_error": "Please enter at least 2 characters.",
    "name_continue": "Continue",

    "badge_Gold": "Gold",
    "badge_Silver": "Silver",
    "badge_Bronze": "Bronze",
    "badge_KeepLearning": "Keep Learning",
    "general": "General",
}


def strip_json(text):
    text = text.strip()
    text = re.sub(r"^```(?:json)?", "", text).strip()
    text = re.sub(r"```$", "", text).strip()
    s, e = text.find("{"), text.rfind("}")
    return text[s:e + 1] if s != -1 and e != -1 else text


async def translate(lang_code, lang_name):
    system = (
        f"You are an expert UI localizer translating a history education app into {lang_name}. "
        "You will receive a JSON object of key->English string. Translate ONLY the string values "
        f"into natural, concise {lang_name} suitable for buttons and labels. Rules: keep the JSON "
        "keys identical; keep any placeholder tokens in curly braces EXACTLY as-is (e.g. {fort}, "
        "{count}, {current}, {total}); keep the characters \u00b7 \u2014 \u2026 and quotation marks; "
        "keep the app name 'KaalChakra' and proper nouns recognizable. Return ONLY minified JSON."
    )
    chat = LlmChat(api_key=API_KEY, session_id=f"ui-{lang_code}", system_message=system).with_model(PROVIDER, MODEL)
    resp = await chat.send_message(UserMessage(text=json.dumps(EN, ensure_ascii=False)))
    raw = resp if isinstance(resp, str) else str(resp)
    data = json.loads(strip_json(raw))
    # ensure all keys present; fallback to EN
    for k in EN:
        data.setdefault(k, EN[k])
    return data


async def main():
    if not API_KEY:
        raise SystemExit("EMERGENT_LLM_KEY not set")
    result = {"en": EN}
    for code, name in [("hi", "Hindi (Devanagari)"), ("mr", "Marathi (Devanagari)")]:
        print(f"[gen] UI {code} ...", flush=True)
        result[code] = await translate(code, name)
        print(f"[ok ] UI {code} ({len(result[code])} keys)", flush=True)
    OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print("DONE ->", OUT)


if __name__ == "__main__":
    asyncio.run(main())
