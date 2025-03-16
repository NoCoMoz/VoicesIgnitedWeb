import { NextApiRequest, NextApiResponse } from 'next';

// Define response types for type safety
interface SuccessResponse {
  success: boolean;
  data: any;
  message: string;
}

interface ErrorResponse {
  success: boolean;
  error: string;
}

/**
 * API route handler for rejecting events
 * Follows RESTful API design principles and includes comprehensive error handling
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  // Extract event ID from query params
  const { id } = req.query;

  try {
    // Validate request method
    if (req.method !== 'PUT') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed. Only PUT requests are supported.'
      });
    }

    // Validate event ID
    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid event ID provided'
      });
    }

    // Validate admin name
    const { adminName } = req.body;
    if (!adminName) {
      return res.status(400).json({
        success: false,
        error: 'Admin name is required'
      });
    }

    // For now, return a mock success response
    // This will be replaced with actual database interaction
    return res.status(200).json({
      success: true,
      data: {
        id,
        rejected: true,
        rejectedAt: new Date().toISOString(),
        rejectedBy: adminName
      },
      message: 'Event rejected successfully'
    });
  } catch (error) {
    // Log the error for debugging
    console.error('Error in event rejection API:', error);
    
    // Return a safe error response
    return res.status(500).json({
      success: false,
      error: 'Internal server error while rejecting event'
    });
  }
}
