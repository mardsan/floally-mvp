import { useState, useEffect } from 'react';
import ProfileSettings from './ProfileSettings';
import ProfileHub from './ProfileHub';
import UniversalCalendar from './UniversalCalendar';
import EnhancedMessages from './EnhancedMessages';
import Button from './Button';
import Card from './Card';
import Icon from './Icon';

function MainDashboard({ user, onLogout }) {
  const [loading, setLoading] = useState(true);
  const [loadingStandup, setLoadingStandup] = useState(false);
  const [projects, setProjects] = useState([]);
  const [standup, setStandup] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [showProfileHub, setShowProfileHub] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [expandedOneThingDetails, setExpandedOneThingDetails] = useState(false);
  const [oneThingStatus, setOneThingStatus] = useState('preparing');
  const [standupStatusId, setStandupStatusId] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [user.email]);

  useEffect(() => {
    // Update currentUser when user prop changes
    setCurrentUser(user);
  }, [user]);

  // Load saved status when standup data changes
  useEffect(() => {
    if (standup) {
      loadSavedStatus();
    }
  }, [standup?.one_thing]); // Re-check when the one thing changes

  const loadSavedStatus = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://floally-mvp-production.up.railway.app';
      const taskTitle = encodeURIComponent(standup?.one_thing || '');
      const response = await fetch(`${apiUrl}/api/standup/status?user_email=${encodeURIComponent(user.email)}&task_title=${taskTitle}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.has_status) {
          setStandupStatusId(data.id);
          // Map database status values to UI status values
          const statusMap = {
            'not_started': 'preparing',
            'in_progress': 'in_progress',
            'completed': 'complete',
            'deferred': 'blocked'
          };
          setOneThingStatus(statusMap[data.status] || 'preparing');
          console.log('✅ Loaded saved status for task:', standup?.one_thing, '→', data.status);
        } else {
          // No status for this task, reset to preparing
          setOneThingStatus('preparing');
          setStandupStatusId(null);
        }
      }
    } catch (error) {
      console.error('Failed to load saved status:', error);
    }
  };

  const saveStandupStatus = async (newStatus) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://floally-mvp-production.up.railway.app';
      
      // Map UI status values to database status values
      const statusMap = {
        'preparing': 'not_started',
        'in_progress': 'in_progress',
        'complete': 'completed',
        'blocked': 'deferred'
      };
      
      // Convert decisions array to proper secondary_priorities format with urgency values
      const secondaryPriorities = (standup?.decisions || []).map(decision => ({
        title: decision.decision,
        urgency: Math.round((decision.confidence || 0.5) * 100), // Convert confidence back to 0-100 urgency
        action: decision.action || ''
      }));
      
      const payload = {
        user_email: user.email,
        task_title: standup?.one_thing || "No task",
        task_description: standup?.subtitle || "",
        task_project: standup?.project || "general",
        urgency: standup?.urgency || 50,
        status: statusMap[newStatus] || 'not_started',
        ai_reasoning: standup?.reasoning || "",
        secondary_priorities: secondaryPriorities,
        daily_plan: standup?.daily_plan || []
      };
      
      const response = await fetch(`${apiUrl}/api/standup/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        const data = await response.json();
        setStandupStatusId(data.id);
        console.log('✅ Status saved:', newStatus);
      }
    } catch (error) {
      console.error('Failed to save status:', error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setOneThingStatus(newStatus);
    await saveStandupStatus(newStatus);
  };


  const handleProfileUpdate = (updatedData) => {
    // Update the current user state with new data
    const updatedUser = { ...currentUser, ...updatedData };
    setCurrentUser(updatedUser);
    
    // Also update localStorage
    localStorage.setItem('okaimy_user', JSON.stringify(updatedUser));
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadProjects(),
        loadStandup(),
        loadCalendarEvents()
      ]);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://floally-mvp-production.up.railway.app';
      const response = await fetch(`${apiUrl}/api/projects?user_email=${encodeURIComponent(user.email)}`);
      const data = await response.json();
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadStandup = async (forceRefresh = false) => {
    setLoadingStandup(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://floally-mvp-production.up.railway.app';
      
      // Try to get cached standup first (unless force refresh)
      if (!forceRefresh) {
        console.log('📋 Checking for cached standup...');
        const cachedResponse = await fetch(`${apiUrl}/api/standup/today?user_email=${encodeURIComponent(user.email)}`);
        
        if (cachedResponse.ok) {
          const cachedData = await cachedResponse.json();
          if (cachedData.has_standup) {
            console.log('✅ Using cached standup from today');
            buildStandupState(cachedData);
            setLoadingStandup(false);
            return;
          }
        }
      }
      
      // No cache or force refresh - run AI analysis
      console.log('🔄 Running fresh AI standup analysis...');
      const response = await fetch(`${apiUrl}/api/standup/analyze`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_email: user.email
        })
      });
      
      if (!response.ok) {
        throw new Error(`Standup analysis failed: ${response.status}`);
      }
      
      const analysis = await response.json();
      console.log('✅ AI Standup analysis:', analysis);
      
      buildStandupState(analysis);
      
    } catch (error) {
      console.error('Failed to load standup:', error);
      setStandup({
        one_thing: "Unable to load standup. Please try again.",
        subtitle: "There was an error analyzing your inbox",
        full_text: `Error: ${error.message}\n\nPlease try refreshing the page or contact support if the issue persists.`,
        decisions: [],
        autonomous_tasks: [],
        summary: {
          total_emails: 0,
          urgent_items: 0,
          focus_time: 'Unknown'
        }
      });
    } finally {
      setLoadingStandup(false);
    }
  };

  const buildStandupState = (analysis) => {
    // Transform the structured response into our component state
    const theOneThing = analysis.the_one_thing || {};
    const secondaryPriorities = analysis.secondary_priorities || [];
    const aimyHandling = analysis.aimy_handling || [];
    const dailyPlan = analysis.daily_plan || [];
    
    console.log('🔧 Building standup state:', {
      secondaryPriorities,
      firstPriority: secondaryPriorities[0],
      cached: analysis.cached
    });
    
    // Build task details map for easy lookup
    const taskDetails = {
      [theOneThing.title || "Check in with Aimy"]: {
        description: theOneThing.description || "Your inbox is clear!",
        action: theOneThing.action || "Review your priorities",
        project: theOneThing.project || "general",
        urgency: theOneThing.urgency || 0
      }
    };
    
    // Add secondary priority details
    secondaryPriorities.forEach(priority => {
      const title = priority.title || priority.decision || 'Unknown task';
      // Handle both urgency (0-100) from fresh AI and confidence (0-1) from cached data
      const urgency = priority.urgency || (priority.confidence ? Math.round(priority.confidence * 100) : 50);
      taskDetails[title] = {
        description: priority.description || `Focus on: ${title}`,
        action: priority.action || 'Review and take next steps',
        project: priority.project || "general",
        urgency: urgency
      };
    });
      
    setStandup({
      // The One Thing
      one_thing: theOneThing.title || "Check in with Aimy",
      subtitle: theOneThing.description || "Your inbox is clear!",
      urgency: theOneThing.urgency || 0,
      project: theOneThing.project || "general",
      action: theOneThing.action || "Review your priorities",
      
      // Store task details and reasoning for dynamic details display
      task_details: taskDetails,
      reasoning: analysis.reasoning || 'No additional context available.',
      
      // Secondary priorities (Other Priorities section)
      decisions: secondaryPriorities.map(priority => {
        const decision = priority.title || priority.decision || 'Unknown task';
        // Backend sends urgency as 0-100, convert to 0-1 for confidence scale
        const confidence = priority.urgency ? priority.urgency / 100 : (priority.confidence || 0.5);
        return {
          decision,
          confidence,
          action: priority.action || ''
        };
      }),
      
      // Aimy's autonomous tasks
      autonomous_tasks: aimyHandling.map(item => 
        `${item.task} (${item.status})`
      ),
      
      // Daily plan for summary cards
      daily_plan: dailyPlan,
      
      // Summary stats
      summary: {
        total_emails: aimyHandling.length,
        urgent_items: secondaryPriorities.filter(p => p.urgency > 70).length,
        focus_time: dailyPlan.find(p => p.time === 'Morning')?.duration || 'Available'
      }
    });
  };

  const loadCalendarEvents = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://floally-mvp-production.up.railway.app';
      const response = await fetch(`${apiUrl}/api/calendar/events?days=7&user_email=${encodeURIComponent(user.email)}`);
      const data = await response.json();
      setCalendarEvents(data.events || []);
    } catch (error) {
      console.error('Failed to load calendar:', error);
      setCalendarEvents([]);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getUrgencyLevel = (confidence) => {
    // confidence is 0-1, convert to urgency level
    const urgencyScore = confidence * 100;
    
    if (urgencyScore >= 80) {
      return { 
        label: 'High Priority', 
        color: 'bg-red-100 text-red-800 border-red-300',
        icon: '🔴'
      };
    } else if (urgencyScore >= 60) {
      return { 
        label: 'Medium-High', 
        color: 'bg-orange-100 text-orange-800 border-orange-300',
        icon: '🟠'
      };
    } else if (urgencyScore >= 40) {
      return { 
        label: 'Medium', 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        icon: '🟡'
      };
    } else {
      return { 
        label: 'Low Priority', 
        color: 'bg-green-100 text-green-800 border-green-300',
        icon: '🟢'
      };
    }
  };  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-okaimy-mint-50 via-white to-okaimy-emerald-50 flex items-center justify-center">
        <div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-okaimy-mint-50 via-white to-okaimy-emerald-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo & Greeting */}
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <img src="/okaimy-logo-01.png" alt="OkAimy" className="h-6 sm:h-8 flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 truncate">
                  {getGreeting()}, {user.display_name || user.email.split('@')[0]}!
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Here's what's happening today</p>
              </div>
            </div>
            
            {/* Right: Desktop Nav (hidden on mobile) */}
            <div className="hidden md:flex items-center gap-3 lg:gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/projects'}
                className="gap-2"
              >
                <Icon name="note" size="sm" />
                <span className="hidden lg:inline">Projects</span>
              </Button>
              
              {/* Desktop Profile & Settings */}
              <div className="flex items-center gap-2 lg:gap-3 pl-3 lg:pl-4 border-l border-gray-300">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowProfileHub(true)}
                  className="gap-2"
                  title="Profile Hub"
                >
                  <Icon name="contacts" size="sm" />
                  <span className="hidden lg:inline">Profile</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowProfileSettings(true)}
                  className="gap-1"
                  title="Settings"
                >
                  <span className="text-lg">⚙️</span>
                  <span className="hidden lg:inline text-sm">Settings</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLogout}
                >
                  Logout
                </Button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50" 
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Drawer */}
          <div className="absolute top-0 right-0 h-full w-64 bg-white shadow-xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="font-bold text-gray-900">Menu</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              <button
                onClick={() => {
                  window.location.href = '/projects';
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-okaimy-mint-50 rounded-lg transition-colors"
              >
                <Icon name="note" size="md" />
                <span className="font-medium">Projects</span>
              </button>

              <button
                onClick={() => {
                  setShowProfileHub(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-okaimy-mint-50 rounded-lg transition-colors"
              >
                <Icon name="contacts" size="md" />
                <span className="font-medium">Profile Hub</span>
              </button>

              <button
                onClick={() => {
                  setShowProfileSettings(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-okaimy-mint-50 rounded-lg transition-colors"
              >
                <span className="text-xl">⚙️</span>
                <span className="font-medium">Settings</span>
              </button>

              <div className="border-t border-gray-200 my-2" />

              <button
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-medium">Logout</span>
              </button>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-okaimy-gradient flex items-center justify-center text-white font-semibold">
                  {(currentUser.display_name || currentUser.email).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {currentUser.display_name || currentUser.email.split('@')[0]}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Daily Standup - Redesigned Split-Panel Layout */}
        <section className="mb-6 md:mb-8">
          <div className="bg-okaimy-gradient rounded-xl md:rounded-2xl shadow-glow-lg overflow-hidden">
            {/* Header */}
            <div className="px-4 sm:px-6 md:px-8 py-4 md:py-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-bold mb-1 md:mb-2 flex items-center gap-2">
                  <Icon name="target" size="md" className="brightness-0 invert" />
                  Your Daily Standup
                </h2>
                <p className="text-sm md:text-base text-okaimy-mint-100">AI-powered partnership for your most productive day</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => loadStandup(true)}
                disabled={loadingStandup}
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                {loadingStandup ? '⏳ Loading...' : '🔄 Refresh'}
              </Button>
            </div>

            {/* Main Content - Split Panel */}
            <div className="bg-white p-3 md:p-6 lg:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8 mb-4 md:mb-6 lg:mb-8">
                
                {/* LEFT PANEL: USER'S FOCUS */}
                <div className="space-y-4 md:space-y-6">
                  {/* User Avatar Header */}
                  <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden ring-2 md:ring-4 ring-okaimy-mint-200 bg-okaimy-gradient flex items-center justify-center text-white text-xl md:text-2xl font-bold shadow-glow flex-shrink-0">
                      {currentUser?.avatar_url ? (
                        <img src={currentUser.avatar_url} alt={currentUser.display_name} className="w-full h-full object-cover" />
                      ) : (
                        currentUser?.display_name?.charAt(0).toUpperCase() || <Icon name="contacts" size="lg" className="brightness-0 invert" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg md:text-xl font-bold text-gray-800">Your Focus Today</h3>
                      <p className="text-xs md:text-sm text-gray-600 truncate">{currentUser?.display_name || 'You'}</p>
                    </div>
                  </div>

                  {/* The One Thing */}
                  <Card variant="gradient" padding="md" className="shadow-lg border-2 border-okaimy-mint-300">
                    <div className="flex items-center justify-between mb-3 md:mb-4 gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon name="target" size="md" className="text-primary flex-shrink-0" />
                        <h4 className="text-base md:text-lg font-bold text-okaimy-mint-900 truncate">The One Thing</h4>
                      </div>
                      {/* Status Dropdown */}
                      <select
                        value={oneThingStatus}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm border-2 border-okaimy-mint-300 rounded-lg bg-white font-medium focus:outline-none focus:border-primary flex-shrink-0"
                      >
                        <option value="preparing">⚪ Preparing</option>
                        <option value="in_progress">🟡 In Progress</option>
                        <option value="complete">🟢 Complete</option>
                        <option value="blocked">🔴 Blocked</option>
                      </select>
                    </div>
                    
                    {/* Main task - bold and prominent */}
                    <div className="mb-3 md:mb-4">
                      <h5 className="text-base md:text-xl font-bold text-gray-900 mb-1 md:mb-2">
                        {standup?.one_thing || "Review Q4 budget priorities"}
                      </h5>
                      <p className="text-xs md:text-sm text-gray-600">
                        {standup?.subtitle || "From Aimy: High priority deadline today · 2-3 hours"}
                      </p>
                    </div>
                    
                    {/* Expandable Details */}
                    {expandedOneThingDetails && standup?.task_details && (
                      <div className="mb-3 md:mb-4 p-3 md:p-4 bg-white/70 rounded-lg border border-okaimy-mint-200">
                        <h6 className="text-xs md:text-sm font-semibold text-okaimy-mint-900 mb-2">Details from Aimy:</h6>
                        <div className="text-xs md:text-sm text-gray-700 whitespace-pre-wrap max-h-60 overflow-y-auto">
                          {(() => {
                            const currentTask = standup.one_thing;
                            const details = standup.task_details[currentTask] || {};
                            return `${details.description || standup.subtitle || ''}\n\n` +
                                   `Next Action: ${details.action || standup.action || 'Review priorities'}\n` +
                                   `Category: ${details.project || standup.project || 'general'}\n` +
                                   `Urgency: ${details.urgency || standup.urgency || 0}/100\n\n` +
                                   `AI Reasoning:\n${standup.reasoning || 'No additional context available.'}`;
                          })()}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setExpandedOneThingDetails(!expandedOneThingDetails)}
                        className="sm:flex-initial text-xs md:text-sm"
                      >
                        {expandedOneThingDetails ? '▼ Hide Details' : '▶ Show Details'}
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1 text-xs md:text-sm"
                        onClick={() => {
                          handleStatusChange('in_progress');
                          setExpandedOneThingDetails(true);
                        }}
                      >
                        ✅ Start Working
                      </Button>
                    </div>
                  </Card>

                  {/* Other Priorities */}
                  <div className="bg-gray-50 rounded-xl p-3 md:p-4 lg:p-6">
                    <h4 className="text-base md:text-lg font-bold text-gray-800 mb-3 md:mb-4">📋 Other Priorities</h4>
                    <div className="space-y-2 md:space-y-3">
                      {standup?.decisions && standup.decisions.length > 0 ? (
                        standup.decisions.map((decision, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              // Swap tasks: current one_thing goes back to decisions
                              const currentTask = standup.one_thing;
                              const currentSubtitle = standup.subtitle;
                              const currentAction = standup.action;
                              const newDecisions = standup.decisions.filter((_, i) => i !== idx);
                              
                              // Add the current one_thing back to decisions (if it's not the default text)
                              if (currentTask && currentTask !== "Review Q4 budget priorities" && currentTask !== "Unable to load standup. Please try again.") {
                                newDecisions.push({
                                  decision: currentTask,
                                  confidence: 0.80, // Default confidence for swapped item
                                  action: currentAction
                                });
                              }
                              
                              setStandup({
                                ...standup,
                                one_thing: decision.decision,
                                subtitle: decision.action || `Next action: ${decision.decision}`,
                                action: decision.action,
                                decisions: newDecisions
                              });
                              
                              // Reset status when switching tasks
                              setOneThingStatus('preparing');
                              setExpandedOneThingDetails(false);
                            }}
                            className="w-full text-left bg-white rounded-lg p-2.5 md:p-3 lg:p-4 hover:bg-blue-50 hover:border-blue-300 border-2 border-gray-200 transition-all group"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm md:text-base text-gray-800 font-medium group-hover:text-blue-900">
                                  {decision.decision}
                                </p>
                                {decision.action && (
                                  <p className="text-xs md:text-sm text-gray-500 mt-1">
                                    {decision.action}
                                  </p>
                                )}
                              </div>
                              <span className="text-gray-400 group-hover:text-blue-600 flex-shrink-0">→</span>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p className="text-sm">No additional priorities identified</p>
                          <p className="text-xs mt-1">Focus on "The One Thing" above</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT PANEL: AIMY'S WORK */}
                <div className="space-y-4 md:space-y-6">
                  {/* Aimy Avatar Header */}
                  <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden ring-2 md:ring-4 ring-okaimy-mint-200 bg-white shadow-glow flex-shrink-0">
                      <img 
                        src="/okaimy-pfp-01.png" 
                        alt="Aimy" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div class="w-full h-full bg-okaimy-gradient flex items-center justify-center text-white text-2xl font-bold">A</div>';
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg md:text-xl font-bold text-gray-800">Aimy's Work Today</h3>
                      <p className="text-xs md:text-sm text-gray-600">Your AI Partner</p>
                    </div>
                  </div>

                  {/* Daily Summary */}
                  <Card variant="gradient" padding="md" className="shadow-lg border-2 border-okaimy-mint-300">
                    <div className="flex items-center gap-2 mb-3 md:mb-4">
                      <Icon name="check" size="md" className="text-primary flex-shrink-0" />
                      <h4 className="text-base md:text-lg font-bold text-okaimy-mint-900">Daily Summary</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-2 md:gap-3 mb-3 md:mb-4">
                      <div className="bg-white/60 rounded-lg p-2 md:p-3 text-center">
                        <div className="text-xl md:text-2xl font-bold text-primary">
                          {standup?.summary?.total_emails || 0}
                        </div>
                        <div className="text-xs text-okaimy-mint-600">Monitored</div>
                      </div>
                      <div className="bg-white/60 rounded-lg p-2 md:p-3 text-center">
                        <div className="text-xl md:text-2xl font-bold text-orange-600">
                          {standup?.summary?.urgent_items || 0}
                        </div>
                        <div className="text-xs text-orange-600">Urgent</div>
                      </div>
                    </div>
                    <div className="text-xs md:text-sm text-okaimy-mint-800 space-y-1.5 md:space-y-2">
                      {standup?.daily_plan && standup.daily_plan.length > 0 ? (
                        standup.daily_plan.map((item, idx) => (
                          <p key={idx} className="flex items-start gap-2">
                            <Icon name="check" size="sm" className="text-primary mt-0.5" />
                            <span><strong>{item.time}:</strong> {item.task} ({item.duration})</span>
                          </p>
                        ))
                      ) : (
                        <>
                          <p className="flex items-start gap-2">
                            <Icon name="check" size="sm" className="text-primary mt-0.5" />
                            <span>Monitoring your inbox for urgent items</span>
                          </p>
                          <p className="flex items-start gap-2">
                            <Icon name="check" size="sm" className="text-primary mt-0.5" />
                            <span>Calendar is organized for today</span>
                          </p>
                          <p className="flex items-start gap-2">
                            <Icon name="check" size="sm" className="text-primary mt-0.5" />
                            <span>Ready to assist with email responses</span>
                          </p>
                        </>
                      )}
                    </div>
                  </Card>

                  {/* Things Aimy is Working On */}
                  <Card variant="bordered" padding="none" className="overflow-hidden">
                    <div className="bg-okaimy-gradient px-3 md:px-4 lg:px-6 py-3 md:py-4 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-white min-w-0">
                        <Icon name="check" size="sm" className="brightness-0 invert flex-shrink-0" />
                        <h4 className="font-bold text-sm md:text-base truncate">Things I'm Working On</h4>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={loadStandup}
                        disabled={loadingStandup}
                        className="bg-white/20 hover:bg-white/30 text-white border-0 text-xs md:text-sm flex-shrink-0"
                      >
                        {loadingStandup ? '⏳' : '🔄'}
                      </Button>
                    </div>
                    
                    <div className="p-3 md:p-4 lg:p-6 space-y-3 md:space-y-4">
                      {standup?.autonomous_tasks && standup.autonomous_tasks.length > 0 ? (
                        standup.autonomous_tasks.map((task, idx) => {
                          // Parse task if it's a string with status in parentheses
                          const taskText = typeof task === 'string' ? task : task.task || 'Unknown task';
                          const taskStatus = typeof task === 'string' 
                            ? (task.includes('monitoring') ? 'monitoring' : task.includes('drafting') ? 'drafting' : 'ready')
                            : (task.status || 'ready');
                          
                          return (
                            <div key={idx} className="bg-gray-50 rounded-lg p-2.5 md:p-3 lg:p-4 border border-gray-200">
                              <div className="flex items-start justify-between mb-2 md:mb-3 gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm md:text-base text-gray-800 font-medium mb-1">{taskText}</p>
                                  <span className={`inline-block text-xs px-2 py-0.5 md:py-1 rounded ${
                                    taskStatus === 'monitoring' ? 'text-primary bg-okaimy-mint-50' :
                                    taskStatus === 'drafting' ? 'text-purple-600 bg-purple-50' :
                                    'text-accent bg-okaimy-emerald-50'
                                  }`}>
                                    {taskStatus === 'monitoring' ? '👀 Monitoring' :
                                     taskStatus === 'drafting' ? '✍️ Drafting' :
                                     '✅ Ready to execute'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-1.5 md:gap-2">
                                <Button size="sm" variant="primary" className="flex-1 text-xs md:text-sm py-1.5 md:py-2">
                                  ✅ Go
                                </Button>
                                <Button size="sm" variant="secondary" className="flex-1 text-xs md:text-sm py-1.5 md:py-2">
                                  👀 Check
                                </Button>
                                <Button size="sm" variant="danger" className="flex-1 text-xs md:text-sm py-1.5 md:py-2">
                                  ❌ Skip
                                </Button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p className="text-sm">All caught up! 🎉</p>
                          <p className="text-xs mt-1">I'll notify you if something comes up</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>

              {/* Chat with Aimy - Full Width */}
              <div className="border-t-2 border-okaimy-mint-100 pt-8">
                <Card variant="gradient" padding="lg" className="border-2 border-okaimy-mint-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-white shadow-glow">
                      <img 
                        src="/okaimy-pfp-01.png" 
                        alt="Aimy" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div class="w-full h-full bg-okaimy-gradient flex items-center justify-center text-white text-sm font-bold">A</div>';
                        }}
                      />
                    </div>
                    <Icon name="chat" size="lg" className="text-primary" />
                    <h4 className="text-lg font-bold text-gray-800">Chat with Aimy</h4>
                    <span className="text-xs text-gray-500 ml-auto">Ask about your day, clarify tasks, or get advice</span>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Chat messages would go here */}
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-okaimy-mint-100">
                      <p className="text-sm text-gray-600 italic flex items-start gap-2">
                        <Icon name="star" size="sm" className="text-primary mt-0.5" />
                        <span>Quick tip: You can ask me to explain any task, suggest alternatives, or help prioritize your day.</span>
                      </p>
                    </div>
                    
                    {/* Chat Input */}
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Ask Aimy anything about your day..."
                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                      />
                      <Button variant="primary">
                        Send
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Projects + Calendar Grid (2 columns instead of 3) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Active Projects */}
          <section className="lg:col-span-1">
            <Card variant="elevated" padding="none" className="h-full">
              <div className="p-4 md:p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Icon name="note" size="lg" className="text-primary" />
                    Active Projects
                  </h3>
                  <button
                    onClick={() => window.location.href = '/projects'}
                    className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                  >
                    View All →
                  </button>
                </div>
              </div>
              <div className="p-4 md:p-6 space-y-3 max-h-96 overflow-y-auto">
                {projects.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-3">No projects yet</p>
                    <button
                      onClick={() => window.location.href = '/projects'}
                      className="text-teal-600 hover:text-teal-700 font-medium"
                    >
                      Create your first project
                    </button>
                  </div>
                ) : (
                  projects
                    .filter(p => p.status !== 'completed')
                    .slice(0, 5)
                    .map(project => (
                      <div
                        key={project.id}
                        onClick={() => window.location.href = '/projects'}
                        className="p-3 md:p-4 rounded-lg border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white hover:border-okaimy-mint-300 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: project.color || '#14b8a6' }}
                            ></div>
                            <h4 className="font-semibold text-gray-900 text-sm md:text-base">{project.name}</h4>
                          </div>
                          {project.is_primary && (
                            <span className="text-xs bg-okaimy-mint-100 text-okaimy-mint-800 px-2 py-1 rounded-full flex items-center gap-1 flex-shrink-0">
                              <Icon name="star" size="sm" className="text-primary" />
                              Primary
                            </span>
                          )}
                        </div>
                        {project.description && (
                          <p className="text-xs md:text-sm text-gray-600 line-clamp-2 ml-5">{project.description}</p>
                        )}
                        {project.goals && project.goals.length > 0 && (
                          <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-gray-200 ml-5">
                            <p className="text-xs text-gray-500 flex items-center gap-2">
                              <Icon name="target" size="sm" className="text-primary" />
                              {project.goals.length} goal{project.goals.length !== 1 ? 's' : ''} 
                              {project.goals.some(g => g.sub_tasks?.length > 0) && (
                                <span className="ml-2">
                                  • {project.goals.reduce((sum, g) => sum + (g.sub_tasks?.length || 0), 0)} sub-tasks
                                </span>
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>
            </Card>
          </section>

          {/* Calendar Events */}
          <section className="lg:col-span-1">
            <Card variant="elevated" padding="none" className="h-full">
              <div className="p-4 md:p-6 border-b border-gray-200">
                <h3 className="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Icon name="calendar" size="lg" className="text-primary" />
                  Upcoming Events
                </h3>
                <p className="text-sm text-gray-500 mt-1">Next 7 days</p>
              </div>
              <div className="p-4 md:p-6 space-y-3 max-h-96 overflow-y-auto">
                {calendarEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No upcoming events</p>
                  </div>
                ) : (
                  calendarEvents.slice(0, 10).map((event, idx) => (
                    <div key={idx} className="p-3 md:p-4 bg-okaimy-mint-50 rounded-lg border border-okaimy-mint-200">
                      <div className="flex items-start gap-3">
                        <div className="text-xl md:text-2xl flex-shrink-0">📆</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm md:text-base">{event.summary || 'Untitled Event'}</h4>
                          <p className="text-xs md:text-sm text-gray-600 mt-1">
                            {new Date(event.start).toLocaleDateString()} at{' '}
                            {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {event.location && (
                            <p className="text-xs text-gray-500 mt-1 truncate">📍 {event.location}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </section>
        </div>

        {/* Smart Messages - Full Width */}
        <section className="mb-6 md:mb-8">
          <EnhancedMessages user={user} />
        </section>

        {/* Universal Calendar */}
        <section className="mb-6 md:mb-8">
          <UniversalCalendar 
            projects={projects}
            calendarEvents={calendarEvents}
            user={user}
            onOpenProject={(project) => window.location.href = '/projects'}
          />
        </section>

        {/* Quick Actions */}
        <section className="mb-6 md:mb-8">
          <Card variant="elevated" padding="lg">
            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Icon name="star" size="lg" className="text-primary" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              <button className="p-3 md:p-4 aspect-square md:aspect-auto bg-gradient-to-br from-okaimy-mint-50 to-okaimy-emerald-50 rounded-lg border-2 border-okaimy-mint-200 hover:border-okaimy-mint-400 hover:shadow-glow transition-all text-left flex flex-col justify-center">
                <div className="mb-1 md:mb-2">
                  <Icon name="Mail" size="xl" className="text-primary" />
                </div>
                <div className="font-semibold text-gray-900 text-sm md:text-base">Compose Email</div>
                <div className="text-xs text-gray-600 mt-0.5 md:mt-1">Draft with AI</div>
              </button>
              <button className="p-3 md:p-4 aspect-square md:aspect-auto bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200 hover:border-purple-400 hover:shadow-md transition-all text-left flex flex-col justify-center">
                <div className="mb-1 md:mb-2">
                  <Icon name="calendar" size="xl" className="text-purple-500" />
                </div>
                <div className="font-semibold text-gray-900 text-sm md:text-base">Schedule Meeting</div>
                <div className="text-xs text-gray-600 mt-0.5 md:mt-1">Find best time</div>
              </button>
              <button className="p-3 md:p-4 aspect-square md:aspect-auto bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg border-2 border-orange-200 hover:border-orange-400 hover:shadow-md transition-all text-left flex flex-col justify-center">
                <div className="mb-1 md:mb-2">
                  <Icon name="check" size="xl" className="text-orange-500" />
                </div>
                <div className="font-semibold text-gray-900 text-sm md:text-base">View Insights</div>
                <div className="text-xs text-gray-600 mt-0.5 md:mt-1">Analytics & trends</div>
              </button>
              <button 
                onClick={() => setShowProfileSettings(true)}
                className="p-3 md:p-4 aspect-square md:aspect-auto bg-gradient-to-br from-okaimy-emerald-50 to-okaimy-mint-50 rounded-lg border-2 border-okaimy-emerald-200 hover:border-okaimy-emerald-400 hover:shadow-glow transition-all text-left flex flex-col justify-center"
              >
                <div className="text-xl md:text-2xl mb-1 md:mb-2">⚙️</div>
                <div className="font-semibold text-gray-900 text-sm md:text-base">Settings</div>
                <div className="text-xs text-gray-600 mt-0.5 md:mt-1">Manage account</div>
              </button>
            </div>
          </Card>
        </section>
      </div>

      {/* Profile Settings Modal */}
      {showProfileSettings && (
        <ProfileSettings
          user={currentUser}
          onClose={() => setShowProfileSettings(false)}
          onProfileUpdate={handleProfileUpdate}
          onSave={() => setShowProfileSettings(false)}
        />
      )}

      {/* Profile Hub Modal */}
      {showProfileHub && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-6xl h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Profile Hub</h2>
              <button
                onClick={() => setShowProfileHub(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ProfileHub userEmail={currentUser.email} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainDashboard;
