import React, { useState } from 'react';
import { EventType } from '@/types/event';
import EventForm from './EventForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

interface CalendarProps {
  events: EventType[];
  onAddEvent: (event: Omit<EventType, 'id'>) => Promise<boolean>;
}

/**
 * Calendar component for displaying and managing events
 * Includes functionality to add new events via a modal form
 */
const Calendar: React.FC<CalendarProps> = ({ events, onAddEvent }) => {
  const [showEventForm, setShowEventForm] = useState(false);

  // Handle opening the event form
  const handleAddEventClick = () => {
    setShowEventForm(true);
  };

  // Handle closing the event form
  const handleCloseEventForm = () => {
    setShowEventForm(false);
  };

  // Handle event submission
  const handleEventSubmit = async (event: Omit<EventType, 'id'>) => {
    const success = await onAddEvent(event);
    if (success) {
      setShowEventForm(false);
    }
    return success;
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button 
          className="btn-add-event"
          onClick={handleAddEventClick}
          aria-label="Add new event"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Add Event</span>
        </button>
      </div>

      {/* Event submission form modal */}
      {showEventForm && (
        <EventForm
          onClose={handleCloseEventForm}
          onSubmit={handleEventSubmit}
        />
      )}

      {/* Calendar grid will be added here */}
      <div className="calendar-grid">
        {/* Calendar implementation will go here */}
      </div>
    </div>
  );
};

export default Calendar;
