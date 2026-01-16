import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { processJob } from './engines/orchestrator.js';

const app = new Hono();

app.use('/*', cors());

// --- Helpers ---
const success = (c, data, status = 200) => c.json({ success: true, data }, status);
const error = (c, message, status = 400) => c.json({ success: false, error: message }, status);

// --- Health ---
app.get('/api/health', (c) => success(c, { status: 'ok', system: 'Cloudflare Worker' }));

// --- Invoices endpoints (Keep from Phase 2) ---
// (Re-declaring purely for file content completeness in this replace, in reality I'd append or merge)
// For safety, I will include the previous logic + new endpoints.

// 1. Create Invoice
app.post('/api/invoices/create', async (c) => {
    const { lead_id, service_type, total_amount } = await c.req.json();
    if (!lead_id || !service_type || !total_amount) return error(c, 'Missing fields');
    const advance_amount = total_amount * 0.30;
    const balance_amount = total_amount * 0.70;
    const id = crypto.randomUUID();
    try {
        await c.env.DB.prepare(
            `INSERT INTO invoices (id, lead_id, service_type, total_amount, advance_amount, balance_amount, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(id, lead_id, service_type, total_amount, advance_amount, balance_amount, 'created').run();
        return success(c, { id, status: 'created' }, 201);
    } catch (e) { return error(c, e.message, 500); }
});

app.get('/api/invoices', async (c) => {
    const { results } = await c.env.DB.prepare('SELECT * FROM invoices ORDER BY created_at DESC').all();
    return success(c, results);
});

app.post('/api/invoices/:id/advance-paid', async (c) => {
    const id = c.req.param('id');
    await c.env.DB.prepare("UPDATE invoices SET status = 'advance_paid', updated_at = unixepoch() WHERE id = ?").bind(id).run();
    return success(c, { id, status: 'advance_paid' });
});

app.post('/api/invoices/:id/submit-proof', async (c) => {
    const id = c.req.param('id');
    const { file_path } = await c.req.json();
    await c.env.DB.prepare("UPDATE invoices SET status = 'proof_submitted', updated_at = unixepoch() WHERE id = ?").bind(id).run();
    return success(c, { id, status: 'proof_submitted' });
});

app.post('/api/invoices/:id/final-paid', async (c) => {
    const id = c.req.param('id');
    await c.env.DB.prepare("UPDATE invoices SET status = 'fully_paid', updated_at = unixepoch() WHERE id = ?").bind(id).run();
    return success(c, { id, status: 'fully_paid' });
});


// --- JOBS & ORCHESTRATION (Phase 3) ---

// 5. Start Job (Updated to use Orchestrator)
app.post('/api/jobs/start', async (c) => {
    const { invoice_id } = await c.req.json();
    if (!invoice_id) return error(c, 'Missing invoice_id');

    const invoice = await c.env.DB.prepare('SELECT status, service_type FROM invoices WHERE id = ?').bind(invoice_id).first();
    if (!invoice) return error(c, 'Invoice not found', 404);

    // Gating
    const allowed = ['advance_paid', 'in_progress', 'proof_submitted', 'fully_paid', 'closed'];
    if (!allowed.includes(invoice.status)) {
        return error(c, `ACCESS DENIED: Payment Required. Status: ${invoice.status}`, 403);
    }

    try {
        // Run Orchestrator
        const result = await processJob(c.env.DB, invoice_id);

        // Update invoice status if needed
        if (invoice.status === 'advance_paid') {
            await c.env.DB.prepare("UPDATE invoices SET status = 'in_progress', updated_at = unixepoch() WHERE id = ?").bind(invoice_id).run();
        }

        return success(c, result);
    } catch (e) {
        return error(c, e.message, 500);
    }
});

// 6. Job Status
app.get('/api/jobs/status', async (c) => {
    const { invoice_id } = c.req.query();
    if (!invoice_id) return error(c, 'Missing invoice_id param');

    const jobs = await c.env.DB.prepare('SELECT * FROM execution_jobs WHERE invoice_id = ?').bind(invoice_id).all();
    return success(c, jobs.results);
});

// 7. Get Proofs
app.get('/api/jobs/proof/:invoice_id', async (c) => {
    const invoice_id = c.req.param('invoice_id');
    const proofs = await c.env.DB.prepare('SELECT * FROM job_proofs WHERE invoice_id = ?').bind(invoice_id).all();
    return success(c, proofs.results);
});

export default app;
