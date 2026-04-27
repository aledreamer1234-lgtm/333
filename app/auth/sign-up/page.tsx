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
  RefreshCw,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Three-step Roblox-verified sign-up wizard:
//   1. Look up Roblox username via /api/roblox/lookup (roproxy.com)
//   2. Ask the user to paste a verification code into their Roblox bio
//      and confirm via /api/roblox/verify
//   3. Capture an email + password and create the Supabase auth account.
//      All Roblox info is stored in `user_metadata` so we don't need a
//      schema migration on the existing profiles table.

type RobloxUser = {
  id: number
  name: string
  displayName: string
  avatarUrl: string | null
}

type Step = 1 | 2 | 3

const STEP_LABELS: Record<Step, string> = {
  1: "Find account",
  2: "Verify ownership",
  3: "Create login",
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
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [signupLoading, setSignupLoading] = useState(false)

  const [error, setError] = useState<string | null>(null)

  // Generate the verification code as soon as we know who the Roblox user is.
  useEffect(() => {
    if (step === 2 && robloxUser && !code) setCode(generateVerificationCode())
  }, [step, robloxUser, code])

  const progressPercent = useMemo(() => ({ 1: 33, 2: 66, 3: 100 })[step], [step])

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

  const handleVerify = async () => {
    if (!robloxUser) return
    setError(null)
    setVerifyLoading(true)
    try {
      const res = await fetch("/api/roblox/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId: robloxUser.id, code }),
      })
      const data = (await res.json()) as { verified?: boolean; error?: string }
      if (!res.ok) throw new Error(data.error ?? "Verification failed")
      if (!data.verified) {
        throw new Error(
          "We couldn't find the code in your Roblox bio yet. Save your profile and try again.",
        )
      }
      setStep(3)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setVerifyLoading(false)
    }
  }

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!robloxUser) return
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setSignupLoading(true)
    try {
      const supabase = createClient()
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            `${window.location.origin}/auth/callback`,
          data: {
            // Stored on auth.users.raw_user_meta_data — no schema changes needed.
            username: robloxUser.name,
            roblox_id: robloxUser.id,
            roblox_username: robloxUser.name,
            roblox_display_name: robloxUser.displayName,
            roblox_avatar_url: robloxUser.avatarUrl,
            roblox_verified_at: new Date().toISOString(),
          },
        },
      })
      if (signUpError) throw signUpError
      router.push("/auth/sign-up-success")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSignupLoading(false)
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
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--accent)]">
              <span className="text-lg font-bold text-[var(--bg-0)]">F</span>
            </div>
            <span className="text-xl font-semibold text-[var(--ink)]">fruits.place</span>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wider text-[var(--ink-mute)]">
              <span>{`Step ${step} of 3`}</span>
              <span>{STEP_LABELS[step]}</span>
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
                  Add the code below to your Roblox profile description, then click Verify. We
                  only need this once — you can remove the code afterwards.
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
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  onClick={handleVerify}
                  disabled={verifyLoading || !code}
                  className="w-full bg-[var(--accent)] text-[var(--bg-0)] hover:bg-[var(--accent)]/90"
                >
                  {verifyLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking your bio...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      I&apos;ve added the code, verify
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setCode(generateVerificationCode())}
                  className="w-full text-[var(--ink-mute)] hover:text-[var(--ink)]"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate a new code
                </Button>
              </div>
            </section>
          )}

          {/* Step 3: credentials */}
          {step === 3 && robloxUser && (
            <section aria-labelledby="step-3-heading">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-[var(--accent)]/15 text-[var(--accent)]">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h1
                  id="step-3-heading"
                  className="mb-2 text-2xl font-semibold text-[var(--ink)]"
                >
                  Almost done, {robloxUser.displayName}
                </h1>
                <p className="text-sm leading-relaxed text-[var(--ink-mute)]">
                  Pick a login email and password. We&apos;ll attach them to your verified Roblox
                  account.
                </p>
              </div>

              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[var(--ink)]">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-[var(--line)] bg-[var(--bg-1)] text-[var(--ink)] placeholder:text-[var(--ink-mute)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[var(--ink)]">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-[var(--line)] bg-[var(--bg-1)] text-[var(--ink)]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[var(--ink)]">
                    Confirm password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border-[var(--line)] bg-[var(--bg-1)] text-[var(--ink)]"
                  />
                </div>

                {error && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-[var(--accent)] text-[var(--bg-0)] hover:bg-[var(--accent)]/90"
                  disabled={signupLoading}
                >
                  {signupLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>
              </form>
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
