import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AppNavbar from './components/Navbar';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Books from './pages/Books';
import BookDetail from './pages/BookDetail';
import Dashboard from './pages/Dashboard';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import MyBooks from './pages/MyBooks';
import MyReservations from './pages/MyReservations';
import MyFines from './pages/MyFines';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import EBooks from './pages/EBooks';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/*"
            element={
              <>
                <AppNavbar />
                <div className="pt-3">
                  <Routes>
                    <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
                    <Route path="/books" element={<PrivateRoute><Books /></PrivateRoute>} />
                    <Route path="/books/:id" element={<PrivateRoute><BookDetail /></PrivateRoute>} />
                    <Route path="/ebooks" element={<PrivateRoute><EBooks /></PrivateRoute>} />
                    <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                    <Route path="/my-books" element={<PrivateRoute><MyBooks /></PrivateRoute>} />
                    <Route path="/my-reservations" element={<PrivateRoute><MyReservations /></PrivateRoute>} />
                    <Route path="/my-fines" element={<PrivateRoute><MyFines /></PrivateRoute>} />
                    <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
                    <Route
                      path="/dashboard"
                      element={
                        <PrivateRoute allowedRoles={['LIBRARIAN']}>
                          <Dashboard />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/student/dashboard"
                      element={
                        <PrivateRoute allowedRoles={['STUDENT']}>
                          <StudentDashboard />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/faculty/dashboard"
                      element={
                        <PrivateRoute allowedRoles={['FACULTY']}>
                          <FacultyDashboard />
                        </PrivateRoute>
                      }
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
