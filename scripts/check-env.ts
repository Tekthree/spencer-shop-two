/**
 * Environment Variable Check Script
 * Checks if all required environment variables are set
 */

// List of required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_APP_URL',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
];

// Check if all required environment variables are set
function checkEnvVars() {
  console.log('Checking environment variables...');
  
  const missingVars: string[] = [];
  
  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  });
  
  if (missingVars.length > 0) {
    console.error('\n❌ Missing environment variables:');
    missingVars.forEach(envVar => {
      console.error(`  - ${envVar}`);
    });
    console.error('\nPlease add these variables to your .env file or environment.');
    console.error('For Stripe testing, you need valid API keys from the Stripe dashboard.');
    return false;
  }
  
  console.log('✅ All required environment variables are set!');
  
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

// Run the check
checkEnvVars();
