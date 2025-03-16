import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import axios from "axios";
import Calendar from "@/components/Calendar/Calendar";
import UpcomingEvents from "@/components/Events/UpcomingEvents";
import { EventType } from "@/types/event";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faInfoCircle, faLock } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/router';
import "@/styles/pages/events.styles.scss";

interface MongoEventResponse extends Omit<EventType, 'id' | 'date'> {
  _id: string;
  date: string;
}

/**
 * Events page component for Voices Ignited
 * Displays upcoming and past events with calendar and list views
 */
const Events = () => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [events, setEvents] = useState<EventType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fix for hydration issues - only render dynamic content after client-side hydration
  useEffect(() => {
    setIsClient(true);

    // Fetch events from API after client-side hydration
    if (isClient) {
      fetchEvents();
    }
  }, [isClient]);

  // Function to fetch events from the API
  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get<{ success: boolean; data: MongoEventResponse[] }>('/api/events');

      if (response.data.success) {
        // Format dates from API response
        const formattedEvents = response.data.data.map((event) => ({
          ...event,
          id: event._id,
          date: new Date(event.date),
        }));

        // Only show approved events
        const approvedEvents = formattedEvents.filter((event) => event.approved);

        setEvents(approvedEvents);
      } else {
        setError('Failed to load events');
        console.error('API returned error:', response.data);
      }
    } catch (err) {
      setError('Failed to load events. Please try again later.');
      console.error('Error fetching events:', err);

      // Fallback to sample data if API fails in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Using sample data as fallback in development mode');
        setEvents(sampleEvents);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle adding a new event
  const handleAddEvent = async (newEvent: Omit<EventType, 'id'>) => {
    try {
      setError(null);
      setSuccessMessage(null);

      // Send new event to the API
      const response = await axios.post<{ success: boolean; data: MongoEventResponse }>('/api/events', newEvent);

      if (response.data.success) {
        setSuccessMessage(
          'Thank you for submitting your event! It has been sent for review and will appear on the calendar once approved.'
        );
        return true; // Indicate success to the form
      } else {
        setError('Failed to create event');
        console.error('API returned error:', response.data);
        return false; // Indicate failure to the form
      }
    } catch (err) {
      setError('Failed to create event. Please try again.');
      console.error('Error creating event:', err);

      // Log validation errors for debugging
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        console.error('Validation errors:', err.response.data.error);
      }

      return false; // Indicate failure to the form
    }
  };

  // Don't render anything during server-side rendering to prevent hydration mismatch
  if (!isClient) return null;

  return (
    <div className="events-page">
      <Head>
        <title>Events | Voices Ignited</title>
        <meta name="description" content="View and submit events for Voices Ignited" />
      </Head>

      {error && (
        <div className="error-message" role="alert">
          <FontAwesomeIcon icon={faExclamationTriangle} />
          <span>{error}</span>
          <button 
            className="btn-retry" 
            onClick={fetchEvents}
            aria-label="Retry loading events"
          >
            Retry
          </button>
        </div>
      )}

      {successMessage && (
        <div className="success-message" role="status">
          <FontAwesomeIcon icon={faInfoCircle} />
          <span>{successMessage}</span>
          <button 
            className="btn-close" 
            onClick={() => setSuccessMessage(null)}
            aria-label="Close message"
          >
            ×
          </button>
        </div>
      )}

      <div className="events-content">
        {isLoading ? (
          <div className="loading-message">
            Loading events...
          </div>
        ) : (
          <>
            <div className="calendar-card-container">
              <div className="calendar-card-header">
                <h1 className="page-title">Events</h1>
                <p className="page-description">
                  Join us at our upcoming events and help make a difference in our community.
                </p>
              </div>
              <Calendar 
                events={events}
                onAddEvent={handleAddEvent}
              />
            </div>
            <UpcomingEvents events={events} maxEvents={5} />
          </>
        )}
      </div>
      
      <div className="admin-button-container">
        <button 
          className="btn-admin"
          onClick={() => router.push('/admin/events')}
          aria-label="Go to admin events page"
        >
          <FontAwesomeIcon icon={faLock} />
          <span>Admin</span>
        </button>
      </div>
    </div>
  );
};

// Sample event data (used as fallback if API fails)
const sampleEvents: EventType[] = [
  {
    id: '1',
    title: "Monthly Planning Meeting",
    description: "Join us for our monthly planning meeting where we'll discuss upcoming initiatives and events.",
    date: new Date(2023, new Date().getMonth(), 15),
    startTime: "18:30",
    endTime: "20:00",
    type: "meeting",
    locationType: "online",
    location: "Zoom (link will be sent after registration)",
    organizer: "Voices Ignited Core Team",
    contactEmail: "info@voicesignited.org",
    approved: true,
  },
  {
    id: '2',
    title: "Community Outreach Workshop",
    description: "Learn effective strategies for community outreach and engagement.",
    date: new Date(2023, new Date().getMonth(), 22),
    startTime: "14:00",
    endTime: "16:30",
    type: "workshop",
    locationType: "in-person",
    location: "Community Center, 123 Main St.",
    organizer: "Education Committee",
    contactEmail: "education@voicesignited.org",
    approved: true,
  },
  {
    id: '3',
    title: "Climate Justice Rally",
    description: "Stand with us as we rally for climate justice and environmental protection policies.",
    date: new Date(2023, new Date().getMonth() + 1, 5),
    startTime: "10:00",
    endTime: "13:00",
    type: "action",
    locationType: "in-person",
    location: "City Hall Plaza",
    organizer: "Direct Action Committee",
    contactEmail: "action@voicesignited.org",
    imageUrl: "/images/events/climate-rally.jpg",
    approved: true,
  },
  {
    id: '4',
    title: "Annual Fundraising Gala",
    description: "Our biggest fundraising event of the year with dinner, speakers, and entertainment.",
    date: new Date(2023, new Date().getMonth() + 1, 18),
    startTime: "18:00",
    endTime: "22:00",
    type: "fundraiser",
    locationType: "in-person",
    location: "Grand Hotel Ballroom, 500 Park Ave",
    organizer: "Fundraising Committee",
    contactEmail: "fundraising@voicesignited.org",
    imageUrl: "/images/events/gala.jpg",
    approved: true,
  },
  {
    id: '5',
    title: "Community Potluck",
    description: "Bring your favorite dish and meet fellow activists in a casual setting.",
    date: new Date(2023, new Date().getMonth(), 28),
    startTime: "17:00",
    endTime: "20:00",
    type: "social",
    locationType: "in-person",
    location: "Riverside Park Pavilion",
    organizer: "Community Building Committee",
    contactEmail: "community@voicesignited.org",
    approved: true,
  }
];

export default Events;
