import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { Container, Card, Form, Button, Alert, Spinner, Badge, Row, Col } from 'react-bootstrap';

const Profile = () => {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    faculty: '',
    programme: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setProfile(response.data);
      setFormData({
        phoneNumber: response.data.phoneNumber || '',
        faculty: response.data.faculty || '',
        programme: response.data.programme || '',
      });
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      await userAPI.updateProfile(formData);
      setSuccess('Profile updated successfully');
      setEditMode(false);
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN': return <Badge bg="danger">Administrator</Badge>;
      case 'LIBRARIAN': return <Badge bg="primary">Librarian</Badge>;
      case 'FACULTY': return <Badge bg="info">Faculty</Badge>;
      case 'STUDENT': return <Badge bg="success">Student</Badge>;
      default: return <Badge bg="secondary">{role}</Badge>;
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="fw-bold mb-4">
        <i className="bi bi-person me-2"></i>My Profile
      </h2>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Row>
        <Col lg={4} className="mb-4">
          {/* Profile Card */}
          <Card className="text-center">
            <Card.Body className="py-5">
              <div
                className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}
              >
                {profile?.fullName?.charAt(0).toUpperCase()}
              </div>
              <h4 className="fw-bold mb-1">{profile?.fullName}</h4>
              <p className="text-muted mb-2">{profile?.studentStaffId}</p>
              {getRoleBadge(profile?.role)}
              <hr />
              <div className="text-start">
                <p className="mb-2">
                  <i className="bi bi-envelope me-2 text-muted"></i>{profile?.email}
                </p>
                <p className="mb-2">
                  <i className="bi bi-telephone me-2 text-muted"></i>{profile?.phoneNumber}
                </p>
                <p className="mb-2">
                  <i className="bi bi-building me-2 text-muted"></i>{profile?.faculty || 'N/A'}
                </p>
                <p className="mb-0">
                  <i className="bi bi-mortarboard me-2 text-muted"></i>{profile?.programme || 'N/A'}
                </p>
              </div>
            </Card.Body>
          </Card>

          {/* Borrowing Limits */}
          <Card className="mt-3">
            <Card.Header className="fw-semibold">Borrowing Limits</Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>Max Books</span>
                <span className="fw-semibold">{profile?.maxBooksAllowed}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Loan Period</span>
                <span className="fw-semibold">{profile?.maxDaysAllowed} days</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Currently Borrowed</span>
                <span className="fw-semibold">{profile?.currentBorrowCount}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Outstanding Fines</span>
                <span className="fw-semibold text-danger">LKR {(profile?.outstandingFine || 0).toFixed(2)}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span className="fw-semibold">Edit Profile</span>
              <Button
                variant={editMode ? "secondary" : "primary"}
                size="sm"
                onClick={() => setEditMode(!editMode)}
              >
                <i className={`bi bi-${editMode ? 'x-lg' : 'pencil'} me-1`}></i>
                {editMode ? 'Cancel' : 'Edit'}
              </Button>
            </Card.Header>
            <Card.Body>
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control type="text" value={profile?.fullName} disabled />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Student/Staff ID</Form.Label>
                      <Form.Control type="text" value={profile?.studentStaffId} disabled />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" value={profile?.email} disabled />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    disabled={!editMode}
                  />
                </Form.Group>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Faculty</Form.Label>
                      <Form.Select
                        value={formData.faculty}
                        onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                        disabled={!editMode}
                      >
                        <option value="">Select Faculty</option>
                        <option value="Computing">Computing</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Business">Business</option>
                        <option value="Humanities">Humanities</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Programme</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.programme}
                        onChange={(e) => setFormData({ ...formData, programme: e.target.value })}
                        disabled={!editMode}
                        placeholder="e.g., BSc IT"
                      />
                    </Form.Group>
                  </Col>
                </Row>
                {editMode && (
                  <Button variant="primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                )}
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
