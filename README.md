# An Locket — Bộ nguồn cho website

| Thư mục | Bản nguồn |
|---|---|
| v1 | V3 Sites |
| v2 | V15 chính, Full Icon / Semantic Studio, thương hiệu An |

Hai phiên bản có cùng cấu trúc file, dùng DNS uBlock cũ và ảnh popup An. Không trộn tính năng V15 vào V3. Thư mục `Website bán hàng` chứa nền tảng web độc lập đang chuẩn bị; chưa deploy, chưa nối v1/v2. `Ứng dụng kiểm thử` chứa 4 bộ ứng dụng chưa xác nhận hoạt động, chưa mở bán.

## Phân phối qua website

Repo private. Không đưa token GitHub vào module hoặc trình duyệt. Backend kiểm tra quyền rồi trả file, thay `__ASSET_BASE__` bằng đường dẫn tải theo khách và phiên bản. Áp dụng thay thế cả module lẫn JavaScript để ảnh popup tải đúng. Token cập nhật cần dùng lại được; mã kích hoạt chỉ dùng một lần.

Không chứa CA cá nhân, mật khẩu hay khóa payOS. Các script đã tải xuống thiết bị vẫn có thể được sao chép. Hai thư mục là nguồn chuẩn bị cho web, chưa phải link cài trực tiếp.
