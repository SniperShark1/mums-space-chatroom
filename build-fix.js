#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔧 Running custom build process...');

try {
  // Build with Vite first
  console.log('📦 Building frontend with Vite...');
  execSync('vite build', { stdio: 'inherit', cwd: process.cwd() });
  
  // Copy from dist/public to client/dist for deployment
  if (fs.existsSync('dist/public') && fs.existsSync('dist/public/index.html')) {
    console.log('✅ Found build output in: dist/public');
    
    // Ensure client directory exists
    if (!fs.existsSync('client')) {
      fs.mkdirSync('client');
    }
    
    // Remove existing client/dist and copy new build
    if (fs.existsSync('client/dist')) {
      execSync('rm -rf client/dist');
    }
    execSync('cp -r dist/public client/dist');
    console.log('✅ Copied build output to client/dist');
  } else {
    throw new Error('Build output not found in dist/public');
  }
  
  // Verify the build
  if (fs.existsSync('client/dist/index.html')) {
    console.log('✅ Build successful - index.html found in client/dist');
  } else {
    throw new Error('Build verification failed - no index.html in client/dist');
  }
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}