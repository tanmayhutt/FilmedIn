require('dotenv').config();
const { generateWallpaper } = require('./src/controllers/wallpaper.controller');

const req = {
  body: {
    tmdbId: 157336, // Interstellar
    mediaType: 'movie',
    style: 'Minimalist',
    type: 'desktop'
  }
};

const res = {
  status: (code) => ({
    json: (data) => console.log('Status', code, data)
  }),
  json: (data) => {
    if(data.base64) {
      console.log('SUCCESS! Base64 Length:', data.base64.length);
    } else {
      console.log(data);
    }
  }
};

generateWallpaper(req, res);
