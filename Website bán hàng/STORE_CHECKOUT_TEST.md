# An Feature Store — luồng thanh toán thử nghiệm

## Hiện trạng

**Mặc định: DEMO.** Trang `/welcome/index.html#feature-store` có 5 bộ caption thử với giá được **kiểm tra lại trên server**: Trend & Meme 19k, Love & Mood 19k, Vietnamese Premium 29k, Gen Z & Slay 19k, Holiday Collection 29k. Đây là **giá thử**, chưa được xác nhận để bán thật.

Luồng: Chọn một hoặc nhiều bộ → Giỏ hàng → POST `/api/store/checkout` → trang `/welcome/checkout.html?order=…` → giả lập hoàn tất hoặc chuyển đến payOS khi bật LIVE → GET trạng thái đơn.

**Không cấp module, không phát hành access code và không sửa tính năng Locket.** Bản Caption Only đang thử nghiệm ở `/experiments/caption-only-trend-meme/` không tự động được giao cho khách. Không bật thanh toán thật trước khi hoàn tất kiểm thử tương thích, quyền phân phối và quy trình giao hàng.

## Vì sao không cài luôn những khóa payOS đã gửi trong chat?

API Key và Checksum Key là thông tin bí mật. Vì đã được chia sẻ, hãy **thu hồi/tạo lại** trên payOS trước khi nhận tiền thật. Không dán chúng vào file HTML/JS, không push GitHub, không gửi lại trong chat. Chỉ cấu hình ở biến môi trường của **Railway** cho dịch vụ Next.js.

`Website bán hàng/.env.example` chứa tên biến, không có giá trị thật.

## 1. Chạy DEMO

1. Deploy nhánh `main` với lệnh khởi động **`npm start`** từ thư mục `Website bán hàng`, vì script start chạy `scripts/init-db.mjs` để tạo bảng `store_orders`. Nếu dùng start command riêng, phải chạy migration trước.
2. Để `STORE_PAYMENTS_MODE=demo` hoặc không khai báo. Không cần bất kỳ khóa payOS nào cho DEMO.
3. Truy cập `/welcome/index.html#feature-store`, chọn 2–3 bộ và bấm tạo đơn.
4. Ở `/welcome/checkout.html`, kiểm tra mã đơn/tổng tiền, bấm **Giả lập thanh toán thành công**.
5. Xác nhận trạng thái `DEMO_COMPLETED` hiện ra. Không chuyển tiền thật, không cấp mã thật.
6. Thử mở `checkout.html` trong trình duyệt khác để kiểm tra phiên khác không xem được đơn; thử sửa giá qua request để xác minh server chỉ chấp nhận ID sản phẩm.

Chế độ demo ghi đơn vào bảng `store_orders`; không ghi trạng thái `PAID` hoặc tạo mã `access_codes`. Các đơn demo có thể tích tụ, cần quản trị dọn riêng về sau.

## 2. LIVE payOS (chưa bật)

Chỉ sau khi đã hoàn thành **giao hàng/quyền truy cập, kiểm thử sản phẩm và chốt giá**, cấu hình trên Railway:
- `STORE_PAYMENTS_MODE=live`
- `STORE_FULFILLMENT_READY=true` — xác nhận bạn thực sự có quy trình giao hàng hợp lệ.
- `STORE_PRICES_APPROVED=true` — xác nhận giá test hiện tại đã được chốt.
- `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY` — **khóa mới được thay**.
- `PAYOS_EXPECTED_ACCOUNT_NUMBER` — đúng tài khoản nhận tiền được đăng ký trên payOS.

Thiếu bất cứ một điều kiện nào, Store sẽ **giữ DEMO** để tránh thu tiền ngoài ý muốn.

Đặt webhook payOS theo domain backend: `https://<DOMAIN>/api/payos/webhook`. API hiện có xử lý V1/V2 cũ và các đơn Feature Store mới, luôn xác minh HMAC và gọi payOS xác nhận lại trước khi cập nhật trạng thái. Không tin `returnUrl` đơn thuần. Link chỉ mở ở nguồn `https://pay.payos.vn`; nguồn nhận tiền phải khớp số tài khoản cấu hình.

Một đơn LIVE được payOS xác nhận có trạng thái `PAID_AWAITING_DELIVERY`, **không tự cấp module**. Cần hệ thống fulfillment, chăm sóc khách và xử lý hoàn tiền trước khi chính thức mở nhận tiền. Không dùng LIVE nếu chưa đáp ứng.

## 3. Bảo toàn sản phẩm cũ

- Giữ nguyên bảng `orders` và luồng V1/V2; bộ 129k đã nghỉ bán mới nhưng đơn cũ vẫn có thể tra cứu/nhận quyền truy cập.
- Feature Store dùng bảng **`store_orders` riêng**, không bao giờ sử dụng mã kích hoạt V1/V2.
- Bảng `store_orders` được tạo tự động trong `scripts/init-db.mjs`.

## 4. Các kiểm thử trước khi mở thật

- [ ] Giá và danh sách ID chỉ do server quyết định; bỏ ID lạ, trùng, giỏ trống, quá 5 bộ.
- [ ] DEMO hoàn thành nhưng không phát hành quyền truy cập.
- [ ] Không thể xem/xác nhận đơn của trình duyệt khác.
- [ ] Webhook giả hoặc sai chữ ký không cập nhật đơn.
- [ ] LIVE chỉ xuất hiện khi tất cả biến môi trường được duyệt.
- [ ] Xác minh kênh payOS nhận tiền chính xác qua chữ ký và accountNumber.
- [ ] Không tin query `result=return` là thành công.
- [ ] Database có ổ lưu bền vững, không mất đơn khi Railway redeploy.
- [ ] Kiểm thử tải và giao sản phẩm, chính sách hỗ trợ/hoàn tiền, quyền phân phối.

## Lưu ý về quyền riêng tư

Trình duyệt chỉ giữ mã phiên ngẫu nhiên `an-store-owner-v1`, không lưu ba khóa payOS. Đừng dùng Apple ID được chia sẻ để bán kèm khi chưa có quyền và điều khoản rõ ràng. Đừng bật kiểm tra giải mã HTTPS của người dùng nếu không cần và chưa hiểu rủi ro.

Nguồn kỹ thuật: https://payos.vn/docs/ và https://payos.vn/docs/tich-hop-webhook/kiem-tra-du-lieu-voi-signature/
