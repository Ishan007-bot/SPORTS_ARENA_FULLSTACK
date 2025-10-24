import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { isConnected } = useSocket();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-text">SPORTS ARENA</span>
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
          
          <Link to="/tournament" className="btn btn-primary admin-btn">
            ADMIN LOGIN
          </Link>

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
