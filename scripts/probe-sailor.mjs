// Probe the source screenshots so we can compute accurate crop coordinates
// for each grid cell. We just print width/height + the URL hash for each so
// the actual cropping script can reference them by short id.
import sharp from "sharp"

const sources = [
  ["bundle-row-1", "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-qIlE8yUmNAIMEcDNORLCG1oWZTfyiH.png"],
  ["weapons-grid-1", "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tkyqVvunGWcSoDDCgYVIzvkWKJOb2i.png"],
  ["bundle-row-2", "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-0tF1rNOfh2840qC9quYdn1Hn4oEV79.png"],
  ["bundle-row-3", "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Cn58zCDTNQ6KegjHMGt5HoktvrxJz2.png"],
  ["weapons-grid-2", "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-IRjf9uVExAUrMy6ufQSKupvQA7uvI3.png"],
  ["weapons-grid-3", "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-M22fuXDqYR9jQLpn4lMeD7eYepQGeg.png"],
  ["premium-grid", "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-t1jgzsDEIMbhS4qptA7FeAQsYMG38W.png"],
  ["bundle-row-4", "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-idI1n3OnotIbG3kloDluYuHG8MuyQy.png"],
  ["bundle-row-5", "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-WAGum9whSZaU66Vr9ISJuMd5YZCkEG.png"],
  ["rerolls-grid", "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-deKDf3T6Q9beYVvczvYmiPdbHoVOAX.png"],
  ["materials-grid", "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-tZ93KhTWqIkFuC28pzdiCToNkwWQHC.png"],
]

for (const [id, url] of sources) {
  const res = await fetch(url)
  const buf = Buffer.from(await res.arrayBuffer())
  const meta = await sharp(buf).metadata()
  console.log(`${id}\t${meta.width}x${meta.height}\t${url.split("/").pop()}`)
}
