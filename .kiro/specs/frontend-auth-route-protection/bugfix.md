# Bugfix Requirements Document

## Introduction

The SLIIT Library frontend exposes its home page, book catalog, book detail pages, and e-books
section to unauthenticated users. Navigating directly to `localhost:3000` (or any of `/books`,
`/books/:id`, `/ebooks`) renders full application content without requiring login. Because the
application is an internal library management system, all content and functionality should be
gated behind authentication. This fix wraps every non-login/register route inside `PrivateRoute`
so that unauthenticated users are redirected to `/login`.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN an unauthenticated user navigates to `/` THEN the system displays the full Home page
(SLIIT Library header, Browse Catalog, Popular Books, Library Services) without redirecting to
`/login`.

1.2 WHEN an unauthenticated user navigates to `/books` THEN the system displays the full book
catalog without redirecting to `/login`.

1.3 WHEN an unauthenticated user navigates to `/books/:id` THEN the system displays the full
book detail page without redirecting to `/login`.

1.4 WHEN an unauthenticated user navigates to `/ebooks` THEN the system displays the e-books
listing without redirecting to `/login`.

1.5 WHEN an unauthenticated user directly visits any of the above routes THEN the system does
NOT challenge for credentials, allowing full use of library browsing features.

### Expected Behavior (Correct)

2.1 WHEN an unauthenticated user navigates to `/` THEN the system SHALL redirect the user to
`/login` instead of rendering the Home page.

2.2 WHEN an unauthenticated user navigates to `/books` THEN the system SHALL redirect the user
to `/login` instead of rendering the book catalog.

2.3 WHEN an unauthenticated user navigates to `/books/:id` THEN the system SHALL redirect the
user to `/login` instead of rendering the book detail page.

2.4 WHEN an unauthenticated user navigates to `/ebooks` THEN the system SHALL redirect the user
to `/login` instead of rendering the e-books listing.

2.5 WHEN an unauthenticated user attempts to access any route outside of `/login` and `/register`
THEN the system SHALL redirect the user to `/login`.

### Unchanged Behavior (Regression Prevention)

3.1 WHEN an authenticated user navigates to `/` THEN the system SHALL CONTINUE TO display the
Home page as before.

3.2 WHEN an authenticated user navigates to `/books` THEN the system SHALL CONTINUE TO display
the full book catalog.

3.3 WHEN an authenticated user navigates to `/books/:id` THEN the system SHALL CONTINUE TO
display the book detail page for the requested book.

3.4 WHEN an authenticated user navigates to `/ebooks` THEN the system SHALL CONTINUE TO display
the e-books listing.

3.5 WHEN any user (authenticated or not) navigates to `/login` THEN the system SHALL CONTINUE TO
display the Login page without requiring prior authentication.

3.6 WHEN any user (authenticated or not) navigates to `/register` THEN the system SHALL CONTINUE
TO display the Register page without requiring prior authentication.

3.7 WHEN an authenticated user with role `ADMIN` or `LIBRARIAN` navigates to `/dashboard` or
`/reports` THEN the system SHALL CONTINUE TO enforce the existing role-based access control.

3.8 WHEN an authenticated user with role `ADMIN` navigates to `/users` THEN the system SHALL
CONTINUE TO enforce the existing admin-only access control.

3.9 WHEN an authenticated user navigates to `/profile`, `/my-books`, `/my-reservations`,
`/my-fines`, or `/notifications` THEN the system SHALL CONTINUE TO require authentication as it
currently does.

3.10 WHEN the auth context is still loading (token validation in progress) THEN the system SHALL
CONTINUE TO display a loading spinner rather than immediately redirecting.
