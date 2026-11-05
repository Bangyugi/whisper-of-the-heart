/**
 * MAIN APPLICATION CONTROLLER & GSAP TIMELINE ORCHESTRATOR
 * Đồng bộ hóa 5 tầng giao diện (Layers z-10 -> z-50), GSAP Timeline, Audio & Telegram Webhook
 */

class ConfessionApp {
  constructor() {
    this.config = window.APP_CONFIG;
    this.particles = new window.ParticleEngine('particle-canvas');
    this.audio = new window.AudioEngine(this.config.audio);
    this.timeline = null;
    this.currentMode = null; // 'accept' | 'reject'
    this.currentStageId = 0;

    this.cacheDOM();
    this.bindEvents();
    this.initPreloader();
  }

  cacheDOM() {
    this.dom = {
      preloader: document.getElementById('screen-preloader'),
      preloaderBar: document.getElementById('preloader-bar'),
      selectionScreen: document.getElementById('screen-selection'),

      // Sky layers (Layer 1)
      skySelection: document.getElementById('sky-selection'),
      skyAccept1: document.getElementById('sky-accept-1'),
      skyAcceptDawn: document.getElementById('sky-accept-dawn'),
      skyAccept2: document.getElementById('sky-accept-2'),
      skyReject1: document.getElementById('sky-reject-1'),

      // Atmosphere (Layer 2)
      sunburstRays: document.getElementById('sunburst-rays'),
      sunGlowDome: document.getElementById('sun-glow-dome'),
      risingSunOrb: document.getElementById('rising-sun-orb'),
      horizonCloudsSvg: document.getElementById('horizon-clouds-svg'),
      twilightClouds: document.getElementById('twilight-cloud-bands'),

      // Foreground Stage (Layer 3)
      hillMainFill: document.getElementById('hill-main-fill'),
      hillBottomShade: document.getElementById('hill-bottom-shade'),
      hillFlowersGroup: document.getElementById('hill-flowers-group'),
      chibiRoot: document.getElementById('chibi-couple-root'),

      // Story Props (Layer 4)
      btnAccept: document.getElementById('btn-choose-accept'),
      btnReject: document.getElementById('btn-choose-reject'),

      stageAcceptProps: document.getElementById('stage-accept-props'),
      acceptAuraSvg: document.getElementById('accept-aura-svg'),
      acceptEnvelopeCard: document.getElementById('accept-envelope-card'),
      acceptFlapOpened: document.getElementById('accept-flap-opened'),
      acceptLetterPaper: document.getElementById('accept-letter-paper'),
      acceptClosedSeal: document.getElementById('accept-closed-seal-group'),
      btnOpenFullAccept: document.getElementById('btn-open-full-accept'),

      stageRejectProps: document.getElementById('stage-reject-props'),
      rejectPaperPlane: document.getElementById('reject-paper-plane'),
      rejectUnfoldingSheet: document.getElementById('reject-unfolding-sheet'),
      rejectLetterCard: document.getElementById('reject-letter-card'),
      btnOpenFullReject: document.getElementById('btn-open-full-reject'),

      // HUD & Subtitles (Layer 5)
      timelineHud: document.getElementById('story-timeline-hud'),
      timelineFill: document.getElementById('timeline-bar-fill'),
      timelineKnob: document.getElementById('timeline-bar-knob'),
      timelineTicksRow: document.getElementById('timeline-ticks-row'),

      btnMute: document.getElementById('btn-mute-audio'),
      muteIcon: document.getElementById('mute-icon'),
      btnSkip: document.getElementById('btn-skip-story'),
      btnReplay: document.getElementById('btn-replay-story'),

      subtitleContainer: document.getElementById('subtitle-container'),
      subtitleText: document.getElementById('subtitle-text'),

      // Full Letter Modal
      letterModal: document.getElementById('full-letter-modal'),
      modalBadge: document.getElementById('modal-letter-badge'),
      modalSalutation: document.getElementById('modal-letter-salutation'),
      modalBody: document.getElementById('modal-letter-body'),
      modalSignoff: document.getElementById('modal-letter-signoff'),
      btnCloseModalTop: document.getElementById('btn-close-letter-modal'),
      btnCloseModalBottom: document.getElementById('btn-close-letter-bottom')
    };
  }

  bindEvents() {
    // Sự kiện chạm nút ĐỒNG Ý
    this.dom.btnAccept.addEventListener('click', (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const parentRect = document.getElementById('app-viewport').getBoundingClientRect();
      this.particles.triggerBurst(
        rect.left - parentRect.left + rect.width / 2,
        rect.top - parentRect.top + rect.height / 2,
        'accept'
      );
      this.handleUserChoice('accept');
    });

    // Sự kiện chạm nút TỪ CHỐI
    this.dom.btnReject.addEventListener('click', (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const parentRect = document.getElementById('app-viewport').getBoundingClientRect();
      this.particles.triggerBurst(
        rect.left - parentRect.left + rect.width / 2,
        rect.top - parentRect.top + rect.height / 2,
        'reject'
      );
      this.handleUserChoice('reject');
    });

    // Sự kiện nút Skip ✉ -> Gọi timeline.progress(1) mở ngay bức thư
    this.dom.btnSkip.addEventListener('click', () => {
      if (this.timeline) {
        this.timeline.progress(1);
      }
    });

    // Sự kiện nút Bật/Tắt nhạc
    this.dom.btnMute.addEventListener('click', () => {
      const muted = this.audio.toggleMute();
      this.dom.muteIcon.textContent = muted ? '🔇' : '🔊';
    });

    // Sự kiện nút Xem lại từ đầu (Quay về Màn hình 1)
    this.dom.btnReplay.addEventListener('click', () => {
      this.resetToSelectionScreen();
    });

    // Mở bức thư đầy đủ khi bấm vào tờ thư hoặc nút "Đọc trọn bức thư"
    this.dom.btnOpenFullAccept.addEventListener('click', () => this.openFullLetterModal('accept'));
    this.dom.acceptEnvelopeCard.addEventListener('click', () => {
      if (this.currentMode === 'accept' && this.currentStageId === 4) {
        this.openFullLetterModal('accept');
      }
    });

    this.dom.btnOpenFullReject.addEventListener('click', () => this.openFullLetterModal('reject'));
    this.dom.rejectLetterCard.addEventListener('click', () => {
      if (this.currentMode === 'reject' && this.currentStageId === 4) {
        this.openFullLetterModal('reject');
      }
    });

    // Đóng Modal bức thư
    this.dom.btnCloseModalTop.addEventListener('click', () => this.closeFullLetterModal());
    this.dom.btnCloseModalBottom.addEventListener('click', () => this.closeFullLetterModal());
    this.dom.letterModal.addEventListener('click', (e) => {
      if (e.target === this.dom.letterModal) this.closeFullLetterModal();
    });
  }

  async initPreloader() {
    // Khởi tạo cặp đôi Chibi ở trạng thái Màn hình 1 (Nam giấu hoa, Nữ áp má)
    window.ChibiStage.renderPose('shy-confess');
    this.particles.start();

    const params = new URLSearchParams(window.location.search);
    const jumpMode = params.get('mode');
    const jumpTime = parseFloat(params.get('t') || '0');
    const skipPreload = params.get('fast') === '1' || Boolean(jumpMode);

    if (skipPreload) {
      if (this.dom.preloader) {
        this.dom.preloader.classList.add('hidden');
      }
      if (jumpMode === 'accept' || jumpMode === 'reject') {
        this.handleUserChoice(jumpMode, true);
        if (this.timeline && !isNaN(jumpTime) && jumpTime >= 0) {
          this.timeline.seek(jumpTime, false);
          this.timeline.pause();
          if (params.get('modal') === '1') {
            this.openFullLetterModal(jumpMode, true);
          }
        }
      }
      return;
    }

    // Tải ngầm âm thanh
    await this.audio.preloadAll((pct) => {
      if (this.dom.preloaderBar) {
        this.dom.preloaderBar.style.width = `${Math.max(25, pct)}%`;
      }
    });

    // Hiển thị tối thiểu 900ms để hiệu ứng mở hộp quà mượt mà
    setTimeout(() => {
      if (this.dom.preloader) {
        this.dom.preloader.style.opacity = '0';
        this.dom.preloader.style.pointerEvents = 'none';
        setTimeout(() => {
          this.dom.preloader.classList.add('hidden');
        }, 700);
      }
    }, 900);
  }

  /**
   * Xử lý khi người dùng chọn ĐỒNG Ý hoặc TỪ CHỐI (Mục 3 - Màn hình 1)
   */
  handleUserChoice(mode, instantHideSelection = false) {
    if (this.currentMode) return;
    this.currentMode = mode;

    // 1. Kích hoạt âm thanh ngay ở mili-giây thứ 0 (vượt qua chặn Autoplay trên iOS/Android)
    this.audio.playButtonChime(mode);
    this.audio.playTrack(mode);

    // 2. Gửi thông báo Webhook / Telegram Bot ngầm theo thời gian thực (Mục 5.3)
    this.sendConfessionWebhook(mode === 'accept' ? 'ACCEPTED' : 'REJECTED');

    // 3. Làm mờ (Fade-out) hộp quà và 2 nút bấm, chuyển sang Màn hình 2
    this.dom.selectionScreen.classList.remove('interactive-active');
    if (instantHideSelection) {
      this.dom.selectionScreen.style.opacity = '0';
      this.dom.selectionScreen.classList.add('hidden');
    } else {
      gsap.to(this.dom.selectionScreen, {
        opacity: 0,
        y: -15,
        scale: 0.96,
        duration: 0.7,
        ease: 'power2.inOut',
        onComplete: () => {
          this.dom.selectionScreen.classList.add('hidden');
        }
      });
    }

    // Hiển thị thanh thời gian và phụ đề
    this.dom.timelineHud.style.opacity = '1';
    this.dom.subtitleContainer.style.opacity = '1';

    // Khởi chạy kịch bản GSAP Timeline tương ứng
    if (mode === 'accept') {
      this.startAcceptTimeline(instantHideSelection);
    } else {
      this.startRejectTimeline();
    }
  }

  /**
   * KỊCH BẢN MÀN HÌNH 2A: LUỒNG "ĐỒNG Ý" (20 GIÂY — MẶT TRỜI MỌC & BẦU TRỜI SÁNG DẦN MƯỢT MÀ LIÊN TỤC)
   */
  startAcceptTimeline(instantEntry = false) {
    const flow = this.config.acceptFlow;
    const total = flow.totalDuration; // 20s

    // Chuẩn bị trạng thái ban đầu của phong bì
    this.dom.stageAcceptProps.style.opacity = '1';
    gsap.set(this.dom.acceptEnvelopeCard, { scale: 0.55, rotation: -12, opacity: 0, y: 16 });
    gsap.set(this.dom.acceptAuraSvg, { scale: 0.65, opacity: 0 });
    gsap.set(this.dom.acceptFlapOpened, { opacity: 0 });
    gsap.set(this.dom.acceptLetterPaper, { y: 75, opacity: 0 });
    gsap.set(this.dom.acceptClosedSeal, { opacity: 1, scale: 1 });
    this.dom.btnOpenFullAccept.classList.add('hidden');

    // Khởi tạo trạng thái nền (không giật cục 1-frame khi bấm nút ĐỒNG Ý)
    const entryDur = instantEntry ? 0.05 : 1.05;
    this.setSkyOpacity(1, instantEntry ? 1 : 0, 0, 0, 0);
    gsap.set(this.dom.risingSunOrb, { xPercent: -50, y: 155, scale: 0.68, opacity: 0 });
    gsap.set(this.dom.sunburstRays, { opacity: 0, scale: 0.72 });

    if (this.timeline) this.timeline.kill();

    this.timeline = gsap.timeline({
      onUpdate: () => {
        const currentSec = this.timeline.time();
        this.updateTimelineBar(currentSec, total, flow.stages, 'accept');
      },
      onComplete: () => {
        this.dom.btnSkip.classList.add('hidden');
      }
    });

    // =========================================================================
    // PHA CHUYỂN TIẾP MƯỢT MÀ (00s -> 1.05s): TỪ HOÀNG HÔN MÀN 1 SANG CHẠNG VẠNG ĐÊM SAO
    // =========================================================================
    this.timeline.to(
      this.dom.skyAccept1,
      {
        opacity: 1,
        duration: entryDur,
        ease: 'sine.inOut'
      },
      0
    );
    this.timeline.fromTo(
      this.dom.sunGlowDome,
      { xPercent: -50, y: 0, scale: 1, opacity: 1 },
      {
        xPercent: -50,
        y: 118,
        scale: 0.74,
        opacity: 0.28,
        duration: entryDur,
        ease: 'sine.inOut',
        immediateRender: false
      },
      0
    );
    this.timeline.fromTo(
      this.dom.hillMainFill,
      { attr: { fill: '#778746' } },
      {
        attr: { fill: '#45412E' },
        duration: entryDur,
        ease: 'sine.inOut',
        immediateRender: false
      },
      0
    );
    this.timeline.fromTo(
      this.dom.hillBottomShade,
      { attr: { fill: '#637238' } },
      {
        attr: { fill: '#333021' },
        duration: entryDur,
        ease: 'sine.inOut',
        immediateRender: false
      },
      0
    );
    this.timeline.fromTo(
      this.dom.hillFlowersGroup,
      { opacity: 1 },
      {
        opacity: 0.16,
        duration: entryDur,
        ease: 'sine.inOut',
        immediateRender: false
      },
      0
    );

    // =========================================================================
    // CHUYỂN ĐỘNG LIÊN TỤC (1.05s -> 11.0s): MẶT TRỜI MỌC DẦN & BẦU TRỜI BỪNG SÁNG
    // =========================================================================
    // 1. Quả cầu mặt trời & Hào quang từ từ nhô cao lên từ sau ngọn đồi (không đổi gia tốc đột ngột ở mốc 5s)
    this.timeline.fromTo(
      this.dom.risingSunOrb,
      { xPercent: -50, y: 155, scale: 0.68, opacity: 0.12 },
      {
        xPercent: -50,
        y: -28,
        scale: 1.08,
        opacity: 1,
        duration: 9.85,
        ease: 'sine.inOut',
        immediateRender: false
      },
      1.05
    );
    this.timeline.to(
      this.dom.sunGlowDome,
      {
        xPercent: -50,
        y: -12,
        scale: 1.15,
        opacity: 1,
        duration: 9.85,
        ease: 'sine.inOut'
      },
      1.05
    );

    // 2. Bầu trời sáng dần theo độ cao của mặt trời (Tím đêm -> Hồng bình minh -> Cam vàng rực rỡ)
    this.timeline.to(
      this.dom.skyAcceptDawn,
      {
        opacity: 1,
        duration: 4.8,
        ease: 'sine.inOut'
      },
      1.25
    );
    this.timeline.to(
      this.dom.skyAccept2,
      {
        opacity: 1,
        duration: 5.8,
        ease: 'sine.inOut'
      },
      4.9
    );

    // 3. Tia nắng xoay nhẹ tỏa rộng dần khi mặt trời nhô qua đỉnh đồi
    this.timeline.to(
      this.dom.sunburstRays,
      {
        opacity: 1,
        scale: 1.05,
        duration: 7.8,
        ease: 'sine.inOut'
      },
      2.8
    );

    // 4. Đồi cỏ & Hoa anh đào sáng dần lên khi ánh bình minh chiếu tới
    this.timeline.to(
      this.dom.hillMainFill,
      {
        attr: { fill: '#758843' },
        duration: 8.6,
        ease: 'sine.inOut'
      },
      1.7
    );
    this.timeline.to(
      this.dom.hillBottomShade,
      {
        attr: { fill: '#5E6E34' },
        duration: 8.6,
        ease: 'sine.inOut'
      },
      1.7
    );
    this.timeline.to(
      this.dom.hillFlowersGroup,
      {
        opacity: 1,
        duration: 5.8,
        ease: 'sine.inOut'
      },
      3.4
    );

    // =========================================================================
    // CÁC MỐC PHÂN CẢNH KỊCH BẢN (20 GIÂY — 4 GIAI ĐOẠN)
    // =========================================================================
    // --- GIAI ĐOẠN 1 (00s – 05s): Bầu trời sao chạng vạng & Bình minh hé rạng ---
    this.timeline.call(
      () => {
        this.applyStageEnvironment('accept', flow.stages[0]);
      },
      null,
      0
    );

    // Hiện nút Skip ✉ ở giây 2.5 (opacity: 0.6)
    this.timeline.call(
      () => {
        this.dom.btnSkip.classList.remove('hidden');
        this.dom.btnSkip.style.opacity = '0.6';
      },
      null,
      2.5
    );

    // --- GIAI ĐOẠN 2 (05s – 11s): Mặt trời nhô lên sau đồi, cặp đôi cười tít mắt, hoa & tim bay ---
    this.timeline.call(
      () => {
        this.applyStageEnvironment('accept', flow.stages[1]);
      },
      null,
      5
    );

    // --- GIAI ĐOẠN 3 (11s – 15s): Phong bì kem thắt nơ đỏ + dấu sáp trái tim xuất hiện mượt mà ---
    this.timeline.call(
      () => {
        this.applyStageEnvironment('accept', flow.stages[2]);
      },
      null,
      11
    );
    this.timeline.to(
      this.dom.acceptAuraSvg,
      {
        opacity: 1,
        scale: 1,
        duration: 1.15,
        ease: 'sine.out'
      },
      11
    );
    this.timeline.to(
      this.dom.acceptEnvelopeCard,
      {
        opacity: 1,
        scale: 1,
        rotation: -6,
        y: 0,
        duration: 1.15,
        ease: 'back.out(1.25)'
      },
      11.05
    );
    // Phong bì bồng bềnh êm ái từ 12.2s -> 15.0s (không chồng lấn tween)
    this.timeline.to(
      this.dom.acceptEnvelopeCard,
      {
        y: -6,
        rotation: -4,
        duration: 1.4,
        ease: 'sine.inOut'
      },
      12.2
    );
    this.timeline.to(
      this.dom.acceptEnvelopeCard,
      {
        y: 0,
        rotation: -2,
        duration: 1.4,
        ease: 'sine.inOut'
      },
      13.6
    );

    // --- GIAI ĐOẠN 4 (15s – 20s): Mở nơ đỏ, lật nắp phong bì, trượt bức thư tay lên & giảm nhạc 25% ---
    this.timeline.call(
      () => {
        this.applyStageEnvironment('accept', flow.stages[3]);
        this.audio.fadeVolumeTo(this.config.audio.endLoopVolume || 0.25, 2.0);
      },
      null,
      15
    );

    // Phong bì cân bằng nhẹ khi mở thư
    this.timeline.to(
      this.dom.acceptEnvelopeCard,
      {
        rotation: 0,
        y: 4,
        duration: 1.2,
        ease: 'sine.inOut'
      },
      15
    );

    // Nơ đỏ & nắp đóng mở ra mượt mà
    this.timeline.to(
      this.dom.acceptClosedSeal,
      {
        opacity: 0,
        scale: 1.06,
        duration: 0.75,
        ease: 'sine.inOut'
      },
      15
    );
    this.timeline.to(
      this.dom.acceptFlapOpened,
      {
        opacity: 1,
        duration: 0.75,
        ease: 'sine.inOut'
      },
      15.25
    );
    // Tờ giấy thư trượt lên trên êm ái
    this.timeline.to(
      this.dom.acceptLetterPaper,
      {
        y: 0,
        opacity: 1,
        duration: 1.45,
        ease: 'power2.out',
        onComplete: () => {
          this.dom.btnOpenFullAccept.classList.remove('hidden');
          this.dom.acceptEnvelopeCard.classList.add('interactive-active', 'cursor-pointer');
        }
      },
      15.55
    );
    this.timeline.to({}, { duration: 3.0 }, 17.0);
  }

  /**
   * KỊCH BẢN MÀN HÌNH 2B: LUỒNG "TỪ CHỐI" (15 GIÂY — 4 GIAI ĐOẠN)
   */
  startRejectTimeline() {
    const flow = this.config.rejectFlow;
    const total = flow.totalDuration; // 15s

    this.dom.stageRejectProps.style.opacity = '1';
    gsap.set(this.dom.rejectPaperPlane, { x: 160, y: 35, scale: 0.65, rotation: 8, opacity: 0 });
    gsap.set(this.dom.rejectUnfoldingSheet, { scale: 0.4, rotation: -12, opacity: 0 });
    gsap.set(this.dom.rejectLetterCard, { scale: 0.75, y: 20, opacity: 0 });
    this.dom.btnOpenFullReject.classList.add('hidden');

    if (this.timeline) this.timeline.kill();

    this.timeline = gsap.timeline({
      onUpdate: () => {
        const currentSec = this.timeline.time();
        this.updateTimelineBar(currentSec, total, flow.stages, 'reject');
      },
      onComplete: () => {
        this.dom.btnSkip.classList.add('hidden');
      }
    });

    // --- GIAI ĐOẠN 1 (00s – 03s): Bầu trời tím xanh hoàng hôn dịu mắt, hai nhân vật nhìn nhau bình yên ---
    this.timeline.call(
      () => {
        this.applyStageEnvironment('reject', flow.stages[0]);
      },
      null,
      0
    );
    this.timeline.to({}, { duration: 3 }, 0);

    // --- GIAI ĐOẠN 2 (03s – 08s): Chiếc máy bay giấy trắng bay lượn qua bầu trời sao kèm vệt sáng ---
    this.timeline.call(
      () => {
        this.applyStageEnvironment('reject', flow.stages[1]);
      },
      null,
      3
    );
    this.timeline.to(
      this.dom.rejectPaperPlane,
      {
        opacity: 1,
        x: 0,
        y: -12,
        scale: 1,
        rotation: -4,
        duration: 2.2,
        ease: 'power2.out'
      },
      3
    );
    // Hiển thị nút Skip ✉ ở giây thứ 5
    this.timeline.call(
      () => {
        this.dom.btnSkip.classList.remove('hidden');
        this.dom.btnSkip.style.opacity = '0.6';
      },
      null,
      5
    );
    this.timeline.to(
      this.dom.rejectPaperPlane,
      {
        x: -32,
        y: -22,
        rotation: -8,
        duration: 2.8,
        ease: 'sine.inOut'
      },
      5.2
    );

    // --- GIAI ĐOẠN 3 (08s – 12s): Hai nhân vật quay lưng ngắm hoàng hôn, máy bay giấy biến đổi thành trang thư ---
    this.timeline.call(
      () => {
        this.applyStageEnvironment('reject', flow.stages[2]);
      },
      null,
      8
    );
    this.timeline.to(
      this.dom.rejectPaperPlane,
      {
        x: -10,
        y: 8,
        scale: 0.9,
        rotation: 4,
        duration: 1.8,
        ease: 'power1.inOut'
      },
      8
    );
    // Máy bay giấy biến đổi thành tờ giấy mở ra (10s -> 12s)
    this.timeline.to(
      this.dom.rejectUnfoldingSheet,
      {
        opacity: 1,
        scale: 1,
        rotation: 0,
        duration: 1.4,
        ease: 'back.out(1.4)'
      },
      9.8
    );
    this.timeline.to(
      this.dom.rejectPaperPlane,
      {
        opacity: 0,
        scale: 0.5,
        duration: 0.9
      },
      10.8
    );
    this.timeline.to(
      this.dom.rejectUnfoldingSheet,
      {
        opacity: 0,
        scale: 1.15,
        duration: 0.6
      },
      11.6
    );

    // --- GIAI ĐOẠN 4 (12s – 15s): Bức thư mở ra hoàn chỉnh, cặp đôi mỉm cười nhẹ nhàng như hai người bạn tốt ---
    this.timeline.call(
      () => {
        this.applyStageEnvironment('reject', flow.stages[3]);
        this.audio.fadeVolumeTo(this.config.audio.endLoopVolume || 0.25, 2.0);
      },
      null,
      12
    );
    this.timeline.to(
      this.dom.rejectLetterCard,
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 1.2,
        ease: 'back.out(1.2)',
        onComplete: () => {
          this.dom.btnOpenFullReject.classList.remove('hidden');
          this.dom.rejectLetterCard.classList.add('interactive-active', 'cursor-pointer');
        }
      },
      12
    );
    this.timeline.to({}, { duration: 1.8 }, 13.2);
  }

  /**
   * Cập nhật Bầu trời (Layer 1), Ánh mặt trời & Mây (Layer 2), Đồi cỏ & Chibi (Layer 3), Hạt bay & Phụ đề (Layer 5)
   */
  applyStageEnvironment(mode, stage) {
    if (!stage || this.currentStageId === stage.id) return;
    this.currentStageId = stage.id;

    // 1. Cập nhật tư thế cặp đôi Chibi
    window.ChibiStage.renderPose(stage.pose);

    // 2. Cập nhật hệ thống hạt Canvas 60fps
    this.particles.setPreset(stage.particlePreset);

    // 3. Cập nhật Phụ đề ở đáy màn hình
    this.dom.subtitleText.textContent = stage.subtitle;
    this.dom.subtitleText.style.opacity = '1';

    // 4. Cập nhật các mốc giây trên Thanh tiến trình đúng theo thiết kế từng giai đoạn
    if (stage.ticks && this.dom.timelineTicksRow) {
      this.dom.timelineTicksRow.innerHTML = stage.ticks
        .map((t) => `<span>${t}</span>`)
        .join('');
    }

    // 5. Chuyển màu Bầu trời, Mặt trời & Đồi cỏ (Nhánh Đồng ý đã được GSAP nội suy mượt mà liên tục theo mặt trời mọc)
    if (mode === 'reject') {
      // Nhánh Từ chối (GĐ 1 - 4): Bầu trời tím xanh hoàng hôn bình yên
      this.setSkyOpacity(0, 0, 0, 1, 0);
      this.dom.twilightClouds.style.opacity = '1';
      this.dom.sunburstRays.style.opacity = '0';
      if (this.dom.risingSunOrb) this.dom.risingSunOrb.style.opacity = '0';
      this.dom.sunGlowDome.style.opacity = '0.45';
      this.dom.sunGlowDome.style.transform = 'translateX(-50%) translateY(45px)';
      this.dom.hillMainFill.setAttribute('fill', '#3D394C');
      this.dom.hillBottomShade.setAttribute('fill', '#2E2B3B');
      this.dom.hillFlowersGroup.style.opacity = '0';
    }
  }

  setSkyOpacity(sel, acc1, acc2, rej1, accDawn = 0) {
    this.dom.skySelection.style.opacity = String(sel);
    this.dom.skyAccept1.style.opacity = String(acc1);
    if (this.dom.skyAcceptDawn) {
      this.dom.skyAcceptDawn.style.opacity = String(accDawn);
    }
    this.dom.skyAccept2.style.opacity = String(acc2);
    this.dom.skyReject1.style.opacity = String(rej1);
  }

  updateTimelineBar(currentSec, totalSec, stages, mode) {
    const pct = Math.max(0, Math.min(100, (currentSec / totalSec) * 100));
    this.dom.timelineFill.style.width = `${pct}%`;
    this.dom.timelineKnob.style.left = `${pct}%`;

    if (stages && mode) {
      let matched = stages[0];
      for (const st of stages) {
        if (currentSec >= st.start) {
          matched = st;
        }
      }
      if (matched && this.currentStageId !== matched.id) {
        this.applyStageEnvironment(mode, matched);
      }
    }
  }

  /**
   * Mở Modal đọc trọn vẹn bức thư tay (Mục 4.1 & 4.2 Tài liệu đặc tả)
   */
  openFullLetterModal(mode, instant = false) {
    const letterData =
      mode === 'accept' ? this.config.acceptFlow.fullLetter : this.config.rejectFlow.fullLetter;

    this.dom.modalBadge.textContent = mode === 'accept' ? '💌' : '✉️';
    this.dom.modalSalutation.textContent = letterData.salutation;
    this.dom.modalBody.innerHTML = letterData.paragraphs
      .map((p) => `<p>${p}</p>`)
      .join('');
    this.dom.modalSignoff.textContent = letterData.signOff || '';

    this.dom.letterModal.classList.remove('hidden');
    this.dom.letterModal.classList.add('flex');
    if (instant) {
      gsap.set(this.dom.letterModal.firstElementChild, { scale: 1, opacity: 1, y: 0 });
    } else {
      gsap.fromTo(
        this.dom.letterModal.firstElementChild,
        { scale: 0.88, opacity: 0, y: 18 },
        { scale: 1, opacity: 1, y: 0, duration: 0.38, ease: 'back.out(1.4)' }
      );
    }
  }

  closeFullLetterModal() {
    this.dom.letterModal.classList.add('hidden');
    this.dom.letterModal.classList.remove('flex');
  }

  /**
   * Đặt lại về Màn hình 1 để xem lại hoặc thử nhánh còn lại
   */
  resetToSelectionScreen() {
    if (this.timeline) {
      this.timeline.kill();
      this.timeline = null;
    }
    this.audio.stopAll();
    this.currentMode = null;
    this.currentStageId = 0;

    this.closeFullLetterModal();
    this.setSkyOpacity(1, 0, 0, 0);
    this.dom.twilightClouds.style.opacity = '0';
    this.dom.sunburstRays.style.opacity = '0';
    this.dom.sunGlowDome.style.opacity = '1';
    this.dom.sunGlowDome.style.transform = 'translateX(-50%) translateY(0px)';
    this.dom.hillMainFill.setAttribute('fill', '#778746');
    this.dom.hillBottomShade.setAttribute('fill', '#637238');
    this.dom.hillFlowersGroup.style.opacity = '1';

    this.dom.stageAcceptProps.style.opacity = '0';
    this.dom.stageRejectProps.style.opacity = '0';
    this.dom.acceptEnvelopeCard.classList.remove('interactive-active', 'cursor-pointer');
    this.dom.rejectLetterCard.classList.remove('interactive-active', 'cursor-pointer');

    this.dom.timelineHud.style.opacity = '0';
    this.dom.subtitleContainer.style.opacity = '0';
    this.dom.btnSkip.classList.add('hidden');
    this.dom.btnReplay.classList.add('hidden');
    this.dom.btnMute.classList.add('hidden');

    window.ChibiStage.renderPose('shy-confess');
    this.particles.setPreset('selection');

    this.dom.selectionScreen.classList.remove('hidden');
    this.dom.selectionScreen.classList.add('interactive-active');
    gsap.fromTo(
      this.dom.selectionScreen,
      { opacity: 0, y: 12, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.65, ease: 'power2.out' }
    );
  }

  /**
   * Gửi thông báo kết quả tỏ tình về Backend / Telegram Bot (Mục 5.3 Tài liệu đặc tả)
   */
  sendConfessionWebhook(choiceStatus) {
    const payload = {
      event: 'CONFESSION_RESPONSE',
      choice: choiceStatus, // "ACCEPTED" | "REJECTED"
      timestamp: new Date().toISOString(),
      device_info: navigator.userAgent || 'Mobile Web'
    };

    // Lưu lịch sử phản hồi vào localStorage để tra cứu nhanh
    try {
      localStorage.setItem('last_confession_response', JSON.stringify(payload));
    } catch (e) {}

    const wh = this.config.webhook || {};
    if (!wh.enabled) return;

    // 1. Gửi tới Custom Webhook Endpoint nếu được cấu hình
    if (wh.endpointUrl && wh.endpointUrl.trim() !== '') {
      fetch(wh.endpointUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
    }

    // 2. Gửi trực tiếp tới Telegram Bot API nếu người dùng điền Bot Token & Chat ID
    if (wh.telegramBotToken && wh.telegramChatId) {
      const emoji = choiceStatus === 'ACCEPTED' ? '💖🎉 ĐỒNG Ý RỒI!' : '🕊️✨ TỪ CHỐI NHẸ NHÀNG';
      const text = [
        `🔔 *THÔNG BÁO KẾT QUẢ TỎ TÌNH*`,
        `• Kết quả: *${emoji}* (\`${choiceStatus}\`)`,
        `• Thời gian: \`${payload.timestamp}\``,
        `• Thiết bị: \`${payload.device_info}\``
      ].join('\n');

      const tgUrl = `https://api.telegram.org/bot${wh.telegramBotToken}/sendMessage`;
      fetch(tgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: wh.telegramChatId,
          text,
          parse_mode: 'Markdown'
        })
      }).catch(() => {});
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.confessionApp = new ConfessionApp();
});
