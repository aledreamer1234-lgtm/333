// Downloads the 4 Sailor Piece item artworks the user supplied (hosted on
// the Wix CDN) into /public/sailor/. Webp is converted to PNG with sharp so
// every file in /public/sailor/ remains a .png and the existing spImg()
// helper keeps working without conditionals.
import { writeFile, mkdir } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import sharp from "sharp"

const ITEMS = [
  {
    slug: "boost-2x-drops",
    url: "https://static.wixstatic.com/media/c4d9b1_fbe8462bad5b43558c1e150435939dff~mv2.png/v1/fill/w_339,h_375,al_c,lg_1,q_85,enc_avif,quality_auto/c4d9b1_fbe8462bad5b43558c1e150435939dff~mv2.png",
  },
  {
    slug: "passive-shard",
    url: "https://static.wixstatic.com/media/c4d9b1_33ef6e3fd56e4f80af37532a532ded66~mv2.png/v1/fill/w_542,h_600,al_c,lg_1,q_85,enc_avif,quality_auto/c4d9b1_33ef6e3fd56e4f80af37532a532ded66~mv2.png",
  },
  {
    // Source is webp; sharp downcodes to png below.
    slug: "clan-reroll",
    url: "https://static.wixstatic.com/media/595de3_2f5e8ea6eb8343569076170da1253b77~mv2.webp",
  },
  {
    slug: "aura-crate",
    url: "https://static.wixstatic.com/media/c4d9b1_332b52e598c64f52b5cd67dff9451e9a~mv2.png/v1/fill/w_420,h_465,al_c,lg_1,q_85,enc_avif,quality_auto/c4d9b1_332b52e598c64f52b5cd67dff9451e9a~mv2.png",
  },
  // Race Reroll has its art hosted on bloxinformer rather than the Wix CDN.
  {
    slug: "race-reroll",
    url: "https://bloxinformer.com/wp-content/uploads/2026/03/race-reroll-item-sailor-piece.jpg",
  },
  // Remaining 2x boosts (Drops was added in the previous batch).
  {
    slug: "boost-2x-luck-drop",
    url: "https://static.wixstatic.com/media/c4d9b1_947e9f2572d54557a68960d838ebcc53~mv2.png/v1/fill/w_344,h_381,al_c,lg_1,q_85,enc_avif,quality_auto/c4d9b1_947e9f2572d54557a68960d838ebcc53~mv2.png",
  },
  {
    slug: "boost-2x-gems",
    url: "https://static.wixstatic.com/media/c4d9b1_2c390d0d62814f28861c4c742b0add62~mv2.png/v1/fill/w_339,h_375,al_c,lg_1,q_85,enc_avif,quality_auto/c4d9b1_2c390d0d62814f28861c4c742b0add62~mv2.png",
  },
  {
    slug: "boost-2x-exp",
    url: "https://static.wixstatic.com/media/c4d9b1_b536fc1f19d04b09baedb2409bdf752d~mv2.png/v1/fill/w_339,h_375,al_c,lg_1,q_85,enc_avif,quality_auto/c4d9b1_b536fc1f19d04b09baedb2409bdf752d~mv2.png",
  },
  {
    slug: "boost-2x-money",
    url: "https://static.wixstatic.com/media/c4d9b1_411cb3116cb247f59c1b3675bab7e04d~mv2.png/v1/fill/w_326,h_361,al_c,lg_1,q_85,enc_avif,quality_auto/c4d9b1_411cb3116cb247f59c1b3675bab7e04d~mv2.png",
  },
]

const OUT_DIR = resolve(process.cwd(), "public/sailor")
await mkdir(OUT_DIR, { recursive: true })

for (const { slug, url } of ITEMS) {
  const out = resolve(OUT_DIR, `${slug}.png`)
  console.log(`[fetch] ${slug} <- ${url}`)
  const res = await fetch(url, {
    // Wix's avif/webp pipeline is fine with a generic UA.
    headers: { "user-agent": "Mozilla/5.0 v0-fetch" },
  })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`)
  }
  const buf = Buffer.from(await res.arrayBuffer())
  // sharp normalizes whatever Wix actually served (avif/webp/png) into PNG
  // and trims the canvas down so we don't ship 600px sources for ~200px
  // tiles. Cap at 600px on the long edge — the sailor card grid renders at
  // 4x = 320px so 600px gives plenty of headroom for retina without bloat.
  await mkdir(dirname(out), { recursive: true })
  await sharp(buf)
    .resize({ width: 600, height: 600, fit: "inside", withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(out)
  console.log(`[ok]    ${out}`)
}
