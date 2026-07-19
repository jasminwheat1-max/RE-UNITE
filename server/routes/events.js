import { Router } from 'express';
import { pool } from '../db.js';
import { requireRole } from '../middleware/auth.js';

const router = Router();

const EVENT_FIELDS = `
  id, host_id AS "hostId", title, description,
  event_date AS "eventDate", location, price_cents AS "priceCents",
  image_url AS "imageUrl", status, created_at AS "createdAt"
`;

// --- Public ---

router.get('/', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT ${EVENT_FIELDS} FROM events WHERE status = 'published' ORDER BY event_date ASC`
  );
  res.json({ events: rows });
});

router.get('/:id', async (req, res) => {
  const { rows } = await pool.query(
    `SELECT ${EVENT_FIELDS} FROM events WHERE id = $1 AND status = 'published'`,
    [Number(req.params.id)]
  );
  const event = rows[0];
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const offers = await pool.query(
    `SELECT id, title, description FROM offers WHERE event_id = $1 AND status = 'active'`,
    [event.id]
  );
  res.json({ event, offers: offers.rows });
});

router.post('/:id/tickets', async (req, res) => {
  const eventId = Number(req.params.id);
  const { rows: eventRows } = await pool.query(
    `SELECT ${EVENT_FIELDS} FROM events WHERE id = $1 AND status = 'published'`,
    [eventId]
  );
  const event = eventRows[0];
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const { buyerName, buyerEmail, quantity } = req.body;
  const qty = Number(quantity) || 1;
  if (!buyerName || !buyerEmail || qty < 1) {
    return res.status(400).json({ error: 'buyerName, buyerEmail, and a valid quantity are required' });
  }

  const totalCents = event.priceCents * qty;
  const { rows } = await pool.query(
    `INSERT INTO tickets (event_id, buyer_name, buyer_email, quantity, total_cents, status)
     VALUES ($1, $2, $3, $4, $5, 'paid')
     RETURNING id, event_id AS "eventId", buyer_name AS "buyerName", buyer_email AS "buyerEmail",
               quantity, total_cents AS "totalCents", status, created_at AS "createdAt"`,
    [eventId, buyerName, buyerEmail, qty, totalCents]
  );
  res.json({ ticket: rows[0] });
});

// --- Host-only ---

router.get('/host/mine', requireRole('host'), async (req, res) => {
  const { rows } = await pool.query(
    `SELECT e.id, e.host_id AS "hostId", e.title, e.description, e.event_date AS "eventDate",
            e.location, e.price_cents AS "priceCents", e.image_url AS "imageUrl", e.status,
            e.created_at AS "createdAt",
            COALESCE(SUM(t.quantity), 0)::int AS "ticketsSold",
            COALESCE(SUM(t.total_cents), 0)::int AS "revenueCents"
     FROM events e
     LEFT JOIN tickets t ON t.event_id = e.id
     WHERE e.host_id = $1
     GROUP BY e.id
     ORDER BY e.created_at DESC`,
    [req.session.userId]
  );
  res.json({ events: rows });
});

router.post('/', requireRole('host'), async (req, res) => {
  const { title, description, eventDate, location, priceCents, imageUrl } = req.body;
  if (!title || !description || !eventDate || !location) {
    return res.status(400).json({ error: 'title, description, eventDate, and location are required' });
  }
  const { rows } = await pool.query(
    `INSERT INTO events (host_id, title, description, event_date, location, price_cents, image_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING ${EVENT_FIELDS}`,
    [req.session.userId, title, description, eventDate, location, Number(priceCents) || 0, imageUrl || '']
  );
  res.json({ event: rows[0] });
});

router.put('/:id', requireRole('host'), async (req, res) => {
  const { title, description, eventDate, location, priceCents, imageUrl } = req.body;
  const { rows } = await pool.query(
    `UPDATE events SET
       title = COALESCE($1, title),
       description = COALESCE($2, description),
       event_date = COALESCE($3, event_date),
       location = COALESCE($4, location),
       price_cents = COALESCE($5, price_cents),
       image_url = COALESCE($6, image_url)
     WHERE id = $7 AND host_id = $8
     RETURNING ${EVENT_FIELDS}`,
    [title, description, eventDate, location, priceCents !== undefined ? Number(priceCents) || 0 : null,
      imageUrl, Number(req.params.id), req.session.userId]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Event not found' });
  res.json({ event: rows[0] });
});

router.post('/:id/status', requireRole('host'), async (req, res) => {
  const { status } = req.body;
  if (!['draft', 'published', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const { rows } = await pool.query(
    `UPDATE events SET status = $1 WHERE id = $2 AND host_id = $3 RETURNING ${EVENT_FIELDS}`,
    [status, Number(req.params.id), req.session.userId]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Event not found' });
  res.json({ event: rows[0] });
});

export default router;
