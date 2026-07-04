// 產生 icon / adaptive-icon / splash PNG(零依賴,品牌視覺 = 計時圓環)
// 用法: node scripts/gen-assets.js
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// --- 最小 PNG encoder (RGBA, 8-bit) ---
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function encodePng(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    raw[y * (1 + width * 4)] = 0; // filter: none
    rgba.copy(raw, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// --- 繪圖:背景 + 圓環 + 頂端進度點 ---
const CORAL = [0xe8, 0x73, 0x4a];
const WHITE = [0xff, 0xff, 0xff];

function drawRingImage({ size, bg, fg, rMid, halfW, dotR }) {
  const rgba = Buffer.alloc(size * size * 4);
  const c = size / 2;
  const dotY = c - rMid;
  const edge = 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dist = Math.hypot(x - c + 0.5, y - c + 0.5);
      const ringA = Math.max(0, Math.min(1, (halfW + edge / 2 - Math.abs(dist - rMid)) / edge));
      const dotDist = Math.hypot(x - c + 0.5, y - dotY + 0.5);
      const dotA = Math.max(0, Math.min(1, (dotR + edge / 2 - dotDist) / edge));
      const a = Math.max(ringA, dotA);
      const i = (y * size + x) * 4;
      if (bg) {
        rgba[i] = Math.round(bg[0] + (fg[0] - bg[0]) * a);
        rgba[i + 1] = Math.round(bg[1] + (fg[1] - bg[1]) * a);
        rgba[i + 2] = Math.round(bg[2] + (fg[2] - bg[2]) * a);
        rgba[i + 3] = 255;
      } else {
        rgba[i] = fg[0];
        rgba[i + 1] = fg[1];
        rgba[i + 2] = fg[2];
        rgba[i + 3] = Math.round(255 * a);
      }
    }
  }
  return encodePng(size, size, rgba);
}

const outDir = path.join(__dirname, '../assets/images');
fs.mkdirSync(outDir, { recursive: true });

// App icon:珊瑚橘底 + 白色圓環
fs.writeFileSync(
  path.join(outDir, 'icon.png'),
  drawRingImage({ size: 1024, bg: CORAL, fg: WHITE, rMid: 280, halfW: 46, dotR: 78 })
);
// Android adaptive foreground:透明底白環(縮小以符合安全區)
fs.writeFileSync(
  path.join(outDir, 'adaptive-icon.png'),
  drawRingImage({ size: 1024, bg: null, fg: WHITE, rMid: 210, halfW: 36, dotR: 60 })
);
// Splash icon:透明底珊瑚橘環(splash 背景色由 app.json 控制,深淺色皆可用)
fs.writeFileSync(
  path.join(outDir, 'splash-icon.png'),
  drawRingImage({ size: 512, bg: null, fg: CORAL, rMid: 140, halfW: 24, dotR: 40 })
);

for (const f of ['icon.png', 'adaptive-icon.png', 'splash-icon.png']) {
  const b = fs.readFileSync(path.join(outDir, f));
  console.log(f, b.length, 'bytes, PNG:', b.slice(1, 4).toString() === 'PNG');
}
