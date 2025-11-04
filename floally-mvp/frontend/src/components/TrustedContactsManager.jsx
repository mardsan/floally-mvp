import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function TrustedContactsManager({ userEmail }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('all'); // all, trusted, blocked, one_time
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form state for adding new contact
  const [newContact, setNewContact] = useState({
    sender_email: '',
    sender_name: '',
    trust_level: 'trusted'
  });

  useEffect(() => {
    loadContacts();
  }, [userEmail]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/api/trusted-senders/${userEmail}`);
      setContacts(response.data || []);
    } catch (err) {
      console.error('Error loading trusted contacts:', err);
      if (err.response?.status === 503) {
        setError('Trusted contacts feature is being set up. Please try again later.');
      } else {
        setError('Failed to load trusted contacts');
      }
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/trusted-senders/${userEmail}`, {
        sender_email: newContact.sender_email,
        sender_name: newContact.sender_name || null,
        trust_level: newContact.trust_level
      });
      
      // Reset form and reload
      setNewContact({ sender_email: '', sender_name: '', trust_level: 'trusted' });
      setShowAddModal(false);
      await loadContacts();
    } catch (err) {
      console.error('Error adding contact:', err);
      alert('Failed to add contact: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleUpdateTrustLevel = async (senderEmail, newTrustLevel) => {
    try {
      await axios.patch(`${API_URL}/api/trusted-senders/${userEmail}/${encodeURIComponent(senderEmail)}`, {
        trust_level: newTrustLevel
      });
      await loadContacts();
    } catch (err) {
      console.error('Error updating trust level:', err);
      alert('Failed to update trust level');
    }
  };

  const handleRemoveContact = async (senderEmail) => {
    if (!confirm(`Remove ${senderEmail} from your trusted contacts list?`)) {
      return;
    }
    
    try {
      await axios.delete(`${API_URL}/api/trusted-senders/${userEmail}/${encodeURIComponent(senderEmail)}`);
      await loadContacts();
    } catch (err) {
      console.error('Error removing contact:', err);
      alert('Failed to remove contact');
    }
  };

  // Filter contacts based on search and filter
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = !searchQuery || 
      contact.sender_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contact.sender_name && contact.sender_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = filterLevel === 'all' || contact.trust_level === filterLevel;
    
    return matchesSearch && matchesFilter;
  });

  const getTrustBadge = (trustLevel) => {
    const badges = {
      trusted: { bg: 'bg-green-100', text: 'text-green-800', icon: '✅', label: 'Trusted' },
      blocked: { bg: 'bg-red-100', text: 'text-red-800', icon: '🚫', label: 'Blocked' },
      one_time: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '❓', label: 'Ask Each Time' }
    };
    const badge = badges[trustLevel] || badges.one_time;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <span className="mr-1">{badge.icon}</span>
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trusted contacts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start">
          <span className="text-2xl mr-3">⚠️</span>
          <div>
            <h3 className="text-lg font-medium text-yellow-900 mb-1">Feature Unavailable</h3>
            <p className="text-yellow-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Trusted Contacts</h2>
            <p className="text-gray-600">
              Manage which senders can have their email attachments automatically processed by Aimy.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            + Add Contact
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="text-2xl font-bold text-green-700">
              {contacts.filter(c => c.trust_level === 'trusted').length}
            </div>
            <div className="text-sm text-green-600">Trusted</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-700">
              {contacts.filter(c => c.trust_level === 'one_time').length}
            </div>
            <div className="text-sm text-yellow-600">Ask Each Time</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="text-2xl font-bold text-red-700">
              {contacts.filter(c => c.trust_level === 'blocked').length}
            </div>
            <div className="text-sm text-red-600">Blocked</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Filter */}
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
          >
            <option value="all">All Levels ({contacts.length})</option>
            <option value="trusted">Trusted ({contacts.filter(c => c.trust_level === 'trusted').length})</option>
            <option value="one_time">Ask Each Time ({contacts.filter(c => c.trust_level === 'one_time').length})</option>
            <option value="blocked">Blocked ({contacts.filter(c => c.trust_level === 'blocked').length})</option>
          </select>
        </div>
      </div>

      {/* Contacts List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredContacts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {searchQuery || filterLevel !== 'all' 
                ? 'No contacts match your filters'
                : 'No trusted contacts yet'
              }
            </p>
            {!searchQuery && filterLevel === 'all' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Add Your First Contact
              </button>
            )}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trust Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Used
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{contact.sender_email}</div>
                      {contact.sender_name && (
                        <div className="text-sm text-gray-500">{contact.sender_name}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={contact.trust_level}
                      onChange={(e) => handleUpdateTrustLevel(contact.sender_email, e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-teal-500"
                    >
                      <option value="trusted">✅ Trusted</option>
                      <option value="one_time">❓ Ask Each Time</option>
                      <option value="blocked">🚫 Blocked</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div>{contact.attachment_count || 0} attachments</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(contact.last_used)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleRemoveContact(contact.sender_email)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add Trusted Contact</h3>
            
            <form onSubmit={handleAddContact} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newContact.sender_email}
                  onChange={(e) => setNewContact({...newContact, sender_email: e.target.value})}
                  placeholder="sender@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  value={newContact.sender_name}
                  onChange={(e) => setNewContact({...newContact, sender_name: e.target.value})}
                  placeholder="John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trust Level *
                </label>
                <select
                  value={newContact.trust_level}
                  onChange={(e) => setNewContact({...newContact, trust_level: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500"
                >
                  <option value="trusted">✅ Trusted - Always allow attachments</option>
                  <option value="one_time">❓ Ask Each Time</option>
                  <option value="blocked">🚫 Blocked - Never allow</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewContact({ sender_email: '', sender_name: '', trust_level: 'trusted' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Add Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
