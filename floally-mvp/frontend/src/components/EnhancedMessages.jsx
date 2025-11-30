import { useState, useEffect, useCallback } from 'react';
import MessageDetailPopup from './MessageDetailPopup';

const CATEGORY_TABS = [
  { id: 'all', label: 'All Messages', icon: '📬', color: 'teal' },
  { id: 'primary', label: 'Primary', icon: '👤', color: 'blue' },
  { id: 'social', label: 'Social', icon: '👥', color: 'purple' },
  { id: 'promotions', label: 'Promotions', icon: '🏷️', color: 'orange' },
  { id: 'updates', label: 'Updates', icon: '📋', color: 'green' }
];

const FEEDBACK_OPTIONS = [
  { value: 'critical', label: 'Critical', icon: '🔴', color: 'red' },
  { value: 'interesting', label: 'Interesting', icon: '🟡', color: 'yellow' },
  { value: 'unimportant', label: 'Unimportant', icon: '⚪', color: 'gray' },
  { value: 'junk', label: 'Junk/Spam', icon: '🗑️', color: 'slate' }
];

function EnhancedMessages({ user }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showFeedback, setShowFeedback] = useState(null);
  const [aiAnalysisEnabled, setAiAnalysisEnabled] = useState(true);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setHasAnalyzed(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://floally-mvp-production.up.railway.app';
      const category = activeCategory === 'all' ? '' : activeCategory;
      const endpoint = aiAnalysisEnabled 
        ? `/api/messages/curated?user_email=${encodeURIComponent(user.email)}&max_results=20${category ? `&category=${category}` : ''}`
        : `/api/gmail/messages?user_email=${encodeURIComponent(user.email)}&max_results=20&category=${category || 'primary'}`;
      
      const response = await fetch(`${apiUrl}${endpoint}`);
      const data = await response.json();
      
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, aiAnalysisEnabled, user.email]);

  // Reload messages when category changes (only if already analyzed)
  useEffect(() => {
    if (hasAnalyzed) {
      loadMessages();
    }
  }, [loadMessages, hasAnalyzed]);

  const handleFeedback = async (message, feedbackType) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://floally-mvp-production.up.railway.app';
      
      await fetch(`${apiUrl}/api/messages/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_id: message.id,
          user_email: user.email,
          feedback_type: feedbackType,
          sender_email: message.senderEmail || message.from,
          sender_domain: message.senderDomain || '',
          category: message.category,
          has_unsubscribe: message.hasUnsubscribeLink || false
        })
      });
      
      // Update message in list to reflect feedback
      setMessages(messages.map(m => 
        m.id === message.id 
          ? { ...m, userFeedback: feedbackType }
          : m
      ));
      
      setShowFeedback(null);
      
      // Show confirmation
      alert(`✅ Feedback recorded! Your teammate Aimy will learn from this.`);
      
    } catch (error) {
      console.error('Failed to record feedback:', error);
      alert('❌ Failed to record feedback. Please try again.');
    }
  };

  const handleOpenMessage = async (message) => {
    setSelectedMessage(message);
  };

  const getImportanceIcon = (message) => {
    const score = message.aiImportanceScore || message.compositeScore * 100 || 50;
    
    if (score >= 80) return { icon: '🔴', label: 'Critical', color: 'text-red-600' };
    if (score >= 60) return { icon: '🟡', label: 'Important', color: 'text-yellow-600' };
    if (score >= 40) return { icon: '🔵', label: 'Medium', color: 'text-blue-600' };
    return { icon: '⚪', label: 'Low', color: 'text-gray-400' };
  };

  const getCategoryColor = (category) => {
    const colors = {
      primary: 'from-blue-500 to-indigo-500',
      social: 'from-purple-500 to-pink-500',
      promotions: 'from-orange-500 to-red-500',
      updates: 'from-green-500 to-teal-500',
      forums: 'from-gray-500 to-slate-500'
    };
    return colors[category] || 'from-teal-600 to-blue-500';
  };

  const getCategoryBadgeColor = (category) => {
    const colors = {
      primary: 'bg-blue-100 text-blue-700 border-blue-200',
      social: 'bg-purple-100 text-purple-700 border-purple-200',
      promotions: 'bg-orange-100 text-orange-700 border-orange-200',
      updates: 'bg-green-100 text-green-700 border-green-200',
      forums: 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[category] || 'bg-teal-100 text-teal-700 border-teal-200';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900">✉️ Smart Messages</h3>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              {aiAnalysisEnabled ? 'AI-curated by your teammate Aimy' : 'Recent messages'}
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Analyze Button */}
            <button
              onClick={loadMessages}
              disabled={loading}
              className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all flex items-center gap-2 ${
                loading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-teal-600 to-blue-600 text-white hover:shadow-lg hover:scale-105'
              }`}
            >
              {loading ? (
                <>
                  <span className="animate-spin">⚙️</span>
                  <span className="hidden sm:inline">Analyzing...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : (
                <>
                  <span>🔍</span>
                  <span className="hidden sm:inline">{hasAnalyzed ? 'Refresh' : 'Analyze Messages'}</span>
                  <span className="sm:hidden">{hasAnalyzed ? 'Refresh' : 'Analyze'}</span>
                </>
              )}
            </button>
            
            {/* AI Toggle */}
            <button
              onClick={() => {
                setAiAnalysisEnabled(!aiAnalysisEnabled);
                if (hasAnalyzed) {
                  setTimeout(() => loadMessages(), 100);
                }
              }}
              className={`px-2 md:px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
                aiAnalysisEnabled
                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={aiAnalysisEnabled ? 'AI curation enabled' : 'AI curation disabled'}
            >
              {aiAnalysisEnabled ? '✨ AI' : '⚡ AI'}
            </button>
          </div>
        </div>
        
        {/* Category Filter - Mobile Dropdown */}
        <div className="md:hidden px-4">
          <label htmlFor="category-select" className="sr-only">Select Category</label>
          <select
            id="category-select"
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="w-full px-4 py-2.5 text-sm font-medium border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em',
              paddingRight: '2.5rem'
            }}
          >
            {CATEGORY_TABS.map(tab => (
              <option key={tab.id} value={tab.id}>
                {tab.icon} {tab.label}
              </option>
            ))}
          </select>
        </div>

        {/* Category Tabs - Desktop */}
        <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          {CATEGORY_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                activeCategory === tab.id
                  ? `bg-${tab.color}-50 text-${tab.color}-700 border-2 border-${tab.color}-300 shadow-sm`
                  : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span className="mr-1 md:mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages List */}
      <div className="max-h-[500px] md:max-h-[600px] overflow-y-auto">
        {!hasAnalyzed ? (
          <div className="text-center py-12 md:py-16 px-4">
            <div className="text-5xl md:text-6xl mb-4">📬</div>
            <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Ready to analyze your inbox</h4>
            <p className="text-sm md:text-base text-gray-700 mb-4 md:mb-6">
              Click <strong>"Analyze Messages"</strong> to let Aimy review and curate your emails
            </p>
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-teal-50 border border-teal-200 rounded-lg text-xs md:text-sm text-teal-800">
              <span>💡</span>
              <span>AI analysis runs on-demand to save resources</span>
            </div>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="animate-spin text-4xl mb-3">📧</div>
            <p className="text-sm md:text-base text-gray-700">Analyzing messages with AI...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm md:text-base text-gray-500">No messages in this category</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {messages.map((message, idx) => {
              const importance = getImportanceIcon(message);
              
              return (
                <div
                  key={message.id || idx}
                  className="p-3 md:p-4 hover:bg-gray-50 transition-colors group relative"
                >
                  <div className="flex items-start gap-2 md:gap-3">
                    {/* Importance Indicator */}
                    <div className="flex-shrink-0 pt-1">
                      <div className={`text-xl md:text-2xl ${importance.color}`} title={importance.label}>
                        {importance.icon}
                      </div>
                    </div>
                    
                    {/* Message Content */}
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleOpenMessage(message)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className={`text-sm md:text-base font-semibold ${message.unread ? 'text-gray-900' : 'text-gray-700'} truncate`}>
                              {message.from}
                            </h4>
                            {/* Attachment Indicator */}
                            {message.attachmentCount > 0 && (
                              <span className="flex items-center gap-1 text-xs text-gray-500" title={`${message.attachmentCount} attachment(s)`}>
                                <span>📎</span>
                                <span className="hidden sm:inline">{message.attachmentCount}</span>
                              </span>
                            )}
                          </div>
                          <p className={`text-xs md:text-sm ${message.unread ? 'font-semibold text-gray-900' : 'text-gray-700'} truncate mt-0.5`}>
                            {message.subject}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                          {/* Category Badge */}
                          {message.category && message.category !== 'all' && (
                            <span className={`text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full border ${getCategoryBadgeColor(message.category)}`}>
                              <span className="hidden sm:inline">{message.category}</span>
                              <span className="sm:hidden">{message.category.charAt(0).toUpperCase()}</span>
                            </span>
                          )}
                          
                          {/* Gmail Flags */}
                          {message.isStarred && <span className="text-yellow-500 text-sm md:text-base">⭐</span>}
                          {message.isImportant && <span className="text-red-500 text-sm md:text-base">❗</span>}
                        </div>
                      </div>
                      
                      <p className="text-[11px] md:text-xs text-gray-500 line-clamp-2 mt-1">
                        {message.snippet}
                      </p>
                      
                      {/* AI Insight */}
                      {message.aiReason && (
                        <div className="mt-2 flex items-start gap-2 text-[11px] md:text-xs bg-teal-50 border border-teal-200 rounded-lg p-2">
                          <span className="text-teal-600 flex-shrink-0">💡</span>
                          <span className="text-teal-700 line-clamp-2">{message.aiReason}</span>
                        </div>
                      )}
                      
                      {/* Suggested Action */}
                      {message.suggestedAction && (
                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] md:text-xs text-gray-500">Suggested:</span>
                          <span className={`text-[10px] md:text-xs px-2 py-0.5 rounded-full ${
                            message.suggestedAction === 'read_now' ? 'bg-red-100 text-red-700' :
                            message.suggestedAction === 'read_later' ? 'bg-yellow-100 text-yellow-700' :
                            message.suggestedAction === 'archive' ? 'bg-gray-100 text-gray-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {message.suggestedAction.replace('_', ' ')}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Actions Menu */}
                    <div className="flex-shrink-0 relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowFeedback(showFeedback === message.id ? null : message.id);
                        }}
                        className="p-1.5 md:p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100 text-lg md:text-xl"
                        title="Train Aimy"
                      >
                        🎓
                      </button>
                      
                      {/* Feedback Dropdown */}
                      {showFeedback === message.id && (
                        <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-xl z-10 p-2 min-w-[160px] md:min-w-[180px]">
                          <div className="text-[10px] md:text-xs font-semibold text-gray-700 mb-2 px-2">
                            Train Aimy:
                          </div>
                          {FEEDBACK_OPTIONS.map(option => (
                            <button
                              key={option.value}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFeedback(message, option.value);
                              }}
                              className={`w-full text-left px-2 md:px-3 py-2 rounded-md text-xs md:text-sm hover:bg-${option.color}-50 transition-colors flex items-center gap-2`}
                            >
                              <span className="text-sm md:text-base">{option.icon}</span>
                              <span>{option.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Message Detail Popup */}
      {selectedMessage && (
        <MessageDetailPopup
          message={selectedMessage}
          user={user}
          onClose={() => setSelectedMessage(null)}
          onFeedback={handleFeedback}
        />
      )}
    </div>
  );
}

export default EnhancedMessages;
