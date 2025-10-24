import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './History.css';

const History: React.FC = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches');
      const data = await response.json();
      if (data.success) {
        setMatches(data.data);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSportIcon = (sport: string) => {
    const icons: { [key: string]: string } = {
      cricket: '🏏',
      football: '⚽',
      basketball: '🏀',
      volleyball: '🏐',
      badminton: '🏸',
      'table-tennis': '🏓',
      chess: '♟️'
    };
    return icons[sport] || '🏆';
  };

  const getSportName = (sport: string) => {
    const names: { [key: string]: string } = {
      cricket: 'Cricket',
      football: 'Football',
      basketball: 'Basketball',
      volleyball: 'Volleyball',
      badminton: 'Badminton',
      'table-tennis': 'Table Tennis',
      chess: 'Chess'
    };
    return names[sport] || sport;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredMatches = matches.filter(match => {
    if (filter === 'all') return true;
    return match.sport === filter;
  });

  if (loading) {
    return (
      <div className="history">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading match history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history">
      <div className="history-container">
        <motion.div 
          className="history-header"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="history-title">Match History</h1>
          <p className="history-description">
            View all completed matches and tournaments
          </p>
        </motion.div>

        <motion.div 
          className="filter-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Sports
            </button>
            <button 
              className={`filter-btn ${filter === 'cricket' ? 'active' : ''}`}
              onClick={() => setFilter('cricket')}
            >
              Cricket
            </button>
            <button 
              className={`filter-btn ${filter === 'football' ? 'active' : ''}`}
              onClick={() => setFilter('football')}
            >
              Football
            </button>
            <button 
              className={`filter-btn ${filter === 'basketball' ? 'active' : ''}`}
              onClick={() => setFilter('basketball')}
            >
              Basketball
            </button>
          </div>
        </motion.div>

        {filteredMatches.length === 0 ? (
          <motion.div 
            className="no-matches"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="no-matches-icon">📊</div>
            <h2>No matches found</h2>
            <p>Start a match to see it in your history!</p>
          </motion.div>
        ) : (
          <motion.div 
            className="matches-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {filteredMatches.map((match, index) => (
              <motion.div
                key={match._id}
                className="match-item"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="match-header">
                  <div className="sport-info">
                    <span className="sport-icon">{getSportIcon(match.sport)}</span>
                    <span className="sport-name">{getSportName(match.sport)}</span>
                  </div>
                  <div className="match-date">
                    {formatDate(match.createdAt)}
                  </div>
                </div>

                <div className="match-content">
                  <div className="teams">
                    <div className="team">
                      <div className="team-name">
                        {match.teamA?.name || 'Team A'}
                      </div>
                    </div>
                    
                    <div className="vs">VS</div>
                    
                    <div className="team">
                      <div className="team-name">
                        {match.teamB?.name || 'Team B'}
                      </div>
                    </div>
                  </div>

                  <div className="match-result">
                    <div className={`status-badge ${match.status}`}>
                      {match.status.toUpperCase()}
                    </div>
                    {match.winner && (
                      <div className="winner">
                        Winner: {match.winner === 'teamA' ? match.teamA?.name : match.teamB?.name}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default History;
