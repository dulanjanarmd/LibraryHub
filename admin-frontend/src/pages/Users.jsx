import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import {
  Container, Table, Badge, Button, Form,
  Spinner, Card, Pagination, Alert, Modal
} from 'react-bootstrap';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [roleFilter, setRoleFilter] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  useEffect(() => { fetchUsers(); }, [currentPage, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, size: 15, sort: 'createdAt,desc' };
      if (searchKeyword) params.keyword = searchKeyword;
      const response = await userAPI.getAllUsers(params);
      let data = response.data.content;
      if (roleFilter) data = data.filter(u => u.role === roleFilter);
      setUsers(data);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchUsers();
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      setError(''); setSuccess('');
      if (currentStatus) {
        await userAPI.deactivateUser(id);
        setSuccess('User deactivated successfully.');
      } else {
        await userAPI.activateUser(id);
        setSuccess('User activated successfully.');
      }
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    }
  };

  const openRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  const handleChangeRole = async () => {
    try {
      setError(''); setSuccess('');
      await userAPI.changeRole(selectedUser.id, newRole);
      setSuccess(`Role updated to ${newRole} for ${selectedUser.fullName}.`);
      setShowRoleModal(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change role');
    }
  };

  const getRoleBadge = (role) => {
    const map = { ADMIN: 'danger', LIBRARIAN: 'primary', FACULTY: 'info', STUDENT: 'success' };
    return <Badge bg={map[role] || 'secondary'}>{role}</Badge>;
  };

  if (loading && users.length === 0) return (
    <Container className="py-5 text-center"><Spinner animation="border" variant="primary" /></Container>
  );

  return (
    <Container fluid>
      <h2 className="fw-bold mb-4"><i className="bi bi-people me-2"></i>User Management</h2>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch} className="d-flex gap-2 flex-wrap align-items-center">
            <div className="flex-grow-1">
              <Form.Control
                type="text"
                placeholder="Search by name, email, or student ID..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
            <Form.Select
              style={{ width: 160 }}
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(0); }}
            >
              <option value="">All Roles</option>
              <option value="STUDENT">Student</option>
              <option value="FACULTY">Faculty</option>
              <option value="LIBRARIAN">Librarian</option>
              <option value="ADMIN">Admin</option>
            </Form.Select>
            <Button type="submit" variant="primary"><i className="bi bi-search"></i></Button>
            {(searchKeyword || roleFilter) && (
              <Button variant="outline-secondary" onClick={() => { setSearchKeyword(''); setRoleFilter(''); setCurrentPage(0); fetchUsers(); }}>
                <i className="bi bi-x-lg"></i>
              </Button>
            )}
          </Form>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body className="p-0">
          <Table striped hover responsive className="mb-0">
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Staff/Student ID</th><th>Email</th>
                <th>Role</th><th>Faculty</th><th>Status</th><th>Joined</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0
                ? <tr><td colSpan="9" className="text-center text-muted py-4">No users found</td></tr>
                : users.map((u) => (
                    <tr key={u.id}>
                      <td className="text-muted">{u.id}</td>
                      <td className="fw-semibold">{u.fullName}</td>
                      <td>{u.studentStaffId}</td>
                      <td>{u.email}</td>
                      <td>{getRoleBadge(u.role)}</td>
                      <td>{u.faculty || '—'}</td>
                      <td>
                        <Badge bg={u.isActive ? 'success' : 'secondary'}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            variant={u.isActive ? 'outline-danger' : 'outline-success'}
                            size="sm"
                            onClick={() => handleToggleActive(u.id, u.isActive)}
                            title={u.isActive ? 'Deactivate' : 'Activate'}
                          >
                            <i className={`bi ${u.isActive ? 'bi-person-x' : 'bi-person-check'}`}></i>
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => openRoleModal(u)}
                            title="Change Role"
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <Pagination>
            <Pagination.Prev disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)} />
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => (
              <Pagination.Item key={i} active={i === currentPage} onClick={() => setCurrentPage(i)}>
                {i + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next disabled={currentPage === totalPages - 1} onClick={() => setCurrentPage(p => p + 1)} />
          </Pagination>
        </div>
      )}

      {/* Role Change Modal */}
      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Change Role — {selectedUser?.fullName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Label>Select new role</Form.Label>
          <Form.Select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
            <option value="STUDENT">Student</option>
            <option value="FACULTY">Faculty</option>
            <option value="LIBRARIAN">Librarian</option>
            <option value="ADMIN">Admin</option>
          </Form.Select>
          <div className="mt-3 text-muted small">
            Current role: <strong>{selectedUser?.role}</strong>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRoleModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleChangeRole} disabled={newRole === selectedUser?.role}>
            Update Role
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Users;
