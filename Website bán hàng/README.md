# Website bán hàng — nền tảng chuẩn bị

Sao chép từ website độc lập cũ, chưa deploy. Tắt thanh toán và chế độ tải công khai thử nghiệm. Bộ assets nhúng vẫn là bộ cũ; CHƯA nối v1/v2 ở thư mục gốc. Không công bố bản này để bán trước khi hoàn thành tích hợp và kiểm thử.

Cần làm tiếp: mô hình nhiều sản phẩm; phân quyền tải theo sản phẩm/phiên bản; nối v1/v2; cấu hình kho dữ liệu bền vững và payOS; đăng nhập admin; kiểm thử thanh toán, kích hoạt, cập nhật và thu hồi. Giao diện còn nhãn cũ, chưa thiết kế lại.

Mã hiện tại dùng Next.js và SQLite/libSQL. SQLite dạng file cần hosting có ổ lưu bền vững. Nếu dùng Vercel/Netlify, chuyển sang cơ sở dữ liệu từ xa và kiểm tra phần khởi tạo DB trước khi deploy. Tên miền nối sau khi chọn hosting.

Không có khóa thật trong .env.example. Không dùng lại mật khẩu/khóa đã chia sẻ. Không đưa .env, CA, database hoặc token vào Git.
