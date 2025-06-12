#!/usr/bin/env node

// Custom build script for Vercel deployment
import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';

console.log('🚀 Starting Vercel build process...');

try {
  // Build the frontend with Vite
  console.log('📦 Building frontend...');
  execSync('vite build', { stdio: 'inherit' });
  
  // Ensure dist directory exists for server build
  if (!existsSync('dist')) {
    mkdirSync('dist');
  }
  
  // Build the server for production
  console.log('⚙️ Building server...');
  execSync('esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}