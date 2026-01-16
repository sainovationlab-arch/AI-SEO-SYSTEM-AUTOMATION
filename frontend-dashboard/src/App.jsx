import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import ClientDashboard from './pages/ClientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProofViewer from './pages/ProofViewer';

function Home() {
    return (
        <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
            <h1>Welcome to AI Visibility Platform</h1>
            <p>Select a portal to continue:</p>
            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '2rem' }}>
                <Link to="/client" className="btn" style={{ padding: '1rem 2rem', fontSize: '1.2rem', textDecoration: 'none' }}>Client Portal</Link>
                <Link to="/admin" className="btn" style={{ padding: '1rem 2rem', fontSize: '1.2rem', textDecoration: 'none', background: '#374151' }}>Admin Portal</Link>
            </div>
        </div>
    );
}

function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/client" element={<ClientDashboard />} />
                <Route path="/client/proofs/:id" element={<ProofViewer />} />
                <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
        </Router>
    );
}

export default App;
