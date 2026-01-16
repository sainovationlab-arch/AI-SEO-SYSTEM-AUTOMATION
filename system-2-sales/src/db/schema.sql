-- D1 / SQLite Schema

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, -- UUID stored as TEXT
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'user',
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

-- Leads Table
CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    business_name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'new',
    notes TEXT,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    lead_id TEXT REFERENCES leads(id),
    amount REAL NOT NULL,
    advance_amount REAL,
    remaining_amount REAL,
    status TEXT DEFAULT 'pending_advance',
    due_date INTEGER, -- Storage as unix timestamp or ISO string usually, integer is easy for sorting
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

-- Payment Proofs Table
CREATE TABLE IF NOT EXISTS payment_proofs (
    id TEXT PRIMARY KEY,
    invoice_id TEXT REFERENCES invoices(id),
    file_path TEXT NOT NULL,
    uploaded_by TEXT REFERENCES users(id),
    status TEXT DEFAULT 'pending',
    verified_at INTEGER,
    verified_by TEXT REFERENCES users(id),
    created_at INTEGER DEFAULT (unixepoch())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_lead_id ON invoices(lead_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_invoice_id ON payment_proofs(invoice_id);
