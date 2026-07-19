import { useEffect, useState } from 'react';
import { api } from '../api';
import EventCard from '../components/EventCard';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .listEvents()
      .then((data) => setEvents(data.events))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="page">
      <h1>Upcoming Events</h1>
      {error && <p className="error">{error}</p>}
      {events.length === 0 && !error && <p className="muted">No events published yet.</p>}
      <div className="grid">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
