import { useState } from 'react';

const PRIORITY_COLORS = {
  low: '#9ca3af',
  medium: '#3b82f6',
  high: '#f59e0b',
  critical: '#ef4444'
};

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active', emoji: '🚀' },
  { value: 'planning', label: 'Planning', emoji: '📋' },
  { value: 'on_hold', label: 'On Hold', emoji: '⏸️' },
  { value: 'completed', label: 'Completed', emoji: '✅' }
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: PRIORITY_COLORS.low },
  { value: 'medium', label: 'Medium', color: PRIORITY_COLORS.medium },
  { value: 'high', label: 'High', color: PRIORITY_COLORS.high },
  { value: 'critical', label: 'Critical', color: PRIORITY_COLORS.critical }
];

function AddProjectModal({ user, onClose, onProjectAdded, isFirstProject = false }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    priority: 'medium',
    color: PRIORITY_COLORS.medium,
    is_primary: isFirstProject,
    goals: [{ goal: '', deadline: '', status: 'not_started' }]
  });
  const [saving, setSaving] = useState(false);

  const handleAddGoal = () => {
    setFormData({
      ...formData,
      goals: [...formData.goals, { goal: '', deadline: '', status: 'not_started' }]
    });
  };

  const handleRemoveGoal = (index) => {
    const newGoals = formData.goals.filter((_, i) => i !== index);
    setFormData({ ...formData, goals: newGoals });
  };

  const handleGoalChange = (index, field, value) => {
    const newGoals = [...formData.goals];
    newGoals[index][field] = value;
    setFormData({ ...formData, goals: newGoals });
  };

  const handlePriorityChange = (priority) => {
    setFormData({
      ...formData,
      priority,
      color: PRIORITY_COLORS[priority]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a project name');
      return;
    }

    setSaving(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://floally-mvp-production.up.railway.app';
      const response = await fetch(`${apiUrl}/api/projects?user_email=${encodeURIComponent(user.email)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          goals: formData.goals.filter(g => g.goal.trim() !== '') // Remove empty goals
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      const data = await response.json();
      console.log('✅ Project created:', data.project);
      
      onProjectAdded && onProjectAdded(data.project);
      onClose();
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    if (isFirstProject) {
      // Mark that user has seen the project prompt
      localStorage.setItem('okaimy_project_prompt_shown', 'true');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-teal-50 to-blue-50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {isFirstProject ? '🎯 Create Your First Project' : '📁 New Project'}
            </h3>
            {isFirstProject && (
              <p className="text-sm text-gray-600 mt-1">
                Projects help Aimy understand your goals and provide better assistance
              </p>
            )}
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Website Redesign, Q1 Marketing Campaign"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What's this project about? What are you trying to achieve?"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {/* Status and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.emoji} {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Priority
                </label>
                <div className="flex gap-2">
                  {PRIORITY_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handlePriorityChange(opt.value)}
                      className={`flex-1 px-3 py-3 rounded-lg border-2 transition-all ${
                        formData.priority === opt.value
                          ? 'border-gray-800 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{
                        backgroundColor: formData.priority === opt.value ? opt.color + '20' : 'white'
                      }}
                    >
                      <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: opt.color }} />
                      <div className="text-xs font-medium text-gray-700">{opt.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Goals */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-semibold text-gray-900">
                  Goals & Milestones
                </label>
                <button
                  type="button"
                  onClick={handleAddGoal}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  + Add Goal
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.goals.map((goal, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <input
                      type="text"
                      value={goal.goal}
                      onChange={(e) => handleGoalChange(index, 'goal', e.target.value)}
                      placeholder="Goal description"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                    <input
                      type="date"
                      value={goal.deadline}
                      onChange={(e) => handleGoalChange(index, 'deadline', e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                    {formData.goals.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveGoal(index)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {isFirstProject && (
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-teal-900 mb-1">Why add a project?</h4>
                    <p className="text-sm text-teal-800">
                      Projects give Aimy context about what you're working on. This helps her prioritize your emails,
                      suggest relevant tasks, and generate more personalized daily stand-ups aligned with your goals.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between">
          <button
            onClick={handleSkip}
            className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {isFirstProject ? 'Skip for Now' : 'Cancel'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !formData.name.trim()}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Creating...' : isFirstProject ? 'Create Project' : 'Add Project'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddProjectModal;
