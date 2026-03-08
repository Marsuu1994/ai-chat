# Key Flows

### Route Protection Flow

**Trigger:** User navigates to any protected route without a valid session

**Mechanism:** Next.js middleware (`middleware.ts`) checks the session. If no valid session exists, redirect to `/auth/login`.

### Login Flow

**Trigger:** User navigates to `/auth/login`

**Steps:**

1. User clicks "Sign in with Google"
2. Browser redirects to Google OAuth consent screen; user completes authentication
3. Google redirects to the Supabase callback URI for token exchange
4. Supabase redirects to `/auth/callback` with an authorization code
5. The app exchanges the code for a session via `supabase.auth.exchangeCodeForSession()`
6. User is redirected to the homepage

### Sign-Up Flow

Same as login — Supabase auto-creates a user record on first Google sign-in.

### Sign-Out Flow

**Trigger:** User clicks the logout button

**Steps:**

1. Call `supabase.auth.signOut()` to end the session
2. Redirect to `/auth/login`

