'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('scanner');

  // Handle loading and authentication states
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    if (!session) {
      router.push('/login');
      return;
    }
  }, [session, status, router]);

  // Show loading spinner while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!session) {
    return null;
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-purple-500/10 rounded-full animate-float-delayed"></div>
        <div className="absolute top-1/2 left-3/4 w-20 h-20 bg-pink-500/10 rounded-full animate-float"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="glass-card p-6 mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Welcome back, {session.user?.name || session.user?.email}!
                </h1>
                <p className="text-blue-200">
                  Keep your family safe with AI-powered allergen detection
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all duration-300"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="glass-card p-2 mb-8">
            <div className="flex gap-2">
              {[
                { id: 'scanner', label: 'AI Scanner', icon: '🔍' },
                { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
                { id: 'history', label: 'History', icon: '📋' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-3 px-4 rounded-lg transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-white border border-white/20'
                      : 'text-blue-200 hover:bg-white/10'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="glass-card p-8">
            {activeTab === 'scanner' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">
                  🔍 AI Ingredient Scanner
                </h2>
                <p className="text-blue-200 mb-6">
                  Paste ingredient lists below and get instant allergen analysis for your family
                </p>
                
                <div className="mb-6">
                  <label className="block text-white font-medium mb-3">
                    Ingredient List
                  </label>
                  <textarea
                    className="w-full h-40 p-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 resize-none focus:outline-none focus:border-blue-400 transition-colors"
                    placeholder="Paste ingredient list here... (e.g., Enriched Wheat Flour, Sugar, Palm Oil, Eggs, Milk Powder, Vanilla Extract, Salt)"
                  />
                </div>

                <button className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105">
                  🤖 Analyze Ingredients
                </button>
              </div>
            )}

            {activeTab === 'family' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">
                  👨‍👩‍👧‍👦 Family Management
                </h2>
                <p className="text-blue-200 mb-6">
                  Manage your family members and their allergies
                </p>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🚧</div>
                  <p className="text-blue-200">Family management coming soon!</p>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">
                  📋 Scan History
                </h2>
                <p className="text-blue-200 mb-6">
                  View your previous ingredient analyses and results
                </p>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-blue-200">Scan history coming soon!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}