// Headers applied to every response. Each one closes off a different attack
// class:
//   X-Frame-Options    — clickjacking (we never want to be iframed).
//   X-Content-Type-Options — MIME sniffing (forces declared content types).
//   Referrer-Policy    — never leak our full URLs to third-party origins,
//                        but still send the origin so analytics still works.
//   Permissions-Policy — disable powerful APIs we don't use; if the bundle
//                        accidentally calls them later, the browser blocks
//                        them rather than prompting the user.
//   Strict-Transport-Security — instruct browsers to refuse HTTP downgrades
//                        for the apex domain and all subdomains, with
//                        `preload` so we're eligible for browser HSTS lists.
//
// CSP is intentionally NOT set here: a meaningful CSP needs nonce
// coordination with Next.js' inline scripts and Vercel Analytics. A lax
// CSP with 'unsafe-inline' would buy us nothing and add maintenance cost,
// so we rely on input sanitisation and React's auto-escaping instead.
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.wikia.nocookie.net',
      },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
