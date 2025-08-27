# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Workout Pal is a full-stack fitness tracking application with a **fully migrated Next.js backend** (previously FastAPI Python). The app generates AI-powered workout routines using Google's Gemini LLM and tracks user workout sessions with comprehensive analytics.

### Architecture

- **Frontend & Backend**: Next.js 15 + React 19 with TypeScript (Full-Stack)
- **API Routes**: Next.js API routes replacing FastAPI Python server
- **AI Integration**: Direct Google Gemini integration with custom LLM service
- **Database**: Dual PostgreSQL architecture - client Drizzle ORM + server PostgreSQL queries
- **Authentication**: better-auth with email/password
- **UI**: Radix UI components with Tailwind CSS and shadcn/ui
- **Charts**: Recharts for dashboard analytics
- **Metadata**: Dynamic page titles and custom fitness-themed favicon

## Development Commands

### Application (Next.js Full-Stack)
```bash
cd client/
npm run dev          # Start development server with turbopack
npm run build        # Build for production and validate types
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Legacy Server (Python - DEPRECATED)
The FastAPI Python server has been fully migrated to Next.js API routes. The server directory remains for reference but is no longer actively used.

## Database Architecture

### Main Database Schema (PostgreSQL)
- **workout_logs**: Stores completed workout sessions (accessed via Drizzle ORM)
- **logged_exercises**: Stores individual exercise performances within workouts (accessed via Drizzle ORM)
- **exercises**: Master exercise database with metadata (force, muscle groups, equipment)
- **user_workout_routines**: Generated AI workout routines cached per user/split
- **active_workout_sessions**: In-progress workout state management

### Database Access Patterns
- **Client Operations**: Use Drizzle ORM for workout logging and dashboard analytics
- **API Route Operations**: Use direct PostgreSQL queries for workout generation and caching
- **Dual Access**: Some tables (workout_logs, logged_exercises) accessed by both patterns

### Database Configuration
- Drizzle config at `client/drizzle.config.ts`
- Migrations stored in `client/better-auth_migrations/`
- All operations use the same PostgreSQL instance via `DATABASE_URL`

## Key Application Flow

1. **Authentication**: Users sign in via better-auth (currently disabled in middleware for development)
2. **Workout Generation**: 
   - Next.js API routes generate workouts using Google Gemini based on user preferences and workout history
   - Workouts are cached in `user_workout_routines` table with proper JSON formatting
   - Split types: PUSH, PULL, LEGS, ABS, FULL_BODY
3. **Active Sessions**: Real-time workout tracking via `active_workout_sessions` table
4. **Logging**: Completed workouts stored in database with set-by-set tracking
5. **Analytics**: Dashboard displays workout history, progress charts, and performance metrics with filtering
6. **Metadata**: Dynamic page titles based on current page/workout split with custom fitness favicon

## API Integration

### Next.js API Routes (Migrated from FastAPI)
- `GET /api/workout/today` - Generate/fetch workout routine for split with caching
- `GET/POST/PUT/DELETE /api/workout/active` - Manage active workout sessions
- `POST /api/workout/edit-exercise` - AI-powered exercise modifications using Gemini
- `POST /api/workout/log` - Log completed workouts with comprehensive data
- `POST /api/workout/clear-cache` - Clear cached workout routines for regeneration

### Client Server Actions (Drizzle ORM)
- `getWorkoutLogsAction()` - Fetch user workout history for dashboard
- `getLoggedExercisesAction()` - Fetch detailed exercise logs for analytics

## Authentication & Security

- better-auth handles user authentication
- TODO: Authentication middleware currently disabled (see `client/src/middleware.ts:4`)
- Server APIs need auth token validation (see `server/main.py:3`)
- User ID should be extracted from auth tokens, not passed as query params

## File Structure Notes

### Key Application Files
- `src/app/` - Next.js App Router pages and API routes (full-stack application)
  - `src/app/api/workout/` - All workout-related API endpoints
  - `src/app/layout.tsx` - Root layout with dynamic metadata and custom favicon
  - `src/app/icon.svg` - Custom fitness-themed favicon
- `src/components/` - Reusable React components with Radix UI
- `src/db/` - Database schema, connections, and Drizzle queries
- `src/lib/` - Utility functions and services
  - `src/lib/workout-queries.ts` - Database workout queries
  - `src/lib/llm-service.ts` - Google Gemini AI integration
  - `src/lib/use-page-title.ts` - Dynamic page title hooks
- `src/types/` - TypeScript type definitions
  - `src/types/database.ts` - Consolidated database and query types
  - `src/types/api.ts` - API request/response types
  - `src/types/index.ts` - Core domain types

### Legacy Server Files (DEPRECATED)
- `server/` directory contains the original FastAPI Python backend
- All functionality has been migrated to Next.js API routes
- Keep for reference but not actively maintained

## Development Notes

### Build & Development
- ESLint errors ignored during builds (`next.config.ts:6`)
- Uses Turbopack for faster development builds
- TypeScript compilation validates all API routes and components during build

### Key Features Implemented
- **Complete Backend Migration**: All FastAPI endpoints migrated to Next.js API routes
- **Database Format Consistency**: Fixed routine_json parsing and storage issues
- **Dynamic Metadata**: Page titles update based on current workout split and page context
- **Custom Favicon**: Fitness-themed SVG icon replaces default Next.js favicon
- **AI Integration**: Direct Google Gemini integration for workout generation and exercise modifications
- **Comprehensive Analytics**: Dashboard with workout history, progress tracking, and split-based filtering

### Authentication Status
- Authentication currently bypassed for development (`client/src/middleware.ts`)
- Enable in production by uncommenting middleware and updating API routes for token validation

### Testing & Validation
- All migrated API endpoints tested and validated
- Database queries return properly formatted data
- Build process completes successfully with all features integrated