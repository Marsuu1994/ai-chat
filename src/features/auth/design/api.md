# Actions & Data Layer

## Principles

- Before adding a new action or endpoint, check if an existing one can be extended to cover the case.
- Keep handlers thin — validate input, call service, return result. No business logic inside handlers.
- One handler per logical operation, not per UI interaction. A single handler can cover multiple related mutations.
- If two flows share the same mutation, they share the same handler. Never duplicate handler logic.
- Use Server Actions for mutations triggered from Server or Client Components. Use API routes when you need webhooks, streaming, or third-party callbacks.

## Route Handlers

### `GET /auth/callback`

Exchanges the Supabase authorization code for a session.

| Field    | Detail                                                        |
|----------|---------------------------------------------------------------|
| Method   | `GET`                                                         |
| Params   | `code` (query string)                                         |
| Logic    | Call `supabase.auth.exchangeCodeForSession(code)`, then redirect to `/` |
| Errors   | Missing or invalid code → redirect to `/auth/login`           |

## Server Actions

No dedicated server actions required — login and sign-out are handled client-side via the Supabase SDK.
