import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '../../context/SocketContext';
import MatchSettings from '../../components/MatchSettings';
import TeamPlayerNamesModal from '../../components/TeamPlayerNamesModal';
import { API_ENDPOINTS } from '../../config/api';
import './TableTennisArena.css';

const TableTennisArena: React.FC = () => {
  const [score, setScore] = useState({
    playerA: { points: 0, games: 0 },
    playerB: { points: 0, games: 0 }
  });
  const [currentGame, setCurrentGame] = useState(1);
  const [serving, setServing] = useState<'playerA' | 'playerB'>('playerA');
  const [isLive, setIsLive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [winningReason, setWinningReason] = useState<string | null>(null);
  const [match, setMatch] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [matchSettings, setMatchSettings] = useState({
    totalGames: 5, // Default to 5 games
    pointsPerGame: 11 // Default points per game
  });
  const [showPlayerNamesModal, setShowPlayerNamesModal] = useState(false);
  const [playerNames, setPlayerNames] = useState({
    playerA: '',
    playerB: ''
  });
  const { socket, joinMatch, leaveMatch } = useSocket();

  // Load existing match data on component mount
  useEffect(() => {
    const loadExistingMatch = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.LIVE_MATCHES);
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          const tableTennisMatch = data.data.find((match: any) => match.sport === 'table-tennis');
          if (tableTennisMatch) {
            setMatch(tableTennisMatch);
            setIsLive(true);
            if (tableTennisMatch.tableTennisScore) {
              setScore(tableTennisMatch.tableTennisScore);
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
      console.log('Starting polling for table tennis match:', match._id);
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(API_ENDPOINTS.MATCH_BY_ID(match._id));
          const data = await response.json();
          if (data.success && data.data.tableTennisScore) {
            console.log('Table tennis polling update received:', data.data.tableTennisScore);
            // Don't update score from polling since we're sending complete score objects
            // setScore(data.data.tableTennisScore);
          }
        } catch (error) {
          console.error('Table tennis polling error:', error);
        }
      }, 2000); // Poll every 2 seconds

      return () => {
        console.log('Stopping table tennis polling for match:', match._id);
        clearInterval(pollInterval);
      };
    }
  }, [match?._id, isLive]);

  const addPoint = async (player: 'playerA' | 'playerB') => {
    if (!match?._id) return;
    
    let updatedScore;
    setScore(prev => {
      const playerA = prev.playerA || { points: 0, games: 0 };
      const playerB = prev.playerB || { points: 0, games: 0 };
      
      const newScore = {
        playerA,
        playerB,
        [player]: { ...prev[player] || { points: 0, games: 0 }, points: (prev[player]?.points || 0) + 1 }
      };

      // Check if game is won (11 points with 2-point lead, or continue if tied at 10-10)
      const otherPlayer = player === 'playerA' ? 'playerB' : 'playerA';
      
      if ((newScore[player].points >= 11 && newScore[player].points - newScore[otherPlayer].points >= 2)) {
        // Game won - store the final score of this game
        const gameWonScore = {
          ...newScore,
          [player]: { ...newScore[player], games: newScore[player].games + 1, points: 0 },
          [otherPlayer]: { ...newScore[otherPlayer], points: 0 },
          gameScores: [...((prev as any).gameScores || []), {
            playerA: newScore.playerA.points,
            playerB: newScore.playerB.points
          }]
        };
        setCurrentGame(prev => prev + 1);
        updatedScore = gameWonScore;
        return gameWonScore;
      }

      // Switch serving every 2 points (except at deuce)
      const totalPoints = newScore.playerA.points + newScore.playerB.points;
      const isDeuce = newScore.playerA.points >= 10 && newScore.playerB.points >= 10;
      
      if (isDeuce) {
        // At deuce, switch every point
        setServing(player);
      } else if (totalPoints % 2 === 0) {
        // Normal rotation every 2 points
        setServing(player);
      }

      updatedScore = newScore;
      return newScore;
    });

    // Update score in database
    try {
      const response = await fetch(API_ENDPOINTS.MATCH_SCORE(match._id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sport: 'table-tennis',
          action: 'point',
          team: player === 'playerA' ? 'teamA' : 'teamB',
          details: updatedScore // Send the complete updated score object
        }),
      });

        if (response.ok) {
          const data = await response.json();
          // Don't update with backend score since we sent the complete score object
          // The frontend already has the correct score
        }
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  const startMatch = async () => {
    if (!playerNames.playerA.trim() || !playerNames.playerB.trim()) {
      setShowPlayerNamesModal(true);
      return;
    }
    await createMatch();
  };

  const createMatch = async () => {
    try {
      // First create a match in the database
      const createResponse = await fetch(API_ENDPOINTS.MATCHES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sport: 'table-tennis',
          playerA: { name: playerNames.playerA },
          playerB: { name: playerNames.playerB },
          status: 'scheduled',
          venue: 'Table Tennis Court',
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
          winner: score.playerA.games > score.playerB.games ? 'teamA' : 
                  score.playerB.games > score.playerA.games ? 'teamB' : 'draw',
          winningReason: 'Match ended manually'
        }),
      });

      if (response.ok) {
        setIsLive(false);
        setIsCompleted(true);
        setWinner(score.playerA.games > score.playerB.games ? 'teamA' : 
                  score.playerB.games > score.playerA.games ? 'teamB' : 'draw');
        setWinningReason('Match ended manually');
      }
    } catch (error) {
      console.error('Error ending match:', error);
    }
  };

  return (
    <div className="table-tennis-arena">
      <div className="table-tennis-arena-container">
        <motion.div 
          className="arena-header"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="arena-title">Table Tennis Arena</h1>
          <div className="match-info">
            <div className="players">
              <span className="player">{match?.playerA?.name || 'Player A'}</span>
              <span className="vs">VS</span>
              <span className="player">{match?.playerB?.name || 'Player B'}</span>
            </div>
            <div className={`match-status ${isLive ? 'live' : 'scheduled'}`}>
              {isLive ? 'LIVE' : 'SCHEDULED'}
            </div>
          </div>
        </motion.div>

        <div className="table-tennis-scoreboard">
          <motion.div 
            className="score-display"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="main-score">
              <div className="player-score">
                <span className="player-name">{match?.playerA?.name || 'Player A'}</span>
                <span className="points">{score.playerA?.points || 0}</span>
                <div className="games">Games: {score.playerA?.games || 0}</div>
              </div>
              <div className="separator">-</div>
              <div className="player-score">
                <span className="points">{score.playerB?.points || 0}</span>
                <span className="player-name">{match?.playerB?.name || 'Player B'}</span>
                <div className="games">Games: {score.playerB?.games || 0}</div>
              </div>
            </div>
            <div className="game-info">
              <span className="current-game">Game {currentGame}</span>
              <span className="serving">Serving: {serving === 'playerA' ? (match?.playerA?.name || 'Player A') : (match?.playerB?.name || 'Player B')}</span>
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
                  {match?.playerA?.name || 'Player A'} Point
                </button>
                <button className="score-btn" onClick={() => addPoint('playerB')}>
                  {match?.playerB?.name || 'Player B'} Point
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
              <button 
                className="settings-btn"
                onClick={() => setShowSettings(true)}
                title="Match Settings"
              >
                ⚙️ Settings
              </button>
            </div>
          </motion.div>
        </div>
      </div>
      
      <MatchSettings
        sport="table-tennis"
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
          createMatch();
        }}
        type="players"
        sport="table-tennis"
      />
    </div>
  );
};

export default TableTennisArena;
