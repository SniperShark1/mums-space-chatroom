import { storage as memoryStorage } from "./storage";
import { storage as databaseStorage } from "./database";
import type { IStorage } from "./storage";

export function createStorage(): IStorage {
  // Use database storage in production, memory storage in development
  if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
    console.log('Using database storage for production');
    return databaseStorage;
  } else {
    console.log('Using memory storage for development');
    return memoryStorage;
  }
}

export const storage = createStorage();