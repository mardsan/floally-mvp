import React from 'react';

const BehavioralInsights = ({ insights, profileData, userEmail }) => {
  if (!insights || !insights.insights || insights.insights.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📊</div>
        <p className="text-slate-700 mb-2">Not enough data yet</p>
        <p className="text-sm text-slate-500">
          Keep using Aime's quick actions to build behavioral insights!
        </p>
        <p className="text-xs text-slate-400 mt-2">
          Aime needs at least 50 actions to start detecting patterns
        </p>
      </div>
    );
  }

  const { insights: insightsList, recommendations } = insights;
  const { learning_status, behavioral_insights } = profileData || {};

  return (
    <div className="space-y-6">
      
      {/* Learning Progress */}
      {learning_status && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🧠</span>
            <div>
              <h3 className="font-semibold text-slate-900">Learning Status</h3>
              <p className="text-sm text-slate-700">{learning_status.confidence_message}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold text-purple-700">{learning_status.total_actions}</div>
              <div className="text-xs text-slate-700">Total Actions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-700">{learning_status.days_active}</div>
              <div className="text-xs text-slate-700">Days Active</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${
                learning_status.confidence_level === 'high' ? 'text-green-700' :
                learning_status.confidence_level === 'medium' ? 'text-yellow-700' : 'text-blue-700'
              }`}>
                {learning_status.confidence_level === 'high' ? '⭐⭐⭐' :
                 learning_status.confidence_level === 'medium' ? '⭐⭐' : '⭐'}
              </div>
              <div className="text-xs text-slate-700">Confidence</div>
            </div>
          </div>
        </div>
      )}

      {/* Insights Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">What Aime Has Learned</h3>
        
        {insightsList.map((insight, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl border p-5 hover:shadow-md transition-all"
            style={{borderColor: '#dafef4'}}
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">{insight.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{insight.category}</h4>
                  {insight.metric_value && (
                    <span className="text-2xl font-bold text-teal-600">
                      {insight.metric_value}{insight.unit ? ` ${insight.unit}` : ''}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-700">{insight.insight}</p>
                
                {/* Details (for VIP senders) */}
                {insight.details && insight.details.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {insight.details.map((detail, detailIdx) => (
                      <div key={detailIdx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                        <span className="text-sm text-slate-700">{detail.sender}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-teal-600 h-2 rounded-full"
                              style={{ width: `${detail.score * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-teal-600">
                            {Math.round(detail.score * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">💡 Aime's Recommendations</h3>
          
          {recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">
                      {rec.type === 'auto_important' && '⭐'}
                      {rec.type === 'unsubscribe' && '🚫'}
                      {rec.type === 'archive' && '📥'}
                    </span>
                    <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-semibold">
                      {Math.round(rec.confidence * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">{rec.message}</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-all">
                    Apply
                  </button>
                  <button className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition-all">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Breakdown Chart */}
      {behavioral_insights && behavioral_insights.action_breakdown && (
        <div className="bg-white rounded-xl border p-6" style={{borderColor: '#dafef4'}}>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Action Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(behavioral_insights.action_breakdown).map(([action, count]) => {
              const total = Object.values(behavioral_insights.action_breakdown).reduce((a, b) => a + b, 0);
              const percentage = (count / total) * 100;
              
              const actionConfig = {
                important: { label: 'Marked Important', color: 'bg-teal-600', icon: '⭐' },
                unimportant: { label: 'Not Interested', color: 'bg-slate-400', icon: '❌' },
                archive: { label: 'Archived', color: 'bg-blue-500', icon: '📥' },
                respond: { label: 'Responded', color: 'bg-purple-500', icon: '📧' },
                unsubscribe: { label: 'Unsubscribed', color: 'bg-orange-500', icon: '🚫' },
                trash: { label: 'Trashed', color: 'bg-red-500', icon: '🗑️' }
              };
              
              const config = actionConfig[action] || { label: action, color: 'bg-slate-500', icon: '•' };
              
              return (
                <div key={action}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-700">
                      {config.icon} {config.label}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      {count} ({Math.round(percentage)}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`${config.color} h-2 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Newsletter Stats */}
      {behavioral_insights && behavioral_insights.newsletter_stats && (
        <div className="bg-white rounded-xl border p-6" style={{borderColor: '#dafef4'}}>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">📰 Newsletter Management</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-slate-700">
                {behavioral_insights.newsletter_stats.total_newsletters}
              </div>
              <div className="text-xs text-slate-700">Total Newsletters</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-700">
                {behavioral_insights.newsletter_stats.unsubscribed}
              </div>
              <div className="text-xs text-slate-700">Unsubscribed</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BehavioralInsights;
