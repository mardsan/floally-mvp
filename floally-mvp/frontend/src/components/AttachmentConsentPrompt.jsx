import React, { useState } from 'react';
import { AlertCircle, FileText, Shield, Check } from 'lucide-react';

/**
 * AttachmentConsentPrompt
 * 
 * Shows when an email has attachments from an untrusted sender.
 * Allows user to:
 * 1. Allow attachment processing for this sender (one-time or permanent)
 * 2. Set auto-approval for future attachments from this sender
 * 3. Decline and proceed without processing attachments
 */
const AttachmentConsentPrompt = ({ 
  senderEmail, 
  senderName,
  attachments = [],
  onApprove,
  onDecline,
  userEmail
}) => {
  const [autoApprove, setAutoApprove] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleApprove = async (permanent = false) => {
    setLoading(true);
    try {
      if (permanent) {
        // Add sender to trusted list
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/trusted-senders/${userEmail}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sender_email: senderEmail,
              sender_name: senderName || senderEmail,
              auto_approved: autoApprove
            })
          }
        );

        if (!response.ok) {
          throw new Error('Failed to save trusted sender');
        }
      }

      onApprove(permanent);
    } catch (error) {
      console.error('Error approving attachments:', error);
      alert('Failed to save preference. Please try again.');
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
            Would you like Aimy to read {attachments.length > 1 ? 'these attachments' : 'this attachment'} to provide better context for the draft response?
          </p>
        </div>

        <div className="consent-options">
          <label className="checkbox-option">
            <input
              type="checkbox"
              checked={autoApprove}
              onChange={(e) => setAutoApprove(e.target.checked)}
            />
            <span>Always allow for {senderName || senderEmail} (auto-approve future attachments)</span>
          </label>
        </div>
      </div>

      <div className="consent-actions">
        <button
          className="btn btn-decline"
          onClick={() => onDecline()}
          disabled={loading}
        >
          No, Skip Attachments
        </button>
        
        <button
          className="btn btn-approve-once"
          onClick={() => handleApprove(false)}
          disabled={loading}
        >
          Yes, Just This Time
        </button>

        <button
          className="btn btn-approve-always"
          onClick={() => handleApprove(true)}
          disabled={loading}
        >
          <Check size={16} />
          Yes, Remember Choice
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
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin: 15px 0;
          padding: 12px;
          background: #fff3cd;
          border-left: 3px solid #ffc107;
          border-radius: 4px;
        }

        .info-icon {
          color: #f59e0b;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .consent-message p {
          margin: 0;
          font-size: 14px;
          color: #856404;
        }

        .consent-options {
          margin: 15px 0;
        }

        .checkbox-option {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          transition: background 0.2s;
        }

        .checkbox-option:hover {
          background: rgba(0, 102, 204, 0.05);
        }

        .checkbox-option input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .checkbox-option span {
          font-size: 14px;
          color: #444;
        }

        .consent-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .btn {
          padding: 10px 16px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-decline {
          background: #e0e0e0;
          color: #555;
        }

        .btn-decline:hover:not(:disabled) {
          background: #d0d0d0;
        }

        .btn-approve-once {
          background: white;
          color: #0066cc;
          border: 1px solid #0066cc;
        }

        .btn-approve-once:hover:not(:disabled) {
          background: #f0f7ff;
        }

        .btn-approve-always {
          background: #0066cc;
          color: white;
          flex: 1;
        }

        .btn-approve-always:hover:not(:disabled) {
          background: #0052a3;
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
