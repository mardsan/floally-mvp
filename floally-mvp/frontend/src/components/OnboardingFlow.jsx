import React, { useState } from 'react';

const OnboardingFlow = ({ userEmail, onComplete }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    display_name: '',
    role: '',
    priorities: [],
    decision_style: '',
    communication_style: '',
    unsubscribe_preference: '',
    work_hours: { start: '09:00', end: '18:00' }
  });

  const totalSteps = 6;

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      onComplete(answers);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const updateAnswer = (key, value) => {
    setAnswers({ ...answers, [key]: value });
  };

  const togglePriority = (priority) => {
    const current = answers.priorities || [];
    if (current.includes(priority)) {
      updateAnswer('priorities', current.filter(p => p !== priority));
    } else if (current.length < 3) {
      updateAnswer('priorities', [...current, priority]);
    }
  };

  const canProceed = () => {
    switch(step) {
      case 0: return answers.display_name && answers.display_name.length > 1;
      case 1: return answers.role && answers.role.length > 2;
      case 2: return answers.priorities.length > 0;
      case 3: return answers.decision_style;
      case 4: return answers.communication_style;
      case 5: return answers.unsubscribe_preference;
      default: return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{background: 'linear-gradient(to bottom right, #ffffff, #f0fefb)'}}>
        
        {/* Header */}
        <div className="p-8 border-b" style={{borderColor: '#dafef4'}}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center text-3xl shadow-lg">
              🤖
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                Meet Ally
              </h2>
              <p className="text-sm text-slate-600">Your AI operational partner</p>
            </div>
          </div>
          
          {/* Progress */}
          <div className="flex gap-2">
            {[0,1,2,3,4,5].map(i => (
              <div key={i} className={`h-2 flex-1 rounded-full transition-all ${i <= step ? 'bg-gradient-to-r from-teal-500 to-emerald-500' : 'bg-slate-200'}`} />
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-2">Step {step + 1} of {totalSteps}</p>
        </div>

        {/* Content */}
        <div className="p-8">
          {step === 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                👋 Hi there! What should I call you?
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                This helps me personalize our interactions and make our conversations feel more natural.
              </p>
              <input
                type="text"
                placeholder="e.g., Alex, Dr. Smith, Sarah..."
                value={answers.display_name}
                onChange={(e) => updateAnswer('display_name', e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-lg"
                style={{borderColor: '#dafef4'}}
                autoFocus
              />
              <p className="text-xs text-slate-500 mt-2">
                💡 You can use your first name, full name, nickname, or whatever you prefer!
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                👋 Nice to meet you{answers.display_name ? `, ${answers.display_name}` : ''}! What do you do?
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Help me understand your role so I can prioritize what matters to you.
              </p>
              <input
                type="text"
                placeholder="e.g., Creative Director, Product Manager, Founder..."
                value={answers.role}
                onChange={(e) => updateAnswer('role', e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                style={{borderColor: '#dafef4'}}
                autoFocus
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                🎯 What matters most in your day?
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Pick up to 3 priorities (I'll use these to filter what's important)
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  'Client work',
                  'Team collaboration', 
                  'Creative focus time',
                  'Strategic planning',
                  'Learning & growth',
                  'Product development'
                ].map(priority => (
                  <button
                    key={priority}
                    onClick={() => togglePriority(priority)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      answers.priorities.includes(priority)
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-slate-200 hover:border-teal-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-900">{priority}</span>
                      {answers.priorities.includes(priority) && <span>✓</span>}
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Selected: {answers.priorities.length}/3
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                🤔 How do you like to make decisions?
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                This helps me present information in your preferred style
              </p>
              <div className="space-y-3">
                {[
                  { value: 'options_with_context', label: 'Give me options with pros/cons', emoji: '⚖️' },
                  { value: 'just_recommend', label: 'Just tell me what to do', emoji: '🎯' },
                  { value: 'ask_questions', label: 'Ask me questions to clarify', emoji: '💬' },
                  { value: 'show_data', label: 'Show me data and let me decide', emoji: '📊' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => updateAnswer('decision_style', option.value)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      answers.decision_style === option.value
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-slate-200 hover:border-teal-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{option.emoji}</span>
                      <span className="font-medium text-slate-900">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                ✍️ When drafting emails, you prefer...
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                I'll match your communication style in generated responses
              </p>
              <div className="space-y-3">
                {[
                  { value: 'concise_direct', label: 'Concise & direct', emoji: '⚡' },
                  { value: 'warm_friendly', label: 'Warm & friendly', emoji: '😊' },
                  { value: 'formal_professional', label: 'Formal & professional', emoji: '👔' },
                  { value: 'casual_conversational', label: 'Casual & conversational', emoji: '💭' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => updateAnswer('communication_style', option.value)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      answers.communication_style === option.value
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-slate-200 hover:border-teal-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{option.emoji}</span>
                      <span className="font-medium text-slate-900">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                📧 Newsletters and promotional emails...
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                How should I handle subscriptions you're not reading?
              </p>
              <div className="space-y-3">
                {[
                  { value: 'ask_before_unsubscribe', label: 'Ask me before unsubscribing', emoji: '🤔' },
                  { value: 'auto_suggest_30days', label: 'Auto-suggest unsubscribes for anything I haven\'t opened in 30 days', emoji: '🔔' },
                  { value: 'just_archive', label: 'Just archive promotional stuff, don\'t unsubscribe', emoji: '📦' },
                  { value: 'manual', label: 'I\'ll handle it manually', emoji: '✋' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => updateAnswer('unsubscribe_preference', option.value)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      answers.unsubscribe_preference === option.value
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-slate-200 hover:border-teal-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{option.emoji}</span>
                      <span className="font-medium text-slate-900 text-sm">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t flex justify-between" style={{borderColor: '#dafef4'}}>
          <button
            onClick={handleBack}
            disabled={step === 0}
            className="px-6 py-3 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            ← Back
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="px-8 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-full font-semibold hover:from-teal-600 hover:to-emerald-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {step === totalSteps - 1 ? '✨ Complete Setup' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
