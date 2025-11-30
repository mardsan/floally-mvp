import { useState } from 'react';

function DeleteProfileModal({ user, onClose, onDelete }) {
  const [step, setStep] = useState(1); // 1: Warning, 2: Feedback, 3: Final Confirmation
  const [confirmText, setConfirmText] = useState('');
  const [feedback, setFeedback] = useState({
    reason: '',
    details: '',
    wouldRecommend: null
  });
  const [deleting, setDeleting] = useState(false);

  const deleteReasons = [
    'Not using it enough',
    'Too expensive',
    'Missing features I need',
    'Found a better alternative',
    'Privacy concerns',
    'Technical issues',
    'Just trying it out',
    'Other'
  ];

  const handleDelete = async () => {
    if (confirmText !== 'DELETE MY ACCOUNT') {
      return;
    }

    setDeleting(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'https://floally-mvp-production.up.railway.app';
      
      // Send feedback to backend
      await fetch(`${apiUrl}/api/user/delete-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_email: user.email,
          reason: feedback.reason,
          details: feedback.details,
          would_recommend: feedback.wouldRecommend
        })
      });

      // Delete the profile
      await onDelete();
    } catch (error) {
      console.error('Failed to delete profile:', error);
      alert('Failed to delete profile. Please try again or contact support.');
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-red-50">
          <h3 className="text-xl font-bold text-red-900">Delete Account</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">
                  Are you sure you want to delete your account?
                </h4>
                <p className="text-gray-600">
                  This action will permanently delete your OkAimy account and all associated data.
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h5 className="font-semibold text-red-900 mb-2">What will be deleted:</h5>
                <ul className="space-y-2 text-sm text-red-800">
                  <li className="flex items-start gap-2">
                    <span>❌</span>
                    <span>Your profile and account information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>❌</span>
                    <span>All connected accounts (Google, etc.)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>❌</span>
                    <span>Your preferences and settings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>❌</span>
                    <span>AI learning data and behavior history</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>❌</span>
                    <span>Any active subscriptions (will be canceled)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-semibold text-blue-900 mb-2">💡 Alternative Options:</h5>
                <div className="space-y-2 text-sm text-blue-800">
                  <p>If you're having issues or need specific features, we'd love to help:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• <strong>Pause subscription</strong> - Keep your data, stop billing</li>
                    <li>• <strong>Downgrade plan</strong> - Reduce costs while keeping your account</li>
                    <li>• <strong>Contact support</strong> - We're here to help resolve any issues</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">
                  Help us improve
                </h4>
                <p className="text-gray-600 mb-6">
                  We're sorry to see you go. Your feedback helps us make OkAimy better for everyone.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What's your main reason for leaving? *
                </label>
                <select
                  value={feedback.reason}
                  onChange={(e) => setFeedback({ ...feedback, reason: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  required
                >
                  <option value="">Select a reason...</option>
                  {deleteReasons.map(reason => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Can you tell us more? (optional)
                </label>
                <textarea
                  value={feedback.details}
                  onChange={(e) => setFeedback({ ...feedback, details: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Your feedback helps us improve..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Would you recommend OkAimy to others?
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setFeedback({ ...feedback, wouldRecommend: true })}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                      feedback.wouldRecommend === true
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-green-300'
                    }`}
                  >
                    👍 Yes
                  </button>
                  <button
                    onClick={() => setFeedback({ ...feedback, wouldRecommend: false })}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                      feedback.wouldRecommend === false
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-300 hover:border-red-300'
                    }`}
                  >
                    👎 No
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">🛑</div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">
                  Final Confirmation
                </h4>
                <p className="text-gray-600">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800 mb-3">
                  To confirm deletion, please type: <strong className="font-mono">DELETE MY ACCOUNT</strong>
                </p>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Type here..."
                />
              </div>

              {feedback.reason && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 mb-2">Your feedback:</h5>
                  <p className="text-sm text-gray-700">
                    <strong>Reason:</strong> {feedback.reason}
                  </p>
                  {feedback.details && (
                    <p className="text-sm text-gray-700 mt-1">
                      <strong>Details:</strong> {feedback.details}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancel
          </button>

          <div className="flex gap-3">
            {step > 1 && step < 3 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Back
              </button>
            )}
            
            {step === 1 && (
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Continue to Delete
              </button>
            )}

            {step === 2 && (
              <button
                onClick={() => setStep(3)}
                disabled={!feedback.reason}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            )}

            {step === 3 && (
              <button
                onClick={handleDelete}
                disabled={confirmText !== 'DELETE MY ACCOUNT' || deleting}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold"
              >
                {deleting ? 'Deleting...' : 'Permanently Delete Account'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteProfileModal;
