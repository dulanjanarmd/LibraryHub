# Implementation Plan: auth-dashboard-fix

## Overview

Implement the five fixes in three waves: backend data seeding and CORS cleanup (Wave 0), new frontend dashboard pages and login flow improvements (Wave 1), and routing + navbar updates (Wave 2). Each task is a self-contained file change that can be executed independently within its wave.

## Tasks

- [x] 1. Create `DataInitializer.java` — seed default users on empty database
  - Create `backend/src/main/java/com/sliit/library/config/DataInitializer.java`
  - Annotate with `@Component` and implement `CommandLineRunner`
  - Inject `UserRepository` and `PasswordEncoder` via `@Autowired`
  - In `run()`: check `userRepository.count() == 0`; if true, call `userRepository.saveAll()` with 4 users built via `User.builder()`
  - Seed: `admin@example.com` / ADMIN / "System Admin" / ADMIN001 / 0771234567
  - Seed: `librarian@example.com` / LIBRARIAN / "Head Librarian" / LIB001 / 0771234568
  - Seed: `student@example.com` / STUDENT / "Demo Student" / IT12345678 / 0771234569 / faculty="Computing" / programme="BSc IT"
  - Seed: `faculty@example.com` / FACULTY / "Demo Faculty" / FAC001 / 0771234570 / faculty="Computing"
  - All users: `isActive(true)`, `currentBorrowCount(0)`, `outstandingFine(0.0)`, passwords via `encoder.encode("password")`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ]* 2. Write unit test for `DataInitializer`
  - Verify `run()` calls `userRepository.saveAll()` with exactly 4 users when `count()` returns 0
  - Verify `run()` does NOT call `save` or `saveAll` when `count()` returns a positive number (idempotence)
  - Verify each created user's password passes `passwordEncoder.matches("password", hash)`
  - _Requirements: 1.1, 1.2, 1.4_

- [x] 3. Remove `@CrossOrigin` from `AuthController.java`
  - Open `backend/src/main/java/com/sliit/library/controller/AuthController.java`
  - Delete the line `@CrossOrigin(origins = "*", maxAge = 3600)` above the class declaration
  - No other changes to the file
  - _Requirements: 2.1, 2.2_

- [x] 4. Add `usersByRole` field to `DashboardStats.java`
  - Open `backend/src/main/java/com/sliit/library/dto/DashboardStats.java`
  - Add field: `private Map<String, Long> usersByRole;` (import `java.util.Map`)
  - Keep all existing fields unchanged
  - _Requirements: 5.1_

- [x] 5. Populate `usersByRole` in `ReportService.getDashboardStats()`
  - Open `backend/src/main/java/com/sliit/library/service/ReportService.java`
  - In `getDashboardStats()`, add `.usersByRole(Map.of("STUDENT", userRepository.countByRole(Role.STUDENT), "FACULTY", userRepository.countByRole(Role.FACULTY), "LIBRARIAN", userRepository.countByRole(Role.LIBRARIAN), "ADMIN", userRepository.countByRole(Role.ADMIN)))` to the builder chain
  - Import `java.util.Map` if not already present
  - _Requirements: 5.1_

- [-] 6. Update `Register.jsx` to pass registration success state
  - Open `frontend/src/pages/Register.jsx`
  - In `handleSubmit`, change `navigate('/login')` to `navigate('/login', { state: { registered: true } })`
  - No other changes
  - _Requirements: 3.1_

- [-] 7. Update `Login.jsx` — success alert and role-based redirect
  - Open `frontend/src/pages/Login.jsx`
  - Add `useLocation` import from `react-router-dom`
  - Add `const location = useLocation();` inside the component
  - Add local state: `const [showSuccess, setShowSuccess] = useState(!!location.state?.registered);`
  - Render a dismissible `<Alert variant="success" dismissible onClose={() => setShowSuccess(false)}>` above the form when `showSuccess` is true; message: "Registration successful! Please sign in with your new credentials."
  - In `handleSubmit`, after `const userData = await login(email, password)`, define `const roleRoutes = { ADMIN: '/admin/dashboard', LIBRARIAN: '/dashboard', STUDENT: '/student/dashboard', FACULTY: '/faculty/dashboard' }` and call `navigate(roleRoutes[userData.role] ?? '/')`
  - Remove the existing `navigate('/')` call
  - _Requirements: 3.2, 3.3, 4.1, 4.2, 4.3, 4.4_

- [-] 8. Create `AdminDashboard.jsx`
  - Create `frontend/src/pages/AdminDashboard.jsx`
  - Import `useState`, `useEffect`, `Link` from react-router-dom, and React Bootstrap components: `Container`, `Row`, `Col`, `Card`, `Alert`, `Spinner`, `Button`, `Badge`
  - Import `reportAPI` from `../services/api`
  - State: `stats` (null), `loading` (true), `error` (null)
  - `fetchStats()`: calls `reportAPI.getDashboardStats()`, sets stats, clears error; on catch sets error
  - `useEffect(() => { fetchStats(); }, [])`
  - While loading: render centered `<Spinner animation="border" variant="primary" />`
  - On error: render `<Alert variant="danger">` with message and a "Retry" `<Button>` that calls `fetchStats()`
  - Stat cards row: Total Users card showing `stats.totalUsers` with role breakdown badges for STUDENT, FACULTY, LIBRARIAN, ADMIN from `stats.usersByRole`; Total Books; Active Loans; Overdue Loans; Outstanding Fines (formatted `LKR {stats.outstandingFines?.toFixed(2)}`)
  - Quick links card: `<Button as={Link} to="/users">Manage Users</Button>` and `<Button as={Link} to="/reports">View Reports</Button>`
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [-] 9. Create `StudentDashboard.jsx`
  - Create `frontend/src/pages/StudentDashboard.jsx`
  - Import `useState`, `useEffect`, `Link` from react-router-dom, React Bootstrap components, and `{ useAuth }` from `../context/AuthContext`
  - Import `borrowAPI`, `reservationAPI`, `fineAPI` from `../services/api`
  - State: `activeLoans[]`, `reservations[]`, `unpaidFines[]`, `loading` (true), `error` (null)
  - `fetchData()`: `Promise.all([borrowAPI.getActiveLoans(user.id), reservationAPI.getUserReservations(user.id), fineAPI.getUnpaidFines(user.id)])`, set state; on catch set error
  - Loading spinner and error alert with retry (same pattern as AdminDashboard)
  - Outstanding fines card: sum `unpaidFines.reduce((acc, f) => acc + f.amount, 0)`, display as `LKR {total.toFixed(2)}`
  - Quick links: buttons to `/my-books`, `/my-reservations`, `/my-fines`
  - Active loans table: columns Book Title | Borrow Date | Due Date | Status; rows where `new Date(loan.dueDate) < new Date()` render a `<Badge bg="danger">OVERDUE</Badge>` in the Status column, otherwise `<Badge bg="success">ACTIVE</Badge>`
  - Pending reservations table: filter `reservations.filter(r => r.status === 'PENDING')`; columns Book Title | Queue Position
  - Empty-state messages for each table when arrays are empty
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [-] 10. Create `FacultyDashboard.jsx`
  - Create `frontend/src/pages/FacultyDashboard.jsx`
  - Identical structure to `StudentDashboard.jsx` — copy the full component and change the heading from "Student Dashboard" to "Faculty Dashboard"
  - Add a Borrowing Policy card (static, no API call) between the fines card and the loans table:
    - "Maximum books: 10"
    - "Loan period: 30 days"
    - "Maximum renewals: 2"
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

- [~] 11. Add new routes to `App.jsx`
  - Open `frontend/src/App.jsx`
  - Add three import statements at the top: `import AdminDashboard from './pages/AdminDashboard'`, `import StudentDashboard from './pages/StudentDashboard'`, `import FacultyDashboard from './pages/FacultyDashboard'`
  - Inside the protected `<Routes>`, after the existing `/dashboard` route, add:
    ```jsx
    <Route path="/admin/dashboard" element={<PrivateRoute allowedRoles={['ADMIN']}><AdminDashboard /></PrivateRoute>} />
    <Route path="/student/dashboard" element={<PrivateRoute allowedRoles={['STUDENT']}><StudentDashboard /></PrivateRoute>} />
    <Route path="/faculty/dashboard" element={<PrivateRoute allowedRoles={['FACULTY']}><FacultyDashboard /></PrivateRoute>} />
    ```
  - _Requirements: 4.1, 4.3, 4.4, 4.5_

- [~] 12. Update `Navbar.jsx` to show role-appropriate links
  - Open `frontend/src/components/Navbar.jsx`
  - Replace the current `{isLibrarian() && (...)}` block with role-specific JSX using `user.role`:
    - `user.role === 'ADMIN'`: show Dashboard link (`/admin/dashboard`), Reports link (`/reports`), Users link (`/users`)
    - `user.role === 'LIBRARIAN'`: show Dashboard link (`/dashboard`), Reports link (`/reports`) — no Users
    - `user.role === 'STUDENT'`: show "My Dashboard" link (`/student/dashboard`) — no Reports, no Users
    - `user.role === 'FACULTY'`: show "My Dashboard" link (`/faculty/dashboard`) — no Reports, no Users
  - Keep the Catalog (`/books`) and eBooks (`/ebooks`) links unconditional (they are already present outside the role block)
  - Do not change the notification bell, user dropdown, or logout logic
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [~] 13. Checkpoint — verify all changes compile and routes work
  - Ensure all tests pass, ask the user if questions arise.
  - Backend: run `./mvnw compile` in the `backend/` directory to confirm no compilation errors
  - Frontend: run `npm run build` in the `frontend/` directory to confirm no build errors
  - Manually verify: start backend + frontend, log in with `admin@example.com` / `password`, confirm redirect to `/admin/dashboard` and dashboard renders stats cards

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Wave order: tasks 1–5 (backend) → tasks 6–10 (frontend pages) → tasks 11–12 (routing/nav) → task 13 (checkpoint)
- The `DashboardStats` DTO already has `totalStudents` and `totalFaculty`; the new `usersByRole` map gives the Admin Dashboard a more complete per-role breakdown without breaking the existing Librarian Dashboard
- `PrivateRoute` already supports `allowedRoles` array — no changes needed to that component
- The `AuthContext.login()` method already returns `userData` containing `role` — no changes to `AuthContext.jsx` are needed
