import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '../../context/SocketContext';
import './BadmintonArena.css';

const BadmintonArena: React.FC = () => {
  const [score, setScore] = useState({
    playerA: { points: 0, games: 0 },
    playerB: { points: 0, games: 0 }
  });
  const [currentGame, setCurrentGame] = useState(1);
  const [serving, setServing] = useState<'playerA' | 'playerB'>('playerA');
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
          const badmintonMatch = data.data.find((match: any) => match.sport === 'badminton');
          if (badmintonMatch) {
            console.log('Loading existing badminton match:', badmintonMatch);
            setMatch(badmintonMatch);
            setIsLive(true);
            if (badmintonMatch.badmintonScore) {
              setScore(badmintonMatch.badmintonScore);
            }
          } else {
            console.log('No existing badminton match found');
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
      console.log('Starting polling for match:', match._id);
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/matches/${match._id}`);
          const data = await response.json();
          if (data.success && data.data.badmintonScore) {
            console.log('Polling update received:', data.data.badmintonScore);
            setScore(data.data.badmintonScore);
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 2000); // Poll every 2 seconds

      return () => {
        console.log('Stopping polling for match:', match._id);
        clearInterval(pollInterval);
      };
    }
  }, [match?._id, isLive]);

  const addPoint = async (player: 'playerA' | 'playerB') => {
    if (!match?._id) return;
    
    setScore(prev => {
      const playerA = prev.playerA || { points: 0, games: 0 };
      const playerB = prev.playerB || { points: 0, games: 0 };
      
      const newScore = {
        playerA,
        playerB,
        [player]: { ...prev[player] || { points: 0, games: 0 }, points: (prev[player]?.points || 0) + 1 }
      };

      // Check if game is won (21 points with 2-point lead, or 30 if tied at 29)
      const otherPlayer = player === 'playerA' ? 'playerB' : 'playerA';
      
      if ((newScore[player].points >= 21 && newScore[player].points - newScore[otherPlayer].points >= 2) ||
          (newScore[player].points >= 30)) {
        // Game won
        const updatedScore = {
          ...newScore,
          [player]: { ...newScore[player], games: newScore[player].games + 1, points: 0 },
          [otherPlayer]: { ...newScore[otherPlayer], points: 0 }
        };
        setCurrentGame(prev => prev + 1);
        return updatedScore;
      }

      // Switch serving based on score
      const totalPoints = newScore.playerA.points + newScore.playerB.points;
      if (totalPoints % 2 === 0) {
        setServing(player);
      }

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
          sport: 'badminton',
          action: 'point',
          team: player === 'playerA' ? 'teamA' : 'teamB',
          details: { points: 1 }
        }),
      });

        if (response.ok) {
          const data = await response.json();
          // Update with backend score if available
          if (data.data.badmintonScore) {
            setScore(data.data.badmintonScore);
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
          sport: 'badminton',
          playerA: { name: 'Player A' },
          playerB: { name: 'Player B' },
          status: 'scheduled',
          venue: 'Badminton Court'
        }),
      });

      if (createResponse.ok) {
        const matchData = await createResponse.json();
        console.log('Badminton match created:', matchData.data);
        setMatch(matchData.data);
        
        // Now start the match
        const startResponse = await fetch(`http://localhost:5000/api/matches/${matchData.data._id}/start`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (startResponse.ok) {
          console.log('Badminton match started successfully');
          setIsLive(true);
        }
      }
    } catch (error) {
      console.error('Error starting match:', error);
    }
  };

  return (
    <div className="badminton-arena">
      <div className="badminton-arena-container">
        <motion.div 
          className="arena-header"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="arena-title">Badminton Arena</h1>
          <div className="match-info">
            <div className="players">
              <span className="player">Player A</span>
              <span className="vs">VS</span>
              <span className="player">Player B</span>
            </div>
            <div className={`match-status ${isLive ? 'live' : 'scheduled'}`}>
              {isLive ? 'LIVE' : 'SCHEDULED'}
            </div>
          </div>
        </motion.div>

        <div className="badminton-scoreboard">
          <motion.div 
            className="score-display"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="main-score">
              <div className="player-score">
                <span className="player-name">Player A</span>
                <span className="points">{score.playerA?.points || 0}</span>
                <div className="games">Games: {score.playerA?.games || 0}</div>
              </div>
              <div className="separator">-</div>
              <div className="player-score">
                <span className="points">{score.playerB?.points || 0}</span>
                <span className="player-name">Player B</span>
                <div className="games">Games: {score.playerB?.games || 0}</div>
              </div>
            </div>
            <div className="game-info">
              <span className="current-game">Game {currentGame}</span>
              <span className="serving">Serving: {serving === 'playerA' ? 'Player A' : 'Player B'}</span>
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
                <button className="score-btn" onClick={() => addPoint('playerA')}>
                  Player A Point
                </button>
                <button className="score-btn" onClick={() => addPoint('playerB')}>
                  Player B Point
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

export default BadmintonArena;
