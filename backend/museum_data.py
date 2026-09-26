"""
KaalChakra — Museum / Heritage Collection content.

Curated, educational content on the Maratha Empire's kings, weapons, coins and
other artifacts. Photos are sourced from Wikimedia Commons (see
gather_museum_photos.py) and translations generated via
generate_museum_translations.py -> museum_translations.json.

The app supplies small, original illustrative `.glb` models for each starter item.
They are educational visualizations, not authenticated scans or portraits. Their
`model_url` values can be changed or removed in the Admin panel.
"""

# Category metadata (order matters for display).
CATEGORIES = [
    {
        "slug": "kings",
        "name": "Kings",
        "native_name": "छत्रपती",
        "tagline": "The Chhatrapatis and rulers who carried Swarajya forward.",
        "icon": "crown",
    },
    {
        "slug": "weapons",
        "name": "Weapons",
        "native_name": "शस्त्रे",
        "tagline": "The blades, claws and shields of the Maratha warrior.",
        "icon": "swords",
    },
    {
        "slug": "coins",
        "name": "Coins",
        "native_name": "नाणी",
        "tagline": "Currency struck by a sovereign Maratha kingdom.",
        "icon": "coins",
    },
    {
        "slug": "artifacts",
        "name": "Artifacts",
        "native_name": "वस्तू",
        "tagline": "Seals, armour and emblems of the Maratha court.",
        "icon": "landmark",
    },
]


# Each item: slug, category, name, native_name, era (short label), hook (one line),
# description (2-4 sentences), quick_facts[], wiki (Wikimedia Commons search query),
# model_url (optional 3D model).
ITEMS = [
    # ------------------------- KINGS -------------------------
    {
        "slug": "shivaji-maharaj",
        "category": "kings",
        "name": "Chhatrapati Shivaji Maharaj",
        "native_name": "छत्रपती शिवाजी महाराज",
        "era": "Founder • r. 1674–1680",
        "hook": "Founder of the Maratha kingdom and the architect of Hindavi Swarajya.",
        "description": (
            "Chhatrapati Shivaji Maharaj (1630–1680) founded the Maratha kingdom, carving out a "
            "sovereign realm from the mighty Adilshahi and Mughal empires. A brilliant strategist, "
            "he pioneered guerrilla warfare (Ganimi Kava), built a powerful navy, and established a "
            "just, well-administered state. He was crowned Chhatrapati at Raigad on 6 June 1674, "
            "formally founding Hindavi Swarajya."
        ),
        "quick_facts": [
            "Born at Shivneri fort on 19 February 1630",
            "Crowned Chhatrapati at Raigad on 6 June 1674",
            "Pioneered guerrilla warfare — 'Ganimi Kava'",
            "Founded the Maratha navy to guard the Konkan coast",
        ],
        "wiki": "Shivaji Maharaj painting portrait",
    },
    {
        "slug": "sambhaji-maharaj",
        "category": "kings",
        "name": "Chhatrapati Sambhaji Maharaj",
        "native_name": "छत्रपती संभाजी महाराज",
        "era": "2nd Chhatrapati • r. 1681–1689",
        "hook": "The valiant warrior-poet who defied Aurangzeb for nine years.",
        "description": (
            "Chhatrapati Sambhaji Maharaj (1657–1689), the eldest son of Shivaji Maharaj, was the "
            "second ruler of the Maratha kingdom. A skilled warrior and accomplished scholar who "
            "wrote in Sanskrit and Hindi, he fought the Mughal emperor Aurangzeb relentlessly, never "
            "losing a fort in open battle. Captured through treachery, he was executed in 1689 but "
            "his defiance became legendary."
        ),
        "quick_facts": [
            "Eldest son of Shivaji Maharaj, born 14 May 1657",
            "Authored the Sanskrit work 'Budhbhushanam'",
            "Fought Aurangzeb's full imperial army for nearly 9 years",
            "Remembered as 'Dharmaveer' for his sacrifice",
        ],
        "wiki": "Sambhaji Maharaj painting",
    },
    {
        "slug": "rajaram-maharaj",
        "category": "kings",
        "name": "Chhatrapati Rajaram Maharaj",
        "native_name": "छत्रपती राजाराम महाराज",
        "era": "3rd Chhatrapati • r. 1689–1700",
        "hook": "Kept Swarajya alive from Jinji during the long Mughal war.",
        "description": (
            "Chhatrapati Rajaram Maharaj (1670–1700), younger son of Shivaji Maharaj, led the "
            "Maratha resistance after Sambhaji's death. He shifted the struggle south to the fort of "
            "Jinji (Gingee), keeping the kingdom alive through the darkest years of the war with "
            "Aurangzeb. His leadership ensured the survival of the Maratha state."
        ),
        "quick_facts": [
            "Younger son of Shivaji Maharaj, born 24 February 1670",
            "Directed the resistance from Jinji fort in the south",
            "Sustained Swarajya through the 27-year Mughal war",
            "Instituted the council that governed in his absence",
        ],
        "wiki": "Rajaram Bhonsle Maratha",
    },
    {
        "slug": "tararani",
        "category": "kings",
        "name": "Maharani Tararani",
        "native_name": "महाराणी ताराराणी",
        "era": "Regent-Queen • 1700–1707",
        "hook": "The warrior-queen who rallied the Marathas against Aurangzeb.",
        "description": (
            "Maharani Tararani (1675–1761), widow of Rajaram, took command of the Maratha resistance "
            "after his death in 1700. A formidable strategist and administrator, she personally "
            "directed campaigns against the Mughals, so troubling Aurangzeb that even he acknowledged "
            "her resolve. She is celebrated as one of the great women rulers of Indian history."
        ),
        "quick_facts": [
            "Led the Maratha war effort after Rajaram's death in 1700",
            "Personally organised and directed military campaigns",
            "Rallied the Marathas in the final years against Aurangzeb",
            "Later founded the Kolhapur line of the royal house",
        ],
        "wiki": "Tarabai Maratha queen",
    },
    {
        "slug": "shahu-maharaj",
        "category": "kings",
        "name": "Chhatrapati Shahu Maharaj",
        "native_name": "छत्रपती शाहू महाराज",
        "era": "Chhatrapati • r. 1707–1749",
        "hook": "Under whom the Maratha power expanded across India via the Peshwas.",
        "description": (
            "Chhatrapati Shahu Maharaj (1682–1749), grandson of Shivaji Maharaj, was released by the "
            "Mughals in 1707 and became Chhatrapati after a period of succession struggle. During his "
            "long reign he empowered the Peshwas, notably Balaji Vishwanath and Bajirao I, under whom "
            "Maratha influence expanded dramatically across the Indian subcontinent."
        ),
        "quick_facts": [
            "Grandson of Shivaji Maharaj; son of Sambhaji Maharaj",
            "Held captive by the Mughals from childhood until 1707",
            "Elevated the office of the Peshwa (prime minister)",
            "Reign saw the rise of Bajirao I and Maratha expansion",
        ],
        "wiki": "Shahu Bhonsle Maratha",
    },

    # ------------------------- WEAPONS -------------------------
    {
        "slug": "bhavani-talwar",
        "category": "weapons",
        "name": "Bhavani Talwar",
        "native_name": "भवानी तलवार",
        "era": "Sword",
        "hook": "Shivaji Maharaj's revered curved sword, blessed by Goddess Bhavani.",
        "description": (
            "The Bhavani Talwar was the famed sword of Chhatrapati Shivaji Maharaj, named in honour "
            "of the family deity, Goddess Bhavani. A curved single-edged blade of exceptional quality, "
            "it became a symbol of divine sanction for Swarajya. In Maratha tradition the sword "
            "embodied the courage and righteousness of the king who wielded it."
        ),
        "quick_facts": [
            "Named after the goddess Bhavani, the Bhonsle family deity",
            "A curved, single-edged 'talwar' war sword",
            "A lasting symbol of Shivaji Maharaj's valour",
            "Associated with the war cry 'Har Har Mahadev'",
        ],
        "wiki": "Talwar Indian sword",
    },
    {
        "slug": "wagh-nakh",
        "category": "weapons",
        "name": "Wagh Nakh (Tiger Claws)",
        "native_name": "वाघनखे",
        "era": "Concealed weapon",
        "hook": "The clawed 'tiger nails' Shivaji used against Afzal Khan.",
        "description": (
            "The Wagh Nakh ('tiger claws') is a concealed close-combat weapon of curved metal blades "
            "fitted over the fingers or palm. It is famously linked to the encounter at Pratapgad in "
            "1659, where Shivaji Maharaj used it to defend himself against the Adilshahi general Afzal "
            "Khan. Small enough to hide in the hand, it turned a treacherous embrace into a decisive "
            "moment of Maratha history."
        ),
        "quick_facts": [
            "A 'fist-load' of curved claws worn across the fingers",
            "Designed to be hidden in the palm",
            "Linked to Shivaji's defence against Afzal Khan (1659)",
            "One example is preserved in a museum collection",
        ],
        "wiki": "Bagh nakh tiger claw",
    },
    {
        "slug": "dhal",
        "category": "weapons",
        "name": "Dhal (Shield)",
        "native_name": "ढाल",
        "era": "Shield",
        "hook": "The round buckler that guarded the Maratha warrior.",
        "description": (
            "The Dhal was the round shield carried by Maratha soldiers, typically made of hardened "
            "leather (from buffalo or rhino hide) or steel, and fitted with metal bosses. Light yet "
            "strong, it was paired with the talwar or patta in the fast, mobile fighting style the "
            "Marathas mastered in their hill country."
        ),
        "quick_facts": [
            "A round buckler of hide or steel",
            "Often mounted with four metal bosses",
            "Paired with the sword in close combat",
            "Suited the Marathas' swift, mobile warfare",
        ],
        "wiki": "Indian shield dhal steel",
    },
    {
        "slug": "patta",
        "category": "weapons",
        "name": "Patta (Gauntlet Sword)",
        "native_name": "पट्टा (दांडपट्टा)",
        "era": "Gauntlet sword",
        "hook": "The gauntleted long sword — a signature Maratha weapon.",
        "description": (
            "The Patta is a long, straight, double-edged sword whose hilt extends into a steel "
            "gauntlet that encases the hand and forearm. Requiring great skill, it was wielded by "
            "elite Maratha warriors — often two at a time — in the martial art of dandpatta. It "
            "offered both formidable reach and hand protection."
        ),
        "quick_facts": [
            "A straight blade with an integrated gauntlet hilt",
            "Protects the entire hand and forearm",
            "Central to the martial art 'dandpatta'",
            "Skilled warriors fought with one in each hand",
        ],
        "wiki": "Pata gauntlet sword India",
    },
    {
        "slug": "bichwa",
        "category": "weapons",
        "name": "Bichwa (Dagger)",
        "native_name": "बिछवा",
        "era": "Dagger",
        "hook": "A wavy, scorpion-shaped dagger for the closest of fights.",
        "description": (
            "The Bichwa ('scorpion sting') is a small dagger with a distinctive undulating, "
            "double-curved blade and a looped handle. Easily concealed, it was a favoured close-quarters "
            "and self-defence weapon in the Deccan. Its recurved blade could inflict deep wounds in a "
            "single thrust."
        ),
        "quick_facts": [
            "Name means 'scorpion' — after its curved sting-like blade",
            "A looped-handle dagger for a firm grip",
            "Easy to conceal for close-quarters defence",
            "Sometimes combined with wagh nakh",
        ],
        "wiki": "Bichuwa dagger India",
    },
    {
        "slug": "vita",
        "category": "weapons",
        "name": "Vita (Corseque)",
        "native_name": "विटा",
        "era": "Throwing spear",
        "hook": "A tethered throwing spear the wielder could pull back.",
        "description": (
            "The Vita was a throwing spear fitted with a long cord tied to the wielder's wrist, "
            "allowing the weapon to be hurled at an enemy and then retrieved. This ingenious design "
            "gave Maratha foot soldiers a reusable ranged weapon in the rugged Sahyadri terrain."
        ),
        "quick_facts": [
            "A spear attached to a retrievable cord",
            "Could be thrown and pulled back for reuse",
            "Effective for mobile skirmishing",
            "Demanded considerable practice to master",
        ],
        "wiki": "Indian javelin spear steel",
    },

    # ------------------------- COINS -------------------------
    {
        "slug": "shivrai",
        "category": "coins",
        "name": "Shivrai",
        "native_name": "शिवराई",
        "era": "Copper coin",
        "hook": "The everyday copper coin of Shivaji Maharaj's kingdom.",
        "description": (
            "The Shivrai was the copper coin issued by Chhatrapati Shivaji Maharaj, the common "
            "currency of daily trade in Swarajya. It typically bore the legend 'Shri Raja Shiv' on "
            "one face and 'Chhatrapati' on the other, in Devanagari script — a proud assertion of "
            "sovereign, independent coinage."
        ),
        "quick_facts": [
            "Copper coin of the Maratha kingdom",
            "Inscribed 'Shri Raja Shiv' / 'Chhatrapati'",
            "Legends struck in Devanagari script",
            "Symbol of independent Maratha sovereignty",
        ],
        "wiki": "Shivrai copper coin",
    },
    {
        "slug": "hon",
        "category": "coins",
        "name": "Hon (Gold Pagoda)",
        "native_name": "होन",
        "era": "Gold coin",
        "hook": "The gold pagoda used for high-value trade and the treasury.",
        "description": (
            "The Hon (also called a pagoda) was the gold coin of the Maratha kingdom, used for "
            "high-value transactions, tribute and the royal treasury. Like the Shivrai, the Shivrai-era "
            "Hon carried royal legends, and it circulated widely across the Deccan trade networks."
        ),
        "quick_facts": [
            "High-value gold coin ('pagoda')",
            "Used for treasury, tribute and large trade",
            "Carried royal Maratha legends",
            "Circulated across Deccan trade routes",
        ],
        "wiki": "gold pagoda coin India",
    },
    {
        "slug": "shivrai-rupaya",
        "category": "coins",
        "name": "Rupaya (Silver)",
        "native_name": "रुपया",
        "era": "Silver coin",
        "hook": "The silver rupee of Maratha mints for major commerce.",
        "description": (
            "Silver rupaya coins formed the backbone of larger commercial exchange in the Maratha "
            "economy. Struck at various Maratha mints, they reflected the kingdom's growing trade and "
            "administrative reach across western and central India."
        ),
        "quick_facts": [
            "Silver coin for major commercial exchange",
            "Struck at several Maratha mints",
            "Backbone of large-scale trade",
            "Reflected the kingdom's expanding economy",
        ],
        "wiki": "Maratha rupee silver coin",
    },
    {
        "slug": "larin",
        "category": "coins",
        "name": "Larin",
        "native_name": "लारीन",
        "era": "Trade coin",
        "hook": "A hook-shaped silver coin used in Konkan coastal trade.",
        "description": (
            "The Larin was a distinctive hook- or fish-hook-shaped silver trade coin used along the "
            "western coast, including the Konkan ports linked to the Maratha navy. Its unusual bent "
            "form made it recognisable across the Indian Ocean maritime trade."
        ),
        "quick_facts": [
            "A bent, hook-shaped silver trade coin",
            "Used in Konkan and Indian Ocean coastal trade",
            "Recognised across maritime markets",
            "Tied to the Maratha naval coast economy",
        ],
        "wiki": "Larin silver coin",
    },

    # ------------------------- ARTIFACTS -------------------------
    {
        "slug": "rajmudra",
        "category": "artifacts",
        "name": "Rajmudra (Royal Seal)",
        "native_name": "राजमुद्रा",
        "era": "Royal seal",
        "hook": "Shivaji Maharaj's octagonal Sanskrit seal of state.",
        "description": (
            "The Rajmudra was the official royal seal of Chhatrapati Shivaji Maharaj, used to "
            "authenticate royal decrees. Its Sanskrit inscription declares that just as the crescent "
            "moon grows, so shall this seal of Shivaji, son of Shahaji, flourish for the welfare of "
            "the people — a statement of benevolent, sovereign rule."
        ),
        "quick_facts": [
            "The official seal of state of Shivaji Maharaj",
            "Bears a Sanskrit inscription (not Persian)",
            "Declares rule 'for the welfare of the people'",
            "Adopted while Shivaji was still very young",
        ],
        "wiki": "Rajmudra Shivaji royal seal",
    },
    {
        "slug": "jiretop",
        "category": "artifacts",
        "name": "Jiretop (Helmet)",
        "native_name": "जिरेटोप",
        "era": "Armour • Helmet",
        "hook": "The pointed battle helmet of the Maratha warrior.",
        "description": (
            "The Jiretop was the war helmet worn by Maratha soldiers and commanders — typically a "
            "domed or pointed steel cap, often with a sliding nasal guard and mail or plates to "
            "protect the neck. It shielded the head in the fierce hill battles of the Sahyadri."
        ),
        "quick_facts": [
            "Domed or pointed steel battle helmet",
            "Often fitted with a nasal guard",
            "Neck protected by mail or plates",
            "Worn by soldiers and commanders alike",
        ],
        "wiki": "Indian war helmet steel",
        "model_url": "/models/artifact-helmet.glb",
    },
    {
        "slug": "chilkhat",
        "category": "artifacts",
        "name": "Chilkhat (Armour)",
        "native_name": "चिलखत",
        "era": "Body armour",
        "hook": "Mail-and-plate armour that guarded the Maratha soldier.",
        "description": (
            "Chilkhat refers to the body armour of the Maratha warrior, commonly a coat combining "
            "riveted mail with steel plates (mail-and-plate armour). Flexible enough for the swift "
            "Maratha style of fighting yet strong against sword and arrow, it was a prized piece of "
            "a soldier's equipment."
        ),
        "quick_facts": [
            "Coat of riveted mail combined with steel plates",
            "Balanced protection with mobility",
            "Defended against sword cuts and arrows",
            "A valued part of a warrior's kit",
        ],
        "wiki": "Indian mail plate armour",
    },
    {
        "slug": "bhagwa-dhwaj",
        "category": "artifacts",
        "name": "Bhagwa Dhwaj (Saffron Flag)",
        "native_name": "भगवा ध्वज",
        "era": "Royal standard",
        "hook": "The saffron banner that flew over the forts of Swarajya.",
        "description": (
            "The Bhagwa Dhwaj, the saffron flag, was the standard of the Maratha kingdom. Its deep "
            "saffron colour symbolised sacrifice, courage and renunciation, and it flew proudly over "
            "the hill forts of Swarajya. It remains an enduring emblem of Maratha pride and identity."
        ),
        "quick_facts": [
            "The saffron royal standard of the Marathas",
            "Saffron symbolises sacrifice and courage",
            "Flew over the forts of Swarajya",
            "An enduring emblem of Maratha identity",
        ],
        "wiki": "Maratha empire flag saffron",
    },
]
