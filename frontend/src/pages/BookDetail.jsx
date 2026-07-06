import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookAPI, borrowAPI, reservationAPI } from '../services/api';
import { Container, Row, Col, Card, Button, Badge, Alert, Spinner, Modal, Form } from 'react-bootstrap';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isStudent } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const response = await bookAPI.getById(id);
      setBook(response.data);
    } catch (err) {
      setError('Book not found');
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async () => {
    try {
      setError('');
      setSuccess('');
      if (!user) {
        navigate('/login');
        return;
      }
      await reservationAPI.create({
        bookId: parseInt(id),
        userId: user.id,
      });
      setSuccess('Book reserved successfully! You will be notified when it becomes available.');
      setShowReserveModal(false);
      fetchBook();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reserve book');
      setShowReserveModal(false);
    }
  };

  const handleIssue = async () => {
    try {
      setError('');
      setSuccess('');
      const targetUserId = userId ? parseInt(userId) : user?.id;
      if (!targetUserId) {
        setError('Please enter a user ID');
        return;
      }
      await borrowAPI.issue({
        userId: targetUserId,
        bookId: parseInt(id),
      });
      setSuccess('Book issued successfully!');
      setShowBorrowModal(false);
      fetchBook();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to issue book');
      setShowBorrowModal(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error && !book) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={() => navigate('/books')}>
          <i className="bi bi-arrow-left me-2"></i>Back to Catalog
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <Button variant="outline-primary" size="sm" className="mb-3" onClick={() => navigate('/books')}>
        <i className="bi bi-arrow-left me-2"></i>Back to Catalog
      </Button>

      <Row>
        {/* Book Cover */}
        <Col lg={4} className="mb-4">
          <Card>
            <div
              className="d-flex align-items-center justify-content-center text-white"
              style={{
                height: '400px',
                background: book.coverImageUrl
                  ? `url(${book.coverImageUrl}) center/cover`
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px 12px 0 0',
              }}
            >
              {!book.coverImageUrl && <i className="bi bi-book" style={{ fontSize: '6rem' }}></i>}
            </div>
            <Card.Body className="text-center">
              <Badge bg={book.availableCopies > 0 ? 'success' : 'danger'} className="fs-6 px-3 py-2">
                {book.availableCopies > 0
                  ? `${book.availableCopies} of ${book.totalCopies} Available`
                  : 'Currently Unavailable'}
              </Badge>
            </Card.Body>
          </Card>

          {/* Action Buttons */}
          {user && (
            <Card className="mt-3">
              <Card.Body className="d-grid gap-2">
                {user.role === 'LIBRARIAN' || user.role === 'ADMIN' ? (
                  <Button variant="primary" onClick={() => setShowBorrowModal(true)}>
                    <i className="bi bi-book me-2"></i>Issue Book
                  </Button>
                ) : book.availableCopies > 0 ? (
                  user.isMember ? (
                    <Button variant="primary" onClick={() => setShowBorrowModal(true)}>
                      <i className="bi bi-book me-2"></i>Borrow Book
                    </Button>
                  ) : (
                    <>
                      <Alert variant="warning" className="mb-2 py-2 small">
                        <i className="bi bi-lock me-1"></i>Library membership required to borrow books.
                      </Alert>
                      <Button as={Link} to="/membership" variant="outline-primary" size="sm">
                        Apply for Membership
                      </Button>
                    </>
                  )
                ) : user.isMember ? (
                  <Button variant="warning" onClick={() => setShowReserveModal(true)}>
                    <i className="bi bi-bookmark me-2"></i>Reserve Book
                  </Button>
                ) : (
                  <>
                    <Alert variant="warning" className="mb-2 py-2 small">
                      <i className="bi bi-lock me-1"></i>Library membership required to reserve books.
                    </Alert>
                    <Button as={Link} to="/membership" variant="outline-primary" size="sm">
                      Apply for Membership
                    </Button>
                  </>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>

        {/* Book Details */}
        <Col lg={8}>
          <Card className="h-100">
            <Card.Body>
              <h2 className="fw-bold mb-2">{book.title}</h2>
              <p className="text-muted fs-5 mb-4">
                <i className="bi bi-person me-2"></i>
                {book.author}
                {book.additionalAuthors && <span className="fs-6">, {book.additionalAuthors}</span>}
              </p>

              {book.description && (
                <div className="mb-4">
                  <h5 className="fw-semibold">Description</h5>
                  <p className="text-muted">{book.description}</p>
                </div>
              )}

              <Row className="g-3">
                <Col sm={6}>
                  <div className="p-3 bg-light rounded">
                    <small className="text-muted">ISBN</small>
                    <p className="mb-0 fw-semibold">{book.isbn}</p>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="p-3 bg-light rounded">
                    <small className="text-muted">ISBN-13</small>
                    <p className="mb-0 fw-semibold">{book.isbn13 || 'N/A'}</p>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="p-3 bg-light rounded">
                    <small className="text-muted">Publisher</small>
                    <p className="mb-0 fw-semibold">{book.publisher || 'N/A'}</p>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="p-3 bg-light rounded">
                    <small className="text-muted">Publication Year</small>
                    <p className="mb-0 fw-semibold">{book.publicationYear || 'N/A'}</p>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="p-3 bg-light rounded">
                    <small className="text-muted">Edition</small>
                    <p className="mb-0 fw-semibold">{book.edition || 'N/A'}</p>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="p-3 bg-light rounded">
                    <small className="text-muted">Language</small>
                    <p className="mb-0 fw-semibold">{book.language || 'N/A'}</p>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="p-3 bg-light rounded">
                    <small className="text-muted">Format</small>
                    <p className="mb-0 fw-semibold">{book.format || 'Physical'}</p>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="p-3 bg-light rounded">
                    <small className="text-muted">Shelf Location</small>
                    <p className="mb-0 fw-semibold">{book.shelfLocation || 'N/A'}</p>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="p-3 bg-light rounded">
                    <small className="text-muted">Category</small>
                    <p className="mb-0 fw-semibold">{book.categoryName || 'Uncategorized'}</p>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="p-3 bg-light rounded">
                    <small className="text-muted">DDC Number</small>
                    <p className="mb-0 fw-semibold">{book.ddcNumber || 'N/A'}</p>
                  </div>
                </Col>
                {book.replacementCost > 0 && (
                  <Col sm={6}>
                    <div className="p-3 bg-light rounded">
                      <small className="text-muted">Replacement Cost</small>
                      <p className="mb-0 fw-semibold text-danger">LKR {book.replacementCost.toFixed(2)}</p>
                    </div>
                  </Col>
                )}
              </Row>

              {book.subjectHeadings && (
                <div className="mt-4">
                  <h6 className="fw-semibold">Subject Headings</h6>
                  <div className="d-flex gap-2 flex-wrap">
                    {book.subjectHeadings.split(',').map((tag, idx) => (
                      <Badge key={idx} bg="secondary">{tag.trim()}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Reserve Modal */}
      <Modal show={showReserveModal} onHide={() => setShowReserveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Reservation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>You are about to reserve <strong>"{book?.title}"</strong> by {book?.author}.</p>
          <p className="text-muted">
            You will be notified when the book becomes available. You have 48 hours to collect it after notification.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReserveModal(false)}>Cancel</Button>
          <Button variant="warning" onClick={handleReserve}>
            <i className="bi bi-bookmark me-2"></i>Confirm Reservation
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Borrow Modal */}
      <Modal show={showBorrowModal} onHide={() => setShowBorrowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Issue Book</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>You are about to issue <strong>"{book?.title}"</strong>.</p>
          {user?.role === 'ADMIN' || user?.role === 'LIBRARIAN' ? (
            <Form.Group className="mb-3">
              <Form.Label>User ID (leave blank for self)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter user ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
              <Form.Text className="text-muted">
                As a librarian/admin, you can issue books on behalf of other users.
              </Form.Text>
            </Form.Group>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBorrowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleIssue}>
            <i className="bi bi-book me-2"></i>Issue Now
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BookDetail;
