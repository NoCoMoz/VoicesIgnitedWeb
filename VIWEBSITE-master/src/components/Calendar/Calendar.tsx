import React, { useState, useEffect } from 'react';
import '@/styles/components/calendar.styles.scss';
import { EventType } from '@/types/event';
import EventModal from './EventModal';
import EventForm from './EventForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faPlus } from '@fortawesome/free-solid-svg-icons';

interface CalendarProps {
  events: EventType[];
  onAddEvent?: (event: Omit<EventType, 'id'>) => void;
}

/**
 * Calendar component for displaying and interacting with events
 * Includes month navigation, event filtering, and event details viewing
 */
const Calendar: React.FC<CalendarProps> = ({ events, onAddEvent }) => {
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [filteredEvents, setFilteredEvents] = useState<EventType[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [isClient, setIsClient] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [showEventForm, setShowEventForm] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fix for hydration issues - only render dynamic content after client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Effect to filter events when filters change
  useEffect(() => {
    try {
      // Validate events array
      if (!Array.isArray(events)) {
        setError('Events data is not in the expected format');
        setFilteredEvents([]);
        return;
      }

      const filtered = events.filter(event => {
        const matchesType = typeFilter === 'all' || event.type === typeFilter;
        const matchesLocation = locationFilter === 'all' || event.locationType === locationFilter;
        return matchesType && matchesLocation;
      });
      
      setFilteredEvents(filtered);
      setError(null);
    } catch (err) {
      console.error('Error filtering events:', err);
      setError('An error occurred while filtering events');
      setFilteredEvents([]);
    }
  }, [events, typeFilter, locationFilter]);

  // Function to navigate to previous month
  const goToPrevMonth = () => {
    setCurrentMonth(prevMonth => {
      if (prevMonth === 0) {
        setCurrentYear(prevYear => prevYear - 1);
        return 11;
      }
      return prevMonth - 1;
    });
  };

  // Function to navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => {
      if (prevMonth === 11) {
        setCurrentYear(prevYear => prevYear + 1);
        return 0;
      }
      return prevMonth + 1;
    });
  };

  // Function to format time from 24h to 12h format
  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const period = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
      return `${formattedHour}:${minutes} ${period}`;
    } catch (err) {
      console.error('Error formatting time:', err);
      return 'Invalid time format';
    }
  };

  // Function to open event details
  const openEventDetails = (eventId: number) => {
    try {
      const event = events.find(e => e.id === eventId);
      if (!event) {
        console.error(`Event with ID ${eventId} not found`);
        return;
      }
      setSelectedEvent(event);
    } catch (err) {
      console.error('Error opening event details:', err);
    }
  };

  // Function to close the event modal
  const closeEventModal = () => {
    setSelectedEvent(null);
  };
  
  // Function to open the event submission form
  const openEventForm = () => {
    setShowEventForm(true);
  };
  
  // Function to close the event submission form
  const closeEventForm = () => {
    setShowEventForm(false);
  };
  
  // Function to handle event submission
  const handleEventSubmit = (newEvent: Omit<EventType, 'id'>) => {
    if (onAddEvent) {
      onAddEvent(newEvent);
    } else {
      console.log('New event submitted:', newEvent);
      // In a real application, this would be sent to an API
    }
  };

  // Function to render the calendar
  const renderCalendar = () => {
    if (!isClient) return null;
    
    try {
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      // Get the first day of the month
      const firstDay = new Date(currentYear, currentMonth, 1);
      
      // Get the number of days in the month
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      
      // Get the day of the week the first day falls on (0 = Sunday, 6 = Saturday)
      const firstDayIndex = firstDay.getDay();
      
      // Calculate days from previous month to display
      const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
      
      // Get current date for highlighting today
      const today = new Date();
      const todayDate = today.getDate();
      const todayMonth = today.getMonth();
      const todayYear = today.getFullYear();
      
      // Calendar grid cells
      const calendarCells = [];
      
      // Add day headers
      for (let i = 0; i < 7; i++) {
        calendarCells.push(
          <div key={`header-${i}`} className="calendar-day-header">
            {dayNames[i]}
          </div>
        );
      }
      
      // Create calendar grid with days
      let dayCount = 1;
      let nextMonthDay = 1;
      
      // Create 6 rows (max possible in a month)
      for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 7; col++) {
          if (row === 0 && col < firstDayIndex) {
            // Previous month
            const prevDate = prevMonthDays - (firstDayIndex - col - 1);
            calendarCells.push(
              <div key={`prev-${prevDate}`} className="calendar-day inactive">
                <div className="day-number">{prevDate}</div>
              </div>
            );
          } else if (dayCount > daysInMonth) {
            // Next month
            calendarCells.push(
              <div key={`next-${nextMonthDay}`} className="calendar-day inactive">
                <div className="day-number">{nextMonthDay}</div>
              </div>
            );
            nextMonthDay++;
          } else {
            // Current month
            const isToday = dayCount === todayDate && 
                          currentMonth === todayMonth && 
                          currentYear === todayYear;
            
            // Find events for this day
            const dayEvents = filteredEvents.filter(event => {
              return event.date.getDate() === dayCount && 
                    event.date.getMonth() === currentMonth && 
                    event.date.getFullYear() === currentYear;
            });
            
            calendarCells.push(
              <div 
                key={`day-${dayCount}`} 
                className={`calendar-day ${isToday ? 'today' : ''}`}
              >
                <div className="day-number">{dayCount}</div>
                <div className="day-events">
                  {dayEvents.map(event => (
                    <div 
                      key={`event-${event.id}`}
                      className={`day-event ${event.type}`}
                      onClick={() => openEventDetails(event.id)}
                    >
                      {event.title}
                    </div>
                  ))}
                </div>
              </div>
            );
            dayCount++;
          }
        }
      }
      
      return calendarCells;
    } catch (err) {
      console.error('Error rendering calendar:', err);
      return (
        <div className="calendar-error">
          An error occurred while rendering the calendar. Please try again later.
        </div>
      );
    }
  };

  return (
    <div className="calendar-section">
      <div className="calendar-header">
        <h2>Upcoming Events</h2>
        <div className="calendar-controls">
          <div className="calendar-nav">
            <button 
              onClick={goToPrevMonth} 
              className="btn-calendar"
              aria-label="Previous month"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <h3 id="currentMonth">
              {isClient ? 
                `${['January', 'February', 'March', 'April', 'May', 'June', 'July', 
                'August', 'September', 'October', 'November', 'December'][currentMonth]} ${currentYear}` : 
                ''}
            </h3>
            <button 
              onClick={goToNextMonth} 
              className="btn-calendar"
              aria-label="Next month"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
          <div className="calendar-filter">
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Filter events by type"
            >
              <option value="all">All Events</option>
              <option value="meeting">Meetings</option>
              <option value="workshop">Workshops</option>
              <option value="action">Direct Actions</option>
              <option value="fundraiser">Fundraisers</option>
              <option value="social">Social Events</option>
            </select>
            <select 
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              aria-label="Filter events by location"
            >
              <option value="all">All Locations</option>
              <option value="online">Online</option>
              <option value="in-person">In-Person</option>
            </select>
            <button 
              className="btn-add-event" 
              onClick={openEventForm}
              aria-label="Submit an event"
            >
              <FontAwesomeIcon icon={faPlus} /> Submit Event
            </button>
          </div>
        </div>
      </div>
      
      {error ? (
        <div className="calendar-error-container">
          <p className="calendar-error-message">{error}</p>
        </div>
      ) : (
        <div className="calendar-container">
          <div className="calendar-grid" id="calendarGrid">
            {renderCalendar()}
          </div>
        </div>
      )}
      
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-color meeting"></span>
          <span>Meetings</span>
        </div>
        <div className="legend-item">
          <span className="legend-color workshop"></span>
          <span>Workshops</span>
        </div>
        <div className="legend-item">
          <span className="legend-color action"></span>
          <span>Direct Actions</span>
        </div>
        <div className="legend-item">
          <span className="legend-color fundraiser"></span>
          <span>Fundraisers</span>
        </div>
        <div className="legend-item">
          <span className="legend-color social"></span>
          <span>Social Events</span>
        </div>
      </div>

      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={closeEventModal} />
      )}
      
      {showEventForm && (
        <EventForm onClose={closeEventForm} onSubmit={handleEventSubmit} />
      )}
    </div>
  );
};

export default Calendar;
