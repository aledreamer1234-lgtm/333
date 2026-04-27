"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useCart, USD_PER_ROBUX, ROBUX_RATE_USD_PER_1K } from "@/lib/cart-context"

export function CartDrawer() {
  const router = useRouter()
  const {
    isOpen,
    closeCart,
    items,
    updateQuantity,
    removeItem,
    totalItems,
    totalRobux,
    subtotalUSD,
    totalUSD,
    promoCode,
    promoDiscountUSD,
    clearCart,
  } = useCart()

  const handleCheckout = () => {
    closeCart()
    router.push("/checkout")
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-[var(--line)] bg-[var(--bg-1)] p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-[var(--line)] px-6 py-4">
          <SheetTitle className="text-[var(--ink)]">
            Your Cart
            {totalItems > 0 && (
              <span className="ml-2 text-sm font-normal text-[var(--ink-mute)]">
                ({totalItems} {totalItems === 1 ? "item" : "items"})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-[var(--bg-2)]">
              <ShoppingBag className="h-8 w-8 text-[var(--ink-mute)]" />
            </div>
            <p className="mb-1 font-medium text-[var(--ink)]">Your cart is empty</p>
            <p className="mb-6 text-sm text-[var(--ink-mute)]">
              Browse the shop to add items to your cart.
            </p>
            <button
              onClick={closeCart}
              className="rounded-lg border border-[var(--line)] px-4 py-2 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[var(--bg-2)]"
            >
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <ul className="space-y-3">
                {items.map((item) => {
                  const lineRobux = item.robux * item.quantity
                  const lineUSD = lineRobux * USD_PER_ROBUX
                  return (
                    <li
                      key={item.id}
                      className="flex gap-3 rounded-lg border border-[var(--line)] bg-[var(--bg-0)] p-3"
                    >
                      <div className="grid h-16 w-16 flex-shrink-0 place-items-center overflow-hidden rounded-lg bg-[var(--bg-2)]">
                        {item.image ? (
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="h-full w-full object-contain p-1"
                          />
                        ) : (
                          <span className="text-lg font-semibold text-[var(--ink-mute)]">
                            {item.name.charAt(0)}
                          </span>
                        )}
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h4 className="truncate text-sm font-semibold text-[var(--ink)]">
                              {item.name}
                            </h4>
                            {item.range && (
                              <p className="truncate text-xs text-[var(--ink-mute)]">
                                {item.range}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            aria-label={`Remove ${item.name}`}
                            className="text-[var(--ink-mute)] transition-colors hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
                          <div className="flex items-center gap-1 rounded-md border border-[var(--line)]">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              aria-label="Decrease quantity"
                              className="grid h-7 w-7 place-items-center text-[var(--ink-mute)] transition-colors hover:bg-[var(--bg-2)] hover:text-[var(--ink)]"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="min-w-[1.5rem] text-center text-xs font-medium text-[var(--ink)]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              aria-label="Increase quantity"
                              className="grid h-7 w-7 place-items-center text-[var(--ink-mute)] transition-colors hover:bg-[var(--bg-2)] hover:text-[var(--ink)]"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-semibold text-[var(--ink)]">
                              ${lineUSD.toFixed(2)}
                            </p>
                            <p className="text-[10px] text-[var(--ink-mute)]">
                              {lineRobux.toLocaleString()} R$
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>

              <button
                onClick={clearCart}
                className="mt-4 text-xs text-[var(--ink-mute)] transition-colors hover:text-[var(--ink)]"
              >
                Clear cart
              </button>
            </div>

            <div className="space-y-3 border-t border-[var(--line)] bg-[var(--bg-1)] px-6 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--ink-dim)]">Subtotal (Robux)</span>
                <span className="font-medium text-[var(--ink)]">
                  {totalRobux.toLocaleString()} R$
                </span>
              </div>
              {promoCode && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--ink-dim)]">Subtotal (USD)</span>
                    <span className="font-medium text-[var(--ink)]">
                      ${subtotalUSD.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-[var(--accent)]">
                    <span>
                      Promo{" "}
                      <span className="font-mono text-xs">({promoCode.code})</span>
                    </span>
                    <span>-${promoDiscountUSD.toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="flex items-center justify-between border-t border-[var(--line-soft)] pt-3 text-base">
                <span className="font-medium text-[var(--ink)]">Total</span>
                <span className="text-lg font-semibold text-[var(--ink)]">
                  ${totalUSD.toFixed(2)}
                </span>
              </div>
              <p className="text-center text-[11px] text-[var(--ink-mute)]">
                Rate: ${ROBUX_RATE_USD_PER_1K.toFixed(2)} per 1,000 Robux
              </p>
              <button
                type="button"
                onClick={handleCheckout}
                className="w-full rounded-lg bg-[var(--accent)] py-3 text-sm font-semibold text-[var(--bg-0)] transition-opacity hover:opacity-90"
              >
                Checkout - ${totalUSD.toFixed(2)}
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
