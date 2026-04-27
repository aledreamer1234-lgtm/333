"use client"

import type { MouseEvent } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"

type FooterLink = {
  label: string
  href: string
  /** When set, dispatches a shop:navigate event with this alias instead of relying on hash scroll. */
  shopAlias?: string
}

const footerLinks: Record<string, FooterLink[]> = {
  Shop: [
    { label: "Gamepasses", href: "/#gamepasses", shopAlias: "gamepasses" },
    { label: "Devil Fruits", href: "/#fruits", shopAlias: "fruits" },
    { label: "2x EXP Boosts", href: "/#exp-boosts", shopAlias: "exp-boosts" },
    { label: "Beli & Fragments", href: "/#currency", shopAlias: "currency" },
  ],
  Support: [
    { label: "Reviews", href: "/#testimonials" },
    { label: "Contact Us", href: "mailto:support@fruits.place" },
    { label: "Order Status", href: "/checkout" },
  ],
  Legal: [
    { label: "Terms of Service", href: "/legal/terms" },
    { label: "Privacy Policy", href: "/legal/privacy" },
    { label: "Refund Policy", href: "/legal/refunds" },
  ],
}

export function Footer() {
  const router = useRouter()
  const pathname = usePathname()
  const year = new Date().getFullYear()

  const handleShopClick = (
    e: MouseEvent<HTMLAnchorElement>,
    alias: string,
    href: string,
  ) => {
    // Only intercept plain left clicks without modifier keys.
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()

    if (pathname !== "/") {
      // Navigate to home, then let the new page mount listen for the alias
      // via the shop:navigate event we dispatch right after.
      router.push(href)
    }

    // Update the URL hash without triggering native scroll-to-top.
    if (typeof window !== "undefined") {
      const hash = href.split("#")[1]
      if (hash) window.history.replaceState(null, "", `#${hash}`)
      // Defer so a fresh mount on / can subscribe before we dispatch.
      requestAnimationFrame(() => {
        window.dispatchEvent(new CustomEvent("shop:navigate", { detail: alias }))
      })
    }
  }

  return (
    <footer id="support" className="border-t border-[var(--line)] bg-[var(--bg-0)] px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 pb-8 md:grid-cols-5">
          {/* Brand */}
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--accent)]">
                <span className="text-sm font-bold text-[var(--bg-0)]">F</span>
              </div>
              <span className="text-lg font-semibold tracking-tight text-[var(--ink)]">
                fruits.place
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-[var(--ink-mute)]">
              The trusted marketplace for Blox Fruits gamepasses, fruits and boosts. Auto-delivered in under 1 hour.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="mb-4 text-xs font-medium uppercase tracking-wider text-[var(--ink-mute)]">
                {category}
              </h4>
              <ul className="space-y-2">
                {links.map((link) =>
                  link.shopAlias ? (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        onClick={(e) => handleShopClick(e, link.shopAlias!, link.href)}
                        className="text-sm text-[var(--ink-dim)] transition-colors hover:text-[var(--ink)]"
                      >
                        {link.label}
                      </a>
                    </li>
                  ) : (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        scroll={false}
                        className="text-sm text-[var(--ink-dim)] transition-colors hover:text-[var(--ink)]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-[var(--line)] pt-8 md:flex-row">
          <p className="text-sm text-[var(--ink-mute)]">
            {`\u00A9 ${year} fruits.place \u2014 All rights reserved.`}
          </p>
          <p className="text-xs text-[var(--ink-mute)]">
            Not affiliated with or endorsed by Roblox Corporation or Gamer Robot Inc.
          </p>
        </div>
      </div>
    </footer>
  )
}
