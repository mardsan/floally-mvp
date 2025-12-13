import React from 'react';

/**
 * CalmDashboard - Luminous Calm Design Implementation (Minimal Safe Version)
 */
export default function CalmDashboard({ user }) {
  return (
    <div className="min-h-screen bg-soft-ivory p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-light text-deep-slate mb-4">
            Hey Aimi
          </h1>
          <p className="text-lg text-mist-grey">
            Welcome back, {user?.name || user?.email || 'friend'}
          </p>
        </header>

        {/* Presence Indicator */}
        <div className="card-calm mb-8 text-center">
          <div className="text-6xl mb-4 animate-breathe">✨</div>
          <p className="text-xl text-deep-slate">Present</p>
        </div>

        {/* One Thing */}
        <div className="card-calm mb-8">
          <h2 className="text-2xl font-light text-deep-slate mb-4 flex items-center gap-2">
            <span>��</span> Your One Thing
          </h2>
          <div className="bg-white/50 rounded-lg p-6">
            <h3 className="text-xl font-medium text-deep-slate mb-2">
              Focus on what matters most
            </h3>
            <p className="text-mist-grey">
              Your dashboard is loading. Take a breath.
            </p>
          </div>
        </div>

        {/* Approvals */}
        <div className="card-calm mb-8">
          <h2 className="text-2xl font-light text-deep-slate mb-4 flex items-center gap-2">
            <span>✓</span> Quick Approvals
          </h2>
          <p className="text-mist-grey">No items need your attention right now.</p>
        </div>

        {/* Save My Day */}
        <div className="card-calm">
          <h2 className="text-2xl font-light text-deep-slate mb-4 flex items-center gap-2">
            <span>⚡</span> Save My Day
          </h2>
          <p className="text-mist-grey">AI suggestions will appear here.</p>
        </div>
      </div>
    </div>
  );
}
