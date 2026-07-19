import { Router } from 'express';
import { pool } from '../db.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

export const COLLAB_FEE_CENTS = 1000; // mock flat request fee

const COLLAB_FIELDS = `
  id, partner_id AS "partnerId", event_id AS "eventId", message,
  fee_cents AS "feeCents", status, created_at AS "createdAt"
`;

// --- Partner ---

router.get('/mine', requireRole('partner'), async (req, res) => {
  const { rows } = await pool.query(
    `SELECT ${COLLAB_FIELDS} FROM collaborations WHERE partner_id = $1 ORDER BY created_at DESC`,
    [req.session.userId]
  );
  res.json({ collaborations: rows });
});

router.post('/', requireRole('partner'), async (req, res) => {
  const { eventId, message } = req.body;
  if (!eventId || !message) {
    return res.status(400).json({ error: 'eventId and message are required' });
  }
  const event = await pool.query('SELECT id FROM events WHERE id = $1', [Number(eventId)]);
  if (event.rows.length === 0) return res.status(400).json({ error: 'Event not found' });

  const { rows } = await pool.query(
    `INSERT INTO collaborations (partner_id, event_id, message, fee_cents, status)
     VALUES ($1, $2, $3, $4, 'pending_review')
     RETURNING ${COLLAB_FIELDS}`,
    [req.session.userId, Number(eventId), message, COLLAB_FEE_CENTS]
  );
  res.json({ collaboration: rows[0] });
});

// --- Host ---

router.get('/host/pending', requireRole('host'), async (req, res) => {
  const { rows } = await pool.query(
    `SELECT c.id, c.partner_id AS "partnerId", c.event_id AS "eventId", c.message,
            c.fee_cents AS "feeCents", c.status, c.created_at AS "createdAt",
            u.name AS "partnerName", e.title AS "eventTitle"
     FROM collaborations c
     JOIN users u ON u.id = c.partner_id
     JOIN events e ON e.id = c.event_id
     WHERE c.status = 'pending_review'
     ORDER BY c.created_at ASC`
  );
  res.json({ collaborations: rows });
});

router.post('/:id/review', requireRole('host'), async (req, res) => {
  const { approve } = req.body;
  const { rows } = await pool.query(
    `UPDATE collaborations SET status = $1 WHERE id = $2 RETURNING ${COLLAB_FIELDS}`,
    [approve ? 'accepted' : 'rejected', Number(req.params.id)]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Collaboration request not found' });
  res.json({ collaboration: rows[0] });
});

export default router;
