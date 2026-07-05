# Design Document: Frontend Auth Route Protection

## Overview

This bugfix closes a gap in `frontend/src/App.jsx` where four routes — `/`, `/books`, `/books/:id`,
and `/ebooks` — are rendered inside the nested `path="/*"` layout route but are not individually
wrapped in `<PrivateRoute>`. Every other content route already uses `<PrivateRoute>`, so the
pattern, guard component, and auth infrastructure are all in place. The fix is a pure route
configuration change: wrap the four bare `<Route>` elements in `<PrivateRoute>`, identical to
how `/profile`, `/my-books`, and others are already protected.

No new components are introduced. No changes are needed to `PrivateRoute.jsx` or `AuthContext.jsx`.

---

## Architecture

The application uses a two-layer routing structure inside `BrowserRouter`:

```
<Routes>
  <Route path="/login"    element={<Login />} />       ← public
  <Route path="/register" element={<Register />} />    ← public

  <Route path="/*" element={<Navbar + content shell>}>
    <Routes>
      <Route path="/"          element={<Home />} />        ← UNPROTECTED (bug)
      <Route path="/books"     element={<Books />} />       ← UNPROTECTED (bug)
      <Route path="/books/:id" element={<BookDetail />} />  ← UNPROTECTED (bug)
      <Route path="/ebooks"    element={<EBooks />} />      ← UNPROTECTED (bug)

      <Route path="/profile"   element={<PrivateRoute>…} /> ← protected ✓
      <Route path="/my-books"  element={<PrivateRoute>…} /> ← protected ✓
      …
    </Routes>
  </Route>
</Routes>
```

The four unprotected routes sit at the same level as the already-protected routes. Adding
`<PrivateRoute>` as their wrapper brings them into conformance without altering the structural
layout.

---

## Components and Interfaces

### PrivateRoute (no changes)

`frontend/src/components/PrivateRoute.jsx` already implements all needed behavior:

| Prop           | Type       | Purpose                                         |
|----------------|------------|-------------------------------------------------|
| `children`     | ReactNode  | Component to render when access is granted      |
| `allowedRoles` | string[]   | Optional role whitelist; omit for any-auth gate |

Behavior matrix:

| State                                      | Rendered output                        |
|--------------------------------------------|----------------------------------------|
| `loading === true`                         | Bootstrap spinner                      |
| `loading === false`, `user === null`       | `<Navigate to="/login" replace />`     |
| `loading === false`, user present, no role check | `children`                     |
| `loading === false`, user present, role not in `allowedRoles` | `<Navigate to="/" replace />` |

The four new wrappings will use `<PrivateRoute>` **without** `allowedRoles`, meaning any
authenticated user (regardless of role) can access the routes — matching the intended behaviour
for home, catalog, book detail, and e-books.

### AuthContext (no changes)

`frontend/src/context/AuthContext.jsx` provides `user` (null when unauthenticated) and
`loading` (true while the stored token/user is being read from `localStorage` on mount).
`PrivateRoute` consumes these via the `useAuth()` hook. No modifications needed.

### App.jsx (the only changed file)

The four bare routes become:

```jsx
<Route
  path="/"
  element={<PrivateRoute><Home /></PrivateRoute>}
/>
<Route
  path="/books"
  element={<PrivateRoute><Books /></PrivateRoute>}
/>
<Route
  path="/books/:id"
  element={<PrivateRoute><BookDetail /></PrivateRoute>}
/>
<Route
  path="/ebooks"
  element={<PrivateRoute><EBooks /></PrivateRoute>}
/>
```

This is identical in form to the existing `/profile` and `/my-books` patterns:

```jsx
<Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
```

---

## Data Models

No data model changes. The fix operates entirely at the React routing/rendering layer. The only
relevant state is already owned by `AuthContext`:

```ts
// AuthContext state (read-only from this fix's perspective)
user:    object | null   // null = unauthenticated
loading: boolean         // true during initial localStorage read
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a
system — essentially, a formal statement about what the system should do. Properties serve as the
bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Unauthenticated access redirects to login

*For any* of the four newly protected routes (`/`, `/books`, `/books/:id`, `/ebooks`) and *any*
unauthenticated user context (i.e. `user === null`, `loading === false`), rendering the route
SHALL produce a `<Navigate to="/login" />` element rather than the page component.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

---

### Property 2: Authenticated users continue to see protected pages

*For any* authenticated user (any role, `user !== null`, `loading === false`) navigating to `/`,
`/books`, `/books/:id`, or `/ebooks`, the corresponding page component (`Home`, `Books`,
`BookDetail`, `EBooks`) SHALL render without redirect.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

---

### Property 3: Public routes remain accessible to all user states

*For any* user state (authenticated, unauthenticated, or loading) navigating to `/login` or
`/register`, the login or register page component SHALL render without requiring authentication.

**Validates: Requirements 3.5, 3.6**

---

### Property 4: Loading state shows spinner, not page content or redirect

*For any* of the four newly protected routes and *any* user state where `loading === true`,
`PrivateRoute` SHALL render the loading spinner rather than either the page component or a
redirect to `/login`.

**Validates: Requirements 3.10**

---

## Error Handling

This fix introduces no new error conditions. `PrivateRoute` already handles all edge cases:

- **Token present, user null** (e.g. malformed JSON in `localStorage`): `AuthContext` catches
  the parse error, clears storage, sets `user = null`, and `loading = false`. `PrivateRoute`
  redirects to `/login`. No change in behavior.
- **Slow `localStorage` read**: `loading` stays `true` until the `useEffect` in `AuthContext`
  completes; `PrivateRoute` shows the spinner during this window. No change in behavior.
- **Role mismatch** on the four new routes: `allowedRoles` is not passed, so any authenticated
  user is admitted. No role-based redirect will occur on these routes.

---

## Testing Strategy

This fix is a pure route-configuration change to a React component. PBT applies for the core
guard logic because the behavior of `PrivateRoute` is a pure function of `(user, loading, route)`
and the input space (any user object shape, any route path) benefits from randomized coverage.

### Unit / Example Tests

These cover concrete scenarios:

| Scenario | Assertion |
|---|---|
| Unauthenticated user visits `/` | Redirected to `/login` |
| Unauthenticated user visits `/books` | Redirected to `/login` |
| Unauthenticated user visits `/books/42` | Redirected to `/login` |
| Unauthenticated user visits `/ebooks` | Redirected to `/login` |
| Authenticated user (any role) visits `/` | `<Home />` renders |
| Authenticated user visits `/books` | `<Books />` renders |
| Authenticated user visits `/books/42` | `<BookDetail />` renders |
| Authenticated user visits `/ebooks` | `<EBooks />` renders |
| Any user visits `/login` | `<Login />` renders |
| Any user visits `/register` | `<Register />` renders |
| User with `loading=true` visits any protected route | Spinner renders |
| ADMIN visits `/dashboard` | `<Dashboard />` renders (regression) |
| Non-ADMIN visits `/dashboard` | Redirected to `/` (regression) |

### Property-Based Tests

Use a PBT library appropriate for JavaScript/React (e.g., [fast-check](https://github.com/dubzzz/fast-check)) with a minimum of 100 iterations per property.

Each property test renders `PrivateRoute` in isolation using `@testing-library/react` with mocked
`AuthContext`, parameterized by generated inputs.

**Property 1 test** — Feature: frontend-auth-route-protection, Property 1: unauthenticated access redirects to login

Generate: random user-null states (varied `loading=false`, `user=null`); route paths from
`['/', '/books', `/books/${id}`, '/ebooks']` where `id` is a random positive integer or string.
Assert: rendered output contains `Navigate` pointing to `/login`.

**Property 2 test** — Feature: frontend-auth-route-protection, Property 2: authenticated users continue to see protected pages

Generate: random user objects with any valid role; any of the four route paths.
Assert: rendered output does not contain a `Navigate` element; the expected page component is present.

**Property 3 test** — Feature: frontend-auth-route-protection, Property 3: public routes remain accessible

Generate: any user state (null user, authenticated user, loading); render the top-level `<Routes>`
pointing to `/login` or `/register`.
Assert: login/register page renders; no redirect to `/login` from a public route.

**Property 4 test** — Feature: frontend-auth-route-protection, Property 4: loading state shows spinner

Generate: any user state, any protected route; set `loading=true`.
Assert: spinner element is present; neither the page component nor a `Navigate` is rendered.

### Regression Notes

- Existing tests for `/profile`, `/my-books`, `/my-reservations`, `/my-fines`, `/notifications`,
  `/dashboard`, `/reports`, and `/users` must continue to pass without modification.
- The only file changed is `App.jsx`; snapshot tests of `PrivateRoute.jsx` and `AuthContext.jsx`
  should show no diff.
