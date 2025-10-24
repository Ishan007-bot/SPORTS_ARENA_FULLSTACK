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
      icon: '/cricket-icon.png'
    },
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
    <div className="sports">
      <div className="sports-container">
        <motion.div 
          className="sports-header"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img 
            src="/choose-your-sport-image.png" 
            alt="Choose Your Sport" 
            className="choose-sport-image"
          />
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
      </div>
    </div>
  );
};

export default Sports;
