from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
import json
import logging
import bcrypt
import jwt
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta

from seed_data import FORTS, QUIZ_QUESTIONS
from museum_data import ITEMS as MUSEUM_ITEMS, CATEGORIES as MUSEUM_CATEGORIES

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Bump this whenever seed content/structure changes to force a re-seed
SEED_VERSION = 5

# ----- Load cached AI translations (Hindi / Marathi) -----
TRANSLATIONS = {"forts": {}, "quizzes": {}}
_tx_path = ROOT_DIR / "content_translations.json"
if _tx_path.exists():
    try:
        TRANSLATIONS = json.loads(_tx_path.read_text(encoding="utf-8"))
    except Exception:
        TRANSLATIONS = {"forts": {}, "quizzes": {}}

SUPPORTED_LANGS = {"en", "hi", "mr"}
LANG_NAMES = {"hi": "Hindi (Devanagari script)", "mr": "Marathi (Devanagari script)", "en": "English"}

# ----- Fort media: gallery photos, coordinates, per-fort 3D models -----
def _load_json(name, default):
    p = ROOT_DIR / name
    if p.exists():
        try:
            return json.loads(p.read_text(encoding="utf-8"))
        except Exception:
            return default
    return default

FORT_IMAGES = _load_json("fort_images.json", {})
FORT_COORDS = _load_json("fort_coords.json", {})

# ----- Museum / Heritage Collection data -----
MUSEUM_IMAGES = _load_json("museum_images.json", {})
MUSEUM_TX = _load_json("museum_translations.json", {"items": {}, "categories": {}})
# Bump to force a re-seed of museum content (does not touch forts/quizzes).
MUSEUM_SEED_VERSION = 2
MUSEUM_CAT_SLUGS = {c["slug"] for c in MUSEUM_CATEGORIES}

# Supplied fort-specific 3D models.  Keep this mapping as the single source of
# truth so API clients and the Admin panel use stable, URL-safe asset paths.
MODEL_BY_SLUG = {
    "lohagad": "/models/forts/lohagad.glb",
    "murud-janjira": "/models/forts/murud-janjira.glb",
    "panhala": "/models/forts/panhala.glb",
    "pratapgad": "/models/forts/pratapgad.glb",
    "purandar": "/models/forts/purandar.glb",
    "raigad": "/models/forts/raigad.glb",
    "rajgad": "/models/forts/rajgad.glb",
    "shivneri": "/models/forts/shivneri.glb",
    "sindhudurg": "/models/forts/sindhudurg.glb",
    "torna": "/models/forts/torna.glb",
}

# ----- LLM (Ask the King) configuration -----
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')
LLM_PROVIDER = os.environ.get('LLM_PROVIDER', 'openai')
LLM_MODEL = os.environ.get('LLM_MODEL', 'gpt-5.4')

# ----- Admin auth configuration -----
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'KaalChakra@2025')
JWT_SECRET = os.environ.get('JWT_SECRET', 'kaalchakra-admin-secret-change-me')
JWT_ALGO = 'HS256'
JWT_EXPIRES_MINUTES = int(os.environ.get('JWT_EXPIRES_MINUTES', '1440'))
SLUG_RE = re.compile(r'^[a-z0-9]+(?:-[a-z0-9]+)*$')

security = HTTPBearer(auto_error=False)


def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode('utf-8')[:72], bcrypt.gensalt()).decode('utf-8')


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode('utf-8')[:72], hashed.encode('utf-8'))
    except Exception:
        return False


def create_admin_token(username: str) -> str:
    payload = {
        "sub": username,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=JWT_EXPIRES_MINUTES),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


async def require_admin(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> str:
    if credentials is None or not credentials.credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGO])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired, please sign in again")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    username = payload.get("sub")
    if not username:
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    return username

KING_SYSTEM_PROMPT = (
    "You are 'Raja', a warm, knowledgeable royal storyteller and guide for KaalChakra, an "
    "educational app about Chhatrapati Shivaji Maharaj and the forts of the Maratha Empire. "
    "Speak with dignity and gentle warmth, as a wise court historian would. "
    "Answer questions about Shivaji Maharaj, the Maratha Empire, its forts (Shivneri, Torna, "
    "Rajgad, Pratapgad, Sinhagad, Raigad and others), battles, people and culture. "
    "Keep answers concise (2-4 short paragraphs max), engaging and suitable for students. "
    "Stay historically careful: if a fact is disputed or you are unsure, say so honestly rather "
    "than inventing details. If a question is unrelated to Indian/Maratha history, gently steer "
    "the visitor back to the world of the forts and kings. Never fabricate dates or quotes."
)

app = FastAPI(title="KaalChakra API")
api_router = APIRouter(prefix="/api")


# ----------------------- Models -----------------------
class TimelineEvent(BaseModel):
    year: str
    title: str
    body: str


class Fort(BaseModel):
    model_config = ConfigDict(extra="ignore")

    slug: str
    name: str
    native_name: str = ""
    region: str = ""
    era: str = ""
    year_founded: Optional[int] = None
    hook: str = ""
    image_url: str = ""
    images: List[str] = Field(default_factory=list)
    now_image_url: str = ""
    then_image_url: str = ""
    model_url: str = ""
    lat: Optional[float] = None
    lng: Optional[float] = None
    quick_facts: List[str] = Field(default_factory=list)
    description: str = ""
    narration_text: str = ""
    timeline: List[TimelineEvent] = Field(default_factory=list)


class PublicQuizQuestion(BaseModel):
    id: str
    fort_slug: Optional[str] = None
    prompt: str
    options: List[str]


class QuizAnswer(BaseModel):
    question_id: str
    selected_index: int


class QuizSubmission(BaseModel):
    player_name: str
    fort_slug: Optional[str] = None
    lang: str = "en"
    answers: List[QuizAnswer]


class QuizResultDetail(BaseModel):
    question_id: str
    prompt: str
    options: List[str]
    selected_index: int
    correct_index: int
    is_correct: bool
    explanation: str


class QuizResult(BaseModel):
    attempt_id: str
    player_name: str
    fort_slug: Optional[str] = None
    score: int
    total: int
    percentage: int
    badge: str
    details: List[QuizResultDetail]


class LeaderboardEntry(BaseModel):
    player_name: str
    fort_slug: Optional[str] = None
    fort_name: str = "General"
    score: int
    total: int
    percentage: int
    badge: str
    created_at: datetime


class ChatRequest(BaseModel):
    session_id: str
    message: str
    fort_slug: Optional[str] = None
    lang: str = "en"


class ChatMessageOut(BaseModel):
    role: str
    content: str
    created_at: datetime


# ----------------------- Museum models -----------------------
class MuseumItem(BaseModel):
    model_config = ConfigDict(extra="ignore")

    slug: str
    category: str
    name: str
    native_name: str = ""
    era: str = ""
    hook: str = ""
    description: str = ""
    quick_facts: List[str] = Field(default_factory=list)
    image_url: str = ""
    images: List[str] = Field(default_factory=list)
    model_url: str = ""
    order: int = 0
    translations: Dict[str, dict] = Field(default_factory=dict)


class MuseumCategoryOut(BaseModel):
    slug: str
    name: str
    native_name: str = ""
    tagline: str = ""
    icon: str = ""
    count: int = 0
    cover_image: str = ""


class MuseumItemIn(BaseModel):
    slug: str
    category: str
    name: str
    native_name: str = ""
    era: str = ""
    hook: str = ""
    description: str = ""
    quick_facts: List[str] = Field(default_factory=list)
    image_url: str = ""
    images: List[str] = Field(default_factory=list)
    model_url: str = ""
    order: int = 0
    translations: Dict[str, dict] = Field(default_factory=dict)


# ----------------------- Admin models -----------------------
class AdminLogin(BaseModel):
    username: str
    password: str


class AdminToken(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str


class TimelineEventIn(BaseModel):
    year: str = ""
    title: str = ""
    body: str = ""


class FortIn(BaseModel):
    slug: str
    name: str
    native_name: str = ""
    region: str = ""
    era: str = ""
    year_founded: Optional[int] = None
    hook: str = ""
    image_url: str = ""
    images: List[str] = Field(default_factory=list)
    now_image_url: str = ""
    then_image_url: str = ""
    model_url: str = ""
    lat: Optional[float] = None
    lng: Optional[float] = None
    quick_facts: List[str] = Field(default_factory=list)
    description: str = ""
    narration_text: str = ""
    timeline: List[TimelineEventIn] = Field(default_factory=list)


class QuizIn(BaseModel):
    fort_slug: Optional[str] = None
    prompt: str
    options: List[str]
    correct_index: int
    explanation: str = ""


# ----------------------- Helpers -----------------------
def _badge_for(percentage: int) -> str:
    if percentage >= 90:
        return "Gold"
    if percentage >= 70:
        return "Silver"
    if percentage >= 50:
        return "Bronze"
    return "Keep Learning"


def _fort_name(slug: Optional[str]) -> str:
    if not slug:
        return "General"
    for f in FORTS:
        if f["slug"] == slug:
            return f["name"]
    return slug.title()


def _norm_lang(lang: Optional[str]) -> str:
    lang = (lang or "en").lower()
    return lang if lang in SUPPORTED_LANGS else "en"


def apply_fort_lang(doc: dict, lang: str) -> dict:
    """Merge Hindi/Marathi translation over the base fort fields."""
    if lang not in ("hi", "mr"):
        return doc
    tx = (doc.get("translations") or {}).get(lang)
    if not tx:
        return doc
    merged = dict(doc)
    for k in ["hook", "era", "region", "description", "narration_text", "quick_facts"]:
        if tx.get(k):
            merged[k] = tx[k]
    if tx.get("timeline"):
        base_tl = doc.get("timeline") or []
        new_tl = []
        for i, ev in enumerate(base_tl):
            t = tx["timeline"][i] if i < len(tx["timeline"]) else {}
            new_tl.append({
                "year": ev.get("year"),
                "title": t.get("title", ev.get("title")),
                "body": t.get("body", ev.get("body")),
            })
        merged["timeline"] = new_tl
    return merged


def apply_quiz_lang(q: dict, lang: str) -> dict:
    """Return a copy of a quiz doc with translated prompt/options/explanation."""
    out = dict(q)
    if lang in ("hi", "mr"):
        tx = (q.get("translations") or {}).get(lang)
        if tx:
            out["prompt"] = tx.get("prompt", q["prompt"])
            out["options"] = tx.get("options", q["options"])
            out["explanation"] = tx.get("explanation", q.get("explanation", ""))
    return out


def apply_museum_lang(doc: dict, lang: str) -> dict:
    """Merge Hindi/Marathi translation over a museum item's base fields."""
    if lang not in ("hi", "mr"):
        return doc
    tx = (doc.get("translations") or {}).get(lang)
    if not tx:
        return doc
    merged = dict(doc)
    for k in ["name", "native_name", "hook", "era", "description", "quick_facts"]:
        if tx.get(k):
            merged[k] = tx[k]
    return merged


def apply_museum_cat_lang(doc: dict, lang: str) -> dict:
    if lang not in ("hi", "mr"):
        return doc
    tx = (doc.get("translations") or {}).get(lang)
    if not tx:
        return doc
    merged = dict(doc)
    for k in ["name", "native_name", "tagline"]:
        if tx.get(k):
            merged[k] = tx[k]
    return merged


# In-memory cache of active LlmChat sessions
_chat_cache: Dict[str, object] = {}


# ----------------------- Seeding -----------------------
async def ensure_admin():
    """Create a default admin account (hashed) if none exists."""
    try:
        existing = await db.admins.find_one({"username": ADMIN_USERNAME})
        if not existing:
            await db.admins.insert_one({
                "id": str(uuid.uuid4()),
                "username": ADMIN_USERNAME,
                "password_hash": hash_password(ADMIN_PASSWORD),
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
            logger.info(f"Created default admin account '{ADMIN_USERNAME}'")
    except Exception:
        logger.exception("ensure_admin failed")


async def seed_database(force: bool = False):
    meta = await db.meta.find_one({"_id": "seed"})
    current = meta.get("version") if meta else None
    if force or current != SEED_VERSION:
        await db.forts.delete_many({})
        await db.quiz_questions.delete_many({})

        fort_docs = []
        for f in FORTS:
            fort = Fort(**f).model_dump()
            slug = f["slug"]
            fort["now_image_url"] = f.get("image_url", "")
            fort["then_image_url"] = f"/reconstructions/{slug}.jpg"
            fort["images"] = FORT_IMAGES.get(slug, [f.get("image_url", "")])
            fort["model_url"] = MODEL_BY_SLUG.get(slug, fort.get("model_url", ""))
            coords = FORT_COORDS.get(slug)
            if coords and len(coords) == 2:
                fort["lat"], fort["lng"] = coords[0], coords[1]
            fort["translations"] = TRANSLATIONS.get("forts", {}).get(slug, {})
            fort_docs.append(fort)
        if fort_docs:
            await db.forts.insert_many(fort_docs)

        quiz_docs = []
        for i, q in enumerate(QUIZ_QUESTIONS):
            quiz_docs.append({
                "id": f"q-{i}",
                "fort_slug": q["fort_slug"],
                "prompt": q["prompt"],
                "options": q["options"],
                "correct_index": q["correct_index"],
                "explanation": q["explanation"],
                "translations": TRANSLATIONS.get("quizzes", {}).get(f"q-{i}", {}),
            })
        if quiz_docs:
            await db.quiz_questions.insert_many(quiz_docs)

        await db.meta.update_one(
            {"_id": "seed"}, {"$set": {"version": SEED_VERSION}}, upsert=True
        )
        logger.info(f"Seeded {len(fort_docs)} forts, {len(quiz_docs)} quiz questions (v{SEED_VERSION})")

    # Model URLs are application assets, not editable historical content. Update
    # these known matches on every startup without deleting Admin-created data.
    for slug, model_url in MODEL_BY_SLUG.items():
        await db.forts.update_one({"slug": slug}, {"$set": {"model_url": model_url}})


async def seed_museum(force: bool = False):
    """Seed museum content; apply later seed versions without replacing admin edits."""
    meta = await db.meta.find_one({"_id": "museum_seed"})
    current = meta.get("version") if meta else None
    if not (force or current != MUSEUM_SEED_VERSION):
        return

    cat_docs = []
    for i, c in enumerate(MUSEUM_CATEGORIES):
        cat_docs.append({
            "slug": c["slug"],
            "name": c["name"],
            "native_name": c.get("native_name", ""),
            "tagline": c.get("tagline", ""),
            "icon": c.get("icon", ""),
            "order": i,
            "translations": (MUSEUM_TX.get("categories", {}) or {}).get(c["slug"], {}),
        })

    item_docs = []
    cat_counter: Dict[str, int] = {}
    for it in MUSEUM_ITEMS:
        slug = it["slug"]
        cat = it["category"]
        n = cat_counter.get(cat, 0)
        cat_counter[cat] = n + 1
        imgs = MUSEUM_IMAGES.get(slug, []) or []
        item_docs.append({
            "slug": slug,
            "category": cat,
            "name": it["name"],
            "native_name": it.get("native_name", ""),
            "era": it.get("era", ""),
            "hook": it.get("hook", ""),
            "description": it.get("description", ""),
            "quick_facts": it.get("quick_facts", []),
            "images": imgs,
            "image_url": imgs[0] if imgs else "",
            "model_url": it.get("model_url") or f"/models/museum/{slug}.glb",
            "order": n,
            "translations": (MUSEUM_TX.get("items", {}) or {}).get(slug, {}),
        })

    # First install starts clean. This upgrade only fills model URLs on existing
    # seed records, so edits and removals made through Admin remain intact.
    if current is None or force:
        await db.museum_items.delete_many({})
        await db.museum_categories.delete_many({})
        if cat_docs:
            await db.museum_categories.insert_many(cat_docs)
        if item_docs:
            await db.museum_items.insert_many(item_docs)
    else:
        for item in item_docs:
            if item["model_url"]:
                await db.museum_items.update_one(
                    {
                        "slug": item["slug"],
                        "$or": [
                            {"model_url": {"$exists": False}},
                            {"model_url": ""},
                            {"model_url": None},
                        ],
                    },
                    {"$set": {"model_url": item["model_url"]}},
                )

    await db.meta.update_one({"_id": "museum_seed"}, {"$set": {"version": MUSEUM_SEED_VERSION}}, upsert=True)
    logger.info(f"Seeded {len(item_docs)} museum items, {len(cat_docs)} categories (v{MUSEUM_SEED_VERSION})")


# ----------------------- Routes -----------------------
@api_router.get("/")
async def root():
    return {"message": "KaalChakra API is running"}


@api_router.get("/forts", response_model=List[Fort])
async def get_forts(lang: str = "en"):
    lang = _norm_lang(lang)
    forts = await db.forts.find({}, {"_id": 0}).to_list(100)
    order = {f["slug"]: i for i, f in enumerate(FORTS)}
    forts.sort(key=lambda x: order.get(x.get("slug"), 999))
    return [apply_fort_lang(f, lang) for f in forts]


@api_router.get("/forts/{slug}", response_model=Fort)
async def get_fort(slug: str, lang: str = "en"):
    lang = _norm_lang(lang)
    fort = await db.forts.find_one({"slug": slug}, {"_id": 0})
    if not fort:
        raise HTTPException(status_code=404, detail="Fort not found")
    return apply_fort_lang(fort, lang)


@api_router.get("/forts/{slug}/quiz", response_model=List[PublicQuizQuestion])
async def get_fort_quiz(slug: str, lang: str = "en"):
    lang = _norm_lang(lang)
    questions = await db.quiz_questions.find({"fort_slug": slug}, {"_id": 0}).to_list(100)
    out = []
    for q in questions:
        tq = apply_quiz_lang(q, lang)
        out.append({"id": tq["id"], "fort_slug": tq["fort_slug"], "prompt": tq["prompt"], "options": tq["options"]})
    return out


@api_router.get("/quiz/general", response_model=List[PublicQuizQuestion])
async def get_general_quiz(lang: str = "en"):
    lang = _norm_lang(lang)
    questions = await db.quiz_questions.find({}, {"_id": 0}).to_list(200)
    out = []
    for q in questions:
        tq = apply_quiz_lang(q, lang)
        out.append({"id": tq["id"], "fort_slug": tq["fort_slug"], "prompt": tq["prompt"], "options": tq["options"]})
    return out


@api_router.post("/quiz/submit", response_model=QuizResult)
async def submit_quiz(submission: QuizSubmission):
    if not submission.player_name.strip():
        raise HTTPException(status_code=400, detail="Player name is required")
    if not submission.answers:
        raise HTTPException(status_code=400, detail="No answers submitted")

    lang = _norm_lang(submission.lang)
    q_ids = [a.question_id for a in submission.answers]
    questions = await db.quiz_questions.find({"id": {"$in": q_ids}}, {"_id": 0}).to_list(200)
    q_map = {q["id"]: q for q in questions}

    details: List[QuizResultDetail] = []
    score = 0
    for ans in submission.answers:
        q = q_map.get(ans.question_id)
        if not q:
            continue
        tq = apply_quiz_lang(q, lang)
        is_correct = ans.selected_index == q["correct_index"]
        if is_correct:
            score += 1
        details.append(QuizResultDetail(
            question_id=q["id"],
            prompt=tq["prompt"],
            options=tq["options"],
            selected_index=ans.selected_index,
            correct_index=q["correct_index"],
            is_correct=is_correct,
            explanation=tq["explanation"],
        ))

    total = len(details)
    percentage = round((score / total) * 100) if total else 0
    badge = _badge_for(percentage)
    attempt_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc)

    attempt_doc = {
        "id": attempt_id,
        "player_name": submission.player_name.strip()[:40],
        "fort_slug": submission.fort_slug,
        "fort_name": _fort_name(submission.fort_slug),
        "score": score,
        "total": total,
        "percentage": percentage,
        "badge": badge,
        "created_at": created_at.isoformat(),
    }
    await db.quiz_attempts.insert_one(attempt_doc)

    return QuizResult(
        attempt_id=attempt_id,
        player_name=attempt_doc["player_name"],
        fort_slug=submission.fort_slug,
        score=score,
        total=total,
        percentage=percentage,
        badge=badge,
        details=details,
    )


@api_router.get("/leaderboard", response_model=List[LeaderboardEntry])
async def get_leaderboard(scope: str = "global", fort_slug: Optional[str] = None, limit: int = 20):
    query = {}
    if scope == "fort" and fort_slug:
        query["fort_slug"] = fort_slug
    attempts = await db.quiz_attempts.find(query, {"_id": 0}).to_list(1000)

    def _key(a):
        return (-a.get("percentage", 0), -a.get("score", 0), a.get("created_at", ""))

    attempts.sort(key=_key)
    top = attempts[:limit]

    result = []
    for a in top:
        created = a.get("created_at")
        if isinstance(created, str):
            created = datetime.fromisoformat(created)
        result.append(LeaderboardEntry(
            player_name=a.get("player_name", "Anonymous"),
            fort_slug=a.get("fort_slug"),
            fort_name=a.get("fort_name") or _fort_name(a.get("fort_slug")),
            score=a.get("score", 0),
            total=a.get("total", 0),
            percentage=a.get("percentage", 0),
            badge=a.get("badge", "Keep Learning"),
            created_at=created,
        ))
    return result


@api_router.get("/museum/categories", response_model=List[MuseumCategoryOut])
async def get_museum_categories(lang: str = "en"):
    lang = _norm_lang(lang)
    cats = await db.museum_categories.find({}, {"_id": 0}).to_list(50)
    cats.sort(key=lambda x: x.get("order", 999))
    out = []
    for c in cats:
        cc = apply_museum_cat_lang(c, lang)
        items = await db.museum_items.find({"category": c["slug"]}, {"_id": 0, "image_url": 1, "order": 1}).to_list(200)
        items.sort(key=lambda x: x.get("order", 0))
        cover = next((i.get("image_url") for i in items if i.get("image_url")), "")
        out.append(MuseumCategoryOut(
            slug=c["slug"],
            name=cc.get("name", c["slug"]),
            native_name=cc.get("native_name", c.get("native_name", "")),
            tagline=cc.get("tagline", ""),
            icon=c.get("icon", ""),
            count=len(items),
            cover_image=cover,
        ))
    return out


@api_router.get("/museum/items", response_model=List[MuseumItem])
async def get_museum_items(category: Optional[str] = None, lang: str = "en"):
    lang = _norm_lang(lang)
    query = {"category": category} if category else {}
    items = await db.museum_items.find(query, {"_id": 0}).to_list(500)
    items.sort(key=lambda x: (x.get("category", ""), x.get("order", 0)))
    return [apply_museum_lang(it, lang) for it in items]


@api_router.get("/museum/items/{slug}", response_model=MuseumItem)
async def get_museum_item(slug: str, lang: str = "en"):
    lang = _norm_lang(lang)
    item = await db.museum_items.find_one({"slug": slug}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Museum item not found")
    return apply_museum_lang(item, lang)


@api_router.get("/chat/{session_id}/history", response_model=List[ChatMessageOut])
async def get_chat_history(session_id: str):
    msgs = await db.chat_messages.find({"session_id": session_id}, {"_id": 0}).to_list(500)
    msgs.sort(key=lambda m: m.get("created_at", ""))
    out = []
    for m in msgs:
        created = m.get("created_at")
        if isinstance(created, str):
            created = datetime.fromisoformat(created)
        out.append(ChatMessageOut(role=m["role"], content=m["content"], created_at=created))
    return out


async def _get_or_create_chat(session_id: str, fort_slug: Optional[str], lang: str):
    from emergentintegrations.llm.chat import LlmChat

    cache_key = f"{session_id}:{lang}"
    if cache_key in _chat_cache:
        return _chat_cache[cache_key]

    system_message = KING_SYSTEM_PROMPT
    if fort_slug:
        fort = next((f for f in FORTS if f["slug"] == fort_slug), None)
        if fort:
            system_message += (
                f"\n\nThe visitor is currently exploring the fort '{fort['name']}' "
                f"({fort.get('native_name','')}). Context: {fort.get('description','')}"
            )
    if lang in ("hi", "mr"):
        system_message += (
            f"\n\nIMPORTANT: Reply ONLY in {LANG_NAMES[lang]}. Use natural, respectful language."
        )

    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=system_message,
    ).with_model(LLM_PROVIDER, LLM_MODEL)

    _chat_cache[cache_key] = chat
    return chat


@api_router.post("/chat/stream")
async def chat_stream(req: ChatRequest):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="LLM key not configured")

    from emergentintegrations.llm.chat import UserMessage, TextDelta, StreamDone

    lang = _norm_lang(req.lang)
    now = datetime.now(timezone.utc)
    await db.chat_messages.insert_one({
        "id": str(uuid.uuid4()),
        "session_id": req.session_id,
        "role": "user",
        "content": req.message.strip(),
        "created_at": now.isoformat(),
    })

    async def event_generator():
        collected = []
        try:
            chat = await _get_or_create_chat(req.session_id, req.fort_slug, lang)
            async for event in chat.stream_message(UserMessage(text=req.message.strip())):
                if isinstance(event, TextDelta):
                    collected.append(event.content)
                    yield f"data: {json.dumps({'delta': event.content})}\n\n"
                elif isinstance(event, StreamDone):
                    break
            full = "".join(collected).strip()
            if full:
                await db.chat_messages.insert_one({
                    "id": str(uuid.uuid4()),
                    "session_id": req.session_id,
                    "role": "assistant",
                    "content": full,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                })
            yield f"data: {json.dumps({'done': True})}\n\n"
        except Exception as e:
            logger.exception("Chat streaming error")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ----------------------- Admin routes -----------------------
# Public admin router (login only — no auth required)
admin_public = APIRouter(prefix="/api/admin")
# Protected admin router (all routes require a valid admin JWT)
admin_router = APIRouter(prefix="/api/admin", dependencies=[Depends(require_admin)])


@admin_public.post("/login", response_model=AdminToken)
async def admin_login(body: AdminLogin):
    user = await db.admins.find_one({"username": body.username.strip()})
    if not user or not verify_password(body.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = create_admin_token(user["username"])
    return AdminToken(access_token=token, username=user["username"])


@admin_router.get("/me")
async def admin_me(username: str = Depends(require_admin)):
    return {"username": username}


# ---- Forts management ----
@admin_router.get("/forts")
async def admin_list_forts():
    forts = await db.forts.find({}, {"_id": 0}).to_list(500)
    order = {f["slug"]: i for i, f in enumerate(FORTS)}
    forts.sort(key=lambda x: order.get(x.get("slug"), 999))
    return forts


@admin_router.post("/forts")
async def admin_create_fort(body: FortIn):
    slug = body.slug.strip().lower()
    if not SLUG_RE.match(slug):
        raise HTTPException(status_code=400, detail="Slug must be lowercase letters, numbers and hyphens only")
    if await db.forts.find_one({"slug": slug}):
        raise HTTPException(status_code=409, detail="A fort with this slug already exists")
    doc = body.model_dump()
    doc["slug"] = slug
    await db.forts.insert_one(dict(doc))
    return await db.forts.find_one({"slug": slug}, {"_id": 0})


@admin_router.put("/forts/{slug}")
async def admin_update_fort(slug: str, body: FortIn):
    existing = await db.forts.find_one({"slug": slug})
    if not existing:
        raise HTTPException(status_code=404, detail="Fort not found")
    doc = body.model_dump()
    doc["slug"] = slug  # slug is immutable via path
    await db.forts.update_one({"slug": slug}, {"$set": doc})
    return await db.forts.find_one({"slug": slug}, {"_id": 0})


@admin_router.delete("/forts/{slug}")
async def admin_delete_fort(slug: str):
    res = await db.forts.delete_one({"slug": slug})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Fort not found")
    # Cascade: remove quiz questions that belong only to this fort
    q_res = await db.quiz_questions.delete_many({"fort_slug": slug})
    return {"deleted": slug, "quiz_questions_removed": q_res.deleted_count}


# ---- Quiz management ----
@admin_router.get("/quiz")
async def admin_list_quiz():
    return await db.quiz_questions.find({}, {"_id": 0}).to_list(500)


def _validate_quiz(body: QuizIn):
    if not body.prompt.strip():
        raise HTTPException(status_code=400, detail="Question text is required")
    opts = [o for o in body.options if o is not None]
    if len([o for o in opts if str(o).strip()]) < 2:
        raise HTTPException(status_code=400, detail="Provide at least two answer options")
    if body.correct_index < 0 or body.correct_index >= len(body.options):
        raise HTTPException(status_code=400, detail="Correct answer index is out of range")


@admin_router.post("/quiz")
async def admin_create_quiz(body: QuizIn):
    _validate_quiz(body)
    qid = f"q-{uuid.uuid4().hex[:10]}"
    doc = {
        "id": qid,
        "fort_slug": body.fort_slug or None,
        "prompt": body.prompt.strip(),
        "options": body.options,
        "correct_index": body.correct_index,
        "explanation": body.explanation.strip(),
        "translations": {},
    }
    await db.quiz_questions.insert_one(dict(doc))
    return {k: v for k, v in doc.items() if k != "_id"}


@admin_router.put("/quiz/{qid}")
async def admin_update_quiz(qid: str, body: QuizIn):
    existing = await db.quiz_questions.find_one({"id": qid})
    if not existing:
        raise HTTPException(status_code=404, detail="Quiz question not found")
    _validate_quiz(body)
    update = {
        "fort_slug": body.fort_slug or None,
        "prompt": body.prompt.strip(),
        "options": body.options,
        "correct_index": body.correct_index,
        "explanation": body.explanation.strip(),
    }
    await db.quiz_questions.update_one({"id": qid}, {"$set": update})
    return await db.quiz_questions.find_one({"id": qid}, {"_id": 0})


@admin_router.delete("/quiz/{qid}")
async def admin_delete_quiz(qid: str):
    res = await db.quiz_questions.delete_one({"id": qid})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Quiz question not found")
    return {"deleted": qid}


# ---- Museum management ----
@admin_router.get("/museum")
async def admin_list_museum():
    items = await db.museum_items.find({}, {"_id": 0}).to_list(500)
    items.sort(key=lambda x: (x.get("category", ""), x.get("order", 0)))
    return items


def _validate_museum(body: MuseumItemIn):
    if not body.name.strip():
        raise HTTPException(status_code=400, detail="Name is required")
    if body.category not in MUSEUM_CAT_SLUGS:
        raise HTTPException(status_code=400, detail=f"Category must be one of: {', '.join(sorted(MUSEUM_CAT_SLUGS))}")


@admin_router.post("/museum")
async def admin_create_museum(body: MuseumItemIn):
    slug = body.slug.strip().lower()
    if not SLUG_RE.match(slug):
        raise HTTPException(status_code=400, detail="Slug must be lowercase letters, numbers and hyphens only")
    _validate_museum(body)
    if await db.museum_items.find_one({"slug": slug}):
        raise HTTPException(status_code=409, detail="An item with this slug already exists")
    doc = body.model_dump()
    doc["slug"] = slug
    if not doc.get("image_url") and doc.get("images"):
        doc["image_url"] = doc["images"][0]
    doc["translations"] = {lang: tx for lang, tx in doc.get("translations", {}).items() if lang in ("hi", "mr")}
    await db.museum_items.insert_one(dict(doc))
    return await db.museum_items.find_one({"slug": slug}, {"_id": 0})


@admin_router.put("/museum/{slug}")
async def admin_update_museum(slug: str, body: MuseumItemIn):
    existing = await db.museum_items.find_one({"slug": slug})
    if not existing:
        raise HTTPException(status_code=404, detail="Museum item not found")
    _validate_museum(body)
    doc = body.model_dump()
    doc["slug"] = slug
    if not doc.get("image_url") and doc.get("images"):
        doc["image_url"] = doc["images"][0]
    supplied = {lang: tx for lang, tx in doc.get("translations", {}).items() if lang in ("hi", "mr")}
    previous = existing.get("translations", {})
    doc["translations"] = {lang: {**previous.get(lang, {}), **tx} for lang, tx in supplied.items()}
    for lang in ("hi", "mr"):
        if lang not in doc["translations"] and lang in previous:
            doc["translations"][lang] = previous[lang]
    await db.museum_items.update_one({"slug": slug}, {"$set": doc})
    return await db.museum_items.find_one({"slug": slug}, {"_id": 0})


@admin_router.delete("/museum/{slug}")
async def admin_delete_museum(slug: str):
    res = await db.museum_items.delete_one({"slug": slug})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Museum item not found")
    return {"deleted": slug}


# ---- Leaderboard management ----
@admin_router.get("/leaderboard")
async def admin_list_leaderboard():
    attempts = await db.quiz_attempts.find({}, {"_id": 0}).to_list(2000)
    attempts.sort(key=lambda a: a.get("created_at", ""), reverse=True)
    return attempts


@admin_router.delete("/leaderboard")
async def admin_clear_leaderboard():
    res = await db.quiz_attempts.delete_many({})
    return {"deleted": res.deleted_count}


@admin_router.delete("/leaderboard/{attempt_id}")
async def admin_delete_attempt(attempt_id: str):
    res = await db.quiz_attempts.delete_one({"id": attempt_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Attempt not found")
    return {"deleted": attempt_id}


# ---- Analytics ----
@admin_router.get("/analytics")
async def admin_analytics():
    forts = await db.forts.find({}, {"_id": 0}).to_list(500)
    quizzes_count = await db.quiz_questions.count_documents({})
    attempts = await db.quiz_attempts.find({}, {"_id": 0}).to_list(5000)
    sessions = await db.chat_messages.distinct("session_id")
    chat_messages_count = await db.chat_messages.count_documents({})
    museum_count = await db.museum_items.count_documents({})

    forts_by_region: Dict[str, int] = {}
    for f in forts:
        r = (f.get("region") or "").split(",")[0].strip() or "Unknown"
        forts_by_region[r] = forts_by_region.get(r, 0) + 1

    badge_dist: Dict[str, int] = {}
    attempts_per_fort: Dict[str, int] = {}
    total_pct = 0
    for a in attempts:
        b = a.get("badge", "Keep Learning")
        badge_dist[b] = badge_dist.get(b, 0) + 1
        total_pct += a.get("percentage", 0)
        fn = a.get("fort_name") or "General"
        attempts_per_fort[fn] = attempts_per_fort.get(fn, 0) + 1

    avg_pct = round(total_pct / len(attempts)) if attempts else 0

    def _as_list(d):
        return [{"label": k, "value": v} for k, v in sorted(d.items(), key=lambda x: -x[1])]

    return {
        "counts": {
            "forts": len(forts),
            "quizzes": quizzes_count,
            "attempts": len(attempts),
            "chat_sessions": len(sessions),
            "chat_messages": chat_messages_count,
            "museum_items": museum_count,
        },
        "avg_percentage": avg_pct,
        "forts_by_region": _as_list(forts_by_region),
        "badge_distribution": _as_list(badge_dist),
        "attempts_per_fort": _as_list(attempts_per_fort),
    }


app.include_router(api_router)
app.include_router(admin_public)
app.include_router(admin_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup_seed():
    try:
        await seed_database()
        await seed_museum()
        await ensure_admin()
    except Exception:
        logger.exception("Seeding failed")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
