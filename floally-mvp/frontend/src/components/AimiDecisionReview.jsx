/**
 * Aimi Decision Review Component
 * Shows what Aimi is doing with your emails - transparency builds trust!
 * 
 * Features:
 * - See all Aimi's decisions (✅ handled, 🟡 suggested, 🔵 needs input)
 * - Review and approve/correct decisions
 * - Learn what Aimi got right/wrong
 * - Build trust through visibility
 */

import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AimiDecisionReview = () => {
  const [decisions, setDecisions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDecision, setSelectedDecision] = useState(null);
  const [correctionForm, setCorrectionForm] = useState({
    importance_score: 50,
    reasoning: ''
  });

  useEffect(() => {
    loadPendingDecisions();
  }, []);

  const loadPendingDecisions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/decisions/pending');
      setDecisions(response.data);
    } catch (error) {
      console.error('Error loading decisions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (decisionId) => {
    try {
      await api.post('/api/decisions/review', {
        decision_id: decisionId,
        approved: true
      });
      
      // Refresh decisions list
      loadPendingDecisions();
    } catch (error) {
      console.error('Error approving decision:', error);
    }
  };

  const handleCorrect = async (decisionId) => {
    try {
      await api.post('/api/decisions/review', {
        decision_id: decisionId,
        approved: false,
        correction: { importance_score: correctionForm.importance_score },
        correction_reasoning: correctionForm.reasoning
      });
      
      // Reset form and refresh
      setCorrectionForm({ importance_score: 50, reasoning: '' });
      setSelectedDecision(null);
      loadPendingDecisions();
    } catch (error) {
      console.error('Error correcting decision:', error);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-blue-600';
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.9) return 'High confidence';
    if (confidence >= 0.6) return 'Medium confidence';
    return 'Needs your input';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-soft-ivory">
        <div className="text-center">
          <div className="animate-pulse text-aimi-green text-4xl mb-4">✨</div>
          <p className="text-deep-slate">Loading Aimi's decisions...</p>
        </div>
      </div>
    );
  }

  if (!decisions) {
    return (
      <div className="min-h-screen bg-soft-ivory p-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-deep-slate">No decisions to review right now.</p>
        </div>
      </div>
    );
  }

  const { needs_review, recently_handled, summary } = decisions;

  return (
    <div className="min-h-screen bg-soft-ivory p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-deep-slate mb-2">
            Aimi's Decisions
          </h1>
          <p className="text-lg text-deep-slate/70">
            Review what Aimi is doing with your emails. Your feedback helps Aimi learn.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-3xl font-semibold text-deep-slate">
              {summary.needs_attention || 0}
            </div>
            <div className="text-deep-slate/60 mt-1">Need Your Review</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-3xl font-semibold text-deep-slate">
              {summary.handled_automatically || 0}
            </div>
            <div className="text-deep-slate/60 mt-1">Handled Automatically</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-3xl font-semibold text-aimi-green">
              {summary.approval_rate !== null 
                ? `${Math.round(summary.approval_rate * 100)}%`
                : 'N/A'}
            </div>
            <div className="text-deep-slate/60 mt-1">Approval Rate</div>
          </div>
        </div>

        {/* Needs Review Section */}
        {needs_review && needs_review.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-deep-slate mb-4">
              🟡 Needs Your Review ({needs_review.length})
            </h2>
            
            <div className="space-y-4">
              {needs_review.map((decision) => (
                <div
                  key={decision.id}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Decision Type Badge */}
                      <div className="inline-block px-3 py-1 rounded-full bg-aimi-green/10 text-aimi-green text-sm font-medium mb-3">
                        {decision.type.replace('_', ' ')}
                      </div>
                      
                      {/* Decision Details */}
                      <div className="mb-3">
                        <div className="text-lg font-medium text-deep-slate mb-1">
                          Importance Score: {decision.decision.importance_score}/100
                        </div>
                        <div className="text-deep-slate/70">
                          {decision.reasoning}
                        </div>
                      </div>
                      
                      {/* Confidence Indicator */}
                      <div className={`text-sm ${getConfidenceColor(decision.confidence)}`}>
                        {decision.status_icon} {getConfidenceLabel(decision.confidence)} 
                        ({Math.round(decision.confidence * 100)}%)
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 ml-4">
                      {selectedDecision === decision.id ? (
                        <div className="flex flex-col gap-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={correctionForm.importance_score}
                            onChange={(e) => setCorrectionForm({
                              ...correctionForm,
                              importance_score: parseInt(e.target.value)
                            })}
                            className="w-32"
                          />
                          <input
                            type="text"
                            placeholder="Why correct this?"
                            value={correctionForm.reasoning}
                            onChange={(e) => setCorrectionForm({
                              ...correctionForm,
                              reasoning: e.target.value
                            })}
                            className="px-3 py-1 border rounded-lg text-sm"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCorrect(decision.id)}
                              className="px-3 py-1 bg-aimi-green text-white rounded-lg text-sm hover:bg-aimi-green/90"
                            >
                              Submit {correctionForm.importance_score}
                            </button>
                            <button
                              onClick={() => setSelectedDecision(null)}
                              className="px-3 py-1 bg-gray-200 text-deep-slate rounded-lg text-sm hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleApprove(decision.id)}
                            className="px-4 py-2 bg-aimi-green text-white rounded-xl hover:bg-aimi-green/90 transition-colors"
                          >
                            👍 Approve
                          </button>
                          <button
                            onClick={() => setSelectedDecision(decision.id)}
                            className="px-4 py-2 bg-gray-100 text-deep-slate rounded-xl hover:bg-gray-200 transition-colors"
                          >
                            ✏️ Correct
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recently Handled Section */}
        {recently_handled && recently_handled.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold text-deep-slate mb-4">
              ✅ Recently Handled ({recently_handled.length})
            </h2>
            
            <div className="space-y-4">
              {recently_handled.map((decision) => (
                <div
                  key={decision.id}
                  className="bg-white/50 rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-sm text-deep-slate/60 mb-1">
                        {decision.type.replace('_', ' ')} • {new Date(decision.created_at).toLocaleString()}
                      </div>
                      <div className="text-deep-slate">
                        Score: {decision.decision.importance_score}/100 - {decision.reasoning}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleApprove(decision.id)}
                      className="text-sm text-deep-slate/60 hover:text-deep-slate"
                    >
                      Looks good
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!needs_review || needs_review.length === 0) && 
         (!recently_handled || recently_handled.length === 0) && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-2xl font-semibold text-deep-slate mb-2">
              All Caught Up!
            </h3>
            <p className="text-deep-slate/70">
              No decisions to review right now. Aimi will let you know when there's something to check.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AimiDecisionReview;
