"use client"

import { ArrowRight, Star } from "lucide-react"

export function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-16 pt-20">
      {/* Live Badge */}
      <div className="mb-8 flex justify-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--bg-1)] px-4 py-2 text-sm text-[var(--ink-dim)]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]"></span>
          </span>
          2,847 orders delivered today
          <ArrowRight className="h-3 w-3" />
        </div>
      </div>

      {/* Main Headline */}
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-[var(--ink)] sm:text-5xl md:text-6xl">
          The marketplace for
          <br />
          <span className="text-[var(--ink)]">Blox Fruits.</span>
          <br />
          <span className="text-[var(--ink-mute)]">Delivered fast.</span>
        </h1>
        
        <p className="mx-auto mt-6 max-w-xl text-lg text-[var(--ink-dim)]">
          Gamepasses, fruits, swords, and more - auto-delivered, lowest prices, zero waiting. Trusted by 480,000+ players.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a 
            href="#shop"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--ink)] px-6 py-3 text-sm font-medium text-[var(--bg-0)] transition-all hover:bg-[var(--ink-dim)]"
          >
            Shop marketplace
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#testimonials"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] px-6 py-3 text-sm font-medium text-[var(--ink-dim)] transition-colors hover:border-[var(--ink-mute)] hover:text-[var(--ink)]"
          >
            Read reviews
            <Star className="h-4 w-4 fill-[var(--accent)] text-[var(--accent)]" />
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="mx-auto mt-16 flex max-w-3xl flex-wrap items-center justify-center gap-8 border-t border-[var(--line)] pt-8 md:gap-16">
        <div className="text-center">
          <div className="text-2xl font-semibold text-[var(--ink)]">
            150K<span className="text-[var(--accent)]">+</span>
          </div>
          <div className="mt-1 text-sm text-[var(--ink-mute)]">Orders delivered</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-semibold text-[var(--ink)]">&lt; 1 hr</div>
          <div className="mt-1 text-sm text-[var(--ink-mute)]">Average delivery</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-2xl font-semibold text-[var(--ink)]">
            4.92
            <Star className="h-5 w-5 fill-[var(--accent)] text-[var(--accent)]" />
          </div>
          <div className="mt-1 text-sm text-[var(--ink-mute)]">From 28K reviews</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-semibold text-[var(--ink)]">1</div>
          <div className="mt-1 text-sm text-[var(--ink-mute)]">Game supported</div>
        </div>
      </div>
    </section>
  )
}
