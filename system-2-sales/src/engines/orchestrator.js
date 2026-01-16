import { runSeoJob } from './seo.js';
import { runAeoJob } from './aeo.js';
import { runGeoJob } from './geo.js';

export async function processJob(db, invoiceId) {
    // 1. Fetch Invoice
    const invoice = await db.prepare('SELECT * FROM invoices WHERE id = ?').bind(invoiceId).first();
    if (!invoice) throw new Error('Invoice not found');

    // 2. Determine Engine
    const engineType = invoice.service_type || 'SEO'; // Default

    // 3. Idempotency / Deterministic Job ID
    // Job ID is deterministic based on invoice + engine. Re-running should return existing status or restart if failed.
    // Simple deterministic ID stub:
    const jobId = `${invoiceId}-${engineType}`;

    // Check if exists
    const existing = await db.prepare('SELECT * FROM execution_jobs WHERE id = ?').bind(jobId).first();

    if (existing && existing.status === 'completed') {
        return { status: 'already_completed', job_id: jobId };
    }

    if (existing && existing.status === 'running') {
        return { status: 'running', job_id: jobId };
    }

    // Create or Update Job Entry
    if (!existing) {
        await db.prepare(
            'INSERT INTO execution_jobs (id, invoice_id, engine_type, status, started_at) VALUES (?, ?, ?, ?, unixepoch())'
        ).bind(jobId, invoice.id, engineType, 'running').run();
    } else {
        // Retry case
        await db.prepare(
            "UPDATE execution_jobs SET status = 'running', started_at = unixepoch() WHERE id = ?"
        ).bind(jobId).run();
    }

    // 4. Dispatch
    let result;
    try {
        switch (engineType) {
            case 'SEO': result = await runSeoJob(db, { id: jobId }, invoice); break;
            case 'AEO': result = await runAeoJob(db, { id: jobId }, invoice); break;
            case 'GEO': result = await runGeoJob(db, { id: jobId }, invoice); break;
            default: throw new Error(`Unknown engine type: ${engineType}`);
        }

        // 5. Save Artifacts
        for (const art of result.artifacts) {
            const artId = crypto.randomUUID();
            await db.prepare(
                'INSERT INTO execution_artifacts (id, job_id, artifact_type, content) VALUES (?, ?, ?, ?)'
            ).bind(artId, jobId, art.type, art.content).run();
        }

        // 6. Save Proof
        if (result.proof) {
            const proofId = crypto.randomUUID();
            await db.prepare(
                'INSERT INTO job_proofs (id, job_id, invoice_id, engine_type, proof_data) VALUES (?, ?, ?, ?, ?)'
            ).bind(proofId, jobId, invoice.id, engineType, JSON.stringify(result.proof)).run();
        }

        // 7. Complete Job
        await db.prepare(
            "UPDATE execution_jobs SET status = 'completed', completed_at = unixepoch(), logs = ? WHERE id = ?"
        ).bind(JSON.stringify(result.logs), jobId).run();

        return { status: 'completed', job_id: jobId, logs: result.logs };

    } catch (err) {
        // Fail Job
        await db.prepare(
            "UPDATE execution_jobs SET status = 'failed', completed_at = unixepoch(), logs = ? WHERE id = ?"
        ).bind(err.message, jobId).run();
        throw err;
    }
}
