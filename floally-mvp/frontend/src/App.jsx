import React, { useState, useEffect } from 'react';
import { auth, gmail, calendar, ai, userProfile } from './services/api';
import OnboardingFlow from './components/OnboardingFlow';
import AimySettings from './components/AimeSettings';
import EmailActions from './components/EmailActions';
import EmailFeedback from './components/EmailFeedback';
import ProfileHub from './components/ProfileHub';
import Standup from './components/Standup';
import StandupDashboard from './components/StandupDashboard';
import LandingPage from './components/LandingPage';
import WaitlistAdmin from './components/WaitlistAdmin';
import AuthPage from './components/AuthPage';
import UserDashboard from './components/UserDashboard';
import MainDashboard from './components/MainDashboard';
import ProjectsPage from './components/ProjectsPage';
import GoogleSignIn from './components/GoogleSignIn';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('okaimy_token');
    const userStr = localStorage.getItem('okaimy_user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      } catch (e) {
        console.error('Invalid stored user data');
        localStorage.removeItem('okaimy_token');
        localStorage.removeItem('okaimy_user');
      }
    }
    
    setCheckingAuth(false);
  }, []);

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('okaimy_token');
    localStorage.removeItem('okaimy_user');
    setCurrentUser(null);
    // Redirect to home page (landing page)
    window.location.href = '/';
  };
  
  // Check if we should show admin page
  if (window.location.pathname === '/admin' || window.location.pathname === '/waitlist-admin') {
    return <WaitlistAdmin />;
  }
  
  // Check if we should show Google Sign In page
  if (window.location.pathname === '/auth' || window.location.pathname === '/signin' || window.location.pathname === '/login') {
    return <GoogleSignIn />;
  }
  
  // Check if we should show projects page
  if (window.location.pathname === '/projects') {
    if (checkingAuth) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-emerald-50">
          <div className="text-center">
            <div className="text-4xl mb-4">🔄</div>
            <div className="text-slate-700">Loading...</div>
          </div>
        </div>
      );
    }
    
    if (!currentUser) {
      return <AuthPage onAuthSuccess={handleAuthSuccess} />;
    }
    
    return <ProjectsPage user={currentUser} onLogout={handleLogout} />;
  }
  
  // Check if we should show app (for logged-in users)
  if (window.location.pathname === '/app' || window.location.pathname === '/dashboard') {
    if (checkingAuth) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-emerald-50">
          <div className="text-center">
            <div className="text-4xl mb-4">🔄</div>
            <div className="text-slate-700">Loading...</div>
          </div>
        </div>
      );
    }
    
    if (!currentUser) {
      return <AuthPage onAuthSuccess={handleAuthSuccess} />;
    }
    
    return <MainDashboard user={currentUser} onLogout={handleLogout} />;
  }
  
  // Check if we should show landing page (for waitlist mode)
  // BUT NOT if we're handling an OAuth callback
  const urlParams = new URLSearchParams(window.location.search);
  const isOAuthCallback = urlParams.get('auth') === 'success';
  
  const showLandingPage = !isOAuthCallback && (
    window.location.pathname === '/waitlist' || 
    window.location.hostname === 'okaimy.com' ||
    window.location.hostname === 'www.okaimy.com'
  );
  
  // If landing page mode, render that and exit early
  if (showLandingPage) {
    return <LandingPage />;
  }
  
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
  const [showProfileHub, setShowProfileHub] = useState(false);
  const [profile, setProfile] = useState(null);
  const [aimeInsights, setAimyInsights] = useState(null);
  
  // Gmail category filter
  const [activeCategory, setActiveCategory] = useState('primary');

  // Debug info
  console.log('OkAimy App loaded - Version 1.3.0 - Built:', new Date().toISOString());
  console.log('API URL:', import.meta.env.VITE_API_URL || 'http://localhost:8000');

  useEffect(() => {
    // Check if we just returned from OAuth
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'success') {
      console.log('Auth callback detected, cleaning URL...');
      
      // Get user data from URL if present
      const userData = urlParams.get('user');
      if (userData) {
        try {
          const user = JSON.parse(decodeURIComponent(userData));
          console.log('✅ User data received from OAuth:', user);
          
          // Store user data in localStorage
          localStorage.setItem('okaimy_user', JSON.stringify(user));
          localStorage.setItem('okaimy_token', 'authenticated'); // Simple flag for now
          
          // Update state
          setCurrentUser(user);
          setCheckingAuth(false);
          
          // Clean the URL and redirect to dashboard
          window.history.replaceState({}, document.title, '/dashboard');
          // Redirect will cause re-render and show dashboard
          window.location.href = '/dashboard';
        } catch (e) {
          console.error('Failed to parse user data from OAuth:', e);
          setCheckingAuth(false);
        }
      } else {
        // No user data, just clean URL
        window.history.replaceState({}, document.title, '/');
        setCheckingAuth(false);
      }
    } else {
      setCheckingAuth(false);
    }
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

  const loadDashboardData = async (category = null) => {
    try {
      const categoryToLoad = category || activeCategory;
      const [messagesRes, eventsRes, profileRes] = await Promise.all([
        gmail.getMessages(50, categoryToLoad), // Use Gmail's native category filtering
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
    console.log('🚀 handleGenerateStandup called!');
    console.log('Data:', { messagesCount: data.messages.length, eventsCount: data.events.length });
    
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
        console.log('Including user profile context:', context.userContext);
      }
      
      console.log('Calling ai.generateStandup with:', context);
      const response = await ai.generateStandup(context);
      console.log('Stand-up response:', response);
      console.log('Stand-up generated:', response.data);
      setStandup(response.data.standup);
    } catch (error) {
      console.error('Failed to generate stand-up:', error);
      console.error('Error details:', error.response || error);
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

  // Sort and filter messages by importance AND recency
  const getSortedMessages = () => {
    return [...data.messages].sort((a, b) => {
      // First sort by importance score
      const scoreDiff = getEmailImportanceScore(b) - getEmailImportanceScore(a);
      
      // If importance is the same, sort by date (newest first)
      if (scoreDiff === 0) {
        const dateA = new Date(a.date || 0).getTime();
        const dateB = new Date(b.date || 0).getTime();
        return dateB - dateA;
      }
      
      return scoreDiff;
    });
  };

  const handleAnalyzeEmails = async () => {
    setAnalyzingEmails(true);
    setError(null);
    try {
      console.log('Analyzing emails with Aimy...');
      
      // Limit to first 10 emails to avoid timeouts
      const emailsToAnalyze = data.messages.slice(0, 10);
      console.log(`Analyzing ${emailsToAnalyze.length} most recent emails...`);
      
      const response = await ai.analyzeEmails(emailsToAnalyze);
      console.log('Email analysis complete:', response.data);
      
      // Validate response structure
      if (!response.data || !response.data.analysis) {
        throw new Error('Invalid analysis response structure');
      }
      
      setEmailAnalysis(response.data);
    } catch (error) {
      console.error('Failed to analyze emails:', error);
      console.error('Error response:', error.response);
      
      // Better error message
      let errorMessage = 'Failed to analyze emails';
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = 'Analysis timed out. Try again with fewer emails.';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
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
        <main className="text-center max-w-md mx-auto p-8">
          {/* Aimy's Animated Avatar - Circular Frame with Glow */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              {/* Animated glow ring */}
              <div className="absolute inset-0 w-64 h-64 rounded-full bg-gradient-to-r from-teal-300 to-emerald-300 opacity-30 blur-xl animate-pulse"></div>
              
              {/* Avatar container */}
              <div className="relative w-64 h-64 rounded-full overflow-hidden shadow-2xl ring-4 ring-teal-300 ring-opacity-60 bg-white">
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Video failed to load, switching to static fallback');
                    // Replace video with image fallback
                    const img = document.createElement('img');
                    img.src = '/okaimy-static-01.png';
                    img.alt = 'Aimy - Your AI Assistant';
                    img.className = 'w-full h-full object-cover';
                    e.target.parentNode.replaceChild(img, e.target);
                  }}
                >
                  <source src="/opaimy-video-loop-720-01.mp4" type="video/mp4" />
                  {/* Fallback for browsers that don't support video */}
                  <img 
                    src="/okaimy-static-01.png" 
                    alt="Aimy - Your AI Assistant" 
                    className="w-full h-full object-cover"
                  />
                </video>
              </div>
            </div>
          </div>
          
          {/* Logo */}
          <img src="/okaimy-logo-01.png" alt="OkAimy Logo" className="w-48 mx-auto mb-4" onError={(e) => {console.error('Logo failed to load:', e.target.src);}} />
          
          {/* Tagline */}
          <p className="text-xl text-slate-700 mb-2 font-semibold">
            Stay in flow. Never drop the ball.
          </p>
          <p className="text-base text-slate-700 mb-8">
            Your AI partner for focusing on what matters while keeping everything else running smoothly.
          </p>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          <button
            onClick={handleLogin}
            className="px-8 py-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-full font-semibold text-lg hover:from-teal-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl"
          >
            Connect Google Account
          </button>
          <p className="mt-6 text-sm text-slate-700">
            We'll access your Gmail and Calendar to help you focus on what matters.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(to bottom right, #dafef4, #e8fef9, #f0fefb)'}}>
      <header className="bg-white/90 backdrop-blur-sm border-b px-6 py-4 shadow-sm sticky top-0 z-40" style={{borderColor: '#dafef4'}}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/okaimy-logo-01.png" alt="OkAimy" className="h-8" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">OkAimy</h1>
            {data.profile && (
              <p className="text-sm text-slate-700 ml-2">{data.profile.email}</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {profile && profile.onboarding_completed && (
              <>
                <button
                  onClick={() => setShowProfileHub(true)}
                  className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                  title="Profile Hub - Your dashboard"
                >
                  <span className="text-xl">👤</span>
                  <span className="text-sm font-medium">Profile</span>
                </button>
                <button
                  onClick={handleOpenSettings}
                  className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                  title="Settings"
                >
                  <span className="text-xl">⚙️</span>
                  <span className="text-sm font-medium">Settings</span>
                </button>
              </>
            )}
            <div className="text-sm text-slate-700 font-medium">
              Good morning{profile?.display_name ? `, ${profile.display_name}` : ''} 🌞
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* MAIN DASHBOARD: Standup Split-View - Always Visible */}
        <div className="mb-8">
          <StandupDashboard 
            user={data.profile} 
            userAvatar={profile?.avatar_url}
            userName={profile?.display_name || data.profile?.email}
            messages={data.messages}
            events={data.events}
            userProfile={profile}
          />
        </div>

        {/* OLD SECTIONS BELOW - Will be accessible via dashboard links */}
        {/* For now, hiding until we add proper routing/tabs */}
        <div className="hidden">
        {/* AI Stand-Up Section - OLD TEXT-BASED VERSION (replaced by visual dashboard above) */}
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
              className="px-8 py-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-full font-semibold text-lg hover:from-teal-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
              <p className="text-sm text-slate-700">
                Let Aimy identify emails that need your attention and action (analyzes your 10 most recent emails)
              </p>
            </div>
            <button
              onClick={handleAnalyzeEmails}
              disabled={analyzingEmails || data.messages.length === 0}
              className="px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-full font-semibold hover:from-teal-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzingEmails ? '🔍 Analyzing...' : '🔍 Analyze Emails (10)'}
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
                              <span className="text-xs text-slate-700">
                                {urgencyIcons[item.urgency]} {item.urgency}
                              </span>
                            )}
                            {item.actionType && (
                              <span className="text-xs text-slate-700">
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
                          <div className="text-sm text-slate-700 mb-2">
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
                                  className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-teal-700 hover:to-emerald-700 transition-all shadow-sm"
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
                                className="text-slate-400 hover:text-slate-700"
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
                                className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-teal-700 hover:to-emerald-700 transition-all shadow-sm"
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
            {/* Gmail Category Filter - Mobile Dropdown */}
            <div className="md:hidden mb-4">
              <label htmlFor="gmail-category-select" className="sr-only">Select Gmail Category</label>
              <select
                id="gmail-category-select"
                value={activeCategory}
                onChange={async (e) => {
                  const cat = e.target.value;
                  setActiveCategory(cat);
                  setLoading(true);
                  try {
                    const messagesRes = await gmail.getMessages(50, cat);
                    setData(prev => ({ ...prev, messages: messagesRes.data.messages }));
                  } catch (error) {
                    console.error('Failed to load category:', error);
                    const categoryLabels = {
                      'primary': '📧 Primary',
                      'social': '👥 Social',
                      'promotions': '🏷️ Promotions',
                      'updates': '📬 Updates',
                      'forums': '💬 Forums'
                    };
                    setError(`Failed to load ${categoryLabels[cat] || cat}`);
                  } finally {
                    setLoading(false);
                  }
                }}
                className="w-full px-4 py-2.5 text-sm font-medium border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem'
                }}
              >
                <option value="primary">📧 Primary</option>
                <option value="social">👥 Social</option>
                <option value="promotions">🏷️ Promotions</option>
                <option value="updates">📬 Updates</option>
                <option value="forums">💬 Forums</option>
              </select>
            </div>

            {/* Gmail Category Tabs - Desktop */}
            <div className="hidden md:flex items-center gap-2 mb-4 pb-2 border-b" style={{borderColor: '#dafef4'}}>
              {[
                { id: 'primary', label: '📧 Primary', icon: '👤' },
                { id: 'social', label: '👥 Social', icon: '💬' },
                { id: 'promotions', label: '🏷️ Promotions', icon: '📢' },
                { id: 'updates', label: '📬 Updates', icon: '🔔' },
                { id: 'forums', label: '💬 Forums', icon: '🗨️' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={async () => {
                    setActiveCategory(cat.id);
                    setLoading(true);
                    try {
                      const messagesRes = await gmail.getMessages(50, cat.id);
                      setData(prev => ({ ...prev, messages: messagesRes.data.messages }));
                    } catch (error) {
                      console.error('Failed to load category:', error);
                      setError(`Failed to load ${cat.label}`);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                    activeCategory === cat.id
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'text-slate-700 hover:bg-teal-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  📨 {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} ({data.messages.length})
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Gmail's smart categorization • Sorted by importance, then date
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={loadDashboardData}
                  className="px-3 py-1.5 text-xs text-teal-600 hover:bg-teal-50 rounded-lg transition-colors font-medium"
                  title="Refresh emails"
                >
                  🔄 Refresh
                </button>
                <a 
                  href="https://mail.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                >
                  Open Gmail →
                </a>
              </div>
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
                            <span className="px-2 py-1 bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-xs rounded-full shadow-sm flex-shrink-0">
                              New
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-700 truncate">
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
                          className="px-3 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-xs rounded-lg hover:from-teal-700 hover:to-emerald-700 transition-all shadow-sm"
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
                          className="px-3 py-1.5 bg-slate-50 text-slate-700 text-xs rounded-lg hover:bg-slate-100 transition-all border border-slate-200"
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
                <div className="text-slate-700">
                  <span className="font-medium">⭐ Starred:</span> {data.messages.filter(m => m.isStarred).length}
                </div>
                <div className="text-slate-700">
                  <span className="font-medium">‼️ Important:</span> {data.messages.filter(m => m.isImportant).length}
                </div>
                <div className="text-slate-700">
                  <span className="font-medium">👤 Contacts:</span> {data.messages.filter(m => m.isPrimary).length}
                </div>
                <div className="text-slate-700">
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
                        <div className="text-xs text-slate-700 mt-1 flex items-center gap-2">
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
        </div> {/* End hidden section */}
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

      {/* Profile Hub - Full Screen (replaces old Profile modal) */}
      {showProfileHub && data.profile && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setShowProfileHub(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors flex items-center gap-2"
            >
              <span>✕</span>
              <span>Close</span>
            </button>
          </div>
          <ProfileHub userEmail={data.profile.email} />
        </div>
      )}
    </div>
  );
}

export default App;
