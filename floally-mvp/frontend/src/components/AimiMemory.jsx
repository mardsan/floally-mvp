import React, { useState, useEffect } from 'react';

/**
 * AimiMemory - Transparent AI understanding and user-editable context
 * Shows what Aimi knows, how she reasons, and allows users to correct/update her memory
 */
export default function AimiMemory({ user, onBack }) {
  const [profile, setProfile] = useState(null);
  const [insights, setInsights] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data for now - will connect to API later
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setProfile({
        role: 'Creative Director',
        company: 'Acme Design Co.',
        priorities: ['Client work', 'Team collaboration', 'Creative focus'],
        communication_style: 'warm_friendly',
        decision_style: 'options_with_context',
        work_hours: { start: '09:00', end: '18:00' }
      });
      setInsights("I understand that you're a Creative Director who values client work and team collaboration. You prefer warm, friendly communication and like to see options with detailed context when making decisions.");
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6F8F7] via-white to-[#E6ECEA] flex items-center justify-center">
        <div className="text-2xl text-[#183A3A]/60">Loading Aimi's memory...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6F8F7] via-white to-[#E6ECEA] relative overflow-hidden">
      {/* Ambient light effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-[#65E6CF]/10 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-radial from-[#AE7BFF]/10 to-transparent rounded-full blur-3xl"></div>
      
      <div className="max-w-4xl mx-auto px-8 py-16 relative z-10">
        
        {/* Back button */}
        <button 
          onClick={onBack}
          className="mb-8 px-4 py-2 text-[#183A3A]/60 hover:text-[#183A3A] transition-colors flex items-center gap-2"
        >
          <span className="text-xl">←</span>
          <span>Back to Dashboard</span>
        </button>

        {/* Header */}
        <header className="mb-12 text-center">
          <div className="mb-6 inline-block">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#AE7BFF] to-[#65E6CF] flex items-center justify-center shadow-xl">
              <span className="text-3xl">🧠</span>
            </div>
          </div>
          <h1 className="text-5xl font-extralight text-[#183A3A] mb-3 tracking-tight">
            Aimi's Memory
          </h1>
          <p className="text-xl text-[#183A3A]/60 font-light">
            What I know about you · Transparent & Editable
          </p>
        </header>

        {/* Aimi's Understanding (Natural Language) */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-[#AE7BFF]/20 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">✨</span>
            <h2 className="text-2xl font-light text-[#183A3A]">How I Understand You</h2>
          </div>
          
          <div className="bg-gradient-to-br from-[#F6F8F7] to-white rounded-2xl p-6 border border-[#E6ECEA]">
            <p className="text-lg text-[#183A3A]/80 leading-relaxed italic">
              "{insights}"
            </p>
          </div>
          
          <div className="mt-4 flex items-center gap-3 text-sm text-[#183A3A]/50">
            <div className="w-2 h-2 rounded-full bg-[#65E6CF]"></div>
            <span>Confidence: High · Based on your profile and 12 days of learning</span>
          </div>
        </div>

        {/* Core Profile (Editable) */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-[#65E6CF]/20 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">👤</span>
              <h2 className="text-2xl font-light text-[#183A3A]">Your Profile</h2>
            </div>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-[#65E6CF]/10 text-[#183A3A] rounded-lg hover:bg-[#65E6CF]/20 transition-colors text-sm font-medium"
            >
              {isEditing ? 'Save Changes' : 'Edit'}
            </button>
          </div>

          <div className="space-y-6">
            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-[#183A3A]/60 mb-2">Role</label>
              {isEditing ? (
                <input 
                  type="text" 
                  value={profile.role}
                  onChange={(e) => setProfile({...profile, role: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-[#E6ECEA] bg-white focus:border-[#65E6CF] focus:outline-none"
                />
              ) : (
                <div className="px-4 py-3 rounded-xl bg-[#F6F8F7] text-[#183A3A]">
                  {profile.role}
                </div>
              )}
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-[#183A3A]/60 mb-2">Company</label>
              {isEditing ? (
                <input 
                  type="text" 
                  value={profile.company}
                  onChange={(e) => setProfile({...profile, company: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-[#E6ECEA] bg-white focus:border-[#65E6CF] focus:outline-none"
                />
              ) : (
                <div className="px-4 py-3 rounded-xl bg-[#F6F8F7] text-[#183A3A]">
                  {profile.company}
                </div>
              )}
            </div>

            {/* Priorities */}
            <div>
              <label className="block text-sm font-medium text-[#183A3A]/60 mb-2">Top Priorities</label>
              <div className="space-y-2">
                {profile.priorities.map((priority, idx) => (
                  <div key={idx} className="px-4 py-3 rounded-xl bg-[#F6F8F7] text-[#183A3A] flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#65E6CF] text-white text-xs flex items-center justify-center font-medium">
                      {idx + 1}
                    </span>
                    <span>{priority}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Communication Style */}
            <div>
              <label className="block text-sm font-medium text-[#183A3A]/60 mb-2">Communication Style</label>
              <div className="px-4 py-3 rounded-xl bg-[#F6F8F7] text-[#183A3A] capitalize">
                {profile.communication_style.replace('_', ', ')}
              </div>
            </div>

            {/* Decision Style */}
            <div>
              <label className="block text-sm font-medium text-[#183A3A]/60 mb-2">Decision Making</label>
              <div className="px-4 py-3 rounded-xl bg-[#F6F8F7] text-[#183A3A] capitalize">
                {profile.decision_style.replace('_', ' ')}
              </div>
            </div>
          </div>
        </div>

        {/* Learned Behaviors */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-[#3DC8F6]/20 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">📊</span>
            <h2 className="text-2xl font-light text-[#183A3A]">What I've Learned</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#F6F8F7] to-white border border-[#E6ECEA]">
              <div className="flex items-start gap-3">
                <span className="text-xl">⚡</span>
                <div className="flex-1">
                  <div className="font-medium text-[#183A3A] mb-1">Important Senders</div>
                  <div className="text-sm text-[#183A3A]/70">
                    Emails from <span className="font-medium">alice@client.com</span> get responses in ~30 minutes (95% priority)
                  </div>
                </div>
                <button className="text-xs px-3 py-1 bg-white border border-[#E6ECEA] rounded-lg hover:bg-[#F6F8F7] transition-colors">
                  Edit
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-[#F6F8F7] to-white border border-[#E6ECEA]">
              <div className="flex items-start gap-3">
                <span className="text-xl">🕐</span>
                <div className="flex-1">
                  <div className="font-medium text-[#183A3A] mb-1">Work Patterns</div>
                  <div className="text-sm text-[#183A3A]/70">
                    You're most productive 9am-11am · Prefer focused work blocks
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-[#F6F8F7] to-white border border-[#E6ECEA]">
              <div className="flex items-start gap-3">
                <span className="text-xl">📧</span>
                <div className="flex-1">
                  <div className="font-medium text-[#183A3A] mb-1">Email Preferences</div>
                  <div className="text-sm text-[#183A3A]/70">
                    Newsletters: 12% read rate · Suggested 8 unsubscribes
                  </div>
                </div>
                <button className="text-xs px-3 py-1 bg-[#65E6CF] text-white rounded-lg hover:bg-[#65E6CF]/90 transition-colors">
                  Review
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 text-sm text-[#183A3A]/50">
            <div className="w-2 h-2 rounded-full bg-[#3DC8F6] animate-pulse"></div>
            <span>Learning from 156 actions over 12 days</span>
          </div>
        </div>

        {/* Custom Rules (Future) */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-[#FFC46B]/20 p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">⚙️</span>
            <h2 className="text-2xl font-light text-[#183A3A]">Custom Rules</h2>
          </div>

          <div className="text-center py-8 text-[#183A3A]/50">
            <span className="text-4xl mb-3 block">✨</span>
            <p className="mb-4">No custom rules yet</p>
            <button className="px-6 py-3 bg-gradient-to-r from-[#65E6CF] to-[#3DC8F6] text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300">
              + Add Rule
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
