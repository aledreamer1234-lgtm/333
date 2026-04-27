'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push('/dashboard')
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

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
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--accent)]">
                <span className="text-lg font-bold text-[var(--bg-0)]">F</span>
              </div>
              <span className="text-xl font-semibold text-[var(--ink)]">fruits.place</span>
            </div>
            <h1 className="text-2xl font-semibold text-[var(--ink)] mb-2">Welcome back</h1>
            <p className="text-[var(--ink-mute)]">Sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[var(--ink)]">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[var(--bg-1)] border-[var(--line)] text-[var(--ink)] placeholder:text-[var(--ink-mute)]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[var(--ink)]">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[var(--bg-1)] border-[var(--line)] text-[var(--ink)]"
              />
            </div>
            
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-[var(--accent)] text-[var(--bg-0)] hover:bg-[var(--accent)]/90" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--ink-mute)]">
            Don&apos;t have an account?{' '}
            <Link href="/auth/sign-up" className="text-[var(--accent)] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
