import React, { useState, useEffect } from 'react';
import { auth, gmail, calendar, ai } from './services/api';

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

  // Debug info
  console.log('OpAlly App loaded - Version 1.0.1 - Built:', new Date().toISOString());
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
        gmail.getMessages(10),
        calendar.getEvents(1),
        gmail.getProfile()
      ]);

      setData({
        messages: messagesRes.data.messages,
        events: eventsRes.data.events,
        profile: profileRes.data
      });
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
      const response = await ai.generateStandup({
        messages: data.messages,
        events: data.events
      });
      console.log('Stand-up generated:', response.data);
      setStandup(response.data.standup);
    } catch (error) {
      console.error('Failed to generate stand-up:', error);
      setError(`Failed to generate stand-up: ${error.message}`);
    } finally {
      setGeneratingStandup(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(to bottom right, #dafef4, #e8fef9)'}}>
        <div className="text-center">
          <div className="text-4xl mb-4">🔄</div>
          <div className="text-slate-700">Loading OpAlly…</div>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(to bottom right, #dafef4, #e8fef9, #d0fdf2)'}}>
        <div className="text-center max-w-md mx-auto p-8">
          <img src="/opally-logo.png" alt="OpAlly Logo" className="w-48 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            OpAlly
          </h1>
          <p className="text-lg text-slate-700 mb-8">
            Your AI-powered daily stand-up and operational partner for creative work.
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
            <img src="/opally-logo.png" alt="OpAlly" className="h-8" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">OpAlly</h1>
            {data.profile && (
              <p className="text-sm text-slate-600 ml-2">{data.profile.email}</p>
            )}
          </div>
          <div className="text-sm text-slate-600">
            Good morning 🌞
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Messages Card */}
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-lg p-6" style={{borderWidth: '1px', borderColor: '#dafef4'}}>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              📨 Recent Messages ({data.messages.length})
            </h2>
            <div className="space-y-3">
              {data.messages.slice(0, 5).map((msg) => (
                <div key={msg.id} className="p-3 rounded-lg hover:shadow-md transition-shadow" style={{background: 'linear-gradient(to bottom right, #dafef4, #e8fef9)'}}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center text-sm font-semibold text-white shadow-sm">
                      {msg.from.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">
                        {msg.subject}
                      </div>
                      <div className="text-xs text-slate-600 truncate">
                        From: {msg.from.split('<')[0].trim()}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {msg.snippet}
                      </div>
                    </div>
                    {msg.unread && (
                      <span className="px-2 py-1 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-xs rounded-full shadow-sm">
                        New
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar Card */}
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-lg p-6" style={{borderWidth: '1px', borderColor: '#dafef4'}}>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              📅 Today's Events ({data.events.length})
            </h2>
            <div className="space-y-3">
              {data.events.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No events scheduled today
                </div>
              ) : (
                data.events.map((event) => (
                  <div key={event.id} className="p-3 rounded-lg hover:shadow-md transition-shadow" style={{background: 'linear-gradient(to bottom right, #e0fef5, #dafef4)'}}>
                    <div className="text-sm font-medium text-slate-900">
                      {event.summary}
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      {new Date(event.start).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      {event.attendees.length > 0 && (
                        <span className="ml-2">
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
                ))
              )}
            </div>
          </div>
        </div>

        {/* AI Stand-Up Section */}
        <div className="mt-8 rounded-2xl p-8 shadow-lg" style={{background: 'linear-gradient(to right, #dafef4, #e8fef9, #d0fdf2)', borderWidth: '1px', borderColor: '#b8f5e8'}}>
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              AI Daily Stand-Up
            </h3>
            <p className="text-slate-700 mb-6">
              Let Op analyze your messages and calendar to give you "The One Thing" to focus on today.
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
      </main>
    </div>
  );
}

export default App;
