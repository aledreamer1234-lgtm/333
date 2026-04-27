"use client"

export function Ticker() {
  return (
    <div className="bg-[var(--bg-1)] border-b border-[var(--line-soft)] py-2.5 overflow-hidden">
      <div className="flex items-center justify-center gap-3 text-sm">
        <span className="bg-[var(--accent)] text-[var(--bg-0)] px-2 py-0.5 rounded text-xs font-semibold">
          New
        </span>
        <span className="text-[var(--ink-dim)]">
          Update 30 items now available
        </span>
        <span className="text-[var(--ink-mute)]">-</span>
        <span className="text-[var(--ink-dim)]">
          Code <span className="text-[var(--ink)] font-semibold">FRUITS15</span> for 15% off
        </span>
      </div>
    </div>
  )
}
