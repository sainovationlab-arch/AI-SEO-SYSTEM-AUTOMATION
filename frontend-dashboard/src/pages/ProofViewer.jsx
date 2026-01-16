import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8787';

export default function ProofViewer() {
    const { id } = useParams();
    const [proofs, setProofs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProofs = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/jobs/proof/${id}`);
                const data = await res.json();
                if (data.success) {
                    setProofs(data.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProofs();
    }, [id]);

    return (
        <div className="container">
            <h1>Job Proofs for Invoice: {id}</h1>
            <div className="card">
                {loading ? <p>Loading proofs...</p> : proofs.length === 0 ? (
                    <p>No proof of work generated yet. Job might be queued or running.</p>
                ) : (
                    proofs.map((proof) => (
                        <div key={proof.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1rem' }}>
                            <h3>Engine: {proof.engine_type}</h3>
                            <p><strong>Timestamp:</strong> {new Date(proof.created_at).toLocaleString()}</p>
                            <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
                                <pre>{JSON.stringify(JSON.parse(proof.proof_data), null, 2)}</pre>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
