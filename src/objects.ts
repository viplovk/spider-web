// Object physics reaction to spider movement and jumps

export interface ReactiveObject {
  el: HTMLElement;
  isBottomStick: boolean;
  angle: number;
  angularVelocity: number;
  offsetX: number;
  offsetY: number;
  velocityX: number;
  velocityY: number;
  rect: DOMRect;
  lastMoved: number;
}

export class ObjectPhysicsManager {
  private objects: ReactiveObject[] = [];
  private reanchorTimeout: number | null = null;
  private onNeedReanchor: (() => void) | null = null;

  constructor(onNeedReanchor?: () => void) {
    this.onNeedReanchor = onNeedReanchor || null;
  }

  init() {
    this.objects = [];
    const elements = document.querySelectorAll<HTMLElement>('.reactive-object');
    elements.forEach(el => {
      const isBottomStick = el.getAttribute('data-stick') === 'bottom';
      this.objects.push({
        el,
        isBottomStick,
        angle: 0,
        angularVelocity: 0,
        offsetX: 0,
        offsetY: 0,
        velocityX: 0,
        velocityY: 0,
        rect: el.getBoundingClientRect(),
        lastMoved: 0
      });
    });
  }

  updateRects() {
    this.objects.forEach(obj => {
      obj.rect = obj.el.getBoundingClientRect();
    });
  }

  update(
    dt: number,
    spiderX: number,
    spiderY: number,
    spiderVx: number,
    spiderVy: number,
    spiderSpeed: number,
    K: number
  ) {
    let anyMoving = false;
    const now = performance.now();

    for (const obj of this.objects) {
      const rect = obj.rect;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = cx - spiderX;
      const dy = cy - spiderY;
      const dist = Math.hypot(dx, dy);
      const reactRadius = 260 * K;

      // Interaction when spider walks nearby with speed > 40
      if (dist < reactRadius && spiderSpeed > 40) {
        const size = Math.max(rect.width, rect.height, 40);
        // cross(offset, velocity) = dx * spiderVy - dy * spiderVx
        const cross = (dx * spiderVy - dy * spiderVx);
        const torque = Math.max(-2.5, Math.min(2.5, cross / (size * size))) * 120 * dt;

        obj.angularVelocity += torque;

        if (!obj.isBottomStick) {
          obj.velocityX += 0.85 * spiderVx * dt;
          obj.velocityY += 0.85 * spiderVy * dt;
        }
        obj.lastMoved = now;
      }

      // Physics damping & spring back
      const damping = Math.exp(-2.8 * dt);
      obj.angularVelocity *= damping;
      obj.velocityX *= damping;
      obj.velocityY *= damping;

      // Angular spring back
      const maxAngle = obj.isBottomStick ? 8 : 24;
      const springMultiplier = obj.isBottomStick ? 20 : 8;

      if (Math.abs(obj.angle) > maxAngle) {
        const excess = obj.angle - Math.sign(obj.angle) * maxAngle;
        obj.angularVelocity -= excess * springMultiplier * dt;
      }
      // General return-to-center spring
      obj.angularVelocity -= obj.angle * 4.5 * dt;

      // Linear spring back for non-bottom-stick objects
      if (!obj.isBottomStick) {
        const offsetDist = Math.hypot(obj.offsetX, obj.offsetY);
        if (offsetDist > 50) {
          obj.velocityX -= (obj.offsetX / offsetDist) * (offsetDist - 50) * 8 * dt;
          obj.velocityY -= (obj.offsetY / offsetDist) * (offsetDist - 50) * 8 * dt;
        }
        obj.velocityX -= obj.offsetX * 6 * dt;
        obj.velocityY -= obj.offsetY * 6 * dt;

        obj.offsetX += obj.velocityX * dt;
        obj.offsetY += obj.velocityY * dt;
      } else {
        obj.offsetX = 0;
        obj.offsetY = 0;
      }

      obj.angle += obj.angularVelocity * dt;

      // Apply transforms
      if (obj.isBottomStick) {
        obj.el.style.transformOrigin = '50% 100%';
        obj.el.style.transform = `translateX(-50%) rotate(${obj.angle}deg)`;
      } else {
        obj.el.style.transformOrigin = '50% 50%';
        obj.el.style.transform = `translate(${obj.offsetX}px, ${obj.offsetY}px) rotate(${obj.angle}deg)`;
      }

      if (Math.abs(obj.angle) > 0.05 || Math.abs(obj.offsetX) > 0.1 || Math.abs(obj.offsetY) > 0.1) {
        anyMoving = true;
      }
    }

    if (anyMoving) {
      if (this.reanchorTimeout) {
        clearTimeout(this.reanchorTimeout);
        this.reanchorTimeout = null;
      }
    } else {
      if (!this.reanchorTimeout && this.onNeedReanchor) {
        this.reanchorTimeout = window.setTimeout(() => {
          this.reanchorTimeout = null;
          this.updateRects();
          this.onNeedReanchor?.();
        }, 300);
      }
    }
  }

  // A jump landing spins nearby objects by ±16–28°
  onJumpLanding(landingX: number, landingY: number) {
    for (const obj of this.objects) {
      const cx = obj.rect.left + obj.rect.width / 2;
      const cy = obj.rect.top + obj.rect.height / 2;
      const dist = Math.hypot(cx - landingX, cy - landingY);

      if (dist < 320) {
        const sign = cx >= landingX ? 1 : -1;
        const spin = sign * (16 + Math.random() * 12);
        obj.angularVelocity += spin * 3.5;
        if (!obj.isBottomStick) {
          obj.velocityX += sign * 40;
          obj.velocityY += (cy >= landingY ? 1 : -1) * 30;
        }
      }
    }
  }
}
