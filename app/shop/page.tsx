"use client"

import { Suspense, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  ArrowLeft,
  Check,
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
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useCart, USD_PER_ROBUX } from "@/lib/cart-context"
import {
  GAMES,
  catalogs,
  itemImages,
  productId,
  type Game,
  type ItemType,
  type Product,
} from "@/lib/catalog"

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
      className={`grid h-24 w-24 place-items-center overflow-hidden rounded-2xl border border-[var(--line)] ${bgClass} shadow-lg`}
    >
      <Icon className={`h-10 w-10 ${iconClass}`} aria-hidden />
    </div>
  )
}

function ItemImage({ name, type }: { name: string; type: ItemType }) {
  const [hasError, setHasError] = useState(false)
  const localImage = itemImages[name]
  if (hasError || !localImage) return <CategoryTile type={type} />
  return (
    <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-2xl border border-[var(--line)] bg-gradient-to-br from-[var(--bg-3)] to-[var(--bg-2)] shadow-lg">
      <Image
        src={localImage || "/placeholder.svg"}
        alt={name}
        width={96}
        height={96}
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
    <div className="group relative overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--bg-1)] transition-all duration-300 hover:border-[var(--ink-mute)]/30 hover:shadow-xl hover:shadow-black/20">
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-[var(--bg-2)] to-[var(--bg-0)]">
        <span
          className={`absolute left-3 top-3 rounded border px-2 py-1 text-[10px] font-medium uppercase tracking-wider ${typeColors[product.type]}`}
        >
          {product.type}
        </span>
        <span className="absolute right-3 top-3 rounded bg-red-500 px-2 py-1 text-xs font-semibold text-white">
          -{DISCOUNT_PERCENT}%
        </span>
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <ItemImage name={product.name} type={product.type} />
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <span className="inline-block rounded-lg border border-[var(--line)] bg-[var(--bg-0)]/80 px-2.5 py-1 text-xs font-semibold text-[var(--ink)] backdrop-blur-sm">
            {product.range}
          </span>
        </div>
      </div>
      <div className="p-3.5">
        <h3 className="mb-1 line-clamp-1 text-sm font-semibold text-[var(--ink)]">
          {product.name}
        </h3>
        <p className="mb-2.5 text-[11px] text-[var(--ink-mute)]">
          {product.robux.toLocaleString()} R$
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-semibold text-[var(--ink)]">
              ${price.toFixed(2)}
            </span>
            <span className="text-xs text-[var(--ink-mute)] line-through">
              ${originalPrice.toFixed(2)}
            </span>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            aria-label={`Add ${product.name} to cart`}
            className={`grid h-8 w-8 place-items-center rounded-lg transition-all hover:scale-105 active:scale-95 ${
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

function ShopBrowser() {
  const search = useSearchParams()

  // Game / category come from query params so external links can deep-link
  // straight to a filtered view (e.g. /shop?game=sailor-piece&category=weapons-specs).
  const initialGame =
    (search.get("game") as Game | null) === "sailor-piece"
      ? "sailor-piece"
      : "blox-fruits"
  const initialCategory = search.get("category") ?? "all"

  const [game, setGame] = useState<Game>(initialGame)
  const [categoryId, setCategoryId] = useState<string>(initialCategory)
  const [query, setQuery] = useState("")

  const categories = catalogs[game]

  // The "all" pseudo-category aggregates every product across the active
  // game's catalog (and dedupes by name so Best Sellers don't show twice).
  const visibleProducts = useMemo(() => {
    const seen = new Set<string>()
    const all: Product[] = []
    if (categoryId === "all") {
      for (const cat of categories) {
        if (cat.id === "best-sellers") continue
        for (const p of cat.products) {
          if (seen.has(p.name)) continue
          seen.add(p.name)
          all.push(p)
        }
      }
    } else {
      const cat = categories.find((c) => c.id === categoryId)
      if (cat) all.push(...cat.products)
    }
    const q = query.trim().toLowerCase()
    if (!q) return all
    return all.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.range.toLowerCase().includes(q),
    )
  }, [categories, categoryId, query])

  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--ink-mute)] transition-colors hover:text-[var(--ink)]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-2 block text-xs uppercase tracking-widest text-[var(--ink-mute)]">
              - Full catalog
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl">
              All items
            </h1>
            <p className="mt-2 text-[var(--ink-dim)]">
              Browse every giftable item across both games. Filter by game,
              category, or search by name.
            </p>
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items..."
            className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg-1)] px-3 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-mute)] focus:border-[var(--accent)] focus:outline-none sm:w-72"
          />
        </div>

        {/* Game tabs */}
        <div
          role="tablist"
          aria-label="Filter by game"
          className="mb-6 inline-flex flex-wrap gap-2 rounded-2xl border border-[var(--line)] bg-[var(--bg-1)] p-1.5"
        >
          {GAMES.map((g) => {
            const selected = g.id === game
            return (
              <button
                key={g.id}
                role="tab"
                aria-selected={selected}
                onClick={() => {
                  setGame(g.id)
                  setCategoryId("all")
                }}
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

        {/* Category chips (per active game). "All" first. */}
        <div className="mb-8 flex flex-wrap items-center gap-2 border-b border-[var(--line)] pb-6">
          <button
            type="button"
            onClick={() => setCategoryId("all")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              categoryId === "all"
                ? "bg-[var(--ink)] text-[var(--bg-0)]"
                : "text-[var(--ink-mute)] hover:bg-[var(--bg-2)] hover:text-[var(--ink)]"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryId(cat.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                categoryId === cat.id
                  ? "bg-[var(--ink)] text-[var(--bg-0)]"
                  : "text-[var(--ink-mute)] hover:bg-[var(--bg-2)] hover:text-[var(--ink)]"
              }`}
            >
              {cat.label}
              <span className="ml-1.5 text-xs opacity-60">
                {cat.products.length}
              </span>
            </button>
          ))}
        </div>

        {visibleProducts.length === 0 ? (
          <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-1)] py-16 text-center">
            <p className="text-sm text-[var(--ink-mute)]">
              No items match {`"${query}"`} in this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleProducts.map((p) => (
              <ProductCard key={productId(p)} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// Lightweight fallback shown while the search-params dependent browser is
// hydrating. Next.js 16 requires a Suspense boundary around any consumer of
// useSearchParams() so the rest of the page can still be statically rendered
// at build time. Without this the production build fails with
// "useSearchParams() should be wrapped in a suspense boundary".
function ShopBrowserFallback() {
  return (
    <section className="px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="h-7 w-40 rounded bg-[var(--bg-1)]" aria-hidden />
        <div className="mt-6 h-10 w-64 rounded bg-[var(--bg-1)]" aria-hidden />
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] rounded-xl border border-[var(--line)] bg-[var(--bg-1)]"
              aria-hidden
            />
          ))}
        </div>
        <span className="sr-only">Loading shop catalog</span>
      </div>
    </section>
  )
}

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-0)]">
      <Header />
      <Suspense fallback={<ShopBrowserFallback />}>
        <ShopBrowser />
      </Suspense>
      <Footer />
    </main>
  )
}
