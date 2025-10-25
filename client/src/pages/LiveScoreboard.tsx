import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import { API_ENDPOINTS } from '../config/api';
import './LiveScoreboard.css';

interface LiveMatch {
  _id: string;
  sport: string;
  teamA?: any;
  teamB?: any;
  playerA?: any;
  playerB?: any;
  status: string;
  startTime: string;
  score: any;
}

const LiveScoreboard: React.FC = () => {
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket, isConnected, joinLiveScoreboard, leaveLiveScoreboard } = useSocket();

  useEffect(() => {
    // Join live scoreboard room
    joinLiveScoreboard();

    // Fetch initial live matches
    fetchLiveMatches();

    // Set up polling for real-time updates (fallback solution)
    const pollInterval = setInterval(() => {
      console.log('Polling for live matches...');
      fetchLiveMatches();
    }, 1000); // Poll every 1 second for more responsive updates

    // Listen for real-time updates
    if (socket) {
      socket.on('live-score-update', (data) => {
        setLiveMatches(prev => {
          const existingIndex = prev.findIndex(match => match._id === data.matchId);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = { ...updated[existingIndex], ...data };
            return updated;
          } else {
            return [...prev, data];
          }
        });
      });

      socket.on('match-started', (data) => {
        setLiveMatches(prev => {
          const existingIndex = prev.findIndex(match => match._id === data.matchId);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = { ...updated[existingIndex], status: 'live' };
            return updated;
          } else {
            return [...prev, data];
          }
        });
      });

      socket.on('match-ended', (data) => {
        setLiveMatches(prev => 
          prev.filter(match => match._id !== data.matchId)
        );
      });
    }

    return () => {
      clearInterval(pollInterval);
      leaveLiveScoreboard();
      if (socket) {
        socket.off('live-score-update');
        socket.off('match-started');
        socket.off('match-ended');
      }
    };
  }, [socket, joinLiveScoreboard, leaveLiveScoreboard]);

  const fetchLiveMatches = async () => {
    try {
      console.log('Fetching live matches...');
      const response = await fetch(API_ENDPOINTS.LIVE_MATCHES);
      const data = await response.json();
      console.log('Live matches response:', data);
      if (data.success) {
        console.log('Setting live matches:', data.data);
        console.log('First match data:', data.data[0]);
        if (data.data[0]) {
          console.log('TeamA:', data.data[0].teamA);
          console.log('TeamB:', data.data[0].teamB);
          console.log('PlayerA:', data.data[0].playerA);
          console.log('PlayerB:', data.data[0].playerB);
        }
        setLiveMatches(data.data);
      }
    } catch (error) {
      console.error('Error fetching live matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatScore = (match: LiveMatch) => {
    switch (match.sport) {
      case 'cricket':
        return `${match.score?.runs || 0}/${match.score?.wickets || 0}`;
      case 'football':
        return `${match.score?.teamA?.goals || 0} - ${match.score?.teamB?.goals || 0}`;
      case 'basketball':
        return `${match.score?.teamA?.points || 0} - ${match.score?.teamB?.points || 0}`;
      case 'volleyball':
        return `${match.score?.teamA?.points || 0} - ${match.score?.teamB?.points || 0}`;
      case 'badminton':
        return `${match.score?.playerA?.points || 0} - ${match.score?.playerB?.points || 0}`;
      case 'table-tennis':
        return `${match.score?.playerA?.points || 0} - ${match.score?.playerB?.points || 0}`;
      case 'chess':
        return match.score?.result || 'Ongoing';
      default:
        return '0 - 0';
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

  if (loading) {
    return (
      <div className="live-scoreboard">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading live matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="live-scoreboard">
      <div className="live-scoreboard-container">
        <motion.div 
          className="live-scoreboard-header"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <img 
            src="/live-scoreboard-image.png" 
            alt="Live Scoreboard" 
            className="live-scoreboard-image"
          />
          <div className={`connection-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            <div className="status-dot"></div>
            <span>{isConnected ? 'Live Updates Active' : 'Connection Lost'}</span>
          </div>
        </motion.div>

        {liveMatches.length === 0 ? (
          <motion.div 
            className="no-matches"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="no-matches-icon">🏟️</div>
            <h2>No live matches currently</h2>
            <p>Start a match to see live scores here!</p>
          </motion.div>
        ) : (
          <motion.div 
            className="matches-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <AnimatePresence>
              {liveMatches.map((match, index) => (
                <motion.div
                  key={match._id ? `match-${match._id}` : `match-${index}-${match.sport}`}
                  className="match-card"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="match-header">
                    <div className="sport-info">
                      <span className="sport-icon">{getSportIcon(match.sport)}</span>
                      <span className="sport-name">{getSportName(match.sport)}</span>
                    </div>
                    <div className="match-status">
                      <span className="status-badge live">LIVE</span>
                    </div>
                  </div>

                  <div className="match-content">
                    <div className="teams">
                      <div className="team">
                        <div className="team-name">
                          {match.sport === 'badminton' || match.sport === 'table-tennis' 
                            ? (match.playerA?.name || 'Player A')
                            : (match.teamA?.name || 'Team A')
                          }
                        </div>
                        <div className="team-score">
                          {match.sport === 'cricket' 
                            ? match.score?.runs || 0
                            : match.sport === 'football' 
                            ? match.score?.teamA?.goals || 0
                            : match.sport === 'basketball'
                            ? match.score?.teamA?.points || 0
                            : match.sport === 'volleyball'
                            ? match.score?.teamA?.points || 0
                            : match.sport === 'badminton'
                            ? match.score?.playerA?.points || 0
                            : match.sport === 'table-tennis'
                            ? match.score?.playerA?.points || 0
                            : 0
                          }
                        </div>
                      </div>
                      
                      <div className="vs">VS</div>
                      
                      <div className="team">
                        <div className="team-name">
                          {match.sport === 'badminton' || match.sport === 'table-tennis' 
                            ? (match.playerB?.name || 'Player B')
                            : (match.teamB?.name || 'Team B')
                          }
                        </div>
                        <div className="team-score">
                          {match.sport === 'cricket' 
                            ? match.score?.wickets || 0
                            : match.sport === 'football' 
                            ? match.score?.teamB?.goals || 0
                            : match.sport === 'basketball'
                            ? match.score?.teamB?.points || 0
                            : match.sport === 'volleyball'
                            ? match.score?.teamB?.points || 0
                            : match.sport === 'badminton'
                            ? match.score?.playerB?.points || 0
                            : match.sport === 'table-tennis'
                            ? match.score?.playerB?.points || 0
                            : 0
                          }
                        </div>
                      </div>
                    </div>

                    {/* Timer information for timed sports */}
                    {(match.sport === 'football' || match.sport === 'basketball' || match.sport === 'chess') && (
                      <div className="match-timer">
                        <div className="timer-info">
                          <span className="timer-label">Time:</span>
                          <span className="timer-value">
                            {match.sport === 'football' 
                              ? `${Math.floor((match.score?.time || 0) / 60)}:${((match.score?.time || 0) % 60).toString().padStart(2, '0')}`
                              : match.sport === 'basketball'
                              ? `Q${match.score?.quarter || 1} - ${Math.floor((match.score?.time || 0) / 60)}:${((match.score?.time || 0) % 60).toString().padStart(2, '0')}`
                              : match.sport === 'chess'
                              ? `${Math.floor((match.score?.time || 0) / 60)}:${((match.score?.time || 0) % 60).toString().padStart(2, '0')}`
                              : '0:00'
                            }
                          </span>
                        </div>
                        {match.sport === 'football' && (
                          <div className="period-info">
                            <span className="period-label">Period:</span>
                            <span className="period-value">{match.score?.period || '1st Half'}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {match.sport === 'cricket' && (
                      <div className="cricket-details">
                        <div className="overs">
                          Overs: {match.score?.overs || 0}.{match.score?.balls || 0}
                        </div>
                        <div className="wickets">
                          Wickets: {match.score?.wickets || 0}
                        </div>
                      </div>
                    )}

                    {match.sport === 'football' && (
                      <div className="football-details">
                        <div className="time">
                          Time: {match.score?.teamA?.time || 0}'
                        </div>
                        <div className="period">
                          {match.score?.teamA?.period || '1st Half'}
                        </div>
                      </div>
                    )}

                    {match.sport === 'basketball' && (
                      <div className="basketball-details">
                        <div className="quarter">
                          Q{match.score?.teamA?.quarter || 1}
                        </div>
                        <div className="time">
                          Time: {Math.floor((match.score?.teamA?.time || 0) / 60)}:{(match.score?.teamA?.time || 0) % 60}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="match-footer">
                    <div className="match-time">
                      Started: {new Date(match.startTime).toLocaleTimeString()}
                    </div>
                    <div className="live-indicator">
                      <div className="pulse-dot"></div>
                      <span>LIVE</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LiveScoreboard;
