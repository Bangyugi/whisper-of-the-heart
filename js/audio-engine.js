/**
 * AUDIO ENGINE & PRELOADER MANAGER
 * Đảm bảo tải trước 2 bản nhạc vào bộ nhớ đệm và phát ngay ở mili-giây thứ 0 khi bấm nút
 * Vượt qua chính sách chặn Autoplay của iOS Safari & Chrome Android
 */

class AudioEngine {
  constructor(config) {
    this.config = config || {};
    this.acceptAudio = new Audio();
    this.rejectAudio = new Audio();
    this.activeAudio = null;
    this.activeMode = null;
    this.isMuted = false;
    this.sfxCtx = null;

    this.acceptAudio.preload = 'auto';
    this.rejectAudio.preload = 'auto';
    this.acceptAudio.loop = true;
    this.rejectAudio.loop = true;

    this.acceptAudio.src = this.config.accept || 'assets/audio/accept-music.wav';
    this.rejectAudio.src = this.config.reject || 'assets/audio/reject-music.wav';
  }

  preloadAll(onProgress) {
    return new Promise((resolve) => {
      let loadedCount = 0;
      const total = 2;
      let resolved = false;

      const checkDone = () => {
        loadedCount++;
        if (onProgress) onProgress(Math.min(100, Math.round((loadedCount / total) * 100)));
        if (loadedCount >= total && !resolved) {
          resolved = true;
          resolve();
        }
      };

      const bindLoad = (audioEl) => {
        const handler = () => {
          audioEl.removeEventListener('canplaythrough', handler);
          audioEl.removeEventListener('loadeddata', handler);
          audioEl.removeEventListener('error', handler);
          checkDone();
        };
        audioEl.addEventListener('canplaythrough', handler, { once: true });
        audioEl.addEventListener('loadeddata', handler, { once: true });
        audioEl.addEventListener('error', handler, { once: true });
        try {
          audioEl.load();
        } catch (e) {
          checkDone();
        }
      };

      bindLoad(this.acceptAudio);
      bindLoad(this.rejectAudio);

      // Fallback timeout 1.8s để không bao giờ treo màn hình Preloader trên mạng chậm
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          if (onProgress) onProgress(100);
          resolve();
        }
      }, 1800);
    });
  }

  initSfxContext() {
    if (!this.sfxCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.sfxCtx = new AudioCtx();
      }
    }
    if (this.sfxCtx && this.sfxCtx.state === 'suspended') {
      this.sfxCtx.resume();
    }
  }

  playButtonChime(mode = 'accept') {
    if (this.isMuted) return;
    try {
      this.initSfxContext();
      if (!this.sfxCtx) return;
      const now = this.sfxCtx.currentTime;
      const freqs = mode === 'accept' ? [523.25, 659.25, 783.99, 1046.5] : [440, 523.25, 659.25];
      freqs.forEach((f, idx) => {
        const osc = this.sfxCtx.createOscillator();
        const gain = this.sfxCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.055);
        gain.gain.setValueAtTime(0.001, now + idx * 0.055);
        gain.gain.exponentialRampToValueAtTime(0.08, now + idx * 0.055 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.055 + 0.45);
        osc.connect(gain);
        gain.connect(this.sfxCtx.destination);
        osc.start(now + idx * 0.055);
        osc.stop(now + idx * 0.055 + 0.48);
      });
    } catch (e) {
      // Ignore SFX errors
    }
  }

  playTrack(mode) {
    this.stopAll();
    this.activeMode = mode;
    this.activeAudio = mode === 'accept' ? this.acceptAudio : this.rejectAudio;

    if (!this.activeAudio) return;
    this.activeAudio.currentTime = 0;
    this.activeAudio.volume = this.isMuted ? 0 : 1.0;

    const playPromise = this.activeAudio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        // Fallback nếu trình duyệt chặn
      });
    }
  }

  fadeVolumeTo(targetVolume, durationSec = 1.8) {
    if (!this.activeAudio || this.isMuted) return;
    const target = Math.max(0, Math.min(1, targetVolume));
    if (window.gsap) {
      window.gsap.to(this.activeAudio, {
        volume: target,
        duration: durationSec,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    } else {
      this.activeAudio.volume = target;
    }
  }

  seekTo(seconds) {
    if (!this.activeAudio) return;
    try {
      this.activeAudio.currentTime = seconds;
    } catch (e) {
      // Ignore seek error
    }
  }

  getCurrentTime() {
    return this.activeAudio ? this.activeAudio.currentTime : 0;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.activeAudio) {
      if (this.isMuted) {
        this.activeAudio.volume = 0;
      } else {
        this.activeAudio.volume = 0.85;
      }
    }
    return this.isMuted;
  }

  stopAll() {
    [this.acceptAudio, this.rejectAudio].forEach((aud) => {
      try {
        aud.pause();
        aud.currentTime = 0;
      } catch (e) { }
    });
    this.activeAudio = null;
  }
}

window.AudioEngine = AudioEngine;

