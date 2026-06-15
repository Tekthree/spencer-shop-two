/**
 * Environment Variable Check Script
 * Checks if all required environment variables are set
 */

const requiredEnvVars = [
  'DATABASE_URL',
  'SESSION_SECRET',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD_HASH',
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME',
  'R2_PUBLIC_URL',
  'NEXT_PUBLIC_R2_PUBLIC_URL',
  'NEXT_PUBLIC_APP_URL',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
];

function checkEnvVars(): boolean {
  console.log('Checking environment variables...');

  const missingVars: string[] = [];

  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  });

  if (missingVars.length > 0) {
    console.error('\nMissing environment variables:');
    missingVars.forEach(envVar => {
      console.error(`  - ${envVar}`);
    });
    console.error('\nPlease add these variables to your .env.local file or deployment environment.');
    return false;
  }

  console.log('All required environment variables are set!');

  // Print partial keys for verification (safely)
  console.log('\nPartial key verification:');
  if (process.env.STRIPE_SECRET_KEY) {
    const key = process.env.STRIPE_SECRET_KEY;
    console.log(`STRIPE_SECRET_KEY: ${key.substring(0, 5)}...${key.substring(key.length - 4)}`);
  }

  if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    console.log(`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${key.substring(0, 5)}...${key.substring(key.length - 4)}`);
  }

  return true;
}

checkEnvVars();
