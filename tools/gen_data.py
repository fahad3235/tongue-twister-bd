# -*- coding: utf-8 -*-
"""tongue-twister-bd — data generator (run #347).

Source of truth for the twister bank + UI strings, kept in UTF-8 here.
Generates ASCII-only js/data.js and js/i18n.js (Bengali as \\uXXXX escapes)
so the GitHub push (argv transport) can never corrupt non-ASCII text.

Regenerate:  python3 tools/gen_data.py
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

# ---------------------------------------------------------------- bank
# Bangla lines are ORIGINAL practice lines written for this app (not
# claimed as folk/traditional). English lines are classic public-domain
# tongue twisters. Each entry: id, lang, diff, text, rom (romanized, bn only)
TWISTERS = [
    # --- Bangla, Easy (target 3) ---
    {"id": "bn-e1", "lang": "bn", "diff": "easy",
     "text": "কাক কালো, কোকিল কালো", "rom": "Kak kalo, kokil kalo"},
    {"id": "bn-e2", "lang": "bn", "diff": "easy",
     "text": "পাকা পেঁপে পাকা, কাঁচা পেঁপে কাঁচা",
     "rom": "Paka penpe paka, kancha penpe kancha"},
    {"id": "bn-e3", "lang": "bn", "diff": "easy",
     "text": "লাল লাল লালন লাল", "rom": "Lal lal, lalon lal"},
    {"id": "bn-e4", "lang": "bn", "diff": "easy",
     "text": "গাছে গাছে গাছ, ডালে ডালে ডাল",
     "rom": "Gachhe gachhe gachh, dale dale dal"},
    {"id": "bn-e5", "lang": "bn", "diff": "easy",
     "text": "ছোট ছেলে ছোট ছাতা", "rom": "Chhoto chhele, chhoto chhata"},
    {"id": "bn-e6", "lang": "bn", "diff": "easy",
     "text": "তিন তলা তিন তলা", "rom": "Tin tola, tin tola"},
    # --- Bangla, Medium (target 3) ---
    {"id": "bn-m1", "lang": "bn", "diff": "medium",
     "text": "কলা খায় কালা কাকা, কাকা খায় কলা",
     "rom": "Kola khay kala kaka, kaka khay kola"},
    {"id": "bn-m2", "lang": "bn", "diff": "medium",
     "text": "চাঁদে চাঁদনি চকচকে চাঁদ",
     "rom": "Chande chandni chokchoke chand"},
    {"id": "bn-m3", "lang": "bn", "diff": "medium",
     "text": "টক টমেটো টুকটুকে টক", "rom": "Tok tomato tuktuke tok"},
    {"id": "bn-m4", "lang": "bn", "diff": "medium",
     "text": "মাছ মাছের মুখে মাছ, মাছের মুখে মাছ",
     "rom": "Machh machher mukhe machh, machher mukhe machh"},
    {"id": "bn-m5", "lang": "bn", "diff": "medium",
     "text": "নদীর নৌকা নদীর পাড়ে নাচে",
     "rom": "Nodir nouka nodir pare nache"},
    {"id": "bn-m6", "lang": "bn", "diff": "medium",
     "text": "বাবু বলে বাবা বাবু বাবা", "rom": "Babu bole baba babu baba"},
    # --- Bangla, Hard (target 5) ---
    {"id": "bn-h1", "lang": "bn", "diff": "hard",
     "text": "শাপলা শাপলা শ্যামল শাপলা, শাপলার শ্যামল শোভা",
     "rom": "Shapla shapla shyamol shapla, shaplar shyamol shobha"},
    {"id": "bn-h2", "lang": "bn", "diff": "hard",
     "text": "সাপ সাপের সাপুড়ে, সাপুড়ে সাপের সাপ",
     "rom": "Shap shaper shapure, shapure shaper shap"},
    {"id": "bn-h3", "lang": "bn", "diff": "hard",
     "text": "কাক কালো কোকিল কালো, কালো কাকের কা কা কা",
     "rom": "Kak kalo, kokil kalo, kalo kaker ka ka ka"},
    {"id": "bn-h4", "lang": "bn", "diff": "hard",
     "text": "ভাত ভাতের ভাপে ভাত ভাপা", "rom": "Bhat bhater bhaape bhat bhapa"},
    {"id": "bn-h5", "lang": "bn", "diff": "hard",
     "text": "ফুল ফুলের ফুলদানি ফুলে ফুলে ভরা",
     "rom": "Phul phuler phuldani, phule phule bhora"},
    {"id": "bn-h6", "lang": "bn", "diff": "hard",
     "text": "ডিম ডিমের ডালা ডিমে ডিমে ডিম",
     "rom": "Dim dimer dala, dime dime dim"},
    # --- English, Easy (target 3) ---
    {"id": "en-e1", "lang": "en", "diff": "easy",
     "text": "She sells seashells by the seashore.", "rom": ""},
    {"id": "en-e2", "lang": "en", "diff": "easy",
     "text": "Red lorry, yellow lorry.", "rom": ""},
    {"id": "en-e3", "lang": "en", "diff": "easy",
     "text": "Toy boat, toy boat, toy boat, toy boat, toy boat.", "rom": ""},
    {"id": "en-e4", "lang": "en", "diff": "easy",
     "text": "Irish wristwatch.", "rom": ""},
    {"id": "en-e5", "lang": "en", "diff": "easy",
     "text": "Truly rural.", "rom": ""},
    {"id": "en-e6", "lang": "en", "diff": "easy",
     "text": "I scream, you scream, we all scream for ice cream.", "rom": ""},
    # --- English, Medium (target 3) ---
    {"id": "en-m1", "lang": "en", "diff": "medium",
     "text": "Peter Piper picked a peck of pickled peppers.", "rom": ""},
    {"id": "en-m2", "lang": "en", "diff": "medium",
     "text": "How much wood would a woodchuck chuck if a woodchuck could chuck wood?",
     "rom": ""},
    {"id": "en-m3", "lang": "en", "diff": "medium",
     "text": "Betty Botter bought some butter, but she said the butter's bitter.",
     "rom": ""},
    {"id": "en-m4", "lang": "en", "diff": "medium",
     "text": "Fuzzy Wuzzy was a bear. Fuzzy Wuzzy had no hair.", "rom": ""},
    {"id": "en-m5", "lang": "en", "diff": "medium",
     "text": "A big black bug bit a big black bear.", "rom": ""},
    {"id": "en-m6", "lang": "en", "diff": "medium",
     "text": "Which witch wished which wicked wish?", "rom": ""},
    # --- English, Hard (target 5) ---
    {"id": "en-h1", "lang": "en", "diff": "hard",
     "text": "The sixth sick sheik's sixth sheep's sick.", "rom": ""},
    {"id": "en-h2", "lang": "en", "diff": "hard",
     "text": "Can you can a can as a canner can can a can?", "rom": ""},
    {"id": "en-h3", "lang": "en", "diff": "hard",
     "text": "Pad kid poured curd pulled cod.", "rom": ""},
    {"id": "en-h4", "lang": "en", "diff": "hard",
     "text": "One smart fellow, he felt smart. Two smart fellows, they felt smart.",
     "rom": ""},
    {"id": "en-h5", "lang": "en", "diff": "hard",
     "text": "Swan swam over the sea, swim swan swim. Swan swam back again, well swum swan.",
     "rom": ""},
    {"id": "en-h6", "lang": "en", "diff": "hard",
     "text": "A proper copper coffee pot.", "rom": ""},
]

# ---------------------------------------------------------------- i18n
I18N = {
    "en": {
        "title": "Tongue Twister BD",
        "subtitle": "Bangla & English tongue-twister practice — train your tongue, one twist at a time.",
        "tab_library": "Library",
        "tab_practice": "Practice",
        "tab_challenge": "Challenge",
        "tab_stats": "My Progress",
        "search_ph": "Search twisters…",
        "filter_lang": "Language",
        "filter_diff": "Difficulty",
        "all": "All",
        "bangla": "Bangla",
        "english": "English",
        "easy": "Easy",
        "medium": "Medium",
        "hard": "Hard",
        "fav_only": "Favourites only",
        "cat_bn": "Bangla Original",
        "cat_en": "English Classic",
        "practise": "Practise",
        "favourite": "Favourite",
        "best_time": "Best time",
        "attempts": "Attempts",
        "repeat_x": "Repeat {n}×",
        "no_results": "No twisters match your filters.",
        "practice_title": "Practice",
        "practice_hint": "Read the twister aloud {n} times, then tap Done. Say it clearly — speed comes later!",
        "start": "Start",
        "done": "Done — I said it!",
        "again": "Again",
        "stop": "Stop",
        "your_time": "Your time",
        "per_repeat": "per repeat",
        "new_best": "New best time!",
        "pick_first": "Pick a twister from the Library first, or tap Random below.",
        "random": "Random twister",
        "challenge_title": "Today's Challenge",
        "challenge_hint": "One twister a day keeps the tongue-twister away. Finish today's twister to keep your streak alive!",
        "challenge_done": "Today's challenge is done — well done!",
        "streak": "Day streak",
        "stat_practised": "Twisters practised",
        "stat_attempts": "Total attempts",
        "stat_streak": "Current streak",
        "stat_best_streak": "Best streak",
        "stat_favs": "Favourites",
        "stat_days": "Days practised",
        "stat_best_times": "Your best times",
        "no_attempts": "No attempts yet — go practise a twister!",
        "data_title": "Your data",
        "export": "Export data",
        "import": "Import data",
        "erase": "Erase all data",
        "erase_confirm": "Type DELETE to erase everything",
        "erase_done": "All data erased.",
        "erase_cancel": "Erase cancelled.",
        "import_ok": "Data imported.",
        "import_bad": "Import failed: file is not valid Tongue Twister BD data.",
        "disclaimer": "Bangla lines are original practice lines written for this app; English lines are classic public-domain tongue twisters. A speaking-practice toy — not a speech-therapy tool.",
        "made_in": "100% offline — your data never leaves this device.",
        "times_suffix": "times",
        "days_suffix": "days",
    },
    "bn": {
        "title": "জিভের জট বিডি",
        "subtitle": "বাংলা ও ইংরেজি জিভের জট অনুশীলন — একটু একটু করে জিভকে শাণিত করুন।",
        "tab_library": "লাইব্রেরি",
        "tab_practice": "অনুশীলন",
        "tab_challenge": "চ্যালেঞ্জ",
        "tab_stats": "আমার অগ্রগতি",
        "search_ph": "জিভের জট খুঁজুন…",
        "filter_lang": "ভাষা",
        "filter_diff": "কঠিনতা",
        "all": "সব",
        "bangla": "বাংলা",
        "english": "ইংরেজি",
        "easy": "সহজ",
        "medium": "মাঝারি",
        "hard": "কঠিন",
        "fav_only": "শুধু প্রিয়গুলো",
        "cat_bn": "বাংলা মৌলিক",
        "cat_en": "ইংরেজি ক্লাসিক",
        "practise": "অনুশীলন করুন",
        "favourite": "প্রিয়",
        "best_time": "সেরা সময়",
        "attempts": "চেষ্টা",
        "repeat_x": "{n} বার বলুন",
        "no_results": "আপনার ফিল্টারের সঙ্গে কোনো জিভের জট মেলেনি।",
        "practice_title": "অনুশীলন",
        "practice_hint": "জিভের জটটি জোরে {n} বার পড়ুন, তারপর 'শেষ' চাপুন। স্পষ্ট করে বলুন — গতি পরে আসবে!",
        "start": "শুরু করুন",
        "done": "শেষ — বলেছি!",
        "again": "আবার",
        "stop": "থামুন",
        "your_time": "আপনার সময়",
        "per_repeat": "প্রতি বারে",
        "new_best": "নতুন সেরা সময়!",
        "pick_first": "প্রথমে লাইব্রেরি থেকে একটি জিভের জট বেছে নিন, অথবা নিচে 'এলোমেলো' চাপুন।",
        "random": "এলোমেলো জিভের জট",
        "challenge_title": "আজকের চ্যালেঞ্জ",
        "challenge_hint": "প্রতিদিন একটি জিভের জট — ধারাবাহিকতা ধরে রাখতে আজকেরটি শেষ করুন!",
        "challenge_done": "আজকের চ্যালেঞ্জ শেষ — অভিনন্দন!",
        "streak": "দিনের ধারাবাহিকতা",
        "stat_practised": "অনুশীলন করা জিভের জট",
        "stat_attempts": "মোট চেষ্টা",
        "stat_streak": "বর্তমান ধারাবাহিকতা",
        "stat_best_streak": "সেরা ধারাবাহিকতা",
        "stat_favs": "প্রিয়",
        "stat_days": "অনুশীলনের দিন",
        "stat_best_times": "আপনার সেরা সময়",
        "no_attempts": "এখনো কোনো চেষ্টা হয়নি — একটি জিভের জট অনুশীলন করুন!",
        "data_title": "আপনার তথ্য",
        "export": "তথ্য রপ্তানি",
        "import": "তথ্য আমদানি",
        "erase": "সব তথ্য মুছুন",
        "erase_confirm": "সব মুছতে DELETE লিখুন",
        "erase_done": "সব তথ্য মোছা হয়েছে।",
        "erase_cancel": "মোছা বাতিল করা হয়েছে।",
        "import_ok": "তথ্য আমদানি হয়েছে।",
        "import_bad": "আমদানি ব্যর্থ হয়েছে: ফাইলটি বৈধ টাং টুইস্টার বিডি তথ্য নয়।",
        "disclaimer": "বাংলা লাইনগুলো এই অ্যাপের জন্য লেখা মৌলিক অনুশীলন লাইন; ইংরেজি লাইনগুলো প্রচলিত ক্লাসিক জিভের জট। এটি কথা বলার অনুশীলনের খেলনা — বাক-চিকিৎসার যন্ত্র নয়।",
        "made_in": "১০০% অফলাইন — আপনার তথ্য এই ডিভাইস ছাড়িয়ে যায় না।",
        "times_suffix": "বার",
        "days_suffix": "দিন",
    },
}


def js_escape(obj):
    """JSON with ASCII-only escapes - safe for the GitHub push transport."""
    return json.dumps(obj, ensure_ascii=True, indent=2)


def main():
    data_js = (
        "// tongue-twister-bd - twister bank (generated by tools/gen_data.py).\n"
        "// Do not edit by hand: edit tools/gen_data.py and re-run it.\n"
        "// Bangla lines are ORIGINAL practice lines written for this app.\n"
        "// English lines are classic public-domain tongue twisters.\n"
        "var TWISTERS = " + js_escape(TWISTERS) + ";\n"
        "if (typeof module !== 'undefined') module.exports = { TWISTERS: TWISTERS };\n"
    )
    i18n_js = (
        "// tongue-twister-bd - UI strings (generated by tools/gen_data.py).\n"
        "var I18N = " + js_escape(I18N) + ";\n"
        "if (typeof module !== 'undefined') module.exports = { I18N: I18N };\n"
    )
    with open(os.path.join(ROOT, "js", "data.js"), "w", encoding="ascii") as f:
        f.write(data_js)
    with open(os.path.join(ROOT, "js", "i18n.js"), "w", encoding="ascii") as f:
        f.write(i18n_js)
    # safety: output files must be pure ASCII
    for name in ("js/data.js", "js/i18n.js"):
        raw = open(os.path.join(ROOT, name), "rb").read()
        assert all(b < 128 for b in raw), name + " is not pure ASCII"
    print("generated js/data.js (%d twisters) + js/i18n.js (ASCII-only)" % len(TWISTERS))


if __name__ == "__main__":
    main()
