"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import {
  CheckCircle2,
  Copy,
  Loader2,
  RefreshCw,
  ShieldCheck,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import {
  exchangeRobloxAuth,
  fetchVerificationCode,
  type RobloxUser,
} from "@/lib/auth-client"
import { ErrorBanner } from "./error-banner"

// Step 2 of the auth flow: user pastes a server-issued code into their Roblox
// bio, we re-fetch the bio and exchange it for a Supabase session.
//
// All of the state for this step lives here (code value, copy ack, error,
// "already registered" branch, verify loading) — the parent only learns the
// final outcome via `onVerified`. That design intentionally hides the
// /api/roblox/auth + supabase.auth.verifyOtp choreography from the pages so
// it can change without having to update both call sites.

const COPY_ACK_MS = 1800

type RobloxVerifyPanelProps = {
  /** The user record returned by RobloxLookupForm. */
  robloxUser: RobloxUser
  /**
   * "signup" enables the 409-already-registered branch (renders a "Sign in
   * instead" CTA). "login" treats every non-OK response as a generic error.
   */
  mode: "signup" | "login"
  /** Called after the Supabase session is established. */
  onVerified: () => void | Promise<void>
  /** Called when the user clicks "Change" to go back to the lookup step. */
  onChange: () => void
  /** Custom h1 text for the panel. */
  headline: string
  /** Body copy beneath the headline. */
  description: string
  /** Label for the primary action button (e.g. "Verify & sign in"). */
  verifyLabel: string
  /** Loading-state label for the primary action button. */
  verifyLoadingLabel: string
  /** id of the panel's <h1>. */
  headingId?: string
}

export function RobloxVerifyPanel({
  robloxUser,
  mode,
  onVerified,
  onChange,
  headline,
  description,
  verifyLabel,
  verifyLoadingLabel,
  headingId = "auth-step-2-heading",
}: RobloxVerifyPanelProps) {
  const [code, setCode] = useState("")
  const [copied, setCopied] = useState(false)
  const [verifyLoading, setVerifyLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [alreadyRegistered, setAlreadyRegistered] = useState(false)

  // Mint a fresh code from the server the first time we render. The cleanup
  // flag protects against React 18 strict-mode double-mount writes that
  // would otherwise risk a stale `setCode` after unmount.
  useEffect(() => {
    if (code) return
    let cancelled = false
    fetchVerificationCode(robloxUser.id)
      .then((c) => !cancelled && setCode(c))
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Couldn't issue a code.")
        }
      })
    return () => {
      cancelled = true
    }
  }, [robloxUser.id, code])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), COPY_ACK_MS)
    } catch {
      // Clipboard can be unavailable (insecure context) — silently ignore.
    }
  }

  const handleRegenerate = () => {
    setError(null)
    setCode("")
    fetchVerificationCode(robloxUser.id)
      .then(setCode)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Couldn't issue a code."),
      )
  }

  const handleVerify = async () => {
    setError(null)
    setAlreadyRegistered(false)
    setVerifyLoading(true)
    try {
      const result = await exchangeRobloxAuth({
        mode,
        user: robloxUser,
        code,
      })
      if (result.kind === "already_registered") {
        setAlreadyRegistered(true)
        setError(result.message)
        return
      }

      // Exchange the magic-link token_hash for a real Supabase session.
      const supabase = createClient()
      const { error: verifyError } = await supabase.auth.verifyOtp({
        type: "email",
        token_hash: result.tokenHash,
      })
      if (verifyError) throw verifyError

      await onVerified()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setVerifyLoading(false)
    }
  }

  return (
    <section aria-labelledby={headingId}>
      <div className="mb-6 text-center">
        <h1
          id={headingId}
          className="mb-2 text-2xl font-semibold text-[var(--ink)]"
        >
          {headline}
        </h1>
        <p className="text-sm leading-relaxed text-[var(--ink-mute)]">
          {description}
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
          onClick={onChange}
          className="text-xs font-medium text-[var(--accent)] hover:underline"
        >
          Change
        </button>
      </div>

      {/* Code box */}
      <div className="mb-5">
        <Label className="mb-2 block text-[var(--ink)]">
          Your verification code
        </Label>
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-[var(--line)] bg-[var(--bg-1)] p-3">
          <code className="flex-1 select-all truncate font-mono text-sm font-semibold tracking-wider text-[var(--ink)]">
            {code || "..."}
          </code>
          <button
            type="button"
            onClick={handleCopy}
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
          Paste it anywhere in your Roblox profile description and save.
        </p>
      </div>

      <ErrorBanner message={error} className="mb-4">
        {alreadyRegistered && (
          <p className="mt-2 text-xs text-red-300/80">
            Each Roblox account can only be linked to one fruits.place
            account. Use the original sign-in below.
          </p>
        )}
      </ErrorBanner>

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
            onClick={handleVerify}
            disabled={verifyLoading || !code}
            className="w-full bg-[var(--accent)] text-[var(--bg-0)] hover:bg-[var(--accent)]/90"
          >
            {verifyLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {verifyLoadingLabel}
              </>
            ) : (
              <>
                <ShieldCheck className="mr-2 h-4 w-4" />
                {verifyLabel}
              </>
            )}
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          onClick={handleRegenerate}
          className="w-full text-[var(--ink-mute)] hover:text-[var(--ink)]"
          disabled={alreadyRegistered}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Generate a new code
        </Button>
      </div>
    </section>
  )
}
