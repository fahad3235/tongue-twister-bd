// tongue-twister-bd - pure logic (no DOM). Shared by the app and the tests.
// Classic script: defines window.TTWLogic in the browser and module.exports in node.
(function (root) {
  'use strict';

  var DIFF_POINTS = { easy: 10, medium: 20, hard: 30 };
  var TARGETS = { easy: 3, medium: 3, hard: 5 };
  var LANGS = ['bn', 'en'];
  var DIFFS = ['easy', 'medium', 'hard'];
  var BN_DIGITS = ['\u09E6', '\u09E7', '\u09E8', '\u09E9', '\u09EA', '\u09EB', '\u09EC', '\u09ED', '\u09EE', '\u09EF'];

  function toBengaliDigits(value) {
    return String(value).replace(/[0-9]/g, function (d) { return BN_DIGITS[+d]; });
  }

  function formatTime(seconds) {
    if (typeof seconds !== 'number' || !isFinite(seconds) || seconds < 0) return '0:00.0';
    var m = Math.floor(seconds / 60);
    var s = seconds - m * 60;
    var whole = Math.floor(s);
    var tenth = Math.floor((s - whole) * 10);
    return m + ':' + (whole < 10 ? '0' : '') + whole + '.' + tenth;
  }

  function dayStr(date) {
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();
    return y + '-' + (m < 10 ? '0' : '') + m + '-' + (d < 10 ? '0' : '') + d;
  }

  function parseDay(s) {
    var parts = String(s).split('-');
    if (parts.length !== 3) return null;
    var y = +parts[0], m = +parts[1], d = +parts[2];
    if (!y || !m || !d || m < 1 || m > 12 || d < 1 || d > 31) return null;
    var dt = new Date(y, m - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
    return dt;
  }

  // Deterministic pick of the day: day-of-year spread over the bank.
  function dailyIndex(date, count) {
    if (!count || count < 1) return 0;
    var start = new Date(date.getFullYear(), 0, 0);
    var doy = Math.floor((date - start) / 86400000);
    return (doy * 7 + 3) % count;
  }

  function validateBank(bank) {
    var errors = [];
    if (!Array.isArray(bank)) return ['bank is not an array'];
    var seen = {};
    bank.forEach(function (t, i) {
      var where = 'twister #' + i;
      if (!t || typeof t !== 'object') { errors.push(where + ': not an object'); return; }
      if (!t.id || typeof t.id !== 'string') errors.push(where + ': missing id');
      else if (seen[t.id]) errors.push(where + ': duplicate id ' + t.id);
      else seen[t.id] = true;
      if (LANGS.indexOf(t.lang) === -1) errors.push(where + ': bad lang ' + t.lang);
      if (DIFFS.indexOf(t.diff) === -1) errors.push(where + ': bad diff ' + t.diff);
      if (!t.text || typeof t.text !== 'string' || !t.text.trim()) errors.push(where + ': empty text');
      if (t.lang === 'bn' && !/[\u0980-\u09FF]/.test(t.text)) errors.push(where + ': Bangla twister has no Bengali chars');
      if (t.lang === 'en' && /[^\x00-\x7F]/.test(t.text)) errors.push(where + ': English twister has non-ASCII chars');
      if (t.lang === 'bn' && (!t.rom || typeof t.rom !== 'string' || !t.rom.trim())) errors.push(where + ': Bangla twister missing romanization');
      if (t.lang === 'en' && t.rom !== '') errors.push(where + ': English twister should have empty rom');
    });
    return errors;
  }

  function filterTwisters(bank, opts) {
    opts = opts || {};
    var q = (opts.q || '').trim().toLowerCase();
    var favs = opts.favs || [];
    return bank.filter(function (t) {
      if (opts.lang && opts.lang !== 'all' && t.lang !== opts.lang) return false;
      if (opts.diff && opts.diff !== 'all' && t.diff !== opts.diff) return false;
      if (opts.favOnly && favs.indexOf(t.id) === -1) return false;
      if (q) {
        var hay = (t.text + ' ' + (t.rom || '') + ' ' + t.id).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function targetFor(diff) { return TARGETS[diff] || 3; }
  function pointsFor(diff) { return DIFF_POINTS[diff] || 0; }

  // attempts: { id: [{t: epochMs, s: seconds}, ...] }
  function bestTime(attempts, id) {
    var list = (attempts && attempts[id]) || [];
    if (!list.length) return null;
    var best = Infinity;
    list.forEach(function (a) { if (typeof a.s === 'number' && a.s < best) best = a.s; });
    return best === Infinity ? null : best;
  }

  function attemptCount(attempts, id) {
    return ((attempts && attempts[id]) || []).length;
  }

  function totalAttempts(attempts) {
    var n = 0;
    Object.keys(attempts || {}).forEach(function (id) { n += attemptCount(attempts, id); });
    return n;
  }

  function practisedIds(attempts) {
    return Object.keys(attempts || {}).filter(function (id) { return attemptCount(attempts, id) > 0; });
  }

  function practisedDaySet(attempts) {
    var days = {};
    Object.keys(attempts || {}).forEach(function (id) {
      (attempts[id] || []).forEach(function (a) {
        if (typeof a.t === 'number') days[dayStr(new Date(a.t))] = true;
      });
    });
    return days;
  }

  // streaks from a set of practised day strings; todayStr is 'YYYY-MM-DD'.
  function computeStreaks(daySet, todayStr) {
    var days = Object.keys(daySet || {}).sort();
    var best = 0, run = 0, prev = null;
    days.forEach(function (ds) {
      var dt = parseDay(ds);
      if (!dt) return;
      if (prev && (dt - prev) === 86400000) run += 1;
      else run = 1;
      if (run > best) best = run;
      prev = dt;
    });
    var today = parseDay(todayStr);
    var current = 0;
    if (today) {
      var cursor = new Date(today);
      while (daySet[dayStr(cursor)]) {
        current += 1;
        cursor = new Date(cursor.getTime() - 86400000);
      }
    }
    return { current: current, best: best };
  }

  function emptyState() {
    return { v: 1, attempts: {}, favs: [] };
  }

  function validateImport(obj, bankIds) {
    var errors = [];
    if (!obj || typeof obj !== 'object') return ['not an object'];
    if (obj.app !== 'tongue-twister-bd') errors.push('wrong app tag');
    if (obj.v !== 1) errors.push('unsupported version');
    if (!obj.state || typeof obj.state !== 'object') errors.push('missing state');
    else {
      var st = obj.state;
      if (st.v !== 1) errors.push('unsupported state version');
      if (!st.attempts || typeof st.attempts !== 'object' || Array.isArray(st.attempts)) errors.push('bad attempts');
      else {
        Object.keys(st.attempts).forEach(function (id) {
          if (bankIds && bankIds.indexOf(id) === -1) { errors.push('unknown twister id ' + id); return; }
          var list = st.attempts[id];
          if (!Array.isArray(list)) { errors.push('attempts for ' + id + ' is not an array'); return; }
          list.forEach(function (a, i) {
            if (!a || typeof a.t !== 'number' || typeof a.s !== 'number' || a.s <= 0 || a.s > 3600) {
              errors.push('bad attempt ' + id + '[' + i + ']');
            }
          });
        });
      }
      if (!Array.isArray(st.favs)) errors.push('bad favs');
      else st.favs.forEach(function (id) {
        if (bankIds && bankIds.indexOf(id) === -1) errors.push('unknown favourite id ' + id);
      });
    }
    return errors;
  }

  function exportData(state) {
    return JSON.stringify({ app: 'tongue-twister-bd', v: 1, state: state }, null, 2);
  }

  var Logic = {
    DIFF_POINTS: DIFF_POINTS, TARGETS: TARGETS,
    toBengaliDigits: toBengaliDigits, formatTime: formatTime,
    dayStr: dayStr, parseDay: parseDay, dailyIndex: dailyIndex,
    validateBank: validateBank, filterTwisters: filterTwisters,
    targetFor: targetFor, pointsFor: pointsFor,
    bestTime: bestTime, attemptCount: attemptCount,
    totalAttempts: totalAttempts, practisedIds: practisedIds,
    practisedDaySet: practisedDaySet, computeStreaks: computeStreaks,
    emptyState: emptyState, validateImport: validateImport,
    exportData: exportData
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = Logic;
  root.TTWLogic = Logic;
})(typeof window !== 'undefined' ? window : globalThis);
