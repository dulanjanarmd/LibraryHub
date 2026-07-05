# Requirements Document

## Introduction

This feature addresses five interconnected issues in the SLIIT Online Library Management System: an empty database with no seed data, a CORS conflict between controller-level and global configuration, an incomplete post-registration login flow, missing role-specific dashboards for Student and Faculty users, and incorrect post-login routing that ignores user roles. Together these fixes ensure the application is functional from first boot and delivers a tailored experience to every user role.

## Glossary

- **DataInitializer**: A Spring Boot `CommandLineRunner` component that seeds default user accounts into the database on application startup when the users table is empty.
- **System**: The SLIIT Online Library Management System, comprising the Spring Boot backend and the React frontend.
- **AuthController**: The Spring Boot REST controller at `/api/auth` handling login and registration endpoints.
- **WebSecurityConfig**: The Spring Security configuration class that defines global CORS policy, JWT filter chain, and role-based access rules.
- **AuthContext**: The React context that stores the authenticated user object and JWT token and exposes login, register, and logout functions.
- **Login_Page**: The React page at `/login` that accepts email and password credentials.
- **Register_Page**: The React page at `/register` that accepts new user details.
- **Admin_Dashboard**: The React page at `/admin/dashboard` accessible only to users with the ADMIN role.
- **Librarian_Dashboard**: The existing React page at `/dashboard` accessible to users with the LIBRARIAN or ADMIN role.
- **Student_Dashboard**: The new React page at `/student/dashboard` accessible to users with the STUDENT role.
- **Faculty_Dashboard**: The new React page at `/faculty/dashboard` accessible to users with the FACULTY role.
- **PrivateRoute**: The React component that guards routes by checking authentication and role membership.
- **AppNavbar**: The React navigation bar component that renders role-appropriate links for the authenticated user.
- **Role**: An enum with values STUDENT, FACULTY, LIBRARIAN, and ADMIN stored on each User entity.
- **JWT**: JSON Web Token issued on successful login and carried in the `Authorization: Bearer` header on subsequent requests.
- **BCrypt**: The password hashing algorithm used to encode and verify user passwords.
- **Seed_User**: A default user account created by the DataInitializer on first startup.

---

## Requirements

### Requirement 1: Database Seeding

**User Story:** As a system administrator, I want default user accounts to exist when the application starts for the first time, so that developers and testers can log in immediately without manual database setup.

#### Acceptance Criteria

1. WHEN the application starts and the users table contains zero records, THE DataInitializer SHALL create one user for each role: ADMIN, LIBRARIAN, STUDENT, and FACULTY.
2. WHEN the DataInitializer creates Seed_Users, THE DataInitializer SHALL encode each password using BCrypt before persisting it, so that plaintext passwords are never stored in the database.
3. WHEN the DataInitializer creates Seed_Users, THE DataInitializer SHALL assign the following credentials: `admin@example.com` / `password` (role ADMIN), `librarian@example.com` / `password` (role LIBRARIAN), `student@example.com` / `password` (role STUDENT), `faculty@example.com` / `password` (role FACULTY).
4. WHEN the application starts and the users table already contains one or more records, THE DataInitializer SHALL not insert any additional seed records, preserving all existing data.
5. WHEN the DataInitializer creates a Seed_User, THE DataInitializer SHALL set `isActive` to `true` and `currentBorrowCount` to `0` and `outstandingFine` to `0.0` for each created user.

---

### Requirement 2: CORS Configuration Fix

**User Story:** As a developer, I want a single, consistent CORS policy enforced at the Spring Security layer, so that preflight and credentialed requests from the React frontend succeed without conflicts.

#### Acceptance Criteria

1. THE AuthController SHALL not declare any `@CrossOrigin` annotation, so that CORS for all `/api/auth/**` endpoints is governed exclusively by WebSecurityConfig.
2. WHILE the application is running, THE WebSecurityConfig SHALL allow credentialed cross-origin requests from the origins `http://localhost:5173` and `http://localhost:3000`.
3. WHEN a preflight OPTIONS request is received for any `/api/auth/**` endpoint, THE System SHALL respond with HTTP 200 and the appropriate CORS headers without requiring authentication.
4. IF a cross-origin request arrives from an origin not listed in `cors.allowed-origins`, THEN THE System SHALL reject the request with an HTTP 403 response.

---

### Requirement 3: Login Flow and Post-Registration Feedback

**User Story:** As a user who has just registered, I want to be redirected to the login page with a success message, so that I know registration succeeded and I can sign in with my new credentials.

#### Acceptance Criteria

1. WHEN a user successfully completes registration, THE Register_Page SHALL navigate to `/login` and pass a success state indicator in the navigation state.
2. WHEN the Login_Page is rendered with a success state indicator in its navigation state, THE Login_Page SHALL display a dismissible success alert stating that registration was successful and prompting the user to sign in.
3. WHEN the Login_Page is rendered without a success state indicator, THE Login_Page SHALL not display any registration success message.
4. WHEN a user submits valid credentials on the Login_Page, THE AuthContext SHALL call `POST /api/auth/login`, store the returned JWT token and user object in `localStorage`, and return the user data to the caller.
5. IF the backend returns an error response for a login attempt, THEN THE Login_Page SHALL display the error message from the response body, or a generic fallback message if no message is present.

---

### Requirement 4: Role-Based Post-Login Routing

**User Story:** As an authenticated user, I want to be redirected to a dashboard appropriate for my role immediately after login, so that I reach relevant content without extra navigation steps.

#### Acceptance Criteria

1. WHEN a user with role ADMIN successfully logs in, THE Login_Page SHALL navigate to `/admin/dashboard`.
2. WHEN a user with role LIBRARIAN successfully logs in, THE Login_Page SHALL navigate to `/dashboard`.
3. WHEN a user with role STUDENT successfully logs in, THE Login_Page SHALL navigate to `/student/dashboard`.
4. WHEN a user with role FACULTY successfully logs in, THE Login_Page SHALL navigate to `/faculty/dashboard`.
5. THE System SHALL expose each role-specific dashboard route only to users whose role matches the allowed roles for that route, returning an unauthorized redirect for users with non-matching roles.

---

### Requirement 5: Admin Dashboard

**User Story:** As an admin, I want a dedicated dashboard showing system-wide statistics and quick navigation, so that I can monitor the library system and manage users efficiently.

#### Acceptance Criteria

1. WHEN a user with role ADMIN navigates to `/admin/dashboard`, THE Admin_Dashboard SHALL display the total number of registered users broken down by role (STUDENT, FACULTY, LIBRARIAN, ADMIN).
2. WHEN a user with role ADMIN navigates to `/admin/dashboard`, THE Admin_Dashboard SHALL display the total number of books, total number of active loans, total number of overdue loans, and total outstanding fines in LKR.
3. WHEN a user with role ADMIN navigates to `/admin/dashboard`, THE Admin_Dashboard SHALL provide navigation links to the Users management page (`/users`) and the Reports page (`/reports`).
4. WHEN the Admin_Dashboard data fetch fails, THE Admin_Dashboard SHALL display an error message and allow the user to retry the fetch without reloading the page.
5. WHILE the Admin_Dashboard is loading data, THE Admin_Dashboard SHALL display a loading indicator in place of the statistics.

---

### Requirement 6: Student Dashboard

**User Story:** As a student, I want a personal dashboard showing my current loans, reservations, and fines, so that I can track my library activity in one place.

#### Acceptance Criteria

1. WHEN a user with role STUDENT navigates to `/student/dashboard`, THE Student_Dashboard SHALL display all of that user's active loan records including book title, borrow date, and due date.
2. WHEN a user with role STUDENT navigates to `/student/dashboard`, THE Student_Dashboard SHALL display all of that user's pending reservations including book title and queue position.
3. WHEN a user with role STUDENT navigates to `/student/dashboard`, THE Student_Dashboard SHALL display that user's total outstanding fine amount in LKR.
4. WHEN a user with role STUDENT navigates to `/student/dashboard`, THE Student_Dashboard SHALL provide navigation links to `/my-books`, `/my-reservations`, and `/my-fines`.
5. WHEN an active loan record has a due date that is earlier than the current date, THE Student_Dashboard SHALL visually distinguish that record as overdue.
6. WHILE the Student_Dashboard is loading data, THE Student_Dashboard SHALL display a loading indicator in place of the loan, reservation, and fine sections.
7. WHEN the Student_Dashboard data fetch fails, THE Student_Dashboard SHALL display an error message and allow the user to retry the fetch without reloading the page.

---

### Requirement 7: Faculty Dashboard

**User Story:** As a faculty member, I want a personal dashboard that shows my loans with extended borrowing limits, my reservations, and my fines, so that I can track my library activity and understand my borrowing privileges.

#### Acceptance Criteria

1. WHEN a user with role FACULTY navigates to `/faculty/dashboard`, THE Faculty_Dashboard SHALL display all of that user's active loan records including book title, borrow date, and due date.
2. WHEN a user with role FACULTY navigates to `/faculty/dashboard`, THE Faculty_Dashboard SHALL display a borrowing policy summary showing the faculty limit of 10 books and 30-day loan period.
3. WHEN a user with role FACULTY navigates to `/faculty/dashboard`, THE Faculty_Dashboard SHALL display all of that user's pending reservations including book title and queue position.
4. WHEN a user with role FACULTY navigates to `/faculty/dashboard`, THE Faculty_Dashboard SHALL display that user's total outstanding fine amount in LKR.
5. WHEN a user with role FACULTY navigates to `/faculty/dashboard`, THE Faculty_Dashboard SHALL provide navigation links to `/my-books`, `/my-reservations`, and `/my-fines`.
6. WHEN an active loan record has a due date that is earlier than the current date, THE Faculty_Dashboard SHALL visually distinguish that record as overdue.
7. WHILE the Faculty_Dashboard is loading data, THE Faculty_Dashboard SHALL display a loading indicator in place of the loan, reservation, and fine sections.
8. WHEN the Faculty_Dashboard data fetch fails, THE Faculty_Dashboard SHALL display an error message and allow the user to retry the fetch without reloading the page.

---

### Requirement 8: Role-Aware Navigation

**User Story:** As an authenticated user, I want the navigation bar to show only the links relevant to my role, so that I am not presented with options I cannot access.

#### Acceptance Criteria

1. WHEN a user with role ADMIN is authenticated, THE AppNavbar SHALL display links to Dashboard (`/admin/dashboard`), Reports (`/reports`), and Users (`/users`).
2. WHEN a user with role LIBRARIAN is authenticated, THE AppNavbar SHALL display links to Dashboard (`/dashboard`) and Reports (`/reports`), and SHALL NOT display the Users link.
3. WHEN a user with role STUDENT is authenticated, THE AppNavbar SHALL display a link to Student Dashboard (`/student/dashboard`) and SHALL NOT display Dashboard, Reports, or Users links.
4. WHEN a user with role FACULTY is authenticated, THE AppNavbar SHALL display a link to Faculty Dashboard (`/faculty/dashboard`) and SHALL NOT display Dashboard, Reports, or Users links.
5. THE AppNavbar SHALL display the Catalog (`/books`) and eBooks (`/ebooks`) links to all authenticated users regardless of role.
