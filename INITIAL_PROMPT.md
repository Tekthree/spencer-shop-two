# 1. Create Next.js app with TypeScript and App Router
npx create-next-app@latest . --typescript --app

# 2. Install Tailwind CSS, PostCSS, Autoprefixer
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 3. Install ESLint, Prettier, and Next.js recommended plugins
npm install -D eslint prettier eslint-config-next eslint-plugin-jsdoc

# 4. Install Supabase client & CLI
npm install @supabase/supabase-js
npm install -g supabase

# 5. Install Zod for validation and shadcn/ui for UI primitives
npm install zod
npx shadcn-ui@latest init

# 6. Install Stripe for payments
npm install @stripe/stripe-js @stripe/react-stripe-js

# 7. Initialize Supabase for local dev (in a separate terminal)
supabase init