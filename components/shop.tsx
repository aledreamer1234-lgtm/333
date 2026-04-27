"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Plus, Check } from "lucide-react"
import { useCart, USD_PER_ROBUX } from "@/lib/cart-context"

const categories = [
  "Best Sellers",
  "Gamepasses",
  "EXP Boosts",
  "Currency",
  "Fruits",
  "Limited & Event",
]

// Local image paths for real Blox Fruits images (only items in the canonical giftable list)
const itemImages: Record<string, string> = {
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

  // EXP Boosts — each duration uses its own colored arrow icon (matches in-game)
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

type ItemType = "fruit" | "gamepass" | "boost" | "currency" | "limited"

// Discount applied across the catalog (matches "-XX%" badge marketing).
// Our rate is $8 per 1k Robux vs Roblox's official $10 per 1k → 20% off.
const DISCOUNT_PERCENT = 20

// Robux is the source of truth. USD = robux * USD_PER_ROBUX ($4 / 1000 R$).
type Product = {
  name: string
  range: string
  robux: number
  type: ItemType
}

const gamepasses: Product[] = [
  // Official in-game Blox Fruits gamepass Robux prices
  { name: "Fruit Notifier", range: "Permanent Pass", robux: 2700, type: "gamepass" },
  { name: "Dark Blade", range: "Permanent Pass", robux: 1200, type: "gamepass" },
  { name: "Mythical Scrolls", range: "Permanent Pass", robux: 500, type: "gamepass" },
  { name: "2x Money", range: "Permanent Pass", robux: 450, type: "gamepass" },
  { name: "2x Mastery", range: "Permanent Pass", robux: 450, type: "gamepass" },
  { name: "+1 Fruit Storage", range: "Stackable", robux: 400, type: "gamepass" },
  { name: "2x Boss Drops", range: "Permanent Pass", robux: 350, type: "gamepass" },
  { name: "Fast Boats", range: "Permanent Pass", robux: 350, type: "gamepass" },
  { name: "Legendary Scrolls", range: "Permanent Pass", robux: 160, type: "gamepass" },
]

const expBoosts: Product[] = [
  { name: "2x EXP (15 Minutes)", range: "Quick Boost", robux: 25, type: "boost" },
  { name: "2x EXP (1 Hour)", range: "Short Boost", robux: 99, type: "boost" },
  { name: "2x EXP (6 Hours)", range: "Medium Boost", robux: 450, type: "boost" },
  { name: "2x EXP (12 Hours)", range: "Long Boost", robux: 850, type: "boost" },
  { name: "2x EXP (24 Hours)", range: "Full Day Boost", robux: 1499, type: "boost" },
]

const currency: Product[] = [
  { name: "Money (Beli Bundle)", range: "Up to 3M Beli", robux: 1499, type: "currency" },
  { name: "Fragments Bundle", range: "Up to 16K Fragments", robux: 1499, type: "currency" },
  { name: "Event Currency", range: "When Active", robux: 999, type: "currency" },
]

const fruits: Product[] = [
  // --- Mythical ---
  { name: "Dragon", range: "Mythical", robux: 5000, type: "fruit" },
  { name: "Kitsune", range: "Mythical", robux: 4000, type: "fruit" },
  { name: "Control", range: "Mythical", robux: 4000, type: "fruit" },
  { name: "Tiger", range: "Mythical", robux: 3000, type: "fruit" },
  { name: "Yeti", range: "Mythical", robux: 3000, type: "fruit" },
  // --- Legendary ---
  { name: "Spirit", range: "Legendary", robux: 2550, type: "fruit" },
  { name: "Gas", range: "Legendary", robux: 2500, type: "fruit" },
  { name: "Venom", range: "Legendary", robux: 2450, type: "fruit" },
  { name: "Shadow", range: "Legendary", robux: 2425, type: "fruit" },
  { name: "Dough", range: "Legendary", robux: 2400, type: "fruit" },
  { name: "Mammoth", range: "Legendary", robux: 2350, type: "fruit" },
  { name: "T-Rex", range: "Legendary", robux: 2350, type: "fruit" },
  // --- Rare ---
  { name: "Gravity", range: "Rare", robux: 2300, type: "fruit" },
  { name: "Blizzard", range: "Rare", robux: 2250, type: "fruit" },
  { name: "Pain", range: "Rare", robux: 2200, type: "fruit" },
  { name: "Lightning", range: "Rare", robux: 2100, type: "fruit" },
  { name: "Phoenix", range: "Rare", robux: 2000, type: "fruit" },
  { name: "Portal", range: "Rare", robux: 2000, type: "fruit" },
  { name: "Sound", range: "Rare", robux: 1900, type: "fruit" },
  { name: "Spider", range: "Rare", robux: 1800, type: "fruit" },
  { name: "Love", range: "Rare", robux: 1700, type: "fruit" },
  { name: "Buddha", range: "Rare", robux: 1650, type: "fruit" },
  { name: "Quake", range: "Rare", robux: 1500, type: "fruit" },
  { name: "Magma", range: "Rare", robux: 1300, type: "fruit" },
  // --- Uncommon ---
  { name: "Ghost", range: "Uncommon", robux: 1275, type: "fruit" },
  { name: "Rubber", range: "Uncommon", robux: 1200, type: "fruit" },
  { name: "Light", range: "Uncommon", robux: 1100, type: "fruit" },
  { name: "Diamond", range: "Uncommon", robux: 1000, type: "fruit" },
  { name: "Eagle", range: "Uncommon", robux: 975, type: "fruit" },
  { name: "Dark", range: "Uncommon", robux: 950, type: "fruit" },
  { name: "Sand", range: "Uncommon", robux: 850, type: "fruit" },
  { name: "Ice", range: "Uncommon", robux: 750, type: "fruit" },
  { name: "Flame", range: "Uncommon", robux: 550, type: "fruit" },
  // --- Common ---
  { name: "Spike", range: "Common", robux: 380, type: "fruit" },
  { name: "Smoke", range: "Common", robux: 250, type: "fruit" },
  { name: "Bomb", range: "Common", robux: 220, type: "fruit" },
  { name: "Spring", range: "Common", robux: 180, type: "fruit" },
  { name: "Blade", range: "Common", robux: 100, type: "fruit" },
  { name: "Spin", range: "Common", robux: 75, type: "fruit" },
  { name: "Rocket", range: "Common", robux: 50, type: "fruit" },
]

const limited: Product[] = [
  { name: "Galaxy Empyrean Kitsune", range: "Limited · Event", robux: 6250, type: "limited" },
  { name: "Ember West Dragon", range: "Limited · Event", robux: 5000, type: "limited" },
  { name: "Crimson Kitsune", range: "Limited · Event", robux: 4750, type: "limited" },
  { name: "Permanent Dragon Token", range: "Limited · Token", robux: 3750, type: "limited" },
  { name: "Celestial Pain", range: "Limited · Pain Skin", robux: 3250, type: "limited" },
  { name: "Super Spirit Pain", range: "Limited · Pain Skin", robux: 3000, type: "limited" },
  { name: "Divine Portal", range: "Limited · Portal Skin", robux: 3000, type: "limited" },
  { name: "Frustration Pain", range: "Limited · Pain Skin", robux: 2500, type: "limited" },
  { name: "Werewolf", range: "Limited · Beast", robux: 2500, type: "limited" },
  { name: "Fiend", range: "Limited · Beast", robux: 2500, type: "limited" },
  { name: "Pink Portal", range: "Limited · Portal Skin", robux: 2250, type: "limited" },
  { name: "Purple Lightning", range: "Limited · Lightning Skin", robux: 2250, type: "limited" },
  { name: "Yellow Lightning", range: "Limited · Lightning Skin", robux: 2250, type: "limited" },
  { name: "Red Lightning", range: "Limited · Lightning Skin", robux: 2250, type: "limited" },
  { name: "Green Lightning", range: "Limited · Lightning Skin", robux: 2250, type: "limited" },
  { name: "Eagle Requiem", range: "Limited · Eagle Skin", robux: 2250, type: "limited" },
  { name: "Eagle Glacier", range: "Limited · Eagle Skin", robux: 2250, type: "limited" },
  { name: "Eagle Matrix", range: "Limited · Eagle Skin", robux: 2250, type: "limited" },
  { name: "Rose Quartz Diamond", range: "Limited · Diamond Skin", robux: 2000, type: "limited" },
  { name: "Emerald Diamond", range: "Limited · Diamond Skin", robux: 2000, type: "limited" },
  { name: "Topaz Diamond", range: "Limited · Diamond Skin", robux: 2000, type: "limited" },
  { name: "Ruby Diamond", range: "Limited · Diamond Skin", robux: 2000, type: "limited" },
  { name: "Eclipse", range: "Limited · Skin", robux: 2000, type: "limited" },
  { name: "Celebration Bomb", range: "Limited · Bomb Skin", robux: 1750, type: "limited" },
  { name: "Azura Bomb", range: "Limited · Bomb Skin", robux: 1750, type: "limited" },
  { name: "Thermite Bomb", range: "Limited · Bomb Skin", robux: 1750, type: "limited" },
  { name: "Nuclear Bomb", range: "Limited · Bomb Skin", robux: 1750, type: "limited" },
  { name: "Parrot", range: "Limited · Companion", robux: 1750, type: "limited" },
]

// Curated best sellers pull from the canonical product lists above
const findProduct = (name: string): Product => {
  const all = [...gamepasses, ...expBoosts, ...currency, ...fruits, ...limited]
  const found = all.find((p) => p.name === name)
  if (!found) throw new Error(`Best Sellers references unknown product: ${name}`)
  return found
}

const bestSellers: Product[] = [
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
].map(findProduct)

const products: Record<string, Product[]> = {
  "Best Sellers": bestSellers,
  Gamepasses: gamepasses,
  "EXP Boosts": expBoosts,
  Currency: currency,
  Fruits: fruits,
  "Limited & Event": limited,
}

const typeColors: Record<ItemType, string> = {
  fruit: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  gamepass: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  boost: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  currency: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  limited: "bg-rose-500/20 text-rose-400 border-rose-500/30",
}

const typeLabels: Record<ItemType, string> = {
  fruit: "fruit",
  gamepass: "gamepass",
  boost: "boost",
  currency: "currency",
  limited: "limited",
}

function FallbackTile({ type }: { name: string; type: ItemType }) {
  return (
    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[var(--bg-3)] to-[var(--bg-2)] border border-[var(--line)] flex items-center justify-center">
      <span className="text-3xl text-[var(--ink-mute)] font-semibold">
        {type === "gamepass"
          ? "G"
          : type === "limited"
          ? "L"
          : type === "boost"
          ? "B"
          : type === "currency"
          ? "C"
          : "F"}
      </span>
    </div>
  )
}

function ItemImage({ name, type }: { name: string; type: ItemType }) {
  const [hasError, setHasError] = useState(false)
  const localImage = itemImages[name]

  if (hasError || !localImage) {
    return <FallbackTile name={name} type={type} />
  }

  return (
    <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-[var(--bg-3)] to-[var(--bg-2)] border border-[var(--line)] flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg overflow-hidden">
      <Image
        src={localImage || "/placeholder.svg"}
        alt={name}
        width={112}
        height={112}
        className="object-contain w-full h-full p-2"
        onError={() => setHasError(true)}
      />
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const { addItem, items } = useCart()
  const [justAdded, setJustAdded] = useState(false)

  const inCart = items.some((i) => i.id === product.name)

  const price = product.robux * USD_PER_ROBUX
  const originalPrice = price / (1 - DISCOUNT_PERCENT / 100)

  const handleAdd = () => {
    addItem({
      id: product.name,
      name: product.name,
      image: itemImages[product.name],
      type: product.type,
      range: product.range,
      robux: product.robux,
    })
    setJustAdded(true)
    window.setTimeout(() => setJustAdded(false), 900)
  }

  return (
    <div className="group relative overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--bg-1)] transition-all duration-300 hover:border-[var(--ink-mute)]/30 hover:shadow-xl hover:shadow-black/20 snap-start shrink-0 w-[260px] sm:w-[280px]">
      {/* Image Area */}
      <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-[var(--bg-2)] to-[var(--bg-0)]">
        <span
          className={`absolute top-3 left-3 text-[10px] uppercase tracking-wider font-medium px-2 py-1 rounded border ${typeColors[product.type]}`}
        >
          {typeLabels[product.type]}
        </span>
        <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
          -{DISCOUNT_PERCENT}%
        </span>
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <ItemImage name={product.name} type={product.type} />
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <span className="inline-block bg-[var(--bg-0)]/80 backdrop-blur-sm text-[var(--ink)] text-sm font-semibold px-3 py-1.5 rounded-lg border border-[var(--line)]">
            {product.range}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-base font-semibold text-[var(--ink)] mb-1">{product.name}</h3>
        <p className="text-xs text-[var(--ink-mute)] mb-3">
          {product.robux.toLocaleString()} R$
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold text-[var(--ink)]">${price.toFixed(2)}</span>
            <span className="text-sm text-[var(--ink-mute)] line-through">
              ${originalPrice.toFixed(2)}
            </span>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            aria-label={`Add ${product.name} to cart`}
            className={`w-9 h-9 rounded-lg grid place-items-center transition-all hover:scale-105 active:scale-95 ${
              justAdded
                ? "bg-emerald-500 text-white"
                : inCart
                ? "bg-[var(--accent)]/80 text-[var(--bg-0)]"
                : "bg-[var(--accent)] text-[var(--bg-0)]"
            }`}
          >
            {justAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}

export function Shop() {
  const [activeCategory, setActiveCategory] = useState("Best Sellers")
  const [isAnimating, setIsAnimating] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const scrollerRef = useRef<HTMLDivElement>(null)

  const handleCategoryChange = (category: string) => {
    if (category === activeCategory) return
    setIsAnimating(true)
    setTimeout(() => {
      setActiveCategory(category)
      setIsAnimating(false)
      // Reset scroll position when switching categories
      if (scrollerRef.current) scrollerRef.current.scrollTo({ left: 0, behavior: "smooth" })
    }, 150)
  }

  const updateScrollState = () => {
    const el = scrollerRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    updateScrollState()
  }, [activeCategory])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const onScroll = () => updateScrollState()
    el.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      el.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  // Deep-link support. Either a "shop:navigate" custom event (preferred) or a
  // hash like #gamepasses on initial load will switch the active category and
  // smoothly scroll to the shop section. Custom events are used by the footer
  // links so we never rely on the browser's native (jump-to-top) hash scroll.
  useEffect(() => {
    const aliasToCategory: Record<string, string> = {
      gamepasses: "Gamepasses",
      gamepass: "Gamepasses",
      fruits: "Fruits",
      "devil-fruits": "Fruits",
      "devil-fruit": "Fruits",
      "exp-boosts": "EXP Boosts",
      "exp-boost": "EXP Boosts",
      exp: "EXP Boosts",
      currency: "Currency",
      beli: "Currency",
      fragments: "Currency",
    }

    const goTo = (alias: string) => {
      const next = aliasToCategory[alias.toLowerCase()]
      if (!next) return
      setActiveCategory(next)
      // Defer scroll so the category swap renders first.
      requestAnimationFrame(() => {
        document
          .getElementById("shop")
          ?.scrollIntoView({ behavior: "smooth", block: "start" })
      })
    }

    // 1. Honor an initial hash on first load (e.g. opening /#gamepasses directly).
    const initialHash = window.location.hash.replace(/^#/, "")
    if (initialHash) goTo(initialHash)

    // 2. Listen for hash changes (back/forward, manual edits).
    const onHashChange = () => goTo(window.location.hash.replace(/^#/, ""))
    window.addEventListener("hashchange", onHashChange)

    // 3. Listen for in-app navigation events from the footer / nav.
    const onNavigate = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail
      if (typeof detail === "string") goTo(detail)
    }
    window.addEventListener("shop:navigate", onNavigate as EventListener)

    return () => {
      window.removeEventListener("hashchange", onHashChange)
      window.removeEventListener("shop:navigate", onNavigate as EventListener)
    }
  }, [])

  const scrollByAmount = (direction: "left" | "right") => {
    const el = scrollerRef.current
    if (!el) return
    const amount = Math.max(el.clientWidth * 0.85, 280)
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" })
  }

  const list = useMemo(() => products[activeCategory] ?? [], [activeCategory])

  return (
    <section className="py-20 px-6" id="shop">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
          <div>
            <span className="text-xs uppercase tracking-widest text-[var(--ink-mute)] mb-2 block">
              - Shop by category
            </span>
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--ink)]">Featured Items</h2>
            <p className="mt-2 text-[var(--ink-dim)]">
              Every Blox Fruits item that can be gifted &mdash; delivered fast.
            </p>
          </div>
          <a
            href="#shop"
            className="text-sm text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors flex items-center gap-1"
          >
            View all items <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap items-center gap-2 mb-8 pb-6 border-b border-[var(--line)]">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeCategory === category
                  ? "bg-[var(--ink)] text-[var(--bg-0)]"
                  : "text-[var(--ink-mute)] hover:text-[var(--ink)] hover:bg-[var(--bg-2)]"
              }`}
            >
              {category}
              <span className="ml-2 text-xs opacity-60">{products[category]?.length ?? 0}</span>
            </button>
          ))}

          <div className="flex gap-2 ml-auto">
            <button
              type="button"
              onClick={() => scrollByAmount("left")}
              disabled={!canScrollLeft}
              aria-label="Scroll items left"
              className="w-9 h-9 rounded-lg border border-[var(--line)] grid place-items-center text-[var(--ink-mute)] hover:text-[var(--ink)] hover:bg-[var(--bg-2)] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[var(--ink-mute)]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollByAmount("right")}
              disabled={!canScrollRight}
              aria-label="Scroll items right"
              className="w-9 h-9 rounded-lg border border-[var(--line)] grid place-items-center text-[var(--ink-mute)] hover:text-[var(--ink)] hover:bg-[var(--bg-2)] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[var(--ink-mute)]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Products Carousel */}
        <div
          ref={scrollerRef}
          className={`flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 scroll-smooth no-scrollbar transition-all duration-200 ${
            isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
          }`}
        >
          {list.map((product, index) => (
            <ProductCard key={`${product.name}-${index}`} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
