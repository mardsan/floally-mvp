import React from 'react';

const ProfileOverview = ({ profileData, userEmail, onRefresh }) => {
  if (!profileData || !profileData.profile) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">👋</div>
        <p className="text-slate-600">Complete onboarding to see your profile</p>
      </div>
    );
  }

  const { profile, learning_status, quick_stats, goals_progress } = profileData;

  const priorityIcons = {
    'Client work': '👥',
    'Team collaboration': '🤝',
    'Creative focus time': '🎨',
    'Strategic planning': '📋',
    'Learning & growth': '📚',
    'Product development': '🚀'
  };

  const commStyles = {
    'concise_direct': { label: 'Concise & Direct', icon: '⚡' },
    'warm_friendly': { label: 'Warm & Friendly', icon: '😊' },
    'formal_professional': { label: 'Formal & Professional', icon: '👔' },
    'casual_conversational': { label: 'Casual & Conversational', icon: '💭' }
  };

  const decisionStyles = {
    'options_with_context': { label: 'Options with Context', icon: '⚖️' },
    'just_recommend': { label: 'Just Recommend', icon: '🎯' },
    'ask_questions': { label: 'Ask Questions', icon: '💬' },
    'show_data': { label: 'Show Data', icon: '📊' }
  };

  return (
    <div className="space-y-6">
      
      {/* Quick Stats Cards */}
      {quick_stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-4 border" style={{borderColor: '#dafef4'}}>
            <div className="text-2xl mb-2">⭐</div>
            <div className="text-2xl font-bold text-teal-700">{quick_stats.emails_marked_important}</div>
            <div className="text-xs text-slate-600">Marked Important</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
            <div className="text-2xl mb-2">📥</div>
            <div className="text-2xl font-bold text-blue-700">{quick_stats.emails_archived}</div>
            <div className="text-xs text-slate-600">Emails Archived</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
            <div className="text-2xl mb-2">📧</div>
            <div className="text-2xl font-bold text-purple-700">{quick_stats.responses_drafted}</div>
            <div className="text-xs text-slate-600">Responses Drafted</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
            <div className="text-2xl mb-2">🚫</div>
            <div className="text-2xl font-bold text-orange-700">{quick_stats.newsletters_unsubscribed}</div>
            <div className="text-xs text-slate-600">Unsubscribed</div>
          </div>
        </div>
      )}

      {/* Profile Details */}
      <div className="bg-white rounded-xl border p-6" style={{borderColor: '#dafef4'}}>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Profile</h3>
        
        <div className="space-y-4">
          {/* Role */}
          {profile.role && (
            <div>
              <div className="text-xs text-slate-500 mb-1">Role</div>
              <div className="font-medium text-slate-900">{profile.role}</div>
            </div>
          )}

          {/* Priorities */}
          {profile.priorities && profile.priorities.length > 0 && (
            <div>
              <div className="text-xs text-slate-500 mb-2">Top Priorities</div>
              <div className="flex flex-wrap gap-2">
                {profile.priorities.map((priority, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
                    {priorityIcons[priority] || '•'} {priority}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Communication Style */}
          {profile.communication_style && (
            <div>
              <div className="text-xs text-slate-500 mb-1">Communication Style</div>
              <div className="font-medium text-slate-900">
                {commStyles[profile.communication_style]?.icon} {commStyles[profile.communication_style]?.label || profile.communication_style}
              </div>
            </div>
          )}

          {/* Decision Style */}
          {profile.decision_style && (
            <div>
              <div className="text-xs text-slate-500 mb-1">Decision Making</div>
              <div className="font-medium text-slate-900">
                {decisionStyles[profile.decision_style]?.icon} {decisionStyles[profile.decision_style]?.label || profile.decision_style}
              </div>
            </div>
          )}

          {/* Work Hours */}
          {profile.work_hours && (
            <div>
              <div className="text-xs text-slate-500 mb-1">Work Hours</div>
              <div className="font-medium text-slate-900">
                🕐 {profile.work_hours.start || '9:00'} - {profile.work_hours.end || '18:00'} {profile.timezone ? `(${profile.timezone})` : ''}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Aime's Understanding */}
      <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-6 border" style={{borderColor: '#dafef4'}}>
        <div className="flex items-start gap-3">
          <span className="text-3xl">💡</span>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900 mb-2">Aime's Understanding</h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              {profile.role ? (
                <>
                  You're a <strong>{profile.role}</strong> who values{' '}
                  {profile.priorities && profile.priorities.length > 0 ? (
                    <>
                      <strong>{profile.priorities.slice(0, 2).join(', ')}</strong>
                      {profile.priorities.length > 2 && `, and ${profile.priorities[2]}`}
                    </>
                  ) : 'your work'}.
                  {' '}
                  {profile.communication_style && (
                    <>
                      You prefer {commStyles[profile.communication_style]?.label.toLowerCase()} communication.
                      {' '}
                    </>
                  )}
                  {profile.decision_style && (
                    <>
                      When making decisions, you like to {decisionStyles[profile.decision_style]?.label.toLowerCase()}.
                    </>
                  )}
                </>
              ) : (
                "Complete your onboarding to help Aime understand your preferences and working style."
              )}
            </p>
            {learning_status && (
              <p className="text-xs text-slate-600 mt-2">
                💭 {learning_status.confidence_message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Goals Progress */}
      {goals_progress && goals_progress.length > 0 && (
        <div className="bg-white rounded-xl border p-6" style={{borderColor: '#dafef4'}}>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Goals</h3>
          <div className="space-y-4">
            {goals_progress.map((goalProgress, idx) => {
              const { goal, progress_percent, current, target } = goalProgress;
              const isComplete = progress_percent >= 100;
              
              return (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-900">
                      {isComplete ? '✅' : '🔄'} {goal.goal_text}
                    </span>
                    <span className="text-sm text-slate-600">
                      {current || 0} / {target || 0} {goal.unit || ''}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isComplete ? 'bg-green-500' : 'bg-teal-500'
                      }`}
                      style={{ width: `${Math.min(progress_percent, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-500">
                    {progress_percent}% complete
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No goals yet */}
      {(!goals_progress || goals_progress.length === 0) && (
        <div className="bg-slate-50 rounded-xl p-6 text-center">
          <div className="text-3xl mb-2">🎯</div>
          <p className="text-slate-600 text-sm">
            Set goals to track your progress with Aime
          </p>
          <button className="mt-3 px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 transition-all">
            + Add Goal
          </button>
        </div>
      )}

    </div>
  );
};

export default ProfileOverview;
