import React, { useState, useEffect } from 'react';
import { EventType } from '@/types/event';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

interface EventFormProps {
  onClose: () => void;
  onSubmit: (event: Omit<EventType, 'id'>) => Promise<boolean> | boolean;
}

/**
 * Event submission form component
 * Allows users to submit new events to the calendar
 */
const EventForm: React.FC<EventFormProps> = ({ onClose, onSubmit }) => {
  const [isClient, setIsClient] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    type: 'meeting',
    locationType: 'online',
    location: '',
    organizer: '',
    contactEmail: '',
    imageUrl: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fix for hydration issues - only render after client-side hydration
  useEffect(() => {
    setIsClient(true);
    
    // Initialize date field with today's date
    if (!formData.date) {
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, date: formattedDate }));
    }
  }, []);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Clear submit error when user makes changes
    if (submitError) {
      setSubmitError(null);
    }
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }
    
    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (formData.contactEmail && !/^\S+@\S+\.\S+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      
      // Create event object from form data
      const newEvent: Omit<EventType, 'id'> = {
        title: formData.title,
        description: formData.description,
        date: new Date(formData.date),
        startTime: formData.startTime,
        endTime: formData.endTime,
        type: formData.type as any,
        locationType: formData.locationType as any,
        location: formData.location,
        organizer: formData.organizer || undefined,
        contactEmail: formData.contactEmail || undefined,
        imageUrl: formData.imageUrl || undefined
      };
      
      const result = await onSubmit(newEvent);
      
      if (result !== false) {
        onClose();
      } else {
        setSubmitError('Failed to submit event. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting event:', error);
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close modal when clicking outside the content
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isClient) {
      window.addEventListener('keydown', handleEscKey);
    }
    
    return () => {
      if (isClient) {
        window.removeEventListener('keydown', handleEscKey);
      }
    };
  }, [isClient, onClose]);

  // Don't render anything during server-side rendering to prevent hydration mismatch
  if (!isClient) return null;

  return (
    <div className="event-modal" onClick={handleBackdropClick} role="dialog" aria-modal="true" aria-labelledby="form-title">
      <div className="event-modal-content event-form-content">
        <button 
          className="close-modal" 
          onClick={onClose} 
          aria-label="Close event form"
          type="button"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
        
        <h3 id="form-title">Submit a New Event</h3>
        
        {submitError && (
          <div className="form-error-message">
            {submitError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="event-form" noValidate>
          <div className="form-group">
            <label htmlFor="title">Event Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? 'error' : ''}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "title-error" : undefined}
              disabled={isSubmitting}
            />
            {errors.title && <span className="error-message" id="title-error">{errors.title}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={errors.description ? 'error' : ''}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? "description-error" : undefined}
              disabled={isSubmitting}
            />
            {errors.description && <span className="error-message" id="description-error">{errors.description}</span>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={errors.date ? 'error' : ''}
                aria-invalid={!!errors.date}
                aria-describedby={errors.date ? "date-error" : undefined}
                disabled={isSubmitting}
              />
              {errors.date && <span className="error-message" id="date-error">{errors.date}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="startTime">Start Time *</label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className={errors.startTime ? 'error' : ''}
                aria-invalid={!!errors.startTime}
                aria-describedby={errors.startTime ? "startTime-error" : undefined}
                disabled={isSubmitting}
              />
              {errors.startTime && <span className="error-message" id="startTime-error">{errors.startTime}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="endTime">End Time *</label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className={errors.endTime ? 'error' : ''}
                aria-invalid={!!errors.endTime}
                aria-describedby={errors.endTime ? "endTime-error" : undefined}
                disabled={isSubmitting}
              />
              {errors.endTime && <span className="error-message" id="endTime-error">{errors.endTime}</span>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="type">Event Type *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="meeting">Meeting</option>
                <option value="workshop">Workshop</option>
                <option value="action">Direct Action</option>
                <option value="fundraiser">Fundraiser</option>
                <option value="social">Social Event</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="locationType">Location Type *</label>
              <select
                id="locationType"
                name="locationType"
                value={formData.locationType}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="online">Online</option>
                <option value="in-person">In-Person</option>
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="location">Location Details *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder={formData.locationType === 'online' ? 'Link or platform details' : 'Physical address'}
              className={errors.location ? 'error' : ''}
              aria-invalid={!!errors.location}
              aria-describedby={errors.location ? "location-error" : undefined}
              disabled={isSubmitting}
            />
            {errors.location && <span className="error-message" id="location-error">{errors.location}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="organizer">Organizer</label>
            <input
              type="text"
              id="organizer"
              name="organizer"
              value={formData.organizer}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="contactEmail">Contact Email</label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              className={errors.contactEmail ? 'error' : ''}
              aria-invalid={!!errors.contactEmail}
              aria-describedby={errors.contactEmail ? "contactEmail-error" : undefined}
              disabled={isSubmitting}
            />
            {errors.contactEmail && <span className="error-message" id="contactEmail-error">{errors.contactEmail}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="imageUrl">Image URL</label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Event'}
            </button>
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;
