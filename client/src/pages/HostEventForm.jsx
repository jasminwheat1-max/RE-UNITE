import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';

const emptyForm = {
  title: '',
  description: '',
  eventDate: '',
  location: '',
  priceCents: 0,
  imageUrl: '',
};

export default function HostEventForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api.myEvents().then((data) => {
      const event = data.events.find((e) => String(e.id) === id);
      if (event) {
        setForm({
          title: event.title,
          description: event.description,
          eventDate: event.eventDate.slice(0, 16),
          location: event.location,
          priceCents: event.priceCents,
          imageUrl: event.imageUrl || '',
        });
      }
    });
  }, [id, isEdit]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { ...form, priceCents: Math.round(Number(form.priceCents) * 1) };
      if (isEdit) {
        await api.updateEvent(id, payload);
      } else {
        await api.createEvent(payload);
      }
      navigate('/host');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page narrow">
      <h1>{isEdit ? 'Edit Event' : 'New Event'}</h1>
      <form onSubmit={handleSubmit} className="card">
        <label>
          Title
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </label>
        <label>
          Description
          <textarea
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>
        <label>
          Date &amp; time
          <input
            required
            type="datetime-local"
            value={form.eventDate}
            onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
          />
        </label>
        <label>
          Location
          <input
            required
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </label>
        <label>
          Ticket price (cents, 0 = free)
          <input
            type="number"
            min="0"
            value={form.priceCents}
            onChange={(e) => setForm({ ...form, priceCents: e.target.value })}
          />
        </label>
        <label>
          Image URL (optional)
          <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create event (draft)'}
        </button>
      </form>
    </div>
  );
}
