import Link from 'next/link'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-0)] flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--line-soft)] px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-2 text-[var(--ink-mute)] hover:text-[var(--ink)] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to store</span>
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          
          <h1 className="text-2xl font-semibold text-[var(--ink)] mb-2">Authentication Error</h1>
          <p className="text-[var(--ink-mute)] mb-8">
            Something went wrong during authentication. Please try again or contact support if the problem persists.
          </p>
          
          <div className="space-y-3">
            <Button asChild className="w-full bg-[var(--accent)] text-[var(--bg-0)] hover:bg-[var(--accent)]/90">
              <Link href="/auth/login">
                Try Again
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full border-[var(--line)] text-[var(--ink)] hover:bg-[var(--bg-2)]">
              <Link href="/">
                Back to Store
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
