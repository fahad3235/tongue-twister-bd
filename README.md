# Tongue Twister BD

**Bangla & English tongue-twister practice — train your tongue, one twist at a time.**

An offline, bilingual (EN/বাংলা) tongue-twister practice app for Bangladesh.
Browse 36 twisters, practise them against the clock, take the daily
challenge, and track your streak — all without an account and without
the internet.

Live site: https://fahad3235.github.io/tongue-twister-bd/

## Features

- **Twister library (36)** — 18 Bangla + 18 English, in 3 difficulties
  (Easy / Medium / Hard), with category badges, repeat targets and
  romanized readings for every Bangla line.
- **Search & filters** — full-text search (Bangla, romanized, or English),
  language filter, difficulty filter, favourites-only view.
- **Practice mode** — pick any twister, read it aloud the target number of
  times (3× Easy/Medium, 5× Hard), tap Done: your time, per-repeat
  average and new-best badge are recorded.
- **Daily challenge** — one deterministic twister per day; finishing it
  keeps your day streak alive.
- **Favourites** — star twisters to build your own practice set.
- **My Progress** — twisters practised, total attempts, current/best
  streak, days practised, and a best-times leaderboard.
- **Your data, your device** — JSON export / strict import, typed-DELETE
  erase-all. Everything lives in `localStorage`; zero network requests.
- **EN/বাংলা UI toggle** (persisted) with Bengali digits; responsive
  down to 390px.

## About the content

- **Bangla lines are original practice lines written for this app** —
  they are wordplay exercises, not claimed folk/traditional sayings.
- **English lines are classic public-domain tongue twisters**
  (e.g. "She sells seashells by the seashore").
- This is a speaking-practice toy, not a speech-therapy tool.

## Tech stack

- Plain HTML + CSS + vanilla JavaScript — no frameworks, no build step,
  no backend, no dependencies.
- `js/data.js` + `js/i18n.js` are generated ASCII-only files
  (Bengali as `\uXXXX` escapes) by `tools/gen_data.py`, so the source
  stays safe across every transport. Regenerate with:
  `python3 tools/gen_data.py`

## Run locally

```bash
# any static server, e.g.
python3 -m http.server 8000
# open http://localhost:8000
```

Or just open `index.html` in a browser — classic scripts, no modules,
so `file://` works too.

## Tests

```bash
node --test tests/logic.test.mjs   # 14 unit tests (pure logic)
# headless-Chrome smoke test (needs Chrome with --remote-debugging-port=9222):
node tests/smoke.mjs .
```

## Project structure

```
index.html            App shell (ASCII only; Bengali comes from js/i18n.js)
css/styles.css        Styles
js/data.js            Twister bank (generated, ASCII-only)
js/i18n.js            EN/BN UI strings (generated, ASCII-only)
js/logic.js           Pure logic: filters, timer math, streaks, import validation
js/app.js             DOM wiring
tools/gen_data.py     Source of truth for the bank + strings (UTF-8)
tests/logic.test.mjs  Node unit tests
tests/smoke.mjs       Headless-Chrome smoke tests (raw CDP)
```

## Limitations

- Timing is self-reported: the app trusts you to read the twister aloud
  the target number of times and tap Done honestly — there is no
  microphone or speech recognition.
- Streaks count calendar days with at least one recorded attempt.
- No user accounts, no sync — data lives in one browser only.

## Status

Built 2026-11-15 (MUSE Project Factory run #347). See `TEST_RESULTS.md`
for the verified test run.
