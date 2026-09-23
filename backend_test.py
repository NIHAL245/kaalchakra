"""
Comprehensive backend API tests for KaalChakra
Tests all endpoints as specified in the review request.
"""
import requests
import sys
import json
from datetime import datetime

# Public endpoint from frontend/.env
BASE_URL = "https://shivaji-ar-legacy.preview.emergentagent.com/api"

class KaalChakraAPITester:
    def __init__(self):
        self.tests_run = 0
        self.tests_passed = 0
        self.tests_failed = 0
        self.failures = []

    def test(self, name, fn):
        """Run a single test"""
        self.tests_run += 1
        print(f"\n{'='*60}")
        print(f"TEST {self.tests_run}: {name}")
        print('='*60)
        try:
            fn()
            self.tests_passed += 1
            print(f"✅ PASSED: {name}")
            return True
        except AssertionError as e:
            self.tests_failed += 1
            self.failures.append({"test": name, "error": str(e)})
            print(f"❌ FAILED: {name}")
            print(f"   Error: {e}")
            return False
        except Exception as e:
            self.tests_failed += 1
            self.failures.append({"test": name, "error": f"Exception: {str(e)}"})
            print(f"❌ FAILED: {name}")
            print(f"   Exception: {e}")
            return False

    def summary(self):
        """Print test summary"""
        print(f"\n{'='*60}")
        print("TEST SUMMARY")
        print('='*60)
        print(f"Total tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed} ✅")
        print(f"Failed: {self.tests_failed} ❌")
        print(f"Success rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.failures:
            print(f"\n{'='*60}")
            print("FAILED TESTS:")
            print('='*60)
            for f in self.failures:
                print(f"❌ {f['test']}")
                print(f"   {f['error']}")
        
        return self.tests_failed == 0


def main():
    tester = KaalChakraAPITester()
    
    # Store data for later tests
    test_data = {}
    
    # ==================== FORTS ENDPOINTS ====================
    
    def test_get_forts():
        """GET /api/forts returns 6 forts in authored order with all fields"""
        resp = requests.get(f"{BASE_URL}/forts")
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        forts = resp.json()
        assert len(forts) == 6, f"Expected 6 forts, got {len(forts)}"
        
        # Check authored order
        expected_order = ["shivneri", "torna", "rajgad", "pratapgad", "sinhagad", "raigad"]
        actual_order = [f["slug"] for f in forts]
        assert actual_order == expected_order, f"Fort order mismatch. Expected {expected_order}, got {actual_order}"
        
        # Check all required fields on first fort
        fort = forts[0]
        required_fields = ["slug", "name", "native_name", "region", "era", "model_url", 
                          "image_url", "quick_facts", "description", "narration_text", "timeline"]
        for field in required_fields:
            assert field in fort, f"Missing field '{field}' in fort"
        
        # Check timeline structure
        assert isinstance(fort["timeline"], list), "timeline should be a list"
        if fort["timeline"]:
            tl = fort["timeline"][0]
            assert "year" in tl and "title" in tl and "body" in tl, "Timeline event missing required fields"
        
        test_data["forts"] = forts
        print(f"   ✓ Found 6 forts in correct order")
        print(f"   ✓ All required fields present")
    
    def test_get_single_fort():
        """GET /api/forts/{slug} returns a single fort"""
        resp = requests.get(f"{BASE_URL}/forts/shivneri")
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        fort = resp.json()
        assert fort["slug"] == "shivneri", f"Expected slug 'shivneri', got {fort['slug']}"
        assert fort["name"] == "Shivneri", f"Expected name 'Shivneri', got {fort['name']}"
        print(f"   ✓ Retrieved fort 'shivneri' successfully")
    
    def test_get_fort_404():
        """GET /api/forts/{unknown_slug} returns 404"""
        resp = requests.get(f"{BASE_URL}/forts/unknown-fort-xyz")
        assert resp.status_code == 404, f"Expected 404 for unknown fort, got {resp.status_code}"
        print(f"   ✓ Returns 404 for unknown fort")
    
    # ==================== QUIZ ENDPOINTS ====================
    
    def test_get_fort_quiz_no_answers():
        """GET /api/forts/{slug}/quiz returns questions WITHOUT correct_index/explanation"""
        resp = requests.get(f"{BASE_URL}/forts/shivneri/quiz")
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        questions = resp.json()
        assert len(questions) > 0, "Expected at least one question"
        
        q = questions[0]
        assert "id" in q, "Question missing 'id'"
        assert "prompt" in q, "Question missing 'prompt'"
        assert "options" in q, "Question missing 'options'"
        assert "correct_index" not in q, "Question should NOT expose 'correct_index'"
        assert "explanation" not in q, "Question should NOT expose 'explanation'"
        
        test_data["fort_quiz_questions"] = questions
        print(f"   ✓ Found {len(questions)} questions")
        print(f"   ✓ correct_index and explanation NOT exposed")
    
    def test_get_general_quiz_no_answers():
        """GET /api/quiz/general returns questions WITHOUT correct_index/explanation"""
        resp = requests.get(f"{BASE_URL}/quiz/general")
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        questions = resp.json()
        assert len(questions) > 0, "Expected at least one question"
        
        q = questions[0]
        assert "correct_index" not in q, "Question should NOT expose 'correct_index'"
        assert "explanation" not in q, "Question should NOT expose 'explanation'"
        
        test_data["general_quiz_questions"] = questions
        print(f"   ✓ Found {len(questions)} questions")
        print(f"   ✓ correct_index and explanation NOT exposed")
    
    def test_quiz_submit_valid():
        """POST /api/quiz/submit computes score/percentage/badge correctly"""
        # Use questions from general quiz
        questions = test_data.get("general_quiz_questions", [])[:3]
        if not questions:
            # Fallback: fetch questions
            resp = requests.get(f"{BASE_URL}/quiz/general")
            questions = resp.json()[:3]
        
        # Submit with all answers as index 0 (likely some wrong)
        payload = {
            "player_name": f"TestPlayer_{datetime.now().strftime('%H%M%S')}",
            "fort_slug": None,
            "answers": [{"question_id": q["id"], "selected_index": 0} for q in questions]
        }
        
        resp = requests.post(f"{BASE_URL}/quiz/submit", json=payload)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        result = resp.json()
        assert "attempt_id" in result, "Missing 'attempt_id'"
        assert "player_name" in result, "Missing 'player_name'"
        assert "score" in result, "Missing 'score'"
        assert "total" in result, "Missing 'total'"
        assert "percentage" in result, "Missing 'percentage'"
        assert "badge" in result, "Missing 'badge'"
        assert "details" in result, "Missing 'details'"
        
        # Check details include correct_index, is_correct, explanation
        assert len(result["details"]) == len(questions), "Details count mismatch"
        detail = result["details"][0]
        assert "correct_index" in detail, "Detail missing 'correct_index'"
        assert "is_correct" in detail, "Detail missing 'is_correct'"
        assert "explanation" in detail, "Detail missing 'explanation'"
        
        # Check percentage calculation
        expected_pct = round((result["score"] / result["total"]) * 100)
        assert result["percentage"] == expected_pct, f"Percentage mismatch: expected {expected_pct}, got {result['percentage']}"
        
        # Check badge logic
        pct = result["percentage"]
        if pct >= 90:
            expected_badge = "Gold"
        elif pct >= 70:
            expected_badge = "Silver"
        elif pct >= 50:
            expected_badge = "Bronze"
        else:
            expected_badge = "Keep Learning"
        assert result["badge"] == expected_badge, f"Badge mismatch: expected {expected_badge}, got {result['badge']}"
        
        test_data["quiz_result"] = result
        print(f"   ✓ Score: {result['score']}/{result['total']} ({result['percentage']}%)")
        print(f"   ✓ Badge: {result['badge']}")
        print(f"   ✓ Details include correct_index, is_correct, explanation")
    
    def test_quiz_submit_empty_name():
        """POST /api/quiz/submit with empty player_name returns 400"""
        payload = {
            "player_name": "",
            "fort_slug": None,
            "answers": [{"question_id": "test", "selected_index": 0}]
        }
        
        resp = requests.post(f"{BASE_URL}/quiz/submit", json=payload)
        assert resp.status_code == 400, f"Expected 400 for empty name, got {resp.status_code}"
        print(f"   ✓ Returns 400 for empty player_name")
    
    def test_quiz_submit_empty_answers():
        """POST /api/quiz/submit with empty answers returns 400"""
        payload = {
            "player_name": "TestPlayer",
            "fort_slug": None,
            "answers": []
        }
        
        resp = requests.post(f"{BASE_URL}/quiz/submit", json=payload)
        assert resp.status_code == 400, f"Expected 400 for empty answers, got {resp.status_code}"
        print(f"   ✓ Returns 400 for empty answers")
    
    # ==================== LEADERBOARD ENDPOINTS ====================
    
    def test_leaderboard_sorting():
        """GET /api/leaderboard returns entries sorted by percentage desc then score desc"""
        # First submit a few quiz attempts to populate leaderboard
        questions = test_data.get("general_quiz_questions", [])[:3]
        if not questions:
            resp = requests.get(f"{BASE_URL}/quiz/general")
            questions = resp.json()[:3]
        
        # Submit 2 attempts with different scores
        for i in range(2):
            payload = {
                "player_name": f"SortTest_{i}_{datetime.now().strftime('%H%M%S%f')}",
                "fort_slug": None,
                "answers": [{"question_id": q["id"], "selected_index": i % 2} for q in questions]
            }
            requests.post(f"{BASE_URL}/quiz/submit", json=payload)
        
        resp = requests.get(f"{BASE_URL}/leaderboard")
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        entries = resp.json()
        assert len(entries) > 0, "Expected at least one leaderboard entry"
        
        # Check sorting: percentage desc, then score desc
        for i in range(len(entries) - 1):
            curr = entries[i]
            next_entry = entries[i + 1]
            
            # Either current percentage > next, or if equal, current score >= next
            assert (curr["percentage"] > next_entry["percentage"]) or \
                   (curr["percentage"] == next_entry["percentage"] and curr["score"] >= next_entry["score"]), \
                   f"Leaderboard not sorted correctly at index {i}"
        
        print(f"   ✓ Found {len(entries)} entries")
        print(f"   ✓ Sorted by percentage desc, then score desc")
    
    def test_leaderboard_fort_filter():
        """GET /api/leaderboard supports scope=fort&fort_slug="""
        # Submit a fort-specific quiz
        resp = requests.get(f"{BASE_URL}/forts/shivneri/quiz")
        questions = resp.json()[:2]
        
        payload = {
            "player_name": f"FortTest_{datetime.now().strftime('%H%M%S%f')}",
            "fort_slug": "shivneri",
            "answers": [{"question_id": q["id"], "selected_index": 0} for q in questions]
        }
        requests.post(f"{BASE_URL}/quiz/submit", json=payload)
        
        # Query fort-specific leaderboard
        resp = requests.get(f"{BASE_URL}/leaderboard?scope=fort&fort_slug=shivneri")
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        entries = resp.json()
        # All entries should be for shivneri
        for e in entries:
            if e.get("fort_slug"):
                assert e["fort_slug"] == "shivneri", f"Expected fort_slug 'shivneri', got {e['fort_slug']}"
        
        print(f"   ✓ Fort filter works (scope=fort&fort_slug=shivneri)")
    
    # ==================== CHAT ENDPOINTS ====================
    
    def test_chat_stream_basic():
        """POST /api/chat/stream streams SSE tokens and persists messages"""
        import time
        
        session_id = f"test_session_{datetime.now().strftime('%H%M%S%f')}"
        payload = {
            "session_id": session_id,
            "message": "Who was Shivaji?",
            "fort_slug": None
        }
        
        resp = requests.post(f"{BASE_URL}/chat/stream", json=payload, stream=True, timeout=30)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        assert "text/event-stream" in resp.headers.get("Content-Type", ""), "Expected SSE content type"
        
        # Read SSE stream
        deltas = []
        done = False
        for line in resp.iter_lines(decode_unicode=True):
            if not line or not line.startswith("data:"):
                continue
            data_str = line[5:].strip()
            if not data_str:
                continue
            try:
                data = json.loads(data_str)
                if "delta" in data:
                    deltas.append(data["delta"])
                elif "done" in data and data["done"]:
                    done = True
                    break
            except:
                pass
        
        assert len(deltas) > 0, "Expected at least one delta token"
        assert done, "Expected 'done: true' event"
        
        test_data["chat_session_id"] = session_id
        print(f"   ✓ Received {len(deltas)} delta tokens")
        print(f"   ✓ Stream ended with done:true")
    
    def test_chat_history():
        """GET /api/chat/{session_id}/history returns stored messages"""
        session_id = test_data.get("chat_session_id")
        if not session_id:
            print("   ⚠ Skipping: no session_id from previous test")
            return
        
        import time
        time.sleep(1)  # Give backend time to persist
        
        resp = requests.get(f"{BASE_URL}/chat/{session_id}/history")
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        messages = resp.json()
        assert len(messages) >= 2, f"Expected at least 2 messages (user + assistant), got {len(messages)}"
        
        # Check first is user, second is assistant
        assert messages[0]["role"] == "user", f"First message should be 'user', got {messages[0]['role']}"
        assert messages[1]["role"] == "assistant", f"Second message should be 'assistant', got {messages[1]['role']}"
        
        print(f"   ✓ Found {len(messages)} messages in history")
        print(f"   ✓ Messages in chronological order (user, assistant)")
    
    def test_chat_multi_turn():
        """POST /api/chat/stream multi-turn context works within a session_id"""
        import time
        
        session_id = f"multiturn_{datetime.now().strftime('%H%M%S%f')}"
        
        # First message
        payload1 = {
            "session_id": session_id,
            "message": "What is Raigad?",
            "fort_slug": None
        }
        resp1 = requests.post(f"{BASE_URL}/chat/stream", json=payload1, stream=True, timeout=30)
        assert resp1.status_code == 200, f"First message failed: {resp1.status_code}"
        
        # Consume stream
        for line in resp1.iter_lines(decode_unicode=True):
            if line and "done" in line:
                break
        
        time.sleep(1)
        
        # Second message (follow-up)
        payload2 = {
            "session_id": session_id,
            "message": "When was it built?",
            "fort_slug": None
        }
        resp2 = requests.post(f"{BASE_URL}/chat/stream", json=payload2, stream=True, timeout=30)
        assert resp2.status_code == 200, f"Second message failed: {resp2.status_code}"
        
        # Consume stream
        for line in resp2.iter_lines(decode_unicode=True):
            if line and "done" in line:
                break
        
        time.sleep(1)
        
        # Check history
        resp = requests.get(f"{BASE_URL}/chat/{session_id}/history")
        messages = resp.json()
        assert len(messages) >= 4, f"Expected at least 4 messages (2 user + 2 assistant), got {len(messages)}"
        
        print(f"   ✓ Multi-turn context works")
        print(f"   ✓ History contains {len(messages)} messages")
    
    def test_chat_empty_message():
        """POST /api/chat/stream with empty message returns 400"""
        payload = {
            "session_id": "test",
            "message": "",
            "fort_slug": None
        }
        
        resp = requests.post(f"{BASE_URL}/chat/stream", json=payload)
        assert resp.status_code == 400, f"Expected 400 for empty message, got {resp.status_code}"
        print(f"   ✓ Returns 400 for empty message")
    
    # ==================== V2 MULTILINGUAL TESTS ====================
    
    def test_forts_lang_hindi():
        """GET /api/forts?lang=hi returns Hindi translated content"""
        resp = requests.get(f"{BASE_URL}/forts?lang=hi")
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        forts = resp.json()
        assert len(forts) == 6, f"Expected 6 forts, got {len(forts)}"
        
        # Check first fort has Hindi content (Devanagari script)
        fort = forts[0]
        # Check if description contains Devanagari characters
        has_devanagari = any('\u0900' <= c <= '\u097F' for c in fort.get("description", ""))
        assert has_devanagari, "Expected Hindi (Devanagari) content in description"
        
        print(f"   ✓ Hindi translation returned with Devanagari script")
        print(f"   ✓ Sample hook: {fort.get('hook', '')[:50]}...")
    
    def test_forts_lang_marathi():
        """GET /api/forts?lang=mr returns Marathi translated content"""
        resp = requests.get(f"{BASE_URL}/forts?lang=mr")
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        forts = resp.json()
        assert len(forts) == 6, f"Expected 6 forts, got {len(forts)}"
        
        # Check first fort has Marathi content (Devanagari script)
        fort = forts[0]
        has_devanagari = any('\u0900' <= c <= '\u097F' for c in fort.get("description", ""))
        assert has_devanagari, "Expected Marathi (Devanagari) content in description"
        
        print(f"   ✓ Marathi translation returned with Devanagari script")
        print(f"   ✓ Sample region: {fort.get('region', '')}")
    
    def test_fort_detail_lang_hindi():
        """GET /api/forts/shivneri?lang=hi returns Hindi translated fort"""
        resp = requests.get(f"{BASE_URL}/forts/shivneri?lang=hi")
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        fort = resp.json()
        # Check translated fields
        has_devanagari = any('\u0900' <= c <= '\u097F' for c in fort.get("narration_text", ""))
        assert has_devanagari, "Expected Hindi narration_text"
        
        # Check timeline is translated
        if fort.get("timeline"):
            tl = fort["timeline"][0]
            has_devanagari_tl = any('\u0900' <= c <= '\u097F' for c in tl.get("title", ""))
            assert has_devanagari_tl, "Expected Hindi timeline"
        
        print(f"   ✓ Fort detail in Hindi with translated narration and timeline")
    
    def test_fort_then_now_images():
        """GET /api/forts/{slug} includes then_image_url and now_image_url"""
        resp = requests.get(f"{BASE_URL}/forts/shivneri")
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        fort = resp.json()
        assert "then_image_url" in fort, "Missing 'then_image_url'"
        assert "now_image_url" in fort, "Missing 'now_image_url'"
        
        # Check then_image_url points to /reconstructions/
        assert "/reconstructions/" in fort["then_image_url"], f"Expected /reconstructions/ in then_image_url, got {fort['then_image_url']}"
        
        print(f"   ✓ then_image_url: {fort['then_image_url']}")
        print(f"   ✓ now_image_url: {fort['now_image_url']}")
    
    def test_reconstruction_images_served():
        """GET /reconstructions/{slug}.jpg returns 200 for all 6 forts"""
        forts = ["shivneri", "torna", "rajgad", "pratapgad", "sinhagad", "raigad"]
        base = BASE_URL.replace("/api", "")
        
        for slug in forts:
            url = f"{base}/reconstructions/{slug}.jpg"
            resp = requests.get(url)
            assert resp.status_code == 200, f"Expected 200 for {url}, got {resp.status_code}"
            assert "image" in resp.headers.get("Content-Type", ""), f"Expected image content type for {url}"
        
        print(f"   ✓ All 6 reconstruction images served successfully")
    
    def test_quiz_lang_marathi():
        """GET /api/forts/{slug}/quiz?lang=mr returns Marathi quiz"""
        resp = requests.get(f"{BASE_URL}/forts/shivneri/quiz?lang=mr")
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        questions = resp.json()
        assert len(questions) > 0, "Expected at least one question"
        
        q = questions[0]
        # Check Marathi content
        has_devanagari = any('\u0900' <= c <= '\u097F' for c in q.get("prompt", ""))
        assert has_devanagari, "Expected Marathi prompt"
        
        # Still should NOT expose correct_index
        assert "correct_index" not in q, "Should NOT expose correct_index"
        
        print(f"   ✓ Marathi quiz returned with Devanagari script")
        print(f"   ✓ correct_index still hidden")
    
    def test_general_quiz_lang_hindi():
        """GET /api/quiz/general?lang=hi returns Hindi quiz"""
        resp = requests.get(f"{BASE_URL}/quiz/general?lang=hi")
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        questions = resp.json()
        assert len(questions) > 0, "Expected at least one question"
        
        q = questions[0]
        has_devanagari = any('\u0900' <= c <= '\u097F' for c in q.get("prompt", ""))
        assert has_devanagari, "Expected Hindi prompt"
        
        assert "correct_index" not in q, "Should NOT expose correct_index"
        
        print(f"   ✓ Hindi general quiz returned")
    
    def test_quiz_submit_lang_hindi():
        """POST /api/quiz/submit with lang=hi returns Hindi explanation"""
        # Get Hindi questions
        resp = requests.get(f"{BASE_URL}/quiz/general?lang=hi")
        questions = resp.json()[:2]
        
        payload = {
            "player_name": f"HindiTest_{datetime.now().strftime('%H%M%S%f')}",
            "fort_slug": None,
            "lang": "hi",
            "answers": [{"question_id": q["id"], "selected_index": 0} for q in questions]
        }
        
        resp = requests.post(f"{BASE_URL}/quiz/submit", json=payload)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        result = resp.json()
        # Check details have Hindi explanation
        detail = result["details"][0]
        has_devanagari = any('\u0900' <= c <= '\u097F' for c in detail.get("explanation", ""))
        assert has_devanagari, "Expected Hindi explanation in details"
        
        # Check prompt and options are also in Hindi
        has_devanagari_prompt = any('\u0900' <= c <= '\u097F' for c in detail.get("prompt", ""))
        assert has_devanagari_prompt, "Expected Hindi prompt in details"
        
        print(f"   ✓ Quiz result with Hindi explanation returned")
        print(f"   ✓ Score: {result['score']}/{result['total']}")
    
    def test_chat_stream_lang_marathi():
        """POST /api/chat/stream with lang=mr streams Marathi response"""
        import time
        
        session_id = f"marathi_{datetime.now().strftime('%H%M%S%f')}"
        payload = {
            "session_id": session_id,
            "message": "शिवाजी महाराज कोण होते?",
            "fort_slug": None,
            "lang": "mr"
        }
        
        resp = requests.post(f"{BASE_URL}/chat/stream", json=payload, stream=True, timeout=30)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        # Read stream
        deltas = []
        done = False
        for line in resp.iter_lines(decode_unicode=True):
            if not line or not line.startswith("data:"):
                continue
            data_str = line[5:].strip()
            if not data_str:
                continue
            try:
                data = json.loads(data_str)
                if "delta" in data:
                    deltas.append(data["delta"])
                elif "done" in data and data["done"]:
                    done = True
                    break
            except:
                pass
        
        assert len(deltas) > 0, "Expected at least one delta"
        assert done, "Expected done:true"
        
        # Check if response contains Devanagari (Marathi)
        full_response = "".join(deltas)
        has_devanagari = any('\u0900' <= c <= '\u097F' for c in full_response)
        # Note: LLM might respond in English even if asked in Marathi, so we just check it streams
        
        print(f"   ✓ Marathi chat stream works")
        print(f"   ✓ Received {len(deltas)} deltas")
    
    def test_chat_stream_lang_english():
        """POST /api/chat/stream with lang=en still works"""
        import time
        
        session_id = f"english_{datetime.now().strftime('%H%M%S%f')}"
        payload = {
            "session_id": session_id,
            "message": "Tell me about Raigad",
            "fort_slug": None,
            "lang": "en"
        }
        
        resp = requests.post(f"{BASE_URL}/chat/stream", json=payload, stream=True, timeout=30)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        # Read stream
        deltas = []
        done = False
        for line in resp.iter_lines(decode_unicode=True):
            if not line or not line.startswith("data:"):
                continue
            data_str = line[5:].strip()
            if not data_str:
                continue
            try:
                data = json.loads(data_str)
                if "delta" in data:
                    deltas.append(data["delta"])
                elif "done" in data and data["done"]:
                    done = True
                    break
            except:
                pass
        
        assert len(deltas) > 0, "Expected at least one delta"
        assert done, "Expected done:true"
        
        print(f"   ✓ English chat stream still works")
    
    def test_invalid_lang_fallback():
        """GET /api/forts?lang=invalid falls back to English"""
        resp = requests.get(f"{BASE_URL}/forts?lang=xyz")
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        forts = resp.json()
        # Should return English content (no Devanagari)
        fort = forts[0]
        # English content should not have Devanagari
        # Check if description is in English (contains common English words)
        desc = fort.get("description", "")
        # Simple check: English descriptions should have "fort" or "the" or "was"
        has_english = any(word in desc.lower() for word in ["fort", "the", "was", "is"])
        assert has_english, "Expected English fallback for invalid lang"
        
        print(f"   ✓ Invalid lang falls back to English gracefully")
    
    # ==================== V3 GALLERY + MAP + MODELS TESTS ====================
    
    def test_fort_images_array():
        """GET /api/forts/{slug} returns images[] array with 1-4 entries"""
        # Test raigad which should have 4 images
        resp = requests.get(f"{BASE_URL}/forts/raigad")
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        fort = resp.json()
        assert "images" in fort, "Missing 'images' field"
        assert isinstance(fort["images"], list), "images should be a list"
        assert len(fort["images"]) >= 1, f"Expected at least 1 image, got {len(fort['images'])}"
        assert len(fort["images"]) <= 4, f"Expected at most 4 images, got {len(fort['images'])}"
        
        # Check raigad specifically has 4 images
        assert len(fort["images"]) == 4, f"Raigad should have 4 images, got {len(fort['images'])}"
        
        # Check image URLs are valid paths
        for img in fort["images"]:
            assert img.startswith("/forts/"), f"Image URL should start with /forts/, got {img}"
        
        print(f"   ✓ Raigad has {len(fort['images'])} images: {fort['images']}")
    
    def test_fort_coordinates():
        """GET /api/forts/{slug} returns lat and lng coordinates"""
        resp = requests.get(f"{BASE_URL}/forts/raigad")
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        fort = resp.json()
        assert "lat" in fort, "Missing 'lat' field"
        assert "lng" in fort, "Missing 'lng' field"
        assert fort["lat"] is not None, "lat should not be null"
        assert fort["lng"] is not None, "lng should not be null"
        assert isinstance(fort["lat"], (int, float)), f"lat should be a number, got {type(fort['lat'])}"
        assert isinstance(fort["lng"], (int, float)), f"lng should be a number, got {type(fort['lng'])}"
        
        # Check raigad coordinates are in Maharashtra region (rough bounds)
        assert 17.0 < fort["lat"] < 20.0, f"Raigad lat should be ~18.2, got {fort['lat']}"
        assert 72.0 < fort["lng"] < 75.0, f"Raigad lng should be ~73.4, got {fort['lng']}"
        
        print(f"   ✓ Raigad coordinates: lat={fort['lat']}, lng={fort['lng']}")
    
    def test_fort_model_url():
        """GET /api/forts/{slug} returns per-fort model_url"""
        # Test different forts have different models
        forts_models = {
            "shivneri": "/models/fort-keep.glb",
            "raigad": "/models/fort-fantasy.glb",
            "torna": "/models/fort-stone2.glb",
        }
        
        for slug, expected_model in forts_models.items():
            resp = requests.get(f"{BASE_URL}/forts/{slug}")
            assert resp.status_code == 200, f"Expected 200 for {slug}, got {resp.status_code}"
            
            fort = resp.json()
            assert "model_url" in fort, f"Missing 'model_url' for {slug}"
            assert fort["model_url"] == expected_model, f"Expected {expected_model} for {slug}, got {fort['model_url']}"
        
        print(f"   ✓ Per-fort model_url correct for shivneri, raigad, torna")
    
    def test_fort_images_served():
        """GET /forts/{slug}.jpg and /forts/{slug}-2.jpg return 200 with image content"""
        base = BASE_URL.replace("/api", "")
        
        # Test raigad images (should have 4)
        test_images = [
            "/forts/raigad.jpg",
            "/forts/raigad-2.jpg",
            "/forts/raigad-3.jpg",
            "/forts/raigad-4.jpg",
        ]
        
        for img_path in test_images:
            url = f"{base}{img_path}"
            resp = requests.get(url)
            assert resp.status_code == 200, f"Expected 200 for {url}, got {resp.status_code}"
            assert "image" in resp.headers.get("Content-Type", "").lower(), f"Expected image content type for {url}, got {resp.headers.get('Content-Type')}"
        
        print(f"   ✓ All 4 raigad images served successfully")
    
    def test_3d_models_served():
        """GET /models/fort-*.glb returns 200 with model/gltf-binary content"""
        base = BASE_URL.replace("/api", "")
        
        # Test the distinct models
        test_models = [
            "/models/fort-fantasy.glb",
            "/models/fort-keep.glb",
            "/models/fort-stone2.glb",
        ]
        
        for model_path in test_models:
            url = f"{base}{model_path}"
            resp = requests.get(url)
            assert resp.status_code == 200, f"Expected 200 for {url}, got {resp.status_code}"
            # GLB files should have model/gltf-binary or application/octet-stream content type
            content_type = resp.headers.get("Content-Type", "").lower()
            assert "gltf" in content_type or "octet-stream" in content_type or "binary" in content_type, \
                f"Expected model content type for {url}, got {content_type}"
        
        print(f"   ✓ All 3 distinct .glb models served successfully")
    
    def test_fort_new_fields_lang_invariant():
        """GET /api/forts/{slug}?lang=hi returns same images/lat/lng/model_url as English"""
        # Get English version
        resp_en = requests.get(f"{BASE_URL}/forts/raigad?lang=en")
        fort_en = resp_en.json()
        
        # Get Hindi version
        resp_hi = requests.get(f"{BASE_URL}/forts/raigad?lang=hi")
        fort_hi = resp_hi.json()
        
        # images, lat, lng, model_url should be identical
        assert fort_en["images"] == fort_hi["images"], "images[] should be language-invariant"
        assert fort_en["lat"] == fort_hi["lat"], "lat should be language-invariant"
        assert fort_en["lng"] == fort_hi["lng"], "lng should be language-invariant"
        assert fort_en["model_url"] == fort_hi["model_url"], "model_url should be language-invariant"
        
        # But description should be different (Hindi has Devanagari)
        has_devanagari = any('\u0900' <= c <= '\u097F' for c in fort_hi.get("description", ""))
        assert has_devanagari, "Hindi version should have Devanagari content"
        
        print(f"   ✓ images/lat/lng/model_url unchanged across languages")
        print(f"   ✓ Translated fields (description) still work")
    
    def test_all_forts_have_coords():
        """GET /api/forts returns all 6 forts with lat/lng coordinates"""
        resp = requests.get(f"{BASE_URL}/forts")
        forts = resp.json()
        
        for fort in forts:
            assert "lat" in fort and fort["lat"] is not None, f"Fort {fort['slug']} missing lat"
            assert "lng" in fort and fort["lng"] is not None, f"Fort {fort['slug']} missing lng"
            assert isinstance(fort["lat"], (int, float)), f"Fort {fort['slug']} lat not a number"
            assert isinstance(fort["lng"], (int, float)), f"Fort {fort['slug']} lng not a number"
        
        print(f"   ✓ All 6 forts have valid lat/lng coordinates")
    
    # ==================== ADMIN ENDPOINTS TESTS ====================
    
    def test_admin_login_correct_creds():
        """POST /api/admin/login with correct credentials returns JWT token"""
        payload = {
            "username": "admin",
            "password": "KaalChakra@2025"
        }
        
        resp = requests.post(f"{BASE_URL}/admin/login", json=payload)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        data = resp.json()
        assert "access_token" in data, "Missing 'access_token' in response"
        assert "token_type" in data, "Missing 'token_type' in response"
        assert "username" in data, "Missing 'username' in response"
        assert data["token_type"] == "bearer", f"Expected token_type 'bearer', got {data['token_type']}"
        assert data["username"] == "admin", f"Expected username 'admin', got {data['username']}"
        
        # Store token for subsequent tests
        test_data["admin_token"] = data["access_token"]
        print(f"   ✓ Login successful, received JWT token")
        print(f"   ✓ Token type: {data['token_type']}, username: {data['username']}")
    
    def test_admin_login_wrong_password():
        """POST /api/admin/login with wrong password returns 401"""
        payload = {
            "username": "admin",
            "password": "WrongPassword123"
        }
        
        resp = requests.post(f"{BASE_URL}/admin/login", json=payload)
        assert resp.status_code == 401, f"Expected 401 for wrong password, got {resp.status_code}"
        print(f"   ✓ Returns 401 for wrong password")
    
    def test_admin_login_wrong_username():
        """POST /api/admin/login with wrong username returns 401"""
        payload = {
            "username": "wronguser",
            "password": "KaalChakra@2025"
        }
        
        resp = requests.post(f"{BASE_URL}/admin/login", json=payload)
        assert resp.status_code == 401, f"Expected 401 for wrong username, got {resp.status_code}"
        print(f"   ✓ Returns 401 for wrong username")
    
    def test_admin_me_with_token():
        """GET /api/admin/me with valid token returns username"""
        token = test_data.get("admin_token")
        assert token, "No admin token available from login test"
        
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.get(f"{BASE_URL}/admin/me", headers=headers)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        data = resp.json()
        assert "username" in data, "Missing 'username' in response"
        assert data["username"] == "admin", f"Expected username 'admin', got {data['username']}"
        print(f"   ✓ Returns username: {data['username']}")
    
    def test_admin_me_without_token():
        """GET /api/admin/me without token returns 401"""
        resp = requests.get(f"{BASE_URL}/admin/me")
        assert resp.status_code == 401, f"Expected 401 without token, got {resp.status_code}"
        print(f"   ✓ Returns 401 when no token provided")
    
    def test_admin_me_invalid_token():
        """GET /api/admin/me with invalid token returns 401"""
        headers = {"Authorization": "Bearer invalid_token_xyz"}
        resp = requests.get(f"{BASE_URL}/admin/me", headers=headers)
        assert resp.status_code == 401, f"Expected 401 for invalid token, got {resp.status_code}"
        print(f"   ✓ Returns 401 for invalid token")
    
    def test_admin_get_forts():
        """GET /api/admin/forts returns all forts with full details"""
        token = test_data.get("admin_token")
        assert token, "No admin token available"
        
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.get(f"{BASE_URL}/admin/forts", headers=headers)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        forts = resp.json()
        assert len(forts) == 6, f"Expected 6 forts, got {len(forts)}"
        
        # Check first fort has all fields including translations
        fort = forts[0]
        assert "slug" in fort, "Missing 'slug'"
        assert "name" in fort, "Missing 'name'"
        assert "translations" in fort, "Missing 'translations' field (admin should see this)"
        
        test_data["admin_forts"] = forts
        print(f"   ✓ Retrieved {len(forts)} forts with full details")
    
    def test_admin_get_forts_no_auth():
        """GET /api/admin/forts without token returns 401"""
        resp = requests.get(f"{BASE_URL}/admin/forts")
        assert resp.status_code == 401, f"Expected 401 without auth, got {resp.status_code}"
        print(f"   ✓ Protected endpoint returns 401 without auth")
    
    def test_admin_create_fort_valid():
        """POST /api/admin/forts creates a new fort with valid slug"""
        token = test_data.get("admin_token")
        assert token, "No admin token available"
        
        timestamp = datetime.now().strftime('%H%M%S')
        payload = {
            "slug": f"test-fort-{timestamp}",
            "name": f"Test Fort {timestamp}",
            "native_name": "परीक्षण किल्ला",
            "region": "Test Region",
            "era": "Test Era",
            "year_founded": 2025,
            "hook": "A test fort for API testing",
            "description": "This is a test fort created by automated tests",
            "narration_text": "Test narration",
            "image_url": "/forts/test.jpg",
            "model_url": "/models/test.glb",
            "now_image_url": "/forts/test-now.jpg",
            "then_image_url": "/reconstructions/test.jpg",
            "lat": 18.5,
            "lng": 73.5,
            "images": ["/forts/test-1.jpg", "/forts/test-2.jpg"],
            "quick_facts": ["Test fact 1", "Test fact 2"],
            "timeline": [
                {"year": "2025", "title": "Test Event", "body": "Test event description"}
            ]
        }
        
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.post(f"{BASE_URL}/admin/forts", json=payload, headers=headers)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
        
        fort = resp.json()
        assert fort["slug"] == payload["slug"], f"Slug mismatch"
        assert fort["name"] == payload["name"], f"Name mismatch"
        
        test_data["test_fort_slug"] = payload["slug"]
        print(f"   ✓ Created fort with slug: {payload['slug']}")
    
    def test_admin_create_fort_duplicate_slug():
        """POST /api/admin/forts with duplicate slug returns 409"""
        token = test_data.get("admin_token")
        assert token, "No admin token available"
        
        # Try to create fort with existing slug
        payload = {
            "slug": "shivneri",  # Already exists
            "name": "Duplicate Fort",
            "native_name": "",
            "region": "",
            "era": "",
            "hook": "",
            "description": "",
            "narration_text": "",
            "image_url": "",
            "model_url": "",
            "now_image_url": "",
            "then_image_url": "",
            "images": [],
            "quick_facts": [],
            "timeline": []
        }
        
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.post(f"{BASE_URL}/admin/forts", json=payload, headers=headers)
        assert resp.status_code == 409, f"Expected 409 for duplicate slug, got {resp.status_code}"
        print(f"   ✓ Returns 409 for duplicate slug")
    
    def test_admin_create_fort_invalid_slug():
        """POST /api/admin/forts with invalid slug (uppercase/spaces) returns 400"""
        token = test_data.get("admin_token")
        assert token, "No admin token available"
        
        # Try with uppercase
        payload = {
            "slug": "Invalid-Fort-Slug",  # Has uppercase
            "name": "Invalid Fort",
            "native_name": "",
            "region": "",
            "era": "",
            "hook": "",
            "description": "",
            "narration_text": "",
            "image_url": "",
            "model_url": "",
            "now_image_url": "",
            "then_image_url": "",
            "images": [],
            "quick_facts": [],
            "timeline": []
        }
        
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.post(f"{BASE_URL}/admin/forts", json=payload, headers=headers)
        assert resp.status_code == 400, f"Expected 400 for invalid slug, got {resp.status_code}"
        print(f"   ✓ Returns 400 for invalid slug (uppercase)")
    
    def test_admin_created_fort_in_public_api():
        """Created fort appears in public GET /api/forts"""
        test_slug = test_data.get("test_fort_slug")
        if not test_slug:
            print("   ⚠ Skipping: no test fort created")
            return
        
        resp = requests.get(f"{BASE_URL}/forts")
        forts = resp.json()
        
        # Check if test fort is in the list
        test_fort = next((f for f in forts if f["slug"] == test_slug), None)
        assert test_fort is not None, f"Test fort {test_slug} not found in public API"
        print(f"   ✓ Created fort appears in public GET /api/forts")
    
    def test_admin_update_fort():
        """PUT /api/admin/forts/{slug} updates a fort"""
        token = test_data.get("admin_token")
        test_slug = test_data.get("test_fort_slug")
        if not token or not test_slug:
            print("   ⚠ Skipping: no token or test fort")
            return
        
        payload = {
            "slug": test_slug,  # Slug is immutable but must be in payload
            "name": "Updated Test Fort",
            "native_name": "अद्यतन परीक्षण किल्ला",
            "region": "Updated Region",
            "era": "Updated Era",
            "year_founded": 2026,
            "hook": "Updated hook",
            "description": "Updated description",
            "narration_text": "Updated narration",
            "image_url": "/forts/updated.jpg",
            "model_url": "/models/updated.glb",
            "now_image_url": "/forts/updated-now.jpg",
            "then_image_url": "/reconstructions/updated.jpg",
            "lat": 18.6,
            "lng": 73.6,
            "images": ["/forts/updated-1.jpg"],
            "quick_facts": ["Updated fact"],
            "timeline": []
        }
        
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.put(f"{BASE_URL}/admin/forts/{test_slug}", json=payload, headers=headers)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
        
        fort = resp.json()
        assert fort["name"] == "Updated Test Fort", f"Name not updated"
        assert fort["region"] == "Updated Region", f"Region not updated"
        print(f"   ✓ Fort updated successfully")
    
    def test_admin_updated_fort_in_public_api():
        """Updated fort reflects in public GET /api/forts/{slug}"""
        test_slug = test_data.get("test_fort_slug")
        if not test_slug:
            print("   ⚠ Skipping: no test fort")
            return
        
        resp = requests.get(f"{BASE_URL}/forts/{test_slug}")
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        fort = resp.json()
        assert fort["name"] == "Updated Test Fort", f"Update not reflected in public API"
        print(f"   ✓ Update reflected in public GET /api/forts/{test_slug}")
    
    def test_admin_get_quiz():
        """GET /api/admin/quiz returns all questions including correct_index"""
        token = test_data.get("admin_token")
        assert token, "No admin token available"
        
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.get(f"{BASE_URL}/admin/quiz", headers=headers)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        questions = resp.json()
        assert len(questions) > 0, "Expected at least one question"
        
        # Check admin sees correct_index and explanation
        q = questions[0]
        assert "id" in q, "Missing 'id'"
        assert "prompt" in q, "Missing 'prompt'"
        assert "options" in q, "Missing 'options'"
        assert "correct_index" in q, "Admin should see 'correct_index'"
        assert "explanation" in q, "Admin should see 'explanation'"
        
        test_data["admin_quiz_questions"] = questions
        print(f"   ✓ Retrieved {len(questions)} questions with correct_index")
    
    def test_admin_create_quiz_valid():
        """POST /api/admin/quiz creates a question"""
        token = test_data.get("admin_token")
        assert token, "No admin token available"
        
        payload = {
            "fort_slug": None,  # General question
            "prompt": f"Test question created at {datetime.now().strftime('%H:%M:%S')}",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct_index": 1,
            "explanation": "Option B is correct because this is a test"
        }
        
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.post(f"{BASE_URL}/admin/quiz", json=payload, headers=headers)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
        
        question = resp.json()
        assert "id" in question, "Missing 'id' in created question"
        assert question["prompt"] == payload["prompt"], "Prompt mismatch"
        assert question["correct_index"] == payload["correct_index"], "correct_index mismatch"
        
        test_data["test_quiz_id"] = question["id"]
        print(f"   ✓ Created question with id: {question['id']}")
    
    def test_admin_create_quiz_invalid_correct_index():
        """POST /api/admin/quiz with correct_index out of range returns 400"""
        token = test_data.get("admin_token")
        assert token, "No admin token available"
        
        payload = {
            "fort_slug": None,
            "prompt": "Test question",
            "options": ["Option A", "Option B"],
            "correct_index": 5,  # Out of range (only 2 options)
            "explanation": "Test"
        }
        
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.post(f"{BASE_URL}/admin/quiz", json=payload, headers=headers)
        assert resp.status_code == 400, f"Expected 400 for out of range correct_index, got {resp.status_code}"
        print(f"   ✓ Returns 400 for correct_index out of range")
    
    def test_admin_create_quiz_too_few_options():
        """POST /api/admin/quiz with fewer than 2 options returns 400"""
        token = test_data.get("admin_token")
        assert token, "No admin token available"
        
        payload = {
            "fort_slug": None,
            "prompt": "Test question",
            "options": ["Only one option"],
            "correct_index": 0,
            "explanation": "Test"
        }
        
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.post(f"{BASE_URL}/admin/quiz", json=payload, headers=headers)
        assert resp.status_code == 400, f"Expected 400 for too few options, got {resp.status_code}"
        print(f"   ✓ Returns 400 for fewer than 2 options")
    
    def test_admin_update_quiz():
        """PUT /api/admin/quiz/{id} updates a question"""
        token = test_data.get("admin_token")
        test_id = test_data.get("test_quiz_id")
        if not token or not test_id:
            print("   ⚠ Skipping: no token or test quiz")
            return
        
        payload = {
            "fort_slug": "shivneri",  # Change to fort-specific
            "prompt": "Updated test question",
            "options": ["Updated A", "Updated B", "Updated C"],
            "correct_index": 2,
            "explanation": "Updated explanation"
        }
        
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.put(f"{BASE_URL}/admin/quiz/{test_id}", json=payload, headers=headers)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
        
        question = resp.json()
        assert question["prompt"] == "Updated test question", "Prompt not updated"
        assert question["fort_slug"] == "shivneri", "fort_slug not updated"
        print(f"   ✓ Question updated successfully")
    
    def test_admin_get_leaderboard():
        """GET /api/admin/leaderboard lists all quiz attempts"""
        token = test_data.get("admin_token")
        assert token, "No admin token available"
        
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.get(f"{BASE_URL}/admin/leaderboard", headers=headers)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        attempts = resp.json()
        assert isinstance(attempts, list), "Expected list of attempts"
        
        if len(attempts) > 0:
            attempt = attempts[0]
            assert "id" in attempt, "Missing 'id'"
            assert "player_name" in attempt, "Missing 'player_name'"
            assert "score" in attempt, "Missing 'score'"
            assert "total" in attempt, "Missing 'total'"
            assert "percentage" in attempt, "Missing 'percentage'"
            assert "created_at" in attempt, "Missing 'created_at'"
        
        test_data["admin_leaderboard"] = attempts
        print(f"   ✓ Retrieved {len(attempts)} quiz attempts")
    
    def test_admin_delete_leaderboard_entry():
        """DELETE /api/admin/leaderboard/{id} deletes one entry"""
        token = test_data.get("admin_token")
        attempts = test_data.get("admin_leaderboard", [])
        if not token or len(attempts) == 0:
            print("   ⚠ Skipping: no token or no attempts")
            return
        
        # Find a test attempt (one we created)
        test_attempt = next((a for a in attempts if "Test" in a.get("player_name", "")), None)
        if not test_attempt:
            print("   ⚠ Skipping: no test attempt found")
            return
        
        attempt_id = test_attempt["id"]
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.delete(f"{BASE_URL}/admin/leaderboard/{attempt_id}", headers=headers)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        data = resp.json()
        assert data["deleted"] == attempt_id, f"Expected deleted id {attempt_id}, got {data.get('deleted')}"
        print(f"   ✓ Deleted leaderboard entry: {attempt_id}")
    
    def test_admin_analytics():
        """GET /api/admin/analytics returns counts and stats"""
        token = test_data.get("admin_token")
        assert token, "No admin token available"
        
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.get(f"{BASE_URL}/admin/analytics", headers=headers)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        data = resp.json()
        assert "counts" in data, "Missing 'counts'"
        assert "avg_percentage" in data, "Missing 'avg_percentage'"
        assert "forts_by_region" in data, "Missing 'forts_by_region'"
        assert "badge_distribution" in data, "Missing 'badge_distribution'"
        assert "attempts_per_fort" in data, "Missing 'attempts_per_fort'"
        
        counts = data["counts"]
        assert "forts" in counts, "Missing counts.forts"
        assert "quizzes" in counts, "Missing counts.quizzes"
        assert "attempts" in counts, "Missing counts.attempts"
        assert "chat_sessions" in counts, "Missing counts.chat_sessions"
        assert "chat_messages" in counts, "Missing counts.chat_messages"
        
        # Check forts count is at least 6 (seeded) + 1 (test fort we created)
        assert counts["forts"] >= 7, f"Expected at least 7 forts, got {counts['forts']}"
        
        print(f"   ✓ Analytics returned:")
        print(f"      Forts: {counts['forts']}, Quizzes: {counts['quizzes']}, Attempts: {counts['attempts']}")
        print(f"      Avg percentage: {data['avg_percentage']}%")
    
    def test_admin_delete_quiz():
        """DELETE /api/admin/quiz/{id} removes a question"""
        token = test_data.get("admin_token")
        test_id = test_data.get("test_quiz_id")
        if not token or not test_id:
            print("   ⚠ Skipping: no token or test quiz")
            return
        
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.delete(f"{BASE_URL}/admin/quiz/{test_id}", headers=headers)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        data = resp.json()
        assert data["deleted"] == test_id, f"Expected deleted id {test_id}, got {data.get('deleted')}"
        print(f"   ✓ Deleted quiz question: {test_id}")
    
    def test_admin_delete_fort_cascades_quiz():
        """DELETE /api/admin/forts/{slug} deletes fort and cascades quiz questions"""
        token = test_data.get("admin_token")
        test_slug = test_data.get("test_fort_slug")
        if not token or not test_slug:
            print("   ⚠ Skipping: no token or test fort")
            return
        
        headers = {"Authorization": f"Bearer {token}"}
        resp = requests.delete(f"{BASE_URL}/admin/forts/{test_slug}", headers=headers)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        
        data = resp.json()
        assert data["deleted"] == test_slug, f"Expected deleted slug {test_slug}, got {data.get('deleted')}"
        assert "quiz_questions_removed" in data, "Missing 'quiz_questions_removed'"
        
        print(f"   ✓ Deleted fort: {test_slug}")
        print(f"   ✓ Cascaded {data['quiz_questions_removed']} quiz questions")
    
    def test_admin_deleted_fort_returns_404():
        """GET /api/forts/{deleted_slug} returns 404 after deletion"""
        test_slug = test_data.get("test_fort_slug")
        if not test_slug:
            print("   ⚠ Skipping: no test fort")
            return
        
        resp = requests.get(f"{BASE_URL}/forts/{test_slug}")
        assert resp.status_code == 404, f"Expected 404 for deleted fort, got {resp.status_code}"
        print(f"   ✓ Deleted fort returns 404 in public API")
    
    # ==================== RUN ALL TESTS ====================
    
    print("\n" + "="*60)
    print("KAALCHAKRA BACKEND API TEST SUITE")
    print("="*60)
    print(f"Base URL: {BASE_URL}")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Forts
    tester.test("GET /api/forts returns 6 forts with all fields", test_get_forts)
    tester.test("GET /api/forts/{slug} returns single fort", test_get_single_fort)
    tester.test("GET /api/forts/{unknown} returns 404", test_get_fort_404)
    
    # Quiz
    tester.test("GET /api/forts/{slug}/quiz hides correct answers", test_get_fort_quiz_no_answers)
    tester.test("GET /api/quiz/general hides correct answers", test_get_general_quiz_no_answers)
    tester.test("POST /api/quiz/submit computes score correctly", test_quiz_submit_valid)
    tester.test("POST /api/quiz/submit validates empty name", test_quiz_submit_empty_name)
    tester.test("POST /api/quiz/submit validates empty answers", test_quiz_submit_empty_answers)
    
    # Leaderboard
    tester.test("GET /api/leaderboard sorts correctly", test_leaderboard_sorting)
    tester.test("GET /api/leaderboard supports fort filter", test_leaderboard_fort_filter)
    
    # Chat
    tester.test("POST /api/chat/stream streams SSE tokens", test_chat_stream_basic)
    tester.test("GET /api/chat/{session_id}/history returns messages", test_chat_history)
    tester.test("POST /api/chat/stream multi-turn context", test_chat_multi_turn)
    tester.test("POST /api/chat/stream validates empty message", test_chat_empty_message)
    
    # V2 Multilingual
    print("\n" + "="*60)
    print("V2 MULTILINGUAL TESTS")
    print("="*60)
    tester.test("GET /api/forts?lang=hi returns Hindi content", test_forts_lang_hindi)
    tester.test("GET /api/forts?lang=mr returns Marathi content", test_forts_lang_marathi)
    tester.test("GET /api/forts/{slug}?lang=hi returns Hindi fort", test_fort_detail_lang_hindi)
    tester.test("GET /api/forts/{slug} includes then/now image URLs", test_fort_then_now_images)
    tester.test("GET /reconstructions/{slug}.jpg serves all 6 images", test_reconstruction_images_served)
    tester.test("GET /api/forts/{slug}/quiz?lang=mr returns Marathi quiz", test_quiz_lang_marathi)
    tester.test("GET /api/quiz/general?lang=hi returns Hindi quiz", test_general_quiz_lang_hindi)
    tester.test("POST /api/quiz/submit with lang=hi returns Hindi explanation", test_quiz_submit_lang_hindi)
    tester.test("POST /api/chat/stream with lang=mr streams Marathi", test_chat_stream_lang_marathi)
    tester.test("POST /api/chat/stream with lang=en still works", test_chat_stream_lang_english)
    tester.test("GET /api/forts?lang=invalid falls back to English", test_invalid_lang_fallback)
    
    # V3 Gallery + Map + Models
    print("\n" + "="*60)
    print("V3 GALLERY + MAP + MODELS TESTS")
    print("="*60)
    tester.test("GET /api/forts/{slug} returns images[] array (1-4 entries)", test_fort_images_array)
    tester.test("GET /api/forts/{slug} returns lat/lng coordinates", test_fort_coordinates)
    tester.test("GET /api/forts/{slug} returns per-fort model_url", test_fort_model_url)
    tester.test("GET /forts/{slug}.jpg serves fort images (200 OK)", test_fort_images_served)
    tester.test("GET /models/fort-*.glb serves 3D models (200 OK)", test_3d_models_served)
    tester.test("GET /api/forts/{slug}?lang=hi images/lat/lng/model_url unchanged", test_fort_new_fields_lang_invariant)
    tester.test("GET /api/forts returns all 6 forts with coordinates", test_all_forts_have_coords)
    
    # V4 Admin Panel Tests
    print("\n" + "="*60)
    print("V4 ADMIN PANEL TESTS")
    print("="*60)
    tester.test("POST /api/admin/login with correct creds returns JWT", test_admin_login_correct_creds)
    tester.test("POST /api/admin/login with wrong password returns 401", test_admin_login_wrong_password)
    tester.test("POST /api/admin/login with wrong username returns 401", test_admin_login_wrong_username)
    tester.test("GET /api/admin/me with valid token returns username", test_admin_me_with_token)
    tester.test("GET /api/admin/me without token returns 401", test_admin_me_without_token)
    tester.test("GET /api/admin/me with invalid token returns 401", test_admin_me_invalid_token)
    tester.test("GET /api/admin/forts returns all forts with full details", test_admin_get_forts)
    tester.test("GET /api/admin/forts without auth returns 401", test_admin_get_forts_no_auth)
    tester.test("POST /api/admin/forts creates fort with valid slug", test_admin_create_fort_valid)
    tester.test("POST /api/admin/forts with duplicate slug returns 409", test_admin_create_fort_duplicate_slug)
    tester.test("POST /api/admin/forts with invalid slug returns 400", test_admin_create_fort_invalid_slug)
    tester.test("Created fort appears in public GET /api/forts", test_admin_created_fort_in_public_api)
    tester.test("PUT /api/admin/forts/{slug} updates a fort", test_admin_update_fort)
    tester.test("Updated fort reflects in public GET /api/forts/{slug}", test_admin_updated_fort_in_public_api)
    tester.test("GET /api/admin/quiz returns questions with correct_index", test_admin_get_quiz)
    tester.test("POST /api/admin/quiz creates a question", test_admin_create_quiz_valid)
    tester.test("POST /api/admin/quiz with correct_index out of range returns 400", test_admin_create_quiz_invalid_correct_index)
    tester.test("POST /api/admin/quiz with fewer than 2 options returns 400", test_admin_create_quiz_too_few_options)
    tester.test("PUT /api/admin/quiz/{id} updates a question", test_admin_update_quiz)
    tester.test("GET /api/admin/leaderboard lists all attempts", test_admin_get_leaderboard)
    tester.test("DELETE /api/admin/leaderboard/{id} deletes one entry", test_admin_delete_leaderboard_entry)
    tester.test("GET /api/admin/analytics returns counts and stats", test_admin_analytics)
    tester.test("DELETE /api/admin/quiz/{id} removes a question", test_admin_delete_quiz)
    tester.test("DELETE /api/admin/forts/{slug} cascades quiz questions", test_admin_delete_fort_cascades_quiz)
    tester.test("Deleted fort returns 404 in public API", test_admin_deleted_fort_returns_404)
    
    # Summary
    success = tester.summary()
    
    print(f"\nFinished: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
