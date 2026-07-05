import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../services/api';
import { Container, Card, Badge, Button, Alert, Spinner } from 'react-bootstrap';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getUserNotifications(user.id);
      setNotifications(response.data);
    } catch (err) {
      console.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead(user.id);
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all as read');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'DUE_REMINDER': return 'bi-calendar-check text-warning';
      case 'OVERDUE_ALERT': return 'bi-exclamation-triangle text-danger';
      case 'RESERVATION_READY': return 'bi-bookmark-check text-success';
      case 'BOOK_ISSUED': return 'bi-book text-primary';
      case 'BOOK_RETURNED': return 'bi-check-circle text-success';
      case 'FINE_IMPOSED': return 'bi-cash-coin text-danger';
      case 'FINE_PAID': return 'bi-check-circle text-success';
      default: return 'bi-bell text-secondary';
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">
          <i className="bi bi-bell me-2"></i>Notifications
        </h2>
        <Button variant="outline-primary" size="sm" onClick={handleMarkAllAsRead}>
          <i className="bi bi-check-all me-1"></i>Mark All as Read
        </Button>
      </div>

      <Card>
        <Card.Body className="p-0">
          {notifications.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-bell-slash fs-1 mb-3 d-block"></i>
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`notification-item d-flex gap-3 ${!notif.isRead ? 'unread' : ''}`}
              >
                <div className="flex-shrink-0 mt-1">
                  <i className={`bi ${getTypeIcon(notif.type)} fs-4`}></i>
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <h6 className="mb-1 fw-semibold">{notif.title}</h6>
                    <small className="text-muted">
                      {new Date(notif.sentAt).toLocaleDateString()} {new Date(notif.sentAt).toLocaleTimeString()}
                    </small>
                  </div>
                  <p className="mb-1 text-muted">{notif.message}</p>
                  {!notif.isRead && (
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0"
                      onClick={() => handleMarkAsRead(notif.id)}
                    >
                      Mark as read
                    </Button>
                  )}
                </div>
                {!notif.isRead && (
                  <div className="flex-shrink-0">
                    <span className="badge bg-primary rounded-pill" style={{ width: '8px', height: '8px', display: 'inline-block' }}></span>
                  </div>
                )}
              </div>
            ))
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Notifications;
