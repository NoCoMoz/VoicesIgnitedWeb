import type { NextApiRequest, NextApiResponse } from 'next';
import { sign } from 'jsonwebtoken';
import { serialize } from 'cookie';

// In a real application, you would store this securely and not in code
const ADMIN_PASSWORD = 'voicesignited2025'; // You should change this to a strong password
const JWT_SECRET = 'voices_ignited_secret_key'; // In production, use a proper secret from environment variables

type ResponseData = {
  success: boolean;
  message: string;
}

/**
 * API endpoint for admin authentication
 * 
 * POST: Authenticate admin with password
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: `Method ${req.method} not allowed` 
    });
  }

  try {
    const { password } = req.body;

    // Validate password
    if (!password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password is required' 
      });
    }

    // Check if password matches
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid password' 
      });
    }

    // Create JWT token
    const token = sign(
      { 
        isAdmin: true,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      },
      JWT_SECRET
    );

    // Set cookie with JWT token
    const cookie = serialize('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    });

    // Set cookie in response
    res.setHeader('Set-Cookie', cookie);

    // Return success response
    return res.status(200).json({ 
      success: true, 
      message: 'Authentication successful' 
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}
