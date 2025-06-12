# Mum's Space Chatroom

A real-time chat platform for parents to connect, share experiences, and get AI-powered parenting advice.

## Features

- **Age-based Chat Rooms**: Mums-to-Be, 0-2 Years, 2-5 Years
- **Real-time Messaging**: Live chat with auto-scroll
- **Private Group Chats**: Create intimate conversations with 2-5 other parents
- **AI Parenting Help**: Get personalized advice powered by OpenAI
- **User Management**: Mute, block, and report features
- **Custom 3D Emojis**: Enhanced messaging experience
- **Mobile Optimized**: Responsive design for all devices
- **Secure Authentication**: Powered by Clerk

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Clerk
- **AI**: OpenAI GPT-4
- **Deployment**: Vercel

## Environment Setup

### Required Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# Authentication (Clerk)
CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx

# AI Integration (OpenAI)
OPENAI_API_KEY=sk-xxxxx

# Environment
NODE_ENV=production
```

### Getting API Keys

1. **Database (Neon/Supabase)**:
   - Create account at [Neon](https://neon.tech) or [Supabase](https://supabase.com)
   - Create new project and get connection string

2. **Authentication (Clerk)**:
   - Create account at [Clerk](https://clerk.com)
   - Create new application
   - Get publishable and secret keys from dashboard

3. **AI (OpenAI)**:
   - Create account at [OpenAI](https://openai.com)
   - Generate API key from dashboard

## Database Setup

The application uses PostgreSQL with the following tables:
- `users` - User profiles and authentication
- `chat_rooms` - Chat room definitions
- `chat_messages` - All chat messages
- `group_memberships` - Private group associations
- `user_reports` - User reporting system

### Row Level Security (RLS) Policies

Ensure these policies are enabled in your database:

```sql
-- Users can read all users but only update themselves
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- Chat rooms are readable by all
CREATE POLICY "Anyone can view chat rooms" ON chat_rooms FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create rooms" ON chat_rooms FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Messages require authentication
CREATE POLICY "Anyone can view messages" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can send messages" ON chat_messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Group memberships
CREATE POLICY "Users can view group memberships" ON group_memberships FOR SELECT USING (true);
CREATE POLICY "Users can manage own memberships" ON group_memberships FOR ALL USING (auth.uid()::text = user_id::text);

-- User reports
CREATE POLICY "Users can create reports" ON user_reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin can view reports" ON user_reports FOR SELECT USING (auth.role() = 'service_role');
```

## Development

```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Start development server
npm run dev
```

## Production Deployment

### Vercel Deployment

1. **Prepare Environment**:
   - Ensure all environment variables are set
   - Push database schema: `npm run db:push`
   - Run migrations: `npm run migrate`

2. **Deploy to Vercel**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   ```

3. **Configure Environment Variables in Vercel**:
   - Go to your Vercel dashboard
   - Add all environment variables from `.env.example`

### Database Migrations

Run before first deployment:
```bash
npm run migrate
```

This creates default chat rooms and ensures database structure is ready.

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilities
├── server/                 # Express backend
│   ├── routes.ts          # API routes
│   ├── database.ts        # Database operations
│   ├── auth.ts           # Authentication middleware
│   └── ai.ts             # AI integration
├── shared/                # Shared types and schemas
│   └── schema.ts         # Database schema
└── scripts/              # Build and migration scripts
```

## API Endpoints

- `GET /api/chat/rooms` - Get all chat rooms
- `GET /api/chat/rooms/:id/messages` - Get messages for a room
- `POST /api/chat/rooms/:id/messages` - Send message (auth required)
- `POST /api/chat/rooms` - Create private group (auth required)
- `POST /api/ai/help` - Get AI parenting advice
- `GET /api/users` - Get all users
- `POST /api/reports` - Report user (auth required)

## Security Features

- JWT-based authentication with Clerk
- Row Level Security (RLS) policies
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS protection
- Environment variable validation

## Support

For issues or questions, please check the documentation or create an issue in the repository.