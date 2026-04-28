"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { AuthShell } from "@/components/auth/auth-shell"
import { RobloxLookupForm } from "@/components/auth/roblox-lookup-form"
import { RobloxVerifyPanel } from "@/components/auth/roblox-verify-panel"
import type { RobloxUser } from "@/lib/auth-client"

// Login uses the same Roblox-bio verification flow as sign-up. There are no
// passwords on this app — proving control of the Roblox account *is* the
// credential. The shared <RobloxVerifyPanel> drives /api/roblox/auth, which
// re-issues a magic-link session for an existing user when called with
// `mode: "login"`.

const STEP_LABELS = ["Find account", "Verify ownership"] as const

export default function LoginPage() {
  const router = useRouter()
  const [robloxUser, setRobloxUser] = useState<RobloxUser | null>(null)

  // The flow is fully linear: we're either looking up a user or we already
  // have one and are waiting for them to verify. No need for a separate
  // step state machine.
  const step = robloxUser ? 2 : 1

  return (
    <AuthShell
      currentStep={step}
      totalSteps={STEP_LABELS.length}
      stepLabel={STEP_LABELS[step - 1]}
    >
      {step === 1 && (
        <RobloxLookupForm
          headline="Welcome back"
          description="Sign in by proving control of your Roblox account. No password to remember."
          headingId="login-step-1-heading"
          onFound={setRobloxUser}
        />
      )}

      {step === 2 && robloxUser && (
        <RobloxVerifyPanel
          mode="login"
          robloxUser={robloxUser}
          headingId="login-step-2-heading"
          headline="Confirm it's you"
          description="Drop the code into your Roblox bio, then click Verify. We'll sign you in the moment we see it."
          verifyLabel="Verify & sign in"
          verifyLoadingLabel="Checking your bio..."
          onChange={() => setRobloxUser(null)}
          onVerified={() => {
            router.push("/dashboard")
            router.refresh()
          }}
        />
      )}

      <p className="mt-6 text-center text-sm text-[var(--ink-mute)]">
        {"New to fruits.place? "}
        <Link href="/auth/sign-up" className="text-[var(--accent)] hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  )
}
