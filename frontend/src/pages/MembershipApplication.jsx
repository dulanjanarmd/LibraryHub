import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { membershipAPI } from '../services/api';
import { Container, Card, Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';

const MembershipApplication = () => {
  const { user } = useAuth();
  const [existing, setExisting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    faculty: user?.faculty || '',
    programme: user?.programme || '',
    academicYear: '',
    reason: '',
  });

  useEffect(() => {
    fetchExisting();
  }, []);

  const fetchExisting = async () => {
    try {
      const res = await membershipAPI.getMy();
      setExisting(res.data);
    } catch {
      setExisting(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await membershipAPI.apply(formData);
      setExisting(res.data);
      setSuccess('Application submitted! The librarian will review it shortly.');
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor = { PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger', EXPIRED: 'secondary' };

  if (loading) return <Container className="py-5 text-center"><Spinner animation="border" variant="primary" /></Container>;

  return (
    <Container className="py-4" style={{ maxWidth: 600 }}>
      <h2 className="fw-bold mb-4"><i className="bi bi-person-badge me-2"></i>Library Membership</h2>

      {existing ? (
        <Card>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Application Status</h5>
              <Badge bg={statusColor[existing.status] || 'secondary'} className="fs-6 px-3 py-2">
                {existing.status}
              </Badge>
            </div>
            {existing.status === 'APPROVED' && (
              <Alert variant="success">
                <i className="bi bi-check-circle me-2"></i>
                <strong>Member ID: {existing.membershipId}</strong>
                <br />
                <small>Expires: {existing.expiresAt ? new Date(existing.expiresAt).toLocaleDateString() : 'N/A'}</small>
              </Alert>
            )}
            {existing.status === 'REJECTED' && existing.adminComments && (
              <Alert variant="danger">
                <strong>Reason:</strong> {existing.adminComments}
              </Alert>
            )}
            {existing.status === 'PENDING' && (
              <Alert variant="info">Your application is under review. You will be notified once it is processed.</Alert>
            )}
            <div className="text-muted small">
              <div>Faculty: {existing.faculty}</div>
              <div>Programme: {existing.programme}</div>
              <div>Academic Year: {existing.academicYear}</div>
              <div>Applied: {existing.appliedAt ? new Date(existing.appliedAt).toLocaleDateString() : 'N/A'}</div>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Body>
            <p className="text-muted mb-4">
              Fill in the form below to apply for library membership. Once approved by the librarian,
              you will be able to reserve books, add to wishlist, and download eBooks.
            </p>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Faculty</Form.Label>
                <Form.Select name="faculty" value={formData.faculty} onChange={handleChange} required>
                  <option value="">Select Faculty</option>
                  <option value="Computing">Computing</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Business">Business</option>
                  <option value="Humanities">Humanities</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Programme</Form.Label>
                <Form.Control
                  type="text"
                  name="programme"
                  placeholder="e.g. BSc IT"
                  value={formData.programme}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Academic Year</Form.Label>
                <Form.Control
                  type="text"
                  name="academicYear"
                  placeholder="e.g. 2024/2025"
                  value={formData.academicYear}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Reason for Membership <span className="text-muted">(optional)</span></Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="reason"
                  placeholder="Why do you need library membership?"
                  value={formData.reason}
                  onChange={handleChange}
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100" disabled={submitting}>
                {submitting ? <Spinner size="sm" className="me-2" /> : <i className="bi bi-send me-2"></i>}
                Submit Application
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default MembershipApplication;
