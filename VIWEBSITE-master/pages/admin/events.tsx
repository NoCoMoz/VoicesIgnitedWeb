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

/**
 * Admin Events Page
 * 
 * Provides an interface for admins to:
 * - View pending events that need approval
 * - Approve or reject submitted events
 * - Manage existing events
 */
const AdminEventsPage: React.FC = () => {
  const [isClient, setIsClient] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pendingEvents, setPendingEvents] = useState<EventType[]>([]);
  const [approvedEvents, setApprovedEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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
    } finally {
      setLoading(false);
    }
  };

  // Handle event approval
  const handleApprove = async (eventId: string) => {
    try {
      await axios.put(`/api/events/${eventId}`, {
        action: 'approve',
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
      await axios.put(`/api/events/${eventId}`, {
        action: 'reject',
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

  // Don't render anything during server-side rendering to prevent hydration mismatch
  if (!isClient) return null;

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
              Try Again
            </button>
          </div>
        )}

        <div className="admin-name-input">
          <label htmlFor="adminName">Your Name (for approval records):</label>
          <input
            type="text"
            id="adminName"
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>

        <section className="pending-events-section">
          <h2>Pending Events ({pendingEvents.length})</h2>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading pending events...</p>
            </div>
          ) : (
            <>
              {pendingEvents.length === 0 ? (
                <div className="no-events-message">
                  <p>No pending events require approval.</p>
                </div>
              ) : (
                <div className="pending-events-list">
                  {pendingEvents.map((event) => (
                    <AdminEventCard
                      key={event._id as string}
                      event={event}
                      onApprove={() => handleApprove(event._id as string)}
                      onReject={() => handleReject(event._id as string)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        <section className="recent-approved-events">
          <h2>Recently Approved Events</h2>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading approved events...</p>
            </div>
          ) : (
            <>
              {approvedEvents.length === 0 ? (
                <div className="no-events-message">
                  <p>No approved events found.</p>
                </div>
              ) : (
                <div className="approved-events-list">
                  {approvedEvents.map((event) => (
                    <div key={event._id as string} className="approved-event-card">
                      <h3>{event.title}</h3>
                      <p className="event-date">
                        {new Date(event.date).toLocaleDateString()}
                        {' • '}
                        {event.startTime} - {event.endTime}
                      </p>
                      <p className="approval-info">
                        Approved by: {event.approvedBy || 'Unknown'}
                        {event.approvedAt && (
                          <> on {new Date(event.approvedAt).toLocaleDateString()}</>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
};

export default AdminEventsPage;
