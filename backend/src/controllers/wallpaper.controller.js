const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const generateWallpaper = async (req, res) => {
  try {
    const { title, type, style } = req.body;

    if (!title || !type || !style) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const aspectRatio = type === 'desktop' ? '16:9' : '9:16';
    const prompt = `Cinematic ${type} wallpaper (${aspectRatio} ratio) of ${title} in ${style} style, highly detailed, dramatic lighting, no text, no watermarks, masterpiece.`;

    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: aspectRatio,
        outputMimeType: 'image/jpeg',
      }
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64Image = response.generatedImages[0].image.imageBytes;
      return res.json({ success: true, base64: base64Image });
    } else {
      throw new Error('No image was returned from the API.');
    }
  } catch (error) {
    console.error('Error generating wallpaper:', error);
    res.status(500).json({ error: 'Failed to generate wallpaper. Please try again later.' });
  }
};

module.exports = {
  generateWallpaper
};
