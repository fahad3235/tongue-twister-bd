# TEST_RESULTS.md — tongue-twister-bd (run #347, 2026-11-15 ~18:10 +06)

## Unit tests — 14/14 PASS
Command: `node --test tests/logic.test.mjs` (Node v24.22.1), run twice, green both times.
- Bank: 36 twisters, 18 Bangla + 18 English, unique ids; 6 per difficulty
  per language; targets 3/3/5; `validateBank` finds 0 errors and catches a
  duplicate id / bad diff when injected.
- i18n: EN and BN have identical key sets, no empty strings.
- `formatTime`: 0 -> "0:00.0", 9.99 -> "0:09.9", 65.25 -> "1:05.2",
  125.05 -> "2:05.0"; negatives/NaN -> "0:00.0".
- `toBengaliDigits`: "0123456789" -> "০১২৩৪৫৬৭৮৯".
- `dayStr`/`parseDay` round-trip 2026-11-15; rejects 2026-02-30.
- `dailyIndex` deterministic, in range, varies across 30 days (>10 distinct).
- Filters: bn 18, en+hard 6, favourites-only, Bengali search ("কোকিল"),
  romanized search ("kokil"), English search ("seashells"), no-match -> 0.
- Attempts: bestTime 9.8 of [12.3, 9.8]; totals 3; practised ids correct.
- Streaks: 3-day run -> current 3 / best 3; gap -> current 1 / best 2;
  last-practised-yesterday -> current 0 / best 2; empty -> 0 / 0.
- `practisedDaySet` collects 2026-11-14 + 2026-11-15 from timestamps.
- Export/import: valid round-trip passes; wrong app tag, bad version,
  bad attempt (negative seconds), unknown twister id, unknown favourite,
  non-array favs all rejected.

## Headless-Chrome smoke — ALL PASS (run twice, idempotent)
Command: `node tests/smoke.mjs .` against /opt/meta-chromium/chrome
(HeadlessChrome/140) via raw CDP, file:// URL. 0 console/page errors.
Desktop 1280px (32 checks):
- Title "Tongue Twister BD"; 36 cards; count line "36 / 36".
- Bangla filter -> 18; Bangla + Hard -> 6; search "seashells" -> 1 card
  ("She sells seashells by the seashore.").
- Star toggles to filled; favourites-only filter -> 1.
- Practise opens Practice tab with a twister ("কাক কালো, কোকিল কালো").
- Timer ticks (0:00.7 after a 700 ms wait); Done records
  "Your time: 0:00.7 (0:00.2 per repeat) - New best time!" (0.7/3 = 0.23 -> 0:00.2).
- Again enabled after Done; Random picks a different twister.
- BN toggle: title "জিভের জট বিডি", count "৩৬ / ৩৬"; EN toggle restores.
- Challenge tab shows today's twister ("ছোট ছেলে ছোট ছাতা" — dailyIndex
  for 2026-11-15 is 4 = bn-e5, hand-verified: doy 319 -> (319*7+3)%36 = 4).
- Streak line "1 days"; stats: 1 attempt, 1 twister practised, 1 best-time
  row; state persisted in localStorage.
Mobile 390px (3 checks): scrollWidth 390 = clientWidth (no overflow),
36 cards render, practice text 320px wide (fits).

## Repairs during this run
- 1 genuine app-logic bug class avoided pre-test: Bengali range regex in
  `js/logic.js` used a Devanagari endpoint (U+097F) — fixed to
  `[\u0980-\u09FF]`; unit test then passed.
- 1 generator fix: em-dash in generated-file comments broke the ASCII
  writer — replaced with hyphens.
- 2 test-harness fixes only: smoke re-queried the star node after the
  grid re-render (stale-node read); smoke now clears localStorage before
  the run so counts are deterministic across repeats. 0 app-logic bugs
  found by the smoke run itself.

## Non-ASCII hygiene
- App + test sources are pure ASCII (`grep -P '[^\x00-\x7F]'` = 0 matches
  across index.html, css/, js/, tests/). Bengali lives only as `\uXXXX`
  escapes in generated js/data.js + js/i18n.js, and as UTF-8 source strings
  in tools/gen_data.py (the documented source of truth).
- README.md / TEST_RESULTS.md contain raw Bengali; pushed via
  ASCII-escaped JSON and verified byte-identical on the remote (see ledger).
