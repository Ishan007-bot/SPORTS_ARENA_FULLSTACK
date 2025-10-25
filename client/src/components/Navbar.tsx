import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isConnected } = useSocket();
  const { user, isAuthenticated, logout, canScore, canAdmin } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img 
            src="/sports-arena-logo.png" 
            alt="Sports Arena" 
            className="logo-image"
          />
        </Link>

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link 
            to="/" 
            className={`navbar-link ${isActive('/') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/sports" 
            className={`navbar-link ${isActive('/sports') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Sports
          </Link>
          <Link 
            to="/live-scores" 
            className={`navbar-link ${isActive('/live-scores') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Live Scores
          </Link>
          <Link 
            to="/history" 
            className={`navbar-link ${isActive('/history') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            History
          </Link>
        </div>

        <div className="navbar-actions">
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            <div className="status-dot"></div>
            <span className="status-text">
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
          
          {isAuthenticated ? (
            <div className="user-info">
              <span className="user-name">{user?.username}</span>
              <span className={`user-role ${user?.role}`}>{user?.role?.toUpperCase()}</span>
              {canAdmin() && (
                <Link to="/tournament" className="btn btn-primary admin-btn">
                  ADMIN
                </Link>
              )}
              <button onClick={handleLogout} className="btn btn-secondary logout-btn">
                LOGOUT
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-primary login-btn">
                LOGIN
              </Link>
              <Link to="/register" className="btn btn-secondary register-btn">
                REGISTER
              </Link>
            </div>
          )}

          <button 
            className="mobile-menu-toggle"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
