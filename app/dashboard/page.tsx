'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ShieldCheck, Search, Users, History, LogOut, Wheat, Milk, Fish, Nut, Sparkles, Leaf, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

// Types for AI analysis results
interface AllergenAnalysis {
  isProblematic: boolean;
  detectedAllergens: string[];
  analysis: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendations: string[];
  ingredientHighlights: {
    safe: string[];
    concerning: string[];
    problematic: string[];
  };
  scanDate?: string;
  familyAllergiesChecked?: string[];
}

interface AnalysisResponse {
  success: boolean;
  scanId: string;
  analysis: AllergenAnalysis;
  error?: string;
}

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

// Risk Level Badge Component
const RiskBadge = ({ level }: { level: string }) => {
  const getRiskStyles = (level: string) => {
    switch (level) {
      case 'LOW':
        return { bg: 'rgba(34, 197, 94, 0.1)', color: '#059669', border: 'rgba(34, 197, 94, 0.3)' };
      case 'MEDIUM':
        return { bg: 'rgba(251, 191, 36, 0.1)', color: '#d97706', border: 'rgba(251, 191, 36, 0.3)' };
      case 'HIGH':
        return { bg: 'rgba(249, 115, 22, 0.1)', color: '#ea580c', border: 'rgba(249, 115, 22, 0.3)' };
      case 'CRITICAL':
        return { bg: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', border: 'rgba(239, 68, 68, 0.3)' };
      default:
        return { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280', border: 'rgba(107, 114, 128, 0.3)' };
    }
  };

  const styles = getRiskStyles(level);
  
  return (
    <span 
      className="risk-badge"
      style={{
        background: styles.bg,
        color: styles.color,
        border: `1px solid ${styles.border}`
      }}
    >
      {level} RISK
    </span>
  );
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('scanner');
  const [ingredients, setIngredients] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AllergenAnalysis | null>(null);
  const [error, setError] = useState('');

  // Organic food-related icons for floating particles
  const organicIcons = [Wheat, Milk, Fish, Nut, Leaf];

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
      <div className="organic-page">
        <div className="organic-content">
          <div className="organic-card" style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="organic-spinner" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: '#6b7280' }}>Loading your dashboard...</p>
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
    if (!ingredients.trim()) {
      setError('Please enter some ingredients to analyze');
      return;
    }
    
    setIsAnalyzing(true);
    setError('');
    setAnalysisResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients: ingredients.trim()
        }),
      });

      const data: AnalysisResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze ingredients');
      }

      if (data.success && data.analysis) {
        setAnalysisResult(data.analysis);
        // Scroll to results
        setTimeout(() => {
          document.getElementById('analysis-results')?.scrollIntoView({ 
            behavior: 'smooth' 
          });
        }, 100);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error instanceof Error ? error.message : 'Failed to analyze ingredients');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewScan = () => {
    setIngredients('');
    setAnalysisResult(null);
    setError('');
  };

  const tabs = [
    { id: 'scanner', label: 'AI Scanner', icon: Search },
    { id: 'family', label: 'Family', icon: Users },
    { id: 'history', label: 'History', icon: History }
  ];

  // Get user's first name or email prefix
  const getUserName = () => {
    if (session.user?.name) {
      return session.user.name.split(' ')[0];
    }
    if (session.user?.email) {
      return session.user.email.split('@')[0];
    }
    return '';
  };

  const userName = getUserName();

  return (
    <div className="organic-page">
      {/* Floating organic particles */}
      {Array.from({ length: 10 }, (_, i) => (
        <FloatingParticle
          key={i}
          icon={organicIcons[i % organicIcons.length]}
          delay={i * 3}
          duration={20 + Math.random() * 10}
          startY={Math.random() * 100}
        />
      ))}

      <div className="organic-content">
        {/* Header Section */}
        <div className="organic-header">
          <div className="logo-section">
            <div className="organic-logo">
              <ShieldCheck size={28} />
            </div>
            <div className="welcome-text">
              <h1>Welcome back{userName ? `, ${userName}` : ''}! 🏡</h1>
              <p>Keep your family safe with natural, AI-powered allergen detection</p>
            </div>
          </div>

          <button onClick={handleLogout} className="organic-logout-btn">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="organic-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`organic-tab ${activeTab === tab.id ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="organic-card">
          {activeTab === 'scanner' && (
            <div>
              <div className="section-header">
                <Search size={22} />
                <h2>AI Ingredient Scanner</h2>
              </div>
              
              <p className="section-description">
                Paste ingredient lists below and get instant allergen analysis for your family 🔍
              </p>
              
              <div className="input-group">
                <label htmlFor="ingredients" className="organic-label">
                  Ingredient List
                </label>
                <textarea
                  id="ingredients"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  className="organic-textarea"
                  placeholder="Paste ingredient list here... (e.g., Enriched Wheat Flour, Sugar, Palm Oil, Eggs, Milk Powder, Vanilla Extract, Salt)"
                  rows={6}
                  disabled={isAnalyzing}
                />
              </div>

              {error && (
                <div className="error-message">
                  <XCircle size={16} />
                  {error}
                </div>
              )}

              <div className="button-group">
                <button
                  onClick={handleAnalyze}
                  disabled={!ingredients.trim() || isAnalyzing}
                  className="organic-button primary"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="organic-spinner" />
                      Analyzing ingredients...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Analyze Ingredients with AI
                    </>
                  )}
                </button>

                {analysisResult && (
                  <button
                    onClick={handleNewScan}
                    className="organic-button secondary"
                  >
                    Start New Scan
                  </button>
                )}
              </div>

              {/* Analysis Results */}
              {analysisResult && (
                <div id="analysis-results" className="analysis-results">
                  <div className="results-header">
                    <h3>Analysis Results</h3>
                    <RiskBadge level={analysisResult.riskLevel} />
                  </div>

                  {/* Main Analysis */}
                  <div className="analysis-section">
                    <div className="analysis-icon">
                      {analysisResult.isProblematic ? (
                        <AlertTriangle size={24} style={{ color: '#dc2626' }} />
                      ) : (
                        <CheckCircle size={24} style={{ color: '#059669' }} />
                      )}
                    </div>
                    <div className="analysis-text">
                      <h4>{analysisResult.isProblematic ? 'Allergens Detected' : 'Safe for Family'}</h4>
                      <p>{analysisResult.analysis}</p>
                    </div>
                  </div>

                  {/* Detected Allergens */}
                  {analysisResult.detectedAllergens.length > 0 && (
                    <div className="allergen-list">
                      <h4>Detected Allergens:</h4>
                      <div className="allergen-tags">
                        {analysisResult.detectedAllergens.map((allergen, index) => (
                          <span key={index} className="allergen-tag">
                            {allergen}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {analysisResult.recommendations.length > 0 && (
                    <div className="recommendations">
                      <h4>Recommendations:</h4>
                      <ul>
                        {analysisResult.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Ingredient Highlights */}
                  {analysisResult.ingredientHighlights && (
                    <div className="ingredient-highlights">
                      <h4>Ingredient Analysis:</h4>
                      
                      {analysisResult.ingredientHighlights.problematic.length > 0 && (
                        <div className="highlight-section problematic">
                          <strong>⚠️ Problematic:</strong>
                          <span>{analysisResult.ingredientHighlights.problematic.join(', ')}</span>
                        </div>
                      )}
                      
                      {analysisResult.ingredientHighlights.concerning.length > 0 && (
                        <div className="highlight-section concerning">
                          <strong>⚡ Concerning:</strong>
                          <span>{analysisResult.ingredientHighlights.concerning.join(', ')}</span>
                        </div>
                      )}
                      
                      {analysisResult.ingredientHighlights.safe.length > 0 && (
                        <div className="highlight-section safe">
                          <strong>✅ Safe:</strong>
                          <span>{analysisResult.ingredientHighlights.safe.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'family' && (
            <div>
              <div className="section-header">
                <Users size={22} />
                <h2>Family Management</h2>
              </div>
              
              <p className="section-description">
                Manage your family members and their allergies 👨‍👩‍👧‍👦
              </p>
              
              <div className="coming-soon">
                <div className="coming-soon-icon">🌱</div>
                <h3>Family Profiles</h3>
                <p>Add family members, manage their allergies, and set severity levels. Growing soon!</p>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <div className="section-header">
                <History size={22} />
                <h2>Scan History</h2>
              </div>
              
              <p className="section-description">
                View your previous ingredient analyses and safety assessments 📊
              </p>
              
              <div className="coming-soon">
                <div className="coming-soon-icon">📈</div>
                <h3>Analysis History</h3>
                <p>Track your scan history, filter by risk levels, and export results. Blooming soon!</p>
              </div>
            </div>
          )}
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
        }

        .organic-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          position: relative;
          z-index: 10;
        }

        .organic-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 20px;
          padding: 1.5rem 2rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .organic-logo {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 20px rgba(34, 197, 94, 0.3);
        }

        .welcome-text h1 {
          font-size: 1.8rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 0.5rem 0;
          line-height: 1.2;
        }

        .welcome-text p {
          color: #6b7280;
          margin: 0;
          font-size: 0.95rem;
        }

        .organic-logout-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 12px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .organic-logout-btn:hover {
          background: rgba(239, 68, 68, 0.15);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
        }

        .organic-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          background: rgba(255, 255, 255, 0.6);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 16px;
          padding: 0.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        .organic-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem;
          background: transparent;
          color: #6b7280;
          border: none;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .organic-tab:hover {
          background: rgba(255, 255, 255, 0.8);
          color: #374151;
          transform: translateY(-1px);
        }

        .organic-tab.active {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
          box-shadow: 0 4px 16px rgba(34, 197, 94, 0.3);
        }

        .organic-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 24px;
          padding: 2rem;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .section-header h2 {
          font-size: 1.4rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .section-description {
          color: #6b7280;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
          line-height: 1.6;
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

        .organic-textarea {
          width: 100%;
          min-height: 120px;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(209, 213, 219, 0.8);
          border-radius: 12px;
          color: #1f2937;
          font-size: 0.9rem;
          line-height: 1.5;
          resize: vertical;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .organic-textarea:focus {
          outline: none;
          border-color: #22c55e;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
          background: white;
        }

        .organic-textarea:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .organic-textarea::placeholder {
          color: #9ca3af;
        }

        .button-group {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
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
          flex: 1;
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

        .organic-button.secondary {
          background: rgba(107, 114, 128, 0.1);
          color: #374151;
          border: 1px solid rgba(107, 114, 128, 0.2);
        }

        .organic-button.secondary:hover {
          background: rgba(107, 114, 128, 0.15);
          transform: translateY(-1px);
        }

        .organic-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none !important;
        }

        .organic-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          margin-bottom: 1rem;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .analysis-results {
          background: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 16px;
          padding: 1.5rem;
          margin-top: 2rem;
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(229, 231, 235, 0.5);
        }

        .results-header h3 {
          font-size: 1.2rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .risk-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .analysis-section {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .analysis-icon {
          flex-shrink: 0;
        }

        .analysis-text h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.5rem 0;
        }

        .analysis-text p {
          color: #6b7280;
          margin: 0;
          line-height: 1.6;
        }

        .allergen-list {
          margin-bottom: 1.5rem;
        }

        .allergen-list h4 {
          font-size: 0.9rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.75rem 0;
        }

        .allergen-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .allergen-tag {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .recommendations {
          margin-bottom: 1.5rem;
        }

        .recommendations h4 {
          font-size: 0.9rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.75rem 0;
        }

        .recommendations ul {
          margin: 0;
          padding-left: 1.5rem;
          color: #6b7280;
        }

        .recommendations li {
          margin-bottom: 0.5rem;
          line-height: 1.5;
        }

        .ingredient-highlights h4 {
          font-size: 0.9rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.75rem 0;
        }

        .highlight-section {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
          padding: 0.75rem;
          border-radius: 8px;
          font-size: 0.85rem;
        }

        .highlight-section.problematic {
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.1);
        }

        .highlight-section.concerning {
          background: rgba(251, 191, 36, 0.05);
          border: 1px solid rgba(251, 191, 36, 0.1);
        }

        .highlight-section.safe {
          background: rgba(34, 197, 94, 0.05);
          border: 1px solid rgba(34, 197, 94, 0.1);
        }

        .highlight-section strong {
          color: #1f2937;
          white-space: nowrap;
        }

        .highlight-section span {
          color: #6b7280;
          line-height: 1.4;
        }

        .coming-soon {
          text-align: center;
          padding: 3rem 2rem;
        }

        .coming-soon-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .coming-soon h3 {
          font-size: 1.2rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.75rem;
        }

        .coming-soon p {
          color: #6b7280;
          font-size: 0.9rem;
          line-height: 1.6;
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

        @media (max-width: 768px) {
          .organic-content {
            padding: 1rem;
          }

          .organic-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .organic-logout-btn {
            align-self: flex-end;
          }

          .organic-tab span {
            display: none;
          }

          .organic-tab {
            padding: 0.75rem;
          }

          .welcome-text h1 {
            font-size: 1.5rem;
          }

          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .button-group {
            flex-direction: column;
          }

          .analysis-section {
            flex-direction: column;
            gap: 0.75rem;
          }

          .results-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }

          .highlight-section {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}