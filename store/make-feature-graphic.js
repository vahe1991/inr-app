const sharp = require("sharp");
const path = require("path");

const src = path.join(__dirname, "..", "assets", "images", "splash-icon.png");
const out = path.join(__dirname, "feature-graphic.png");
const out2x = path.join(__dirname, "feature-graphic-2048.png");

async function banner(width, height, logoWidth, logoHeight, dest) {
  const logo = await sharp(src)
    .resize({ width: logoWidth, height: logoHeight, fit: "inside" })
    .png()
    .toBuffer();
  const meta = await sharp(logo).metadata();
  await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .composite([
      {
        input: logo,
        left: Math.round((width - meta.width) / 2),
        top: Math.round((height - meta.height) / 2),
      },
    ])
    .png()
    .toFile(dest);
  const done = await sharp(dest).metadata();
  console.log(path.basename(dest), `${done.width}x${done.height}`);
}

(async () => {
  await banner(1024, 500, 720, 420, out);
  await banner(2048, 1000, 1440, 840, out2x);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
