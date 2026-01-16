import React, { useEffect, useState } from 'react';

// API Base URL - In production, this should come from env or match the worker domain
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8787';

function App() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [health, setHealth] = useState(null);

    useEffect(() => {
        fetchHealth();
        fetchInvoices();
    }, []);

    const fetchHealth = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/health`);
            const data = await res.json();
            setHealth(data);
        } catch (err) {
            console.error('Health check failed', err);
            setHealth({ status: 'offline' });
        }
    };

    const fetchInvoices = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/invoices`);
            const data = await res.json();
            setInvoices(data);
        } catch (err) {
            console.error('Failed to fetch invoices', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <header className="header">
                <h1>AI SEO System Dashboard</h1>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span>System Status:</span>
                    <span style={{
                        color: health?.status === 'ok' ? 'green' : 'red',
                        fontWeight: 'bold'
                    }}>
                        {health?.status?.toUpperCase() || 'CHECKING...'}
                    </span>
                </div>
            </header>

            <main>
                <div className="card">
                    <h2>Recent Invoices</h2>
                    {loading ? (
                        <p>Loading data...</p>
                    ) : invoices.length === 0 ? (
                        <p>No invoices found.</p>
                    ) : (
                        <table style={{ width: '100%', textAlign: 'left' }}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((inv) => (
                                    <tr key={inv.id}>
                                        <td>{inv.id.substring(0, 8)}...</td>
                                        <td>${inv.amount.toFixed(2)}</td>
                                        <td>{inv.status}</td>
                                        <td>{new Date(inv.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="card">
                    <h2>Actions</h2>
                    <button className="btn" onClick={fetchInvoices}>Refresh Data</button>
                </div>
            </main>
        </div>
    );
}

export default App;
