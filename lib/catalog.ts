// Marketplace catalog. Two games are supported:
//   - "blox-fruits"  — original Blox Fruits store (real local images at /items/*.jpg)
//   - "sailor-piece" — newer Sailor Piece store (no real artwork yet; Sailor
//     Piece items render with category-keyed lucide icon tiles defined in
//     shop.tsx until per-item art is sourced)
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
    tagline: "Weapons, specs, bundles, rerolls, crates & materials",
  },
]

// ItemType drives the colored badge + the icon-tile fallback used for items
// that don't have a real image (currently every Sailor Piece item).
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

// ---- Real local images (Blox Fruits only). ------------------------------
// Sailor Piece items intentionally have no entry here; ItemImage falls back
// to a themed icon tile in that case.
export const itemImages: Record<string, string> = {
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

const sailorPieceBundles: Product[] = [
  sp("The World + World Outfit", "Spec Bundle", 1299, "bundle"),
  sp("Cosmic Being + Cosmic Body", "Spec Bundle", 1299, "bundle"),
  sp("Great Mage + Mage Outfit", "Spec Bundle", 1299, "bundle"),
  sp("Dragon Goddess + Blossom Outfit", "Spec Bundle", 1299, "bundle"),
  sp("Anti-Magic + Demon Wing", "Spec Bundle", 1299, "bundle"),
  sp("The World + Cosmic Being + Great Mage", "3-Spec Bundle", 2999, "bundle"),
  sp("Atomic + Strongest Shinobi + Abyssal Empress", "Top-Tier Bundle", 3349, "bundle"),
  sp(
    "The World + Cosmic Being + Great Mage + Dragon Goddess",
    "4-Spec Bundle",
    4299,
    "bundle",
  ),
]

const sailorPieceBoosts: Product[] = [
  sp("2x Money (Sailor)", "Permanent Boost", 249, "boost"),
  sp("2x Gems", "Permanent Boost", 399, "boost"),
  sp("2x EXP (Sailor)", "Permanent Boost", 299, "boost"),
  sp("2x Luck Drop", "Permanent Boost", 649, "boost"),
  sp("2x Drops", "Permanent Boost", 849, "boost"),
  sp(
    "Best Value Bundle",
    "2x Money + Gems + EXP + Luck",
    1149,
    "boost",
  ),
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
// Curated highlight reel — top-tier weapons + signature bundle/crate hits.
const sailorPieceBestSellers: Product[] = [
  "Atomic",
  "Demon King",
  "Shadow Monarch",
  "Yamato",
  "Excalibur",
  "Best Value Bundle",
  "Strongest in History",
  "The World + Cosmic Being + Great Mage",
  "250 Clan Reroll",
  "25 Aura Crate",
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
  { id: "bundles", label: "Bundles", products: sailorPieceBundles },
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
