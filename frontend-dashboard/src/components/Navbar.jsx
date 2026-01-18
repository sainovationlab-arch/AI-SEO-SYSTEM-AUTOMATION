import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav style={{ background: '#fff', borderBottom: '1px solid #ddd', padding: '1rem' }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: 0, padding: 0 }}>
                <Link to="/" style={{ fontWeight: 'bold', fontSize: '1.2rem', textDecoration: 'none', color: '#000' }}>AI Visibility Platform</Link>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Link to="/" className="nav-link">Home</Link>

                    {user ? (
                        <>
                            {user.role === 'client' && <Link to="/client" className="nav-link">Dashboard</Link>}
                            {user.role === 'admin' && <Link to="/admin" className="nav-link">Admin</Link>}
                            <span style={{ fontSize: '0.9rem', color: '#666', borderLeft: '1px solid #ccc', paddingLeft: '1rem' }}>
                                {user.role.toUpperCase()}
                            </span>
                            <button onClick={logout} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}>Logout</button>
                        </>
                    ) : (
                        <Link to="/login" className="nav-link" style={{ fontWeight: 'bold', color: '#2563eb' }}>Login</Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
