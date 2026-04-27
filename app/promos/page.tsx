import type { Metadata } from "next"
import { Ticker } from "@/components/ticker"
import { Header } from "@/components/header"
import { PromoCodes } from "@/components/promo-codes"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Promo Codes · fruits.place",
  description:
    "Stack live promo codes on top of our $8 / 1,000 Robux rate. Copy a code and paste it at checkout to unlock the discount instantly.",
}

export default function PromosPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-0)]">
      <Ticker />
      <Header />
      <PromoCodes />
      <Footer />
    </main>
  )
}
