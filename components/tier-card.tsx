"use client"

import { Award, Check, Crown, Gem, Medal, Sparkles, Star } from "lucide-react"
import { TIERS, getNextTier, type Tier, type TierId } from "@/lib/tiers"

const TIER_ICONS: Record<TierId, typeof Star> = {
  member: Star,
  bronze: Medal,
  silver: Award,
  gold: Crown,
  platinum: Gem,
  top: Sparkles,
}

type Props = {
  /** USD lifetime spend across completed orders. */
  lifetimeSpendUsd: number
  /** Total completed purchases. */
  totalPurchases: number
  /** The user's current tier (resolved by the server with `getTier`). */
  currentTier: Tier
}

export function TierCard({ lifetimeSpendUsd, totalPurchases, currentTier }: Props) {
  const nextTier = getNextTier(currentTier.id)
  const Icon = TIER_ICONS[currentTier.id]

  // Progress toward the next tier — use spend (or 0/1 for bronze if it's next).
  let progressPercent = 100
  let progressLabel = "You've reached the top tier!"
  if (nextTier) {
    if (nextTier.requiresPurchase) {
      progressPercent = totalPurchases >= 1 ? 100 : 0
      progressLabel = `Make your first purchase to unlock ${nextTier.name}`
    } else {
      const remaining = Math.max(0, nextTier.threshold - lifetimeSpendUsd)
      progressPercent = Math.min(
        100,
        Math.max(2, (lifetimeSpendUsd / Math.max(1, nextTier.threshold)) * 100),
      )
      progressLabel =
        remaining > 0
          ? `$${remaining.toFixed(2)} of spend to unlock ${nextTier.name}`
          : `Ready to claim ${nextTier.name}`
    }
  }

  return (
    <section
      aria-labelledby="tier-heading"
      className="rounded-xl border border-[var(--line)] bg-[var(--bg-1)] p-6"
    >
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-xl border"
            style={{
              backgroundColor: `${currentTier.color}1f`,
              borderColor: `${currentTier.color}55`,
              color: currentTier.color,
            }}
          >
            <Icon className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-[var(--ink-mute)]">
              Current tier
            </p>
            <h2
              id="tier-heading"
              className="text-2xl font-bold text-[var(--ink)]"
              style={{ color: currentTier.color }}
            >
              {currentTier.name}
            </h2>
            <p className="text-xs text-[var(--ink-mute)]">{currentTier.tagline}</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs uppercase tracking-wider text-[var(--ink-mute)]">Lifetime spend</p>
          <p className="text-2xl font-bold text-[var(--ink)]">
            ${lifetimeSpendUsd.toFixed(2)}
          </p>
          <p className="text-xs text-[var(--ink-mute)]">
            {totalPurchases} {totalPurchases === 1 ? "purchase" : "purchases"}
          </p>
        </div>
      </header>

      {/* Progress to next tier */}
      {nextTier && (
        <div className="mt-6">
          <div className="mb-2 flex items-baseline justify-between text-xs">
            <span className="text-[var(--ink-mute)]">{progressLabel}</span>
            <span className="font-medium text-[var(--ink-dim)]">
              Next: <span style={{ color: nextTier.color }}>{nextTier.name}</span>
            </span>
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-[var(--bg-3)]"
            role="progressbar"
            aria-valuenow={Math.round(progressPercent)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: nextTier.color,
              }}
            />
          </div>
        </div>
      )}

      {/* Perks */}
      <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {currentTier.perks.map((perk) => (
          <div
            key={perk}
            className="flex items-start gap-2 rounded-lg border border-[var(--line-soft)] bg-[var(--bg-0)] px-3 py-2.5 text-sm"
          >
            <Check
              className="mt-0.5 h-4 w-4 flex-shrink-0"
              style={{ color: currentTier.color }}
            />
            <span className="text-[var(--ink-dim)]">{perk}</span>
          </div>
        ))}
      </div>

      {/* Tier ladder summary */}
      <div className="mt-6 border-t border-[var(--line-soft)] pt-5">
        <p className="mb-3 text-xs uppercase tracking-wider text-[var(--ink-mute)]">
          Tier ladder
        </p>
        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
          {TIERS.map((tier) => {
            const isActive = tier.id === currentTier.id
            const isUnlocked = tier.requiresPurchase
              ? totalPurchases >= 1
              : lifetimeSpendUsd >= tier.threshold
            const TierIcon = TIER_ICONS[tier.id]
            return (
              <li
                key={tier.id}
                className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-center transition-colors ${
                  isActive
                    ? "border-[var(--ink)]/40 bg-[var(--bg-2)]"
                    : "border-[var(--line-soft)] bg-[var(--bg-0)]"
                }`}
              >
                <TierIcon
                  className="h-5 w-5"
                  style={{ color: isUnlocked ? tier.color : "var(--ink-mute)" }}
                />
                <span
                  className="text-xs font-semibold"
                  style={{ color: isUnlocked ? tier.color : "var(--ink-mute)" }}
                >
                  {tier.name}
                </span>
                <span className="text-[10px] text-[var(--ink-mute)]">
                  {tier.requiresPurchase
                    ? "1 purchase"
                    : tier.threshold === 0
                      ? "Free"
                      : `$${tier.threshold}`}
                </span>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
