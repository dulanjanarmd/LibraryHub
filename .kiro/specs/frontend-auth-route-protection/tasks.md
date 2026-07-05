# Implementation Plan: Frontend Auth Route Protection (Bugfix)

## Overview

This plan covers the three-phase bugfix workflow:

1. **Bug exploration** — write a property-based test that confirms the four routes are currently unprotected (test should fail before the fix, pass after).
2. **Apply the fix** — wrap `/`, `/books`, `/books/:id`, and `/ebooks` in `<PrivateRoute>` inside `App.jsx`.
3. **Verification** — write PBT and unit tests confirming all four correctness properties hold after the fix and that no existing protected routes regressed.

The only production file changed is `frontend/src/App.jsx`. All test files are new.

---

## Tasks

- [x] 1. Set up the test infrastructure
  - Install Vitest, jsdom, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, and `fast-check` as dev dependencies
  - Add a `vitest.config.js` (or extend `vite.config.js`) with `environment: 'jsdom'` and `setupFiles` pointing to a test setup file
  - Create `frontend/src/setupTests.js` that imports `@testing-library/jest-dom`
  - Add a `"test"` script to `package.json`: `"vitest --run"`
  - _Requirements: prerequisite for all test tasks_

- [x] 2. Write the bug condition exploration test (confirms bug exists BEFORE the fix)
  - [x] 2.1 Write PBT exploration test for unprotected routes
    - Create `frontend/src/tests/bugExploration.test.jsx`
    - Mock `AuthContext` so `user = null` and `loading = false`
    - Use `fast-check` to generate paths from `['/', '/books', '/books/${id}', '/ebooks']` (where `id` is an arbitrary positive integer)
    - For each generated path, render the full `<App />` (or the inner `<Routes>`) with `MemoryRouter` initialised to that path
    - Assert that the rendered output does **not** contain a `<Navigate to="/login">` element (i.e. the page content is visible) — this assertion captures the bug
    - This test is expected to **pass** before the fix and **fail** after the fix
    - **Property: Bug condition — unauthenticated user can reach protected content**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**

- [x] 3. Apply the fix to App.jsx
  - [x] 3.1 Wrap the four unprotected routes in `<PrivateRoute>`
    - In `frontend/src/App.jsx`, change the four bare `<Route>` elements:
      - `<Route path="/" element={<Home />} />` → `<Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />`
      - `<Route path="/books" element={<Books />} />` → `<Route path="/books" element={<PrivateRoute><Books /></PrivateRoute>} />`
      - `<Route path="/books/:id" element={<BookDetail />} />` → `<Route path="/books/:id" element={<PrivateRoute><BookDetail /></PrivateRoute>} />`
      - `<Route path="/ebooks" element={<EBooks />} />` → `<Route path="/ebooks" element={<PrivateRoute><EBooks /></PrivateRoute>} />`
    - No other changes to `App.jsx`; `PrivateRoute.jsx` and `AuthContext.jsx` are untouched
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 4. Checkpoint — verify bug exploration test now fails
  - Run `npm test -- --run` in `frontend/` and confirm `bugExploration.test.jsx` now **fails** (the bug is gone)
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Write property-based verification tests (post-fix)
  - [x] 5.1 Write property test for Property 1 — unauthenticated access redirects to login
    - Create `frontend/src/tests/routeProtection.property.test.jsx`
    - Mock `AuthContext` with `user = null`, `loading = false`
    - Use `fast-check` to generate paths from `['/', '/books', '/books/${bookId}', '/ebooks']`
    - Render with `MemoryRouter` initialised to the generated path
    - Assert rendered output contains a `Navigate` element pointing to `/login`
    - Minimum 100 iterations
    - **Property 1: Unauthenticated access redirects to login**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

  - [x] 5.2 Write property test for Property 2 — authenticated users see page content
    - In the same `routeProtection.property.test.jsx` file
    - Use `fast-check` to generate arbitrary user objects (`{ id, username, role }`) with `loading = false`
    - For each of the four routes, render with the generated authenticated user
    - Assert rendered output does NOT contain a `Navigate` element; assert the expected page component title or key element is present
    - Minimum 100 iterations
    - **Property 2: Authenticated users continue to see protected pages**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**

  - [x] 5.3 Write property test for Property 3 — public routes remain accessible
    - In the same `routeProtection.property.test.jsx` file
    - Use `fast-check` to generate any user state (null user, authenticated user) and `loading` value
    - For paths `/login` and `/register`, render the full app
    - Assert the login or register page renders without being redirected
    - Minimum 100 iterations
    - **Property 3: Public routes remain accessible to all user states**
    - **Validates: Requirements 3.5, 3.6**

  - [x] 5.4 Write property test for Property 4 — loading state shows spinner
    - In the same `routeProtection.property.test.jsx` file
    - Use `fast-check` to generate any of the four protected route paths and any user state, with `loading = true`
    - Assert the spinner element is present (element with `role="status"`)
    - Assert neither a `Navigate` element nor the page component content is rendered
    - Minimum 100 iterations
    - **Property 4: Loading state shows spinner, not page content or redirect**
    - **Validates: Requirements 3.10**

- [x] 6. Write unit / example-based verification tests (post-fix)
  - [x] 6.1 Write unit tests for the four newly-protected routes (unauthenticated)
    - Create `frontend/src/tests/routeProtection.unit.test.jsx`
    - For each of `/`, `/books`, `/books/42`, `/ebooks`: render with `user = null, loading = false`
    - Assert redirect to `/login`
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 6.2 Write unit tests for the four routes with an authenticated user
    - In the same `routeProtection.unit.test.jsx` file
    - For each of `/`, `/books`, `/books/42`, `/ebooks`: render with a valid user object
    - Assert the expected page component is rendered without a redirect
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [x] 6.3 Write unit tests for public routes
    - In the same `routeProtection.unit.test.jsx` file
    - Render `/login` and `/register` for unauthenticated, authenticated, and loading states
    - Assert the respective page renders in all cases
    - _Requirements: 3.5, 3.6_

  - [x] 6.4 Write regression tests for existing protected routes
    - In the same `routeProtection.unit.test.jsx` file
    - `/dashboard` and `/reports` with `ADMIN` role → renders page
    - `/dashboard` and `/reports` with `MEMBER` role → redirects to `/`
    - `/users` with `ADMIN` role → renders page
    - `/users` with `LIBRARIAN` role → redirects to `/`
    - `/profile`, `/my-books` with authenticated user → renders page
    - _Requirements: 3.7, 3.8, 3.9_

  - [x] 6.5 Write unit test for loading spinner behavior
    - In the same `routeProtection.unit.test.jsx` file
    - For each of the four newly-protected routes with `loading = true`
    - Assert spinner (`role="status"`) is rendered; assert no redirect and no page content
    - _Requirements: 3.10_

- [x] 7. Final checkpoint — all tests green
  - Run `npm test -- --run` in `frontend/` and confirm all tests pass
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Task 2.1 (bug exploration) is intentionally written to pass before the fix and fail after; it documents the pre-fix state
- The test setup in Task 1 is required before any test tasks can run
- `PrivateRoute.jsx` and `AuthContext.jsx` must not be modified; mock `AuthContext` via `vi.mock` in tests
- All PBT tasks use `fast-check` with a minimum of 100 iterations per property
- Each PBT task references a numbered property from `design.md`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["3.1"] },
    { "id": 3, "tasks": ["5.1", "5.2", "5.3", "5.4", "6.1", "6.2", "6.3", "6.4", "6.5"] }
  ]
}
```
