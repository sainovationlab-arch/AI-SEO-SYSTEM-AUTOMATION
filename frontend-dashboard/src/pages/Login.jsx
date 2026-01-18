import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await login(email, password);
        if (res.success) {
            navigate('/');
        } else {
            setError(res.error || 'Login failed');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '6rem auto', padding: '2rem', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px createElement(0, 0, 0, 0.1)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Sign In</h2>
            {error && <div style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email Address</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                        placeholder="name@company.com"
                    />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                        placeholder="••••••••"
                    />
                </div>
                <button type="submit" className="btn" style={{ width: '100%', padding: '0.75rem', cursor: 'pointer', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', fontSize: '1rem' }}>
                    Sign In
                </button>
            </form>
            <div style={{ marginTop: '2rem', padding: '1rem', background: '#f3f4f6', borderRadius: '4px', fontSize: '0.875rem' }}>
                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Demo Credentials:</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div>
                        <span style={{ display: 'block', color: '#4b5563' }}>Client:</span>
                        <code>client@example.com</code><br />
                        <code>password123</code>
                    </div>
                    <div>
                        <span style={{ display: 'block', color: '#4b5563' }}>Admin:</span>
                        <code>admin@example.com</code><br />
                        <code>admin123</code>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
