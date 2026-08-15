const sharp = require('sharp');
const NodeCache = require('node-cache');

// Cache TMDB image lists for 24 hours (86400 seconds)
const tmdbImageCache = new NodeCache({ stdTTL: 86400, checkperiod: 3600, maxKeys: 1000 });
const ALLOWED_STYLES = new Set(['Paper Cutout', 'Fluid Grain', 'Abstract Bauhaus', 'Neon Retro-Wave', 'Linear Mesh', 'Glassmorphism']);

function cacheTmdbImages(key, data) {
  try {
    tmdbImageCache.set(key, data);
  } catch (error) {
    if (error?.errorcode !== 'ECACHEFULL') throw error;
    tmdbImageCache.flushAll();
    tmdbImageCache.set(key, data);
  }
}

// Convert RGB to HSL
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s, l };
}

function toHex(r, g, b) {
  return `#${Math.round(r).toString(16).padStart(2,'0')}${Math.round(g).toString(16).padStart(2,'0')}${Math.round(b).toString(16).padStart(2,'0')}`;
}

// Extract the most vivid, distinct colors from an image buffer
async function extractVividPalette(buffer, count = 6) {
  // 1. Boost saturation on the image FIRST so we extract vivid hues, not muted greys
  const boosted = await sharp(buffer)
    .resize(40, 40, { kernel: 'lanczos3' })
    .modulate({ saturation: 2.5 }) // pull out vivid tones aggressively
    .raw()
    .toBuffer();

  const meta = await sharp(buffer).metadata();
  const channels = 3; // raw() drops alpha
  
  const pixels = [];
  for (let i = 0; i < boosted.length; i += channels) {
    const r = boosted[i], g = boosted[i+1], b = boosted[i+2];
    const { s, l } = rgbToHsl(r, g, b);
    // Filter out: near-black, near-white, and low-saturation (grey) pixels
    if (l > 0.08 && l < 0.92 && s > 0.12) {
      pixels.push({ r, g, b, s, l });
    }
  }

  // Sort by saturation descending - most vivid first
  pixels.sort((a, b) => b.s - a.s);

  // Deduplicate by hue angle distance
  const distinct = [];
  for (const px of pixels) {
    const { h } = rgbToHsl(px.r, px.g, px.b);
    const tooClose = distinct.some(d => {
      const dh = rgbToHsl(d.r, d.g, d.b).h;
      const hueDist = Math.min(Math.abs(h - dh), 360 - Math.abs(h - dh));
      const colorDist = Math.sqrt(Math.pow(px.r-d.r,2) + Math.pow(px.g-d.g,2) + Math.pow(px.b-d.b,2));
      return hueDist < 30 && colorDist < 60;
    });
    if (!tooClose) distinct.push(px);
    if (distinct.length >= count) break;
  }

  // Fallback: if we still got nothing (very monochrome movie like black & white), use raw pixels
  if (!distinct.length) {
    const raw = [];
    for (let i = 0; i < boosted.length; i += channels) {
      raw.push({ r: boosted[i], g: boosted[i+1], b: boosted[i+2] });
    }
    for (const px of raw) {
      const tooClose = distinct.some(d => Math.sqrt(Math.pow(px.r-d.r,2)+Math.pow(px.g-d.g,2)+Math.pow(px.b-d.b,2)) < 80);
      if (!tooClose) distinct.push(px);
      if (distinct.length >= count) break;
    }
  }

  return distinct.map(({ r, g, b }) => ({ r, g, b, hex: toHex(r, g, b) }));
}

// Shift a color for dark/light mode
function themeShift(r, g, b, themeMode) {
  if (themeMode === 'light') {
    // Wash toward white for soft pastels
    const nr = Math.min(255, r * 0.6 + 255 * 0.4);
    const ng = Math.min(255, g * 0.6 + 255 * 0.4);
    const nb = Math.min(255, b * 0.6 + 255 * 0.4);
    return toHex(nr, ng, nb);
  } else {
    // Deepen but keep saturation high
    const nr = r * 0.75;
    const ng = g * 0.75;
    const nb = b * 0.75;
    return toHex(nr, ng, nb);
  }
}

function buildSvg(palette, width, height, style, themeMode) {
  const W = width, H = height;
  const bg = themeMode === 'dark' ? '#050505' : '#f8f8f8';
  const c = palette; // array of { hex, r, g, b }

  if (style === 'Linear Mesh') {
    // Figma-style mesh: many overlapping radial gradients create a smooth multi-color blend
    // Key: use NO blur here — the radial gradients blending together IS the mesh effect
    const positions = [
      [0.05, 0.1], [0.95, 0.05], [0.5, 0.5],
      [0.1, 0.9], [0.9, 0.9], [0.55, 0.1],
      [0.2, 0.5], [0.8, 0.4]
    ];
    const gradients = c.map((col, i) => {
      const [px, py] = positions[i % positions.length];
      return `<radialGradient id="m${i}" cx="${px*100}%" cy="${py*100}%" r="80%" gradientUnits="userSpaceOnUse" fx="${px*100}%" fy="${py*100}%">
        <stop offset="0%"   stop-color="${col.hex}" stop-opacity="0.95"/>
        <stop offset="60%"  stop-color="${col.hex}" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="${col.hex}" stop-opacity="0"/>
      </radialGradient>`;
    });
    return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>${gradients.join('\n')}</defs>
      <rect width="${W}" height="${H}" fill="${bg}"/>
      ${c.map((_, i) => `<rect width="${W}" height="${H}" fill="url(#m${i})"/>`).join('\n')}
    </svg>`;
  }

  if (style === 'Paper Cutout') {
    return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
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
  }

  if (style === 'Fluid Grain') {
    return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
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
  }

  if (style === 'Abstract Bauhaus') {
    let dots = '';
    for(let dx=0; dx<4; dx++){
      for(let dy=0; dy<4; dy++){
        dots += `<circle cx="${W*0.7 + dx*W*0.05}" cy="${H*0.6 + dy*W*0.05}" r="${W*0.015}"/>\n`;
      }
    }
    
    return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
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
        ${dots}
      </g>
    </svg>`;
  }

  if (style === 'Neon Retro-Wave') {
    return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
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
      <circle cx="${W*0.5}" cy="${H*0.5}" r="${W*0.3}" fill="url(#sun)" filter="url(#glow)"/>
      <rect x="0" y="${H*0.45}" width="${W}" height="${H*0.01}" fill="url(#sky)"/>
      <rect x="0" y="${H*0.49}" width="${W}" height="${H*0.015}" fill="url(#sky)"/>
      <rect x="0" y="${H*0.54}" width="${W}" height="${H*0.02}" fill="url(#sky)"/>
      <rect x="0" y="${H*0.6}" width="${W}" height="${H*0.03}" fill="url(#sky)"/>
      <rect x="0" y="${H*0.65}" width="${W}" height="${H*0.35}" fill="#050510"/>
      <g stroke="${c[3].hex}" stroke-width="2" filter="url(#glow)" opacity="0.6">
        ${Array.from({length: 10}).map((_, i) => {
          const y = H*0.65 + Math.pow(i/9, 2) * H*0.35;
          return `<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`;
        }).join('\\n')}
        ${Array.from({length: 11}).map((_, i) => {
          const xTop = W * 0.5 + (i - 5) * (W * 0.05);
          const xBottom = W * 0.5 + (i - 5) * (W * 0.3);
          return `<line x1="${xTop}" y1="${H*0.65}" x2="${xBottom}" y2="${H}"/>`;
        }).join('\\n')}
      </g>
    </svg>`;
  }

  // Fallback to Glassmorphism
  const lineColor = themeMode === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const blobs = [
    { cx: 0.12, cy: 0.20, r: 0.52, ci: 0, op: 1.0 },
    { cx: 0.88, cy: 0.78, r: 0.58, ci: 2, op: 0.9 },
    { cx: 0.75, cy: 0.15, r: 0.40, ci: 3, op: 0.8 },
    { cx: 0.22, cy: 0.82, r: 0.44, ci: 4 % c.length, op: 0.7 },
    { cx: 0.50, cy: 0.50, r: 0.30, ci: 1, op: 0.65 }
  ];
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="bokeh" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="75"/>
      </filter>
    </defs>
    <rect width="${W}" height="${H}" fill="${bg}"/>
    <g filter="url(#bokeh)">
      ${blobs.map(b => `<circle cx="${b.cx*W}" cy="${b.cy*H}" r="${Math.min(W,H)*b.r}" fill="${c[b.ci].hex}" opacity="${b.op}"/>`).join('\n')}
    </g>
    ${Array.from({length:7},(_,i)=>`<line x1="0" y1="${H*(i+1)/8}" x2="${W}" y2="${H*(i+1)/8}" stroke="${lineColor}" stroke-width="1"/>`).join('\n')}
    ${Array.from({length:9},(_,i)=>`<line x1="${W*(i+1)/10}" y1="0" x2="${W*(i+1)/10}" y2="${H}" stroke="${lineColor}" stroke-width="1"/>`).join('\n')}
  </svg>`;
}

const generateWallpaper = async (req, res) => {
  try {
    const { tmdbId, mediaType, style = 'Linear Mesh', type = 'desktop', themeMode = 'dark' } = req.body;

    const normalizedTmdbId = Number(tmdbId);
    if (!Number.isInteger(normalizedTmdbId) || normalizedTmdbId <= 0 || !['movie', 'tv'].includes(mediaType)) {
      return res.status(400).json({ error: 'A valid title and media type are required' });
    }
    if (!ALLOWED_STYLES.has(style) || !['desktop', 'mobile'].includes(type) || !['dark', 'light'].includes(themeMode)) {
      return res.status(400).json({ error: 'Invalid wallpaper configuration' });
    }

    // 1. Fetch image list from TMDB (with Cache)
    const axios = require('axios');
    const cacheKey = `images_${mediaType}_${normalizedTmdbId}`;
    let data = tmdbImageCache.get(cacheKey);

    if (!data) {
      const tmdbRes = await axios.get(
        `https://api.tmdb.org/3/${mediaType}/${normalizedTmdbId}/images?api_key=${process.env.TMDB_API_KEY}`,
        { headers: { 
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }, timeout: 10000, maxContentLength: 2 * 1024 * 1024 }
      );
      data = tmdbRes.data;
      cacheTmdbImages(cacheKey, data);
    }
    const pool = [...(data.backdrops || []), ...(data.posters || [])].slice(0, 20);
    if (!pool.length) throw new Error('No images found for this media.');

    // 2. Randomly pick 3 scenes for palette variety
    const chosen = pool.sort(() => Math.random() - 0.5).slice(0, 3);

    // 3. Fetch and extract vivid palettes in parallel
    const palettes = await Promise.allSettled(chosen.map(async (item) => {
      const url = `https://wsrv.nl/?url=image.tmdb.org/t/p/w500${item.file_path}`;
      const r = await axios.get(url, { 
        responseType: 'arraybuffer',
        headers: { 'User-Agent': 'Mozilla/5.0' },
        timeout: 10000,
        maxContentLength: 10 * 1024 * 1024,
      });
      const buf = Buffer.from(r.data);
      return extractVividPalette(buf, 4);
    }));

    const allColors = palettes
      .filter(p => p.status === 'fulfilled')
      .flatMap(p => p.value);

    if (!allColors.length) throw new Error('Color extraction failed.');

    // 4. Deduplicate across scenes by hue
    const palette = [];
    for (const color of allColors) {
      const { h } = rgbToHsl(color.r, color.g, color.b);
      const tooClose = palette.some(d => {
        const dh = rgbToHsl(d.r, d.g, d.b).h;
        const hueDist = Math.min(Math.abs(h - dh), 360 - Math.abs(h - dh));
        return hueDist < 25 && Math.sqrt(Math.pow(color.r-d.r,2)+Math.pow(color.g-d.g,2)+Math.pow(color.b-d.b,2)) < 55;
      });
      if (!tooClose) palette.push(color);
      if (palette.length >= 8) break;
    }

    // Pad if needed
    while (palette.length < 8) {
      const base = palette[palette.length % Math.max(1, palette.length)];
      const shift = palette.length * 20;
      palette.push({
        r: Math.min(255, (base.r + shift) % 256),
        g: Math.min(255, (base.g + shift * 2) % 256),
        b: Math.min(255, (base.b + shift) % 256),
        hex: toHex(
          Math.min(255, (base.r + shift) % 256),
          Math.min(255, (base.g + shift * 2) % 256),
          Math.min(255, (base.b + shift) % 256)
        )
      });
    }

    // 5. Apply theme shift to the whole palette
    const themedPalette = palette.map(col => ({
      ...col,
      hex: themeShift(col.r, col.g, col.b, themeMode)
    }));

    // 6. Build the SVG composition
    const width = type === 'desktop' ? 1920 : 1080;
    const height = type === 'desktop' ? 1080 : 1920;
    const svg = buildSvg(themedPalette, width, height, style, themeMode);

    // 7. Render SVG → PNG
    const finalBuffer = await sharp(Buffer.from(svg))
      .png({ compressionLevel: 9, quality: 90 })
      .toBuffer();

    return res.json({ success: true, base64: finalBuffer.toString('base64') });

  } catch (error) {
    console.error('Wallpaper generation error:', error.message);
    res.status(500).json({ error: 'Failed to generate wallpaper. Please try again later.' });
  }
};

module.exports = { generateWallpaper };
