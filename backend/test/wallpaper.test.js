process.env.NODE_ENV = 'test';

const test = require('node:test');
const assert = require('node:assert/strict');
const sharp = require('sharp');
const { buildSvg } = require('../src/controllers/wallpaper.controller');

const palette = [
  { hex: '#0b1026' },
  { hex: '#182b52' },
  { hex: '#315781' },
  { hex: '#7f68a7' },
  { hex: '#dc8d74' },
  { hex: '#f1c792' },
  { hex: '#7b596f' },
  { hex: '#111827' },
];

test('cinematic landscape produces a valid desktop wallpaper', async () => {
  const svg = buildSvg(palette, 1920, 1080, 'Cinematic Landscape', 'dark');

  assert.match(svg, /<svg/);
  assert.match(svg, /landscapeSky/);
  assert.match(svg, /<path/);

  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  const metadata = await sharp(png).metadata();

  assert.equal(metadata.format, 'png');
  assert.equal(metadata.width, 1920);
  assert.equal(metadata.height, 1080);
});

test('cinematic landscape supports mobile dimensions', async () => {
  const svg = buildSvg(palette, 1080, 1920, 'Cinematic Landscape', 'light');
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  const metadata = await sharp(png).metadata();

  assert.equal(metadata.width, 1080);
  assert.equal(metadata.height, 1920);
});
