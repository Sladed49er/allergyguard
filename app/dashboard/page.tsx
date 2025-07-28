'use client'

import React, { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { 
  Shield, 
  Users, 
  Scan, 
  History, 
  Plus, 
  AlertTriangle, 
  Search,
  LogOut,
  Settings,
  Bell
} from 'lucide-react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState('scanner')

  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: 'white', fontSize: '1.125rem' }}>Loading AllergyGuard...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    window.location.href = '/login'
    return null
  }

  const tabs = [
    { id: 'scanner', label: 'AI Scanner', icon: Scan },
    { id: 'family', label: 'Family', icon: Users },
    { id: 'history', label: 'History', icon: History },
  ]

  return (
    <>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .dashboard-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #581c87 50%, #0f172a 100%);
        }
        
        .header {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          padding: 1rem 0;
        }
        
        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .logo-icon {
          padding: 0.5rem;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 0.5rem;
        }
        
        .logo-text {
          font-size: 1.5rem;
          font-weight: bold;
          color: white;
          margin: 0;
        }
        
        .user-menu {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .user-info {
          color: white;
          font-size: 0.875rem;
        }
        
        .user-actions {
          display: flex;
          gap: 0.5rem;
        }
        
        .icon-button {
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 0.5rem;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .icon-button:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }
        
        .main-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
        
        .welcome-section {
          margin-bottom: 2rem;
        }
        
        .welcome-title {
          font-size: 2rem;
          font-weight: bold;
          color: white;
          margin: 0 0 0.5rem 0;
        }
        
        .welcome-subtitle {
          color: #d1d5db;
          margin: 0;
        }
        
        .tabs-container {
          margin-bottom: 2rem;
        }
        
        .tabs {
          display: flex;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          padding: 0.5rem;
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .tab {
          flex: 1;
          padding: 0.75rem 1rem;
          background: transparent;
          border: none;
          border-radius: 0.5rem;
          color: #9ca3af;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .tab.active {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
        }
        
        .tab:hover:not(.active) {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
        
        .content-area {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 1rem;
          padding: 2rem;
          min-height: 400px;
        }
        
        .scanner-content {
          text-align: center;
        }
        
        .scanner-icon {
          width: 4rem;
          height: 4rem;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }
        
        .content-title {
          font-size: 1.5rem;
          font-weight: bold;
          color: white;
          margin: 0 0 0.5rem 0;
        }
        
        .content-description {
          color: #d1d5db;
          margin: 0 0 2rem 0;
          max-width: 400px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .ingredient-input {
          width: 100%;
          max-width: 500px;
          height: 120px;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 0.5rem;
          color: white;
          font-size: 1rem;
          resize: vertical;
          margin: 0 auto 1rem;
          display: block;
        }
        
        .ingredient-input::placeholder {
          color: #9ca3af;
        }
        
        .ingredient-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
        }
        
        .scan-button {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0 auto;
        }
        
        .scan-button:hover {
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          transform: translateY(-1px);
        }
        
        .scan-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
        
        .coming-soon {
          text-align: center;
          padding: 3rem 1rem;
        }
        
        .coming-soon-icon {
          width: 3rem;
          height: 3rem;
          background: rgba(59, 130, 246, 0.2);
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }
        
        .coming-soon-title {
          font-size: 1.25rem;
          font-weight: bold;
          color: white;
          margin: 0 0 0.5rem 0;
        }
        
        .coming-soon-text {
          color: #9ca3af;
          margin: 0;
        }
      `}</style>

      <div className="dashboard-container">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <div className="logo">
              <div className="logo-icon">
                <Shield size={24} color="white" />
              </div>
              <h1 className="logo-text">AllergyGuard</h1>
            </div>
            
            <div className="user-menu">
              <div className="user-info">
                Welcome back, {session?.user?.name || 'User'}!
              </div>
              <div className="user-actions">
                <button className="icon-button" title="Notifications">
                  <Bell size={18} />
                </button>
                <button className="icon-button" title="Settings">
                  <Settings size={18} />
                </button>
                <button 
                  className="icon-button" 
                  title="Sign Out"
                  onClick={() => signOut({ callbackUrl: '/login' })}
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content">
          {/* Welcome Section */}
          <div className="welcome-section">
            <h1 className="welcome-title">Family Protection Dashboard</h1>
            <p className="welcome-subtitle">
              Keep your family safe with AI-powered allergen detection
            </p>
          </div>

          {/* Tabs */}
          <div className="tabs-container">
            <div className="tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="content-area">
            {activeTab === 'scanner' && (
              <div className="scanner-content">
                <div className="scanner-icon">
                  <Scan size={32} color="white" />
                </div>
                <h2 className="content-title">AI Ingredient Scanner</h2>
                <p className="content-description">
                  Paste an ingredient list below and our AI will instantly analyze it for potential allergens based on your family's specific allergies.
                </p>
                
                <textarea
                  className="ingredient-input"
                  placeholder="Paste ingredient list here...
Example: Water, Enriched Flour (Wheat Flour, Niacin, Iron, Thiamine Mononitrate, Riboflavin, Folic Acid), Sugar, Soybean Oil, Eggs, Milk, Salt, Baking Powder..."
                />
                
                <button className="scan-button">
                  <Search size={18} />
                  Analyze Ingredients
                </button>
              </div>
            )}

            {activeTab === 'family' && (
              <div className="coming-soon">
                <div className="coming-soon-icon">
                  <Users size={24} color="#3b82f6" />
                </div>
                <h2 className="coming-soon-title">Family Management</h2>
                <p className="coming-soon-text">
                  Add family members and manage their specific allergies and severity levels.
                </p>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="coming-soon">
                <div className="coming-soon-icon">
                  <History size={24} color="#3b82f6" />
                </div>
                <h2 className="coming-soon-title">Scan History</h2>
                <p className="coming-soon-text">
                  View your previous ingredient scans and AI analysis results.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}