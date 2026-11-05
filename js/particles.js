/**
 * HTML5 CANVAS 60FPS PARTICLE OVERLAY ENGINE (LAYER 5)
 * Vẽ cánh hoa anh đào, bông hoa 5 cánh viền nâu, trái tim Chibi, đom đóm & sao lấp lánh
 */

class ParticleEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.preset = 'selection';
    this.width = 430;
    this.height = 800;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.stars = [];
    this.particles = [];
    this.burstParticles = [];
    this.running = false;
    this.lastTime = 0;

    if (this.canvas) {
      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.initStars();
      this.setPreset('selection');
    }
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = rect.width || 430;
    this.height = rect.height || 800;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  initStars() {
    this.stars = [];
    const starCount = 36;
    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * (this.height * 0.68),
        size: 1.5 + Math.random() * 3.2,
        isDiamond: Math.random() > 0.58,
        phase: Math.random() * Math.PI * 2,
        speed: 1.2 + Math.random() * 2.2,
        color: Math.random() > 0.3 ? '#FFF9D6' : '#FFFFFF'
      });
    }
  }

  setPreset(presetName) {
    this.preset = presetName;
    this.particles = [];

    let count = 18;
    if (presetName === 'sakura-hearts') count = 28;
    else if (presetName === 'sakura-magic') count = 26;
    else if (presetName === 'sakura-gentle') count = 20;
    else if (presetName === 'twilight-fireflies') count = 24;
    else if (presetName.startsWith('reject') || presetName.includes('stars')) count = 18;

    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle(presetName, true));
    }
  }

  createParticle(preset, initialRandomY = false) {
    const w = this.width;
    const h = this.height;

    if (preset === 'twilight-fireflies') {
      return {
        type: 'firefly',
        x: Math.random() * w,
        y: initialRandomY ? Math.random() * h * 0.85 : h * 0.78 + Math.random() * 60,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -0.35 - Math.random() * 0.55,
        size: 2.2 + Math.random() * 3.5,
        alpha: 0.3 + Math.random() * 0.7,
        phase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.4 ? '#FFE89E' : '#FFD1DC'
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
        x: Math.random() * w,
        y: initialRandomY
          ? Math.random() * h * 0.85
          : isRising
            ? h * 0.72 + Math.random() * 50
            : -20 - Math.random() * 60,
        vx: isRising ? (Math.random() - 0.5) * 0.45 : -0.35 + Math.random() * 0.85,
        vy: isRising ? -0.45 - Math.random() * 0.55 : 0.55 + Math.random() * 0.85,
        size: type === 'flower' ? 8 + Math.random() * 4 : type === 'heart' ? 7 + Math.random() * 4 : 5 + Math.random() * 4,
        rot: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.025,
        swayAmp: 0.4 + Math.random() * 0.8,
        swayFreq: 0.015 + Math.random() * 0.02,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.75 + Math.random() * 0.25
      };
    }

    // Default / Selection / Reject twilight gentle orbs & sparkles
    return {
      type: Math.random() > 0.65 ? 'sparkle' : 'firefly',
      x: Math.random() * w,
      y: initialRandomY ? Math.random() * h * 0.8 : h * 0.75 + Math.random() * 40,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -0.2 - Math.random() * 0.35,
      size: 2.0 + Math.random() * 3.2,
      alpha: 0.4 + Math.random() * 0.55,
      phase: Math.random() * Math.PI * 2,
      color: '#FFF4C8'
    };
  }

  triggerBurst(x, y, mode = 'accept') {
    const count = 22;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
      const speed = 1.5 + Math.random() * 3.8;
      this.burstParticles.push({
        type: mode === 'accept' ? (i % 2 === 0 ? 'heart' : 'petal') : 'sparkle',
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
    ctx.clearRect(0, 0, this.width, this.height);

    // 1. Vẽ hệ thống sao lấp lánh trên bầu trời
    for (const s of this.stars) {
      const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(timeSec * s.speed + s.phase));
      ctx.save();
      ctx.globalAlpha = twinkle;
      if (s.isDiamond) {
        this.drawDiamondStar(ctx, s.x, s.y, s.size * 1.9, s.color);
      } else {
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 0.65, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 2. Cập nhật và vẽ các hạt theo ngữ cảnh
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.phase += 0.03 * dt;
      p.x += (p.vx + Math.sin(p.phase) * (p.swayAmp || 0.2)) * dt;
      p.y += p.vy * dt;
      if (p.rot !== undefined) p.rot += (p.vRot || 0.01) * dt;

      // Tái tạo hạt khi bay ra khỏi khung hình
      if (p.vy < 0 && p.y < -30) {
        this.particles[i] = this.createParticle(this.preset, false);
        continue;
      }
      if (p.vy > 0 && p.y > this.height * 0.86) {
        this.particles[i] = this.createParticle(this.preset, false);
        continue;
      }
      if (p.x < -30) p.x = this.width + 20;
      if (p.x > this.width + 30) p.x = -20;

      this.renderSingleParticle(ctx, p, timeSec);
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
      this.renderSingleParticle(ctx, b, timeSec);
    }
  }

  renderSingleParticle(ctx, p, timeSec) {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.translate(p.x, p.y);
    if (p.rot) ctx.rotate(p.rot);

    if (p.type === 'firefly') {
      const glow = 0.5 + 0.5 * Math.sin(timeSec * 3 + p.phase);
      const grad = ctx.createRadialGradient(0, 0, 0.5, 0, 0, p.size * 2.4);
      grad.addColorStop(0, '#FFFFFF');
      grad.addColorStop(0.4, p.color || '#FFE89E');
      grad.addColorStop(1, 'rgba(255, 232, 158, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, p.size * (1.8 + glow * 0.6), 0, Math.PI * 2);
      ctx.fill();
    } else if (p.type === 'sparkle') {
      this.drawDiamondStar(ctx, 0, 0, p.size * 1.4, '#FFF6C2');
    } else if (p.type === 'petal') {
      this.drawSakuraPetal(ctx, p.size);
    } else if (p.type === 'flower') {
      this.drawSakuraFlower(ctx, p.size);
    } else if (p.type === 'heart') {
      this.drawChibiHeart(ctx, p.size);
    }

    ctx.restore();
  }

  drawDiamondStar(ctx, x, y, r, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -r);
    ctx.quadraticCurveTo(r * 0.18, -r * 0.18, r, 0);
    ctx.quadraticCurveTo(r * 0.18, r * 0.18, 0, r);
    ctx.quadraticCurveTo(-r * 0.18, r * 0.18, -r, 0);
    ctx.quadraticCurveTo(-r * 0.18, -r * 0.18, 0, -r);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawSakuraPetal(ctx, s) {
    ctx.fillStyle = '#FFB5C2';
    ctx.strokeStyle = '#6B382C';
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.7);
    ctx.bezierCurveTo(-s * 0.85, s * 0.2, -s * 0.75, -s * 0.7, -s * 0.18, -s * 0.85);
    ctx.lineTo(0, -s * 0.55);
    ctx.lineTo(s * 0.18, -s * 0.85);
    ctx.bezierCurveTo(s * 0.75, -s * 0.7, s * 0.85, s * 0.2, 0, s * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  drawSakuraFlower(ctx, r) {
    ctx.fillStyle = '#FFAEBE';
    ctx.strokeStyle = '#6B382C';
    ctx.lineWidth = 1.3;
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
  }

  drawChibiHeart(ctx, s) {
    ctx.fillStyle = '#FF7E79';
    ctx.strokeStyle = '#6B382C';
    ctx.lineWidth = 1.35;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.55);
    ctx.bezierCurveTo(-s * 1.05, -s * 0.05, -s * 0.65, -s * 0.95, 0, -s * 0.35);
    ctx.bezierCurveTo(s * 0.65, -s * 0.95, s * 1.05, -s * 0.05, 0, s * 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

window.ParticleEngine = ParticleEngine;

