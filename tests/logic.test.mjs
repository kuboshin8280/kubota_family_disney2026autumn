import test from 'node:test';
import assert from 'node:assert/strict';
import { yahooRouteUrl, yahooRouteNowUrl, shiftTime, formatRemaining, splitCountdown, findNowNext, resolveNow, toJstParts } from '../js/logic.js';
import { DAY1, DAY2, TRIP, LINKS, PHOTOS, ROLES, ATTRACTIONS, CHECKLIST } from '../js/data.js';

const ALL = [...DAY1, ...DAY2];
const at = (iso) => new Date(iso);
const opts = { startAt: TRIP.departAt, endAt: TRIP.endAt };

test('Yahoo URL: 出発時刻が分解される', () => {
  const u = new URL(yahooRouteUrl({ from: '保谷', to: '舞浜', date: '2026-10-27', time: '17:25' }));
  assert.equal(u.hostname, 'transit.yahoo.co.jp');
  assert.equal(u.searchParams.get('from'), '保谷');
  assert.equal(u.searchParams.get('to'), '舞浜');
  assert.equal(u.searchParams.get('y'), '2026');
  assert.equal(u.searchParams.get('m'), '10');
  assert.equal(u.searchParams.get('d'), '27');
  assert.equal(u.searchParams.get('hh'), '17');
  assert.equal(u.searchParams.get('m1'), '2');
  assert.equal(u.searchParams.get('m2'), '5');
  assert.equal(u.searchParams.get('type'), '1');
});

test('Yahoo URL: 到着・終電タイプ', () => {
  assert.equal(new URL(yahooRouteUrl({ from: 'a', to: 'b', date: '2026-10-27', time: '18:40', type: 4 })).searchParams.get('type'), '4');
  assert.equal(new URL(yahooRouteUrl({ from: 'a', to: 'b', date: '2026-10-28', time: '21:00', type: 2 })).searchParams.get('type'), '2');
});

test('いまから検索は端末TZに関係なくJSTで作られる', () => {
  // 2026-10-27 08:05 UTC = 17:05 JST
  const u = new URL(yahooRouteNowUrl({ from: '保谷', to: '舞浜', now: at('2026-10-27T08:05:00Z') }));
  assert.equal(u.searchParams.get('d'), '27');
  assert.equal(u.searchParams.get('hh'), '17');
  assert.equal(u.searchParams.get('m1'), '0');
  assert.equal(u.searchParams.get('m2'), '5');
  // 日付またぎ: 2026-10-27 15:30 UTC = 10/28 00:30 JST
  const j = toJstParts(at('2026-10-27T15:30:00Z'));
  assert.deepEqual([j.m, j.d, j.hh, j.mm], [10, 28, 0, 30]);
});

test('shiftTime', () => {
  assert.equal(shiftTime('17:25', -20), '17:05');
  assert.equal(shiftTime('17:25', 20), '17:45');
  assert.equal(shiftTime('00:05', -10), '23:55');
});

test('formatRemaining / splitCountdown', () => {
  assert.equal(formatRemaining(5 * 60000), '5分');
  assert.equal(formatRemaining(65 * 60000), '1時間5分');
  assert.equal(formatRemaining((24 * 60 + 90) * 60000), '1日1時間');
  assert.deepEqual(splitCountdown(90061000), { days: 1, hours: 1, minutes: 1, seconds: 1 });
  assert.deepEqual(splitCountdown(-5), { days: 0, hours: 0, minutes: 0, seconds: 0 });
});

test('旅行前は before', () => {
  const r = findNowNext(ALL, at('2026-09-26T16:00:00+09:00'), opts);
  assert.equal(r.phase, 'before');
  assert.equal(r.next.title, '自宅を出発');
});

test('10/27 17:22 は保谷駅到着、次は保谷駅出発', () => {
  const r = findNowNext(ALL, at('2026-10-27T17:22:00+09:00'), opts);
  assert.equal(r.phase, 'during');
  assert.equal(r.current.title, '保谷駅 到着');
  assert.equal(r.next.title, '保谷駅 出発');
});

test('深夜は就寝中、次は起床', () => {
  const r = findNowNext(ALL, at('2026-10-28T02:00:00+09:00'), opts);
  assert.equal(r.current.title, '就寝');
  assert.equal(r.next.title, '起床');
});

test('9:05 はパパ・ママ同時進行の2件', () => {
  const r = findNowNext(ALL, at('2026-10-28T09:05:00+09:00'), opts);
  assert.equal(r.concurrent.length, 2);
  assert.ok(r.concurrent.some((c) => c.role === 'papa'));
  assert.ok(r.concurrent.some((c) => c.role === 'mama'));
  assert.equal(r.next.title, '家族で朝イチ通常列へ');
});

test('21:00 以降は after', () => {
  assert.equal(findNowNext(ALL, at('2026-10-28T21:30:00+09:00'), opts).phase, 'after');
});

test('?now= パラメータ', () => {
  assert.equal(resolveNow('?now=2026-10-28T09:05').toISOString(), '2026-10-28T00:05:00.000Z');
  const real = new Date('2020-01-01T00:00:00Z');
  assert.equal(resolveNow('?now=bad', real), real);
  assert.equal(resolveNow('', real), real);
});

test('しおりのデータ: 件数と時系列順', () => {
  assert.equal(DAY1.length, 11);
  assert.equal(DAY2.length, 15);
  assert.equal(CHECKLIST.length, 6);
  assert.equal(ROLES.length, 3);
  for (let i = 1; i < ALL.length; i++) {
    assert.ok(new Date(ALL[i].s) >= new Date(ALL[i - 1].s), `順序: ${ALL[i].title}`);
  }
});

test('リンクと写真の参照がすべて有効', () => {
  for (const [k, v] of Object.entries(LINKS)) assert.match(v, /^(https:\/\/|tel:)/, k);
  for (const it of [...ROLES, ...ATTRACTIONS]) assert.ok(PHOTOS[it.photo], it.photo);
});
