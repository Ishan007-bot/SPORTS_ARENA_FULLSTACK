import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '../../context/SocketContext';
import './BasketballArena.css';

const BasketballArena: React.FC = () => {
  const [score, setScore] = useState({
    teamA: { points: 0, fouls: 0 },
    teamB: { points: 0, fouls: 0 }
  });
  const [quarter, setQuarter] = useState(1);
  const [time, setTime] = useState(600); // 10 minutes in seconds
  const [isLive, setIsLive] = useState(false);
  const [match, setMatch] = useState<any>(null);
  const { socket, joinMatch, leaveMatch } = useSocket();

  // Load existing match data on component mount
  useEffect(() => {
    const loadExistingMatch = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/matches/live');
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          const basketballMatch = data.data.find((match: any) => match.sport === 'basketball');
          if (basketballMatch) {
            setMatch(basketballMatch);
            setIsLive(true);
            if (basketballMatch.basketballScore) {
              setScore(basketballMatch.basketballScore);
            }
          }
        }
      } catch (error) {
        console.error('Error loading existing match:', error);
      }
    };

    loadExistingMatch();
  }, []);

  // Poll for real-time score updates (fallback solution)
  useEffect(() => {
    if (match?._id && isLive) {
      console.log('Starting polling for basketball match:', match._id);
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/matches/${match._id}`);
          const data = await response.json();
          if (data.success && data.data.basketballScore) {
            console.log('Basketball polling update received:', data.data.basketballScore);
            setScore(data.data.basketballScore);
          }
        } catch (error) {
          console.error('Basketball polling error:', error);
        }
      }, 2000); // Poll every 2 seconds

      return () => {
        console.log('Stopping basketball polling for match:', match._id);
        clearInterval(pollInterval);
      };
    }
  }, [match?._id, isLive]);

  const addPoints = async (team: 'teamA' | 'teamB', points: number) => {
    if (!match?._id) return;
    
    setScore(prev => {
      const teamA = prev.teamA || { points: 0, fouls: 0 };
      const teamB = prev.teamB || { points: 0, fouls: 0 };
      
      return {
        teamA,
        teamB,
        [team]: { ...prev[team] || { points: 0, fouls: 0 }, points: (prev[team]?.points || 0) + points }
      };
    });

    // Update score in database
    try {
      const response = await fetch(`http://localhost:5000/api/matches/${match._id}/score`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sport: 'basketball',
          action: 'points',
          team,
          details: { points: points }
        }),
      });

        if (response.ok) {
          const data = await response.json();
          // Update with backend score if available
          if (data.data.basketballScore) {
            setScore(data.data.basketballScore);
          }
        }
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  const addFoul = (team: 'teamA' | 'teamB') => {
    setScore(prev => ({
      ...prev,
      [team]: { ...prev[team], fouls: prev[team].fouls + 1 }
    }));
  };

  const startMatch = async () => {
    try {
      // First create a match in the database
      const createResponse = await fetch('http://localhost:5000/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sport: 'basketball',
          teamA: { name: 'Team A' },
          teamB: { name: 'Team B' },
          status: 'scheduled',
          venue: 'Basketball Court'
        }),
      });

      if (createResponse.ok) {
        const matchData = await createResponse.json();
        setMatch(matchData.data);
        
        // Now start the match
        const startResponse = await fetch(`http://localhost:5000/api/matches/${matchData.data._id}/start`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (startResponse.ok) {
          setIsLive(true);
        }
      }
    } catch (error) {
      console.error('Error starting match:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="basketball-arena">
      <div className="basketball-arena-container">
        <motion.div 
          className="arena-header"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="arena-title">Basketball Arena</h1>
          <div className="match-info">
            <div className="teams">
              <span className="team">Team A</span>
              <span className="vs">VS</span>
              <span className="team">Team B</span>
            </div>
            <div className={`match-status ${isLive ? 'live' : 'scheduled'}`}>
              {isLive ? 'LIVE' : 'SCHEDULED'}
            </div>
          </div>
        </motion.div>

        <div className="basketball-scoreboard">
          <motion.div 
            className="score-display"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="main-score">
              <div className="team-score">
                <span className="team-name">Team A</span>
                <span className="points">{score.teamA?.points || 0}</span>
              </div>
              <div className="separator">-</div>
              <div className="team-score">
                <span className="points">{score.teamB?.points || 0}</span>
                <span className="team-name">Team B</span>
              </div>
            </div>
            <div className="quarter-info">
              <span className="quarter">Q{quarter}</span>
              <span className="time">{formatTime(time)}</span>
            </div>
          </motion.div>

          <motion.div 
            className="scorer-controls"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="points-section">
              <h3>Points</h3>
              <div className="points-buttons">
                <button className="score-btn" onClick={() => addPoints('teamA', 1)}>
                  Team A +1
                </button>
                <button className="score-btn" onClick={() => addPoints('teamA', 2)}>
                  Team A +2
                </button>
                <button className="score-btn" onClick={() => addPoints('teamA', 3)}>
                  Team A +3
                </button>
                <button className="score-btn" onClick={() => addPoints('teamB', 1)}>
                  Team B +1
                </button>
                <button className="score-btn" onClick={() => addPoints('teamB', 2)}>
                  Team B +2
                </button>
                <button className="score-btn" onClick={() => addPoints('teamB', 3)}>
                  Team B +3
                </button>
              </div>
            </div>

            <div className="fouls-section">
              <h3>Fouls</h3>
              <div className="fouls-buttons">
                <button className="foul-btn" onClick={() => addFoul('teamA')}>
                  Team A Foul
                </button>
                <button className="foul-btn" onClick={() => addFoul('teamB')}>
                  Team B Foul
                </button>
              </div>
            </div>

            <div className="actions-section">
              {!isLive && (
                <button className="action-btn start" onClick={startMatch}>
                  Start Match
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BasketballArena;
