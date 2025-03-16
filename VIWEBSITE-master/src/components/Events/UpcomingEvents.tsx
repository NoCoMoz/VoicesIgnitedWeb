import React, { useRef } from 'react';
import { EventType } from '@/types/event';
import EventCard from './EventCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

interface UpcomingEventsProps {
  events: EventType[];
  maxEvents?: number;
}

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ events, maxEvents = 6 }) => {
  // Create a ref for the events container to enable scrolling
  const eventsContainerRef = useRef<HTMLDivElement>(null);

  // Sort events by date (ascending)
  const sortedEvents = [...events].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Filter to only include future events
  const now = new Date();
  const upcomingEvents = sortedEvents.filter(event => event.date >= now);
  
  // Limit to specified number of events
  const displayEvents = upcomingEvents.slice(0, maxEvents);

  // Function to scroll the events container left or right
  const scrollEvents = (direction: 'left' | 'right') => {
    if (!eventsContainerRef.current) return;
    
    const container = eventsContainerRef.current;
    const scrollAmount = 320; // Slightly more than card width to account for gap
    
    if (direction === 'left') {
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="upcoming-events-section">
      <div className="section-header">
        <h2>Upcoming Events</h2>
        
        {displayEvents.length > 1 && (
          <div className="scroll-controls">
            <button 
              className="scroll-button" 
              onClick={() => scrollEvents('left')}
              aria-label="Scroll left"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <button 
              className="scroll-button" 
              onClick={() => scrollEvents('right')}
              aria-label="Scroll right"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        )}
      </div>
      
      {displayEvents.length === 0 ? (
        <div className="no-events-message">
          <p>No upcoming events at this time. Check back soon or submit your own event!</p>
        </div>
      ) : (
        <div className="upcoming-events-grid" ref={eventsContainerRef}>
          {displayEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
      
      {upcomingEvents.length > maxEvents && (
        <div className="view-more-container">
          <button className="btn-view-more">View More Events</button>
        </div>
      )}
    </div>
  );
};

export default UpcomingEvents;
