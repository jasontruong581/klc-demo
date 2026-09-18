# Sửa lỗi 17 concept + làm sạch thương hiệu

Ngày: 2026-09-18 · Branch: `fix/concept-corrections-and-brand-cleanup` (từ `main` @ 4837156)
Báo cáo đánh giá gốc: [review-260918-0812-danh-gia-17-concept.md](review-260918-0812-danh-gia-17-concept.md)

## 1. Quyết định của khách (đầu vào)

| # | Câu hỏi | Trả lời |
| --- | --- | --- |
| 1 | Catalogue tham chiếu là nguồn hàng? | Không — chỉ là tài liệu tham chiếu quy cách. Bên phát hành là **đối thủ cạnh tranh trực tiếp**; K&C bán sản phẩm tương đương. **Không được nêu tên ở bất kỳ concept nào.** |
| 2 | Đối tác | K&C hợp tác với **Tôn Tân Phước Khanh** (không dấu ở "Khanh") |
| 3 | Ma trận khổ-theo-độ-dày | Đã có xác nhận nhà máy — giữ nguyên |
| 4 | Công bố giá | **Không.** Gọi để lấy giá trực tiếp |
| 5 | ZM | Đã có nguồn đầy đủ — là dòng hàng thật |

## 2. Việc đã làm

### 2.1 Làm sạch thương hiệu (toàn repo)
- Xoá mọi nhắc tên đối thủ khỏi `docs/`, `plans/` và báo cáo. **Các concept vốn đã sạch** — tên đối thủ chỉ nằm trong tài liệu nội bộ.
- `Tân Phước Khánh` → `Tân Phước Khanh`: C13, C14, C15, C16 (HTML) + `concept-15/scene.js`.
- Hotline placeholder `0900 000 000` → `0902 351 396` (C1–C12).
- Email thống nhất `ctykc@gmail.com` (bỏ `sales@kcsteel.vn`, `email@congty.vn`).

### 2.2 Bỏ công bố giá
| Concept | Trước | Sau |
| --- | --- | --- |
| C2, C10 | Topbar: "Giá thép cập nhật ngày 17/07/2026" | "Báo giá theo lô — gọi 0902 351 396 để nhận giá" |
| C13 | HUD "Đơn giá demo" + "Giá trị lô"; dải ticker giá `₫/kg` với % tăng/giảm | HUD "Trạng thái" + "Báo giá: Gọi…"; ticker đổi thành **tình trạng nguồn hàng + thời gian giao**. Giữ nguyên thẩm mỹ sàn giao dịch. |
| `concept-13/scene.js` | export `DEMO_PRICE_VND_PER_KG`, field `priceVnd` | Xoá hẳn |

Toàn site: 0 chỗ còn `₫/kg`.

### 2.3 ZM thành dòng hàng thật
- C17: thêm ma trận quy cách (3 ô), 7 mức độ mạ ZM060–ZM310, tiêu chuẩn JIS G3323 · EN 10346 · ASTM A1046.
- C13/C14/C16: "Cung ứng theo yêu cầu" / "chờ xác nhận nguồn hàng" → "Có nguồn hàng".
- C14 hero: bỏ "và ZM theo yêu cầu" → "và ZM".

### 2.4 Concept 17 — bổ sung chiều sâu catalogue
`concept-17/scene.js`: `PRODUCTS` viết lại, mỗi dòng nay có `finishLabel` + `finishes[]` + `coil` + `extras[]`.

| Nội dung mới | Chi tiết |
| --- | --- |
| Độ mạ GI | Z050, Z080, Z100, Z120, Z180, Z220, Z275, Z350 |
| Độ mạ GL | AZ050 → AZ185 (8 mức) + hợp kim Al 55,0% · Zn 43,4% · Si 1,6% |
| Độ mạ ZM | ZM060 → ZM310 (7 mức) |
| Hệ sơn PPGI | PE, SMP, PVDF, Epoxy + cấu trúc DFT (lót 5–20 µm + phủ 5–20 µm, tổng 20–50 µm) + số lớp + bề mặt + màu |
| Bề mặt CRC | Dull / Bright + non-aging 6 tháng (SPCF, SPCG, DC05, DC06) |
| Xử lý sau mạ | Chromate / chống vân tay / phủ dầu |
| Quy cách cuộn | ID 508/610, OD 1.000–2.100, 3–30 tấn/cuộn (PPGI thành phẩm max 10 tấn) |
| T-bend | 0–3T (GI, GL) |
| Tiêu chuẩn PO | Bổ sung JIS G3131, G3101, SAE J403, EN 10111, ASTM A1011 |

Section mới `#packing` — Đóng gói & bảo quản, 3 thẻ: đóng gói tiêu chuẩn (PE/VCI/ke góc/đai), đóng gói tăng cường (vỏ thép/pallet), lưu kho & nâng hạ (chống ngưng tụ, không kéo lê, FIFO).

Product sheet: `<dl>` cứng → `renderSpecSheet()` dựng từ cùng `PRODUCTS` mà spec desk và scene 3D đọc. Độ mạ hiển thị dạng chip.

### 2.5 Concept 17 — lỗi UI & luồng
| Lỗi | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| CTA nav chữ tối trên nền xanh | `.nav-links a` (specificity 0,1,1) đè `.btn-primary` (0,1,0) | Thêm `.nav-links a.btn-primary{color:#fff}`. Đã verify: `rgb(255,255,255) on rgb(19,125,59)` |
| Không có nguồn hàng có tên | — | Hero proof + signal 01 + block đối tác "Tôn Tân Phước Khanh × K&C Steel" |
| Form rời khỏi spec desk | Summary chỉ lấy `product.short` | Summary nay gồm dòng SP · độ dày · khổ · độ mạ · tấn |
| Thiếu hotline | — | Topbar hotline+Zalo, nút "Gọi" ở nav (desktop), nút "Gọi ngay" ở sticky bar (mobile) |
| Nav vỡ trên điện thoại | Thêm nút Gọi nhưng rule 720px chỉ ẩn `a:not(.btn)` | Ẩn thêm `.nav-links .btn-quiet` |
| Eyebrow "Nền tảng của Concept 14" | Từ ngữ nội bộ lộ ra trang khách | → "Năng lực cung ứng" |

Readout mở rộng: thêm "Ước tính tổng chiều dài" (= tấn × 1000 / kg-mỗi-mét) và "Quy cách cuộn".

### 2.6 Concept 10 — mobile
- Trước: 1 breakpoint 1080px, và `nav ul{display:none}` **ẩn luôn CTA "Nhận báo giá"**.
- Sau: giữ CTA (`li:not(:last-child){display:none}`), thêm breakpoint 640px (pair→1 cột, why-grid/foot→1 cột, padding 16px, stage 1:1) + sticky bar Gọi / Nhận báo giá.

### 2.7 Concept 14 — nhãn tồn kho
"Tồn kho hiện tại · Sẵn giao 24–48h" → **"Tồn kho mô phỏng · Số liệu demo"**; "Tổng khối lượng tồn" → "Tổng khối lượng trên kệ đang vẽ".

## 3. Kiểm chứng

| Kiểm tra | Kết quả |
| --- | --- |
| Console errors, 17 concept + trang picker | **0/18** |
| Tên đối thủ toàn repo | 0 |
| "Phước Khánh" (sai) | 0 |
| Hotline placeholder | 0 |
| `₫/kg` công bố giá | 0 |
| C17 render: 6 tab, 9 dòng spec, 8 chip độ mạ, 3 thẻ đóng gói | Đạt |
| C17 tương phản CTA | `#fff` trên `#137d3b` |
| C17 toán học: GL 0,35 mm × 1.200 mm | 3,3 kg/m (đúng: 0,00035 × 1,2 × 7850 = 3,297); 20 t → ≈6.066 m |
| Tràn ngang ở 390 px (C10, C14, C17) | Không có (`scrollWidth == innerWidth == 390`) |

## 4. Giả định cần khách xác nhận

1. **Ma trận quy cách ZM** đang dùng chung dải với GI (0,16–3,00 mm × 850–1.550 mm, chia 3 ô). Suy ra vì ZM chạy trên cùng dây chuyền mạ kẽm. **Cần số thật từ nhà máy.**
2. **Độ mạ ZM** dùng ký hiệu chuẩn EN 10346 / JIS G3323 (ZM060–ZM310). Cần xác nhận dải K&C thật sự cung ứng.
3. **Tiêu chuẩn ZM**: JIS G3323 · EN 10346 · ASTM A1046 — tiêu chuẩn ngành cho Zn-Al-Mg, cần xác nhận khớp CO/CQ của nguồn hàng.

## 5. Chưa làm (ngoài phạm vi lỗi đã nêu)

- Bảng màu PPGI (16 màu tham chiếu) — cần ảnh/mã màu thật của K&C, không lấy của đối thủ.
- Nối form với backend/CRM — vẫn là demo, trang nói rõ.
- C13/C14/C15/C16 chưa được bổ sung độ mạ ZM chi tiết như C17 (chúng chỉ đổi nhãn trạng thái).
- Nhãn 3D trong C10 bị cắt nhẹ ở khổ điện thoại — lỗi đặt label trong canvas, có từ trước, chỉ ảnh hưởng thẩm mỹ.

## 6. Câu hỏi chưa giải quyết

1. Ma trận quy cách + dải độ mạ thật của ZM là gì?
2. Bảng màu PPGI của K&C — có bộ mã màu riêng chưa, hay dùng RAL?
3. C13–C16 giữ làm thư viện so sánh hay cũng cần nâng lên cùng chuẩn dữ liệu như C17?
4. Có cần trang riêng cho từng dòng sản phẩm (SEO) hay giữ một trang như hiện tại?
5. Email `ctykc@gmail.com` là email chính thức để công bố, hay sẽ đổi sang domain riêng?
