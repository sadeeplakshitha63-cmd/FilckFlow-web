import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Film, Search, User, LogIn, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
    setShowModal(false);
  };

  return (
    <>
      <nav className="navbar glass-panel">
        <div className="container nav-content">
          <Link to="/" className="brand">
            <Film className="brand-icon" style={{ color: 'var(--primary)' }} />
            <span className="brand-text" style={{ color: 'var(--primary)', fontWeight: '900', letterSpacing: '-1px', fontSize: '1.8rem', textTransform: 'uppercase' }}>FlickFlow</span>
          </Link>
          
          <div className="search-bar">
            <Search className="search-icon" size={18} />
            <input type="text" placeholder="Search for movies..." />
          </div>
          
          <div className="nav-actions">
            {isLoggedIn ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--primary)' }}>VIP User</span>
                <button className="btn-icon" onClick={() => setIsLoggedIn(false)} title="Sign Out">
                  <User size={20} />
                </button>
              </div>
            ) : (
              <button className="btn-primary" onClick={() => setShowModal(true)}>
                <LogIn size={18} /> Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Login Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel animate-fade-in">
            <button className="modal-close" onClick={() => setShowModal(false)}><X size={24} /></button>
            <h2 className="title-gradient" style={{ marginBottom: '20px', fontSize: '2rem' }}>Welcome Back</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Sign in to enjoy ad-free 480p downloads and FlickFlow Exclusives.</p>
            
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input type="email" placeholder="Email Address" required className="modal-input" />
              <input type="password" placeholder="Password" required className="modal-input" />
              <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '10px', fontSize: '1.1rem' }}>
                Sign In / Join
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
