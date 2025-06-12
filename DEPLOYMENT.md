# Vercel Deployment Guide for Mum's Space Chatroom

## Framework Detection Issue Resolution

The application is built with **Vite + Express**, not Next.js. Vercel's automatic framework detection can cause deployment issues when it incorrectly identifies the project structure.

## ✅ Fixed Vercel Configuration

The `vercel.json` has been updated to properly handle the Vite frontend and Express backend:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "client/dist",
  "functions": {
    "server/index.ts": {
      "runtime": "@vercel/node@3.0.7"
    }
  },
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server/index.ts"
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/client/dist/index.html"
    }
  ]
}
```

## Environment Variables Required

Add these in your Vercel dashboard under Project Settings > Environment Variables:

```bash
DATABASE_URL=postgresql://username:password@host:port/database
CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
OPENAI_API_KEY=sk-xxxxx
NODE_ENV=production
```

## Step-by-Step Deployment

### 1. Vercel Dashboard Configuration
- Go to your Vercel project settings
- Under "Build & Development Settings":
  - Framework Preset: **Other**
  - Build Command: `npm run build`
  - Output Directory: `client/dist`
  - Install Command: `npm install`

### 2. Clear Build Cache
- In Vercel dashboard: Project Settings > Functions
- Click "Clear Build Cache"
- This prevents old framework detection issues

### 3. Database Setup
```bash
npm run db:push    # Push schema to production database
npm run migrate    # Create default chat rooms and users
```

### 4. Deploy
```bash
vercel --prod
```

## Chatroom Functionality Preserved

The chatroom will work **exactly the same** as in development:

✅ **Real-time messaging** with WebSocket connections
✅ **Age-based chat rooms** (Mums-to-Be, 0-2 Years, 2-5 Years)  
✅ **Private group creation** with 4-6 users
✅ **Custom 3D emoji system** with replacements
✅ **AI parenting help** integration
✅ **Mobile-optimized design** with proper scrolling
✅ **User authentication** with Clerk
✅ **Reporting system** for community safety
✅ **Resizable interface** components

## Production Features

- **Hybrid Storage**: Memory storage in development, PostgreSQL in production
- **Authentication**: Clerk JWT validation on protected endpoints
- **Security Headers**: XSS protection, content type validation
- **Mobile Optimization**: Prevents zoom, proper touch targets
- **Error Handling**: Comprehensive error states and logging

## Troubleshooting

If deployment still fails:

1. **Check Build Logs**: Look for specific error messages in Vercel dashboard
2. **Verify Environment Variables**: Ensure all required variables are set
3. **Database Connection**: Test DATABASE_URL connectivity
4. **Clear Cache**: Use Vercel's "Clear Build Cache" option
5. **Framework Detection**: Ensure "Other" is selected, not Next.js or Vite

The application is production-ready with proper Vite configuration for Vercel deployment.