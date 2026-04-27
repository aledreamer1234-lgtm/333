import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Checkout } from "@/components/checkout"

export const metadata = {
  title: "Checkout - fruits.place",
  description: "Review your order and complete your purchase.",
}

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-0)]">
      <Header />
      <Checkout />
      <Footer />
    </main>
  )
}
