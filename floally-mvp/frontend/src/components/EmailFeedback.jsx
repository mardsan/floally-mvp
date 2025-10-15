import React, { useState } from 'react';
import { behavior } from '../services/api';

const EmailFeedback = ({ email, userEmail, onFeedbackComplete }) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFeedback = async (type, reason = null) => {
    setSubmitting(true);
    try {
      // Log feedback as a behavioral action
      await behavior.logAction({
        user_email: userEmail,
        email_id: email.id,
        sender_email: email.from,
        sender_domain: email.domain || email.from.split('@')[1]?.split('>')[0],
        action_type: type === 'important' ? 'mark_important_feedback' : 'mark_unimportant_feedback',
        email_category: email.isPromotional ? 'promotional' :
                       email.isSocial ? 'social' :
                       email.isUpdates ? 'updates' :
                       email.isPrimary ? 'primary' : 'other',
        has_unsubscribe: email.hasUnsubscribeLink || false,
        confidence_score: 1.0, // High confidence - direct user feedback
        metadata: reason ? { reason } : null
      });

      setFeedbackType(type);
      setTimeout(() => {
        setShowFeedback(false);
        setFeedbackType(null);
        onFeedbackComplete?.(type);
      }, 1500);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (feedbackType) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
        ✅ Thanks! Ally is learning your preferences.
      </div>
    );
  }

  if (!showFeedback) {
    return (
      <button
        onClick={() => setShowFeedback(true)}
        className="text-xs text-slate-500 hover:text-teal-600 transition-all"
        title="Help Ally learn your preferences"
      >
        💡 Help Ally learn
      </button>
    );
  }

  return (
    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
      <div className="text-sm font-medium text-amber-900 mb-2">
        🤔 Is this email important to you?
      </div>
      <div className="text-xs text-amber-700 mb-3">
        Your feedback helps Ally learn which emails matter most to you.
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => handleFeedback('important')}
          disabled={submitting}
          className="flex-1 px-3 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 transition-all disabled:opacity-50"
        >
          ⭐ Yes, important
        </button>
        <button
          onClick={() => handleFeedback('unimportant')}
          disabled={submitting}
          className="flex-1 px-3 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition-all disabled:opacity-50"
        >
          ❌ Not important
        </button>
      </div>
      <button
        onClick={() => setShowFeedback(false)}
        className="mt-2 text-xs text-slate-500 hover:text-slate-700 w-full text-center"
      >
        Cancel
      </button>
    </div>
  );
};

export default EmailFeedback;
