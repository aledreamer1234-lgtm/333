import type { ReactNode } from "react"

// Small reusable inline error block, matching the styling used across the
// auth pages. Renders nothing when there's no message, so consumers can
// drop it in unconditionally without `error && (...)` wrapping noise.
export function ErrorBanner({
  message,
  children,
  className = "",
}: {
  message: string | null | undefined
  /** Optional extra content rendered after the message (e.g. nested CTA). */
  children?: ReactNode
  /** Additional Tailwind classes (e.g. `mb-4`) to position the banner. */
  className?: string
}) {
  if (!message) return null
  return (
    <div
      role="alert"
      className={`rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400 ${className}`}
    >
      {message}
      {children}
    </div>
  )
}
