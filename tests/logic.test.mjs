// tongue-twister-bd - node unit tests. Run: node --test tests/logic.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { TWISTERS } = require('../js/data.js');
const { I18N } = require('../js/i18n.js');
const L = require('../js/logic.js');

const IDS = TWISTERS.map((t) => t.id);

test('bank: 36 twisters, 18 Bangla + 18 English, unique ids', () => {
  assert.equal(TWISTERS.length, 36);
  assert.equal(TWISTERS.filter((t) => t.lang === 'bn').length, 18);
  assert.equal(TWISTERS.filter((t) => t.lang === 'en').length, 18);
  assert.equal(new Set(IDS).size, 36);
});

test('bank: 6 per difficulty per language, targets 3/3/5', () => {
  for (const lang of ['bn', 'en']) {
    for (const diff of ['easy', 'medium', 'hard']) {
      assert.equal(TWISTERS.filter((t) => t.lang === lang && t.diff === diff).length, 6);
    }
  }
  for (const t of TWISTERS) {
    assert.equal(L.targetFor(t.diff), t.diff === 'hard' ? 5 : 3);
    assert.ok(L.pointsFor(t.diff) > 0);
  }
});

test('bank: validateBank finds no errors', () => {
  assert.deepEqual(L.validateBank(TWISTERS), []);
});

test('bank: validateBank catches a duplicate id and a bad diff', () => {
  const bad = [...TWISTERS, { ...TWISTERS[0] }];
  assert.ok(L.validateBank(bad).some((e) => /duplicate id/.test(e)));
  const bad2 = TWISTERS.map((t) => (t.id === 'en-e1' ? { ...t, diff: 'extreme' } : t));
  assert.ok(L.validateBank(bad2).some((e) => /bad diff/.test(e)));
});

test('i18n: EN and BN have identical key sets, no empty strings', () => {
  const enKeys = Object.keys(I18N.en).sort();
  const bnKeys = Object.keys(I18N.bn).sort();
  assert.deepEqual(bnKeys, enKeys);
  for (const k of enKeys) {
    assert.ok(I18N.en[k].length > 0, 'empty EN ' + k);
    assert.ok(I18N.bn[k].length > 0, 'empty BN ' + k);
  }
});

test('formatTime: 0, sub-minute, minute boundary', () => {
  assert.equal(L.formatTime(0), '0:00.0');
  assert.equal(L.formatTime(9.99), '0:09.9');
  assert.equal(L.formatTime(65.25), '1:05.2');
  assert.equal(L.formatTime(125.05), '2:05.0');
  assert.equal(L.formatTime(-3), '0:00.0');
  assert.equal(L.formatTime(NaN), '0:00.0');
});

test('toBengaliDigits converts all digits', () => {
  assert.equal(L.toBengaliDigits('0123456789'), '\u09e6\u09e7\u09e8\u09e9\u09ea\u09eb\u09ec\u09ed\u09ee\u09ef');
  assert.equal(L.toBengaliDigits('36'), '\u09e9\u09ec');
  assert.equal(L.toBengaliDigits('0:12.3'), '\u09e6:\u09e7\u09e8.\u09e9');
});

test('dayStr / parseDay round-trip and reject bad dates', () => {
  assert.equal(L.dayStr(new Date(2026, 10, 15)), '2026-11-15');
  assert.deepEqual(L.parseDay('2026-11-15').getTime(), new Date(2026, 10, 15).getTime());
  assert.equal(L.parseDay('2026-02-30'), null);
  assert.equal(L.parseDay('not-a-date'), null);
});

test('dailyIndex is deterministic, in range, and varies across days', () => {
  const a = L.dailyIndex(new Date(2026, 10, 15), 36);
  assert.equal(L.dailyIndex(new Date(2026, 10, 15), 36), a);
  assert.ok(a >= 0 && a < 36);
  const seen = new Set();
  for (let d = 1; d <= 30; d++) seen.add(L.dailyIndex(new Date(2026, 10, d), 36));
  assert.ok(seen.size > 10, 'daily picks should vary, got ' + seen.size);
});

test('filterTwisters: language, difficulty, favourites, search', () => {
  assert.equal(L.filterTwisters(TWISTERS, { lang: 'bn' }).length, 18);
  assert.equal(L.filterTwisters(TWISTERS, { lang: 'en', diff: 'hard' }).length, 6);
  assert.equal(L.filterTwisters(TWISTERS, { favOnly: true, favs: ['bn-e1', 'en-h1'] }).length, 2);
  assert.equal(L.filterTwisters(TWISTERS, { favOnly: true, favs: [] }).length, 0);
  // Bengali text search
  assert.ok(L.filterTwisters(TWISTERS, { q: '\u0995\u09cb\u0995\u09bf\u09b2' }).some((t) => t.id === 'bn-e1'));
  // romanized search finds the Bangla twister
  assert.ok(L.filterTwisters(TWISTERS, { q: 'kokil' }).some((t) => t.id === 'bn-e1'));
  // English text search
  assert.ok(L.filterTwisters(TWISTERS, { q: 'seashells' }).some((t) => t.id === 'en-e1'));
  assert.equal(L.filterTwisters(TWISTERS, { q: 'zzz-no-match' }).length, 0);
  // no filters returns everything
  assert.equal(L.filterTwisters(TWISTERS, {}).length, 36);
});

test('attempts: bestTime / counts / totals', () => {
  const attempts = {
    'bn-e1': [{ t: 1, s: 12.3 }, { t: 2, s: 9.8 }],
    'en-e1': [{ t: 3, s: 20.0 }],
  };
  assert.equal(L.bestTime(attempts, 'bn-e1'), 9.8);
  assert.equal(L.bestTime(attempts, 'en-e1'), 20.0);
  assert.equal(L.bestTime(attempts, 'bn-e2'), null);
  assert.equal(L.attemptCount(attempts, 'bn-e1'), 2);
  assert.equal(L.totalAttempts(attempts), 3);
  assert.deepEqual(L.practisedIds(attempts).sort(), ['bn-e1', 'en-e1']);
  assert.equal(L.totalAttempts({}), 0);
});

test('streaks: consecutive run, gap breaks best, today-not-done current is 0', () => {
  const mk = (days) => {
    const set = {};
    days.forEach((d) => { set[d] = true; });
    return set;
  };
  // 3-day run ending today
  assert.deepEqual(
    L.computeStreaks(mk(['2026-11-13', '2026-11-14', '2026-11-15']), '2026-11-15'),
    { current: 3, best: 3 },
  );
  // gap: 2-day run then a lone day today
  assert.deepEqual(
    L.computeStreaks(mk(['2026-11-10', '2026-11-11', '2026-11-15']), '2026-11-15'),
    { current: 1, best: 2 },
  );
  // last practice yesterday: current streak is 0, best kept
  assert.deepEqual(
    L.computeStreaks(mk(['2026-11-13', '2026-11-14']), '2026-11-15'),
    { current: 0, best: 2 },
  );
  // empty
  assert.deepEqual(L.computeStreaks({}, '2026-11-15'), { current: 0, best: 0 });
});

test('practisedDaySet collects local dates from attempt timestamps', () => {
  const attempts = {
    'bn-e1': [{ t: new Date(2026, 10, 15, 9, 0).getTime(), s: 10 }],
    'en-e1': [{ t: new Date(2026, 10, 14, 9, 0).getTime(), s: 10 }],
  };
  const days = L.practisedDaySet(attempts);
  assert.deepEqual(Object.keys(days).sort(), ['2026-11-14', '2026-11-15']);
});

test('export/import: valid round-trip passes, malformed is rejected', () => {
  const state = { v: 1, attempts: { 'bn-e1': [{ t: 1, s: 9.8 }] }, favs: ['bn-e1'] };
  const json = L.exportData(state);
  const parsed = JSON.parse(json);
  assert.deepEqual(L.validateImport(parsed, IDS), []);
  assert.equal(parsed.app, 'tongue-twister-bd');

  assert.ok(L.validateImport({ app: 'other-app', v: 1, state }, IDS).length > 0);
  assert.ok(L.validateImport({ app: 'tongue-twister-bd', v: 2, state }, IDS).length > 0);
  assert.ok(L.validateImport(null, IDS).length > 0);
  assert.ok(L.validateImport('nope', IDS).length > 0);
  const badAttempt = { v: 1, attempts: { 'bn-e1': [{ t: 1, s: -5 }] }, favs: [] };
  assert.ok(L.validateImport({ app: 'tongue-twister-bd', v: 1, state: badAttempt }, IDS).length > 0);
  const unknownId = { v: 1, attempts: { 'xx-zz': [{ t: 1, s: 5 }] }, favs: [] };
  assert.ok(L.validateImport({ app: 'tongue-twister-bd', v: 1, state: unknownId }, IDS).length > 0);
  const unknownFav = { v: 1, attempts: {}, favs: ['xx-zz'] };
  assert.ok(L.validateImport({ app: 'tongue-twister-bd', v: 1, state: unknownFav }, IDS).length > 0);
  const badFavs = { v: 1, attempts: {}, favs: 'bn-e1' };
  assert.ok(L.validateImport({ app: 'tongue-twister-bd', v: 1, state: badFavs }, IDS).length > 0);
});
