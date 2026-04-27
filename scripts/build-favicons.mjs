// Generates the dragon favicon set from the existing /public/logo-dragon.png.
// Next.js auto-discovers app/icon.png and app/apple-icon.png and emits the
// proper <link rel="icon"> + <link rel="apple-touch-icon"> tags, so the
// dragon shows up in the browser tab without us having to wire up
// metadata.icons manually.
import sharp from "sharp"
import { mkdir } from "node:fs/promises"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const src = path.join(root, "public", "logo-dragon.png")
const appDir = path.join(root, "app")

await mkdir(appDir, { recursive: true })

// 32x32 favicon — the source already has a black background framing the
// dragon, so we resize directly.
await sharp(src)
  .resize(32, 32, { fit: "contain", background: { r: 10, g: 10, b: 10, alpha: 1 } })
  .png()
  .toFile(path.join(appDir, "icon.png"))
console.log("wrote app/icon.png (32x32)")

// 180x180 apple-touch icon for iOS home-screen pinning.
await sharp(src)
  .resize(180, 180, { fit: "contain", background: { r: 10, g: 10, b: 10, alpha: 1 } })
  .png()
  .toFile(path.join(appDir, "apple-icon.png"))
console.log("wrote app/apple-icon.png (180x180)")
