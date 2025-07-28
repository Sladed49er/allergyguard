'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Shield, Check, X } from 'lucide-react'

interface PasswordStrength {
  score: number
  feedback: string[]
  color: string
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Password strength checker
  const checkPasswordStrength = (password: string): PasswordStrength => {
    let score = 0
    const feedback: string[] = []

    if (password.length >= 8) {
      score += 1
    } else {
      feedback.push('At least 8 characters')
    }

    if (/[A-Z]/.test(password)) {
      score += 1
    } else {
      feedback.push('One uppercase letter')
    }

    if (/[a-z]/.test(password)) {
      score += 1
    } else {
      feedback.push('One lowercase letter')
    }

    if (/\d/.test(password)) {
      score += 1
    } else {
      feedback.push('One number')
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1
    } else {
      feedback.push('One special character')
    }

    const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a']
    const color = colors[Math.min(score, 4)]

    return { score, feedback, color }
  }

  const passwordStrength = checkPasswordStrength(formData.password)
  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Call the registration API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      // Success! Show success message and redirect
      alert(`Welcome ${data.user.name}! Account created successfully. You can now sign in.`)
      window.location.href = '/login'
      
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError('')
  }

  // Floating allergen particles
  const allergenParticles = [
    { icon: '🌾', delay: '0s', duration: '8s' },
    { icon: '🥛', delay: '1s', duration: '10s' },
    { icon: '🐟', delay: '2s', duration: '12s' },
    { icon: '🥜', delay: '3s', duration: '9s' },
    { icon: '🥚', delay: '4s', duration: '11s' },
    { icon: '🦐', delay: '2.5s', duration: '7s' },
  ]

  return (
    <>
      <style jsx>{`
        .page-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%);
        }
        
        .background-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 50% 50%, rgba(120,119,198,0.3), transparent 50%);
        }
        
        .floating-particle {
          position: absolute;
          font-size: 1.5rem;
          opacity: 0.2;
          pointer-events: none;
          animation: float 8s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-20px) rotate(5deg); }
          50% { transform: translateY(-10px) rotate(-5deg); }
          75% { transform: translateY(-30px) rotate(3deg); }
        }
        
        .form-container {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          padding: 2rem;
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        
        .header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .icon-container {
          display: flex;
          justify-content: center;
          margin-bottom: 1rem;
        }
        
        .icon-circle {
          padding: 0.75rem;
          border-radius: 9999px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
        }
        
        .title {
          font-size: 1.875rem;
          font-weight: bold;
          color: white;
          margin-bottom: 0.5rem;
          margin: 0;
        }
        
        .subtitle {
          color: #d1d5db;
          margin: 0;
        }
        
        .form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #e5e7eb;
        }
        
        .input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 0.5rem;
          color: white;
          font-size: 1rem;
          transition: all 0.2s;
          box-sizing: border-box;
        }
        
        .input::placeholder {
          color: #9ca3af;
        }
        
        .input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
        }
        
        .input-container {
          position: relative;
        }
        
        .input-with-icon {
          padding-right: 3rem;
        }
        
        .input-icon {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          cursor: pointer;
          transition: color 0.2s;
        }
        
        .input-icon:hover {
          color: white;
        }
        
        .password-strength {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .strength-bar-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .strength-bar {
          flex: 1;
          height: 0.5rem;
          background: #374151;
          border-radius: 9999px;
        }
        
        .strength-fill {
          height: 100%;
          border-radius: 9999px;
          transition: all 0.3s;
        }
        
        .strength-text {
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .strength-feedback {
          font-size: 0.75rem;
          color: #9ca3af;
        }
        
        .confirm-input {
          padding-right: 5rem;
        }
        
        .confirm-icons {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .match-icon {
          color: #22c55e;
        }
        
        .no-match-icon {
          color: #ef4444;
        }
        
        .error-message {
          padding: 0.75rem;
          background: rgba(239, 68, 68, 0.2);
          border: 1px solid rgba(239, 68, 68, 0.5);
          border-radius: 0.5rem;
          color: #fecaca;
          font-size: 0.875rem;
        }
        
        .submit-button {
          width: 100%;
          padding: 0.75rem 1rem;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          font-weight: 600;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 1rem;
        }
        
        .submit-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          transform: scale(1.02);
        }
        
        .submit-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: rgba(107, 114, 128, 0.5);
          transform: none;
        }
        
        .spinner {
          width: 1.25rem;
          height: 1.25rem;
          border: 2px solid transparent;
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .footer {
          margin-top: 1.5rem;
          text-align: center;
        }
        
        .footer-text {
          color: #d1d5db;
          margin: 0;
        }
        
        .footer-link {
          color: #60a5fa;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
        }
        
        .footer-link:hover {
          color: #93c5fd;
        }
        
        .validation-error {
          font-size: 0.75rem;
          color: #fca5a5;
        }
        
        .input-success {
          border-color: #22c55e;
        }
        
        .input-error {
          border-color: #ef4444;
        }
      `}</style>
      
      <div className="page-container">
        <div className="background-overlay" />
        
        {/* Floating Allergen Particles */}
        {allergenParticles.map((particle, index) => (
          <div
            key={index}
            className="floating-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          >
            {particle.icon}
          </div>
        ))}

        <div className="form-container">
          <div className="glass-card">
            {/* Header */}
            <div className="header">
              <div className="icon-container">
                <div className="icon-circle">
                  <Shield size={32} color="white" />
                </div>
              </div>
              <h1 className="title">Join AllergyGuard</h1>
              <p className="subtitle">Create your account to protect your family</p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="form">
              {/* Name Field */}
              <div className="form-group">
                <label htmlFor="name" className="label">Full Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="input"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email" className="label">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input"
                  placeholder="Enter your email"
                />
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="password" className="label">Password</label>
                <div className="input-container">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="input input-with-icon"
                    placeholder="Create a strong password"
                  />
                  <div className="input-icon" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="password-strength">
                    <div className="strength-bar-container">
                      <div className="strength-bar">
                        <div
                          className="strength-fill"
                          style={{
                            width: `${(passwordStrength.score / 5) * 100}%`,
                            backgroundColor: passwordStrength.color,
                          }}
                        />
                      </div>
                      <span className="strength-text" style={{ color: passwordStrength.color }}>
                        {passwordStrength.score === 0 && 'Very Weak'}
                        {passwordStrength.score === 1 && 'Weak'}
                        {passwordStrength.score === 2 && 'Fair'}
                        {passwordStrength.score === 3 && 'Good'}
                        {passwordStrength.score === 4 && 'Strong'}
                        {passwordStrength.score === 5 && 'Very Strong'}
                      </span>
                    </div>
                    {passwordStrength.feedback.length > 0 && (
                      <div className="strength-feedback">
                        Missing: {passwordStrength.feedback.join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="form-group">
                <label htmlFor="confirmPassword" className="label">Confirm Password</label>
                <div className="input-container">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`input confirm-input ${
                      formData.confirmPassword
                        ? passwordsMatch
                          ? 'input-success'
                          : 'input-error'
                        : ''
                    }`}
                    placeholder="Confirm your password"
                  />
                  <div className="confirm-icons">
                    {formData.confirmPassword && (
                      <div>
                        {passwordsMatch ? (
                          <Check size={20} className="match-icon" />
                        ) : (
                          <X size={20} className="no-match-icon" />
                        )}
                      </div>
                    )}
                    <div className="input-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </div>
                  </div>
                </div>
                {formData.confirmPassword && !passwordsMatch && (
                  <div className="validation-error">Passwords do not match</div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="error-message">{error}</div>
              )}

              {/* Register Button */}
              <button
                type="submit"
                disabled={loading || !passwordsMatch || passwordStrength.score < 3}
                className="submit-button"
              >
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="footer">
              <p className="footer-text">
                Already have an account?{' '}
                <Link href="/login" className="footer-link">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}