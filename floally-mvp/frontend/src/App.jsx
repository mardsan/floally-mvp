import React, { useState, useEffect } from 'react';
import { auth, gmail, calendar, ai, userProfile } from './services/api';
import OnboardingFlow from './components/OnboardingFlow';
import AimySettings from './components/AimeSettings';
import EmailActions from './components/EmailActions';
import EmailFeedback from './components/EmailFeedback';
import Profile from './pages/Profile';

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    messages: [],
    events: [],
    profile: null
  });
  const [standup, setStandup] = useState(null);
  const [generatingStandup, setGeneratingStandup] = useState(false);
  const [expandedEmail, setExpandedEmail] = useState(null);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [emailAnalysis, setEmailAnalysis] = useState(null);
  const [analyzingEmails, setAnalyzingEmails] = useState(false);
  const [draftResponse, setDraftResponse] = useState(null);
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [selectedEmailForResponse, setSelectedEmailForResponse] = useState(null);
  const [expandedAnalysisEmail, setExpandedAnalysisEmail] = useState(null);
  const [displayedMessagesCount, setDisplayedMessagesCount] = useState(8);
  
  // New v1.2.0 state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState(null);
  const [aimeInsights, setAimyInsights] = useState(null);

  // Debug info
  console.log('OkAimy App loaded - Version 1.3.0 - Built:', new Date().toISOString());
  console.log('API URL:', import.meta.env.VITE_API_URL || 'http://localhost:8000');

  useEffect(() => {
    // Check if we just returned from OAuth
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'success') {
      console.log('Auth callback detected, cleaning URL...');
      // Clean the URL without reloading
      window.history.replaceState({}, document.title, '/');
    }
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('Checking auth status...');
      const response = await auth.status();
      console.log('Auth status response:', response.data);
      setAuthenticated(response.data.authenticated);
      setError(null); // Clear any previous errors

      if (response.data.authenticated) {
        await loadDashboardData();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        config: error.config
      });
      setError(`Auth check failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const [messagesRes, eventsRes, profileRes] = await Promise.all([
        gmail.getMessages(30, 'primary'), // Use Gmail's AI to fetch only Primary category (contacts/real people)
        calendar.getEvents(1),
        gmail.getProfile()
      ]);

      setData({
        messages: messagesRes.data.messages,
        events: eventsRes.data.events,
        profile: profileRes.data
      });

      // Load user profile and check onboarding status
      if (profileRes.data.email) {
        const userProfileRes = await userProfile.getProfile(profileRes.data.email);
        setProfile(userProfileRes.data);
        
        // Show onboarding if not completed
        if (!userProfileRes.data.onboarding_completed) {
          setShowOnboarding(true);
        }

        // Load Aimy's insights
        const insightsRes = await userProfile.getInsights(profileRes.data.email);
        setAimyInsights(insightsRes.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError(`Failed to load data: ${error.message}`);
    }
  };

  const handleLogin = async () => {
    setError(null);
    try {
      console.log('Calling auth.login()...');
      const response = await auth.login();
      console.log('Login response:', response.data);
      if (response.data.authorization_url) {
        window.location.href = response.data.authorization_url;
      } else {
        setError('No authorization URL received');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError(`Login failed: ${error.message}`);
    }
  };

  const handleGenerateStandup = async () => {
    setGeneratingStandup(true);
    setError(null);
    try {
      console.log('Generating AI stand-up...');
      
      // Include user profile context if available
      const context = {
        messages: data.messages,
        events: data.events
      };
      
      if (profile && profile.onboarding_completed) {
        context.userContext = {
          role: profile.role,
          priorities: profile.priorities,
          communicationStyle: profile.communication_style
        };
      }
      
      const response = await ai.generateStandup(context);
      console.log('Stand-up generated:', response.data);
      setStandup(response.data.standup);
    } catch (error) {
      console.error('Failed to generate stand-up:', error);
      setError(`Failed to generate stand-up: ${error.message}`);
    } finally {
      setGeneratingStandup(false);
    }
  };

  const handleOnboardingComplete = async (answers) => {
    try {
      console.log('Onboarding completed:', answers);
      await userProfile.completeOnboarding(data.profile.email, answers);
      
      // Reload profile and insights
      const [profileRes, insightsRes] = await Promise.all([
        userProfile.getProfile(data.profile.email),
        userProfile.getInsights(data.profile.email)
      ]);
      
      setProfile(profileRes.data);
      setAimyInsights(insightsRes.data);
      setShowOnboarding(false);
    } catch (error) {
      console.error('Failed to save onboarding:', error);
      setError(`Failed to save onboarding: ${error.message}`);
    }
  };

  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  const handleEditProfile = () => {
    // Re-open onboarding flow to edit
    setShowSettings(false);
    setShowOnboarding(true);
  };

  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Reset hours for date comparison
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    const eventDate = new Date(date);
    eventDate.setHours(0, 0, 0, 0);
    
    if (eventDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (eventDate.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else {
      // Show day of week and date
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  const toggleEmailExpand = (emailId) => {
    setExpandedEmail(expandedEmail === emailId ? null : emailId);
  };

  // Calculate email importance score for sorting
  const getEmailImportanceScore = (email) => {
    let score = 0;
    
    // Highest priority: Starred emails
    if (email.isStarred) score += 1000;
    
    // High priority: Gmail Important
    if (email.isImportant) score += 500;
    
    // High priority: Primary (from contacts/real people)
    if (email.isPrimary) score += 300;
    
    // Medium priority: Unread
    if (email.unread) score += 100;
    
    // Low priority penalties
    if (email.isPromotional) score -= 200;
    if (email.isSocial) score -= 150;
    if (email.isUpdates) score -= 100;
    if (email.isSpam) score -= 1000;
    
    return score;
  };

  // Sort and filter messages by importance
  const getSortedMessages = () => {
    return [...data.messages].sort((a, b) => {
      return getEmailImportanceScore(b) - getEmailImportanceScore(a);
    });
  };

  const handleAnalyzeEmails = async () => {
    setAnalyzingEmails(true);
    setError(null);
    try {
      console.log('Analyzing emails with Aimy...');
      const response = await ai.analyzeEmails(data.messages);
      console.log('Email analysis complete:', response.data);
      
      // Validate response structure
      if (!response.data || !response.data.analysis) {
        throw new Error('Invalid analysis response structure');
      }
      
      setEmailAnalysis(response.data);
    } catch (error) {
      console.error('Failed to analyze emails:', error);
      console.error('Error response:', error.response);
      setError(`Failed to analyze emails: ${error.response?.data?.detail || error.message}`);
      setEmailAnalysis(null); // Reset on error
    } finally {
      setAnalyzingEmails(false);
    }
  };

  const handleGenerateResponse = async (email) => {
    setGeneratingResponse(true);
    setSelectedEmailForResponse(email.id);
    setError(null);
    try {
      console.log('Generating response for email...', email);
      const response = await ai.generateResponse(email);
      console.log('Response generated:', response.data);
      setDraftResponse(response.data);
    } catch (error) {
      console.error('Failed to generate response:', error);
      setError(`Failed to generate response: ${error.message}`);
    } finally {
      setGeneratingResponse(false);
    }
  };

  const handleTrashEmail = async (emailId) => {
    try {
      await gmail.trash(emailId);
      
      // Remove from current view optimistically
      setData(prevData => ({
        ...prevData,
        messages: prevData.messages.filter(msg => msg.id !== emailId)
      }));
      
      // Also update analysis if present
      if (emailAnalysis) {
        setEmailAnalysis(prevAnalysis => ({
          ...prevAnalysis,
          analysis: prevAnalysis.analysis.filter(item => item.emailId !== emailId)
        }));
      }
      
      alert('🗑️ Email moved to trash');
    } catch (error) {
      console.error('Failed to trash email:', error);
      alert('Failed to delete email. Please try again.');
    }
  };

  const handleArchiveEmail = async (emailId) => {
    try {
      await gmail.archive(emailId);
      
      // Remove from current view optimistically
      setData(prevData => ({
        ...prevData,
        messages: prevData.messages.filter(msg => msg.id !== emailId)
      }));
      
      // Also update analysis if present
      if (emailAnalysis) {
        setEmailAnalysis(prevAnalysis => ({
          ...prevAnalysis,
          analysis: prevAnalysis.analysis.filter(item => item.emailId !== emailId)
        }));
      }
      
      alert('📦 Email archived');
    } catch (error) {
      console.error('Failed to archive email:', error);
      alert('Failed to archive email. Please try again.');
    }
  };

  const handleEmailAction = async (action, emailId) => {
    console.log(`Email action: ${action} on ${emailId}`);
    
    // Refresh email list after action
    if (action === 'archive' || action === 'trash') {
      // Remove from current view optimistically
      setData(prevData => ({
        ...prevData,
        messages: prevData.messages.filter(msg => msg.id !== emailId)
      }));
      
      // Also update analysis if present
      if (emailAnalysis) {
        setEmailAnalysis(prevAnalysis => ({
          ...prevAnalysis,
          analysis: prevAnalysis.analysis.filter(item => {
            // Match by emailId first, fallback to index
            return item.emailId !== emailId;
          })
        }));
      }
    }
    
    // Show success feedback
    const actionMessages = {
      important: '⭐ Marked as important!',
      unimportant: '❌ Marked as not interested',
      archive: '📥 Email archived',
      trash: '🗑️ Moved to trash',
      unsubscribe: '🚫 Unsubscribe link opened'
    };
    
    // You could add a toast notification here
    console.log(actionMessages[action] || 'Action completed');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(to bottom right, #dafef4, #e8fef9)'}}>
        <div className="text-center">
          <div className="text-4xl mb-4">🔄</div>
          <div className="text-slate-700">Loading OkAimy…</div>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(to bottom right, #dafef4, #e8fef9, #d0fdf2)'}}>
        <div className="text-center max-w-md mx-auto p-8">
          <img src="/okaimy-logo-01.png" alt="OkAimy Logo" className="w-48 mx-auto mb-8" onError={(e) => {console.error('Logo failed to load:', e.target.src);}} />
          <p className="text-lg text-slate-700 mb-8">
            Your AI-powered strategic and operational partner for creative work.
          </p>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          <button
            onClick={handleLogin}
            className="px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-full font-semibold text-lg hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl"
          >
            Connect Google Account
          </button>
          <p className="mt-6 text-sm text-slate-600">
            We'll access your Gmail and Calendar to help you focus on what matters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(to bottom right, #dafef4, #e8fef9, #f0fefb)'}}>
      <header className="bg-white/90 backdrop-blur-sm border-b px-6 py-4 shadow-sm" style={{borderColor: '#dafef4'}}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/okaimy-logo-01.png" alt="OkAimy" className="h-8" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">OkAimy</h1>
            {data.profile && (
              <p className="text-sm text-slate-600 ml-2">{data.profile.email}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {profile && profile.onboarding_completed && (
              <>
                <button
                  onClick={() => setShowProfile(true)}
                  className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                  title="Profile"
                >
                  <span className="text-xl">👤</span>
                  <span className="text-sm font-medium">Profile</span>
                </button>
                <button
                  onClick={handleOpenSettings}
                  className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                  title="Settings"
                >
                  <span className="text-xl">⚙️</span>
                  <span className="text-sm font-medium">Settings</span>
                </button>
              </>
            )}
            <div className="text-sm text-slate-600">
              Good morning{profile?.display_name ? `, ${profile.display_name}` : ''} 🌞
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* AI Stand-Up Section - TOP PRIORITY */}
        <div className="mb-8 rounded-2xl p-8 shadow-lg" style={{background: 'linear-gradient(to right, #dafef4, #e8fef9, #d0fdf2)', borderWidth: '1px', borderColor: '#b8f5e8'}}>
          <div className="text-center mb-6">
            <div className="flex justify-center mb-8">
              <div className="w-64 h-64 rounded-full overflow-hidden shadow-2xl ring-8 ring-teal-200/70 ring-offset-8 ring-offset-white/80 hover:ring-teal-300/80 hover:scale-105 transition-all duration-500">
                <img 
                  src="/okaimy-pfp-01.png" 
                  alt="Aimy" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center text-white text-8xl font-bold">A</div>';
                  }}
                />
              </div>
            </div>
            <h3 className="text-3xl font-semibold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent mb-3">
              Daily Stand-Up with Aimy
            </h3>
            <p className="text-slate-700 mb-6">
              Let Aimy analyze your messages and calendar to give you "The One Thing" to focus on today.
            </p>
            <button
              onClick={handleGenerateStandup}
              disabled={generatingStandup}
              className="px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-full font-semibold text-lg hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingStandup ? '✨ Generating...' : '🚀 Generate Stand-Up'}
            </button>
          </div>

          {standup && (
            <div className="mt-6 bg-white/95 backdrop-blur rounded-xl p-6 text-left shadow-md">
              <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <span>🎯</span> Your Daily Brief
              </h4>
              <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">
                {standup}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Important Emails Section - Aimy's Analysis */}
        <div className="mb-8 rounded-2xl p-8 shadow-lg bg-white/95 backdrop-blur" style={{borderWidth: '1px', borderColor: '#dafef4'}}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                ⭐ Important Emails
              </h3>
              <p className="text-sm text-slate-600">
                Let Aimy identify emails that need your attention and action
              </p>
            </div>
            <button
              onClick={handleAnalyzeEmails}
              disabled={analyzingEmails || data.messages.length === 0}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-full font-semibold hover:from-teal-600 hover:to-emerald-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzingEmails ? '🔍 Analyzing...' : '🔍 Analyze Emails'}
            </button>
          </div>

          {emailAnalysis && emailAnalysis.analysis && emailAnalysis.analysis.length > 0 && (
            <div className="space-y-4">
              {emailAnalysis.analysis
                .filter(item => item.important)
                .map((item) => {
                  // Find email by ID instead of index for accuracy
                  const email = data.messages.find(msg => msg.id === item.emailId) || data.messages[item.emailIndex];
                  if (!email) return null;
                  
                  const priorityColors = {
                    'High': 'bg-red-100 text-red-700 border-red-200',
                    'Medium': 'bg-yellow-100 text-yellow-700 border-yellow-200',
                    'Low': 'bg-blue-100 text-blue-700 border-blue-200'
                  };
                  
                  const urgencyIcons = {
                    'Today': '🔥',
                    'This Week': '⏰',
                    'When Possible': '📌'
                  };
                  
                  const actionIcons = {
                    'Reply': '💬',
                    'Review': '👀',
                    'Schedule': '📅',
                    'Archive': '📦'
                  };

                  return (
                    <div key={email.id} className="border rounded-lg p-4" style={{borderColor: '#dafef4', background: 'linear-gradient(to right, #fafffe, #f0fefb)'}}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 text-xs font-semibold rounded border ${priorityColors[item.priority] || priorityColors.Low}`}>
                              {item.priority} Priority
                            </span>
                            {item.urgency && (
                              <span className="text-xs text-slate-600">
                                {urgencyIcons[item.urgency]} {item.urgency}
                              </span>
                            )}
                            {item.actionType && (
                              <span className="text-xs text-slate-600">
                                {actionIcons[item.actionType]} {item.actionType}
                              </span>
                            )}
                            {email.isStarred && (
                              <span className="px-2 py-1 text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 rounded">
                                ⭐ Gmail Starred
                              </span>
                            )}
                            {email.isImportant && !email.isStarred && (
                              <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200 rounded">
                                Gmail Important
                              </span>
                            )}
                            {email.isPrimary && (
                              <span className="px-2 py-1 text-xs bg-teal-100 text-teal-700 rounded">
                                👤 Contact
                              </span>
                            )}
                          </div>
                          <div className="font-medium text-slate-900 mb-1">
                            {email.subject}
                          </div>
                          <div className="text-sm text-slate-600 mb-2">
                            From: {email.from.split('<')[0].trim()}
                          </div>
                          {item.reason && (
                            <div className="text-sm text-slate-700 bg-white/70 rounded p-2 mb-3">
                              <span className="font-medium">Aimy's insight:</span> {item.reason}
                            </div>
                          )}
                          
                          {/* Expand/Collapse Toggle */}
                          <button
                            onClick={() => setExpandedAnalysisEmail(expandedAnalysisEmail === email.id ? null : email.id)}
                            className="text-sm text-teal-600 hover:text-teal-700 font-medium mb-3 flex items-center gap-1"
                          >
                            {expandedAnalysisEmail === email.id ? '▼' : '▶'} 
                            {expandedAnalysisEmail === email.id ? 'Hide full email' : 'View full email'}
                          </button>

                          {/* Expanded Email Content */}
                          {expandedAnalysisEmail === email.id && (
                            <div className="mb-3 border-t pt-3" style={{borderColor: '#dafef4'}}>
                              <div className="bg-white/70 rounded-lg p-3 mb-3 max-h-64 overflow-y-auto">
                                <div className="text-xs text-slate-500 mb-2">Email Preview:</div>
                                <div className="text-sm text-slate-700 whitespace-pre-wrap">
                                  {email.snippet || 'No preview available'}
                                </div>
                              </div>
                              
                              {/* Direct Actions */}
                              <div className="flex gap-2 mb-3">
                                <a
                                  href={`https://mail.google.com/mail/u/0/#inbox/${email.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg text-sm font-medium hover:from-teal-600 hover:to-emerald-600 transition-all shadow-sm"
                                >
                                  📧 Open in Gmail
                                </a>
                                {item.actionType === 'Reply' && (
                                  <button
                                    onClick={() => handleGenerateResponse(email)}
                                    disabled={generatingResponse && selectedEmailForResponse === email.id}
                                    className="px-4 py-2 bg-white border-2 border-teal-500 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-50 transition-all disabled:opacity-50"
                                  >
                                    {generatingResponse && selectedEmailForResponse === email.id ? '✨ Generating...' : '✍️ Generate Response'}
                                  </button>
                                )}
                              </div>

                              {/* Email Action Buttons */}
                              <EmailActions
                                email={email}
                                userEmail={data.profile?.email}
                                onActionComplete={handleEmailAction}
                                onRespond={() => handleGenerateResponse(email)}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Draft Response Modal */}
                      {draftResponse && selectedEmailForResponse === email.id && (
                        <div className="mt-4 border-t pt-4" style={{borderColor: '#dafef4'}}>
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-slate-900">📝 Draft Response from Aimy</h4>
                              <button
                                onClick={() => {
                                  setDraftResponse(null);
                                  setSelectedEmailForResponse(null);
                                }}
                                className="text-slate-400 hover:text-slate-600"
                              >
                                ✕
                              </button>
                            </div>
                            <div className="mb-3">
                              <div className="text-xs text-slate-500 mb-1">Subject:</div>
                              <div className="text-sm font-medium text-slate-700">{draftResponse.subject}</div>
                            </div>
                            <textarea
                              className="w-full p-3 border rounded-lg text-sm font-mono resize-y min-h-[150px] focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                              style={{borderColor: '#dafef4'}}
                              defaultValue={draftResponse.draftResponse}
                              id={`draft-${email.id}`}
                            />
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => {
                                  const textarea = document.getElementById(`draft-${email.id}`);
                                  navigator.clipboard.writeText(textarea.value);
                                  alert('Draft copied to clipboard! You can paste it in Gmail.');
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg text-sm font-medium hover:from-teal-600 hover:to-emerald-600 transition-all shadow-sm"
                              >
                                ✅ Copy to Clipboard
                              </button>
                              <button
                                onClick={() => {
                                  setDraftResponse(null);
                                  setSelectedEmailForResponse(null);
                                }}
                                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-all"
                              >
                                ❌ Decline
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              {emailAnalysis.analysis.filter(item => item.important).length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <div className="text-4xl mb-2">🎉</div>
                  <div>No urgent emails found! You're all caught up.</div>
                </div>
              )}
            </div>
          )}

          {!emailAnalysis && (
            <div className="text-center py-8 text-slate-500">
              <div className="text-4xl mb-2">📧</div>
              <div>Click "Analyze Emails" to let Aimy find what's important</div>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Messages Card */}
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-lg p-6" style={{borderWidth: '1px', borderColor: '#dafef4'}}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  📨 Important Messages
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Sorted by priority: Starred, Important, Contacts first
                </p>
              </div>
              <a 
                href="https://mail.google.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-teal-600 hover:text-teal-700 font-medium"
              >
                Open Gmail →
              </a>
            </div>
            <div className="space-y-3">
              {getSortedMessages().slice(0, displayedMessagesCount).map((msg) => {
                // Determine if email should be grayed out (spam/promotional)
                const isLowPriority = msg.isSpam || msg.isPromotional;
                const emailBg = isLowPriority 
                  ? 'linear-gradient(to bottom right, #f1f5f9, #e2e8f0)' 
                  : 'linear-gradient(to bottom right, #dafef4, #e8fef9)';
                
                const importanceScore = getEmailImportanceScore(msg);
                
                return (
                  <div key={msg.id} className="rounded-lg overflow-hidden transition-all" style={{background: emailBg, opacity: isLowPriority ? 0.7 : 1}}>
                    <div 
                      className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => toggleEmailExpand(msg.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center text-sm font-semibold text-white shadow-sm flex-shrink-0">
                          {msg.from.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <div className="text-sm font-medium text-slate-900 truncate flex-1">
                              {msg.subject}
                            </div>
                            {msg.isStarred && (
                              <span className="text-xs">⭐</span>
                            )}
                            {msg.isImportant && (
                              <span className="text-xs">‼️</span>
                            )}
                            {msg.isPrimary && (
                              <span className="px-1.5 py-0.5 bg-teal-100 text-teal-700 text-xs rounded">👤</span>
                            )}
                            {msg.isSpam && (
                              <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded">SPAM</span>
                            )}
                            {msg.isPromotional && (
                              <span className="px-1.5 py-0.5 bg-purple-100 text-purple-600 text-xs rounded">Promo</span>
                            )}
                            {msg.isSocial && (
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-xs rounded">Social</span>
                            )}
                            {msg.unread && (
                            <span className="px-2 py-1 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-xs rounded-full shadow-sm flex-shrink-0">
                              New
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-600 truncate">
                          From: {msg.from.split('<')[0].trim()}
                        </div>
                        {!expandedEmail || expandedEmail !== msg.id ? (
                          <div className="text-xs text-slate-500 mt-1 truncate">
                            {msg.snippet}
                          </div>
                        ) : null}
                      </div>
                      <div className="flex-shrink-0 text-slate-400">
                        {expandedEmail === msg.id ? '▼' : '▶'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Email Content */}
                  {expandedEmail === msg.id && (
                    <div className="px-3 pb-3 border-t" style={{borderColor: '#b8f5e8'}}>
                      <div className="mt-3 text-sm text-slate-700 bg-white/70 rounded-lg p-3 max-h-48 overflow-y-auto">
                        {msg.snippet || 'No preview available'}
                      </div>
                      <div className="mt-3 flex gap-2 flex-wrap">
                        <a
                          href={`https://mail.google.com/mail/u/0/#inbox/${msg.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-xs rounded-lg hover:from-teal-600 hover:to-emerald-600 transition-all shadow-sm"
                        >
                          Open in Gmail
                        </a>
                        <button className="px-3 py-1.5 bg-white/80 text-slate-700 text-xs rounded-lg hover:bg-white transition-all border border-slate-200">
                          Mark as Read
                        </button>
                        <button
                          onClick={() => handleTrashEmail(msg.id)}
                          className="px-3 py-1.5 bg-red-50 text-red-600 text-xs rounded-lg hover:bg-red-100 transition-all border border-red-200"
                        >
                          🗑️ Delete
                        </button>
                        <button
                          onClick={() => handleArchiveEmail(msg.id)}
                          className="px-3 py-1.5 bg-slate-50 text-slate-600 text-xs rounded-lg hover:bg-slate-100 transition-all border border-slate-200"
                        >
                          📦 Archive
                        </button>
                      </div>
                      
                      {/* Aime Learning Feedback */}
                      <div className="mt-3">
                        <EmailFeedback
                          email={msg}
                          userEmail={data.profile?.email}
                          onFeedbackComplete={(type) => {
                            console.log(`User feedback: ${type} for email ${msg.id}`);
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            </div>
            
            {/* Load More Button */}
            {displayedMessagesCount < data.messages.length && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setDisplayedMessagesCount(prev => Math.min(prev + 8, data.messages.length))}
                  className="px-6 py-2 bg-white border-2 border-teal-500 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-50 transition-all shadow-sm"
                >
                  📬 Load More ({data.messages.length - displayedMessagesCount} remaining)
                </button>
              </div>
            )}
            
            {/* Stats Summary */}
            <div className="mt-4 pt-4 border-t" style={{borderColor: '#dafef4'}}>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-slate-600">
                  <span className="font-medium">⭐ Starred:</span> {data.messages.filter(m => m.isStarred).length}
                </div>
                <div className="text-slate-600">
                  <span className="font-medium">‼️ Important:</span> {data.messages.filter(m => m.isImportant).length}
                </div>
                <div className="text-slate-600">
                  <span className="font-medium">👤 Contacts:</span> {data.messages.filter(m => m.isPrimary).length}
                </div>
                <div className="text-slate-600">
                  <span className="font-medium">📧 Promo:</span> {data.messages.filter(m => m.isPromotional).length}
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Card */}
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-lg p-6" style={{borderWidth: '1px', borderColor: '#dafef4'}}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                📅 Upcoming Events ({data.events.length})
              </h2>
              <a 
                href="https://calendar.google.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-teal-600 hover:text-teal-700 font-medium"
              >
                Open Calendar →
              </a>
            </div>
            <div className="space-y-3">
              {data.events.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No events scheduled
                </div>
              ) : (
                data.events.map((event) => (
                  <div key={event.id} className="p-3 rounded-lg hover:shadow-md transition-shadow cursor-pointer" style={{background: 'linear-gradient(to bottom right, #e0fef5, #dafef4)'}}>
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center justify-center bg-white/80 rounded-lg p-2 shadow-sm min-w-[60px]">
                        <div className="text-xs font-semibold text-teal-600">
                          {formatEventDate(event.start)}
                        </div>
                        <div className="text-lg font-bold text-slate-900">
                          {new Date(event.start).toLocaleTimeString([], {
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900">
                          {event.summary}
                        </div>
                        <div className="text-xs text-slate-600 mt-1 flex items-center gap-2">
                          <span>
                            {new Date(event.start).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                            {' - '}
                            {new Date(event.end).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {event.attendees.length > 0 && (
                            <span className="text-slate-500">
                              · {event.attendees.length} attendee{event.attendees.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        {event.location && (
                          <div className="text-xs text-slate-500 mt-1">
                            📍 {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Onboarding Modal */}
      {showOnboarding && data.profile && (
        <OnboardingFlow
          userEmail={data.profile.email}
          onComplete={handleOnboardingComplete}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <AimySettings
          userProfile={profile}
          aimeInsights={aimeInsights}
          onEdit={handleEditProfile}
          onClose={handleCloseSettings}
        />
      )}

      {/* Profile Modal */}
      {showProfile && data.profile && (
        <Profile
          userEmail={data.profile.email}
          onClose={() => setShowProfile(false)}
          onRefresh={loadDashboardData}
        />
      )}
    </div>
  );
}

export default App;
