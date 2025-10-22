import { useState, useEffect } from 'react';

function WaitlistAdmin() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [signups, setSignups] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const ADMIN_PASSWORD = 'okaimy2024'; // Change this to something secure!

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      fetchSignups();
    } else {
      setError('Incorrect password');
    }
  };

  const fetchSignups = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/waitlist-export?secret=okaimy_export_2024_secure');
      const data = await response.json();
      
      if (data.success) {
        setSignups(data.signups || []);
        setTotal(data.total || 0);
      } else {
        setError('Failed to load signups');
      }
    } catch (err) {
      setError('Error loading signups: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    window.location.href = '/api/waitlist-export?secret=okaimy_export_2024_secure&format=csv';
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStruggleLabel = (struggle) => {
    const labels = {
      'too_many_emails': 'Too many emails',
      'missing_deadlines': 'Missing deadlines',
      'context_switching': 'Context switching',
      'follow_ups': 'Follow-ups',
      'priorities': 'Setting priorities'
    };
    return labels[struggle] || struggle;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Waitlist Admin
          </h1>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter admin password"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-red-600 text-sm mb-4">{error}</p>
            )}
            <button
              type="submit"
              className="w-full bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Waitlist Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Total Signups: <span className="font-semibold text-teal-600">{total}</span>
              </p>
            </div>
            <div className="space-x-3">
              <button
                onClick={fetchSignups}
                disabled={loading}
                className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh'}
              </button>
              <button
                onClick={downloadCSV}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                📥 Download CSV
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              <p className="text-gray-600 mt-4">Loading signups...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">#</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Main Struggle</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Signed Up</th>
                  </tr>
                </thead>
                <tbody>
                  {signups.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-gray-500">
                        No signups yet
                      </td>
                    </tr>
                  ) : (
                    signups.map((signup, index) => (
                      <tr key={signup.signupId} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-600">
                          {signups.length - index}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {signup.name}
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {signup.email}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm">
                            {getStruggleLabel(signup.struggle)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {formatDate(signup.timestamp)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={() => window.location.href = '/'}
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            ← Back to Landing Page
          </button>
        </div>
      </div>
    </div>
  );
}

export default WaitlistAdmin;
