import { Link } from 'react-router-dom';
import { formatCents } from '../api';

export default function EventCard({ event }) {
  return (
    <Link to={`/events/${event.id}`} className="card event-card">
      {event.imageUrl && <img src={event.imageUrl} alt={event.title} className="event-card-img" />}
      <div className="card-body">
        <h3>{event.title}</h3>
        <p className="muted">
          {new Date(event.eventDate).toLocaleString()} &middot; {event.location}
        </p>
        <p className="price">{event.priceCents === 0 ? 'Free' : formatCents(event.priceCents)}</p>
      </div>
    </Link>
  );
}
