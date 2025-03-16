import { NextApiRequest, NextApiResponse } from 'next';
import { verify } from 'jsonwebtoken';
import { parse } from 'cookie';

// In a real application, you would store this securely and not in code
const JWT_SECRET = 'voices_ignited_secret_key'; // In production, use a proper secret from environment variables

/**
 * Middleware to verify admin authentication
 * Returns true if the request is authenticated, false otherwise
 */
export const isAuthenticated = (req: NextApiRequest): boolean => {
  try {
    // Get cookie from request
    const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
    const token = cookies.adminToken;

    // If no token, not authenticated
    if (!token) {
      return false;
    }

    // Verify token
    const decoded = verify(token, JWT_SECRET);
    
    // Check if token has isAdmin claim
    return !!(decoded && (decoded as any).isAdmin);
  } catch (error) {
    console.error('Authentication verification error:', error);
    return false;
  }
};

/**
 * Middleware to protect API routes
 * Only allows authenticated requests to proceed
 */
export const withAuth = (handler: Function) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Check if authenticated
    if (!isAuthenticated(req)) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }

    // If authenticated, proceed to handler
    return handler(req, res);
  };
};
