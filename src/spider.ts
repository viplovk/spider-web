// Spider Rig, Inverse Kinematics, Behavior, and Rendering

export interface LegDef {
  index: number;
  isRight: boolean;
  hip: { x: number; y: number };
  knee: { x: number; y: number };
  restFoot: { x: number; y: number };
  a: number; // Femur length
  b: number; // Tibia length
  reach: number;
  gaitGroup: number;

  // Realtime foot state
  footX: number;
  footY: number;
  stepStartX: number;
  stepStartY: number;
  stepTargetX: number;
  stepTargetY: number;
  stepProgress: number; // 0 to 1, or 1 if planted
  isStepping: boolean;
  stepDuration: number;
}

export interface ZParticle {
  c: number; // cycle 0 to 1
  delay: number;
}

export class SpiderRig {
  x = window.innerWidth / 2;
  y = -400;
  vx = 0;
  vy = 0;
  heading = Math.PI / 2; // Straight down initially
  speed = 0;
  angularVelocity = 0;
  bodySway = 0;

  // Scale units
  scale = 1.0;
  K = 0.12;

  // Intro Drop state
  introTime = 0;
  introPhase: 'waiting' | 'dropping' | 'bouncing' | 'landed' = 'waiting';
  landingSquash = 0;

  // Jump state
  isJumping = false;
  jumpTime = 0;
  jumpDuration = 0.4;
  jumpStartX = 0;
  jumpStartY = 0;
  jumpTargetX = 0;
  jumpTargetY = 0;
  jumpHeight = 0;
  currentHeight = 0; // Current height off page

  // Rest & Sleep
  qt = 0; // 0 to 1 rest face fade
  sleep = 0; // 0 to 1 sleep fade
  restTime = 0;
  blinkTimer = 0;
  blinkPhase = 0; // 0 to 1
  nextBlinkTime = 1.5;
  breathPhase = 0;
  zParticles: ZParticle[] = [
    { c: 0, delay: 0 },
    { c: 0, delay: 0.6 },
    { c: 0, delay: 1.2 }
  ];

  legs: LegDef[] = [];
  spiderTexture: HTMLCanvasElement;
  idleHeadTexture: HTMLCanvasElement;
  spiderCanvas: HTMLCanvasElement;
  spiderCtx: CanvasRenderingContext2D;

  // Sliced body and head layers
  abdomenMaskCanvas: HTMLCanvasElement;
  headMaskCanvas: HTMLCanvasElement;

  // Event callbacks
  onFootfall?: (x: number, y: number) => void;
  onLand?: (x: number, y: number, strength: number) => void;
  onWakeHop?: (x: number, y: number) => void;

  constructor(spiderTexture: HTMLCanvasElement, idleHeadTexture: HTMLCanvasElement) {
    this.spiderTexture = spiderTexture;
    this.idleHeadTexture = idleHeadTexture;

    this.spiderCanvas = document.createElement('canvas');
    this.spiderCtx = this.spiderCanvas.getContext('2d')!;

    this.abdomenMaskCanvas = document.createElement('canvas');
    this.headMaskCanvas = document.createElement('canvas');

    this.initRig();
    this.initMasks();
  }

  // Pre-bake sliced abdomen and head layers
  private initMasks() {
    const s = 560 / 1254;
    const tx = (x: number) => x * s;
    const ty = (y: number) => y * s;

    // Abdomen mask: (628, 345) r 220x205
    this.abdomenMaskCanvas.width = 560;
    this.abdomenMaskCanvas.height = 560;
    const aCtx = this.abdomenMaskCanvas.getContext('2d')!;
    aCtx.drawImage(this.spiderTexture, 0, 0);
    aCtx.globalCompositeOperation = 'destination-in';
    aCtx.beginPath();
    aCtx.ellipse(tx(628), ty(345), 220 * s, 205 * s, 0, 0, Math.PI * 2);
    aCtx.fill();

    // Head mask: (630, 680) r 172x148, (545,880) r 74x70, (712,880) r 74x70
    this.headMaskCanvas.width = 560;
    this.headMaskCanvas.height = 560;
    const hCtx = this.headMaskCanvas.getContext('2d')!;
    hCtx.drawImage(this.spiderTexture, 0, 0);
    hCtx.globalCompositeOperation = 'destination-in';
    hCtx.beginPath();
    hCtx.ellipse(tx(630), ty(680), 172 * s, 148 * s, 0, 0, Math.PI * 2);
    hCtx.ellipse(tx(545), ty(880), 74 * s, 70 * s, 0, 0, Math.PI * 2);
    hCtx.ellipse(tx(712), ty(880), 74 * s, 70 * s, 0, 0, Math.PI * 2);
    hCtx.fill();
  }

  private initRig() {
    // Leg polylines in sprite space (right side)
    const rawLegs = [
      [[470, 760], [370, 830], [400, 1160]],
      [[460, 665], [300, 690], [100, 955]],
      [[480, 605], [370, 580], [55, 475]],
      [[490, 560], [360, 420], [410, 52]]
    ];

    // Body space conversion: bx = y - 600, by = -(x - 627)
    const toBodySpace = (x: number, y: number) => ({
      x: y - 600,
      y: -(x - 627)
    });

    this.legs = [];

    // Construct 4 legs right, 4 legs left
    [false, true].forEach(isRight => {
      rawLegs.forEach((pts, idx) => {
        const hipImg = { x: isRight ? pts[0][0] : 1254 - pts[0][0], y: pts[0][1] };
        const kneeImg = { x: isRight ? pts[1][0] : 1254 - pts[1][0], y: pts[1][1] };
        const footImg = { x: isRight ? pts[2][0] : 1254 - pts[2][0], y: pts[2][1] };

        const hip = toBodySpace(hipImg.x, hipImg.y);
        const knee = toBodySpace(kneeImg.x, kneeImg.y);
        const restFoot = toBodySpace(footImg.x, footImg.y);

        let a = Math.hypot(knee.x - hip.x, knee.y - hip.y);
        let b = Math.hypot(restFoot.x - knee.x, restFoot.y - knee.y);
        const reachDist = Math.hypot(restFoot.x - hip.x, restFoot.y - hip.y);

        if (a + b < 1.15 * reachDist) {
          const factor = (1.15 * reachDist) / (a + b);
          a *= factor;
          b *= factor;
        }

        const gaitGroup = (idx + (isRight ? 0 : 1)) % 2;

        this.legs.push({
          index: idx,
          isRight,
          hip,
          knee,
          restFoot,
          a,
          b,
          reach: a + b,
          gaitGroup,
          footX: 0,
          footY: 0,
          stepStartX: 0,
          stepStartY: 0,
          stepTargetX: 0,
          stepTargetY: 0,
          stepProgress: 1.0,
          isStepping: false,
          stepDuration: 0.12
        });
      });
    });
  }

  // Set spider scale based on window size
  updateScale(w: number, h: number) {
    let t = 1.0;
    if (w <= h) {
      t = Math.max(0.78, Math.min(1.1, w / 480));
    } else if (h < 560) {
      t = Math.max(0.68, h / 620);
    } else {
      t = Math.min(w / 1440, h / 810);
    }
    t = Math.max(0.6, Math.min(1.25, t));

    this.scale = 1.63 * t;
    this.K = this.scale * 0.12;
  }

  // World coordinate of spider spinneret
  getSpinneretWorld(): { x: number; y: number } {
    // Spinneret in body space: (150 - 600, -(627 - 627)) = (-450, 0)
    const bx = -450 * this.K;
    const by = 0;
    const cosH = Math.cos(this.heading);
    const sinH = Math.sin(this.heading);

    return {
      x: this.x + (bx * cosH - by * sinH),
      y: this.y + (bx * sinH + by * cosH)
    };
  }

  // World coordinate of spider mouth
  getMouthWorld(): { x: number; y: number } {
    const mouthDist = 360 * this.K;
    return {
      x: this.x + Math.cos(this.heading) * mouthDist,
      y: this.y + Math.sin(this.heading) * mouthDist
    };
  }

  // Pounce at target
  pounce(targetX: number, targetY: number) {
    if (this.isJumping || this.introPhase !== 'landed') return;

    this.isJumping = true;
    this.jumpTime = 0;
    this.jumpStartX = this.x;
    this.jumpStartY = this.y;

    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.hypot(dx, dy);

    // Travels at most 360K beyond or clamps
    const jumpDist = Math.min(dist, 550);
    const angle = Math.atan2(dy, dx);
    this.heading = angle;

    this.jumpTargetX = this.x + Math.cos(angle) * jumpDist;
    this.jumpTargetY = this.y + Math.sin(angle) * jumpDist;

    this.jumpDuration = Math.max(0.28, Math.min(0.6, jumpDist / 1100));
    this.jumpHeight = Math.max(22, Math.min(0.3 * jumpDist, 130));

    // Reset rest
    this.restTime = 0;
    this.qt = 0;
    this.sleep = 0;
  }

  update(dt: number, targetX: number, targetY: number, hasFly: boolean, isPointerMoving: boolean) {
    const K = this.K;
    this.breathPhase += (3.2 - 1.8 * this.sleep) * dt;

    if (this.landingSquash > 0) {
      this.landingSquash = Math.max(0, this.landingSquash - dt * 4.0);
    }

    // 1. Intro sequence
    if (this.introPhase !== 'landed') {
      this.introTime += dt;
      const targetH = window.innerHeight / 2;

      if (this.introPhase === 'waiting') {
        this.x = window.innerWidth / 2;
        this.y = -760 * K;
        this.heading = Math.PI / 2; // Straight down
        if (this.introTime >= 3.0) {
          this.introPhase = 'dropping';
          this.introTime = 0;
        }
      } else if (this.introPhase === 'dropping') {
        const dropDur = 2.3;
        const v = Math.min(1, this.introTime / dropDur);
        const ease = 1 - Math.pow(1 - v, 2.4);
        this.y = (-760 * K) + (targetH - (-760 * K)) * ease;

        if (v >= 1) {
          this.introPhase = 'bouncing';
          this.introTime = 0;
        }
      } else if (this.introPhase === 'bouncing') {
        const v = this.introTime;
        const bounce = 14 * Math.exp(-3.2 * v) * Math.sin(6.5 * v);
        const sway = Math.sin(1.8 * v) * 8 * Math.exp(-0.5 * v);
        this.y = targetH + bounce * 5;
        this.x = window.innerWidth / 2 + sway * 5;
        this.heading = Math.PI / 2 + Math.sin(v * 4) * 0.05 * Math.exp(-0.8 * v);

        if (this.introTime >= 1.3) {
          this.introPhase = 'landed';
          this.landingSquash = 1.0;
          this.onLand?.(this.x, this.y, 2.0);
          this.plantAllFeet();
        }
      }
      return;
    }

    // 2. Jump Motion
    if (this.isJumping) {
      this.jumpTime += dt;
      const t = Math.min(1, this.jumpTime / this.jumpDuration);

      // Ease-in-out quad
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      this.x = this.jumpStartX + (this.jumpTargetX - this.jumpStartX) * ease;
      this.y = this.jumpStartY + (this.jumpTargetY - this.jumpStartY) * ease;

      // Arc height
      this.currentHeight = Math.sin(Math.PI * t) * this.jumpHeight;

      if (t >= 1) {
        this.isJumping = false;
        this.currentHeight = 0;
        this.landingSquash = 1.0;
        this.plantAllFeet();
        this.onLand?.(this.x, this.y, 3.0);
      }
      return;
    }

    // 3. Normal Walk Following
    const gap = hasFly ? 560 * K : 330 * K;
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const dist = Math.hypot(dx, dy);

    // Wake check: if moving pointer while sleep > 0.6, startled hop!
    if (isPointerMoving && this.sleep > 0.6) {
      this.sleep = 0;
      this.qt = 0;
      this.restTime = 0;
      this.isJumping = true;
      this.jumpTime = 0;
      this.jumpDuration = 0.3;
      this.jumpStartX = this.x;
      this.jumpStartY = this.y;
      this.jumpTargetX = this.x + (Math.random() - 0.5) * 40;
      this.jumpTargetY = this.y + (Math.random() - 0.5) * 40;
      this.jumpHeight = 26;
      this.onWakeHop?.(this.x, this.y);
      return;
    }

    const prevX = this.x;
    const prevY = this.y;
    const prevHeading = this.heading;

    if (dist > gap + 10) {
      // Move towards target
      const targetSpeed = Math.min(760, (dist - gap) * 4);
      this.speed += (targetSpeed - this.speed) * (1 - Math.exp(-10 * dt));

      // Turn towards target
      const targetHeading = Math.atan2(dy, dx);
      let diff = targetHeading - this.heading;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.heading += diff * (1 - Math.exp(-8 * dt));

      this.x += Math.cos(this.heading) * this.speed * dt;
      this.y += Math.sin(this.heading) * this.speed * dt;

      // Clamp 10px inside canvas
      this.x = Math.max(10, Math.min(window.innerWidth - 10, this.x));
      this.y = Math.max(10, Math.min(window.innerHeight - 10, this.y));

      this.restTime = 0;
    } else {
      this.speed *= Math.exp(-12 * dt);
      this.restTime += dt;
    }

    this.vx = (this.x - prevX) / Math.max(0.001, dt);
    this.vy = (this.y - prevY) / Math.max(0.001, dt);
    this.angularVelocity = (this.heading - prevHeading) / Math.max(0.001, dt);

    // Body sway: z = clamp(-angularVelocity * 0.08, -0.35, 0.35)
    const targetSway = Math.max(-0.35, Math.min(0.35, -this.angularVelocity * 0.08));
    this.bodySway += (targetSway - this.bodySway) * (1 - Math.exp(-6 * dt));

    // 4. Feet stepping & Inverse Kinematics
    this.updateFeet(dt);

    // 5. Rest & Sleep Ramping
    let allFeetPlanted = true;
    for (const leg of this.legs) {
      if (leg.isStepping) {
        allFeetPlanted = false;
        break;
      }
    }

    if (this.restTime > 0.25 && !this.isJumping && this.speed < 25 && allFeetPlanted) {
      this.qt = Math.min(1, this.qt + dt * 3.2);
    } else {
      this.qt = Math.max(0, this.qt - dt * 6.0);
    }

    if (this.restTime > 8.0) {
      this.sleep = Math.min(1, this.sleep + dt / 1.6);
    } else {
      this.sleep = Math.max(0, this.sleep - dt * 3.0);
    }

    // Blinking logic when rest face is up
    if (this.qt > 0.5) {
      this.blinkTimer += dt;
      if (this.blinkTimer >= this.nextBlinkTime) {
        this.blinkPhase += dt / 0.2; // 0.2s blink
        if (this.blinkPhase >= 1.0) {
          this.blinkPhase = 0;
          this.blinkTimer = 0;
          this.nextBlinkTime = 3.0 + Math.random() * 2.0; // Every 3-5s
        }
      }
    } else {
      this.blinkTimer = 0;
      this.blinkPhase = 0;
      this.nextBlinkTime = 1.5;
    }

    // Sleep 'z' particle drift
    if (this.sleep > 0.5) {
      for (const zp of this.zParticles) {
        zp.c = (zp.c + dt * 0.5) % 1.0;
      }
    }
  }

  private plantAllFeet() {
    const cosH = Math.cos(this.heading);
    const sinH = Math.sin(this.heading);
    const K = this.K;

    for (const leg of this.legs) {
      leg.isStepping = false;
      leg.stepProgress = 1.0;
      const wx = this.x + (leg.restFoot.x * cosH - leg.restFoot.y * sinH) * K;
      const wy = this.y + (leg.restFoot.x * sinH + leg.restFoot.y * cosH) * K;
      leg.footX = wx;
      leg.footY = wy;
    }
  }

  private updateFeet(dt: number) {
    const cosH = Math.cos(this.heading);
    const sinH = Math.sin(this.heading);
    const K = this.K;

    // Check if other group is mid-step
    const group0Stepping = this.legs.some(l => l.gaitGroup === 0 && l.isStepping);
    const group1Stepping = this.legs.some(l => l.gaitGroup === 1 && l.isStepping);

    for (const leg of this.legs) {
      // World position of hip
      const hipWx = this.x + (leg.hip.x * cosH - leg.hip.y * sinH) * K;
      const hipWy = this.y + (leg.hip.x * sinH + leg.hip.y * cosH) * K;

      // Ideal foot target (sleep tucks reach to 62%)
      const sleepReachScale = 1.0 - 0.38 * this.sleep;
      const targetRestX = leg.restFoot.x * sleepReachScale;
      const targetRestY = leg.restFoot.y * sleepReachScale;

      const targetWx = this.x + (targetRestX * cosH - targetRestY * sinH) * K + this.vx * 0.09;
      const targetWy = this.y + (targetRestX * sinH + targetRestY * cosH) * K + this.vy * 0.09;

      const distToTarget = Math.hypot(leg.footX - targetWx, leg.footY - targetWy);
      const isFrontLeg = leg.index === 0;
      const triggerBase = isFrontLeg ? 91 * K : 130 * K;
      const stepTrigger = this.speed < 20 ? triggerBase * 0.3 : triggerBase;

      // Check overextension or front foot falling behind hip
      const currentReach = Math.hypot(leg.footX - hipWx, leg.footY - hipWy);
      const isOverextended = currentReach > (leg.reach * K * 0.98);
      const frontFootBehind = isFrontLeg && ((leg.footX - hipWx) * cosH + (leg.footY - hipWy) * sinH < 0);

      const otherGroupStepping = leg.gaitGroup === 0 ? group1Stepping : group0Stepping;

      if (!leg.isStepping) {
        const canStep = !otherGroupStepping || isOverextended || distToTarget > triggerBase * 1.6;
        if ((distToTarget > stepTrigger || isOverextended || frontFootBehind) && canStep) {
          leg.isStepping = true;
          leg.stepProgress = 0;
          leg.stepStartX = leg.footX;
          leg.stepStartY = leg.footY;
          leg.stepTargetX = targetWx;
          leg.stepTargetY = targetWy;
          // Step duration: clamp(0.15 - speed / 3200, 0.055, 0.15)
          leg.stepDuration = Math.max(0.055, Math.min(0.15, 0.15 - this.speed / 3200));
        }
      }

      if (leg.isStepping) {
        leg.stepProgress += dt / leg.stepDuration;
        if (leg.stepProgress >= 1.0) {
          leg.stepProgress = 1.0;
          leg.isStepping = false;
          leg.footX = leg.stepTargetX;
          leg.footY = leg.stepTargetY;
          this.onFootfall?.(leg.footX, leg.footY);
        } else {
          // Cubic ease-out
          const t = leg.stepProgress;
          const ease = 1 - Math.pow(1 - t, 3);
          leg.footX = leg.stepStartX + (leg.stepTargetX - leg.stepStartX) * ease;
          leg.footY = leg.stepStartY + (leg.stepTargetY - leg.stepStartY) * ease;
        }
      }
    }
  }

  // Draw spider to an offscreen buffer, then composite with shadow
  draw(ctx: CanvasRenderingContext2D) {
    if (this.introPhase === 'waiting') return;

    const K = this.K;
    const h = this.currentHeight;
    const spiderScale = (1 + h / 260) * (1 - 0.03 * this.sleep);

    // Prepare offscreen buffer
    const bufW = 600;
    const bufH = 600;
    this.spiderCanvas.width = bufW;
    this.spiderCanvas.height = bufH;
    const sCtx = this.spiderCtx;
    sCtx.clearRect(0, 0, bufW, bufH);

    sCtx.save();
    sCtx.translate(bufW / 2, bufH / 2);
    sCtx.scale(spiderScale, spiderScale);

    // Draw Legs (Back to front)
    this.drawSpiderLegs(sCtx, bufW / 2, bufH / 2);

    // Draw Abdomen (with breathing and landing squash)
    this.drawAbdomen(sCtx);

    // Draw Head (Photo head crossfaded with cute idle head and eyelid blinks)
    this.drawHead(sCtx);

    sCtx.restore();

    // Composite offscreen spider to main canvas with dynamic shadow
    ctx.save();
    const shadowAlpha = 0.42 - Math.min(0.24, h / 500);
    const shadowBlur = 7 + 0.14 * h;
    const shadowOffsetX = 5 + 0.35 * h;
    const shadowOffsetY = 9 + 0.6 * h;

    ctx.shadowColor = `rgba(0, 0, 0, ${shadowAlpha})`;
    ctx.shadowBlur = shadowBlur;
    ctx.shadowOffsetX = shadowOffsetX;
    ctx.shadowOffsetY = shadowOffsetY;

    if (this.spiderCanvas.width > 0 && this.spiderCanvas.height > 0 && ctx.canvas.width > 0 && ctx.canvas.height > 0) {
      ctx.drawImage(this.spiderCanvas, this.x - bufW / 2, this.y - bufH / 2);
    }
    ctx.restore();

    // Draw Sleep 'z' letters
    if (this.sleep > 0.2) {
      this.drawSleepZ(ctx);
    }
  }

  private drawSpiderLegs(sCtx: CanvasRenderingContext2D, cx: number, cy: number) {
    const K = this.K;
    const cosH = Math.cos(this.heading);
    const sinH = Math.sin(this.heading);

    // Draw back-to-front (legs index 3 down to 0)
    for (let idx = 3; idx >= 0; idx--) {
      const legsForIdx = this.legs.filter(l => l.index === idx);
      for (const leg of legsForIdx) {
        // Hip in offscreen local space
        const hipLx = (leg.hip.x * cosH - leg.hip.y * sinH) * K;
        const hipLy = (leg.hip.x * sinH + leg.hip.y * cosH) * K;

        // Foot in offscreen local space
        let footLx = leg.footX - this.x;
        let footLy = leg.footY - this.y;

        // Foot lift when stepping
        let lift = 0;
        let kneeLift = 0;
        if (leg.isStepping) {
          const stepT = leg.stepProgress;
          lift = Math.sin(Math.PI * stepT) * 20 * K;
          kneeLift = Math.sin(Math.PI * stepT) * (leg.index === 0 ? 12 : 26) * K;
        }

        // Two-bone Law of Cosines IK
        const dx = footLx - hipLx;
        const dy = footLy - hipLy;
        const d = Math.hypot(dx, dy);
        const a = leg.a * K;
        const b = leg.b * K;

        const clampedD = Math.min(a + b - 0.01, Math.max(Math.abs(a - b) + 0.01, d));
        const alpha = Math.atan2(dy, dx);
        const cosAngle = (a * a + clampedD * clampedD - b * b) / (2 * a * clampedD);
        const angleOffset = Math.acos(Math.max(-1, Math.min(1, cosAngle)));

        // Knee bends outward: right side vs left side
        const sideSign = leg.isRight ? 1 : -1;
        const kneeAngle = alpha + sideSign * angleOffset;

        let kneeLx = hipLx + Math.cos(kneeAngle) * a;
        let kneeLy = hipLy + Math.sin(kneeAngle) * a;

        // Lift knee outward
        kneeLx += Math.cos(kneeAngle) * kneeLift;
        kneeLy += Math.sin(kneeAngle) * kneeLift;

        // Draw femur segment
        sCtx.save();
        sCtx.lineCap = 'round';
        sCtx.lineJoin = 'round';
        sCtx.strokeStyle = '#3e2415';
        sCtx.lineWidth = 14 * K * 4.5;
        sCtx.beginPath();
        sCtx.moveTo(hipLx, hipLy);
        sCtx.lineTo(kneeLx, kneeLy);
        sCtx.stroke();

        // Inner lighter band
        sCtx.strokeStyle = '#b89065';
        sCtx.lineWidth = 8 * K * 4.5;
        sCtx.stroke();

        // White furry knee puff
        sCtx.fillStyle = '#f6edd9';
        sCtx.beginPath();
        sCtx.arc(kneeLx, kneeLy, 4.5 * K * 4.5, 0, Math.PI * 2);
        sCtx.fill();

        // Draw tibia segment
        sCtx.strokeStyle = '#3e2415';
        sCtx.lineWidth = 12 * K * 4.5;
        sCtx.beginPath();
        sCtx.moveTo(kneeLx, kneeLy);
        sCtx.lineTo(footLx, footLy - lift);
        sCtx.stroke();

        sCtx.strokeStyle = '#9e7349';
        sCtx.lineWidth = 6 * K * 4.5;
        sCtx.stroke();

        // Dark claw foot
        sCtx.fillStyle = '#160a04';
        sCtx.beginPath();
        sCtx.arc(footLx, footLy - lift, 3 * K * 4.5, 0, Math.PI * 2);
        sCtx.fill();

        sCtx.restore();
      }
    }
  }

  private drawAbdomen(sCtx: CanvasRenderingContext2D) {
    const K = this.K;
    const cosH = Math.cos(this.heading);
    const sinH = Math.sin(this.heading);

    // Abdomen breathing scale: 1 + sin(phase) * (0.025 + 0.03 * sleep)
    const breath = 1 + Math.sin(this.breathPhase) * (0.025 + 0.03 * this.sleep);
    // Landing squash: (2 - y, y) with y = 1 - 0.1 * lt
    const sqY = 1 - 0.1 * this.landingSquash;
    const sqX = 2 - sqY;

    sCtx.save();
    // Rotate abdomen with bodySway about waist (waist at (627, 548) in sprite = (-52, 0) in body space)
    sCtx.rotate(this.heading);
    sCtx.translate(-52 * K, 0);
    sCtx.rotate(this.bodySway);
    sCtx.translate(52 * K, 0);

    // Center of abdomen in body space: (345 - 600, 0) = (-255, 0)
    sCtx.translate(-255 * K, 0);
    sCtx.scale(sqX * breath, sqY * breath);

    const s = 560 / 1254;
    const imgW = 560;
    const imgH = 560;

    // Draw masked abdomen layer
    if (this.abdomenMaskCanvas.width > 0 && this.abdomenMaskCanvas.height > 0) {
      sCtx.drawImage(
        this.abdomenMaskCanvas,
        -imgW * s * K * 2.2,
        -imgH * s * K * 2.2,
        imgW * s * K * 4.4,
        imgH * s * K * 4.4
      );
    }

    sCtx.restore();
  }

  private drawHead(sCtx: CanvasRenderingContext2D) {
    const K = this.K;

    sCtx.save();
    sCtx.rotate(this.heading);
    // Head center in body space: (680 - 600, 0) = (80, 0)
    sCtx.translate(80 * K, 0);

    const s = 560 / 1254;
    const imgW = 560;
    const imgH = 560;

    // 1. Photo Head Layer (fades to 15% when qt ramps up)
    if (this.headMaskCanvas.width > 0 && this.headMaskCanvas.height > 0) {
      sCtx.save();
      sCtx.globalAlpha = 1.0 - 0.85 * this.qt;
      sCtx.drawImage(
        this.headMaskCanvas,
        -imgW * s * K * 2.2,
        -imgH * s * K * 2.2,
        imgW * s * K * 4.4,
        imgH * s * K * 4.4
      );
      sCtx.restore();
    }

    // 2. Cute Idle Head Layer (fades in on top)
    if (this.qt > 0.01 && this.idleHeadTexture.width > 0 && this.idleHeadTexture.height > 0) {
      sCtx.save();
      sCtx.globalAlpha = this.qt;
      const idleSize = 308 * K * 1.5;
      sCtx.drawImage(this.idleHeadTexture, -idleSize / 2, -idleSize / 2, idleSize, idleSize);

      // Eyelid Blinking
      const eyelidClosure = Math.max(this.sleep > 0.5 ? 1.0 : 0, Math.sin(Math.PI * this.blinkPhase));
      if (eyelidClosure > 0.02) {
        this.drawEyelids(sCtx, eyelidClosure, idleSize);
      }
      sCtx.restore();
    }

    sCtx.restore();
  }

  private drawEyelids(sCtx: CanvasRenderingContext2D, closure: number, idleSize: number) {
    // 6 Eyes in 308 sprite space:
    // [139,158,12.5], [170,158,12.5], [117,150,7.5], [192,150,7.5], [112,136,4], [197,136,4]
    const eyes = [
      [139, 158, 12.5],
      [170, 158, 12.5],
      [117, 150, 7.5],
      [192, 150, 7.5],
      [112, 136, 4],
      [197, 136, 4]
    ];

    const toLocalX = (x: number) => (x - 154) * (idleSize / 308);
    const toLocalY = (y: number) => (y - 154) * (idleSize / 308);

    eyes.forEach(([ex, ey, er]) => {
      const lx = toLocalX(ex);
      const ly = toLocalY(ey);
      const lr = er * (idleSize / 308);

      sCtx.save();
      // Clip inside eye circle
      sCtx.beginPath();
      sCtx.arc(lx, ly, lr + 0.5, 0, Math.PI * 2);
      sCtx.clip();

      // Sweeping eyelid filled with darkened skin colour (#6b4528)
      sCtx.fillStyle = '#6b4528';
      const lidY = ly - lr + (lr * 2.2) * closure;
      sCtx.beginPath();
      sCtx.rect(lx - lr - 2, ly - lr - 2, (lr + 2) * 2, (lidY - (ly - lr)));
      sCtx.fill();

      // Lid line: rgba(40, 22, 12, 0.7)
      sCtx.strokeStyle = 'rgba(40, 22, 12, 0.7)';
      sCtx.lineWidth = 1.2;
      sCtx.beginPath();
      sCtx.arc(lx, lidY, lr * 0.9, 0, Math.PI);
      sCtx.stroke();

      sCtx.restore();
    });
  }

  private drawSleepZ(ctx: CanvasRenderingContext2D) {
    const cosH = Math.cos(this.heading);
    const sinH = Math.sin(this.heading);
    // Drift from body point (260, -170)
    const startBx = 260 * this.K;
    const startBy = -170 * this.K;

    const startWx = this.x + (startBx * cosH - startBy * sinH);
    const startWy = this.y + (startBx * sinH + startBy * cosH);

    for (const zp of this.zParticles) {
      const c = zp.c;
      const alpha = Math.sin(Math.PI * c) * this.sleep;
      if (alpha <= 0.01) continue;

      const zSize = (12 + 14 * c) * this.scale;
      const driftX = c * 40;
      const driftY = -c * 70; // Rising 70px

      ctx.save();
      ctx.font = `700 ${zSize}px system-ui, sans-serif`;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.fillText('z', startWx + driftX, startWy + driftY);
      ctx.restore();
    }
  }
}
