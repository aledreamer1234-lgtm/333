import { NextRequest, NextResponse } from 'next/server'

// Map of item names to their Blox Fruits Wiki image paths
const imageMap: Record<string, string> = {
  // Fruits
  'Dragon Fruit': 'https://static.wikia.nocookie.net/roblox-blox-piece/images/4/40/DragonIcon.png',
  'Dough Fruit': 'https://static.wikia.nocookie.net/roblox-blox-piece/images/4/43/Dough.webp',
  'Spirit Fruit': 'https://static.wikia.nocookie.net/roblox-blox-piece/images/1/17/Spirit.webp',
  'Kitsune Fruit': 'https://static.wikia.nocookie.net/roblox-blox-piece/images/e/e5/Kitsune.webp',
  'Buddha Fruit': 'https://static.wikia.nocookie.net/roblox-blox-piece/images/8/81/Buddha.webp',
  'Venom Fruit': 'https://static.wikia.nocookie.net/roblox-blox-piece/images/a/ab/Venom.webp',
  'Control Fruit': 'https://static.wikia.nocookie.net/roblox-blox-piece/images/1/1c/Control.webp',
  'Mammoth Fruit': 'https://static.wikia.nocookie.net/roblox-blox-piece/images/f/f4/Mammoth.webp',
  'Phoenix Fruit': 'https://static.wikia.nocookie.net/roblox-blox-piece/images/2/27/Phoenix.webp',
  'Leopard Fruit': 'https://static.wikia.nocookie.net/roblox-blox-piece/images/5/5e/Leopard.webp',
  
  // Swords
  'Dark Blade': 'https://static.wikia.nocookie.net/roblox-blox-piece/images/a/a0/Dark_Blade.png',
  'Cursed Dual Katana': 'https://static.wikia.nocookie.net/roblox-blox-piece/images/b/b5/Cursed_Dual_Katana.png',
  'True Triple Katana': 'https://static.wikia.nocookie.net/roblox-blox-piece/images/4/4b/True_Triple_Katana.png',
  'Yama': 'https://static.wikia.nocookie.net/roblox-blox-piece/images/5/5d/Yama.png',
  'Tushita': 'https://static.wikia.nocookie.net/roblox-blox-piece/images/0/0e/Tushita.png',
  'Shisui': 'https://static.wikia.nocookie.net/roblox-blox-piece/images/9/9a/Shisui.png',
  'Saber': 'https://static.wikia.nocookie.net/roblox-blox-piece/images/1/14/Saber.png',
  'Rengoku': 'https://static.wikia.nocookie.net/roblox-blox-piece/images/9/9f/Rengoku.png',
  
  // Gamepasses (using Roblox asset thumbnails)
  '2x Mastery': 'https://tr.rbxcdn.com/180DAY-da0c21ed61f3dab95cc0e47bca8a6048/150/150/Image/Webp/noFilter',
  '2x Money': 'https://tr.rbxcdn.com/180DAY-c0ed6e932c8c99a2e36bb0e291e3c295/150/150/Image/Webp/noFilter',
  'Fruit Notifier': 'https://tr.rbxcdn.com/180DAY-4eb3c4c1f7e3989f9b8e7d0c5a8f1d2e/150/150/Image/Webp/noFilter',
  '+1 Fruit Storage': 'https://tr.rbxcdn.com/180DAY-8d7c6b5a4e3f2d1c0b9a8f7e6d5c4b3a/150/150/Image/Webp/noFilter',
  'Fast Boats': 'https://tr.rbxcdn.com/180DAY-1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d/150/150/Image/Webp/noFilter',
  '2x Boss Drops': 'https://tr.rbxcdn.com/180DAY-7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c/150/150/Image/Webp/noFilter',
  'Mythical Scrolls': 'https://tr.rbxcdn.com/180DAY-2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f/150/150/Image/Webp/noFilter',
  'Legendary Scrolls': 'https://tr.rbxcdn.com/180DAY-5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d/150/150/Image/Webp/noFilter',
  
  // Materials
  'Dragon Scale': 'https://static.wikia.nocookie.net/roblox-blox-piece/images/c/ca/Dragon_Scale.png',
  'Ectoplasm': 'https://static.wikia.nocookie.net/roblox-blox-piece/images/a/a7/Ectoplasm.png',
  'Conjured Cocoa': 'https://static.wikia.nocookie.net/roblox-blox-piece/images/d/d5/Conjured_Cocoa.png',
  'Mystic Droplet': 'https://static.wikia.nocookie.net/roblox-blox-piece/images/1/1a/Mystic_Droplet.png',
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const itemName = searchParams.get('item')
  
  if (!itemName) {
    return NextResponse.json({ error: 'Item name required' }, { status: 400 })
  }
  
  const imageUrl = imageMap[itemName]
  
  if (!imageUrl) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 })
  }
  
  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Referer': 'https://blox-fruits.fandom.com/',
      },
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch image')
    }
    
    const buffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/png'
    
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to proxy image' }, { status: 500 })
  }
}
