/**
 * Bug Condition Exploration Test
 *
 * Property: Bug condition — unauthenticated user can reach protected content
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5
 *
 * This test documents the CURRENT BUGGY BEHAVIOR:
 *   - Before the fix: test PASSES (bug exists — unauthed users see page content)
 *   - After the fix:  test FAILS  (bug is gone — unauthed users get redirected)
 *
 * The assertion is: for an unauthenticated user, these pages render their content
 * (i.e. there is NO <Navigate to="/login"> redirect).  This is true now (bug) and
 * will become false once the four routes are wrapped in <PrivateRoute>.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as fc from 'fast-check';

// ---------------------------------------------------------------------------
// Mock AuthContext so user = null, loading = false (unauthenticated state)
// ---------------------------------------------------------------------------
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: null, loading: false }),
  AuthProvider: ({ children }) => <>{children}</>,
}));

// ---------------------------------------------------------------------------
// Mock BrowserRouter → MemoryRouter so we can control the initial path.
// App wraps everything in <BrowserRouter>; we replace it with a version that
// accepts initialEntries injected via a module-level variable.
// ---------------------------------------------------------------------------
let currentInitialEntries = ['/'];

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    BrowserRouter: ({ children }) => (
      <actual.MemoryRouter initialEntries={currentInitialEntries}>
        {children}
      </actual.MemoryRouter>
    ),
  };
});

// ---------------------------------------------------------------------------
// Mock all page components to avoid real API calls.
// Each mock renders a unique, identifiable data-testid so we can confirm the
// page content is actually showing (not a redirect to login).
// ---------------------------------------------------------------------------
vi.mock('../pages/Home', () => ({
  default: () => <div data-testid="page-home">Home Page</div>,
}));
vi.mock('../pages/Books', () => ({
  default: () => <div data-testid="page-books">Books Page</div>,
}));
vi.mock('../pages/BookDetail', () => ({
  default: () => <div data-testid="page-book-detail">Book Detail Page</div>,
}));
vi.mock('../pages/EBooks', () => ({
  default: () => <div data-testid="page-ebooks">EBooks Page</div>,
}));
vi.mock('../pages/Login', () => ({
  default: () => <div data-testid="page-login">Login Page</div>,
}));
vi.mock('../pages/Register', () => ({
  default: () => <div data-testid="page-register">Register Page</div>,
}));
vi.mock('../pages/Dashboard', () => ({
  default: () => <div data-testid="page-dashboard">Dashboard Page</div>,
}));
vi.mock('../pages/MyBooks', () => ({
  default: () => <div data-testid="page-my-books">My Books Page</div>,
}));
vi.mock('../pages/MyReservations', () => ({
  default: () => <div data-testid="page-my-reservations">My Reservations Page</div>,
}));
vi.mock('../pages/MyFines', () => ({
  default: () => <div data-testid="page-my-fines">My Fines Page</div>,
}));
vi.mock('../pages/Profile', () => ({
  default: () => <div data-testid="page-profile">Profile Page</div>,
}));
vi.mock('../pages/Notifications', () => ({
  default: () => <div data-testid="page-notifications">Notifications Page</div>,
}));
vi.mock('../pages/Reports', () => ({
  default: () => <div data-testid="page-reports">Reports Page</div>,
}));
vi.mock('../pages/Users', () => ({
  default: () => <div data-testid="page-users">Users Page</div>,
}));
vi.mock('../pages/NotFound', () => ({
  default: () => <div data-testid="page-not-found">Not Found</div>,
}));

// Mock the Navbar to avoid auth-dependent rendering
vi.mock('../components/Navbar', () => ({
  default: () => <nav data-testid="navbar">Navbar</nav>,
}));

// ---------------------------------------------------------------------------
// Import App AFTER all mocks are set up
// ---------------------------------------------------------------------------
import App from '../App';

// ---------------------------------------------------------------------------
// Helper: map a path to the data-testid of the expected page component
// ---------------------------------------------------------------------------
function expectedTestIdForPath(path) {
  if (path === '/') return 'page-home';
  if (path === '/books') return 'page-books';
  if (path.startsWith('/books/')) return 'page-book-detail';
  if (path === '/ebooks') return 'page-ebooks';
  return null;
}

// ---------------------------------------------------------------------------
// Property-Based Test
// ---------------------------------------------------------------------------
describe('Bug Exploration: unauthenticated users can reach protected content (BUG EXISTS)', () => {
  beforeEach(() => {
    // Reset to a safe default before each test
    currentInitialEntries = ['/'];
  });

  it(
    'Property: Bug condition — for every protected path, an unauthenticated user sees page content (no redirect to /login)',
    async () => {
      /**
       * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5
       *
       * Generator: paths chosen from the four unprotected routes.
       * `id` is a positive integer used in `/books/:id` paths.
       *
       * Assertion (captures the bug):
       *   The rendered output contains the page component content — NOT a login redirect.
       *   Before the fix this assertion holds (bug confirmed).
       *   After wrapping in <PrivateRoute> this assertion will FAIL (bug fixed).
       */
      await fc.assert(
        fc.asyncProperty(
          // Generate an arbitrary positive integer book id
          fc.integer({ min: 1, max: 100000 }),
          // Pick one of the four unprotected route paths
          fc.integer({ min: 0, max: 3 }),
          async (bookId, routeIndex) => {
            const paths = ['/', '/books', `/books/${bookId}`, '/ebooks'];
            const path = paths[routeIndex];

            // Set the MemoryRouter's initial location to the generated path
            currentInitialEntries = [path];

            const { unmount, container } = render(<App />);

            try {
              // The page content element should be present (bug: unprotected route renders)
              const expectedTestId = expectedTestIdForPath(path);
              const pageContent = container.querySelector(`[data-testid="${expectedTestId}"]`);

              // BUG ASSERTION: page content IS visible to unauthenticated user
              expect(pageContent).not.toBeNull();

              // INVERSE CHECK: login page should NOT be the redirect target
              // (i.e. we should not have been sent to /login)
              const loginPage = container.querySelector('[data-testid="page-login"]');
              expect(loginPage).toBeNull();
            } finally {
              unmount();
            }
          },
        ),
        { numRuns: 100, verbose: true },
      );
    },
  );
});
