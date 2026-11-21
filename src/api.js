// KOMA API — runs on Cloudflare Workers and on Node (server.mjs).
// handleApi(request) answers /api/* and /img; anything else returns null.

const API = 'https://api.mangadex.org';
const UA = 'koma-reader/1.0';
const RATINGS = ['safe', 'suggestive'];
const ALL_RATINGS = ['safe', 'suggestive', 'erotica', 'pornographic'];
const ALLOWED_IMG_HOSTS = [/\.mangadex\.network$/, /^uploads\.mangadex\.org$/];

/* ---------- rate-limited, cached MangaDex client (API limit ≈ 5 req/s) ---------- */
const queue = [];
let active = 0;
let nextSlot = 0;
function schedule(fn) {
    return new Promise((resolve, reject) => {
        queue.push({ fn, resolve, reject });
        pump();
    });
}
function pump() {
    while (active < 3 && queue.length) {
        const job = queue.shift();
        const now = Date.now();
        const wait = Math.max(0, nextSlot - now);
        nextSlot = Math.max(now, nextSlot) + 220;
        active++;
        setTimeout(() => {
            job.fn()
                .then(job.resolve, job.reject)
                .finally(() => {
                    active--;
                    pump();
                });
        }, wait);
    }
}

const cache = new Map();
function qs(params) {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
        if (v === undefined || v === null || v === '') continue;
        if (Array.isArray(v)) v.forEach((x) => u.append(`${k}[]`, x));
        else if (typeof v === 'object') for (const [k2, v2] of Object.entries(v)) u.append(`${k}[${k2}]`, v2);
        else u.append(k, v);
    }
    return u.toString();
}
async function md(p, params = {}, ttl = 120000) {
    const url = `${API}${p}?${qs(params)}`;
    const hit = cache.get(url);
    if (hit && Date.now() - hit.t < ttl) return hit.v;
    const v = await schedule(async () => {
        for (let attempt = 0; attempt < 3; attempt++) {
            const r = await fetch(url, { headers: { 'User-Agent': UA } });
            if (r.status === 429) {
                const retry = Number(r.headers.get('retry-after')) || 2;
                await new Promise((res) => setTimeout(res, retry * 1000));
                continue;
            }
            if (!r.ok) throw new Error(`MangaDex ${r.status} on ${p}`);
            return r.json();
        }
        throw new Error('MangaDex rate limit');
    });
    cache.set(url, { t: Date.now(), v });
    if (cache.size > 2000) cache.delete(cache.keys().next().value);
    return v;
}

/* ---------- normalisers ---------- */
const pick = (o, langs) => {
    if (!o) return '';
    for (const l of langs) if (o[l]) return o[l];
    return Object.values(o)[0] || '';
};
function mangaCard(m) {
    const a = m.attributes;
    const rel = m.relationships || [];
    const file = rel.find((r) => r.type === 'cover_art')?.attributes?.fileName;
    const people = (type) => [...new Set(rel.filter((r) => r.type === type && r.attributes).map((r) => r.attributes.name))];
    const alt = a.altTitles || [];
    const langs = (a.availableTranslatedLanguages || []).filter(Boolean);
    const tags = (a.tags || []).map((t) => ({ id: t.id, name: t.attributes.name.en, group: t.attributes.group }));
    return {
        id: m.id,
        title: pick(a.title, ['en', 'ja-ro', 'ko-ro', 'zh-ro', 'vi', 'ja']),
        viTitle: alt.map((t) => t.vi).find(Boolean) || (a.title && a.title.vi) || null,
        jp: alt.map((t) => t.ja || t.ko || t.zh).find(Boolean) || '',
        authors: people('author'),
        artists: people('artist'),
        status: a.status,
        year: a.year,
        langs,
        hasVi: langs.includes('vi'),
        cover: file ? `https://uploads.mangadex.org/covers/${m.id}/${file}.256.jpg` : null,
        coverLg: file ? `https://uploads.mangadex.org/covers/${m.id}/${file}.512.jpg` : null,
        tags: tags.filter((t) => t.group === 'genre' || t.group === 'theme').map((t) => t.name),
        longStrip: tags.some((t) => t.name === 'Long Strip'),
        originalLanguage: a.originalLanguage,
        descVi: (a.description && a.description.vi) || '',
        descEn: (a.description && a.description.en) || '',
        contentRating: a.contentRating,
    };
}
function chapterRow(c) {
    const a = c.attributes;
    const rel = c.relationships || [];
    return {
        id: c.id,
        mangaId: rel.find((r) => r.type === 'manga')?.id,
        vol: a.volume,
        ch: a.chapter,
        title: a.title || '',
        lang: a.translatedLanguage,
        group: rel.filter((r) => r.type === 'scanlation_group' && r.attributes).map((r) => r.attributes.name).join(', '),
        pages: a.pages,
        external: a.externalUrl || null,
        at: a.readableAt || a.publishAt,
    };
}

async function mangaBatch(ids) {
    const out = new Map();
    for (let i = 0; i < ids.length; i += 100) {
        const chunk = ids.slice(i, i + 100);
        const r = await md('/manga', { ids: chunk, limit: 100, includes: ['cover_art', 'author'], contentRating: ALL_RATINGS }, 600000);
        r.data.forEach((m) => out.set(m.id, mangaCard(m)));
    }
    return out;
}

/* ---------- tags (genre filter) ---------- */
let tagMap = null;
async function tagId(name) {
    if (!tagMap) {
        const r = await md('/manga/tag', {}, 86400000);
        tagMap = new Map(r.data.map((t) => [t.attributes.name.en.toLowerCase(), t.id]));
    }
    return tagMap.get(String(name).toLowerCase()) || null;
}

// MangaDex's availableTranslatedLanguages also counts removed or external-only
// chapters, so confirm each "vi" series really has a readable Vietnamese chapter.
async function verifyVi(cards) {
    await Promise.all(
        cards
            .filter((m) => m.hasVi)
            .map(async (m) => {
                const c = await md(
                    '/chapter',
                    { manga: m.id, translatedLanguage: ['vi'], order: { readableAt: 'desc' }, limit: 1, contentRating: ALL_RATINGS, includeExternalUrl: 0, includeEmptyPages: 0, includeFutureUpdates: 0 },
                    3600000,
                );
                const top = c.data[0];
                m.hasVi = !!top;
                if (top) Object.assign(m, { viAt: top.attributes.readableAt, viCh: top.attributes.chapter });
            }),
    );
    return cards;
}

/* ---------- endpoints ---------- */

// Whole series list, Vietnamese first: series ordered by their newest Vietnamese
// chapter (scanning the VI chapter feed), then — if VI runs out — other series.
async function browse({ genre, viOnly, cursor }) {
    const want = 24;
    let [phase, off] = String(cursor || 'vi:0').split(':');
    off = Number(off) || 0;
    const gid = genre ? await tagId(genre) : null;
    const order = [];
    const info = {};
    let budget = 6;

    while (order.length < want && budget-- > 0 && phase === 'vi') {
        const r = await md('/chapter', {
            translatedLanguage: ['vi'],
            order: { readableAt: 'desc' },
            limit: 100,
            offset: off,
            includes: ['manga'],
            contentRating: RATINGS,
            includeExternalUrl: 0,
            includeEmptyPages: 0,
            includeFutureUpdates: 0,
        });
        for (const c of r.data) {
            const m = (c.relationships || []).find((x) => x.type === 'manga');
            if (!m || info[m.id]) continue;
            if (gid && !(m.attributes?.tags || []).some((t) => t.id === gid)) continue;
            info[m.id] = { viAt: c.attributes.readableAt, viCh: c.attributes.chapter };
            order.push(m.id);
        }
        off += 100;
        if (r.data.length < 100 || off >= 9900) {
            if (viOnly) return finish(null);
            phase = 'ot';
            off = 0;
        }
    }
    while (order.length < want && budget-- > 0 && phase === 'ot') {
        const r = await md('/manga', {
            order: { latestUploadedChapter: 'desc' },
            limit: 48,
            offset: off,
            includedTags: gid ? [gid] : undefined,
            contentRating: RATINGS,
            hasAvailableChapters: 'true',
        });
        for (const m of r.data) {
            if ((m.attributes.availableTranslatedLanguages || []).includes('vi') || info[m.id]) continue;
            info[m.id] = {};
            order.push(m.id);
        }
        off += 48;
        if (r.data.length < 48 || off >= 9900) return finish(null);
    }
    return finish(`${phase}:${off}`);

    async function finish(next) {
        const cards = await mangaBatch(order);
        return { items: order.map((id) => cards.get(id) && { ...cards.get(id), ...info[id] }).filter(Boolean), next };
    }
}

// Title search, then the same rule: VI series first, newest VI chapter first.
async function search(q) {
    const r = await md('/manga', { title: q, limit: 32, includes: ['cover_art', 'author'], contentRating: RATINGS, order: { relevance: 'desc' } });
    const cards = await verifyVi(r.data.map(mangaCard));
    const vi = cards.filter((m) => m.hasVi);
    vi.sort((a, b) => String(b.viAt || '').localeCompare(String(a.viAt || '')));
    return { items: [...vi, ...cards.filter((m) => !m.hasVi)], next: null };
}

async function latest(lang) {
    const r = await md('/chapter', {
        translatedLanguage: lang === 'all' ? undefined : [lang],
        order: { readableAt: 'desc' },
        limit: 60,
        includes: ['manga', 'scanlation_group'],
        contentRating: RATINGS,
        includeExternalUrl: 0,
        includeEmptyPages: 0,
        includeFutureUpdates: 0,
    });
    const seen = new Set();
    const rows = [];
    for (const c of r.data) {
        const row = chapterRow(c);
        const key = row.mangaId + row.lang;
        if (seen.has(key)) continue;
        seen.add(key);
        rows.push(row);
        if (rows.length >= 10) break;
    }
    const cards = await mangaBatch([...new Set(rows.map((x) => x.mangaId))]);
    return rows.map((x) => ({ ...x, manga: cards.get(x.mangaId) || null }));
}

async function popular() {
    const r = await md(
        '/manga',
        { order: { followedCount: 'desc' }, limit: 24, hasAvailableChapters: 'true', includes: ['cover_art', 'author'], contentRating: RATINGS },
        600000,
    );
    const cards = await verifyVi(r.data.map(mangaCard));
    return [...cards.filter((m) => m.hasVi), ...cards.filter((m) => !m.hasVi)];
}

async function mangaDetail(id) {
    const r = await md(`/manga/${id}`, { includes: ['cover_art', 'author', 'artist'] }, 600000);
    const manga = mangaCard(r.data);
    let langs = ['vi', 'en'].filter((l) => manga.langs.includes(l));
    if (!langs.length) langs = manga.langs.slice(0, 3);
    const chapters = [];
    for (let off = 0; off < 3000; off += 500) {
        const f = await md(`/manga/${id}/feed`, {
            translatedLanguage: langs.length ? langs : undefined,
            order: { volume: 'asc', chapter: 'asc' },
            limit: 500,
            offset: off,
            includes: ['scanlation_group'],
            contentRating: ALL_RATINGS,
            includeFutureUpdates: 0,
        });
        f.data.forEach((c) => chapters.push(chapterRow(c)));
        if (f.data.length < 500) break;
    }
    manga.hasVi = chapters.some((c) => c.lang === 'vi' && !c.external);
    return { manga, chapters };
}

// Page image URLs come from the MangaDex@Home network; they expire, so cache briefly.
async function chapterPages(id) {
    const c = await md(`/chapter/${id}`, {}, 600000);
    const row = chapterRow(c.data);
    if (row.external) return { id, mangaId: row.mangaId, external: row.external, pages: [] };
    const h = await md(`/at-home/server/${id}`, {}, 300000);
    const pages = h.chapter.data.map((f) => `${h.baseUrl}/data/${h.chapter.hash}/${f}`);
    return { id, mangaId: row.mangaId, ch: row.ch, vol: row.vol, title: row.title, lang: row.lang, pages };
}

/* ---------- request handling ---------- */
const json = (status, data) =>
    new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

async function proxyImage(target) {
    let u;
    try {
        u = new URL(target);
    } catch {
        return json(400, { error: 'bad url' });
    }
    if (u.protocol !== 'https:' || !ALLOWED_IMG_HOSTS.some((r) => r.test(u.hostname))) return json(403, { error: 'host not allowed' });
    const r = await fetch(u, { headers: { 'User-Agent': UA }, cf: { cacheTtl: 86400, cacheEverything: true } });
    return new Response(r.body, {
        status: r.status,
        headers: { 'Content-Type': r.headers.get('content-type') || 'image/jpeg', 'Cache-Control': 'public, max-age=86400' },
    });
}

const UUID = '([0-9a-f-]{36})';
export async function handleApi(request) {
    const url = new URL(request.url);
    const p = url.pathname;
    const q = url.searchParams;
    if (p !== '/img' && !p.startsWith('/api/')) return null;
    try {
        let m;
        if (p === '/img') return await proxyImage(q.get('u') || '');
        if (p === '/api/browse') return json(200, await browse({ genre: q.get('genre'), viOnly: q.get('vi') === '1', cursor: q.get('cursor') }));
        if (p === '/api/search') return json(200, await search(q.get('q') || ''));
        if (p === '/api/latest') return json(200, await latest(['vi', 'en', 'all'].includes(q.get('lang')) ? q.get('lang') : 'vi'));
        if (p === '/api/popular') return json(200, await popular());
        if ((m = p.match(new RegExp(`^/api/manga/${UUID}$`)))) return json(200, await mangaDetail(m[1]));
        if ((m = p.match(new RegExp(`^/api/chapter/${UUID}$`)))) return json(200, await chapterPages(m[1]));
        return json(404, { error: 'not found' });
    } catch (e) {
        console.error(p, e.message);
        return json(502, { error: e.message });
    }
}
