// Fly Cursor Simulation & Rendering

export interface FlyState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  heading: number;
  landed: number; // 0 (flying) to 1 (landed)
  recoil: number;
  stillTime: number;
  timeAlive: number;
  visible: boolean;

  // Caught by spider
  isCaught: boolean;
  caughtTime: number;
  caughtDuration: number;
  cocoonProgress: number;
  cocoonFade: number;
  cocoonX: number;
  cocoonY: number;
  fleeVx: number;
  fleeVy: number;
}

export class FlyManager {
  state: FlyState;
  flyTexture: HTMLCanvasElement;
  targetX: number;
  targetY: number;
  isPointerOverInteractive = false;
  pointerActive = false;

  constructor(flyTexture: HTMLCanvasElement) {
    this.flyTexture = flyTexture;
    this.state = {
      x: window.innerWidth / 2 + 100,
      y: window.innerHeight / 2,
      vx: 0,
      vy: 0,
      heading: 0,
      landed: 0,
      recoil: 0,
      stillTime: 0,
      timeAlive: 0,
      visible: true,

      isCaught: false,
      caughtTime: 0,
      caughtDuration: 3.5,
      cocoonProgress: 0,
      cocoonFade: 1,
      cocoonX: 0,
      cocoonY: 0,
      fleeVx: 0,
      fleeVy: 0
    };
    this.targetX = this.state.x;
    this.targetY = this.state.y;
  }

  setPointer(x: number, y: number, isInteractive: boolean) {
    this.targetX = x;
    this.targetY = y;
    this.isPointerOverInteractive = isInteractive;
    this.pointerActive = true;
  }

  setPointerOut() {
    this.pointerActive = false;
  }

  catch(spiderMouthX: number, spiderMouthY: number) {
    if (this.state.isCaught) return;
    this.state.isCaught = true;
    this.state.caughtTime = 0;
    this.state.caughtDuration = 3.0 + Math.random() * 1.2;
    this.state.cocoonProgress = 0;
    this.state.cocoonFade = 1;
    this.state.cocoonX = spiderMouthX;
    this.state.cocoonY = spiderMouthY;
    this.state.x = spiderMouthX;
    this.state.y = spiderMouthY;
    this.state.vx = 0;
    this.state.vy = 0;
  }

  update(dt: number, flySize: number) {
    const s = this.state;
    s.timeAlive += dt;
    const B = s.timeAlive;

    // Visibility
    if (!this.pointerActive || this.isPointerOverInteractive) {
      s.visible = false;
    } else {
      s.visible = true;
    }

    if (s.isCaught) {
      s.caughtTime += dt;
      s.cocoonProgress = Math.min(1, s.caughtTime / 1.4);

      // Tremble at 47 Hz and 31 Hz while caught
      const tremble = Math.sin(47 * 2 * Math.PI * B) * 1.8 + Math.sin(31 * 2 * Math.PI * B) * 1.2;
      s.x = s.cocoonX + tremble;
      s.y = s.cocoonY + Math.cos(31 * 2 * Math.PI * B) * 1.5;

      if (s.caughtTime >= s.caughtDuration) {
        // Break free! Flung 150px away
        s.isCaught = false;
        const fleeAngle = Math.random() * Math.PI * 2;
        s.fleeVx = Math.cos(fleeAngle) * 550;
        s.fleeVy = Math.sin(fleeAngle) * 550;
        s.x += Math.cos(fleeAngle) * 40;
        s.y += Math.sin(fleeAngle) * 40;
        s.recoil = 1;
        s.landed = 0;
      }
      return;
    }

    if (s.cocoonProgress > 0 && s.cocoonFade > 0) {
      s.cocoonFade = Math.max(0, s.cocoonFade - dt * 1.5);
    }

    if (s.recoil > 0) {
      s.recoil = Math.max(0, s.recoil - dt * 2.5);
    }

    // Follow target pointer
    const ease = 1 - Math.exp(-(28 - 20 * s.recoil) * dt);
    const prevX = s.x;
    const prevY = s.y;

    if (s.fleeVx !== 0 || s.fleeVy !== 0) {
      s.x += s.fleeVx * dt;
      s.y += s.fleeVy * dt;
      s.fleeVx *= Math.exp(-4 * dt);
      s.fleeVy *= Math.exp(-4 * dt);
      if (Math.hypot(s.fleeVx, s.fleeVy) < 20) {
        s.fleeVx = 0;
        s.fleeVy = 0;
      }
    } else {
      s.x += (this.targetX - s.x) * ease;
      s.y += (this.targetY - s.y) * ease;
    }

    // Buzz jitter
    const jx = (Math.sin(23.1 * B) + 0.6 * Math.sin(37.7 * B + 1.3)) * 2.2;
    const jy = (Math.sin(29.3 * B + 0.7) + 0.6 * Math.sin(41.9 * B)) * 2.2;
    const jitterScale = 1 - s.landed;
    s.x += jx * jitterScale * (1 - s.recoil);
    s.y += jy * jitterScale * (1 - s.recoil);

    s.vx = (s.x - prevX) / Math.max(0.001, dt);
    s.vy = (s.y - prevY) / Math.max(0.001, dt);
    const speed = Math.hypot(s.vx, s.vy);

    // Turn along motion above 60 px/s
    if (speed > 60) {
      const targetHeading = Math.atan2(s.vy, s.vx) + Math.PI / 2;
      let diff = targetHeading - s.heading;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      s.heading += diff * (1 - Math.exp(-12 * dt));
    }

    // Still time & landing
    if (speed < 15 && Math.hypot(this.targetX - s.x, this.targetY - s.y) < 15) {
      s.stillTime += dt;
    } else {
      s.stillTime = 0;
    }

    if (s.stillTime > 1.2) {
      s.landed = Math.min(1, s.landed + dt * 3.0);
    } else {
      s.landed = Math.max(0, s.landed - dt * 10.0);
    }
  }

  draw(ctx: CanvasRenderingContext2D, flySize: number) {
    const s = this.state;
    if (!s.visible && !s.isCaught && s.cocoonFade <= 0) return;

    const width = 79 * flySize;
    const height = (width / 240) * 246;
    const B = s.timeAlive;
    const yHover = 1 - s.landed;

    // Draw Cocoon if caught or fading
    if (s.cocoonProgress > 0 && s.cocoonFade > 0) {
      ctx.save();
      ctx.translate(s.cocoonX, s.cocoonY);
      ctx.globalAlpha = s.cocoonFade * 0.9;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 1.6;

      const cocoonR = 30 * flySize;
      const totalStrokes = Math.floor(s.cocoonProgress * 7);

      for (let i = 0; i < totalStrokes; i++) {
        const rot = (i * Math.PI) / 4 + 0.3;
        ctx.beginPath();
        ctx.ellipse(0, 0, cocoonR * (0.8 + 0.2 * Math.sin(i)), cocoonR * 0.55, rot, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 70 Short silk fibres
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      const fibreCount = Math.floor(s.cocoonProgress * 70);
      for (let j = 0; j < fibreCount; j++) {
        const fa = (j * 137.5 * Math.PI) / 180;
        const fr = cocoonR * (0.3 + 0.7 * Math.sin(j * 9));
        const fx = Math.cos(fa) * fr;
        const fy = Math.sin(fa) * fr;
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(fx + Math.cos(j * 3) * 8, fy + Math.sin(j * 5) * 8);
        ctx.stroke();
      }
      ctx.restore();
    }

    if (!s.visible && !s.isCaught) return;

    // Fly Shadow
    ctx.save();
    const shadowAlpha = 0.2 + 0.18 * s.landed;
    const shadowBlur = 3 + 9 * yHover;
    const shadowOffsetX = 3 + 14 * yHover;
    const shadowOffsetY = (5 + 26 * yHover) + Math.sin(6 * B) * 1.2 * yHover;

    ctx.shadowColor = `rgba(0, 0, 0, ${shadowAlpha})`;
    ctx.shadowBlur = shadowBlur;
    ctx.shadowOffsetX = shadowOffsetX;
    ctx.shadowOffsetY = shadowOffsetY;

    // Draw shadow shape
    ctx.translate(s.x, s.y);
    ctx.rotate(s.heading);
    ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha * 0.5})`;
    ctx.beginPath();
    ctx.ellipse(0, 0, width * 0.25, height * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Draw Fly with Wing Flapping
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.heading);

    const wingFreq = s.isCaught ? 46 : 34; // 34 Hz flying, 46 Hz when caught
    const q = Math.sin(wingFreq * 2 * Math.PI * B);

    // Draw ghost wing copies if flying
    if (this.flyTexture && this.flyTexture.width > 0 && this.flyTexture.height > 0) {
      if (s.landed < 0.9) {
        const ghostCount = 4;
        for (let g = 0; g < ghostCount; g++) {
          const gOffset = (g / ghostCount) * 0.4;
          const gQ = Math.sin((wingFreq * 2 * Math.PI * (B - gOffset)));
          ctx.save();
          ctx.globalAlpha = 0.2 * (1 - s.landed);
          ctx.scale(1, 1 - 0.25 * Math.abs(gQ));
          ctx.drawImage(this.flyTexture, -width / 2, -height / 2, width, height);
          ctx.restore();
        }
      }

      // Main Fly Image
      ctx.save();
      if (s.landed > 0.1) {
        // Folded wings slightly scaled
        ctx.scale(1, 1 - 0.08 * s.landed);
      } else {
        ctx.scale(1, 1 - 0.25 * Math.abs(q));
      }
      ctx.drawImage(this.flyTexture, -width / 2, -height / 2, width, height);
      ctx.restore();
    }

    ctx.restore();
  }
}
