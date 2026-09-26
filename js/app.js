import { TRIP, PHOTOS, LINKS, DAY1, DAY2, ROLES, CHECKLIST, ATTRACTIONS, photo } from './data.js';
import {
  yahooRouteUrl, yahooRouteNowUrl, googleTransitUrl, shiftTime, formatRemaining,
  splitCountdown, findNowNext, resolveNow, toJstParts,
} from './logic.js';
import { icon } from './icons.js';

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// テスト・事前説明用: ?now=2026-10-28T09:05 で時刻を固定できる
const fixedNow = new URLSearchParams(location.search).has('now');
const offset = resolveNow(location.search).getTime() - Date.now();
const now = () => new Date(Date.now() + offset);

/* ---------- photos ---------- */
function paintPhotos() {
  const w = Math.min(1600, Math.round(window.innerWidth * (window.devicePixelRatio || 1)));
  document.querySelectorAll('[data-photo]').forEach((el) => {
    const p = PHOTOS[el.dataset.photo];
    if (!p) return;
    const isBig = el.classList.contains('hero__photo') || el.classList.contains('day__photo');
    el.style.backgroundImage = `url("${photo(p.id, isBig ? w : 700)}")`;
  });
}

/* ---------- stars ---------- */
function paintStars() {
  const g = $('#stars');
  if (!g) return;
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  let html = '';
  for (let i = 0; i < 70; i++) {
    const x = rnd() * 400, y = rnd() * 170, r = rnd() * 1.1 + .3;
    html += `<circle class="star" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(2)}" style="--d:${(2 + rnd() * 4).toFixed(1)}s;--dl:${(rnd() * 4).toFixed(1)}s"/>`;
  }
  g.innerHTML = html;
}

/* ---------- links ---------- */
function linkHref(l) {
  if (l.kind === 'route') return yahooRouteUrl(l);
  return l.href;
}
function linkBtn(l, cls = 'btn btn--link') {
  const href = linkHref(l);
  const ext = href.startsWith('http');
  return `<a class="${cls}" href="${esc(href)}"${ext ? ' target="_blank" rel="noopener"' : ''}>${icon(ext ? 'ext' : 'link')}${esc(l.text)}</a>`;
}

/* ---------- timeline ---------- */
function renderTimeline(id, items) {
  const ol = document.getElementById(id);
  ol.innerHTML = items.map((it, i) => `
    <li class="tl${it.role ? ` tl--role-${it.role}` : ''}" data-s="${it.s}" data-idx="${i}">
      <div class="tl__icon">${icon(it.icon)}</div>
      <div class="tl__card">
        <div class="tl__time">${esc(it.label)}</div>
        <h3 class="tl__title">${esc(it.title)}</h3>
        <p class="tl__note">${esc(it.note)}</p>
        ${it.tip ? `<p class="tl__tip">💡 ${esc(it.tip)}</p>` : ''}
        ${it.links ? `<div class="tl__links">${it.links.map((l) => linkBtn(l)).join('')}</div>` : ''}
      </div>
    </li>`).join('');
}

/* ---------- now / next ---------- */
const ALL = [...DAY1, ...DAY2];
function renderNow() {
  const n = now();
  const j = toJstParts(n);
  $('#nowClock').textContent = `${j.m}/${j.d} ${String(j.hh).padStart(2, '0')}:${String(j.mm).padStart(2, '0')}`;
  const r = findNowNext(ALL, n, { startAt: TRIP.departAt, endAt: TRIP.endAt });
  const badge = $('#nowBadge');
  const body = $('#nowBody');

  if (r.phase === 'before') {
    badge.textContent = 'BEFORE VOYAGE';
    badge.classList.remove('is-live');
    const ms = new Date(TRIP.departAt) - n;
    body.innerHTML = `
      <p class="now__lead">出航まで あと <b style="color:var(--gold-soft)">${formatRemaining(ms)}</b></p>
      <div class="now__main">${icon('ship')}<div><h3>10/27（火）17:00 自宅を出発</h3><p>前夜チェックと天気の確認を忘れずに。</p></div></div>
      <div class="now__links">
        <a class="btn btn--link" href="#check">${icon('check')}前夜チェックへ</a>
        <a class="btn btn--link" href="${LINKS.weather10d}" target="_blank" rel="noopener">${icon('cloud')}浦安の2週間天気</a>
        <a class="btn btn--link" href="${LINKS.tdsDay}" target="_blank" rel="noopener">${icon('ext')}10/28のパーク情報</a>
      </div>`;
  } else if (r.phase === 'after') {
    badge.textContent = 'WELCOME HOME';
    badge.classList.remove('is-live');
    body.innerHTML = `<div class="now__main">${icon('moon')}<div><h3>おかえりなさい！</h3><p>楽しい思い出をありがとう。気をつけて帰ってね。</p></div></div>
      <div class="now__links"><a class="btn btn--link" href="${yahooRouteNowUrl({ from: '舞浜', to: '保谷', now: n })}" target="_blank" rel="noopener">${icon('train')}いまから 舞浜→保谷</a></div>`;
  } else {
    badge.textContent = 'NOW';
    badge.classList.add('is-live');
    const cur = r.concurrent && r.concurrent.length > 1 ? r.concurrent : [r.current];
    const main = cur.map((c) => `
      <div class="now__main">${icon(c.icon)}<div><h3>${esc(c.title)}</h3><p>${esc(c.label)}　${esc(c.note)}</p></div></div>`).join('');
    const links = cur.flatMap((c) => c.links || []);
    const nextHtml = r.next
      ? `<div class="now__next">${icon('clock', 'ico')}<div>つぎ：<b>${esc(r.next.title)}</b>（${esc(r.next.label)}）</div><span class="in">${r.next.fuzzy ? '目安 ' : ''}あと${formatRemaining(new Date(r.next.s) - n)}</span></div>`
      : '';
    body.innerHTML = `${main}${nextHtml}${links.length ? `<div class="now__links">${links.map((l) => linkBtn(l)).join('')}</div>` : ''}`;
  }

  // タイムラインのハイライト
  document.querySelectorAll('.tl').forEach((li) => li.classList.remove('is-now', 'is-past'));
  if (r.phase === 'during' && r.current) {
    const curS = new Date(r.current.s).getTime();
    document.querySelectorAll('.tl').forEach((li) => {
      const s = new Date(li.dataset.s).getTime();
      if (s === curS) li.classList.add('is-now');
      else if (s < curS) li.classList.add('is-past');
    });
  } else if (r.phase === 'after') {
    document.querySelectorAll('.tl').forEach((li) => li.classList.add('is-past'));
  }
}

/* ---------- countdown ---------- */
function renderCountdown() {
  const n = now();
  const depart = new Date(TRIP.departAt), open = new Date(TRIP.parkOpenAt), end = new Date(TRIP.endAt);
  let target = depart, label = '出航（自宅出発）まで';
  if (n >= depart && n < open) { target = open; label = '開園（9:00予定）まで'; }
  else if (n >= open && n < end) { target = end; label = 'パークで遊べる時間 あと'; }
  else if (n >= end) { target = n; label = 'すてきな旅をありがとう'; }
  const c = splitCountdown(target - n);
  $('#cdLabel').textContent = label;
  $('#cdD').textContent = c.days;
  $('#cdH').textContent = String(c.hours).padStart(2, '0');
  $('#cdM').textContent = String(c.minutes).padStart(2, '0');
  $('#cdS').textContent = String(c.seconds).padStart(2, '0');
}

/* ---------- trains ---------- */
function setupTrains() {
  const plan = '17:25';
  const offsets = [-20, -10, 0, 10, 20];
  $('#depButtons').innerHTML = offsets.map((o) => {
    const t = shiftTime(plan, o);
    const tag = o === 0 ? '予定' : o < 0 ? `${-o}分早め` : `${o}分遅め`;
    return `<a class="time-btn${o === 0 ? ' is-plan' : ''}" target="_blank" rel="noopener" href="${esc(yahooRouteUrl({ from: '保谷', to: '舞浜', date: '2026-10-27', time: t }))}"><b>${t}</b><span>${tag}</span></a>`;
  }).join('');

  const custom = $('#customTime');
  const go = $('#customGo');
  const upd = () => { go.href = yahooRouteUrl({ from: '保谷', to: '舞浜', date: '2026-10-27', time: custom.value || plan }); };
  custom.addEventListener('input', upd);
  upd();

  const refreshNowLinks = () => {
    const n = now();
    $('#nowFromHoya').href = yahooRouteNowUrl({ from: '保谷', to: '舞浜', now: n });
    $('#homeNow').href = yahooRouteNowUrl({ from: '舞浜', to: '保谷', now: n });
  };
  refreshNowLinks();
  // 「いまから」ボタンは押した瞬間の時刻で作り直す
  ['#nowFromHoya', '#homeNow'].forEach((s) => $(s).addEventListener('pointerdown', refreshNowLinks));

  $('#arriveBy').href = yahooRouteUrl({ from: '保谷', to: '舞浜', date: '2026-10-27', time: '18:40', type: 4 });
  $('#homeLast').href = yahooRouteUrl({ from: '舞浜', to: '保谷', date: '2026-10-28', time: '21:00', type: 2 });
  $('#gmapsGo').href = googleTransitUrl({ from: '保谷駅', to: '舞浜駅' });
}

/* ---------- roles & attractions ---------- */
function renderRoles() {
  $('#roles-grid').innerHTML = ROLES.map((r) => `
    <article class="role role--${r.key}">
      <div class="role__photo" data-photo="${r.photo}"><div class="role__who">${esc(r.who)}</div></div>
      <div class="role__body">
        <h3>${esc(r.title)}</h3>
        <p>${esc(r.text)}</p>
        <div>${linkBtn(r.link)}</div>
      </div>
    </article>`).join('');
  $('#attr-grid').innerHTML = ATTRACTIONS.map((a) => `
    <a class="attr" href="${a.href}" target="_blank" rel="noopener">
      <div class="attr__photo" data-photo="${a.photo}"></div>
      <div class="attr__body">
        <span class="attr__tag">${esc(a.tag)}</span>
        <h3>${esc(a.name)}</h3>
        <p>${esc(a.area)}</p>
        <span class="more">公式ページ ${icon('ext')}</span>
      </div>
    </a>`).join('');
}

/* ---------- checklist ---------- */
const KEY = 'kubota-voyage-2026-check';
function loadChecks() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}
function saveChecks(v) {
  try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* 保存できない環境でも動作 */ }
}
function renderChecklist() {
  const state = loadChecks();
  $('#checklist').innerHTML = CHECKLIST.map((t, i) => `
    <li class="${state[i] ? 'done' : ''}">
      <label><input type="checkbox" data-i="${i}" ${state[i] ? 'checked' : ''}><span class="box">${icon('check')}</span><span class="txt">${esc(t)}</span></label>
    </li>`).join('');
  updateProgress(state, false);
  $('#checklist').addEventListener('change', (e) => {
    const i = Number(e.target.dataset.i);
    const s = loadChecks();
    s[i] = e.target.checked;
    saveChecks(s);
    e.target.closest('li').classList.toggle('done', e.target.checked);
    updateProgress(s, true);
  });
  $('#resetCheck').addEventListener('click', () => {
    saveChecks([]);
    document.querySelectorAll('#checklist input').forEach((c) => { c.checked = false; c.closest('li').classList.remove('done'); });
    updateProgress([], false);
  });
}
function updateProgress(state, celebrate) {
  const done = CHECKLIST.filter((_, i) => state[i]).length;
  const pct = done / CHECKLIST.length;
  $('#progShip').style.left = `calc(${(pct * 88).toFixed(1)}%)`;
  $('#progText').textContent = `${done} / ${CHECKLIST.length}${done === CHECKLIST.length ? '　準備完了！おやすみなさい 🌙' : ''}`;
  if (celebrate && done === CHECKLIST.length) { fireworks(); toast('全部チェック完了！明日は5:20起床です ⭐'); }
}

/* ---------- fx ---------- */
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 3200);
}
function fireworks() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = $('#fx'), ctx = c.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  c.width = innerWidth * dpr; c.height = innerHeight * dpr; ctx.scale(dpr, dpr);
  const colors = ['#e2a33b', '#f6e7b8', '#9fd3d6', '#ffffff', '#f08a6c'];
  const parts = [];
  for (let b = 0; b < 4; b++) {
    const cx = innerWidth * (.2 + Math.random() * .6), cy = innerHeight * (.2 + Math.random() * .3);
    for (let i = 0; i < 46; i++) {
      const a = (Math.PI * 2 * i) / 46, sp = 2 + Math.random() * 3;
      parts.push({ x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 70 + Math.random() * 30, col: colors[(b + i) % colors.length], delay: b * 14 });
    }
  }
  let f = 0;
  (function tick() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    let alive = 0;
    for (const p of parts) {
      if (f < p.delay) { alive++; continue; }
      if (p.life <= 0) continue;
      alive++;
      p.x += p.vx; p.y += p.vy; p.vy += .05; p.vx *= .985; p.life--;
      ctx.globalAlpha = Math.max(0, p.life / 100);
      ctx.fillStyle = p.col;
      ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, 7); ctx.fill();
    }
    f++;
    if (alive) requestAnimationFrame(tick); else ctx.clearRect(0, 0, innerWidth, innerHeight);
  })();
}

/* ---------- chart ship ---------- */
function sailChartShip() {
  const path = $('#route'), ship = $('#chartShip');
  if (!path || !ship || !path.getTotalLength) return;
  const len = path.getTotalLength();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let t0 = null;
  function step(ts) {
    if (t0 === null) t0 = ts;
    const p = reduce ? 1 : ((ts - t0) / 14000) % 1;
    const pt = path.getPointAtLength(p * len);
    ship.setAttribute('transform', `translate(${pt.x} ${pt.y - 8})`);
    if (!reduce) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ---------- scroll reveal & nav ---------- */
function setupReveal() {
  const items = document.querySelectorAll('.tl');
  if (!('IntersectionObserver' in window)) { items.forEach((i) => i.classList.add('in')); return; }
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
  items.forEach((i) => io.observe(i));

  const links = [...document.querySelectorAll('.nav a')];
  const secs = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const nio = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${e.target.id}`));
  }), { rootMargin: '-45% 0px -50% 0px' });
  secs.forEach((s) => nio.observe(s));
}

function renderCredits() {
  const seen = new Set();
  $('#credits').innerHTML = Object.values(PHOTOS).filter((p) => !seen.has(p.id) && seen.add(p.id)).map((p) =>
    `<li>Photo by <a href="https://unsplash.com/@${p.user}?utm_source=kubota_family_voyage&utm_medium=referral" target="_blank" rel="noopener">${esc(p.by)}</a></li>`).join('');
}

/* ---------- init ---------- */
renderTimeline('tl-day1', DAY1);
renderTimeline('tl-day2', DAY2);
renderRoles();
paintPhotos();
paintStars();
setupTrains();
renderChecklist();
renderCredits();
renderNow();
renderCountdown();
setupReveal();
sailChartShip();
setInterval(renderCountdown, 1000);
setInterval(renderNow, 30000);

if (fixedNow) toast('時刻シミュレーション中（URLの ?now= を外すと通常表示）');

// 「いま」の項目が画面外なら、当日はそっと知らせる
document.addEventListener('visibilitychange', () => { if (!document.hidden) { renderNow(); renderCountdown(); } });
