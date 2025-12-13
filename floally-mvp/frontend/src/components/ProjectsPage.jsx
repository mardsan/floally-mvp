import React, { useState, useEffect } from 'react';
import AimyWizard from './AimyWizard';
import { useActivityLogger, EVENT_TYPES, ENTITY_TYPES, ACTIONS } from '../hooks/useActivityLogger';

// Sub-component for displaying goals with expandable sub-tasks
function GoalWithSubTasks({ goal, goalIndex, onToggleSubTask }) {
  const [expanded, setExpanded] = useState(false);
  const hasSubTasks = goal.sub_tasks && goal.sub_tasks.length > 0;
  
  // Calculate completion percentage
  const completedCount = hasSubTasks 
    ? goal.sub_tasks.filter(st => st.status === 'completed').length 
    : 0;
  const totalCount = hasSubTasks ? goal.sub_tasks.length : 0;
  const completionPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  
  return (
    <div className="bg-white border border-teal-300 rounded-lg p-3">
      {/* Goal Header */}
      <div className="flex items-start gap-2">
        <span className="text-teal-600 mt-0.5 text-lg">🎯</span>
        <div className="flex-1">
          <div className="font-medium text-gray-900">{goal.goal}</div>
          <div className="flex items-center gap-3 mt-1">
            {goal.deadline && (
              <div className="text-xs text-gray-700">📅 {goal.deadline}</div>
            )}
            {hasSubTasks && (
              <div className="text-xs text-gray-500">
                {completedCount}/{totalCount} tasks completed ({completionPercent}%)
              </div>
            )}
          </div>
        </div>
        {hasSubTasks && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-teal-600 hover:text-teal-700 text-sm font-medium"
          >
            {expanded ? '▼' : '▶'}
          </button>
        )}
      </div>
      
      {/* Sub-tasks (expandable) */}
      {expanded && hasSubTasks && (
        <div className="mt-3 pl-7 space-y-2">
          {goal.sub_tasks.map((subTask, subIdx) => (
            <div 
              key={subIdx} 
              className="flex items-start gap-2 group hover:bg-teal-50 rounded p-2 -ml-2 cursor-pointer transition-colors"
              onClick={() => onToggleSubTask(subIdx)}
            >
              <input 
                type="checkbox"
                checked={subTask.status === 'completed'}
                onChange={() => {}} // Handled by parent onClick
                className="mt-0.5 cursor-pointer"
              />
              <div className="flex-1">
                <div className={`text-sm ${subTask.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                  {subTask.task}
                </div>
                {subTask.estimated_hours && (
                  <div className="text-xs text-gray-400 mt-0.5">
                    ⏱️ {subTask.estimated_hours}h estimated
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Quick expand hint */}
      {!expanded && hasSubTasks && (
        <div 
          onClick={() => setExpanded(true)}
          className="text-xs text-teal-600 mt-2 pl-7 cursor-pointer hover:text-teal-700"
        >
          Click to see {totalCount} sub-tasks →
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage({ user, onLogout, onBack }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState('input'); // 'input' or 'generating'
  const [projectDescription, setProjectDescription] = useState('');
  const [editingProject, setEditingProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Activity logging
  const { logActivity } = useActivityLogger(user?.email);

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

  // Check for URL parameter to auto-open a specific project
  useEffect(() => {
    if (projects.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const projectIdToOpen = urlParams.get('open');
      
      if (projectIdToOpen) {
        const project = projects.find(p => p.id === projectIdToOpen);
        if (project) {
          handleEditProject(project);
          // Clear the URL parameter
          window.history.replaceState({}, '', '/projects');
        }
      }
    }
  }, [projects]);

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
    setProjectDescription('');
    setFormData({
      name: '',
      description: '',
      status: 'active',
      priority: 'medium',
      color: '#3b82f6',
      goals: []
    });
    setWizardStep('input'); // Start at input step
    setShowWizard(true); // Show wizard for AI-powered planning
  };

  const handleWizardGenerated = (generatedData) => {
    // Use AI-generated data to pre-fill the form
    setFormData({
      name: projectDescription.trim(), // Use original description as name
      description: generatedData.enhanced_description || '',
      status: 'active',
      priority: generatedData.recommended_priority || 'medium',
      color: '#3b82f6',
      goals: generatedData.goals || []
    });
    
    // Close wizard and open modal - using setTimeout to ensure state updates complete
    setTimeout(() => {
      setShowWizard(false);
      setShowModal(true);
    }, 0);
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
        ? `${apiUrl}/api/projects/${editingProject.id}?user_email=${encodeURIComponent(user.email)}`
        : `${apiUrl}/api/projects?user_email=${encodeURIComponent(user.email)}`;
      
      const method = editingProject ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const savedProject = await response.json();
        
        // Log activity
        logActivity(
          editingProject ? EVENT_TYPES.PROJECT_UPDATED : EVENT_TYPES.PROJECT_CREATED,
          ENTITY_TYPES.PROJECT,
          savedProject.id,
          { name: formData.name, priority: formData.priority, goals_count: formData.goals?.length || 0 },
          editingProject ? ACTIONS.UPDATED : ACTIONS.CREATED
        );
        
        await loadProjects();
        setShowModal(false);
        setEditingProject(null);
        setFormData({
          name: '',
          description: '',
          status: 'active',
          priority: 'medium',
          color: '#3b82f6',
          goals: []
        });
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
          <div className="text-gray-700">Loading projects...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold truncate">📁 Projects</h1>
              <p className="text-teal-100 mt-1 text-xs sm:text-sm md:text-base">Manage your projects and goals</p>
            </div>
            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
              <button
                onClick={onBack}
                className="px-3 md:px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm md:text-base whitespace-nowrap"
              >
                <span className="hidden sm:inline">← Back to Dashboard</span>
                <span className="sm:hidden">← Back</span>
              </button>
              <button
                onClick={onLogout}
                className="px-3 md:px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm md:text-base"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Toolbar */}
        <div className="bg-white rounded-lg shadow-sm p-3 md:p-4 mb-4 md:mb-6">
          <div className="flex flex-col gap-3 md:gap-4">
            {/* Search - Full Width on Mobile */}
            <div className="w-full md:max-w-md">
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm md:text-base"
              />
            </div>

            {/* Filters and Actions Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-4">
              {/* Status Filter */}
              <label htmlFor="projects-status-filter" className="sr-only">Filter projects by status</label>
              <select
                id="projects-status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm md:text-base"
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
                  className={`flex-1 sm:flex-initial px-3 py-2 text-sm md:text-base ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 sm:flex-initial px-3 py-2 text-sm md:text-base ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  List
                </button>
              </div>

              {/* Create Button */}
              <button
                onClick={handleCreateProject}
                className="px-4 md:px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm md:text-base"
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
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'
            : 'space-y-3 md:space-y-4'
          }>
            {filteredProjects.map(project => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow-sm border-2 border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Color Bar */}
                <div 
                  className="h-1.5 md:h-2"
                  style={{ backgroundColor: project.color }}
                />

                <div className="p-4 md:p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 truncate">
                        {project.name}
                      </h3>
                      <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 md:py-1 rounded-full ${getStatusBadge(project.status).color} whitespace-nowrap`}>
                          {getStatusBadge(project.status).label}
                        </span>
                        <span className={`text-xs px-2 py-0.5 md:py-1 rounded-full border ${getPriorityColor(project.priority)} whitespace-nowrap`}>
                          {project.priority}
                        </span>
                        {project.is_primary && (
                          <span className="text-xs px-2 py-0.5 md:py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-300 whitespace-nowrap">
                            ⭐ Primary
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {project.description && (
                    <p className="text-xs md:text-sm text-gray-700 mb-3 md:mb-4 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  {/* Goals with Progress */}
                  {project.goals && project.goals.length > 0 && (
                    <div className="mb-3 md:mb-4">
                      <div className="text-xs font-semibold text-gray-500 mb-2">
                        Goals ({project.goals.length})
                      </div>
                      <div className="space-y-1.5 md:space-y-2">
                        {project.goals.slice(0, 2).map((goal, idx) => {
                          const hasSubTasks = goal.sub_tasks && goal.sub_tasks.length > 0;
                          const completedCount = hasSubTasks 
                            ? goal.sub_tasks.filter(st => st.status === 'completed').length 
                            : 0;
                          const totalCount = hasSubTasks ? goal.sub_tasks.length : 0;
                          
                          return (
                            <div key={idx} className="text-xs">
                              <div className="text-gray-700 font-medium flex items-start gap-1">
                                <span className="text-gray-400 flex-shrink-0">•</span>
                                <span className="line-clamp-1 flex-1">{goal.goal || goal}</span>
                              </div>
                              {hasSubTasks && (
                                <div className="text-gray-500 text-xs ml-3 mt-1">
                                  {completedCount}/{totalCount} sub-tasks completed
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {project.goals.length > 2 && (
                          <div className="text-xs text-gray-400 ml-3">
                            +{project.goals.length - 2} more goals
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 md:pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleEditProject(project)}
                      className="flex-1 px-3 py-1.5 md:py-2 text-xs md:text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="px-3 py-1.5 md:py-2 text-xs md:text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium"
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
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-lg w-full sm:max-w-2xl h-[90vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
            {/* Sticky Header */}
            <div className="p-4 md:p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  {editingProject ? 'Edit Project' : 'Create New Project'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-1"
                  type="button"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <form onSubmit={handleSaveProject} className="space-y-4" id="project-form">
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
                    className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm md:text-base"
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
                    className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm md:text-base"
                    placeholder="What is this project about?"
                  />
                </div>

                {/* Status and Priority */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm md:text-base"
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
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm md:text-base"
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

                {/* Goals with Sub-tasks (if generated by Aimi) */}
                {formData.goals && formData.goals.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Goals & Tasks (from Aimi)
                    </label>
                    <div className="space-y-3 bg-teal-50 border border-teal-200 rounded-lg p-4">
                      {formData.goals.map((goal, goalIdx) => (
                        <GoalWithSubTasks 
                          key={goalIdx}
                          goal={goal}
                          goalIndex={goalIdx}
                          onToggleSubTask={(subTaskIdx) => {
                            const updatedGoals = [...formData.goals];
                            if (updatedGoals[goalIdx].sub_tasks && updatedGoals[goalIdx].sub_tasks[subTaskIdx]) {
                              const subTask = updatedGoals[goalIdx].sub_tasks[subTaskIdx];
                              const currentStatus = subTask.status;
                              const newStatus = currentStatus === 'completed' ? 'not_started' : 'completed';
                              
                              updatedGoals[goalIdx].sub_tasks[subTaskIdx].status = newStatus;
                              setFormData({ ...formData, goals: updatedGoals });
                              
                              // Log sub-task completion activity
                              if (newStatus === 'completed') {
                                logActivity(
                                  EVENT_TYPES.TASK_COMPLETED,
                                  ENTITY_TYPES.PROJECT,
                                  editingProject?.id || 'new_project',
                                  { 
                                    task: subTask.task,
                                    goal: goal.goal,
                                    project: formData.name || 'Unnamed Project'
                                  },
                                  ACTIONS.COMPLETED
                                );
                              }
                            }
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Click sub-tasks to mark as complete. These will be saved with the project.
                    </p>
                  </div>
                )}
              </form>
            </div>

            {/* Sticky Footer */}
            <div className="p-4 md:p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm md:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="project-form"
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm md:text-base"
                >
                  {editingProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Aimi Wizard - Initial Description Step */}
      {showWizard && wizardStep === 'input' && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white rounded-t-2xl sm:rounded-lg w-full sm:max-w-xl">
            <div className="p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                🪄 Create Project with Aimi
              </h2>
              <p className="text-sm md:text-base text-gray-700 mb-4 md:mb-6">
                Tell Aimi what you're working on, and she'll help you plan it out!
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What are you working on?
                  </label>
                  <textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    rows={4}
                    placeholder="e.g., Website redesign with modern UI, or Launch new product feature, or Research market competitors..."
                    className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-sm md:text-base"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Be as detailed or brief as you like - Aimi will help flesh it out!
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    onClick={() => {
                      setShowWizard(false);
                      setProjectDescription('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (projectDescription.trim().length < 10) {
                        alert('Please provide at least a brief description (10+ characters)');
                        return;
                      }
                      // Move to generation step
                      setWizardStep('generating');
                    }}
                    disabled={projectDescription.trim().length < 10}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-600 to-blue-500 text-white rounded-lg hover:from-teal-700 hover:to-blue-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ✨ Let Aimi Plan It
                  </button>
                  <button
                    onClick={() => {
                      const name = projectDescription.trim() || 'New Project';
                      setFormData({
                        name,
                        description: '',
                        status: 'active',
                        priority: 'medium',
                        color: '#3b82f6',
                        goals: []
                      });
                      setShowWizard(false);
                      setShowModal(true);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    Skip AI
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Aimi Wizard - AI Generation */}
      {showWizard && wizardStep === 'generating' && (
        <AimyWizard
          projectDescription={projectDescription}
          onGenerated={handleWizardGenerated}
          onClose={() => {
            setShowWizard(false);
            setProjectDescription('');
          }}
        />
      )}
    </div>
  );
}
