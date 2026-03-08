# Auth

Authentication layer for Mars Workbench. See [baseline.md](./design/baseline.md) for design docs.

## Current State

Auth infrastructure implemented — Supabase Auth connected with Google OAuth flow. Supabase client utilities (browser, server, middleware), OAuth callback route handler (`/auth/callback`), and route protection proxy (`proxy.ts`) are in place. Database migrated to Supabase PostgreSQL. Login page UI not yet built (protected routes redirect to `/auth/login` which currently 404s).

## Backlog

### High Priority
- [ ] Implement login/signup pages
- [ ] Add userId to existing features (kanban, chat)

### Future
- [ ] User profile/settings page
- [ ] Sign-out button in app header

## Update Log

### 2026-03-06
- Connected to Supabase database and migrated all data from local PostgreSQL
- Designed auth flows (login, sign-up, sign-out, route protection) and finalized design docs
- Created login screen mockup (`mockup-login.html`)
- Installed `@supabase/supabase-js` and `@supabase/ssr`
- Created Supabase client utilities (`src/lib/supabase/client.ts`, `server.ts`, `middleware.ts`)
- Created OAuth callback route handler (`src/app/auth/callback/route.ts`)
- Created route protection proxy (`src/proxy.ts`) — redirects unauthenticated users to `/auth/login`
- Configured `prisma.config.ts` to use direct connection for CLI operations

### 2026-02-25
- Scaffolded auth feature: folder structure, design doc templates, README

## Done
- [x] Create feature scaffold and design doc templates
- [x] Design auth approach (provider selection, session strategy, schema)
- [x] Design login/signup UI flows and mockups
- [x] Connect to Supabase database and migrate data
- [x] Add auth infrastructure (Supabase clients, callback route, route protection proxy)
