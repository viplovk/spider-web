// Main Application Entry Point for Found — The Curiosity Cabinet

import {
  ICONS,
  MUG_IMAGE,
  IBOOK_IMAGE,
  BOOK_IPOD_IMAGE,
  TSHIRT_IMAGE,
  createDewDropSprite,
  createSpiderTexture,
  createIdleHeadTexture,
  createFlyTexture
} from './assets';
import { SpiderRig } from './spider';
import { FlyManager } from './fly';
import { SilkManager } from './silk';
import { ObjectPhysicsManager } from './objects';
import { RadioPlayer } from './radio';

window.addEventListener('DOMContentLoaded', () => {
  // 1. Populate image DOM elements with authentic assets
  populateAssets();

  // 2. Setup radio player
  const radio = new RadioPlayer();
  radio.init();

  // 3. Canvas & Web Graphics Layer
  const canvas = document.getElementById('web-canvas') as HTMLCanvasElement;
  const ctx = canvas.getContext('2d')!;

  // Sprites & Procedural Textures
  const dewDropSprite = createDewDropSprite();
  const spiderTexture = createSpiderTexture();
  const idleHeadTexture = createIdleHeadTexture();
  const flyTexture = createFlyTexture();

  // Subsystems
  const silk = new SilkManager(dewDropSprite);
  const spider = new SpiderRig(spiderTexture, idleHeadTexture);
  const fly = new FlyManager(flyTexture);
  const physics = new ObjectPhysicsManager(() => {
    silk.sampleAnchors();
  });

  physics.init();

  // Wire Spider Callbacks
  spider.onFootfall = (fx, fy) => {
    silk.vibrate(fx, fy, 30, 0.6);
  };

  spider.onLand = (lx, ly, strength) => {
    silk.vibrate(lx, ly, 140, strength);
    physics.onJumpLanding(lx, ly);

    // Check fly catch
    const mouth = spider.getMouthWorld();
    const flyDist = Math.hypot(mouth.x - fly.state.x, mouth.y - fly.state.y);
    const flySize = Math.max(0.75, 1.05 * spider.scale / 1.63);

    if (flyDist <= 55 * flySize && !fly.state.isCaught) {
      fly.catch(mouth.x, mouth.y);
    }
  };

  spider.onWakeHop = (wx, wy) => {
    silk.vibrate(wx, wy, 80, 1.5);
  };

  // Resize handling with DPR capping at 2
  function handleResize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(1, window.innerWidth || document.documentElement.clientWidth || 1);
    const h = Math.max(1, window.innerHeight || document.documentElement.clientHeight || 1);

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    ctx.resetTransform();
    ctx.scale(dpr, dpr);

    spider.updateScale(w, h);
    silk.resize(w, h);
    physics.updateRects();
  }

  const resizeObserver = new ResizeObserver(() => handleResize());
  resizeObserver.observe(document.body);
  handleResize();

  // Initialize live thread from top center (W/2, -2) to spider
  const startAnchor = { x: window.innerWidth / 2, y: -2 };
  silk.startLiveThread(startAnchor, spider.getSpinneretWorld());

  // Anchor sampling on load, fonts ready, and 600ms delay
  window.addEventListener('load', () => silk.sampleAnchors());
  document.fonts?.ready.then(() => silk.sampleAnchors());
  setTimeout(() => silk.sampleAnchors(), 600);

  // 4. Input Listeners
  let isPointerMoving = false;
  let lastPointerX = window.innerWidth / 2;
  let lastPointerY = window.innerHeight / 2;
  let touchHoldTimer: number | null = null;
  let lastTapTime = 0;

  function updatePointer(clientX: number, clientY: number, target: EventTarget | null) {
    lastPointerX = clientX;
    lastPointerY = clientY;
    isPointerMoving = true;

    // Check if target or parent is an interactive button/link
    let isInteractive = false;
    let curr = target as HTMLElement | null;
    while (curr && curr !== document.body) {
      if (
        curr.tagName === 'BUTTON' ||
        curr.tagName === 'A' ||
        curr.tagName === 'INPUT' ||
        curr.getAttribute('role') === 'button' ||
        curr.classList.contains('interactive') ||
        curr.hasAttribute('data-no-spider')
      ) {
        isInteractive = true;
        break;
      }
      curr = curr.parentElement;
    }

    fly.setPointer(clientX, clientY, isInteractive);
  }

  window.addEventListener('mousemove', (e) => {
    updatePointer(e.clientX, e.clientY, e.target);
  });

  window.addEventListener('mouseleave', () => {
    fly.setPointerOut();
  });

  // Single click: pounce on fly!
  window.addEventListener('click', (e) => {
    // If clicking on player controls, don't jump
    const target = e.target as HTMLElement;
    if (target.closest('.player') || target.closest('button') || target.closest('a')) {
      return;
    }

    spider.pounce(fly.state.x, fly.state.y);
  });

  // Double click: make spider jump directly
  window.addEventListener('dblclick', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('.player') || target.closest('button') || target.closest('a')) {
      return;
    }
    spider.pounce(e.clientX, e.clientY);
  });

  // Keyboard Delete / Backspace: Clear Web!
  window.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      silk.clearWeb();
    }
  });

  // Touch Support
  window.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
      const t = e.touches[0];
      updatePointer(t.clientX, t.clientY, e.target);

      // Touch hold (650ms) to clear web
      touchHoldTimer = window.setTimeout(() => {
        silk.clearWeb();
        if ('vibrate' in navigator) {
          navigator.vibrate(30);
        }
      }, 650);

      // Double tap to jump
      const now = performance.now();
      if (now - lastTapTime < 300) {
        spider.pounce(t.clientX, t.clientY);
      }
      lastTapTime = now;
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (touchHoldTimer) {
      clearTimeout(touchHoldTimer);
      touchHoldTimer = null;
    }
    if (e.touches.length > 0) {
      const t = e.touches[0];
      updatePointer(t.clientX, t.clientY, e.target);
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    if (touchHoldTimer) {
      clearTimeout(touchHoldTimer);
      touchHoldTimer = null;
    }
  });

  // 5. Main Animation Loop
  let lastTime = performance.now();

  function frame(now: number) {
    if (canvas.width <= 0 || canvas.height <= 0 || window.innerWidth <= 0 || window.innerHeight <= 0) {
      requestAnimationFrame(frame);
      return;
    }

    const realDelta = (now - lastTime) / 1000;
    lastTime = now;
    const dt = Math.min(0.033, Math.max(0.001, realDelta));

    const flySize = Math.max(0.75, 1.05 * (spider.scale / 1.63));

    // 1. Update Fly
    fly.update(dt, flySize);

    // 2. Update Image Nudges
    physics.update(
      dt,
      spider.x,
      spider.y,
      spider.vx,
      spider.vy,
      spider.speed,
      spider.K
    );

    // 3. Update Spider
    const targetX = fly.state.visible || fly.state.isCaught ? fly.state.x : lastPointerX;
    const targetY = fly.state.visible || fly.state.isCaught ? fly.state.y : lastPointerY;
    spider.update(dt, targetX, targetY, fly.state.visible, isPointerMoving);
    isPointerMoving = false;

    // 4. Update Silk Physics & Anchoring
    const spinneret = spider.getSpinneretWorld();
    silk.update(dt, spinneret, lastPointerX, lastPointerY);

    // Clear Canvas
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // Draw Order:
    // 1. Web Shadows (Masked to fall only on letters and objects!)
    silk.drawShadows(ctx);

    // 2. Threads, Splats, and Dew Drops
    silk.drawThreadsAndDrops(ctx);

    // 3. The Spider through its shadowed offscreen
    spider.draw(ctx);

    // 4. Fly and Cocoon
    fly.draw(ctx, flySize);

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
});

function populateAssets() {
  // Populate UI Icons
  const logoBackEl = document.getElementById('logo-back-img') as HTMLImageElement;
  if (logoBackEl) logoBackEl.src = ICONS.logoBack;

  const logoFrontEl = document.getElementById('logo-front-img') as HTMLImageElement;
  if (logoFrontEl) logoFrontEl.src = ICONS.logoFront;

  const searchEl = document.getElementById('search-icon-img') as HTMLImageElement;
  if (searchEl) searchEl.src = ICONS.search;

  const menuEl = document.getElementById('menu-icon-img') as HTMLImageElement;
  if (menuEl) menuEl.src = ICONS.menu;

  const heartEl = document.getElementById('heart-icon-img') as HTMLImageElement;
  if (heartEl) heartEl.src = ICONS.heart;

  const ambientEl = document.getElementById('ambient-icon-img') as HTMLImageElement;
  if (ambientEl) ambientEl.src = ICONS.ambient;

  const shuffleEl = document.getElementById('shuffle-icon-img') as HTMLImageElement;
  if (shuffleEl) shuffleEl.src = ICONS.shuffle;

  const prevEl = document.getElementById('prev-icon-img') as HTMLImageElement;
  if (prevEl) prevEl.src = ICONS.prev;

  const nextEl = document.getElementById('next-icon-img') as HTMLImageElement;
  if (nextEl) nextEl.src = ICONS.next;

  const repeatEl = document.getElementById('repeat-icon-img') as HTMLImageElement;
  if (repeatEl) repeatEl.src = ICONS.repeat;

  const playerArtEl = document.getElementById('player-art-img') as HTMLImageElement;
  if (playerArtEl) playerArtEl.src = ICONS.playerArt;

  // Populate Objects
  const mugEl = document.getElementById('obj-mug') as HTMLImageElement;
  if (mugEl) mugEl.src = MUG_IMAGE;

  const ibookEl = document.getElementById('obj-ibook') as HTMLImageElement;
  if (ibookEl) ibookEl.src = IBOOK_IMAGE;

  const bookEl = document.getElementById('obj-book') as HTMLImageElement;
  if (bookEl) bookEl.src = BOOK_IPOD_IMAGE;

  const tshirtEl = document.getElementById('obj-tshirt') as HTMLImageElement;
  if (tshirtEl) tshirtEl.src = TSHIRT_IMAGE;
}
