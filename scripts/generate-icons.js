const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generateIcons() {
  const sizes = {
    favicon: 32,
    icon: 192,
    'apple-icon': 180
  };

  const inputSvg = path.join(__dirname, '..', 'public', 'icon.svg');
  const svgBuffer = fs.readFileSync(inputSvg);

  for (const [name, size] of Object.entries(sizes)) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(__dirname, '..', 'public', `${name}.png`));
    
    // For favicon, we'll just use a small PNG since ICO is not directly supported
    if (name === 'favicon') {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(__dirname, '..', 'public', 'favicon.ico'));
    }
  }
}

generateIcons().catch(console.error);
