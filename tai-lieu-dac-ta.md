# TÀI LIỆU ĐẶC TẢ HỆ THỐNG (SYSTEM SPECIFICATION DOCUMENT)
**Dự án:** Interactive Confession Web App (Web Tỏ Tình Tương Tác qua QR Code)

---

## 1. Tổng quan Hệ thống (System Overview)

* **Tên dự án:** Interactive Confession Web App (Web Tỏ Tình Tương Tác qua QR Code).
* **Mục đích:** Tạo ra một không gian kỹ thuật số lãng mạn, tinh tế được mở ra từ mã QR đính kèm trong hộp quà tặng. Hệ thống giúp lưu giữ khoảnh khắc tỏ tình thông qua thước phim hoạt hình 2D kết hợp âm nhạc và thư tay phù hợp với câu trả lời của người nhận.
* **Nền tảng mục tiêu:** Mobile Web (Tối ưu hiển thị dọc tỉ lệ `9:16`, khóa cuộn trang `overflow: hidden`, sử dụng đơn vị `100dvh` để tương thích tốt trên Safari iOS và Chrome Android).
* **Phong cách thiết kế (Art Direction):** Hoạt hình 2D Chibi nét vẽ tròn (Thick brown outlines), hiệu ứng cắt giấy xếp lớp (Layered paper-cut UI) có đổ bóng mềm (`drop-shadow`), tông màu Pastel ấm áp và trong trẻo.

---

## 2. Cấu trúc Lớp Giao diện (UI Layer Architecture)

Để tối ưu hiệu năng 60fps trên điện thoại và tái sử dụng các thành phần đồ họa xuyên suốt các màn hình, giao diện được chia thành **5 tầng (Z-Index Layers)** từ dưới lên trên:

| Tầng (Z-Index) | Tên Lớp | Thành phần hiển thị | Hành vi / Chuyển động |
| :--- | :--- | :--- | :--- |
| **Layer 1 (`z-10`)** | `Background Sky` | Nền trời chuyển sắc (CSS Linear/Radial Gradient) + Các ngôi sao nhỏ lấp lánh | Chuyển màu mượt mà theo từng giai đoạn (Tím chạng vạng $\rightarrow$ Cam hồng bình minh $\rightarrow$ Xanh hoàng hôn). |
| **Layer 2 (`z-20`)** | `Atmosphere & Clouds` | Vầng sáng mặt trời ở tâm + Các cụm mây trắng cắt lớp ở hai bên sườn màn hình | Mặt trời nhô lên (`translateY`) và tỏa tia sáng xoay nhẹ; Mây trôi bồng bềnh (`translateX` qua lại). |
| **Layer 3 (`z-30`)** | `Foreground Stage` | Ngọn đồi cỏ tròn ở đáy màn hình + Cặp đôi nhân vật Chibi (Nam & Nữ) | Cặp đôi thay đổi biểu cảm (Bẽn lẽn $\rightarrow$ Rạng rỡ $\rightarrow$ Bình yên) và nhún nhẹ theo nhịp nhạc. |
| **Layer 4 (`z-40`)** | `Main Interactive / Story` | Hộp quà (Màn 1), Phong bì thư / Máy bay giấy (Màn 2), Tờ giấy thư tay (Màn 3) | Xuất hiện ở chính giữa màn hình với hiệu ứng phóng to, xoay nhẹ và mở nắp phong bì 3D. |
| **Layer 5 (`z-50`)** | `HUD & Particle Overlay` | Cánh hoa anh đào rơi, tim bay, Thanh thời gian (Progress Bar), Nút `Skip ✉`, Phụ đề | Hạt bay bằng HTML5 Canvas; Thanh tiến trình chạy theo nhạc; Phụ đề đổi chữ theo mốc giây. |

---

## 3. Luồng Màn hình & Kịch bản Chi tiết (User Flow & Storyboard)

### Màn hình 0: Khởi tạo & Tải ngầm (Preloader)
* **Trạng thái:** Hiển thị ngắn (1–2 giây) khi vừa quét QR với biểu tượng trái tim đập nhẹ: *"Đang mở hộp quà..."*.
* **Xử lý ngầm:** Tải trước (Preload) toàn bộ hình ảnh SVG/PNG của các lớp và nạp sẵn 2 file âm thanh (`accept-music.mp3` - 40s, `reject-music.mp3` - 15s) vào bộ nhớ đệm để đảm bảo khi bấm nút là nhạc phát ngay ở mili-giây thứ 0 mà không bị trễ.

---

### Màn hình 1: Màn hình Bắt đầu / Lựa chọn (Selection Screen)
* **Bối cảnh:** Nền trời hồng cam ấm áp. Dưới ngọn đồi, bạn nam giấu bông hoa sau lưng đầy hồi hộp, bạn nữ hai tay áp má bất ngờ.
* **Trung tâm:** Hộp quà thắt nơ đỏ mở hé nắp, những trái tim nhỏ bay lên kèm tấm thiệp có in mã QR *"Tặng cậu"*. Phía trên là dòng câu hỏi font chữ viết tay:
  > *"Hôm nay tớ đã lấy hết can đảm để tỏ tình cậu... cậu đã đồng ý hay từ chối vậy?"*
* **Tương tác (2 Nút bấm):**
  1. **Nút `ĐỒNG Ý`:** Nền hồng san hô (`#FF8A80`), viền nâu tròn, trang trí hoa anh đào ở góc.
  2. **Nút `TỪ CHỐI`:** Nền xanh pastel dịu mắt (`#B3E5FC`), viền nâu tròn, trang trí chiếc máy bay giấy nhỏ và ngôi sao.
* **Sự kiện (Event):** Khi người dùng chạm vào 1 trong 2 nút:
  * Kích hoạt phát file nhạc tương ứng ngay lập tức (vượt qua chính sách chặn Autoplay của iOS/Android nhờ sự kiện `onClick`).
  * Gửi một bản tin thông báo ngầm (Webhook) về Backend/Telegram Bot để thông báo kết quả theo thời gian thực.
  * Làm mờ (Fade-out) hộp quà và 2 nút bấm, chuyển sang **Màn hình 2**.

---

### Màn hình 2A: Luồng "ĐỒNG Ý" (40 Giây — Tươi sáng & Ngọt ngào)
* **Âm nhạc:** Bản nhạc dài 30–40 giây (Mở đầu Piano nhẹ nhàng $\rightarrow$ Cao trào ở giây 12 $\rightarrow$ Lắng đọng ở giây 32).
* **Kịch bản phân cảnh (Timeline):**

| Giai đoạn | Thời gian | Hình ảnh & Chuyển động (Animation) | Phụ đề (Subtitles) ở đáy màn hình |
| :--- | :--- | :--- | :--- |
| **Giai đoạn 1** | `00s – 12s` | Nền trời chuyển sang tím hồng chạng vạng đầy sao. Hai nhân vật đứng dưới đồi ngước nhìn bầu trời. Đốm sáng bay lên chậm rãi. | *"Giữa hàng vạn người tình cờ lướt qua nhau..."* |
| **Giai đoạn 2** | `12s – 25s` | Vầng mặt trời vàng ấm nhô lên từ sau đồi. Bầu trời bừng sáng sắc cam hồng. Cặp đôi quay sang nhau cười tít mắt, hoa anh đào và tim hồng bay ngập khung hình. | *"...thật may mắn vì tớ đã gặp được cậu, và được nghe câu trả lời hôm nay!"* |
| **Giai đoạn 3** | `25s – 32s` | Chiếc phong bì màu kem thắt nơ đỏ có con dấu sáp trái tim xuất hiện giữa màn hình, xoay nhẹ trong vầng hào quang lấp lánh. | *"Tớ có vài lời nhắn nhủ gửi riêng cho cậu..."* |
| **Giai đoạn 4** | `32s – 40s` | Nơ đỏ mở ra, nắp phong bì lật lên. Tờ giấy thư trượt lên trên, hiển thị bức thư tay ngọt ngào. Nhạc giảm âm lượng xuống 25% và lặp lại êm ái. | *"Mình cùng nhau bắt đầu một hành trình mới thật vui nhé!"* |

---

### Màn hình 2B: Luồng "TỪ CHỐI" (15 Giây — Trân trọng & Bình yên)
* **Âm nhạc:** Giai điệu Acoustic Guitar / Piano độc tấu nhẹ nhàng, sâu lắng (15 giây).
* **Kịch bản phân cảnh (Timeline):**

| Giai đoạn | Thời gian | Hình ảnh & Chuyển động (Animation) | Phụ đề (Subtitles) ở đáy màn hình |
| :--- | :--- | :--- | :--- |
| **Giai đoạn 1** | `00s – 03s` | Bầu trời chuyển sang màu tím xanh hoàng hôn (Twilight) dịu mắt. Hai nhân vật đứng nhìn nhau bình yên dưới ánh chiều tà. | *"Gửi cậu..."* |
| **Giai đoạn 2** | `03s – 08s` | Một chiếc máy bay giấy màu trắng bay lượn qua bầu trời sao, để lại vệt sáng lấp lánh phía sau. | *"Cảm ơn cậu vì đã luôn dịu dàng, thành thật với cảm xúc..."* |
| **Giai đoạn 3** | `08s – 12s` | Hai nhân vật quay lưng ngắm bầu trời hoàng hôn. Chiếc máy bay giấy bay chậm lại ở giữa màn hình rồi dần biến đổi thành trang giấy viết thư. | *"Tớ vẫn muốn gửi lời cảm ơn này đến cậu..."* |
| **Giai đoạn 4** | `12s – 15s` | Bức thư mở ra hoàn chỉnh với lời nhắn văn minh, không gây áp lực. Cặp đôi chibi ở dưới mỉm cười nhẹ nhàng như những người bạn tốt. | *"Chúc cậu luôn bình yên và hạnh phúc trên hành trình của mình!"* |

---

## 4. Nội dung Văn bản (Copywriting & Letter Content)

### 4.1. Bức thư Nhánh "ĐỒNG Ý"
> **Gửi cậu — cô gái từ hôm nay đã có thể gọi là "người thương",**
> 
> Lúc viết sẵn những dòng này và tạo ra mã QR đặt vào hộp quà, tớ đã hồi hộp không biết liệu bức thư này có cơ hội được mở ra hay không. Khoảnh khắc cậu chạm vào nút "Đồng ý", có lẽ là một trong những khoảnh khắc hạnh phúc nhất của tớ trong năm nay.
> 
> Cảm ơn cậu vì đã xuất hiện, vì những buổi trò chuyện vui vẻ và vì đã cho tớ cơ hội được bước vào thế giới của cậu gần hơn một chút. Tớ không dám hứa những điều quá xa xôi hoa mỹ, nhưng tớ hứa sẽ luôn lắng nghe, luôn trân trọng và cùng cậu tạo nên thật nhiều kỷ niệm đẹp trong những ngày sắp tới.
> 
> Cảm ơn cậu vì hôm nay đã đi cùng tớ. Mình cùng nhau bắt đầu một hành trình mới thật vui nhé!

### 4.2. Bức thư Nhánh "TỪ CHỐI"
> **Gửi cậu,**
> 
> Nếu cậu đang đọc những dòng này, có lẽ hôm nay câu trả lời tớ nhận được chưa phải là điều tớ mong đợi nhất. Thật lòng thì có một chút tiếc nuối, nhưng trên tất cả, tớ hoàn toàn tôn trọng cảm xúc và quyết định của cậu.
> 
> Tớ vẫn muốn gửi tới cậu bức thư này để nói lời cảm ơn. Cảm ơn cậu vì hôm nay đã dành thời gian đi chơi cùng tớ, cảm ơn vì sự dịu dàng của cậu trong suốt thời gian qua đã khiến những ngày bình thường của tớ trở nên rực rỡ và nhiều động lực hơn rất nhiều. Thích cậu là một cảm xúc rất đẹp của riêng tớ, nên cậu đừng cảm thấy áy náy hay khó xử nhé.
> 
> Mong cậu hãy cứ vui vẻ nhận món quà nhỏ này như một lời chúc tốt đẹp nhất từ tớ. Chúc cậu mỗi ngày đều luôn bình yên, rạng rỡ và hạnh phúc trên hành trình của mình!

---

## 5. Đặc tả Kỹ thuật & Công nghệ Đề xuất (Technical Stack)

### 5.1. Công nghệ Frontend & Đồ họa
* **Framework:** ReactJS / Next.js hoặc HTML5/CSS3/JS thuần kết hợp **Tailwind CSS** (`max-w-[430px] mx-auto h-[100dvh] overflow-hidden relative`).
* **Animation Engine:** 
  * **GSAP (GreenSock Animation Platform):** Sử dụng `gsap.timeline()` để đồng bộ hóa chính xác hiệu ứng chuyển cảnh với từng mốc thời gian (`currentTime`) của thẻ `<audio>`.
  * Hỗ trợ nút **Skip ✉** (hiển thị sau giây thứ 5 với `opacity: 0.6`), khi bấm sẽ gọi `timeline.progress(1)` để mở ngay bức thư.
  * **HTML5 Canvas (`requestAnimationFrame`):** Vẽ các hạt rơi (cánh hoa anh đào, trái tim nhỏ, đốm sáng đom đóm) nhằm giải phóng tải cho DOM và giữ tốc độ khung hình luôn đạt 60fps.

### 5.2. Typography (Font chữ hỗ trợ Tiếng Việt)
* **Font bức thư tay & Câu hỏi:** *Patrick Hand*, *Dancing Script*, hoặc *Mali* (tích hợp từ Google Fonts).
* **Font UI (Thanh thời gian, Phụ đề, Nút bấm):** *Quicksand* hoặc *Nunito* (độ dày `Bold 700` cho nút bấm và `Medium 500` cho phụ đề).

### 5.3. Cấu trúc Payload Thông báo (Telegram Bot Webhook)
Khi người nhận quét QR hoặc nhấn nút lựa chọn, hệ thống gọi `fetch()` ngầm tới API của Telegram Bot để báo về điện thoại của bạn:

```json
{
  "event": "CONFESSION_RESPONSE",
  "choice": "ACCEPTED | REJECTED",
  "timestamp": "2026-11-05T20:00:00+07:00",
  "device_info": "iPhone / iOS Safari"
}
```