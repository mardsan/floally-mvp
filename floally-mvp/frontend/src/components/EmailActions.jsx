import React, { useState } from 'react';
import { gmail, behavior } from '../services/api';

const EmailActions = ({ email, userEmail, onActionComplete, onRespond }) => {
  const [loading, setLoading] = useState(null);
  const [showUnsubscribe, setShowUnsubscribe] = useState(false);
  const [unsubscribeLink, setUnsubscribeLink] = useState(null);

  const logBehavior = async (actionType) => {
    try {
      await behavior.logAction({
        user_email: userEmail,
        email_id: email.id,
        sender_email: email.from,
        sender_domain: email.domain || email.from.split('@')[1],
        action_type: actionType,
        email_category: email.isPromotional ? 'promotional' :
                       email.isSocial ? 'social' :
                       email.isUpdates ? 'updates' :
                       email.isForums ? 'forums' :
                       email.isNewsletter ? 'newsletter' : 'primary',
        has_unsubscribe: email.hasUnsubscribeLink || false,
        confidence_score: email.confidence || 0.0
      });
    } catch (error) {
      console.error('Failed to log behavior:', error);
      // Don't block the action if logging fails
    }
  };

  const handleMarkImportant = async () => {
    setLoading('important');
    try {
      await gmail.markImportant(email.id);
      await logBehavior('important');
      onActionComplete?.('important', email.id);
    } catch (error) {
      console.error('Failed to mark important:', error);
      alert('Failed to mark as important. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleMarkUnimportant = async () => {
    setLoading('unimportant');
    try {
      await gmail.markUnimportant(email.id);
      await logBehavior('unimportant');
      onActionComplete?.('unimportant', email.id);
    } catch (error) {
      console.error('Failed to mark unimportant:', error);
      alert('Failed to mark as unimportant. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleArchive = async () => {
    setLoading('archive');
    try {
      await gmail.archive(email.id);
      await logBehavior('archive');
      onActionComplete?.('archive', email.id);
    } catch (error) {
      console.error('Failed to archive:', error);
      alert('Failed to archive. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleTrash = async () => {
    if (!confirm('Move this email to trash?')) return;
    
    setLoading('trash');
    try {
      await gmail.trash(email.id);
      await logBehavior('trash');
      onActionComplete?.('trash', email.id);
    } catch (error) {
      console.error('Failed to trash:', error);
      alert('Failed to move to trash. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading('unsubscribe');
    try {
      const response = await gmail.getUnsubscribeLink(email.id);
      
      if (response.data.success && response.data.unsubscribe_url) {
        setUnsubscribeLink(response.data.unsubscribe_url);
        setShowUnsubscribe(true);
        await logBehavior('unsubscribe');
      } else {
        alert('No unsubscribe link found in this email.');
      }
    } catch (error) {
      console.error('Failed to get unsubscribe link:', error);
      alert('Failed to get unsubscribe link. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleRespond = () => {
    logBehavior('respond');
    onRespond?.(email);
  };

  const openUnsubscribeLink = () => {
    if (unsubscribeLink) {
      window.open(unsubscribeLink, '_blank');
      setShowUnsubscribe(false);
      // Archive the email after unsubscribing
      setTimeout(() => handleArchive(), 1000);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t" style={{borderColor: '#dafef4'}}>
        <button
          onClick={handleMarkImportant}
          disabled={loading !== null}
          className="flex items-center gap-1 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-100 transition-all disabled:opacity-50"
          title="Mark as Important & Star"
        >
          {loading === 'important' ? '...' : '⭐'} Focus
        </button>
        
        <button
          onClick={handleMarkUnimportant}
          disabled={loading !== null}
          className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 transition-all disabled:opacity-50"
          title="Not Interested"
        >
          {loading === 'unimportant' ? '...' : '❌'} Not Interested
        </button>
        
        <button
          onClick={handleRespond}
          disabled={loading !== null}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-all disabled:opacity-50"
          title="Generate AI Response"
        >
          📧 Respond
        </button>
        
        <button
          onClick={handleArchive}
          disabled={loading !== null}
          className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 transition-all disabled:opacity-50"
          title="Archive Email"
        >
          {loading === 'archive' ? '...' : '📥'} Archive
        </button>
        
        {email.hasUnsubscribeLink && (
          <button
            onClick={handleUnsubscribe}
            disabled={loading !== null}
            className="flex items-center gap-1 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-100 transition-all disabled:opacity-50"
            title="Unsubscribe from Newsletter"
          >
            {loading === 'unsubscribe' ? '...' : '🚫'} Unsubscribe
          </button>
        )}
        
        <button
          onClick={handleTrash}
          disabled={loading !== null}
          className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-all disabled:opacity-50 ml-auto"
          title="Move to Trash"
        >
          {loading === 'trash' ? '...' : '🗑️'} Trash
        </button>
      </div>

      {/* Unsubscribe Confirmation Modal */}
      {showUnsubscribe && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              🚫 Unsubscribe
            </h3>
            <p className="text-slate-700 mb-4">
              Ready to unsubscribe from <strong>{email.from}</strong>?
            </p>
            <p className="text-sm text-slate-600 mb-6">
              This will open the unsubscribe page in a new tab. After unsubscribing, this email will be archived automatically.
            </p>
            <div className="flex gap-3">
              <button
                onClick={openUnsubscribeLink}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all"
              >
                Open Unsubscribe Link
              </button>
              <button
                onClick={() => setShowUnsubscribe(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmailActions;
