/**
 * Property-Based Verification Tests: Route Protection
 *
 * Tests for correctness properties after the PrivateRoute fix.
 * Uses fast-check with a minimum of 100 iterations per property.
 *
 * Validates: Requirements 3.10 (Property 4)
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as fc from 'fast-check';

// ---------------------------------------------------------------------------
// Mock page components with unique data-testid attributes
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

// Mock Navbar to avoid auth-dependent rendering
vi.mock('../components/Navbar', () => ({
  default: () => <nav data-testid="navbar">Navbar</nav>,
}));

// ---------------------------------------------------------------------------
// Module-level variable to control the BrowserRouter → MemoryRouter initial path
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
// Mock AuthContext — controlled per describe/test block via currentAuthState
// ---------------------------------------------------------------------------
let currentAuthState = { user: null, loading: false };

vi.mock('../context/AuthContext', () => ({
  useAuth: () => currentAuthState,
  AuthProvider: ({ children }) => <>{children}</>,
}));

// Import App AFTER all mocks
import App from '../App';

// ---------------------------------------------------------------------------
// Property 4: Loading state shows spinner, not page content or redirect
// Validates: Requirements 3.10
// ---------------------------------------------------------------------------
describe('Property 4: Loading state shows spinner, not page content or redirect', () => {
  beforeEach(() => {
    currentInitialEntries = ['/'];
    currentAuthState = { user: null, loading: true };
  });

  it(
    /**
     * **Validates: Requirements 3.10**
     *
     * For any of the four protected route paths and any user state (null or
     * user object), with loading=true, PrivateRoute SHALL render the Bootstrap
     * spinner (role="status") and SHALL NOT render page content or a redirect.
     */
    'Property 4: for any protected path with loading=true, spinner is shown — no page or redirect',
    async () => {
      // Generator for arbitrary user state: null or a user object
      const userArb = fc.oneof(
        fc.constant(null),
        fc.record({
          id: fc.integer({ min: 1, max: 100000 }),
          username: fc.string({ minLength: 1, maxLength: 30 }),
          email: fc.string({ minLength: 3, maxLength: 50 }),
          role: fc.oneof(
            fc.constant('STUDENT'),
            fc.constant('FACULTY'),
            fc.constant('LIBRARIAN'),
            fc.constant('ADMIN'),
          ),
        }),
      );

      // Generator for protected route paths
      const pathArb = fc.integer({ min: 1, max: 100000 }).chain((bookId) =>
        fc.oneof(
          fc.constant('/'),
          fc.constant('/books'),
          fc.constant(`/books/${bookId}`),
          fc.constant('/ebooks'),
        ),
      );

      await fc.assert(
        fc.asyncProperty(pathArb, userArb, async (path, user) => {
          // Set loading=true with the generated user state
          currentAuthState = { user, loading: true };
          currentInitialEntries = [path];

          const { unmount, container } = render(<App />);

          try {
            // Assert: Bootstrap spinner with role="status" IS present
            const spinner = container.querySelector('[role="status"]');
            expect(spinner).not.toBeNull();

            // Assert: no page component content is rendered
            const pageTestIds = [
              'page-home',
              'page-books',
              'page-book-detail',
              'page-ebooks',
            ];
            for (const testId of pageTestIds) {
              const pageEl = container.querySelector(`[data-testid="${testId}"]`);
              expect(pageEl).toBeNull();
            }

            // Assert: no redirect to login page
            const loginPage = container.querySelector('[data-testid="page-login"]');
            expect(loginPage).toBeNull();
          } finally {
            unmount();
          }
        }),
        { numRuns: 100, verbose: true },
      );
    },
  );
});

// ---------------------------------------------------------------------------
// Property 1: Unauthenticated access redirects to login
// Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5
// ---------------------------------------------------------------------------
describe('Property 1: Unauthenticated access redirects to login', () => {
  beforeEach(() => {
    currentAuthState = { user: null, loading: false };
  });

  it(
    /**
     * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**
     *
     * For any of the four protected route paths (/, /books, /books/:id, /ebooks)
     * with user=null and loading=false, PrivateRoute SHALL redirect to /login
     * and SHALL NOT render the protected page content.
     */
    'Property 1: for any protected path with unauthenticated user, login page is shown',
    async () => {
      // Map each path to the testid of its page component
      const pathToTestId = {
        '/': 'page-home',
        '/books': 'page-books',
        '/ebooks': 'page-ebooks',
      };

      // Generator for protected route paths (including dynamic /books/:id)
      const pathArb = fc.integer({ min: 1, max: 100000 }).chain((bookId) =>
        fc.oneof(
          fc.constant('/'),
          fc.constant('/books'),
          fc.constant(`/books/${bookId}`),
          fc.constant('/ebooks'),
        ),
      );

      await fc.assert(
        fc.asyncProperty(pathArb, async (path) => {
          currentInitialEntries = [path];

          const { unmount, container } = render(<App />);

          try {
            // Assert: login page IS present (redirect happened)
            const loginPage = container.querySelector('[data-testid="page-login"]');
            expect(loginPage).not.toBeNull();

            // Assert: the expected page content testid is NOT present
            // For static paths, check their specific testid
            const expectedTestId = pathToTestId[path];
            if (expectedTestId) {
              const pageEl = container.querySelector(`[data-testid="${expectedTestId}"]`);
              expect(pageEl).toBeNull();
            } else {
              // /books/:id — check page-book-detail is not present
              const pageEl = container.querySelector('[data-testid="page-book-detail"]');
              expect(pageEl).toBeNull();
            }
          } finally {
            unmount();
          }
        }),
        { numRuns: 100, verbose: true },
      );
    },
  );
});

// ---------------------------------------------------------------------------
// Property 2: Authenticated users see page content
// Validates: Requirements 3.1, 3.2, 3.3, 3.4
// ---------------------------------------------------------------------------
describe('Property 2: Authenticated users see page content', () => {
  beforeEach(() => {
    currentInitialEntries = ['/'];
  });

  it(
    /**
     * **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
     *
     * For any authenticated user (any role, user !== null, loading === false)
     * navigating to /, /books, /books/:id, or /ebooks, the corresponding page
     * component SHALL render without redirect.
     */
    'Property 2: for any authenticated user and any protected path, page content is rendered',
    async () => {
      // Generator for user objects with any valid role
      const userArb = fc.record({
        id: fc.integer({ min: 1, max: 100000 }),
        username: fc.string({ minLength: 1, maxLength: 30 }),
        role: fc.oneof(
          fc.constant('STUDENT'),
          fc.constant('FACULTY'),
          fc.constant('LIBRARIAN'),
          fc.constant('ADMIN'),
        ),
      });

      // Routes to test and their corresponding testids
      const routes = [
        { path: '/', testId: 'page-home' },
        { path: '/books', testId: 'page-books' },
        { path: '/ebooks', testId: 'page-ebooks' },
      ];

      await fc.assert(
        fc.asyncProperty(
          userArb,
          fc.integer({ min: 1, max: 100000 }),
          async (user, bookId) => {
            const allRoutes = [
              ...routes,
              { path: `/books/${bookId}`, testId: 'page-book-detail' },
            ];

            for (const { path, testId } of allRoutes) {
              currentAuthState = { user, loading: false };
              currentInitialEntries = [path];

              const { unmount, container } = render(<App />);

              try {
                // Assert: expected page content IS rendered
                const pageEl = container.querySelector(`[data-testid="${testId}"]`);
                expect(pageEl).not.toBeNull();

                // Assert: login page is NOT present
                const loginPage = container.querySelector('[data-testid="page-login"]');
                expect(loginPage).toBeNull();
              } finally {
                unmount();
              }
            }
          },
        ),
        { numRuns: 100, verbose: true },
      );
    },
  );
});

// ---------------------------------------------------------------------------
// Property 3: Public routes remain accessible to all user states
// Validates: Requirements 3.5, 3.6
// ---------------------------------------------------------------------------
describe('Property 3: Public routes remain accessible to all user states', () => {
  it(
    /**
     * **Validates: Requirements 3.5, 3.6**
     *
     * For any user state (authenticated, unauthenticated, or loading) navigating
     * to /login or /register, the login or register page component SHALL render
     * without requiring authentication.
     */
    'Property 3: for any user state, public routes /login and /register are always accessible',
    async () => {
      // Generator for any user state: null or a user object
      const userArb = fc.oneof(
        fc.constant(null),
        fc.record({
          id: fc.integer({ min: 1, max: 100000 }),
          username: fc.string({ minLength: 1, maxLength: 30 }),
          role: fc.oneof(
            fc.constant('STUDENT'),
            fc.constant('FACULTY'),
            fc.constant('LIBRARIAN'),
            fc.constant('ADMIN'),
          ),
        }),
      );

      // Generator for any loading boolean
      const loadingArb = fc.boolean();

      await fc.assert(
        fc.asyncProperty(userArb, loadingArb, async (user, loading) => {
          currentAuthState = { user, loading };

          // Test /login route
          currentInitialEntries = ['/login'];
          const { unmount: unmountLogin, container: containerLogin } = render(<App />);
          try {
            const loginPage = containerLogin.querySelector('[data-testid="page-login"]');
            expect(loginPage).not.toBeNull();
          } finally {
            unmountLogin();
          }

          // Test /register route
          currentInitialEntries = ['/register'];
          const { unmount: unmountRegister, container: containerRegister } = render(<App />);
          try {
            const registerPage = containerRegister.querySelector('[data-testid="page-register"]');
            expect(registerPage).not.toBeNull();
          } finally {
            unmountRegister();
          }
        }),
        { numRuns: 100, verbose: true },
      );
    },
  );
});
