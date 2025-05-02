#!/usr/bin/env node

/**
 * Deployment helper script for Spencer Grey artist website
 * This script helps prepare the application for deployment
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

/**
 * Runs a command and returns its output
 * @param {string} command - Command to execute
 * @param {Object} options - Options for execution
 * @returns {string} Command output
 */
function runCommand(command, options = {}) {
  console.log(`Running: ${command}`);
  return execSync(command, {
    cwd: rootDir,
    stdio: 'inherit',
    ...options
  });
}

/**
 * Checks if required environment variables are set
 * @returns {boolean} True if all required variables are set
 */
function checkEnvVariables() {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY'
  ];
  
  const envPath = path.join(rootDir, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file not found!');
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const missingVars = [];
  
  for (const varName of requiredVars) {
    if (!envContent.includes(`${varName}=`)) {
      missingVars.push(varName);
    }
  }
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(v => console.error(`  - ${v}`));
    return false;
  }
  
  return true;
}

/**
 * Main deployment preparation function
 */
async function deploy() {
  console.log('🚀 Preparing Spencer Grey website for deployment...');
  
  // Check environment variables
  if (!checkEnvVariables()) {
    console.error('❌ Environment check failed. Please set all required variables in .env.local');
    process.exit(1);
  }
  
  // Run lint
  console.log('🧹 Running linter...');
  try {
    runCommand('npm run lint');
  } catch {
    console.error('❌ Linting failed. Please fix the issues before deploying.');
    process.exit(1);
  }
  
  // Run build
  console.log('🏗️ Building the application...');
  try {
    runCommand('npm run build');
  } catch {
    console.error('❌ Build failed. Please fix the issues before deploying.');
    process.exit(1);
  }
  
  console.log('✅ Build successful!');
  console.log('');
  console.log('🚀 Next steps for deployment:');
  console.log('1. Push your code to GitHub');
  console.log('2. Connect your repository to Vercel');
  console.log('3. Configure environment variables in Vercel');
  console.log('4. Deploy your application');
  console.log('');
  console.log('📖 For detailed instructions, see DEPLOYMENT.md');
}

// Run the deployment script
deploy().catch(err => {
  console.error('❌ Deployment preparation failed:', err);
  process.exit(1);
});
