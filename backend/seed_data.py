"""
Authored historical content for KaalChakra V1.
Focus: Chhatrapati Shivaji Maharaj and iconic Maratha Empire forts.

NOTE ON 3D MODELS:
The `.glb` files referenced here (fort-1/2/3.glb) are PLACEHOLDER models used only
to demonstrate the markerless AR / 3D viewer. Replace the files in
`/app/frontend/public/models/` (or update `model_url`) with the real fort .glb scans.
"""

# Representative CC0 fort/castle 3D models (Quaternius, public domain) in
# /app/frontend/public/models/. Swap with real fort .glb scans when available.
# Index 0 = grand castle (towers), index 1 = stone fortress, index 2 = castle.
_PLACEHOLDER_MODELS = ["/models/fort-castle.glb", "/models/fort-fortress.glb", "/models/fort-castle.glb"]

# Real photographs of each fort (Wikimedia Commons), downloaded and served locally
# from /app/frontend/public/forts/{slug}.jpg
_IMG = {
    "shivneri": "/forts/shivneri.jpg",
    "torna": "/forts/torna.jpg",
    "rajgad": "/forts/rajgad.jpg",
    "pratapgad": "/forts/pratapgad.jpg",
    "sinhagad": "/forts/sinhagad.jpg",
    "raigad": "/forts/raigad.jpg",
}


FORTS = [
    {
        "slug": "shivneri",
        "name": "Shivneri",
        "native_name": "शिवनेरी",
        "region": "Junnar, Pune district, Maharashtra",
        "era": "Birthplace • 1630",
        "year_founded": 1630,
        "hook": "The hill fort where Chhatrapati Shivaji Maharaj was born.",
        "image_url": _IMG["shivneri"],
        "model_url": _PLACEHOLDER_MODELS[0],
        "quick_facts": [
            "Birthplace of Shivaji Maharaj (19 February 1630)",
            "Named after the goddess Shivai Devi, after whom Shivaji was named",
            "Protected by seven successive fortified gates",
            "Home to the Badami Talav tank and the 'Ganga-Jamuna' water cisterns",
        ],
        "description": (
            "Shivneri is a triangular hill fort near the town of Junnar in Pune district. It is "
            "revered as the birthplace of Chhatrapati Shivaji Maharaj, who was born here on 19 "
            "February 1630 to Shahaji Bhonsle and Rajmata Jijabai. Ringed by seven successive gates "
            "and steep rock faces, the fort was considered exceptionally safe, which is why Jijabai "
            "chose it for her son's birth. A small temple of the goddess Shivai Devi stands within "
            "the fort, and the young prince was named in her honour."
        ),
        "narration_text": (
            "Welcome to Shivneri, the cradle of a legend. On the nineteenth of February, sixteen "
            "thirty, within these seven-gated ramparts, Rajmata Jijabai gave birth to a child who "
            "would reshape the destiny of the Deccan — Shivaji. He was named after the goddess "
            "Shivai, whose temple still watches over this hill. Here, under his mother's guidance, "
            "the dream of Swarajya, of self-rule, first took root in a young heart."
        ),
        "timeline": [
            {"year": "1630", "title": "Birth of Shivaji", "body": "Shivaji is born to Shahaji Bhonsle and Jijabai within the fort on 19 February 1630."},
            {"year": "1630s", "title": "Early childhood", "body": "The young prince spends his earliest years on Shivneri under the care of his mother Jijabai."},
            {"year": "1642", "title": "Departure to Pune", "body": "Shivaji moves to the Pune jagir, where he begins gathering companions and shaping the vision of Swarajya."},
        ],
    },
    {
        "slug": "torna",
        "name": "Torna",
        "native_name": "तोरणा (प्रचंडगड)",
        "region": "Velhe, Pune district, Maharashtra",
        "era": "First conquest • 1646",
        "year_founded": 1646,
        "hook": "The very first fort Shivaji captured — the seed of Swarajya.",
        "image_url": _IMG["torna"],
        "model_url": _PLACEHOLDER_MODELS[1],
        "quick_facts": [
            "First fort taken by Shivaji, around 1646, aged roughly sixteen",
            "Also called Prachandagad — 'the mighty fort'",
            "Highest hill fort in Pune district (~1,403 m)",
            "Treasure found here is said to have funded nearby Rajgad",
        ],
        "description": (
            "Torna, later renamed Prachandagad ('the colossal fort'), was the first stronghold "
            "seized by a teenage Shivaji around 1646. Its capture is celebrated as the symbolic "
            "beginning of Hindavi Swarajya. Standing over 1,400 metres high, it is the tallest fort "
            "in Pune district. Legend holds that treasure discovered during its repair helped fund "
            "the building of the great capital fort of Rajgad nearby."
        ),
        "narration_text": (
            "Behold Torna — the mighty Prachandagad. It was here, at barely sixteen years of age, "
            "that Shivaji struck his first blow for freedom, capturing this towering fort around "
            "sixteen forty-six. This single act announced to the mighty sultanates that a new power "
            "was rising in the hills. The dream of Swarajya was no longer a whisper; it had become "
            "a fortress of stone."
        ),
        "timeline": [
            {"year": "1646", "title": "First conquest", "body": "A young Shivaji captures Torna, the first fort of the emerging Maratha kingdom."},
            {"year": "1647", "title": "Renamed Prachandagad", "body": "The fort is strengthened and renamed Prachandagad; hidden treasure is said to fund nearby Rajgad."},
        ],
    },
    {
        "slug": "rajgad",
        "name": "Rajgad",
        "native_name": "राजगड",
        "region": "Pune district, Maharashtra",
        "era": "First capital • c.1648–1674",
        "year_founded": 1648,
        "hook": "The 'King of Forts' — capital of Swarajya for nearly 26 years.",
        "image_url": _IMG["rajgad"],
        "model_url": _PLACEHOLDER_MODELS[2],
        "quick_facts": [
            "Served as the first capital of the Maratha kingdom for ~26 years",
            "Name means 'the ruling fort' or King of Forts",
            "Built across three great spurs — Padmavati, Sanjeevani and Suvela Machi",
            "Crowned by the central citadel, the Balekilla",
        ],
        "description": (
            "Rajgad, the 'King of Forts', was the beating heart of the young Maratha kingdom, serving "
            "as its capital for almost twenty-six years before the seat of power moved to Raigad in "
            "1674. Its immense form spreads across three fortified spurs — Padmavati, Sanjeevani and "
            "Suvela Machi — all guarded by the central citadel known as the Balekilla. From here "
            "Shivaji planned campaigns, administered his growing realm, and raised his family."
        ),
        "narration_text": (
            "This is Rajgad, the King of Forts. For nearly twenty-six years these ramparts sheltered "
            "the capital of Swarajya. Across its three great arms — Padmavati, Sanjeevani and Suvela "
            "— soldiers drilled, ministers governed, and a kingdom was forged. Long before Raigad "
            "wore the crown, it was Rajgad that ruled the Sahyadri hills."
        ),
        "timeline": [
            {"year": "c.1648", "title": "Capital established", "body": "Shivaji develops Rajgad as the principal seat of the Maratha kingdom."},
            {"year": "1660s", "title": "Heart of Swarajya", "body": "Rajgad becomes the administrative and military hub from which campaigns are directed."},
            {"year": "1674", "title": "Capital shifts to Raigad", "body": "The capital moves to Raigad ahead of Shivaji's coronation as Chhatrapati."},
        ],
    },
    {
        "slug": "pratapgad",
        "name": "Pratapgad",
        "native_name": "प्रतापगड",
        "region": "Satara district, near Mahabaleshwar",
        "era": "Battle of Pratapgad • 1659",
        "year_founded": 1656,
        "hook": "Where Shivaji's daring defeated the Adilshahi general Afzal Khan.",
        "image_url": _IMG["pratapgad"],
        "model_url": _PLACEHOLDER_MODELS[1],
        "quick_facts": [
            "Built in 1656 by Moropant Trimbak Pingle",
            "Site of the Battle of Pratapgad, 10 November 1659",
            "Shivaji outwitted and defeated the powerful general Afzal Khan here",
            "Home to the revered Bhavani temple",
        ],
        "description": (
            "Perched above the Konkan escarpment near Mahabaleshwar, Pratapgad was raised in 1656 by "
            "Shivaji's minister Moropant Trimbak Pingle. It is forever linked to the Battle of "
            "Pratapgad on 10 November 1659, when Shivaji met the towering Adilshahi commander Afzal "
            "Khan at the foot of the fort. Sensing treachery, Shivaji defended himself with concealed "
            "weapons and turned the encounter into a decisive Maratha victory that stunned the Deccan."
        ),
        "narration_text": (
            "Welcome to Pratapgad, fortress of valour and cunning. In November of sixteen fifty-nine, "
            "the mighty general Afzal Khan came with a great army, certain he would crush the young "
            "Shivaji. But at the foot of these walls, courage and quick wit turned the tables. "
            "Shivaji's victory here echoed across every sultanate — proof that the Maratha lion could "
            "not be tamed."
        ),
        "timeline": [
            {"year": "1656", "title": "Fort constructed", "body": "Pratapgad is built by Moropant Trimbak Pingle on Shivaji's orders."},
            {"year": "1659", "title": "Battle of Pratapgad", "body": "On 10 November, Shivaji defeats and kills Afzal Khan, scattering the Adilshahi army."},
        ],
    },
    {
        "slug": "sinhagad",
        "name": "Sinhagad",
        "native_name": "सिंहगड (कोंढाणा)",
        "region": "Pune district, Maharashtra",
        "era": "Battle of Sinhagad • 1670",
        "year_founded": 1670,
        "hook": "\"The fort is won, but the lion is lost\" — the sacrifice of Tanaji Malusare.",
        "image_url": _IMG["sinhagad"],
        "model_url": _PLACEHOLDER_MODELS[1],
        "quick_facts": [
            "Formerly known as Kondhana",
            "Recaptured in the daring night assault of 4 February 1670",
            "Led by Shivaji's commander Tanaji Malusare, who fell in battle",
            "Renamed Sinhagad — 'the Lion's Fort' — in his honour",
        ],
        "description": (
            "Once called Kondhana, Sinhagad guards the hills south-west of Pune. In the legendary "
            "night assault of 4 February 1670, Shivaji's trusted commander Tanaji Malusare scaled "
            "the sheer cliffs to recapture the fort from the Mughals. The Marathas won, but Tanaji "
            "fell in the fighting. On hearing the news, a grieving Shivaji is said to have spoken the "
            "immortal words, 'Gad aala, pan Sinha gela' — 'The fort is won, but the lion is lost.' "
            "In his honour the fort was renamed Sinhagad, the Lion's Fort."
        ),
        "narration_text": (
            "You stand upon Sinhagad, the Lion's Fort. On a moonless night in sixteen seventy, the "
            "fearless Tanaji Malusare climbed these very cliffs to reclaim Kondhana. Victory was won, "
            "but Tanaji laid down his life. When word reached Shivaji, he mourned, 'The fort is won, "
            "but the lion is lost.' And so Kondhana became Sinhagad — a name that carries a hero's "
            "sacrifice through the ages."
        ),
        "timeline": [
            {"year": "1670", "title": "Night assault on Kondhana", "body": "Tanaji Malusare scales the cliffs on 4 February 1670 and recaptures the fort from the Mughals."},
            {"year": "1670", "title": "Renamed Sinhagad", "body": "After Tanaji's death, Shivaji renames the fort Sinhagad, 'the Lion's Fort', in his memory."},
        ],
    },
    {
        "slug": "raigad",
        "name": "Raigad",
        "native_name": "रायगड",
        "region": "Raigad district, Maharashtra",
        "era": "Coronation & capital • 1674",
        "year_founded": 1674,
        "hook": "The royal capital where Shivaji was crowned Chhatrapati.",
        "image_url": _IMG["raigad"],
        "model_url": _PLACEHOLDER_MODELS[2],
        "quick_facts": [
            "Capital of the Maratha kingdom from 1674",
            "Shivaji's coronation as Chhatrapati on 6 June 1674",
            "Designed and fortified by the architect Hiroji Indulkar",
            "Houses the royal court (Rajsabha), the great bazaar and the Jagadishwar temple",
        ],
        "description": (
            "Raigad, rising on a lofty plateau in the Konkan, became the capital of the Maratha "
            "kingdom and the stage for its greatest moment. On 6 June 1674, Shivaji was crowned "
            "Chhatrapati here in a grand ceremony, formally establishing a sovereign Hindavi Swarajya. "
            "Fortified by the master architect Hiroji Indulkar, Raigad held the royal court of the "
            "Rajsabha, a bustling market street, water reservoirs and the Jagadishwar temple. Shivaji "
            "Maharaj breathed his last here in 1680."
        ),
        "narration_text": (
            "At last we reach Raigad, the throne of Swarajya. On the sixth of June, sixteen "
            "seventy-four, amid conches and chants, Shivaji was crowned Chhatrapati upon this plateau "
            "— a sovereign king answerable to no sultan or emperor. From the royal court of the "
            "Rajsabha he ruled a free kingdom. It was here, in sixteen eighty, that the great king's "
            "journey came to its end, but his legend had only begun."
        ),
        "timeline": [
            {"year": "1674", "title": "Coronation as Chhatrapati", "body": "On 6 June 1674, Shivaji is crowned Chhatrapati at Raigad, founding a sovereign Maratha kingdom."},
            {"year": "1674", "title": "Capital of Swarajya", "body": "Raigad becomes the administrative and ceremonial capital, with the Rajsabha court and grand bazaar."},
            {"year": "1680", "title": "Passing of Shivaji Maharaj", "body": "Chhatrapati Shivaji Maharaj passes away at Raigad in 1680, leaving an enduring legacy."},
        ],
    },
]


# Quiz questions. correct_index is 0-based and is NEVER exposed via the public quiz endpoint.
QUIZ_QUESTIONS = [
    # Shivneri
    {"fort_slug": "shivneri", "prompt": "At which fort was Chhatrapati Shivaji Maharaj born?", "options": ["Raigad", "Shivneri", "Pratapgad", "Sinhagad"], "correct_index": 1, "explanation": "Shivaji Maharaj was born at Shivneri fort on 19 February 1630."},
    {"fort_slug": "shivneri", "prompt": "After whom was Shivaji named?", "options": ["Goddess Bhavani", "Goddess Shivai Devi", "River Ganga", "Saint Ramdas"], "correct_index": 1, "explanation": "He was named after the goddess Shivai Devi, whose temple stands on Shivneri."},
    {"fort_slug": "shivneri", "prompt": "Who was Shivaji Maharaj's mother?", "options": ["Rajmata Jijabai", "Saibai", "Soyarabai", "Putalabai"], "correct_index": 0, "explanation": "Rajmata Jijabai, his mother, nurtured the dream of Swarajya in him."},
    # Torna
    {"fort_slug": "torna", "prompt": "Which was the first fort captured by Shivaji Maharaj?", "options": ["Rajgad", "Torna", "Raigad", "Sinhagad"], "correct_index": 1, "explanation": "Torna, captured around 1646, was his first fort and the symbolic start of Swarajya."},
    {"fort_slug": "torna", "prompt": "By what other name is Torna known?", "options": ["Prachandagad", "Sinhagad", "Suvarnadurg", "Kondhana"], "correct_index": 0, "explanation": "Torna was renamed Prachandagad, meaning 'the colossal fort'."},
    # Rajgad
    {"fort_slug": "rajgad", "prompt": "For roughly how long did Rajgad serve as the Maratha capital?", "options": ["About 5 years", "About 26 years", "About 50 years", "About 10 years"], "correct_index": 1, "explanation": "Rajgad was the capital for nearly 26 years before it shifted to Raigad in 1674."},
    {"fort_slug": "rajgad", "prompt": "Which is NOT one of the three machis (spurs) of Rajgad?", "options": ["Padmavati", "Sanjeevani", "Suvela", "Bhavani"], "correct_index": 3, "explanation": "Rajgad's three machis are Padmavati, Sanjeevani and Suvela."},
    # Pratapgad
    {"fort_slug": "pratapgad", "prompt": "Which Adilshahi general did Shivaji defeat at Pratapgad in 1659?", "options": ["Shaista Khan", "Afzal Khan", "Siddi Jauhar", "Mirza Raje Jai Singh"], "correct_index": 1, "explanation": "Shivaji defeated Afzal Khan at the Battle of Pratapgad on 10 November 1659."},
    {"fort_slug": "pratapgad", "prompt": "In which year was Pratapgad fort built?", "options": ["1646", "1656", "1674", "1680"], "correct_index": 1, "explanation": "Pratapgad was built in 1656 by Moropant Trimbak Pingle."},
    # Sinhagad
    {"fort_slug": "sinhagad", "prompt": "Who led the famous night assault to recapture Sinhagad (Kondhana) in 1670?", "options": ["Baji Prabhu Deshpande", "Tanaji Malusare", "Netaji Palkar", "Yesaji Kank"], "correct_index": 1, "explanation": "Tanaji Malusare led the assault in 1670 and died winning the fort."},
    {"fort_slug": "sinhagad", "prompt": "What was Sinhagad originally called?", "options": ["Kondhana", "Prachandagad", "Torna", "Purandar"], "correct_index": 0, "explanation": "It was originally called Kondhana and renamed Sinhagad after Tanaji's sacrifice."},
    {"fort_slug": "sinhagad", "prompt": "Which famous words did Shivaji speak after the battle of Sinhagad?", "options": ["\"Jai Bhavani, Jai Shivaji\"", "\"The fort is won, but the lion is lost\"", "\"Swarajya is my birthright\"", "\"Victory belongs to the brave\""], "correct_index": 1, "explanation": "'Gad aala pan Sinha gela' — 'The fort is won, but the lion is lost' — mourning Tanaji."},
    # Raigad
    {"fort_slug": "raigad", "prompt": "In which year was Shivaji crowned Chhatrapati at Raigad?", "options": ["1659", "1670", "1674", "1680"], "correct_index": 2, "explanation": "Shivaji was crowned Chhatrapati at Raigad on 6 June 1674."},
    {"fort_slug": "raigad", "prompt": "Which architect fortified and designed Raigad?", "options": ["Hiroji Indulkar", "Moropant Pingle", "Baji Prabhu", "Annaji Datto"], "correct_index": 0, "explanation": "The architect Hiroji Indulkar designed and fortified Raigad."},
    {"fort_slug": "raigad", "prompt": "Raigad served primarily as the ___ of the Maratha kingdom.", "options": ["birthplace", "capital", "prison", "port"], "correct_index": 1, "explanation": "Raigad was the capital of the Maratha kingdom from 1674."},
    # General
    {"fort_slug": None, "prompt": "What does 'Swarajya' mean, the ideal Shivaji fought for?", "options": ["Self-rule / self-governance", "Holy war", "Trade route", "Royal treasury"], "correct_index": 0, "explanation": "Swarajya means self-rule — a sovereign kingdom free of foreign sultanates."},
    {"fort_slug": None, "prompt": "What title did Shivaji take at his 1674 coronation?", "options": ["Sultan", "Chhatrapati", "Peshwa", "Nawab"], "correct_index": 1, "explanation": "He took the title Chhatrapati, meaning 'paramount sovereign'."},
    {"fort_slug": None, "prompt": "Which mountain range is home to most of Shivaji's forts?", "options": ["Himalayas", "Aravalli", "Sahyadri (Western Ghats)", "Vindhya"], "correct_index": 2, "explanation": "Most Maratha hill forts lie in the Sahyadri range, the Western Ghats."},
    {"fort_slug": None, "prompt": "In which year did Chhatrapati Shivaji Maharaj pass away?", "options": ["1674", "1680", "1707", "1650"], "correct_index": 1, "explanation": "Shivaji Maharaj passed away at Raigad in 1680."},
]
