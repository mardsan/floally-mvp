import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, Inbox, Zap } from 'lucide-react';

/**
 * CalmDashboard - Luminous Calm Design Implementation
 * 
 * Philosophy: One thought per moment. Reduce cognitive load.
 * Four sections: Presence → One Thing → Approvals → Save My Day
 */
export default function CalmDashboard({ user }) {
  const [presence, setPresence] = useState('present'); // present, thinking, listening
  const [oneThing, setOneThing] = useState(null);
  const [approvals, setApprovals] = useState([]);
  const [saveMyday, setSaveMyday] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Mock data for now - replace with actual API calls
      setOneThing({
        title: 'Prioritize Creative Focus',
        description: 'With many distracting deals and offers in your inbox, it\'s important to protect your creative time and energy.',
        status: 'ready',
        timeEstimate: '90 minutes'
      });

      setApprovals([
        { id: 1, type: 'email', title: 'Review health and wellness opportunities', count: 3 },
        { id: 2, type: 'task', title: 'Explore new product launches', count: 2 },
      ]);

      setSaveMyday([
        { id: 1, title: 'Schedule time for creative focus', status: 'suggested' },
        { id: 2, title: 'Follow up on health/wellness topics', status: 'drafting' },
      ]);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorking = () => {
    setPresence('working');
    // TODO: Start focus session
  };

  const handleApprove = (item) => {
    console.log('Approved:', item);
    // TODO: Handle approval
  };

  const handleSkip = (item) => {
    console.log('Skipped:', item);
    // TODO: Handle skip
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-ivory flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-aimi-green animate-breathe"></div>
          <p className="text-deep-slate text-lg">Loading your day...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-ivory">
      {/* Header */}
      <header className="bg-white border-b border-mist-grey">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-aimi-green to-aurora-blue flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-deep-slate">Hey Aimi</h1>
                <p className="text-sm text-deep-slate opacity-60">Good afternoon, {user?.name || 'Martin Sanders'}</p>
              </div>
            </div>
            
            {/* Presence Indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                presence === 'present' ? 'bg-aimi-green animate-pulse-calm' :
                presence === 'thinking' ? 'bg-aurora-blue animate-thinking' :
                'bg-lumo-violet animate-listening'
              }`}></div>
              <span className="text-sm text-deep-slate capitalize">{presence}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">
        
        {/* Section 1: The One Thing */}
        <section className="card-calm animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-aimi-green bg-opacity-20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-aimi-green" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs uppercase tracking-wider text-aurora-blue font-semibold">The One Thing</span>
                <span className="px-2 py-0.5 rounded-full bg-sunlight-amber bg-opacity-20 text-xs text-deep-slate">
                  {oneThing?.status}
                </span>
              </div>
              <h2 className="text-2xl font-semibold text-deep-slate mb-3">
                {oneThing?.title}
              </h2>
              <p className="text-deep-slate opacity-75 leading-relaxed mb-6">
                {oneThing?.description}
              </p>
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleStartWorking}
                  className="btn-primary"
                >
                  <Zap className="w-4 h-4 inline mr-2" />
                  Start Working
                </button>
                <button className="btn-secondary">
                  Show Details
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Approvals */}
        {approvals.length > 0 && (
          <section className="card-calm animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-aurora-blue bg-opacity-20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-aurora-blue" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-aurora-blue font-semibold">Quick Approvals</span>
                <h3 className="text-xl font-semibold text-deep-slate mt-1">Things waiting for you</h3>
              </div>
            </div>
            
            <div className="space-y-3">
              {approvals.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-soft-ivory flex items-center justify-between">
                  <div>
                    <p className="text-deep-slate font-medium">{item.title}</p>
                    <p className="text-sm text-deep-slate opacity-60">{item.count} items</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleApprove(item)}
                      className="px-4 py-2 rounded-lg bg-aimi-green text-deep-slate font-medium hover:bg-opacity-90 transition"
                    >
                      Review
                    </button>
                    <button 
                      onClick={() => handleSkip(item)}
                      className="btn-soft"
                    >
                      Later
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 3: Save My Day */}
        {saveMyday.length > 0 && (
          <section className="card-calm animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-glow-coral bg-opacity-20 flex items-center justify-center flex-shrink-0">
                <Inbox className="w-6 h-6 text-glow-coral" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-glow-coral font-semibold">Save My Day</span>
                <h3 className="text-xl font-semibold text-deep-slate mt-1">Aimi is working on these</h3>
              </div>
            </div>
            
            <div className="space-y-3">
              {saveMyday.map((item) => (
                <div key={item.id} className="p-4 rounded-xl border-2 border-mist-grey flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-lumo-violet animate-pulse-calm"></div>
                  <div className="flex-1">
                    <p className="text-deep-slate">{item.title}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-mist-grey text-xs text-deep-slate">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Calm Footer */}
        <div className="text-center py-8">
          <p className="text-deep-slate opacity-40 text-sm">
            Everything else can wait. Focus on what matters.
          </p>
        </div>
      </main>
    </div>
  );
}
