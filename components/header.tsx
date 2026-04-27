"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ShoppingCart, Search, Menu, X, User, LogOut } from "lucide-react"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { useCart } from "@/lib/cart-context"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { totalItems, openCart, hydrated } = useCart()

  useEffect(() => {
    // If Supabase isn't configured, skip auth wiring so the page still renders.
    if (!isSupabaseConfigured()) {
      setLoading(false)
      return
    }

    const supabase = createClient()

    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    if (!isSupabaseConfigured()) return
    const supabase = createClient()
    await supabase.auth.signOut()
    setDropdownOpen(false)
    window.location.href = "/"
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line-soft)] bg-[var(--bg-0)]/80 backdrop-blur-xl">
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--accent)]">
            <span className="text-sm font-bold text-[var(--bg-0)]">F</span>
          </div>
          <span className="text-lg font-semibold tracking-tight text-[var(--ink)]">
            fruits.place
          </span>
        </Link>

        {/* Desktop Nav (absolutely centered) */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 hidden -translate-y-1/2 items-center justify-center md:flex">
          <div className="pointer-events-auto flex items-center gap-8">
            {[
              { label: "Marketplace", href: "/#shop" },
              { label: "Giveaways", href: "/giveaways" },
              { label: "Promos", href: "/promos" },
              { label: "Reviews", href: "/#testimonials" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-[var(--ink)] ${
                  item.label === "Marketplace" ? "text-[var(--ink)]" : "text-[var(--ink-mute)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button 
            className="grid h-9 w-9 place-items-center rounded-lg text-[var(--ink-mute)] transition-colors hover:bg-[var(--bg-2)] hover:text-[var(--ink)]"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={openCart}
            className="relative flex items-center gap-2 rounded-lg border border-[var(--line)] px-3 py-2 text-sm text-[var(--ink-dim)] transition-colors hover:border-[var(--ink-mute)] hover:text-[var(--ink)]"
            aria-label={`Shopping cart${hydrated && totalItems > 0 ? `, ${totalItems} items` : ""}`}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Cart</span>
            {hydrated && totalItems > 0 && (
              <span className="ml-1 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-[var(--accent)] px-1.5 text-[10px] font-bold text-[var(--bg-0)]">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </button>
          
          {loading ? (
            <div className="h-9 w-20 animate-pulse rounded-lg bg-[var(--bg-2)]" />
          ) : user ? (
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-lg border border-[var(--line)] px-3 py-2 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[var(--bg-2)]"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline max-w-[100px] truncate">
                  {user.email?.split("@")[0]}
                </span>
              </button>
              
              {dropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setDropdownOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 top-full mt-2 z-20 w-48 rounded-lg border border-[var(--line)] bg-[var(--bg-1)] py-1 shadow-xl">
                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--ink-dim)] hover:bg-[var(--bg-2)] hover:text-[var(--ink)]"
                    >
                      <User className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-[var(--bg-2)]"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="hidden rounded-lg border border-[var(--line)] px-4 py-2 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[var(--bg-2)] md:block"
            >
              Sign in
            </Link>
          )}
          
          <button 
            className="grid h-9 w-9 place-items-center rounded-lg text-[var(--ink-mute)] md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-[var(--line-soft)] bg-[var(--bg-1)] px-6 py-4 md:hidden">
          {[
            { label: "Marketplace", href: "/#shop" },
            { label: "Giveaways", href: "/giveaways" },
            { label: "Promos", href: "/promos" },
            { label: "Reviews", href: "/#testimonials" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="block py-3 text-[var(--ink-dim)] transition-colors hover:text-[var(--ink)]"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="block py-3 text-[var(--ink-dim)] transition-colors hover:text-[var(--ink)]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <button 
                onClick={handleSignOut}
                className="mt-4 w-full rounded-lg border border-red-500/30 py-2.5 text-sm font-medium text-red-400"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="mt-4 block w-full rounded-lg border border-[var(--line)] py-2.5 text-center text-sm font-medium text-[var(--ink)]"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign in
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
