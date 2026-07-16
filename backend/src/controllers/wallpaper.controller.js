const sharp = require('sharp');

const generateWallpaper = async (req, res) => {
  try {
    const { tmdbId, mediaType, style, type } = req.body;

    if (!tmdbId || !mediaType) {
      return res.status(400).json({ error: 'Missing TMDB ID or Media Type' });
    }

    // 1. Fetch images from TMDB
    const tmdbRes = await fetch(
      `https://api.themoviedb.org/3/${mediaType === 'tv' ? 'tv' : 'movie'}/${tmdbId}/images?api_key=${process.env.TMDB_API_KEY}`
    );
    
    if (!tmdbRes.ok) {
      throw new Error('Failed to fetch from TMDB API');
    }
    
    const data = await tmdbRes.json();
    
    // 2. Shuffle and pick a random backdrop
    let imageUrl = null;
    
    if (data.backdrops && data.backdrops.length > 0) {
      // Pick a random backdrop from the top 10 (or less if fewer exist) to ensure variety but keep quality
      const maxIndex = Math.min(data.backdrops.length, 10);
      const randomIndex = Math.floor(Math.random() * maxIndex);
      imageUrl = `https://image.tmdb.org/t/p/w1280${data.backdrops[randomIndex].file_path}`;
    } else if (data.posters && data.posters.length > 0) {
      imageUrl = `https://image.tmdb.org/t/p/w780${data.posters[0].file_path}`;
    }

    if (!imageUrl) {
      throw new Error('No images found for this media.');
    }

    // 3. Fetch the raw image buffer
    const imgFetch = await fetch(imageUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    if (!imgFetch.ok) {
      throw new Error(`Failed to download image from TMDB: ${imgFetch.status}`);
    }
    const arrayBuffer = await imgFetch.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Extract Color Palette using sharp
    // Resize to 3x3 (9 pixels) using nearest neighbor to get raw dominant colors
    const { data: pixelData, info } = await sharp(buffer)
      .resize(3, 3, { kernel: 'nearest' })
      .raw()
      .toBuffer({ resolveWithObject: true });

    let colors = [];
    for (let i = 0; i < pixelData.length; i += info.channels) {
      const r = pixelData[i];
      const g = pixelData[i+1];
      const b = pixelData[i+2];
      colors.push(`#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`);
    }

    // 5. Generate SVG composition based on style
    const width = type === 'desktop' ? 1920 : 1080;
    const height = type === 'desktop' ? 1080 : 1920;
    
    let svg = '';
    let blurAmount = 0;

    if (style === 'Linear Mesh') {
      svg = `
        <svg width="${width}" height="${height}">
          <defs>
            <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="${colors[0]}" />
              <stop offset="50%" stop-color="${colors[4]}" />
              <stop offset="100%" stop-color="${colors[8]}" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#g1)" />
        </svg>
      `;
    } else if (style === 'Radial Glow') {
      svg = `
        <svg width="${width}" height="${height}">
          <defs>
            <radialGradient id="r1" cx="50%" cy="50%" r="75%">
              <stop offset="0%" stop-color="${colors[4]}" />
              <stop offset="100%" stop-color="${colors[1]}" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#r1)" />
        </svg>
      `;
    } else if (style === 'Atmospheric Fade') {
      svg = `
        <svg width="${width}" height="${height}">
          <defs>
            <linearGradient id="a1" x1="50%" y1="100%" x2="50%" y2="0%">
              <stop offset="0%" stop-color="${colors[7]}" />
              <stop offset="100%" stop-color="${colors[2]}" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#a1)" />
        </svg>
      `;
    } else if (style === 'Glassmorphism') {
      // Mesh gradient approach: Draw scattered circles and heavily blur
      svg = `
        <svg width="${width}" height="${height}">
          <rect width="100%" height="100%" fill="${colors[4]}" />
          <circle cx="20%" cy="20%" r="40%" fill="${colors[0]}" />
          <circle cx="80%" cy="80%" r="50%" fill="${colors[8]}" />
          <circle cx="70%" cy="20%" r="30%" fill="${colors[2]}" />
          <circle cx="20%" cy="80%" r="45%" fill="${colors[6]}" />
        </svg>
      `;
      blurAmount = 150;
    } else { // Soft Pastels
      svg = `
        <svg width="${width}" height="${height}">
          <defs>
            <linearGradient id="p" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="${colors[3]}" />
              <stop offset="50%" stop-color="${colors[4]}" />
              <stop offset="100%" stop-color="${colors[5]}" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#p)" />
          <rect width="100%" height="100%" fill="#ffffff" fill-opacity="0.2" />
        </svg>
      `;
    }

    // 6. Render SVG to image buffer
    let processedImage = sharp(Buffer.from(svg));
    if (blurAmount > 0) {
      processedImage = processedImage.blur(blurAmount);
    }

    const finalBuffer = await processedImage.jpeg({ quality: 90 }).toBuffer();
    const base64Image = finalBuffer.toString('base64');

    return res.json({ success: true, base64: base64Image });

  } catch (error) {
    console.error('Error generating algorithmic wallpaper:', error);
    res.status(500).json({ error: 'Failed to generate wallpaper. Please try again later.' });
  }
};

module.exports = {
  generateWallpaper
};
