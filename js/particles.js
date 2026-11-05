/**
 * HTML5 CANVAS 60FPS PARTICLE OVERLAY ENGINE (LAYER 5)
 * Đã tối ưu hóa Offscreen Sprite Cache giúp vẽ bằng drawImage() siêu nhẹ 60fps trên điện thoại
 */

class ParticleEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d', { alpha: true }) : null;
    this.preset = 'selection';
    this.width = 430;
    this.height = 800;
    this.isMobile = window.innerWidth <= 540 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    this.dpr = Math.min(window.devicePixelRatio || 1, this.isMobile ? 1.5 : 2);
    this.stars = [];
    this.particles = [];
    this.burstParticles = [];
    this.sprites = {};
    this.running = false;
    this.lastTime = 0;

    if (this.canvas) {
      this.buildSpriteCache();
      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.initStars();
      this.setPreset('selection', true);
    }
  }

  /**
   * Vẽ sẵn toàn bộ các loại hạt (Hoa 5 cánh, Cánh đào, Trái tim, Đom đóm, Sao)
   * ra Offscreen Canvas 1 lần duy nhất để không phải tính toán Bezier / RadialGradient mỗi frame
   */
  buildSpriteCache() {
    const createSprite = (size, drawFn) => {
      const c = document.createElement('canvas');
      const pad = 4;
      const dim = Math.ceil((size + pad) * 2);
      c.width = dim;
      c.height = dim;
      const sctx = c.getContext('2d');
      sctx.translate(dim / 2, dim / 2);
      drawFn(sctx, size);
      return { canvas: c, half: dim / 2 };
    };

    // 1. Cánh hoa anh đào (Petal)
    this.sprites.petal = createSprite(12, (ctx, s) => {
      ctx.fillStyle = '#FFB5C2';
      ctx.strokeStyle = '#6B382C';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.7);
      ctx.bezierCurveTo(-s * 0.85, s * 0.2, -s * 0.75, -s * 0.7, -s * 0.18, -s * 0.85);
      ctx.lineTo(0, -s * 0.55);
      ctx.lineTo(s * 0.18, -s * 0.85);
      ctx.bezierCurveTo(s * 0.75, -s * 0.7, s * 0.85, s * 0.2, 0, s * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });

    // 2. Bông hoa anh đào 5 cánh (Flower)
    this.sprites.flower = createSprite(14, (ctx, r) => {
      ctx.fillStyle = '#FFAEBE';
      ctx.strokeStyle = '#6B382C';
      ctx.lineWidth = 1.4;
      for (let i = 0; i < 5; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI * 2) / 5);
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.18);
        ctx.bezierCurveTo(-r * 0.52, -r * 0.45, -r * 0.45, -r * 1.05, -r * 0.12, -r * 1.08);
        ctx.lineTo(0, -r * 0.88);
        ctx.lineTo(r * 0.12, -r * 1.08);
        ctx.bezierCurveTo(r * 0.45, -r * 1.05, r * 0.52, -r * 0.45, 0, -r * 0.18);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      ctx.fillStyle = '#FFE082';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // 3. Trái tim Chibi (Heart)
    this.sprites.heart = createSprite(12, (ctx, s) => {
      ctx.fillStyle = '#FF7E79';
      ctx.strokeStyle = '#6B382C';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.55);
      ctx.bezierCurveTo(-s * 1.05, -s * 0.05, -s * 0.65, -s * 0.95, 0, -s * 0.35);
      ctx.bezierCurveTo(s * 0.65, -s * 0.95, s * 1.05, -s * 0.05, 0, s * 0.55);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });

    // 4. Sao lấp lánh 4 cánh (Sparkle)
    const makeSparkle = (color) =>
      createSprite(10, (ctx, r) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.quadraticCurveTo(r * 0.18, -r * 0.18, r, 0);
        ctx.quadraticCurveTo(r * 0.18, r * 0.18, 0, r);
        ctx.quadraticCurveTo(-r * 0.18, r * 0.18, -r, 0);
        ctx.quadraticCurveTo(-r * 0.18, -r * 0.18, 0, -r);
        ctx.closePath();
        ctx.fill();
      });

    this.sprites.sparkleGold = makeSparkle('#FFF6C2');
    this.sprites.sparkleStar = makeSparkle('#FFF9D6');
    this.sprites.sparkleWhite = makeSparkle('#FFFFFF');

    const makeStarDot = (color) =>
      createSprite(6, (ctx, r) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
        ctx.fill();
      });
    this.sprites.dotGold = makeStarDot('#FFF9D6');
    this.sprites.dotWhite = makeStarDot('#FFFFFF');

    // 5. Đom đóm phát sáng (Firefly Radial Gradient vẽ sẵn 1 lần)
    const makeFirefly = (midColor) =>
      createSprite(12, (ctx, r) => {
        const grad = ctx.createRadialGradient(0, 0, 0.5, 0, 0, r);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.4, midColor);
        grad.addColorStop(1, 'rgba(255, 232, 158, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
      });

    this.sprites.fireflyGold = makeFirefly('#FFE89E');
    this.sprites.fireflyPink = makeFirefly('#FFD1DC');
    this.sprites.fireflyCream = makeFirefly('#FFF4C8');
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = rect.width || 430;
    this.height = rect.height || 800;
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  initStars() {
    this.stars = [];
    const starCount = this.isMobile ? 26 : 34;
    for (let i = 0; i < starCount; i++) {
      const isGold = Math.random() > 0.3;
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.height * 0.68),
        size: 1.5 + Math.random() * 3.0,
        isDiamond: Math.random() > 0.58,
        phase: Math.random() * Math.PI * 2,
        speed: 1.2 + Math.random() * 2.2,
        color: isGold ? '#FFF9D6' : '#FFFFFF',
        spriteKey: isGold ? 'sparkleStar' : 'sparkleWhite',
        dotKey: isGold ? 'dotGold' : 'dotWhite'
      });
    }
  }

  setPreset(presetName, immediate = false) {
    if (this.preset === presetName && this.particles.length > 0) return;
    this.preset = presetName;

    const scale = this.isMobile ? 0.78 : 1;
    let targetCount = Math.round(16 * scale);
    if (presetName === 'sakura-hearts') targetCount = Math.round(24 * scale);
    else if (presetName === 'sakura-magic') targetCount = Math.round(22 * scale);
    else if (presetName === 'sakura-gentle') targetCount = Math.round(18 * scale);
    else if (presetName === 'twilight-fireflies') targetCount = Math.round(20 * scale);
    else if (presetName.startsWith('reject') || presetName.includes('stars')) targetCount = Math.round(16 * scale);

    if (immediate || this.particles.length === 0) {
      this.particles = [];
      for (let i = 0; i < targetCount; i++) {
        this.particles.push(this.createParticle(presetName, true));
      }
      this.targetCount = targetCount;
      return;
    }

    if (presetName === 'sakura-hearts') {
      const extra = this.isMobile ? 6 : 9;
      for (let i = 0; i < extra; i++) {
        const np = this.createParticle(presetName, true);
        np.alpha = 0.02;
        np.fadeInTarget = 0.85;
        this.particles.push(np);
      }
    }

    while (this.particles.length < targetCount) {
      const p = this.createParticle(presetName, false);
      p.alpha = 0.02;
      p.fadeInTarget = 0.78 + Math.random() * 0.22;
      this.particles.push(p);
    }

    this.targetCount = targetCount;
  }

  createParticle(preset, initialRandomY = false) {
    const w = this.width;
    const h = this.height;

    if (preset === 'twilight-fireflies') {
      const isGold = Math.random() > 0.4;
      return {
        type: 'firefly',
        spriteKey: isGold ? 'fireflyGold' : 'fireflyPink',
        x: Math.random() * w,
        y: initialRandomY ? Math.random() * h * 0.85 : h * 0.78 + Math.random() * 60,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -0.35 - Math.random() * 0.55,
        size: 2.2 + Math.random() * 3.5,
        alpha: 0.3 + Math.random() * 0.7,
        phase: Math.random() * Math.PI * 2
      };
    }

    if (preset === 'sakura-hearts' || preset === 'sakura-magic' || preset === 'sakura-gentle') {
      const roll = Math.random();
      let type = 'petal';
      if (roll > 0.76) type = 'flower';
      else if (roll > 0.56 && preset !== 'sakura-gentle') type = 'heart';
      else if (roll > 0.42 && preset === 'sakura-magic') type = 'sparkle';

      const isRising = type === 'heart' || type === 'sparkle';
      return {
        type,
        spriteKey: type === 'sparkle' ? 'sparkleGold' : type,
        x: Math.random() * w,
        y: initialRandomY
          ? Math.random() * h * 0.85
          : isRising
            ? h * 0.72 + Math.random() * 50
            : -20 - Math.random() * 60,
        vx: isRising ? (Math.random() - 0.5) * 0.45 : -0.35 + Math.random() * 0.85,
        vy: isRising ? -0.45 - Math.random() * 0.55 : 0.55 + Math.random() * 0.85,
        size:
          type === 'flower'
            ? 8 + Math.random() * 4
            : type === 'heart'
              ? 7 + Math.random() * 4
              : 5 + Math.random() * 4,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.025,
        swayAmp: 0.4 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.75 + Math.random() * 0.25
      };
    }

    const isSparkle = Math.random() > 0.65;
    return {
      type: isSparkle ? 'sparkle' : 'firefly',
      spriteKey: isSparkle ? 'sparkleGold' : 'fireflyCream',
      x: Math.random() * w,
      y: initialRandomY ? Math.random() * h * 0.8 : h * 0.75 + Math.random() * 40,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -0.2 - Math.random() * 0.35,
      size: 2.0 + Math.random() * 3.2,
      alpha: 0.4 + Math.random() * 0.55,
      phase: Math.random() * Math.PI * 2
    };
  }

  triggerBurst(x, y, mode = 'accept') {
    const count = this.isMobile ? 16 : 22;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
      const speed = 1.5 + Math.random() * 3.8;
      const type = mode === 'accept' ? (i % 2 === 0 ? 'heart' : 'petal') : 'sparkle';
      this.burstParticles.push({
        type,
        spriteKey: type === 'sparkle' ? 'sparkleGold' : type,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        size: 6 + Math.random() * 5,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.08,
        alpha: 1,
        life: 1.0
      });
    }
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    const loop = (now) => {
      if (!this.running) return;
      const dt = Math.min((now - this.lastTime) / 16.667, 2.5);
      this.lastTime = now;
      this.updateAndDraw(now * 0.001, dt);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
  }

  updateAndDraw(timeSec, dt) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const dpr = this.dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Vẽ hệ thống sao lấp lánh bằng Sprite Cache (không tốn save/restore)
    for (let i = 0, len = this.stars.length; i < len; i++) {
      const s = this.stars[i];
      const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(timeSec * s.speed + s.phase));
      ctx.globalAlpha = twinkle;
      if (s.isDiamond) {
        const sp = this.sprites[s.spriteKey];
        const drawRadius = s.size * 1.9;
        const scale = drawRadius / 10;
        const half = sp.half * scale;
        ctx.drawImage(sp.canvas, s.x - half, s.y - half, half * 2, half * 2);
      } else {
        const sp = this.sprites[s.dotKey];
        const scale = (s.size * 0.95) / 6;
        const half = sp.half * scale;
        ctx.drawImage(sp.canvas, s.x - half, s.y - half, half * 2, half * 2);
      }
    }

    // 2. Cập nhật và vẽ các hạt theo ngữ cảnh
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.phase += 0.03 * dt;
      p.x += (p.vx + Math.sin(p.phase) * (p.swayAmp || 0.2)) * dt;
      p.y += p.vy * dt;
      if (p.rot !== undefined) p.rot += (p.vRot || 0.01) * dt;

      if (p.fadeInTarget && p.alpha < p.fadeInTarget) {
        p.alpha = Math.min(p.fadeInTarget, p.alpha + 0.018 * dt);
      }

      const outTop = p.vy < 0 && p.y < -30;
      const outBottom = p.vy > 0 && p.y > this.height * 0.86;
      if (outTop || outBottom) {
        if (this.targetCount && this.particles.length > this.targetCount) {
          this.particles.splice(i, 1);
        } else {
          this.particles[i] = this.createParticle(this.preset, false);
        }
        continue;
      }
      if (p.x < -30) p.x = this.width + 20;
      if (p.x > this.width + 30) p.x = -20;

      this.renderSingleParticle(ctx, p, timeSec, dpr);
    }

    // 3. Vẽ hiệu ứng nổ hạt khi bấm nút (Burst Particles)
    for (let i = this.burstParticles.length - 1; i >= 0; i--) {
      const b = this.burstParticles[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.vy += 0.06 * dt;
      b.rot += b.vRot * dt;
      b.life -= 0.02 * dt;
      b.alpha = Math.max(0, b.life);
      if (b.life <= 0) {
        this.burstParticles.splice(i, 1);
        continue;
      }
      this.renderSingleParticle(ctx, b, timeSec, dpr);
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalAlpha = 1;
  }

  renderSingleParticle(ctx, p, timeSec, dpr) {
    const sp = this.sprites[p.spriteKey || p.type];
    if (!sp) return;

    ctx.globalAlpha = p.alpha;

    if (p.type === 'firefly') {
      const glow = 0.5 + 0.5 * Math.sin(timeSec * 3 + p.phase);
      const radius = p.size * (1.8 + glow * 0.6);
      const scale = radius / 12;
      const half = sp.half * scale;
      ctx.setTransform(dpr, 0, 0, dpr, p.x * dpr, p.y * dpr);
      ctx.drawImage(sp.canvas, -half, -half, half * 2, half * 2);
      return;
    }

    if (p.type === 'sparkle') {
      const scale = (p.size * 1.4) / 10;
      const half = sp.half * scale;
      ctx.setTransform(dpr, 0, 0, dpr, p.x * dpr, p.y * dpr);
      ctx.drawImage(sp.canvas, -half, -half, half * 2, half * 2);
      return;
    }

    const baseSize = p.type === 'flower' ? 14 : 12;
    const scale = p.size / baseSize;
    const half = sp.half * scale;
    const cos = Math.cos(p.rot || 0) * dpr;
    const sin = Math.sin(p.rot || 0) * dpr;
    ctx.setTransform(cos, sin, -sin, cos, p.x * dpr, p.y * dpr);
    ctx.drawImage(sp.canvas, -half, -half, half * 2, half * 2);
  }
}

window.ParticleEngine = ParticleEngine;
