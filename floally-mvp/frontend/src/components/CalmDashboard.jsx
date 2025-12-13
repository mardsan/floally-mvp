import React from 'react';

/**
 * CalmDashboard - Luminous Calm Design Implementation
 * Philosophy: One thought per moment. Reduce cognitive load.
 */
export default function CalmDashboard({ user }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-soft-ivory via-white to-mist-grey">
      <div className="max-w-4xl mx-auto px-6 py-12">
        
        {/* Header */}
        <header className="mb-16 text-center">
          <div className="mb-6">
            <div className="inline-block w-16 h-16 rounded-full bg-gradient-to-br from-aimi-green to-aurora-blue flex items-center justify-center mb-4 shadow-lg">
              <span className="text-3xl">✨</span>
            </div>
          </div>
          <h1 className="text-5xl font-light text-deep-slate mb-3 tracking-tight">
            Hey Aimi
          </h1>
          <p className="text-xl text-deep-slate opacity-60">
            Welcome back, {user?.name || user?.email || 'friend'}
          </p>
        </header>

        {/* Presence Indicator */}
        <div className="bg-white rounded-2xl shadow-sm border border-mist-grey p-8 mb-8 text-center hover:shadow-md transition-shadow">
          <div className="text-6xl mb-4 animate-breathe">✨</div>
          <p className="text-2xl font-light text-deep-slate">Present</p>
          <p className="text-sm text-deep-slate opacity-50 mt-2">You're here. Everything else can wait.</p>
        </div>

        {/* One Thing */}
        <div className="bg-white rounded-2xl shadow-sm border border-aimi-green border-opacity-30 p-8 mb-8 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-aimi-green bg-opacity-20 flex items-center justify-center">
              <span className="text-2xl">💚</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-aimi-green font-semibold">The One Thing</span>
              <h2 className="text-2xl font-light text-deep-slate">Your Focus</h2>
            </div>
          </div>
          <div className="bg-gradient-to-br from-soft-ivory to-white rounded-xl p-6 border border-mist-grey">
            <h3 className="text-xl font-medium text-deep-slate mb-3">
              Focus on what matters most
            </h3>
            <p className="text-deep-slate opacity-70 leading-relaxed mb-4">
              Your dashboard is ready. Take a breath and begin.
            </p>
            <button className="px-6 py-3 bg-aimi-green text-deep-slate rounded-lg font-medium hover:bg-opacity-90 transition-all shadow-sm hover:shadow">
              Start Working
            </button>
          </div>
        </div>

        {/* Approvals */}
        <div className="bg-white rounded-2xl shadow-sm border border-aurora-blue border-opacity-30 p-8 mb-8 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-aurora-blue bg-opacity-20 flex items-center justify-center">
              <span className="text-2xl">✓</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-aurora-blue font-semibold">Quick Approvals</span>
              <h2 className="text-2xl font-light text-deep-slate">Things Waiting</h2>
            </div>
          </div>
          <p className="text-deep-slate opacity-60 leading-relaxed">
            No items need your attention right now. Enjoy the calm.
          </p>
        </div>

        {/* Save My Day */}
        <div className="bg-white rounded-2xl shadow-sm border border-sunlight-amber border-opacity-30 p-8 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-sunlight-amber bg-opacity-20 flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-sunlight-amber font-semibold">Save My Day</span>
              <h2 className="text-2xl font-light text-deep-slate">AI Working</h2>
            </div>
          </div>
          <p className="text-deep-slate opacity-60 leading-relaxed">
            Aimi is analyzing your day. Suggestions will appear here.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 py-8">
          <p className="text-deep-slate opacity-40 text-sm tracking-wide">
            Everything else can wait. Focus on what matters.
          </p>
        </div>
      </div>
    </div>
  );
}
