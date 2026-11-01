const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcIcon = path.join(__dirname, '../src-tauri/icons/icon-512.png');
const resDir = path.join(__dirname, '../src-tauri/gen/android/app/src/main/res');

const densities = [
  { dir: 'mipmap-mdpi', size: 48, fgSize: 108 },
  { dir: 'mipmap-hdpi', size: 72, fgSize: 162 },
  { dir: 'mipmap-xhdpi', size: 96, fgSize: 216 },
  { dir: 'mipmap-xxhdpi', size: 144, fgSize: 324 },
  { dir: 'mipmap-xxxhdpi', size: 192, fgSize: 432 },
];

async function generateIcons() {
  for (const { dir, size, fgSize } of densities) {
    const targetFolder = path.join(resDir, dir);
    if (!fs.existsSync(targetFolder)) {
      fs.mkdirSync(targetFolder, { recursive: true });
    }

    // 1. ic_launcher.png (standard square/rounded icon)
    await sharp(srcIcon)
      .resize(size, size, { fit: 'cover' })
      .png()
      .toFile(path.join(targetFolder, 'ic_launcher.png'));

    // 2. ic_launcher_round.png (circular masked icon)
    const circleSvg = Buffer.from(
      `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/></svg>`
    );
    await sharp(srcIcon)
      .resize(size, size, { fit: 'cover' })
      .composite([{ input: circleSvg, blend: 'dest-in' }])
      .png()
      .toFile(path.join(targetFolder, 'ic_launcher_round.png'));

    // 3. ic_launcher_foreground.png (centered inside 108dp canvas with safe zone padding)
    const innerSize = Math.round(fgSize * 0.72);
    const innerBuf = await sharp(srcIcon)
      .resize(innerSize, innerSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();

    const top = Math.round((fgSize - innerSize) / 2);
    const left = Math.round((fgSize - innerSize) / 2);

    await sharp({
      create: {
        width: fgSize,
        height: fgSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([{ input: innerBuf, top, left }])
      .png()
      .toFile(path.join(targetFolder, 'ic_launcher_foreground.png'));

    console.log(`Generated icons for ${dir} (${size}x${size}, fg ${fgSize}x${fgSize})`);
  }

  // 4. Create mipmap-anydpi-v26 for Android 8.0+ adaptive icons
  const anydpiDir = path.join(resDir, 'mipmap-anydpi-v26');
  if (!fs.existsSync(anydpiDir)) {
    fs.mkdirSync(anydpiDir, { recursive: true });
  }

  const adaptiveXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
</adaptive-icon>
`;

  fs.writeFileSync(path.join(anydpiDir, 'ic_launcher.xml'), adaptiveXml);
  fs.writeFileSync(path.join(anydpiDir, 'ic_launcher_round.xml'), adaptiveXml);
  console.log('Created mipmap-anydpi-v26 adaptive icon XMLs');

  // 5. Update drawable/ic_launcher_background.xml to sleek dark navy (#0B0F19)
  const bgDir = path.join(resDir, 'drawable');
  if (!fs.existsSync(bgDir)) {
    fs.mkdirSync(bgDir, { recursive: true });
  }
  const bgXml = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#0B0F19"
        android:pathData="M0,0h108v108h-108z" />
</vector>
`;
  fs.writeFileSync(path.join(bgDir, 'ic_launcher_background.xml'), bgXml);
  console.log('Updated ic_launcher_background.xml');

  // 6. Remove old robot vector in drawable-v24/ic_launcher_foreground.xml if it exists
  const oldFg = path.join(resDir, 'drawable-v24/ic_launcher_foreground.xml');
  if (fs.existsSync(oldFg)) {
    fs.unlinkSync(oldFg);
    console.log('Removed old robot vector in drawable-v24/ic_launcher_foreground.xml');
  }

  console.log('All Android icons successfully regenerated for DataAbeg!');
}

generateIcons().catch(console.error);
