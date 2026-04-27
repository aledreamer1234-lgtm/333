import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"
import { ArrowLeft } from "lucide-react"

// Shared chrome for /auth/login and /auth/sign-up: back-to-store header,
// brand mark, and a progress bar that reflects the current step in the
// flow. Consolidating it here keeps the two pages visually consistent and
// stops every flow-specific copy or layout tweak from having to be done
// twice.

type AuthShellProps = {
  /** 1-based step index — used for the "Step N of M" copy and the bar. */
  currentStep: number
  /** Total number of steps in the flow (the denominator). */
  totalSteps: number
  /** Short descriptor for the current step (e.g. "Find account"). */
  stepLabel: string
  children: ReactNode
}

export function AuthShell({
  currentStep,
  totalSteps,
  stepLabel,
  children,
}: AuthShellProps) {
  // Clamp to [0, 100] so a future step config bug can't visually overflow
  // the bar or push the percentage negative.
  const progressPercent = Math.max(
    0,
    Math.min(100, (currentStep / totalSteps) * 100),
  )

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
            <span className="text-xl font-semibold text-[var(--ink)]">
              fruits.place
            </span>
          </div>

          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wider text-[var(--ink-mute)]">
              <span>{`Step ${currentStep} of ${totalSteps}`}</span>
              <span>{stepLabel}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--bg-2)]">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {children}
        </div>
      </main>
    </div>
  )
}
