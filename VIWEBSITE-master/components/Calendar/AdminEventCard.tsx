import React from 'react';
import { EventType } from '@/types/event';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes, faCalendarAlt, faMapMarkerAlt, faClock, faUser, faEnvelope } from '@fortawesome/free-solid-svg-icons';

interface AdminEventCardProps {
  event: EventType;
  onApprove: () => void;
  onReject: () => void;
}

/**
 * AdminEventCard component
 * Displays a pending event with approval/rejection controls
 */
const AdminEventCard: React.FC<AdminEventCardProps> = ({ event, onApprove, onReject }) => {
  // Format date for display
  const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="admin-event-card">
      <div className="admin-event-card-content">
        <div className="admin-event-header">
          <h3>{event.title}</h3>
          <span className={`event-type-tag ${event.type}`}>{event.type}</span>
        </div>
        
        <div className="admin-event-details">
          <p className="admin-event-description">{event.description}</p>
          
          <div className="admin-event-info">
            <p>
              <FontAwesomeIcon icon={faCalendarAlt} />
              <span>{formatDate(event.date)}</span>
            </p>
            <p>
              <FontAwesomeIcon icon={faClock} />
              <span>{event.startTime} - {event.endTime}</span>
            </p>
            <p>
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              <span>
                <strong>{event.locationType === 'online' ? 'Online' : 'In-Person'}: </strong>
                {event.location}
              </span>
            </p>
            
            {event.organizer && (
              <p>
                <FontAwesomeIcon icon={faUser} />
                <span><strong>Organizer: </strong>{event.organizer}</span>
              </p>
            )}
            
            {event.contactEmail && (
              <p>
                <FontAwesomeIcon icon={faEnvelope} />
                <span><strong>Contact: </strong>{event.contactEmail}</span>
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="admin-event-actions">
        <button 
          className="btn-approve" 
          onClick={onApprove}
          aria-label="Approve event"
        >
          <FontAwesomeIcon icon={faCheck} /> Approve
        </button>
        <button 
          className="btn-reject" 
          onClick={onReject}
          aria-label="Reject event"
        >
          <FontAwesomeIcon icon={faTimes} /> Reject
        </button>
      </div>
    </div>
  );
};

export default AdminEventCard;
