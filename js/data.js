// しおり（PDF）の内容をそのままデータ化。時刻は日本時間。
// s / e は「今なにする？」判定用の目安時刻（ISO, JST）。表示は label を使う。

export const TRIP = {
  departAt: '2026-10-27T17:00:00+09:00',
  parkOpenAt: '2026-10-28T09:00:00+09:00',
  endAt: '2026-10-28T21:00:00+09:00',
};

export const photo = (id, w = 1200, h) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}${h ? `&h=${h}` : ''}&q=70`;

export const PHOTOS = {
  hero: { id: 'photo-1548208506-a4696c2b46ec', by: 'Yu Kato', user: 'yukato' },
  harborDay: { id: 'photo-1718870010023-b4fed50a0d84', by: 'Joshua Tsu', user: 'joshdatsu' },
  harborTower: { id: 'photo-1770924741497-cd3657a7f1e7', by: 'Ayumi Takemura', user: 'step_of_ayumi' },
  domeNight: { id: 'photo-1694174603586-ffb4f892023c', by: 'fan yang', user: 'vindurriel' },
  fountainNight: { id: 'photo-1694174594312-b596ebb495cd', by: 'fan yang', user: 'vindurriel' },
  frozen: { id: 'photo-1718293630704-1c8c7dde1a95', by: 'Bubba', user: 'nandacoco' },
  rapunzel: { id: 'photo-1718293730653-3aed3bca091a', by: 'Bubba', user: 'nandacoco' },
  peterpan: { id: 'photo-1718293607479-89da01e1aabf', by: 'Bubba', user: 'nandacoco' },
  pirate: { id: 'photo-1718293558666-ca243e0e96e8', by: 'Bubba', user: 'nandacoco' },
  lanterns: { id: 'photo-1500754088824-ce0582cfe45f', by: 'Melanie Magdalena', user: 'm2creates' },
  balloons: { id: 'photo-1507608869274-d3177c8bb4c7', by: 'ian dooley', user: 'sadswim' },
  hiltonSign: { id: 'photo-1706878751306-7995658791eb', by: 'Kenjiro Yagi', user: 'kenji4861' },
  bayNight: { id: 'photo-1551617508-65a8e1cddcc2', by: 'Jonas', user: 'jonason_b' },
  marinaNight: { id: 'photo-1780352023017-1e528d249e2b', by: 'Bruce Barrow', user: 'bruceb_uk' },
  fireworks: { id: 'photo-1545505567-7327366a634d', by: 'Bryan Lopez', user: 'bryanlopez' },
  stars: { id: 'photo-1628498188904-036f5e25e93e', by: 'Olena Bohovyk', user: 'olenkasergienko' },
};

export const LINKS = {
  tdsTop: 'https://www.tokyodisneyresort.jp/tds/',
  tdsDay: 'https://www.tokyodisneyresort.jp/tds/daily/calendar/20261028/',
  tdsToday: 'https://www.tokyodisneyresort.jp/tds/daily/calendar.html',
  tdsMonthly: 'https://www.tokyodisneyresort.jp/tds/monthly/calendar.html',
  dpa: 'https://www.tokyodisneyresort.jp/tdr/guide/app_service/disneypremieraccess.html',
  app: 'https://www.tokyodisneyresort.jp/tdr/app.html',
  appService: 'https://www.tokyodisneyresort.jp/tdr/guide/app_service.html',
  frozen: 'https://www.tokyodisneyresort.jp/tds/attraction/detail/255/',
  rapunzel: 'https://www.tokyodisneyresort.jp/tds/attraction/detail/256/',
  peterpan: 'https://www.tokyodisneyresort.jp/tds/attraction/detail/257/',
  soaring: 'https://www.tokyodisneyresort.jp/tds/attraction/detail/219/',
  resortLine: 'https://www.tokyodisneyresort.jp/tdr/resortline/station.html',
  baysideTimetable: 'https://transit.yahoo.co.jp/timetable/29371/6781',
  hilton: 'https://tokyobay.hiltonjapan.co.jp/',
  hiltonAccess: 'https://tokyobay.hiltonjapan.co.jp/access/',
  hiltonTel: 'tel:0473555000',
  ikspiari: 'https://www.ikspiari.com/',
  weather1h: 'https://tenki.jp/forecast/3/15/4510/12227/1hour.html',
  weather10d: 'https://tenki.jp/forecast/3/15/4510/12227/10days.html',
  trainInfoKanto: 'https://transit.yahoo.co.jp/diainfo/area/4',
  jrEastInfo: 'https://traininfo.jreast.co.jp/train_info/kanto.aspx',
};

const d1 = (hm) => `2026-10-27T${hm}:00+09:00`;
const d2 = (hm) => `2026-10-28T${hm}:00+09:00`;

export const DAY1 = [
  { label: '17:00', s: d1('17:00'), title: '自宅を出発', note: '保谷駅まで徒歩20分', icon: 'home' },
  { label: '17:20', s: d1('17:20'), title: '保谷駅 到着', note: '舞浜方面へ移動', icon: 'station' },
  { label: '17:25頃', s: d1('17:25'), title: '保谷駅 出発', note: '乗換を含め約1時間前後を想定', icon: 'train',
    links: [{ kind: 'route', text: '17:25発の乗換を見る', from: '保谷', to: '舞浜', date: '2026-10-27', time: '17:25' }] },
  { label: '18:30-18:40頃', s: d1('18:30'), title: '舞浜駅 到着', note: 'イクスピアリへ', icon: 'pin' },
  { label: '18:45-20:00', s: d1('18:45'), title: 'イクスピアリで夕食', note: '家族で夕食', icon: 'dinner',
    links: [{ text: 'イクスピアリ公式', href: LINKS.ikspiari }] },
  { label: '20:00-20:20', s: d1('20:00'), title: '翌朝の携帯食を購入', note: 'おにぎり・サンドイッチ・飲み物など', icon: 'bag' },
  { label: '20:30頃', s: d1('20:30'), title: 'リゾートライン乗車', note: 'ベイサイド・ステーションへ', icon: 'monorail',
    links: [{ text: 'リゾートライン運行時間', href: LINKS.resortLine }] },
  { label: '20:45-21:00', s: d1('20:45'), title: 'ヒルトン東京ベイ 到着', note: 'チェックイン。朝食は客室の冷蔵庫へ', icon: 'hotel',
    links: [{ text: 'ヒルトン東京ベイ公式', href: LINKS.hilton }] },
  { label: '21:00-21:30', s: d1('21:00'), title: '入浴・翌日の準備', note: '朝すぐ出られる状態に', icon: 'bath' },
  { label: '21:30頃', s: d1('21:30'), title: 'アプリ・チケット最終確認', note: '家族4人のグループ・充電を確認', icon: 'phone',
    links: [{ text: '公式アプリ', href: LINKS.app }] },
  { label: '22:00', s: d1('22:00'), e: d2('05:20'), title: '就寝', note: '翌朝5:20起床予定', icon: 'moon' },
];

export const DAY2 = [
  { label: '5:20', s: d2('05:20'), title: '起床', note: '着替え・洗顔・トイレ', icon: 'sun' },
  { label: '5:20-5:50', s: d2('05:25'), title: '出発準備', note: '携帯食・飲み物・スマホを確認', icon: 'bag' },
  { label: '5:50', s: d2('05:50'), title: '部屋を出る', note: '忘れ物チェック', icon: 'door' },
  { label: '6:00', s: d2('06:00'), title: 'ヒルトン東京ベイ チェックアウト', note: 'ホテル朝食は利用しない', icon: 'hotel' },
  { label: '6:05頃', s: d2('06:05'), title: 'ベイサイド・ステーションへ', note: 'シャトル状況により徒歩も検討', icon: 'walk' },
  { label: '6:10-6:15頃', s: d2('06:10'), title: 'リゾートライン乗車', note: 'ディズニーシー・ステーションへ', icon: 'monorail',
    tip: '公式の運行時間では、ベイサイド・ステーションの始発は6:08頃（通常時）。',
    links: [{ text: 'ベイサイド駅の時刻表', href: LINKS.baysideTimetable }, { text: '公式 運行時間', href: LINKS.resortLine }] },
  { label: '6:20-6:30頃', s: d2('06:20'), title: 'ディズニーシー到着', note: '手荷物検査 → 入園待機列', icon: 'gate' },
  { label: '6:30-7:00頃', s: d2('06:30'), title: '待機列で朝食', note: '前夜購入の携帯食', icon: 'rice' },
  { label: '7:00-開園', s: d2('07:00'), title: '入園待機', note: '家族は体力温存', icon: 'hourglass' },
  { label: '入園直後', s: d2('09:00'), title: 'パパ：アナ雪DPAを4人分取得', note: '最優先。次回DPA購入可能時刻も確認', icon: 'star', role: 'papa', fuzzy: true,
    links: [{ text: 'DPAのしくみ', href: LINKS.dpa }, { text: 'アナとエルサのフローズンジャーニー', href: LINKS.frozen }] },
  { label: '同時', s: d2('09:00'), title: 'ママ：ショー等のエントリー受付', note: 'DPA操作と同時並行', icon: 'ticket', role: 'mama', fuzzy: true,
    links: [{ text: 'アプリでできること', href: LINKS.appService }] },
  { label: 'その後', s: d2('09:15'), title: '家族で朝イチ通常列へ', note: 'ラプンツェル等を候補に判断', icon: 'lantern', fuzzy: true,
    links: [{ text: 'ラプンツェルのランタンフェスティバル', href: LINKS.rapunzel }] },
  { label: '次回DPA解禁', s: d2('10:30'), title: '2つ目のDPAを取得', note: 'ソアリンを軸に販売状況で判断', icon: 'balloon', fuzzy: true,
    tip: '解禁時刻はパパが1つ目の購入時にアプリで確認した時刻に合わせてください。',
    links: [{ text: 'ソアリン：ファンタスティック・フライト', href: LINKS.soaring }] },
  { label: '午前-午後', s: d2('11:00'), title: 'ピーターパン等を攻略', note: 'DPA＋通常列を組み合わせる', icon: 'compass', fuzzy: true,
    links: [{ text: 'ピーターパンのネバーランドアドベンチャー', href: LINKS.peterpan }] },
  { label: '-21:00', s: d2('17:00'), e: d2('21:00'), title: 'パークを満喫', note: '夕方以降は余裕を持つ', icon: 'fireworks', fuzzy: true },
];

export const ROLES = [
  { who: 'パパ', key: 'papa', title: 'アナ雪DPA担当', text: '家族4人分をまとめて購入し、次回DPA購入可能時刻を確認。', photo: 'frozen',
    link: { text: 'DPAのしくみ', href: LINKS.dpa } },
  { who: 'ママ', key: 'mama', title: 'ショー等のエントリー担当', text: 'パパと同時並行でアプリ操作。', photo: 'domeNight',
    link: { text: 'アプリでできること', href: LINKS.appService } },
  { who: '家族', key: 'family', title: 'DPA取得後は朝イチ通常列へ', text: '当日の待ち時間を見ながらラプンツェル等へ移動。', photo: 'rapunzel',
    link: { text: 'ラプンツェルの公式ページ', href: LINKS.rapunzel } },
];

export const CHECKLIST = [
  '家族4人分のチケットをアプリで確認',
  'アプリのグループ設定を確認',
  '決済手段を確認',
  'スマホ2台＋モバイルバッテリーを満充電',
  '翌朝の携帯食と飲み物を冷蔵庫へ',
  '6:00チェックアウト用に荷物をまとめる',
];

export const ATTRACTIONS = [
  { name: 'アナとエルサのフローズンジャーニー', area: 'ファンタジースプリングス', tag: '最優先 DPA', photo: 'frozen', href: LINKS.frozen },
  { name: 'ラプンツェルのランタンフェスティバル', area: 'ファンタジースプリングス', tag: '朝イチ通常列 候補', photo: 'rapunzel', href: LINKS.rapunzel },
  { name: 'ソアリン：ファンタスティック・フライト', area: 'メディテレーニアンハーバー', tag: '2つ目のDPA 候補', photo: 'balloons', href: LINKS.soaring },
  { name: 'ピーターパンのネバーランドアドベンチャー', area: 'ファンタジースプリングス', tag: 'DPA＋通常列で', photo: 'peterpan', href: LINKS.peterpan },
];
