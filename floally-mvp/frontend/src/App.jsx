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

  // Debug info
  console.log('FloAlly App loaded - Version 1.0.1 - Built:', new Date().toISOString());
  console.log('API URL:', import.meta.env.VITE_API_URL || 'http://localhost:8000');

  useEffect(() => {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="text-4xl mb-4">🔄</div>
          <div className="text-slate-600">Loading FloAlly…</div>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-6">🌊</div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            FloAlly
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            Your AI-powered daily stand-up and operational partner for creative work.
          </p>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          <button
            onClick={handleLogin}
            className="px-8 py-4 bg-sky-600 text-white rounded-full font-semibold text-lg hover:bg-sky-700 transition-colors shadow-lg"
          >
            Connect Google Account
          </button>
          <p className="mt-6 text-sm text-slate-500">
            We'll access your Gmail and Calendar to help you focus on what matters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">FloAlly</h1>
            {data.profile && (
              <p className="text-sm text-slate-600">{data.profile.email}</p>
            )}
          </div>
          <div className="text-sm text-slate-500">
            Good morning 🌞
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Messages Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              📨 Recent Messages ({data.messages.length})
            </h2>
            <div className="space-y-3">
              {data.messages.slice(0, 5).map((msg) => (
                <div key={msg.id} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sm font-semibold text-sky-700">
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
                      <span className="px-2 py-1 bg-sky-100 text-sky-700 text-xs rounded-full">
                        New
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
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
                  <div key={event.id} className="p-3 bg-slate-50 rounded-lg">
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

        {/* Coming Soon Section */}
        <div className="mt-8 bg-gradient-to-r from-sky-50 to-indigo-50 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">🚧</div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            AI Stand-Up Coming Soon
          </h3>
          <p className="text-slate-600">
            FloAlly will soon analyze your messages and calendar to give you
            "The One Thing" to focus on, plus smart decisions and actions.
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
