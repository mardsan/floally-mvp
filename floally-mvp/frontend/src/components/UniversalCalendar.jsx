import React, { useState, useEffect } from 'react';
import EventDetailsPopup from './EventDetailsPopup';

// Helper function to parse date string as local date (avoid timezone shifts)
const parseLocalDate = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const UniversalCalendar = ({ projects, calendarEvents, user, onOpenProject }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // 'week', 'month'
  const [selectedProject, setSelectedProject] = useState(null); // null = show all
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    aggregateEvents();
  }, [projects, calendarEvents, selectedProject]);

  const aggregateEvents = () => {
    const allEvents = [];

    // Add project milestones (goals with deadlines)
    if (projects && projects.length > 0) {
      projects.forEach(project => {
        // Filter by selected project if one is chosen
        if (selectedProject && project.id !== selectedProject) return;

        if (project.goals && project.goals.length > 0) {
          project.goals.forEach(goal => {
            if (goal.deadline) {
              allEvents.push({
                id: `goal-${project.id}-${goal.goal}`,
                title: goal.goal,
                date: parseLocalDate(goal.deadline),
                type: 'project_goal',
                project: project,
                status: goal.status,
                source: 'Projects'
              });
            }
          });
        }
      });
    }

    // Add calendar events
    if (calendarEvents && calendarEvents.length > 0) {
      calendarEvents.forEach(event => {
        allEvents.push({
          id: `calendar-${event.id || Math.random()}`,
          title: event.summary || 'Untitled Event',
          date: new Date(event.start),
          type: 'calendar_event',
          source: 'Google Calendar',
          location: event.location,
          description: event.description
        });
      });
    }

    // Sort by date
    allEvents.sort((a, b) => a.date - b.date);
    setEvents(allEvents);
  };

  const handleStatusUpdate = async (event, newStatus) => {
    if (!event.project) return;

    try {
      const user = JSON.parse(localStorage.getItem('okaimy_user'));
      if (!user || !user.email) {
        throw new Error('User session not found');
      }

      // Find the goal in the project and update its status
      const updatedGoals = event.project.goals.map(goal => 
        goal.goal === event.title 
          ? { ...goal, status: newStatus }
          : goal
      );

      // Update the project via API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/${event.project.id}?user_email=${user.email}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...event.project,
          goals: updatedGoals
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const data = await response.json();
      const updatedProject = data.project || data;

      // Update the local event's status immediately for UI feedback
      if (selectedEvent) {
        setSelectedEvent({
          ...selectedEvent,
          status: newStatus,
          project: updatedProject
        });
      }

      // Trigger a re-aggregation of events to update the calendar
      aggregateEvents();
      
      // Reload the page to sync with the main Projects page
      window.location.reload();
      
    } catch (error) {
      console.error('Error updating goal status:', error);
      throw error; // Re-throw to let the popup handle the error display
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add previous month's trailing days
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push({ date: prevDate, isCurrentMonth: false });
    }

    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Add next month's leading days to complete the grid
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  };

  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = event.date;
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const changeMonth = (delta) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  };

  const getEventColor = (event) => {
    if (event.type === 'project_goal') {
      const priorityColors = {
        low: 'bg-gray-100 border-gray-300 text-gray-700',
        medium: 'bg-blue-100 border-blue-300 text-blue-700',
        high: 'bg-orange-100 border-orange-300 text-orange-700',
        critical: 'bg-red-100 border-red-300 text-red-700'
      };
      return priorityColors[event.project?.priority] || 'bg-gray-100 border-gray-300 text-gray-700';
    } else if (event.type === 'calendar_event') {
      return 'bg-purple-100 border-purple-300 text-purple-700';
    }
    return 'bg-gray-100 border-gray-300 text-gray-700';
  };

  const getEventIcon = (event) => {
    if (event.type === 'project_goal') {
      const statusIcons = {
        not_started: '⭕',
        in_progress: '🔄',
        completed: '✅',
        blocked: '🚫'
      };
      return statusIcons[event.status] || '📋';
    } else if (event.type === 'calendar_event') {
      return '📅';
    }
    return '📌';
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const days = getDaysInMonth(currentDate);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="p-3 md:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-lg md:text-2xl font-bold text-gray-900">📆 Universal Calendar</h3>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-target"
              aria-label="Previous month"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-base md:text-lg font-semibold text-gray-800 min-w-[140px] md:min-w-[180px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </div>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-target"
              aria-label="Next month"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs md:text-sm text-gray-600">Filter:</span>
          <button
            onClick={() => setSelectedProject(null)}
            className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium transition-colors ${
              selectedProject === null
                ? 'bg-teal-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Events
          </button>
          {projects && projects.map(project => (
            <button
              key={project.id}
              onClick={() => setSelectedProject(project.id === selectedProject ? null : project.id)}
              className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium transition-colors truncate max-w-[120px] sm:max-w-none ${
                selectedProject === project.id
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={project.name}
            >
              {project.name}
            </button>
          ))}
        </div>

        {/* Legend - More compact on mobile */}
        <div className="mt-3 md:mt-4 flex flex-wrap items-center gap-2 md:gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-purple-100 border border-purple-300 rounded"></div>
            <span className="text-gray-600 hidden sm:inline">Calendar Events</span>
            <span className="text-gray-600 sm:hidden">Calendar</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
            <span className="text-gray-600 hidden sm:inline">Project Goals</span>
            <span className="text-gray-600 sm:hidden">Projects</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-600">✅ Done</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-600">🔄 Active</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-2 md:p-4">
        {/* Day Headers - Abbreviated on mobile */}
        <div className="grid grid-cols-7 gap-0.5 md:gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
            <div key={day} className="text-center text-xs md:text-sm font-semibold text-gray-600 py-1 md:py-2">
              {/* Show single letter on smallest screens, full on md+ */}
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.charAt(0)}</span>
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-0.5 md:gap-1">
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day.date);
            const isTodayDate = isToday(day.date);

            return (
              <div
                key={index}
                className={`min-h-[60px] sm:min-h-[80px] md:min-h-[100px] border rounded p-1 md:p-2 transition-all ${
                  day.isCurrentMonth
                    ? isTodayDate
                      ? 'bg-teal-50 border-teal-400 border-2'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                    : 'bg-gray-50 border-gray-100'
                }`}
              >
                <div className={`text-xs md:text-sm font-medium mb-1 md:mb-2 ${
                  day.isCurrentMonth
                    ? isTodayDate
                      ? 'text-teal-700 font-bold'
                      : 'text-gray-700'
                    : 'text-gray-400'
                }`}>
                  {day.date.getDate()}
                </div>

                {/* Events for this day */}
                <div className="space-y-0.5 md:space-y-1">
                  {dayEvents.slice(0, 2).map((event, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedEvent(event)}
                      className={`text-[10px] sm:text-xs p-0.5 md:p-1 rounded border ${getEventColor(event)} truncate cursor-pointer hover:shadow-md transition-shadow`}
                      title={`${event.title} - ${event.source}`}
                    >
                      <span className="mr-0.5 md:mr-1">{getEventIcon(event)}</span>
                      <span className="hidden sm:inline">{event.title}</span>
                      <span className="sm:hidden">{event.title.substring(0, 4)}</span>
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-[9px] sm:text-[10px] text-gray-500 text-center">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="p-3 md:p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs md:text-sm">
          <div className="text-gray-600">
            <span className="font-semibold">{events.length}</span> total events this month
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <div className="text-gray-600">
              <span className="font-semibold">
                {events.filter(e => e.type === 'project_goal').length}
              </span> <span className="hidden sm:inline">project</span> goals
            </div>
            <div className="text-gray-600">
              <span className="font-semibold">
                {events.filter(e => e.type === 'calendar_event').length}
              </span> <span className="hidden sm:inline">calendar</span> events
            </div>
          </div>
        </div>
      </div>

      {/* Event Details Popup */}
      {selectedEvent && (
        <EventDetailsPopup
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onOpenProject={onOpenProject}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

export default UniversalCalendar;
