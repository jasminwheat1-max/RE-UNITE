import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';

const router = Router();

function publicUser(user) {
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'email, password, and name are required' });
  }

  const existing = await pool.query('SELECT id FROM users WHERE lower(email) = lower($1)', [email]);
  if (existing.rows.length > 0) {
    return res.status(409).json({ error: 'An account with that email already exists' });
  }

  // Public signup always creates a partner account; the host account is seeded separately.
  const passwordHash = bcrypt.hashSync(password, 10);
  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, role, name)
     VALUES ($1, $2, 'partner', $3)
     RETURNING id, email, name, role`,
    [email, passwordHash, name]
  );
  const user = rows[0];

  req.session.userId = user.id;
  req.session.role = user.role;
  res.json({ user: publicUser(user) });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const { rows } = await pool.query('SELECT * FROM users WHERE lower(email) = lower($1)', [email || '']);
  const user = rows[0];
  if (!user || !bcrypt.compareSync(password || '', user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  req.session.userId = user.id;
  req.session.role = user.role;
  res.json({ user: publicUser(user) });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

router.get('/me', async (req, res) => {
  if (!req.session.userId) return res.json({ user: null });
  const { rows } = await pool.query('SELECT id, email, name, role FROM users WHERE id = $1', [
    req.session.userId,
  ]);
  res.json({ user: rows[0] ? publicUser(rows[0]) : null });
});

export default router;
