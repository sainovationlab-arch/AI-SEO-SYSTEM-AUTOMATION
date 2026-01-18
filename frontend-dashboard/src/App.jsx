import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import ClientDashboard from './pages/ClientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProofViewer from './pages/ProofViewer';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function Home() {
    const { user } = useAuth();

    return (
        <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
            <h1>Welcome to AI Visibility Platform</h1>
            <p>Secure Enterprise SEO & Reputation Management</p>

            <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '3rem' }}>
                {user ? (
                    <>
                        {user.role === 'client' &&
                            <Link to="/client" className="btn" style={{ padding: '1rem 2rem', fontSize: '1.2rem', textDecoration: 'none' }}>Go to Client Portal</Link>
                        }
                        {user.role === 'admin' &&
                            <Link to="/admin" className="btn" style={{ padding: '1rem 2rem', fontSize: '1.2rem', textDecoration: 'none', background: '#374151' }}>Go to Admin Portal</Link>
                        }
                    </>
                ) : (
                    <Link to="/login" className="btn" style={{ padding: '1rem 2rem', fontSize: '1.2rem', textDecoration: 'none' }}>Login to Portal</Link>
                )}
            </div>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <Navbar />
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<Home />} />

                    {/* Protected Client Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['client']} />}>
                        <Route path="/client" element={<ClientDashboard />} />
                        <Route path="/client/proofs/:id" element={<ProofViewer />} />
                    </Route>

                    {/* Protected Admin Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
