import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        EventHub
      </Link>
      <div className="nav-links">
        <Link to="/">Events</Link>
        <Link to="/feed">Updates</Link>
        <Link to="/deals">Deals</Link>
        {!user && <Link to="/login">Log in</Link>}
        {!user && <Link to="/signup">Sign up</Link>}
        {user?.role === 'host' && <Link to="/host">Host Dashboard</Link>}
        {user?.role === 'partner' && <Link to="/partner">Partner Dashboard</Link>}
        {user && (
          <button className="link-button" onClick={handleLogout}>
            Log out ({user.name})
          </button>
        )}
      </div>
    </nav>
  );
}
