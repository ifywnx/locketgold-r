# An Store — bản đồ nguồn chuẩn và nguyên tắc chỉnh sửa

## Đường dữ liệu (một nguồn chuẩn)

```text
v1/    107 caption
v2/    300 caption  ───────┐
v3/    705 caption  ───────┤  canonical sources; keep old links
                           ▼
Website bán hàng/scripts/build-install-assets.mjs
                           ▼
Website bán hàng/lib/install-test-assets.json  [GENERATED; .gitignore]
                           ▼
Website bán hàng/app/api/install-test/[version]/[file]/route.ts
                           ▼
/api/install-test/v1|v2|v3/...
```

- `web-vercel/prepare.mjs` sao chép Next.js source sang Vercel build root **và** chạy generator trên mirror; không chép/commit output của `web-vercel/app`, `lib`, `public`.
- `Website bán hàng/package.json` chạy generator trước `dev` và `build`. Để kiểm tra file sinh lại: `node scripts/build-install-assets.mjs --check`.
- `lib/private-assets.ts` khác với file generated: đây là snapshot dùng cho các file/đơn có quyền truy cập cũ, không được xóa khi dọn mã.

## Các bản sao public

| Canonical | Đường dẫn cũ vẫn được hỗ trợ | Cách nối |
|---|---|---|
| `/captions/catalog.json` | `/welcome/captions/catalog.json` | Next rewrite |
| `/captions/studio.js` | `/welcome/captions/studio.js` | Next rewrite |
| `/captions/studio-effects.js` | `/welcome/captions/studio-effects.js` | Next rewrite |
| `/captions/studio-effects.css` | `/welcome/captions/studio-effects.css` | Next rewrite |
| `/welcome/images/locket-welcome-ifywnx-v5.png` | `/images/locket-welcome-ifywnx-v5.png` | Next rewrite |

Hai trang HTML `/captions/index.html` và `/welcome/captions/index.html` được giữ vì có đường dẫn tương đối riêng; chỉ dữ liệu và scripts dùng chung.

## Không được phá vỡ khi refactor

- Các trang và API cũ về đơn hàng, tra cứu, tải có chữ ký.
- Các đường dẫn module/JS trong `v1/`, `v2/`, `v3/`. File DNS/JS trùng giữa các version được giữ để người dùng đã cài theo đường dẫn gốc không bị hỏng.
- Database và các biến bí mật trên Railway/Vercel.
- Trạng thái **không bật thanh toán thật**; giữ bộ preview và hiệu ứng của landing page.
- Ứng dụng khác trong `Ứng dụng kiểm thử/` và các thử nghiệm chưa công bố.

## Test

```sh
cd 'Website bán hàng'
npm ci
npm run build
node scripts/build-install-assets.mjs --check
npm start
python3 qa/repository_routes_smoke.py
```

CI build thêm `web-vercel/` với `prepare.mjs` để chắc chắn các deploy Production tương lai không bị thiếu asset. Test đường dẫn legacy và preview dùng dữ liệu giả lập, không đụng DB production.
