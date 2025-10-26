import { useState, useEffect } from 'react';
import AddProjectModal from './AddProjectModal';
import ProfileSettings from './ProfileSettings';
import ProjectDetailsModal from './ProjectDetailsModal';
import UniversalCalendar from './UniversalCalendar';
import EnhancedMessages from './EnhancedMessages';

function MainDashboard({ user, onLogout }) {
  const [loading, setLoading] = useState(true);
  const [loadingStandup, setLoadingStandup] = useState(false);
  const [projects, setProjects] = useState([]);
  const [standup, setStandup] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [showAddProject, setShowAddProject] = useState(false);
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, [user.email]);

  useEffect(() => {
    // Update currentUser when user prop changes
    setCurrentUser(user);
  }, [user]);

  const handleProfileUpdate = (updatedData) => {
    // Update the current user state with new data
    const updatedUser = { ...currentUser, ...updatedData };
    setCurrentUser(updatedUser);
    
    // Also update localStorage
    localStorage.setItem('okaimy_user', JSON.stringify(updatedUser));
  };

  const handleProjectUpdate = (updatedProject) => {
    // Update the project in the list
    setProjects(projects.map(p => 
      p.id === updatedProject.id ? updatedProject : p
    ));
    setSelectedProject(null);
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

  const loadStandup = async () => {
    setLoadingStandup(true);
    try {
      console.log('🔄 Refreshing standup...');
      const apiUrl = import.meta.env.VITE_API_URL || 'https://floally-mvp-production.up.railway.app';
      
      // First, get messages and events
      const [messagesRes, eventsRes] = await Promise.all([
        fetch(`${apiUrl}/api/messages?user_email=${encodeURIComponent(user.email)}&max_results=50`),
        fetch(`${apiUrl}/api/calendar/events?days=1&user_email=${encodeURIComponent(user.email)}`)
      ]);
      
      const messagesData = await messagesRes.json();
      const eventsData = await eventsRes.json();
      
      // Build context for standup
      const context = {
        messages: messagesData.messages || [],
        events: eventsData.events || []
      };
      
      // Call the correct AI standup endpoint
      const response = await fetch(`${apiUrl}/api/ai/standup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context)
      });
      
      const data = await response.json();
      console.log('✅ Standup refreshed:', data);
      
      // For now, set a simple standup object with the text
      setStandup({
        one_thing: data.standup || "Focus on your most important task today",
        decisions: [],
        autonomous_tasks: []
      });
    } catch (error) {
      console.error('Failed to load standup:', error);
      setStandup({
        one_thing: "Unable to load standup. Please try again.",
        decisions: [],
        autonomous_tasks: []
      });
    } finally {
      setLoadingStandup(false);
    }
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

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'text-red-600 bg-red-50 border-red-200',
      high: 'text-orange-600 bg-orange-50 border-orange-200',
      medium: 'text-blue-600 bg-blue-50 border-blue-200',
      low: 'text-gray-600 bg-gray-50 border-gray-200'
    };
    return colors[priority] || colors.medium;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/okaimy-logo-01.png" alt="OkAimy" className="h-8" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {getGreeting()}, {user.display_name || user.email.split('@')[0]}! 👋
                </h1>
                <p className="text-sm text-gray-600">Here's what's happening today</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAddProject(true)}
                className="px-4 py-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
              >
                + New Project
              </button>
              
              {/* User Profile Section */}
              <div className="flex items-center gap-3 pl-4 border-l border-gray-300">
                <button
                  onClick={() => setShowProfileSettings(true)}
                  className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
                    {currentUser.avatar_url ? (
                      <img src={currentUser.avatar_url} alt={currentUser.display_name || 'User'} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-semibold text-lg">
                        {(currentUser.display_name || currentUser.email).charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-900">
                      {currentUser.display_name || currentUser.email.split('@')[0]}
                    </div>
                    <div className="text-xs text-gray-500">Settings</div>
                  </div>
                </button>
                
                <button
                  onClick={onLogout}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Daily Standup - Redesigned Split-Panel Layout */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 text-white flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">📊 Your Daily Standup</h2>
                <p className="text-teal-100">AI-powered partnership for your most productive day</p>
              </div>
              <button
                onClick={loadStandup}
                disabled={loadingStandup}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingStandup ? '⏳ Loading...' : '🔄 Refresh'}
              </button>
            </div>

            {/* Main Content - Split Panel */}
            <div className="bg-white p-8">
              <div className="grid lg:grid-cols-2 gap-8 mb-8">
                
                {/* LEFT PANEL: USER'S FOCUS */}
                <div className="space-y-6">
                  {/* User Avatar Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-blue-200 bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {currentUser?.avatar_url ? (
                        <img src={currentUser.avatar_url} alt={currentUser.display_name} className="w-full h-full object-cover" />
                      ) : (
                        currentUser?.display_name?.charAt(0).toUpperCase() || '👤'
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Your Focus Today</h3>
                      <p className="text-sm text-gray-600">{currentUser?.display_name || 'You'}</p>
                    </div>
                  </div>

                  {/* The One Thing */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 shadow-md border-2 border-blue-300">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">🎯</span>
                      <h4 className="text-lg font-bold text-blue-900">The One Thing</h4>
                    </div>
                    <p className="text-gray-800 text-lg mb-4">
                      {standup?.one_thing || "Focus on your most important task today"}
                    </p>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                        ✅ Confirm & Start
                      </button>
                      <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                        🔄
                      </button>
                    </div>
                  </div>

                  {/* Other Priorities */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-4">📋 Other Priorities</h4>
                    <div className="space-y-3">
                      {standup?.decisions && standup.decisions.length > 0 ? (
                        standup.decisions.map((decision, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setStandup({...standup, one_thing: decision.decision});
                            }}
                            className="w-full text-left bg-white rounded-lg p-4 hover:bg-blue-50 hover:border-blue-300 border-2 border-gray-200 transition-all group"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-gray-800 font-medium group-hover:text-blue-900">
                                  {decision.decision}
                                </p>
                                {decision.confidence && (
                                  <div className="mt-2 flex items-center gap-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                      <div
                                        className="bg-blue-600 rounded-full h-1.5 transition-all"
                                        style={{ width: `${decision.confidence * 100}%` }}
                                      />
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      {Math.round(decision.confidence * 100)}%
                                    </span>
                                  </div>
                                )}
                              </div>
                              <span className="text-gray-400 group-hover:text-blue-600 ml-3">→</span>
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
                <div className="space-y-6">
                  {/* Aimy Avatar Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-teal-200 bg-white shadow-lg">
                      <img 
                        src="/okaimy-pfp-01.png" 
                        alt="Aimy" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center text-white text-2xl font-bold">A</div>';
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Aimy's Work Today</h3>
                      <p className="text-sm text-gray-600">Your AI Partner</p>
                    </div>
                  </div>

                  {/* Daily Summary */}
                  <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-6 shadow-md border-2 border-teal-300">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">📈</span>
                      <h4 className="text-lg font-bold text-teal-900">Daily Summary</h4>
                    </div>
                    <div className="text-sm text-teal-800 space-y-2">
                      <p className="flex items-start gap-2">
                        <span className="text-teal-600">•</span>
                        <span>Monitoring your inbox for urgent items</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-teal-600">•</span>
                        <span>Calendar is organized for today</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="text-teal-600">•</span>
                        <span>Ready to assist with email responses</span>
                      </p>
                    </div>
                  </div>

                  {/* Things Aimy is Working On */}
                  <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-white">
                        <span className="text-xl">🔄</span>
                        <h4 className="font-bold">Things I'm Working On</h4>
                      </div>
                      <button
                        onClick={loadStandup}
                        disabled={loadingStandup}
                        className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition-colors text-white"
                      >
                        {loadingStandup ? '⏳' : '🔄 Regenerate'}
                      </button>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      {standup?.autonomous_tasks && standup.autonomous_tasks.length > 0 ? (
                        standup.autonomous_tasks.map((task, idx) => (
                          <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <p className="text-gray-800 font-medium mb-1">{task}</p>
                                <span className="text-xs text-teal-600 bg-teal-50 px-2 py-1 rounded">Ready to execute</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                                ✅ Go
                              </button>
                              <button className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                                👀 Let me check
                              </button>
                              <button className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                                ❌ Don't do this
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p className="text-sm">All caught up! 🎉</p>
                          <p className="text-xs mt-1">I'll notify you if something comes up</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat with Aimy - Full Width */}
              <div className="border-t-2 border-gray-200 pt-8">
                <div className="bg-gradient-to-br from-gray-50 to-teal-50 rounded-xl p-6 border-2 border-teal-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-white shadow">
                      <img 
                        src="/okaimy-pfp-01.png" 
                        alt="Aimy" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center text-white text-sm font-bold">A</div>';
                        }}
                      />
                    </div>
                    <h4 className="text-lg font-bold text-gray-800">💬 Chat with Aimy</h4>
                    <span className="text-xs text-gray-500 ml-auto">Ask about your day, clarify tasks, or get advice</span>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Chat messages would go here */}
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-gray-600 italic">
                        💡 Quick tip: You can ask me to explain any task, suggest alternatives, or help prioritize your day.
                      </p>
                    </div>
                    
                    {/* Chat Input */}
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Ask Aimy anything about your day..."
                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-teal-500 focus:outline-none"
                      />
                      <button className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors">
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Projects + Calendar Grid (2 columns instead of 3) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Active Projects */}
          <section className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">📁 Active Projects</h3>
                  <button
                    onClick={() => setShowAddProject(true)}
                    className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                  >
                    + Add
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
                {projects.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-3">No projects yet</p>
                    <button
                      onClick={() => setShowAddProject(true)}
                      className="text-teal-600 hover:text-teal-700 font-medium"
                    >
                      Create your first project
                    </button>
                  </div>
                ) : (
                  projects
                    .filter(p => p.status !== 'completed')
                    .map(project => (
                      <div
                        key={project.id}
                        onClick={() => setSelectedProject(project)}
                        className={`p-4 rounded-lg border-2 ${getPriorityColor(project.priority)} transition-all hover:shadow-md cursor-pointer`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold">{project.name}</h4>
                          {project.is_primary && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                              Primary
                            </span>
                          )}
                        </div>
                        {project.description && (
                          <p className="text-sm opacity-75 line-clamp-2">{project.description}</p>
                        )}
                        {project.goals && project.goals.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-current opacity-50">
                            <p className="text-xs">{project.goals.length} goals</p>
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>
            </div>
          </section>

          {/* Calendar Events */}
          <section className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-full">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">📅 Upcoming Events</h3>
                <p className="text-sm text-gray-500 mt-1">Next 7 days</p>
              </div>
              <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
                {calendarEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No upcoming events</p>
                  </div>
                ) : (
                  calendarEvents.slice(0, 10).map((event, idx) => (
                    <div key={idx} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">📆</div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{event.summary || 'Untitled Event'}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(event.start).toLocaleDateString()} at{' '}
                            {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          {event.location && (
                            <p className="text-xs text-gray-500 mt-1">📍 {event.location}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Smart Messages - Full Width */}
        <section className="mb-8">
          <EnhancedMessages user={user} />
        </section>

        {/* Universal Calendar */}
        <section className="mb-8">
          <UniversalCalendar 
            projects={projects}
            calendarEvents={calendarEvents}
            user={user}
            onOpenProject={(project) => setSelectedProject(project)}
            onProjectUpdate={handleProjectUpdate}
          />
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">⚡ Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="p-4 bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg border-2 border-teal-200 hover:border-teal-400 transition-all text-left">
                <div className="text-2xl mb-2">📧</div>
                <div className="font-semibold text-gray-900">Compose Email</div>
                <div className="text-xs text-gray-600 mt-1">Draft with AI</div>
              </button>
              <button className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200 hover:border-purple-400 transition-all text-left">
                <div className="text-2xl mb-2">📅</div>
                <div className="font-semibold text-gray-900">Schedule Meeting</div>
                <div className="text-xs text-gray-600 mt-1">Find best time</div>
              </button>
              <button className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg border-2 border-orange-200 hover:border-orange-400 transition-all text-left">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-semibold text-gray-900">View Insights</div>
                <div className="text-xs text-gray-600 mt-1">Analytics & trends</div>
              </button>
              <button 
                onClick={() => setShowProfileSettings(true)}
                className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 hover:border-green-400 transition-all text-left"
              >
                <div className="text-2xl mb-2">⚙️</div>
                <div className="font-semibold text-gray-900">Settings</div>
                <div className="text-xs text-gray-600 mt-1">Manage account</div>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Add Project Modal */}
      {showAddProject && (
        <AddProjectModal
          user={user}
          onClose={() => setShowAddProject(false)}
          onProjectAdded={(project) => {
            setProjects([project, ...projects]);
            setShowAddProject(false);
          }}
          isFirstProject={false}
        />
      )}

      {/* Profile Settings Modal */}
      {showProfileSettings && (
        <ProfileSettings
          user={currentUser}
          onClose={() => setShowProfileSettings(false)}
          onProfileUpdate={handleProfileUpdate}
          onSave={() => setShowProfileSettings(false)}
        />
      )}

      {/* Project Details Modal */}
      {selectedProject && (
        <ProjectDetailsModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onUpdate={handleProjectUpdate}
        />
      )}
    </div>
  );
}

export default MainDashboard;
