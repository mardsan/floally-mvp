import { useState, useEffect } from 'react';
import AvatarSelector from './AvatarSelector';
import DeleteProfileModal from './DeleteProfileModal';

function ProfileSettings({ user, onClose, onProfileUpdate, onSave }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Modal states
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Profile data
  const [profileData, setProfileData] = useState({
    display_name: '',
    email: '',
    avatar_url: '',
    role: '',
    company: '',
    priorities: [],
    decision_style: '',
    communication_style: '',
    unsubscribe_preference: '',
    work_hours: { start: '09:00', end: '18:00' },
    timezone: 'America/Los_Angeles'
  });
  
  // Connected accounts
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  
  // Settings
  const [settings, setSettings] = useState({
    ai_preferences: {},
    notification_preferences: {},
    privacy_settings: {}
  });

  useEffect(() => {
    loadProfileData();
    loadConnectedAccounts();
    loadSettings();
  }, [user.email]);

  const loadProfileData = async () => {
    try {
      const response = await fetch(`https://floally-mvp-production.up.railway.app/api/user/profile?user_email=${encodeURIComponent(user.email)}`);
      const data = await response.json();
      setProfileData({
        display_name: data.display_name || '',
        email: data.user_id || user.email,
        avatar_url: data.avatar_url || user.avatar_url || '',
        role: data.role || '',
        company: data.company || '',
        priorities: data.priorities || [],
        decision_style: data.decision_style || '',
        communication_style: data.communication_style || '',
        unsubscribe_preference: data.unsubscribe_preference || '',
        work_hours: data.work_hours || { start: '09:00', end: '18:00' },
        timezone: data.timezone || 'America/Los_Angeles'
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const loadConnectedAccounts = async () => {
    try {
      const response = await fetch(`https://floally-mvp-production.up.railway.app/api/user/connected-accounts?user_email=${encodeURIComponent(user.email)}`);
      const data = await response.json();
      setConnectedAccounts(data.accounts || []);
    } catch (error) {
      console.error('Failed to load connected accounts:', error);
      setConnectedAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await fetch(`https://floally-mvp-production.up.railway.app/api/user/settings?user_email=${encodeURIComponent(user.email)}`);
      const data = await response.json();
      setSettings({
        ai_preferences: data.ai_preferences || {},
        notification_preferences: data.notification_preferences || {},
        privacy_settings: data.privacy_settings || {}
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await fetch(`https://floally-mvp-production.up.railway.app/api/user/profile?user_email=${encodeURIComponent(user.email)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: profileData.display_name,
          avatar_url: profileData.avatar_url,
          company: profileData.company,
          role: profileData.role,
          priorities: profileData.priorities,
          decision_style: profileData.decision_style,
          communication_style: profileData.communication_style,
          unsubscribe_preference: profileData.unsubscribe_preference,
          work_hours: profileData.work_hours,
          timezone: profileData.timezone
        })
      });
      
      if (response.ok) {
        alert('✅ Profile updated successfully!');
        
        // Update parent component with new profile data
        if (onProfileUpdate) {
          onProfileUpdate({
            display_name: profileData.display_name,
            avatar_url: profileData.avatar_url,
            company: profileData.company,
            role: profileData.role
          });
        }
        
        // Close modal automatically
        if (onSave) {
          onSave();
        }
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('❌ Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarSelect = async (avatarUrl) => {
    setProfileData({ ...profileData, avatar_url: avatarUrl });
    
    // Save immediately
    try {
      const response = await fetch(`https://floally-mvp-production.up.railway.app/api/user/profile?user_email=${encodeURIComponent(user.email)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_url: avatarUrl })
      });
      
      if (response.ok) {
        // Update user object in localStorage
        const storedUser = JSON.parse(localStorage.getItem('okaimy_user') || '{}');
        storedUser.avatar_url = avatarUrl;
        localStorage.setItem('okaimy_user', JSON.stringify(storedUser));
        
        // Update parent component immediately
        if (onProfileUpdate) {
          onProfileUpdate({ avatar_url: avatarUrl });
        }
      }
    } catch (error) {
      console.error('Failed to save avatar:', error);
    }
  };

  const handleDeleteProfile = async () => {
    try {
      const response = await fetch(`https://floally-mvp-production.up.railway.app/api/user/profile?user_email=${encodeURIComponent(user.email)}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Clear localStorage
        localStorage.removeItem('okaimy_token');
        localStorage.removeItem('okaimy_user');
        
        // Redirect to landing page
        alert('Your account has been deleted. We\'re sorry to see you go!');
        window.location.href = '/';
      } else {
        throw new Error('Failed to delete profile');
      }
    } catch (error) {
      console.error('Failed to delete profile:', error);
      throw error;
    }
  };

  const handleDisconnectAccount = async (accountId) => {
    if (!confirm('Are you sure you want to disconnect this account?')) return;
    
    try {
      const response = await fetch(`https://floally-mvp-production.up.railway.app/api/user/connected-accounts/${accountId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setConnectedAccounts(connectedAccounts.filter(acc => acc.id !== accountId));
        alert('✅ Account disconnected successfully!');
      }
    } catch (error) {
      console.error('Failed to disconnect account:', error);
      alert('❌ Failed to disconnect account. Please try again.');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'accounts', label: 'Connected Accounts', icon: '🔗' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'billing', label: 'Billing', icon: '💳' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-teal-50 to-emerald-50">
          <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4 border-b border-gray-200 bg-gray-50">
          <div className="flex gap-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-teal-600 border-t-2 border-teal-500'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
                <div className="relative">
                  <img
                    src={profileData.avatar_url || 'https://via.placeholder.com/100'}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover ring-4 ring-teal-100"
                  />
                  <button 
                    onClick={() => setShowAvatarSelector(true)}
                    className="absolute bottom-0 right-0 bg-teal-500 text-white rounded-full p-2 hover:bg-teal-600 shadow-lg transition-colors"
                  >
                    📷
                  </button>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{profileData.display_name}</h3>
                  <p className="text-gray-600">{profileData.email}</p>
                  <p className="text-sm text-gray-500 mt-1">{profileData.role} {profileData.company && `at ${profileData.company}`}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                  <input
                    type="text"
                    value={profileData.display_name}
                    onChange={(e) => setProfileData({ ...profileData, display_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <input
                    type="text"
                    value={profileData.role}
                    onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <input
                    type="text"
                    value={profileData.company}
                    onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priorities</label>
                <div className="flex flex-wrap gap-2">
                  {(profileData.priorities || []).map((priority, idx) => (
                    <span key={idx} className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">
                      {priority}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Communication Style</label>
                  <select
                    value={profileData.communication_style}
                    onChange={(e) => setProfileData({ ...profileData, communication_style: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="">Select...</option>
                    <option value="direct">Direct & concise</option>
                    <option value="detailed">Detailed & thorough</option>
                    <option value="casual">Casual & friendly</option>
                    <option value="formal">Formal & professional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Decision Style</label>
                  <select
                    value={profileData.decision_style}
                    onChange={(e) => setProfileData({ ...profileData, decision_style: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="">Select...</option>
                    <option value="analytical">Analytical</option>
                    <option value="intuitive">Intuitive</option>
                    <option value="collaborative">Collaborative</option>
                    <option value="decisive">Decisive</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Connected Accounts Tab */}
          {activeTab === 'accounts' && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">
                Manage your connected accounts and services. These integrations allow OkAimy to help you stay organized.
              </p>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🔄</div>
                  <p className="text-gray-600">Loading connected accounts...</p>
                </div>
              ) : connectedAccounts.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <div className="text-4xl mb-2">🔗</div>
                  <p className="text-gray-600 mb-4">No accounts connected yet</p>
                  <button className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600">
                    Connect Google Account
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {connectedAccounts.map(account => (
                    <div key={account.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white text-xl">
                          {account.provider === 'google' ? '🔵' : '📧'}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 capitalize">{account.provider}</h4>
                          <p className="text-sm text-gray-600">{account.email}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Connected {new Date(account.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          ✓ Active
                        </span>
                        <button
                          onClick={() => handleDisconnectAccount(account.id)}
                          className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Assistant Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">AI Tone</p>
                      <p className="text-sm text-gray-600">How Aimy should communicate with you</p>
                    </div>
                    <select className="px-4 py-2 border border-gray-300 rounded-lg">
                      <option>Warm & Friendly</option>
                      <option>Professional</option>
                      <option>Casual</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Response Length</p>
                      <p className="text-sm text-gray-600">Preferred detail level for AI responses</p>
                    </div>
                    <select className="px-4 py-2 border border-gray-300 rounded-lg">
                      <option>Concise</option>
                      <option>Balanced</option>
                      <option>Detailed</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-5 h-5 text-teal-600 rounded" defaultChecked />
                    <span className="text-gray-900">Email digest (daily summary)</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-5 h-5 text-teal-600 rounded" />
                    <span className="text-gray-900">Browser notifications</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-5 h-5 text-teal-600 rounded" />
                    <span className="text-gray-900">Slack notifications</span>
                  </label>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-5 h-5 text-teal-600 rounded" defaultChecked />
                    <span className="text-gray-900">Enable behavioral learning</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="w-5 h-5 text-teal-600 rounded" />
                    <span className="text-gray-900">Share anonymous usage data</span>
                  </label>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Management</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-gray-900">Delete Account</p>
                      <p className="text-sm text-gray-600">Permanently remove your account and all data</p>
                    </div>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💳</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Billing & Subscription</h3>
              <p className="text-gray-600 mb-6">Manage your subscription and payment methods</p>
              <div className="inline-block px-6 py-3 bg-gray-100 text-gray-500 rounded-lg">
                Coming Soon
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'profile' && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Avatar Selector Modal */}
      {showAvatarSelector && (
        <AvatarSelector
          currentAvatar={profileData.avatar_url}
          onSelect={handleAvatarSelect}
          onClose={() => setShowAvatarSelector(false)}
        />
      )}

      {/* Delete Profile Modal */}
      {showDeleteModal && (
        <DeleteProfileModal
          user={user}
          onClose={() => setShowDeleteModal(false)}
          onDelete={handleDeleteProfile}
        />
      )}
    </div>
  );
}

export default ProfileSettings;
