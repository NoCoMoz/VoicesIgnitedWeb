import { NextApiRequest, NextApiResponse } from 'next';
import { Event, EventResponse } from '../../../types/event';

// Static events data
const events: Event[] = [
  {
    title: "Community Meeting",
    description: "Monthly community gathering to discuss local issues",
    date: new Date("2025-04-01").toISOString(),
    location: "Community Center",
    type: "meeting"
  },
  {
    title: "Fundraising Event",
    description: "Annual fundraiser for local initiatives",
    date: new Date("2025-05-15").toISOString(),
    location: "Town Hall",
    type: "fundraiser"
  }
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<EventResponse>
) {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required'
      });
    }

    const eventId = Array.isArray(id) ? id[0] : id;
    const eventIndex = parseInt(eventId);

    if (isNaN(eventIndex) || eventIndex < 0 || eventIndex >= events.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
    }

    switch (req.method) {
      case 'GET':
        return res.status(200).json({
          success: true,
          message: 'Event retrieved successfully',
          data: events[eventIndex]
        });

      case 'PUT':
        const updatedEvent = {
          ...events[eventIndex],
          ...req.body,
          date: new Date(req.body.date).toISOString()
        };
        events[eventIndex] = updatedEvent;
        return res.status(200).json({
          success: true,
          message: 'Event updated successfully',
          data: updatedEvent
        });

      case 'DELETE':
        events.splice(eventIndex, 1);
        return res.status(200).json({
          success: true,
          message: 'Event deleted successfully'
        });

      default:
        return res.status(405).json({
          success: false,
          message: 'Method not allowed'
        });
    }
  } catch (error) {
    console.error('Error handling event request:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
