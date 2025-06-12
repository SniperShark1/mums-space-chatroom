import { Clerk } from '@clerk/clerk-js';

// Initialize Clerk with your publishable key
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing Clerk Publishable Key');
}

export const clerk = new Clerk(clerkPubKey);

// Helper function to get auth token for API requests
export async function getAuthToken(): Promise<string | null> {
  try {
    if (!clerk.session) {
      return null;
    }
    return await clerk.session.getToken();
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
}

// Helper function to check if user is authenticated
export function isAuthenticated(): boolean {
  return !!clerk.user;
}

// Helper function to get current user info
export function getCurrentUser() {
  return clerk.user;
}