# Lisa Loops — Lessons learned

> This file is read before every test run and updated after. It accumulates practical knowledge about testing this specific app. Lisa never makes the same mistake twice.

## App-specific quirks

- **Mock data resets on refresh**: All bookings, notifications, and user data are in-memory (MockDataContext). Created bookings vanish on page reload. Test assertions about created bookings must happen within the same session — never refresh between create and verify.
- **Demo accounts auto-signup**: The demo login buttons (Employee/Admin) attempt sign-in first, and if the account doesn't exist, they auto-register. First click may be slower than subsequent logins.
- **DemoRoleContext mapping**: Even with real auth, the app maps authenticated users to mock data IDs (e.g., `u-001` for employees). The lisa-test-* accounts may not have matching mock user IDs, so test accounts may see different mock data than the demo accounts.
- **Konva canvas not in DOM**: The floor map uses react-konva (HTML5 Canvas). Individual desk/room elements cannot be found via DOM selectors. Tests needing to select a specific desk must use canvas click coordinates or avoid the canvas entirely by testing the wizard flow only up to step 2.

## Timing & loading

- **Simulated loading delays**: Every page uses `useSimulatedLoading(400-500ms)` with skeleton components. Wait at least 600ms after navigation before asserting page content.
- **Framer Motion page transitions**: Page transitions use framer-motion with 200ms duration. Wait for animation completion before interacting with new page content.
- **Auth state loading**: After login, the AuthContext fetches profile and role data from Supabase. Allow up to 5 seconds for the dashboard to appear after submitting login credentials.
- **Form fill with natural_language mode unreliable**: The first natural_language fill attempt on login form fields may not persist. Use structured mode with explicit xpath selectors for fill operations on the login form. Always fill both fields and submit in quick succession.
- **Booking wizard step transitions**: Step changes in the wizard animate with 200ms framer-motion transitions. Wait for animation to settle before clicking next step buttons.

## Selectors & DOM notes

- **Page containers**: Every page has `data-testid="page-{name}"` — use these to verify navigation completed.
- **Sidebar nav links**: Follow pattern `data-testid="nav-{label-kebab}"` for user items, `data-testid="nav-admin-{label-kebab}"` for admin items.
- **Radix portals**: Dialogs, popovers, selects, and sheets render in Radix portals appended to document.body. Query from `document.body`, not from a parent component container.
- **Alert dialogs**: Cancel booking dialog uses `data-testid="cancel-booking-dialog"` with confirm button `data-testid="confirm-cancel-booking"`.
- **Booking cards**: Each card has `data-testid="booking-card-{booking.id}"`.

- **Browser tool inherits preview session**: The browser automation shares the Supabase auth session from the preview iframe. For "Not logged in" preconditions, sign out first before running the test. Use the sign-out button (data-testid='sign-out-button') or navigate to /login after signing out.

## Common failure patterns

- **navigate_to_sandbox resets auth but preserves session on second load**: When navigating to /app/* paths via navigate_to_sandbox, the first screenshot may show "Loading..." because the auth session from the demo login survives the navigation but takes time to hydrate. Wait ~8 seconds or take a second screenshot.
- **Demo Admin button may fail with weak password error**: The demo admin account (alex.admin@deskflow.io / demo1234) can fail signup with "Password is known to be weak". Use the test admin account (lisa-test-admin@test.com) instead for admin tests.
- **Use test accounts for admin login**: Always use lisa-test-admin@test.com / LisaLoops-Test-2024! for admin tests. Fill email and password fields manually, then click Sign in.

## Fix patterns

_None yet — will be populated when bugs are found and fixed._
