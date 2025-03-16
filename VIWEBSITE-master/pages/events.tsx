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

// Sample event data (used as fallback if API fails)
const sampleEvents: EventType[] = [
  {
    id: '1',
    title: "Monthly Planning Meeting",
    description: "Join us for our monthly planning meeting where we'll discuss upcoming initiatives and events.",
    date: new Date(2024, new Date().getMonth(), 15),
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
    description: "Learn effective strategies for community engagement and grassroots organizing.",
    date: new Date(2024, new Date().getMonth(), 20),
    startTime: "14:00",
    endTime: "16:00",
    type: "workshop",
    locationType: "hybrid",
    location: "Community Center + Zoom",
    organizer: "Outreach Team",
    contactEmail: "outreach@voicesignited.org",
    approved: true,
  }
];

// Use getStaticPaths for static generation
export async function getStaticPaths() {
  return {
    paths: [{ params: {} }], // Include the events route
    fallback: false, // Show 404 for non-existent paths
  };
}

// Use getStaticProps for initial data
export async function getStaticProps() {
  return {
    props: {
      initialEvents: sampleEvents,
    },
  };
}

/**
 * Events page component for Voices Ignited
 * Displays upcoming and past events with calendar and list views
 */
const Events = ({ initialEvents }: { initialEvents: EventType[] }) => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [events, setEvents] = useState<EventType[]>(initialEvents);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fix for hydration issues - only render dynamic content after client-side hydration
  useEffect(() => {
    setIsClient(true);
    // Fetch fresh events from API after client-side hydration
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

export default Events;
