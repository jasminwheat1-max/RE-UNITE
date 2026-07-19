import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, formatCents } from '../api';

export default function HostDashboard() {
  const [events, setEvents] = useState([]);
  const [pendingOffers, setPendingOffers] = useState([]);
  const [pendingCollabs, setPendingCollabs] = useState([]);
  const [posts, setPosts] = useState([]);
  const [postForm, setPostForm] = useState({ title: '', body: '', imageUrl: '' });
  const [error, setError] = useState('');

  async function refresh() {
    try {
      const [e, o, c, p] = await Promise.all([
        api.myEvents(),
        api.pendingOffers(),
        api.pendingCollaborations(),
        api.listPosts(),
      ]);
      setEvents(e.events);
      setPendingOffers(o.offers);
      setPendingCollabs(c.collaborations);
      setPosts(p.posts);
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitPost(e) {
    e.preventDefault();
    try {
      await api.createPost(postForm);
      setPostForm({ title: '', body: '', imageUrl: '' });
      refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function removePost(id) {
    await api.deletePost(id);
    refresh();
  }

  useEffect(() => {
    refresh();
  }, []);

  async function setStatus(id, status) {
    await api.setEventStatus(id, status);
    refresh();
  }

  async function reviewOffer(id, approve) {
    await api.reviewOffer(id, approve);
    refresh();
  }

  async function reviewCollab(id, approve) {
    await api.reviewCollaboration(id, approve);
    refresh();
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Host Dashboard</h1>
        <Link to="/host/events/new" className="button-link">
          + New Event
        </Link>
      </div>
      {error && <p className="error">{error}</p>}

      <section>
        <h2>Your Events</h2>
        {events.length === 0 && <p className="muted">No events yet.</p>}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Status</th>
                <th>Tickets sold</th>
                <th>Revenue</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td>
                    <Link to={`/host/events/${e.id}/edit`}>{e.title}</Link>
                  </td>
                  <td>{new Date(e.eventDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge badge-${e.status}`}>{e.status}</span>
                  </td>
                  <td>{e.ticketsSold}</td>
                  <td>{formatCents(e.revenueCents)}</td>
                  <td className="actions">
                    {e.status !== 'published' && (
                      <button onClick={() => setStatus(e.id, 'published')}>Publish</button>
                    )}
                    {e.status !== 'cancelled' && (
                      <button className="danger" onClick={() => setStatus(e.id, 'cancelled')}>
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>Pending Offer Requests ({pendingOffers.length})</h2>
        {pendingOffers.length === 0 && <p className="muted">Nothing pending.</p>}
        {pendingOffers.map((o) => (
          <div key={o.id} className="card review-card">
            <div>
              <strong>{o.title}</strong> by {o.partnerName}
              {o.eventTitle && <span className="muted"> &middot; linked to {o.eventTitle}</span>}
              <p>{o.description}</p>
              <p className="muted small">Fee paid: {formatCents(o.feeCents)}</p>
            </div>
            <div className="actions">
              <button onClick={() => reviewOffer(o.id, true)}>Approve</button>
              <button className="danger" onClick={() => reviewOffer(o.id, false)}>
                Reject
              </button>
            </div>
          </div>
        ))}
      </section>

      <section>
        <h2>Pending Collaboration Requests ({pendingCollabs.length})</h2>
        {pendingCollabs.length === 0 && <p className="muted">Nothing pending.</p>}
        {pendingCollabs.map((c) => (
          <div key={c.id} className="card review-card">
            <div>
              <strong>{c.partnerName}</strong> re: {c.eventTitle}
              <p>{c.message}</p>
              <p className="muted small">Fee paid: {formatCents(c.feeCents)}</p>
            </div>
            <div className="actions">
              <button onClick={() => reviewCollab(c.id, true)}>Accept</button>
              <button className="danger" onClick={() => reviewCollab(c.id, false)}>
                Reject
              </button>
            </div>
          </div>
        ))}
      </section>

      <section>
        <h2>Announcements</h2>
        <form onSubmit={submitPost} className="card">
          <label>
            Title
            <input
              required
              value={postForm.title}
              onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
            />
          </label>
          <label>
            Body
            <textarea
              required
              value={postForm.body}
              onChange={(e) => setPostForm({ ...postForm, body: e.target.value })}
            />
          </label>
          <label>
            Image URL (optional)
            <input
              value={postForm.imageUrl}
              onChange={(e) => setPostForm({ ...postForm, imageUrl: e.target.value })}
            />
          </label>
          <button type="submit">Publish to feed</button>
        </form>

        {posts.map((p) => (
          <div key={p.id} className="card review-card">
            <div>
              <strong>{p.title}</strong>
              <p className="muted small">{new Date(p.createdAt).toLocaleString()}</p>
              <p>{p.body}</p>
            </div>
            <div className="actions">
              <button className="danger" onClick={() => removePost(p.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
