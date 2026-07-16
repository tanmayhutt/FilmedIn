const sharp = require('sharp');

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

  if (style === 'Radial Glow') {
    // Glowing orbs on deep background — proper filter bounds so circles don't get clipped
    const orbs = [
      { cx: 0.22, cy: 0.28, r: 0.44, ci: 0, op: 0.92 },
      { cx: 0.78, cy: 0.72, r: 0.50, ci: 2, op: 0.82 },
      { cx: 0.68, cy: 0.18, r: 0.32, ci: 3, op: 0.70 },
      { cx: 0.28, cy: 0.80, r: 0.30, ci: 4 % c.length, op: 0.60 },
      { cx: 0.52, cy: 0.50, r: 0.22, ci: 1, op: 0.50 }
    ];
    const orbSvgs = orbs.map(o =>
      `<circle cx="${o.cx*W}" cy="${o.cy*H}" r="${Math.min(W,H)*o.r}" fill="${c[o.ci].hex}" opacity="${o.op}"/>`
    );
    return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bggrad" cx="50%" cy="50%" r="70%">
          <stop offset="0%"   stop-color="${themeShift(c[1].r, c[1].g, c[1].b, themeMode)}" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="${bg}"/>
        </radialGradient>
        <filter id="bigblur" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="55"/>
        </filter>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#bggrad)"/>
      <g filter="url(#bigblur)">${orbSvgs.join('\n')}</g>
    </svg>`;
  }

  if (style === 'Atmospheric Fade') {
    // Rich diagonal + a cross-axis overlay for depth
    return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="diag" x1="0%" y1="0%" x2="100%" y2="100%">
          ${c.slice(0,5).map((col,i) =>
            `<stop offset="${Math.round(i*100/(c.slice(0,5).length-1))}%" stop-color="${col.hex}"/>`
          ).join('\n')}
        </linearGradient>
        <linearGradient id="cross" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stop-color="${c[2].hex}" stop-opacity="0.5"/>
          <stop offset="40%"  stop-color="${c[0].hex}" stop-opacity="0.1"/>
          <stop offset="100%" stop-color="${c[4%c.length].hex}" stop-opacity="0.5"/>
        </linearGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#diag)"/>
      <rect width="${W}" height="${H}" fill="url(#cross)"/>
    </svg>`;
  }

  if (style === 'Glassmorphism') {
    // Bokeh blobs + visible grid lines — the grid gives the "glass panel" feel
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

  // Soft Pastels — very soft ellipses with heavy blur, light or dark canvas
  const pastelBg = themeMode === 'light' ? '#ffffff' : '#080808';
  return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="wash" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="110"/>
      </filter>
    </defs>
    <rect width="${W}" height="${H}" fill="${pastelBg}"/>
    <g filter="url(#wash)">
      ${c.map((col, i) => {
        const cx = ((i * 79 + 8) % 100);
        const cy = ((i * 53 + 12) % 100);
        const rx = Math.min(W, H) * (0.42 + (i % 3) * 0.12);
        const ry = Math.min(W, H) * (0.32 + (i % 2) * 0.18);
        return `<ellipse cx="${cx}%" cy="${cy}%" rx="${rx}" ry="${ry}" fill="${col.hex}" opacity="${0.85 - i * 0.05}"/>`;
      }).join('\n')}
    </g>
  </svg>`;
}

const generateWallpaper = async (req, res) => {
  try {
    const { tmdbId, mediaType, style = 'Linear Mesh', type = 'desktop', themeMode = 'dark' } = req.body;

    if (!tmdbId || !mediaType) {
      return res.status(400).json({ error: 'Missing TMDB ID or Media Type' });
    }

    // 1. Fetch image list from TMDB
    const tmdbRes = await fetch(
      `https://api.themoviedb.org/3/${mediaType === 'tv' ? 'tv' : 'movie'}/${tmdbId}/images?api_key=${process.env.TMDB_API_KEY}`
    );
    if (!tmdbRes.ok) throw new Error('Failed to fetch from TMDB API');

    const data = await tmdbRes.json();
    const pool = [...(data.backdrops || []), ...(data.posters || [])].slice(0, 20);
    if (!pool.length) throw new Error('No images found for this media.');

    // 2. Randomly pick 3 scenes for palette variety
    const chosen = pool.sort(() => Math.random() - 0.5).slice(0, 3);

    // 3. Fetch and extract vivid palettes in parallel
    const palettes = await Promise.allSettled(chosen.map(async (item) => {
      const url = `https://image.tmdb.org/t/p/w500${item.file_path}`;
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!r.ok) return [];
      const buf = Buffer.from(await r.arrayBuffer());
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

    // 7. Render SVG → JPEG
    const finalBuffer = await sharp(Buffer.from(svg))
      .jpeg({ quality: 94 })
      .toBuffer();

    return res.json({ success: true, base64: finalBuffer.toString('base64') });

  } catch (error) {
    console.error('Wallpaper generation error:', error.message);
    res.status(500).json({ error: 'Failed to generate wallpaper. Please try again later.' });
  }
};

module.exports = { generateWallpaper };
