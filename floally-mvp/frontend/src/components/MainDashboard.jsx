import { useState, useEffect } from 'react';
import AddProjectModal from './AddProjectModal';
import ProfileSettings from './ProfileSettings';
import ProjectDetailsModal from './ProjectDetailsModal';
import UniversalCalendar from './UniversalCalendar';

function MainDashboard({ user, onLogout }) {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [standup, setStandup] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [messages, setMessages] = useState([]);
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
        loadCalendarEvents(),
        loadMessages()
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
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://floally-mvp-production.up.railway.app';
      const response = await fetch(`${apiUrl}/api/standup/generate?user_email=${encodeURIComponent(user.email)}`);
      const data = await response.json();
      setStandup(data);
    } catch (error) {
      console.error('Failed to load standup:', error);
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

  const loadMessages = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://floally-mvp-production.up.railway.app';
      const response = await fetch(`${apiUrl}/api/gmail/messages?max_results=20&user_email=${encodeURIComponent(user.email)}`);
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([]);
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
        {/* Daily Standup - Hero Section */}
        <section className="mb-8">
          <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl shadow-xl p-8 text-white">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">📊 Your Daily Standup</h2>
                <p className="text-teal-100">AI-powered insights based on your goals and activities</p>
              </div>
              <button
                onClick={loadStandup}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors backdrop-blur-sm"
              >
                🔄 Refresh
              </button>
            </div>

            {standup ? (
              <div className="space-y-6">
                {/* The One Thing */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    🎯 The One Thing
                  </h3>
                  <p className="text-lg text-teal-50">
                    {standup.one_thing || "Focus on your most important task today"}
                  </p>
                </div>

                {/* Key Decisions */}
                {standup.decisions && standup.decisions.length > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      💡 Key Decisions
                    </h3>
                    <div className="space-y-3">
                      {standup.decisions.map((decision, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="flex-1">
                            <p className="text-teal-50">{decision.decision}</p>
                            {decision.confidence && (
                              <div className="mt-2 flex items-center gap-2">
                                <div className="flex-1 bg-white/20 rounded-full h-2">
                                  <div
                                    className="bg-white rounded-full h-2 transition-all"
                                    style={{ width: `${decision.confidence * 100}%` }}
                                  />
                                </div>
                                <span className="text-xs text-teal-100">
                                  {Math.round(decision.confidence * 100)}% confident
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Autonomous Tasks */}
                {standup.autonomous_tasks && standup.autonomous_tasks.length > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      ✅ Handled for You
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {standup.autonomous_tasks.map((task, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-teal-50">
                          <span className="text-green-300">✓</span>
                          <span>{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-teal-100 mb-4">Generate your first standup to get started</p>
                <button
                  onClick={loadStandup}
                  className="px-6 py-3 bg-white text-teal-600 rounded-lg font-semibold hover:bg-teal-50 transition-colors"
                >
                  Generate Daily Standup
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Projects + Calendar + Messages Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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
                    .filter(p => p.status === 'active')
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

          {/* Messages Summary */}
          <section className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-full">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">✉️ Recent Messages</h3>
                <p className="text-sm text-gray-500 mt-1">Prioritized by Aimy</p>
              </div>
              <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No messages</p>
                  </div>
                ) : (
                  messages.slice(0, 10).map((msg, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-sm font-semibold text-teal-700">
                          {msg.from?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 truncate">{msg.from || 'Unknown Sender'}</h4>
                            {msg.is_important && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full flex-shrink-0">
                                Important
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 font-medium truncate">{msg.subject || 'No subject'}</p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{msg.snippet || ''}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Universal Calendar */}
        <section className="mb-8">
          <UniversalCalendar 
            projects={projects}
            calendarEvents={calendarEvents}
            user={user}
            onOpenProject={(project) => setSelectedProject(project)}
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
