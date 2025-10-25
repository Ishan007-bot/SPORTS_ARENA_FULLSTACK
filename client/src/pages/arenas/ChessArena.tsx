import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '../../context/SocketContext';
import MatchSettings from '../../components/MatchSettings';
import TeamPlayerNamesModal from '../../components/TeamPlayerNamesModal';
import { API_ENDPOINTS } from '../../config/api';
import './ChessArena.css';

const ChessArena: React.FC = () => {
  const [score, setScore] = useState({
    result: null as string | null,
    whiteTime: 1800, // 30 minutes in seconds
    blackTime: 1800,
    currentPlayer: 'white' as 'white' | 'black'
  });
  
  // Debug initial score state
  console.log('Initial chess score state:', score);
  const [isLive, setIsLive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [winningReason, setWinningReason] = useState<string | null>(null);
  const [match, setMatch] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [matchSettings, setMatchSettings] = useState({
    timeControl: 30, // minutes per player
    increment: 0 // seconds increment per move
  });
  const [currentTime, setCurrentTime] = useState(0);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  const [chessTimer, setChessTimer] = useState<NodeJS.Timeout | null>(null);
  const [showPlayerNamesModal, setShowPlayerNamesModal] = useState(false);
  const [playerNames, setPlayerNames] = useState({
    playerA: '',
    playerB: ''
  });
  const { socket, joinMatch, leaveMatch } = useSocket();

  // Debug score changes
  useEffect(() => {
    console.log('Score state changed:', score);
  }, [score]);
  
  // Ensure score is properly initialized
  useEffect(() => {
    if (isLive && score.whiteTime === 0 && score.blackTime === 0) {
      console.log('Resetting chess score - times were 0');
      const timeControlSeconds = matchSettings.timeControl * 60;
      setScore({
        result: null,
        whiteTime: timeControlSeconds,
        blackTime: timeControlSeconds,
        currentPlayer: 'white'
      });
    }
  }, [isLive, score.whiteTime, score.blackTime, matchSettings.timeControl]);
  
  // Debug timer behavior
  useEffect(() => {
    if (isLive) {
      console.log('Chess match is live, timer should be running');
      console.log('Current score:', score);
    }
  }, [isLive, score]);
  
  // Cleanup timer on unmount or match end
  useEffect(() => {
    return () => {
      if (chessTimer) {
        clearInterval(chessTimer);
      }
    };
  }, [chessTimer]);
  
  // Stop timer when match ends
  useEffect(() => {
    if (isCompleted) {
      stopChessTimer();
    }
  }, [isCompleted]);

  // Load existing match data on component mount
  useEffect(() => {
    const loadExistingMatch = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.LIVE_MATCHES);
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          const chessMatch = data.data.find((match: any) => match.sport === 'chess');
          if (chessMatch) {
            console.log('Loading existing chess match:', chessMatch);
            setMatch(chessMatch);
            setIsLive(true);
            if (chessMatch.chessScore) {
              setScore(chessMatch.chessScore);
            } else {
              // Initialize chess score if it doesn't exist
              const timeControlSeconds = matchSettings.timeControl * 60;
              setScore({
                result: null,
                whiteTime: timeControlSeconds,
                blackTime: timeControlSeconds,
                currentPlayer: 'white'
              });
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
          const response = await fetch(API_ENDPOINTS.MATCH_BY_ID(match._id));
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

  // Chess timer that only runs for the current player
  const startChessTimer = () => {
    if (chessTimer) {
      clearInterval(chessTimer);
    }
    
    const timer = setInterval(() => {
      setScore(prev => {
        const newScore = { ...prev };
        // Only subtract time from the current player
        if (prev.currentPlayer === 'white') {
          newScore.whiteTime = Math.max(0, prev.whiteTime - 1);
          console.log('White time:', newScore.whiteTime);
        } else if (prev.currentPlayer === 'black') {
          newScore.blackTime = Math.max(0, prev.blackTime - 1);
          console.log('Black time:', newScore.blackTime);
        }
        
        // Check if any player has run out of time
        if (newScore.whiteTime <= 0) {
          console.log('White ran out of time!');
          setResult('Black wins by time');
          setIsLive(false);
          setIsCompleted(true);
          setWinner('teamB');
          setWinningReason('White ran out of time');
          clearInterval(timer);
        } else if (newScore.blackTime <= 0) {
          console.log('Black ran out of time!');
          setResult('White wins by time');
          setIsLive(false);
          setIsCompleted(true);
          setWinner('teamA');
          setWinningReason('Black ran out of time');
          clearInterval(timer);
        }
        
        return newScore;
      });
    }, 1000);
    
    setChessTimer(timer);
  };
  
  const stopChessTimer = () => {
    if (chessTimer) {
      clearInterval(chessTimer);
      setChessTimer(null);
    }
  };

  // Listen for match-ended events
  useEffect(() => {
    if (socket && match?._id) {
      const handleMatchEnded = (data: any) => {
        if (data.matchId === match._id) {
          console.log('Match ended:', data);
          setIsLive(false);
          setIsCompleted(true);
          setWinner(data.winner);
          setWinningReason(data.reason);
        }
      };

      socket.on('match-ended', handleMatchEnded);
      
      return () => {
        socket.off('match-ended', handleMatchEnded);
      };
    }
  }, [socket, match?._id]);

  const setResult = async (result: string) => {
    if (!match?._id) return;
    
    setScore(prev => ({ ...prev, result }));

    // Update result in database
    try {
      const response = await fetch(API_ENDPOINTS.MATCH_SCORE(match._id), {
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
    // Restart timer for new player
    if (isLive && !isCompleted) {
      startChessTimer();
    }
  };

  const startMatch = async () => {
    if (!playerNames.playerA.trim() || !playerNames.playerB.trim()) {
      setShowPlayerNamesModal(true);
      return;
    }

    try {
      // First create a match in the database
      const createResponse = await fetch(API_ENDPOINTS.MATCHES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sport: 'chess',
          teamA: { name: `${playerNames.playerA} (White)` },
          teamB: { name: `${playerNames.playerB} (Black)` },
          status: 'scheduled',
          venue: 'Chess Board',
          matchSettings: matchSettings
        }),
      });

      if (createResponse.ok) {
        const matchData = await createResponse.json();
        setMatch(matchData.data);
        
        // Now start the match
        const startResponse = await fetch(API_ENDPOINTS.MATCH_START(matchData.data._id), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (startResponse.ok) {
          setIsLive(true);
          // Initialize chess score with time control
          const timeControlSeconds = matchSettings.timeControl * 60;
          setScore({
            result: null,
            whiteTime: timeControlSeconds,
            blackTime: timeControlSeconds,
            currentPlayer: 'white'
          });
          // Start the chess timer
          startChessTimer();
        }
      }
    } catch (error) {
      console.error('Error starting match:', error);
    }
  };

  const endMatch = async () => {
    if (!match?._id) return;
    
    try {
      const response = await fetch(API_ENDPOINTS.MATCH_END(match._id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          winner: score.result === 'white' ? 'teamA' : 
                  score.result === 'black' ? 'teamB' : 'draw',
          winningReason: 'Match ended manually'
        }),
      });

      if (response.ok) {
        setIsLive(false);
        setIsCompleted(true);
        setWinner(score.result === 'white' ? 'teamA' : 
                  score.result === 'black' ? 'teamB' : 'draw');
        setWinningReason('Match ended manually');
        // Stop the chess timer
        stopChessTimer();
      }
    } catch (error) {
      console.error('Error ending match:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
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
            <div className={`match-status ${isLive ? 'live' : isCompleted ? 'completed' : 'scheduled'}`}>
              {isLive ? 'LIVE' : isCompleted ? 'COMPLETED' : 'SCHEDULED'}
            </div>
          </div>
          
          {isCompleted && (
            <motion.div 
              className="match-completion-banner"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="completion-content">
                <h2 className="completion-title">Match Completed!</h2>
                <div className="winner-info">
                  <span className="winner-label">Winner:</span>
                  <span className="winner-name">
                    {winner === 'teamA' ? (match?.teamA?.name || 'White Player') : 
                     winner === 'teamB' ? (match?.teamB?.name || 'Black Player') : 
                     winner === 'draw' ? 'Draw' : 'Unknown'}
                  </span>
                </div>
                <div className="completion-reason">
                  {winningReason}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Timer and Settings */}
        <div className="chess-controls">
          <div className="controls-header">
            <h3>Match Controls</h3>
            <button 
              className="settings-btn"
              onClick={() => setShowSettings(true)}
              title="Match Settings"
            >
              ⚙️ Settings
            </button>
          </div>
          
          
          <div className="match-info-display">
            <div className="time-control-info">
              <span className="time-label">Time Control:</span>
              <span className="time-value">{matchSettings.timeControl} min</span>
            </div>
            
            <div className="chess-timer-display">
              <div className="timer-section">
                <div className="player-timer white">
                  <span className="player-label">White:</span>
                  <span className="time-display">
                    {Math.floor(score.whiteTime / 60)}:{(score.whiteTime % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="player-timer black">
                  <span className="player-label">Black:</span>
                  <span className="time-display">
                    {Math.floor(score.blackTime / 60)}:{(score.blackTime % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
              <div className="current-player">
                Current Turn: <strong>{score.currentPlayer === 'white' ? 'White' : 'Black'}</strong>
              </div>
            </div>
            <div className="increment-info">
              <span className="increment-label">Increment:</span>
              <span className="increment-value">+{matchSettings.increment}s</span>
            </div>
          </div>
        </div>

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
              
              <div className="turn-controls">
                <h4>Current Turn: {score.currentPlayer === 'white' ? 'White' : 'Black'}</h4>
                <button className="switch-btn" onClick={switchPlayer}>
                  Switch Turn
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
              {!isLive && !isCompleted && (
                <button className="action-btn start" onClick={startMatch}>
                  Start Match
                </button>
              )}
              {isLive && !isCompleted && (
                <button className="action-btn end" onClick={endMatch}>
                  End Match
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      </div>
      
      <MatchSettings
        sport="chess"
        onSettingsChange={setMatchSettings}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      <TeamPlayerNamesModal
        isOpen={showPlayerNamesModal}
        onClose={() => setShowPlayerNamesModal(false)}
        onConfirm={(names) => {
          setPlayerNames(names as { playerA: string; playerB: string });
          setShowPlayerNamesModal(false);
          startMatch();
        }}
        type="players"
        sport="chess"
      />
    </>
  );
};

export default ChessArena;
