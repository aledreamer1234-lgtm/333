import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardContent } from "@/components/dashboard-content"
import { getTier } from "@/lib/tiers"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Fetch transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Fetch orders — used for both the dashboard table and tier calculations.
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const completedOrders = (orders || []).filter((o) => o.status === "completed")
  const lifetimeSpendUsd = completedOrders.reduce(
    (sum, o) => sum + Number(o.total ?? 0),
    0,
  )
  const totalPurchases = completedOrders.length
  const currentTier = getTier(lifetimeSpendUsd, totalPurchases)

  // Roblox identity is stored in auth.users.raw_user_meta_data during sign-up
  // so we don't need a profiles schema migration to surface it.
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>
  const robloxIdentity = {
    username: typeof meta.roblox_username === "string" ? meta.roblox_username : null,
    displayName:
      typeof meta.roblox_display_name === "string" ? meta.roblox_display_name : null,
    avatarUrl: typeof meta.roblox_avatar_url === "string" ? meta.roblox_avatar_url : null,
    verifiedAt:
      typeof meta.roblox_verified_at === "string" ? meta.roblox_verified_at : null,
  }

  return (
    <DashboardContent
      user={user}
      profile={profile}
      transactions={transactions || []}
      orders={orders || []}
      lifetimeSpendUsd={lifetimeSpendUsd}
      totalPurchases={totalPurchases}
      currentTier={currentTier}
      robloxIdentity={robloxIdentity}
    />
  )
}
