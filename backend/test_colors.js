const sharp = require('sharp');
async function run() {
  const colors = ['#7a8e85', '#2c373b', '#222c2b', '#536360', '#535459', '#455759', '#627198', '#5d6e8c', '#3f4d68'];
  const svg = `
    <svg width="1920" height="1080">
      <rect width="100%" height="100%" fill="${colors[1]}" />
      <circle cx="20%" cy="20%" r="600" fill="${colors[0]}" />
      <circle cx="80%" cy="80%" r="800" fill="${colors[6]}" />
      <circle cx="70%" cy="20%" r="500" fill="${colors[3]}" />
      <circle cx="20%" cy="80%" r="700" fill="${colors[7]}" />
    </svg>
  `;
  await sharp(Buffer.from(svg))
    .blur(100) // Huge blur to create mesh gradient!
    .jpeg({ quality: 90 })
    .toFile('mesh_gradient.jpg');
  console.log('Done!');
}
run();
