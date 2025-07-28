'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Eye, EyeOff, Wheat, Milk, Fish, Nut, Leaf } from 'lucide-react'
import Link from 'next/link'

// Floating particle component with organic feel
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
        '--end-y': `${startY + (Math.random() - 0.5) * 20}vh`,
        fontSize: `${14 + Math.random() * 6}px`,
        top: `${startY}%`,
        left: '-2rem',
        color: `rgba(34, 197, 94, ${0.3 + Math.random() * 0.4})`,
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

  // Organic food-related icons for floating particles
  const organicIcons = [Wheat, Milk, Fish, Nut, Leaf]

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
    <div className="organic-page">
      {/* Floating organic particles */}
      {Array.from({ length: 12 }, (_, i) => (
        <FloatingParticle
          key={i}
          icon={organicIcons[i % organicIcons.length]}
          delay={i * 2.5}
          duration={18 + Math.random() * 8}
          startY={Math.random() * 100}
        />
      ))}

      <div className="organic-container">
        {/* Header Section */}
        <div className="organic-header">
          <div className="organic-logo">
            <ShieldCheck size={32} />
          </div>
          
          <h1 className="organic-title">AllergyGuard</h1>
          <p className="organic-subtitle">
            AI-powered protection for your family 🏡
          </p>
        </div>

        {/* Login Form Card */}
        <div className="organic-card">
          <div className="card-header">
            <h2>Welcome Back!</h2>
            <p>Sign in to keep your family safe</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="input-group">
              <label htmlFor="email" className="organic-label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="organic-input"
                placeholder="your@email.com"
                required
                autoComplete="email"
              />
            </div>

            {/* Password Field */}
            <div className="input-group">
              <label htmlFor="password" className="organic-label">
                Password
              </label>
              <div className="input-with-icon">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="organic-input input-with-button"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
              className="organic-button primary full-width"
            >
              {isLoading ? (
                <>
                  <div className="organic-spinner" />
                  Signing you in...
                </>
              ) : (
                <>
                  Sign In to AllergyGuard
                  <span className="button-arrow">→</span>
                </>
              )}
            </button>

            {/* Register Link */}
            <div className="link-section">
              <p>
                Don't have an account?{' '}
                <Link href="/register" className="organic-link">
                  Create one here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .organic-page {
          min-height: 100vh;
          background: linear-gradient(135deg, 
            #f8fafc 0%, 
            #f1f5f9 25%, 
            #ecfdf5 50%, 
            #f0fdf4 75%, 
            #f7fee7 100%
          );
          position: relative;
          overflow-x: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
        }

        .organic-container {
          max-width: 420px;
          width: 100%;
          position: relative;
          z-index: 10;
        }

        .organic-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .organic-logo {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin: 0 auto 1rem;
          box-shadow: 0 8px 32px rgba(34, 197, 94, 0.3);
        }

        .organic-title {
          font-size: 2rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 0.5rem 0;
          line-height: 1.2;
        }

        .organic-subtitle {
          color: #6b7280;
          margin: 0;
          font-size: 1rem;
          line-height: 1.5;
        }

        .organic-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 24px;
          padding: 2rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
        }

        .card-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .card-header h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.5rem 0;
        }

        .card-header p {
          color: #6b7280;
          margin: 0;
          font-size: 0.9rem;
        }

        .input-group {
          margin-bottom: 1.5rem;
        }

        .organic-label {
          display: block;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }

        .organic-input {
          width: 100%;
          padding: 0.875rem 1rem;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(209, 213, 219, 0.8);
          border-radius: 12px;
          color: #1f2937;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .organic-input:focus {
          outline: none;
          border-color: #22c55e;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
          background: white;
        }

        .organic-input::placeholder {
          color: #9ca3af;
        }

        .input-with-icon {
          position: relative;
        }

        .input-with-button {
          padding-right: 3rem;
        }

        .password-toggle {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          transition: color 0.2s ease;
          padding: 0.25rem;
          border-radius: 6px;
        }

        .password-toggle:hover {
          color: #374151;
          background: rgba(0, 0, 0, 0.05);
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          margin-bottom: 1rem;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .organic-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          border: none;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
          font-family: inherit;
        }

        .organic-button.primary {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
          box-shadow: 0 6px 20px rgba(34, 197, 94, 0.3);
        }

        .organic-button.primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(34, 197, 94, 0.4);
        }

        .organic-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none !important;
        }

        .full-width {
          width: 100%;
          margin-bottom: 1.5rem;
        }

        .button-arrow {
          font-size: 1.1em;
          transition: transform 0.2s ease;
          display: inline-block;
        }

        .organic-button:hover .button-arrow {
          transform: translateX(3px);
        }

        .organic-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .link-section {
          text-align: center;
        }

        .link-section p {
          color: #6b7280;
          font-size: 0.875rem;
          margin: 0;
        }

        .organic-link {
          color: #22c55e;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .organic-link:hover {
          color: #16a34a;
          text-decoration: underline;
        }

        .floating-particle {
          position: fixed;
          animation: float-across var(--duration, 20s) linear infinite;
          animation-delay: var(--delay, 0s);
          pointer-events: none;
          z-index: 1;
          opacity: 0.6;
        }

        @keyframes float-across {
          0% {
            transform: translateX(-2rem) translateY(var(--start-y, 50vh)) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateX(calc(100vw + 2rem)) translateY(var(--end-y, 50vh)) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .organic-page {
            padding: 1rem 0.5rem;
          }

          .organic-card {
            padding: 1.5rem;
          }

          .organic-title {
            font-size: 1.75rem;
          }

          .card-header h2 {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  )
}