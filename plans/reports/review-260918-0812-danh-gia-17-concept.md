# Đánh giá 17 concept K&C Steel — đối chiếu catalogue & khách mục tiêu

Ngày: 2026-09-18 · Branch: main @ 4837156 (đã pull)
Nguồn đối chiếu: catalogue quy cách tham chiếu do khách hàng cung cấp (29 trang, trích xuất toàn văn)
Khách mục tiêu: B2B Việt Nam, doanh nghiệp tài sản >30 tỷ, người quyết định 35–55, mua thép dẹt theo lô.

## 1. Kết luận ngắn

Concept 17 đúng hướng chiến lược nhưng **chưa xong**: giữ khung của C14 + configurator của C10
nhưng **bỏ mất toàn bộ lớp dữ liệu catalogue** — vốn là thứ thuyết phục nhóm khách này.
Concept 14 hiện là bản **đầy đủ nội dung nhất** nhưng thiếu form báo giá.

Khuyến nghị: giữ khung C17, nhét lại lớp catalogue của C14, lấy cơ chế tính khối lượng thật của C10.

## 2. Xếp hạng theo nhóm khách mục tiêu

| Hạng | Concept | Điểm mạnh quyết định | Điểm chặn |
| ---: | --- | --- | --- |
| 1 | 17 — Steel Supply Desk | Khung đúng: spec desk + trust + form. Responsive tốt nhất (2 breakpoint + reduced-motion) | Rỗng nội dung: 0 bảng, không độ mạ Z/AZ, không hệ sơn, không đóng gói, không nguồn hàng có tên |
| 2 | 14 — Kho hàng thông minh | Nội dung sâu nhất: 11 bảng, Z050–Z350, AZ050–AZ185, PVDF, đóng gói, FIFO, hotline thật | Không có form; "TỒN KHO HIỆN TẠI" là số mô phỏng |
| 3 | 10 — Corporate Light 3D | Configurator mạnh nhất, khối lượng tính từ hình học thật | Chỉ 3 dòng SP cũ; 1 breakpoint 1080px → hỏng mobile; hotline placeholder; công bố "giá cập nhật" |
| 4 | 15 — Chuỗi cung ứng | Kể chuyện nguồn hàng tốt, dễ trình bày trong họp | 5 bảng, nông hơn C14; không form |
| 5 | 2 — Corporate Light | An toàn, quen thuộc, dễ đọc | Catalogue 3 dòng cũ, không tương tác |
| 6 | 16 — Kiến trúc sóng tôn | Đẹp, rất mạnh mảng tôn mái | Hẹp: chỉ phục vụ 1 nhóm ứng dụng |
| 7 | 11 — Blueprint 3D | Chiều sâu kỹ thuật (TCT, AZ class) | Quá chuyên sâu cho người ký duyệt |
| 8 | 6, 13 | 6: sáng, có form mini. 13: nhiều dữ liệu | 13: ngôn ngữ HUD gây phân tâm nhóm 35–55 |
| 9+ | 12, 9, 3, 4, 7, 8, 1, 5 | Giá trị trình diễn / so sánh | Thiếu lớp thương mại B2B |

## 3. Sai lệch so với catalogue (phát hiện mới)

### 3.1 Catalogue chỉ có 5 dòng — không có ZM

Mục lục trang 2: PO (13), CRC (21), GI (27), GL (35), PPGI/PPGL (43). ZM chỉ xuất hiện 2 lần dạng
nhắc thoáng — đoạn giới thiệu nhà máy và tên dây chuyền "Zinc / Zinc-Magnesium Coated Steel Line (GI)".
**Không có ma trận quy cách, tiêu chuẩn hay coating mass cho ZM.**

→ Headline "Sáu dòng thép dẹt" (C13–C16) là quá mức. Cách C17 xử lý (ZM matrices rỗng, "xác nhận
theo nguồn hàng từng lô") là đúng, nhưng nên sửa cách đếm: **"5 dòng + ZM theo yêu cầu"**.

### 3.2 Ma trận quy cách C17 có số không có trong catalogue

| Dòng | Catalogue | C17 scene.js | Đánh giá |
| --- | --- | --- | --- |
| PO | 1,40–4,50 mm × 850–1.550 | 1,40–4,50 × 850–1.550 | khớp |
| CRC | 0,18–2,50 mm × 850–1.550 (một dải) | chẻ 0,18–0,30 @850–1.250 / 0,30–2,50 @850–1.550 | **số tự suy** |
| GI | 0,16–3,00 mm × 850–1.550 (một dải) | chẻ 3 ô, thu hẹp khổ ở hai đầu | **số tự suy** |
| GL | 0,16–2,00 mm × 850–1.550 (một dải) | chẻ 2 ô | **số tự suy** |
| PPGI | 0,16–1,00 mm BMT × 850–1.300 | 0,16–1,00 × 850–1.300 | khớp |

Ý tưởng ma trận là đúng (thực tế khổ rộng có phụ thuộc độ dày), nhưng con số phải lấy từ nhà máy.
Rủi ro thực: website tự từ chối cấu hình mà nhà máy làm được → mất đơn.

### 3.3 Tiêu chuẩn PO thiếu

C17 ghi "JIS G3113 / G3132 / G3134 · EN 10025-2".
Catalogue có thêm: **JIS G3131, JIS G3101, SAE J403, EN 10111, ASTM A1011**.

### 3.4 Thông số thương mại quan trọng bị bỏ ở C17 (C13–C16 có)

| Thông số | C13 | C14 | C15 | C16 | C17 |
| --- | :-: | :-: | :-: | :-: | :-: |
| Độ mạ GI Z050–Z350 | có | có | có | có | **không** |
| Độ mạ GL AZ050–AZ185 | có | có | có | có | **không** |
| Hệ sơn PVDF/PE/SMP/Epoxy | có | có | có | có | **không** |
| Xử lý bề mặt chromate/anti-finger | có | có | có | có | **không** |
| Bề mặt CRC Dull/Bright | có | có | không | không | **không** |
| Đóng gói & bảo quản / FIFO | có | có | có | có | **không** |
| Số bảng dữ liệu | 11 | 11 | 5 | 7 | **0** |

Với khách mua theo lô, **độ mạ và hệ sơn là biến quyết định giá**. Thiếu = không báo giá được.

### 3.5 Thiếu trên mọi concept

- Khối lượng cuộn 3–30 tấn (GI/GL); PPGI cuộn thành phẩm max 10 tấn
- T-bend 0–3T
- Hai mức đóng gói: Standard Protective vs Reinforced Protective (13 chi tiết cấu trúc)
- Bảng màu PPGI (16 màu tham chiếu + đặt màu riêng)
- Cấu trúc DFT: primer 5–20 µm / finish 5–20 µm / tổng 20–50 µm
- CRC: bảo hành non-aging 6 tháng cho SPCF, SPCG, DC05, DC06

## 4. Lỗi triển khai cần sửa

| # | Concept | Lỗi | Mức |
| --- | --- | --- | --- |
| 1 | 17 | Nút CTA chính "Yêu cầu báo giá" trên nav: chữ tối trên nền xanh đậm, gần như không đọc được | **Cao** — CTA chính, nhóm 35–55 nhạy với tương phản |
| 2 | 17 | Không nhắc tên nguồn hàng nào (Tân Phước Khanh / nguồn tham chiếu). C1–C16 đều có | **Cao** — với nhà thương mại, nguồn hàng có tên là tài sản uy tín lớn nhất |
| 3 | 14 | "TỒN KHO HIỆN TẠI 103,8 tấn" là số mô phỏng nhưng nhãn đọc như dữ liệu thật | **Cao** — khách gọi hỏi lô không có → mất uy tín ngay |
| 4 | 10 | "Giá thép cập nhật ngày 17/07/2026" — ngày cứng + ngụ ý công bố giá | Trung bình |
| 5 | 10 | Hotline placeholder 0900 000 000 (C14 dùng số thật 0902 351 396) | Trung bình |
| 6 | 10 | Chỉ 1 breakpoint (1080px) → hỏng trên điện thoại | Trung bình |
| 7 | 1–12 vs 13–16 | Tên đối tác viết hai kiểu: "Tân Phước **Khanh**" (C1–C12) vs "Tân Phước **Khánh**" (C13–C16) | Thấp nhưng lộ |

## 5. Đề xuất Concept 17 v2

Giữ khung C17 (hero + spec desk + trust + QC + form), bổ sung:

1. Nhét lại **11 bảng catalogue của C14** vào section "Danh mục sản phẩm" (hiện đang rỗng).
2. Thêm selector **độ mạ Z/AZ** và **hệ sơn PPGI** vào spec desk — đây là biến giá.
3. Nối form với spec desk: submit phải kèm dòng SP + độ dày + khổ + độ mạ + tấn dự kiến.
4. Đặt lại số ma trận theo xác nhận nhà máy; trước khi có xác nhận thì dùng nguyên dải catalogue.
5. Nêu tên nguồn hàng (Tân Phước Khanh / nguồn tham chiếu) ở block "Nguồn hàng theo lô".
6. Sửa tương phản nút CTA nav.
7. Thêm hotline + Zalo ở topbar — nhóm 35–55 gọi điện nhiều hơn điền form.
8. Đổi "6 dòng" → "5 dòng + ZM theo yêu cầu".

## 6. Câu hỏi chưa giải quyết

1. Catalogue nguồn tham chiếu là **nguồn hàng của K&C** hay chỉ là tài liệu tham chiếu quy cách? Quyết định việc có được nêu tên nguồn tham chiếu trên website.
2. Quan hệ Tân Phước Khanh ↔ nguồn tham chiếu ↔ K&C? Website nêu Tân Phước Khanh nhưng catalogue là nguồn tham chiếu.
3. Ma trận khổ-theo-độ-dày cho CRC/GI/GL: đã có xác nhận nhà máy chưa, hay giữ nguyên dải catalogue?
4. K&C có muốn công bố giá / ngày cập nhật giá công khai không (C10 đang làm)?
5. Có backend/CRM để nối form không, hay giai đoạn này vẫn là demo?
6. ZM: đã có nguồn thật chưa? Nếu chưa, bỏ hẳn khỏi nav hay giữ dạng "theo yêu cầu"?
