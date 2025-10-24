import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './ChessArena.css';

const ChessArena: React.FC = () => {
  const [score, setScore] = useState({
    result: null as string | null,
    whiteTime: 1800, // 30 minutes in seconds
    blackTime: 1800,
    currentPlayer: 'white' as 'white' | 'black'
  });
  const [isLive, setIsLive] = useState(false);
  const [match, setMatch] = useState<any>(null);

  // Load existing match data on component mount
  useEffect(() => {
    const loadExistingMatch = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/matches/live');
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          const chessMatch = data.data.find((match: any) => match.sport === 'chess');
          if (chessMatch) {
            console.log('Loading existing chess match:', chessMatch);
            setMatch(chessMatch);
            setIsLive(true);
            if (chessMatch.chessScore) {
              setScore(chessMatch.chessScore);
            }
          } else {
            console.log('No existing chess match found');
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
      console.log('Starting polling for chess match:', match._id);
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/matches/${match._id}`);
          const data = await response.json();
          if (data.success && data.data.chessScore) {
            console.log('Chess polling update received:', data.data.chessScore);
            setScore(data.data.chessScore);
          }
        } catch (error) {
          console.error('Chess polling error:', error);
        }
      }, 2000); // Poll every 2 seconds

      return () => {
        console.log('Stopping chess polling for match:', match._id);
        clearInterval(pollInterval);
      };
    }
  }, [match?._id, isLive]);

  const setResult = async (result: string) => {
    if (!match?._id) return;
    
    setScore(prev => ({ ...prev, result }));

    // Update result in database
    try {
      const response = await fetch(`http://localhost:5000/api/matches/${match._id}/score`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sport: 'chess',
          action: 'result',
          team: 'teamA', // Chess doesn't really use teams, but backend expects it
          details: { result }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setScore(data.data.chessScore);
      }
    } catch (error) {
      console.error('Error updating result:', error);
    }
  };

  const switchPlayer = () => {
    setScore(prev => ({
      ...prev,
      currentPlayer: prev.currentPlayer === 'white' ? 'black' : 'white'
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
          sport: 'chess',
          teamA: { name: 'Player A (White)' },
          teamB: { name: 'Player B (Black)' },
          status: 'scheduled',
          venue: 'Chess Board'
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
    <div className="chess-arena">
      <div className="chess-arena-container">
        <motion.div 
          className="arena-header"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="arena-title">Chess Arena</h1>
          <div className="match-info">
            <div className="players">
              <span className="player">{match?.teamA?.name || 'White Player'}</span>
              <span className="vs">VS</span>
              <span className="player">{match?.teamB?.name || 'Black Player'}</span>
            </div>
            <div className={`match-status ${isLive ? 'live' : 'scheduled'}`}>
              {isLive ? 'LIVE' : 'SCHEDULED'}
            </div>
          </div>
        </motion.div>

        <div className="chess-scoreboard">
          <motion.div 
            className="score-display"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="clocks">
              <div className={`clock ${score.currentPlayer === 'white' ? 'active' : ''}`}>
                <div className="player-name">White</div>
                <div className="time">{formatTime(score.whiteTime)}</div>
              </div>
              <div className={`clock ${score.currentPlayer === 'black' ? 'active' : ''}`}>
                <div className="player-name">Black</div>
                <div className="time">{formatTime(score.blackTime)}</div>
              </div>
            </div>
            {score.result && (
              <div className="result">
                <span className="result-text">{score.result}</span>
              </div>
            )}
          </motion.div>

          <motion.div 
            className="scorer-controls"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="result-section">
              <h3>Game Result</h3>
              <div className="result-buttons">
                <button className="result-btn white-win" onClick={() => setResult('1-0')}>
                  White Wins
                </button>
                <button className="result-btn black-win" onClick={() => setResult('0-1')}>
                  Black Wins
                </button>
                <button className="result-btn draw" onClick={() => setResult('1/2-1/2')}>
                  Draw
                </button>
              </div>
            </div>

            <div className="clock-section">
              <h3>Clock Control</h3>
              <div className="clock-buttons">
                <button className="clock-btn" onClick={switchPlayer}>
                  Switch Player
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

export default ChessArena;
