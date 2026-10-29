# Website An Store — nguồn triển khai chính

Nguồn giao diện, API, admin và dữ liệu phiên bản nằm **ở thư mục này**, không nằm trong `web-vercel/`.

## Vị trí chính

- `app/`: trang Next.js, API, quyền tải, dashboard và tra cứu đơn.
- `public/welcome/`: trang chủ, mô phỏng iPhone 3D, CSS, caption mẫu V1/V2/V3 và JS giao diện.
- `public/captions/`: Caption Studio gốc, chỉ một bộ tệp `catalog.json`, `studio.js`, `studio-effects.*`.
- `/welcome/captions/index.html`: URL cũ chuyển hướng tới một trang chuẩn `/captions/index.html` để không còn HTML trùng lặp.
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

## Caption Studio 3.0 — bộ xem trước có dữ liệu thật

`/captions/index.html` dùng `public/captions/version-explorer.js` và `/welcome/version-data.js` (sinh từ `lib/version-catalog.json`) để xem V1 **107**, V2 **300**, V3 **705** caption; lọc theo chủ đề, từ khóa không dấu, và xem mẫu V3 khác V2 theo chữ/icon/màu.

Yêu thích của Explorer dùng cùng state/backup localStorage với Studio 2.0 (v2 JSON; nhận backup v1). **Không biến các caption xem trước thành module cài đặt hoặc tự chèn vào script xuất**. `catalog.json` 118 overlay cũ vẫn chỉ phục vụ trình tạo script riêng. Chạy `qa/studio3_smoke.py` để xác nhận UI trên 1440/390/320px, sao lưu/khôi phục và URL cũ.


## Mô phỏng mua và giao sản phẩm — không dùng đơn thật

Luồng demo mới tại `/welcome/index.html#demo-checkout`:

1. Chọn V1/V2/V3 và bấm **Tạo đơn DEMO** → `POST /api/demo/checkout` cấp phiếu chờ, có chữ ký HMAC và thời hạn 15 phút.
2. Bấm **Xác nhận DEMO (không thu tiền)** → `POST /api/demo/complete` kiểm tra phiếu và cấp biên nhận mô phỏng có hạn 60 phút.
3. Tải `sample.json`, `instructions.txt` hoặc `receipt.json` từ `/api/demo/files/[version]/[file]`; mỗi bản nhận **tối đa 12 caption công khai**, không phải gói đầy đủ. Tệp sai phiên bản, token giả, token chưa xác nhận và token hết hạn bị từ chối.
4. `POST /api/demo/restore` mở lại các **tệp mẫu** khi người dùng còn biên nhận hợp lệ.

`STORE_DEMO_SECRET` tối thiểu **32 ký tự ngẫu nhiên** là biến môi trường riêng, cấu hình trên máy chạy và Vercel Production; **không lưu Git** và không sử dụng khóa thanh toán/mã kích hoạt cũ. Thiếu khóa thì các API demo trả 503.

Bản demo **không truy cập SQLite**, không tạo order, không gọi payOS, không cấp licence/mã kích hoạt, không cấp Gold hoặc script trả phí. Biên nhận demo không tương đương chứng từ thanh toán. Không đưa các token demo vào `/api/access`, `/download`, `/api/store/files` hay `/api/payments`. Những API lịch sử không thay đổi.

Kiểm thử: `python3 qa/demo_checkout_smoke.py` khi Next.js đã chạy với `STORE_DEMO_SECRET`. Workflow sử dụng khóa **chỉ dành cho CI**, khác Production. Bản public phải luôn hiển thị rõ trạng thái cửa hàng chưa mở thanh toán thật.

## Phase 3 — tiếp tục đơn DEMO sau reload (29/10/2026)

- Phiếu chờ được giữ trong sessionStorage cùng tab, không tạo đơn DB; khi reload gọi POST /api/demo/inspect để **máy chủ** xác minh HMAC, gói và hạn 15 phút.
- Biên nhận hoàn tất được kiểm tra lại ở POST /api/demo/restore (60 phút). Đồng hồ hạn sử dụng hiển thị trên trang và gỡ link khi hết hạn.
- Phiếu giả, sai giai đoạn, hết hạn hoặc đổi phiên bản đều không thể cấp file trả phí. Storage bị khóa thì demo vẫn chạy trong tab cho tới khi reload.
- Không có dashboard doanh thu V1–V3 ở phase này: DEMO là stateless, không phải giao dịch thật. Muốn mở bán cần database bền vững, quyền phân phối sản phẩm và quy trình giao hàng riêng.

## An Store: trọng tâm bán V1/V2/V3

- Trang `/welcome/index.html` chỉ ưu tiên giới thiệu ba gói, bảng giá, so sánh, mẫu, quy trình mua và hỗ trợ. Luồng giao dịch thật tiếp tục bị khóa cho tới khi hoàn thiện điều kiện kinh doanh.
- DEMO kỹ thuật không còn chen giữa bảng giá và bảng so sánh; nằm trong mục thu gọn gần cuối trang. Khi kiểm thử mở `/welcome/index.html?demo=1` hoặc `#demo-checkout` để hiện công cụ kỹ thuật.
- Bảo toàn API và trạng thái khôi phục DEMO cho QA, giữ những đơn lịch sử; không nhập DEMO vào số liệu bán hàng hoặc bật payOS.

## Quy trình kiểm thử Shadowrocket và cấp quyền trước khi mở bán

- Repository GitHub là **Private**, nhưng đường dẫn Vercel vẫn truy cập được từ internet. Do đó `/api/install-test/[version]/An-Preview.sgmodule` chỉ trả module trơ dùng để thử **nhập** vào Shadowrocket. Mọi file gói đầy đủ qua API xem trước trả **410**.
- Để chủ cửa hàng thử **toàn bộ module V1/V2/V3**, mở `/welcome/index.html?owner_test=1`, chọn gói, nhập mật khẩu `ADMIN_PASSWORD` (tối thiểu 24 ký tự, cấu hình riêng trên server). Máy chủ cấp đường dẫn tải `/api/version-test/files/[version]/[file]?token=...` có chữ ký HMAC, gắn phiên bản và hết hạn 12 giờ. Không có mật khẩu trong HTML, Git, localStorage. Không chia sẻ liên kết thử.
- Bản thử public dùng `shadowrocket://install?module=<URL đã encode>`, **không** dùng `shadowrocket://config/add` cho file `.sgmodule`. Có link HTTPS tải tay.
- Các API đơn cũ và quyền truy cập cũ giữ nguyên. Khi mở bán thực tế phải xác minh đơn hàng V1/V2/V3 theo **mã SKU + trạng thái thanh toán + người sở hữu** trước khi cấp module, không dựa chỉ vào số tiền 129.000đ (trùng giá Plus lịch sử). `paymentStatus` tiếp tục `disabled`; không tự kích hoạt giao dịch thật.
- Mục đích kiểm thử là đo xem Shadowrocket nhập bộ file được không, không xác nhận quyền Gold chính thức hoặc độ tương thích Locket/iOS.

## Kiểm soát quyền V1/V2/V3 (schema sẵn sàng, checkout vẫn đóng)

- Tạo bảng `version_orders` với `version_id` bắt buộc là `v1`, `v2` hoặc `v3`, `owner_hash`, trạng thái `PAID` và thời gian thanh toán. Không chạm vào bảng đơn lịch sử `orders`/`store_orders`.
- `GET /api/version-access/[version]?order=<id>` kiểm tra token owner, mã đơn, SKU, tình trạng đã thanh toán, thời điểm thanh toán và giá trong catalog. Kết quả chỉ là trạng thái quyền, chưa có URL tải trả phí khi `paymentStatus=disabled`.
- Không dùng đơn Plus lịch sử có giá 129.000đ để tạo quyền V3. Muốn mở bán phải tích hợp thanh toán và giao hàng trên ledger mới rồi kiểm thử giao dịch thực trước khi bật.


## Giả lập giao hàng Shadowrocket theo đúng SKU

- Mở /welcome/index.html?demo=1 và chọn V1/V2/V3 -> tạo phiếu -> xác nhận giả lập -> thử nhập An-Preview.sgmodule bằng Shadowrocket hoặc tải .sgmodule qua HTTPS.
- Liên kết nhận sau khi xác nhận dùng receiptToken có chữ ký HMAC, gắn phiên bản, thời hạn 60 phút. Phiếu chưa xác nhận, mã giả hoặc phiên bản khác đều không thể nhận được file.
- Module thử chỉ có quy tắc miền .invalid, không chứa Script/MITM/Gold, không phải bộ cài trả phí. Dùng chung generator với bản import public.
- Thanh toán payOS vẫn tắt. Trạng thái mock là DEMO_FULFILLED, paid:false. Không tạo quyền từ bảng version_orders, không sửa đơn cũ và không cung cấp bộ script thật qua DEMO.
- Để mở bán thật, cần xác minh giao dịch và đối chiếu gói đã mua trên server; tuyệt đối không chấp nhận biên nhận DEMO như chứng từ thanh toán.
