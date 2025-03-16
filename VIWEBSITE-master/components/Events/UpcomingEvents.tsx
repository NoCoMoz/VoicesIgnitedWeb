import React from 'react';
import { EventType } from '@/types/event';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faClock, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import '@/styles/components/upcoming-events.scss';

interface UpcomingEventsProps {
  events: EventType[];
  maxEvents?: number;
}

/**
 * UpcomingEvents component displays a list of upcoming events
 * Events are sorted by date and filtered to show only future events
 */
const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ events, maxEvents = 5 }) => {
  // Sort events by date and filter out past events
  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, maxEvents);

  // Format date to display in a readable format
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time to 12-hour format
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (upcomingEvents.length === 0) {
    return (
      <div className="upcoming-events">
        <h2 className="section-title">Upcoming Events</h2>
        <p className="no-events">No upcoming events scheduled</p>
      </div>
    );
  }

  return (
    <div className="upcoming-events">
      <h2 className="section-title">Upcoming Events</h2>
      <div className="events-list">
        {upcomingEvents.map((event) => (
          <div key={event.id} className="event-card">
            <div className="event-header">
              <h3 className="event-title">{event.title}</h3>
              {event.type && (
                <span className={`event-type ${event.type}`}>
                  {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                </span>
              )}
            </div>

            <p className="event-description">{event.description}</p>

            <div className="event-details">
              <div className="detail-item">
                <FontAwesomeIcon icon={faCalendarAlt} />
                <span>{formatDate(event.date)}</span>
              </div>

              <div className="detail-item">
                <FontAwesomeIcon icon={faClock} />
                <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
              </div>

              <div className="detail-item">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                <span>
                  {event.locationType === 'online' ? 'Online Event' : event.location}
                </span>
              </div>
            </div>

            {event.organizer && (
              <div className="event-organizer">
                <strong>Organized by:</strong> {event.organizer}
              </div>
            )}

            {event.imageUrl && (
              <img 
                src={event.imageUrl} 
                alt={`${event.title} event`}
                className="event-image"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingEvents;
