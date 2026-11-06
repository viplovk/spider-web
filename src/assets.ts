// Asset generation for Found Curiosity Cabinet
// Procedural high-resolution data URIs and textures matching the exact specs

// 1. UI Icons
export const ICONS = {
  logoBack: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 53 41" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 10h14l4 5h27a4 4 0 0 1 4 4v16a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4z" />
    </svg>
  `)}`,
  
  logoFront: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 53 34" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M2 4h49a2 2 0 0 1 2 2v24a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V6a2 2 0 0 1 2-2z" fill="rgba(17,41,226,0.3)" />
      <line x1="8" y1="12" x2="45" y2="12" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" />
    </svg>
  `)}`,

  search: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="7.5" />
      <line x1="16.5" y1="16.5" x2="23" y2="23" />
    </svg>
  `)}`,

  menu: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 26" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round">
      <line x1="3" y1="7" x2="23" y2="7" />
      <line x1="3" y1="13" x2="23" y2="13" />
      <line x1="3" y1="19" x2="23" y2="19" />
    </svg>
  `)}`,

  heart: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  `)}`,

  ambient: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
    </svg>
  `)}`,

  shuffle: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="16 3 21 3 21 8" />
      <line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" />
      <line x1="15" y1="15" x2="21" y2="21" />
      <line x1="4" y1="4" x2="9" y2="9" />
    </svg>
  `)}`,

  prev: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="19 20 9 12 19 4 19 20" fill="white" />
      <line x1="5" y1="19" x2="5" y2="5" stroke-width="2.5" />
    </svg>
  `)}`,

  next: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="5 4 15 12 5 20 5 4" fill="white" />
      <line x1="19" y1="5" x2="19" y2="19" stroke-width="2.5" />
    </svg>
  `)}`,

  repeat: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  `)}`,

  playerArt: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
      <defs>
        <linearGradient id="artGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ff4e50" />
          <stop offset="50%" stop-color="#f9d423" />
          <stop offset="100%" stop-color="#24c6dc" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="url(#artGrad)" />
      <circle cx="20" cy="20" r="10" fill="rgba(255,255,255,0.25)" />
      <circle cx="20" cy="20" r="4" fill="#ffffff" />
    </svg>
  `)}`
};

// 2. Objects (Cutouts with transparency)

// Mug (241 x 220 PNG/SVG, "Main Character" handwriting)
export const MUG_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 241 220" width="241" height="220">
  <defs>
    <radialGradient id="mugShadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(0,0,0,0.35)" />
      <stop offset="100%" stop-color="rgba(0,0,0,0)" />
    </radialGradient>
    <linearGradient id="ceramicBody" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#d9dee7" />
      <stop offset="15%" stop-color="#f5f7fa" />
      <stop offset="65%" stop-color="#ffffff" />
      <stop offset="90%" stop-color="#e3e8f0" />
      <stop offset="100%" stop-color="#c8cfdc" />
    </linearGradient>
    <linearGradient id="mugRim" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f2f5f9" />
      <stop offset="100%" stop-color="#b8c0cf" />
    </linearGradient>
    <linearGradient id="coffeeDark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#22130c" />
      <stop offset="60%" stop-color="#3d2314" />
      <stop offset="100%" stop-color="#180e08" />
    </linearGradient>
  </defs>

  <!-- Shadow under mug -->
  <ellipse cx="115" cy="200" rx="90" ry="16" fill="url(#mugShadow)" />

  <!-- Mug Handle -->
  <path d="M 175 65 C 225 65, 235 155, 175 160 C 160 160, 160 142, 172 142 C 205 138, 195 85, 170 82 Z" fill="#e2e7ef" stroke="#cbd3e1" stroke-width="2" />

  <!-- Mug Body Outer Silhouette -->
  <path d="M 45 42 L 52 180 C 53 194, 75 198, 115 198 C 155 198, 177 194, 178 180 L 185 42 Z" fill="url(#ceramicBody)" filter="drop-shadow(0px 8px 14px rgba(0,0,0,0.25))" />

  <!-- Interior / Coffee Surface -->
  <ellipse cx="115" cy="42" rx="70" ry="22" fill="url(#mugRim)" />
  <ellipse cx="115" cy="43" rx="66" ry="19" fill="url(#coffeeDark)" />
  <ellipse cx="110" cy="42" rx="55" ry="12" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2" />

  <!-- Mug Specular Highlight -->
  <path d="M 64 65 Q 67 120 70 172" stroke="rgba(255,255,255,0.7)" stroke-width="8" stroke-linecap="round" filter="blur(2px)" />

  <!-- Handwritten "Main Character" Text -->
  <g transform="translate(112, 126) rotate(-4)">
    <text x="0" y="-8" text-anchor="middle" font-family="'Caveat', 'Segoe Script', cursive, sans-serif" font-weight="700" font-size="27" fill="#1b1c24" letter-spacing="1">Main</text>
    <text x="0" y="22" text-anchor="middle" font-family="'Caveat', 'Segoe Script', cursive, sans-serif" font-weight="700" font-size="25" fill="#1b1c24" letter-spacing="0.5">Character</text>
    <path d="M -38 32 Q 0 38 42 30" fill="none" stroke="#1b1c24" stroke-width="2.5" stroke-linecap="round" />
  </g>
</svg>
`)}`;

// iBook Laptop in Glass Sleeve (312 x 377 PNG/SVG)
export const IBOOK_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 312 377" width="312" height="377">
  <defs>
    <radialGradient id="laptopShadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(0,0,0,0.4)" />
      <stop offset="100%" stop-color="rgba(0,0,0,0)" />
    </radialGradient>
    <linearGradient id="ibookShell" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="50%" stop-color="#f0f3f8" />
      <stop offset="100%" stop-color="#dce3ee" />
    </linearGradient>
    <linearGradient id="accentOrange" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff7f50" />
      <stop offset="100%" stop-color="#ff4500" />
    </linearGradient>
    <linearGradient id="glassSleeve" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.4)" />
      <stop offset="50%" stop-color="rgba(255,255,255,0.12)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0.25)" />
    </linearGradient>
  </defs>

  <!-- Shadow -->
  <ellipse cx="156" cy="350" rx="130" ry="22" fill="url(#laptopShadow)" />

  <!-- Frosted Glass Sleeve Outer Bag -->
  <rect x="20" y="24" width="272" height="326" rx="34" fill="url(#glassSleeve)" stroke="rgba(255,255,255,0.6)" stroke-width="2.5" />
  
  <!-- iBook Clamshell Laptop inside -->
  <g transform="translate(36, 44)">
    <!-- Clamshell Curved Base -->
    <rect x="10" y="14" width="220" height="258" rx="42" fill="url(#ibookShell)" stroke="#c2cddc" stroke-width="2" filter="drop-shadow(0 10px 18px rgba(0,0,0,0.2))" />

    <!-- Translucent Colored Trim (Tangerine/Cyan clamshell rim) -->
    <path d="M 28 14 C 18 14, 10 22, 10 34 L 10 236 C 10 248, 18 258, 30 258 C 45 258, 20 180, 20 136 C 20 80, 45 14, 28 14 Z" fill="url(#accentOrange)" opacity="0.85" />
    <path d="M 212 14 C 222 14, 230 22, 230 34 L 230 236 C 230 248, 222 258, 210 258 C 195 258, 220 180, 220 136 C 220 80, 195 14, 212 14 Z" fill="url(#accentOrange)" opacity="0.85" />
    <rect x="42" y="250" width="156" height="18" rx="9" fill="url(#accentOrange)" opacity="0.9" />

    <!-- Handle Hole -->
    <rect x="80" y="24" width="80" height="26" rx="13" fill="#e8edf5" stroke="#b0bccd" stroke-width="2" />

    <!-- Center Glowing Apple Logo -->
    <g transform="translate(120, 142) scale(1.1)">
      <path d="M 0 -18 C 3 -22, 8 -24, 8 -24 C 8 -24, 7 -20, 4 -17 C 1 -14, -4 -13, -4 -13 C -4 -13, -3 -17, 0 -18 Z" fill="#ffffff" filter="drop-shadow(0 0 6px rgba(255,255,255,0.9))" />
      <path d="M 12 -4 C 12 -9, 16 -12, 16 -12 C 14 -15, 10 -16, 7 -16 C 3 -16, 1 -14, -2 -14 C -5 -14, -8 -16, -11 -16 C -16 -16, -21 -11, -21 -3 C -21 7, -15 18, -10 18 C -7 18, -6 16, -2 16 C 2 16, 3 18, 6 18 C 11 18, 15 11, 17 7 C 13 5, 12 0, 12 -4 Z" fill="#ffffff" filter="drop-shadow(0 0 8px rgba(255,255,255,0.95))" />
    </g>
  </g>

  <!-- Glass Sheen & Sleeve Reflection Line -->
  <path d="M 32 36 L 278 280" stroke="rgba(255,255,255,0.3)" stroke-width="3" stroke-linecap="round" />
  <rect x="24" y="28" width="264" height="318" rx="30" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" />
</svg>
`)}`;

// Pink Book & iPod in Glass Sleeve (293 x 322 PNG/SVG)
export const BOOK_IPOD_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 293 322" width="293" height="322">
  <defs>
    <radialGradient id="bookShadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(0,0,0,0.42)" />
      <stop offset="100%" stop-color="rgba(0,0,0,0)" />
    </radialGradient>
    <linearGradient id="pinkCover" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff7eb3" />
      <stop offset="50%" stop-color="#ff5388" />
      <stop offset="100%" stop-color="#d82563" />
    </linearGradient>
    <linearGradient id="ipodBody" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#dce1e9" />
    </linearGradient>
    <linearGradient id="ipodScreen" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#a4bcc4" />
      <stop offset="100%" stop-color="#7e9ca6" />
    </linearGradient>
  </defs>

  <!-- Shadow -->
  <ellipse cx="146" cy="295" rx="125" ry="18" fill="url(#bookShadow)" />

  <!-- Translucent Glass Protective Case -->
  <rect x="18" y="16" width="257" height="282" rx="28" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.5)" stroke-width="2.5" />

  <!-- Pink Book -->
  <g transform="translate(32, 28) rotate(-3 115 130)">
    <!-- Book Spine & Pages -->
    <rect x="10" y="10" width="206" height="240" rx="12" fill="#fff5ea" stroke="#d5c8b8" stroke-width="2" />
    <rect x="14" y="6" width="205" height="242" rx="10" fill="url(#pinkCover)" filter="drop-shadow(0 6px 12px rgba(0,0,0,0.25))" />
    <line x1="26" y1="6" x2="26" y2="248" stroke="#b01b4e" stroke-width="2.5" />
    
    <!-- Title on Book -->
    <text x="115" y="80" text-anchor="middle" font-family="'Inter', sans-serif" font-weight="700" font-size="16" fill="#ffffff" letter-spacing="1.5">CURIO</text>
    <line x1="85" y1="92" x2="145" y2="92" stroke="#ffffff" stroke-width="1.5" />
  </g>

  <!-- iPod Resting On Book -->
  <g transform="translate(136, 120) rotate(12)">
    <!-- iPod Casing -->
    <rect x="0" y="0" width="94" height="142" rx="16" fill="url(#ipodBody)" stroke="#aeb8c7" stroke-width="1.8" filter="drop-shadow(0 8px 16px rgba(0,0,0,0.35))" />
    
    <!-- Monochrome Screen -->
    <rect x="12" y="12" width="70" height="52" rx="4" fill="url(#ipodScreen)" stroke="#526871" stroke-width="1.2" />
    <line x1="18" y1="24" x2="65" y2="24" stroke="#40555e" stroke-width="3" stroke-linecap="round" />
    <line x1="18" y1="34" x2="52" y2="34" stroke="#40555e" stroke-width="2" stroke-linecap="round" />

    <!-- Click Wheel -->
    <circle cx="47" cy="102" r="26" fill="#f0f2f6" stroke="#c0c7d4" stroke-width="1.5" />
    <circle cx="47" cy="102" r="10" fill="#ffffff" stroke="#cbd2df" stroke-width="1" />
    
    <!-- Wheel Micro-labels -->
    <text x="47" y="87" text-anchor="middle" font-family="sans-serif" font-size="7" font-weight="700" fill="#8d97a5">MENU</text>
    <polygon points="26,102 30,99 30,105" fill="#8d97a5" />
    <polygon points="68,102 64,99 64,105" fill="#8d97a5" />
    <polygon points="45,121 49,118 49,124" fill="#8d97a5" />
  </g>

  <!-- Glass Sheen diagonal -->
  <line x1="28" y1="28" x2="265" y2="280" stroke="rgba(255,255,255,0.4)" stroke-width="2" stroke-linecap="round" />
</svg>
`)}`;

// T-Shirt (250 x 226 PNG/SVG, "CALL MY LAWYER (888) 799-2021" handwriting)
export const TSHIRT_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 226" width="250" height="226">
  <defs>
    <radialGradient id="shirtShadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(0,0,0,0.38)" />
      <stop offset="100%" stop-color="rgba(0,0,0,0)" />
    </radialGradient>
    <linearGradient id="cottonWhite" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="50%" stop-color="#f4f6fa" />
      <stop offset="100%" stop-color="#e1e6ef" />
    </linearGradient>
  </defs>

  <!-- Shadow -->
  <ellipse cx="125" cy="216" rx="100" ry="10" fill="url(#shirtShadow)" />

  <!-- T-shirt Folded Silhouette -->
  <path d="M 68 18 C 88 34, 162 34, 182 18 L 236 68 L 206 98 L 192 84 L 194 212 C 194 216, 188 220, 180 220 L 70 220 C 62 220, 56 216, 56 212 L 58 84 L 44 98 L 14 68 Z" fill="url(#cottonWhite)" filter="drop-shadow(0 10px 16px rgba(0,0,0,0.3))" stroke="#ced6e2" stroke-width="1.8" />

  <!-- Collar Ribbing -->
  <path d="M 72 20 C 90 40, 160 40, 178 20" fill="none" stroke="#b0bccd" stroke-width="4.5" stroke-linecap="round" />
  <path d="M 74 20 C 90 38, 158 38, 176 20" fill="none" stroke="#ffffff" stroke-width="2" />

  <!-- Natural Fabric Wrinkles & Seams -->
  <path d="M 60 90 Q 95 105 130 92 Q 165 85 190 94" fill="none" stroke="rgba(160,175,195,0.4)" stroke-width="2.5" />
  <path d="M 70 148 Q 110 162 145 146 Q 170 142 185 152" fill="none" stroke="rgba(160,175,195,0.3)" stroke-width="2" />

  <!-- Handwritten Text: CALL MY LAWYER (888) 799-2021 -->
  <g transform="translate(125, 115) rotate(-2)">
    <text x="0" y="-8" text-anchor="middle" font-family="'Impact', 'Arial Black', sans-serif" font-weight="900" font-size="19" fill="#181a20" letter-spacing="1">CALL MY LAWYER</text>
    <text x="0" y="16" text-anchor="middle" font-family="'Courier New', monospace" font-weight="800" font-size="13" fill="#252830" letter-spacing="1.5">(888) 799-2021</text>
    <line x1="-70" y1="26" x2="70" y2="26" stroke="#181a20" stroke-width="2" stroke-linecap="round" />
  </g>
</svg>
`)}`;

// 3. Dew Drop 64x64 Bead Sprite Generator
export function createDewDropSprite(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext('2d')!;
  
  // Radial glass gradient
  const grad = ctx.createRadialGradient(28, 26, 2, 32, 32, 28);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  grad.addColorStop(0.35, 'rgba(220, 240, 255, 0.6)');
  grad.addColorStop(0.7, 'rgba(180, 215, 255, 0.25)');
  grad.addColorStop(0.9, 'rgba(255, 210, 150, 0.45)'); // Warm caustic rim
  grad.addColorStop(1, 'rgba(255, 255, 255, 0.7)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(32, 32, 28, 0, Math.PI * 2);
  ctx.fill();

  // Crisp white specular glint
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(24, 22, 6, 4, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();

  // Secondary tiny highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.beginPath();
  ctx.arc(42, 40, 2.5, 0, Math.PI * 2);
  ctx.fill();

  return c;
}

// 4. Procedural Spider Photo Texture (560 x 560 canvas, sprite space 1254)
// Sliced into body, head, and 8 IK legs matching the exact coordinates:
// pivot (627,600), waist (627,548), spinneret (627,150)
// Abdomen ellipse (628,345) r 220x205
// Head ellipses (630,680) r 172x148, (545,880) r 74x70, (712,880) r 74x70
// Legs:
// [(470,760),(370,830),(400,1160)]
// [(460,665),(300,690),(100,955)]
// [(480,605),(370,580),(55,475)]
// [(490,560),(360,420),(410,52)]
export function createSpiderTexture(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 560;
  c.height = 560;
  const ctx = c.getContext('2d')!;
  const s = 560 / 1254; // ~0.44657

  // Helper to map 1254 coordinate to 560 canvas
  const tx = (x: number) => x * s;
  const ty = (y: number) => y * s;

  // Draw 8 legs along polylines (with bandings, hairs, chitin gradient)
  const legPolylines = [
    [[470, 760], [370, 830], [400, 1160]],
    [[460, 665], [300, 690], [100, 955]],
    [[480, 605], [370, 580], [55, 475]],
    [[490, 560], [360, 420], [410, 52]]
  ];

  function drawLegSegments(points: number[][], mirror: boolean) {
    const pts = points.map(([x, y]) => [tx(mirror ? 1254 - x : x), ty(y)]);
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Femur + Tibia stroke with warm brown chitin gradient
    ctx.strokeStyle = '#3e2415';
    ctx.lineWidth = 92 * s;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    ctx.lineTo(pts[1][0], pts[1][1]);
    ctx.lineTo(pts[2][0], pts[2][1]);
    ctx.stroke();

    // Inner lighter band (cream / tan jumping spider bands)
    ctx.strokeStyle = '#b89065';
    ctx.lineWidth = 55 * s;
    ctx.stroke();

    // Dark brown joints & chevron accents
    ctx.strokeStyle = '#22120a';
    ctx.lineWidth = 22 * s;
    ctx.stroke();

    // White furry highlights on knee and ankle joints
    ctx.fillStyle = '#f6edd9';
    ctx.beginPath();
    ctx.arc(pts[1][0], pts[1][1], 24 * s, 0, Math.PI * 2);
    ctx.arc(pts[2][0], pts[2][1], 16 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Draw legs for both sides
  legPolylines.forEach(leg => {
    drawLegSegments(leg, false); // Right side
    drawLegSegments(leg, true);  // Left side (mirrored)
  });

  // Spinneret at (627, 150)
  ctx.save();
  ctx.fillStyle = '#321d13';
  ctx.beginPath();
  ctx.ellipse(tx(627), ty(150), 30 * s, 25 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Abdomen at (628, 345) r 220x205
  ctx.save();
  const abdGrad = ctx.createRadialGradient(tx(628), ty(345) - 30 * s, 20 * s, tx(628), ty(345), 210 * s);
  abdGrad.addColorStop(0, '#8c5a36'); // Rich velvety brown
  abdGrad.addColorStop(0.5, '#4a2816');
  abdGrad.addColorStop(0.85, '#28140b');
  abdGrad.addColorStop(1, '#150904');

  ctx.fillStyle = abdGrad;
  ctx.beginPath();
  ctx.ellipse(tx(628), ty(345), 220 * s, 205 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Abdomen jumping spider banding patterns (cream chevrons)
  ctx.fillStyle = '#ecd8ba';
  for (let i = -2; i <= 3; i++) {
    const cy = ty(345 + i * 45);
    ctx.beginPath();
    ctx.ellipse(tx(628), cy, (140 - Math.abs(i) * 20) * s, 18 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Dark center stripe
  ctx.fillStyle = 'rgba(25, 12, 7, 0.7)';
  ctx.beginPath();
  ctx.ellipse(tx(628), ty(345), 45 * s, 170 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Waist at (627, 548)
  ctx.save();
  ctx.fillStyle = '#1c0c06';
  ctx.beginPath();
  ctx.ellipse(tx(627), ty(548), 85 * s, 40 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Head Ellipses: (630,680) r 172x148, plus chelicerae (545,880) r 74x70, (712,880) r 74x70
  ctx.save();
  const headGrad = ctx.createRadialGradient(tx(630), ty(680) - 20 * s, 30 * s, tx(630), ty(680), 165 * s);
  headGrad.addColorStop(0, '#5e3820');
  headGrad.addColorStop(0.65, '#351c0e');
  headGrad.addColorStop(1, '#160a04');

  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.ellipse(tx(630), ty(680), 172 * s, 148 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Chelicerae / Pedipalps (with metallic emerald sheen)
  const chelGradL = ctx.createRadialGradient(tx(545), ty(880), 10 * s, tx(545), ty(880), 70 * s);
  chelGradL.addColorStop(0, '#105238'); // Emerald sheen of jumping spider
  chelGradL.addColorStop(0.6, '#28180e');
  chelGradL.addColorStop(1, '#110703');
  ctx.fillStyle = chelGradL;
  ctx.beginPath();
  ctx.ellipse(tx(545), ty(880), 74 * s, 70 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  const chelGradR = ctx.createRadialGradient(tx(712), ty(880), 10 * s, tx(712), ty(880), 70 * s);
  chelGradR.addColorStop(0, '#105238');
  chelGradR.addColorStop(0.6, '#28180e');
  chelGradR.addColorStop(1, '#110703');
  ctx.fillStyle = chelGradR;
  ctx.beginPath();
  ctx.ellipse(tx(712), ty(880), 74 * s, 70 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Spider Eyes on Head (Obsidian black shiny spheres)
  ctx.fillStyle = '#080503';
  // Primary big anterior median eyes
  ctx.beginPath();
  ctx.arc(tx(585), ty(740), 38 * s, 0, Math.PI * 2);
  ctx.arc(tx(675), ty(740), 38 * s, 0, Math.PI * 2);
  ctx.fill();

  // Glints on big eyes
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.arc(tx(578), ty(732), 10 * s, 0, Math.PI * 2);
  ctx.arc(tx(668), ty(732), 10 * s, 0, Math.PI * 2);
  ctx.fill();

  // Secondary anterior lateral eyes
  ctx.fillStyle = '#080503';
  ctx.beginPath();
  ctx.arc(tx(515), ty(720), 22 * s, 0, Math.PI * 2);
  ctx.arc(tx(745), ty(720), 22 * s, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
  return c;
}

// 5. Cute Idle Head Texture (308 x 308)
// Eyes: [139,158,12.5], [170,158,12.5], [117,150,7.5], [192,150,7.5], [112,136,4], [197,136,4]
export function createIdleHeadTexture(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 308;
  c.height = 308;
  const ctx = c.getContext('2d')!;

  // Cute furry head body
  const grad = ctx.createRadialGradient(154, 150, 20, 154, 154, 125);
  grad.addColorStop(0, '#b88960'); // Warm friendly mocha tan
  grad.addColorStop(0.55, '#845738');
  grad.addColorStop(0.9, '#4c2e1b');
  grad.addColorStop(1, '#231209');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(154, 154, 110, 102, 0, 0, Math.PI * 2);
  ctx.fill();

  // Chelicerae / Cute paws in front
  ctx.fillStyle = '#ecd1af';
  ctx.beginPath();
  ctx.ellipse(135, 230, 26, 32, -0.15, 0, Math.PI * 2);
  ctx.ellipse(173, 230, 26, 32, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // 6 Big Cute Eyes
  const eyes = [
    [139, 158, 12.5],
    [170, 158, 12.5],
    [117, 150, 7.5],
    [192, 150, 7.5],
    [112, 136, 4],
    [197, 136, 4]
  ];

  eyes.forEach(([ex, ey, er]) => {
    // Eye socket shadow
    ctx.fillStyle = 'rgba(20, 10, 6, 0.6)';
    ctx.beginPath();
    ctx.arc(ex, ey + 1, er + 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Glossy black obsidian pupil
    const eyeGrad = ctx.createRadialGradient(ex - er * 0.2, ey - er * 0.2, er * 0.2, ex, ey, er);
    eyeGrad.addColorStop(0, '#261b17');
    eyeGrad.addColorStop(0.6, '#090503');
    eyeGrad.addColorStop(1, '#000000');

    ctx.fillStyle = eyeGrad;
    ctx.beginPath();
    ctx.arc(ex, ey, er, 0, Math.PI * 2);
    ctx.fill();

    // Primary bright white shine
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ex - er * 0.35, ey - er * 0.35, er * 0.38, 0, Math.PI * 2);
    ctx.fill();

    // Secondary soft warm highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.arc(ex + er * 0.3, ey + er * 0.3, er * 0.22, 0, Math.PI * 2);
    ctx.fill();
  });

  return c;
}

// 6. Fly Texture (240 x 246, sprite space 920 x 945)
// Wings: (398,380) (330,415) (250,515) (180,615) (132,720) (148,795) (212,805) (305,742) (385,652) (410,560) (414,455)
// Wing hinge (388,405)
export function createFlyTexture(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 240;
  c.height = 246;
  const ctx = c.getContext('2d')!;
  const s = 240 / 920; // ~0.2608

  const tx = (x: number) => x * s;
  const ty = (y: number) => y * s;

  // Fly Body
  ctx.save();
  // Abdomen
  const abdGrad = ctx.createRadialGradient(tx(460), ty(650), 20 * s, tx(460), ty(650), 180 * s);
  abdGrad.addColorStop(0, '#243b46'); // Metallic dark blue-grey
  abdGrad.addColorStop(0.6, '#141e24');
  abdGrad.addColorStop(1, '#0b0f12');
  ctx.fillStyle = abdGrad;
  ctx.beginPath();
  ctx.ellipse(tx(460), ty(650), 90 * s, 140 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Abdominal segments
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 4 * s;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.ellipse(tx(460), ty(650 + i * 40), 85 * s, 16 * s, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Thorax
  const thGrad = ctx.createRadialGradient(tx(460), ty(460), 20 * s, tx(460), ty(460), 120 * s);
  thGrad.addColorStop(0, '#3a4b4e');
  thGrad.addColorStop(0.8, '#182024');
  thGrad.addColorStop(1, '#0c1012');
  ctx.fillStyle = thGrad;
  ctx.beginPath();
  ctx.ellipse(tx(460), ty(460), 105 * s, 95 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head and Compound Eyes
  // Left eye
  const eyeL = ctx.createRadialGradient(tx(405), ty(330), 8 * s, tx(405), ty(330), 65 * s);
  eyeL.addColorStop(0, '#b83218'); // Classic deep reddish-brown compound eye
  eyeL.addColorStop(0.8, '#5e1509');
  eyeL.addColorStop(1, '#260603');
  ctx.fillStyle = eyeL;
  ctx.beginPath();
  ctx.ellipse(tx(405), ty(330), 60 * s, 68 * s, -0.2, 0, Math.PI * 2);
  ctx.fill();

  // Right eye
  const eyeR = ctx.createRadialGradient(tx(515), ty(330), 8 * s, tx(515), ty(330), 65 * s);
  eyeR.addColorStop(0, '#b83218');
  eyeR.addColorStop(0.8, '#5e1509');
  eyeR.addColorStop(1, '#260603');
  ctx.fillStyle = eyeR;
  ctx.beginPath();
  ctx.ellipse(tx(515), ty(330), 60 * s, 68 * s, 0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // Translucent Membranous Wings with Delicate Veins
  const wingPts = [
    [398, 380], [330, 415], [250, 515], [180, 615], [132, 720],
    [148, 795], [212, 805], [305, 742], [385, 652], [410, 560], [414, 455]
  ];

  function drawWing(mirror: boolean) {
    ctx.save();
    const pts = wingPts.map(([x, y]) => [tx(mirror ? 920 - x : x), ty(y)]);
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i][0], pts[i][1]);
    }
    ctx.closePath();

    // Iridescent wing fill
    const wGrad = ctx.createLinearGradient(pts[0][0], pts[0][1], pts[4][0], pts[4][1]);
    wGrad.addColorStop(0, 'rgba(235, 245, 255, 0.65)');
    wGrad.addColorStop(0.5, 'rgba(210, 255, 240, 0.45)');
    wGrad.addColorStop(1, 'rgba(255, 230, 245, 0.55)');
    ctx.fillStyle = wGrad;
    ctx.fill();

    // Wing edge & micro veins
    ctx.strokeStyle = 'rgba(70, 90, 110, 0.55)';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // Wing main vein
    ctx.strokeStyle = 'rgba(50, 70, 90, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    ctx.quadraticCurveTo(pts[2][0], pts[2][1], pts[5][0], pts[5][1]);
    ctx.stroke();

    ctx.restore();
  }

  drawWing(false); // Left wing
  drawWing(true);  // Right wing

  return c;
}
