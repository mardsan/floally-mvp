/**
 * Aimi Memory Control
 * View, edit, and manage what Aimi has learned.
 * 
 * Shows:
 * - Sender importance patterns
 * - Correction patterns (what you taught Aimi)
 * - Behavior patterns (consistent actions)
 * - Learning timeline
 * 
 * Allows:
 * - Adjust importance weights
 * - Delete incorrect memories
 * - See most influential memories
 */

import React, { useState, useEffect } from 'react';
import { HiArrowLeft } from 'react-icons/hi';
import api from '../services/api';

const AimiMemoryControl = ({ user, onBack }) => {
  const [memories, setMemories] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('senders');
  const [editingMemory, setEditingMemory] = useState(null);
  const [editValue, setEditValue] = useState(0.5);

  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/memory/');
      setMemories(response.data);
    } catch (error) {
      console.error('Error loading memories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMemory = async (memoryId, importanceScore) => {
    try {
      await api.put(`/api/memory/${memoryId}`, {
        importance_score: importanceScore
      });
      
      // Refresh memories
      loadMemories();
      setEditingMemory(null);
    } catch (error) {
      console.error('Error updating memory:', error);
      alert('Failed to update memory');
    }
  };

  const handleDeleteMemory = async (memoryId) => {
    if (!confirm('Are you sure? Aimi will rebuild this memory from your future actions.')) {
      return;
    }
    
    try {
      await api.delete(`/api/memory/${memoryId}`);
      
      // Refresh memories
      loadMemories();
    } catch (error) {
      console.error('Error deleting memory:', error);
      alert('Failed to delete memory');
    }
  };

  const getImportanceColor = (score) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50';
    if (score >= 0.5) return 'text-yellow-600 bg-yellow-50';
    if (score >= 0.2) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getImportanceLabel = (score) => {
    if (score >= 0.8) return 'High Priority';
    if (score >= 0.5) return 'Medium Priority';
    if (score >= 0.2) return 'Low Priority';
    return 'Very Low';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-soft-ivory">
        <div className="text-center">
          <div className="animate-pulse text-aimi-green text-4xl mb-4">🧠</div>
          <p className="text-deep-slate">Loading Aimi's memories...</p>
        </div>
      </div>
    );
  }

  if (!memories) {
    return (
      <div className="min-h-screen bg-soft-ivory p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-deep-slate hover:text-aimi-green transition-colors mb-6"
          >
            <HiArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          <div className="text-center bg-white rounded-2xl p-12 shadow-sm">
            <div className="text-6xl mb-4">🧠</div>
            <p className="text-2xl font-semibold text-deep-slate mb-2">No memories yet</p>
            <p className="text-deep-slate/70">Aimi learns from your actions. As you use Hey Aimi, patterns will appear here.</p>
          </div>
        </div>
      </div>
    );
  }

  const { sender_memories, correction_memories, behavior_memories, summary } = memories;

  return (
    <div className="min-h-screen bg-soft-ivory p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-deep-slate hover:text-aimi-green transition-colors mb-6"
        >
          <HiArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-deep-slate mb-2">
            Learned Patterns
          </h1>
          <p className="text-lg text-deep-slate/70">
            See what Aimi has learned from your behavior. Edit, adjust, or delete patterns to shape future decisions.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-3xl font-semibold text-deep-slate">
              {summary.total_memories}
            </div>
            <div className="text-deep-slate/60 mt-1">Total Memories</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-3xl font-semibold text-deep-slate">
              {summary.most_influential?.length || 0}
            </div>
            <div className="text-deep-slate/60 mt-1">High Impact</div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-3xl font-semibold text-deep-slate">
              {summary.recently_learned?.length || 0}
            </div>
            <div className="text-deep-slate/60 mt-1">Recent Learning</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-deep-slate/10">
          <button
            onClick={() => setSelectedTab('senders')}
            className={`px-4 py-2 font-medium transition-colors ${
              selectedTab === 'senders'
                ? 'text-aimi-green border-b-2 border-aimi-green'
                : 'text-deep-slate/60 hover:text-deep-slate'
            }`}
          >
            Sender Patterns ({sender_memories?.length || 0})
          </button>
          <button
            onClick={() => setSelectedTab('corrections')}
            className={`px-4 py-2 font-medium transition-colors ${
              selectedTab === 'corrections'
                ? 'text-aimi-green border-b-2 border-aimi-green'
                : 'text-deep-slate/60 hover:text-deep-slate'
            }`}
          >
            Your Corrections ({correction_memories?.length || 0})
          </button>
          <button
            onClick={() => setSelectedTab('behaviors')}
            className={`px-4 py-2 font-medium transition-colors ${
              selectedTab === 'behaviors'
                ? 'text-aimi-green border-b-2 border-aimi-green'
                : 'text-deep-slate/60 hover:text-deep-slate'
            }`}
          >
            Behavior Patterns ({behavior_memories?.length || 0})
          </button>
          <button
            onClick={() => setSelectedTab('influential')}
            className={`px-4 py-2 font-medium transition-colors ${
              selectedTab === 'influential'
                ? 'text-aimi-green border-b-2 border-aimi-green'
                : 'text-deep-slate/60 hover:text-deep-slate'
            }`}
          >
            Most Influential
          </button>
        </div>

        {/* Sender Patterns Tab */}
        {selectedTab === 'senders' && (
          <div className="space-y-4">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-deep-slate mb-2">
                Learned Sender Importance
              </h2>
              <p className="text-deep-slate/70">
                Aimi learned who's important based on your behavior (opens, stars, replies).
                Adjust scores to fine-tune future prioritization.
              </p>
            </div>
            
            {sender_memories && sender_memories.map((memory) => (
              <div
                key={memory.memory_id}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Sender Email */}
                    <div className="text-lg font-medium text-deep-slate mb-2">
                      {memory.sender_email}
                    </div>
                    
                    {/* Importance Badge */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getImportanceColor(memory.importance_score)}`}>
                        {getImportanceLabel(memory.importance_score)} ({Math.round(memory.importance_score * 100)}%)
                      </span>
                      <span className="text-sm text-deep-slate/60">
                        {memory.interaction_count} interactions • {Math.round(memory.confidence * 100)}% confident
                      </span>
                    </div>
                    
                    {/* Reasoning */}
                    <div className="text-deep-slate/70 mb-3">
                      {memory.reasoning}
                    </div>
                    
                    {/* Edit Mode */}
                    {editingMemory === memory.memory_id ? (
                      <div className="flex items-center gap-4 mt-4">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={editValue * 100}
                          onChange={(e) => setEditValue(e.target.value / 100)}
                          className="flex-1"
                        />
                        <span className="text-sm font-medium text-deep-slate w-16">
                          {Math.round(editValue * 100)}%
                        </span>
                        <button
                          onClick={() => handleUpdateMemory(memory.memory_id, editValue)}
                          className="px-4 py-2 bg-aimi-green text-white rounded-xl hover:bg-aimi-green/90 transition-colors text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingMemory(null)}
                          className="px-4 py-2 bg-gray-100 text-deep-slate rounded-xl hover:bg-gray-200 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : null}
                  </div>
                  
                  {/* Action Buttons */}
                  {!editingMemory && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => {
                          setEditingMemory(memory.memory_id);
                          setEditValue(memory.importance_score);
                        }}
                        className="px-4 py-2 bg-gray-100 text-deep-slate rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMemory(memory.memory_id)}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {(!sender_memories || sender_memories.length === 0) && (
              <div className="text-center py-12">
                <p className="text-deep-slate/60">No sender patterns learned yet.</p>
                <p className="text-deep-slate/60 text-sm mt-2">
                  As you interact with emails, Aimi will learn who's important to you.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Most Influential Tab */}
        {selectedTab === 'influential' && summary.most_influential && (
          <div className="space-y-4">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold text-deep-slate mb-2">
                Most Influential Memories
              </h2>
              <p className="text-deep-slate/70">
                These memories have the biggest impact on Aimi's decisions. Editing these affects many future emails.
              </p>
            </div>
            
            {summary.most_influential.map((memory, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 shadow-sm border-2 border-aimi-green/20"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-lg font-medium text-deep-slate mb-2">
                      {memory.sender_email}
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getImportanceColor(memory.importance_score)}`}>
                        {Math.round(memory.importance_score * 100)}% importance
                      </span>
                      <span className="text-sm text-deep-slate/60">
                        Impact Score: {memory.impact_score.toFixed(1)}
                      </span>
                    </div>
                    <div className="text-deep-slate/70">
                      {memory.reasoning}
                    </div>
                  </div>
                  <div className="text-3xl">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '⭐'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {summary.total_memories === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🧠</div>
            <h3 className="text-2xl font-semibold text-deep-slate mb-2">
              Aimi is Learning
            </h3>
            <p className="text-deep-slate/70">
              As you use Hey Aimi, memories will appear here. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AimiMemoryControl;
