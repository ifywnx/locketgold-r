# An Caption Only — Trend & Meme (LAB)

**Trạng thái:** Kiểm thử dữ liệu và mã giả lập, **chưa kiểm thử trên Locket thực tế**. Đây không phải hàng đã sẵn sàng bán hoặc đường dẫn Raw dùng ngay.

## Mục tiêu

Tách một bộ caption hoàn chỉnh khỏi script V2 hiện tại, không liên quan đến phần mở khóa Gold, Receipt/RevenueCat, video, widget, DNS, đăng nhập tài khoản, quảng cáo hoặc các thay đổi ngoài caption.

**Dữ liệu gốc:** `v2/Locket_Unlocked.js` (catalog nằm trong script), giữ nguyên `overlay_id`, chữ, emoji, màu và thứ tự. Bộ Trend & Meme gồm:

| Nhóm | Số caption |
| --- | ---: |
| 🔥 Trend TikTok & Threads | 53 |
| 🤡 Meme & Câu cửa miệng | 65 |
| 🧠 Vô tri & Brainrot | 25 |
| **Tổng** | **143** |

## Cấu trúc

- `catalog.json`: bản sao danh mục 143 overlay với SHA mã nguồn tham chiếu.
- `An-Trend-Meme.lab.js`: script giả lập chỉ sửa `entries.overlay_items` của một đối tượng Remote Config hợp lệ. Không sửa trường quyền sử dụng, Gold, video hay cài đặt khác.
- `An-Trend-Meme.lab.sgmodule`: **template chưa sử dụng được trực tiếp**, còn `__SIGNED_SCRIPT_URL__`. Không chứa script Gold. Giữ riêng và không tích hợp với module V1/V2 hiện có.
- `test.js`: bài kiểm tra mock bằng Node.js, không cần package bên ngoài.

## Kiểm thử ở máy phát triển

```bash
cd experiments/caption-only-trend-meme
node test.js
```

Bộ kiểm tra giả lập xác nhận:
1. Đủ 143 overlay duy nhất; dữ liệu gốc không thay đổi.
2. Giữ lại nhóm caption có sẵn của phản hồi máy chủ và các trường khác.
3. Chạy lại không nhân đôi caption; không ghi đè overlay trùng ID.
4. Không thay đổi dữ liệu nếu URL không khớp hoặc JSON không hợp lệ.
5. Không chứa script cấp quyền trả phí ở template module.

## Những điều **chưa xác minh**

- Phiên bản iOS/Locket/Shadowrocket nào chấp nhận danh mục này.
- Cấu trúc Remote Config thực nhận trên thiết bị còn đúng hay không.
- Caption có xuất hiện trong Locket thường không cần Gold hoặc không cần bật cờ tính năng.
- Module có tương tác với cấu hình Shadowrocket/DNS của người dùng ra sao.
- Tính hợp lệ theo quyền sử dụng, điều khoản và việc phân phối lại với ứng dụng bên thứ ba.

**Không thử bằng cách hứa mở khóa tính năng trả phí hoặc gộp với script Gold hiện có.** Chỉ kiểm thử trên thiết bị, tài khoản và môi trường mà bạn có quyền sử dụng; không cài chứng chỉ giải mã của nguồn không tin cậy. Không tự động xoá/cài lại ứng dụng để thử nếu chưa sao lưu và hiểu rủi ro mất dữ liệu.

## URL Raw & phân phối

Repository `ifywnx/locketgold-r` hiện ở chế độ **private**. Raw GitHub từ repo này không phải một URL công khai cho Shadowrocket tải script. Template sử dụng `__SIGNED_SCRIPT_URL__` để nhắc rằng khi có quyền cung cấp hợp lệ và đã kiểm thử, máy chủ mới có thể cấp một URL HTTPS có kiểm soát. Không đưa đường dẫn private hoặc giá trị thay thế giả cho khách.

Hiện **không có URL .conf độc lập, không có DNS dành riêng cho bộ này và không có cơ chế thanh toán** trong thư mục LAB.

## Điều kiện để chuyển sang bản bán lẻ

Chỉ triển khai khi kiểm tra được rằng caption hoạt động độc lập trong môi trường được phép; không sửa quyền Gold/entitlement; chỉ một rule xử lý một lần tại cùng endpoint (không chạy đồng thời module V2); phân phối đủ minh bạch về khả năng tương thích, thời hạn và quyền sử dụng. Nếu nền tảng không hỗ trợ hợp lệ, phương án thay thế là bán **Caption Studio/dữ liệu gốc và preset** có thể dùng độc lập ngoài Locket.
