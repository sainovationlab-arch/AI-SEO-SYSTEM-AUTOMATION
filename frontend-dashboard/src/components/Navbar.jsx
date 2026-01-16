import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
    return (
        <nav style={{ background: '#fff', borderBottom: '1px solid #ddd', padding: '1rem' }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: 0, padding: 0 }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>AI Visibility Platform</div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/client" className="nav-link">Client Dashboard</Link>
                    <Link to="/admin" className="nav-link">Admin Dashboard</Link>
                </div>
            </div>
        </nav>
    );
}
