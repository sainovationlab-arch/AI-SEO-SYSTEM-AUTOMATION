import React, { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8787';

export default function AdminDashboard() {
    const [invoices, setInvoices] = useState([]);
    const [stats, setStats] = useState({ revenue: 0, pending: 0, closed: 0 });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const res = await fetch(`${API_BASE}/api/invoices`);
        const data = await res.json();
        if (data.success) {
            setInvoices(data.data);
            calculateStats(data.data);
        }
    };

    const calculateStats = (data) => {
        let rev = 0;
        let pen = 0;
        let clo = 0;
        data.forEach(inv => {
            if (['fully_paid', 'closed'].includes(inv.status)) rev += inv.total_amount;
            else if (['advance_paid', 'proof_submitted'].includes(inv.status)) rev += inv.advance_amount;

            if (inv.status === 'created') pen++;
            if (inv.status === 'closed') clo++;
        });
        setStats({ revenue: rev, pending: pen, closed: clo });
    };

    return (
        <div className="container">
            <h1>Admin Dashboard</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div className="card"><h3>Total Revenue</h3><p style={{ fontSize: '2rem' }}>${stats.revenue.toFixed(2)}</p></div>
                <div className="card"><h3>Pending Invoices</h3><p style={{ fontSize: '2rem' }}>{stats.pending}</p></div>
                <div className="card"><h3>Closed Projects</h3><p style={{ fontSize: '2rem' }}>{stats.closed}</p></div>
            </div>

            <div className="card">
                <h2>All System Invoices</h2>
                <table style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Service</th>
                            <th>Status</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map(inv => (
                            <tr key={inv.id}>
                                <td>{inv.id}</td>
                                <td>{inv.service_type}</td>
                                <td>{inv.status}</td>
                                <td>${inv.total_amount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
