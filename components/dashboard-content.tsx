"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ShieldCheck, Star } from "lucide-react"
import type { User } from "@supabase/supabase-js"

import { TierCard } from "@/components/tier-card"
import type { Tier } from "@/lib/tiers"

interface Profile {
  id: string
  email: string | null
  username: string | null
  balance: number
  created_at: string
}

interface Transaction {
  id: string
  type: "deposit" | "withdrawal" | "purchase"
  amount: number
  status: "pending" | "completed" | "failed" | "cancelled"
  description: string | null
  created_at: string
}

interface Order {
  id: string
  items: unknown
  total: number
  status: string
  created_at: string
}

type RobloxIdentity = {
  username: string | null
  displayName: string | null
  avatarUrl: string | null
  verifiedAt: string | null
}

interface DashboardContentProps {
  user: User
  profile: Profile | null
  transactions: Transaction[]
  orders: Order[]
  lifetimeSpendUsd: number
  totalPurchases: number
  currentTier: Tier
  robloxIdentity: RobloxIdentity
}

type TabType = "deposits" | "withdrawals" | "history" | "analytics"

export function DashboardContent({
  user,
  profile,
  transactions,
  lifetimeSpendUsd,
  totalPurchases,
  currentTier,
  robloxIdentity,
}: DashboardContentProps) {
  const [activeTab, setActiveTab] = useState<TabType>("deposits")

  const deposits = transactions.filter(t => t.type === "deposit")
  const withdrawals = transactions.filter(t => t.type === "withdrawal")

  const tabs: { id: TabType; label: string }[] = [
    { id: "deposits", label: "Deposits" },
    { id: "withdrawals", label: "Withdrawals" },
    { id: "history", label: "Account History" },
    { id: "analytics", label: "Aff. Analytics" },
  ]

  const getDisplayTransactions = () => {
    switch (activeTab) {
      case "deposits":
        return deposits
      case "withdrawals":
        return withdrawals
      case "history":
        return transactions
      default:
        return []
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400 bg-green-400/10"
      case "pending":
        return "text-yellow-400 bg-yellow-400/10"
      case "failed":
        return "text-red-400 bg-red-400/10"
      case "cancelled":
        return "text-gray-400 bg-gray-400/10"
      default:
        return "text-gray-400 bg-gray-400/10"
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-0)]">
      {/* Trustpilot Banner */}
      <div className="bg-[var(--bg-1)] border-b border-[var(--line)] py-2">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center gap-2 text-sm">
          <span className="text-[var(--ink-mute)]">Our customers say</span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-5 h-5 bg-green-500 flex items-center justify-center">
                <Star className="w-3 h-3 text-white fill-white" />
              </div>
            ))}
          </div>
          <span className="text-[var(--ink)]">4.2 out of 5 based on 1204 reviews</span>
          <div className="flex items-center gap-1 ml-2">
            <Star className="w-4 h-4 text-green-500 fill-green-500" />
            <span className="text-[var(--ink)] font-medium">Trustpilot</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/"
            className="flex items-center gap-2 text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Store</span>
          </Link>
        </div>

        {/* User Info */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {robloxIdentity.avatarUrl ? (
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--bg-2)]">
                <Image
                  src={robloxIdentity.avatarUrl}
                  alt={`${robloxIdentity.displayName ?? "Roblox"} avatar`}
                  fill
                  sizes="64px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            ) : (
              <div className="grid h-16 w-16 flex-shrink-0 place-items-center rounded-xl border border-[var(--line)] bg-[var(--bg-2)]">
                <span className="text-xl font-bold text-[var(--ink-mute)]">
                  {(profile?.username ?? user.email ?? "?").slice(0, 1).toUpperCase()}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold text-[var(--ink)]">
                {"Welcome, "}
                {robloxIdentity.displayName ??
                  profile?.username ??
                  user.email?.split("@")[0]}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                {robloxIdentity.username && (
                  <span className="inline-flex items-center gap-1 font-mono text-[var(--ink-dim)]">
                    @{robloxIdentity.username}
                    {robloxIdentity.verifiedAt && (
                      <ShieldCheck
                        className="h-3.5 w-3.5"
                        style={{ color: "var(--accent)" }}
                        aria-label="Roblox verified"
                      />
                    )}
                  </span>
                )}
                <span
                  className="inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                  style={{
                    color: currentTier.color,
                    borderColor: `${currentTier.color}55`,
                    backgroundColor: `${currentTier.color}1a`,
                  }}
                >
                  {currentTier.name} Member
                </span>
              </div>
              <p className="mt-1 truncate text-xs text-[var(--ink-mute)]">{user.email}</p>
            </div>
          </div>
          <div className="rounded-xl border border-[var(--line)] bg-[var(--bg-1)] px-6 py-4">
            <p className="mb-1 text-xs uppercase tracking-wider text-[var(--ink-mute)]">
              Balance
            </p>
            <p className="text-2xl font-bold text-[var(--accent)]">
              ${(profile?.balance || 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Tier card */}
        <div className="mb-10">
          <TierCard
            lifetimeSpendUsd={lifetimeSpendUsd}
            totalPurchases={totalPurchases}
            currentTier={currentTier}
          />
        </div>

        {/* Transactions Section */}
        <div>
          <h2 className="text-2xl font-bold text-[var(--ink)] mb-6 uppercase tracking-wide">
            Transactions
          </h2>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Tabs */}
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 lg:w-52 shrink-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? "bg-[var(--bg-2)] text-[var(--ink)] border-b-2 lg:border-b-0 lg:border-l-2 border-red-500"
                      : "bg-[var(--bg-1)] text-[var(--ink-mute)] hover:text-[var(--ink)] hover:bg-[var(--bg-2)]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="flex-1 bg-[var(--bg-1)] rounded-xl border border-[var(--line)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[var(--bg-2)]">
                      <th className="text-left px-6 py-4 text-sm font-medium text-[var(--ink)]">
                        {activeTab === "deposits" ? "Deposit ID" : 
                         activeTab === "withdrawals" ? "Withdrawal ID" : "Transaction ID"}
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-[var(--ink)]">
                        Date
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-[var(--ink)]">
                        Amount
                      </th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-[var(--ink)]">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTab === "analytics" ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-[var(--ink-mute)]">
                          Affiliate analytics coming soon
                        </td>
                      </tr>
                    ) : getDisplayTransactions().length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-[var(--ink-mute)]">
                          No {activeTab === "history" ? "transactions" : activeTab} found
                        </td>
                      </tr>
                    ) : (
                      getDisplayTransactions().map((transaction) => (
                        <tr 
                          key={transaction.id} 
                          className="border-t border-[var(--line)] hover:bg-[var(--bg-2)]/50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm text-[var(--ink)] font-mono">
                            {transaction.id.slice(0, 8)}...
                          </td>
                          <td className="px-6 py-4 text-sm text-[var(--ink-dim)]">
                            {formatDate(transaction.created_at)}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium">
                            <span className={transaction.type === "withdrawal" ? "text-red-400" : "text-green-400"}>
                              {transaction.type === "withdrawal" ? "-" : "+"}${Math.abs(transaction.amount).toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(transaction.status)}`}>
                              {transaction.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
