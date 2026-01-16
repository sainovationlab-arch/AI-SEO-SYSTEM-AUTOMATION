import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('/*', cors());

// --- Helpers ---
const success = (c, data, status = 200) => c.json({ success: true, data }, status);
const error = (c, message, status = 400) => c.json({ success: false, error: message }, status);

// --- Health ---
app.get('/api/health', (c) => success(c, { status: 'ok', system: 'Cloudflare Worker' }));

// --- Invoices ---

// 1. Create Invoice
app.post('/api/invoices/create', async (c) => {
    const { lead_id, service_type, total_amount } = await c.req.json();

    if (!lead_id || !service_type || !total_amount) {
        return error(c, 'Missing required fields: lead_id, service_type, total_amount');
    }

    const advance_amount = total_amount * 0.30;
    const balance_amount = total_amount * 0.70;
    const id = crypto.randomUUID();

    try {
        await c.env.DB.prepare(
            `INSERT INTO invoices (id, lead_id, service_type, total_amount, advance_amount, balance_amount, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).bind(id, lead_id, service_type, total_amount, advance_amount, balance_amount, 'created').run();

        return success(c, { id, total_amount, advance_amount, balance_amount, status: 'created' }, 201);
    } catch (e) {
        return error(c, e.message, 500);
    }
});

// Get Invoice
app.get('/api/invoices/:id', async (c) => {
    const id = c.req.param('id');
    const invoice = await c.env.DB.prepare('SELECT * FROM invoices WHERE id = ?').bind(id).first();

    if (!invoice) return error(c, 'Invoice not found', 404);
    return success(c, invoice);
});

// List Invoices (All)
app.get('/api/invoices', async (c) => {
    const result = await c.env.DB.prepare('SELECT * FROM invoices ORDER BY created_at DESC').all();
    return success(c, result.results);
});


// 2. Mark Advance Paid
app.post('/api/invoices/:id/advance-paid', async (c) => {
    const id = c.req.param('id');

    // Verify current status
    const invoice = await c.env.DB.prepare('SELECT status FROM invoices WHERE id = ?').bind(id).first();
    if (!invoice) return error(c, 'Invoice not found', 404);
    if (invoice.status !== 'created') return error(c, `Cannot pay advance in status: ${invoice.status}`);

    // Update
    await c.env.DB.prepare("UPDATE invoices SET status = 'advance_paid', updated_at = unixepoch() WHERE id = ?").bind(id).run();

    return success(c, { id, status: 'advance_paid' });
});


// 3. Submit Proof (Triggers check, moves to proof_submitted)
app.post('/api/invoices/:id/submit-proof', async (c) => {
    const id = c.req.param('id');
    const { file_path } = await c.req.json();

    const invoice = await c.env.DB.prepare('SELECT status FROM invoices WHERE id = ?').bind(id).first();
    if (!invoice) return error(c, 'Invoice not found', 404);

    // Can only submit proof if work is in progress (or logically if advance is paid and work is done)
    // For simplicity, let's allow submission if 'in_progress' or 'advance_paid' (assuming work done fast)
    if (!['advance_paid', 'in_progress'].includes(invoice.status)) {
        return error(c, `Cannot submit proof in status: ${invoice.status}`);
    }

    const proofId = crypto.randomUUID();
    await c.env.DB.prepare(
        `INSERT INTO payment_proofs (id, invoice_id, file_path, status) VALUES (?, ?, ?, ?)`
    ).bind(proofId, id, file_path, 'pending').run();

    await c.env.DB.prepare("UPDATE invoices SET status = 'proof_submitted', updated_at = unixepoch() WHERE id = ?").bind(id).run();

    return success(c, { id, status: 'proof_submitted', proof_id: proofId });
});


// 4. Final Paid
app.post('/api/invoices/:id/final-paid', async (c) => {
    const id = c.req.param('id');

    const invoice = await c.env.DB.prepare('SELECT status FROM invoices WHERE id = ?').bind(id).first();
    if (!invoice) return error(c, 'Invoice not found', 404);

    if (invoice.status !== 'proof_submitted') return error(c, `Cannot pay final balance in status: ${invoice.status}. Proof must be submitted first.`);

    await c.env.DB.prepare("UPDATE invoices SET status = 'fully_paid', updated_at = unixepoch() WHERE id = ?").bind(id).run();

    // Optionally auto-close
    await c.env.DB.prepare("UPDATE invoices SET status = 'closed', updated_at = unixepoch() WHERE id = ?").bind(id).run();

    return success(c, { id, status: 'closed' });
});


// --- Execution Gating ---

// 5. Start Job (Protected)
app.post('/api/jobs/start', async (c) => {
    const { invoice_id } = await c.req.json();

    const invoice = await c.env.DB.prepare('SELECT status, service_type FROM invoices WHERE invoice_id = ? OR id = ?').bind(invoice_id, invoice_id).first();

    if (!invoice) return error(c, 'Invoice not found', 404);

    // GATING LOGIC: Only allow if advance is paid (or better)
    const allowedStatuses = ['advance_paid', 'in_progress', 'proof_submitted', 'fully_paid', 'closed'];
    if (!allowedStatuses.includes(invoice.status)) {
        return error(c, `ACCESS DENIED: Payment Required. Status is ${invoice.status}`, 403);
    }

    // If valid, start job
    const jobId = crypto.randomUUID();
    await c.env.DB.prepare(
        'INSERT INTO execution_jobs (id, invoice_id, status, started_at) VALUES (?, ?, ?, unixepoch())'
    ).bind(jobId, invoice_id, 'running').run();

    // Update invoice to in_progress if it was just advance_paid
    if (invoice.status === 'advance_paid') {
        await c.env.DB.prepare("UPDATE invoices SET status = 'in_progress', updated_at = unixepoch() WHERE id = ?").bind(invoice_id).run();
    }

    return success(c, {
        job_id: jobId,
        status: 'started',
        service: invoice.service_type,
        message: 'Execution logic would run here (e.g. trigger scrapers)'
    });
});

export default app;
