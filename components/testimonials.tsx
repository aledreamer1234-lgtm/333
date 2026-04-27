"use client"

import Image from "next/image"
import { useState } from "react"
import { CheckCircle, Star } from "lucide-react"

const testimonials = [
  {
    id: 1,
    name: "FruitHunter_X",
    text: "It's real, it's safe, and it actually works. I was really hesitant to use this page, but I gave it a shot and, to my surprise, I got my Dragon Fruit exactly as advertised in under an hour.",
    avatar: "/avatars/fruithunter.png",
  },
  {
    id: 2,
    name: "ProGamer2024",
    text: "Best place to buy Blox Fruits items! The delivery was instant and customer support was super helpful. Already bought 5 times and never had any issues.",
    avatar: "/avatars/progamer.png",
  },
  {
    id: 3,
    name: "SwordMaster99",
    text: "Absolutely amazing service! Got my Dark Blade within seconds of purchase. The auto-delivery system is incredible. Will definitely be coming back for more!",
    avatar: "/avatars/swordmaster.png",
  },
  {
    id: 4,
    name: "BloxKing_YT",
    text: "I was skeptical at first but this site exceeded all my expectations. Fast delivery, great prices, and the items are exactly as described. 10/10 would recommend!",
    avatar: "/avatars/bloxking.png",
  },
]

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <section id="testimonials" className="py-20 px-6 bg-[var(--bg-1)]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          {/* Quote icon */}
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--bg-2)] border border-[var(--line)] mb-8">
            <svg className="w-5 h-5 text-[var(--ink-mute)]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
          </div>

          {/* Stars */}
          <div className="flex items-center justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-4 h-4 text-[var(--accent)] fill-[var(--accent)]"
              />
            ))}
          </div>

          {/* Testimonial text */}
          <blockquote className="text-xl md:text-2xl font-medium text-[var(--ink)] leading-relaxed mb-8 transition-all duration-500">
            &ldquo;{testimonials[activeIndex].text}&rdquo;
          </blockquote>

          {/* Buyer name + verified badge */}
          <div className="mb-8 flex flex-col items-center gap-2">
            <p className="text-sm font-medium text-[var(--ink)]">
              {testimonials[activeIndex].name}
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--bg-2)] px-3 py-1.5">
              <CheckCircle className="h-4 w-4 text-[var(--accent)]" />
              <span className="text-xs font-medium uppercase tracking-wider text-[var(--ink-dim)]">
                Verified Buyer
              </span>
            </div>
          </div>

          {/* Avatar selector */}
          <div className="flex items-center justify-center gap-3">
            {testimonials.map((testimonial, index) => (
              <button
                key={testimonial.id}
                onClick={() => setActiveIndex(index)}
                aria-label={`Show review from ${testimonial.name}`}
                aria-pressed={activeIndex === index}
                className={`relative h-12 w-12 overflow-hidden rounded-full bg-[var(--bg-3)] transition-all duration-300 ${
                  activeIndex === index
                    ? "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--bg-1)]"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={testimonial.avatar}
                  alt={`${testimonial.name} Roblox avatar`}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
