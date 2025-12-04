import { useState, useEffect } from 'react';
import OnboardingFlow from './OnboardingFlow';
import ProjectCreationModal from './ProjectCreationModal';
import ProfileSettings from './ProfileSettings';
import AddProjectModal from './AddProjectModal';

function UserDashboard({ user, onLogout }) {
  const [projects, setProjects] = useState([]);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(true);
  const [hasGmail, setHasGmail] = useState(false);
  const [hasCalendar, setHasCalendar] = useState(false);
  
  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  
  // First project prompt state
  const [showFirstProjectModal, setShowFirstProjectModal] = useState(false);
  
  // Profile settings state
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  
  // Project modal state
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectsLoading, setProjectsLoading] = useState(true);

  useEffect(() => {
    // Check Google services connection status
    const checkGoogleStatus = async () => {
      try {
        const response = await fetch(`/api/gmail/status?userId=${user.userId}`);
        const data = await response.json();
        setGoogleConnected(data.connected);
        setHasGmail(data.hasGmail);
        setHasCalendar(data.hasCalendar);
      } catch (error) {
        console.error('Failed to check Google services status:', error);
      } finally {
        setGoogleLoading(false);
      }
    };

    // Check if profile/onboarding is completed
    const checkProfile = async () => {
      try {
        const response = await fetch(`https://floally-mvp-production.up.railway.app/api/user/profile?user_email=${encodeURIComponent(user.email)}`);
        const data = await response.json();
        console.log('Profile check:', data);
        setProfileCompleted(data.onboarding_completed || false);
        if (!data.onboarding_completed) {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error('Failed to check profile:', error);
        // If API fails, don't show onboarding (assume completed)
        setProfileCompleted(true);
      } finally {
        setProfileLoading(false);
      }
    };

    // Load user's projects
    const loadProjects = async () => {
      try {
        const response = await fetch(`/api/projects?userId=${user.userId}`);
        const data = await response.json();
        setProjects(data.projects || []);
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setProjectsLoading(false);
      }
    };

    checkGoogleStatus();
    checkProfile();
    loadProjects();

    // Check for OAuth callback
    const params = new URLSearchParams(window.location.search);
    if (params.get('google') === 'connected' || params.get('gmail') === 'connected') {
      setGoogleConnected(true);
      window.history.replaceState({}, '', '/app');
    }
    if (params.get('error')) {
      alert(`Google connection error: ${params.get('error')}`);
      window.history.replaceState({}, '', '/app');
    }
  }, [user.userId]);

  const handleOnboardingComplete = async (profile) => {
    try {
      console.log('Saving onboarding data:', profile);
      const response = await fetch(`https://floally-mvp-production.up.railway.app/api/user/profile/onboarding?user_email=${encodeURIComponent(user.email)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Save failed:', errorData);
        throw new Error(`Failed to save onboarding: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Onboarding saved successfully:', data);
      
      setShowOnboarding(false);
      setProfileCompleted(true);
      
      // Show first project modal if user hasn't seen it yet
      const hasSeenProjectPrompt = localStorage.getItem('okaimy_project_prompt_shown');
      if (!hasSeenProjectPrompt && projects.length === 0) {
        setTimeout(() => setShowFirstProjectModal(true), 500); // Small delay for smooth transition
      }
    } catch (error) {
      console.error('Failed to save onboarding:', error);
      alert('Failed to save your profile. Please try again.');
    }
  };

  const handleConnectGoogle = () => {
    window.location.href = `/api/gmail/auth?userId=${user.userId}`;
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    setShowProjectModal(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowProjectModal(true);
  };

  const handleProjectCreated = (project) => {
    if (editingProject) {
      // Update existing project
      setProjects(projects.map(p => p.id === editingProject.id ? { ...editingProject, ...project } : p));
    } else {
      // Add new project
      setProjects([project, ...projects]);
    }
  };
  
  const handleFirstProjectAdded = (project) => {
    // Add project to list
    setProjects([project]);
    setShowFirstProjectModal(false);
    localStorage.setItem('okaimy_project_prompt_shown', 'true');
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const response = await fetch(`/api/projects?userId=${user.userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId })
      });

      if (response.ok) {
        setProjects(projects.filter(p => p.id !== projectId));
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  // Show onboarding if not completed
  if (showOnboarding && !profileLoading) {
    return <OnboardingFlow userEmail={user.email} onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/aimi-logo-01.png" alt="Hey Aimi" className="h-8" />
            <span className="text-sm text-gray-500">
              Your AI-Powered Productivity Assistant
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-700">
              👋 Welcome, <span className="font-medium">{user.display_name || user.email}</span>
            </div>
            <button
              onClick={() => setShowProfileSettings(true)}
              className="px-4 py-2 text-sm text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors flex items-center gap-2"
            >
              <span>⚙️</span>
              <span>Settings</span>
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Google Services Connection Banner */}
        {!googleLoading && !googleConnected && (
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">�</div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Connect Gmail & Calendar</h3>
                  <p className="text-blue-100">
                    Get started by connecting your Google account to enable smart email & calendar management
                  </p>
                </div>
              </div>
              <button
                onClick={handleConnectGoogle}
                className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all shadow-lg"
              >
                Connect Google
              </button>
            </div>
          </div>
        )}

        {googleConnected && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl">✅</div>
                <div>
                  <h3 className="text-lg font-semibold">Google Services Connected!</h3>
                  <div className="flex gap-4 mt-1">
                    {hasGmail && (
                      <span className="text-green-100 flex items-center gap-1">
                        📧 Gmail
                      </span>
                    )}
                    {hasCalendar && (
                      <span className="text-green-100 flex items-center gap-1">
                        📅 Calendar
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Projects Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">Your Projects</h3>
              <p className="text-sm text-gray-500 mt-1">
                Define projects so Aimi can organize your work and provide contextual assistance
              </p>
            </div>
            <button
              onClick={handleCreateProject}
              className="px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg hover:from-teal-700 hover:to-emerald-700 transition-all shadow-md font-semibold"
            >
              + New Project
            </button>
          </div>

          {projectsLoading ? (
            <div className="text-center py-12 text-gray-500">
              <div className="animate-spin text-4xl mb-3">⚙️</div>
              <p>Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚀</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Create your first project
              </h4>
              <p className="text-gray-700 mb-6 max-w-md mx-auto">
                Projects help Aimi understand your work and provide smarter assistance by
                categorizing emails, meetings, and tasks.
              </p>
              <button
                onClick={handleCreateProject}
                className="px-8 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg hover:from-teal-700 hover:to-emerald-700 transition-all shadow-md font-semibold"
              >
                Get Started →
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {projects.map(project => (
                <div
                  key={project.id}
                  className="border-2 border-gray-200 rounded-lg p-6 hover:border-teal-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-lg text-gray-900">{project.name}</h4>
                        {project.priority === 'critical' && <span className="text-red-500">🔴</span>}
                        {project.priority === 'high' && <span className="text-orange-500">🟠</span>}
                        {project.priority === 'medium' && <span className="text-yellow-500">🟡</span>}
                        {project.priority === 'low' && <span className="text-green-500">🟢</span>}
                      </div>
                      {project.description && (
                        <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                          {project.description}
                        </p>
                      )}
                      
                      {/* Timeline Display */}
                      {project.deadline && (() => {
                        const deadline = new Date(project.deadline);
                        const today = new Date();
                        const daysUntil = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
                        const monthsUntil = Math.floor(daysUntil / 30);
                        
                        let timelineText = '';
                        let timelineColor = '';
                        let timelineIcon = '';
                        
                        if (daysUntil < 0) {
                          timelineText = 'Overdue';
                          timelineColor = 'bg-red-100 text-red-800 border-red-200';
                          timelineIcon = '⚠️';
                        } else if (daysUntil === 0) {
                          timelineText = 'Due Today';
                          timelineColor = 'bg-red-100 text-red-800 border-red-200';
                          timelineIcon = '🎯';
                        } else if (daysUntil === 1) {
                          timelineText = 'Due Tomorrow';
                          timelineColor = 'bg-orange-100 text-orange-800 border-orange-200';
                          timelineIcon = '⏰';
                        } else if (daysUntil <= 7) {
                          timelineText = `${daysUntil} days`;
                          timelineColor = 'bg-orange-100 text-orange-800 border-orange-200';
                          timelineIcon = '⏰';
                        } else if (daysUntil <= 30) {
                          timelineText = `${daysUntil} days`;
                          timelineColor = 'bg-yellow-100 text-yellow-800 border-yellow-200';
                          timelineIcon = '📅';
                        } else if (monthsUntil < 12) {
                          timelineText = monthsUntil === 1 ? '1 month' : `${monthsUntil} months`;
                          timelineColor = 'bg-blue-100 text-blue-800 border-blue-200';
                          timelineIcon = '📅';
                        } else {
                          const years = Math.floor(monthsUntil / 12);
                          timelineText = years === 1 ? '1 year' : `${years} years`;
                          timelineColor = 'bg-gray-100 text-gray-800 border-gray-200';
                          timelineIcon = '📅';
                        }
                        
                        return (
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${timelineColor}`}>
                            <span>{timelineIcon}</span>
                            <span>{timelineText}</span>
                            <span className="text-gray-400">•</span>
                            <span className="font-normal">{deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        );
                      })()}
                      
                      {!project.deadline && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold bg-gray-50 text-gray-700 border-gray-200">
                          <span>⏳</span>
                          <span>Ongoing</span>
                        </div>
                      )}
                      
                      {/* Project Status */}
                      <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold bg-gray-50 text-gray-700 border-gray-200">
                        {project.status === 'planning' && '📝 Planning'}
                        {project.status === 'active' && '🚀 Active'}
                        {project.status === 'on-hold' && '⏸️ On Hold'}
                        {project.status === 'completed' && '✅ Completed'}
                        {project.status === 'archived' && '📦 Archived'}
                        {!project.status && '📝 Planning'}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {project.goals && project.goals.length > 0 && (() => {
                    // Check if goals have status property (new format)
                    const hasStatus = project.goals[0]?.status !== undefined;
                    let completionPercentage = 0;
                    let completedCount = 0;
                    
                    if (hasStatus) {
                      completedCount = project.goals.filter(g => g.status === 'completed').length;
                      completionPercentage = Math.round((completedCount / project.goals.length) * 100);
                    }
                    
                    return hasStatus ? (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs text-gray-700 mb-1">
                          <span>Progress</span>
                          <span className="font-semibold">{completionPercentage}% ({completedCount}/{project.goals.length} tasks)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-gradient-to-r from-teal-600 to-emerald-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${completionPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : null;
                  })()}

                  {project.goals && project.goals.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Goals</div>
                      <ul className="space-y-1">
                        {project.goals.slice(0, 2).map((goal, idx) => {
                          // Handle both old format (string) and new format (object with status)
                          const goalText = typeof goal === 'string' ? goal : goal.text;
                          const goalStatus = typeof goal === 'object' ? goal.status : null;
                          
                          return (
                            <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                              {goalStatus === 'completed' && <span>✅</span>}
                              {goalStatus === 'in-progress' && <span>🔵</span>}
                              {goalStatus === 'not-started' && <span>⭕</span>}
                              {!goalStatus && <span>•</span>}
                              <span className="line-clamp-1">{goalText}</span>
                            </li>
                          );
                        })}
                        {project.goals.length > 2 && (
                          <li className="text-xs text-gray-500">
                            +{project.goals.length - 2} more
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {project.keywords && project.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.keywords.slice(0, 3).map((keyword, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 bg-teal-50 text-teal-700 rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                      {project.keywords.length > 3 && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                          +{project.keywords.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t">
                    <button
                      onClick={() => handleEditProject(project)}
                      className="flex-1 px-4 py-2 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors font-medium"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="flex-1 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingFlow 
          userEmail={user.email} 
          onComplete={handleOnboardingComplete} 
        />
      )}

      {/* Profile Settings Modal */}
      {showProfileSettings && (
        <ProfileSettings
          user={user}
          onClose={() => setShowProfileSettings(false)}
        />
      )}

      {/* First Project Prompt Modal */}
      {showFirstProjectModal && (
        <AddProjectModal
          user={user}
          onClose={() => {
            setShowFirstProjectModal(false);
            localStorage.setItem('okaimy_project_prompt_shown', 'true');
          }}
          onProjectAdded={handleFirstProjectAdded}
          isFirstProject={true}
        />
      )}

      {/* Project Creation Modal */}
      {showProjectModal && (
        <ProjectCreationModal
          user={user}
          existingProject={editingProject}
          onClose={() => setShowProjectModal(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}
    </div>
  );
}

export default UserDashboard;
