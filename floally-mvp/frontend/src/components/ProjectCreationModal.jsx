import { useState } from 'react';

function ProjectCreationModal({ user, onClose, onProjectCreated, existingProject }) {
  const isEditing = !!existingProject;
  
  const [formData, setFormData] = useState({
    name: existingProject?.name || '',
    description: existingProject?.description || '',
    goals: existingProject?.goals?.map(g => ({ text: g, status: 'not-started' })) || [],
    deadline: existingProject?.deadline || '',
    priority: existingProject?.priority || 'medium',
    status: existingProject?.status || 'planning',
    keywords: existingProject?.keywords || [],
    stakeholders: existingProject?.stakeholders || [],
    successCriteria: existingProject?.successCriteria || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [enhancing, setEnhancing] = useState(false);
  const [aiEnhanced, setAiEnhanced] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const cleanData = {
        ...formData,
        goals: formData.goals.filter(g => g.text?.trim()).map(g => g.text),
        keywords: formData.keywords.filter(k => k?.trim()),
        stakeholders: formData.stakeholders.filter(s => s?.trim())
      };

      const endpoint = '/api/projects';
      const method = isEditing ? 'PUT' : 'POST';
      const body = isEditing 
        ? { projectId: existingProject.id, updates: cleanData }
        : cleanData;

      const response = await fetch(`${endpoint}?userId=${user.userId}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error('Failed to save project');
      }

      const data = await response.json();
      onProjectCreated(data.project || cleanData);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const enhanceWithAimy = async () => {
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      setError('Please provide a description for Aimy to analyze');
      return;
    }

    setEnhancing(true);
    setError('');

    try {
      const response = await fetch('/api/projects?action=enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.userId,
          projectName: formData.name,
          projectDescription: formData.description
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.details || errorData.error || 'Failed to enhance');
      }

      const data = await response.json();
      const enhancement = data.enhancement;
      
      // Update form with all of Aimy's suggestions
      setFormData(prev => ({
        ...prev,
        description: enhancement.enhancedDescription,
        goals: (enhancement.goals || []).map(g => ({ text: g, status: 'not-started' })),
        keywords: enhancement.keywords || [],
        stakeholders: enhancement.stakeholders || [],
        successCriteria: enhancement.successMetrics?.join('\n') || ''
      }));
      
      // Auto-fill deadline from estimated duration
      if (enhancement.estimatedDuration && !formData.deadline) {
        const monthsMatch = enhancement.estimatedDuration.match(/(\d+)[-–]?(\d+)?\s*months?/i);
        const weeksMatch = enhancement.estimatedDuration.match(/(\d+)[-–]?(\d+)?\s*weeks?/i);
        
        if (monthsMatch) {
          const months = parseInt(monthsMatch[2] || monthsMatch[1]);
          const deadlineDate = new Date();
          deadlineDate.setMonth(deadlineDate.getMonth() + months);
          setFormData(prev => ({
            ...prev,
            deadline: deadlineDate.toISOString().split('T')[0]
          }));
        } else if (weeksMatch) {
          const weeks = parseInt(weeksMatch[2] || weeksMatch[1]);
          const deadlineDate = new Date();
          deadlineDate.setDate(deadlineDate.getDate() + (weeks * 7));
          setFormData(prev => ({
            ...prev,
            deadline: deadlineDate.toISOString().split('T')[0]
          }));
        }
      }
      
      setAiEnhanced(true);
      
    } catch (err) {
      setError(`Failed to enhance: ${err.message}`);
    } finally {
      setEnhancing(false);
    }
  };

  const addGoal = () => {
    setFormData(prev => ({
      ...prev,
      goals: [...prev.goals, { text: '', status: 'not-started' }]
    }));
  };

  const updateGoal = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.map((g, i) => i === index ? { ...g, [field]: value } : g)
    }));
  };

  const removeGoal = (index) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };

  const addKeyword = () => {
    setFormData(prev => ({
      ...prev,
      keywords: [...prev.keywords, '']
    }));
  };

  const updateKeyword = (index, value) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.map((k, i) => i === index ? value : k)
    }));
  };

  const removeKeyword = (index) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index)
    }));
  };

  const addStakeholder = () => {
    setFormData(prev => ({
      ...prev,
      stakeholders: [...prev.stakeholders, '']
    }));
  };

  const updateStakeholder = (index, value) => {
    setFormData(prev => ({
      ...prev,
      stakeholders: prev.stakeholders.map((s, i) => i === index ? value : s)
    }));
  };

  const removeStakeholder = (index) => {
    setFormData(prev => ({
      ...prev,
      stakeholders: prev.stakeholders.filter((_, i) => i !== index)
    }));
  };

  const completionPercentage = () => {
    if (formData.goals.length === 0) return 0;
    const completed = formData.goals.filter(g => g.status === 'completed').length;
    return Math.round((completed / formData.goals.length) * 100);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-teal-50 to-emerald-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? '✏️ Edit Project' : '🚀 Create New Project'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {aiEnhanced ? '✨ Enhanced by Aimy - Edit as needed' : 'Fill in the basics, then let Aimy help'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Project Basics */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Project Basics</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Mobile Fitness App, Website Redesign..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of what you want to build or achieve..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    rows={3}
                  />
                  
                  {!aiEnhanced && formData.description.trim().length >= 10 && (
                    <button
                      type="button"
                      onClick={enhanceWithAimy}
                      disabled={enhancing}
                      className="mt-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 font-medium"
                    >
                      {enhancing ? (
                        <>
                          <span className="animate-spin inline-block mr-2">🔄</span>
                          Aimy is analyzing...
                        </>
                      ) : (
                        <>
                          ✨ Let Aimy Plan Everything
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Deadline (Optional)
                    </label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="low">🟢 Low</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="high">🟠 High</option>
                      <option value="critical">🔴 Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="planning">📝 Planning</option>
                      <option value="active">🚀 Active</option>
                      <option value="on-hold">⏸️ On Hold</option>
                      <option value="completed">✅ Completed</option>
                      <option value="archived">📦 Archived</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Goals & Tasks */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">🎯 Goals & Tasks</h3>
                  {formData.goals.length > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      {completionPercentage()}% complete ({formData.goals.filter(g => g.status === 'completed').length} of {formData.goals.length})
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={addGoal}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                >
                  + Add Goal
                </button>
              </div>

              {formData.goals.length > 0 ? (
                <div className="space-y-3">
                  {formData.goals.map((goal, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <select
                        value={goal.status}
                        onChange={(e) => updateGoal(index, 'status', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="not-started">⭕ Not Started</option>
                        <option value="in-progress">🔵 In Progress</option>
                        <option value="completed">✅ Completed</option>
                      </select>
                      <input
                        type="text"
                        value={goal.text}
                        onChange={(e) => updateGoal(index, 'text', e.target.value)}
                        placeholder="Goal or task description..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => removeGoal(index)}
                        className="text-red-600 hover:text-red-800 px-2"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm italic text-center py-4">
                  No goals yet. Click "Let Aimy Plan Everything" or add manually.
                </p>
              )}
            </div>

            {/* Keywords & Stakeholders */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Keywords */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">🔑 Keywords</h3>
                  <button
                    type="button"
                    onClick={addKeyword}
                    className="px-3 py-1 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
                  >
                    + Add
                  </button>
                </div>

                {formData.keywords.length > 0 ? (
                  <div className="space-y-2">
                    {formData.keywords.map((keyword, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={keyword}
                          onChange={(e) => updateKeyword(index, e.target.value)}
                          placeholder="e.g., mobile, iOS, React Native..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeKeyword(index)}
                          className="text-red-600 hover:text-red-800 px-2"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm italic text-center py-2">
                    No keywords yet
                  </p>
                )}
              </div>

              {/* Stakeholders */}
              <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">👥 Stakeholders</h3>
                  <button
                    type="button"
                    onClick={addStakeholder}
                    className="px-3 py-1 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
                  >
                    + Add
                  </button>
                </div>

                {formData.stakeholders.length > 0 ? (
                  <div className="space-y-2">
                    {formData.stakeholders.map((stakeholder, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={stakeholder}
                          onChange={(e) => updateStakeholder(index, e.target.value)}
                          placeholder="Name or email..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeStakeholder(index)}
                          className="text-red-600 hover:text-red-800 px-2"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm italic text-center py-2">
                    No stakeholders yet
                  </p>
                )}
              </div>
            </div>

            {/* Success Criteria */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">✨ Success Criteria</h3>
              <textarea
                value={formData.successCriteria}
                onChange={(e) => setFormData({ ...formData, successCriteria: e.target.value })}
                placeholder="How will you measure success? What does 'done' look like?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                rows={3}
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading || !formData.name.trim()}
            className="px-8 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg hover:from-teal-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Saving...' : isEditing ? 'Update Project' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProjectCreationModal;
