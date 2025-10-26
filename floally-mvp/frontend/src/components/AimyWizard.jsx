import { useState } from 'react';

function AimyWizard({ projectDescription, onGenerated, onClose }) {
  const [loading, setLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState(null);

  const generateProjectPlan = async () => {
    if (!projectDescription || projectDescription.trim().length < 10) {
      alert('Please provide a more detailed project description (at least 10 characters)');
      return;
    }

    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://floally-mvp-production.up.railway.app';
      const response = await fetch(`${apiUrl}/api/ai/generate-project-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: projectDescription
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate project plan');
      }

      const data = await response.json();
      setGeneratedData(data);
    } catch (error) {
      console.error('Error generating project plan:', error);
      alert('Failed to generate project plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    if (generatedData) {
      onGenerated(generatedData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-blue-500 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                🪄 Aimy Project Wizard
              </h2>
              <p className="text-teal-50 mt-1">Your AI teammate is ready to plan your project</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!generatedData ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-gray-700">
                  <strong>Your description:</strong> "{projectDescription}"
                </p>
              </div>

              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  💡 <strong>What Aimy will generate:</strong>
                </p>
                <ul className="mt-2 space-y-1 text-sm text-gray-700 ml-4">
                  <li>• Enhanced project description</li>
                  <li>• Suggested timeline and milestones</li>
                  <li>• Key tasks and deliverables</li>
                  <li>• Success metrics and goals</li>
                  <li>• Recommended priority level</li>
                </ul>
              </div>

              <button
                onClick={generateProjectPlan}
                disabled={loading}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white shadow-lg'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Aimy is thinking...
                  </span>
                ) : (
                  '✨ Generate Project Plan with Aimy'
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Enhanced Description */}
              <div>
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  📝 Enhanced Description
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700">{generatedData.enhanced_description}</p>
                </div>
              </div>

              {/* Timeline */}
              {generatedData.timeline && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    📅 Suggested Timeline
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-700">{generatedData.timeline}</p>
                  </div>
                </div>
              )}

              {/* Goals */}
              {generatedData.goals && generatedData.goals.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    🎯 Suggested Goals & Tasks
                  </h3>
                  <div className="space-y-2">
                    {generatedData.goals.map((goal, index) => (
                      <div key={index} className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                        <p className="font-medium text-gray-900">{goal.goal}</p>
                        {goal.deadline && (
                          <p className="text-sm text-gray-600 mt-1">📆 {goal.deadline}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Success Metrics */}
              {generatedData.success_metrics && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    ✅ Success Metrics
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-gray-700">{generatedData.success_metrics}</p>
                  </div>
                </div>
              )}

              {/* Priority Recommendation */}
              {generatedData.recommended_priority && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    🎯 Recommended Priority
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      generatedData.recommended_priority === 'critical' ? 'bg-red-100 text-red-700' :
                      generatedData.recommended_priority === 'high' ? 'bg-orange-100 text-orange-700' :
                      generatedData.recommended_priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {generatedData.recommended_priority.charAt(0).toUpperCase() + generatedData.recommended_priority.slice(1)}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleAccept}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-teal-600 hover:to-blue-600 transition-all shadow-lg"
                >
                  ✨ Accept & Use This Plan
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Edit Manually
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AimyWizard;
