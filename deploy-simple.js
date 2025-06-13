#!/usr/bin/env node

// Simple deployment script to bypass Vercel issues
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Creating simple deployment package...');

// Create a clean deployment directory
if (fs.existsSync('deploy')) {
  execSync('rm -rf deploy');
}
fs.mkdirSync('deploy');

// Copy essential files
const filesToCopy = [
  'package.json',
  'package-lock.json', 
  'vercel.json',
  'netlify.toml',
  'tsconfig.json',
  'vite.config.ts',
  'tailwind.config.ts',
  'postcss.config.js',
  'components.json'
];

filesToCopy.forEach(file => {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join('deploy', file));
    console.log(`✅ Copied ${file}`);
  }
});

// Copy directories
const dirsToCopy = ['client', 'server', 'shared', 'scripts'];

dirsToCopy.forEach(dir => {
  if (fs.existsSync(dir)) {
    execSync(`cp -r ${dir} deploy/`);
    console.log(`✅ Copied ${dir} directory`);
  }
});

console.log('\n📦 Deployment package created in /deploy folder');
console.log('\nNext steps:');
console.log('1. cd deploy');
console.log('2. git init');
console.log('3. git add .');
console.log('4. git commit -m "Initial deployment"');
console.log('5. Connect to new GitHub repo');
console.log('6. Deploy fresh to Vercel or Netlify');
console.log('\nThis bypasses all existing configuration issues.');