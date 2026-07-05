import React from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

const AdminLayout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div>
      <Sidebar />
      <div className="admin-main">
        <div className="admin-topbar">
          <div>
            <span className="text-muted" style={{ fontSize: '0.85rem' }}>
              <i className="bi bi-shield-check text-success me-1"></i>
              Admin Portal
            </span>
          </div>
          <div className="d-flex align-items-center gap-3">
            <span className="badge bg-danger">
              <i className="bi bi-person me-1"></i>
              {user?.role}
            </span>
            <span className="text-muted" style={{ fontSize: '0.85rem' }}>
              {user?.fullName}
            </span>
          </div>
        </div>
        <div className="admin-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
