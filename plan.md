# KaalChakra — Implementation Plan (Updated: V1 MVP + V2 Batch #1 + Batch #2 Delivered + V2 Batch #3 Planned)

## 1) Objectives
- ✅ Deliver a mobile-first WebAR learning MVP for Maratha Empire forts with **markerless AR via `<model-viewer>`**, narration, and timelines.
- ✅ Add **quiz + leaderboard** loop to reinforce learning.
- ✅ Add **“Ask the King”** conversational chatbot using **emergentintegrations + SSE streaming**.
- ✅ Deliver V2 batch #1:
  - ✅ **Then vs Now** image comparison slider
  - ✅ **Multilingual (EN/HI/MR)** for UI + fort content + quizzes + chatbot language + narration language
- ✅ Deliver V2 batch #2:
  - ✅ Clickable Home feature cards
  - ✅ Swipeable per-fort photo galleries (+ Wikimedia credit)
  - ✅ Interactive Sahyadri fort locations map
  - ✅ Replace placeholder astronaut models with sourced **representative CC0 fort/castle `.glb` models**

**New objectives (V2 Batch #3 — requested now):**
- ⏳ **Map Detail Cards** on Explore page Leaflet markers: marker click opens a mini popup card with fort photo + title + short description + “View Fort” CTA.
- ⏳ **Admin Panel** (hidden `/admin`) with **JWT username+password auth** and a full management suite:
  - Forts CRUD
  - Quiz questions CRUD
  - Leaderboard view + per-row delete + clear-all
  - Basic analytics overview

**Current status:**
- **V1 MVP:** ✅ COMPLETE and fully tested.
- **V2 Batch #1:** ✅ COMPLETE and fully tested.
- **V2 Batch #2:** ✅ COMPLETE and fully tested.
- **V2 Batch #3:** ⏳ PLANNED (this update).

---

## 2) Implementation Steps (Phased)

### Phase 1 — Core Integration POC (LLM + SSE)
**Status: ✅ COMPLETED**

**User stories**
1. ✅ As a user, I want chatbot answers to stream word-by-word so the app feels responsive.
2. ✅ As a user, I want my chat session to remember context across multiple turns.
3. ✅ As a developer, I want a minimal script proving the LLM call works before UI work.
4. ✅ As a developer, I want SSE to bypass proxy buffering so streaming is real-time.
5. ✅ As a user, I want errors (rate limit/model unavailable) to show a clear retry message.

**What was implemented / verified**
- ✅ `EMERGENT_LLM_KEY` configured in `/app/backend/.env`.
- ✅ FastAPI SSE endpoint implemented and verified with `curl -N`:
  - `POST /api/chat/stream` streams `data: {"delta": ...}` chunks and ends with `data: {"done": true}`.
  - Headers include `X-Accel-Buffering: no` to prevent proxy buffering.
- ✅ Multi-turn conversation works per `session_id`.
- ✅ Chat history persisted in MongoDB and retrievable.

---

### Phase 2 — V1 App Development (Backend + Frontend MVP)

#### 2A) Backend (FastAPI + MongoDB)
**Status: ✅ COMPLETED**

**User stories**
1. ✅ As a user, I want to fetch a list of forts to explore quickly.
2. ✅ As a user, I want a fort detail API that returns model, narration text, and timeline.
3. ✅ As a user, I want to submit a quiz and instantly see my score.
4. ✅ As a user, I want to see a leaderboard of top scores.
5. ✅ As a user, I want chat history to persist for my session.

**What was implemented**
- ✅ Seed content on startup:
  - 6 forts: **Shivneri, Torna, Rajgad, Pratapgad, Sinhagad, Raigad**
  - 19 quiz questions (per-fort + general)
- ✅ Implemented endpoints:
  - `GET /api/forts`
  - `GET /api/forts/{slug}`
  - `GET /api/forts/{slug}/quiz` *(does not expose correct answers)*
  - `GET /api/quiz/general` *(does not expose correct answers)*
  - `POST /api/quiz/submit` (server-scored; returns score + badge + detailed review)
  - `GET /api/leaderboard?scope=global|fort&fort_slug=`
  - `POST /api/chat/stream` (SSE streaming)
  - `GET /api/chat/{session_id}/history`

#### 2B) Frontend (React + Tailwind + shadcn)
**Status: ✅ COMPLETED**

**User stories**
1. ✅ As a user, I want a beautiful home screen that clearly explains what to do next.
2. ✅ As a user, I want to browse forts in a gallery and open a fort in one tap.
3. ✅ As a user, I want to view the fort 3D model, then tap “View in AR” on my phone.
4. ✅ As a user, I want to play/pause narration and read captions while viewing the fort.
5. ✅ As a user, I want to take quizzes and see my name on the leaderboard.

**What was implemented**
1. ✅ Design system applied:
   - Heritage tokens (parchment background; saffron primary; gold accent; peacock-teal)
   - Fonts: **Crimson Text + Figtree** (+ Azeret Mono optional)
   - Subtle grain overlay; no centered app container
2. ✅ App shell + routing:
   - Routes: `/`, `/explore`, `/fort/:slug`, `/quiz`, `/quiz/:slug`, `/leaderboard`, `/ask`
   - Sticky header + **desktop top nav**
   - **Mobile bottom nav** (5 items)
   - Light/dark toggle via `next-themes`
   - Name entry dialog (localStorage identity)
3. ✅ Fort Detail / AR Experience:
   - Markerless AR via `<model-viewer>`
   - `.glb` loaded via `model_url`
   - Narration: Web Speech API with play/pause/resume/stop + captions
   - Timeline: vertical heritage timeline

---

### Phase 3 — Hardening + UX Polish
**Status: ✅ COMPLETED**

**What was implemented / verified**
- ✅ Model loading states and error retry in 3D stage.
- ✅ AR fallback messaging when AR cannot activate.
- ✅ Session persistence (player name + chat session).
- ✅ Verified responsive: dark mode + **no horizontal overflow** at 390px.

---

## V2 Delivered (Batch #1 — COMPLETE)
**Status: ✅ COMPLETED and tested**

### 1) Then vs Now (Fort comparison slider)
- ✅ AI reconstruction images stored in `/app/frontend/public/reconstructions/{slug}.jpg`.
- ✅ `BeforeAfterSlider` component.
- ✅ Fort Detail “Then vs Now” tab + disclaimer.

### 2) Multilingual (English / Hindi / Marathi)
- ✅ Cached fort + quiz translations in `/app/backend/content_translations.json`.
- ✅ UI i18n strings in `/app/frontend/src/i18n/ui.json`.
- ✅ Backend supports `lang` across forts/quizzes/chat.
- ✅ Multilingual narration voice selection.

### 3) Seed Versioning / Re-seed
- ✅ `SEED_VERSION` now **5**.

---

## V2 Delivered (Batch #2 — COMPLETE)
**Status: ✅ COMPLETED and tested**

### 1) Clickable Home Feature Cards
- ✅ Home feature cards route correctly.

### 2) Real Fort Photographs + Swipeable Galleries
- ✅ Local Wikimedia images under `/app/frontend/public/forts/`.
- ✅ `FortGallery` (Embla) + generic attribution.

### 3) Interactive Sahyadri Fort Locations Map
- ✅ `FortMap` (Leaflet + OSM) on Explore page.
- ✅ Fort coordinates exposed via backend.

### 4) Representative 3D Fort Models
- ✅ Models in `/app/frontend/public/models/`.
- ✅ `MODEL_BY_SLUG` mapping in `/app/backend/server.py`.

---

## V2 Batch #3 (Delivered) — Map Detail Cards + Admin Panel
**Status: ✅ COMPLETED and tested (Backend 56/57, Frontend 100%)**

### Phase 4 — Map Detail Cards (Explore Leaflet popup)
**Goal:** Replace marker direct navigation with a shadcn-card-style Leaflet popup mini card.

**User stories**
1. As a user, I want to tap a fort marker and see a quick preview (photo + summary) before opening the fort.
2. As a user, I want a clear “View Fort” button to open the full fort experience.

**Implementation**
- Frontend: `/app/frontend/src/components/FortMap.jsx`
  - Change marker click behavior to open a Leaflet popup instead of immediate navigation.
  - Popup content:
    - fort photo (`image_url`)
    - fort name
    - short description (`hook`, line-clamp)
    - optional meta row (region/era)
    - CTA: **View Fort** button navigates to `/fort/:slug` and closes popup.
  - Add `data-testid`:
    - `explore-map-fort-popup`
    - `explore-map-fort-popup-title`
    - `explore-map-fort-popup-view-fort-button`
- CSS overrides in `/app/frontend/src/index.css`:
  - Make `.leaflet-popup-content-wrapper` transparent/no padding.
  - Keep popup close button readable in light/dark.
  - Ensure popup tip background is transparent so the card shape reads cleanly.

**Acceptance criteria**
- Marker click opens popup card.
- “View Fort” navigates correctly.
- Dark mode works via tokens (no custom palette).
- No regression to map render/zoom.

---

### Phase 5 — Admin Panel (JWT username+password; forts/quizzes/leaderboard/analytics)
**Goal:** Add a hidden admin dashboard at `/admin` (not in public nav) with secure login and CRUD management.

#### 5A) Backend — Admin auth + admin APIs (extend `server.py` without refactor)
**Key constraints**
- Do **not** refactor existing working routes.
- Do **not** bump `SEED_VERSION` for admin changes; edits must persist.

**Environment variables (new)**
- `ADMIN_USERNAME` (default: `admin`)
- `ADMIN_PASSWORD` (default: `KaalChakra@2025`) — stored hashed in DB
- `JWT_SECRET` (fallback allowed if missing)
- Optional: `JWT_EXPIRES_MINUTES` (default e.g. 1440)

**Database changes**
- New collection: `admins` (single admin account for v1)
  - `{ username, password_hash, created_at }`

**Seeding behavior**
- On startup, ensure an admin user exists:
  - If none exists, create from env values.
  - Hash password using bcrypt/passlib.

**Auth endpoints**
- `POST /api/admin/login` → returns JWT
- `GET /api/admin/me` → validate token, return username
- Add `require_admin` dependency using HTTPBearer + JWT validation

**Admin CRUD endpoints**
- Forts:
  - `GET /api/admin/forts`
  - `POST /api/admin/forts`
  - `PUT /api/admin/forts/{slug}`
  - `DELETE /api/admin/forts/{slug}`
  - Notes:
    - Validate slug format + uniqueness.
    - Persist full fort docs as in public schema (including images, lat/lng, model_url).
- Quizzes:
  - `GET /api/admin/quiz`
  - `POST /api/admin/quiz`
  - `PUT /api/admin/quiz/{id}`
  - `DELETE /api/admin/quiz/{id}`
  - Notes:
    - Admin endpoints may return `correct_index`.
- Leaderboard management (quiz_attempts):
  - `GET /api/admin/leaderboard`
  - `DELETE /api/admin/leaderboard` (clear all)
  - `DELETE /api/admin/leaderboard/{id}` (delete one)
- Analytics:
  - `GET /api/admin/analytics`:
    - counts: forts, quizzes, attempts, chat sessions (or chat message session count)
    - forts-by-region
    - badge distribution
    - attempts-per-fort
    - average percentage

**Acceptance criteria**
- Invalid/missing token returns 401.
- Admin APIs do not break public APIs.
- Admin edits are reflected immediately in public app.

#### 5B) Frontend — Admin app surface (new route outside public AppShell)
**Routing**
- Add `/admin` route outside public `AppShell` so it uses its own chrome.

**Auth storage**
- Store token in `localStorage` key: `kc_admin_token`.
- Create `adminApi.js` with axios instance that injects `Authorization: Bearer <token>`.
- Add 401 handling: clear token and redirect to login.

**Pages / components**
- `src/pages/Admin.jsx` (default export)
  - If not authed → render login screen
  - If authed → render dashboard shell + tabs
- `src/components/admin/AdminShell.jsx`
  - Top bar (stage bg + subtle saffron underline), Theme toggle, Sign out
- `src/components/admin/AdminAnalytics.jsx`
  - Stat cards + lightweight CSS bar charts (no new deps)
- `src/components/admin/AdminForts.jsx`
  - Table + Create/Edit dialog with repeaters:
    - `quick_facts[]`
    - `timeline[]` (year/title/body)
    - `images[]`
    - lat/lng inputs
  - Delete uses AlertDialog
- `src/components/admin/AdminQuizzes.jsx`
  - Table + Create/Edit dialog:
    - prompt
    - 4 options
    - correct answer select
    - fort_slug select
    - explanation
- `src/components/admin/AdminLeaderboard.jsx`
  - Table view + per-row delete + Clear all (AlertDialog)

**i18n scope**
- Admin UI can remain English-only for v1 unless requested; public i18n remains unchanged.

**data-testid coverage (minimum)**
- Login: `admin-login-username-input`, `admin-login-password-input`, `admin-login-submit-button`, `admin-login-error-message`
- Shell: `admin-topbar`, `admin-signout-button`, `admin-tabs`, per-tab ids per design guidelines
- Tables: `admin-forts-table`, `admin-quizzes-table`, `admin-leaderboard-table`
- Destructive confirms: `admin-confirm-delete-button`, `admin-leaderboard-clear-button`, `admin-leaderboard-clear-confirm-button`
- Analytics cards: `admin-analytics-fort-count`, `admin-analytics-quiz-count`, `admin-analytics-leaderboard-count`

**Acceptance criteria**
- Visiting `/admin` shows login when logged out.
- Successful login routes to dashboard.
- CRUD actions update DB and reflect in public Explore/Fort pages.

---

### Phase 6 — Testing & QA (Batch #3)
**Backend testing (extend suite)**
- Auth
  - login success/failure
  - token invalid/expired behavior
- Forts CRUD
  - create → fetch in public `/api/forts`
  - update → fetch detail
  - delete → 404 in public detail
- Quiz CRUD
  - create/update/delete
  - ensure public quiz endpoints still do not expose correct answers
- Leaderboard
  - list/delete one/clear all
- Analytics
  - smoke test response structure and key fields

**Frontend testing**
- Map
  - marker click opens popup
  - CTA navigates to fort
- Admin
  - login flow
  - tab switching
  - create/edit/delete fort
  - create/edit/delete quiz
  - clear leaderboard

**Screenshots**
- 1920×1080 and 390×844:
  - Explore map popup open
  - Admin login
  - Admin dashboard overview
  - Fort editor dialog

---

## 3) Next Actions (Immediate)
1. Implement **Map Detail Cards** in `FortMap.jsx` + Leaflet popup CSS overrides.
2. Implement backend **admin auth + admin endpoints** (extend `server.py`, do not refactor).
3. Implement frontend **/admin route** with login gate + admin dashboard tabs and CRUD dialogs.
4. Run backend + frontend testing agent and generate new test report + screenshots.

---

## 4) Success Criteria (Updated)
- ✅ Markerless 3D + AR placement works on supported devices.
- ✅ Narration + captions work, with language-aware TTS voice selection.
- ✅ Fort timelines and quizzes render correctly in EN/HI/MR.
- ✅ Quiz scoring is server-side and never leaks correct answers through public GET endpoints.
- ✅ Leaderboard updates and remains sorted by percentage.
- ✅ Chatbot streams responses via SSE and replies in selected language.
- ✅ Then vs Now slider renders and is responsive.
- ✅ Fort photo galleries are swipeable and credited.
- ✅ Explore map renders with all fort markers.
- ⏳ Explore map marker opens **detail popup card** with “View Fort” button.
- ⏳ Admin panel exists at `/admin` with JWT auth and full management suite.
- ✅ UX compliance: tokens/fonts applied; no purple gradients; no centered container; full `data-testid` coverage.

---

## Remaining Backlog (Not yet requested beyond Batch #3)
- Real fort-specific photogrammetry `.glb` swaps (when available)
- Per-image attribution metadata (author/license) in photo gallery
- Expanded badges/tiers + treasure-hunt/story mode
- Location-based AR unlock near real fort sites
- Offline caching of previously viewed content
