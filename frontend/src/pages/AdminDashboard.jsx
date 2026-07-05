import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportAPI } from '../services/api';
import { Container, Row, Col, Card, Alert, Spinner, Button, Badge } from 'react-bootstrap';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await reportAPI.getDashboardStats();
      setStats(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error}
          <div className="mt-2">
            <Button variant="outline-danger" size="sm" onClick={fetchStats}>
              Retry
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  const usersByRole = stats?.usersByRole || {};

  return (
    <Container fluid className="px-4">
      <h2 className="fw-bold mb-4">
        <i className="bi bi-shield-check me-2"></i>Admin Dashboard
      </h2>

      {/* System Stats */}
      <Row className="g-3 mb-4">
        <Col lg={4} md={6}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <i className="bi bi-people fs-2 text-primary me-3"></i>
                <div>
                  <h4 className="mb-0">{stats?.totalUsers || 0}</h4>
                  <small className="text-muted">Total Users</small>
                </div>
              </div>
              <div className="d-flex flex-wrap gap-2">
                <Badge bg="info">Students: {usersByRole.STUDENT || 0}</Badge>
                <Badge bg="warning" text="dark">Faculty: {usersByRole.FACULTY || 0}</Badge>
                <Badge bg="success">Librarians: {usersByRole.LIBRARIAN || 0}</Badge>
                <Badge bg="danger">Admins: {usersByRole.ADMIN || 0}</Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={2} md={6}>
          <Card className="text-center h-100">
            <Card.Body>
              <i className="bi bi-book fs-2 text-success mb-2 d-block"></i>
              <h4 className="mb-0">{stats?.totalBooks || 0}</h4>
              <small className="text-muted">Total Books</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={2} md={6}>
          <Card className="text-center h-100">
            <Card.Body>
              <i className="bi bi-journal-check fs-2 text-info mb-2 d-block"></i>
              <h4 className="mb-0">{stats?.activeLoans || 0}</h4>
              <small className="text-muted">Active Loans</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={2} md={6}>
          <Card className="text-center h-100">
            <Card.Body>
              <i className="bi bi-exclamation-triangle fs-2 text-warning mb-2 d-block"></i>
              <h4 className="mb-0">{stats?.overdueLoans || 0}</h4>
              <small className="text-muted">Overdue Loans</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={2} md={6}>
          <Card className="text-center h-100">
            <Card.Body>
              <i className="bi bi-cash-coin fs-2 text-danger mb-2 d-block"></i>
              <h5 className="mb-0">LKR {(stats?.outstandingFines || 0).toFixed(2)}</h5>
              <small className="text-muted">Outstanding Fines</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions + System Overview */}
      <Row className="g-3">
        <Col md={6}>
          <Card>
            <Card.Header className="fw-semibold">
              <i className="bi bi-lightning me-2"></i>Quick Actions
            </Card.Header>
            <Card.Body className="d-flex gap-3 flex-wrap">
              <Button as={Link} to="/users" variant="primary">
                <i className="bi bi-people me-2"></i>Manage Users
              </Button>
              <Button as={Link} to="/reports" variant="outline-primary">
                <i className="bi bi-graph-up me-2"></i>View Reports
              </Button>
              <Button as={Link} to="/dashboard" variant="outline-secondary">
                <i className="bi bi-speedometer2 me-2"></i>Librarian View
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header className="fw-semibold">
              <i className="bi bi-info-circle me-2"></i>System Overview
            </Card.Header>
            <Card.Body>
              <ul className="list-unstyled mb-0">
                <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>eBooks available: <strong>{stats?.totalEBooks || 0}</strong></li>
                <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Pending reservations: <strong>{stats?.pendingReservations || 0}</strong></li>
                <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Today's loans: <strong>{stats?.todayLoans || 0}</strong></li>
                <li><i className="bi bi-check-circle text-success me-2"></i>Today's returns: <strong>{stats?.todayReturns || 0}</strong></li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
