(() => {
'use strict';

/* ---------- helpers ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const app = $('#app');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const img = (u) => (u ? '/img?u=' + encodeURIComponent(u) : '');
const store = {
  get(k, d) { try { const v = localStorage.getItem('koma.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('koma.' + k, JSON.stringify(v)); } catch {} },
};

/* ---------- i18n ---------- */
const T = {
  vi: {
    discover: 'Khám phá', latestNav: 'Mới cập nhật', latestShort: 'Mới', reading: 'Đang đọc', library: 'Thư viện',
    search: 'Tìm kiếm', searchPh: 'Tìm truyện', spotlight: 'Tiêu điểm', start: 'Đọc', startVi: 'Đọc tiếng Việt',
    continueCh: 'Đọc tiếp Ch. {c}', details: 'Chi tiết', save: 'Lưu', saved: 'Đã lưu', chapters: 'chương',
    continueT: 'Đọc tiếp', seeAll: 'Tất cả', noHistory: 'Chưa có truyện đang đọc. Chọn một bộ bên dưới để bắt đầu.',
    latestT: 'Mới cập nhật', tlLabel: 'Ngôn ngữ bản dịch', tl_vi: 'Tiếng Việt', tl_all: 'Tất cả', tl_en: 'English',
    empty: 'Chưa có truyện.', popular: 'Phổ biến', browse: 'Tất cả truyện', filters: 'Bộ lọc', hasVi: 'Có tiếng Việt', all: 'Tất cả',
    sortNote: 'Sắp xếp: bộ có bản dịch tiếng Việt lên đầu, theo chương tiếng Việt mới cập nhật — sau đó đến các ngôn ngữ khác.',
    loadMore: 'Tải thêm', loading: 'Đang tải…', error: 'Lỗi', retry: 'Thử lại', searchT: 'Kết quả cho “{q}”', noResults: 'Không tìm thấy truyện.',
    back: 'Quay lại', author: 'Tác giả', artist: 'Họa sĩ', status: 'Tình trạng', year: 'Năm', languages: 'Bản dịch',
    ongoing: 'Đang ra', completed: 'Hoàn thành', hiatus: 'Tạm ngưng', cancelled: 'Đã hủy',
    chaptersT: 'Danh sách chương', prefLabel: 'Ưu tiên bản dịch', newest: 'Mới nhất trước', oldest: 'Cũ nhất trước',
    missingVi: 'Chưa có bản tiếng Việt', missingEn: 'Chưa có bản tiếng Anh', readFallback: 'Đọc bản {l} →',
    noViNote: 'Bộ này chưa có bản tiếng Việt — nút Đọc sẽ mở bản tiếng Anh.', descEnNote: 'Mô tả bằng tiếng Anh — chưa có bản tiếng Việt.',
    oneshot: 'Oneshot', external: 'Trang ngoài', noGroup: 'Không rõ nhóm dịch', noChapters: 'Chưa có chương đọc được.', chapter: 'Chương',
    tabReading: 'Đang đọc', tabSaved: 'Đã lưu', emptyLib: 'Chưa có gì ở đây.', page: 'tr.',
    agoM: '{n} phút trước', agoH: '{n} giờ trước', agoD: '{n} ngày trước',
    tl: 'Bản dịch', settings: 'Cài đặt', close: 'Đóng', dir: 'Chiều đọc', rtl: 'Manga ←', ltr: 'Comic →', strip: 'Cuộn dọc',
    fit: 'Vừa khung', fitH: 'Chiều cao', fitW: 'Chiều rộng', bg: 'Nền', dark: 'Tối', light: 'Sáng', brightness: 'Độ sáng',
    saver: 'Tiết kiệm dữ liệu', off: 'Tắt', on: 'Bật', prev: 'Trước', next: 'Sau', fullscreen: 'Toàn màn hình', toggleHud: 'Hiện hoặc ẩn thanh điều khiển',
    keys: 'Phím: ← → lật trang · Space trang sau · F toàn màn hình · H ẩn thanh công cụ',
    endT: 'Hết chương {c}', nextCh: 'Chương tiếp: Ch. {c} →', noNext: 'Đây là chương mới nhất.', backSeries: 'Về trang truyện',
    externalMsg: 'Chương này chỉ đọc được trên trang của nhà phát hành.', openExternal: 'Mở trang ngoài ↗', pages: 'Trang',
    lightMode: 'Chuyển sang nền sáng', darkMode: 'Chuyển sang nền tối',
  },
  en: {
    discover: 'Discover', latestNav: 'Latest', latestShort: 'Latest', reading: 'Reading', library: 'Library',
    search: 'Search', searchPh: 'Search manga', spotlight: 'Spotlight', start: 'Read', startVi: 'Read in Vietnamese',
    continueCh: 'Continue Ch. {c}', details: 'Details', save: 'Save', saved: 'Saved', chapters: 'chapters',
    continueT: 'Continue', seeAll: 'All', noHistory: 'Nothing in progress yet. Pick a series below to start.',
    latestT: 'Latest', tlLabel: 'Translation language', tl_vi: 'Tiếng Việt', tl_all: 'All', tl_en: 'English',
    empty: 'Nothing yet.', popular: 'Popular', browse: 'All series', filters: 'Filters', hasVi: 'Has Vietnamese', all: 'All',
    sortNote: 'Sorted: series with a Vietnamese translation first, by newest Vietnamese chapter — then other languages.',
    loadMore: 'Load more', loading: 'Loading…', error: 'Error', retry: 'Retry', searchT: 'Results for “{q}”', noResults: 'No series found.',
    back: 'Back', author: 'Author', artist: 'Artist', status: 'Status', year: 'Year', languages: 'Translations',
    ongoing: 'Ongoing', completed: 'Completed', hiatus: 'Hiatus', cancelled: 'Cancelled',
    chaptersT: 'Chapters', prefLabel: 'Preferred translation', newest: 'Newest first', oldest: 'Oldest first',
    missingVi: 'No Vietnamese version yet', missingEn: 'No English version yet', readFallback: 'Read {l} →',
    noViNote: 'No Vietnamese translation yet — Read opens English.', descEnNote: 'Description in English — no Vietnamese one yet.',
    oneshot: 'Oneshot', external: 'External', noGroup: 'Unknown group', noChapters: 'No readable chapters.', chapter: 'Chapter',
    tabReading: 'Reading', tabSaved: 'Saved', emptyLib: 'Nothing here yet.', page: 'p.',
    agoM: '{n}m ago', agoH: '{n}h ago', agoD: '{n}d ago',
    tl: 'Translation', settings: 'Settings', close: 'Close', dir: 'Direction', rtl: 'Manga ←', ltr: 'Comic →', strip: 'Long strip',
    fit: 'Fit', fitH: 'Height', fitW: 'Width', bg: 'Background', dark: 'Dark', light: 'Light', brightness: 'Brightness',
    saver: 'Data saver', off: 'Off', on: 'On', prev: 'Prev', next: 'Next', fullscreen: 'Fullscreen', toggleHud: 'Show or hide controls',
    keys: 'Keys: ← → turn page · Space next · F fullscreen · H hide toolbar',
    endT: 'End of chapter {c}', nextCh: 'Next: Ch. {c} →', noNext: 'This is the latest chapter.', backSeries: 'Back to series',
    externalMsg: 'This chapter is only readable on the publisher’s site.', openExternal: 'Open external site ↗', pages: 'Pages',
    lightMode: 'Switch to light mode', darkMode: 'Switch to dark mode',
  },
};
const GENRES = [['Action', 'Hành động'], ['Romance', 'Tình cảm'], ['Comedy', 'Hài hước'], ['Fantasy', 'Giả tưởng'], ['Drama', 'Chính kịch'], ['Slice of Life', 'Đời thường'], ['Isekai', 'Isekai'], ['Horror', 'Kinh dị']];

let ui = store.get('ui', 'vi');
let theme = store.get('theme', 'dark');
const state = { tl: store.get('tl', 'vi'), viOnly: store.get('viOnly', false), genre: '' };
const t = (k, vars) => {
  let s = T[ui][k] ?? T.vi[k] ?? k;
  if (vars) for (const [a, b] of Object.entries(vars)) s = s.replace('{' + a + '}', b);
  return s;
};
const name = (m) => (ui === 'vi' && m.viTitle) || m.title || '';
const langName = (code) => { try { return new Intl.DisplayNames([ui], { type: 'language' }).of(code); } catch { return code; } };
const badge = (l) => `<span class="lbadge ${l === 'vi' ? 'vi' : ''}">${esc(String(l || '').toUpperCase())}</span>`;
const chLabel = (c) => (c.ch ? 'Ch. ' + esc(c.ch) : t('oneshot'));
const chNum = (c) => { const n = parseFloat(c.ch); return isNaN(n) ? -1 : n; };
const sortChapters = (arr) => [...arr].sort((a, b) => chNum(a) - chNum(b) || String(a.at).localeCompare(String(b.at)));
const stripMd = (s) => String(s || '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_]{2,3}/g, '').replace(/^-{3,}\s*$/gm, '').trim();
function ago(iso) {
  if (!iso) return '';
  const m = Math.max(1, Math.round((Date.now() - new Date(iso)) / 60000));
  if (m < 60) return t('agoM', { n: m });
  const h = Math.round(m / 60);
  if (h < 24) return t('agoH', { n: h });
  const d = Math.round(h / 24);
  return d < 30 ? t('agoD', { n: d }) : new Date(iso).toLocaleDateString(ui);
}
const errHtml = (e) => `<div class="status">${t('error')}: ${esc(e.message)}<br><button class="btn btn-ghost" style="margin-top:12px" type="button" onclick="location.reload()">${t('retry')}</button></div>`;
const ICON = {
  sun: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke-linecap="round"/></svg>',
  moon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z" stroke-linejoin="round"/></svg>',
  play: '<svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.34-5.89a1.5 1.5 0 000-2.54L6.3 2.84z"/></svg>',
  mark: (fill) => `<svg width="16" height="16" viewBox="0 0 24 24" fill="${fill ? '#D9381E' : 'none'}" stroke="#D9381E" stroke-width="2" aria-hidden="true"><path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" stroke-linejoin="round"/></svg>`,
  back: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  gear: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" stroke-linecap="round"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg>',
  full: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

/* ---------- data ---------- */
const memo = new Map();
function api(p, ttl = 60000) {
  const hit = memo.get(p);
  if (hit && Date.now() - hit.t < ttl) return hit.p;
  const pr = fetch(p).then(async (r) => {
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error || r.statusText);
    return j;
  });
  memo.set(p, { t: Date.now(), p: pr });
  pr.catch(() => memo.delete(p));
  return pr;
}
const hist = () => store.get('history', {});
const savedMap = () => store.get('saved', {});
const mini = (m) => ({ id: m.id, title: m.title, viTitle: m.viTitle, cover: m.cover, hasVi: m.hasVi, authors: m.authors || [] });
function toggleSaved(m) {
  const s = savedMap();
  if (s[m.id]) delete s[m.id];
  else s[m.id] = { ...mini(m), at: Date.now() };
  store.set('saved', s);
  return !!s[m.id];
}
// Prefer the Vietnamese version of a chapter, then the given language, then anything.
const preferVersion = (versions, lang) => versions.find((v) => v.lang === 'vi') || versions.find((v) => v.lang === lang) || versions[0];
function groupChapters(chapters) {
  const groups = new Map();
  for (const c of chapters) {
    const key = c.ch ?? 'id:' + c.id;
    if (!groups.has(key)) groups.set(key, { key, ch: c.ch, vol: c.vol, versions: [] });
    groups.get(key).versions.push(c);
  }
  return [...groups.values()].sort((a, b) => chNum(a) - chNum(b));
}

// "Read" always opens Vietnamese when it exists.
async function startReading(id) {
  const d = await api('/api/manga/' + id, 300000);
  const readable = d.chapters.filter((c) => !c.external);
  const h = hist()[id];
  if (h && h.chapterId) {
    const viSame = readable.find((c) => c.lang === 'vi' && (c.ch ?? null) === (h.ch ?? null));
    if (!viSame || viSame.id === h.chapterId) return void (location.hash = `#/read/${h.chapterId}?p=${h.page || 1}`);
    return void (location.hash = '#/read/' + viSame.id);
  }
  const first = (lang) => sortChapters(readable.filter((c) => c.lang === lang))[0];
  const c = first('vi') || first('en') || sortChapters(readable)[0];
  if (c) location.hash = '#/read/' + c.id;
  else alert(t('noChapters'));
}

/* ---------- shared markup ---------- */
function coverHtml(m, cls = '', big = false) {
  const src = big ? m.coverLg || m.cover : m.cover;
  return `<div class="cover ${cls}">${src ? `<img loading="lazy" src="${img(src)}" alt="">` : '<div class="ph">駒</div>'}${m.hasVi ? '<span class="vi-badge">VI</span>' : ''}</div>`;
}
function cardHtml(m) {
  const sub = m.hasVi && m.viCh ? `<div class="card-sub">Ch. ${esc(m.viCh)}</div>` : '';
  return `<a href="#/series/${m.id}" class="card lift">${coverHtml(m, 'shadow')}<div><div class="card-title" title="${esc(name(m))}">${esc(name(m))}</div>${sub}</div></a>`;
}
function browseHeader(title, withGenres) {
  const genres = withGenres
    ? '<span class="filter-sep" aria-hidden="true"></span>' +
      [['', t('all')], ...GENRES.map((g) => [g[0], ui === 'vi' ? g[1] : g[0]])]
        .map(([k, l]) => `<button type="button" class="chip" data-genre="${esc(k)}" aria-pressed="${state.genre === k}">${esc(l)}</button>`).join('')
    : '';
  return `<h2 class="h2">${esc(title)}</h2>
  <div class="filterbar" id="filterbar" role="group" aria-label="${t('filters')}" style="margin-top:16px">
    <button type="button" class="chip chip-vi" data-vi aria-pressed="${state.viOnly}"><span class="tick" aria-hidden="true"></span>${t('hasVi')}</button>${genres}
  </div>`;
}

/* ---------- chrome ---------- */
function applyChrome() {
  const b = document.body.classList;
  b.toggle('k-dark', theme === 'dark');
  b.toggle('k-light', theme !== 'dark');
  b.toggle('ui-en', ui === 'en');
  document.documentElement.lang = ui;
  $$('[data-i18n]').forEach((el) => (el.textContent = t(el.dataset.i18n)));
  $('#q').placeholder = t('searchPh');
  const tb = $('#themeBtn');
  tb.innerHTML = theme === 'dark' ? ICON.sun : ICON.moon;
  tb.setAttribute('aria-label', t(theme === 'dark' ? 'lightMode' : 'darkMode'));
  tb.title = tb.getAttribute('aria-label');
  $$('#uiLang button').forEach((x) => x.setAttribute('aria-pressed', x.dataset.ui === ui));
}
function setNav(key) {
  $$('[data-nav]').forEach((a) => a.classList.toggle('on', a.dataset.nav === key));
}

/* ---------- router ---------- */
let renderId = 0;
let cleanup = null;
function route() {
  if (cleanup) { cleanup(); cleanup = null; }
  const h = location.hash.slice(1) || '/';
  const [p, query = ''] = h.split('?');
  const params = new URLSearchParams(query);
  const seg = p.split('/').filter(Boolean);
  document.body.classList.remove('reading');
  setNav(seg[0] === 'series' || seg[0] === 'search' ? '' : seg[0] || 'home');
  window.scrollTo(0, 0);
  switch (seg[0]) {
    case undefined: return renderHome();
    case 'latest': return renderHome('latest');
    case 'search': return renderSearch(params.get('q') || '');
    case 'series': return renderSeries(seg[1]);
    case 'read': return renderReader(seg[1], params);
    case 'library': return renderLibrary();
    case 'continue': return goContinue();
    default: return renderHome();
  }
}

/* ---------- home ---------- */
function renderHome(anchor) {
  const my = ++renderId;
  app.innerHTML = `<main class="wrap">
  <section class="hero-row">
    <div class="hero surface" id="hero"><div class="status" style="flex:1">${t('loading')}</div></div>
    <div class="continue surface" id="continue"></div>
  </section>
  <section id="latest" class="split">
    <div class="main">
      <div class="sechead"><h2 class="h2">${t('latestT')}</h2>
        <div class="seg" role="group" aria-label="${t('tlLabel')}" id="tlSeg">${['vi', 'all', 'en'].map((k) => `<button type="button" data-tl="${k}" aria-pressed="${k === state.tl}">${t('tl_' + k)}</button>`).join('')}</div>
      </div>
      <div class="surface" id="latestList"></div>
    </div>
    <aside><h2 class="h2" style="margin-bottom:16px">${t('popular')}</h2><ol class="poplist" id="popList"><li class="status">${t('loading')}</li></ol></aside>
  </section>
  <section id="browse">${browseHeader(t('browse'), true)}<div class="grid" id="grid"></div><div class="more" id="more"></div></section>
  </main>`;
  renderContinue();
  loadLatest(my);
  loadPopular(my);
  initBrowse(my, { mode: 'browse' });
  $('#tlSeg').onclick = (e) => {
    const b = e.target.closest('[data-tl]');
    if (!b) return;
    state.tl = b.dataset.tl;
    store.set('tl', state.tl);
    $$('#tlSeg button').forEach((x) => x.setAttribute('aria-pressed', x === b));
    loadLatest(my);
  };
  if (anchor) requestAnimationFrame(() => document.getElementById(anchor)?.scrollIntoView());
}
function renderContinue() {
  const list = Object.values(hist()).sort((a, b) => b.at - a.at).slice(0, 3);
  $('#continue').innerHTML = `<div class="continue-head"><h2 class="eyebrow">${t('continueT')}</h2><a href="#/library">${t('seeAll')}</a></div>` +
    (list.length ? list.map(shelfRow).join('') : `<p class="muted" style="margin:0;font-size:14px">${t('noHistory')}</p>`);
}
const pct = (h) => Math.round(((h.page || 1) / (h.total || 1)) * 100);
const shelfRow = (h) => `<a href="#/read/${h.chapterId}?p=${h.page || 1}" class="crow row">${coverHtml(h, 'sm')}<div class="crow-body"><div class="crow-title">${esc(name(h))}</div><div class="crow-meta"><span>${chLabel(h)} · ${t('page')} ${h.page}/${h.total}</span>${badge(h.lang)}</div><div class="bar"><i style="width:${pct(h)}%"></i></div></div></a>`;

async function loadLatest(my) {
  const box = $('#latestList');
  const lang = state.tl;
  box.innerHTML = `<div class="status">${t('loading')}</div>`;
  try {
    const rows = await api('/api/latest?lang=' + lang);
    if (my !== renderId || lang !== state.tl) return;
    box.innerHTML = rows.length
      ? rows.map((r) => {
          const m = r.manga || { title: '?' };
          return `<a class="lrow row" href="#/read/${r.id}">${coverHtml(m, 'sm')}<div class="l-series"><b>${esc(name(m))}</b><span>${chLabel(r)}</span></div><div class="l-side">${state.tl === 'all' ? badge(r.lang) : ''}<span>${ago(r.at)}</span></div></a>`;
        }).join('')
      : `<div class="status">${t('empty')}</div>`;
  } catch (e) {
    if (my === renderId) box.innerHTML = errHtml(e);
  }
}

async function loadPopular(my) {
  try {
    const list = await api('/api/popular', 600000);
    if (my !== renderId) return;
    $('#popList').innerHTML = list.slice(0, 5).map((m, i) => `<li><a class="prow row" href="#/series/${m.id}"><span class="rank">${i + 1}</span>${coverHtml(m, 'sm')}<div class="prow-title" style="min-width:0;flex:1">${esc(name(m))}</div></a></li>`).join('');
    renderHero(list.find((m) => m.hasVi) || list[0]);
  } catch (e) {
    if (my !== renderId) return;
    $('#popList').innerHTML = `<li>${errHtml(e)}</li>`;
    $('#hero').innerHTML = errHtml(e);
  }
}
function renderHero(m) {
  if (!m) return;
  const desc = stripMd((ui === 'vi' && m.descVi) || m.descEn || m.descVi);
  const isSaved = !!savedMap()[m.id];
  $('#hero').innerHTML = `
    <a href="#/series/${m.id}" class="lift hero-cover" aria-label="${esc(name(m))}">${coverHtml(m, 'shadow', true)}</a>
    <div class="hero-body">
      <div><span class="chip-accent">${t('spotlight')}</span></div>
      <h1>${esc(name(m))}</h1>
      ${desc ? `<p class="desc">${esc(desc)}</p>` : ''}
      <div class="hero-actions">
        <button type="button" class="btn btn-primary" data-read="${m.id}">${ICON.play}${t('start')}</button>
        <button type="button" class="btn btn-ghost" id="heroSave" aria-pressed="${isSaved}" aria-label="${isSaved ? t('saved') : t('save')}">${ICON.mark(isSaved)}${isSaved ? t('saved') : t('save')}</button>
      </div>
    </div>`;
  $('#heroSave').onclick = (e) => {
    const on = toggleSaved(m);
    e.currentTarget.setAttribute('aria-pressed', on);
    e.currentTarget.innerHTML = ICON.mark(on) + (on ? t('saved') : t('save'));
  };
}

/* ---------- browse / search list ---------- */
function initBrowse(my, opts) {
  let cursor = null, seen = new Set(), count = 0, busy = false;
  const grid = $('#grid'), more = $('#more');
  async function load(reset, auto = 0) {
    if (busy) return;
    busy = true;
    if (reset) { cursor = null; seen = new Set(); count = 0; grid.innerHTML = ''; }
    more.innerHTML = `<div class="status">${t('loading')}</div>`;
    let again = false;
    try {
      const data = opts.mode === 'search'
        ? await api('/api/search?q=' + encodeURIComponent(opts.q), 300000)
        : await api(`/api/browse?vi=${state.viOnly ? 1 : 0}&genre=${encodeURIComponent(state.genre)}${cursor ? '&cursor=' + encodeURIComponent(cursor) : ''}`, 300000);
      if (my !== renderId) return;
      let list = data.items.filter((m) => !seen.has(m.id));
      if (opts.mode === 'search' && state.viOnly) list = list.filter((m) => m.hasVi);
      list.forEach((m) => seen.add(m.id));
      count += list.length;
      grid.insertAdjacentHTML('beforeend', list.map(cardHtml).join(''));
      cursor = data.next;
      if (!count && !cursor) grid.innerHTML = `<div class="status" style="grid-column:1/-1">${t(opts.mode === 'search' ? 'noResults' : 'empty')}</div>`;
      more.innerHTML = cursor ? `<button class="btn btn-ghost" type="button" id="moreBtn">${t('loadMore')}</button>` : '';
      again = !!cursor && count < 12 && auto < 4;
    } catch (e) {
      if (my === renderId) more.innerHTML = errHtml(e);
    }
    busy = false;
    if (again) load(false, auto + 1);
  }
  $('#filterbar').onclick = (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.hasAttribute('data-vi')) {
      state.viOnly = !state.viOnly;
      store.set('viOnly', state.viOnly);
      b.setAttribute('aria-pressed', state.viOnly);
    } else {
      state.genre = b.dataset.genre;
      $$('#filterbar [data-genre]').forEach((x) => x.setAttribute('aria-pressed', x === b));
    }
    busy = false;
    load(true);
  };
  more.onclick = (e) => { if (e.target.closest('#moreBtn')) load(false); };
  load(true);
}
function renderSearch(q) {
  const my = ++renderId;
  $('#q').value = q;
  app.innerHTML = `<main class="wrap"><section>${browseHeader(t('searchT', { q }), false)}<div class="grid" id="grid"></div><div class="more" id="more"></div></section></main>`;
  initBrowse(my, { mode: 'search', q });
}

/* ---------- series ---------- */
async function renderSeries(id) {
  const my = ++renderId;
  app.innerHTML = `<main class="wrap"><div class="status">${t('loading')}</div></main>`;
  let d;
  try { d = await api('/api/manga/' + id, 300000); } catch (e) { if (my === renderId) app.innerHTML = `<main class="wrap">${errHtml(e)}</main>`; return; }
  if (my !== renderId) return;
  const m = d.manga;
  const readSet = new Set(store.get('read', {})[id] || []);
  const h = hist()[id];
  const hasViCh = d.chapters.some((c) => c.lang === 'vi' && !c.external);
  let newestFirst = store.get('newestFirst', true);
  const descVi = stripMd(m.descVi);
  const desc = (ui === 'vi' && descVi) || stripMd(m.descEn) || descVi;
  const readLabel = h ? t('continueCh', { c: h.ch || '—' }) : t('start');
  const isSaved = !!savedMap()[id];

  app.innerHTML = `<main class="wrap" style="gap:0">
  <a class="back" href="#/">${ICON.back}${t('back')}</a>
  <div class="series">
    <aside class="series-aside">
      ${coverHtml(m, 'shadow', true)}
      <button class="btn btn-primary" type="button" data-read="${id}">${ICON.play}${esc(readLabel)}</button>
      <button class="btn btn-ghost" type="button" id="saveBtn" aria-pressed="${isSaved}">${ICON.mark(isSaved)}${isSaved ? t('saved') : t('save')}</button>
      ${m.authors.length ? `<p class="muted" style="margin:0;font-size:13px">${esc(m.authors.join(', '))} · ${esc(t(m.status) || m.status)}</p>` : ''}
    </aside>
    <div class="series-main">
      <div>
        <h1>${esc(name(m))}</h1>
        <div class="tags" style="margin:12px 0 0">${m.tags.slice(0, 3).map((g) => `<span class="tag">${esc(g)}</span>`).join('')}</div>
      </div>
      ${desc ? `<div class="synopsis surface"><p class="clamp">${esc(desc)}</p></div>` : ''}
      <section>
        <div class="sechead">
          <div style="display:flex;align-items:baseline;gap:10px"><h2 class="h2" style="font-size:32px">${t('chaptersT')}</h2><span class="muted" id="chCount" style="font-size:13px"></span></div>
          <button class="btn btn-ghost" style="height:40px" type="button" id="sortBtn"></button>
        </div>
        <div class="surface" id="chList"></div>
      </section>
    </div>
  </div></main>`;

  // One row per chapter; it opens the Vietnamese version when there is one.
  function drawChapters() {
    let list = groupChapters(d.chapters);
    if (newestFirst) list.reverse();
    $('#chList').innerHTML = list.map((g) => {
      const v = preferVersion(g.versions, 'en');
      const title = (g.versions.find((x) => x.lang === 'vi' && x.title) || v).title || '';
      const read = readSet.has(String(g.ch ?? g.versions[0].id));
      const href = v.external ? esc(v.external) : '#/read/' + v.id;
      return `<a class="chline row ${read ? 'read' : ''}" href="${href}"${v.external ? ' target="_blank" rel="noopener"' : ''}><span class="chline-n">${g.ch ? 'Ch. ' + esc(g.ch) : t('oneshot')}</span><span class="chline-t">${esc(title)}</span>${v.lang !== 'vi' ? badge(v.lang) : ''}<span class="chline-a">${v.external ? '↗' : ago(v.at)}</span></a>`;
    }).join('') || `<div class="status">${t('noChapters')}</div>`;
    $('#chCount').textContent = `${list.length} ${t('chapters')}`;
    $('#sortBtn').textContent = newestFirst ? t('newest') : t('oldest');
  }
  drawChapters();
  $('#sortBtn').onclick = () => { newestFirst = !newestFirst; store.set('newestFirst', newestFirst); drawChapters(); };
  $('#saveBtn').onclick = (e) => {
    const on = toggleSaved(m);
    e.currentTarget.setAttribute('aria-pressed', on);
    e.currentTarget.innerHTML = ICON.mark(on) + (on ? t('saved') : t('save'));
  };
}

/* ---------- reader ---------- */
async function renderReader(chId, params) {
  const my = ++renderId;
  document.body.classList.add('reading');
  // Defaults: long strip, fit to screen height.
  const S = Object.assign({ mode: 'strip', fit: 'h', bg: 'ink', bright: 100 }, store.get('reader2', {}));
  app.innerHTML = `<div class="reader r-${S.bg}" id="reader"><div class="r-msg">${t('loading')}</div></div>`;
  const R = $('#reader');
  const fail = (html) => { R.innerHTML = `<div class="r-msg">${html}<a class="btn" href="#/">${ICON.back}${t('back')}</a></div>`; };
  let data, detail;
  try { data = await api('/api/chapter/' + chId, 600000); } catch (e) { if (my === renderId) fail(`<p>${t('error')}: ${esc(e.message)}</p>`); return; }
  if (my !== renderId) return;
  try { detail = await api('/api/manga/' + data.mangaId, 300000); } catch { detail = { manga: { id: data.mangaId, title: '', langs: [], tags: [] }, chapters: [] }; }
  if (my !== renderId) return;
  const m = detail.manga;
  if (data.external) return fail(`<p>${t('externalMsg')}</p><a class="btn btn-primary" href="${esc(data.external)}" target="_blank" rel="noopener">${t('openExternal')}</a>`);
  if (!data.pages.length) return fail(`<p>${t('noChapters')}</p>`);

  const groups = groupChapters(detail.chapters.filter((c) => !c.external));
  let gi = groups.findIndex((g) => g.versions.some((v) => v.id === chId));
  if (gi < 0) { groups.push({ key: data.ch, ch: data.ch, versions: [{ id: chId, ch: data.ch, lang: data.lang, group: '' }] }); gi = groups.length - 1; }
  const pickIn = (g) => (g === groups[gi] ? g.versions.find((v) => v.id === chId) : preferVersion(g.versions, data.lang));
  const prevCh = gi > 0 ? pickIn(groups[gi - 1]) : null;
  const nextCh = gi < groups.length - 1 ? pickIn(groups[gi + 1]) : null;
  const N = data.pages.length;
  let page = Math.min(Math.max(1, parseInt(params.get('p'), 10) || 1), N);
  let mode = S.mode;
  const srcs = () => data.pages;
  const progress = () => {
    const h = hist();
    h[m.id] = { ...mini(m), mangaId: m.id, chapterId: chId, ch: data.ch, lang: data.lang, page, total: N, at: Date.now() };
    store.set('history', h);
    history.replaceState(null, '', `#/read/${chId}?p=${page}`);
  };
  const r = store.get('read', {});
  const key = String(data.ch ?? chId);
  r[m.id] = [...new Set([...(r[m.id] || []), key])];
  store.set('read', r);

  const seg = (k, opts) => `<div class="r-seg" role="group" data-set="${k}">${opts.map(([v, l]) => `<button type="button" data-v="${v}" aria-pressed="${String(S[k]) === String(v)}">${l}</button>`).join('')}</div>`;
  const versions = groups[gi].versions.slice().sort((a, b) => (a.lang === 'vi' ? -1 : b.lang === 'vi' ? 1 : 0));
  R.innerHTML = `
  <div class="stage" id="stage"></div>
  <button class="zone left" id="zl" type="button"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 19l-7-7 7-7" stroke-linecap="round"/></svg></button>
  <button class="zone mid" id="zm" type="button" aria-label="${t('toggleHud')}"></button>
  <button class="zone right" id="zr" type="button"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke-linecap="round"/></svg></button>
  <header class="hud r-top"><div class="r-top-in">
    <a class="r-back" href="#/series/${m.id}" title="${t('backSeries')}">${ICON.back}<span>${esc(name(m))}</span></a>
    <label class="sr" for="chSel">${t('chapter')}</label>
    <select class="r-sel" id="chSel">${groups.map((g, i) => { const v = pickIn(g); return `<option value="${v.id}"${i === gi ? ' selected' : ''}>${g.ch ? 'Ch. ' + esc(g.ch) : t('oneshot')}${v.lang !== 'vi' ? ' · ' + esc(v.lang.toUpperCase()) : ''}</option>`; }).join('')}</select>
    <span class="r-spacer"></span>
    <button class="r-btn" id="setBtn" type="button" aria-expanded="false" aria-controls="settings" aria-label="${t('settings')}" title="${t('settings')}">${ICON.gear}</button>
  </div></header>
  <footer class="hud r-bottom"><div class="r-bottom-in">
    <button class="r-btn" id="lBtn" type="button"></button>
    <label class="sr" for="pgRange">${t('pages')}</label>
    <input type="range" id="pgRange" min="1" max="${N}" value="${page}">
    <span class="r-count" id="count"></span>
    <button class="r-btn" id="rBtn" type="button"></button>
  </div></footer>
  <aside class="r-settings" id="settings" hidden aria-label="${t('settings')}">
    <div style="display:flex;align-items:center;justify-content:space-between"><h2>${t('settings')}</h2><button class="r-btn" id="setClose" type="button" aria-label="${t('close')}">✕</button></div>
    <div><div class="r-group-label">${t('dir')}</div>${seg('mode', [['strip', t('strip')], ['rtl', t('rtl')], ['ltr', t('ltr')]])}</div>
    <div><div class="r-group-label">${t('fit')}</div>${seg('fit', [['h', t('fitH')], ['w', t('fitW')]])}</div>
    <div><div class="r-group-label">${t('bg')}</div>${seg('bg', [['ink', t('dark')], ['cream', t('light')]])}</div>
    <label><span class="r-group-label"><span>${t('brightness')}</span><span id="brightVal">${S.bright}%</span></span><input type="range" id="bright" min="60" max="100" value="${S.bright}"></label>
    ${versions.length > 1 ? `<label><span class="r-group-label">${t('tl')}</span><select class="r-sel" id="tlSel" style="width:100%;max-width:none">${versions.map((v) => `<option value="${v.id}"${v.id === chId ? ' selected' : ''}>${esc(v.lang.toUpperCase())} · ${esc(v.group || langName(v.lang))}</option>`).join('')}</select></label>` : ''}
  </aside>
  <div id="endBox"></div>`;

  const stage = $('#stage'), range = $('#pgRange'), endBox = $('#endBox'), settings = $('#settings');
  let obs = null, hudTimer = null;
  const endHtml = (inline) => `<div class="r-end ${inline ? 'r-end-inline' : ''}"><div class="r-keys">${esc(name(m))}</div><div class="serif">${t('endT', { c: data.ch || '' })}</div>
    ${nextCh ? `<a class="btn btn-primary" href="#/read/${nextCh.id}">${t('nextCh', { c: nextCh.ch || '' })}</a><div class="r-keys" style="margin-top:10px">${badge(nextCh.lang)} ${esc(nextCh.group || '')}</div>` : `<p class="r-keys">${t('noNext')}</p><a class="btn" href="#/series/${m.id}">${t('backSeries')}</a>`}</div>`;

  function applyStyle() {
    R.className = `reader r-${S.bg}`;
    stage.style.filter = S.bright < 100 ? `brightness(${S.bright / 100})` : '';
    const paged = mode !== 'strip';
    ['zl', 'zm', 'zr'].forEach((z) => ($('#' + z).style.display = paged ? '' : 'none'));
    const rtl = mode === 'rtl';
    $('#lBtn').textContent = rtl ? '← ' + t('next') : '← ' + t('prev');
    $('#rBtn').textContent = rtl ? t('prev') + ' →' : t('next') + ' →';
    $('#zl').setAttribute('aria-label', rtl ? t('next') : t('prev'));
    $('#zr').setAttribute('aria-label', rtl ? t('prev') : t('next'));
    range.style.direction = rtl ? 'rtl' : 'ltr';
  }
  function drawStage() {
    if (obs) { obs.disconnect(); obs = null; }
    endBox.innerHTML = '';
    const list = srcs();
    if (mode === 'strip') {
      stage.className = `stage strip fit-${S.fit}`;
      stage.innerHTML = list.map((u, i) => `<img class="pg" data-i="${i + 1}" src="${img(u)}" loading="${i < page + 2 ? 'eager' : 'lazy'}" alt="${t('page')} ${i + 1}">`).join('') + endHtml(true);
      obs = new IntersectionObserver((ents) => {
        ents.forEach((en) => { if (en.isIntersecting) { page = +en.target.dataset.i; sync(); } });
      }, { root: stage, rootMargin: '-50% 0px -50% 0px' });
      $$('.pg', stage).forEach((el) => obs.observe(el));
      if (page > 1) requestAnimationFrame(() => stage.querySelector(`[data-i="${page}"]`)?.scrollIntoView());
    } else {
      stage.className = `stage paged ${S.fit === 'w' ? 'fit-w' : ''}`;
      stage.innerHTML = `<img id="pgImg" alt="">`;
      showPage();
    }
    applyStyle();
    sync();
  }
  function showPage() {
    const list = srcs();
    const el = $('#pgImg');
    el.src = img(list[page - 1]);
    el.alt = `${t('page')} ${page}`;
    stage.scrollTop = 0;
    for (let i = page; i < Math.min(page + 2, N); i++) new Image().src = img(list[i]);
  }
  function sync() {
    $('#count').textContent = `${page} / ${N}`;
    range.value = page;
    progress();
  }
  function go(p) {
    if (p > N) {
      if (mode === 'strip') return;
      if (endBox.innerHTML) { if (nextCh) location.hash = '#/read/' + nextCh.id; return; }
      endBox.innerHTML = endHtml(false);
      return;
    }
    endBox.innerHTML = '';
    if (p < 1) { if (prevCh) location.hash = '#/read/' + prevCh.id; return; }
    page = p;
    if (mode === 'strip') stage.querySelector(`[data-i="${page}"]`)?.scrollIntoView({ behavior: 'smooth' });
    else showPage();
    sync();
  }
  const next = () => go(page + 1);
  const prev = () => go(page - 1);
  const goLeft = () => (mode === 'rtl' ? next() : prev());
  const goRight = () => (mode === 'rtl' ? prev() : next());
  function hud(show) {
    R.classList.toggle('hud-off', !show);
    clearTimeout(hudTimer);
    if (show && settings.hidden) hudTimer = setTimeout(() => R.classList.add('hud-off'), 3000);
  }
  const toggleHud = () => hud(R.classList.contains('hud-off'));
  const toggleFs = () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()).catch(() => {});
  function openSettings(open) {
    settings.hidden = !open;
    $('#setBtn').setAttribute('aria-expanded', open);
    hud(true);
  }

  $('#zl').onclick = goLeft;
  $('#zr').onclick = goRight;
  $('#zm').onclick = toggleHud;
  $('#lBtn').onclick = goLeft;
  $('#rBtn').onclick = goRight;
  stage.addEventListener('click', (e) => { if (mode === 'strip' && !e.target.closest('a')) toggleHud(); });
  range.oninput = () => go(+range.value);
  $('#chSel').onchange = (e) => (location.hash = '#/read/' + e.target.value);
  if ($('#tlSel')) $('#tlSel').onchange = (e) => (location.hash = '#/read/' + e.target.value);
  $('#setBtn').onclick = () => openSettings(settings.hidden);
  $('#setClose').onclick = () => openSettings(false);
  $('#bright').oninput = (e) => { S.bright = +e.target.value; $('#brightVal').textContent = S.bright + '%'; store.set('reader2', S); applyStyle(); };
  settings.addEventListener('click', (e) => {
    const b = e.target.closest('[data-v]');
    if (!b) return;
    const k = b.closest('[data-set]').dataset.set;
    const raw = b.dataset.v;
    S[k] = raw === 'true' ? true : raw === 'false' ? false : raw;
    if (k === 'mode') mode = S.mode;
    $$('button', b.parentElement).forEach((x) => x.setAttribute('aria-pressed', x === b));
    store.set('reader2', S);
    drawStage();
  });
  R.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') hud(true); });
  // Tap zones sit above the page in paged mode; pass the wheel through so tall pages still scroll.
  R.addEventListener('wheel', (e) => { if (mode !== 'strip' && e.target.closest('.zone')) stage.scrollTop += e.deltaY; }, { passive: true });
  const onKey = (e) => {
    if (e.target.closest('input, select, textarea') && e.key !== 'Escape') return;
    switch (e.key) {
      case 'ArrowLeft': goLeft(); break;
      case 'ArrowRight': goRight(); break;
      case ' ': if (mode !== 'strip') { e.preventDefault(); next(); } return;
      case 'f': case 'F': toggleFs(); break;
      case 'h': case 'H': toggleHud(); break;
      case 'Escape': if (!settings.hidden) openSettings(false); break;
      default: return;
    }
  };
  document.addEventListener('keydown', onKey);
  cleanup = () => {
    document.removeEventListener('keydown', onKey);
    if (obs) obs.disconnect();
    clearTimeout(hudTimer);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  };
  drawStage();
  hud(true);
}

/* ---------- library ---------- */
function renderLibrary() {
  ++renderId;
  let tab = store.get('libTab', 'reading');
  function draw() {
    const h = Object.values(hist()).sort((a, b) => b.at - a.at);
    const s = Object.values(savedMap()).sort((a, b) => b.at - a.at);
    const list = tab === 'reading' ? h : s;
    const item = (x) => tab === 'reading'
      ? `<a class="shelf-item surface" href="#/read/${x.chapterId}?p=${x.page || 1}">${coverHtml(x, 'sm')}<div class="shelf-body"><div class="card-title">${esc(name(x))}</div><div class="card-sub">${chLabel(x)} · ${t('page')} ${x.page}/${x.total}</div><div>${badge(x.lang)}</div><div class="bar"><i style="width:${pct(x)}%"></i></div></div></a>`
      : `<a class="shelf-item surface" href="#/series/${x.id}">${coverHtml(x, 'sm')}<div class="shelf-body"><div class="card-title">${esc(name(x))}</div><div class="card-sub">${esc((x.authors || []).join(', '))}</div>${x.hasVi ? `<div>${badge('vi')}</div>` : ''}</div></a>`;
    app.innerHTML = `<main class="wrap" style="gap:24px"><h1 class="h2" style="font-size:44px">${t('library')}</h1>
      <div class="tabs" role="tablist">${[['reading', t('tabReading'), h.length], ['saved', t('tabSaved'), s.length]].map(([k, l, n]) => `<button role="tab" type="button" data-tab="${k}" aria-selected="${tab === k}">${l}<span class="count">${n}</span></button>`).join('')}</div>
      <div class="shelf" role="tabpanel" style="margin-top:0">${list.length ? list.map(item).join('') : `<div class="status" style="grid-column:1/-1">${t('emptyLib')}</div>`}</div></main>`;
    $('.tabs').onclick = (e) => {
      const b = e.target.closest('[data-tab]');
      if (!b) return;
      tab = b.dataset.tab;
      store.set('libTab', tab);
      draw();
    };
  }
  draw();
}
function goContinue() {
  const last = Object.values(hist()).sort((a, b) => b.at - a.at)[0];
  location.replace(last ? `#/read/${last.chapterId}?p=${last.page || 1}` : '#/library');
}

/* ---------- global events ---------- */
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-read]');
  if (!b) return;
  e.preventDefault();
  b.disabled = true;
  startReading(b.dataset.read).catch((err) => alert(t('error') + ': ' + err.message)).finally(() => (b.disabled = false));
});
$('#searchForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const q = $('#q').value.trim();
  if (q) location.hash = '#/search?q=' + encodeURIComponent(q);
});
$('#themeBtn').addEventListener('click', () => { theme = theme === 'dark' ? 'light' : 'dark'; store.set('theme', theme); applyChrome(); });
$('#uiLang').addEventListener('click', (e) => {
  const b = e.target.closest('[data-ui]');
  if (!b || b.dataset.ui === ui) return;
  ui = b.dataset.ui;
  store.set('ui', ui);
  applyChrome();
  route();
});
window.addEventListener('hashchange', route);
applyChrome();
route();
})();
