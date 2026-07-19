import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import bcrypt from 'bcryptjs';

// Vercel's serverless Node runtime can't reliably hold a raw TCP connection
// to Postgres (connections just hang) - Neon's driver talks over WebSocket
// instead, which works the same in plain Node (local dev) and serverless.
neonConfig.webSocketConstructor = ws;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 8000,
  max: 3, // serverless: many short-lived invocations, keep this small
});

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('host','partner')),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    host_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date TIMESTAMPTZ NOT NULL,
    location TEXT NOT NULL,
    price_cents INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS tickets (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id),
    buyer_name TEXT NOT NULL,
    buyer_email TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    total_cents INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'paid',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS offers (
    id SERIAL PRIMARY KEY,
    partner_id INTEGER NOT NULL REFERENCES users(id),
    event_id INTEGER REFERENCES events(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    fee_cents INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review','active','rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS collaborations (
    id SERIAL PRIMARY KEY,
    partner_id INTEGER NOT NULL REFERENCES users(id),
    event_id INTEGER NOT NULL REFERENCES events(id),
    message TEXT NOT NULL,
    fee_cents INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review','accepted','rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    host_id INTEGER NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
`;

export async function initDb() {
  await pool.query(SCHEMA);

  const { rows } = await pool.query('SELECT id FROM users WHERE role = $1 LIMIT 1', ['host']);
  if (rows.length === 0) {
    const passwordHash = bcrypt.hashSync('host123', 10);
    await pool.query(
      'INSERT INTO users (email, password_hash, role, name) VALUES ($1, $2, $3, $4)',
      ['host@example.com', passwordHash, 'host', 'Event Host']
    );
    console.log('Seeded default host account: host@example.com / host123');
  }
}
