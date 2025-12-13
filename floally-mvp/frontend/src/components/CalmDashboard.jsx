import React, { useState } from 'react';
import AimiMemory from './AimiMemory';
import ProjectsPage from './ProjectsPage';
import ProfileHub from './ProfileHub';

/**
 * CalmDashboard - Luminous Calm Design Implementation
 * Philosophy: Clarity through simplicity. Beauty through restraint.
 */
export default function CalmDashboard({ user }) {
  const [showMenu, setShowMenu] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'memory', 'profile', 'projects', etc.

  const handleLogout = () => {
    // Clear any stored credentials and reload
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  // Get display name with fallbacks
  const displayName = user?.display_name || user?.name || user?.email?.split('@')[0] || 'friend';

  // Show different views
  if (currentView === 'memory') {
    return <AimiMemory user={user} onBack={() => setCurrentView('dashboard')} />;
  }
  if (currentView === 'projects') {
    return <ProjectsPage user={user} onLogout={handleLogout} />;
  }
  if (currentView === 'profile') {
    return <ProfileHub user={user} onBack={() => setCurrentView('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8F7] via-white to-[#E6ECEA] relative overflow-hidden">
      {/* Ambient light effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-[#65E6CF]/10 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-radial from-[#3DC8F6]/10 to-transparent rounded-full blur-3xl"></div>
      
      <div className="max-w-5xl mx-auto px-8 py-16 relative z-10">
        
        {/* Settings Menu - Top Right */}
        <div className="absolute top-8 right-8">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm border border-[#E6ECEA] shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center text-2xl"
            aria-label="Settings menu"
          >
            ⚙️
          </button>
          
          {/* Dropdown Menu */}
          {showMenu && (
            <div className="absolute top-16 right-0 w-56 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-[#E6ECEA] overflow-hidden">
              <div className="py-2">
                <button 
                  onClick={() => { setCurrentView('projects'); setShowMenu(false); }}
                  className="w-full px-6 py-3 text-left hover:bg-[#F6F8F7] transition-colors flex items-center gap-3 text-[#183A3A]"
                >
                  <span className="text-xl">📁</span>
                  <span className="font-medium">Projects</span>
                </button>
                <button 
                  onClick={() => { setCurrentView('memory'); setShowMenu(false); }}
                  className="w-full px-6 py-3 text-left hover:bg-[#F6F8F7] transition-colors flex items-center gap-3 text-[#183A3A]"
                >
                  <span className="text-xl">🧠</span>
                  <span className="font-medium">Aimi's Memory</span>
                </button>
                <button 
                  onClick={() => { setCurrentView('profile'); setShowMenu(false); }}
                  className="w-full px-6 py-3 text-left hover:bg-[#F6F8F7] transition-colors flex items-center gap-3 text-[#183A3A]"
                >
                  <span className="text-xl">👤</span>
                  <span className="font-medium">Profile Hub</span>
                </button>
                <button className="w-full px-6 py-3 text-left hover:bg-[#F6F8F7] transition-colors flex items-center gap-3 text-[#183A3A]">
                  <span className="text-xl">🔗</span>
                  <span className="font-medium">Integrations</span>
                </button>
                <button className="w-full px-6 py-3 text-left hover:bg-[#F6F8F7] transition-colors flex items-center gap-3 text-[#183A3A]">
                  <span className="text-xl">⚙️</span>
                  <span className="font-medium">Settings</span>
                </button>
                <div className="border-t border-[#E6ECEA] my-2"></div>
                <button 
                  onClick={handleLogout}
                  className="w-full px-6 py-3 text-left hover:bg-red-50 transition-colors flex items-center gap-3 text-red-600"
                >
                  <span className="text-xl">🚪</span>
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Header with elevated presence */}
        <header className="mb-20 text-center">
          <div className="mb-8 inline-block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#65E6CF] to-[#3DC8F6] rounded-full blur-xl opacity-40 animate-pulse"></div>
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#65E6CF] to-[#3DC8F6] flex items-center justify-center shadow-2xl ring-4 ring-white/50">
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  className="w-16 h-16 rounded-full object-cover"
                >
                  <source src="/aimi-video-loop-720-01.mp4" type="video/mp4" />
                  <span className="text-4xl animate-breathe">✨</span>
                </video>
              </div>
            </div>
          </div>
          <h1 className="text-6xl md:text-7xl font-extralight text-[#183A3A] mb-4 tracking-tight leading-tight">
            Hey Aimi
          </h1>
          <p className="text-2xl text-[#183A3A]/60 font-light">
            Welcome back, <span className="text-[#183A3A]/80 font-normal">{displayName}</span>
          </p>
        </header>

        {/* Presence - Breathing indicator */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-[#E6ECEA] p-10 mb-10 text-center group hover:shadow-2xl hover:scale-[1.01] transition-all duration-300">
          <div className="inline-block relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[#65E6CF]/20 to-[#3DC8F6]/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="relative text-7xl animate-breathe">✨</div>
          </div>
          <p className="text-3xl font-light text-[#183A3A] mb-2">Present</p>
          <p className="text-sm text-[#183A3A]/50 tracking-wider uppercase">You're here. Everything else can wait.</p>
        </div>

        {/* The One Thing - Primary focus card */}
        <div className="relative mb-10 group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#65E6CF]/20 to-[#3DC8F6]/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-[#65E6CF]/30 p-10 hover:border-[#65E6CF]/50 transition-all duration-300">
            <div className="flex items-start gap-6 mb-8">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#65E6CF]/20 to-[#3DC8F6]/20 flex items-center justify-center backdrop-blur-sm border border-[#65E6CF]/30">
                  <span className="text-4xl">💚</span>
                </div>
              </div>
              <div className="flex-1">
                <span className="text-xs uppercase tracking-[0.2em] text-[#65E6CF] font-semibold block mb-2">The One Thing</span>
                <h2 className="text-3xl font-light text-[#183A3A] mb-4">Your Single Focus</h2>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-[#F6F8F7] to-white rounded-2xl p-8 border border-[#E6ECEA] mb-6">
              <h3 className="text-2xl font-medium text-[#183A3A] mb-4 leading-tight">
                What matters most right now
              </h3>
              <p className="text-[#183A3A]/70 text-lg leading-relaxed mb-6">
                Your most important work lives here. One clear intention. One meaningful action.
              </p>
              <div className="flex gap-4">
                <button className="px-8 py-4 bg-gradient-to-r from-[#65E6CF] to-[#3DC8F6] text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 shadow-md">
                  <span className="flex items-center gap-2">
                    <span>✨</span>
                    <span>Begin Focus</span>
                  </span>
                </button>
                <button className="px-6 py-4 bg-white border-2 border-[#E6ECEA] text-[#183A3A] rounded-xl font-medium hover:border-[#65E6CF]/30 hover:bg-[#F6F8F7] transition-all duration-300">
                  Schedule Later
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-[#183A3A]/50">
              <div className="w-2 h-2 rounded-full bg-[#65E6CF] animate-pulse"></div>
              <span>Aimi is analyzing your priorities</span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-10">
          {/* Quick Approvals */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-[#3DC8F6]/20 p-8 hover:shadow-xl hover:border-[#3DC8F6]/40 transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#3DC8F6]/20 to-[#AE7BFF]/20 flex items-center justify-center">
                <span className="text-3xl">✓</span>
              </div>
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-[#3DC8F6] font-semibold block">Quick Approvals</span>
                <h3 className="text-xl font-light text-[#183A3A]">Things Waiting</h3>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#F6F8F7] to-white border border-[#E6ECEA]">
                <p className="text-[#183A3A]/60 leading-relaxed">
                  No items need your attention. Enjoy this moment of calm.
                </p>
              </div>
            </div>
          </div>

          {/* Save My Day */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-[#FFC46B]/20 p-8 hover:shadow-xl hover:border-[#FFC46B]/40 transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FFC46B]/20 to-[#FF7C72]/20 flex items-center justify-center">
                <span className="text-3xl">⚡</span>
              </div>
              <div>
                <span className="text-xs uppercase tracking-[0.2em] text-[#FFC46B] font-semibold block">Save My Day</span>
                <h3 className="text-xl font-light text-[#183A3A]">AI Working</h3>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#F6F8F7] to-white border border-[#E6ECEA] flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#AE7BFF] animate-pulse"></div>
                <p className="text-[#183A3A]/60 text-sm flex-1">
                  Aimi is analyzing your day and preparing suggestions
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Calm footer message */}
        <div className="text-center mt-20 py-12">
          <div className="inline-block px-8 py-4 rounded-full bg-white/50 backdrop-blur-sm border border-[#E6ECEA]">
            <p className="text-[#183A3A]/40 text-sm tracking-wider uppercase font-light">
              Everything else can wait · Focus on what matters
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
