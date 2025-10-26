import { useState, useEffect } from 'react';
import AttachmentConsentPrompt from './AttachmentConsentPrompt';

const SIGNATURE_STYLES = [
  { value: 'ai_assisted', label: '✨ From Me (with Aimy)', description: 'Your name with Aimy as your teammate' },
  { value: 'as_aimy', label: '🤖 From Aimy (on my team)', description: 'Aimy responding on your behalf' },
  { value: 'no_attribution', label: '👤 From Me Only', description: 'No mention of AI' }
];

function MessageDetailPopup({ message, user, onClose, onFeedback }) {
  const [fullMessage, setFullMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [showReply, setShowReply] = useState(false);
  const [aiDrafting, setAiDrafting] = useState(false);
  const [aiDraft, setAiDraft] = useState(null);
  const [signatureStyle, setSignatureStyle] = useState('ai_assisted');
  const [customContext, setCustomContext] = useState('');
  const [sending, setSending] = useState(false);
  const [showAttachmentConsent, setShowAttachmentConsent] = useState(false);
  const [attachmentInfo, setAttachmentInfo] = useState(null);

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

  const handleLetAimyRespond = async (processedAttachments = null) => {
    setAiDrafting(true);
    setShowReply(true);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://floally-mvp-production.up.railway.app';
      
      // Build custom context with attachment summaries if available
      let enhancedContext = customContext || '';
      if (processedAttachments && processedAttachments.length > 0) {
        const attachmentSummaries = processedAttachments
          .map(att => `[${att.filename}]: ${att.summary}`)
          .join('\n');
        enhancedContext = `${customContext ? customContext + '\n\n' : ''}ATTACHMENT SUMMARIES:\n${attachmentSummaries}`;
      }
      
      const response = await fetch(`${apiUrl}/api/messages/draft-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_email: user.email,
          message_id: message.id,
          signature_style: signatureStyle,
          custom_context: enhancedContext || null
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('API Error Response:', errorData);
        throw new Error(errorData.detail || 'Failed to generate draft');
      }
      
      const data = await response.json();
      setAiDraft(data);
      setReplyText(data.draft);
      
      // Check if there are unprocessed attachments (only on initial generation, not re-generation)
      if (!processedAttachments && data.attachments && data.attachments.has_attachments && data.attachments.unprocessed) {
        setAttachmentInfo(data.attachments);
        setShowAttachmentConsent(true);
        console.log(`📎 ${data.attachments.count} unprocessed attachment(s) detected`);
      }
      
      // Record that draft was generated
      if (processedAttachments) {
        console.log(`✨ Aimy generated draft response with ${processedAttachments.length} attachment(s)`);
      } else {
        console.log('✨ Aimy generated draft response');
      }
      
    } catch (error) {
      console.error('Failed to generate AI response:', error);
      alert(`❌ Failed to generate response: ${error.message}`);
    } finally {
      setAiDrafting(false);
    }
  };

  const handleAttachmentApprove = async (permanent) => {
    console.log(`✅ Attachments approved${permanent ? ' (saved preference)' : ' (one-time)'}`);
    setShowAttachmentConsent(false);
    
    // Process attachments
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://floally-mvp-production.up.railway.app';
      const response = await fetch(`${apiUrl}/api/messages/process-attachments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_email: user.email,
          message_id: message.id
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to process attachments');
      }
      
      const data = await response.json();
      console.log(`📎 Processed ${data.count} attachment(s):`, data.attachments);
      
      // Re-generate draft with attachment context
      await handleLetAimyRespond(data.attachments);
      
    } catch (error) {
      console.error('Failed to process attachments:', error);
      alert('⚠️ Failed to process attachments. Generating response without attachment context.');
      // Generate draft anyway without attachments
      await handleLetAimyRespond();
    }
  };

  const handleAttachmentDecline = () => {
    console.log('❌ Attachment processing declined');
    setShowAttachmentConsent(false);
    // Generate draft without attachments
    handleLetAimyRespond();
  };

  const handleApproveDraft = async (approved) => {
    if (!aiDraft) return;
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://floally-mvp-production.up.railway.app';
      
      // Extract sender email
      let senderEmail = message.from;
      if (senderEmail.includes('<')) {
        senderEmail = senderEmail.split('<')[1].split('>')[0];
      }
      
      await fetch(`${apiUrl}/api/messages/approve-draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: message.id,
          user_email: user.email,
          sender_email: senderEmail,
          draft_approved: approved
        })
      });
      
      if (approved) {
        console.log('✅ Draft approved - Aimy is learning!');
      } else {
        console.log('❌ Draft rejected - Aimy will improve');
      }
      
    } catch (error) {
      console.error('Failed to record draft approval:', error);
    }
  };

  const handleRegenerateDraft = () => {
    setAiDraft(null);
    setReplyText('');
    handleLetAimyRespond();
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      alert('Please write a reply first');
      return;
    }
    
    setSending(true);
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://floally-mvp-production.up.railway.app';
      
      // If this was an AI draft, record approval
      if (aiDraft) {
        await handleApproveDraft(true);
      }
      
      const response = await fetch(`${apiUrl}/api/messages/send-reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: message.id,
          user_email: user.email,
          reply_body: replyText,
          reply_to: message.from,
          subject: aiDraft?.subject || `Re: ${message.subject}`
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send reply');
      }
      
      alert('✅ Reply sent successfully!');
      onClose();
      
    } catch (error) {
      console.error('Failed to send reply:', error);
      alert('❌ Failed to send reply. Please try in Gmail.');
    } finally {
      setSending(false);
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
              onClick={handleLetAimyRespond}
              disabled={aiDrafting}
              className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors shadow-md"
            >
              {aiDrafting ? '✨ Drafting...' : '✨ Let Aimy (teammate) respond'}
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
              {/* Message Preview */}
              <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{message.snippet}</p>
              </div>

              {/* Attachments Section */}
              {fullMessage && fullMessage.attachments && fullMessage.attachments.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span>📎</span>
                    <span>Attachments ({fullMessage.attachments.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {fullMessage.attachments.map((attachment, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-purple-300 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-2xl">
                            {attachment.mime_type?.includes('pdf') ? '📄' :
                             attachment.mime_type?.includes('image') ? '🖼️' :
                             attachment.mime_type?.includes('word') ? '📝' :
                             '📎'}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{attachment.filename}</p>
                            <p className="text-xs text-gray-500">
                              {attachment.mime_type} • {Math.round((attachment.size || 0) / 1024)} KB
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => window.open(`https://mail.google.com/mail/u/0/#inbox/${message.id}`, '_blank')}
                            className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            📥 Open
                          </button>
                          <button
                            onClick={() => {
                              // Trigger attachment review workflow
                              setAttachmentInfo({
                                sender_email: message.from.includes('<') ? message.from.split('<')[1].split('>')[0] : message.from,
                                files: [{
                                  filename: attachment.filename,
                                  mime_type: attachment.mime_type,
                                  size: attachment.size
                                }],
                                count: 1,
                                has_attachments: true,
                                unprocessed: true
                              });
                              setShowAttachmentConsent(true);
                            }}
                            className="px-3 py-1.5 text-sm font-medium bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-colors shadow-sm"
                          >
                            ✨ Review with Aimy
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

              {/* Teach Your Teammate Section */}
              <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>🎓</span>
                  <span>Teach Your Teammate</span>
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Help Aimy learn how your team operates by rating this message:
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
                <div className="mb-6 p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-purple-900">↩️ Reply</h4>
                    {aiDraft && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        ✨ AI Draft
                      </span>
                    )}
                  </div>
                  
                  {/* Attachment Consent Prompt */}
                  {showAttachmentConsent && attachmentInfo && (
                    <AttachmentConsentPrompt
                      senderEmail={attachmentInfo.sender_email}
                      senderName={message.from?.split('<')[0].trim()}
                      attachments={attachmentInfo.files.map(f => typeof f === 'string' ? f : f.filename)}
                      onApprove={handleAttachmentApprove}
                      onDecline={handleAttachmentDecline}
                      userEmail={user.email}
                    />
                  )}
                  
                  {/* Signature Style Selector */}
                  {!aiDraft && (
                    <div className="mb-3">
                      <label className="text-sm font-medium text-purple-900 mb-2 block">
                        Signature Style:
                      </label>
                      <div className="grid grid-cols-1 gap-2">
                        {SIGNATURE_STYLES.map(style => (
                          <label
                            key={style.value}
                            className={`flex items-start gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all ${
                              signatureStyle === style.value
                                ? 'border-purple-500 bg-purple-100'
                                : 'border-purple-200 hover:border-purple-300 bg-white'
                            }`}
                          >
                            <input
                              type="radio"
                              name="signature"
                              value={style.value}
                              checked={signatureStyle === style.value}
                              onChange={(e) => setSignatureStyle(e.target.value)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-purple-900">{style.label}</div>
                              <div className="text-xs text-purple-600">{style.description}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Custom Context Input */}
                  {!aiDraft && (
                    <div className="mb-3">
                      <label className="text-sm font-medium text-purple-900 mb-2 block">
                        Additional Context (optional):
                      </label>
                      <input
                        type="text"
                        value={customContext}
                        onChange={(e) => setCustomContext(e.target.value)}
                        placeholder="e.g., 'Mention the project deadline' or 'Keep it brief'"
                        className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                    </div>
                  )}
                  
                  <textarea
                    value={replyText}
                    onChange={(e) => {
                      setReplyText(e.target.value);
                      // If user edits AI draft, mark it as modified
                      if (aiDraft && e.target.value !== aiDraft.draft) {
                        console.log('User modified AI draft');
                      }
                    }}
                    placeholder="Type your reply here, or click 'Let Aimy (teammate) respond' to generate a draft..."
                    className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={aiDraft ? 12 : 6}
                  />
                  
                  {/* Draft Controls */}
                  {aiDraft && (
                    <div className="mt-3 p-3 bg-white/50 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-purple-900">
                          Draft Style: {SIGNATURE_STYLES.find(s => s.value === aiDraft.signature_style)?.label}
                        </span>
                        <button
                          onClick={handleRegenerateDraft}
                          disabled={aiDrafting}
                          className="text-xs px-2 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded transition-colors"
                        >
                          🔄 Regenerate
                        </button>
                      </div>
                      <p className="text-xs text-purple-600">
                        Tone: {aiDraft.user_context?.tone} • Style: {aiDraft.user_context?.style}
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={handleSendReply}
                      disabled={sending || !replyText.trim()}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors shadow-md"
                    >
                      {sending ? '📤 Sending...' : '📤 Send Reply'}
                    </button>
                    {aiDraft && (
                      <>
                        <button
                          onClick={() => handleApproveDraft(true)}
                          className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-medium transition-colors"
                          title="Approve draft (helps Aimy learn)"
                        >
                          ✅
                        </button>
                        <button
                          onClick={() => {
                            handleApproveDraft(false);
                            setAiDraft(null);
                            setReplyText('');
                          }}
                          className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors"
                          title="Reject draft (helps Aimy learn)"
                        >
                          ❌
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        setShowReply(false);
                        setAiDraft(null);
                        setReplyText('');
                        setCustomContext('');
                      }}
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
