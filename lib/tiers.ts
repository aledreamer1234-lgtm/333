// Loyalty tier ladder. Tier is determined from a user's lifetime spend (USD)
// and total completed purchases. Tiers are intentionally cumulative — every
// higher tier inherits the perks of the ones below it (callers can render the
// inheritance however they like).

export type TierId = "member" | "bronze" | "silver" | "gold" | "platinum" | "top"

export type Tier = {
  id: TierId
  name: string
  /** USD lifetime spend required to unlock this tier. */
  threshold: number
  /** When true, tier unlocks after the user makes any (>=1) purchase. */
  requiresPurchase?: boolean
  /** Discount applied to future orders for this tier. */
  discountPercent: number
  /** Short tagline shown under the tier name. */
  tagline: string
  /** Color used for badges, progress fills, etc. */
  color: string
  /** Public-facing perks for this tier. */
  perks: string[]
}

// Ordered from lowest to highest. The matcher walks this list in reverse so we
// always return the highest tier the user qualifies for.
export const TIERS: Tier[] = [
  {
    id: "member",
    name: "Member",
    threshold: 0,
    discountPercent: 0,
    tagline: "Welcome to fruits.place",
    color: "#737373",
    perks: [
      "Access to weekly giveaways",
      "Standard email support",
      "Real-time order tracking",
    ],
  },
  {
    id: "bronze",
    name: "Bronze",
    threshold: 0,
    requiresPurchase: true,
    discountPercent: 3,
    tagline: "Unlocks after your first purchase",
    color: "#b08968",
    perks: [
      "3% off every future order",
      "1 bonus raffle entry per order",
      "Priority email support queue",
    ],
  },
  {
    id: "silver",
    name: "Silver",
    threshold: 50,
    discountPercent: 5,
    tagline: "$50 lifetime spend",
    color: "#d4d4d8",
    perks: [
      "5% off every future order",
      "2x raffle entries per order",
      "Members-only monthly raffle",
      "Custom username color",
    ],
  },
  {
    id: "gold",
    name: "Gold",
    threshold: 100,
    discountPercent: 8,
    tagline: "$100 lifetime spend",
    color: "#fbbf24",
    perks: [
      "8% off every future order",
      "3x raffle entries per order",
      "Free permanent gamepass each quarter",
      "Front-of-line live chat support",
    ],
  },
  {
    id: "platinum",
    name: "Platinum",
    threshold: 250,
    discountPercent: 12,
    tagline: "$250 lifetime spend",
    color: "#67e8f9",
    perks: [
      "12% off every future order",
      "5x raffle entries per order",
      "Free legendary fruit each quarter",
      "Private Discord channel access",
      "Early access to new drops",
    ],
  },
  {
    id: "top",
    name: "Top Customer",
    threshold: 500,
    discountPercent: 15,
    tagline: "$500 lifetime spend",
    color: "#a3e635",
    perks: [
      "15% off every future order",
      "10x raffle entries per order",
      "Free mythical fruit each quarter",
      "Dedicated account manager",
      "Exclusive Top Customer giveaways",
      "Priority delivery within 5 minutes",
    ],
  },
]

export function getTier(lifetimeSpendUsd: number, totalPurchases: number): Tier {
  // Walk highest → lowest so we return the best qualifying tier.
  for (let i = TIERS.length - 1; i >= 0; i--) {
    const t = TIERS[i]
    if (t.requiresPurchase) {
      if (totalPurchases >= 1 && lifetimeSpendUsd < (TIERS[i + 1]?.threshold ?? Infinity)) {
        return t
      }
      continue
    }
    if (lifetimeSpendUsd >= t.threshold) return t
  }
  return TIERS[0]
}

export function getNextTier(currentId: TierId): Tier | null {
  const idx = TIERS.findIndex((t) => t.id === currentId)
  if (idx < 0 || idx >= TIERS.length - 1) return null
  return TIERS[idx + 1]
}
