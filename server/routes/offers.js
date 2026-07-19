import { Router } from 'express';
import { pool } from '../db.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

export const OFFER_FEE_CENTS = 2500; // mock flat listing fee

const OFFER_FIELDS = `
  id, partner_id AS "partnerId", event_id AS "eventId", title, description,
  fee_cents AS "feeCents", status, created_at AS "createdAt"
`;

// --- Public ---

router.get('/active', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT ${OFFER_FIELDS} FROM offers WHERE status = 'active' ORDER BY created_at DESC`
  );
  res.json({ offers: rows, feeCents: OFFER_FEE_CENTS });
});

// --- Partner ---

router.get('/mine', requireRole('partner'), async (req, res) => {
  const { rows } = await pool.query(
    `SELECT ${OFFER_FIELDS} FROM offers WHERE partner_id = $1 ORDER BY created_at DESC`,
    [req.session.userId]
  );
  res.json({ offers: rows });
});

router.post('/', requireRole('partner'), async (req, res) => {
  const { title, description, eventId } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'title and description are required' });
  }
  let linkedEventId = null;
  if (eventId) {
    const event = await pool.query('SELECT id FROM events WHERE id = $1', [Number(eventId)]);
    if (event.rows.length === 0) return res.status(400).json({ error: 'Linked event not found' });
    linkedEventId = Number(eventId);
  }
  const { rows } = await pool.query(
    `INSERT INTO offers (partner_id, event_id, title, description, fee_cents, status)
     VALUES ($1, $2, $3, $4, $5, 'pending_review')
     RETURNING ${OFFER_FIELDS}`,
    [req.session.userId, linkedEventId, title, description, OFFER_FEE_CENTS]
  );
  res.json({ offer: rows[0] });
});

// --- Host ---

router.get('/host/pending', requireRole('host'), async (req, res) => {
  const { rows } = await pool.query(
    `SELECT o.id, o.partner_id AS "partnerId", o.event_id AS "eventId", o.title, o.description,
            o.fee_cents AS "feeCents", o.status, o.created_at AS "createdAt",
            u.name AS "partnerName", e.title AS "eventTitle"
     FROM offers o
     JOIN users u ON u.id = o.partner_id
     LEFT JOIN events e ON e.id = o.event_id
     WHERE o.status = 'pending_review'
     ORDER BY o.created_at ASC`
  );
  res.json({ offers: rows });
});

router.post('/:id/review', requireRole('host'), async (req, res) => {
  const { approve } = req.body;
  const { rows } = await pool.query(
    `UPDATE offers SET status = $1 WHERE id = $2 RETURNING ${OFFER_FIELDS}`,
    [approve ? 'active' : 'rejected', Number(req.params.id)]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Offer not found' });
  res.json({ offer: rows[0] });
});

export default router;
