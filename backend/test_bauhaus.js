const sharp = require('sharp');
const fs = require('fs');

const W = 1080;
const H = 1920;
const c = [
  { hex: '#ff595e' },
  { hex: '#ffca3a' },
  { hex: '#8ac926' },
  { hex: '#1982c4' },
  { hex: '#6a4c93' },
  { hex: '#ff9b85' }
];
const bg = '#111';

const bauhausSvg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="${bg}"/>
  
  <!-- Massive background arch -->
  <path d="M0,${H*0.8} A${W*0.6},${W*0.6} 0 0,1 ${W*1.2},${H*0.8} Z" fill="${c[0].hex}" opacity="0.8"/>
  
  <!-- Off-center concentric circles -->
  <circle cx="${W*0.8}" cy="${H*0.25}" r="${W*0.35}" fill="${c[1].hex}" opacity="0.85"/>
  <circle cx="${W*0.8}" cy="${H*0.25}" r="${W*0.2}" fill="${bg}"/>
  <circle cx="${W*0.8}" cy="${H*0.25}" r="${W*0.1}" fill="${c[2].hex}"/>

  <!-- Floating stripes -->
  <g transform="rotate(-45 ${W*0.2} ${H*0.5})">
    <rect x="${W*0.1}" y="${H*0.4}" width="${W*0.5}" height="${W*0.03}" fill="${c[3].hex}"/>
    <rect x="${W*0.1}" y="${H*0.45}" width="${W*0.5}" height="${W*0.03}" fill="${c[3].hex}"/>
    <rect x="${W*0.1}" y="${H*0.5}" width="${W*0.5}" height="${W*0.03}" fill="${c[3].hex}"/>
  </g>

  <!-- Sharp Triangle -->
  <polygon points="${W*0.1},${H*0.7} ${W*0.5},${H*0.7} ${W*0.1},${H*0.9}" fill="${c[4].hex}" opacity="0.9"/>
  
  <!-- Staggered grid -->
  <g fill="${c[5].hex}">
    ${Array.from({length: 4}).map((_, x) => 
      Array.from({length: 4}).map((_, y) => 
        `<circle cx="${W*0.7 + x*W*0.05}" cy="${H*0.6 + y*W*0.05}" r="${W*0.015}"/>`
      ).join('\\n')
    ).join('\\n')}
  </g>
</svg>`;

async function run() {
  await sharp(Buffer.from(bauhausSvg)).png().toFile('bauhaus2.png');
  console.log('Done!');
}
run();
