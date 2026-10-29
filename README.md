# An Store — Locket Caption Versions

Website chính: **https://an-store-flame.vercel.app/welcome/index.html** · Repo: `ifywnx/locketgold-r` · Nhánh triển khai: `main`.

## Tìm file đúng nơi

| Vị trí | Mục đích | Ghi chú |
|---|---|---|
| `v1/` | Nguồn bộ V1 (107 caption tĩnh) | Giữ URL và tên file cho người dùng cũ |
| `v2/` | Nguồn bộ V2 (300 caption tĩnh) | 21 chủ đề, chọn lọc từ V3 |
| `v3/` | Nguồn bộ V3 (705 caption tĩnh) | Bộ V2 đầy đủ trước đây |
| `Website bán hàng/` | **Mã nguồn chính** Next.js, giao diện, API, admin, kiểm thử | Chỉ sửa nguồn ở đây |
| `web-vercel/` | Bộ khởi động/build Vercel | Tự sao chép nguồn web khi build; **không sửa các thư mục app/lib/public ở đây** |
| `experiments/` | Thử nghiệm tách biệt với phiên bản đã phát hành | Không triển khai lên website |
| `Ứng dụng kiểm thử/` | Nghiên cứu các ứng dụng khác | Không tuyên bố là các gói đang bán |
| `Tài liệu tham khảo/` | Trang/mẫu nghiên cứu trước đây | Không phải nguồn giao diện hiện tại |
| `.github/workflows/` | Build, kiểm thử API và trình duyệt | Không chứa mật khẩu |

**Sơ đồ đường nối:** `v1|v2|v3 → scripts/build-install-assets.mjs → lib/install-test-assets.json (generated) → /api/install-test/[version]/[file]`. Vercel chạy `web-vercel/prepare.mjs` để lấy nguồn từ `Website bán hàng/` trước khi build.

**Không chỉnh tay** `Website bán hàng/lib/install-test-assets.json`: đây là file sinh tự động (không commit), khớp với mã nguồn gốc `v1/v2/v3`.

## Đường dẫn còn hỗ trợ

- `/welcome/index.html` là landing page V1–V3 và lộ trình V4+.
- `/captions/` là Caption Studio chính. `/welcome/captions/` vẫn được hỗ trợ với đường dẫn tài nguyên cũ.
- `/store/checkout.html`, `/welcome/checkout.html` và các API kiểm tra đơn hàng **được giữ** để hỗ trợ đơn lịch sử.
- Cửa hàng caption lẻ đã ngừng nhận **đơn mới**. Bộ cài xem trước không kích hoạt thanh toán.
- `/admin` là dashboard được bảo vệ bằng `ADMIN_PASSWORD`.

## Vận hành an toàn

Không xóa file dữ liệu SQLite, volume, token, mã mua hàng, lịch sử đơn hay `lib/private-assets.ts` (snapshot phục vụ đơn cũ). Không bật payOS thật khi dọn mã. Các cờ cấu hình phía client không thay thế kiểm tra quyền và xác minh thanh toán phía server.

Chạy website bằng `cd "Website bán hàng" && npm ci && npm run build` hoặc `npm run dev`; script build sẽ sinh bộ tài nguyên từ ba thư mục phiên bản. Để kiểm tra Vercel trước khi deploy, xem `docs/REPOSITORY_STRUCTURE.md` và GitHub Actions.

*Bản website là dự án độc lập, không phải dịch vụ chính thức của Locket hoặc Shadowrocket. Các cấu hình bên thứ ba cần được kiểm thử trên thiết bị thật.*
