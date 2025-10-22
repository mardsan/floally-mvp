import { useState, useEffect } from 'react';

function UserDashboard({ user, onLogout }) {
  const [projects, setProjects] = useState([]);
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailLoading, setGmailLoading] = useState(true);

  useEffect(() => {
    // Check Gmail connection status
    const checkGmailStatus = async () => {
      try {
        const response = await fetch(`/api/gmail/status?userId=${user.userId}`);
        const data = await response.json();
        setGmailConnected(data.connected);
      } catch (error) {
        console.error('Failed to check Gmail status:', error);
      } finally {
        setGmailLoading(false);
      }
    };

    checkGmailStatus();

    // Check for OAuth callback
    const params = new URLSearchParams(window.location.search);
    if (params.get('gmail') === 'connected') {
      setGmailConnected(true);
      window.history.replaceState({}, '', '/app');
    }
    if (params.get('error')) {
      alert(`Gmail connection error: ${params.get('error')}`);
      window.history.replaceState({}, '', '/app');
    }
  }, [user.userId]);

  const handleAddProject = () => {
    if (newProjectName.trim()) {
      setProjects([...projects, {
        id: Date.now(),
        name: newProjectName,
        createdAt: new Date().toISOString(),
        tasks: []
      }]);
      setNewProjectName('');
      setShowAddProject(false);
    }
  };

  const handleConnectGmail = () => {
    window.location.href = `/api/gmail/auth?userId=${user.userId}`;
  };

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
        {/* Gmail Connection Banner */}
        {!gmailLoading && !gmailConnected && (
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl">📧</div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Connect Your Gmail</h3>
                  <p className="text-blue-100">
                    Get started by connecting your Gmail account to enable smart email management
                  </p>
                </div>
              </div>
              <button
                onClick={handleConnectGmail}
                className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all shadow-lg"
              >
                Connect Gmail
              </button>
            </div>
          </div>
        )}

        {gmailConnected && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="text-3xl">✅</div>
              <div>
                <h3 className="text-lg font-semibold">Gmail Connected!</h3>
                <p className="text-green-100">Your email management features are now active</p>
              </div>
            </div>
          </div>
        )}

        {/* Coming Soon Banner */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8 text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Dashboard Coming Soon!
          </h2>
          <p className="text-gray-600 mb-6">
            We're building something amazing for you. Soon you'll be able to:
          </p>
          <div className="grid md:grid-cols-3 gap-6 text-left max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg p-6">
              <div className="text-3xl mb-3">📧</div>
              <h3 className="font-semibold text-gray-900 mb-2">Smart Email Management</h3>
              <p className="text-sm text-gray-600">
                Connect your Gmail and let Aimy prioritize what matters most
              </p>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg p-6">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold text-gray-900 mb-2">Daily Standup</h3>
              <p className="text-sm text-gray-600">
                Get "The One Thing" to focus on each day from AI analysis
              </p>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg p-6">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold text-gray-900 mb-2">Project Tracking</h3>
              <p className="text-sm text-gray-600">
                Organize work by projects and never miss a deadline
              </p>
            </div>
          </div>
        </div>

        {/* Simple Projects Demo */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Your Projects</h3>
              <p className="text-sm text-gray-500 mt-1">
                Demo: Create projects (stored locally for now)
              </p>
            </div>
            <button
              onClick={() => setShowAddProject(true)}
              className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg hover:from-teal-600 hover:to-emerald-600 transition-all shadow-md"
            >
              + New Project
            </button>
          </div>

          {showAddProject && (
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Project name..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleAddProject()}
                />
                <button
                  onClick={handleAddProject}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddProject(false);
                    setNewProjectName('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {projects.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-3">📁</div>
              <p>No projects yet. Create your first one!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {projects.map(project => (
                <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-gray-900 mb-2">{project.name}</h4>
                  <p className="text-xs text-gray-500">
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default UserDashboard;
