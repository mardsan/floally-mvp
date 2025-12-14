import React, { useState, useEffect } from 'react';
import { HiMenu, HiX, HiFolder, HiUser, HiCog, HiLogout, HiClock, HiCalendar, HiLightningBolt, HiCheckCircle, HiCubeTransparent } from 'react-icons/hi';
import { FaBrain } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import { gmail, calendar, ai, behavior, userProfile, autonomous } from '../services/api';
import AimiMemory from './AimiMemory';
import AimiDecisionReview from './AimiDecisionReview';
import AimiMemoryControl from './AimiMemoryControl';
import ProjectsPage from './ProjectsPage';
import ProfileHub from './ProfileHub';
import MessageDetailPopup from './MessageDetailPopup';

/**
 * CalmDashboard - Luminous Calm Design Implementation
 * Philosophy: Clarity through simplicity. Beauty through restraint.
 * Mobile-first responsive design with elegant icons.
 */
export default function CalmDashboard({ user }) {
  const [showMenu, setShowMenu] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'memory', 'profile', 'projects', etc.
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messagesError, setMessagesError] = useState(null);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [eventsError, setEventsError] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [loadingSaveDay, setLoadingSaveDay] = useState(false);
  const [saveDayResults, setSaveDayResults] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageDetail, setShowMessageDetail] = useState(false);
  const [userContext, setUserContext] = useState(null);
  const [senderStats, setSenderStats] = useState({});
  const [autonomousActionsResults, setAutonomousActionsResults] = useState(null);

  const handleLogout = () => {
    // Clear any stored credentials and reload
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  // Get display name with fallbacks
  const displayName = user?.display_name || user?.name || user?.email?.split('@')[0] || 'friend';

  // Load user context and sender stats (Context Layers 2-3)
  useEffect(() => {
    const loadContext = async () => {
      if (!user?.email) return;
      
      try {
        // Load user profile context
        const profileResponse = await userProfile.getProfile(user.email);
        setUserContext(profileResponse.data);
        console.log('✅ Loaded user context:', profileResponse.data);
        
        // Load sender stats
        const statsResponse = await behavior.getSenderStats(user.email);
        const statsMap = {};
        statsResponse.data.forEach(stat => {
          statsMap[stat.sender_email] = stat;
        });
        setSenderStats(statsMap);
        console.log(`✅ Loaded sender stats for ${Object.keys(statsMap).length} senders`);
      } catch (error) {
        console.error('Failed to load context:', error);
        // Continue without context - graceful degradation
      }
    };
    
    loadContext();
  }, [user?.email]);

  // Fetch Gmail messages on mount
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user?.email) return;
      
      setLoadingMessages(true);
      setMessagesError(null);
      
      try {
        const response = await gmail.getMessages(user.email, 5, 'important'); // Get 5 most important messages
        setMessages(response.data.messages || []);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
        setMessagesError(error.response?.data?.detail || 'Failed to load messages');
      } finally {
        setLoadingMessages(false);
      }
    };

    if (currentView === 'dashboard') {
      fetchMessages();
    }
  }, [user?.email, currentView]);

  // Fetch Calendar events on mount
  useEffect(() => {
    const fetchEvents = async () => {
      if (!user?.email) return;
      
      setLoadingEvents(true);
      setEventsError(null);
      
      try {
        const response = await calendar.getEvents(user.email, 1); // Get today's events
        setEvents(response.data.events || []);
      } catch (error) {
        console.error('Failed to fetch events:', error);
        setEventsError(error.response?.data?.detail || 'Failed to load calendar');
      } finally {
        setLoadingEvents(false);
      }
    };

    if (currentView === 'dashboard') {
      fetchEvents();
    }
  }, [user?.email, currentView]);

  // Generate AI standup when messages and events are loaded
  useEffect(() => {
    const generateStandup = async () => {
      if (!user?.email || messages.length === 0 || loadingMessages || loadingEvents) return;
      
      setLoadingAI(true);
      setAiError(null);
      
      try {
        // STEP 1: Process autonomous actions FIRST if enabled
        let processedMessages = messages;
        let autonomousSummary = null;
        
        if (userContext?.settings?.ai_preferences?.enable_autonomous_actions) {
          try {
            console.log('🤖 Processing autonomous actions...');
            const autonomousResponse = await autonomous.processInbox(
              user.email,
              messages,
              userContext.settings
            );
            
            setAutonomousActionsResults(autonomousResponse.data);
            autonomousSummary = autonomousResponse.data.summary;
            
            // Filter out messages that were archived
            const archivedIds = autonomousResponse.data.actions_taken
              .filter(a => a.action_taken === 'archived')
              .map(a => a.email_id);
            
            processedMessages = messages.filter(m => !archivedIds.includes(m.id));
            
            if (autonomousResponse.data.total_actioned > 0) {
              toast.success(`✅ Handled ${autonomousResponse.data.total_actioned} emails automatically`, {
                duration: 4000,
                position: 'bottom-center',
                style: { background: '#F6F8F7', color: '#183A3A' }
              });
            }
          } catch (error) {
            console.error('Autonomous actions failed:', error);
            // Continue with standup even if autonomous actions fail
          }
        }
        
        // STEP 2: Inject user context and sender stats (Context Layers 2-3)
        const contextWithStats = userContext ? {
          role: userContext.role,
          priorities: userContext.priorities || [],
          communicationStyle: userContext.communication_style,
          vipSenders: userContext.vip_senders || [],
          senderStats: senderStats, // Pass sender importance scores
          autonomousActionsSummary: autonomousSummary // Pass what Aimi actually did
        } : {};
        
        const response = await ai.generateStandup({
          messages: processedMessages.slice(0, 5), // Top 5 remaining messages
          events: events,
          userContext: contextWithStats
        });
        setAiInsights(response.data);
        console.log('✅ AI standup generated with context layers');
      } catch (error) {
        console.error('Failed to generate AI insights:', error);
        setAiError(error.response?.data?.detail || 'Failed to generate insights');
      } finally {
        setLoadingAI(false);
      }
    };

    if (currentView === 'dashboard' && messages.length > 0 && !loadingMessages && !loadingEvents) {
      generateStandup();
    }
  }, [user?.email, messages.length, events.length, currentView, loadingMessages, loadingEvents, userContext, senderStats]);

  // Track user action (behavior learning)
  const trackAction = async (message, actionType) => {
    try {
      const senderEmail = message.from?.split('<')[1]?.replace('>', '') || message.from || 'unknown@example.com';
      const senderDomain = senderEmail.split('@')[1] || 'unknown.com';
      
      await behavior.logAction({
        user_email: user.email,
        email_id: message.id,
        sender_email: senderEmail,
        sender_domain: senderDomain,
        action_type: actionType,
        email_category: message.category || 'primary',
        has_unsubscribe: message.hasUnsubscribe || false,
        confidence_score: 1.0,
        metadata: {
          subject: message.subject,
          timestamp: new Date().toISOString()
        }
      });
      console.log(`✅ Tracked ${actionType} for ${senderEmail}`);
    } catch (error) {
      console.error('Failed to track action:', error);
      // Don't block the main action if tracking fails
    }
  };

  // Handle email actions
  const handleArchive = async (emailId) => {
    try {
      const message = messages.find(msg => msg.id === emailId);
      await gmail.archive(emailId, user.email);
      setMessages(messages.filter(msg => msg.id !== emailId));
      
      // Track behavior
      if (message) {
        await trackAction(message, 'archive');
      }
      
      // Show success toast
      toast.success('✅ Archived message', {
        duration: 2000,
        position: 'bottom-center',
        style: {
          background: '#F6F8F7',
          color: '#183A3A',
          border: '1px solid #E6ECEA'
        }
      });
    } catch (error) {
      console.error('Failed to archive:', error);
      toast.error('Failed to archive message', {
        duration: 3000,
        position: 'bottom-center'
      });
    }
  };

  const handleMarkImportant = async (emailId) => {
    try {
      const message = messages.find(msg => msg.id === emailId);
      await gmail.markImportant(emailId, user.email);
      // Update local state
      setMessages(messages.map(msg => 
        msg.id === emailId ? { ...msg, isImportant: true, isStarred: true } : msg
      ));
      
      // Track behavior
      if (message) {
        await trackAction(message, 'important');
      }
      
      // Show success toast
      toast.success('⭐ Marked as important', {
        duration: 2000,
        position: 'bottom-center',
        style: {
          background: '#F6F8F7',
          color: '#183A3A',
          border: '1px solid #E6ECEA'
        }
      });
    } catch (error) {
      console.error('Failed to mark important:', error);
      toast.error('Failed to mark as important', {
        duration: 3000,
        position: 'bottom-center'
      });
    }
  };

  // Handle Save My Day - AI triage
  const handleSaveMyDay = async () => {
    try {
      setLoadingSaveDay(true);
      setSaveDayResults(null);
      
      // Use AI to triage messages and events
      const response = await ai.saveMyDay({
        messages: messages,
        events: events,
        userContext: {
          displayName: displayName,
          email: user.email
        }
      });
      
      setSaveDayResults(response.data);
    } catch (error) {
      console.error('Failed to save day:', error);
      // Fallback to simple triage
      setSaveDayResults({
        top_priorities: [
          {
            title: "Review your urgent messages",
            reason: `You have ${messages.filter(m => m.unread).length} unread messages`
          },
          {
            title: "Check your calendar",
            reason: `${events.length} events scheduled today`
          },
          {
            title: "Take a deep breath",
            reason: "One thing at a time. You've got this."
          }
        ],
        can_wait: messages.slice(3).map(m => m.subject || "Email").slice(0, 3),
        reassurance: "I'm here to help. Let's tackle these one by one. Everything else can wait."
      });
    } finally {
      setLoadingSaveDay(false);
    }
  };

  // Show different views
  if (currentView === 'decisions') {
    return <AimiDecisionReview user={user} onBack={() => setCurrentView('dashboard')} />;
  }
  if (currentView === 'memory-control') {
    return <AimiMemoryControl user={user} onBack={() => setCurrentView('dashboard')} />;
  }
  if (currentView === 'memory') {
    return <AimiMemory user={user} onBack={() => setCurrentView('dashboard')} />;
  }
  if (currentView === 'projects') {
    return <ProjectsPage user={user} onLogout={handleLogout} onBack={() => setCurrentView('dashboard')} />;
  }
  if (currentView === 'profile') {
    return <ProfileHub user={user} onBack={() => setCurrentView('dashboard')} />;
  }

  // Extract "The One Thing" from AI standup
  const extractOneThing = () => {
    if (!aiInsights?.standup) return null;
    
    const lines = aiInsights.standup.split('\n');
    const oneThingIndex = lines.findIndex(line => 
      line.toLowerCase().includes('the one thing') || 
      line.toLowerCase().includes('top priority') ||
      line.toLowerCase().includes('most important')
    );
    
    if (oneThingIndex === -1) return null;
    
    // Get the next few non-empty lines as the content
    const content = [];
    for (let i = oneThingIndex + 1; i < lines.length && content.length < 3; i++) {
      const line = lines[i].trim();
      if (line && !line.match(/^[✅🟡🔵👀]/)) {
        content.push(line);
      } else if (line.match(/^[✅🟡🔵👀]/)) {
        break; // Stop at next agency label
      }
    }
    
    return content.join(' ').substring(0, 200);
  };

  const oneThing = extractOneThing();

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gradient-to-br from-[#F6F8F7] via-white to-[#E6ECEA] relative overflow-hidden">
      {/* Ambient light effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-[#65E6CF]/10 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-radial from-[#3DC8F6]/10 to-transparent rounded-full blur-3xl"></div>
      
      {/* Mobile-first container with responsive padding */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 relative z-10">
        
        {/* Mobile & Desktop Menu - Top Right with hamburger on mobile */}
        <div className="fixed top-4 right-4 sm:absolute sm:top-8 sm:right-8 z-50">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/90 backdrop-blur-md border border-[#E6ECEA] shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center"
            aria-label={showMenu ? "Close menu" : "Open menu"}
          >
            {showMenu ? (
              <HiX className="w-6 h-6 text-[#183A3A]" />
            ) : (
              <HiMenu className="w-6 h-6 text-[#183A3A]" />
            )}
          </button>
          
          {/* Dropdown Menu - Mobile optimized */}
          {showMenu && (
            <>
              {/* Mobile backdrop */}
              <div 
                className="fixed inset-0 bg-black/20 backdrop-blur-sm sm:hidden"
                onClick={() => setShowMenu(false)}
              />
              
              <div className="fixed top-20 right-4 left-4 sm:absolute sm:top-16 sm:right-0 sm:left-auto w-auto sm:w-64 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-[#E6ECEA] overflow-hidden">
                <div className="py-2">
                  <button 
                    onClick={() => { setCurrentView('projects'); setShowMenu(false); }}
                    className="w-full px-4 sm:px-6 py-3 sm:py-3.5 text-left hover:bg-[#F6F8F7] active:bg-[#E6ECEA] transition-colors flex items-center gap-3 text-[#183A3A]"
                  >
                    <HiFolder className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">Projects</span>
                  </button>
                  <button 
                    onClick={() => { setCurrentView('memory'); setShowMenu(false); }}
                    className="w-full px-4 sm:px-6 py-3 sm:py-3.5 text-left hover:bg-[#F6F8F7] active:bg-[#E6ECEA] transition-colors flex items-center gap-3 text-[#183A3A]"
                  >
                    <FaBrain className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">Your Profile</span>
                  </button>
                  <button 
                    onClick={() => { setCurrentView('decisions'); setShowMenu(false); }}
                    className="w-full px-4 sm:px-6 py-3 sm:py-3.5 text-left hover:bg-[#F6F8F7] active:bg-[#E6ECEA] transition-colors flex items-center gap-3 text-[#183A3A]"
                  >
                    <HiCheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">Review Decisions</span>
                  </button>
                  <button 
                    onClick={() => { setCurrentView('memory-control'); setShowMenu(false); }}
                    className="w-full px-4 sm:px-6 py-3 sm:py-3.5 text-left hover:bg-[#F6F8F7] active:bg-[#E6ECEA] transition-colors flex items-center gap-3 text-[#183A3A]"
                  >
                    <HiCubeTransparent className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">Learned Patterns</span>
                  </button>
                  <button 
                    onClick={() => { setCurrentView('profile'); setShowMenu(false); }}
                    className="w-full px-4 sm:px-6 py-3 sm:py-3.5 text-left hover:bg-[#F6F8F7] active:bg-[#E6ECEA] transition-colors flex items-center gap-3 text-[#183A3A]"
                  >
                    <HiUser className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">Profile Hub</span>
                  </button>
                  <button className="w-full px-4 sm:px-6 py-3 sm:py-3.5 text-left hover:bg-[#F6F8F7] active:bg-[#E6ECEA] transition-colors flex items-center gap-3 text-[#183A3A]/60">
                    <HiCog className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">Settings</span>
                  </button>
                  <div className="border-t border-[#E6ECEA] my-2"></div>
                  <button 
                    onClick={handleLogout}
                    className="w-full px-4 sm:px-6 py-3 sm:py-3.5 text-left hover:bg-red-50 active:bg-red-100 transition-colors flex items-center gap-3 text-red-600"
                  >
                    <HiLogout className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Conditional View Rendering */}
        {currentView === 'dashboard' && (
          <>
            {/* Header with elevated presence - Responsive */}
            <header className="mb-12 sm:mb-16 lg:mb-20 text-center">
              <div className="mb-6 sm:mb-8 inline-block">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#65E6CF] to-[#3DC8F6] rounded-full blur-2xl opacity-50 animate-pulse"></div>
                  <div className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full bg-gradient-to-br from-[#65E6CF] to-[#3DC8F6] flex items-center justify-center shadow-2xl ring-8 ring-white/50">
                    <video 
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                      className="w-20 h-20 sm:w-28 sm:h-28 lg:w-36 lg:h-36 rounded-full object-cover"
                    >
                      <source src="/Aimy_LUMO_v5.mp4" type="video/mp4" />
                    </video>
                  </div>
                </div>
              </div>
              <img 
                src="/HeyAimi-logo.png" 
                alt="Hey Aimi" 
                className="h-12 sm:h-16 md:h-20 lg:h-24 mx-auto mb-3 sm:mb-4"
              />
              <p className="text-lg sm:text-xl lg:text-2xl text-[#183A3A]/60 font-light px-4">
                Welcome back, <span className="text-[#183A3A]/80 font-normal">{displayName}</span>
              </p>
            </header>

            {/* Presence - Breathing indicator - Mobile optimized */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-[#E6ECEA] p-6 sm:p-8 mb-6 sm:mb-8 text-center group hover:shadow-2xl hover:scale-[1.01] transition-all duration-300">
              <div className="inline-block relative mb-4 sm:mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-[#65E6CF]/20 to-[#3DC8F6]/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative text-5xl sm:text-6xl lg:text-7xl animate-breathe">
                  <FaBrain className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto text-[#65E6CF]" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-light text-[#183A3A] mb-2">Present</p>
              <p className="text-xs sm:text-sm text-[#183A3A]/50 tracking-wider uppercase px-4">You're here. Everything else can wait.</p>
            </div>

            {/* Save My Day Button - Emotional Anchor */}
            <div className="relative mb-8 sm:mb-10">
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF7C72]/20 to-[#FFC46B]/20 rounded-xl blur-2xl opacity-50"></div>
              <div className="relative">
                <button
                  onClick={handleSaveMyDay}
                  disabled={loadingSaveDay}
                  className="w-full bg-gradient-to-r from-[#FF7C72] via-[#FFC46B] to-[#65E6CF] hover:shadow-2xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl p-6 sm:p-8 transition-all duration-300 group">
                >
                  <div className="flex flex-col items-center gap-3 sm:gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                      {loadingSaveDay ? (
                        <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <HiLightningBolt className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-semibold text-white mb-2">
                        {loadingSaveDay ? 'Triaging your day...' : 'Save My Day'}
                      </h3>
                      <p className="text-white/90 text-sm sm:text-base font-light">
                        Feeling overwhelmed? Let Aimi simplify your priorities right now.
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Save My Day Results */}
            {saveDayResults && (
              <div className="relative mb-8 sm:mb-10 group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#65E6CF]/20 to-[#3DC8F6]/20 rounded-2xl sm:rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border-2 border-[#65E6CF]/30 p-6 sm:p-8 lg:p-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-[#65E6CF]/20 to-[#3DC8F6]/20 flex items-center justify-center">
                        <FaBrain className="w-6 h-6 sm:w-7 sm:h-7 text-[#65E6CF]" />
                      </div>
                      <div>
                        <span className="text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#65E6CF] font-semibold block mb-1">Aimi's Triage</span>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-light text-[#183A3A]">Here's what actually matters</h2>
                      </div>
                    </div>
                    <button
                      onClick={() => setSaveDayResults(null)}
                      className="text-[#183A3A]/40 hover:text-[#183A3A] transition-colors"
                    >
                      <HiX className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Top 3 Priorities */}
                  <div className="space-y-4 mb-6">
                    <h3 className="text-sm uppercase tracking-wider text-[#183A3A]/60 font-semibold">Your Top 3 Today:</h3>
                    {saveDayResults.top_priorities.map((priority, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-[#F6F8F7] to-white border border-[#E6ECEA]">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#65E6CF] to-[#3DC8F6] flex items-center justify-center text-white font-semibold text-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-[#183A3A] font-medium mb-1">{priority.title}</p>
                          <p className="text-xs text-[#183A3A]/60">{priority.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Can Wait */}
                  {saveDayResults.can_wait && saveDayResults.can_wait.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm uppercase tracking-wider text-[#183A3A]/60 font-semibold mb-3">These can wait:</h3>
                      <div className="space-y-2">
                        {saveDayResults.can_wait.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-3 rounded-lg bg-[#F6F8F7]/50 border border-[#E6ECEA]">
                            <span className="text-[#183A3A]/40 text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reassurance */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-[#65E6CF]/10 to-[#3DC8F6]/10 border border-[#65E6CF]/20">
                    <p className="text-[#183A3A]/80 text-sm leading-relaxed">
                      {saveDayResults.reassurance || "I've got your back. Focus on these three things, and I'll monitor everything else. You've got this. 💙"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* AI Insights - Aimi's Daily Standup */}
            <div className="relative mb-8 sm:mb-10 group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#AE7BFF]/20 to-[#65E6CF]/20 rounded-2xl sm:rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border-2 border-[#AE7BFF]/30 p-6 sm:p-8 lg:p-10 hover:border-[#AE7BFF]/50 transition-all duration-300">
                <div className="flex items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#AE7BFF]/20 to-[#65E6CF]/20 flex items-center justify-center backdrop-blur-sm border border-[#AE7BFF]/30">
                      <HiLightningBolt className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-[#AE7BFF]" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#AE7BFF] font-semibold block mb-1 sm:mb-2">Aimi's Daily Brief</span>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-light text-[#183A3A]">Your Day at a Glance</h2>
                  </div>
                </div>
                
                {/* Loading State */}
                {loadingAI && (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-10 h-10 border-3 border-[#AE7BFF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-sm text-[#183A3A]/60">Aimi is analyzing your day...</p>
                    </div>
                  </div>
                )}
                
                {/* Error State */}
                {aiError && !loadingAI && (
                  <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                    <p className="text-yellow-700 text-sm">{aiError}</p>
                    <p className="text-xs text-yellow-600 mt-2">AI insights temporarily unavailable. The rest of your dashboard still works!</p>
                  </div>
                )}
                
                {/* AI Insights Content */}
                {!loadingAI && !aiError && aiInsights && (
                  <div className="bg-gradient-to-br from-[#F6F8F7] to-white rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-[#E6ECEA]">
                    <div className="prose prose-sm sm:prose max-w-none">
                      <div className="text-[#183A3A]/80 text-sm sm:text-base leading-relaxed whitespace-pre-wrap space-y-2">
                        {aiInsights.standup.split('\n').map((line, idx) => {
                          // Parse agency labels and apply colors
                          if (line.includes('✅ HANDLED:')) {
                            return (
                              <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-green-50 border-l-4 border-green-500">
                                <span className="text-green-600 font-semibold">✅</span>
                                <span className="flex-1 text-green-800">{line.replace('✅ HANDLED:', '').trim()}</span>
                              </div>
                            );
                          } else if (line.includes('🟡 SUGGESTED:')) {
                            return (
                              <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-yellow-50 border-l-4 border-yellow-500">
                                <span className="text-yellow-600 font-semibold">🟡</span>
                                <span className="flex-1 text-yellow-800">{line.replace('🟡 SUGGESTED:', '').trim()}</span>
                              </div>
                            );
                          } else if (line.includes('🔵 YOUR CALL:')) {
                            return (
                              <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-blue-50 border-l-4 border-blue-500">
                                <span className="text-blue-600 font-semibold">🔵</span>
                                <span className="flex-1 text-blue-800">{line.replace('🔵 YOUR CALL:', '').trim()}</span>
                              </div>
                            );
                          } else if (line.includes('👀 WATCHING:')) {
                            return (
                              <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 border-l-4 border-gray-400">
                                <span className="text-gray-600 font-semibold">👀</span>
                                <span className="flex-1 text-gray-700">{line.replace('👀 WATCHING:', '').trim()}</span>
                              </div>
                            );
                          } else {
                            // Regular line without agency label
                            return line.trim() ? <p key={idx}>{line}</p> : <br key={idx} />;
                          }
                        })}
                      </div>
                    </div>
                    
                    {/* Agency Legend */}
                    <div className="mt-6 pt-4 border-t border-[#E6ECEA]">
                      <p className="text-xs text-[#183A3A]/40 mb-2 uppercase tracking-wider">Agency Labels:</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 border border-green-200 text-xs text-green-700">
                          <span>✅</span> Handled by Aimi
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-50 border border-yellow-200 text-xs text-yellow-700">
                          <span>🟡</span> Suggested by Aimi
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs text-blue-700">
                          <span>🔵</span> Needs your decision
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs text-gray-600">
                          <span>👀</span> Aimi is watching
                        </span>
                      </div>
                    </div>
                    
                    {/* Usage Stats */}
                    {aiInsights.usage && (
                      <div className="mt-4 pt-4 border-t border-[#E6ECEA] flex items-center gap-2 text-xs text-[#183A3A]/40">
                        <FaBrain className="w-3 h-3" />
                        <span>Generated with {aiInsights.usage.output_tokens} tokens</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Default State - No data yet */}
                {!loadingAI && !aiError && !aiInsights && (
                  <div className="bg-gradient-to-br from-[#F6F8F7] to-white rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-[#E6ECEA]">
                    <p className="text-[#183A3A]/60 text-sm sm:text-base leading-relaxed text-center">
                      Aimi will analyze your emails and calendar to create your daily brief...
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* The One Thing - Primary focus card - Responsive */}
            <div className="relative mb-6 sm:mb-8 group">
              <div className="absolute inset-0 bg-gradient-to-br from-[#65E6CF]/20 to-[#3DC8F6]/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-white/90 backdrop-blur-sm rounded-xl shadow-xl border-2 border-[#65E6CF]/30 p-4 sm:p-6 hover:border-[#65E6CF]/50 transition-all duration-300">
                <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-[#65E6CF]/20 to-[#3DC8F6]/20 flex items-center justify-center backdrop-blur-sm border border-[#65E6CF]/30">
                      <HiFolder className="w-5 h-5 sm:w-6 sm:h-6 text-[#65E6CF]" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#65E6CF] font-semibold block mb-1 sm:mb-2">The One Thing</span>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-light text-[#183A3A] mb-2 sm:mb-4">Your Single Focus</h2>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-[#F6F8F7] to-white rounded-lg p-4 sm:p-6 border border-[#E6ECEA] mb-3 sm:mb-4">
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-medium text-[#183A3A] mb-3 sm:mb-4 leading-tight">
                    {oneThing ? oneThing : 'What matters most right now'}
                  </h3>
                  <p className="text-[#183A3A]/70 text-sm sm:text-base lg:text-lg leading-relaxed mb-4 sm:mb-6">
                    {oneThing 
                      ? 'Aimi analyzed your emails, calendar, and priorities to identify this as your most important focus.' 
                      : 'Your most important work lives here. One clear intention. One meaningful action.'}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#65E6CF] to-[#3DC8F6] text-white rounded-xl font-medium hover:shadow-lg active:scale-95 sm:hover:scale-105 transition-all duration-300 shadow-md">
                      <span className="flex items-center justify-center gap-2">
                        <FaBrain className="w-5 h-5" />
                        <span>Begin Focus</span>
                      </span>
                    </button>
                    <button className="w-full sm:w-auto px-6 py-3 sm:py-4 bg-white border-2 border-[#E6ECEA] text-[#183A3A] rounded-xl font-medium hover:border-[#65E6CF]/30 hover:bg-[#F6F8F7] active:bg-[#E6ECEA] transition-all duration-300">
                      Schedule Later
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-[#183A3A]/50">
                  <div className="w-2 h-2 rounded-full bg-[#65E6CF] animate-pulse"></div>
                  <span>Aimi is analyzing your priorities</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Grid - Mobile-first responsive */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Quick Approvals - Now with real Gmail data */}
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-[#3DC8F6]/20 p-4 sm:p-6 hover:shadow-xl hover:border-[#3DC8F6]/40 active:scale-[0.98] sm:active:scale-100 transition-all duration-300">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-[#3DC8F6]/20 to-[#AE7BFF]/20 flex items-center justify-center flex-shrink-0">
                    <HiCog className="w-6 h-6 sm:w-7 sm:h-7 text-[#3DC8F6]" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#3DC8F6] font-semibold block">Quick Approvals</span>
                    <h3 className="text-lg sm:text-xl font-light text-[#183A3A]">Important Messages</h3>
                  </div>
                </div>
                
                {/* Loading State */}
                {loadingMessages && (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-3 border-[#3DC8F6] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                
                {/* Error State */}
                {messagesError && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                    <p className="text-red-600 text-sm">{messagesError}</p>
                    <p className="text-xs text-red-500 mt-2">Make sure you've connected your Gmail account.</p>
                  </div>
                )}
                
                {/* Messages List */}
                {!loadingMessages && !messagesError && (
                  <div className="space-y-3 sm:space-y-4 max-h-96 overflow-y-auto">
                    {messages.length === 0 ? (
                      <div className="p-4 rounded-xl bg-gradient-to-br from-[#F6F8F7] to-white border border-[#E6ECEA]">
                        <p className="text-[#183A3A]/60 text-sm sm:text-base leading-relaxed">
                          No important messages right now. Enjoy this moment of calm.
                        </p>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const senderEmail = message.from?.split('<')[1]?.replace('>', '') || message.from;
                        const stats = senderStats[senderEmail];
                        const isVIP = stats?.importance_score > 0.7;
                        
                        return (
                        <div 
                          key={message.id} 
                          onClick={() => {
                            setSelectedMessage(message);
                            setShowMessageDetail(true);
                            trackAction(message, 'open');
                          }}
                          className="p-4 rounded-xl bg-gradient-to-br from-[#F6F8F7] to-white border border-[#E6ECEA] hover:border-[#3DC8F6]/30 transition-colors cursor-pointer"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-[#183A3A] text-sm truncate">
                                  {message.from.split('<')[0].trim() || message.from}
                                </p>
                                {isVIP && (
                                  <span className="px-1.5 py-0.5 text-[9px] uppercase tracking-wider bg-[#65E6CF]/20 text-[#65E6CF] rounded font-semibold flex-shrink-0">
                                    VIP
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#183A3A]/60 line-clamp-2">
                                {message.subject}
                              </p>
                            </div>
                            {message.unread && (
                              <div className="w-2 h-2 rounded-full bg-[#3DC8F6] flex-shrink-0 mt-1"></div>
                            )}
                          </div>
                          <p className="text-xs text-[#183A3A]/50 mb-3 line-clamp-2">
                            {message.snippet}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleArchive(message.id);
                              }}
                              className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#E6ECEA] text-[#183A3A] rounded-lg hover:bg-[#F6F8F7] active:bg-[#E6ECEA] transition-colors"
                            >
                              Archive
                            </button>
                            {!message.isImportant && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkImportant(message.id);
                                }}
                                className="flex-1 px-3 py-1.5 text-xs bg-gradient-to-r from-[#65E6CF] to-[#3DC8F6] text-white rounded-lg hover:shadow-md active:scale-95 transition-all"
                              >
                                Star
                              </button>
                            )}
                          </div>
                        </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Today's Schedule - Calendar Events */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg border border-[#FFC46B]/20 p-6 sm:p-8 hover:shadow-xl hover:border-[#FFC46B]/40 active:scale-[0.98] sm:active:scale-100 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-[#FF7C72]/20 to-[#FFC46B]/20 flex items-center justify-center flex-shrink-0">
                    <HiCalendar className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF7C72]" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#FFC46B] font-semibold block">Today's Schedule</span>
                    <h3 className="text-lg sm:text-xl font-light text-[#183A3A]">Calendar Events</h3>
                  </div>
                </div>
                
                {/* Loading State */}
                {loadingEvents && (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-8 h-8 border-3 border-[#FFC46B] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                
                {/* Error State */}
                {eventsError && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                    <p className="text-red-600 text-sm">{eventsError}</p>
                    <p className="text-xs text-red-500 mt-2">Make sure you've connected your Google Calendar.</p>
                  </div>
                )}
                
                {/* Events List */}
                {!loadingEvents && !eventsError && (
                  <div className="space-y-3 sm:space-y-4 max-h-96 overflow-y-auto">
                    {events.length === 0 ? (
                      <div className="p-4 rounded-xl bg-gradient-to-br from-[#F6F8F7] to-white border border-[#E6ECEA]">
                        <p className="text-[#183A3A]/60 text-sm sm:text-base leading-relaxed">
                          No events scheduled today. Perfect time for deep work.
                        </p>
                      </div>
                    ) : (
                      events.map((event) => {
                        const startTime = new Date(event.start);
                        const endTime = new Date(event.end);
                        const now = new Date();
                        const isUpcoming = startTime > now;
                        const isHappening = startTime <= now && endTime >= now;
                        const isPast = endTime < now;
                        
                        // Format time
                        const formatTime = (date) => {
                          return date.toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit',
                            hour12: true 
                          });
                        };
                        
                        // Check if all-day event
                        const isAllDay = event.start.length === 10; // Date only format
                        
                        return (
                          <div 
                            key={event.id} 
                            className={`p-4 rounded-xl bg-gradient-to-br from-[#F6F8F7] to-white border transition-colors ${
                              isHappening 
                                ? 'border-[#FFC46B] bg-[#FFC46B]/5' 
                                : isPast 
                                  ? 'border-[#E6ECEA] opacity-60' 
                                  : 'border-[#E6ECEA] hover:border-[#FFC46B]/30'
                            }`}
                          >
                            <div className="flex items-start gap-3 mb-2">
                              <HiClock className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                                isHappening ? 'text-[#FFC46B] animate-pulse' : 'text-[#183A3A]/40'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2 mb-1">
                                  <p className="font-medium text-[#183A3A] text-sm">
                                    {event.summary}
                                  </p>
                                  {isHappening && (
                                    <span className="text-[10px] uppercase tracking-wider text-[#FFC46B] font-semibold">
                                      Now
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-[#183A3A]/60">
                                  {isAllDay 
                                    ? 'All day' 
                                    : `${formatTime(startTime)} - ${formatTime(endTime)}`
                                  }
                                </p>
                                {event.location && (
                                  <p className="text-xs text-[#183A3A]/50 mt-1 truncate">
                                    📍 {event.location}
                                  </p>
                                )}
                                {event.attendees && event.attendees.length > 0 && (
                                  <p className="text-xs text-[#183A3A]/50 mt-1">
                                    👥 {event.attendees.length} {event.attendees.length === 1 ? 'person' : 'people'}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Calm footer message - Responsive */}
            <div className="text-center mt-12 sm:mt-16 lg:mt-20 py-8 sm:py-12">
              <div className="inline-block px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-white/50 backdrop-blur-sm border border-[#E6ECEA]">
                <p className="text-[#183A3A]/40 text-xs sm:text-sm tracking-wider uppercase font-light">
                  Everything else can wait · Focus on what matters
                </p>
              </div>
            </div>
          </>
        )}
      </div>
      </div>
      
      {/* Message Detail Popup */}
      {showMessageDetail && selectedMessage && (
        <MessageDetailPopup
          message={selectedMessage}
          user={user}
          onClose={() => {
            setShowMessageDetail(false);
            setSelectedMessage(null);
          }}
          onFeedback={(feedback) => {
            console.log('User feedback:', feedback);
            toast.success('Thanks for your feedback!', {
              duration: 2000,
              position: 'bottom-center'
            });
          }}
        />
      )}
    </>
  );
}
