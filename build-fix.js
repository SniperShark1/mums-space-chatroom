#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔧 Running custom build process...');

try {
  // Step 1: Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm ci --production=false', { stdio: 'inherit', cwd: __dirname });

  // Step 2: Build frontend using Vite
  console.log('🚀 Building frontend with Vite...');
  execSync('npx vite build', { stdio: 'inherit', cwd: __dirname });

  // Step 3: Copy from dist/public to client/dist for deployment
  const sourcePath = path.join(__dirname, 'dist/public');
  const destPath = path.join(__dirname, 'client/dist');

  if (fs.existsSync(sourcePath) && fs.existsSync(path.join(sourcePath, 'index.html'))) {
    console.log(`✅ Found build output in: ${sourcePath}`);

    // Ensure client folder exists
    if (!fs.existsSync(path.join(__dirname, 'client'))) {
      fs.mkdirSync(path.join(__dirname, 'client'));
    }

    // Remove old dist if it exists
    if (fs.existsSync(destPath)) {
      fs.rmSync(destPath, { recursive: true, force: true });
    }

    execSync(`cp -r "${sourcePath}" "${destPath}"`);
    console.log('✅ Copied build output to client/dist');

    // Fix asset paths
    const htmlFile = path.join(destPath, 'index.html');
    let html = fs.readFileSync(htmlFile, 'utf8');
    html = html.replace(/src="\/assets\//g, 'src="./assets/');
    html = html.replace(/href="\/assets\//g, 'href="./assets/');
    fs.writeFileSync(htmlFile, html);
    console.log('✅ Fixed asset paths to use relative URLs');
  } else {
    throw new Error('Build output not found in dist/public');
  }

  // Step 4: Confirm success
  if (fs.existsSync(path.join(destPath, 'index.html'))) {
    console.log('✅ Build successful - index.html found in client/dist');
  } else {
    throw new Error('Build verification failed - no index.html in client/dist');
  }

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}