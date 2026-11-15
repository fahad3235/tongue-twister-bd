// tongue-twister-bd - app wiring (DOM). Classic script; uses TWISTERS, I18N, TTWLogic.
(function () {
  'use strict';

  var L = window.TTWLogic;
  var STORE_KEY = 'ttwbd_v1';
  var LANG_KEY = 'ttwbd_lang';

  function $(id) { return document.getElementById(id); }

  var state = loadState();
  var lang = localStorage.getItem(LANG_KEY) || 'en';
  if (lang !== 'bn') lang = 'en';

  var currentTab = 'library';
  var practiceId = null;
  var timer = { mode: null, startTs: 0, interval: null };

  // ------------------------------------------------------------ state
  function loadState() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return L.emptyState();
      var obj = JSON.parse(raw);
      if (!obj || obj.v !== 1 || typeof obj.attempts !== 'object' || !Array.isArray(obj.favs)) {
        return L.emptyState();
      }
      return obj;
    } catch (e) { return L.emptyState(); }
  }
  function saveState() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
  }
  function saveLang() {
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
  }

  // ------------------------------------------------------------ i18n
  function t(key) {
    var dict = window.I18N[lang] || window.I18N.en;
    return dict[key] !== undefined ? dict[key] : window.I18N.en[key];
  }
  function fmt(n) {
    var s = String(n);
    return lang === 'bn' ? L.toBengaliDigits(s) : s;
  }
  function fmtTime(seconds) {
    var s = L.formatTime(seconds);
    return lang === 'bn' ? L.toBengaliDigits(s) : s;
  }
  function diffLabel(d) { return t(d); }
  function catLabel(tw) { return tw.lang === 'bn' ? t('cat_bn') : t('cat_en'); }
  function langLabel(code) { return code === 'bn' ? t('bangla') : t('english'); }

  function applyLang() {
    document.documentElement.lang = lang === 'bn' ? 'bn' : 'en';
    $('appTitle').textContent = t('title');
    document.title = t('title');
    $('appSubtitle').textContent = t('subtitle');
    $('langToggle').textContent = lang === 'bn' ? 'English' : '\u09ac\u09be\u0982\u09b2\u09be';
    var tabs = { library: 'tab_library', practice: 'tab_practice', challenge: 'tab_challenge', stats: 'tab_stats' };
    Object.keys(tabs).forEach(function (k) { $('tabBtn-' + k).textContent = t(tabs[k]); });
    $('searchBox').placeholder = t('search_ph');
    $('lblLang').textContent = t('filter_lang');
    $('lblDiff').textContent = t('filter_diff');
    $('lblFavOnly').textContent = t('fav_only');
    setSelectText($('filterLang'), [['all', t('all')], ['bn', t('bangla')], ['en', t('english')]]);
    setSelectText($('filterDiff'), [['all', t('all')], ['easy', t('easy')], ['medium', t('medium')], ['hard', t('hard')]]);
    $('startBtn').textContent = t('start');
    $('doneBtn').textContent = t('done');
    $('againBtn').textContent = t('again');
    $('randomBtn').textContent = t('random');
    $('chStartBtn').textContent = t('start');
    $('chDoneBtn').textContent = t('done');
    $('challengeTitle').textContent = t('challenge_title');
    $('challengeHint').textContent = t('challenge_hint');
    $('lblStreak').textContent = t('streak');
    $('lblStatPractised').textContent = t('stat_practised');
    $('lblStatAttempts').textContent = t('stat_attempts');
    $('lblStatStreak').textContent = t('stat_streak');
    $('lblStatBestStreak').textContent = t('stat_best_streak');
    $('lblStatFavs').textContent = t('stat_favs');
    $('lblStatDays').textContent = t('stat_days');
    $('bestTimesTitle').textContent = t('stat_best_times');
    $('dataTitle').textContent = t('data_title');
    $('exportBtn').textContent = t('export');
    $('importBtn').textContent = t('import');
    $('eraseBtn').textContent = t('erase');
    $('disclaimer').textContent = t('disclaimer');
    $('madeIn').textContent = t('made_in');
    renderLibrary();
    renderPractice();
    renderChallenge();
    renderStats();
  }
  function setSelectText(sel, pairs) {
    Array.prototype.forEach.call(sel.options, function (opt) {
      pairs.forEach(function (p) { if (p[0] === opt.value) opt.textContent = p[1]; });
    });
  }

  // ------------------------------------------------------------ tabs
  function switchTab(name) {
    currentTab = name;
    ['library', 'practice', 'challenge', 'stats'].forEach(function (k) {
      $('tabBtn-' + k).classList.toggle('active', k === name);
      $('tab-' + k).hidden = k !== name;
    });
    if (name === 'stats') renderStats();
    if (name === 'challenge') renderChallenge();
  }
  ['library', 'practice', 'challenge', 'stats'].forEach(function (k) {
    $('tabBtn-' + k).addEventListener('click', function () { switchTab(k); });
  });
  $('langToggle').addEventListener('click', function () {
    lang = lang === 'bn' ? 'en' : 'bn';
    saveLang();
    applyLang();
  });

  // ------------------------------------------------------------ library
  function getFilters() {
    return {
      q: $('searchBox').value,
      lang: $('filterLang').value,
      diff: $('filterDiff').value,
      favOnly: $('favOnly').checked,
      favs: state.favs
    };
  }
  function renderLibrary() {
    var list = L.filterTwisters(window.TWISTERS, getFilters());
    var grid = $('cardGrid');
    grid.innerHTML = '';
    $('libEmpty').hidden = list.length !== 0;
    $('libCount').textContent = fmt(list.length) + ' / ' + fmt(window.TWISTERS.length);
    list.forEach(function (tw) {
      var card = document.createElement('article');
      card.className = 'card';
      var text = document.createElement('p');
      text.className = 'card-text';
      text.lang = tw.lang === 'bn' ? 'bn' : 'en';
      text.textContent = tw.text;
      card.appendChild(text);
      if (tw.rom) {
        var rom = document.createElement('p');
        rom.className = 'card-rom';
        rom.textContent = tw.rom;
        card.appendChild(rom);
      }
      var badges = document.createElement('div');
      badges.className = 'badges';
      badges.appendChild(badge(catLabel(tw), ''));
      badges.appendChild(badge(diffLabel(tw.diff), 'diff-' + tw.diff));
      badges.appendChild(badge(t('repeat_x').replace('{n}', fmt(L.targetFor(tw.diff))), ''));
      card.appendChild(badges);
      var meta = document.createElement('p');
      meta.className = 'card-meta';
      var best = L.bestTime(state.attempts, tw.id);
      var n = L.attemptCount(state.attempts, tw.id);
      meta.textContent = (best === null ? '' : t('best_time') + ': ' + fmtTime(best) + ' \u00b7 ') +
        t('attempts') + ': ' + fmt(n);
      card.appendChild(meta);
      var actions = document.createElement('div');
      actions.className = 'card-actions';
      var go = document.createElement('button');
      go.className = 'btn primary';
      go.type = 'button';
      go.textContent = t('practise');
      go.addEventListener('click', function () { selectPractice(tw.id); switchTab('practice'); });
      var star = document.createElement('button');
      star.className = 'btn star' + (state.favs.indexOf(tw.id) !== -1 ? ' faved' : '');
      star.type = 'button';
      star.setAttribute('aria-label', t('favourite'));
      star.textContent = state.favs.indexOf(tw.id) !== -1 ? '\u2605' : '\u2606';
      star.addEventListener('click', function () { toggleFav(tw.id); });
      actions.appendChild(go);
      actions.appendChild(star);
      card.appendChild(actions);
      grid.appendChild(card);
    });
  }
  function badge(text, cls) {
    var b = document.createElement('span');
    b.className = 'badge ' + cls;
    b.textContent = text;
    return b;
  }
  function toggleFav(id) {
    var i = state.favs.indexOf(id);
    if (i === -1) state.favs.push(id);
    else state.favs.splice(i, 1);
    saveState();
    renderLibrary();
    renderStats();
  }
  ['searchBox', 'filterLang', 'filterDiff', 'favOnly'].forEach(function (id) {
    $(id).addEventListener('input', renderLibrary);
    $(id).addEventListener('change', renderLibrary);
  });

  // ------------------------------------------------------------ timer engine
  function stopTimer() {
    if (timer.interval) { clearInterval(timer.interval); timer.interval = null; }
    timer.mode = null;
  }
  function startTimer(mode) {
    stopTimer();
    timer.mode = mode;
    timer.startTs = Date.now();
    var el = mode === 'practice' ? $('timer') : $('challengeTimer');
    el.textContent = fmtTime(0);
    timer.interval = setInterval(function () {
      el.textContent = fmtTime((Date.now() - timer.startTs) / 1000);
    }, 100);
  }
  function elapsedSeconds() {
    return (Date.now() - timer.startTs) / 1000;
  }
  function recordAttempt(id, seconds) {
    var prevBest = L.bestTime(state.attempts, id);
    if (!state.attempts[id]) state.attempts[id] = [];
    state.attempts[id].push({ t: Date.now(), s: Math.round(seconds * 10) / 10 });
    saveState();
    return prevBest === null || seconds < prevBest;
  }

  // ------------------------------------------------------------ practice
  function selectPractice(id) {
    practiceId = id;
    renderPractice();
  }
  function findTwister(id) {
    for (var i = 0; i < window.TWISTERS.length; i++) {
      if (window.TWISTERS[i].id === id) return window.TWISTERS[i];
    }
    return null;
  }
  function renderPractice() {
    var tw = practiceId ? findTwister(practiceId) : null;
    $('practiceEmpty').hidden = !!tw;
    $('practiceBody').hidden = !tw;
    $('practiceEmpty').textContent = t('pick_first');
    if (!tw) return;
    $('practiceText').textContent = tw.text;
    $('practiceText').lang = tw.lang === 'bn' ? 'bn' : 'en';
    $('practiceRom').textContent = tw.rom || '';
    $('practiceRom').hidden = !tw.rom;
    $('practiceCat').textContent = catLabel(tw);
    var d = $('practiceDiff');
    d.textContent = diffLabel(tw.diff);
    d.className = 'badge diff diff-' + tw.diff;
    $('practiceTarget').textContent = t('repeat_x').replace('{n}', fmt(L.targetFor(tw.diff)));
    $('practiceHint').textContent = t('practice_hint').replace('{n}', fmt(L.targetFor(tw.diff)));
    $('timer').textContent = fmtTime(0);
    $('practiceResult').textContent = '';
    $('startBtn').disabled = false;
    $('doneBtn').disabled = true;
    $('againBtn').disabled = true;
  }
  $('startBtn').addEventListener('click', function () {
    if (!practiceId) return;
    startTimer('practice');
    $('startBtn').disabled = true;
    $('doneBtn').disabled = false;
    $('againBtn').disabled = true;
    $('practiceResult').textContent = '';
  });
  $('doneBtn').addEventListener('click', function () {
    if (timer.mode !== 'practice' || !practiceId) return;
    var secs = elapsedSeconds();
    stopTimer();
    var tw = findTwister(practiceId);
    var isBest = recordAttempt(practiceId, secs);
    var target = L.targetFor(tw.diff);
    var per = secs / target;
    var msg = t('your_time') + ': ' + fmtTime(secs) + ' (' + fmtTime(per) + ' ' + t('per_repeat') + ')';
    if (isBest) msg += ' - ' + t('new_best');
    $('practiceResult').textContent = msg;
    $('doneBtn').disabled = true;
    $('againBtn').disabled = false;
    $('startBtn').disabled = false;
    renderLibrary();
    renderStats();
  });
  $('againBtn').addEventListener('click', function () {
    $('practiceResult').textContent = '';
    $('timer').textContent = fmtTime(0);
    $('startBtn').disabled = false;
    $('doneBtn').disabled = true;
    $('againBtn').disabled = true;
  });
  $('randomBtn').addEventListener('click', function () {
    var pool = window.TWISTERS.filter(function (tw) { return tw.id !== practiceId; });
    var pick = pool[Math.floor(Math.random() * pool.length)];
    selectPractice(pick.id);
  });

  // ------------------------------------------------------------ challenge
  function todayTwister() {
    var idx = L.dailyIndex(new Date(), window.TWISTERS.length);
    return window.TWISTERS[idx];
  }
  function renderChallenge() {
    var tw = todayTwister();
    $('challengeText').textContent = tw.text;
    $('challengeText').lang = tw.lang === 'bn' ? 'bn' : 'en';
    $('challengeRom').textContent = tw.rom || '';
    $('challengeRom').hidden = !tw.rom;
    $('challengeCat').textContent = catLabel(tw);
    var d = $('challengeDiff');
    d.textContent = diffLabel(tw.diff);
    d.className = 'badge diff diff-' + tw.diff;
    $('challengeTarget').textContent = t('repeat_x').replace('{n}', fmt(L.targetFor(tw.diff)));
    $('challengeTimer').textContent = fmtTime(0);
    var days = L.practisedDaySet(state.attempts);
    var doneToday = !!days[L.dayStr(new Date())];
    $('challengeDone').hidden = !doneToday;
    $('challengeDone').textContent = t('challenge_done');
    $('chStartBtn').disabled = false;
    $('chDoneBtn').disabled = true;
    $('challengeResult').textContent = '';
    var streaks = L.computeStreaks(days, L.dayStr(new Date()));
    $('streakVal').textContent = fmt(streaks.current) + ' ' + t('days_suffix');
  }
  $('chStartBtn').addEventListener('click', function () {
    startTimer('challenge');
    $('chStartBtn').disabled = true;
    $('chDoneBtn').disabled = false;
    $('challengeResult').textContent = '';
  });
  $('chDoneBtn').addEventListener('click', function () {
    if (timer.mode !== 'challenge') return;
    var secs = elapsedSeconds();
    stopTimer();
    var tw = todayTwister();
    var isBest = recordAttempt(tw.id, secs);
    var msg = t('your_time') + ': ' + fmtTime(secs);
    if (isBest) msg += ' - ' + t('new_best');
    $('challengeResult').textContent = msg;
    $('chDoneBtn').disabled = true;
    $('chStartBtn').disabled = false;
    renderChallenge();
    renderLibrary();
    renderStats();
  });

  // ------------------------------------------------------------ stats + data
  function renderStats() {
    var days = L.practisedDaySet(state.attempts);
    var streaks = L.computeStreaks(days, L.dayStr(new Date()));
    $('statPractised').textContent = fmt(L.practisedIds(state.attempts).length);
    $('statAttempts').textContent = fmt(L.totalAttempts(state.attempts));
    $('statStreak').textContent = fmt(streaks.current);
    $('statBestStreak').textContent = fmt(streaks.best);
    $('statFavs').textContent = fmt(state.favs.length);
    $('statDays').textContent = fmt(Object.keys(days).length);
    var list = $('bestTimesList');
    list.innerHTML = '';
    var rows = L.practisedIds(state.attempts).map(function (id) {
      return { tw: findTwister(id), best: L.bestTime(state.attempts, id) };
    }).filter(function (r) { return r.tw && r.best !== null; })
      .sort(function (a, b) { return a.best - b.best; });
    $('noAttempts').hidden = rows.length !== 0;
    $('noAttempts').textContent = t('no_attempts');
    rows.forEach(function (r) {
      var li = document.createElement('li');
      var a = document.createElement('span');
      a.className = 'bt-text';
      a.textContent = r.tw.text;
      var b = document.createElement('span');
      b.className = 'bt-time';
      b.textContent = fmtTime(r.best);
      li.appendChild(a);
      li.appendChild(b);
      list.appendChild(li);
    });
  }
  $('exportBtn').addEventListener('click', function () {
    var blob = new Blob([L.exportData(state)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'tongue-twister-bd-data.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });
  $('importBtn').addEventListener('click', function () { $('importFile').click(); });
  $('importFile').addEventListener('change', function (ev) {
    var file = ev.target.files && ev.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      var msg = $('dataMsg');
      try {
        var obj = JSON.parse(String(reader.result));
        var ids = window.TWISTERS.map(function (tw) { return tw.id; });
        var errors = L.validateImport(obj, ids);
        if (errors.length) { msg.textContent = t('import_bad'); return; }
        state = obj.state;
        saveState();
        renderLibrary(); renderPractice(); renderChallenge(); renderStats();
        msg.textContent = t('import_ok');
      } catch (e) { msg.textContent = t('import_bad'); }
    };
    reader.readAsText(file);
    ev.target.value = '';
  });
  $('eraseBtn').addEventListener('click', function () {
    var answer = window.prompt(t('erase_confirm'));
    var msg = $('dataMsg');
    if (answer === 'DELETE') {
      state = L.emptyState();
      saveState();
      renderLibrary(); renderPractice(); renderChallenge(); renderStats();
      msg.textContent = t('erase_done');
    } else {
      msg.textContent = t('erase_cancel');
    }
  });

  // ------------------------------------------------------------ boot
  applyLang();
})();
