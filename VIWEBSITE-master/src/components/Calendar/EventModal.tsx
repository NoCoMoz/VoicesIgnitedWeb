import React from 'react';
import { EventType } from '@/types/event';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faClock, 
  faMapMarkerAlt, 
  faUser, 
  faEnvelope,
  faTimes
} from '@fortawesome/free-solid-svg-icons';

interface EventModalProps {
  event: EventType | null;
  onClose: () => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, onClose }) => {
  if (!event) return null;

  // Format dates and times
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${formattedHour}:${minutes} ${period}`;
  };
  
  const formattedDate = event.date.toLocaleDateString('en-US', options);
  const formattedStartTime = formatTime(event.startTime);
  const formattedEndTime = formatTime(event.endTime);
  
  // Event type label mapping
  const eventTypeLabels = {
    'meeting': 'Meeting',
    'workshop': 'Workshop',
    'action': 'Direct Action',
    'fundraiser': 'Fundraiser',
    'social': 'Social Event'
  };

  // Close modal when clicking outside the content
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="event-modal" onClick={handleBackdropClick}>
      <div className="event-modal-content">
        <button className="close-modal" onClick={onClose} aria-label="Close event details">
          <FontAwesomeIcon icon={faTimes} />
        </button>
        
        <div className={`event-type-badge ${event.type}`}>
          {eventTypeLabels[event.type as keyof typeof eventTypeLabels]}
        </div>
        
        <h3>{event.title}</h3>
        
        <div className="event-details">
          <p className="event-description">{event.description}</p>
          
          <div className="event-meta">
            <div className="meta-item">
              <FontAwesomeIcon icon={faCalendarAlt} />
              <span>{formattedDate}</span>
            </div>
            <div className="meta-item">
              <FontAwesomeIcon icon={faClock} />
              <span>{formattedStartTime} - {formattedEndTime}</span>
            </div>
            <div className="meta-item">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              <span>
                <strong>{event.locationType === 'online' ? 'Online' : 'In-Person'}: </strong>
                {event.location}
              </span>
            </div>
            {event.organizer && (
              <div className="meta-item">
                <FontAwesomeIcon icon={faUser} />
                <span>Organized by: {event.organizer}</span>
              </div>
            )}
            {event.contactEmail && (
              <div className="meta-item">
                <FontAwesomeIcon icon={faEnvelope} />
                <span>
                  Contact: <a href={`mailto:${event.contactEmail}`}>{event.contactEmail}</a>
                </span>
              </div>
            )}
          </div>
          
          {event.imageUrl && (
            <div className="event-image">
              <img src={event.imageUrl} alt={event.title} />
            </div>
          )}
        </div>
        
        <div className="event-buttons">
          <button className="btn-register">Register Now</button>
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
