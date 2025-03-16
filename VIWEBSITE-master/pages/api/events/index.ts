import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../utils/db';
import Event from '../../../models/Event';
import { isAuthenticated } from '../../../utils/auth';

/**
 * API endpoint for events
 * GET: Retrieve events with optional filtering
 * POST: Create a new event
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await connectToDatabase();
    
    switch (req.method) {
      case 'GET':
        return await getEvents(req, res);
      case 'POST':
        return await createEvent(req, res);
      default:
        return res.status(405).json({ 
          success: false, 
          message: `Method ${req.method} not allowed` 
        });
    }
  } catch (error) {
    console.error('Error in events API:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * GET handler to retrieve events with filtering
 */
async function getEvents(req: NextApiRequest, res: NextApiResponse) {
  try {
    console.log("Processing GET request for events...");
    console.log("Query parameters:", req.query);

    const { 
      month, 
      year, 
      type, 
      locationType, 
      showPending = 'false',
      showApproved = 'false',
      adminRequest = 'false',
      limit 
    } = req.query;

    // Check authentication for admin requests
    if (adminRequest === 'true' && !isAuthenticated(req)) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized. Admin authentication required.' 
      });
    }

    // Build query filters
    const query: any = {};

    // Filter by month and year if provided
    if (month && year) {
      console.log(`Filtering by date: ${month}/${year}`);
      const startDate = new Date(parseInt(year as string), parseInt(month as string) - 1, 1);
      const endDate = new Date(parseInt(year as string), parseInt(month as string), 0);
      query.date = { $gte: startDate, $lte: endDate };
    }

    // Filter by event type if provided
    if (type) {
      console.log(`Filtering by type: ${type}`);
      query.type = type;
    }

    // Filter by location type if provided
    if (locationType) {
      console.log(`Filtering by location type: ${locationType}`);
      query.locationType = locationType;
    }

    // Handle approval status filtering
    if (adminRequest === 'true') {
      if (showPending === 'true') {
        console.log("Showing pending events only");
        query.approved = { $ne: true }; // Show events that are not approved
      } else if (showApproved === 'true') {
        console.log("Showing approved events only");
        query.approved = true;
      }
    } else {
      // Non-admin requests only see approved events
      console.log("Non-admin request: showing approved events only");
      query.approved = true;
    }

    console.log("Final query:", JSON.stringify(query, null, 2));

    // Build and execute the database query
    let eventsQuery = Event.find(query).sort({ date: 1, startTime: 1 });

    // Apply limit if provided
    if (limit) {
      const limitNum = parseInt(limit as string);
      if (!isNaN(limitNum)) {
        console.log(`Limiting results to ${limitNum} events`);
        eventsQuery = eventsQuery.limit(limitNum);
      }
    }

    // Execute query
    const events = await eventsQuery;
    console.log(`Found ${events.length} events`);

    return res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error fetching events',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * POST handler to create a new event
 */
async function createEvent(req: NextApiRequest, res: NextApiResponse) {
  try {
    const event = await Event.create(req.body);
    return res.status(201).json({
      success: true,
      data: event
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Error creating event',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
