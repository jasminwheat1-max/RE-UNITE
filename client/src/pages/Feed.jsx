import { useEffect, useState } from 'react';
import { api } from '../api';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .listPosts()
      .then((data) => setPosts(data.posts))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="page narrow">
      <h1>Updates</h1>
      <p className="muted">Announcements and recaps from the host.</p>
      {error && <p className="error">{error}</p>}
      {posts.length === 0 && !error && <p className="muted">Nothing posted yet.</p>}
      <div className="feed-list">
        {posts.map((p) => (
          <article key={p.id} className="card feed-post">
            {p.imageUrl && <img src={p.imageUrl} alt={p.title} className="feed-post-img" />}
            <h3>{p.title}</h3>
            <p className="muted small">{new Date(p.createdAt).toLocaleString()}</p>
            <p>{p.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
