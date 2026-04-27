"use client"

import { useState } from "react"
import { Check, Copy, Tag, Sparkles } from "lucide-react"
import { PROMO_CODES } from "@/lib/cart-context"

export function PromoCodes() {
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(code)
      window.setTimeout(() => setCopied(null), 1500)
    } catch {
      // Clipboard may be blocked in iframes; silently fail.
    }
  }

  return (
    <section
      id="promo-codes"
      className="mx-auto max-w-7xl px-6 py-16 scroll-mt-24"
      aria-labelledby="promo-heading"
    >
      <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-1)] p-6 sm:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-2 inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[var(--accent)]">
              <Sparkles className="h-3.5 w-3.5" />
              Limited-time codes
            </span>
            <h2
              id="promo-heading"
              className="text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl"
            >
              Promo Codes
            </h2>
            <p className="mt-2 max-w-xl text-[var(--ink-dim)]">
              Stack these on top of our $8 / 1,000 Robux rate. Copy a code and paste it at
              checkout to unlock the discount instantly.
            </p>
          </div>

          <div className="rounded-lg border border-[var(--line)] bg-[var(--bg-0)] px-4 py-3 text-xs text-[var(--ink-mute)]">
            Already 20% off Roblox&apos;s official rate
            <span className="ml-2 inline-block rounded bg-[var(--accent)]/15 px-2 py-0.5 font-medium text-[var(--accent)]">
              $8 / 1k
            </span>
          </div>
        </div>

        <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {PROMO_CODES.map((promo) => {
            const isCopied = copied === promo.code
            return (
              <li
                key={promo.code}
                className="group relative overflow-hidden rounded-xl border border-dashed border-[var(--line)] bg-[var(--bg-0)] p-5 transition-colors hover:border-[var(--accent)]/40"
              >
                <div className="flex items-center gap-2">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--accent)]/15 text-[var(--accent)]">
                    <Tag className="h-4 w-4" />
                  </div>
                  <span className="rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--accent)]">
                    -{promo.percentOff}%
                  </span>
                </div>

                <p className="mt-4 text-xs uppercase tracking-wider text-[var(--ink-mute)]">
                  Code
                </p>
                <p className="mt-1 font-mono text-2xl font-semibold tracking-wider text-[var(--ink)]">
                  {promo.code}
                </p>
                <p className="mt-3 text-sm text-[var(--ink-dim)]">{promo.description}</p>

                <button
                  type="button"
                  onClick={() => handleCopy(promo.code)}
                  className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                    isCopied
                      ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                      : "border-[var(--line)] text-[var(--ink)] hover:bg-[var(--bg-2)]"
                  }`}
                  aria-label={`Copy promo code ${promo.code}`}
                >
                  {isCopied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy code
                    </>
                  )}
                </button>
              </li>
            )
          })}
        </ul>

        <p className="mt-6 text-center text-xs text-[var(--ink-mute)]">
          One promo code per order. Codes apply automatically at checkout once entered.
        </p>
      </div>
    </section>
  )
}
