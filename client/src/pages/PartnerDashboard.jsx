import { useEffect, useState } from 'react';
import { api, formatCents } from '../api';

export default function PartnerDashboard() {
  const [offers, setOffers] = useState([]);
  const [collabs, setCollabs] = useState([]);
  const [events, setEvents] = useState([]);
  const [offerForm, setOfferForm] = useState({ title: '', description: '', eventId: '' });
  const [collabForm, setCollabForm] = useState({ eventId: '', message: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function refresh() {
    try {
      const [o, c, e] = await Promise.all([api.myOffers(), api.myCollaborations(), api.listEvents()]);
      setOffers(o.offers);
      setCollabs(c.collaborations);
      setEvents(e.events);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function submitOffer(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    try {
      await api.createOffer({
        ...offerForm,
        eventId: offerForm.eventId || undefined,
      });
      setOfferForm({ title: '', description: '', eventId: '' });
      setNotice('Offer submitted and fee paid (mock). Awaiting host approval.');
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitCollab(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    try {
      await api.createCollaboration(collabForm);
      setCollabForm({ eventId: '', message: '' });
      setNotice('Collaboration request submitted and fee paid (mock). Awaiting host approval.');
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <h1>Partner Dashboard</h1>
      {error && <p className="error">{error}</p>}
      {notice && <p className="success">{notice}</p>}

      <div className="two-col">
        <section className="card">
          <h2>Submit a paid offer ($25 mock fee)</h2>
          <form onSubmit={submitOffer}>
            <label>
              Title
              <input
                required
                value={offerForm.title}
                onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
              />
            </label>
            <label>
              Description
              <textarea
                required
                value={offerForm.description}
                onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
              />
            </label>
            <label>
              Link to an event (optional)
              <select
                value={offerForm.eventId}
                onChange={(e) => setOfferForm({ ...offerForm, eventId: e.target.value })}
              >
                <option value="">— General offer —</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit">Pay $25 &amp; submit (mock)</button>
          </form>
        </section>

        <section className="card">
          <h2>Request a collaboration ($10 mock fee)</h2>
          <form onSubmit={submitCollab}>
            <label>
              Event
              <select
                required
                value={collabForm.eventId}
                onChange={(e) => setCollabForm({ ...collabForm, eventId: e.target.value })}
              >
                <option value="">Choose an event...</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Message to host
              <textarea
                required
                value={collabForm.message}
                onChange={(e) => setCollabForm({ ...collabForm, message: e.target.value })}
              />
            </label>
            <button type="submit">Pay $10 &amp; submit (mock)</button>
          </form>
        </section>
      </div>

      <section>
        <h2>Your Offers</h2>
        {offers.length === 0 && <p className="muted">None submitted yet.</p>}
        {offers.map((o) => (
          <div key={o.id} className="card review-card">
            <div>
              <strong>{o.title}</strong>
              <p>{o.description}</p>
              <p className="muted small">Fee: {formatCents(o.feeCents)}</p>
            </div>
            <span className={`badge badge-${o.status}`}>{o.status.replace('_', ' ')}</span>
          </div>
        ))}
      </section>

      <section>
        <h2>Your Collaboration Requests</h2>
        {collabs.length === 0 && <p className="muted">None submitted yet.</p>}
        {collabs.map((c) => (
          <div key={c.id} className="card review-card">
            <div>
              <p>{c.message}</p>
              <p className="muted small">Fee: {formatCents(c.feeCents)}</p>
            </div>
            <span className={`badge badge-${c.status}`}>{c.status.replace('_', ' ')}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
