import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Deals() {
  const [offers, setOffers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .activeOffers()
      .then((data) => setOffers(data.offers))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="page">
      <h1>Partner Deals</h1>
      <p className="muted">Offers and promotions from our partners.</p>
      {error && <p className="error">{error}</p>}
      {offers.length === 0 && !error && <p className="muted">No active offers right now.</p>}
      <div className="grid">
        {offers.map((o) => (
          <div key={o.id} className="card">
            <h3>{o.title}</h3>
            <p>{o.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
