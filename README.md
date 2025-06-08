# Shiba Lab Warehouse Management System v2 (shiba-lab-倉庫管理システムv2)

This project is a warehouse management system. It appears to be built with Next.js, Prisma, Supabase, and TypeScript.

## Features

*(You can add a brief overview of the system's key features here.)*

## Tech Stack

*   **Framework:** Next.js
*   **Language:** TypeScript
*   **ORM:** Prisma
*   **Database:** PostgreSQL (commonly used with Prisma/Supabase)
*   **Authentication/Backend:** Supabase
*   **Styling:** Tailwind CSS
*   **UI Components:** shadcn/ui (inferred from `components.json` and `tailwind.config.js`)
*   **PWA:** next-pwa (inferred from build logs)

## Prerequisites

*   Node.js (version specified in `package.json` or latest LTS recommended)
*   npm or yarn
*   Access to a PostgreSQL database (e.g., via Supabase)

## Getting Started

### 1. Clone the repository (if applicable)

```bash
# git clone <repository-url>
# cd shiba-lab-倉庫管理システムv2
```

### 2. Install Dependencies

```bash
npm install
```
Or if you prefer yarn:
```bash
yarn install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root of the project by copying the example file if one exists (e.g., `.env.example`), or create it from scratch.
It should include at least the following:

```env
# Prisma
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY" # If used for admin tasks on the backend

# Gemini API Key (if still used, as per original README)
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# NextAuth.js (if you add it later)
# NEXTAUTH_URL="http://localhost:3000"
# NEXTAUTH_SECRET="YOUR_VERY_SECRET_STRING_FOR_NEXTAUTH"
```

**Note:** Obtain your Supabase URL and keys from your Supabase project dashboard.

### 4. Run Database Migrations

Apply database schema changes using Prisma Migrate:

```bash
npx prisma migrate dev
```
This will also create the database if it doesn't exist (depending on your setup).

### 5. Seed the Database (Optional)

If you have a seed script (`prisma/seed.ts`), you can populate your database with initial data:

```bash
npx prisma db seed
```
To run the seed script, `ts-node` might be required, or you might have a script in `package.json`. If `prisma db seed` doesn't directly execute the TypeScript seed, you might need a setup like this in `package.json`:
```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```
Then run `npx prisma db seed`.

## Development

### Running the Development Server

To start the Next.js development server:

```bash
npm run dev
```
Or with yarn:
```bash
yarn dev
```
The application will typically be available at `http://localhost:3000`.

## Building for Production

To create an optimized production build:

```bash
npm run build
```
Or with yarn:
```bash
yarn build
```

## Linting and Formatting

*(Add commands for linting and formatting if they are configured in `package.json`, e.g., `npm run lint`, `npm run format`)*

## Deployment

This project includes a `vercel.json` file, suggesting it's configured for deployment on [Vercel](https://vercel.com/).

To deploy on Vercel:
1.  Push your code to a Git repository (GitHub, GitLab, Bitbucket).
2.  Connect your Git repository to Vercel.
3.  Configure the environment variables in the Vercel project settings.
4.  Vercel will automatically build and deploy your application upon new commits to the connected branch.

## Project Structure Overview

*(You can add a brief explanation of the main directories like `app`, `components`, `lib`, `prisma`, `services` here if desired.)*

```
/app                # Next.js App Router: pages, layouts, route handlers
/components         # Shared UI components
/constants.ts       # Application-wide constants
/context            # React context providers (e.g., AuthContext)
/hooks              # Custom React hooks
/lib                # Utility functions, Prisma client, Supabase client
/prisma             # Prisma schema, migrations, seed script
/public             # Static assets (images, manifest.json, service worker)
/services           # API service functions (data fetching logic)
next.config.js      # Next.js configuration
tailwind.config.js  # Tailwind CSS configuration
tsconfig.json       # TypeScript configuration
```
