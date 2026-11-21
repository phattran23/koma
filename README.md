# KOMA

KOMA là trang đọc truyện tranh **ưu tiên bản dịch tiếng Việt**.

- Danh sách truyện mặc định xếp các bộ có bản dịch tiếng Việt lên đầu, theo chương tiếng Việt mới cập nhật, sau đó đến các ngôn ngữ khác.
- Bìa truyện có bản dịch tiếng Việt mang badge `VI`. Bộ lọc **Có tiếng Việt** nằm đầu thanh lọc.
- Nút **Đọc** tự mở bản tiếng Việt khi có.
- Trình đọc mặc định ở chế độ cuộn dọc, ảnh vừa khung theo chiều cao màn hình.

## Chạy trên máy

Cần Node.js 20 trở lên. Bản chạy trên máy không cần cài gói nào.

```bash
npm start            # http://localhost:3001
```

## Deploy lên Cloudflare Workers

```bash
npm install
npx wrangler login   # chỉ cần làm một lần
npm run deploy
```

## Cấu trúc

| Đường dẫn | Vai trò |
|---|---|
| `public/` | Giao diện: `index.html`, `styles.css`, `app.js` |
| `src/api.js` | Lấy dữ liệu truyện, sắp xếp ưu tiên tiếng Việt, chuyển tiếp ảnh qua `/img` |
| `src/worker.js` | Điểm vào cho Cloudflare Worker |
| `server.mjs` | Server Node để chạy trên máy |
| `wrangler.jsonc` | Cấu hình Cloudflare |
