"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  Pencil,
} from "lucide-react"

import { AuthShell } from "@/components/auth/auth-shell"
import { ErrorBanner } from "@/components/auth/error-banner"
import { RobloxLookupForm } from "@/components/auth/roblox-lookup-form"
import { RobloxVerifyPanel } from "@/components/auth/roblox-verify-panel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { RobloxUser } from "@/lib/auth-client"
import { createClient } from "@/lib/supabase/client"

// Three-step Roblox sign-up:
//   1. Look up Roblox username (shared <RobloxLookupForm>)
//   2. Verify Roblox bio (shared <RobloxVerifyPanel> in mode="signup")
//   3. Capture a *notification* email for raffle entries and order updates,
//      then ask the visitor to confirm it before saving.
//
// Steps 1 and 2 are identical to the login flow except for copy and post-
// success behaviour, so they live in components/auth/. Step 3 is sign-up
// specific and stays inline here.

// Lightweight RFC-5322-ish email check. Real validation happens server-side
// the first time we actually send to the address.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const STEP_LABELS = ["Find account", "Verify ownership", "Notifications"] as const

// "confirm-email" is a sub-state of step 3 ("Are you sure?" screen) — the
// progress bar stays at 100% throughout.
type Step = 1 | 2 | 3 | "confirm-email"

export default function SignUpPage() {
  const router = useRouter()

  const [step, setStep] = useState<Step>(1)
  const [robloxUser, setRobloxUser] = useState<RobloxUser | null>(null)

  // Step 3 state — kept here because they're sign-up specific.
  const [email, setEmail] = useState("")
  const [savingEmail, setSavingEmail] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  const labelStep: Exclude<Step, "confirm-email"> =
    step === "confirm-email" ? 3 : step

  const handleEmailContinue = (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError(null)
    if (!EMAIL_REGEX.test(email.trim())) {
      setEmailError("Please enter a valid email address.")
      return
    }
    setStep("confirm-email")
  }

  const handleEmailConfirm = async () => {
    setEmailError(null)
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
      setEmailError(err instanceof Error ? err.message : "Couldn't save your email")
      // Take them back to the editable form so they can retry.
      setStep(3)
    } finally {
      setSavingEmail(false)
    }
  }

  return (
    <AuthShell
      currentStep={labelStep}
      totalSteps={STEP_LABELS.length}
      stepLabel={STEP_LABELS[labelStep - 1]}
    >
      {step === 1 && (
        <RobloxLookupForm
          headline="Connect your Roblox account"
          description="Enter your Roblox username so we can deliver items, tier perks, and giveaway prizes directly to you."
          headingId="signup-step-1-heading"
          onFound={(user) => {
            setRobloxUser(user)
            setStep(2)
          }}
        />
      )}

      {step === 2 && robloxUser && (
        <RobloxVerifyPanel
          mode="signup"
          robloxUser={robloxUser}
          headingId="signup-step-2-heading"
          headline="Verify it's really you"
          description="Add the code below to your Roblox profile description, then click Verify. You can remove the code from your bio afterwards."
          verifyLabel="Verify & continue"
          verifyLoadingLabel="Verifying..."
          onChange={() => {
            setRobloxUser(null)
            setStep(1)
          }}
          // The panel handles supabase.auth.verifyOtp internally; we just
          // need to advance the wizard.
          onVerified={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <section aria-labelledby="signup-step-3-heading">
          <div className="mb-6 text-center">
            <h1
              id="signup-step-3-heading"
              className="mb-2 text-2xl font-semibold text-[var(--ink)]"
            >
              Where should we send updates?
            </h1>
            <p className="text-sm leading-relaxed text-[var(--ink-mute)]">
              Add an email to receive raffle entry confirmations, win
              notifications, and purchase receipts. We won&apos;t send a
              verification link — just double-check it on the next screen.
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
                    if (emailError) setEmailError(null)
                  }}
                  className="border-[var(--line)] bg-[var(--bg-1)] pl-9 text-[var(--ink)] placeholder:text-[var(--ink-mute)]"
                />
              </div>
            </div>

            <ErrorBanner message={emailError} />

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
              We&apos;ll use it for raffle entries and purchase notifications.
              Take a second to make sure it&apos;s spelled exactly right.
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

          <ErrorBanner message={emailError} className="mb-4" />

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
    </AuthShell>
  )
}
