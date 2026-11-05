/**
 * CẤU HÌNH HỆ THỐNG & NỘI DUNG (SYSTEM CONFIGURATION)
 * Dự án: Whisper of the Heart — Interactive Confession Web App
 */

window.APP_CONFIG = {
  // 1. Cấu hình âm thanh (Tự động ưu tiên file .mp3 nếu bạn chép đè vào, mặc định dùng bản nhạc đã tạo sẵn)
  audio: {
    accept: 'assets/audio/accept-music.wav',
    reject: 'assets/audio/reject-music.wav',
    acceptDuration: 20,
    rejectDuration: 15,
    skipShowAfterSec: 2.5,
    endLoopVolume: 0.25
  },

  // 2. Cấu hình Telegram Bot / Webhook thông báo kết quả thời gian thực (Mục 5.3 Tài liệu đặc tả)
  webhook: {
    enabled: true,
    // Nếu bạn có Custom Webhook (VD: Make.com, Pipedream, Discord, Backend riêng), điền vào đây:
    endpointUrl: '',
    // Hoặc điền trực tiếp Telegram Bot Token & Chat ID của bạn để nhận tin nhắn về điện thoại ngay khi người ấy bấm nút:
    telegramBotToken: '', // VD: '7123456789:AAHxyz...'
    telegramChatId: ''    // VD: '123456789'
  },

  // 3. Nội dung المàn hình 1 (Selection Screen)
  selection: {
    questionLines: [
      'Hôm nay tớ đã lấy hết can đảm',
      'để tỏ tình cậu... cậu',
      'đã đồng ý hay từ chối vậy?'
    ],
    qrCardText: 'Tặng\ncậu',
    acceptBtnText: 'ĐỒNG Ý',
    rejectBtnText: 'TỪ CHỐI'
  },

  // 4. Kịch bản Phân cảnh Nhánh "ĐỒNG Ý" (20 Giây — Tươi sáng & Ngọt ngào)
  acceptFlow: {
    totalDuration: 20,
    stages: [
      {
        id: 1,
        name: 'Giai đoạn 1',
        start: 0,
        end: 5,
        skyTheme: 'accept-stage-1',
        pose: 'gaze-stars',
        particlePreset: 'twilight-fireflies',
        ticks: ['00 giây', '02 giây', '04 giây', '05 giây'],
        subtitle: 'Giữa hàng vạn người tình cờ lướt qua nhau...'
      },
      {
        id: 2,
        name: 'Giai đoạn 2',
        start: 5,
        end: 11,
        skyTheme: 'accept-stage-2',
        pose: 'happy-laugh',
        particlePreset: 'sakura-hearts',
        ticks: ['05 giây', '07 giây', '09 giây', '11 giây'],
        subtitle: '...thật may mắn vì tớ đã gặp được cậu,\nvà được nghe câu trả lời hôm nay!'
      },
      {
        id: 3,
        name: 'Giai đoạn 3',
        start: 11,
        end: 15,
        skyTheme: 'accept-stage-3',
        pose: 'happy-laugh',
        particlePreset: 'sakura-magic',
        ticks: ['11 giây', '13 giây', '14 giây', '15 giây'],
        subtitle: 'Tớ có vài lời nhắn nhủ gửi riêng cho cậu...'
      },
      {
        id: 4,
        name: 'Giai đoạn 4',
        start: 15,
        end: 20,
        skyTheme: 'accept-stage-4',
        pose: 'happy-laugh',
        particlePreset: 'sakura-gentle',
        ticks: ['15 giây', '17 giây', '19 giây', '20 giây'],
        subtitle: 'Mình cùng nhau bắt đầu một hành trình\nmới thật vui nhé!'
      }
    ],
    letterPreview: [
      "Gửi cậu - cô gái từ hôm",
      "nay đã có thể gọi là 'người",
      "thương'...",
      "Khoảnh khắc cậu chạm vào",
      "nút 'Đồng ý', có lẽ là một",
      "trong những khoảnh khắc",
      "hạnh phúc nhất của tớ..."
    ],
    fullLetter: {
      salutation: 'Gửi cậu - cô gái từ hôm nay đã có thể gọi là "người thương",',
      paragraphs: [
        'Lúc viết sẵn những dòng này và tạo ra mã QR đặt vào hộp quà, tớ đã hồi hộp không biết liệu bức thư này có cơ hội được mở ra hay không. Khoảnh khắc cậu chạm vào nút "Đồng ý", có lẽ là một trong những khoảnh khắc hạnh phúc nhất của tớ trong năm nay.',
        'Cảm ơn cậu vì đã xuất hiện, vì những buổi trò chuyện vui vẻ và vì đã cho tớ cơ hội được bước vào thế giới của cậu gần hơn một chút. Tớ không dám hứa những điều quá xa xôi hoa mỹ, nhưng tớ hứa sẽ luôn lắng nghe, luôn trân trọng và cùng cậu tạo nên thật nhiều kỷ niệm đẹp trong những ngày sắp tới.',
        'Cảm ơn cậu vì hôm nay đã đi cùng tớ. Mình cùng nhau bắt đầu một hành trình mới thật vui nhé!'
      ],
      signOff: 'Thương cậu thật nhiều ♥'
    }
  },

  // 5. Kịch bản Phân cảnh Nhánh "TỪ CHỐI" (15 Giây — Trân trọng & Bình yên)
  rejectFlow: {
    totalDuration: 15,
    stages: [
      {
        id: 1,
        name: 'Giai đoạn 1',
        start: 0,
        end: 3,
        skyTheme: 'reject-stage-1',
        pose: 'calm-look',
        particlePreset: 'twilight-stars',
        ticks: ['00', '03'],
        subtitle: 'Gửi cậu...'
      },
      {
        id: 2,
        name: 'Giai đoạn 2',
        start: 3,
        end: 8,
        skyTheme: 'reject-stage-2',
        pose: 'calm-look',
        particlePreset: 'paper-plane-stars',
        ticks: ['03', '08'],
        subtitle: 'Cảm ơn cậu vì đã luôn dịu dàng,\nthành thật với cảm xúc...'
      },
      {
        id: 3,
        name: 'Giai đoạn 3',
        start: 8,
        end: 12,
        skyTheme: 'reject-stage-3',
        pose: 'back-sunset',
        particlePreset: 'twilight-stars',
        ticks: ['08', '12'],
        subtitle: 'Tớ vẫn muốn gửi lời cảm ơn\nnày đến cậu...'
      },
      {
        id: 4,
        name: 'Giai đoạn 4',
        start: 12,
        end: 15,
        skyTheme: 'reject-stage-4',
        pose: 'friends-smile',
        particlePreset: 'twilight-gentle',
        ticks: ['12', '15'],
        subtitle: 'Chúc cậu luôn bình yên và hạnh\nphúc trên hành trình của mình!'
      }
    ],
    letterPreview: [
      "Thích cậu là một",
      "cảm xúc rất đẹp của",
      "riêng tớ...",
      "",
      "Cậu đừng cảm thấy",
      "áy náy hay khó xử nhé..."
    ],
    fullLetter: {
      salutation: 'Gửi cậu,',
      paragraphs: [
        'Nếu cậu đang đọc những dòng này, có lẽ hôm nay câu trả lời tớ nhận được chưa phải là điều tớ mong đợi nhất. Thật lòng thì có một chút tiếc nuối, nhưng trên tất cả, tớ hoàn toàn tôn trọng cảm xúc và quyết định của cậu.',
        'Tớ vẫn muốn gửi tới cậu bức thư này để nói lời cảm ơn. Cảm ơn cậu vì hôm nay đã dành thời gian đi chơi cùng tớ, cảm ơn vì sự dịu dàng của cậu trong suốt thời gian qua đã khiến những ngày bình thường của tớ trở nên rực rỡ và nhiều động lực hơn rất nhiều. Thích cậu là một cảm xúc rất đẹp của riêng tớ, nên cậu đừng cảm thấy áy náy hay khó xử nhé.',
        'Mong cậu hãy cứ vui vẻ nhận món quà nhỏ này như một lời chúc tốt đẹp nhất từ tớ. Chúc cậu mỗi ngày đều luôn bình yên, rạng rỡ và hạnh phúc trên hành trình của mình!'
      ],
      signOff: 'Một người bạn luôn trân quý cậu ✦'
    }
  }
};

