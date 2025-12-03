import React from 'react';

const AimySettings = ({ userProfile, aimeInsights, onEdit, onClose, standalone = false }) => {
  if (!userProfile) return null;

  const priorityLabels = {
    'Client work': '👥',
    'Team collaboration': '🤝',
    'Creative focus time': '🎨',
    'Strategic planning': '📋',
    'Learning & growth': '📚',
    'Product development': '🚀'
  };

  const styleLabels = {
    'options_with_context': '⚖️ Options with context',
    'just_recommend': '🎯 Just recommend',
    'ask_questions': '💬 Ask questions',
    'show_data': '📊 Show data'
  };

  const commLabels = {
    'concise_direct': '⚡ Concise & direct',
    'warm_friendly': '😊 Warm & friendly',
    'formal_professional': '👔 Formal & professional',
    'casual_conversational': '💭 Casual'
  };

  const content = (
    <div className={standalone ? "" : "bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"}>
        
        {/* Header */}
        <div className="p-8 border-b" style={{borderColor: '#dafef4', background: 'linear-gradient(to right, #dafef4, #e8fef9)'}}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden shadow-md ring-2 ring-teal-100">
                <img 
                  src="/AiMy_LUMO_01.png" 
                  alt="Aimy" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center text-2xl">⚙️</div>';
                  }}
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Aimy Settings</h2>
                <p className="text-sm text-slate-700">How Aimy understands you</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          
          {/* Aimy's Understanding */}
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-6 border" style={{borderColor: '#dafef4'}}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm ring-2 ring-white flex-shrink-0">
                <img 
                  src="/AiMy_LUMO_01.png" 
                  alt="Aimy" 
                  className="w-full h-full object-cover"
                  onError={(e) => e.target.style.display = 'none'}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-2">Aimy's Understanding</h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {aimeInsights?.insight || "Loading..."}
                </p>
              </div>
            </div>
          </div>

          {/* Your Profile */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Your Profile</h3>
              <button
                onClick={onEdit}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                ✏️ Edit
              </button>
            </div>

            {/* Role */}
            <div className="border rounded-lg p-4" style={{borderColor: '#dafef4'}}>
              <div className="text-xs text-slate-500 mb-1">Role</div>
              <div className="font-medium text-slate-900">
                {userProfile.role || 'Not set'}
              </div>
            </div>

            {/* Priorities */}
            <div className="border rounded-lg p-4" style={{borderColor: '#dafef4'}}>
              <div className="text-xs text-slate-500 mb-2">Top Priorities</div>
              <div className="flex flex-wrap gap-2">
                {userProfile.priorities && userProfile.priorities.length > 0 ? (
                  userProfile.priorities.map(priority => (
                    <span key={priority} className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
                      {priorityLabels[priority] || '•'} {priority}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 text-sm">No priorities set</span>
                )}
              </div>
            </div>

            {/* Decision Style */}
            <div className="border rounded-lg p-4" style={{borderColor: '#dafef4'}}>
              <div className="text-xs text-slate-500 mb-1">Decision Style</div>
              <div className="font-medium text-slate-900">
                {styleLabels[userProfile.decision_style] || 'Not set'}
              </div>
            </div>

            {/* Communication Style */}
            <div className="border rounded-lg p-4" style={{borderColor: '#dafef4'}}>
              <div className="text-xs text-slate-500 mb-1">Communication Style</div>
              <div className="font-medium text-slate-900">
                {commLabels[userProfile.communication_style] || 'Not set'}
              </div>
            </div>

            {/* Unsubscribe Preference */}
            <div className="border rounded-lg p-4" style={{borderColor: '#dafef4'}}>
              <div className="text-xs text-slate-500 mb-1">Newsletter Management</div>
              <div className="font-medium text-slate-900 text-sm">
                {userProfile.unsubscribe_preference === 'ask_before_unsubscribe' && 'Ask before unsubscribing'}
                {userProfile.unsubscribe_preference === 'auto_suggest_30days' && 'Auto-suggest after 30 days'}
                {userProfile.unsubscribe_preference === 'just_archive' && 'Just archive promotional emails'}
                {userProfile.unsubscribe_preference === 'manual' && 'Manual handling'}
                {!userProfile.unsubscribe_preference && 'Not set'}
              </div>
            </div>
          </div>

          {/* Data & Privacy */}
          <div className="border-t pt-6" style={{borderColor: '#dafef4'}}>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Data & Privacy</h3>
            <p className="text-sm text-slate-700 mb-4">
              Your profile and preferences are stored locally and used only to personalize Aimy's assistance. 
              You can delete your data anytime.
            </p>
            <button className="text-sm text-red-600 hover:text-red-700 font-medium">
              🗑️ Delete All Data
            </button>
          </div>
        </div>

        {/* Footer */}
        {!standalone && (
          <div className="p-8 border-t" style={{borderColor: '#dafef4'}}>
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-full font-semibold hover:from-teal-700 hover:to-emerald-700 transition-all shadow-md"
            >
              Done
            </button>
          </div>
        )}
      </div>
  );

  if (standalone) {
    return content;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {content}
    </div>
  );
};

export default AimySettings;