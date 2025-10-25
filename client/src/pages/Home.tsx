import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';
import './Home.css';

const Home: React.FC = () => {
  const sports = [
    {
      id: 'football',
      name: 'Football',
      description: 'Real-time football match updates',
      icon: '/football-icon.png'
    },
    {
      id: 'basketball',
      name: 'Basketball',
      description: 'Basketball game statistics and live scores',
      icon: '/basketball-icon.png'
    },
    {
      id: 'volleyball',
      name: 'Volleyball',
      description: 'Volleyball match tracking and scoring',
      icon: '/volleyball-icon.png'
    },
    {
      id: 'table-tennis',
      name: 'Table Tennis',
      description: 'Ping pong scoring and tournament management',
      icon: '/table-tennis-icon.png'
    },
    {
      id: 'chess',
      name: 'Chess',
      description: 'Chess tournament scoring and rankings',
      icon: '/chess-icon.png'
    },
    {
      id: 'cricket',
      name: 'Cricket',
      description: 'Live cricket scoring and player statistics',
      icon: '/cricket-icon.png'
    },
    {
      id: 'badminton',
      name: 'Badminton',
      description: 'Badminton match tracking and scoring',
      icon: '/badminton-icon.png'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="home">
      <div className="home-container">
        <motion.div 
          className="home-hero"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="hero-title">
            <span className="hero-welcome">Welcome to</span>
            <span className="hero-brand">Sports Arena</span>
          </h1>
          <p className="hero-description">
            SST's ultimate destination for live sports scoring and player statistics
          </p>
          <div className="hero-actions">
            <Link to="/sports" className="btn btn-primary">
              GET STARTED
            </Link>
            <Link to="/live-scores" className="btn btn-secondary">
              VIEW LIVE SCORES
            </Link>
          </div>
        </motion.div>

        <motion.div 
          className="sports-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {sports.map((sport, index) => (
            <motion.div
              key={sport.id}
              className="sport-card"
              variants={cardVariants}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="sport-card-header">
                <img src={sport.icon} alt={sport.name} className="sport-icon" />
              </div>
              <div className="sport-card-content">
                <h3 className="sport-name">{sport.name}</h3>
                <p className="sport-description">{sport.description}</p>
                <Link 
                  to={`/arena/${sport.id}`} 
                  className="sport-enter-btn"
                >
                  ENTER ARENA
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="scrolling-section"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="scrolling-container">
            <div className="scrolling-content">
              <img src="/scrolling-1.jpg" alt="Sports Image 1" className="scrolling-icon" />
              <img src="/scrolling-2.jpg" alt="Sports Image 2" className="scrolling-icon" />
              <img src="/scrolling-3.jpg" alt="Sports Image 3" className="scrolling-icon" />
              <img src="/scrolling-4.jpg" alt="Sports Image 4" className="scrolling-icon" />
              <img src="/scrolling-5.jpg" alt="Sports Image 5" className="scrolling-icon" />
              <img src="/scrolling-6.png" alt="Sports Image 6" className="scrolling-icon" />
              <img src="/scrolling-7.png" alt="Sports Image 7" className="scrolling-icon" />
              <img src="/scrolling-8.png" alt="Sports Image 8" className="scrolling-icon" />
              <img src="/scrolling-1.jpg" alt="Sports Image 1" className="scrolling-icon" />
              <img src="/scrolling-2.jpg" alt="Sports Image 2" className="scrolling-icon" />
              <img src="/scrolling-3.jpg" alt="Sports Image 3" className="scrolling-icon" />
              <img src="/scrolling-4.jpg" alt="Sports Image 4" className="scrolling-icon" />
              <img src="/scrolling-5.jpg" alt="Sports Image 5" className="scrolling-icon" />
              <img src="/scrolling-6.png" alt="Sports Image 6" className="scrolling-icon" />
              <img src="/scrolling-7.png" alt="Sports Image 7" className="scrolling-icon" />
              <img src="/scrolling-8.png" alt="Sports Image 8" className="scrolling-icon" />
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="features-section"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <img 
            src="/why-choose-image.png" 
            alt="Why Choose Sports Arena?" 
            className="why-choose-image"
          />
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">Live Scoring</h3>
              <p className="feature-description">
                Real-time score updates for all your favorite sports
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3 className="feature-title">Player Stats</h3>
              <p className="feature-description">
                Comprehensive player statistics and performance tracking
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3 className="feature-title">Tournaments</h3>
              <p className="feature-description">
                Organize and manage tournaments across multiple sports
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
