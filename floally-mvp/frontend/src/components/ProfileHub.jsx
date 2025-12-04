import React, { useState, useEffect } from 'react';
import { insights, profile, userProfile } from '../services/api';
import AimySettings from './AimeSettings';
import TrustedContactsManager from './TrustedContactsManager';
import Button from './Button';
import Card from './Card';
import Icon from './Icon';

const ProfileHub = ({ userEmail }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Deployment marker - Nov 10 2025 - Design System Upgrade
  console.log('ProfileHub loaded - v0.1.1 with Design System');
  
  // Force Vite to include TrustedContactsManager in bundle
  if (false) { console.log(TrustedContactsManager); }
  
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
    { id: 'overview', label: 'Overview', icon: 'contacts' },
    { id: 'insights', label: 'Insights', icon: 'check' },
    { id: 'contacts', label: 'Trusted Contacts', icon: 'partnership' },
    { id: 'integrations', label: 'Integrations', icon: 'note' },
    { id: 'settings', label: 'Settings', icon: null },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-aimi-lumo-green-50 via-white to-aimi-glow-coral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-700">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-aimi-lumo-green-50 via-white to-aimi-glow-coral-50 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header - Hidden on mobile since modal already has title */}
        <div className="hidden sm:block mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/AiMy_LUMO_01.png" 
              alt="Aimi" 
              className="w-16 h-16 rounded-full mr-4 shadow-glow"
            />
            <div className="text-left">
              <h1 className="text-3xl font-bold text-gray-800">Profile Hub</h1>
              <p className="text-gray-700">Manage your Hey Aimi experience</p>
            </div>
          </div>
        </div>

        {/* Mobile header - compact version */}
        <div className="sm:hidden mb-4 flex items-center gap-3 px-2">
          <img 
            src="/AiMy_LUMO_01.png" 
            alt="Aimi" 
            className="w-10 h-10 rounded-full shadow-glow"
          />
          <p className="text-sm text-gray-700">Manage your Hey Aimi experience</p>
        </div>

        {/* Tab Navigation */}
        <Card variant="elevated" padding="none" className="mb-6 overflow-hidden">
          {/* Mobile Dropdown (< md breakpoint) */}
          <div className="md:hidden border-b border-gray-200 p-3">
            <label htmlFor="mobile-tab-select" className="sr-only">Select Tab</label>
            <select
              id="mobile-tab-select"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full px-4 py-3 text-base font-medium border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-white appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem'
              }}
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop Tabs (md+ breakpoint) */}
          <div className="hidden md:flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-center font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-aimi-lumo-green-50 text-primary border-b-2 border-primary'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {tab.icon ? (
                    <Icon name={tab.icon} size="sm" className={activeTab === tab.id ? 'text-primary' : 'text-gray-500'} />
                  ) : (
                    <span className="text-xl">⚙️</span>
                  )}
                  {tab.label}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Tab Content */}
        <Card variant="elevated" padding="lg">
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
        </Card>
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
      <Card variant="gradient" padding="lg" className="border border-aimi-lumo-green-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{user_info.email}</h2>
        {user_info.role && (
          <p className="text-lg text-gray-700 mb-4">
            <span className="font-semibold">Role:</span> {user_info.role}
          </p>
        )}
        {aimy_understanding && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-aimi-lumo-green-200">
            <h3 className="font-semibold text-primary mb-2 flex items-center">
              <img src="/AiMy_LUMO_01.png" alt="Aimi" className="w-6 h-6 rounded-full mr-2" />
              Aimi's Understanding of You
            </h3>
            <p className="text-gray-700 italic">{aimy_understanding}</p>
          </div>
        )}
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          icon="Mail" 
          label="Total Actions" 
          value={quick_stats?.total_actions || 0}
          color="primary"
        />
        <StatCard 
          icon="check" 
          label="Recent (7d)" 
          value={quick_stats?.recent_actions_7d || 0}
          color="accent"
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
  // Debug: Log what data we're receiving
  console.log('InsightsTab data:', data);
  
  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">Loading insights...</p>
        <p className="text-sm text-gray-400">Analyzing your behavior patterns</p>
      </div>
    );
  }
  
  if (!data.insights) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">Start using Hey Aimi to build your behavioral insights!</p>
        <p className="text-sm text-gray-400">Take actions on emails, projects, and tasks to help Aimi learn your preferences.</p>
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
            <p className="text-sm text-gray-700">Confidence</p>
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
            <p className="text-sm text-gray-700 mt-1">
              of {insightsData.response_patterns.total_decisions} decisions
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-2">Archive Rate</h4>
            <p className="text-3xl font-bold text-gray-700">
              {insightsData.response_patterns.archive_rate?.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-700 mt-1">
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
                      className="w-full bg-teal-600 rounded-t hover:bg-teal-700 transition-colors relative group"
                      style={{ height: `${height}%`, minHeight: count > 0 ? '8px' : '0' }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {count} actions
                      </div>
                    </div>
                    <span className="text-xs text-gray-700 mt-2">{new Date(date).getDate()}</span>
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
        <p className="text-gray-700">Manage which services Hey Aimi can access</p>
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
                <p className="text-gray-700 mb-3">{integration.description}</p>
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
                  className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
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
        <p className="text-gray-700">Customize how Aimi works for you</p>
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
            <p className="text-sm text-gray-700 mt-1">Configure how and when you receive notifications</p>
          </button>
          <button className="w-full text-left px-4 py-3 bg-white rounded border border-gray-300 hover:border-teal-400 transition-colors">
            <span className="font-medium text-gray-800">🔒 Privacy & Data</span>
            <p className="text-sm text-gray-700 mt-1">Manage your data and privacy settings</p>
          </button>
          <button className="w-full text-left px-4 py-3 bg-white rounded border border-gray-300 hover:border-red-400 transition-colors">
            <span className="font-medium text-red-600">⚠️ Delete Account</span>
            <p className="text-sm text-gray-700 mt-1">Permanently delete your account and all data</p>
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const StatCard = ({ icon, label, value, color }) => {
  const colorClasses = {
    primary: 'bg-aimi-lumo-green-50 border-aimi-lumo-green-200 text-primary',
    accent: 'bg-emerald-50 border-emerald-200 text-accent',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
  };

  return (
    <Card variant="bordered" className={`${colorClasses[color] || colorClasses.primary}`}>
      <CardBody className="p-4">
        <Icon name={icon} size="xl" className="mb-2" />
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm opacity-80">{label}</div>
      </CardBody>
    </Card>
  );
};

const ActionBar = ({ action, count, total }) => {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  
  const actionColors = {
    focus: 'bg-primary',
    archive: 'bg-gray-500',
    respond: 'bg-blue-500',
    unsubscribe: 'bg-red-500',
    not_interested: 'bg-yellow-500',
  };

  const actionIcons = {
    focus: 'star',
    archive: 'note',
    respond: 'chat',
    unsubscribe: 'Mail',
    not_interested: 'check',
  };

  const actionLabels = {
    focus: 'Focus',
    archive: 'Archive',
    respond: 'Respond',
    unsubscribe: 'Unsubscribe',
    not_interested: 'Not Interested',
  };

  return (
    <div>
      <div className="flex justify-between items-center text-sm mb-1">
        <span className="font-medium text-gray-700 flex items-center gap-2">
          <Icon name={actionIcons[action] || 'check'} size="sm" />
          {actionLabels[action] || action}
        </span>
        <span className="text-gray-700">{count} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-lg h-3 overflow-hidden">
        <div 
          className={`h-full ${actionColors[action] || 'bg-gray-400'} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProfileHub;
