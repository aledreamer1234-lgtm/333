"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Box,
  Check,
  ChevronLeft,
  ChevronRight,
  Coins,
  Crown,
  Dices,
  Gem,
  Gift,
  Layers,
  Plus,
  Sparkles,
  Sword,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react"
import { useCart, USD_PER_ROBUX } from "@/lib/cart-context"
import {
  GAMES,
  catalogs,
  itemImages,
  productId,
  type CategoryDef,
  type Game,
  type ItemType,
  type Product,
} from "@/lib/catalog"

// Discount applied across the catalog (matches "-XX%" badge marketing).
// Our rate is $8 per 1k Robux vs Roblox's official $10 per 1k → 20% off.
const DISCOUNT_PERCENT = 20

const typeColors: Record<ItemType, string> = {
  fruit: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  gamepass: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  boost: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  currency: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  limited: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  weapon: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  bundle: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  reroll: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  crate: "bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30",
  material: "bg-rose-500/20 text-rose-400 border-rose-500/30",
}

const typeLabels: Record<ItemType, string> = {
  fruit: "fruit",
  gamepass: "gamepass",
  boost: "boost",
  currency: "currency",
  limited: "limited",
  weapon: "weapon",
  bundle: "bundle",
  reroll: "reroll",
  crate: "crate",
  material: "material",
}

// Icon + accent color used to render Sailor Piece (and any image-less) items
// as a category-keyed tile. Each category maps to a single lucide icon and a
// solid tinted background; this keeps cards visually distinct without relying
// on per-item artwork that hasn't been sourced yet.
const categoryTile: Record<
  ItemType,
  { Icon: LucideIcon; iconClass: string; bgClass: string }
> = {
  fruit: { Icon: Sparkles, iconClass: "text-purple-300", bgClass: "bg-purple-500/15" },
  gamepass: { Icon: Crown, iconClass: "text-amber-300", bgClass: "bg-amber-500/15" },
  boost: { Icon: TrendingUp, iconClass: "text-emerald-300", bgClass: "bg-emerald-500/15" },
  currency: { Icon: Coins, iconClass: "text-yellow-300", bgClass: "bg-yellow-500/15" },
  limited: { Icon: Zap, iconClass: "text-rose-300", bgClass: "bg-rose-500/15" },
  weapon: { Icon: Sword, iconClass: "text-amber-300", bgClass: "bg-amber-500/15" },
  bundle: { Icon: Layers, iconClass: "text-indigo-300", bgClass: "bg-indigo-500/15" },
  reroll: { Icon: Dices, iconClass: "text-cyan-300", bgClass: "bg-cyan-500/15" },
  crate: { Icon: Gift, iconClass: "text-fuchsia-300", bgClass: "bg-fuchsia-500/15" },
  material: { Icon: Gem, iconClass: "text-rose-300", bgClass: "bg-rose-500/15" },
}

function CategoryTile({ type }: { type: ItemType }) {
  const { Icon, iconClass, bgClass } = categoryTile[type]
  return (
    <div
      className={`grid h-28 w-28 place-items-center overflow-hidden rounded-2xl border border-[var(--line)] ${bgClass} shadow-lg transition-transform duration-500 group-hover:scale-110`}
    >
      <Icon className={`h-12 w-12 ${iconClass}`} aria-hidden />
    </div>
  )
}

function ItemImage({ name, type }: { name: string; type: ItemType }) {
  const [hasError, setHasError] = useState(false)
  const localImage = itemImages[name]

  if (hasError || !localImage) {
    return <CategoryTile type={type} />
  }

  return (
    <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-2xl border border-[var(--line)] bg-gradient-to-br from-[var(--bg-3)] to-[var(--bg-2)] shadow-lg transition-transform duration-500 group-hover:scale-110">
      <Image
        src={localImage || "/placeholder.svg"}
        alt={name}
        width={112}
        height={112}
        className="h-full w-full object-contain p-2"
        onError={() => setHasError(true)}
      />
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const { addItem, items } = useCart()
  const [justAdded, setJustAdded] = useState(false)

  const id = productId(product)
  const inCart = items.some((i) => i.id === id)

  const price = product.robux * USD_PER_ROBUX
  const originalPrice = price / (1 - DISCOUNT_PERCENT / 100)

  const handleAdd = () => {
    addItem({
      id,
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
    <div className="group relative w-[260px] shrink-0 snap-start overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--bg-1)] transition-all duration-300 hover:border-[var(--ink-mute)]/30 hover:shadow-xl hover:shadow-black/20 sm:w-[280px]">
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[var(--bg-2)] to-[var(--bg-0)]">
        <span
          className={`absolute left-3 top-3 rounded border px-2 py-1 text-[10px] font-medium uppercase tracking-wider ${typeColors[product.type]}`}
        >
          {typeLabels[product.type]}
        </span>
        <span className="absolute right-3 top-3 rounded bg-red-500 px-2 py-1 text-xs font-semibold text-white">
          -{DISCOUNT_PERCENT}%
        </span>
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <ItemImage name={product.name} type={product.type} />
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <span className="inline-block rounded-lg border border-[var(--line)] bg-[var(--bg-0)]/80 px-3 py-1.5 text-sm font-semibold text-[var(--ink)] backdrop-blur-sm">
            {product.range}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="mb-1 line-clamp-1 text-base font-semibold text-[var(--ink)]">
          {product.name}
        </h3>
        <p className="mb-3 text-xs text-[var(--ink-mute)]">
          {product.robux.toLocaleString()} R$
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold text-[var(--ink)]">
              ${price.toFixed(2)}
            </span>
            <span className="text-sm text-[var(--ink-mute)] line-through">
              ${originalPrice.toFixed(2)}
            </span>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            aria-label={`Add ${product.name} to cart`}
            className={`grid h-9 w-9 place-items-center rounded-lg transition-all hover:scale-105 active:scale-95 ${
              justAdded
                ? "bg-emerald-500 text-white"
                : inCart
                  ? "bg-[var(--accent)]/80 text-[var(--bg-0)]"
                  : "bg-[var(--accent)] text-[var(--bg-0)]"
            }`}
          >
            {justAdded ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}

// One horizontal-scrolling row per category. Each row has its own scroll
// state (chevrons appear/disappear independently) so multiple rows can
// coexist on the same page without sharing one shared scroller.
function CategoryRow({
  game,
  category,
}: {
  game: Game
  category: CategoryDef
}) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const updateScrollState = () => {
    const el = scrollerRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    updateScrollState()
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

  const scrollByAmount = (direction: "left" | "right") => {
    const el = scrollerRef.current
    if (!el) return
    const amount = Math.max(el.clientWidth * 0.85, 280)
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    })
  }

  return (
    <div id={`row-${game}-${category.id}`} className="scroll-mt-24">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-[var(--ink)]">
            {category.label}
          </h3>
          <p className="mt-0.5 text-xs text-[var(--ink-mute)]">
            {category.products.length} items
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={{ pathname: "/shop", query: { game, category: category.id } }}
            className="text-sm text-[var(--ink-mute)] transition-colors hover:text-[var(--ink)]"
          >
            View all
          </Link>
          <button
            type="button"
            onClick={() => scrollByAmount("left")}
            disabled={!canScrollLeft}
            aria-label={`Scroll ${category.label} left`}
            className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--line)] text-[var(--ink-mute)] transition-all hover:bg-[var(--bg-2)] hover:text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[var(--ink-mute)]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollByAmount("right")}
            disabled={!canScrollRight}
            aria-label={`Scroll ${category.label} right`}
            className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--line)] text-[var(--ink-mute)] transition-all hover:bg-[var(--bg-2)] hover:text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[var(--ink-mute)]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 scroll-smooth"
      >
        {category.products.map((product) => (
          <ProductCard key={productId(product)} product={product} />
        ))}
      </div>
    </div>
  )
}

export function Shop() {
  const [activeGame, setActiveGame] = useState<Game>("blox-fruits")

  // Deep-link support. A "shop:navigate" custom event (used by the footer/
  // header) or an initial hash like #gamepasses on first load scrolls the
  // page to the matching category row and switches the active game tab if
  // needed. We translate legacy aliases (e.g. "fruits" → "perm-fruits") to
  // the new category ids defined in lib/catalog.ts.
  useEffect(() => {
    const aliasToCategoryId: Record<
      string,
      { game: Game; categoryId: string }
    > = {
      gamepasses: { game: "blox-fruits", categoryId: "gamepasses" },
      gamepass: { game: "blox-fruits", categoryId: "gamepasses" },
      fruits: { game: "blox-fruits", categoryId: "perm-fruits" },
      "perm-fruits": { game: "blox-fruits", categoryId: "perm-fruits" },
      "devil-fruits": { game: "blox-fruits", categoryId: "perm-fruits" },
      "devil-fruit": { game: "blox-fruits", categoryId: "perm-fruits" },
      "exp-boosts": { game: "blox-fruits", categoryId: "exp-boosts" },
      "exp-boost": { game: "blox-fruits", categoryId: "exp-boosts" },
      exp: { game: "blox-fruits", categoryId: "exp-boosts" },
      currency: { game: "blox-fruits", categoryId: "currency" },
      beli: { game: "blox-fruits", categoryId: "currency" },
      fragments: { game: "blox-fruits", categoryId: "currency" },
      limited: { game: "blox-fruits", categoryId: "limited-event" },
      weapons: { game: "sailor-piece", categoryId: "weapons-specs" },
      "weapons-specs": { game: "sailor-piece", categoryId: "weapons-specs" },
      bundles: { game: "sailor-piece", categoryId: "bundles" },
      rerolls: { game: "sailor-piece", categoryId: "rerolls" },
      crates: { game: "sailor-piece", categoryId: "crates" },
      materials: { game: "sailor-piece", categoryId: "materials" },
    }

    const goTo = (alias: string) => {
      const target = aliasToCategoryId[alias.toLowerCase()]
      if (!target) return
      setActiveGame(target.game)
      requestAnimationFrame(() => {
        document
          .getElementById(`row-${target.game}-${target.categoryId}`)
          ?.scrollIntoView({ behavior: "smooth", block: "start" })
      })
    }

    const initialHash = window.location.hash.replace(/^#/, "")
    if (initialHash) goTo(initialHash)

    const onHashChange = () => goTo(window.location.hash.replace(/^#/, ""))
    window.addEventListener("hashchange", onHashChange)

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

  const activeCategories = useMemo(() => catalogs[activeGame], [activeGame])

  return (
    <section className="px-6 py-20" id="shop">
      <div className="mx-auto max-w-7xl">
        {/* Section header. "View all items" now points at /shop, which
            renders the full filterable catalog grid. */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-2 block text-xs uppercase tracking-widest text-[var(--ink-mute)]">
              - Shop by game
            </span>
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--ink)]">
              Featured Items
            </h2>
            <p className="mt-2 text-[var(--ink-dim)]">
              Every giftable item across both games &mdash; delivered fast.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1 text-sm text-[var(--ink-mute)] transition-colors hover:text-[var(--ink)]"
          >
            View all items <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Top-level game switcher (Blox Fruits / Sailor Piece). Sized as
            big touch-friendly pills per the wireframe. */}
        <div
          role="tablist"
          aria-label="Shop by game"
          className="mb-10 inline-flex flex-wrap gap-2 rounded-2xl border border-[var(--line)] bg-[var(--bg-1)] p-1.5"
        >
          {GAMES.map((g) => {
            const selected = g.id === activeGame
            return (
              <button
                key={g.id}
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveGame(g.id)}
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
                  selected
                    ? "bg-[var(--ink)] text-[var(--bg-0)]"
                    : "text-[var(--ink-mute)] hover:bg-[var(--bg-2)] hover:text-[var(--ink)]"
                }`}
              >
                {g.label}
              </button>
            )
          })}
        </div>

        {/* One row per category for the active game. */}
        <div className="flex flex-col gap-12">
          {activeCategories.map((category) => (
            <CategoryRow
              key={`${activeGame}-${category.id}`}
              game={activeGame}
              category={category}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
