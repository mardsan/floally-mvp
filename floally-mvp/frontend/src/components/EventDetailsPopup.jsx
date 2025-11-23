import React, { useState } from 'react';

const EventDetailsPopup = ({ event, onClose, onOpenProject, onStatusUpdate }) => {
  const [currentStatus, setCurrentStatus] = useState(event.status);
  const [updating, setUpdating] = useState(false);

  if (!event) return null;

  const getStatusColor = (status) => {
    const colors = {
      not_started: 'bg-gray-100 text-gray-700',
      in_progress: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      blocked: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    const icons = {
      not_started: '⭕',
      in_progress: '🔄',
      completed: '✅',
      blocked: '🚫'
    };
    return icons[status] || '📋';
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleStatusChange = async (newStatus) => {
    if (!isProjectGoal || !event.project) return;
    
    setUpdating(true);
    setCurrentStatus(newStatus);
    
    try {
      // Call the parent's onStatusUpdate callback
      if (onStatusUpdate) {
        await onStatusUpdate(event, newStatus);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      // Revert on error
      setCurrentStatus(event.status);
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const isProjectGoal = event.type === 'project_goal';

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-30 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] sm:max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-4 md:p-6 rounded-t-2xl sm:rounded-t-xl ${
          isProjectGoal 
            ? 'bg-gradient-to-r from-teal-500 to-blue-500' 
            : 'bg-gradient-to-r from-purple-500 to-pink-500'
        } text-white sticky top-0 z-10`}>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl md:text-2xl">
                  {isProjectGoal ? getStatusIcon(event.status) : '📅'}
                </span>
                <span className="text-xs md:text-sm opacity-90">{event.source}</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold leading-tight">{event.title}</h3>
            </div>
            <button
              onClick={onClose}
              className="ml-4 text-white hover:bg-white/20 rounded-lg p-2 transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">
          {/* Date */}
          <div className="mb-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-semibold text-xs md:text-sm">Date</span>
            </div>
            <p className="text-sm md:text-base text-gray-800 ml-6 md:ml-7">{formatDate(event.date)}</p>
          </div>

          {/* Status (for project goals) */}
          {isProjectGoal && currentStatus && (
            <div className="mb-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold text-xs md:text-sm">Status</span>
                {updating && <span className="text-xs text-blue-600 animate-pulse">Updating...</span>}
              </div>
              <div className="ml-6 md:ml-7">
                <select
                  value={currentStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updating}
                  className={`w-full sm:w-auto ${getStatusColor(currentStatus)} px-3 py-2 rounded-lg text-xs md:text-sm font-medium border-2 border-transparent hover:border-gray-300 focus:border-teal-500 focus:outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <option value="not_started">⭕ Not Started</option>
                  <option value="in_progress">🔄 In Progress</option>
                  <option value="completed">✅ Completed</option>
                  <option value="blocked">🚫 Blocked</option>
                </select>
              </div>
            </div>
          )}

          {/* Project Info (for project goals) */}
          {isProjectGoal && event.project && (
            <div className="mb-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                <span className="font-semibold text-xs md:text-sm">Project</span>
              </div>
              <div className="ml-6 md:ml-7 flex flex-wrap items-center gap-2">
                <p className="text-sm md:text-base text-gray-800 font-medium">{event.project.name}</p>
                {event.project.is_primary && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full whitespace-nowrap">
                    ⭐ Primary
                  </span>
                )}
              </div>
              {event.project.description && (
                <p className="text-xs md:text-sm text-gray-600 ml-6 md:ml-7 mt-1 line-clamp-2">
                  {event.project.description}
                </p>
              )}
            </div>
          )}

          {/* Location (for calendar events) */}
          {event.location && (
            <div className="mb-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-semibold text-xs md:text-sm">Location</span>
              </div>
              <p className="text-sm md:text-base text-gray-800 ml-6 md:ml-7">{event.location}</p>
            </div>
          )}

          {/* Description (for calendar events) */}
          {event.description && (
            <div className="mb-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                <span className="font-semibold text-xs md:text-sm">Description</span>
              </div>
              <p className="text-xs md:text-sm text-gray-700 ml-6 md:ml-7">{event.description}</p>
            </div>
          )}
        </div>

        {/* Actions - Sticky Footer */}
        <div className="p-4 md:p-6 bg-gray-50 rounded-b-2xl sm:rounded-b-xl border-t border-gray-200 sticky bottom-0">
          <div className="flex flex-col-reverse sm:flex-row gap-2 md:gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm md:text-base text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Close
            </button>
            {isProjectGoal && event.project && (
              <button
                onClick={() => {
                  // Navigate to Projects page with project ID to auto-open it
                  window.location.href = `/projects?open=${event.project.id}`;
                }}
                className="px-4 py-2 text-sm md:text-base bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600 transition-all shadow-md flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open Project
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPopup;
