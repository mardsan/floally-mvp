import React, { useState, useEffect } from 'react';

const SettingsPanel = ({ settings, userEmail, onSave }) => {
  const [localSettings, setLocalSettings] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  if (!localSettings) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">⚙️</div>
        <p className="text-slate-700">Loading settings...</p>
      </div>
    );
  }

  const handleChange = (section, key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(localSettings);
      setHasChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setLocalSettings(settings);
    setHasChanges(false);
    setSaveSuccess(false);
  };

  return (
    <div className="space-y-6">
      
      {/* AI Preferences */}
      <div className="bg-white rounded-xl border p-6" style={{borderColor: '#dafef4'}}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🤖</span>
          <h3 className="text-lg font-semibold text-slate-900">AI Preferences</h3>
        </div>

        <div className="space-y-4">
          {/* AI Model */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              AI Model
            </label>
            <select
              value={localSettings.ai_preferences?.model || 'gpt-4'}
              onChange={(e) => handleChange('ai_preferences', 'model', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="gpt-4">GPT-4 (Most Accurate)</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">
              GPT-4 provides better understanding but may be slower
            </p>
          </div>

          {/* Response Tone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Response Tone
            </label>
            <select
              value={localSettings.ai_preferences?.tone || 'professional'}
              onChange={(e) => handleChange('ai_preferences', 'tone', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="casual">Casual</option>
              <option value="concise">Concise</option>
            </select>
          </div>

          {/* Verbosity */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Response Length
            </label>
            <select
              value={localSettings.ai_preferences?.verbosity || 'balanced'}
              onChange={(e) => handleChange('ai_preferences', 'verbosity', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="concise">Concise</option>
              <option value="balanced">Balanced</option>
              <option value="detailed">Detailed</option>
            </select>
          </div>

          {/* Auto Suggestions */}
          <div className="flex items-center justify-between py-2">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700">
                Auto-Suggestions
              </label>
              <p className="text-xs text-slate-500">
                Show AI suggestions for email actions automatically
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.ai_preferences?.auto_suggestions ?? true}
                onChange={(e) => handleChange('ai_preferences', 'auto_suggestions', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>

          {/* Confidence Threshold */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Auto-Action Confidence Threshold: {localSettings.ai_preferences?.confidence_threshold || 80}%
            </label>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={localSettings.ai_preferences?.confidence_threshold || 80}
              onChange={(e) => handleChange('ai_preferences', 'confidence_threshold', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>More Actions</span>
              <span>Safer</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Aime will only auto-perform actions when confidence is above this level
            </p>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-xl border p-6" style={{borderColor: '#dafef4'}}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🔔</span>
          <h3 className="text-lg font-semibold text-slate-900">Notifications</h3>
        </div>

        <div className="space-y-4">
          {/* Email Digest */}
          <div className="flex items-center justify-between py-2">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700">
                Daily Email Digest
              </label>
              <p className="text-xs text-slate-500">
                Receive a summary of Aime's actions and insights
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.notification_preferences?.email_digest ?? true}
                onChange={(e) => handleChange('notification_preferences', 'email_digest', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>

          {/* Slack Notifications */}
          <div className="flex items-center justify-between py-2">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700">
                Slack Notifications
              </label>
              <p className="text-xs text-slate-500">
                Get notified about important emails in Slack
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.notification_preferences?.slack_notifications ?? false}
                onChange={(e) => handleChange('notification_preferences', 'slack_notifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>

          {/* Browser Notifications */}
          <div className="flex items-center justify-between py-2">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700">
                Browser Notifications
              </label>
              <p className="text-xs text-slate-500">
                Show desktop notifications for important updates
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.notification_preferences?.browser_notifications ?? true}
                onChange={(e) => handleChange('notification_preferences', 'browser_notifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white rounded-xl border p-6" style={{borderColor: '#dafef4'}}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🔒</span>
          <h3 className="text-lg font-semibold text-slate-900">Privacy & Data</h3>
        </div>

        <div className="space-y-4">
          {/* Behavioral Learning */}
          <div className="flex items-center justify-between py-2">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700">
                Behavioral Learning
              </label>
              <p className="text-xs text-slate-500">
                Allow Aime to learn from your email actions
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.privacy_settings?.allow_behavioral_learning ?? true}
                onChange={(e) => handleChange('privacy_settings', 'allow_behavioral_learning', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>

          {/* Data Retention */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Data Retention Period
            </label>
            <select
              value={localSettings.privacy_settings?.data_retention_days || 90}
              onChange={(e) => handleChange('privacy_settings', 'data_retention_days', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
              <option value={180}>180 days</option>
              <option value={365}>1 year</option>
              <option value={-1}>Forever</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">
              How long to keep behavioral data and analytics
            </p>
          </div>

          {/* Anonymous Usage */}
          <div className="flex items-center justify-between py-2">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700">
                Anonymous Usage Statistics
              </label>
              <p className="text-xs text-slate-500">
                Help improve Aime by sharing anonymous usage data
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.privacy_settings?.share_anonymous_usage ?? true}
                onChange={(e) => handleChange('privacy_settings', 'share_anonymous_usage', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>

          {/* AI Training */}
          <div className="flex items-center justify-between py-2">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700">
                Use Data for AI Training
              </label>
              <p className="text-xs text-slate-500">
                Allow your data to improve future AI models (anonymized)
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.privacy_settings?.allow_ai_training ?? false}
                onChange={(e) => handleChange('privacy_settings', 'allow_ai_training', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Email Management */}
      <div className="bg-white rounded-xl border p-6" style={{borderColor: '#dafef4'}}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">📧</span>
          <h3 className="text-lg font-semibold text-slate-900">Email Management</h3>
        </div>

        <div className="space-y-4">
          {/* Unsubscribe Preference */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Unsubscribe Preference
            </label>
            <select
              value={localSettings.email_management?.unsubscribe_preference || 'suggest'}
              onChange={(e) => handleChange('email_management', 'unsubscribe_preference', e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="auto">Auto-unsubscribe (when confident)</option>
              <option value="suggest">Suggest only</option>
              <option value="never">Never suggest</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">
              How Aime should handle newsletter unsubscriptions
            </p>
          </div>

          {/* Auto-Archive Promotional */}
          <div className="flex items-center justify-between py-2">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700">
                Auto-Archive Promotional Emails
              </label>
              <p className="text-xs text-slate-500">
                Automatically archive low-priority promotional emails
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.email_management?.auto_archive_promotional ?? false}
                onChange={(e) => handleChange('email_management', 'auto_archive_promotional', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>

          {/* Newsletter Digest */}
          <div className="flex items-center justify-between py-2">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700">
                Newsletter Digest Mode
              </label>
              <p className="text-xs text-slate-500">
                Bundle newsletters into a daily digest
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.email_management?.newsletter_digest ?? false}
                onChange={(e) => handleChange('email_management', 'newsletter_digest', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-teal-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Save Actions */}
      <div className="sticky bottom-0 bg-white border-t pt-4 flex items-center justify-between" style={{borderColor: '#dafef4'}}>
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-sm text-green-600 font-medium flex items-center gap-1">
              ✓ Settings saved successfully
            </span>
          )}
          {hasChanges && !saveSuccess && (
            <span className="text-sm text-amber-600 font-medium">
              You have unsaved changes
            </span>
          )}
        </div>
        
        <div className="flex gap-3">
          {hasChanges && (
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              hasChanges && !saving
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

    </div>
  );
};

export default SettingsPanel;
