// 零依賴 PWA 圖示產生器：用 Node 內建 zlib 手刻 PNG，畫一個極簡蘑菇剪影。
// 用法：node scripts/generate-icons.mjs
// 產出至 public/：pwa-192.png、pwa-512.png、pwa-maskable-512.png、apple-touch-icon.png
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'public')

// 顏色（RGBA）
const GREEN = [101, 163, 13, 255] // #65a30d 品牌綠
const WHITE = [255, 255, 255, 255]

// ---- PNG 編碼 ----
const crcTable = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

const crc32 = (buf) => {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

const chunk = (type, data) => {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

const encodePng = (size, rgba) => {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0
  // 每列前置 filter byte 0
  const stride = size * 4
  const raw = Buffer.alloc((stride + 1) * size)
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride)
  }
  const idat = deflateSync(raw, { level: 9 })
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))])
}

// ---- 繪製蘑菇 ----
const setPx = (buf, size, x, y, [r, g, b, a]) => {
  const i = (y * size + x) * 4
  buf[i] = r; buf[i + 1] = g; buf[i + 2] = b; buf[i + 3] = a
}

const drawMushroom = (size) => {
  const buf = Buffer.alloc(size * size * 4)
  const cx = size / 2
  // 比例（相對於 size）
  const Rx = 0.32 * size      // 菌傘水平半徑
  const Ry = 0.26 * size      // 菌傘垂直半徑
  const capCy = 0.40 * size   // 菌傘圓心 y
  const slabHalf = 0.30 * size
  const slabTop = capCy - 0.02 * size
  const slabBottom = capCy + 0.05 * size
  const stemHalf = 0.12 * size
  const stemTop = capCy + 0.01 * size
  const stemBottom = 0.78 * size
  const stemRound = stemHalf

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let color = GREEN // 全幅背景（maskable 友善）
      // 菌傘：上半橢圓
      const nx = (x - cx) / Rx
      const ny = (y - capCy) / Ry
      const inDome = ny <= 0 && nx * nx + ny * ny <= 1
      // 菌傘底座（圓角橫條）連接傘與柄
      const inSlab = y >= slabTop && y <= slabBottom && Math.abs(x - cx) <= slabHalf
      // 菌柄（底部圓角）
      let inStem = false
      if (x >= cx - stemHalf && x <= cx + stemHalf && y >= stemTop && y <= stemBottom) {
        const by = stemBottom - stemRound
        if (y <= by) inStem = true
        else {
          const dx = Math.abs(x - cx) - (stemHalf - stemRound)
          const dy = y - by
          inStem = dx <= 0 || dx * dx + dy * dy <= stemRound * stemRound
        }
      }
      if (inDome || inSlab || inStem) color = WHITE
      setPx(buf, size, x, y, color)
    }
  }
  return buf
}

// ---- 輸出 ----
mkdirSync(OUT_DIR, { recursive: true })
const targets = [
  ['pwa-192.png', 192],
  ['pwa-512.png', 512],
  ['pwa-maskable-512.png', 512],
  ['apple-touch-icon.png', 180],
]
for (const [name, size] of targets) {
  const png = encodePng(size, drawMushroom(size))
  writeFileSync(join(OUT_DIR, name), png)
  console.log(`✓ ${name} (${size}x${size}, ${png.length} bytes)`)
}
console.log('圖示產生完成 →', OUT_DIR)
