// Silk Simulation, Verlet Ropes, Dew Drops, and Masked Shadows

export interface Point2D {
  x: number;
  y: number;
}

export interface VerletPoint {
  x: number;
  y: number;
  oldX: number;
  oldY: number;
  pinned: boolean;
}

export interface DewDrop {
  segmentIndex: number;
  u: number; // 0 to 1 along segment or thread
  du: number; // sliding velocity
  radius: number;
  isSliding: boolean;
}

export interface FallingDrop {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  startY: number;
}

export interface Splat {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  fallingSpeed?: number;
}

export interface FluffClump {
  t: number; // position 0 to 1
  isFibres: boolean; // true = cream fibres, false = dust dots
  seed: number;
}

export interface SilkThread {
  points: VerletPoint[];
  restLength: number;
  thickness: number;
  age: number; // in seconds
  phase: number;
  glintPos: number; // 0 to 1
  drops: DewDrop[];
  fluffs: FluffClump[];
  startAnchor: Point2D;
  endAnchor: Point2D;
  isLive: boolean;
  alphaMultiplier: number;
}

export class SilkManager {
  threads: SilkThread[] = [];
  liveThread: SilkThread | null = null;
  fallingDrops: FallingDrop[] = [];
  splats: Splat[] = [];
  anchorPoints: Point2D[] = [];
  
  // Mask Canvas for anchor silhouettes
  silhouetteCanvas: HTMLCanvasElement;
  silhouetteCtx: CanvasRenderingContext2D;
  shadowCanvas: HTMLCanvasElement;
  shadowCtx: CanvasRenderingContext2D;
  dewDropSprite: HTMLCanvasElement;

  timeElapsed = 0;
  width = window.innerWidth;
  height = window.innerHeight;
  isClearing = false;

  constructor(dewDropSprite: HTMLCanvasElement) {
    this.dewDropSprite = dewDropSprite;
    this.silhouetteCanvas = document.createElement('canvas');
    this.silhouetteCtx = this.silhouetteCanvas.getContext('2d')!;
    this.shadowCanvas = document.createElement('canvas');
    this.shadowCtx = this.shadowCanvas.getContext('2d')!;
    this.resize(window.innerWidth, window.innerHeight);
  }

  resize(w: number, h: number) {
    const validW = Math.max(1, Math.floor(w || window.innerWidth || 1));
    const validH = Math.max(1, Math.floor(h || window.innerHeight || 1));
    this.width = validW;
    this.height = validH;
    this.silhouetteCanvas.width = validW;
    this.silhouetteCanvas.height = validH;
    this.shadowCanvas.width = validW;
    this.shadowCanvas.height = validH;
    this.sampleAnchors();
  }

  // Sample outline anchor points every 7px along all [data-web-anchor] elements
  sampleAnchors() {
    this.anchorPoints = [];
    const sCtx = this.silhouetteCtx;
    sCtx.clearRect(0, 0, this.width, this.height);
    sCtx.fillStyle = '#ffffff';

    const anchors = document.querySelectorAll<HTMLElement>('[data-web-anchor]');
    anchors.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      // Draw onto silhouette mask
      const computed = window.getComputedStyle(el);
      const radius = parseFloat(computed.borderRadius) || 0;

      sCtx.save();
      sCtx.beginPath();
      if (radius > 0) {
        sCtx.roundRect(rect.left, rect.top, rect.width, rect.height, radius);
      } else {
        sCtx.rect(rect.left, rect.top, rect.width, rect.height);
      }
      sCtx.fill();
      sCtx.restore();

      // Perimeter sample points every 7px
      const step = 7;
      // Top and bottom edges
      for (let x = rect.left; x <= rect.right; x += step) {
        this.anchorPoints.push({ x, y: rect.top });
        this.anchorPoints.push({ x, y: rect.bottom });
      }
      // Left and right edges
      for (let y = rect.top; y <= rect.bottom; y += step) {
        this.anchorPoints.push({ x: rect.left, y });
        this.anchorPoints.push({ x: rect.right, y });
      }
    });

    // If no anchors found, drop a point every 120px
    if (this.anchorPoints.length === 0) {
      for (let x = 60; x < this.width; x += 120) {
        for (let y = 60; y < this.height; y += 120) {
          this.anchorPoints.push({ x, y });
        }
      }
    }
  }

  startLiveThread(startPt: Point2D, endPt: Point2D) {
    const thread = this.createThread(startPt, endPt, 1.25, true);
    this.liveThread = thread;
  }

  createThread(p1: Point2D, p2: Point2D, thickness = 1.0, isLive = false): SilkThread {
    const points: VerletPoint[] = [];
    const segments = 12; // 12 segments = 13 points
    const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const sag = 1.01 + Math.random() * 0.005; // 1.01 - 1.015
    const restLength = (dist / segments) * sag;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = p1.x + (p2.x - p1.x) * t;
      const y = p1.y + (p2.y - p1.y) * t;
      points.push({
        x,
        y,
        oldX: x,
        oldY: y,
        pinned: i === 0 || (!isLive && i === segments)
      });
    }

    // Dew drops: floor(length / 55 * (0.4 + rand))
    const dropCount = Math.floor((dist / 55) * (0.4 + Math.random() * 0.6));
    const drops: DewDrop[] = [];
    for (let d = 0; d < dropCount; d++) {
      drops.push({
        segmentIndex: Math.floor(Math.random() * segments),
        u: Math.random(),
        du: 0,
        radius: 1.6 + Math.random() * 4.6, // 1.6 to 6.2
        isSliding: false
      });
    }

    // Fluff clumps (40% probability)
    const fluffs: FluffClump[] = [];
    if (Math.random() < 0.4) {
      const clumpCount = 1 + Math.floor(Math.random() * 2);
      for (let c = 0; c < clumpCount; c++) {
        fluffs.push({
          t: 0.15 + Math.random() * 0.7,
          isFibres: Math.random() < 0.5,
          seed: Math.random() * 100
        });
      }
    }

    return {
      points,
      restLength,
      thickness,
      age: 0,
      phase: Math.random() * Math.PI * 2,
      glintPos: Math.random(),
      drops,
      fluffs,
      startAnchor: { x: p1.x, y: p1.y },
      endAnchor: { x: p2.x, y: p2.y },
      isLive,
      alphaMultiplier: 1.0
    };
  }

  // Check attaching when spider spinneret is near an anchor
  checkAttaching(spinneret: Point2D) {
    if (!this.liveThread) return;

    const startPt = this.liveThread.startAnchor;
    const distFromStart = Math.hypot(spinneret.x - startPt.x, spinneret.y - startPt.y);

    if (distFromStart < 54) return; // Must be > 54px from start

    // Find nearest anchor within 70px
    let nearestAnchor: Point2D | null = null;
    let minDist = 70;

    for (const anchor of this.anchorPoints) {
      const d = Math.hypot(anchor.x - spinneret.x, anchor.y - spinneret.y);
      if (d < minDist) {
        minDist = d;
        nearestAnchor = anchor;
      }
    }

    if (nearestAnchor && distFromStart >= 30) {
      this.attachThreadAt(nearestAnchor, spinneret);
    }
  }

  private attachThreadAt(anchor: Point2D, spinneret: Point2D) {
    if (!this.liveThread) return;

    // 1. Pin live thread at anchor
    const lastPt = this.liveThread.points[this.liveThread.points.length - 1];
    lastPt.x = anchor.x;
    lastPt.y = anchor.y;
    lastPt.oldX = anchor.x;
    lastPt.oldY = anchor.y;
    lastPt.pinned = true;
    this.liveThread.endAnchor = { x: anchor.x, y: anchor.y };
    this.liveThread.isLive = false;
    this.threads.push(this.liveThread);

    // 2. Radial thread (thickness 0.7) to nearest earlier anchor within 288px
    let nearestEarlier: Point2D | null = null;
    let minRadialDist = 288;
    for (const t of this.threads) {
      const d1 = Math.hypot(t.startAnchor.x - anchor.x, t.startAnchor.y - anchor.y);
      if (d1 > 20 && d1 < minRadialDist) {
        minRadialDist = d1;
        nearestEarlier = t.startAnchor;
      }
    }
    if (nearestEarlier) {
      this.threads.push(this.createThread(anchor, nearestEarlier, 0.7));
    }

    // 3. 75% probability: another thread (thickness 0.85) to nearest outline point within 204px (not within 45px)
    if (Math.random() < 0.75) {
      let secAnchor: Point2D | null = null;
      let minSecDist = 204;
      for (const a of this.anchorPoints) {
        const d = Math.hypot(a.x - anchor.x, a.y - anchor.y);
        if (d > 45 && d < minSecDist) {
          minSecDist = d;
          secAnchor = a;
        }
      }
      if (secAnchor) {
        this.threads.push(this.createThread(anchor, secAnchor, 0.85));
      }
    }

    // 4. Vibrate web in 60px radius at strength 1.2
    this.vibrate(anchor.x, anchor.y, 60, 1.2);

    // 5. Start fresh live thread from this anchor to current spinneret
    this.startLiveThread(anchor, spinneret);
  }

  vibrate(x: number, y: number, radius: number, strength: number) {
    const all = [...this.threads];
    if (this.liveThread) all.push(this.liveThread);

    for (const thread of all) {
      for (const p of thread.points) {
        if (p.pinned) continue;
        const d = Math.hypot(p.x - x, p.y - y);
        if (d < radius) {
          const factor = (1 - d / radius) * strength;
          p.x += (Math.random() - 0.5) * factor * 14;
          p.y += (Math.random() - 0.5) * factor * 14;
        }
      }

      // 35% chance dew drops start sliding on shaken thread
      for (const drop of thread.drops) {
        if (Math.random() < 0.35) {
          drop.isSliding = true;
          drop.du = (Math.random() - 0.5) * 4;
        }
      }
    }
  }

  clearWeb() {
    this.isClearing = true;
    // Every dew drop falls
    for (const thread of this.threads) {
      for (let i = 0; i < thread.points.length; i++) {
        const p = thread.points[i];
        if (Math.random() < 0.5) {
          this.fallingDrops.push({
            x: p.x,
            y: p.y,
            vx: (Math.random() - 0.5) * 80,
            vy: 20 + Math.random() * 80,
            radius: 2 + Math.random() * 3.5,
            startY: p.y
          });
        }
      }
      thread.drops = [];
    }

    // Splats drop off-screen
    this.splats.forEach(s => {
      s.fallingSpeed = 200 + Math.random() * 300;
    });

    // Web shakes hard
    this.vibrate(this.width / 2, this.height / 2, Math.max(this.width, this.height), 4.0);
  }

  update(dt: number, spinneret: Point2D, pointerX: number, pointerY: number) {
    this.timeElapsed += dt;
    const B = this.timeElapsed;

    // Update live thread head to spinneret
    if (this.liveThread) {
      const lastPt = this.liveThread.points[this.liveThread.points.length - 1];
      lastPt.x = spinneret.x;
      lastPt.y = spinneret.y;
      this.checkAttaching(spinneret);
    }

    // Clearing animation
    if (this.isClearing) {
      for (let i = this.threads.length - 1; i >= 0; i--) {
        const t = this.threads[i];
        t.alphaMultiplier -= 2.6 * dt;
        if (t.alphaMultiplier <= 0) {
          this.threads.splice(i, 1);
        }
      }
      if (this.threads.length === 0) {
        this.isClearing = false;
        // Start fresh live thread from spinneret
        this.startLiveThread(spinneret, spinneret);
      }
    }

    const allThreads = [...this.threads];
    if (this.liveThread) allThreads.push(this.liveThread);

    // Verlet Physics & Constraints
    for (const thread of allThreads) {
      thread.age += dt;
      thread.glintPos = (thread.glintPos + 0.6 * dt) % 1.0;

      // Gravity: 110 * dt^2
      const grav = 110 * dt * dt;

      // Wind: (sin(0.45B)*0.6 + sin(1.3B + 1.7)*0.4) * (0.6 + 0.4*sin(1.1B + 0.012y + phase)) * 22 * dt^2
      const pts = thread.points;
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        if (p.pinned) continue;

        const vx = (p.x - p.oldX) * 0.975; // Damping 0.975
        const vy = (p.y - p.oldY) * 0.975;
        p.oldX = p.x;
        p.oldY = p.y;

        const windFactor = (Math.sin(0.45 * B) * 0.6 + Math.sin(1.3 * B + 1.7) * 0.4) *
                           (0.6 + 0.4 * Math.sin(1.1 * B + 0.012 * p.y + thread.phase)) *
                           22 * dt * dt;

        p.x += vx + windFactor;
        p.y += vy + grav;

        // Pointer pushes rope points within 36px
        const pdx = p.x - pointerX;
        const pdy = p.y - pointerY;
        const pdist = Math.hypot(pdx, pdy);
        if (pdist < 36 && pdist > 0.01) {
          const push = (36 - pdist) * 0.45;
          p.x += (pdx / pdist) * push;
          p.y += (pdy / pdist) * push;
        }
      }

      // 4 Constraint relaxation passes
      const segLength = thread.restLength;
      for (let pass = 0; pass < 4; pass++) {
        for (let i = 0; i < pts.length - 1; i++) {
          const p1 = pts[i];
          const p2 = pts[i + 1];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.hypot(dx, dy);
          if (dist === 0) continue;
          const diff = (dist - segLength) / dist;

          if (!p1.pinned && !p2.pinned) {
            p1.x += dx * 0.5 * diff;
            p1.y += dy * 0.5 * diff;
            p2.x -= dx * 0.5 * diff;
            p2.y -= dy * 0.5 * diff;
          } else if (!p1.pinned) {
            p1.x += dx * diff;
            p1.y += dy * diff;
          } else if (!p2.pinned) {
            p2.x -= dx * diff;
            p2.y -= dy * diff;
          }
        }
      }

      // Dew drops sliding & falling physics
      for (let d = thread.drops.length - 1; d >= 0; d--) {
        const drop = thread.drops[d];
        if (drop.segmentIndex >= pts.length - 1) {
          drop.segmentIndex = pts.length - 2;
        }
        const p1 = pts[drop.segmentIndex];
        const p2 = pts[drop.segmentIndex + 1];
        const slope = (p2.y - p1.y) / Math.max(1, Math.hypot(p2.x - p1.x, p2.y - p1.y));

        if (drop.isSliding) {
          drop.du += slope * 9 * dt;
          drop.du *= 0.95;
          drop.u += drop.du * dt;

          if (drop.u > 1.0) {
            if (drop.segmentIndex < pts.length - 2) {
              drop.segmentIndex++;
              drop.u = 0;
            } else {
              // Reached end: falls off!
              this.dropFalls(p2.x, p2.y, drop.radius);
              thread.drops.splice(d, 1);
              continue;
            }
          } else if (drop.u < 0) {
            if (drop.segmentIndex > 0) {
              drop.segmentIndex--;
              drop.u = 1.0;
            } else {
              this.dropFalls(p1.x, p1.y, drop.radius);
              thread.drops.splice(d, 1);
              continue;
            }
          }

          // Fall off if steep or big
          if (Math.abs(slope) > 0.88 || (drop.radius > 4.5 && Math.random() < 0.02)) {
            const dropX = p1.x + (p2.x - p1.x) * drop.u;
            const dropY = p1.y + (p2.y - p1.y) * drop.u;
            this.dropFalls(dropX, dropY, drop.radius);
            thread.drops.splice(d, 1);
          }
        }
      }
    }

    // Update Falling Drops (gravity 1100)
    for (let i = this.fallingDrops.length - 1; i >= 0; i--) {
      const fd = this.fallingDrops[i];
      fd.vy += 1100 * dt;
      fd.x += fd.vx * dt;
      fd.y += fd.vy * dt;

      // Check collision with silhouette canvas (objects & letters)
      if (fd.y - fd.startY > 10 && fd.x >= 0 && fd.x < this.width && fd.y >= 0 && fd.y < this.height) {
        const pixel = this.silhouetteCtx.getImageData(Math.floor(fd.x), Math.floor(fd.y), 1, 1).data;
        if (pixel[3] > 120) {
          // Splat on object/letter!
          if (this.splats.length < 400) {
            this.splats.push({
              x: fd.x,
              y: fd.y,
              radius: fd.radius * 1.5,
              alpha: 0.85
            });
          }
          this.fallingDrops.splice(i, 1);
          continue;
        }
      }

      if (fd.y > this.height + 50) {
        this.fallingDrops.splice(i, 1);
      }
    }

    // Update Splats
    for (let i = this.splats.length - 1; i >= 0; i--) {
      const sp = this.splats[i];
      if (sp.fallingSpeed) {
        sp.y += sp.fallingSpeed * dt;
        if (sp.y > this.height + 100) {
          this.splats.splice(i, 1);
        }
      }
    }
  }

  private dropFalls(x: number, y: number, radius: number) {
    this.fallingDrops.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 40,
      vy: 30 + Math.random() * 50,
      radius,
      startY: y
    });
  }

  // Draw Shadows (Masked so shadows fall ONLY on objects and letters)
  drawShadows(mainCtx: CanvasRenderingContext2D) {
    if (this.width <= 0 || this.height <= 0) return;
    if (this.silhouetteCanvas.width <= 0 || this.silhouetteCanvas.height <= 0) return;
    if (this.shadowCanvas.width <= 0 || this.shadowCanvas.height <= 0) return;
    if (mainCtx.canvas.width <= 0 || mainCtx.canvas.height <= 0) return;

    const sCtx = this.shadowCtx;
    sCtx.clearRect(0, 0, this.width, this.height);

    // Draw all threads and drops in solid black with shadow on shadowCanvas
    sCtx.save();
    sCtx.shadowColor = 'rgba(8, 14, 70, 0.42)';
    sCtx.shadowBlur = 3.5;
    sCtx.shadowOffsetX = 7;
    sCtx.shadowOffsetY = 11;
    sCtx.strokeStyle = '#000000';
    sCtx.fillStyle = '#000000';

    const all = [...this.threads];
    if (this.liveThread) all.push(this.liveThread);

    for (const t of all) {
      const pts = t.points;
      if (pts.length < 2) continue;
      sCtx.lineWidth = t.thickness * 1.5;
      sCtx.beginPath();
      sCtx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        sCtx.lineTo(pts[i].x, pts[i].y);
      }
      sCtx.stroke();

      for (const d of t.drops) {
        const p1 = pts[d.segmentIndex];
        const p2 = pts[d.segmentIndex + 1];
        if (!p1 || !p2) continue;
        const dx = p1.x + (p2.x - p1.x) * d.u;
        const dy = p1.y + (p2.y - p1.y) * d.u;
        sCtx.beginPath();
        sCtx.arc(dx, dy, d.radius, 0, Math.PI * 2);
        sCtx.fill();
      }
    }
    sCtx.restore();

    // Mask shadowCanvas with silhouetteCanvas so shadows only appear over objects and letters
    sCtx.save();
    sCtx.globalCompositeOperation = 'destination-in';
    if (this.silhouetteCanvas.width > 0 && this.silhouetteCanvas.height > 0) {
      sCtx.drawImage(this.silhouetteCanvas, 0, 0);
    }
    sCtx.restore();

    // Composite masked shadows to main canvas
    if (this.shadowCanvas.width > 0 && this.shadowCanvas.height > 0) {
      mainCtx.drawImage(this.shadowCanvas, 0, 0);
    }
  }

  // Draw Threads, Splats, and Dew Drops
  drawThreadsAndDrops(ctx: CanvasRenderingContext2D) {
    if (ctx.canvas.width <= 0 || ctx.canvas.height <= 0) return;
    const hasDewDropSprite = this.dewDropSprite && this.dewDropSprite.width > 0 && this.dewDropSprite.height > 0;
    const B = this.timeElapsed;
    const all = [...this.threads];
    if (this.liveThread) all.push(this.liveThread);

    // 1. Draw Splats on objects
    if (hasDewDropSprite) {
      for (const sp of this.splats) {
        ctx.save();
        ctx.globalAlpha = sp.alpha * 0.7;
        ctx.translate(sp.x, sp.y);
        ctx.scale(1.4, 0.7); // Squashed bead
        ctx.drawImage(this.dewDropSprite, -sp.radius, -sp.radius, sp.radius * 2, sp.radius * 2);
        ctx.restore();
      }
    }

    // 2. Draw Threads
    for (const thread of all) {
      const pts = thread.points;
      if (pts.length < 2) continue;

      // Age fading: fades to 50% over 90s
      const ageFade = Math.max(0.5, 1.0 - (thread.age / 90) * 0.5);
      const alpha = 0.8 * ageFade * thread.alphaMultiplier;
      const thick = thread.thickness;

      // 1. Halo
      ctx.save();
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.06 * thread.alphaMultiplier})`;
      ctx.lineWidth = 4 * thick;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }
      ctx.stroke();
      ctx.restore();

      // 2. Main strand per segment
      for (let i = 0; i < pts.length - 1; i++) {
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const segWidth = thick * (0.9 - 0.35 * Math.sin((Math.PI * i) / 12));
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

        ctx.save();
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.75})`;
        ctx.lineWidth = segWidth;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // 3. Iridescent overlay
        const P = 0.5 + 0.5 * Math.sin(2 * angle + 0.3 * B + thread.phase);
        const iridHue = 190 + 150 * P;
        const iridAlpha = (0.12 + 0.3 * Math.pow(P, 3)) * thread.alphaMultiplier;
        ctx.strokeStyle = `hsla(${iridHue}, 100%, 74%, ${iridAlpha})`;
        ctx.lineWidth = segWidth * 0.85;
        ctx.stroke();

        // 4. Two wavy sub-fibres
        const perpX = -Math.sin(angle);
        const perpY = Math.cos(angle);
        ctx.lineWidth = 0.45;
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.38 * thread.alphaMultiplier})`;

        ctx.beginPath();
        ctx.moveTo(p1.x + perpX * 1.1 * thick, p1.y + perpY * 1.1 * thick);
        ctx.lineTo(p2.x + perpX * 0.9 * thick, p2.y + perpY * 0.9 * thick);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(p1.x - perpX * 0.9 * thick, p1.y - perpY * 0.9 * thick);
        ctx.lineTo(p2.x - perpX * 1.1 * thick, p2.y - perpY * 1.1 * thick);
        ctx.stroke();

        // 5. Micro-hairs (~3 per segment)
        ctx.lineWidth = 0.35;
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.55 * thread.alphaMultiplier})`;
        for (let h = 0; h < 3; h++) {
          const ht = (h + 0.5) / 3;
          const hx = p1.x + (p2.x - p1.x) * ht;
          const hy = p1.y + (p2.y - p1.y) * ht;
          const hLen = (0.5 + ((h * 7) % 2.2)) * thick;
          const hDir = h % 2 === 0 ? 1 : -1;
          ctx.beginPath();
          ctx.moveTo(hx, hy);
          ctx.lineTo(hx + perpX * hLen * hDir, hy + perpY * hLen * hDir);
          ctx.stroke();
        }

        ctx.restore();
      }

      // 6. Fluff clumps
      for (const fluff of thread.fluffs) {
        const segIdx = Math.floor(fluff.t * (pts.length - 1));
        const segT = (fluff.t * (pts.length - 1)) - segIdx;
        const p1 = pts[segIdx];
        const p2 = pts[segIdx + 1] || p1;
        const fx = p1.x + (p2.x - p1.x) * segT;
        const fy = p1.y + (p2.y - p1.y) * segT;

        ctx.save();
        if (fluff.isFibres) {
          // 10 curling cream fibres
          ctx.strokeStyle = `rgba(240, 232, 220, ${0.8 * thread.alphaMultiplier})`;
          ctx.lineWidth = 0.5;
          for (let f = 0; f < 10; f++) {
            const fa = ((f + fluff.seed) * 36 * Math.PI) / 180;
            const fr = 2.5 + ((f * 3) % 4);
            ctx.beginPath();
            ctx.moveTo(fx, fy);
            ctx.quadraticCurveTo(fx + Math.cos(fa) * fr * 1.5, fy + Math.sin(fa) * fr * 1.5, fx + Math.cos(fa + 0.5) * fr, fy + Math.sin(fa + 0.5) * fr);
            ctx.stroke();
          }
        } else {
          // 5 grey-brown dust dots
          ctx.fillStyle = '#8a7a6a';
          for (let d = 0; d < 5; d++) {
            const da = ((d + fluff.seed) * 72 * Math.PI) / 180;
            const dr = 1.5 + ((d * 2) % 3);
            ctx.beginPath();
            ctx.arc(fx + Math.cos(da) * dr, fy + Math.sin(da) * dr, 0.8, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      }

      // 7. Dew drops
      if (hasDewDropSprite) {
        for (const drop of thread.drops) {
          const p1 = pts[drop.segmentIndex];
          const p2 = pts[drop.segmentIndex + 1];
          if (!p1 || !p2) continue;
          const dx = p1.x + (p2.x - p1.x) * drop.u;
          const dy = p1.y + (p2.y - p1.y) * drop.u;

          ctx.save();
          ctx.globalAlpha = thread.alphaMultiplier;
          const r = drop.radius;
          ctx.drawImage(this.dewDropSprite, dx - r, dy - r, r * 2, r * 2);
          ctx.restore();
        }
      }

      // 8. White glint traveling at 0.6 / s
      const glintIdx = Math.floor(thread.glintPos * (pts.length - 1));
      const glintT = (thread.glintPos * (pts.length - 1)) - glintIdx;
      const gp1 = pts[glintIdx];
      const gp2 = pts[glintIdx + 1] || gp1;
      const gx = gp1.x + (gp2.x - gp1.x) * glintT;
      const gy = gp1.y + (gp2.y - gp1.y) * glintT;

      ctx.save();
      ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * thread.alphaMultiplier})`;
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(gx, gy, thick * 1.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Anchor point hair tufts & 3px bead
      [pts[0], pts[pts.length - 1]].forEach(apt => {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(apt.x, apt.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }

    // 3. Draw Falling Drops
    if (hasDewDropSprite) {
      for (const fd of this.fallingDrops) {
        ctx.save();
        const r = fd.radius;
        ctx.drawImage(this.dewDropSprite, fd.x - r, fd.y - r, r * 2, r * 2);
        ctx.restore();
      }
    }
  }
}
