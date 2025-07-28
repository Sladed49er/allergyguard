'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ShieldCheck, Search, Users, History, LogOut, Wheat, Milk, Fish, Nut, Sparkles } from 'lucide-react';

// Floating particle component (matching login page)
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
        fontSize: `${16 + Math.random() * 8}px`,
        top: `${startY}%`,
        left: '-2rem',
      } as any}
    >
      <Icon />
    </div>
  )
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('scanner');
  const [ingredients, setIngredients] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Allergen icons for floating particles
  const allergenIcons = [Wheat, Milk, Fish, Nut];

  // Handle loading and authentication states
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
  }, [session, status, router]);

  // Show loading screen while checking authentication
  if (status === 'loading') {
    return (
      <div className="page-container">
        <div className="content-wrapper fade-in">
          <div className="glass-card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <div className="loading-spinner" style={{ margin: '0 auto var(--space-4)' }} />
            <p className="text-muted">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const handleAnalyze = async () => {
    if (!ingredients.trim()) return;
    
    setIsAnalyzing(true);
    // TODO: Implement AI analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      // Mock response for now
      alert('AI Analysis coming soon! Integration with OpenAI API pending.');
    }, 2000);
  };

  const tabs = [
    { id: 'scanner', label: 'AI Scanner', icon: Search },
    { id: 'family', label: 'Family', icon: Users },
    { id: 'history', label: 'History', icon: History }
  ];

  return (
    <div className="page-container">
      {/* Floating allergen particles */}
      {Array.from({ length: 12 }, (_, i) => (
        <FloatingParticle
          key={i}
          icon={allergenIcons[i % allergenIcons.length]}
          delay={i * 2.5}
          duration={15 + Math.random() * 10}
          startY={Math.random() * 100}
        />
      ))}

      <div className="content-wrapper fade-in">
        {/* Header Section */}
        <div className="header-section">
          <div className="logo-container">
            <ShieldCheck size={32} color="white" />
          </div>
          
          <h1 className="app-title">
            Welcome back, {session.user?.name || session.user?.email?.split('@')[0]}!
          </h1>
          <p className="app-subtitle">
            Keep your family safe with AI-powered allergen detection
          </p>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="logout-btn"
            aria-label="Sign out"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="glass-card" style={{ padding: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
          <div className="tab-navigation">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-button ${activeTab === tab.id ? 'tab-button-active' : ''}`}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="glass-card">
          {activeTab === 'scanner' && (
            <div>
              <div className="section-header">
                <Search size={24} />
                <h2>AI Ingredient Scanner</h2>
              </div>
              
              <p className="text-muted" style={{ marginBottom: 'var(--space-6)' }}>
                Paste ingredient lists below and get instant allergen analysis for your family
              </p>
              
              <div className="form-group">
                <label htmlFor="ingredients" className="form-label">
                  Ingredient List
                </label>
                <textarea
                  id="ingredients"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  className="form-textarea"
                  placeholder="Paste ingredient list here... (e.g., Enriched Wheat Flour, Sugar, Palm Oil, Eggs, Milk Powder, Vanilla Extract, Salt)"
                  rows={6}
                />
              </div>

              <button
                onClick={handleAnalyze}
                disabled={!ingredients.trim() || isAnalyzing}
                className="btn btn-primary btn-full"
              >
                {isAnalyzing ? (
                  <>
                    <div className="loading-spinner" />
                    Analyzing ingredients...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Analyze Ingredients with AI
                  </>
                )}
              </button>
            </div>
          )}

          {activeTab === 'family' && (
            <div>
              <div className="section-header">
                <Users size={24} />
                <h2>Family Management</h2>
              </div>
              
              <p className="text-muted" style={{ marginBottom: 'var(--space-6)' }}>
                Manage your family members and their allergies
              </p>
              
              <div className="coming-soon">
                <div className="coming-soon-icon">👨‍👩‍👧‍👦</div>
                <h3>Family Management</h3>
                <p className="text-muted">
                  Add family members, manage their allergies, and set severity levels.
                  Coming soon in the next update!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <div className="section-header">
                <History size={24} />
                <h2>Scan History</h2>
              </div>
              
              <p className="text-muted" style={{ marginBottom: 'var(--space-6)' }}>
                View your previous ingredient analyses and safety assessments
              </p>
              
              <div className="coming-soon">
                <div className="coming-soon-icon">📊</div>
                <h3>Analysis History</h3>
                <p className="text-muted">
                  Track your scan history, filter by risk levels, and export results.
                  Coming soon in the next update!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .logout-btn {
          position: absolute;
          top: var(--space-4);
          right: var(--space-4);
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
          background: rgba(239, 68, 68, 0.1);
          color: rgb(252, 165, 165);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: var(--border-radius);
          font-size: var(--text-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: rgba(239, 68, 68, 0.3);
          transform: translateY(-1px);
        }

        .tab-navigation {
          display: flex;
          gap: var(--space-2);
        }

        .tab-button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-3) var(--space-4);
          background: transparent;
          color: var(--color-text-muted);
          border: none;
          border-radius: var(--border-radius);
          font-size: var(--text-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .tab-button:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--color-text-secondary);
        }

        .tab-button-active {
          background: var(--gradient-primary);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-4);
        }

        .section-header h2 {
          font-size: var(--text-xl);
          font-weight: 600;
          color: white;
          margin: 0;
        }

        .form-textarea {
          width: 100%;
          min-height: 120px;
          padding: var(--space-4);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--border-radius);
          color: white;
          font-size: var(--text-base);
          line-height: 1.5;
          resize: vertical;
          transition: all var(--transition-fast);
        }

        .form-textarea:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-textarea::placeholder {
          color: var(--color-text-muted);
        }

        .coming-soon {
          text-align: center;
          padding: var(--space-8) var(--space-4);
        }

        .coming-soon-icon {
          font-size: 4rem;
          margin-bottom: var(--space-4);
        }

        .coming-soon h3 {
          font-size: var(--text-lg);
          font-weight: 600;
          color: white;
          margin-bottom: var(--space-3);
        }

        @media (max-width: 768px) {
          .logout-btn {
            position: static;
            margin-top: var(--space-4);
            align-self: flex-start;
          }

          .tab-button {
            font-size: var(--text-xs);
            padding: var(--space-2) var(--space-3);
          }

          .tab-button span {
            display: none;
          }

          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-2);
          }
        }
      `}</style>
    </div>
  );
}