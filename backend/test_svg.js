const sharp = require('sharp');
const fs = require('fs');

const w = 1080;
const h = 1920;
const W = w;
const H = h;
const c = [
  { hex: '#ff595e' },
  { hex: '#ffca3a' },
  { hex: '#8ac926' },
  { hex: '#1982c4' },
  { hex: '#6a4c93' },
  { hex: '#ff9b85' },
  { hex: '#b392ac' },
  { hex: '#f7d08a' }
];

const bg = '#111';

// 1. Paper Cutout
const cutoutSvg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="15" stdDeviation="15" flood-color="#000" flood-opacity="0.3"/>
    </filter>
  </defs>
  <rect width="${W}" height="${H}" fill="${c[0].hex}"/>
  <path d="M0,${H*0.2} C${W*0.3},${H*0.1} ${W*0.7},${H*0.4} ${W},${H*0.2} L${W},${H} L0,${H} Z" fill="${c[1].hex}" filter="url(#shadow)"/>
  <path d="M0,${H*0.4} C${W*0.4},${H*0.6} ${W*0.6},${H*0.3} ${W},${H*0.5} L${W},${H} L0,${H} Z" fill="${c[2].hex}" filter="url(#shadow)"/>
  <path d="M0,${H*0.6} C${W*0.2},${H*0.8} ${W*0.8},${H*0.5} ${W},${H*0.7} L${W},${H} L0,${H} Z" fill="${c[3].hex}" filter="url(#shadow)"/>
  <path d="M0,${H*0.8} C${W*0.5},${H*0.7} ${W*0.5},${H*0.9} ${W},${H*0.85} L${W},${H} L0,${H} Z" fill="${c[4].hex}" filter="url(#shadow)"/>
</svg>`;

// 2. Fluid Grain
const fluidGrainSvg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="matrix" values="1 0 0 0 0, 0 1 0 0 0, 0 0 1 0 0, 0 0 0 0.1 0" />
    </filter>
    <filter id="blur">
      <feGaussianBlur stdDeviation="100"/>
    </filter>
  </defs>
  <rect width="${W}" height="${H}" fill="${bg}"/>
  <g filter="url(#blur)">
    <circle cx="${W*0.2}" cy="${H*0.2}" r="${W*0.6}" fill="${c[0].hex}"/>
    <circle cx="${W*0.8}" cy="${H*0.8}" r="${W*0.5}" fill="${c[1].hex}"/>
    <circle cx="${W*0.9}" cy="${H*0.2}" r="${W*0.4}" fill="${c[2].hex}"/>
    <circle cx="${W*0.2}" cy="${H*0.9}" r="${W*0.5}" fill="${c[3].hex}"/>
  </g>
  <rect width="${W}" height="${H}" filter="url(#grain)"/>
</svg>`;

// 3. Abstract Bauhaus
const bauhausSvg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="${bg}"/>
  <circle cx="${W*0.3}" cy="${H*0.2}" r="${W*0.2}" fill="${c[0].hex}" opacity="0.9"/>
  <rect x="${W*0.6}" y="${H*0.1}" width="${W*0.3}" height="${W*0.3}" fill="${c[1].hex}" opacity="0.9"/>
  <polygon points="${W*0.1},${H*0.6} ${W*0.4},${H*0.6} ${W*0.25},${H*0.4}" fill="${c[2].hex}" opacity="0.9"/>
  <circle cx="${W*0.7}" cy="${H*0.7}" r="${W*0.25}" fill="${c[3].hex}" opacity="0.9"/>
  <rect x="${W*0.2}" y="${H*0.7}" width="${W*0.4}" height="${W*0.1}" fill="${c[4].hex}" opacity="0.9" transform="rotate(-30 ${W*0.2} ${H*0.7})"/>
  <!-- Arch -->
  <path d="M${W*0.5},${H*0.35} A${W*0.2},${W*0.2} 0 0,1 ${W*0.9},${H*0.35} Z" fill="${c[5].hex}" opacity="0.9"/>
</svg>`;

// 4. Neon Retro-Wave
const retroSvg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#050510"/>
      <stop offset="100%" stop-color="${c[0].hex}"/>
    </linearGradient>
    <linearGradient id="sun" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${c[1].hex}"/>
      <stop offset="100%" stop-color="${c[2].hex}"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="15" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  
  <!-- Sun -->
  <circle cx="${W*0.5}" cy="${H*0.5}" r="${W*0.3}" fill="url(#sun)" filter="url(#glow)"/>
  
  <!-- Sun cutouts -->
  <rect x="0" y="${H*0.45}" width="${W}" height="${H*0.01}" fill="url(#sky)"/>
  <rect x="0" y="${H*0.49}" width="${W}" height="${H*0.015}" fill="url(#sky)"/>
  <rect x="0" y="${H*0.54}" width="${W}" height="${H*0.02}" fill="url(#sky)"/>
  <rect x="0" y="${H*0.6}" width="${W}" height="${H*0.03}" fill="url(#sky)"/>

  <!-- Ground -->
  <rect x="0" y="${H*0.65}" width="${W}" height="${H*0.35}" fill="#050510"/>
  
  <!-- Grid -->
  <g stroke="${c[3].hex}" stroke-width="2" filter="url(#glow)" opacity="0.6">
    <!-- Horizontals -->
    ${Array.from({length: 10}).map((_, i) => {
      const y = H*0.65 + Math.pow(i/9, 2) * H*0.35;
      return `<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`;
    }).join('\\n')}
    <!-- Verticals -->
    ${Array.from({length: 11}).map((_, i) => {
      const xTop = W * 0.5 + (i - 5) * (W * 0.05);
      const xBottom = W * 0.5 + (i - 5) * (W * 0.3);
      return `<line x1="${xTop}" y1="${H*0.65}" x2="${xBottom}" y2="${H}"/>`;
    }).join('\\n')}
  </g>
</svg>`;

async function run() {
  await sharp(Buffer.from(cutoutSvg)).jpeg().toFile('cutout.jpg');
  await sharp(Buffer.from(fluidGrainSvg)).jpeg().toFile('fluidgrain.jpg');
  await sharp(Buffer.from(bauhausSvg)).jpeg().toFile('bauhaus.jpg');
  await sharp(Buffer.from(retroSvg)).jpeg().toFile('retro.jpg');
  console.log('Done!');
}
run();
