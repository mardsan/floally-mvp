import React, { useState, useEffect } from 'react';

const Standup = ({ user, onClose }) => {
  const [userFocusStatus, setUserFocusStatus] = useState('not_started');
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [selectedFocus, setSelectedFocus] = useState(null);
  const [aimyWork, setAimyWork] = useState(null);

  // Mock data - will be replaced with real API calls
  const mockStandupData = {
    user: {
      theOneThing: {
        id: 'task_001',
        title: 'Finalize Q4 Budget Review',
        source: 'Gmail - Sarah Chen <sarah@company.com>',
        dueTime: 'Today at 5:00 PM',
        timeEstimate: '2-3 hours',
        status: 'not_started',
        reasoning: [
          'Due today with 5pm deadline',
          'Blocks team\'s Q4 planning tomorrow',
          'High stakeholder value (CFO requested)',
          'You have a 3-hour free block this afternoon'
        ],
        confidence: 0.95,
        relatedMessages: 5
      },
      alternatives: [
        {
          rank: 2,
          title: 'Review design mockups for new feature',
          reasoning: 'Design team is waiting, but deadline is flexible',
          importance: 75,
          canDefer: true
        },
        {
          rank: 3,
          title: 'Schedule team 1:1s for next week',
          reasoning: 'Important for team morale but timing is flexible',
          importance: 60,
          canDefer: true
        }
      ],
      secondaryPriorities: [
        {
          rank: 2,
          title: 'Review design mockups',
          note: '(if time permits)',
          status: 'optional'
        },
        {
          rank: 3,
          title: 'Schedule team 1:1s',
          note: '(this week)',
          status: 'optional'
        }
      ]
    },
    aimy: {
      handling: [
        {
          category: 'Email Management',
          count: 12,
          description: 'Low-priority emails',
          status: 'in_progress',
          details: [
            '3 newsletters → Archive',
            '5 promotional emails → Archive',
            '4 automated notifications → Mark read'
          ]
        },
        {
          category: 'Social Filtering',
          count: 3,
          description: 'Social media DMs',
          status: 'in_progress',
          details: [
            '2 LinkedIn messages → Filter spam',
            '1 Twitter DM → Review later'
          ]
        },
        {
          category: 'Calendar Management',
          count: 2,
          description: 'Meeting invites',
          status: 'completed',
          details: [
            'Team standup → Added to calendar',
            'Client call → Checked for conflicts'
          ]
        }
      ],
      approvals: [
        {
          id: 'approval_001',
          type: 'bulk_unsubscribe',
          title: 'Unsubscribe from 5 promotional lists',
          reasoning: 'You haven\'t opened these in 3 months',
          impact: 'Will reduce inbox noise by ~15 emails/week',
          urgency: 'low',
          items: [
            'Daily Deals Newsletter',
            'Tech Product Updates',
            'Marketing Tips Weekly',
            'Sale Alerts Daily',
            'Industry News Digest'
          ]
        }
      ],
      plan: [
        {
          task: 'Monitor inbox continuously',
          frequency: 'continuous',
          description: 'Watching for urgent/important messages',
          status: 'active'
        },
        {
          task: 'Surface urgent items',
          frequency: 'as_needed',
          description: 'Alert you if something critical arrives',
          status: 'active'
        },
        {
          task: 'End-of-day summary',
          scheduledTime: '5:00 PM',
          description: 'Summary of what I handled + tomorrow preview',
          status: 'scheduled'
        },
        {
          task: 'Prepare tomorrow\'s standup',
          scheduledTime: '11:00 PM',
          description: 'Analyze overnight messages, plan tomorrow',
          status: 'scheduled'
        }
      ],
      needsFromYou: [
        {
          type: 'clarification',
          question: 'Should I auto-archive all newsletters going forward?',
          context: 'You rarely open them, but want to confirm before automating',
          urgency: 'low'
        }
      ]
    }
  };

  useEffect(() => {
    // TODO: Fetch real standup data from API
    // For now, use mock data
    setSelectedFocus(mockStandupData.user.theOneThing);
    setAimyWork(mockStandupData.aimy);
  }, []);

  const handleStatusChange = (newStatus) => {
    setUserFocusStatus(newStatus);
    // TODO: Update backend with status change
  };

  const handleSwitchFocus = () => {
    setShowAlternatives(true);
  };

  const handleSelectAlternative = (alternative) => {
    setSelectedFocus({
      ...selectedFocus,
      title: alternative.title,
      reasoning: [alternative.reasoning]
    });
    setShowAlternatives(false);
    setUserFocusStatus('not_started');
    // TODO: Update backend with new focus
  };

  const handleApproval = (approvalId, action) => {
    console.log(`Approval ${approvalId}: ${action}`);
    // TODO: Send approval to backend
    // Remove from list after approval
    setAimyWork({
      ...aimyWork,
      approvals: aimyWork.approvals.filter(a => a.id !== approvalId)
    });
  };

  const getCurrentDate = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const now = new Date();
    return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'not_started': return '⚪';
      case 'in_progress': return '🟡';
      case 'completed': return '🟢';
      default: return '⚪';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'not_started': return 'Not Started';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return 'Not Started';
    }
  };

  if (!selectedFocus || !aimyWork) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-4 text-gray-700">Loading your standup...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6 rounded-t-lg z-10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                🌅 Daily Standup
              </h1>
              <p className="text-teal-100 mt-1">{getCurrentDate()}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-teal-800 rounded-lg p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main Content - Split View */}
        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* LEFT PANEL: YOUR FOCUS TODAY */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">👤</span>
              <h2 className="text-2xl font-bold text-gray-800">Your Focus Today</h2>
            </div>

            {/* The One Thing Card */}
            <div className={`bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 shadow-lg border-2 ${
              userFocusStatus === 'completed' ? 'border-green-500' :
              userFocusStatus === 'in_progress' ? 'border-yellow-500' :
              'border-blue-300'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">The One Thing</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(userFocusStatus)}
                  <span className="text-sm font-medium text-gray-700">{getStatusLabel(userFocusStatus)}</span>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">{selectedFocus.title}</h3>

              <div className="space-y-2 mb-4">
                <div className="text-sm text-gray-700">
                  <span className="font-medium">From:</span> {selectedFocus.source}
                </div>
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Due:</span> {selectedFocus.dueTime}
                </div>
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Estimate:</span> {selectedFocus.timeEstimate}
                </div>
              </div>

              {/* Aimi's Reasoning */}
              <div className="bg-white bg-opacity-70 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-lg">🤖</span>
                  <span className="text-sm font-semibold text-teal-700">Why Aimi picked this:</span>
                </div>
                <ul className="space-y-1 ml-7">
                  {selectedFocus.reasoning.map((reason, idx) => (
                    <li key={idx} className="text-sm text-gray-700 italic">• {reason}</li>
                  ))}
                </ul>
                <div className="mt-2 text-xs text-gray-500">
                  Confidence: {Math.round(selectedFocus.confidence * 100)}%
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {userFocusStatus === 'not_started' && (
                  <>
                    <button
                      onClick={() => handleStatusChange('in_progress')}
                      className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-3 rounded-lg font-semibold hover:from-teal-700 hover:to-teal-800 transition-all shadow-md"
                    >
                      ✅ Confirm & Start Working
                    </button>
                    <button
                      onClick={handleSwitchFocus}
                      className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      🔄 Switch to Different Focus
                    </button>
                  </>
                )}
                {userFocusStatus === 'in_progress' && (
                  <>
                    <button
                      onClick={() => handleStatusChange('completed')}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-md"
                    >
                      ✅ Mark as Complete
                    </button>
                    <button
                      onClick={() => handleStatusChange('not_started')}
                      className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      ⏸️ Pause / Not Started
                    </button>
                  </>
                )}
                {userFocusStatus === 'completed' && (
                  <div className="text-center py-4">
                    <div className="text-5xl mb-2">🎉</div>
                    <p className="text-lg font-bold text-green-700">Great work!</p>
                    <p className="text-sm text-gray-700 mt-1">Aimi will summarize your day at 5pm</p>
                  </div>
                )}
              </div>
            </div>

            {/* Alternatives Modal */}
            {showAlternatives && (
              <div className="bg-white rounded-lg p-6 shadow-lg border-2 border-yellow-300">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Alternative Focus Options</h3>
                <p className="text-sm text-gray-700 mb-4">
                  These are also important. Want to switch your focus?
                </p>
                <div className="space-y-3">
                  {mockStandupData.user.alternatives.map((alt, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 cursor-pointer border border-gray-200"
                         onClick={() => handleSelectAlternative(alt)}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{alt.rank === 2 ? '2️⃣' : '3️⃣'}</span>
                            <h4 className="font-semibold text-gray-800">{alt.title}</h4>
                          </div>
                          <p className="text-sm text-gray-700 italic ml-7">{alt.reasoning}</p>
                          <div className="text-xs text-gray-500 ml-7 mt-1">
                            Importance: {alt.importance}/100
                          </div>
                        </div>
                        <button className="text-teal-600 hover:text-teal-700 font-medium text-sm ml-4">
                          Select →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowAlternatives(false)}
                  className="w-full mt-4 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Secondary Priorities */}
            {!showAlternatives && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Your Other Priorities</h3>
                <div className="space-y-3">
                  {mockStandupData.user.secondaryPriorities.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="text-xl">{item.rank === 2 ? '2️⃣' : '3️⃣'}</span>
                      <div>
                        <p className="text-gray-800 font-medium">{item.title}</p>
                        <p className="text-sm text-gray-500">{item.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: AIMY'S WORK TODAY */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🤖</span>
              <h2 className="text-2xl font-bold text-gray-800">Aimi's Work Today</h2>
            </div>

            {/* Currently Handling */}
            <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-bold text-teal-800 mb-4 flex items-center gap-2">
                <span className="text-xl">🔄</span>
                Currently Handling
              </h3>
              <div className="space-y-4">
                {aimyWork.handling.map((task, idx) => (
                  <div key={idx} className="bg-white bg-opacity-70 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-800">{task.category}</h4>
                        <p className="text-sm text-gray-700">{task.description} ({task.count})</p>
                      </div>
                      <span className={`text-2xl ${
                        task.status === 'completed' ? '✅' :
                        task.status === 'in_progress' ? '🔄' : '⏸️'
                      }`}></span>
                    </div>
                    <details className="text-xs text-gray-700">
                      <summary className="cursor-pointer hover:text-gray-800">View details</summary>
                      <ul className="mt-2 ml-4 space-y-1">
                        {task.details.map((detail, detailIdx) => (
                          <li key={detailIdx}>• {detail}</li>
                        ))}
                      </ul>
                    </details>
                  </div>
                ))}
              </div>
            </div>

            {/* Awaiting Approval */}
            {aimyWork.approvals.length > 0 && (
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6 shadow-md border-2 border-yellow-300">
                <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2">
                  <span className="text-xl">✋</span>
                  Awaiting Your Approval
                </h3>
                <div className="space-y-4">
                  {aimyWork.approvals.map((approval) => (
                    <div key={approval.id} className="bg-white rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 mb-2">{approval.title}</h4>
                      <p className="text-sm text-gray-700 italic mb-2">{approval.reasoning}</p>
                      <p className="text-sm text-teal-700 mb-3">💡 {approval.impact}</p>
                      
                      <details className="text-xs text-gray-700 mb-3">
                        <summary className="cursor-pointer hover:text-gray-800 font-medium">
                          View {approval.items.length} items
                        </summary>
                        <ul className="mt-2 ml-4 space-y-1">
                          {approval.items.map((item, itemIdx) => (
                            <li key={itemIdx}>• {item}</li>
                          ))}
                        </ul>
                      </details>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproval(approval.id, 'approve')}
                          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          ✅ Approve All
                        </button>
                        <button
                          onClick={() => handleApproval(approval.id, 'reject')}
                          className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                        >
                          ❌ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Aimi's Daily Plan */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-xl">📋</span>
                Aimi's Daily Plan
              </h3>
              <div className="space-y-3">
                {aimyWork.plan.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className={`text-xl ${
                      item.status === 'active' ? '🟢' :
                      item.status === 'scheduled' ? '⏰' : '⚪'
                    }`}></span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-800">{item.task}</h4>
                        {item.scheduledTime && (
                          <span className="text-xs text-gray-500">{item.scheduledTime}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Needs From You */}
            {aimyWork.needsFromYou.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                  <span className="text-xl">❓</span>
                  Needs From You
                </h3>
                <div className="space-y-3">
                  {aimyWork.needsFromYou.map((need, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-4">
                      <p className="font-medium text-gray-800 mb-2">{need.question}</p>
                      <p className="text-sm text-gray-700 mb-3">{need.context}</p>
                      <button className="text-teal-600 hover:text-teal-700 font-medium text-sm">
                        Respond →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-100 px-6 py-4 rounded-b-lg flex justify-between items-center border-t">
          <div className="text-sm text-gray-700">
            ⏰ Last sync: <span className="font-medium">2 minutes ago</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
          >
            🔄 Refresh Standup
          </button>
        </div>
      </div>
    </div>
  );
};

export default Standup;
