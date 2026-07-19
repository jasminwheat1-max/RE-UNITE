import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, formatCents } from '../api';

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [offers, setOffers] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ buyerName: '', buyerEmail: '', quantity: 1 });
  const [ticket, setTicket] = useState(null);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    api
      .getEvent(id)
      .then((data) => {
        setEvent(data.event);
        setOffers(data.offers);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  async function handleBuy(e) {
    e.preventDefault();
    setError('');
    setBuying(true);
    try {
      const data = await api.buyTicket(id, form);
      setTicket(data.ticket);
    } catch (err) {
      setError(err.message);
    } finally {
      setBuying(false);
    }
  }

  if (error && !event) return <p className="error page">{error}</p>;
  if (!event) return <p className="page-loading">Loading...</p>;

  return (
    <div className="page">
      {event.imageUrl && <img src={event.imageUrl} alt={event.title} className="event-hero" />}
      <h1>{event.title}</h1>
      <p className="muted">
        {new Date(event.eventDate).toLocaleString()} &middot; {event.location}
      </p>
      <p>{event.description}</p>
      <p className="price">{event.priceCents === 0 ? 'Free' : formatCents(event.priceCents)} / ticket</p>

      {offers.length > 0 && (
        <div className="offers-inline">
          <h3>Promoted offers</h3>
          {offers.map((o) => (
            <div key={o.id} className="card offer-card">
              <strong>{o.title}</strong>
              <p>{o.description}</p>
            </div>
          ))}
        </div>
      )}

      <div className="card checkout-card">
        <h2>Get tickets</h2>
        {ticket ? (
          <p className="success">
            Purchased {ticket.quantity} ticket(s) for {formatCents(ticket.totalCents)}. Confirmation sent to{' '}
            {ticket.buyerEmail}. (Mock payment — no real charge was made.)
          </p>
        ) : (
          <form onSubmit={handleBuy}>
            <label>
              Name
              <input
                required
                value={form.buyerName}
                onChange={(e) => setForm({ ...form, buyerName: e.target.value })}
              />
            </label>
            <label>
              Email
              <input
                required
                type="email"
                value={form.buyerEmail}
                onChange={(e) => setForm({ ...form, buyerEmail: e.target.value })}
              />
            </label>
            <label>
              Quantity
              <input
                required
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </label>
            {error && <p className="error">{error}</p>}
            <button type="submit" disabled={buying}>
              {buying ? 'Processing...' : `Pay ${formatCents(event.priceCents * (Number(form.quantity) || 1))} (mock)`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
