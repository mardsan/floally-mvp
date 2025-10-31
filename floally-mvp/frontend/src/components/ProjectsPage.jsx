import React, { useState, useEffect } from 'react';

export default function ProjectsPage({ user, onLogout }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    priority: 'medium',
    color: '#3b82f6',
    goals: []
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://floally-mvp-production.up.railway.app';
      const response = await fetch(`${apiUrl}/api/projects?user_email=${encodeURIComponent(user.email)}`);
      
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
      status: 'active',
      priority: 'medium',
      color: '#3b82f6',
      goals: []
    });
    setShowModal(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      status: project.status,
      priority: project.priority,
      color: project.color || '#3b82f6',
      goals: project.goals || []
    });
    setShowModal(true);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://floally-mvp-production.up.railway.app';
      const url = editingProject 
        ? `${apiUrl}/api/projects/${editingProject.id}`
        : `${apiUrl}/api/projects`;
      
      const method = editingProject ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_email: user.email,
          ...formData
        })
      });

      if (response.ok) {
        await loadProjects();
        setShowModal(false);
      }
    } catch (error) {
      console.error('Failed to save project:', error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://floally-mvp-production.up.railway.app';
      const response = await fetch(`${apiUrl}/api/projects/${projectId}?user_email=${encodeURIComponent(user.email)}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadProjects();
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (project.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'bg-red-100 text-red-700 border-red-300',
      high: 'bg-orange-100 text-orange-700 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      low: 'bg-green-100 text-green-700 border-green-300'
    };
    return colors[priority] || colors.medium;
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { label: 'Active', color: 'bg-green-100 text-green-700' },
      on_hold: { label: 'On Hold', color: 'bg-yellow-100 text-yellow-700' },
      completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700' },
      archived: { label: 'Archived', color: 'bg-gray-100 text-gray-700' }
    };
    return badges[status] || badges.active;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-gray-600">Loading projects...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">📁 Projects</h1>
              <p className="text-teal-100 mt-1">Manage your projects and goals</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                ← Back to Dashboard
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Filters and Actions */}
            <div className="flex items-center gap-4">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>

              {/* View Mode */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  List
                </button>
              </div>

              {/* Create Button */}
              <button
                onClick={handleCreateProject}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                + New Project
              </button>
            </div>
          </div>
        </div>

        {/* Projects Display */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📂</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {searchQuery || statusFilter !== 'all' ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Create your first project to get started'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <button
                onClick={handleCreateProject}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                + Create First Project
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }>
            {filteredProjects.map(project => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow-sm border-2 border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Color Bar */}
                <div 
                  className="h-2"
                  style={{ backgroundColor: project.color }}
                />

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {project.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(project.status).color}`}>
                          {getStatusBadge(project.status).label}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(project.priority)}`}>
                          {project.priority}
                        </span>
                        {project.is_primary && (
                          <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-300">
                            ⭐ Primary
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {project.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  {/* Goals */}
                  {project.goals && project.goals.length > 0 && (
                    <div className="mb-4">
                      <div className="text-xs font-semibold text-gray-500 mb-2">
                        Goals ({project.goals.length})
                      </div>
                      <div className="space-y-1">
                        {project.goals.slice(0, 2).map((goal, idx) => (
                          <div key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                            <span className="text-gray-400">•</span>
                            <span className="line-clamp-1">{goal.goal || goal}</span>
                          </div>
                        ))}
                        {project.goals.length > 2 && (
                          <div className="text-xs text-gray-400">
                            +{project.goals.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleEditProject(project)}
                      className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingProject ? 'Edit Project' : 'Create New Project'}
              </h2>

              <form onSubmit={handleSaveProject} className="space-y-4">
                {/* Project Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="e.g., Website Redesign"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="What is this project about?"
                  />
                </div>

                {/* Status and Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="on_hold">On Hold</option>
                      <option value="completed">Completed</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Color
                  </label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    className="w-20 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    {editingProject ? 'Save Changes' : 'Create Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
