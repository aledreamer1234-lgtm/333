// Marketplace catalog. Two games are supported:
//   - "blox-fruits"  — original Blox Fruits store (real local images at /items/*.jpg)
//   - "sailor-piece" — newer Sailor Piece store. Boosts, rerolls, crates,
//     materials, and the anime-themed Sets / Bundles use real artwork from
//     the game's official shop document (mirrored on Wix CDN). Weapons &
//     spec unlocks fall back to category-keyed lucide tiles defined in
//     shop.tsx until per-item art is sourced.
//
// Source for Sailor Piece prices: sailorpiecewiki.com/entries/dev-products
// (verified April 2026, mirrored in user_read_only_context/text_attachments/config-OAnDC.yaml).
//
// Robux is the source of truth. USD = robux * USD_PER_ROBUX (defined in cart-context).

export type Game = "blox-fruits" | "sailor-piece"

export const GAMES: { id: Game; label: string; tagline: string }[] = [
  {
    id: "blox-fruits",
    label: "Blox Fruits",
    tagline: "Fruits, gamepasses, EXP boosts, currency & limited skins",
  },
  {
    id: "sailor-piece",
    label: "Sailor Piece",
    tagline: "Weapons, specs, sets, rerolls, crates & materials",
  },
]

// ItemType drives the colored badge + the icon-tile fallback used for items
// that don't have a real image (currently Sailor Piece weapons/specs).
export type ItemType =
  | "fruit"
  | "gamepass"
  | "boost"
  | "currency"
  | "limited"
  | "weapon"
  | "bundle"
  | "reroll"
  | "crate"
  | "material"

export type Product = {
  name: string
  range: string
  robux: number
  type: ItemType
  game: Game
}

// Stable cart id. Two games can share an item name (e.g. both have a
// "Shadow"), so we always namespace by game.
export const productId = (p: Product): string => `${p.game}:${p.name}`

// ---- Image map -----------------------------------------------------------
// Blox Fruits items use local /items/*.jpg files we ship in /public.
// Sailor Piece items use the official shop artwork hosted on the Wix CDN.
// Cards fall back to a themed icon tile when an entry is missing.
const wix = (id: string): string => `https://static.wixstatic.com/media/${id}`

// Sailor Piece reroll/material/crate/boost shared images. All quantity
// variants of the same base item reuse the same artwork — the qty is shown
// in the product name and price.
const SP_IMAGES = {
  twoDrops: wix("c4d9b1_fbe8462bad5b43558c1e150435939dff~mv2.png"),
  twoLuck: wix("c4d9b1_947e9f2572d54557a68960d838ebcc53~mv2.png"),
  twoGems: wix("c4d9b1_2c390d0d62814f28861c4c742b0add62~mv2.png"),
  twoExp: wix("c4d9b1_b536fc1f19d04b09baedb2409bdf752d~mv2.png"),
  twoMoney: wix("c4d9b1_411cb3116cb247f59c1b3675bab7e04d~mv2.png"),
  clanReroll: wix("595de3_2f5e8ea6eb8343569076170da1253b77~mv2.webp"),
  raceReroll: wix("595de3_ea4569f1415e494c96ef5ee2e95cc28f~mv2.png"),
  traitReroll: wix("595de3_e2ec84f9ac524acbae22f396b2424cb3~mv2.png"),
  hakiReroll: wix("595de3_52f4917ac8ff4cf0b353a94bd517563a~mv2.jpg"),
  bloodlineStone: wix("c4d9b1_5a31e43183f649998e329d6b4050c1c7~mv2.png"),
  passiveShard: wix("c4d9b1_33ef6e3fd56e4f80af37532a532ded66~mv2.png"),
  auraCrate: wix("c4d9b1_332b52e598c64f52b5cd67dff9451e9a~mv2.png"),
  cosmeticCrate: wix("595de3_e9ce5b55ee6641b7a483d55a12c6c6c3~mv2.png"),
}

export const itemImages: Record<string, string> = {
  // ===== Blox Fruits ==================================================
  // Gamepasses
  "Dark Blade": "/items/dark-blade.jpg",
  "Fruit Notifier": "/items/fruit-notifier.jpg",
  "2x Money": "/items/2x-money.jpg",
  "2x Mastery": "/items/2x-mastery.jpg",
  "2x Boss Drops": "/items/boss-drops.jpg",
  "Fast Boats": "/items/fast-boats.jpg",
  "+1 Fruit Storage": "/items/fruit-storage.jpg",
  "Legendary Scrolls": "/items/legendary-scrolls.jpg",
  "Mythical Scrolls": "/items/mythical-scrolls.jpg",

  // Common fruits
  Rocket: "/items/rocket.jpg",
  Spin: "/items/spin.jpg",
  Blade: "/items/blade.jpg",
  Spring: "/items/spring.jpg",
  Bomb: "/items/bomb.jpg",
  Smoke: "/items/smoke.jpg",
  Spike: "/items/spike.jpg",

  // Uncommon fruits
  Flame: "/items/flame.jpg",
  Ice: "/items/ice.jpg",
  Sand: "/items/sand.jpg",
  Dark: "/items/dark.jpg",
  Eagle: "/items/eagle.jpg",
  Diamond: "/items/diamond.jpg",
  Light: "/items/light.jpg",
  Rubber: "/items/rubber.jpg",
  Ghost: "/items/ghost.jpg",

  // Rare fruits
  Magma: "/items/magma.jpg",
  Quake: "/items/quake.jpg",
  Buddha: "/items/buddha.jpg",
  Love: "/items/love.jpg",

  // Legendary fruits
  Spider: "/items/spider.jpg",
  Sound: "/items/sound.jpg",
  Phoenix: "/items/phoenix.jpg",
  Portal: "/items/portal.jpg",
  Lightning: "/items/rumble.jpg",
  Pain: "/items/pain.jpg",
  Blizzard: "/items/blizzard.jpg",

  // Mythical fruits
  Gravity: "/items/gravity.jpg",
  Mammoth: "/items/mammoth.jpg",
  "T-Rex": "/items/trex.jpg",
  Dough: "/items/dough.jpg",
  Shadow: "/items/shadow.jpg",
  Venom: "/items/venom.jpg",
  Gas: "/items/gas.jpg",
  Spirit: "/items/spirit.jpg",
  Tiger: "/items/tiger.jpg",
  Yeti: "/items/yeti.jpg",
  Kitsune: "/items/kitsune.jpg",
  Control: "/items/control.jpg",
  Dragon: "/items/dragon.jpg",

  // EXP Boosts
  "2x EXP (15 Minutes)": "/items/boost-15m.jpg",
  "2x EXP (1 Hour)": "/items/boost-1h.jpg",
  "2x EXP (6 Hours)": "/items/boost-6h.jpg",
  "2x EXP (12 Hours)": "/items/boost-12h.jpg",
  "2x EXP (24 Hours)": "/items/boost-24h.jpg",

  // Currency
  "Money (Beli Bundle)": "/items/beli.jpg",
  "Fragments Bundle": "/items/fragments.jpg",
  "Event Currency": "/items/easter-egg.jpg",

  // Limited / event
  "Galaxy Empyrean Kitsune": "/items/galaxy-empyrean-kitsune.jpg",
  "Crimson Kitsune": "/items/crimson-kitsune.jpg",
  "Ember West Dragon": "/items/ember-west-dragon.jpg",
  "Purple Lightning": "/items/purple-lightning.jpg",
  "Yellow Lightning": "/items/yellow-lightning.jpg",
  "Red Lightning": "/items/red-lightning.jpg",
  "Green Lightning": "/items/green-lightning.jpg",
  "Super Spirit Pain": "/items/super-spirit-pain.jpg",
  "Frustration Pain": "/items/frustration-pain.jpg",
  "Celestial Pain": "/items/celestial-pain.jpg",
  "Divine Portal": "/items/divine-portal.jpg",
  "Pink Portal": "/items/pink-portal.jpg",
  "Rose Quartz Diamond": "/items/rose-quartz-diamond.jpg",
  "Emerald Diamond": "/items/emerald-diamond.jpg",
  "Topaz Diamond": "/items/topaz-diamond.jpg",
  "Ruby Diamond": "/items/ruby-diamond.jpg",
  "Celebration Bomb": "/items/celebration-bomb.jpg",
  "Azura Bomb": "/items/azura-bomb.jpg",
  "Thermite Bomb": "/items/thermite-bomb.jpg",
  "Nuclear Bomb": "/items/nuclear-bomb.jpg",
  "Eagle Requiem": "/items/eagle-requiem.jpg",
  "Eagle Glacier": "/items/eagle-glacier.jpg",
  "Eagle Matrix": "/items/eagle-matrix.jpg",
  Werewolf: "/items/werewolf.jpg",
  Parrot: "/items/parrot.jpg",
  Eclipse: "/items/eclipse.jpg",
  "Permanent Dragon Token": "/items/permanent-dragon-token.jpg",
  Fiend: "/items/fiend.jpg",

  // ===== Sailor Piece — boosts =======================================
  "2x Drops": SP_IMAGES.twoDrops,
  "2x Luck Drop": SP_IMAGES.twoLuck,
  "2x Gems": SP_IMAGES.twoGems,
  "2x EXP (Sailor)": SP_IMAGES.twoExp,
  "2x Money (Sailor)": SP_IMAGES.twoMoney,

  // ===== Sailor Piece — rerolls (qty variants share artwork) ==========
  "10 Clan Reroll": SP_IMAGES.clanReroll,
  "50 Clan Reroll": SP_IMAGES.clanReroll,
  "250 Clan Reroll": SP_IMAGES.clanReroll,
  "1000 Clan Reroll": SP_IMAGES.clanReroll,
  "10 Race Reroll": SP_IMAGES.raceReroll,
  "25 Race Reroll": SP_IMAGES.raceReroll,
  "50 Race Reroll": SP_IMAGES.raceReroll,
  "100 Race Reroll": SP_IMAGES.raceReroll,
  "10 Trait Reroll": SP_IMAGES.traitReroll,
  "25 Trait Reroll": SP_IMAGES.traitReroll,
  "50 Trait Reroll": SP_IMAGES.traitReroll,
  "100 Trait Reroll": SP_IMAGES.traitReroll,
  "10 Haki Color Reroll": SP_IMAGES.hakiReroll,
  "25 Haki Color Reroll": SP_IMAGES.hakiReroll,
  "50 Haki Color Reroll": SP_IMAGES.hakiReroll,
  "100 Haki Color Reroll": SP_IMAGES.hakiReroll,

  // ===== Sailor Piece — crates =======================================
  "10 Aura Crate": SP_IMAGES.auraCrate,
  "25 Aura Crate": SP_IMAGES.auraCrate,
  "50 Aura Crate": SP_IMAGES.auraCrate,
  "100 Aura Crate": SP_IMAGES.auraCrate,
  "10 Cosmetic Crate": SP_IMAGES.cosmeticCrate,
  "25 Cosmetic Crate": SP_IMAGES.cosmeticCrate,
  "50 Cosmetic Crate": SP_IMAGES.cosmeticCrate,
  "100 Cosmetic Crate": SP_IMAGES.cosmeticCrate,

  // ===== Sailor Piece — materials ====================================
  "10 Passive Shard": SP_IMAGES.passiveShard,
  "50 Passive Shard": SP_IMAGES.passiveShard,
  "250 Passive Shard": SP_IMAGES.passiveShard,
  "1000 Passive Shard": SP_IMAGES.passiveShard,
  "10 Bloodline Stone": SP_IMAGES.bloodlineStone,
  "50 Bloodline Stone": SP_IMAGES.bloodlineStone,
  "250 Bloodline Stone": SP_IMAGES.bloodlineStone,
  "1000 Bloodline Stone": SP_IMAGES.bloodlineStone,

  // ===== Sailor Piece — anime-themed sets / bundles ==================
  "The World + World Outfit (Full Set)": wix("595de3_875213c9853044c19ee4fe581c8ba3d0~mv2.png"),
  "The World (Spec Set)": wix("595de3_6ec1f2179b224b9b895717728827e488~mv2.png"),
  "Cosmic Being (Spec Set)": wix("595de3_db2c41845a24486cbe79dd202a216a10~mv2.png"),
  "Madoka Set": wix("595de3_9d4443d28efc4ec2a3a14541f238f37e~mv2.png"),
  "Ragna Set": wix("595de3_94a9f33738ff485685d0f52bcb773835~mv2.png"),
  "Madara (Full Set)": wix("595de3_83cbc1f13b464e508cdf8a2f78427943~mv2.png"),
  "Madara (Spec)": wix("595de3_314663b3d4814f4ebbaa6a1613a8907b~mv2.png"),
  "Gilgamesh (Full Set)": wix("595de3_ab1276ae211043999c1c50bf88b7c79b~mv2.png"),
  "Gilgamesh (Spec Set)": wix("595de3_9d340765e6a94999beee16d558568de8~mv2.png"),
  "Esdeath / Ice Queen (Full Set)": wix("595de3_960d4c35bb024879936a8c5b1206b54f~mv2.png"),
  "Blessed Maiden (Full Set)": wix("595de3_6cbe59880c6d4d198efb940295266a8d~mv2.png"),
  "Kokushibo (Full Set)": wix("595de3_cae01d95e5e94d7b9e91dfe6c56d67eb~mv2.png"),
  "Kokushibo (Spec Set)": wix("595de3_91774103202b4123b8bb37beefdf092d~mv2.png"),
  "Saber V2 (Full Set)": wix("595de3_dc61227c3c944e2f9a3a826a69090c8d~mv2.png"),
  "Sung Jinwoo v1": wix("595de3_3b87569299524e8c80464e2997222776~mv2.png"),
  "Sung Jinwoo v2": wix("595de3_f886578146744ec3bb13bfeecdfef08e~mv2.png"),
  "Anos Set": wix("595de3_69ceea623a284f499ed5415a5798fd27~mv2.png"),
  "Aizen V1 (Spec Set)": wix("595de3_f72b88f83b2c45e2b12031c94e976a4c~mv2.png"),
  "Aizen v2 (Full Set)": wix("595de3_aa42ea1017e04f7daa019a55c3a894e3~mv2.png"),
  "Gojo v1 (Set)": wix("595de3_86cba7a1fd8946acaa6d95860d6f50a0~mv2.png"),
  "Gojo v2 (Full Set)": wix("595de3_c5429ee657354c9488bca8a26ac4296f~mv2.png"),
  "Sukuna v1 (Set)": wix("595de3_ab3d59367f734f379d875cba23d16a6c~mv2.png"),
  "Sukuna v2 (Full Set)": wix("595de3_1428ebfc468e42ffbca4e61d106a70f0~mv2.png"),
  "Yamato Set": wix("595de3_d48bf24fac7e4949a1e946a9f0c8797a~mv2.png"),
  "Rimuru (Spec Set)": wix("595de3_90b9996f7dfb44d790b01f7adda2e7bf~mv2.png"),
  "Alucard Set": wix("595de3_5000ad220e624058b6fdcd45628df209~mv2.png"),
  "Cid v1 (Spec Set)": wix("595de3_3ad98e5780b041b08c0caf0010b70ade~mv2.png"),
  "Cid v2 (Full Set)": wix("595de3_7adffe39fada48ac959251da2e802f95~mv2.png"),
  "Qin Shi (Set)": wix("595de3_fe3e5cb353ac408d9e111572a88412b2~mv2.png"),
  "Ichigo (Set)": wix("595de3_a034746e7a07470894598ef74d605eae~mv2.png"),
  "Frieren Set (w/ egg)": wix("595de3_187c522c7ead440b9e4fe418270548f3~mv2.png"),
}

// =========================================================================
// Blox Fruits catalog
// =========================================================================

const bf = (
  name: string,
  range: string,
  robux: number,
  type: ItemType,
): Product => ({ name, range, robux, type, game: "blox-fruits" })

const bloxFruitsGamepasses: Product[] = [
  bf("Fruit Notifier", "Permanent Pass", 2700, "gamepass"),
  bf("Dark Blade", "Permanent Pass", 1200, "gamepass"),
  bf("Mythical Scrolls", "Permanent Pass", 500, "gamepass"),
  bf("2x Money", "Permanent Pass", 450, "gamepass"),
  bf("2x Mastery", "Permanent Pass", 450, "gamepass"),
  bf("+1 Fruit Storage", "Stackable", 400, "gamepass"),
  bf("2x Boss Drops", "Permanent Pass", 350, "gamepass"),
  bf("Fast Boats", "Permanent Pass", 350, "gamepass"),
  bf("Legendary Scrolls", "Permanent Pass", 160, "gamepass"),
]

const bloxFruitsExpBoosts: Product[] = [
  bf("2x EXP (15 Minutes)", "Quick Boost", 25, "boost"),
  bf("2x EXP (1 Hour)", "Short Boost", 99, "boost"),
  bf("2x EXP (6 Hours)", "Medium Boost", 450, "boost"),
  bf("2x EXP (12 Hours)", "Long Boost", 850, "boost"),
  bf("2x EXP (24 Hours)", "Full Day Boost", 1499, "boost"),
]

const bloxFruitsCurrency: Product[] = [
  bf("Money (Beli Bundle)", "Up to 3M Beli", 1499, "currency"),
  bf("Fragments Bundle", "Up to 16K Fragments", 1499, "currency"),
  bf("Event Currency", "When Active", 999, "currency"),
]

const bloxFruitsFruits: Product[] = [
  // Mythical
  bf("Dragon", "Mythical", 5000, "fruit"),
  bf("Kitsune", "Mythical", 4000, "fruit"),
  bf("Control", "Mythical", 4000, "fruit"),
  bf("Tiger", "Mythical", 3000, "fruit"),
  bf("Yeti", "Mythical", 3000, "fruit"),
  // Legendary
  bf("Spirit", "Legendary", 2550, "fruit"),
  bf("Gas", "Legendary", 2500, "fruit"),
  bf("Venom", "Legendary", 2450, "fruit"),
  bf("Shadow", "Legendary", 2425, "fruit"),
  bf("Dough", "Legendary", 2400, "fruit"),
  bf("Mammoth", "Legendary", 2350, "fruit"),
  bf("T-Rex", "Legendary", 2350, "fruit"),
  // Rare
  bf("Gravity", "Rare", 2300, "fruit"),
  bf("Blizzard", "Rare", 2250, "fruit"),
  bf("Pain", "Rare", 2200, "fruit"),
  bf("Lightning", "Rare", 2100, "fruit"),
  bf("Phoenix", "Rare", 2000, "fruit"),
  bf("Portal", "Rare", 2000, "fruit"),
  bf("Sound", "Rare", 1900, "fruit"),
  bf("Spider", "Rare", 1800, "fruit"),
  bf("Love", "Rare", 1700, "fruit"),
  bf("Buddha", "Rare", 1650, "fruit"),
  bf("Quake", "Rare", 1500, "fruit"),
  bf("Magma", "Rare", 1300, "fruit"),
  // Uncommon
  bf("Ghost", "Uncommon", 1275, "fruit"),
  bf("Rubber", "Uncommon", 1200, "fruit"),
  bf("Light", "Uncommon", 1100, "fruit"),
  bf("Diamond", "Uncommon", 1000, "fruit"),
  bf("Eagle", "Uncommon", 975, "fruit"),
  bf("Dark", "Uncommon", 950, "fruit"),
  bf("Sand", "Uncommon", 850, "fruit"),
  bf("Ice", "Uncommon", 750, "fruit"),
  bf("Flame", "Uncommon", 550, "fruit"),
  // Common
  bf("Spike", "Common", 380, "fruit"),
  bf("Smoke", "Common", 250, "fruit"),
  bf("Bomb", "Common", 220, "fruit"),
  bf("Spring", "Common", 180, "fruit"),
  bf("Blade", "Common", 100, "fruit"),
  bf("Spin", "Common", 75, "fruit"),
  bf("Rocket", "Common", 50, "fruit"),
]

const bloxFruitsLimited: Product[] = [
  bf("Galaxy Empyrean Kitsune", "Limited · Event", 6250, "limited"),
  bf("Ember West Dragon", "Limited · Event", 5000, "limited"),
  bf("Crimson Kitsune", "Limited · Event", 4750, "limited"),
  bf("Permanent Dragon Token", "Limited · Token", 3750, "limited"),
  bf("Celestial Pain", "Limited · Pain Skin", 3250, "limited"),
  bf("Super Spirit Pain", "Limited · Pain Skin", 3000, "limited"),
  bf("Divine Portal", "Limited · Portal Skin", 3000, "limited"),
  bf("Frustration Pain", "Limited · Pain Skin", 2500, "limited"),
  bf("Werewolf", "Limited · Beast", 2500, "limited"),
  bf("Fiend", "Limited · Beast", 2500, "limited"),
  bf("Pink Portal", "Limited · Portal Skin", 2250, "limited"),
  bf("Purple Lightning", "Limited · Lightning Skin", 2250, "limited"),
  bf("Yellow Lightning", "Limited · Lightning Skin", 2250, "limited"),
  bf("Red Lightning", "Limited · Lightning Skin", 2250, "limited"),
  bf("Green Lightning", "Limited · Lightning Skin", 2250, "limited"),
  bf("Eagle Requiem", "Limited · Eagle Skin", 2250, "limited"),
  bf("Eagle Glacier", "Limited · Eagle Skin", 2250, "limited"),
  bf("Eagle Matrix", "Limited · Eagle Skin", 2250, "limited"),
  bf("Rose Quartz Diamond", "Limited · Diamond Skin", 2000, "limited"),
  bf("Emerald Diamond", "Limited · Diamond Skin", 2000, "limited"),
  bf("Topaz Diamond", "Limited · Diamond Skin", 2000, "limited"),
  bf("Ruby Diamond", "Limited · Diamond Skin", 2000, "limited"),
  bf("Eclipse", "Limited · Skin", 2000, "limited"),
  bf("Celebration Bomb", "Limited · Bomb Skin", 1750, "limited"),
  bf("Azura Bomb", "Limited · Bomb Skin", 1750, "limited"),
  bf("Thermite Bomb", "Limited · Bomb Skin", 1750, "limited"),
  bf("Nuclear Bomb", "Limited · Bomb Skin", 1750, "limited"),
  bf("Parrot", "Limited · Companion", 1750, "limited"),
]

const bfAll = [
  ...bloxFruitsGamepasses,
  ...bloxFruitsExpBoosts,
  ...bloxFruitsCurrency,
  ...bloxFruitsFruits,
  ...bloxFruitsLimited,
]
const findBf = (name: string): Product => {
  const found = bfAll.find((p) => p.name === name)
  if (!found) throw new Error(`Blox Fruits best-sellers references unknown product: ${name}`)
  return found
}
const bloxFruitsBestSellers: Product[] = [
  "Dark Blade",
  "Kitsune",
  "2x Mastery",
  "Dragon",
  "Mythical Scrolls",
  "T-Rex",
  "2x EXP (24 Hours)",
  "Galaxy Empyrean Kitsune",
  "Dough",
  "Yeti",
].map(findBf)

// =========================================================================
// Sailor Piece catalog (verified April 2026 — see config-OAnDC.yaml)
// =========================================================================

const sp = (
  name: string,
  range: string,
  robux: number,
  type: ItemType,
): Product => ({ name, range, robux, type, game: "sailor-piece" })

const sailorPieceWeapons: Product[] = [
  sp("Excalibur", "Direct Unlock", 499, "weapon"),
  sp("Cursed Vessel", "Direct Unlock", 499, "weapon"),
  sp("Limitless Sorcerer", "Direct Unlock", 699, "weapon"),
  sp("Cursed King", "Direct Unlock", 799, "weapon"),
  sp("Qin Shi", "Direct Unlock", 849, "weapon"),
  sp("Solo Hunter", "Direct Unlock", 899, "weapon"),
  sp("Soul Reaper", "Direct Unlock", 899, "weapon"),
  sp("Vampire King", "Direct Unlock", 899, "weapon"),
  sp("Manipulator", "Direct Unlock", 949, "weapon"),
  sp("Conqueror Haki", "Direct Unlock", 999, "weapon"),
  sp("Shadow", "Direct Unlock", 999, "weapon"),
  sp("Strongest of Today", "Direct Unlock", 1049, "weapon"),
  sp("Strongest in History", "Direct Unlock", 1099, "weapon"),
  sp("Slime", "Direct Unlock", 1149, "weapon"),
  sp("King of Heroes", "Direct Unlock", 1199, "weapon"),
  sp("Yamato", "Direct Unlock", 1249, "weapon"),
  sp("Demon King", "Direct Unlock", 1249, "weapon"),
  sp("Sin of Pride", "Direct Unlock", 1249, "weapon"),
  sp("Shadow Monarch", "Direct Unlock", 1299, "weapon"),
  sp("Blessed Maiden", "Direct Unlock", 1349, "weapon"),
  sp("Corrupted Excalibur", "Direct Unlock", 1349, "weapon"),
  sp("True Manipulator", "Direct Unlock", 1399, "weapon"),
  sp("Strongest Shinobi", "Direct Unlock", 1399, "weapon"),
  sp("Abyssal Empress", "Direct Unlock", 1399, "weapon"),
  sp("Moon Slayer", "Direct Unlock", 1399, "weapon"),
  sp("Ice Queen", "Direct Unlock", 1399, "weapon"),
  sp("Atomic", "Direct Unlock", 1449, "weapon"),
]

// Real anime-themed sets sold in the official Sailor Piece shop. These have
// real artwork from the game's shop document, mirrored on the Wix CDN.
const sailorPieceBundles: Product[] = [
  sp("The World + World Outfit (Full Set)", "Full Set", 1499, "bundle"),
  sp("The World (Spec Set)", "Spec Set", 999, "bundle"),
  sp("Cosmic Being (Spec Set)", "Spec Set", 999, "bundle"),
  sp("Madara (Full Set)", "Full Set", 1499, "bundle"),
  sp("Madara (Spec)", "Spec Set", 999, "bundle"),
  sp("Gilgamesh (Full Set)", "Full Set", 1499, "bundle"),
  sp("Gilgamesh (Spec Set)", "Spec Set", 999, "bundle"),
  sp("Kokushibo (Full Set)", "Full Set", 1499, "bundle"),
  sp("Kokushibo (Spec Set)", "Spec Set", 999, "bundle"),
  sp("Aizen v2 (Full Set)", "Full Set", 1499, "bundle"),
  sp("Aizen V1 (Spec Set)", "Spec Set", 999, "bundle"),
  sp("Gojo v2 (Full Set)", "Full Set", 1499, "bundle"),
  sp("Gojo v1 (Set)", "Set", 1149, "bundle"),
  sp("Sukuna v2 (Full Set)", "Full Set", 1499, "bundle"),
  sp("Sukuna v1 (Set)", "Set", 1149, "bundle"),
  sp("Cid v2 (Full Set)", "Full Set", 1499, "bundle"),
  sp("Cid v1 (Spec Set)", "Spec Set", 999, "bundle"),
  sp("Sung Jinwoo v2", "Full Set", 1499, "bundle"),
  sp("Sung Jinwoo v1", "Set", 1149, "bundle"),
  sp("Saber V2 (Full Set)", "Full Set", 1499, "bundle"),
  sp("Esdeath / Ice Queen (Full Set)", "Full Set", 1499, "bundle"),
  sp("Blessed Maiden (Full Set)", "Full Set", 1499, "bundle"),
  sp("Yamato Set", "Set", 1249, "bundle"),
  sp("Rimuru (Spec Set)", "Spec Set", 999, "bundle"),
  sp("Alucard Set", "Set", 1249, "bundle"),
  sp("Anos Set", "Set", 1249, "bundle"),
  sp("Qin Shi (Set)", "Set", 1149, "bundle"),
  sp("Ichigo (Set)", "Set", 1149, "bundle"),
  sp("Madoka Set", "Set", 1149, "bundle"),
  sp("Ragna Set", "Set", 1149, "bundle"),
  sp("Frieren Set (w/ egg)", "Set + Pet Egg", 1599, "bundle"),
]

const sailorPieceBoosts: Product[] = [
  sp("2x Money (Sailor)", "Permanent Boost", 249, "boost"),
  sp("2x Gems", "Permanent Boost", 399, "boost"),
  sp("2x EXP (Sailor)", "Permanent Boost", 299, "boost"),
  sp("2x Luck Drop", "Permanent Boost", 649, "boost"),
  sp("2x Drops", "Permanent Boost", 849, "boost"),
]

const sailorPieceRerolls: Product[] = [
  // Clan Reroll — main trading currency
  sp("10 Clan Reroll", "Trading Currency", 49, "reroll"),
  sp("50 Clan Reroll", "Trading Currency", 229, "reroll"),
  sp("250 Clan Reroll", "Trading Currency", 999, "reroll"),
  sp("1000 Clan Reroll", "Trading Currency", 3499, "reroll"),
  // Race Reroll
  sp("10 Race Reroll", "Race", 99, "reroll"),
  sp("25 Race Reroll", "Race", 239, "reroll"),
  sp("50 Race Reroll", "Race", 449, "reroll"),
  sp("100 Race Reroll", "Race", 749, "reroll"),
  // Trait Reroll
  sp("10 Trait Reroll", "Trait", 99, "reroll"),
  sp("25 Trait Reroll", "Trait", 239, "reroll"),
  sp("50 Trait Reroll", "Trait", 449, "reroll"),
  sp("100 Trait Reroll", "Trait", 749, "reroll"),
  // Haki Color Reroll
  sp("10 Haki Color Reroll", "Haki Color", 59, "reroll"),
  sp("25 Haki Color Reroll", "Haki Color", 135, "reroll"),
  sp("50 Haki Color Reroll", "Haki Color", 249, "reroll"),
  sp("100 Haki Color Reroll", "Haki Color", 449, "reroll"),
]

const sailorPieceCrates: Product[] = [
  // Aura Crates
  sp("10 Aura Crate", "Aura Pull", 599, "crate"),
  sp("25 Aura Crate", "Aura Pull", 1399, "crate"),
  sp("50 Aura Crate", "Aura Pull", 2599, "crate"),
  sp("100 Aura Crate", "Aura Pull", 4799, "crate"),
  // Cosmetic Crates
  sp("10 Cosmetic Crate", "Cosmetic Pull", 699, "crate"),
  sp("25 Cosmetic Crate", "Cosmetic Pull", 1599, "crate"),
  sp("50 Cosmetic Crate", "Cosmetic Pull", 2999, "crate"),
  sp("100 Cosmetic Crate", "Cosmetic Pull", 5399, "crate"),
]

const sailorPieceMaterials: Product[] = [
  // Passive Shards
  sp("10 Passive Shard", "Passive Material", 49, "material"),
  sp("50 Passive Shard", "Passive Material", 229, "material"),
  sp("250 Passive Shard", "Passive Material", 999, "material"),
  sp("1000 Passive Shard", "Passive Material", 3499, "material"),
  // Bloodline Stones
  sp("10 Bloodline Stone", "Bloodline Material", 49, "material"),
  sp("50 Bloodline Stone", "Bloodline Material", 229, "material"),
  sp("250 Bloodline Stone", "Bloodline Material", 999, "material"),
  sp("1000 Bloodline Stone", "Bloodline Material", 3499, "material"),
]

const spAll = [
  ...sailorPieceWeapons,
  ...sailorPieceBundles,
  ...sailorPieceBoosts,
  ...sailorPieceRerolls,
  ...sailorPieceCrates,
  ...sailorPieceMaterials,
]
const findSp = (name: string): Product => {
  const found = spAll.find((p) => p.name === name)
  if (!found) throw new Error(`Sailor Piece best-sellers references unknown product: ${name}`)
  return found
}
// Curated highlight reel — leans on items that have real artwork so the
// home page best-sellers row showcases the actual game art.
const sailorPieceBestSellers: Product[] = [
  "Atomic",
  "Madara (Full Set)",
  "Gojo v2 (Full Set)",
  "Sukuna v2 (Full Set)",
  "Sung Jinwoo v2",
  "Yamato Set",
  "Frieren Set (w/ egg)",
  "250 Clan Reroll",
  "25 Aura Crate",
  "2x Drops",
].map(findSp)

// =========================================================================
// Public catalog API
// =========================================================================

export type CategoryDef = {
  id: string // url-friendly slug for hash links
  label: string // display label
  products: Product[]
}

export const bloxFruitsCategories: CategoryDef[] = [
  { id: "best-sellers", label: "Best Sellers", products: bloxFruitsBestSellers },
  { id: "gamepasses", label: "Gamepasses", products: bloxFruitsGamepasses },
  // Wireframe calls fruits "Perm Fruits" — every fruit purchased through the
  // marketplace ships as a permanent gift, so the friendlier label maps 1:1.
  { id: "perm-fruits", label: "Perm Fruits", products: bloxFruitsFruits },
  { id: "exp-boosts", label: "EXP Boosts", products: bloxFruitsExpBoosts },
  { id: "currency", label: "Currency", products: bloxFruitsCurrency },
  { id: "limited-event", label: "Limited & Event", products: bloxFruitsLimited },
]

export const sailorPieceCategories: CategoryDef[] = [
  { id: "best-sellers", label: "Best Sellers", products: sailorPieceBestSellers },
  { id: "weapons-specs", label: "Weapons & Specs", products: sailorPieceWeapons },
  { id: "sets-bundles", label: "Sets & Bundles", products: sailorPieceBundles },
  { id: "boosts", label: "Boosts", products: sailorPieceBoosts },
  { id: "rerolls", label: "Rerolls", products: sailorPieceRerolls },
  { id: "crates", label: "Crates", products: sailorPieceCrates },
  { id: "materials", label: "Materials", products: sailorPieceMaterials },
]

export const catalogs: Record<Game, CategoryDef[]> = {
  "blox-fruits": bloxFruitsCategories,
  "sailor-piece": sailorPieceCategories,
}

export const findCategory = (
  game: Game,
  categoryId: string,
): CategoryDef | undefined =>
  catalogs[game].find((c) => c.id === categoryId)
