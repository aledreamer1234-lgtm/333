import type { Metadata } from "next"
import { Ticker } from "@/components/ticker"
import { Header } from "@/components/header"
import { Giveaways } from "@/components/giveaways"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Giveaways · fruits.place",
  description:
    "Enter our weekly Blox Fruits giveaways. Best sellers like Dragon, Kitsune, T-Rex, and Dough — drop your Roblox username and you're in the draw.",
}

export default function GiveawaysPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-0)]">
      <Ticker />
      <Header />
      <Giveaways />
      <Footer />
    </main>
  )
}
