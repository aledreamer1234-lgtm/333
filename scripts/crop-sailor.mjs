// Slice the Sailor Piece in-game shop screenshots into per-item PNGs.
//
// Each source screenshot is a chunk of the game's shop UI. The grid screens
// (weapons, premium, rerolls, materials) have a header sliver of price chips
// from the row above — we offset `top` to skip that. Bundle screenshots are
// horizontal composite banners that we save whole because the composition
// IS the product (e.g. "Atomic + Strongest Shinobi + Abyssal Empress").
//
// Cell dimensions are derived from the actual probed image sizes. Values
// were tuned by eye to keep the entire card (border + label + icon + price)
// inside the crop while leaving a sliver of breathing room.

import sharp from "sharp"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

const OUT_DIR = path.resolve("public/sailor")
await mkdir(OUT_DIR, { recursive: true })

// Cache fetched buffers so we don't re-download for repeated source uses.
const buffers = new Map()
async function load(url) {
  if (buffers.has(url)) return buffers.get(url)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  buffers.set(url, buf)
  return buf
}

async function crop({ url, slug, left, top, width, height }) {
  const src = await load(url)
  const out = await sharp(src).extract({ left, top, width, height }).png().toBuffer()
  const file = path.join(OUT_DIR, `${slug}.png`)
  await writeFile(file, out)
  console.log(`  ${slug}.png (${width}x${height})`)
}

// Convenience: crop a 4-wide × N-tall grid where every cell is the same size.
async function gridRow({ url, top, height, cols, slugs, leftPad = 0, gridWidth }) {
  const colW = Math.floor(gridWidth / cols)
  for (let i = 0; i < cols; i++) {
    if (!slugs[i]) continue
    await crop({
      url,
      slug: slugs[i],
      left: leftPad + i * colW,
      top,
      width: colW,
      height,
    })
  }
}

// Save the full image as a single bundle banner.
async function whole({ url, slug }) {
  const buf = await load(url)
  const out = await sharp(buf).png().toBuffer()
  await writeFile(path.join(OUT_DIR, `${slug}.png`), out)
  console.log(`  ${slug}.png (full)`)
}

// Save a horizontal slice (top→top+height of full width) for stacked banners.
async function slice({ url, slug, top, height }) {
  const buf = await load(url)
  const meta = await sharp(buf).metadata()
  const out = await sharp(buf)
    .extract({ left: 0, top, width: meta.width, height })
    .png()
    .toBuffer()
  await writeFile(path.join(OUT_DIR, `${slug}.png`), out)
  console.log(`  ${slug}.png (banner ${meta.width}x${height})`)
}

const URLS = {
  bundleRow1: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-qIlE8yUmNAIMEcDNORLCG1oWZTfyiH.png",
  weaponsGrid1: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tkyqVvunGWcSoDDCgYVIzvkWKJOb2i.png",
  bundleRow2: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-0tF1rNOfh2840qC9quYdn1Hn4oEV79.png",
  bundleRow3: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Cn58zCDTNQ6KegjHMGt5HoktvrxJz2.png",
  weaponsGrid2: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-IRjf9uVExAUrMy6ufQSKupvQA7uvI3.png",
  weaponsGrid3: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-M22fuXDqYR9jQLpn4lMeD7eYepQGeg.png",
  premiumGrid: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-t1jgzsDEIMbhS4qptA7FeAQsYMG38W.png",
  bundleRow4: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-idI1n3OnotIbG3kloDluYuHG8MuyQy.png",
  bundleRow5: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-WAGum9whSZaU66Vr9ISJuMd5YZCkEG.png",
  rerollsGrid: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-deKDf3T6Q9beYVvczvYmiPdbHoVOAX.png",
  materialsGrid: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tZ93KhTWqIkFuC28pzdiCToNkwWQHC.png",
}

console.log("Weapons grid 1 (Excalibur / Manipulator / Qin Shi / Shadow + row 2)")
// 528x308 — top ~35px is the price-chip sliver from the row above.
await gridRow({
  url: URLS.weaponsGrid1, gridWidth: 528, cols: 4,
  top: 35, height: 134, leftPad: 0,
  slugs: ["excalibur", "manipulator", "qin-shi", "shadow"],
})
await gridRow({
  url: URLS.weaponsGrid1, gridWidth: 528, cols: 4,
  top: 169, height: 138, leftPad: 0,
  slugs: ["cursed-vessel", "vampire-king", "strongest-of-today", "strongest-in-history"],
})

console.log("Weapons grid 2 (Soul Reaper / Conqueror Haki / Slime / Yamato + row 2)")
// 538x328 — top sliver of price chips is taller than weapons-grid-1.
await gridRow({
  url: URLS.weaponsGrid2, gridWidth: 538, cols: 4,
  top: 55, height: 135,
  slugs: ["soul-reaper", "conqueror-haki", "slime", "yamato"],
})
await gridRow({
  url: URLS.weaponsGrid2, gridWidth: 538, cols: 4,
  top: 190, height: 138,
  slugs: ["king-of-heroes", "demon-king", "shadow-monarch", "sin-of-pride"],
})

console.log("Weapons grid 3 (Blessed Maiden / True Manipulator / ... / Ice Queen)")
// 529x277 — clean 4×2 with no top sliver.
await gridRow({
  url: URLS.weaponsGrid3, gridWidth: 529, cols: 4,
  top: 0, height: 138,
  slugs: ["blessed-maiden", "true-manipulator", "corrupted-excalibur", "strongest-shinobi"],
})
await gridRow({
  url: URLS.weaponsGrid3, gridWidth: 529, cols: 4,
  top: 138, height: 139,
  slugs: ["atomic", "abyssal-empress", "moon-slayer", "ice-queen"],
})

console.log("Premium grid (The World / Cosmic Being / Great Mage / Dragon Goddess + Anti Magic)")
// 558x373 — sliver from row above (Atomic/Empress/Moon Slayer/Ice Queen) is
// notably tall here (~85px). Then 2 rows of cards.
await gridRow({
  url: URLS.premiumGrid, gridWidth: 558, cols: 4,
  top: 85, height: 140,
  slugs: ["the-world", "cosmic-being", "great-mage", "dragon-goddess"],
})
await gridRow({
  url: URLS.premiumGrid, gridWidth: 558, cols: 4,
  top: 225, height: 148,
  slugs: ["anti-magic", null, null, null],
})

console.log("Rerolls grid (Trait Reroll x4 + Haki Color Reroll x4)")
// 532x354 — top sliver shows the crate-quantity row above (599/1399/2599/4799).
// Push the offset deeper so the chips don't bleed into the crop.
await gridRow({
  url: URLS.rerollsGrid, gridWidth: 532, cols: 4,
  top: 85, height: 135,
  slugs: ["trait-reroll-10", "trait-reroll-25", "trait-reroll-50", "trait-reroll-100"],
})
await gridRow({
  url: URLS.rerollsGrid, gridWidth: 532, cols: 4,
  top: 220, height: 134,
  slugs: [
    "haki-color-reroll-10",
    "haki-color-reroll-25",
    "haki-color-reroll-50",
    "haki-color-reroll-100",
  ],
})

console.log("Materials grid (Bloodline Stones x4 + Cosmetic Crates x4)")
// 525x333 — top ~50 is the "Materials" red header banner.
await gridRow({
  url: URLS.materialsGrid, gridWidth: 525, cols: 4,
  top: 50, height: 142,
  slugs: [
    "bloodline-stone-10",
    "bloodline-stone-50",
    "bloodline-stone-250",
    "bloodline-stone-1000",
  ],
})
await gridRow({
  url: URLS.materialsGrid, gridWidth: 525, cols: 4,
  top: 192, height: 141,
  slugs: [
    "cosmetic-crate-10",
    "cosmetic-crate-25",
    "cosmetic-crate-50",
    "cosmetic-crate-100",
  ],
})

console.log("Bundle banners (sliced)")
// bundle-row-1 (535x409) — 3 banners stacked, with a faint "SHOP" header at
// the very top that we trim off the first banner.
await slice({ url: URLS.bundleRow1, slug: "bundle-shinobi-trio", top: 22, height: 108 })
await slice({ url: URLS.bundleRow1, slug: "bundle-ice-queen-set", top: 137, height: 132 })
await slice({ url: URLS.bundleRow1, slug: "bundle-cosmic-body", top: 276, height: 133 })

// bundle-row-2 (522x317) — 2 banners
await slice({ url: URLS.bundleRow2, slug: "bundle-anti-magic-demon-wing", top: 0, height: 156 })
await slice({ url: URLS.bundleRow2, slug: "bundle-world-cosmic-pair", top: 158, height: 159 })

// bundle-row-3 (517x347) — 2 banners
await slice({ url: URLS.bundleRow3, slug: "bundle-quad-mythics", top: 0, height: 172 })
await slice({ url: URLS.bundleRow3, slug: "bundle-trio-mythics", top: 173, height: 174 })

// bundle-row-4 (510x315) — 2 banners
await slice({ url: URLS.bundleRow4, slug: "bundle-world-outfit", top: 0, height: 156 })
await slice({ url: URLS.bundleRow4, slug: "bundle-cosmic-outfit", top: 157, height: 158 })

// bundle-row-5 (540x311) — 2 banners
await slice({ url: URLS.bundleRow5, slug: "bundle-mage-outfit", top: 0, height: 154 })
await slice({ url: URLS.bundleRow5, slug: "bundle-blossom-outfit", top: 155, height: 156 })

console.log("Done.")
