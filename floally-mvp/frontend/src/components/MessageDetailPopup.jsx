import { useState, useEffect } from 'react';

function MessageDetailPopup({ message, user, onClose, onFeedback }) {
  const [fullMessage, setFullMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [showReply, setShowReply] = useState(false);

  useEffect(() => {
    loadFullMessage();
  }, [message.id]);

  const loadFullMessage = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://floally-mvp-production.up.railway.app';
      const response = await fetch(
        `${apiUrl}/api/messages/${message.id}/full?user_email=${encodeURIComponent(user.email)}`
      );
      const data = await response.json();
      setFullMessage(data);
    } catch (error) {
      console.error('Failed to load full message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInGmail = () => {
    // Open message in Gmail
    window.open(`https://mail.google.com/mail/u/0/#inbox/${message.id}`, '_blank');
  };

  const handleArchive = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://floally-mvp-production.up.railway.app';
      await fetch(`${apiUrl}/api/gmail/archive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_id: message.id,
          user_email: user.email
        })
      });
      alert('✅ Message archived');
      onClose();
    } catch (error) {
      console.error('Failed to archive:', error);
      alert('❌ Failed to archive message');
    }
  };

  const handleTrash = async () => {
    if (!confirm('Move this message to trash?')) return;
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://floally-mvp-production.up.railway.app';
      await fetch(`${apiUrl}/api/gmail/trash`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_id: message.id,
          user_email: user.email
        })
      });
      alert('✅ Message moved to trash');
      onClose();
    } catch (error) {
      console.error('Failed to trash:', error);
      alert('❌ Failed to trash message');
    }
  };

  const handleUnsubscribe = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://floally-mvp-production.up.railway.app';
      const response = await fetch(
        `${apiUrl}/api/gmail/unsubscribe-link?email_id=${message.id}&user_email=${encodeURIComponent(user.email)}`
      );
      const data = await response.json();
      
      if (data.success && data.unsubscribe_url) {
        window.open(data.unsubscribe_url, '_blank');
      } else {
        alert('No unsubscribe link found in this email');
      }
    } catch (error) {
      console.error('Failed to get unsubscribe link:', error);
      alert('❌ Failed to find unsubscribe link');
    }
  };

  const extractPlainText = (body) => {
    if (!body) return '';
    
    // If it's HTML, strip tags for preview
    if (body.includes('<html') || body.includes('<body')) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = body;
      return tempDiv.textContent || tempDiv.innerText || '';
    }
    
    return body;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-blue-600 text-white p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">{message.subject || 'No Subject'}</h3>
              <div className="text-sm text-teal-100 space-y-1">
                <div><strong>From:</strong> {message.from}</div>
                <div><strong>Date:</strong> {message.date}</div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleOpenInGmail}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              📧 Open in Gmail
            </button>
            <button
              onClick={() => setShowReply(!showReply)}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              ↩️ Reply
            </button>
            <button
              onClick={handleArchive}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              📥 Archive
            </button>
            {message.hasUnsubscribeLink && (
              <button
                onClick={handleUnsubscribe}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
              >
                🚫 Unsubscribe
              </button>
            )}
            <button
              onClick={handleTrash}
              className="px-3 py-1.5 bg-red-500/30 hover:bg-red-500/50 rounded-lg text-sm font-medium transition-colors"
            >
              🗑️ Delete
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin text-4xl mb-3">📧</div>
              <p className="text-gray-600">Loading message...</p>
            </div>
          ) : (
            <>
              {/* AI Insights */}
              {message.aiReason && (
                <div className="mb-6 p-4 bg-gradient-to-r from-teal-50 to-blue-50 border-2 border-teal-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                      <h4 className="font-semibold text-teal-900 mb-1">Aimy's Analysis</h4>
                      <p className="text-sm text-teal-800">{message.aiReason}</p>
                      {message.suggestedAction && (
                        <div className="mt-2">
                          <span className="text-xs font-medium text-teal-700">
                            Suggested: <span className="capitalize">{message.suggestedAction.replace('_', ' ')}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Train Aimy Section */}
              <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>🎓</span>
                  <span>Train Aimy</span>
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Help Aimy learn your preferences by rating this message:
                </p>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => onFeedback(message, 'critical')}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    🔴 Critical
                  </button>
                  <button
                    onClick={() => onFeedback(message, 'interesting')}
                    className="px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    🟡 Interesting
                  </button>
                  <button
                    onClick={() => onFeedback(message, 'unimportant')}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    ⚪ Unimportant
                  </button>
                  <button
                    onClick={() => onFeedback(message, 'junk')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    🗑️ Junk
                  </button>
                </div>
              </div>

              {/* Reply Box */}
              {showReply && (
                <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                  <h4 className="font-semibold text-blue-900 mb-3">↩️ Reply</h4>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply here..."
                    className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={6}
                  />
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => {
                        // TODO: Implement send reply
                        alert('Reply functionality coming soon! For now, please reply in Gmail.');
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      Send Reply
                    </button>
                    <button
                      onClick={() => setShowReply(false)}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Message Body */}
              <div className="prose max-w-none">
                {fullMessage?.body ? (
                  fullMessage.body.includes('<html') || fullMessage.body.includes('<body') ? (
                    <iframe
                      srcDoc={fullMessage.body}
                      className="w-full min-h-[400px] border border-gray-200 rounded-lg"
                      sandbox="allow-same-origin"
                    />
                  ) : (
                    <div className="whitespace-pre-wrap text-gray-800 bg-white p-4 rounded-lg border border-gray-200">
                      {fullMessage.body}
                    </div>
                  )
                ) : (
                  <div className="text-gray-500 italic p-4">
                    {message.snippet || 'No content available'}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessageDetailPopup;
