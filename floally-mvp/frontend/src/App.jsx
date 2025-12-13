import React, { useState, useEffect } from 'react';
import CalmDashboard from './components/CalmDashboard';
import GoogleSignIn from './components/GoogleSignIn';
import { auth } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check URL params for OAuth callback
    const params = new URLSearchParams(window.location.search);
    const authSuccess = params.get('auth');
    const userData = params.get('user');
    
    if (authSuccess === 'success' && userData) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userData));
        console.log('✅ OAuth success, user data:', parsedUser);
        setUser(parsedUser);
        setLoading(false);
        setCheckingAuth(false);
        
        // Clean up URL
        window.history.replaceState({}, document.title, '/');
        return;
      } catch (err) {
        console.error('Failed to parse user data from URL:', err);
      }
    }
    
    // Check if already authenticated
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('🔍 Checking auth status...');
      const response = await auth.status();
      
      if (response.data.authenticated) {
        console.log('✅ User authenticated:', response.data.email);
        setUser({
          email: response.data.email,
          name: response.data.display_name || response.data.email.split('@')[0],
          display_name: response.data.display_name,
          avatar_url: response.data.avatar_url,
          user_id: response.data.user_id
        });
      } else {
        console.log('❌ User not authenticated');
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
      setCheckingAuth(false);
    }
  };

  // Loading state
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6F8F7] via-white to-[#E6ECEA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#65E6CF] mx-auto mb-4"></div>
          <p className="text-[#183A3A] font-light">Loading Hey Aimi...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show sign in
  if (!user) {
    return <GoogleSignIn />;
  }

  // Authenticated - show dashboard
  return <CalmDashboard user={user} />;
}

export default App;
