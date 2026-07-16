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
    
    // 2. Select the best backdrop (or poster for mobile if preferred, but backdrop cropped looks great)
    let imageUrl = null;
    
    // Find highest rated textless backdrop
    if (data.backdrops && data.backdrops.length > 0) {
      // TMDB already sorts by vote_average
      const bestBackdrop = data.backdrops.find(b => b.iso_639_1 === null) || data.backdrops[0];
      imageUrl = `https://image.tmdb.org/t/p/original${bestBackdrop.file_path}`;
    } else if (data.posters && data.posters.length > 0) {
      imageUrl = `https://image.tmdb.org/t/p/original${data.posters[0].file_path}`;
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

    // 4. Process the image with sharp based on style and device type
    const width = type === 'desktop' ? 1920 : 1080;
    const height = type === 'desktop' ? 1080 : 1920;

    let processedImage = sharp(buffer).resize(width, height, { fit: 'cover' });

    // Algorithmic composition based on selected style
    if (style === 'Minimalist') {
      processedImage = processedImage
        .blur(100) // Huge blur to create a gradient map
        .modulate({ brightness: 0.8, saturation: 1.2 }); // Deepen the colors
    } else if (style === 'Cyberpunk' || style === 'Synthwave') {
      processedImage = processedImage
        .blur(30)
        .tint({ r: 255, g: 0, b: 150 }) // Neon pink tint overlay
        .modulate({ brightness: 0.7, saturation: 1.5 });
    } else if (style === 'Dark Fantasy') {
      processedImage = processedImage
        .blur(20)
        .modulate({ brightness: 0.5, saturation: 0.8 }); // Darken and desaturate
    } else if (style === 'Watercolor' || style === 'Oil Painting') {
      processedImage = processedImage
        .blur(15)
        .modulate({ saturation: 1.4 }); // Enhance colors slightly
    } else if (style === 'Studio Ghibli') {
      processedImage = processedImage
        .blur(10)
        .modulate({ brightness: 1.1, saturation: 1.3 });
    }
    // "Cinematic" just returns the high-res cropped image as is.

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
