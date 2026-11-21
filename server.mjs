// Local server: node server.mjs  ->  http://localhost:3001
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { handleApi } from './src/api.js';

const PORT = process.env.PORT || 3001;
const PUBLIC = path.join(path.dirname(fileURLToPath(import.meta.url)), 'public');
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };

function serveStatic(res, p) {
    const file = path.normalize(path.join(PUBLIC, p === '/' ? 'index.html' : decodeURIComponent(p)));
    if (!file.startsWith(PUBLIC)) {
        res.writeHead(403).end();
        return;
    }
    fs.stat(file, (err, st) => {
        if (err || !st.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
            return;
        }
        res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
        fs.createReadStream(file).pipe(res);
    });
}

http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const out = await handleApi(new Request(url, { method: req.method }));
    if (!out) return serveStatic(res, url.pathname);
    res.writeHead(out.status, Object.fromEntries(out.headers));
    if (out.body) Readable.fromWeb(out.body).pipe(res);
    else res.end();
}).listen(PORT, () => console.log(`KOMA running at http://localhost:${PORT}`));
