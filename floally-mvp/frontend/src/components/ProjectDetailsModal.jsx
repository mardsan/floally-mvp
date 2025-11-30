import React, { useState, useEffect } from 'react';

// Helper function to check if a date string is valid YYYY-MM-DD format
const isValidDateFormat = (dateStr) => {
  if (!dateStr) return true; // Empty is valid
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(dateStr);
};

// Helper function to normalize old relative dates to empty string
const normalizeDeadline = (deadline) => {
  if (!deadline) return '';
  if (isValidDateFormat(deadline)) return deadline;
  // If it's a relative date like "Week 1", return empty string
  return '';
};

const ProjectDetailsModal = ({ project, onClose, onUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    priority: 'medium',
    goals: []
  });
  const [saving, setSaving] = useState(false);
  const [generatingDates, setGeneratingDates] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'active',
        priority: project.priority || 'medium',
        goals: (project.goals || []).map(goal => ({
          ...goal,
          deadline: normalizeDeadline(goal.deadline)
        }))
      });
    }
  }, [project]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGoalChange = (index, field, value) => {
    const updatedGoals = [...formData.goals];
    updatedGoals[index] = {
      ...updatedGoals[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      goals: updatedGoals
    }));
  };

  const addGoal = () => {
    setFormData(prev => ({
      ...prev,
      goals: [
        ...prev.goals,
        { goal: '', deadline: '', status: 'not_started' }
      ]
    }));
  };

  const removeGoal = (index) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const user = JSON.parse(localStorage.getItem('okaimy_user'));
      if (!user || !user.email) {
        alert('User session not found. Please log in again.');
        return;
      }
      
      console.log('💾 Saving project with goals:', formData.goals);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${project.id}?user_email=${user.email}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update project');
      }

      const data = await response.json();
      console.log('✅ Received updated project:', data);
      // API returns {success: true, project: {...}}
      const updatedProject = data.project || data;
      console.log('📋 Updated project goals:', updatedProject.goals);
      onUpdate(updatedProject);
      setEditMode(false);
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original project data
    setFormData({
      name: project.name || '',
      description: project.description || '',
      status: project.status || 'active',
      priority: project.priority || 'medium',
      goals: (project.goals || []).map(goal => ({
        ...goal,
        deadline: normalizeDeadline(goal.deadline)
      }))
    });
    setEditMode(false);
  };

  const handleGenerateDates = async () => {
    setGeneratingDates(true);
    try {
      // Use Aimy to suggest dates for goals
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/generate-goal-dates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectName: formData.name,
          projectDescription: formData.description,
          goals: formData.goals.map(g => g.goal)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate dates');
      }

      const { goals: goalsWithDates } = await response.json();
      
      // Update goals with AI-suggested dates
      setFormData(prev => ({
        ...prev,
        goals: prev.goals.map((goal, index) => ({
          ...goal,
          deadline: goalsWithDates[index]?.deadline || goal.deadline
        }))
      }));
    } catch (error) {
      console.error('Error generating dates:', error);
      alert('Failed to generate dates. Please add them manually.');
    } finally {
      setGeneratingDates(false);
    }
  };

  if (!project) return null;

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    planning: 'bg-blue-100 text-blue-800',
    on_hold: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-purple-100 text-purple-800'
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  };

  const goalStatusColors = {
    not_started: 'bg-gray-100 text-gray-700',
    in_progress: 'bg-blue-100 text-blue-600',
    completed: 'bg-green-100 text-green-600',
    blocked: 'bg-red-100 text-red-600'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-blue-500 text-white p-6 rounded-t-xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {editMode ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="text-2xl font-bold bg-white/20 text-white placeholder-white/70 rounded-lg px-3 py-2 w-full border-2 border-white/30 focus:border-white focus:outline-none"
                  placeholder="Project Name"
                />
              ) : (
                <h2 className="text-2xl font-bold">{project.name}</h2>
              )}
              <div className="flex items-center gap-3 mt-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[editMode ? formData.status : project.status] || 'bg-gray-100 text-gray-800'}`}>
                  {editMode ? (
                    <>
                      <label htmlFor="project-status-inline" className="sr-only">Project status</label>
                      <select
                        id="project-status-inline"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="bg-transparent border-none outline-none cursor-pointer"
                      >
                        <option value="active">Active</option>
                        <option value="planning">Planning</option>
                        <option value="on_hold">On Hold</option>
                        <option value="completed">Completed</option>
                      </select>
                    </>
                  ) : (
                    project.status.replace('_', ' ').charAt(0).toUpperCase() + project.status.slice(1).replace('_', ' ')
                  )}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[editMode ? formData.priority : project.priority] || 'bg-gray-100 text-gray-800'}`}>
                  {editMode ? (
                    <>
                      <label htmlFor="project-priority-inline" className="sr-only">Project priority</label>
                      <select
                        id="project-priority-inline"
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="bg-transparent border-none outline-none cursor-pointer"
                      >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  ) : (
                    project.priority.charAt(0).toUpperCase() + project.priority.slice(1)
                  )}
                </span>
                {project.is_primary && (
                  <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-sm font-medium">
                    ⭐ Primary
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="ml-4 text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Description</h3>
            {editMode ? (
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Project description..."
              />
            ) : (
              <p className="text-gray-700 leading-relaxed">{project.description || 'No description provided.'}</p>
            )}
          </div>

          {/* Goals */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Goals & Milestones</h3>
              {editMode && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGenerateDates}
                    disabled={generatingDates || formData.goals.length === 0}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Let Aimy suggest dates for your goals"
                  >
                    <span>🪄</span>
                    {generatingDates ? 'Generating...' : 'Suggest Dates'}
                  </button>
                  <button
                    onClick={addGoal}
                    className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Goal
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-3">
              {(editMode ? formData.goals : project.goals || []).map((goal, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  {editMode ? (
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <input
                          type="text"
                          value={goal.goal}
                          onChange={(e) => handleGoalChange(index, 'goal', e.target.value)}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Goal description..."
                        />
                        <button
                          onClick={() => removeGoal(index)}
                          className="text-red-600 hover:text-red-700 p-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex gap-3">
                        <input
                          type="date"
                          value={goal.deadline || ''}
                          onChange={(e) => handleGoalChange(index, 'deadline', e.target.value)}
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <label htmlFor={`goal-status-${index}`} className="sr-only">Status for goal {index + 1}</label>
                        <select
                          id={`goal-status-${index}`}
                          value={goal.status}
                          onChange={(e) => handleGoalChange(index, 'status', e.target.value)}
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="not_started">Not Started</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="blocked">Blocked</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-gray-800 font-medium flex-1">{goal.goal}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 ${goalStatusColors[goal.status] || 'bg-gray-100 text-gray-700'}`}>
                          {goal.status.replace('_', ' ').charAt(0).toUpperCase() + goal.status.slice(1).replace('_', ' ')}
                        </span>
                      </div>
                      {goal.deadline && (
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {(() => {
                            // Parse date as local date to avoid timezone shifts
                            const [year, month, day] = goal.deadline.split('-').map(Number);
                            const date = new Date(year, month - 1, day);
                            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                          })()}
                        </p>
                      )}
                    </>
                  )}
                </div>
              ))}
              {(!project.goals || project.goals.length === 0) && !editMode && (
                <p className="text-gray-400 text-center py-4">No goals defined yet.</p>
              )}
            </div>
          </div>

          {/* Metadata */}
          {!editMode && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Created:</span>
                  <p className="text-gray-800 font-medium">
                    {new Date(project.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Last Updated:</span>
                  <p className="text-gray-800 font-medium">
                    {new Date(project.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 rounded-b-xl flex justify-end gap-3">
          {editMode ? (
            <>
              <button
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-gradient-to-r from-teal-600 to-blue-500 text-white rounded-lg hover:from-teal-700 hover:to-blue-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="px-6 py-2 bg-gradient-to-r from-teal-600 to-blue-500 text-white rounded-lg hover:from-teal-700 hover:to-blue-600 transition-all shadow-md"
            >
              Edit Project
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsModal;
