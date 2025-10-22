import { useState } from 'react';

function ProjectCreationModal({ user, onClose, onProjectCreated, existingProject }) {
  const isEditing = !!existingProject;
  
  const [formData, setFormData] = useState({
    name: existingProject?.name || '',
    description: existingProject?.description || '',
    goals: existingProject?.goals || [''],
    deadline: existingProject?.deadline || '',
    priority: existingProject?.priority || 'medium',
    keywords: existingProject?.keywords || [''],
    stakeholders: existingProject?.stakeholders || [''],
    successCriteria: existingProject?.successCriteria || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const addField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const updateField = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const removeField = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Clean up empty fields
      const cleanData = {
        ...formData,
        goals: formData.goals.filter(g => g.trim()),
        keywords: formData.keywords.filter(k => k.trim()),
        stakeholders: formData.stakeholders.filter(s => s.trim())
      };

      const endpoint = '/api/projects/manage';
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

  const canProceed = () => {
    if (step === 1) return formData.name.trim();
    if (step === 2) return formData.goals.some(g => g.trim());
    if (step === 3) return true; // Optional step
    return false;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? '✏️ Edit Project' : '🚀 Create New Project'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {step === 1 && 'Define your project basics'}
              {step === 2 && 'Set goals and success criteria'}
              {step === 3 && 'Add context for Aimy'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 pt-4">
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  i <= step ? 'bg-gradient-to-r from-teal-500 to-emerald-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Basics */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Q4 Product Launch, Client Website Redesign..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-lg"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What is this project about? What are you trying to achieve?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  rows={4}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
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
              </div>
            </div>
          )}

          {/* Step 2: Goals */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Project Goals *
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  What specific outcomes do you want to achieve?
                </p>
                {formData.goals.map((goal, index) => (
                  <div key={index} className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={goal}
                      onChange={(e) => updateField('goals', index, e.target.value)}
                      placeholder={`Goal ${index + 1}...`}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    {formData.goals.length > 1 && (
                      <button
                        onClick={() => removeField('goals', index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addField('goals')}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  + Add another goal
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Success Criteria
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  How will you know this project is successful?
                </p>
                <textarea
                  value={formData.successCriteria}
                  onChange={(e) => setFormData({ ...formData, successCriteria: e.target.value })}
                  placeholder="e.g., 'Website launches with 95%+ performance score and 0 critical bugs'"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 3: Context for Aimy */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                  <div className="text-2xl">💡</div>
                  <div>
                    <h4 className="font-semibold text-teal-900 mb-1">
                      Help Aimy understand your project
                    </h4>
                    <p className="text-sm text-teal-700">
                      Adding keywords and stakeholders helps Aimy automatically categorize emails,
                      meetings, and tasks related to this project.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Keywords & Topics
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  Words or phrases Aimy should look for in emails and calendar events
                </p>
                {formData.keywords.map((keyword, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => updateField('keywords', index, e.target.value)}
                      placeholder="e.g., product launch, redesign, Q4..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    {formData.keywords.length > 1 && (
                      <button
                        onClick={() => removeField('keywords', index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addField('keywords')}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  + Add keyword
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Key People & Stakeholders
                </label>
                <p className="text-sm text-gray-600 mb-3">
                  Names or email addresses of important people for this project
                </p>
                {formData.stakeholders.map((person, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={person}
                      onChange={(e) => updateField('stakeholders', index, e.target.value)}
                      placeholder="e.g., sarah@company.com, John Smith..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                    {formData.stakeholders.length > 1 && (
                      <button
                        onClick={() => removeField('stakeholders', index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addField('stakeholders')}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  + Add person
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex items-center justify-between">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
          >
            {step > 1 ? '← Back' : 'Cancel'}
          </button>

          <button
            onClick={() => step < 3 ? setStep(step + 1) : handleSubmit()}
            disabled={!canProceed() || loading}
            className={`px-8 py-3 rounded-lg font-semibold transition-all ${
              canProceed() && !loading
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 shadow-md'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? 'Saving...' : step < 3 ? 'Next →' : isEditing ? 'Update Project' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProjectCreationModal;
