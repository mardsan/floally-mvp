import React, { useState, useEffect } from 'react';
import { profile } from '../services/api';
import ProfileOverview from '../components/profile/ProfileOverview';
import BehavioralInsights from '../components/profile/BehavioralInsights';
import IntegrationsManager from '../components/profile/IntegrationsManager';
import SettingsPanel from '../components/profile/SettingsPanel';

const Profile = ({ userEmail, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [integrations, setIntegrations] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    loadProfileData();
  }, [userEmail]);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const [overviewRes, insightsRes, integrationsRes, settingsRes] = await Promise.all([
        profile.getOverview(userEmail),
        profile.getBehavioralInsights(userEmail),
        profile.getIntegrations(userEmail),
        profile.getSettings(userEmail)
      ]);

      setProfileData(overviewRes.data);
      setInsights(insightsRes.data);
      setIntegrations(integrationsRes.data);
      setSettings(settingsRes.data);
    } catch (error) {
      console.error('Failed to load profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '👤' },
    { id: 'insights', label: 'Behavioral Insights', icon: '🧠' },
    { id: 'integrations', label: 'Integrations', icon: '🔗' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full my-8">
        
        {/* Header */}
        <div className="p-8 border-b" style={{borderColor: '#dafef4', background: 'linear-gradient(to right, #dafef4, #e8fef9)'}}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center text-3xl shadow-lg">
                {profileData?.profile?.display_name ? 
                  profileData.profile.display_name.charAt(0).toUpperCase() : 
                  '👤'
                }
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900">
                  {profileData?.profile?.display_name || 'Your Profile'}
                </h2>
                {profileData?.profile?.role && (
                  <p className="text-slate-700 text-lg">
                    {profileData.profile.role}
                    {profileData.profile.company && ` @ ${profileData.profile.company}`}
                  </p>
                )}
                <p className="text-sm text-slate-600 mt-1">{userEmail}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-3xl"
            >
              ✕
            </button>
          </div>

          {/* Learning Status Badge */}
          {profileData?.learning_status && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/70 rounded-full">
              <span className="text-2xl">
                {profileData.learning_status.confidence_level === 'high' ? '🌟' :
                 profileData.learning_status.confidence_level === 'medium' ? '⭐' : '✨'}
              </span>
              <span className="text-sm font-medium text-slate-700">
                {profileData.learning_status.total_actions} actions tracked • {profileData.learning_status.days_active} days active
              </span>
              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                profileData.learning_status.confidence_level === 'high' ? 'bg-green-100 text-green-700' :
                profileData.learning_status.confidence_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {profileData.learning_status.confidence_level.toUpperCase()} CONFIDENCE
              </span>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="border-b" style={{borderColor: '#dafef4'}}>
          <div className="flex">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'text-teal-600 border-b-2 border-teal-500 bg-teal-50/50'
                    : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-8 max-h-[600px] overflow-y-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔄</div>
              <p className="text-slate-600">Loading your profile...</p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <ProfileOverview 
                  profileData={profileData}
                  userEmail={userEmail}
                  onRefresh={loadProfileData}
                />
              )}
              
              {activeTab === 'insights' && (
                <BehavioralInsights 
                  insights={insights}
                  profileData={profileData}
                  userEmail={userEmail}
                />
              )}
              
              {activeTab === 'integrations' && (
                <IntegrationsManager 
                  integrations={integrations}
                  userEmail={userEmail}
                  onRefresh={loadProfileData}
                />
              )}
              
              {activeTab === 'settings' && (
                <SettingsPanel 
                  settings={settings}
                  userEmail={userEmail}
                  onUpdate={loadProfileData}
                />
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t" style={{borderColor: '#dafef4', background: 'linear-gradient(to right, #fafffe, #f0fefb)'}}>
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-full font-semibold hover:from-teal-600 hover:to-emerald-600 transition-all shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
