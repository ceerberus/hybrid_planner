import sharp from 'sharp'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const svgPath = resolve(__dirname, '../public/favicon.svg')
const svg = readFileSync(svgPath)

const icons = [
  { size: 192, out: '../public/icons/icon-192.png' },
  { size: 512, out: '../public/icons/icon-512.png' },
  { size: 180, out: '../public/apple-touch-icon.png' },
]

for (const { size, out } of icons) {
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(resolve(__dirname, out))
  console.log(`✓ ${size}x${size} → ${out}`)
}
