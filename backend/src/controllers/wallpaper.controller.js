const sharp = require('sharp');

const generateWallpaper = async (req, res) => {
  try {
    const { tmdbId, mediaType, style, type, themeMode = 'dark' } = req.body;

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
      // Pick a random backdrop from the top 15 to ensure variety
      const maxIndex = Math.min(data.backdrops.length, 15);
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

    // 4. Process image based on theme and style
    const width = type === 'desktop' ? 1920 : 1080;
    const height = type === 'desktop' ? 1080 : 1920;
    
    let processedImage = sharp(buffer).resize(width, height, { fit: 'cover' });

    // Base optical blur to create the organic gradient
    // Different styles can have different blur amounts
    let blurAmount = 100;
    
    if (style === 'Glassmorphism') blurAmount = 60;
    if (style === 'Atmospheric Fade') blurAmount = 150;
    if (style === 'Soft Pastels') blurAmount = 80;
    
    processedImage = processedImage.blur(blurAmount);

    // Apply Light/Dark Mode modulation
    if (themeMode === 'dark') {
      if (style === 'Soft Pastels') {
        processedImage = processedImage.modulate({ brightness: 0.7, saturation: 1.1 });
      } else if (style === 'Atmospheric Fade') {
        processedImage = processedImage.modulate({ brightness: 0.4, saturation: 1.3 });
      } else {
        processedImage = processedImage.modulate({ brightness: 0.5, saturation: 1.2 });
      }
    } else { // Light Mode
      if (style === 'Soft Pastels') {
        processedImage = processedImage.modulate({ brightness: 1.5, saturation: 0.8 });
      } else if (style === 'Atmospheric Fade') {
        processedImage = processedImage.modulate({ brightness: 1.2, saturation: 1.1 });
      } else {
        processedImage = processedImage.modulate({ brightness: 1.3, saturation: 1.0 });
      }
    }

    // Generate noise/grain overlay dynamically using SVG
    // We create an SVG with a noise filter and composite it over the image
    const noiseSvg = `
      <svg width="${width}" height="${height}">
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/>
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" opacity="0.08" />
      </svg>
    `;
    
    processedImage = processedImage.composite([{ input: Buffer.from(noiseSvg), blend: 'overlay' }]);

    // 5. Render to JPEG buffer
    const finalBuffer = await processedImage.jpeg({ quality: 90 }).toBuffer();
    const base64Image = finalBuffer.toString('base64');

    return res.json({ success: true, base64: base64Image });

  } catch (error) {
    console.error('Error generating organic algorithmic wallpaper:', error);
    res.status(500).json({ error: 'Failed to generate wallpaper. Please try again later.' });
  }
};

module.exports = {
  generateWallpaper
};
