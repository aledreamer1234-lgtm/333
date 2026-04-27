"use client"

import { useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Info,
  Loader2,
  Lock,
  LogIn,
  ShoppingBag,
  Tag,
  User as UserIcon,
  UserCheck,
  UserX,
  X,
} from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { useCart, USD_PER_ROBUX, ROBUX_RATE_USD_PER_1K } from "@/lib/cart-context"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"

type PaymentMethod = "card" | "paypal" | "crypto"

const paymentMethods: { id: PaymentMethod; label: string; hint: string }[] = [
  { id: "card", label: "Credit / Debit Card", hint: "Visa, Mastercard, Amex" },
  { id: "paypal", label: "PayPal", hint: "Pay with your PayPal balance" },
  { id: "crypto", label: "Crypto", hint: "BTC, ETH, USDC" },
]

export function Checkout() {
  const router = useRouter()
  const {
    items,
    totalItems,
    totalRobux,
    subtotalUSD,
    totalUSD,
    promoCode,
    promoDiscountUSD,
    applyPromoCode,
    clearPromoCode,
    clearCart,
    hydrated,
  } = useCart()

  const [robloxUsername, setRobloxUsername] = useState("")
  const [contact, setContact] = useState("")
  const [contactType, setContactType] = useState<"discord" | "email">("discord")
  const [notes, setNotes] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card")
  const [agreed, setAgreed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [promoInput, setPromoInput] = useState("")
  const [promoError, setPromoError] = useState<string | null>(null)

  // ---- "Is this the right user?" confirmation gate ----
  // Pressing the place-order button doesn't immediately charge / submit the
  // order. Instead it opens a modal that shows the Roblox username (and
  // avatar, if we have it from the verified session) and forces a 3s wait
  // before the confirm button becomes clickable. This keeps a sleepy buyer
  // from sending Robux to a typo'd username.
  const CONFIRM_DELAY_SECONDS = 3
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmCountdown, setConfirmCountdown] = useState(CONFIRM_DELAY_SECONDS)

  // ---- auth banner: signed in vs guest ----
  // Checkout never blocks on auth — guests can place orders. But if the visitor
  // is already signed in we (a) prefill the verified Roblox username and lock
  // the field, and (b) show a "Signed in as @name" pill so they know orders
  // will be linked to their account. Otherwise we surface a small banner with
  // "Sign in" and "Continue as guest" buttons; the latter just dismisses the
  // banner so the visitor isn't nagged again on this page load.
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null)
  const [authResolved, setAuthResolved] = useState(false)
  const [guestDismissed, setGuestDismissed] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setAuthResolved(true)
      return
    }
    const supabase = createClient()
    let active = true
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return
      setAuthUser(data.user ?? null)
      setAuthResolved(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  // When we learn who the signed-in user is, prefill (and lock) their verified
  // Roblox handle so it can't accidentally drift from the account on file.
  const verifiedRobloxName =
    (authUser?.user_metadata?.roblox_username as string | undefined) ??
    (authUser?.user_metadata?.username as string | undefined) ??
    null

  const verifiedAvatarUrl =
    (authUser?.user_metadata?.roblox_avatar_url as string | undefined) ?? null

  useEffect(() => {
    if (verifiedRobloxName) setRobloxUsername(verifiedRobloxName)
  }, [verifiedRobloxName])

  // ---- Live Roblox lookup ----
  // We debounce-call /api/roblox/lookup as the buyer types so we can (a) show
  // their avatar and canonical username/displayName, and (b) refuse to place
  // an order against a username that doesn't actually exist. The route already
  // enforces Roblox's username rule (3–20 chars, [A-Za-z0-9_] only), so a
  // display name like "the cool kid" gets caught at the format step before we
  // even hit the network.
  type LookupState =
    | { kind: "idle" }
    | { kind: "invalid_format"; reason: "too_short" | "too_long" | "bad_chars" }
    | { kind: "checking" }
    | { kind: "found"; id: number; name: string; displayName: string; avatarUrl: string | null }
    | { kind: "not_found" }
    | { kind: "error"; message: string }

  const [lookup, setLookup] = useState<LookupState>({ kind: "idle" })

  useEffect(() => {
    const raw = robloxUsername.trim()

    // Reset everything for an empty field — no error, no avatar, no submit.
    if (raw.length === 0) {
      setLookup({ kind: "idle" })
      return
    }

    // Catch obvious display-name typos client-side so we can give a friendly,
    // specific hint instead of waiting for a 400 from the server.
    if (raw.length < 3) {
      setLookup({ kind: "invalid_format", reason: "too_short" })
      return
    }
    if (raw.length > 20) {
      setLookup({ kind: "invalid_format", reason: "too_long" })
      return
    }
    if (!/^[A-Za-z0-9_]+$/.test(raw)) {
      setLookup({ kind: "invalid_format", reason: "bad_chars" })
      return
    }

    // Trusted shortcut: a signed-in, already-verified handle with a cached
    // avatar in user_metadata. Skip the network call entirely.
    if (
      verifiedRobloxName &&
      raw.toLowerCase() === verifiedRobloxName.toLowerCase()
    ) {
      setLookup({
        kind: "found",
        id: 0,
        name: verifiedRobloxName,
        displayName: verifiedRobloxName,
        avatarUrl: verifiedAvatarUrl,
      })
      return
    }

    setLookup({ kind: "checking" })
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch("/api/roblox/lookup", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ username: raw }),
          signal: controller.signal,
        })
        const data = (await res.json()) as
          | { id: number; name: string; displayName: string; avatarUrl: string | null }
          | { error: string }

        if (controller.signal.aborted) return
        if (!res.ok) {
          if (res.status === 404) {
            setLookup({ kind: "not_found" })
          } else {
            setLookup({
              kind: "error",
              message:
                "error" in data ? data.error : "Couldn't reach Roblox right now.",
            })
          }
          return
        }
        if ("error" in data) {
          setLookup({ kind: "error", message: data.error })
          return
        }
        setLookup({
          kind: "found",
          id: data.id,
          name: data.name,
          displayName: data.displayName,
          avatarUrl: data.avatarUrl,
        })
      } catch (err) {
        if ((err as Error).name === "AbortError") return
        setLookup({
          kind: "error",
          message: "Couldn't reach Roblox right now. Try again in a moment.",
        })
      }
    }, 450)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [robloxUsername, verifiedRobloxName, verifiedAvatarUrl])

  const lookupAvatarUrl = lookup.kind === "found" ? lookup.avatarUrl : null
  const lookupDisplayName = lookup.kind === "found" ? lookup.displayName : null
  const lookupCanonicalName = lookup.kind === "found" ? lookup.name : robloxUsername
  const usernameVerified = lookup.kind === "found"

  // Countdown ticker for the confirmation modal. Resets to the full delay
  // each time the modal opens, then ticks down to 0 once per second.
  useEffect(() => {
    if (!confirmOpen) return
    if (confirmCountdown <= 0) return
    const timer = window.setTimeout(() => {
      setConfirmCountdown((s) => Math.max(0, s - 1))
    }, 1000)
    return () => window.clearTimeout(timer)
  }, [confirmOpen, confirmCountdown])

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault()
    const result = applyPromoCode(promoInput)
    if (!result.ok) {
      setPromoError(result.error ?? "Invalid promo code")
      return
    }
    setPromoError(null)
    setPromoInput("")
  }

  const handleRemovePromo = () => {
    clearPromoCode()
    setPromoError(null)
    setPromoInput("")
  }

  // Form submit just opens the confirmation modal. The actual order is only
  // placed after the user confirms post-countdown via `placeOrder`. We refuse
  // to even open the modal until the live lookup confirms the username exists,
  // because every order line item is delivered by Roblox username.
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!agreed || items.length === 0 || submitting) return
    if (!robloxUsername.trim()) return
    if (!usernameVerified) return
    setConfirmCountdown(CONFIRM_DELAY_SECONDS)
    setConfirmOpen(true)
  }

  const cancelConfirm = () => {
    if (submitting) return
    setConfirmOpen(false)
  }

  const placeOrder = async () => {
    if (confirmCountdown > 0 || submitting) return
    setSubmitting(true)
    // Simulate placing the order
    await new Promise((r) => setTimeout(r, 900))
    const id = `FP-${Date.now().toString(36).toUpperCase()}`
    setOrderId(id)
    clearCart()
    setSubmitting(false)
    setConfirmOpen(false)
  }

  // Order placed — success state
  if (orderId) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-16">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-1)] p-8 text-center">
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-[var(--accent)]/15 text-[var(--accent)]">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
            Order confirmed
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--ink-dim)]">
            Thanks for your purchase. Our team has been notified and will deliver your items in
            game shortly. A receipt has been sent to your contact.
          </p>

          <dl className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-3 rounded-lg border border-[var(--line-soft)] bg-[var(--bg-0)] p-4 text-left text-sm">
            <dt className="text-[var(--ink-mute)]">Order ID</dt>
            <dd className="text-right font-mono text-[var(--ink)]">{orderId}</dd>
            <dt className="text-[var(--ink-mute)]">Roblox</dt>
            <dd className="truncate text-right text-[var(--ink)]">{robloxUsername}</dd>
            <dt className="text-[var(--ink-mute)]">Payment</dt>
            <dd className="text-right text-[var(--ink)]">
              {paymentMethods.find((p) => p.id === paymentMethod)?.label}
            </dd>
          </dl>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="rounded-lg bg-[var(--ink)] px-5 py-2.5 text-sm font-medium text-[var(--bg-0)] transition-opacity hover:opacity-90"
            >
              Back to home
            </Link>
            <button
              onClick={() => router.push("/#shop")}
              className="rounded-lg border border-[var(--line)] px-5 py-2.5 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[var(--bg-2)]"
            >
              Continue shopping
            </button>
          </div>
        </div>
      </section>
    )
  }

  // Empty cart guard (only after hydration to avoid SSR flicker)
  if (hydrated && items.length === 0) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-20">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-1)] p-10 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-[var(--bg-2)]">
            <ShoppingBag className="h-6 w-6 text-[var(--ink-mute)]" />
          </div>
          <h1 className="text-xl font-semibold text-[var(--ink)]">Your cart is empty</h1>
          <p className="mt-2 text-sm text-[var(--ink-dim)]">
            Add some items from the marketplace to start an order.
          </p>
          <Link
            href="/#shop"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--ink)] px-5 py-2.5 text-sm font-medium text-[var(--bg-0)] transition-opacity hover:opacity-90"
          >
            Browse marketplace
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <Link
        href="/#shop"
        className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--ink-mute)] transition-colors hover:text-[var(--ink)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to shop
      </Link>

      <h1 className="text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl">
        Checkout
      </h1>
      <p className="mt-2 text-sm text-[var(--ink-dim)]">
        Confirm your delivery details and payment method.
      </p>

      {/* Auth status banner. Hidden until we've resolved Supabase state to
          avoid a flash, and hidden again once a guest opts in to checkout. */}
      {authResolved && authUser && verifiedRobloxName && (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-3 text-sm">
          <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-[var(--accent)]/20 text-[var(--accent)]">
            <UserCheck className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-[var(--ink)]">
              Signed in as{" "}
              <span className="font-mono">@{verifiedRobloxName}</span>
            </p>
            <p className="text-xs text-[var(--ink-mute)]">
              This order will be linked to your verified Roblox account.
            </p>
          </div>
        </div>
      )}
      {authResolved && !authUser && !guestDismissed && (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--bg-1)] px-4 py-3">
          <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-[var(--bg-2)] text-[var(--ink-mute)]">
            <LogIn className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-medium text-[var(--ink)]">
              Checking out as a guest
            </p>
            <p className="text-xs text-[var(--ink-mute)]">
              Sign in to track this order, unlock tier perks, and skip filling
              this in next time.
            </p>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            <Link
              href="/auth/login"
              className="rounded-lg bg-[var(--ink)] px-3 py-2 text-xs font-semibold text-[var(--bg-0)] transition-opacity hover:opacity-90"
            >
              Sign in
            </Link>
            <button
              type="button"
              onClick={() => setGuestDismissed(true)}
              className="rounded-lg border border-[var(--line)] px-3 py-2 text-xs font-medium text-[var(--ink)] transition-colors hover:bg-[var(--bg-2)]"
            >
              Continue as guest
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]"
      >
        {/* Left: form */}
        <div className="space-y-6">
          {/* Delivery */}
          <fieldset className="rounded-2xl border border-[var(--line)] bg-[var(--bg-1)] p-6">
            <legend className="px-1 text-xs font-medium uppercase tracking-wider text-[var(--ink-mute)]">
              Delivery details
            </legend>

            <div className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="roblox"
                  className="mb-1.5 block text-sm font-medium text-[var(--ink)]"
                >
                  Roblox username
                </label>

                {/* "No display names" hint sits above the input so buyers see
                    it before they start typing. The live status below tells
                    them in real time whether they got it right. */}
                <div className="mb-2 flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] leading-relaxed text-amber-200">
                  <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                  <span>
                    <strong className="font-semibold">Display names aren&apos;t accepted.</strong>{" "}
                    Use your actual Roblox <em>username</em> — the one shown
                    with an <span className="font-mono">@</span> on your profile,
                    not the larger display name. Usernames are 3–20 characters
                    and only contain letters, numbers, and underscores.
                  </span>
                </div>

                <div className="flex items-stretch gap-3">
                  {/* Avatar preview tile. States: empty / checking / found /
                      not-found / format-invalid. We keep its size identical
                      across states so the layout doesn't jump as we type. */}
                  <span
                    aria-hidden
                    className={`grid h-[58px] w-[58px] flex-shrink-0 place-items-center overflow-hidden rounded-lg bg-[var(--bg-0)] ring-1 transition-colors ${
                      lookup.kind === "found"
                        ? "ring-[var(--accent)]/60"
                        : lookup.kind === "not_found" ||
                            lookup.kind === "invalid_format"
                          ? "ring-red-500/50"
                          : "ring-[var(--line)]"
                    }`}
                  >
                    {lookup.kind === "found" && lookup.avatarUrl ? (
                      <Image
                        src={lookup.avatarUrl || "/placeholder.svg"}
                        alt={`${lookup.name} avatar`}
                        width={58}
                        height={58}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    ) : lookup.kind === "checking" ? (
                      <Loader2 className="h-5 w-5 animate-spin text-[var(--ink-mute)]" />
                    ) : lookup.kind === "not_found" ||
                      lookup.kind === "invalid_format" ? (
                      <UserX className="h-5 w-5 text-red-400" />
                    ) : (
                      <UserIcon className="h-5 w-5 text-[var(--ink-mute)]" />
                    )}
                  </span>

                  <div className="flex-1">
                    {/* Username input. Always editable — even after the user
                        signs in with Roblox, they can retype to gift to a
                        friend. The `verifiedRobloxName` value is used purely
                        as a default and to short-circuit the lookup against a
                        previously confirmed account; it does not lock the
                        field. Border/icon colors below reflect the live
                        lookup state. */}
                    <input
                      id="roblox"
                      type="text"
                      required
                      value={robloxUsername}
                      onChange={(e) => setRobloxUsername(e.target.value)}
                      placeholder="e.g. PirateKing123"
                      autoComplete="username"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      aria-invalid={
                        lookup.kind === "not_found" ||
                        lookup.kind === "invalid_format"
                      }
                      className={`w-full rounded-lg border bg-[var(--bg-0)] px-3 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-mute)] focus:outline-none ${
                        lookup.kind === "found"
                          ? "border-[var(--accent)]/60 focus:border-[var(--accent)]"
                          : lookup.kind === "not_found" ||
                              lookup.kind === "invalid_format"
                            ? "border-red-500/50 focus:border-red-500"
                            : "border-[var(--line)] focus:border-[var(--accent)]"
                      }`}
                    />

                    {/* Live status line under the input. The same five states
                        render whether or not the user is signed in — there
                        is no distinct "locked" state since the field is
                        always editable. */}
                    <div className="mt-1.5 min-h-[1rem] text-xs">
                      {lookup.kind === "idle" && (
                        <span className="text-[var(--ink-mute)]">
                          We&apos;ll look up your avatar to confirm the username.
                        </span>
                      )}
                      {lookup.kind === "checking" && (
                        <span className="text-[var(--ink-mute)]">
                          Checking Roblox…
                        </span>
                      )}
                      {lookup.kind === "found" && (
                        <span className="text-[var(--accent)]">
                          Found{" "}
                          <span className="font-mono">@{lookup.name}</span>
                          {lookup.displayName &&
                            lookup.displayName.toLowerCase() !==
                              lookup.name.toLowerCase() && (
                              <>
                                {" "}
                                <span className="text-[var(--ink-mute)]">
                                  (display name: {lookup.displayName})
                                </span>
                              </>
                            )}
                        </span>
                      )}
                      {lookup.kind === "not_found" && (
                        <span className="text-red-400">
                          No Roblox account with that username. Double-check
                          spelling — and make sure it&apos;s the username, not the
                          display name.
                        </span>
                      )}
                      {lookup.kind === "invalid_format" && (
                        <span className="text-red-400">
                          {lookup.reason === "too_short"
                            ? "Roblox usernames are at least 3 characters."
                            : lookup.reason === "too_long"
                              ? "Roblox usernames are at most 20 characters."
                              : "Roblox usernames can only contain letters, numbers, and underscores. Spaces and special characters belong to display names — those aren't accepted."}
                        </span>
                      )}
                      {lookup.kind === "error" && (
                        <span className="text-amber-400">{lookup.message}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--ink)]">
                  Contact
                </label>
                <div className="flex gap-2">
                  <select
                    aria-label="Contact type"
                    value={contactType}
                    onChange={(e) => setContactType(e.target.value as "discord" | "email")}
                    className="rounded-lg border border-[var(--line)] bg-[var(--bg-0)] px-3 py-2.5 text-sm text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                  >
                    <option value="discord">Discord</option>
                    <option value="email">Email</option>
                  </select>
                  <input
                    type={contactType === "email" ? "email" : "text"}
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder={contactType === "email" ? "you@example.com" : "username"}
                    className="flex-1 rounded-lg border border-[var(--line)] bg-[var(--bg-0)] px-3 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-mute)] focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>
                <p className="mt-1.5 text-xs text-[var(--ink-mute)]">
                  We&apos;ll use this to coordinate delivery and send updates.
                </p>
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="mb-1.5 block text-sm font-medium text-[var(--ink)]"
                >
                  Order notes <span className="text-[var(--ink-mute)]">(optional)</span>
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything our delivery team should know?"
                  className="w-full resize-none rounded-lg border border-[var(--line)] bg-[var(--bg-0)] px-3 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-mute)] focus:border-[var(--accent)] focus:outline-none"
                />
              </div>
            </div>
          </fieldset>

          {/* Payment */}
          <fieldset className="rounded-2xl border border-[var(--line)] bg-[var(--bg-1)] p-6">
            <legend className="px-1 text-xs font-medium uppercase tracking-wider text-[var(--ink-mute)]">
              Payment method
            </legend>

            <div className="mt-4 grid gap-2">
              {paymentMethods.map((method) => {
                const selected = paymentMethod === method.id
                return (
                  <label
                    key={method.id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                      selected
                        ? "border-[var(--accent)] bg-[var(--accent)]/5"
                        : "border-[var(--line)] hover:border-[var(--ink-mute)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={selected}
                      onChange={() => setPaymentMethod(method.id)}
                      className="sr-only"
                    />
                    <span
                      aria-hidden
                      className={`grid h-4 w-4 place-items-center rounded-full border ${
                        selected
                          ? "border-[var(--accent)]"
                          : "border-[var(--ink-mute)]"
                      }`}
                    >
                      {selected && (
                        <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
                      )}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[var(--ink)]">{method.label}</p>
                      <p className="text-xs text-[var(--ink-mute)]">{method.hint}</p>
                    </div>
                    <CreditCard className="h-4 w-4 text-[var(--ink-mute)]" />
                  </label>
                )
              })}
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-lg border border-[var(--line-soft)] bg-[var(--bg-0)] px-3 py-2.5 text-xs text-[var(--ink-mute)]">
              <Lock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
              <span>
                Payments are processed on a secured page. We never store your full card details.
              </span>
            </div>
          </fieldset>
        </div>

        {/* Right: order summary */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--bg-1)] p-6">
            <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--ink-mute)]">
              Order summary
            </h2>

            <ul className="mt-4 max-h-72 space-y-3 overflow-y-auto pr-1">
              {items.map((item) => {
                const lineRobux = item.robux * item.quantity
                const lineUSD = lineRobux * USD_PER_ROBUX
                return (
                  <li key={item.id} className="flex items-center gap-3">
                    <div className="relative grid h-12 w-12 flex-shrink-0 place-items-center overflow-hidden rounded-md bg-[var(--bg-2)]">
                      {item.image ? (
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="h-full w-full object-contain p-1"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-[var(--ink-mute)]">
                          {item.name.charAt(0)}
                        </span>
                      )}
                      <span className="absolute -right-1.5 -top-1.5 grid h-4 min-w-[1rem] place-items-center rounded-full bg-[var(--ink)] px-1 text-[10px] font-bold text-[var(--bg-0)]">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[var(--ink)]">
                        {item.name}
                      </p>
                      {item.range && (
                        <p className="truncate text-xs text-[var(--ink-mute)]">{item.range}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-[var(--ink)]">
                        ${lineUSD.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-[var(--ink-mute)]">
                        {lineRobux.toLocaleString()} R$
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>

            <dl className="mt-5 space-y-2 border-t border-[var(--line-soft)] pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--ink-dim)]">Items</dt>
                <dd className="text-[var(--ink)]">{totalItems}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--ink-dim)]">Subtotal (Robux)</dt>
                <dd className="text-[var(--ink)]">{totalRobux.toLocaleString()} R$</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--ink-dim)]">Subtotal (USD)</dt>
                <dd className="text-[var(--ink)]">${subtotalUSD.toFixed(2)}</dd>
              </div>
              {promoCode && (
                <div className="flex justify-between text-[var(--accent)]">
                  <dt>
                    Promo{" "}
                    <span className="font-mono text-xs">({promoCode.code})</span>
                  </dt>
                  <dd>-${promoDiscountUSD.toFixed(2)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-[var(--line-soft)] pt-3 text-base">
                <dt className="font-medium text-[var(--ink)]">Total</dt>
                <dd className="text-lg font-semibold text-[var(--ink)]">
                  ${totalUSD.toFixed(2)}
                </dd>
              </div>
            </dl>

            {/* Promo code section */}
            <div className="mt-4 rounded-lg border border-dashed border-[var(--line)] bg-[var(--bg-0)] p-3">
              {promoCode ? (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <Tag className="h-4 w-4 flex-shrink-0 text-[var(--accent)]" />
                    <div className="min-w-0">
                      <p className="truncate font-mono text-sm font-semibold text-[var(--ink)]">
                        {promoCode.code}
                      </p>
                      <p className="truncate text-[11px] text-[var(--ink-mute)]">
                        {promoCode.percentOff}% off · {promoCode.description}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    aria-label="Remove promo code"
                    className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-md text-[var(--ink-mute)] transition-colors hover:bg-[var(--bg-2)] hover:text-[var(--ink)]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <label
                    htmlFor="promo-code"
                    className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[var(--ink-dim)]"
                  >
                    <Tag className="h-3.5 w-3.5" />
                    Have a promo code?
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="promo-code"
                      type="text"
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value)
                        if (promoError) setPromoError(null)
                      }}
                      placeholder="Enter code"
                      className="flex-1 rounded-md border border-[var(--line)] bg-[var(--bg-1)] px-3 py-2 text-sm uppercase tracking-wider text-[var(--ink)] placeholder:normal-case placeholder:tracking-normal placeholder:text-[var(--ink-mute)] focus:border-[var(--accent)] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={!promoInput.trim()}
                      className="rounded-md bg-[var(--ink)] px-4 py-2 text-sm font-medium text-[var(--bg-0)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && (
                    <p className="mt-1.5 text-[11px] text-red-400" role="alert">
                      {promoError}
                    </p>
                  )}
                </>
              )}
            </div>

            <p className="mt-3 text-center text-[11px] text-[var(--ink-mute)]">
              Rate: ${ROBUX_RATE_USD_PER_1K.toFixed(2)} per 1,000 Robux
            </p>

            <label className="mt-5 flex cursor-pointer items-start gap-2 text-xs text-[var(--ink-dim)]">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-3.5 w-3.5 accent-[var(--accent)]"
              />
              <span>
                I agree to the{" "}
                <Link href="#" className="text-[var(--ink)] underline underline-offset-2">
                  Terms of Service
                </Link>{" "}
                and acknowledge that this is a third-party service not affiliated with Roblox.
              </span>
            </label>

            <button
              type="submit"
              disabled={
                !agreed ||
                submitting ||
                items.length === 0 ||
                !usernameVerified
              }
              className="mt-4 w-full rounded-lg bg-[var(--accent)] py-3 text-sm font-semibold text-[var(--bg-0)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? "Placing order..."
                : !usernameVerified
                  ? "Confirm your Roblox username"
                  : `Place order - $${totalUSD.toFixed(2)}`}
            </button>
          </div>
        </aside>
      </form>

      {/* Confirm-the-right-user modal. Opens after the user submits the form
          and forces a 3 second pause before the confirm button enables. */}
      {confirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-user-title"
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 backdrop-blur-sm"
          onClick={cancelConfirm}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-[var(--bg-1)] p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-amber-500/15 text-amber-400">
                <AlertTriangle className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2
                  id="confirm-user-title"
                  className="text-lg font-semibold tracking-tight text-[var(--ink)]"
                >
                  Please confirm this is your right user
                </h2>
                <p className="mt-1 text-sm text-[var(--ink-dim)]">
                  We&apos;ll deliver everything in your cart to the Roblox account
                  below. Double-check the spelling — once placed, this can&apos;t be
                  redirected.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--bg-0)] p-4">
              <span className="grid h-14 w-14 flex-shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--bg-2)] ring-1 ring-[var(--accent)]/40">
                {lookupAvatarUrl || verifiedAvatarUrl ? (
                  <Image
                    src={lookupAvatarUrl ?? verifiedAvatarUrl ?? "/placeholder.svg"}
                    alt={`${lookupCanonicalName} avatar`}
                    width={56}
                    height={56}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-base font-semibold text-[var(--ink-mute)]">
                    {robloxUsername.charAt(0).toUpperCase() || "?"}
                  </span>
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-sm font-semibold text-[var(--ink)]">
                  @{lookupCanonicalName || "—"}
                </p>
                {lookupDisplayName &&
                  lookupDisplayName.toLowerCase() !==
                    lookupCanonicalName.toLowerCase() && (
                    <p className="truncate text-xs text-[var(--ink-dim)]">
                      Display name: {lookupDisplayName}
                    </p>
                  )}
                <p className="truncate text-xs text-[var(--ink-mute)]">
                  {verifiedRobloxName
                    ? "Verified Roblox account on file"
                    : "Confirmed via Roblox"}
                </p>
              </div>
              <span className="flex-shrink-0 rounded-md bg-[var(--bg-2)] px-2 py-1 text-xs font-medium text-[var(--ink)]">
                {totalItems} item{totalItems === 1 ? "" : "s"}
              </span>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cancelConfirm}
                disabled={submitting}
                className="rounded-lg border border-[var(--line)] px-4 py-2.5 text-sm font-medium text-[var(--ink)] transition-colors hover:bg-[var(--bg-2)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Go back
              </button>
              <button
                type="button"
                onClick={placeOrder}
                disabled={confirmCountdown > 0 || submitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--bg-0)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                aria-live="polite"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Placing order...
                  </>
                ) : confirmCountdown > 0 ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {`Confirm in ${confirmCountdown}s`}
                  </>
                ) : (
                  `Yes, that's my user`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
