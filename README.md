# 💌 Whisper of the Heart — Interactive Confession Web App

Không gian kỹ thuật số lãng mạn, tinh tế được mở ra từ mã QR đính kèm trong hộp quà tặng. Lưu giữ khoảnh khắc tỏ tình thông qua thước phim hoạt hình 2D Chibi kết hợp âm nhạc và thư tay phù hợp với câu trả lời của người nhận.

---

## ✨ Tính năng Nổi bật

1. **Kiến trúc 5 Tầng Giao diện (`Z-Index Layers z-10 -> z-50`):**
   - **Layer 1 (`z-10` - Background Sky):** Bầu trời chuyển sắc mượt mà theo từng giai đoạn (Cam hồng ấm áp $\rightarrow$ Tím chạng vạng đầy sao $\rightarrow$ Cam vàng bình minh rực rỡ / Tím xanh hoàng hôn bình yên).
   - **Layer 2 (`z-20` - Atmosphere & Clouds):** Vầng mặt trời mọc tỏa tia sáng xoay nhẹ và các cụm mây cắt giấy xếp lớp (`Paper-cut UI`) trôi bồng bềnh hai bên sườn màn hình.
   - **Layer 3 (`z-30` - Foreground Stage):** Ngọn đồi cỏ tròn đính hoa anh đào cùng cặp đôi nhân vật Chibi (Nam & Nữ) nét vẽ tròn viền nâu ấm (`#522D24`), thay đổi 6 trạng thái biểu cảm & tư thế theo từng phân cảnh.
   - **Layer 4 (`z-40` - Main Interactive / Story):** Hộp quà mở hé nắp kèm thiệp QR *"Tặng cậu"*, 2 nút lựa chọn (`ĐỒNG Ý` & `TỪ CHỐI`), phong bì thắt nơ đỏ gắn dấu sáp trái tim, máy bay giấy bay qua bầu trời sao và bức thư tay mở ra.
   - **Layer 5 (`z-50` - HUD & Particle Overlay):** Hệ thống hạt rơi 60fps bằng HTML5 Canvas (cánh hoa anh đào, bông hoa 5 cánh, trái tim Chibi, đom đóm, sao lấp lánh), thanh thời gian (Progress Bar), nút `Skip ✉` và phụ đề theo từng mốc giây.
2. **Âm thanh Tích hợp Sẵn & Tự động Preload (`0ms Latency`):**
   - Kèm sẵn 2 bản nhạc đã được biên soạn theo đúng kịch bản (`assets/audio/accept-music.wav` 40 giây & `assets/audio/reject-music.wav` 15 giây).
   - Tự động giảm âm lượng xuống `25%` và lặp lại êm ái khi mở thư ở Giai đoạn 4.
3. **Thông báo Kết quả Thời gian thực (Telegram Bot / Webhook):**
   - Ngay khi người nhận chạm vào nút `ĐỒNG Ý` hoặc `TỪ CHỐI`, hệ thống gửi ngầm bản tin JSON về Webhook hoặc tin nhắn trực tiếp tới Telegram của bạn.

---

## 🚀 Cách Chạy & Trải Nghiệm

Bạn có thể mở trực tiếp hoặc chạy qua một HTTP Server bất kỳ tại thư mục dự án:

```bash
# Cách 1: Dùng Python (có sẵn)
python -m http.server 8080

# Cách 2: Dùng Node.js npx
npx serve -l 8080
```

Sau đó truy cập: `http://localhost:8080` trên trình duyệt (hoặc quét mã QR dẫn tới URL sau khi deploy lên Vercel / Netlify / GitHub Pages).

---

## ⚙️ Tùy Chỉnh Nội Dung & Telegram Bot

Mọi thông số cấu hình đều nằm gọn trong file [`js/config.js`](./js/config.js):

1. **Nhận thông báo qua Telegram Bot:**
   - Mở `js/config.js`, tìm mục `webhook` và điền `telegramBotToken` cùng `telegramChatId` của bạn.
2. **Thay đổi nội dung bức thư tay:**
   - Chỉnh sửa nội dung trong `acceptFlow.fullLetter` và `rejectFlow.fullLetter` tại `js/config.js`.
3. **Thay file nhạc riêng (nếu muốn):**
   - Đặt file nhạc của bạn vào `assets/audio/` và cập nhật đường dẫn trong `APP_CONFIG.audio` tại `js/config.js`.

