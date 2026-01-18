import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return (
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                <h1 style={{ color: '#ef4444' }}>ACCESS DENIED</h1>
                <p>You do not have permission to view this page.</p>
                <p>Required Role: {allowedRoles.join(' or ')}</p>
            </div>
        );
    }

    return <Outlet />;
};

export default ProtectedRoute;
