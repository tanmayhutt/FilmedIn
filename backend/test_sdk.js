require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
ai.models.generateImages({
  model: 'imagen-3.0-generate-001',
  prompt: 'A cinematic desktop wallpaper',
  config: { numberOfImages: 1, aspectRatio: '16:9', outputMimeType: 'image/jpeg' }
})
.then(response => {
  console.log("Success! Length:", response.generatedImages[0].image.imageBytes.length);
})
.catch(err => {
  console.error("SDK Error:", err.message);
});
