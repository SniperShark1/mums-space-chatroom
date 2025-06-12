import { Request, Response, NextFunction } from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    emailAddress?: string;
  };
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');
    
    if (!sessionToken) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // For development, allow bypass with demo user
    if (process.env.NODE_ENV === 'development' && sessionToken === 'demo') {
      req.userId = 'demo-user';
      req.user = {
        id: 'demo-user',
        firstName: 'Demo',
        lastName: 'User',
        emailAddress: 'demo@example.com'
      };
      return next();
    }

    // Verify the session token with Clerk
    const session = await clerkClient.sessions.verifySession(sessionToken, process.env.CLERK_SECRET_KEY!);

    if (!session) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    // Get user information
    const user = await clerkClient.users.getUser(session.userId);
    
    req.userId = session.userId;
    req.user = {
      id: session.userId,
      firstName: user.firstName ?? undefined,
      lastName: user.lastName ?? undefined,
      emailAddress: user.emailAddresses[0]?.emailAddress
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // For endpoints that can work with or without auth
  const sessionToken = req.headers.authorization?.replace('Bearer ', '');
  
  if (sessionToken) {
    return requireAuth(req, res, next);
  }
  
  next();
}