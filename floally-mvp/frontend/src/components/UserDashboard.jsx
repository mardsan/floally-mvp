import { useState, useEffect } from 'react';
import OnboardingFlow from './OnboardingFlow';
import ProjectCreationModal from './ProjectCreationModal';

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
        const response = await fetch(`/api/profile/onboarding?userId=${user.userId}`);
        const data = await response.json();
        setProfileCompleted(data.exists);
        if (!data.exists) {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error('Failed to check profile:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    // Load user's projects
    const loadProjects = async () => {
      try {
        const response = await fetch(`/api/projects/manage?userId=${user.userId}`);
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
    setShowOnboarding(false);
    setProfileCompleted(true);
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

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const response = await fetch(`/api/projects/manage?userId=${user.userId}`, {
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
            <img src="/okaimy-logo-01.png" alt="OkAimy" className="h-8" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              OkAimy
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              👋 Welcome, <span className="font-medium">{user.name}</span>
            </div>
            <button
              onClick={onLogout}
              className="px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg shadow-lg p-6 mb-8">
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
                Define projects so Aimy can organize your work and provide contextual assistance
              </p>
            </div>
            <button
              onClick={handleCreateProject}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg hover:from-teal-600 hover:to-emerald-600 transition-all shadow-md font-semibold"
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
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Projects help Aimy understand your work and provide smarter assistance by
                categorizing emails, meetings, and tasks.
              </p>
              <button
                onClick={handleCreateProject}
                className="px-8 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg hover:from-teal-600 hover:to-emerald-600 transition-all shadow-md font-semibold"
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
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {project.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {project.deadline && (
                    <div className="text-sm text-gray-600 mb-3">
                      📅 Due: {new Date(project.deadline).toLocaleDateString()}
                    </div>
                  )}

                  {project.goals && project.goals.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Goals</div>
                      <ul className="space-y-1">
                        {project.goals.slice(0, 2).map((goal, idx) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                            <span>•</span>
                            <span className="line-clamp-1">{goal}</span>
                          </li>
                        ))}
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
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
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
