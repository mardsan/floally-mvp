import React, { useState, useEffect } from 'react';
import { userProfile } from '../services/api';
import toast from 'react-hot-toast';

const AimySettings = ({ userProfile: initialUserProfile, aimeInsights, onEdit, onClose, standalone = false, userEmail }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userProfileData, setUserProfileData] = useState(initialUserProfile);

  useEffect(() => {
    loadSettings();
  }, [userEmail]);

  const loadSettings = async () => {
    if (!userEmail) return;
    
    try {
      const response = await userProfile.getProfile(userEmail);
      setUserProfileData(response.data);
      setSettings(response.data.settings || getDefaultSettings());
    } catch (error) {
      console.error('Failed to load settings:', error);
      setSettings(getDefaultSettings());
    }
  };

  const getDefaultSettings = () => ({
    email_management: {
      auto_archive_promotional: false,
      auto_archive_from_learned_senders: false,
      suggest_unsubscribe: true,
      unsubscribe_preference: 'ask_before_unsubscribe'
    },
    ai_preferences: {
      enable_autonomous_actions: false,
      confidence_threshold: 0.8,
      tone: 'warm_friendly'
    }
  });

  const updateSetting = async (path, value) => {
    setLoading(true);
    try {
      const pathParts = path.split('.');
      const newSettings = { ...settings };
      
      // Navigate to the nested property and update it
      let current = newSettings;
      for (let i = 0; i < pathParts.length - 1; i++) {
        if (!current[pathParts[i]]) current[pathParts[i]] = {};
        current = current[pathParts[i]];
      }
      current[pathParts[pathParts.length - 1]] = value;
      
      // Save to backend
      await userProfile.updateProfile(userEmail, { settings: newSettings });
      setSettings(newSettings);
      
      toast.success('Settings updated', {
        duration: 2000,
        position: 'bottom-center',
        style: { background: '#F6F8F7', color: '#183A3A' }
      });
    } catch (error) {
      console.error('Failed to update setting:', error);
      toast.error('Failed to update setting', {
        duration: 3000,
        position: 'bottom-center'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!userProfileData && !settings) return null;

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
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source src="/Aimy_LUMO_v5.mp4" type="video/mp4" />
                  <img src="/AiMy_LUMO_01.png" alt="Aimi" className="w-full h-full object-cover" />
                </video>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Aimi Settings</h2>
                <p className="text-sm text-slate-700">How Aimi understands you</p>
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
          
          {/* Aimi's Understanding */}
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-6 border" style={{borderColor: '#dafef4'}}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm ring-2 ring-white flex-shrink-0">
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source src="/Aimy_LUMO_v5.mp4" type="video/mp4" />
                  <img src="/AiMy_LUMO_01.png" alt="Aimi" className="w-full h-full object-cover" />
                </video>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-2">Aimi's Understanding</h3>
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
                {userProfileData?.role || 'Not set'}
              </div>
            </div>

            {/* Priorities */}
            <div className="border rounded-lg p-4" style={{borderColor: '#dafef4'}}>
              <div className="text-xs text-slate-500 mb-2">Top Priorities</div>
              <div className="flex flex-wrap gap-2">
                {userProfileData?.priorities && userProfileData.priorities.length > 0 ? (
                  userProfileData.priorities.map(priority => (
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
                {styleLabels[userProfileData?.decision_style] || 'Not set'}
              </div>
            </div>

            {/* Communication Style */}
            <div className="border rounded-lg p-4" style={{borderColor: '#dafef4'}}>
              <div className="text-xs text-slate-500 mb-1">Communication Style</div>
              <div className="font-medium text-slate-900">
                {commLabels[userProfileData?.communication_style] || 'Not set'}
              </div>
            </div>

            {/* Unsubscribe Preference */}
            <div className="border rounded-lg p-4" style={{borderColor: '#dafef4'}}>
              <div className="text-xs text-slate-500 mb-1">Newsletter Management</div>
              <div className="font-medium text-slate-900 text-sm">
                {userProfileData?.unsubscribe_preference === 'ask_before_unsubscribe' && 'Ask before unsubscribing'}
                {userProfileData?.unsubscribe_preference === 'auto_suggest_30days' && 'Auto-suggest after 30 days'}
                {userProfileData?.unsubscribe_preference === 'just_archive' && 'Just archive promotional emails'}
                {userProfileData?.unsubscribe_preference === 'manual' && 'Manual handling'}
                {!userProfileData?.unsubscribe_preference && 'Not set'}
              </div>
            </div>
          </div>

          {/* Autonomous Actions */}
          <div className="border-t pt-6" style={{borderColor: '#dafef4'}}>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Autonomous Actions</h3>
              <p className="text-sm text-slate-600">Let Aimi handle routine email management based on your behavior patterns</p>
            </div>
            
            <div className="space-y-4">
              {/* Master toggle */}
              <div className="border rounded-lg p-4 bg-gradient-to-br from-teal-50 to-white" style={{borderColor: '#dafef4'}}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 mb-1">✨ Enable Autonomous Actions</div>
                    <p className="text-sm text-slate-600">
                      Aimi will automatically handle emails based on your learned preferences. All actions are logged for transparency.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={settings?.ai_preferences?.enable_autonomous_actions || false}
                      onChange={(e) => updateSetting('ai_preferences.enable_autonomous_actions', e.target.checked)}
                      disabled={loading}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>
              </div>

              {/* Individual action toggles */}
              {settings?.ai_preferences?.enable_autonomous_actions && (
                <div className="space-y-3 pl-4 border-l-2" style={{borderColor: '#dafef4'}}>
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border" style={{borderColor: '#dafef4'}}>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-900">Auto-archive promotional emails</div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Automatically archive newsletters and promotional content
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-3">
                      <input
                        type="checkbox"
                        checked={settings?.email_management?.auto_archive_promotional || false}
                        onChange={(e) => updateSetting('email_management.auto_archive_promotional', e.target.checked)}
                        disabled={loading}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border" style={{borderColor: '#dafef4'}}>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-900">Learn from your archiving patterns</div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Auto-archive from senders you consistently archive (&gt;80% rate)
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-3">
                      <input
                        type="checkbox"
                        checked={settings?.email_management?.auto_archive_from_learned_senders || false}
                        onChange={(e) => updateSetting('email_management.auto_archive_from_learned_senders', e.target.checked)}
                        disabled={loading}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border" style={{borderColor: '#dafef4'}}>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-900">Suggest unsubscribe candidates</div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Identify newsletters you never open (won't unsubscribe automatically)
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-3">
                      <input
                        type="checkbox"
                        checked={settings?.email_management?.suggest_unsubscribe !== false}
                        onChange={(e) => updateSetting('email_management.suggest_unsubscribe', e.target.checked)}
                        disabled={loading}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Data & Privacy */}
          <div className="border-t pt-6" style={{borderColor: '#dafef4'}}>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Data & Privacy</h3>
            <p className="text-sm text-slate-700 mb-4">
              Your profile and preferences are stored locally and used only to personalize Aimi's assistance. 
              You can delete your data anytime.
            </p>
            <button className="text-sm text-red-600 hover:text-red-700 font-medium">
              🗑️ Delete All Data
            </button>
          </div>
        </div>

        {/* Footer */}
        {!standalone && (
          <div className="p-4 md:p-6 border-t" style={{borderColor: '#dafef4'}}>
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