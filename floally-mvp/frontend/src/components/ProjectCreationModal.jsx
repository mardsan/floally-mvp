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
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [goalsGenerated, setGoalsGenerated] = useState(false);
  const [contextGenerated, setContextGenerated] = useState(false);
  
  // New state for description enhancement
  const [enhancing, setEnhancing] = useState(false);
  const [enhancement, setEnhancement] = useState(null);
  const [showEnhancement, setShowEnhancement] = useState(false);
  const [originalDescription, setOriginalDescription] = useState('');

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

  const enhanceDescriptionWithAimy = async () => {
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      setError('Please provide a basic description for Aimy to enhance');
      return;
    }

    setEnhancing(true);
    setError('');
    setOriginalDescription(formData.description); // Save original

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
        console.error('Enhancement API error:', errorData);
        throw new Error(errorData.details || errorData.error || 'Failed to enhance description');
      }

      const data = await response.json();
      console.log('Enhancement response:', data);
      setEnhancement(data.enhancement);
      setShowEnhancement(true);
      
    } catch (err) {
      console.error('Enhancement error:', err);
      setError(`Failed to enhance: ${err.message}`);
    } finally {
      setEnhancing(false);
    }
  };

  const acceptEnhancement = () => {
    setFormData(prev => ({
      ...prev,
      description: enhancement.enhancedDescription
    }));
    
    // Pre-fill deadline if we have a recommended timeline
    if (enhancement.estimatedDuration && !formData.deadline) {
      // Try to extract months from estimatedDuration (e.g., "2-3 months" -> 3)
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
    
    setShowEnhancement(false);
  };

  const rejectEnhancement = () => {
    setFormData(prev => ({
      ...prev,
      description: originalDescription
    }));
    setShowEnhancement(false);
    setEnhancement(null);
  };

  const regenerateEnhancement = () => {
    setFormData(prev => ({
      ...prev,
      description: originalDescription
    }));
    setEnhancement(null);
    setShowEnhancement(false);
    // Call enhance again
    setTimeout(() => enhanceDescriptionWithAimy(), 100);
  };

  const generateGoalsWithAimy = async () => {
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      setError('Please provide a more detailed project description for Aimy to analyze');
      return;
    }

    setAiGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/projects?action=generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.userId,
          projectName: formData.name,
          projectDescription: formData.description,
          deadline: formData.deadline, // Include deadline for time-aware suggestions
          priority: formData.priority,
          existingData: {
            goals: formData.goals.filter(g => g.trim()),
            keywords: formData.keywords.filter(k => k.trim()),
            stakeholders: formData.stakeholders.filter(s => s.trim())
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate suggestions');
      }

      const data = await response.json();
      setAiSuggestions(data.suggestions);
      
      // For Step 2: Fill in goals only
      if (step === 2) {
        const allGoals = [...(data.suggestions.goals || []), ...(data.suggestions.tasks || [])];
        setFormData(prev => ({
          ...prev,
          goals: allGoals.length > 0 ? allGoals : prev.goals,
          successCriteria: data.suggestions.successMetrics?.join('\n') || prev.successCriteria
        }));
        setGoalsGenerated(true);
      }
      
      // For Step 3: Fill in context only
      if (step === 3) {
        setFormData(prev => ({
          ...prev,
          keywords: data.suggestions.keywords || prev.keywords,
          stakeholders: data.suggestions.stakeholders || prev.stakeholders
        }));
        setContextGenerated(true);
      }

    } catch (err) {
      console.error('AI generation error:', err);
      setError(err.message);
    } finally {
      setAiGenerating(false);
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
                  disabled={showEnhancement}
                />
                
                {/* Enhance with Aimy Button */}
                {!showEnhancement && formData.description.trim().length >= 10 && (
                  <button
                    type="button"
                    onClick={enhanceDescriptionWithAimy}
                    disabled={enhancing}
                    className="mt-3 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 text-sm font-medium"
                  >
                    {enhancing ? (
                      <>
                        <span className="animate-spin">🔄</span>
                        Aimy is analyzing...
                      </>
                    ) : (
                      <>
                        ✨ Enhance with Aimy
                      </>
                    )}
                  </button>
                )}

                {/* Enhancement Results */}
                {showEnhancement && enhancement && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">✨</span>
                        <div>
                          <h4 className="font-bold text-purple-900">Aimy's Enhanced Description</h4>
                          <p className="text-xs text-purple-700">Based on scope analysis and complexity assessment</p>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Description */}
                    <div className="bg-white p-4 rounded-lg mb-3 border border-purple-100">
                      <p className="text-gray-800 whitespace-pre-wrap">{enhancement.enhancedDescription}</p>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-white p-3 rounded-lg border border-purple-100">
                        <p className="text-xs font-semibold text-purple-900 mb-1">⏱️ Estimated Duration</p>
                        <p className="text-sm text-gray-800 font-medium">{enhancement.estimatedDuration}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-purple-100">
                        <p className="text-xs font-semibold text-purple-900 mb-1">📊 Complexity</p>
                        <p className="text-sm text-gray-800 font-medium capitalize">{enhancement.complexity.replace('-', ' ')}</p>
                      </div>
                    </div>

                    {/* Timeline Recommendation */}
                    {enhancement.recommendedTimeline && (
                      <div className="bg-white p-3 rounded-lg mb-3 border border-purple-100">
                        <p className="text-xs font-semibold text-purple-900 mb-1">📅 Recommended Timeline</p>
                        <p className="text-sm text-gray-800">{enhancement.recommendedTimeline}</p>
                      </div>
                    )}

                    {/* Key Components */}
                    {enhancement.keyComponents && enhancement.keyComponents.length > 0 && (
                      <div className="bg-white p-3 rounded-lg mb-3 border border-purple-100">
                        <p className="text-xs font-semibold text-purple-900 mb-2">🔑 Key Components</p>
                        <ul className="text-sm text-gray-800 space-y-1">
                          {enhancement.keyComponents.map((component, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-purple-600 mt-0.5">•</span>
                              <span>{component}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Potential Challenges */}
                    {enhancement.potentialChallenges && enhancement.potentialChallenges.length > 0 && (
                      <div className="bg-white p-3 rounded-lg mb-3 border border-purple-100">
                        <p className="text-xs font-semibold text-purple-900 mb-2">⚠️ Potential Challenges</p>
                        <ul className="text-sm text-gray-800 space-y-1">
                          {enhancement.potentialChallenges.map((challenge, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-orange-600 mt-0.5">•</span>
                              <span>{challenge}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Aimy's Reasoning */}
                    {enhancement.reasoning && (
                      <div className="bg-purple-100 p-3 rounded-lg mb-3 border border-purple-200">
                        <p className="text-xs font-semibold text-purple-900 mb-1">💭 Aimy's Reasoning</p>
                        <p className="text-sm text-purple-800 italic">{enhancement.reasoning}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={acceptEnhancement}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium text-sm"
                      >
                        ✓ Accept Enhancement
                      </button>
                      <button
                        type="button"
                        onClick={regenerateEnhancement}
                        disabled={enhancing}
                        className="px-4 py-2 bg-white text-purple-700 border-2 border-purple-300 rounded-lg hover:bg-purple-50 transition-all font-medium text-sm disabled:opacity-50"
                      >
                        🔄 Regenerate
                      </button>
                      <button
                        type="button"
                        onClick={rejectEnhancement}
                        className="px-4 py-2 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-medium text-sm"
                      >
                        ✗ Keep Original
                      </button>
                    </div>
                  </div>
                )}

                {!showEnhancement && (
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Let Aimy enhance your description with scope clarification and timeline recommendations
                  </p>
                )}
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
              {/* AI Generation Button */}
              {!goalsGenerated && formData.description.trim().length >= 10 && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-2xl">✨</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-purple-900 mb-1">
                        Let Aimy Help!
                      </h4>
                      <p className="text-sm text-gray-700">
                        Based on your description: "<em>{formData.description.substring(0, 100)}{formData.description.length > 100 ? '...' : ''}</em>"
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={generateGoalsWithAimy}
                    disabled={aiGenerating}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {aiGenerating ? (
                      <>
                        <span className="animate-spin">⚙️</span>
                        Aimy is generating goals...
                      </>
                    ) : (
                      <>
                        ✨ Generate Goals with Aimy
                      </>
                    )}
                  </button>
                </div>
              )}

              {goalsGenerated && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">✨</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-purple-900 mb-1">
                        Aimy's Suggestions Applied!
                      </h4>
                      <p className="text-sm text-purple-700">
                        Review and edit the goals below. You can add, remove, or modify any suggestion.
                      </p>
                      {aiSuggestions?.recommendedTimeline && (
                        <div className="mt-3 pt-3 border-t border-purple-200">
                          <p className="text-sm font-semibold text-purple-900 mb-1">📅 Aimy's Timeline Recommendation:</p>
                          <p className="text-sm text-purple-800">{aiSuggestions.recommendedTimeline}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
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
              {/* AI Generation Button */}
              {!contextGenerated && formData.description.trim().length >= 10 && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-2xl">✨</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-purple-900 mb-1">
                        Let Aimy Suggest Keywords & Stakeholders
                      </h4>
                      <p className="text-sm text-gray-700">
                        Aimy can identify relevant keywords and stakeholders based on your project description and goals
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={generateGoalsWithAimy}
                    disabled={aiGenerating}
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {aiGenerating ? (
                      <>
                        <span className="animate-spin">⚙️</span>
                        Aimy is analyzing...
                      </>
                    ) : (
                      <>
                        ✨ Generate Context with Aimy
                      </>
                    )}
                  </button>
                </div>
              )}

              {contextGenerated && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">✨</div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-purple-900 mb-1">
                        Aimy Added Context!
                      </h4>
                      <p className="text-sm text-purple-700">
                        Keywords and stakeholders have been pre-filled. Feel free to customize them.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
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
