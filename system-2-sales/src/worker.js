import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// Middleware
app.use('/*', cors());

// Health Check
app.get('/api/health', (c) => c.json({ status: 'ok', system: 'Cloudflare Worker' }));

// List Invoices
app.get('/api/invoices', async (c) => {
    try {
        const { results } = await c.env.DB.prepare('SELECT * FROM invoices ORDER BY created_at DESC').all();
        return c.json(results);
    } catch (e) {
        return c.json({ error: e.message }, 500);
    }
});

// Create Invoice (Simplistic for now)
app.post('/api/invoices', async (c) => {
    const body = await c.req.json();
    const id = crypto.randomUUID();
    const { lead_id, amount } = body;

    try {
        await c.env.DB.prepare(
            'INSERT INTO invoices (id, lead_id, amount, status) VALUES (?, ?, ?, ?)'
        ).bind(id, lead_id, amount, 'pending_advance').run();

        return c.json({ id, status: 'created' }, 201);
    } catch (e) {
        return c.json({ error: e.message }, 500);
    }
});

// Admin: Init DB (Optional helper if CD fails)
// app.post('/api/admin/init-db', async (c) => { ... })

export default app;
