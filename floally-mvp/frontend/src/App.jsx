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
  const [expandedEmail, setExpandedEmail] = useState(null);
  const [expandedEvent, setExpandedEvent] = useState(null);

  // Debug info
  console.log('OpAlly App loaded - Version 1.0.2 - Built:', new Date().toISOString());
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
          <img src="/opally_logo_vector.png" alt="OpAlly Logo" className="w-48 mx-auto mb-8" />
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
            <img src="/opally_logo_vector.png" alt="OpAlly" className="h-8" />
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
        {/* AI Stand-Up Section - TOP PRIORITY */}
        <div className="mb-8 rounded-2xl p-8 shadow-lg" style={{background: 'linear-gradient(to right, #dafef4, #e8fef9, #d0fdf2)', borderWidth: '1px', borderColor: '#b8f5e8'}}>
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

        <div className="grid md:grid-cols-2 gap-6">
          {/* Messages Card */}
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-lg p-6" style={{borderWidth: '1px', borderColor: '#dafef4'}}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                📨 Recent Messages ({data.messages.length})
              </h2>
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
              {data.messages.slice(0, 8).map((msg) => (
                <div key={msg.id} className="rounded-lg overflow-hidden transition-all" style={{background: 'linear-gradient(to bottom right, #dafef4, #e8fef9)'}}>
                  <div 
                    className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => toggleEmailExpand(msg.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-emerald-400 flex items-center justify-center text-sm font-semibold text-white shadow-sm flex-shrink-0">
                        {msg.from.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-sm font-medium text-slate-900 truncate">
                            {msg.subject}
                          </div>
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
                      <div className="mt-3 flex gap-2">
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
                      </div>
                    </div>
                  )}
                </div>
              ))}
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
    </div>
  );
}

export default App;
