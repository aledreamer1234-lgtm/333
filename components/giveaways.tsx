"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Gift,
  Ticket,
  Trophy,
  X,
} from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"

// Giveaway items are a curated mix of best sellers across the catalog so the
// raffle reflects what people actually want. Each entry mirrors the canonical
// product list in `components/shop.tsx` and uses the same image assets.
type Giveaway = {
  id: string
  name: string
  rangeLabel: string
  image: string
  // Approximate USD value (used as the "prize value" badge).
  valueUSD: number
  // How many entries the raffle currently has.
  entries: number
  // Days until the raffle ends.
  daysRemaining: number
  // Total raffle length, used to render a sensible progress bar.
  totalDays: number
  tag: "Best Seller" | "Trending" | "Hot Drop" | "Mythical"
}

const GIVEAWAYS: Giveaway[] = [
  {
    id: "dragon",
    name: "Dragon Fruit",
    rangeLabel: "Mythical · Best Seller",
    image: "/items/dragon.jpg",
    valueUSD: 40,
    entries: 4391,
    daysRemaining: 3,
    totalDays: 7,
    tag: "Mythical",
  },
  {
    id: "kitsune",
    name: "Kitsune Fruit",
    rangeLabel: "Mythical · Top Pick",
    image: "/items/kitsune.jpg",
    valueUSD: 32,
    entries: 3128,
    daysRemaining: 2,
    totalDays: 5,
    tag: "Best Seller",
  },
  {
    id: "dark-blade",
    name: "Dark Blade",
    rangeLabel: "Permanent Gamepass",
    image: "/items/dark-blade.jpg",
    valueUSD: 9.6,
    entries: 2104,
    daysRemaining: 4,
    totalDays: 7,
    tag: "Best Seller",
  },
  {
    id: "mythical-scrolls",
    name: "Mythical Scrolls",
    rangeLabel: "Permanent Gamepass",
    image: "/items/mythical-scrolls.jpg",
    valueUSD: 4,
    entries: 1612,
    daysRemaining: 1,
    totalDays: 3,
    tag: "Trending",
  },
  {
    id: "trex",
    name: "T-Rex Fruit",
    rangeLabel: "Legendary",
    image: "/items/trex.jpg",
    valueUSD: 18.8,
    entries: 2240,
    daysRemaining: 4,
    totalDays: 7,
    tag: "Best Seller",
  },
  {
    id: "dough",
    name: "Dough Fruit",
    rangeLabel: "Legendary",
    image: "/items/dough.jpg",
    valueUSD: 19.2,
    entries: 1944,
    daysRemaining: 5,
    totalDays: 7,
    tag: "Trending",
  },
]

const tagColors: Record<Giveaway["tag"], string> = {
  "Best Seller": "bg-[var(--accent)]/20 text-[var(--accent)] border-[var(--accent)]/30",
  Trending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  "Hot Drop": "bg-rose-500/20 text-rose-400 border-rose-500/30",
  Mythical: "bg-purple-500/20 text-purple-400 border-purple-500/30",
}

// Modal flow:
//   - "form"             → guest enters Roblox username, we then gate on sign-up
//   - "signup-required"  → guest is told they must sign up to enter
//   - "entered"          → signed-in users see immediate confirmation since
//                          their Roblox handle is already verified
type ModalStep = "form" | "signup-required" | "entered"

export function Giveaways() {
  const [selected, setSelected] = useState<Giveaway | null>(null)
  const [step, setStep] = useState<ModalStep>("form")
  const [username, setUsername] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Pull the visitor's verified Roblox handle from Supabase user metadata so
  // we can skip the gate for already-signed-in users. Giveaways still require
  // an account — but if you already have one, entering the raffle is one tap.
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured()) return
    const supabase = createClient()
    let active = true
    supabase.auth.getUser().then(({ data }) => {
      if (active) setAuthUser(data.user ?? null)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const verifiedRobloxName =
    (authUser?.user_metadata?.roblox_username as string | undefined) ??
    (authUser?.user_metadata?.username as string | undefined) ??
    null

  const open = (g: Giveaway) => {
    setSelected(g)
    setError(null)
    if (verifiedRobloxName) {
      // Signed-in path: skip the form entirely.
      setUsername(verifiedRobloxName)
      setStep("entered")
    } else {
      setUsername("")
      setStep("form")
    }
  }

  const close = () => {
    setSelected(null)
    setStep("form")
    setUsername("")
    setError(null)
  }

  // Close modal on escape and lock body scroll while open.
  useEffect(() => {
    if (!selected) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    window.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [selected])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = username.trim()
    if (trimmed.length < 3) {
      setError("Enter a valid Roblox username (3+ characters)")
      return
    }
    if (!/^[A-Za-z0-9_]+$/.test(trimmed)) {
      setError("Roblox usernames can only contain letters, numbers, and underscores")
      return
    }
    setError(null)
    setStep("signup-required")
  }

  const totalEntries = useMemo(
    () => GIVEAWAYS.reduce((s, g) => s + g.entries, 0),
    [],
  )

  return (
    <section
      id="giveaways"
      className="mx-auto max-w-7xl px-6 py-20 scroll-mt-24"
      aria-labelledby="giveaways-heading"
    >
      {/* Section header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="mb-2 block text-xs uppercase tracking-widest text-[var(--ink-mute)]">
            - Free entries
          </span>
          <h2
            id="giveaways-heading"
            className="text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl"
          >
            Weekly Giveaways
          </h2>
          <p className="mt-2 max-w-2xl text-[var(--ink-dim)]">
            Best sellers, dropped weekly. Pick a prize, enter your Roblox username, and you&apos;re
            in the draw.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--bg-1)] px-4 py-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--accent)]/15 text-[var(--accent)]">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-[var(--ink-mute)]">
              Total entries this week
            </p>
            <p className="text-lg font-semibold text-[var(--ink)]">
              {totalEntries.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Giveaway grid */}
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {GIVEAWAYS.map((g) => {
          const progress = Math.max(
            4,
            Math.min(96, ((g.totalDays - g.daysRemaining) / g.totalDays) * 100),
          )
          return (
            <li
              key={g.id}
              className="group flex flex-col rounded-2xl border border-[var(--line)] bg-[var(--bg-1)] p-4 transition-colors hover:border-[var(--ink-mute)]/40"
            >
              <div className="flex items-start gap-4">
                <div className="grid h-20 w-20 flex-shrink-0 place-items-center overflow-hidden rounded-xl border border-[var(--line)] bg-gradient-to-br from-[var(--bg-2)] to-[var(--bg-0)]">
                  <Image
                    src={g.image || "/placeholder.svg"}
                    alt={g.name}
                    width={80}
                    height={80}
                    className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <span
                    className={`inline-block rounded border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${tagColors[g.tag]}`}
                  >
                    {g.tag}
                  </span>
                  <h3 className="mt-2 truncate text-base font-semibold text-[var(--ink)]">
                    {g.name}
                  </h3>
                  <p className="truncate text-xs text-[var(--ink-mute)]">{g.rangeLabel}</p>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-[var(--ink-dim)]">
                  <Ticket className="h-3.5 w-3.5 text-[var(--ink-mute)]" />
                  <dt className="sr-only">Entries</dt>
                  <dd className="font-medium text-[var(--ink)]">
                    {g.entries.toLocaleString()}
                  </dd>
                  <span className="text-[var(--ink-mute)]">entries</span>
                </div>
                <div className="flex items-center gap-1.5 text-[var(--ink-dim)]">
                  <Clock className="h-3.5 w-3.5 text-[var(--ink-mute)]" />
                  <dt className="sr-only">Time remaining</dt>
                  <dd className="font-medium text-[var(--ink)]">
                    {g.daysRemaining} day{g.daysRemaining === 1 ? "" : "s"}
                  </dd>
                  <span className="text-[var(--ink-mute)]">left</span>
                </div>
              </dl>

              {/* Progress bar */}
              <div
                className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-3)]"
                role="progressbar"
                aria-valuenow={Math.round(progress)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${g.name} raffle progress`}
              >
                <div
                  className="h-full rounded-full bg-[var(--accent)] transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-xs text-[var(--ink-mute)]">
                  Prize value{" "}
                  <span className="font-medium text-[var(--ink)]">
                    ${g.valueUSD.toFixed(2)}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => open(g)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-[var(--bg-0)] transition-opacity hover:opacity-90"
                >
                  Join raffle
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-labelledby="giveaway-modal-title"
        >
          <div
            className="relative w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--bg-1)] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-[var(--line)] text-[var(--ink-mute)] transition-colors hover:bg-[var(--bg-2)] hover:text-[var(--ink)]"
            >
              <X className="h-4 w-4" />
            </button>

            {step === "form" && (
              <>
                <div className="flex items-center gap-3">
                  <div className="grid h-14 w-14 flex-shrink-0 place-items-center overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--bg-2)]">
                    <Image
                      src={selected.image || "/placeholder.svg"}
                      alt={selected.name}
                      width={56}
                      height={56}
                      className="h-full w-full object-contain p-1.5"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-[var(--ink-mute)]">
                      Raffle entry
                    </p>
                    <h3
                      id="giveaway-modal-title"
                      className="truncate text-lg font-semibold text-[var(--ink)]"
                    >
                      {selected.name}
                    </h3>
                  </div>
                </div>

                <p className="mt-5 text-sm text-[var(--ink-dim)]">
                  Enter the Roblox username you want the prize delivered to. You&apos;ll get one
                  entry per raffle and we&apos;ll email you if you win.
                </p>

                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                  <div>
                    <label
                      htmlFor="giveaway-username"
                      className="mb-1.5 block text-sm font-medium text-[var(--ink)]"
                    >
                      Roblox username
                    </label>
                    <input
                      id="giveaway-username"
                      type="text"
                      autoFocus
                      autoComplete="username"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value)
                        if (error) setError(null)
                      }}
                      placeholder="e.g. PirateKing123"
                      className="w-full rounded-lg border border-[var(--line)] bg-[var(--bg-0)] px-3 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-mute)] focus:border-[var(--accent)] focus:outline-none"
                    />
                    {error && (
                      <p className="mt-1.5 text-xs text-red-400" role="alert">
                        {error}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-lg bg-[var(--accent)] py-3 text-sm font-semibold text-[var(--bg-0)] transition-opacity hover:opacity-90"
                  >
                    Submit entry
                  </button>
                </form>

                <p className="mt-3 text-center text-[11px] text-[var(--ink-mute)]">
                  One entry per Roblox account. Winners drawn after the timer ends.
                </p>
              </>
            )}

            {step === "signup-required" && (
              <div className="text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[var(--accent)]/15 text-[var(--accent)]">
                  <Gift className="h-7 w-7" />
                </div>
                <h3
                  id="giveaway-modal-title"
                  className="mt-4 text-xl font-semibold tracking-tight text-[var(--ink)]"
                >
                  You need to sign up
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[var(--ink-dim)]">
                  {"To enter the "}
                  <span className="font-medium text-[var(--ink)]">{selected.name}</span>
                  {" raffle, create a free fruits.place account. We'll link your entry to "}
                  <span className="font-mono text-[var(--ink)]">{username}</span>
                  {" automatically."}
                </p>

                <div className="mt-6 flex flex-col gap-2">
                  <Link
                    href="/auth/sign-up"
                    onClick={close}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] py-3 text-sm font-semibold text-[var(--bg-0)] transition-opacity hover:opacity-90"
                  >
                    Create free account
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/auth/login"
                    onClick={close}
                    className="inline-flex w-full items-center justify-center rounded-lg border border-[var(--line)] py-2.5 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[var(--bg-2)]"
                  >
                    I already have an account
                  </Link>
                </div>
              </div>
            )}

            {step === "entered" && (
              <div className="text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[var(--accent)]/15 text-[var(--accent)]">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3
                  id="giveaway-modal-title"
                  className="mt-4 text-xl font-semibold tracking-tight text-[var(--ink)]"
                >
                  You&apos;re in the draw
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[var(--ink-dim)]">
                  {"Your entry for the "}
                  <span className="font-medium text-[var(--ink)]">{selected.name}</span>
                  {" raffle is locked in for "}
                  <span className="font-mono text-[var(--ink)]">@{username}</span>
                  {". We'll notify you in-app if you win — no further action needed."}
                </p>

                <div className="mt-6 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={close}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--accent)] py-3 text-sm font-semibold text-[var(--bg-0)] transition-opacity hover:opacity-90"
                  >
                    Done
                  </button>
                  <Link
                    href="/dashboard"
                    onClick={close}
                    className="inline-flex w-full items-center justify-center rounded-lg border border-[var(--line)] py-2.5 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[var(--bg-2)]"
                  >
                    View my entries
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
