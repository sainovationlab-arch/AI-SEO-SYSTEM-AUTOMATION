import { sign, verify } from 'hono/jwt'

const FALLBACK_SECRET = 'PHASE5_SUPER_SECRET_KEY_12345'; // Fallback for dev/demo

// Hardcoded users for Phase 5
const USERS = [
    { email: 'client@example.com', password: 'password123', role: 'client', id: 'u1' },
    { email: 'admin@example.com', password: 'admin123', role: 'admin', id: 'u2' }
];

export const authRoutes = (app) => {
    app.post('/api/auth/login', async (c) => {
        try {
            const { email, password } = await c.req.json();
            const user = USERS.find(u => u.email === email && u.password === password);

            if (!user) {
                return c.json({ success: false, error: 'Invalid credentials' }, 401);
            }

            const payload = {
                sub: user.id,
                role: user.role,
                email: user.email,
                exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 24 hours
            };

            const secret = c.env?.JWT_SECRET || FALLBACK_SECRET;
            const token = await sign(payload, secret);

            return c.json({
                success: true,
                token,
                user: { email: user.email, role: user.role }
            });
        } catch (e) {
            return c.json({ success: false, error: 'Login failed: ' + e.message }, 500);
        }
    });
};

export const authMiddleware = async (c, next) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ success: false, error: 'Unauthorized: Missing Token' }, 401);
    }

    const token = authHeader.split(' ')[1];
    try {
        const secret = c.env?.JWT_SECRET || FALLBACK_SECRET;
        const payload = await verify(token, secret);
        c.set('user', payload);
        await next();
    } catch (e) {
        return c.json({ success: false, error: 'Unauthorized: Invalid Token' }, 401);
    }
};

export const roleGuard = (requiredRole) => async (c, next) => {
    const user = c.get('user');
    if (!user || user.role !== requiredRole) {
        return c.json({ success: false, error: 'Forbidden: Access Denied' }, 403);
    }
    await next();
};
