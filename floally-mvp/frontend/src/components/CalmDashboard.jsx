import React, { useState, useEffect } from 'react';

/**
 * CalmDashboard - Hey Aimi's "Luminous Calm" Interface
 * 
 * Design Philosophy: One thought per moment. Reduce cognitive load, increase emotional safety.
 * 
 * This replaces the complex multi-panel dashboard with:
 * 1. Today's One Thing (with breathing glow)
 * 2. Aimi's current status (gentle motion)
 * 3. Pending approvals (when they exist)
 * 4. Save My Day button (always accessible)
 * 
 * Motion: Breathing, not beeping. 300-600ms transitions.
 * Colors: Whisper, not shout. Primary palette only.
 * Layout: Generous spacing. Calm vertical rhythm.
 */

const CalmDashboard = () => {
  const [aimyStatus, setAimyStatus] = useState('idle'); // idle, listening, thinking, acting
  const [oneThingData, setOneThingData] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSaveDayConfirm, setShowSaveDayConfirm] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setAimyStatus('thinking');
      
      // TODO: Replace with actual API calls
      // For now, mock data to demonstrate the design
      setTimeout(() => {
        setOneThingData({
          title: "Review Q4 budget proposal",
          priority: "high",
          reason: "Your CFO marked it urgent, and it's mentioned in 3 recent emails",
          timeEstimate: "30 min",
          aiConfidence: 0.92,
          source: "email_analysis"
        });
        
        setPendingApprovals([
          {
            id: 1,
            type: 'email',
            action: 'Send reply to Sarah about project timeline',
            preview: 'Hi Sarah, Thanks for checking in. Based on...',
            impact: 'low'
          }
        ]);
        
        setAimyStatus('idle');
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setAimyStatus('idle');
      setIsLoading(false);
    }
  };

  const handleSaveMyDay = async () => {
    setShowSaveDayConfirm(true);
    setAimyStatus('acting');
    
    // TODO: Implement Save My Day backend logic
    // - Reschedule non-urgent meetings
    // - Block focus time
    // - Archive low-priority emails
    // - Surface only critical items
    
    setTimeout(() => {
      setAimyStatus('idle');
      // Show success state
    }, 2000);
  };

  const handleApprove = async (approvalId) => {
    setAimyStatus('acting');
    
    // TODO: Implement approval logic
    console.log('Approving:', approvalId);
    
    // Remove from pending
    setPendingApprovals(prev => prev.filter(a => a.id !== approvalId));
    setAimyStatus('idle');
  };

  const handleSkip = async (approvalId) => {
    setPendingApprovals(prev => prev.filter(a => a.id !== approvalId));
  };

  // Aimi's presence indicator - breathing animation
  const AimyPresence = () => {
    const statusConfig = {
      idle: {
        color: 'bg-aimi-green',
        animation: 'animate-breathe',
        label: "I'm here",
        glow: 'shadow-glow-subtle'
      },
      listening: {
        color: 'bg-aurora-blue',
        animation: 'animate-listening',
        label: "Listening...",
        glow: 'shadow-glow'
      },
      thinking: {
        color: 'bg-lumo-violet',
        animation: 'animate-thinking',
        label: "Thinking...",
        glow: 'shadow-glow'
      },
      acting: {
        color: 'bg-sunlight-amber',
        animation: 'animate-pulse',
        label: "Working on it...",
        glow: 'shadow-glow-strong'
      }
    };

    const config = statusConfig[aimyStatus] || statusConfig.idle;

    return (
      <div className="flex items-center gap-3 mb-12 animate-fade-in">
        <div className={`w-3 h-3 rounded-full ${config.color} ${config.animation} ${config.glow}`} />
        <span className="text-small text-text-secondary font-medium">
          {config.label}
        </span>
      </div>
    );
  };

  // The One Thing - Primary focus card
  const OneThingCard = () => {
    if (!oneThingData) return null;

    return (
      <div className="mb-12 animate-slide-up">
        <h1 className="text-2xl font-display text-deep-slate mb-2">
          Your One Thing Today
        </h1>
        <p className="text-small text-text-secondary mb-6">
          Based on your emails, calendar, and priorities
        </p>

        <div className="card-calm p-8 hover:shadow-glow transition-all duration-calm">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl font-semibold text-deep-slate max-w-2xl">
              {oneThingData.title}
            </h2>
            <span className="px-3 py-1 bg-glow-coral/10 text-glow-coral text-tiny font-medium rounded-full">
              {oneThingData.timeEstimate}
            </span>
          </div>

          <p className="text-base text-text-secondary mb-6 leading-relaxed">
            {oneThingData.reason}
          </p>

          <div className="flex items-center gap-4">
            <button className="btn-primary">
              Start Now
            </button>
            <button className="btn-secondary">
              Schedule for Later
            </button>
            <button className="btn-soft">
              Not Today
            </button>
          </div>

          {/* AI Confidence indicator - subtle, not prominent */}
          <div className="mt-6 pt-4 border-t border-mist-grey">
            <div className="flex items-center gap-2 text-tiny text-text-secondary">
              <div className="w-2 h-2 rounded-full bg-aimi-green animate-breathe-slow" />
              <span>
                {Math.round(oneThingData.aiConfidence * 100)}% confident this is your priority
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Pending Approvals - Only show when they exist
  const PendingApprovals = () => {
    if (pendingApprovals.length === 0) return null;

    return (
      <div className="mb-12 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <h2 className="text-xl font-display text-deep-slate mb-2">
          Waiting for Your Approval
        </h2>
        <p className="text-small text-text-secondary mb-6">
          {pendingApprovals.length} {pendingApprovals.length === 1 ? 'action' : 'actions'} ready to go
        </p>

        <div className="space-y-4">
          {pendingApprovals.map((approval) => (
            <div
              key={approval.id}
              className="card-calm p-6 animate-fade-in"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-aurora-blue/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-aurora-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-medium text-deep-slate mb-2">
                    {approval.action}
                  </h3>
                  <p className="text-small text-text-secondary bg-soft-ivory px-3 py-2 rounded">
                    {approval.preview}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleApprove(approval.id)}
                  className="btn-primary text-sm"
                >
                  Approve & Send
                </button>
                <button className="btn-secondary text-sm">
                  Edit First
                </button>
                <button
                  onClick={() => handleSkip(approval.id)}
                  className="btn-soft text-sm"
                >
                  Skip
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Save My Day - Emergency calm button
  const SaveMyDayButton = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
        className="mb-12"
      >
        <div className="card-calm p-8 bg-gradient-to-br from-soft-ivory to-white border-2 border-mist-grey hover:border-glow-coral transition-all duration-calm">
          <div className="flex items-start gap-6">
  // Save My Day - Emergency calm button
  const SaveMyDayButton = () => {
    return (
      <div className="mb-12 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <div className="card-calm p-8 bg-gradient-to-br from-soft-ivory to-white border-2 border-mist-grey hover:border-glow-coral transition-all duration-calm">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-glow-coral/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-glow-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-deep-slate mb-2">
                Feeling Overwhelmed?
              </h3>
              <p className="text-base text-text-secondary mb-4 leading-relaxed">
                I can reschedule non-urgent meetings, clear your low-priority tasks, and create protected focus time.
              </p>
              <button
                onClick={handleSaveMyDay}
                className="bg-glow-coral hover:bg-glow-coral/90 text-white font-medium px-6 py-3 rounded-md shadow-soft hover:shadow-soft-md transition-all duration-calm active:scale-[0.98]"
                disabled={aimyStatus === 'acting'}
              >
                {aimyStatus === 'acting' ? 'Working on it...' : 'Save My Day'}
              </button>
            </div>
          </div>
        </div>

        {showSaveDayConfirm && (
          <div className="mt-4 p-4 bg-sunlight-amber/10 border border-sunlight-amber/30 rounded-md animate-fade-in">
            <p className="text-small text-deep-slate">
              ✨ I've cleared some space for you. Check your calendar and email.
            </p>
          </div>
        )}
      </div>
    );
  };);
  }

  return (
    <div className="min-h-screen bg-soft-ivory">
      {/* Header - Minimal, breathable */}
      <header className="border-b border-mist-grey bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-aimi-green shadow-glow-subtle" />
            <h1 className="text-xl font-display text-deep-slate">Hey Aimi</h1>
          </div>
          
          <button className="text-small text-text-secondary hover:text-deep-slate transition-colors">
            Settings
          </button>
        </div>
      </header>

      {/* Main Content - One thought per moment */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <AimyPresence />
        <OneThingCard />
        <PendingApprovals />
        <SaveMyDayButton />

        {/* Calm footer - minimal presence */}
        <div className="text-center text-tiny text-text-secondary mt-16">
          <p>Everything's handled. You can relax.</p>
        </div>
      </main>
    </div>
  );
};

export default CalmDashboard;
