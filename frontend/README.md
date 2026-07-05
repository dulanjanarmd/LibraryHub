# SLIIT Library Management System - Frontend

## Overview
React.js frontend for the Online Library Management System at SLIIT University.

## Tech Stack
- React 18 + Vite
- JavaScript (ES6+)
- Bootstrap 5 + React Bootstrap
- React Router DOM
- Axios (API client)
- Chart.js + react-chartjs-2 (Analytics)
- React Icons / Bootstrap Icons

## Project Structure
```
frontend/
  src/
    components/       # Shared components
      Navbar.jsx      # Top navigation bar
      PrivateRoute.jsx # Route guard for auth
    context/
      AuthContext.jsx  # Authentication context
    pages/            # Page components
      Home.jsx        # Landing page
      Login.jsx       # Login page
      Register.jsx    # Registration page
      Books.jsx       # Book catalog with search
      BookDetail.jsx  # Book details page
      Dashboard.jsx   # Librarian dashboard
      MyBooks.jsx     # User's borrowed books
      MyReservations.jsx # User's reservations
      MyFines.jsx     # User's fines
      Profile.jsx     # User profile
      Notifications.jsx # Notifications page
      EBooks.jsx      # eBook catalog
      Reports.jsx     # Reports & analytics
      Users.jsx       # User management (admin)
      NotFound.jsx    # 404 page
    services/
      api.js          # API service with axios
    App.jsx           # Main app with routes
    main.jsx          # Entry point
    index.css         # Custom styles
```

## Setup & Run

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure API URL (optional)
Create `.env` file in frontend root:
```env
VITE_API_URL=http://localhost:8080/api
```

Default: `http://localhost:8080/api`

### 3. Run Development Server
```bash
npm run dev
```

The app will be available at: `http://localhost:3000`

### 4. Build for Production
```bash
npm run build
```

## Features by Role

### All Users (Public)
- Browse book catalog
- Advanced search (title, author, ISBN, category, year, status)
- View book details
- Browse eBooks

### Students / Faculty
- Login/Register
- Reserve books
- View My Books (borrowed, history)
- Renew books (max 2 renewals)
- View My Reservations
- View and pay fines
- Update profile
- Receive notifications

### Librarians
- All student features
- Issue/Return books
- Manage books (CRUD)
- Manage categories
- View Dashboard with analytics
- View all active loans, overdue items
- View pending reservations
- Access reports

### Administrators
- All librarian features
- Manage users (activate/deactivate, change roles)
- View all reports
- Waive fines
- Full system access

## Demo Accounts
After starting the backend, you can register accounts or use:
- Register with any email to create a student account
- Use role dropdown during registration (STUDENT, FACULTY, LIBRARIAN, ADMIN)
