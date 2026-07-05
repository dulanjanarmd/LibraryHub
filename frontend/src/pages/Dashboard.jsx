import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportAPI, borrowAPI, reservationAPI } from '../services/api';
import { Container, Row, Col, Card, Table, Badge, Spinner, Button } from 'react-bootstrap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [overdueLoans, setOverdueLoans] = useState([]);
  const [todayLoans, setTodayLoans] = useState([]);
  const [pendingReservations, setPendingReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, overdueRes, todayLoansRes, todayReturnsRes, pendingRes] = await Promise.all([
        reportAPI.getDashboardStats(),
        borrowAPI.getOverdue(),
        borrowAPI.getTodayLoans(),
        borrowAPI.getTodayReturns(),
        reservationAPI.getPending(),
      ]);

      setStats(statsRes.data);
      setOverdueLoans(overdueRes.data);
      setTodayLoans(todayLoansRes.data);
      setPendingReservations(pendingRes.data);
    } catch (err) {
      console.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const bookStatusData = {
    labels: ['Available', 'Issued', 'Reserved'],
    datasets: [
      {
        data: [stats?.totalBooks - stats?.activeLoans || 0, stats?.activeLoans || 0, stats?.pendingReservations || 0],
        backgroundColor: ['#198754', '#dc3545', '#ffc107'],
        borderWidth: 0,
      },
    ],
  };

  const loanActivityData = {
    labels: ['Today\'s Loans', 'Today\'s Returns', 'Active Loans', 'Overdue'],
    datasets: [
      {
        label: 'Count',
        data: [
          stats?.todayLoans || 0,
          stats?.todayReturns || 0,
          stats?.activeLoans || 0,
          stats?.overdueLoans || 0,
        ],
        backgroundColor: ['#0d6efd', '#198754', '#0dcaf0', '#dc3545'],
        borderRadius: 8,
      },
    ],
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container fluid className="px-4">
      <h2 className="fw-bold mb-4">
        <i className="bi bi-speedometer2 me-2"></i>Librarian Dashboard
      </h2>

      {/* Stats Cards */}
      <Row className="g-3 mb-4">
        <Col lg={2} md={4} sm={6}>
          <Card className="stat-card primary text-center">
            <Card.Body>
              <i className="bi bi-book fs-2 text-primary mb-2 d-block"></i>
              <h4 className="mb-0">{stats?.totalBooks || 0}</h4>
              <small className="text-muted">Total Books</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={2} md={4} sm={6}>
          <Card className="stat-card success text-center">
            <Card.Body>
              <i className="bi bi-file-earmark-pdf fs-2 text-success mb-2 d-block"></i>
              <h4 className="mb-0">{stats?.totalEBooks || 0}</h4>
              <small className="text-muted">eBooks</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={2} md={4} sm={6}>
          <Card className="stat-card info text-center">
            <Card.Body>
              <i className="bi bi-people fs-2 text-info mb-2 d-block"></i>
              <h4 className="mb-0">{stats?.totalUsers || 0}</h4>
              <small className="text-muted">Users</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={2} md={4} sm={6}>
          <Card className="stat-card warning text-center">
            <Card.Body>
              <i className="bi bi-journal-check fs-2 text-warning mb-2 d-block"></i>
              <h4 className="mb-0">{stats?.activeLoans || 0}</h4>
              <small className="text-muted">Active Loans</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={2} md={4} sm={6}>
          <Card className="stat-card danger text-center">
            <Card.Body>
              <i className="bi bi-exclamation-triangle fs-2 text-danger mb-2 d-block"></i>
              <h4 className="mb-0">{stats?.overdueLoans || 0}</h4>
              <small className="text-muted">Overdue</small>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={2} md={4} sm={6}>
          <Card className="stat-card primary text-center">
            <Card.Body>
              <i className="bi bi-cash-coin fs-2 text-primary mb-2 d-block"></i>
              <h4 className="mb-0">LKR {(stats?.outstandingFines || 0).toFixed(0)}</h4>
              <small className="text-muted">Outstanding Fines</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row className="g-4 mb-4">
        <Col lg={4}>
          <Card>
            <Card.Header className="fw-semibold">
              <i className="bi bi-pie-chart me-2"></i>Book Status Distribution
            </Card.Header>
            <Card.Body>
              <div className="chart-container">
                <Doughnut
                  data={bookStatusData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } },
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={8}>
          <Card>
            <Card.Header className="fw-semibold">
              <i className="bi bi-bar-chart me-2"></i>Loan Activity
            </Card.Header>
            <Card.Body>
              <div className="chart-container">
                <Bar
                  data={loanActivityData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tables Row */}
      <Row className="g-4">
        {/* Overdue Loans */}
        <Col lg={6}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span className="fw-semibold text-danger">
                <i className="bi bi-exclamation-triangle me-2"></i>Overdue Loans
              </span>
              <Badge bg="danger">{overdueLoans.length}</Badge>
            </Card.Header>
            <Card.Body className="p-0">
              <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                <Table striped hover className="mb-0">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Book</th>
                      <th>Due Date</th>
                      <th>Fine</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overdueLoans.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center text-muted py-3">No overdue loans</td>
                      </tr>
                    ) : (
                      overdueLoans.slice(0, 10).map((loan) => {
                        const overdueDays = Math.floor((new Date() - new Date(loan.dueDate)) / (1000 * 60 * 60 * 24));
                        return (
                          <tr key={loan.id}>
                            <td>
                              <div className="fw-semibold">{loan.userName}</div>
                              <small className="text-muted">{loan.studentStaffId}</small>
                            </td>
                            <td>{loan.bookTitle}</td>
                            <td>
                              <span className="text-danger">{loan.dueDate}</span>
                              <br />
                              <small className="text-muted">{overdueDays} days overdue</small>
                            </td>
                            <td className="text-danger fw-semibold">
                              LKR {(overdueDays * 5).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Today's Activity */}
        <Col lg={6}>
          <Card>
            <Card.Header className="fw-semibold">
              <i className="bi bi-calendar-check me-2"></i>Today's Loans
            </Card.Header>
            <Card.Body className="p-0">
              <div style={{ maxHeight: '300px', overflow: 'auto' }}>
                <Table striped hover className="mb-0">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Book</th>
                      <th>Due Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayLoans.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center text-muted py-3">No loans today</td>
                      </tr>
                    ) : (
                      todayLoans.map((loan) => (
                        <tr key={loan.id}>
                          <td>
                            <div className="fw-semibold">{loan.userName}</div>
                            <small className="text-muted">{loan.studentStaffId}</small>
                          </td>
                          <td>{loan.bookTitle}</td>
                          <td>{loan.dueDate}</td>
                          <td>
                            <Badge bg={loan.status === 'ACTIVE' ? 'success' : 'secondary'}>
                              {loan.status}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Pending Reservations */}
      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span className="fw-semibold text-warning">
                <i className="bi bi-bookmark me-2"></i>Pending Reservations
              </span>
              <Badge bg="warning" text="dark">{pendingReservations.length}</Badge>
            </Card.Header>
            <Card.Body className="p-0">
              <div style={{ maxHeight: '250px', overflow: 'auto' }}>
                <Table striped hover className="mb-0">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Book</th>
                      <th>Queue Position</th>
                      <th>Reserved On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingReservations.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center text-muted py-3">No pending reservations</td>
                      </tr>
                    ) : (
                      pendingReservations.map((res) => (
                        <tr key={res.id}>
                          <td>
                            <div className="fw-semibold">{res.userName}</div>
                            <small className="text-muted">{res.studentStaffId}</small>
                          </td>
                          <td>{res.bookTitle}</td>
                          <td>#{res.queuePosition}</td>
                          <td>{new Date(res.reservationDate).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
