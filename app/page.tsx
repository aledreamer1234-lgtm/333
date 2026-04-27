import { Ticker } from "@/components/ticker"
import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { Shop } from "@/components/shop"
import { Testimonials } from "@/components/testimonials"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--bg-0)]">
      <Ticker />
      <Header />
      <Hero />
      <Shop />
      <Testimonials />
      <Footer />
    </main>
  )
}
