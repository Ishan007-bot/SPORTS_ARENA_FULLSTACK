import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '../../context/SocketContext';
import './FootballArena.css';

const FootballArena: React.FC = () => {
  const [score, setScore] = useState({
    teamA: { goals: 0, cards: { yellow: 0, red: 0 } },
    teamB: { goals: 0, cards: { yellow: 0, red: 0 } }
  });
  const [time, setTime] = useState(0);
  const [period, setPeriod] = useState('1st Half');
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
          const footballMatch = data.data.find((match: any) => match.sport === 'football');
          if (footballMatch) {
            setMatch(footballMatch);
            setIsLive(true);
            if (footballMatch.footballScore) {
              setScore(footballMatch.footballScore);
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
      console.log('Starting polling for football match:', match._id);
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/matches/${match._id}`);
          const data = await response.json();
          if (data.success && data.data.footballScore) {
            console.log('Football polling update received:', data.data.footballScore);
            setScore(data.data.footballScore);
          }
        } catch (error) {
          console.error('Football polling error:', error);
        }
      }, 2000); // Poll every 2 seconds

      return () => {
        console.log('Stopping football polling for match:', match._id);
        clearInterval(pollInterval);
      };
    }
  }, [match?._id, isLive]);

  const addGoal = async (team: 'teamA' | 'teamB') => {
    if (!match?._id) return;
    
    setScore(prev => {
      const teamA = prev.teamA || { goals: 0, cards: { yellow: 0, red: 0 } };
      const teamB = prev.teamB || { goals: 0, cards: { yellow: 0, red: 0 } };
      
      return {
        teamA,
        teamB,
        [team]: { ...prev[team] || { goals: 0, cards: { yellow: 0, red: 0 } }, goals: (prev[team]?.goals || 0) + 1 }
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
          sport: 'football',
          action: 'goal',
          team,
          details: { goals: (score[team]?.goals || 0) + 1 }
        }),
      });

        if (response.ok) {
          const data = await response.json();
          // Update with backend score if available
          if (data.data.footballScore) {
            setScore(data.data.footballScore);
          }
        }
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  const addCard = (team: 'teamA' | 'teamB', type: 'yellow' | 'red') => {
    setScore(prev => ({
      ...prev,
      [team]: {
        ...prev[team],
        cards: { ...prev[team].cards, [type]: prev[team].cards[type] + 1 }
      }
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
          sport: 'football',
          teamA: { name: 'Team A' },
          teamB: { name: 'Team B' },
          status: 'scheduled',
          venue: 'Football Stadium'
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

  return (
    <div className="football-arena">
      <div className="football-arena-container">
        <motion.div 
          className="arena-header"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="arena-title">Football Arena</h1>
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

        <div className="football-scoreboard">
          <motion.div 
            className="score-display"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="main-score">
              <div className="team-score">
                <span className="team-name">Team A</span>
                <span className="goals">{score.teamA?.goals || 0}</span>
              </div>
              <div className="separator">-</div>
              <div className="team-score">
                <span className="goals">{score.teamB?.goals || 0}</span>
                <span className="team-name">Team B</span>
              </div>
            </div>
            <div className="match-time">
              <span className="time">{time}'</span>
              <span className="period">{period}</span>
            </div>
          </motion.div>

          <motion.div 
            className="scorer-controls"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="goals-section">
              <h3>Goals</h3>
              <div className="goals-buttons">
                <button className="score-btn" onClick={() => addGoal('teamA')}>
                  Team A Goal
                </button>
                <button className="score-btn" onClick={() => addGoal('teamB')}>
                  Team B Goal
                </button>
              </div>
            </div>

            <div className="cards-section">
              <h3>Cards</h3>
              <div className="cards-buttons">
                <button className="card-btn yellow" onClick={() => addCard('teamA', 'yellow')}>
                  Team A Yellow
                </button>
                <button className="card-btn red" onClick={() => addCard('teamA', 'red')}>
                  Team A Red
                </button>
                <button className="card-btn yellow" onClick={() => addCard('teamB', 'yellow')}>
                  Team B Yellow
                </button>
                <button className="card-btn red" onClick={() => addCard('teamB', 'red')}>
                  Team B Red
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

export default FootballArena;
