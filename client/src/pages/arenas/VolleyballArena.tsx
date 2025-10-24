import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '../../context/SocketContext';
import './VolleyballArena.css';

const VolleyballArena: React.FC = () => {
  const [score, setScore] = useState({
    teamA: { points: 0, sets: 0 },
    teamB: { points: 0, sets: 0 }
  });
  const [currentSet, setCurrentSet] = useState(1);
  const [serving, setServing] = useState<'teamA' | 'teamB'>('teamA');
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
          // Find the first live volleyball match
          const volleyballMatch = data.data.find((match: any) => match.sport === 'volleyball');
          if (volleyballMatch) {
            setMatch(volleyballMatch);
            setIsLive(true);
            if (volleyballMatch.volleyballScore) {
              setScore(volleyballMatch.volleyballScore);
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
      console.log('Starting polling for volleyball match:', match._id);
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/matches/${match._id}`);
          const data = await response.json();
          if (data.success && data.data.volleyballScore) {
            console.log('Volleyball polling update received:', data.data.volleyballScore);
            setScore(data.data.volleyballScore);
          }
        } catch (error) {
          console.error('Volleyball polling error:', error);
        }
      }, 2000); // Poll every 2 seconds

      return () => {
        console.log('Stopping volleyball polling for match:', match._id);
        clearInterval(pollInterval);
      };
    }
  }, [match?._id, isLive]);

  const addPoint = async (team: 'teamA' | 'teamB') => {
    if (!match?._id) return;
    
    setScore(prev => {
      // Ensure team objects exist
      const teamA = prev.teamA || { points: 0, sets: 0 };
      const teamB = prev.teamB || { points: 0, sets: 0 };
      
      const newScore = {
        teamA,
        teamB,
        [team]: { ...(team === 'teamA' ? teamA : teamB), points: (team === 'teamA' ? teamA.points : teamB.points) + 1 }
      };

      // Check if set is won (25 points with 2-point lead, or 15 in 5th set)
      const setTarget = currentSet === 5 ? 15 : 25;
      const otherTeam = team === 'teamA' ? 'teamB' : 'teamA';
      
      if (newScore[team].points >= setTarget && 
          newScore[team].points - newScore[otherTeam].points >= 2) {
        // Set won
        const updatedScore = {
          ...newScore,
          [team]: { ...newScore[team], sets: newScore[team].sets + 1, points: 0 },
          [otherTeam]: { ...newScore[otherTeam], points: 0 }
        };
        setCurrentSet(prev => prev + 1);
        return updatedScore;
      }

      // Switch serving team
      setServing(otherTeam);
      return newScore;
    });

    // Update score in database
    try {
      const response = await fetch(`http://localhost:5000/api/matches/${match._id}/score`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sport: 'volleyball',
          action: 'point',
          team,
          details: { points: (score[team]?.points || 0) + 1 }
        }),
      });

        if (response.ok) {
          const data = await response.json();
          // Update with backend score if available
          if (data.data.volleyballScore) {
            setScore(data.data.volleyballScore);
          }
        }
    } catch (error) {
      console.error('Error updating score:', error);
    }
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
          sport: 'volleyball',
          teamA: { name: 'Team A' },
          teamB: { name: 'Team B' },
          status: 'scheduled',
          venue: 'Volleyball Court'
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
    <div className="volleyball-arena">
      <div className="volleyball-arena-container">
        <motion.div 
          className="arena-header"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="arena-title">Volleyball Arena</h1>
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

        <div className="volleyball-scoreboard">
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
                <div className="sets">Sets: {score.teamA?.sets || 0}</div>
              </div>
              <div className="separator">-</div>
              <div className="team-score">
                <span className="points">{score.teamB?.points || 0}</span>
                <span className="team-name">Team B</span>
                <div className="sets">Sets: {score.teamB?.sets || 0}</div>
              </div>
            </div>
            <div className="set-info">
              <span className="current-set">Set {currentSet}</span>
              <span className="serving">Serving: {serving === 'teamA' ? 'Team A' : 'Team B'}</span>
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
                <button className="score-btn" onClick={() => addPoint('teamA')}>
                  Team A Point
                </button>
                <button className="score-btn" onClick={() => addPoint('teamB')}>
                  Team B Point
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

export default VolleyballArena;
