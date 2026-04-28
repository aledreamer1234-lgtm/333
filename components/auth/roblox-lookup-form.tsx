"use client"

import { useState } from "react"
import { ArrowRight, Loader2, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { lookupRobloxUser, type RobloxUser } from "@/lib/auth-client"
import { ErrorBanner } from "./error-banner"

// Step 1 of every auth flow: enter a Roblox username, look it up against the
// roproxy.com mirror, hand the resulting user record back to the caller.
//
// Owns its own `usernameInput` / `error` state because the parent page only
// ever needs the final RobloxUser; bubbling every keystroke up would be
// overkill.

type RobloxLookupFormProps = {
  /** Page-level h1 — e.g. "Welcome back" vs. "Connect your Roblox account". */
  headline: string
  /** Body copy beneath the headline. */
  description: string
  /**
   * id attribute on the form's <h1>. Pages set this so their visually
   * hidden landmark order stays unique across mounts.
   */
  headingId?: string
  /** Called when the username has been successfully resolved on the server. */
  onFound: (user: RobloxUser) => void
}

const MIN_USERNAME_LENGTH = 3

export function RobloxLookupForm({
  headline,
  description,
  headingId = "auth-step-1-heading",
  onFound,
}: RobloxLookupFormProps) {
  const [usernameInput, setUsernameInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const user = await lookupRobloxUser(usernameInput)
      onFound(user)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="roblox-username" className="text-[var(--ink)]">
            Roblox username
          </Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-mute)]" />
            <Input
              id="roblox-username"
              autoFocus
              autoComplete="username"
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

        <ErrorBanner message={error} />

        <Button
          type="submit"
          className="w-full bg-[var(--accent)] text-[var(--bg-0)] hover:bg-[var(--accent)]/90"
          disabled={loading || usernameInput.trim().length < MIN_USERNAME_LENGTH}
        >
          {loading ? (
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
  )
}
