import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      if (err.message === 'ACCESS_DENIED') {
        setError('Access denied. This portal is for admin accounts only. Please use the main Library portal for student, faculty, and librarian accounts.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card animate-fade-in">
        <div className="text-center mb-4">
          <div className="mb-3">
            <i className="bi bi-shield-lock" style={{ fontSize: '3rem', color: '#003366' }}></i>
          </div>
          <h3 className="fw-bold" style={{ color: '#003366' }}>Admin Portal</h3>
          <p className="text-muted">SLIIT Library Management System</p>
          <span className="badge bg-danger px-3 py-2">
            <i className="bi bi-lock me-1"></i>Restricted Access
          </span>
        </div>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Admin Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Button
            variant="primary"
            type="submit"
            className="w-100 py-2 fw-semibold"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="me-2" />Verifying...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right me-2"></i>Sign In to Admin Portal
              </>
            )}
          </Button>
        </Form>

        <hr className="my-4" />
        <div className="text-center">
          <small className="text-muted">
            <i className="bi bi-info-circle me-1"></i>
            Admin demo: <strong>admin@example.com</strong> / password
          </small>
        </div>
        <div className="text-center mt-2">
          <small className="text-muted">
            Not an admin?{' '}
            <a href="http://localhost:3000/login" className="text-decoration-none">
              Go to Library Portal
            </a>
          </small>
        </div>
      </div>
    </div>
  );
};

export default Login;
