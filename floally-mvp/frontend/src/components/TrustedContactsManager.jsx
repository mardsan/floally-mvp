import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from './Button';
import Card from './Card';
import { CardHeader, CardTitle, CardBody } from './Card';
import Icon from './Icon';

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
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <Card variant="elevated">
        <CardHeader className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl md:text-2xl mb-2">
              <Icon name="contacts" size="md" className="inline-block mr-2 text-primary" />
              Trusted Contacts
            </CardTitle>
            <p className="text-sm md:text-base text-gray-600">
              Manage which senders can have their email attachments automatically processed by Aimy.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto"
          >
            + Add Contact
          </Button>
        </CardHeader>

        {/* Stats */}
        <CardBody>
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            <Card variant="bordered" className="bg-emerald-50 border-emerald-200">
              <CardBody className="p-2 md:p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-1 md:gap-0 mb-1 md:mb-2">
                  <Icon name="check" size="md" className="text-accent" />
                  <div className="text-xl md:text-2xl font-bold text-accent">
                    {contacts.filter(c => c.trust_level === 'trusted').length}
                  </div>
                </div>
                <div className="text-xs md:text-sm text-accent text-center sm:text-left">Trusted</div>
              </CardBody>
            </Card>
            <Card variant="bordered" className="bg-yellow-50 border-yellow-200">
              <CardBody className="p-2 md:p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-1 md:gap-0 mb-1 md:mb-2">
                  <Icon name="star" size="md" className="text-yellow-600" />
                  <div className="text-xl md:text-2xl font-bold text-yellow-700">
                    {contacts.filter(c => c.trust_level === 'one_time').length}
                  </div>
                </div>
                <div className="text-xs md:text-sm text-yellow-600 text-center sm:text-left">Ask Each Time</div>
              </CardBody>
            </Card>
            <Card variant="bordered" className="bg-red-50 border-red-200">
              <CardBody className="p-2 md:p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-1 md:gap-0 mb-1 md:mb-2">
                  <Icon name="Mail" size="md" className="text-red-600" />
                  <div className="text-xl md:text-2xl font-bold text-red-700">
                    {contacts.filter(c => c.trust_level === 'blocked').length}
                  </div>
                </div>
                <div className="text-xs md:text-sm text-red-600 text-center sm:text-left">Blocked</div>
              </CardBody>
            </Card>
          </div>
        </CardBody>
      </Card>

      {/* Filters */}
      <Card variant="default">
        <CardBody className="p-3 md:p-4">
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Icon name="Mail" size="sm" className="absolute left-3 top-2.5 md:top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 md:pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm md:text-base"
              />
            </div>

            {/* Filter */}
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm md:text-base"
          >
            <option value="all">All Levels ({contacts.length})</option>
            <option value="trusted">Trusted ({contacts.filter(c => c.trust_level === 'trusted').length})</option>
            <option value="one_time">Ask Each Time ({contacts.filter(c => c.trust_level === 'one_time').length})</option>
            <option value="blocked">Blocked ({contacts.filter(c => c.trust_level === 'blocked').length})</option>
          </select>
        </div>
        </CardBody>
      </Card>

      {/* Contacts List */}
      <Card variant="default">
        {filteredContacts.length === 0 ? (
          <CardBody className="text-center py-8 md:py-12">
            <Icon name="contacts" size="3xl" className="mx-auto mb-4 text-gray-300" />
            <p className="text-sm md:text-base text-gray-500 mb-4">
              {searchQuery || filterLevel !== 'all' 
                ? 'No contacts match your filters'
                : 'No trusted contacts yet'
              }
            </p>
            {!searchQuery && filterLevel === 'all' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAddModal(true)}
              >
                Add Your First Contact
              </Button>
            )}
          </CardBody>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-okaimy-mint-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                      Trust Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                      Stats
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                      Last Used
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-primary uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-okaimy-mint-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Icon name="Mail" size="md" className="text-primary" />
                          <div>
                            <div className="font-medium text-gray-900">{contact.sender_email}</div>
                            {contact.sender_name && (
                              <div className="text-sm text-gray-500">{contact.sender_name}</div>
                          )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={contact.trust_level}
                          onChange={(e) => handleUpdateTrustLevel(contact.sender_email, e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="trusted">✅ Trusted</option>
                          <option value="one_time">❓ Ask Each Time</option>
                          <option value="blocked">🚫 Blocked</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Icon name="note" size="sm" className="text-gray-400" />
                          {contact.attachment_count || 0} attachments
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(contact.last_used)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRemoveContact(contact.sender_email)}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3 p-3">
              {filteredContacts.map((contact) => (
                <Card key={contact.id} variant="bordered" className="hover:shadow-md transition-shadow">
                  <CardBody className="p-3">
                    {/* Contact Info */}
                    <div className="flex items-start gap-3 mb-3">
                      <Icon name="Mail" size="md" className="text-primary flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm truncate">{contact.sender_email}</div>
                        {contact.sender_name && (
                          <div className="text-xs text-gray-500 truncate">{contact.sender_name}</div>
                        )}
                      </div>
                      {getTrustBadge(contact.trust_level)}
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3 pb-3 border-b border-gray-200">
                      <div className="flex items-center gap-1">
                        <Icon name="note" size="sm" className="text-gray-400" />
                        {contact.attachment_count || 0} attachments
                      </div>
                      <div>Last: {formatDate(contact.last_used)}</div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center gap-2">
                      <select
                        value={contact.trust_level}
                        onChange={(e) => handleUpdateTrustLevel(contact.sender_email, e.target.value)}
                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="trusted">✅ Trusted</option>
                        <option value="one_time">❓ Ask Each Time</option>
                        <option value="blocked">🚫 Blocked</option>
                      </select>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveContact(contact.sender_email)}
                        className="text-xs px-3 py-1.5"
                      >
                        Remove
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <Card variant="elevated" className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl">
            <CardHeader className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg md:text-xl">
                  <Icon name="contacts" size="md" className="inline-block mr-2 text-primary" />
                  Add Trusted Contact
                </CardTitle>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                  type="button"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </CardHeader>
            
            <form onSubmit={handleAddContact}>
              <CardBody className="space-y-4 p-4 md:p-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Icon name="Mail" size="sm" className="absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={newContact.sender_email}
                      onChange={(e) => setNewContact({...newContact, sender_email: e.target.value})}
                      placeholder="sender@example.com"
                      className="w-full pl-10 pr-3 md:pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm md:text-base"
                    />
                  </div>
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
                    className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm md:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trust Level *
                  </label>
                  <select
                    value={newContact.trust_level}
                    onChange={(e) => setNewContact({...newContact, trust_level: e.target.value})}
                    className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm md:text-base"
                  >
                    <option value="trusted">✅ Trusted - Always allow attachments</option>
                    <option value="one_time">❓ Ask Each Time</option>
                    <option value="blocked">🚫 Blocked - Never allow</option>
                  </select>
                </div>
              </CardBody>

              {/* Sticky Footer with Buttons */}
              <CardFooter className="p-4 md:p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0 sm:relative">
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddModal(false);
                      setNewContact({ sender_email: '', sender_name: '', trust_level: 'trusted' });
                    }}
                    className="flex-1 order-2 sm:order-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1 order-1 sm:order-2"
                  >
                    Add Contact
                  </Button>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
