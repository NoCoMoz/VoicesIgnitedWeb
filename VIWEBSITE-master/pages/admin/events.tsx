import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import axios from 'axios';
import { EventType } from '@/types/event';
import AdminEventCard from '@/components/Calendar/AdminEventCard';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import '@/styles/admin-events.css';
import AdminLogin from '@/components/Admin/AdminLogin';

// Sample event data for development
const samplePendingEvents: EventType[] = [
  {
    id: '3',
    title: "Climate Justice Rally",
    description: "Stand with us as we rally for climate justice and environmental protection policies.",
    date: new Date(2024, new Date().getMonth() + 1, 5),
    startTime: "10:00",
    endTime: "13:00",
    type: "action",
    locationType: "in-person",
    location: "City Hall Plaza",
    organizer: "Direct Action Committee",
    contactEmail: "action@voicesignited.org",
    imageUrl: "/images/events/climate-rally.jpg",
    approved: false,
  }
];

// Use getStaticPaths for static generation
export async function getStaticPaths() {
  return {
    paths: [{ params: {} }], // Include the admin/events route
    fallback: false, // Show 404 for non-existent paths
  };
}

// Use getStaticProps for initial data
export async function getStaticProps() {
  return {
    props: {
      initialPendingEvents: samplePendingEvents,
      initialApprovedEvents: [], // Start with empty approved events
    },
  };
}

/**
 * Admin Events Page
 * 
 * Provides an interface for admins to:
 * - View pending events that need approval
 * - Approve or reject submitted events
 * - Manage existing events
 */
const AdminEventsPage = ({ 
  initialPendingEvents,
  initialApprovedEvents 
}: { 
  initialPendingEvents: EventType[],
  initialApprovedEvents: EventType[]
}) => {
  const [isClient, setIsClient] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pendingEvents, setPendingEvents] = useState<EventType[]>(initialPendingEvents);
  const [approvedEvents, setApprovedEvents] = useState<EventType[]>(initialApprovedEvents);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [adminName, setAdminName] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Fix for hydration issues - only render after client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    if (!isClient) return;
    
    // Check if we have an auth cookie by making a test request
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/events', {
          params: { adminRequest: 'true' }
        });
        
        // If we get a successful response, we're authenticated
        setIsAuthenticated(true);
        fetchEvents();
      } catch (err: any) {
        // If we get a 401 error, we're not authenticated
        if (err.response?.status === 401) {
          setIsAuthenticated(false);
        } else {
          console.error('Error checking authentication:', err);
          setError('Failed to check authentication status');
        }
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [isClient]);

  // Handle successful login
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    fetchEvents();
  };

  // Fetch events from the API
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch pending events (unapproved only)
      const pendingResponse: { data: { data: EventType[] } } = await axios.get('/api/events', {
        params: {
          adminRequest: 'true',
          showPending: 'true'
        }
      });
      
      // Fetch approved events only
      const approvedResponse: { data: { data: EventType[] } } = await axios.get('/api/events', {
        params: {
          adminRequest: 'true',
          showApproved: 'true',
          limit: 5
        }
      });
      
      // Format and validate the responses
      const pendingData: EventType[] = pendingResponse.data.data || [];
      const approvedData: EventType[] = approvedResponse.data.data || [];

      // Additional validation to ensure no duplicates
      const pendingIds = new Set(pendingData.map((event: EventType) => event._id));
      const filteredApprovedData = approvedData.filter((event: EventType) => !pendingIds.has(event._id));
      
      setPendingEvents(pendingData);
      setApprovedEvents(filteredApprovedData);
    } catch (err: any) {
      console.error('Failed to fetch events:', err);
      setError('Failed to load events. Please try again.');
      
      // Use sample data in development
      if (process.env.NODE_ENV === 'development') {
        setPendingEvents(initialPendingEvents);
        setApprovedEvents(initialApprovedEvents);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle event approval
  const handleApprove = async (eventId: string) => {
    try {
      await axios.put(`/api/events/${eventId}/approve`, {
        adminName: adminName || 'Admin'
      });
      
      // Show success message
      setSuccessMessage('Event approved successfully!');
      setShowSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      
      // Refresh events list
      fetchEvents();
    } catch (err: any) {
      console.error('Failed to approve event:', err);
      setError('Failed to approve event. Please try again.');
    }
  };

  // Handle event rejection
  const handleReject = async (eventId: string) => {
    try {
      await axios.put(`/api/events/${eventId}/reject`, {
        adminName: adminName || 'Admin'
      });
      
      // Show success message
      setSuccessMessage('Event rejected and removed');
      setShowSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      
      // Refresh events list
      fetchEvents();
    } catch (err: any) {
      console.error('Failed to reject event:', err);
      setError('Failed to reject event. Please try again.');
    }
  };

  // If not authenticated, show login form
  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>Admin Login | Voices Ignited</title>
          <meta name="description" content="Admin login - Authorized personnel only" />
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        
        <AdminLogin onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  // If authenticated, show admin interface
  return (
    <>
      <Head>
        <title>Event Administration | Voices Ignited</title>
        <meta name="description" content="Manage and approve events - Admin access only" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="admin-events-page">
        <div className="admin-header">
          <h1>Event Administration</h1>
          <div className="admin-actions">
            <Link href="/events" className="btn-secondary">
              Back to Events Calendar
            </Link>
          </div>
        </div>

        {showSuccess && (
          <div className="success-message">
            <FontAwesomeIcon icon={faCheck} /> {successMessage}
          </div>
        )}

        {error && (
          <div className="error-message">
            <FontAwesomeIcon icon={faExclamationTriangle} /> {error}
            <button onClick={fetchEvents} className="btn-retry">
              Retry
            </button>
          </div>
        )}

        <div className="events-section">
          <h2>Pending Events</h2>
          {loading ? (
            <div className="loading">Loading events...</div>
          ) : pendingEvents.length > 0 ? (
            <div className="events-grid">
              {pendingEvents.map((event) => (
                <AdminEventCard
                  key={event.id}
                  event={event}
                  onApprove={() => handleApprove(event.id)}
                  onReject={() => handleReject(event.id)}
                />
              ))}
            </div>
          ) : (
            <div className="no-events">No pending events to review</div>
          )}
        </div>

        <div className="events-section">
          <h2>Recently Approved Events</h2>
          {loading ? (
            <div className="loading">Loading events...</div>
          ) : approvedEvents.length > 0 ? (
            <div className="events-grid">
              {approvedEvents.map((event) => (
                <AdminEventCard
                  key={event.id}
                  event={event}
                  isApproved
                />
              ))}
            </div>
          ) : (
            <div className="no-events">No recently approved events</div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminEventsPage;
