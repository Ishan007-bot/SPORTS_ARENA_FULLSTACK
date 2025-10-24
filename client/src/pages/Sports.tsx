import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Sports.css';

const Sports: React.FC = () => {
  const sports = [
    {
      id: 'cricket',
      name: 'Cricket',
      description: 'Live cricket scoring and player statistics',
      icon: '🏏',
      color: '#e74c3c',
      gradient: 'linear-gradient(135deg, #e74c3c, #c0392b)'
    },
    {
      id: 'football',
      name: 'Football',
      description: 'Real-time football match updates',
      icon: '⚽',
      color: '#27ae60',
      gradient: 'linear-gradient(135deg, #27ae60, #2ecc71)'
    },
    {
      id: 'basketball',
      name: 'Basketball',
      description: 'Basketball game statistics and live scores',
      icon: '🏀',
      color: '#f39c12',
      gradient: 'linear-gradient(135deg, #f39c12, #e67e22)'
    },
    {
      id: 'volleyball',
      name: 'Volleyball',
      description: 'Volleyball match tracking and scoring',
      icon: '🏐',
      color: '#9b59b6',
      gradient: 'linear-gradient(135deg, #9b59b6, #8e44ad)'
    },
    {
      id: 'table-tennis',
      name: 'Table Tennis',
      description: 'Ping pong scoring and tournament management',
      icon: '🏓',
      color: '#3498db',
      gradient: 'linear-gradient(135deg, #3498db, #2980b9)'
    },
    {
      id: 'chess',
      name: 'Chess',
      description: 'Chess tournament scoring and rankings',
      icon: '♟️',
      color: '#2c3e50',
      gradient: 'linear-gradient(135deg, #2c3e50, #34495e)'
    },
    {
      id: 'badminton',
      name: 'Badminton',
      description: 'Badminton match tracking and scoring',
      icon: '🏸',
      color: '#e67e22',
      gradient: 'linear-gradient(135deg, #e67e22, #d35400)'
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
    <div className="sports">
      <div className="sports-container">
        <motion.div 
          className="sports-header"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="sports-title">Choose Your Sport</h1>
          <p className="sports-description">
            Select a sport to start scoring and tracking matches
          </p>
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
              <div 
                className="sport-card-header"
                style={{ background: sport.gradient }}
              >
                <div className="sport-icon">{sport.icon}</div>
              </div>
              <div className="sport-card-content">
                <h3 className="sport-name">{sport.name}</h3>
                <p className="sport-description">{sport.description}</p>
                <Link 
                  to={`/arena/${sport.id}`} 
                  className="sport-enter-btn"
                  style={{ background: sport.gradient }}
                >
                  ENTER ARENA
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Sports;
