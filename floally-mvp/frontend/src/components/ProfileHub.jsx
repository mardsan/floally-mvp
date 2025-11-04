import React, { useState, useEffect } from 'react';
import { insights, profile, userProfile } from '../services/api';
import AimySettings from './AimeSettings';
import TrustedContactsManager from './TrustedContactsManager';

const ProfileHub = ({ userEmail }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data states
  const [overviewData, setOverviewData] = useState(null);
  const [behavioralData, setBehavioralData] = useState(null);
  const [userProfileData, setUserProfileData] = useState(null);
  const [integrationsData, setIntegrationsData] = useState(null);

  useEffect(() => {
    loadData();
  }, [userEmail]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all data in parallel
      const [overview, behavioral, userProf, integrations] = await Promise.all([
        insights.getOverview(userEmail).catch(() => ({ data: null })),
        insights.getBehavioral(userEmail).catch(() => ({ data: null })),
        userProfile.getProfile(userEmail).catch(() => ({ data: null })),
        profile.getIntegrations(userEmail).catch(() => ({ data: {} })),
      ]);

      setOverviewData(overview.data);
      setBehavioralData(behavioral.data);
      setUserProfileData(userProf.data);
      setIntegrationsData(integrations.data);
    } catch (err) {
      console.error('Error loading profile hub data:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '👤' },
    { id: 'insights', label: 'Insights', icon: '📊' },
    { id: 'contacts', label: 'Trusted Contacts', icon: '🤝' },
    { id: 'integrations', label: 'Integrations', icon: '🔗' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/okaimy-pfp-01.png" 
              alt="Aimy" 
              className="w-16 h-16 rounded-full mr-4 shadow-lg"
            />
            <div className="text-left">
              <h1 className="text-3xl font-bold text-gray-800">Profile Hub</h1>
              <p className="text-gray-600">Manage your OkAimy experience</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {activeTab === 'overview' && (
            <OverviewTab 
              data={overviewData} 
              userProfile={userProfileData}
            />
          )}

          {activeTab === 'insights' && (
            <InsightsTab 
              data={behavioralData}
              userEmail={userEmail}
            />
          )}

          {activeTab === 'contacts' && (
            <TrustedContactsManager userEmail={userEmail} />
          )}

          {activeTab === 'integrations' && (
            <IntegrationsTab 
              data={integrationsData}
              userEmail={userEmail}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab 
              userProfile={userProfileData}
              userEmail={userEmail}
              onUpdate={loadData}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ data, userProfile }) => {
  if (!data || !data.user_info) {
    return <div className="text-center text-gray-500 py-8">No overview data available</div>;
  }

  const { user_info, quick_stats, aimy_understanding } = data;

  return (
    <div className="space-y-6">
      {/* User Info Card */}
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg p-6 border border-teal-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{user_info.email}</h2>
        {user_info.role && (
          <p className="text-lg text-gray-700 mb-4">
            <span className="font-semibold">Role:</span> {user_info.role}
          </p>
        )}
        {aimy_understanding && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-teal-200">
            <h3 className="font-semibold text-teal-700 mb-2 flex items-center">
              <img src="/okaimy-pfp-01.png" alt="Aimy" className="w-6 h-6 rounded-full mr-2" />
              Aimy's Understanding of You
            </h3>
            <p className="text-gray-700 italic">{aimy_understanding}</p>
          </div>
        )}
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          icon="📧" 
          label="Total Actions" 
          value={quick_stats?.total_actions || 0}
          color="blue"
        />
        <StatCard 
          icon="📈" 
          label="Recent (7d)" 
          value={quick_stats?.recent_actions_7d || 0}
          color="green"
        />
        <StatCard 
          icon="🎯" 
          label="Priorities Set" 
          value={quick_stats?.priorities_set || 0}
          color="purple"
        />
        <StatCard 
          icon="🔗" 
          label="Integrations" 
          value={quick_stats?.integrations_connected || 0}
          color="orange"
        />
      </div>

      {/* Onboarding Status */}
      {user_info.onboarding_completed ? (
        <div className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <span className="text-green-700 font-medium">✅ Onboarding Complete</span>
        </div>
      ) : (
        <div className="flex items-center justify-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <span className="text-yellow-700 font-medium">⚠️ Complete your onboarding to unlock all features</span>
        </div>
      )}
    </div>
  );
};

// Insights Tab Component
const InsightsTab = ({ data, userEmail }) => {
  if (!data || !data.insights) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">Start using OkAimy to build your behavioral insights!</p>
        <p className="text-sm text-gray-400">Take actions on emails to help Aimy learn your preferences.</p>
      </div>
    );
  }

  const { insights: insightsData, profile_context } = data;

  return (
    <div className="space-y-6">
      {/* Learning Status Banner */}
      <div className={`p-6 rounded-lg border-2 ${
        insightsData.learning_status === 'confident' ? 'bg-green-50 border-green-300' :
        insightsData.learning_status === 'active' ? 'bg-blue-50 border-blue-300' :
        'bg-yellow-50 border-yellow-300'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Learning Status: {insightsData.learning_status.toUpperCase()}
            </h3>
            <p className="text-gray-700">
              {insightsData.total_actions} total actions • {insightsData.days_active} days active
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-teal-600">
              {Math.round(insightsData.confidence_score)}%
            </div>
            <p className="text-sm text-gray-600">Confidence</p>
          </div>
        </div>
      </div>

      {/* Action Breakdown */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Action Breakdown</h3>
        <div className="space-y-3">
          {Object.entries(insightsData.action_breakdown || {}).map(([action, count]) => (
            <ActionBar 
              key={action}
              action={action}
              count={count}
              total={insightsData.total_actions}
            />
          ))}
        </div>
      </div>

      {/* Response Patterns */}
      {insightsData.response_patterns && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-teal-50 rounded-lg p-6 border border-teal-200">
            <h4 className="font-semibold text-teal-800 mb-2">Focus Rate</h4>
            <p className="text-3xl font-bold text-teal-600">
              {insightsData.response_patterns.focus_rate?.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600 mt-1">
              of {insightsData.response_patterns.total_decisions} decisions
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-2">Archive Rate</h4>
            <p className="text-3xl font-bold text-gray-600">
              {insightsData.response_patterns.archive_rate?.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600 mt-1">
              of {insightsData.response_patterns.total_decisions} decisions
            </p>
          </div>
        </div>
      )}

      {/* Top Senders */}
      {insightsData.top_senders && insightsData.top_senders.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Senders</h3>
          <div className="space-y-2">
            {insightsData.top_senders.slice(0, 5).map((sender, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white rounded border border-gray-200">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '📧'}</span>
                  <span className="font-medium text-gray-800">{sender.sender}</span>
                </div>
                <span className="text-teal-600 font-semibold">{sender.actions} actions</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Activity Chart (Simple Version) */}
      {insightsData.daily_activity && Object.keys(insightsData.daily_activity).length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity (Last 7 Days)</h3>
          <div className="flex items-end justify-between h-40 gap-2">
            {Object.entries(insightsData.daily_activity)
              .slice(-7)
              .map(([date, count]) => {
                const maxCount = Math.max(...Object.values(insightsData.daily_activity));
                const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                return (
                  <div key={date} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-teal-500 rounded-t hover:bg-teal-600 transition-colors relative group"
                      style={{ height: `${height}%`, minHeight: count > 0 ? '8px' : '0' }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {count} actions
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 mt-2">{new Date(date).getDate()}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

// Integrations Tab Component
const IntegrationsTab = ({ data, userEmail }) => {
  const integrations = [
    {
      id: 'gmail',
      name: 'Gmail',
      icon: '📧',
      description: 'Access and manage your email',
      connected: data?.gmail_connected || true,
      scopes: ['Read emails', 'Send emails', 'Manage labels']
    },
    {
      id: 'calendar',
      name: 'Google Calendar',
      icon: '📅',
      description: 'View and manage your calendar',
      connected: data?.calendar_connected || true,
      scopes: ['Read events', 'Create events', 'Update events']
    },
    {
      id: 'slack',
      name: 'Slack',
      icon: '💬',
      description: 'Get notifications and updates',
      connected: data?.slack_connected || false,
      scopes: ['Send messages', 'Read channels'],
      comingSoon: true
    },
    {
      id: 'notion',
      name: 'Notion',
      icon: '📝',
      description: 'Sync tasks and notes',
      connected: data?.notion_connected || false,
      scopes: ['Read pages', 'Create pages'],
      comingSoon: true
    }
  ];

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Connected Services</h2>
        <p className="text-gray-600">Manage which services OkAimy can access</p>
      </div>

      {integrations.map((integration) => (
        <div 
          key={integration.id}
          className={`p-6 rounded-lg border-2 ${
            integration.connected 
              ? 'bg-green-50 border-green-300' 
              : 'bg-gray-50 border-gray-200'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <span className="text-4xl mr-4">{integration.icon}</span>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-1">
                  {integration.name}
                  {integration.comingSoon && (
                    <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      Coming Soon
                    </span>
                  )}
                </h3>
                <p className="text-gray-600 mb-3">{integration.description}</p>
                <div className="flex flex-wrap gap-2">
                  {integration.scopes.map((scope) => (
                    <span 
                      key={scope}
                      className="text-xs bg-white px-2 py-1 rounded border border-gray-300 text-gray-700"
                    >
                      {scope}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div>
              {integration.connected ? (
                <button 
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  disabled={integration.id === 'gmail'} // Can't disconnect Gmail
                >
                  {integration.id === 'gmail' ? 'Required' : 'Disconnect'}
                </button>
              ) : (
                <button 
                  className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
                  disabled={integration.comingSoon}
                >
                  {integration.comingSoon ? 'Coming Soon' : 'Connect'}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Settings Tab Component
const SettingsTab = ({ userProfile, userEmail, onUpdate }) => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Settings & Preferences</h2>
        <p className="text-gray-600">Customize how Aimy works for you</p>
      </div>

      {/* Embed AimySettings component */}
      <AimySettings 
        userEmail={userEmail}
        onClose={() => {}}
        standalone={true}
      />

      {/* Additional Settings Sections */}
      <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Management</h3>
        <div className="space-y-3">
          <button className="w-full text-left px-4 py-3 bg-white rounded border border-gray-300 hover:border-teal-400 transition-colors">
            <span className="font-medium text-gray-800">🔔 Notification Preferences</span>
            <p className="text-sm text-gray-600 mt-1">Configure how and when you receive notifications</p>
          </button>
          <button className="w-full text-left px-4 py-3 bg-white rounded border border-gray-300 hover:border-teal-400 transition-colors">
            <span className="font-medium text-gray-800">🔒 Privacy & Data</span>
            <p className="text-sm text-gray-600 mt-1">Manage your data and privacy settings</p>
          </button>
          <button className="w-full text-left px-4 py-3 bg-white rounded border border-gray-300 hover:border-red-400 transition-colors">
            <span className="font-medium text-red-600">⚠️ Delete Account</span>
            <p className="text-sm text-gray-600 mt-1">Permanently delete your account and all data</p>
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const StatCard = ({ icon, label, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${colorClasses[color] || colorClasses.blue}`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm opacity-80">{label}</div>
    </div>
  );
};

const ActionBar = ({ action, count, total }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  const actionColors = {
    focus: 'bg-teal-500',
    archive: 'bg-gray-500',
    respond: 'bg-blue-500',
    unsubscribe: 'bg-red-500',
    not_interested: 'bg-yellow-500',
  };

  const actionLabels = {
    focus: '⭐ Focus',
    archive: '📦 Archive',
    respond: '💬 Respond',
    unsubscribe: '🚫 Unsubscribe',
    not_interested: '👎 Not Interested',
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{actionLabels[action] || action}</span>
        <span className="text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div 
          className={`h-full ${actionColors[action] || 'bg-gray-400'} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProfileHub;
