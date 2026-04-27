"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

// Our marketplace rate: $8 per 1,000 Robux (Roblox's official rate is $10/1k → 20% off).
export const ROBUX_RATE_USD_PER_1K = 8
export const USD_PER_ROBUX = ROBUX_RATE_USD_PER_1K / 1000
// Roblox's official storefront price for 1,000 Robux, used to compute the
// strike-through "original" price shown on product cards.
export const ROBLOX_OFFICIAL_USD_PER_1K = 10

// Promo codes available on the marketplace. Percent is applied to the USD subtotal.
export type PromoCode = {
  code: string
  percentOff: number
  description: string
}

export const PROMO_CODES: PromoCode[] = [
  { code: "WELCOME10", percentOff: 10, description: "First-time buyer · 10% off your order" },
  { code: "FRUIT15", percentOff: 15, description: "Mythical fruit week · 15% off everything" },
  { code: "MEGA20", percentOff: 20, description: "Members-only · 20% off (limited time)" },
]

export type CartItem = {
  id: string
  name: string
  image?: string
  type: string
  range?: string
  robux: number
  quantity: number
}

type CartContextValue = {
  items: CartItem[]
  totalItems: number
  totalRobux: number
  subtotalUSD: number
  totalUSD: number
  promoCode: PromoCode | null
  promoDiscountUSD: number
  applyPromoCode: (code: string) => { ok: boolean; error?: string }
  clearPromoCode: () => void
  isOpen: boolean
  hydrated: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = "fruits-place-cart-v1"
const PROMO_STORAGE_KEY = "fruits-place-promo-v1"

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [promoCode, setPromoCode] = useState<PromoCode | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setItems(parsed)
      }
    } catch {
      // ignore
    }
    try {
      const rawPromo = localStorage.getItem(PROMO_STORAGE_KEY)
      if (rawPromo) {
        const parsed = JSON.parse(rawPromo) as PromoCode | null
        if (parsed && typeof parsed.code === "string") {
          // Re-validate against the canonical promo list so stale codes are dropped.
          const match = PROMO_CODES.find((p) => p.code === parsed.code)
          if (match) setPromoCode(match)
        }
      }
    } catch {
      // ignore
    }
    setHydrated(true)
  }, [])

  // Persist to localStorage on change
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // ignore
    }
  }, [items, hydrated])

  useEffect(() => {
    if (!hydrated) return
    try {
      if (promoCode) localStorage.setItem(PROMO_STORAGE_KEY, JSON.stringify(promoCode))
      else localStorage.removeItem(PROMO_STORAGE_KEY)
    } catch {
      // ignore
    }
  }, [promoCode, hydrated])

  const addItem: CartContextValue["addItem"] = (item) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
      }
      return [...prev, { ...item, quantity: 1 }]
    })
    setIsOpen(true)
  }

  const removeItem = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id))

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)))
  }

  const clearCart = () => {
    setItems([])
    setPromoCode(null)
  }

  const applyPromoCode: CartContextValue["applyPromoCode"] = (code) => {
    const normalized = code.trim().toUpperCase()
    if (!normalized) return { ok: false, error: "Enter a promo code" }
    const match = PROMO_CODES.find((p) => p.code === normalized)
    if (!match) return { ok: false, error: "That promo code isn't valid" }
    setPromoCode(match)
    return { ok: true }
  }

  const clearPromoCode = () => setPromoCode(null)

  const totalItems = items.reduce((s, i) => s + i.quantity, 0)
  const totalRobux = items.reduce((s, i) => s + i.robux * i.quantity, 0)
  const subtotalUSD = totalRobux * USD_PER_ROBUX
  const promoDiscountUSD = promoCode ? subtotalUSD * (promoCode.percentOff / 100) : 0
  const totalUSD = Math.max(0, subtotalUSD - promoDiscountUSD)

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalRobux,
        subtotalUSD,
        totalUSD,
        promoCode,
        promoDiscountUSD,
        applyPromoCode,
        clearPromoCode,
        isOpen,
        hydrated,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        toggleCart: () => setIsOpen((o) => !o),
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
