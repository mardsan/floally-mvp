import React, { useState, useEffect } from 'react';
import { ai } from '../services/api';

const StandupDashboard = ({ user, userAvatar, userName, messages, events, userProfile }) => {
  const [userFocusStatus, setUserFocusStatus] = useState('not_started');
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [selectedFocus, setSelectedFocus] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [aimyWork, setAimyWork] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [standupData, setStandupData] = useState(null);

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
        }
      ],
      needsFromYou: []
    }
  };

  useEffect(() => {
    // Load real standup data from API when component mounts
    if (messages && events) {
      loadStandupData();
    } else {
      // Fallback to mock data if no messages/events provided
      setSelectedFocus(mockStandupData.user.theOneThing);
      setAimyWork(mockStandupData.aimy);
    }
  }, []);

  const loadStandupData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Loading standup analysis from API...');
      const apiUrl = import.meta.env.VITE_API_URL || 'https://floally-mvp-production.up.railway.app';
      
      // Use the comprehensive standup analysis endpoint
      const response = await fetch(`${apiUrl}/api/standup/analyze`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_email: user?.email
        })
      });
      
      if (!response.ok) {
        throw new Error(`Standup analysis failed: ${response.status}`);
      }
      
      const analysis = await response.json();
      console.log('✅ AI Standup analysis loaded:', analysis);
      
      setStandupData(analysis);
      
      // Transform AI analysis into component state
      const theOneThing = analysis.the_one_thing || {};
      const secondaryPriorities = analysis.secondary_priorities || [];
      const aimyHandling = analysis.aimy_handling || [];
      
      setSelectedFocus({
        title: theOneThing.title || "Check in with Aimy",
        description: theOneThing.description || "Your inbox is clear!",
        context: `Category: ${theOneThing.project || 'general'}\nUrgency: ${theOneThing.urgency || 0}/100\n\n${analysis.reasoning || ''}`,
        urgency: theOneThing.urgency || 0,
        project: theOneThing.project || 'general',
        nextStep: theOneThing.action || "Review your priorities",
        estimatedTime: '2-3 hours'
      });
      
      // Map secondary priorities to alternatives
      setAlternatives(secondaryPriorities.map((priority, index) => ({
        rank: index + 2,
        title: priority.title,
        reasoning: priority.action || 'Alternative priority',
        importance: priority.urgency || 50,
        canDefer: priority.urgency < 70
      })));
      
      setAimyWork({
        handling: aimyHandling.map(item => ({
          type: item.status || 'monitoring',
          title: item.task,
          reasoning: `Status: ${item.status}`,
          impact: 'Handled autonomously',
          urgency: 'medium',
          items: item.emails || []
        })),
        plan: analysis.daily_plan?.map(item => ({
          task: item.task,
          scheduledTime: item.time,
          description: `Duration: ${item.duration}`,
          status: 'scheduled'
        })) || [],
        needsFromYou: []
      });
      
    } catch (err) {
      console.error('❌ Failed to load standup:', err);
      setError(err.message);
      // Fallback to mock data on error
      setSelectedFocus(mockStandupData.user.theOneThing);
      setAimyWork(mockStandupData.aimy);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading your standup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="text-red-600">⚠️</span>
            <p className="text-sm text-red-700">Failed to load standup: {error}</p>
            <button
              onClick={loadStandupData}
              className="ml-auto text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
      
      {/* Aimy's Standup Text Banner */}
      {standupData && standupData.standup && (
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-teal-200 px-6 py-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🤖</span>
            <div className="flex-1">
              <h4 className="font-bold text-teal-900 mb-2">Aimy's Daily Brief:</h4>
              <div className="text-sm text-teal-800 whitespace-pre-wrap max-h-48 overflow-y-auto pr-2">
                {standupData.standup}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-2">
              🌅 Daily Partnership
            </h2>
            <p className="text-teal-100 mt-1">{getCurrentDate()}</p>
          </div>
          <div className="text-sm text-teal-100">
            Last sync: 2 minutes ago
          </div>
        </div>
      </div>

      {/* Main Content - Split View */}
      <div className="grid lg:grid-cols-2 gap-6 p-6">
        {/* LEFT PANEL: YOUR FOCUS TODAY */}
        <div className="space-y-6">
          {/* User Avatar & Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-blue-200 bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
              ) : (
                userName?.charAt(0).toUpperCase() || '👤'
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Your Focus Today</h3>
              <p className="text-sm text-gray-700">{userName || 'You'}</p>
            </div>
          </div>

          {/* The One Thing Card */}
          <div className={`bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 shadow-md border-2 ${
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

            <h4 className="text-xl font-bold text-gray-900 mb-3">{selectedFocus.title}</h4>

            <div className="space-y-2 mb-4 text-sm">
              <div className="text-gray-700">
                <span className="font-medium">From:</span> {selectedFocus.source}
              </div>
              <div className="text-gray-700">
                <span className="font-medium">Due:</span> {selectedFocus.dueTime}
              </div>
              <div className="text-gray-700">
                <span className="font-medium">Estimate:</span> {selectedFocus.timeEstimate}
              </div>
            </div>

            {/* Aimy's Reasoning */}
            <div className="bg-white bg-opacity-70 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2 mb-2">
                <span className="text-lg">🤖</span>
                <span className="text-sm font-semibold text-teal-700">Why Aimy picked this:</span>
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
                  <p className="text-sm text-gray-700 mt-1">Aimy will summarize your day at 5pm</p>
                </div>
              )}
            </div>
          </div>

          {/* Alternatives Modal */}
          {showAlternatives && (
            <div className="bg-white rounded-lg p-6 shadow-lg border-2 border-yellow-300">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Alternative Focus Options</h4>
              <p className="text-sm text-gray-700 mb-4">
                These are also important. Want to switch your focus?
              </p>
              <div className="space-y-3">
                {(alternatives.length > 0 ? alternatives : mockStandupData.user.alternatives).map((alt, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 cursor-pointer border border-gray-200"
                       onClick={() => handleSelectAlternative(alt)}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{alt.rank === 2 ? '2️⃣' : alt.rank === 3 ? '3️⃣' : `${alt.rank}️⃣`}</span>
                          <h5 className="font-semibold text-gray-800">{alt.title}</h5>
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
              <h4 className="text-lg font-bold text-gray-800 mb-4">📊 Your Other Priorities</h4>
              <div className="space-y-3">
                {(alternatives.length > 0 ? alternatives : mockStandupData.user.secondaryPriorities).map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="text-xl">{item.rank === 2 ? '2️⃣' : item.rank === 3 ? '3️⃣' : `${item.rank}️⃣`}</span>
                    <div>
                      <p className="text-gray-800 font-medium">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.note || item.reasoning || `Importance: ${item.importance}/100`}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: AIMY'S WORK TODAY */}
        <div className="space-y-6">
          {/* Aimy Avatar & Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-teal-200 bg-white shadow-lg">
              <img 
                src="/okaimy-pfp-01.png" 
                alt="Aimy" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center text-white text-2xl font-bold">A</div>';
                }}
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Aimy's Work Today</h3>
              <p className="text-sm text-gray-700">Your AI Partner</p>
            </div>
          </div>

          {/* Currently Handling */}
          <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-lg p-6 shadow-md">
            <h4 className="text-lg font-bold text-teal-800 mb-4 flex items-center gap-2">
              <span className="text-xl">🔄</span>
              Currently Handling
            </h4>
            <div className="space-y-4">
              {aimyWork.handling.map((task, idx) => (
                <div key={idx} className="bg-white bg-opacity-70 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h5 className="font-semibold text-gray-800">{task.category}</h5>
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
              <h4 className="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2">
                <span className="text-xl">✋</span>
                Awaiting Your Approval
              </h4>
              <div className="space-y-4">
                {aimyWork.approvals.map((approval) => (
                  <div key={approval.id} className="bg-white rounded-lg p-4">
                    <h5 className="font-semibold text-gray-800 mb-2">{approval.title}</h5>
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

          {/* Aimy's Daily Plan */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-xl">📋</span>
              Aimy's Daily Plan
            </h4>
            <div className="space-y-3">
              {aimyWork.plan.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <span className={`text-xl ${
                    item.status === 'active' ? '🟢' :
                    item.status === 'scheduled' ? '⏰' : '⚪'
                  }`}></span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-gray-800">{item.task}</h5>
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
        </div>
      </div>

      {/* Quick Links Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
        <div className="flex gap-4">
          <a href="#inbox" className="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center gap-2">
            📧 View Inbox
          </a>
          <a href="#calendar" className="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center gap-2">
            📅 Calendar
          </a>
          <a href="#tasks" className="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center gap-2">
            ✓ Tasks
          </a>
        </div>
        <button
          onClick={loadStandupData}
          disabled={loading}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '⏳ Loading...' : '🔄 Refresh'}
        </button>
      </div>
    </div>
  );
};

export default StandupDashboard;
