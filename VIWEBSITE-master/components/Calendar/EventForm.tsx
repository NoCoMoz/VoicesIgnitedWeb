import React, { useState, useEffect } from 'react';
import { EventType } from '@/types/event';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import '@/styles/components/event-form.scss';

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
        type: formData.type as EventType['type'],
        locationType: formData.locationType as EventType['locationType'],
        location: formData.location,
        organizer: formData.organizer || undefined,
        contactEmail: formData.contactEmail || undefined,
        imageUrl: formData.imageUrl || undefined
      };
      
      const result = await onSubmit(newEvent);
      
      if (result) {
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
      <div className="event-modal-content">
        <button 
          className="close-modal" 
          onClick={onClose} 
          aria-label="Close event form"
          type="button"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
        
        <h2 id="form-title" className="modal-title">Submit a New Event</h2>
        
        {submitError && (
          <div className="form-error-message" role="alert">
            {submitError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="event-form" noValidate>
          <div className="form-field">
            <label htmlFor="title" className="form-label required">Event Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? 'form-input error' : 'form-input'}
              aria-required="true"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'title-error' : undefined}
            />
            {errors.title && (
              <span id="title-error" className="error-message" role="alert">
                {errors.title}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="description" className="form-label required">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={errors.description ? 'form-input error' : 'form-input'}
              rows={4}
              aria-required="true"
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'description-error' : undefined}
            />
            {errors.description && (
              <span id="description-error" className="error-message" role="alert">
                {errors.description}
              </span>
            )}
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="date" className="form-label required">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={errors.date ? 'form-input error' : 'form-input'}
                aria-required="true"
                aria-invalid={!!errors.date}
                aria-describedby={errors.date ? 'date-error' : undefined}
              />
              {errors.date && (
                <span id="date-error" className="error-message" role="alert">
                  {errors.date}
                </span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="startTime" className="form-label required">Start Time</label>
              <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className={errors.startTime ? 'form-input error' : 'form-input'}
                aria-required="true"
                aria-invalid={!!errors.startTime}
                aria-describedby={errors.startTime ? 'startTime-error' : undefined}
              />
              {errors.startTime && (
                <span id="startTime-error" className="error-message" role="alert">
                  {errors.startTime}
                </span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="endTime" className="form-label required">End Time</label>
              <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className={errors.endTime ? 'form-input error' : 'form-input'}
                aria-required="true"
                aria-invalid={!!errors.endTime}
                aria-describedby={errors.endTime ? 'endTime-error' : undefined}
              />
              {errors.endTime && (
                <span id="endTime-error" className="error-message" role="alert">
                  {errors.endTime}
                </span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="type" className="form-label required">Event Type</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="form-input"
                aria-required="true"
              >
                <option value="meeting">Meeting</option>
                <option value="workshop">Workshop</option>
                <option value="action">Action</option>
                <option value="fundraiser">Fundraiser</option>
                <option value="social">Social</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="locationType" className="form-label required">Location Type</label>
              <select
                id="locationType"
                name="locationType"
                value={formData.locationType}
                onChange={handleChange}
                className="form-input"
                aria-required="true"
              >
                <option value="online">Online</option>
                <option value="in-person">In Person</option>
              </select>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="location" className="form-label required">
              {formData.locationType === 'online' ? 'Meeting Link' : 'Address'}
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={errors.location ? 'form-input error' : 'form-input'}
              placeholder={formData.locationType === 'online' ? 'e.g., Zoom link or meeting URL' : 'e.g., 123 Main St, City, State'}
              aria-required="true"
              aria-invalid={!!errors.location}
              aria-describedby={errors.location ? 'location-error' : undefined}
            />
            {errors.location && (
              <span id="location-error" className="error-message" role="alert">
                {errors.location}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="organizer" className="form-label">Organizer Name</label>
            <input
              type="text"
              id="organizer"
              name="organizer"
              value={formData.organizer}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., Community Events Team"
            />
          </div>

          <div className="form-field">
            <label htmlFor="contactEmail" className="form-label">Contact Email</label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              className={errors.contactEmail ? 'form-input error' : 'form-input'}
              placeholder="e.g., events@example.com"
              aria-invalid={!!errors.contactEmail}
              aria-describedby={errors.contactEmail ? 'contactEmail-error' : undefined}
            />
            {errors.contactEmail && (
              <span id="contactEmail-error" className="error-message" role="alert">
                {errors.contactEmail}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="imageUrl" className="form-label">Event Image URL</label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., https://example.com/event-image.jpg"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;
