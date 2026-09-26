// 画面に依存しない純粋関数（node でテスト可能）

const JST_OFFSET_MIN = 9 * 60;

/** Date を日本時間の {y,m,d,hh,mm} に分解（端末のタイムゾーンに依存しない） */
export function toJstParts(date) {
  const t = new Date(date.getTime() + JST_OFFSET_MIN * 60000);
  return {
    y: t.getUTCFullYear(),
    m: t.getUTCMonth() + 1,
    d: t.getUTCDate(),
    hh: t.getUTCHours(),
    mm: t.getUTCMinutes(),
  };
}

const pad = (n) => String(n).padStart(2, '0');

/**
 * Yahoo!乗換案内の検索URL
 * type: 1=出発 4=到着 3=始発 2=終電
 */
export function yahooRouteUrl({ from, to, date, time, type = 1 }) {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  const p = new URLSearchParams({
    from, to,
    y: String(y), m: pad(m), d: pad(d),
    hh: String(hh), m1: String(Math.floor(mm / 10)), m2: String(mm % 10),
    type: String(type),
    ticket: 'ic', expkind: '1', ws: '3', s: '0',
    al: '1', shin: '1', ex: '1', hb: '1', lb: '1', sr: '1',
  });
  return `https://transit.yahoo.co.jp/search/result?${p.toString()}`;
}

/** 現在時刻（JST）での検索URL */
export function yahooRouteNowUrl({ from, to, now = new Date(), type = 1 }) {
  const j = toJstParts(now);
  return yahooRouteUrl({ from, to, date: `${j.y}-${pad(j.m)}-${pad(j.d)}`, time: `${pad(j.hh)}:${pad(j.mm)}`, type });
}

export function googleTransitUrl({ from, to }) {
  const p = new URLSearchParams({ api: '1', origin: from, destination: to, travelmode: 'transit' });
  return `https://www.google.com/maps/dir/?${p.toString()}`;
}

/** "HH:MM" に分を足す（日付をまたがない範囲で使用） */
export function shiftTime(time, deltaMin) {
  const [hh, mm] = time.split(':').map(Number);
  let t = hh * 60 + mm + deltaMin;
  t = ((t % 1440) + 1440) % 1440;
  return `${pad(Math.floor(t / 60))}:${pad(t % 60)}`;
}

/** 残り時間を日本語で */
export function formatRemaining(ms) {
  if (ms <= 0) return '0分';
  const totalMin = Math.ceil(ms / 60000);
  const d = Math.floor(totalMin / 1440);
  const h = Math.floor((totalMin % 1440) / 60);
  const m = totalMin % 60;
  if (d > 0) return `${d}日${h}時間`;
  if (h > 0) return `${h}時間${m}分`;
  return `${m}分`;
}

/** カウントダウン用に分解 */
export function splitCountdown(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
}

/**
 * 旅程の中で「いま」と「つぎ」を求める
 * items: [{s, e?, ...}] を時系列順に並べた配列
 * 戻り値: { phase: 'before'|'during'|'after', current, next, index }
 */
export function findNowNext(items, now, { startAt, endAt }) {
  const t = now.getTime();
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();
  if (t < start) return { phase: 'before', current: null, next: items[0], index: -1 };
  if (t >= end) return { phase: 'after', current: null, next: null, index: items.length };
  let idx = -1;
  for (let i = 0; i < items.length; i++) {
    if (new Date(items[i].s).getTime() <= t) idx = i;
  }
  // 同時刻の項目（パパ・ママ同時）はまとめて「いま」として扱う
  const current = idx >= 0 ? items[idx] : null;
  const concurrent = idx >= 0 ? items.filter((it) => it.s === items[idx].s) : [];
  let next = null;
  for (let i = idx + 1; i < items.length; i++) {
    if (new Date(items[i].s).getTime() > t) { next = items[i]; break; }
  }
  return { phase: 'during', current, concurrent, next, index: idx };
}

/** URLの ?now=2026-10-27T17:10 で時刻を試せるようにする（家族への事前説明用） */
export function resolveNow(search, real = new Date()) {
  try {
    const q = new URLSearchParams(search).get('now');
    if (!q) return real;
    const iso = /[zZ]|[+-]\d\d:?\d\d$/.test(q) ? q : `${q}${q.length <= 16 ? ':00' : ''}+09:00`;
    const d = new Date(iso);
    return isNaN(d.getTime()) ? real : d;
  } catch {
    return real;
  }
}
