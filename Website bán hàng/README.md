# Website An Store — nguồn triển khai chính

Nguồn giao diện, API, admin và dữ liệu phiên bản nằm **ở thư mục này**, không nằm trong `web-vercel/`.

## Vị trí chính

- `app/`: trang Next.js, API, quyền tải, dashboard và tra cứu đơn.
- `public/welcome/`: trang chủ, mô phỏng iPhone 3D, CSS, caption mẫu V1/V2/V3 và JS giao diện.
- `public/captions/`: Caption Studio gốc, chỉ một bộ tệp `catalog.json`, `studio.js`, `studio-effects.*`.
- `public/welcome/captions/index.html`: giữ trang cũ, các tài nguyên được Next.js rewrite sang `/captions/`.
- `lib/`: mã giao dịch, thư viện caption lịch sử, bảo mật và `private-assets.ts` (giữ cho đơn cũ).
- `scripts/build-install-assets.mjs`: tạo lại `lib/install-test-assets.json` từ nguồn chuẩn `../v1`, `../v2`, `../v3`.
- `qa/`: smoke test API và iPhone/desktop.

## Chạy thử

```sh
cd "Website bán hàng"
npm ci
npm run dev
```

`npm run build` tự đồng bộ bộ cài theo phiên bản rồi build Next.js. `npm run start` yêu cầu đã build trước.

Vercel lấy từ project `an-store` ở `web-vercel/`; `prepare.mjs` copy nguồn hiện có và chạy generator. Không cập nhật trực tiếp các tệp mirror.

## Dữ liệu và giao dịch

- V1: 107, V2: 300, V3: 705 caption tĩnh.
- Giá hiển thị: V1 49.000đ; V2 89.000đ; V3 129.000đ. **Không bật thanh toán thật khi dọn code.**
- `/api/install-test/v1|v2|v3/[file]` tạo phản hồi từ gói vừa build.
- Các API đơn cũ và file có chữ ký vẫn tồn tại; không xóa hay thay đổi mã cấp quyền cũ.
- `ADMIN_DASHBOARD.md` mô tả quyền quản trị.

Không commit `.env`, SQLite, khóa payOS, phiên khách hoặc mã kích hoạt.


## Cấu hình phiên bản — sửa ở một nơi

Giá V1 **49.000đ**, V2 **89.000đ**, V3 **129.000đ** và số caption lần lượt **107/300/705** được khai báo trong `lib/version-catalog.json`. Mọi dữ liệu người dùng nhìn thấy trên các thẻ phiên bản, bảng so sánh mới, modal, selector, dữ liệu preview và API `/api/versions` đều sử dụng cùng catalog.

Không sửa file `public/welcome/version-data.js` vì `npm run build` tự tạo lại. Để thay đổi tính năng tương lai, thêm bản phát hành vào manifest và bổ sung dữ liệu thật/kiểm thử trước khi bật trạng thái.

**Chưa bật thanh toán.** Không thay đổi hoặc suy luận quyền đơn cũ từ con số 129k: đơn Plus lịch sử khác V3.
