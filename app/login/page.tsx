// app/login/page.tsx - Perfect Responsive Login
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Eye, EyeOff, Wheat, Milk, Fish, Nut } from 'lucide-react'
import Link from 'next/link'

// Floating particle component
const FloatingParticle = ({ icon: Icon, delay, duration, startY }: { 
  icon: any, 
  delay: number, 
  duration: number,
  startY: number
}) => {
  return (
    <div 
      className="floating-particle"
      style={{
        '--delay': `${delay}s`,
        '--duration': `${duration}s`,
        '--start-y': `${startY}vh`,
        '--end-y': `${startY + (Math.random() - 0.5) * 20}vh`, // Slight vertical drift
        fontSize: `${16 + Math.random() * 8}px`,
        top: `${startY}%`,
        left: '-2rem',
      } as any}
    >
      <Icon />
    </div>
  )
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Allergen icons for floating particles
  const allergenIcons = [Wheat, Milk, Fish, Nut]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password. Please try again.')
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="page-container">
      {/* Floating allergen particles */}
      {Array.from({ length: 15 }, (_, i) => (
        <FloatingParticle
          key={i}
          icon={allergenIcons[i % allergenIcons.length]}
          delay={i * 1.8}
          duration={12 + Math.random() * 8}
          startY={Math.random() * 100} // Random starting heights
        />
      ))}

      <div className="content-wrapper fade-in">
        {/* Header Section */}
        <div className="header-section">
          <div className="logo-container">
            <ShieldCheck size={32} color="white" />
          </div>
          
          <h1 className="app-title">AllergyGuard</h1>
          <p className="app-subtitle">
            AI-powered protection for your family
          </p>
        </div>

        {/* Login Form Card */}
        <div className="glass-card">
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="your@email.com"
                required
                autoComplete="email"
              />
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-with-icon">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input form-input-with-icon"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="input-icon"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-full"
              style={{ marginBottom: 'var(--space-6)' }}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner" />
                  Signing you in...
                </>
              ) : (
                <>
                  Sign In to AllergyGuard
                  <span style={{ 
                    fontSize: '1.2em',
                    transition: 'transform var(--transition-fast)',
                    display: 'inline-block'
                  }}>→</span>
                </>
              )}
            </button>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-sm text-muted">
                Don't have an account?{' '}
                <Link href="/register" className="text-link">
                  Create one here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .btn:hover span {
          transform: translateX(4px);
        }
      `}</style>
    </div>
  )
}