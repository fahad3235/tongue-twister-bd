// tongue-twister-bd - headless-Chrome smoke test (raw CDP, file://).
// Usage: node tests/smoke.mjs [app-dir]
// Expects Chrome already running headless with --remote-debugging-port=9222,
// or pass CHROME_PORT env. Prints PASS/FAIL lines, exits non-zero on failure.
import path from 'node:path';

const PORT = process.env.CHROME_PORT || '9222';
const APP_DIR = process.argv[2] || process.cwd();
const appUrl = 'file://' + path.resolve(APP_DIR, 'index.html');

let failures = 0;
function check(name, ok, extra = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' \u2014 ' + extra : ''}`);
  if (!ok) failures++;
}

async function getJson(p, method = 'GET') {
  const res = await fetch(`http://127.0.0.1:${PORT}${p}`, { method });
  return res.json();
}

async function main() {
  const target = await getJson(`/json/new?${encodeURIComponent(appUrl)}`, 'PUT');
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

  let msgId = 0;
  const pending = new Map();
  const exceptions = [];
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
    if (msg.method === 'Runtime.exceptionThrown') {
      exceptions.push(msg.params.exceptionDetails?.exception?.description || msg.params.exceptionDetails?.text || 'unknown exception');
    }
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      exceptions.push('console.error: ' + JSON.stringify(msg.params.args.map((a) => a.value ?? a.description)));
    }
  };
  const send = (method, params = {}) => new Promise((resolve) => {
    const id = ++msgId;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });
  const evalJs = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.result?.exceptionDetails) return { error: r.result.exceptionDetails.exception?.description || 'eval exception' };
    return { value: r.result?.result?.value };
  };

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  await new Promise((r) => setTimeout(r, 1200));
  // Clean slate: earlier smoke runs persist attempts/favourites in localStorage.
  await send('Runtime.evaluate', { expression: `localStorage.clear()`, returnByValue: true });
  await send('Page.reload', { ignoreCache: true });
  await new Promise((r) => setTimeout(r, 1200));

  const desktop = await evalJs(`(async () => {
    const out = {};
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    out.title = document.querySelector('h1').textContent;
    out.cardCount = document.querySelectorAll('#cardGrid .card').length;
    out.libCount = document.getElementById('libCount').textContent;
    // Language filter: Bangla only
    const fl = document.getElementById('filterLang');
    fl.value = 'bn'; fl.dispatchEvent(new Event('change'));
    out.bnCount = document.querySelectorAll('#cardGrid .card').length;
    // Difficulty filter: hard only (within Bangla)
    const fd = document.getElementById('filterDiff');
    fd.value = 'hard'; fd.dispatchEvent(new Event('change'));
    out.bnHardCount = document.querySelectorAll('#cardGrid .card').length;
    // Reset filters, search English classic
    fl.value = 'all'; fl.dispatchEvent(new Event('change'));
    fd.value = 'all'; fd.dispatchEvent(new Event('change'));
    const sb = document.getElementById('searchBox');
    sb.value = 'seashells'; sb.dispatchEvent(new Event('input'));
    out.searchCount = document.querySelectorAll('#cardGrid .card').length;
    out.searchText = document.querySelector('#cardGrid .card .card-text')?.textContent || '';
    sb.value = ''; sb.dispatchEvent(new Event('input'));
    // Favourite the first card, then filter favourites only
    const star = document.querySelector('#cardGrid .card .star');
    star.click();
    // renderLibrary() rebuilds the grid, so re-query the live node
    out.starAfter = document.querySelector('#cardGrid .card .star').textContent;
    const fo = document.getElementById('favOnly');
    fo.checked = true; fo.dispatchEvent(new Event('change'));
    out.favOnlyCount = document.querySelectorAll('#cardGrid .card').length;
    fo.checked = false; fo.dispatchEvent(new Event('change'));
    // Practise first card -> practice tab
    document.querySelector('#cardGrid .card .btn.primary').click();
    out.practiceVisible = !document.getElementById('tab-practice').hidden;
    out.practiceText = document.getElementById('practiceText').textContent;
    // Timer: start, wait, done
    document.getElementById('startBtn').click();
    out.doneEnabledWhileRunning = !document.getElementById('doneBtn').disabled;
    await sleep(700);
    out.timerMid = document.getElementById('timer').textContent;
    document.getElementById('doneBtn').click();
    out.result = document.getElementById('practiceResult').textContent;
    out.againEnabled = !document.getElementById('againBtn').disabled;
    // Random changes the twister
    const before = document.getElementById('practiceText').textContent;
    document.getElementById('randomBtn').click();
    out.randomChanged = document.getElementById('practiceText').textContent !== before;
    // Bengali toggle
    document.getElementById('langToggle').click();
    out.titleBn = document.querySelector('h1').textContent;
    out.countBn = document.getElementById('libCount').textContent;
    document.getElementById('langToggle').click();
    out.titleEn = document.querySelector('h1').textContent;
    // Challenge tab
    document.getElementById('tabBtn-challenge').click();
    out.challengeText = document.getElementById('challengeText').textContent;
    out.streakLine = document.getElementById('streakVal').textContent;
    // Stats tab
    document.getElementById('tabBtn-stats').click();
    out.statAttempts = document.getElementById('statAttempts').textContent;
    out.statPractised = document.getElementById('statPractised').textContent;
    out.bestRows = document.querySelectorAll('#bestTimesList li').length;
    out.stored = (localStorage.getItem('ttwbd_v1') || '').length > 10;
    return out;
  })()`);

  if (desktop.error) { check('desktop evaluation ran', false, desktop.error); }
  else {
    const d = desktop.value;
    check('title is Tongue Twister BD', d.title === 'Tongue Twister BD', d.title);
    check('36 cards render in library', d.cardCount === 36, `got ${d.cardCount}`);
    check('count line shows 36 / 36', d.libCount === '36 / 36', d.libCount);
    check('Bangla filter shows 18', d.bnCount === 18, `got ${d.bnCount}`);
    check('Bangla + Hard filter shows 6', d.bnHardCount === 6, `got ${d.bnHardCount}`);
    check('search "seashells" finds 1 card', d.searchCount === 1, `got ${d.searchCount}`);
    check('searched card is the seashells twister', /seashells/.test(d.searchText), d.searchText);
    check('star toggles to filled', d.starAfter === '\u2605', d.starAfter);
    check('favourites-only filter shows 1', d.favOnlyCount === 1, `got ${d.favOnlyCount}`);
    check('Practise opens practice tab', d.practiceVisible === true);
    check('practice shows a twister', d.practiceText.length > 3, d.practiceText);
    check('Done enabled while timer runs', d.doneEnabledWhileRunning === true);
    check('timer ticks past 0.5s', /0:00\.[5-9]/.test(d.timerMid), d.timerMid);
    check('Done records a time result', /Your time: 0:00\./.test(d.result), d.result);
    check('Again enabled after Done', d.againEnabled === true);
    check('Random picks a different twister', d.randomChanged === true);
    check('BN toggle switches title to Bengali', d.titleBn === '\u099c\u09bf\u09ad\u09c7\u09b0 \u099c\u099f \u09ac\u09bf\u09a1\u09bf', d.titleBn);
    check('BN toggle renders Bengali digits in count', /\u09e9\u09ec/.test(d.countBn), d.countBn);
    check('EN toggle restores English title', d.titleEn === 'Tongue Twister BD');
    check('challenge shows today\'s twister', d.challengeText.length > 3, d.challengeText);
    check('streak line renders', /day/.test(d.streakLine) || /\u09a6\u09bf\u09a8/.test(d.streakLine), d.streakLine);
    check('stats: 1 attempt recorded', d.statAttempts === '1', d.statAttempts);
    check('stats: 1 twister practised', d.statPractised === '1', d.statPractised);
    check('stats: 1 best-time row', d.bestRows === 1, `got ${d.bestRows}`);
    check('state persisted to localStorage', d.stored === true);
  }

  // Mobile 390px: reload and check for horizontal overflow.
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send('Page.reload', { ignoreCache: true });
  await new Promise((r) => setTimeout(r, 1200));
  const mobile = await evalJs(`(() => {
    const out = {};
    out.scrollW = document.documentElement.scrollWidth;
    out.clientW = document.documentElement.clientWidth;
    out.cardCount = document.querySelectorAll('#cardGrid .card').length;
    document.getElementById('tabBtn-practice').click();
    document.getElementById('randomBtn').click();
    out.practiceTextW = document.getElementById('practiceText').getBoundingClientRect().width;
    return out;
  })()`);
  if (mobile.error) { check('mobile evaluation ran', false, mobile.error); }
  else {
    const m = mobile.value;
    check('mobile 390px: no horizontal overflow', m.scrollW <= m.clientW + 1, `scrollWidth ${m.scrollW} vs ${m.clientW}`);
    check('mobile 390px: 36 cards render', m.cardCount === 36, `got ${m.cardCount}`);
    check('mobile 390px: practice text fits', m.practiceTextW <= 390, `${Math.round(m.practiceTextW)}px`);
  }

  check('no page exceptions / console errors', exceptions.length === 0, exceptions.slice(0, 3).join(' | '));

  ws.close();
  console.log(failures === 0 ? '\nSMOKE: ALL PASS' : `\nSMOKE: ${failures} FAILURE(S)`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => { console.error('SMOKE HARNESS ERROR:', err); process.exit(2); });
