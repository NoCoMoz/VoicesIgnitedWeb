import React from 'react';
import { EventType } from '@/types/event';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faMapMarkerAlt, faClock, faShareAlt } from '@fortawesome/free-solid-svg-icons';

interface EventCardProps {
  event: EventType;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Get event type class
  const getEventTypeClass = (type: string) => {
    const lowerType = type.toLowerCase();
    return ['meeting', 'workshop', 'action', 'fundraiser', 'social'].includes(lowerType) 
      ? lowerType 
      : 'default';
  };

  // Function to handle sharing an event
  function handleShareEvent(event: EventType) {
    // Create share text
    const shareText = `Join us at ${event.title} on ${formatDate(event.date)} from ${event.startTime} to ${event.endTime} at ${event.location}. ${event.description}`;
    
    // Check if Web Share API is available
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: shareText,
        url: window.location.href,
      })
      .catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      try {
        navigator.clipboard.writeText(shareText);
        alert('Event details copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
        alert('Could not share event. Please try again.');
      }
    }
  }

  return (
    <div className="event-card">
      {event.imageUrl ? (
        <div 
          className="event-card-image" 
          style={{ backgroundImage: `url(${event.imageUrl})` }}
        />
      ) : (
        <div className={`event-card-image event-card-image-placeholder ${getEventTypeClass(event.type)}`}>
          <span>{event.type.charAt(0).toUpperCase()}</span>
        </div>
      )}
      
      <div className="event-card-content">
        <div className={`event-card-type ${getEventTypeClass(event.type)}`}>
          {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
        </div>
        
        <h3 className="event-card-title">{event.title}</h3>
        
        <div className="event-card-details">
          <div className="event-card-detail">
            <FontAwesomeIcon icon={faCalendarAlt} />
            <span>{formatDate(event.date)}</span>
          </div>
          
          <div className="event-card-detail">
            <FontAwesomeIcon icon={faClock} />
            <span>{event.startTime} - {event.endTime}</span>
          </div>
          
          <div className="event-card-detail">
            <FontAwesomeIcon icon={faMapMarkerAlt} />
            <span>{event.locationType === 'online' ? 'Online' : event.location}</span>
          </div>
        </div>
        
        <p className="event-card-description">{event.description}</p>
        
        <div className="event-card-footer">
          <button className="btn-share" onClick={() => handleShareEvent(event)}>
            <FontAwesomeIcon icon={faShareAlt} /> Share
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
