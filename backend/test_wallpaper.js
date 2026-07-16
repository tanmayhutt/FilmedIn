require('dotenv').config();
const fs = require('fs');
const { generateWallpaper } = require('./src/controllers/wallpaper.controller');

const run = async (style, themeMode, type = 'desktop') => {
  const req = { body: { tmdbId: 1396, mediaType: 'tv', style, type, themeMode } }; // Breaking Bad
  let result = null;
  const res = {
    json: (d) => { result = d; },
    status: (code) => ({ json: (d) => { result = { error: d.error, code }; } })
  };
  await generateWallpaper(req, res);
  if (result?.base64) {
    const filename = `preview_${style.replace(/ /g,'_')}_${themeMode}.jpg`;
    fs.writeFileSync(filename, Buffer.from(result.base64, 'base64'));
    console.log(`✅ [${style} / ${themeMode}] → saved ${filename}`);
  } else {
    console.error(`❌ [${style} / ${themeMode}]:`, result?.error);
  }
};

(async () => {
  await run('Linear Mesh', 'dark');
  await run('Radial Glow', 'dark');
  await run('Atmospheric Fade', 'dark');
  await run('Glassmorphism', 'light');
  await run('Soft Pastels', 'light');
})();
