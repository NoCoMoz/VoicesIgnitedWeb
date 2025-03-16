import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../utils/db';
import Event from '../../../models/Event';

// Sample event data for fallback
const sampleEvents = [
  {
    _id: '1',
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
    _id: '2',
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid event ID'
    });
  }

  // Try to connect to database first
  try {
    await connectToDatabase();
  } catch (dbError) {
    console.warn('Database connection failed, using sample data:', dbError);
    // Return sample event if ID matches
    const sampleEvent = sampleEvents.find(event => event._id === id);
    if (sampleEvent) {
      return res.status(200).json({
        success: true,
        data: sampleEvent,
        message: 'Using sample data due to database unavailability'
      });
    }
    return res.status(404).json({
      success: false,
      message: 'Event not found in sample data'
    });
  }

  try {
    switch (req.method) {
      case 'GET':
        const event = await Event.findById(id);
        if (!event) {
          // If no event found in DB, check sample data
          const sampleEvent = sampleEvents.find(event => event._id === id);
          if (sampleEvent) {
            return res.status(200).json({
              success: true,
              data: sampleEvent,
              message: 'Using sample data as event not found in database'
            });
          }
          return res.status(404).json({
            success: false,
            message: 'Event not found'
          });
        }
        return res.status(200).json({
          success: true,
          data: event
        });

      case 'PUT':
        const updatedEvent = await Event.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true
        });
        if (!updatedEvent) {
          return res.status(404).json({
            success: false,
            message: 'Event not found'
          });
        }
        return res.status(200).json({
          success: true,
          data: updatedEvent
        });

      case 'DELETE':
        const deletedEvent = await Event.findByIdAndDelete(id);
        if (!deletedEvent) {
          return res.status(404).json({
            success: false,
            message: 'Event not found'
          });
        }
        return res.status(200).json({
          success: true,
          message: 'Event deleted successfully'
        });

      default:
        return res.status(405).json({
          success: false,
          message: `Method ${req.method} not allowed`
        });
    }
  } catch (error) {
    console.error('Error in event API:', error);
    // For GET requests, try sample data as fallback
    if (req.method === 'GET') {
      const sampleEvent = sampleEvents.find(event => event._id === id);
      if (sampleEvent) {
        return res.status(200).json({
          success: true,
          data: sampleEvent,
          message: 'Using sample data due to error'
        });
      }
    }
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
