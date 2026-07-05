/**
 * Unit Tests: Route Protection for Newly-Protected Routes
 *
 * Covers tasks 6.1 – 6.5:
 *   6.1 Unauthenticated access (Requirements 2.1–2.4)
 *   6.2 Authenticated users see protected pages (Requirements 3.1–3.4)
 *   6.3 Public routes remain accessible (Requirements 3.5–3.6)
 *   6.4 Regression: existing protected routes (Requirements 3.7–3.9)
 *   6.5 Loading spinner on newly-protected routes (Requirement 3.10)
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// ---------------------------------------------------------------------------
// Mutable auth state — each describe block sets this before rendering.
// ---------------------------------------------------------------------------
let currentAuthState = { user: null, loading: false };

vi.mock('../context/AuthContext', () => ({
  useAuth: () => currentAuthState,
  AuthProvider: ({ children }) => <>{children}</>,
}));

// ---------------------------------------------------------------------------
// Mock BrowserRouter → MemoryRouter so we can control the initial path.
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
// Mock all page components with unique data-testid attributes
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

// ===========================================================================
// Task 6.1 — Unauthenticated user is redirected to /login
// Validates: Requirements 2.1, 2.2, 2.3, 2.4
// ===========================================================================
describe('Route Protection: unauthenticated user is redirected to /login', () => {
  beforeEach(() => {
    currentAuthState = { user: null, loading: false };
    currentInitialEntries = ['/'];
  });

  it('Requirement 2.1: unauthenticated user visiting "/" sees login page, not Home', () => {
    currentInitialEntries = ['/'];
    const { container } = render(<App />);

    const loginPage = container.querySelector('[data-testid="page-login"]');
    expect(loginPage).not.toBeNull();

    const homePage = container.querySelector('[data-testid="page-home"]');
    expect(homePage).toBeNull();
  });

  it('Requirement 2.2: unauthenticated user visiting "/books" sees login page, not Books', () => {
    currentInitialEntries = ['/books'];
    const { container } = render(<App />);

    const loginPage = container.querySelector('[data-testid="page-login"]');
    expect(loginPage).not.toBeNull();

    const booksPage = container.querySelector('[data-testid="page-books"]');
    expect(booksPage).toBeNull();
  });

  it('Requirement 2.3: unauthenticated user visiting "/books/42" sees login page, not BookDetail', () => {
    currentInitialEntries = ['/books/42'];
    const { container } = render(<App />);

    const loginPage = container.querySelector('[data-testid="page-login"]');
    expect(loginPage).not.toBeNull();

    const bookDetailPage = container.querySelector('[data-testid="page-book-detail"]');
    expect(bookDetailPage).toBeNull();
  });

  it('Requirement 2.4: unauthenticated user visiting "/ebooks" sees login page, not EBooks', () => {
    currentInitialEntries = ['/ebooks'];
    const { container } = render(<App />);

    const loginPage = container.querySelector('[data-testid="page-login"]');
    expect(loginPage).not.toBeNull();

    const ebooksPage = container.querySelector('[data-testid="page-ebooks"]');
    expect(ebooksPage).toBeNull();
  });
});

// ===========================================================================
// Task 6.2 — Authenticated users see the four newly-protected routes
// Validates: Requirements 3.1, 3.2, 3.3, 3.4
// ===========================================================================
describe('Route Protection: authenticated user sees protected pages', () => {
  const authenticatedUser = { id: 1, username: 'testuser', role: 'STUDENT' };

  beforeEach(() => {
    currentAuthState = { user: authenticatedUser, loading: false };
  });

  it('Requirement 3.1: authenticated user visiting "/" sees Home page, not login', () => {
    currentInitialEntries = ['/'];
    const { container } = render(<App />);

    const homePage = container.querySelector('[data-testid="page-home"]');
    expect(homePage).not.toBeNull();

    const loginPage = container.querySelector('[data-testid="page-login"]');
    expect(loginPage).toBeNull();
  });

  it('Requirement 3.2: authenticated user visiting "/books" sees Books page, not login', () => {
    currentInitialEntries = ['/books'];
    const { container } = render(<App />);

    const booksPage = container.querySelector('[data-testid="page-books"]');
    expect(booksPage).not.toBeNull();

    const loginPage = container.querySelector('[data-testid="page-login"]');
    expect(loginPage).toBeNull();
  });

  it('Requirement 3.3: authenticated user visiting "/books/42" sees BookDetail page, not login', () => {
    currentInitialEntries = ['/books/42'];
    const { container } = render(<App />);

    const bookDetailPage = container.querySelector('[data-testid="page-book-detail"]');
    expect(bookDetailPage).not.toBeNull();

    const loginPage = container.querySelector('[data-testid="page-login"]');
    expect(loginPage).toBeNull();
  });

  it('Requirement 3.4: authenticated user visiting "/ebooks" sees EBooks page, not login', () => {
    currentInitialEntries = ['/ebooks'];
    const { container } = render(<App />);

    const ebooksPage = container.querySelector('[data-testid="page-ebooks"]');
    expect(ebooksPage).not.toBeNull();

    const loginPage = container.querySelector('[data-testid="page-login"]');
    expect(loginPage).toBeNull();
  });
});

// ===========================================================================
// Task 6.3 — Public routes render for all user states
// Validates: Requirements 3.5, 3.6
// ===========================================================================
describe('Public routes: /login and /register are accessible regardless of auth state', () => {
  it('Requirement 3.5: /login renders for unauthenticated user', () => {
    currentAuthState = { user: null, loading: false };
    currentInitialEntries = ['/login'];
    const { container } = render(<App />);

    const loginPage = container.querySelector('[data-testid="page-login"]');
    expect(loginPage).not.toBeNull();
  });

  it('Requirement 3.5: /login renders for authenticated user', () => {
    currentAuthState = { user: { id: 1, username: 'testuser', role: 'STUDENT' }, loading: false };
    currentInitialEntries = ['/login'];
    const { container } = render(<App />);

    const loginPage = container.querySelector('[data-testid="page-login"]');
    expect(loginPage).not.toBeNull();
  });

  it('Requirement 3.6: /register renders for unauthenticated user', () => {
    currentAuthState = { user: null, loading: false };
    currentInitialEntries = ['/register'];
    const { container } = render(<App />);

    const registerPage = container.querySelector('[data-testid="page-register"]');
    expect(registerPage).not.toBeNull();
  });

  it('Requirement 3.6: /register renders for authenticated user', () => {
    currentAuthState = { user: { id: 1, username: 'testuser', role: 'STUDENT' }, loading: false };
    currentInitialEntries = ['/register'];
    const { container } = render(<App />);

    const registerPage = container.querySelector('[data-testid="page-register"]');
    expect(registerPage).not.toBeNull();
  });
});

// ===========================================================================
// Task 6.4 — Regression: existing protected routes
// Validates: Requirements 3.7, 3.8, 3.9
// ===========================================================================
describe('Regression: existing protected routes still enforce access correctly', () => {
  // /dashboard — accessible by ADMIN and LIBRARIAN, not STUDENT
  it('Requirement 3.7: ADMIN visiting /dashboard sees Dashboard page', () => {
    currentAuthState = { user: { id: 1, username: 'admin', role: 'ADMIN' }, loading: false };
    currentInitialEntries = ['/dashboard'];
    const { container } = render(<App />);

    const dashboardPage = container.querySelector('[data-testid="page-dashboard"]');
    expect(dashboardPage).not.toBeNull();
  });

  it('Requirement 3.7: LIBRARIAN visiting /dashboard sees Dashboard page', () => {
    currentAuthState = { user: { id: 2, username: 'librarian', role: 'LIBRARIAN' }, loading: false };
    currentInitialEntries = ['/dashboard'];
    const { container } = render(<App />);

    const dashboardPage = container.querySelector('[data-testid="page-dashboard"]');
    expect(dashboardPage).not.toBeNull();
  });

  it('Requirement 3.7: STUDENT visiting /dashboard is redirected (not dashboard)', () => {
    currentAuthState = { user: { id: 3, username: 'student', role: 'STUDENT' }, loading: false };
    currentInitialEntries = ['/dashboard'];
    const { container } = render(<App />);

    const dashboardPage = container.querySelector('[data-testid="page-dashboard"]');
    expect(dashboardPage).toBeNull();

    // STUDENT gets redirected to / (Home), which PrivateRoute wraps but STUDENT can access
    const homePage = container.querySelector('[data-testid="page-home"]');
    expect(homePage).not.toBeNull();
  });

  // /reports — accessible by ADMIN and LIBRARIAN, not STUDENT
  it('Requirement 3.8: ADMIN visiting /reports sees Reports page', () => {
    currentAuthState = { user: { id: 1, username: 'admin', role: 'ADMIN' }, loading: false };
    currentInitialEntries = ['/reports'];
    const { container } = render(<App />);

    const reportsPage = container.querySelector('[data-testid="page-reports"]');
    expect(reportsPage).not.toBeNull();
  });

  it('Requirement 3.8: STUDENT visiting /reports is redirected (not reports)', () => {
    currentAuthState = { user: { id: 3, username: 'student', role: 'STUDENT' }, loading: false };
    currentInitialEntries = ['/reports'];
    const { container } = render(<App />);

    const reportsPage = container.querySelector('[data-testid="page-reports"]');
    expect(reportsPage).toBeNull();
  });

  // /users — accessible by ADMIN only
  it('Requirement 3.9: ADMIN visiting /users sees Users page', () => {
    currentAuthState = { user: { id: 1, username: 'admin', role: 'ADMIN' }, loading: false };
    currentInitialEntries = ['/users'];
    const { container } = render(<App />);

    const usersPage = container.querySelector('[data-testid="page-users"]');
    expect(usersPage).not.toBeNull();
  });

  it('Requirement 3.9: LIBRARIAN visiting /users is redirected (not users)', () => {
    currentAuthState = { user: { id: 2, username: 'librarian', role: 'LIBRARIAN' }, loading: false };
    currentInitialEntries = ['/users'];
    const { container } = render(<App />);

    const usersPage = container.querySelector('[data-testid="page-users"]');
    expect(usersPage).toBeNull();
  });

  // /profile — any authenticated user
  it('Requirement 3.9: authenticated user visiting /profile sees Profile page', () => {
    currentAuthState = { user: { id: 1, username: 'testuser', role: 'STUDENT' }, loading: false };
    currentInitialEntries = ['/profile'];
    const { container } = render(<App />);

    const profilePage = container.querySelector('[data-testid="page-profile"]');
    expect(profilePage).not.toBeNull();
  });

  // /my-books — any authenticated user
  it('Requirement 3.9: authenticated user visiting /my-books sees My Books page', () => {
    currentAuthState = { user: { id: 1, username: 'testuser', role: 'STUDENT' }, loading: false };
    currentInitialEntries = ['/my-books'];
    const { container } = render(<App />);

    const myBooksPage = container.querySelector('[data-testid="page-my-books"]');
    expect(myBooksPage).not.toBeNull();
  });
});

// ===========================================================================
// Task 6.5 — Loading spinner for the four newly-protected routes
// Validates: Requirement 3.10
// ===========================================================================
describe('Route Protection: loading state shows spinner, not page content or login', () => {
  beforeEach(() => {
    currentAuthState = { user: null, loading: true };
  });

  it('Requirement 3.10: loading=true on "/" shows spinner, not Home or Login', () => {
    currentInitialEntries = ['/'];
    const { container } = render(<App />);

    const spinner = container.querySelector('[role="status"]');
    expect(spinner).not.toBeNull();

    const homePage = container.querySelector('[data-testid="page-home"]');
    expect(homePage).toBeNull();

    const loginPage = container.querySelector('[data-testid="page-login"]');
    expect(loginPage).toBeNull();
  });

  it('Requirement 3.10: loading=true on "/books" shows spinner, not Books or Login', () => {
    currentInitialEntries = ['/books'];
    const { container } = render(<App />);

    const spinner = container.querySelector('[role="status"]');
    expect(spinner).not.toBeNull();

    const booksPage = container.querySelector('[data-testid="page-books"]');
    expect(booksPage).toBeNull();

    const loginPage = container.querySelector('[data-testid="page-login"]');
    expect(loginPage).toBeNull();
  });

  it('Requirement 3.10: loading=true on "/books/42" shows spinner, not BookDetail or Login', () => {
    currentInitialEntries = ['/books/42'];
    const { container } = render(<App />);

    const spinner = container.querySelector('[role="status"]');
    expect(spinner).not.toBeNull();

    const bookDetailPage = container.querySelector('[data-testid="page-book-detail"]');
    expect(bookDetailPage).toBeNull();

    const loginPage = container.querySelector('[data-testid="page-login"]');
    expect(loginPage).toBeNull();
  });

  it('Requirement 3.10: loading=true on "/ebooks" shows spinner, not EBooks or Login', () => {
    currentInitialEntries = ['/ebooks'];
    const { container } = render(<App />);

    const spinner = container.querySelector('[role="status"]');
    expect(spinner).not.toBeNull();

    const ebooksPage = container.querySelector('[data-testid="page-ebooks"]');
    expect(ebooksPage).toBeNull();

    const loginPage = container.querySelector('[data-testid="page-login"]');
    expect(loginPage).toBeNull();
  });
});
