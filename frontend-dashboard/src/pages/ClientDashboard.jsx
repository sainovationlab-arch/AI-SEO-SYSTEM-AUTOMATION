import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8787';

export default function ClientDashboard() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/invoices`);
            const data = await res.json();
            // Filter for demo purposes, assume logged in client
            if (data.success) {
                setInvoices(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const payAdvance = async (id) => {
        // Demo payment flow
        if (!confirm('Simulating Advance Payment?')) return;
        try {
            const res = await fetch(`${API_BASE}/api/invoices/${id}/advance-paid`, { method: 'POST' });
            if (res.ok) fetchInvoices();
        } catch (err) { console.error(err); }
    };

    const startJob = async (id) => {
        try {
            const res = await fetch(`${API_BASE}/api/jobs/start`, {
                method: 'POST',
                body: JSON.stringify({ invoice_id: id })
            });
            const data = await res.json();
            alert(data.success ? 'Job Started!' : `Error: ${data.error}`);
        } catch (err) { console.error(err); }
    };

    return (
        <div className="container">
            <h1>Client Dashboard</h1>
            <div className="card">
                <h2>My Invoices</h2>
                {loading ? <p>Loading...</p> : (
                    <table style={{ width: '100%', textAlign: 'left' }}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Service</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((inv) => (
                                <tr key={inv.id}>
                                    <td>{inv.id.substring(0, 8)}...</td>
                                    <td>{inv.service_type}</td>
                                    <td>${inv.total_amount}</td>
                                    <td>
                                        <span style={{
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            background: inv.status === 'created' ? '#fee2e2' : '#dcfce7',
                                            color: inv.status === 'created' ? '#991b1b' : '#166534'
                                        }}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td>
                                        <Link to={`/client/proofs/${inv.id}`} className="btn" style={{ marginRight: '5px' }}>Proofs</Link>
                                        {inv.status === 'created' && (
                                            <button onClick={() => payAdvance(inv.id)} className="btn">Pay Advance</button>
                                        )}
                                        {inv.status === 'advance_paid' && (
                                            <button onClick={() => startJob(inv.id)} className="btn">Start Job</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
