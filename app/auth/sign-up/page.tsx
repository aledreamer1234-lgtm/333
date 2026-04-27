"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Copy,
  Loader2,
  Mail,
  Pencil,
  RefreshCw,
  ShieldCheck,
  User,
} from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Three-step Roblox sign-up:
//   1. Look up Roblox username via /api/roblox/lookup (roproxy.com)
//   2. Verify ownership by pasting a code into the Roblox bio. The
//      /api/roblox/auth route re-checks the bio, provisions a Supabase user
//      keyed off the Roblox id, and returns a magic-link token_hash that we
//      exchange client-side for a real session.
//   3. Capture a *notification* email for raffle entries and order updates.
//      We don't send a verification link — we just ask the user to confirm
//      they typed it correctly, then write it onto their Supabase user as
//      `notification_email` in user_metadata and push them to /dashboard.

type RobloxUser = {
  id: number
  name: string
  displayName: string
  avatarUrl: string | null
}

// "confirm-email" is a sub-state of Step 3 ("Are you sure?" screen).
type Step = 1 | 2 | 3 | "confirm-email"

const STEP_LABELS: Record<Exclude<Step, "confirm-email">, string> = {
  1: "Find account",
  2: "Verify ownership",
  3: "Notifications",
}

function generateVerificationCode(): string {
  // Avoid ambiguous characters (0/O, 1/I) so it's easy to copy by hand.
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let out = ""
  const bytes = new Uint32Array(8)
  crypto.getRandomValues(bytes)
  for (let i = 0; i < 8; i++) {
    out += alphabet[bytes[i] % alphabet.length]
  }
  return `FRUITS-${out}`
}

// Lightweight RFC-5322-ish email check. Real validation happens server-side
// the first time we actually send to the address.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function SignUpPage() {
  const router = useRouter()

  const [step, setStep] = useState<Step>(1)

  // Step 1 state
  const [usernameInput, setUsernameInput] = useState("")
  const [lookupLoading, setLookupLoading] = useState(false)
  const [robloxUser, setRobloxUser] = useState<RobloxUser | null>(null)

  // Step 2 state
  const [code, setCode] = useState("")
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  // Step 3 state
  const [email, setEmail] = useState("")
  const [savingEmail, setSavingEmail] = useState(false)

  const [error, setError] = useState<string | null>(null)
  // When the server returns 409 already_registered we render an extra
  // "Sign in instead" CTA below the error message rather than a generic toast.
  const [alreadyRegistered, setAlreadyRegistered] = useState(false)

  // Generate the verification code as soon as we know who the Roblox user is.
  useEffect(() => {
    if (step === 2 && robloxUser && !code) setCode(generateVerificationCode())
  }, [step, robloxUser, code])

  // Progress bar maps the linear flow. The "confirm-email" sub-state still
  // lives on step 3 so the bar stays full once we get there.
  const progressPercent = useMemo(() => {
    if (step === 1) return 33
    if (step === 2) return 66
    return 100
  }, [step])

  const labelStep: Exclude<Step, "confirm-email"> =
    step === "confirm-email" ? 3 : step

  /* -------------------------------- handlers -------------------------------- */

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLookupLoading(true)
    try {
      const res = await fetch("/api/roblox/lookup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username: usernameInput }),
      })
      const data = (await res.json()) as RobloxUser & { error?: string }
      if (!res.ok) throw new Error(data.error ?? "Couldn't find that Roblox user")
      setRobloxUser({
        id: data.id,
        name: data.name,
        displayName: data.displayName,
        avatarUrl: data.avatarUrl,
      })
      setStep(2)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLookupLoading(false)
    }
  }

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Clipboard can be unavailable (e.g. insecure context) — silently ignore.
    }
  }

  const handleVerifyAndCreate = async () => {
    if (!robloxUser) return
    setError(null)
    setAlreadyRegistered(false)
    setVerifyLoading(true)
    try {
      // The /api/roblox/auth route re-verifies the bio AND creates the user
      // in a single atomic step, returning a magic-link token we can use to
      // sign the visitor in immediately. Passing mode:"signup" tells the
      // server to refuse if the Roblox account is already registered.
      const res = await fetch("/api/roblox/auth", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mode: "signup",
          userId: robloxUser.id,
          code,
          robloxName: robloxUser.name,
          displayName: robloxUser.displayName,
          avatarUrl: robloxUser.avatarUrl,
        }),
      })
      const data = (await res.json()) as {
        token_hash?: string
        error?: string
        code?: string
      }
      if (res.status === 409 || data.code === "already_registered") {
        setAlreadyRegistered(true)
        setError(
          data.error ??
            "This Roblox user is already signed up to fruits.place.",
        )
        return
      }
      if (!res.ok || !data.token_hash) {
        throw new Error(data.error ?? "Verification failed")
      }

      const supabase = createClient()
      const { error: verifyError } = await supabase.auth.verifyOtp({
        type: "email",
        token_hash: data.token_hash,
      })
      if (verifyError) throw verifyError

      // Account is created and the visitor is signed in. Move on to the
      // notifications email step instead of going straight to the dashboard.
      setStep(3)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setVerifyLoading(false)
    }
  }

  const handleEmailContinue = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!EMAIL_REGEX.test(email.trim())) {
      setError("Please enter a valid email address.")
      return
    }
    setStep("confirm-email")
  }

  const handleEmailConfirm = async () => {
    setError(null)
    setSavingEmail(true)
    try {
      const supabase = createClient()
      // The visitor already has a session from step 2, so updateUser writes
      // to *their own* row — no service role needed.
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          notification_email: email.trim().toLowerCase(),
          notification_email_confirmed_at: new Date().toISOString(),
        },
      })
      if (updateError) throw updateError
      router.push("/dashboard")
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Couldn't save your email")
      // Take them back to the editable form so they can retry.
      setStep(3)
    } finally {
      setSavingEmail(false)
    }
  }

  /* --------------------------------- render --------------------------------- */

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg-0)]">
      <header className="border-b border-[var(--line-soft)] px-6 py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[var(--ink-mute)] transition-colors hover:text-[var(--ink)]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Back to store</span>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="mb-6 flex items-center justify-center gap-2">
            <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-xl bg-[var(--bg-2)] ring-1 ring-[var(--line)]">
              <Image
                src="/logo-dragon.png"
                alt="fruits.place dragon mascot"
                width={48}
                height={48}
                priority
                className="h-full w-full object-cover"
              />
            </span>
            <span className="text-xl font-semibold text-[var(--ink)]">fruits.place</span>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wider text-[var(--ink-mute)]">
              <span>{`Step ${labelStep} of 3`}</span>
              <span>{STEP_LABELS[labelStep]}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-2)]">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Step 1: Roblox username */}
          {step === 1 && (
            <section aria-labelledby="step-1-heading">
              <div className="mb-6 text-center">
                <h1
                  id="step-1-heading"
                  className="mb-2 text-2xl font-semibold text-[var(--ink)]"
                >
                  Connect your Roblox account
                </h1>
                <p className="text-sm leading-relaxed text-[var(--ink-mute)]">
                  Enter your Roblox username so we can deliver items, tier perks, and giveaway
                  prizes directly to you.
                </p>
              </div>

              <form onSubmit={handleLookup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="roblox-username" className="text-[var(--ink)]">
                    Roblox username
                  </Label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-mute)]" />
                    <Input
                      id="roblox-username"
                      autoFocus
                      autoComplete="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      placeholder="e.g. PirateKing123"
                      required
                      value={usernameInput}
                      onChange={(e) => {
                        setUsernameInput(e.target.value)
                        if (error) setError(null)
                      }}
                      className="border-[var(--line)] bg-[var(--bg-1)] pl-9 text-[var(--ink)] placeholder:text-[var(--ink-mute)]"
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-[var(--accent)] text-[var(--bg-0)] hover:bg-[var(--accent)]/90"
                  disabled={lookupLoading || usernameInput.trim().length < 3}
                >
                  {lookupLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Looking up...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </section>
          )}

          {/* Step 2: bio verification */}
          {step === 2 && robloxUser && (
            <section aria-labelledby="step-2-heading">
              <div className="mb-6 text-center">
                <h1
                  id="step-2-heading"
                  className="mb-2 text-2xl font-semibold text-[var(--ink)]"
                >
                  Verify it&apos;s really you
                </h1>
                <p className="text-sm leading-relaxed text-[var(--ink-mute)]">
                  Add the code below to your Roblox profile description, then click Verify.
                  You can remove the code from your bio afterwards.
                </p>
              </div>

              {/* Roblox identity card */}
              <div className="mb-5 flex items-center gap-4 rounded-xl border border-[var(--line)] bg-[var(--bg-1)] p-4">
                <div className="grid h-16 w-16 flex-shrink-0 place-items-center overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--bg-2)]">
                  {robloxUser.avatarUrl ? (
                    <Image
                      src={robloxUser.avatarUrl}
                      alt={`${robloxUser.displayName} avatar`}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <User className="h-7 w-7 text-[var(--ink-mute)]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-[var(--ink)]">
                    {robloxUser.displayName}
                  </p>
                  <p className="truncate text-sm text-[var(--ink-mute)]">
                    @{robloxUser.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRobloxUser(null)
                    setCode("")
                    setStep(1)
                    setError(null)
                    setAlreadyRegistered(false)
                  }}
                  className="text-xs font-medium text-[var(--accent)] hover:underline"
                >
                  Change
                </button>
              </div>

              {/* Code box */}
              <div className="mb-5">
                <Label className="mb-2 block text-[var(--ink)]">Your verification code</Label>
                <div className="flex items-center gap-2 rounded-lg border border-dashed border-[var(--line)] bg-[var(--bg-1)] p-3">
                  <code className="flex-1 select-all truncate font-mono text-sm font-semibold tracking-wider text-[var(--ink)]">
                    {code || "..."}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    aria-label="Copy verification code"
                    className="inline-flex items-center gap-1.5 rounded-md border border-[var(--line)] bg-[var(--bg-2)] px-2.5 py-1.5 text-xs font-medium text-[var(--ink)] transition-colors hover:bg-[var(--bg-3)]"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-[var(--accent)]" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[var(--ink-mute)]">
                  Open Roblox{" \u2192 "}your profile{" \u2192 "}edit your description, paste the
                  code, and save. The code can sit anywhere in your bio.
                </p>
              </div>

              {error && (
                <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                  {error}
                  {alreadyRegistered && (
                    <p className="mt-2 text-xs text-red-300/80">
                      Each Roblox account can only be linked to one fruits.place
                      account. Use the original sign-in below.
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-2">
                {alreadyRegistered ? (
                  <Link
                    href="/auth/login"
                    className="inline-flex w-full items-center justify-center rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--bg-0)] transition-opacity hover:opacity-90"
                  >
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Sign in instead
                  </Link>
                ) : (
                  <Button
                    type="button"
                    onClick={handleVerifyAndCreate}
                    disabled={verifyLoading || !code}
                    className="w-full bg-[var(--accent)] text-[var(--bg-0)] hover:bg-[var(--accent)]/90"
                  >
                    {verifyLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Verify & continue
                      </>
                    )}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setCode(generateVerificationCode())}
                  className="w-full text-[var(--ink-mute)] hover:text-[var(--ink)]"
                  disabled={alreadyRegistered}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate a new code
                </Button>
              </div>
            </section>
          )}

          {/* Step 3a: capture notification email */}
          {step === 3 && (
            <section aria-labelledby="step-3-heading">
              <div className="mb-6 text-center">
                <h1
                  id="step-3-heading"
                  className="mb-2 text-2xl font-semibold text-[var(--ink)]"
                >
                  Where should we send updates?
                </h1>
                <p className="text-sm leading-relaxed text-[var(--ink-mute)]">
                  Add an email to receive raffle entry confirmations, win notifications, and
                  purchase receipts. We won&apos;t send a verification link — just double-check
                  it on the next screen.
                </p>
              </div>

              <form onSubmit={handleEmailContinue} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notification-email" className="text-[var(--ink)]">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-mute)]" />
                    <Input
                      id="notification-email"
                      type="email"
                      autoFocus
                      autoComplete="email"
                      spellCheck={false}
                      placeholder="you@example.com"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (error) setError(null)
                      }}
                      className="border-[var(--line)] bg-[var(--bg-1)] pl-9 text-[var(--ink)] placeholder:text-[var(--ink-mute)]"
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-[var(--accent)] text-[var(--bg-0)] hover:bg-[var(--accent)]/90"
                  disabled={email.trim().length === 0}
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </section>
          )}

          {/* Step 3b: confirmation prompt */}
          {step === "confirm-email" && (
            <section aria-labelledby="confirm-email-heading">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-[var(--accent)]/15 text-[var(--accent)]">
                  <Mail className="h-7 w-7" />
                </div>
                <h1
                  id="confirm-email-heading"
                  className="mb-2 text-2xl font-semibold text-[var(--ink)]"
                >
                  Are you sure this is the correct email address?
                </h1>
                <p className="text-sm leading-relaxed text-[var(--ink-mute)]">
                  We&apos;ll use it for raffle entries and purchase notifications. Take a
                  second to make sure it&apos;s spelled exactly right.
                </p>
              </div>

              <div className="mb-6 rounded-xl border border-[var(--line)] bg-[var(--bg-1)] p-4 text-center">
                <p className="text-xs uppercase tracking-wider text-[var(--ink-mute)]">
                  Notification email
                </p>
                <p className="mt-2 break-all font-mono text-base font-semibold text-[var(--ink)]">
                  {email}
                </p>
              </div>

              {error && (
                <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  onClick={handleEmailConfirm}
                  disabled={savingEmail}
                  className="w-full bg-[var(--accent)] text-[var(--bg-0)] hover:bg-[var(--accent)]/90"
                >
                  {savingEmail ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Correct
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(3)}
                  disabled={savingEmail}
                  className="w-full text-[var(--ink-mute)] hover:text-[var(--ink)]"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit email
                </Button>
              </div>
            </section>
          )}

          <p className="mt-6 text-center text-sm text-[var(--ink-mute)]">
            {"Already have an account? "}
            <Link href="/auth/login" className="text-[var(--accent)] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
