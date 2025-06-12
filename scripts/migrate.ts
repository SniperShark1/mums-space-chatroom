import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { users, chatRooms, chatMessages, groupMemberships, userReports } from '../shared/schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function runMigrations() {
  console.log('Running database migrations...');
  
  try {
    // Create default chat rooms if they don't exist
    const existingRooms = await db.select().from(chatRooms);
    
    if (existingRooms.length === 0) {
      console.log('Creating default chat rooms...');
      
      const defaultRooms = [
        {
          name: "Mums-to-Be",
          ageGroup: "mums-to-be",
          description: "Expecting mothers sharing their journey",
          isPrivateGroup: false,
          createdBy: null
        },
        {
          name: "0-2 Years",
          ageGroup: "0-2",
          description: "Parents with babies and toddlers",
          isPrivateGroup: false,
          createdBy: null
        },
        {
          name: "2-5 Years",
          ageGroup: "2-5",
          description: "Parents with preschool children",
          isPrivateGroup: false,
          createdBy: null
        }
      ];

      await db.insert(chatRooms).values(defaultRooms);
      console.log('Default chat rooms created successfully');
    } else {
      console.log('Chat rooms already exist, skipping creation');
    }
    
    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations();
}

export { runMigrations };