# An Store — Dashboard quản trị

## Truy cập

- Địa chỉ: /admin trên domain Railway hiện tại
- Username: admin
- Mật khẩu: biến môi trường ADMIN_PASSWORD (tối thiểu 24 ký tự, không commit lên GitHub)
- Không có mật khẩu mặc định. Nếu Railway chưa có biến ADMIN_PASSWORD, bổ sung tại Service → Variables và deploy/restart theo hướng dẫn Railway.
- Chỉ truy cập qua HTTPS; không chia sẻ mật khẩu/URL quản trị với khách.

## Ba tab

1. Tổng quan: số đơn demo/thật, đơn thanh toán đã xác minh, doanh thu hợp lệ, biểu đồ ngày, bộ caption được chọn.
2. Đơn hàng: lọc 7/30/90 ngày, loại đơn, trạng thái, tìm chính xác mã đơn, xem chi tiết, phân trang 20 đơn; xuất CSV **trang đang xem**.
3. Mã kích hoạt: giữ nguyên tính năng tạo và thu hồi mã thủ công.

## Giải thích số liệu

- Demo 0đ không tính vào doanh thu ngay cả khi giao diện hiển thị giá tham khảo.
- Doanh thu chỉ tính đơn ở chế độ live có trạng thái PAID_AWAITING_DELIVERY và có thời điểm thanh toán paid được ghi nhận.
- "Đủ điều kiện lấy file" không có nghĩa khách đã tải hay cài thành công. Chưa có nhật ký lần tải.
- "Lượt chọn" bao gồm đơn demo và đơn live, không phải lượt bán thành công.
- API /api/admin/store là read-only, được bảo vệ bằng Basic Auth, không lưu cache và không lộ phiên khách hàng, liên kết thanh toán hay URL tải có chữ ký.
- CSV chỉ chứa thông tin đã lọc trên trang hiện tại, không gồm dữ liệu nhạy cảm.

## Giữ nguyên dữ liệu và chế độ demo

- Không có migration/schema update, không sửa thuật toán tạo đơn, không chạm database hiện có.
- Không sửa các biến STORE_PAYMENTS_MODE, PAYOS_*, STORE_FULFILLMENT_READY, STORE_PRICES_APPROVED hoặc STORE_FILES_READY.
- Không thay đổi volume an-store-data.
- Nếu muốn chắc chắn không thu tiền, kiểm tra trong Railway rằng STORE_PAYMENTS_MODE=demo trước khi mở web cho khách. Không tự thay cấu hình production khi triển khai dashboard.
- Các kiểm thử chạy với SQLite tạm riêng trên GitHub Actions, tuyệt đối không kết nối dữ liệu production.

## Kiểm thử

Workflow .github/workflows/admin-dashboard-qa.yml chạy khi push nhánh feat/an-store-admin-dashboard-20261023 hoặc kích hoạt thủ công, xác nhận build, kiểm soát truy cập, báo cáo demo/thu thật, lọc đơn và UI desktop/mobile.
