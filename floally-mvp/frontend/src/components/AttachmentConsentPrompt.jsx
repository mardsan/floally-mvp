import React, { useState } from 'react';

// Simple icon components using emoji (avoid lucide-react dependency issues)
const AlertCircle = () => <span className="text-xl">⚠️</span>;
const FileText = () => <span className="text-xl">📄</span>;
const Shield = () => <span className="text-xl">🛡️</span>;
const Check = () => <span className="text-xl">✓</span>;
const Ban = () => <span className="text-xl">🚫</span>;

/**
 * AttachmentConsentPrompt
 * 
 * 3-Tier Trust System for Attachment Processing:
 * 1. TRUSTED - Always allow Aimi to read attachments from this sender
 * 2. ONE_TIME - Process attachments just this time (no preference saved)
 * 3. BLOCKED - Never allow - potential security threat
 */
const AttachmentConsentPrompt = ({ 
  senderEmail, 
  senderName,
  attachments = [],
  onApprove,
  onDecline,
  onBlock,
  userEmail
}) => {
  const [loading, setLoading] = useState(false);

  const handleTrust = async () => {
    setLoading(true);
    try {
      // Add sender to trusted list with TRUSTED level
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://floally-mvp-production.up.railway.app'}/api/trusted-senders/${userEmail}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender_email: senderEmail,
            sender_name: senderName || senderEmail,
            trust_level: 'trusted'
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to save trusted sender');
      }

      // Proceed with processing
      onApprove(true); // permanent = true
    } catch (error) {
      console.error('Error trusting sender:', error);
      alert('⚠️ Failed to save trust preference.\n\nYou can still process attachments one-time by clicking "Yes, Just This Time".');
    } finally {
      setLoading(false);
    }
  };

  const handleOneTime = () => {
    // Process without saving preference
    onApprove(false); // permanent = false
  };

  const handleBlock = async () => {
    setLoading(true);
    try {
      // Add sender to blocked list
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://floally-mvp-production.up.railway.app'}/api/trusted-senders/${userEmail}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender_email: senderEmail,
            sender_name: senderName || senderEmail,
            trust_level: 'blocked'
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to block sender');
      }

      // Don't process attachments
      if (onBlock) {
        onBlock();
      } else {
        onDecline();
      }
    } catch (error) {
      console.error('Error blocking sender:', error);
      alert('⚠️ Failed to save block preference.\n\nSkipping attachments for now.');
      onDecline();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="attachment-consent-prompt">
      <div className="consent-header">
        <div className="consent-icon">
          <Shield size={24} className="shield-icon" />
        </div>
        <h3>Review Attachments?</h3>
      </div>

      <div className="consent-body">
        <p className="sender-info">
          <strong>{senderName || senderEmail}</strong> sent {attachments.length} attachment{attachments.length > 1 ? 's' : ''}:
        </p>

        <ul className="attachment-list">
          {attachments.map((filename, idx) => (
            <li key={idx}>
              <FileText size={16} />
              <span>{filename}</span>
            </li>
          ))}
        </ul>

        <div className="consent-message">
          <AlertCircle size={16} className="info-icon" />
          <p>
            Would you like Aimi to read {attachments.length > 1 ? 'these attachments' : 'this attachment'}?
          </p>
          <p className="security-note">
            Choose how to handle attachments from this sender:
          </p>
        </div>
      </div>

      <div className="consent-actions-3tier">
        <button
          className="btn btn-trust"
          onClick={handleTrust}
          disabled={loading}
        >
          <Check size={18} />
          <div className="btn-content">
            <span className="btn-title">✅ Trust Always</span>
            <span className="btn-subtitle">Auto-allow future attachments</span>
          </div>
        </button>

        <button
          className="btn btn-onetime"
          onClick={handleOneTime}
          disabled={loading}
        >
          <FileText size={18} />
          <div className="btn-content">
            <span className="btn-title">📥 Just This Time</span>
            <span className="btn-subtitle">Don't save preference</span>
          </div>
        </button>
        
        <button
          className="btn btn-block"
          onClick={handleBlock}
          disabled={loading}
        >
          <Ban size={18} />
          <div className="btn-content">
            <span className="btn-title">🚫 Block Sender</span>
            <span className="btn-subtitle">Never allow attachments</span>
          </div>
        </button>
      </div>

      <style jsx>{`
        .attachment-consent-prompt {
          background: #f8f9fa;
          border: 2px solid #0066cc;
          border-radius: 12px;
          padding: 20px;
          margin: 15px 0;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .consent-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 15px;
        }

        .consent-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: #e3f2fd;
          border-radius: 50%;
        }

        .shield-icon {
          color: #0066cc;
        }

        .consent-header h3 {
          margin: 0;
          font-size: 18px;
          color: #1a1a1a;
        }

        .consent-body {
          margin-bottom: 20px;
        }

        .sender-info {
          margin: 0 0 12px 0;
          color: #333;
        }

        .attachment-list {
          list-style: none;
          padding: 0;
          margin: 12px 0;
          background: white;
          border-radius: 8px;
          padding: 12px;
        }

        .attachment-list li {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 0;
          color: #555;
          font-size: 14px;
        }

        .attachment-list li:not(:last-child) {
          border-bottom: 1px solid #f0f0f0;
        }

        .consent-message {
          margin: 15px 0;
        }

        .consent-message p {
          margin: 0 0 8px 0;
          font-size: 14px;
          color: #555;
        }

        .security-note {
          font-size: 13px;
          color: #666;
          font-weight: 500;
        }

        .consent-actions-3tier {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .btn {
          padding: 14px 18px;
          border: 2px solid;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 12px;
          text-align: left;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }

        .btn-title {
          font-size: 15px;
          font-weight: 600;
        }

        .btn-subtitle {
          font-size: 12px;
          opacity: 0.8;
        }

        .btn-trust {
          background: #d1fae5;
          color: #065f46;
          border-color: #10b981;
        }

        .btn-trust:hover:not(:disabled) {
          background: #a7f3d0;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }

        .btn-onetime {
          background: #dbeafe;
          color: #1e40af;
          border-color: #3b82f6;
        }

        .btn-onetime:hover:not(:disabled) {
          background: #bfdbfe;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
        }

        .btn-block {
          background: #fee2e2;
          color: #991b1b;
          border-color: #ef4444;
        }

        .btn-block:hover:not(:disabled) {
          background: #fecaca;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
        }

        @media (max-width: 600px) {
          .consent-actions {
            flex-direction: column;
          }

          .btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default AttachmentConsentPrompt;
