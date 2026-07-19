import { Router } from 'express';
import { pool } from '../db.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

const POST_FIELDS = `
  id, host_id AS "hostId", title, body, image_url AS "imageUrl", created_at AS "createdAt"
`;

// --- Public ---

router.get('/', async (req, res) => {
  const { rows } = await pool.query(`SELECT ${POST_FIELDS} FROM posts ORDER BY created_at DESC`);
  res.json({ posts: rows });
});

// --- Host ---

router.post('/', requireRole('host'), async (req, res) => {
  const { title, body, imageUrl } = req.body;
  if (!title || !body) {
    return res.status(400).json({ error: 'title and body are required' });
  }
  const { rows } = await pool.query(
    `INSERT INTO posts (host_id, title, body, image_url) VALUES ($1, $2, $3, $4) RETURNING ${POST_FIELDS}`,
    [req.session.userId, title, body, imageUrl || '']
  );
  res.json({ post: rows[0] });
});

router.delete('/:id', requireRole('host'), async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM posts WHERE id = $1', [Number(req.params.id)]);
  if (rowCount === 0) return res.status(404).json({ error: 'Post not found' });
  res.json({ ok: true });
});

export default router;
