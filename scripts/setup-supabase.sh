#!/bin/bash

# Spencer Grey Artist Website - Supabase Setup Script
# This script sets up the Supabase database and creates an admin user

# Color codes for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Spencer Grey Artist Website - Supabase Setup ===${NC}"
echo -e "${YELLOW}This script will:${NC}"
echo "1. Apply database migrations to your Supabase project"
echo "2. Create an admin user for the admin panel"
echo "3. Add initial content for the About page"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo -e "${RED}Error: .env.local file not found!${NC}"
  echo "Please create a .env.local file with your Supabase credentials."
  exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo -e "${YELLOW}Supabase CLI not found. Installing...${NC}"
  npm install -g supabase
fi

# Check if required packages are installed
echo -e "${YELLOW}Installing required dependencies...${NC}"
npm install dotenv @supabase/supabase-js

# Convert scripts to ESM format
echo -e "${YELLOW}Adding package.json type: module configuration...${NC}"
if [ -f package.json ]; then
  # Check if type module is already set
  if ! grep -q '"type": "module"' package.json; then
    # Add type: module to package.json
    sed -i '/"name": /a \ \ "type": "module",' package.json
  fi
else
  echo -e "${RED}Error: package.json not found!${NC}"
  exit 1
fi

# Step 1: Apply migrations
echo -e "\n${BLUE}Step 1: Applying database migrations...${NC}"
echo -e "${YELLOW}Checking if exec_sql function exists in Supabase...${NC}"

# Source environment variables
source <(grep -v '^#' .env.local | sed -E 's/(.*)=(.*)/export \1="\2"/')

# Create the exec_sql function if it doesn't exist
echo -e "${YELLOW}Creating exec_sql function in Supabase...${NC}"
curl -X POST "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/rpc/exec_sql" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "CREATE OR REPLACE FUNCTION exec_sql(query text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN EXECUTE query; END; $$;"}' \
  || echo -e "${YELLOW}Note: exec_sql function may already exist or there was an error creating it.${NC}"

# Apply migrations
echo -e "${YELLOW}Applying migrations from supabase/migrations directory...${NC}"
for migration in supabase/migrations/*.sql; do
  echo -e "${YELLOW}Applying migration: $(basename "$migration")${NC}"
  
  # Read the SQL file
  sql_content=$(cat "$migration")
  
  # Execute the SQL via the exec_sql function
  curl -X POST "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/rpc/exec_sql" \
    -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"query\": $(echo "$sql_content" | jq -Rs .)}" \
    && echo -e "${GREEN}Migration applied successfully!${NC}" \
    || echo -e "${RED}Error applying migration.${NC}"
done

# Step 2: Create admin user and initial content
echo -e "\n${BLUE}Step 2: Creating admin user and initial content...${NC}"
node scripts/setup-supabase.js

echo -e "\n${GREEN}=== Supabase setup completed! ===${NC}"
echo -e "${YELLOW}You can now:${NC}"
echo "1. Log in to the admin panel at /admin/login"
echo "2. Use admin@spencergrey.com and the password from the setup script"
echo "3. Start adding artworks and managing your content"
echo ""
echo -e "${YELLOW}Note: Remember to change the default password after your first login!${NC}"
