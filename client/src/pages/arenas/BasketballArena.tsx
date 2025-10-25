import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '../../context/SocketContext';
import Timer from '../../components/Timer';
import MatchSettings from '../../components/MatchSettings';
import TeamPlayerNamesModal from '../../components/TeamPlayerNamesModal';
import { API_ENDPOINTS } from '../../config/api';
import './BasketballArena.css';

const BasketballArena: React.FC = () => {
  const [score, setScore] = useState({
    teamA: { points: 0, fouls: 0 },
    teamB: { points: 0, fouls: 0 }
  });
  const [quarter, setQuarter] = useState(1);
  const [time, setTime] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [winningReason, setWinningReason] = useState<string | null>(null);
  const [match, setMatch] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [matchSettings, setMatchSettings] = useState({
    quarterDuration: 12,
    totalQuarters: 4
  });
  const [quarterTime, setQuarterTime] = useState(0);
  const [showTeamNamesModal, setShowTeamNamesModal] = useState(false);
  const [teamNames, setTeamNames] = useState({
    teamA: '',
    teamB: ''
  });
  const { socket, joinMatch, leaveMatch } = useSocket();

  // Load existing match data on component mount
  useEffect(() => {
    const loadExistingMatch = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.LIVE_MATCHES);
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
          const response = await fetch(API_ENDPOINTS.MATCH_BY_ID(match._id));
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

  // Handle timer updates
  const handleTimerUpdate = async (newTime: number) => {
    setQuarterTime(newTime);
    setTime(newTime);
    
    // Send timer update to backend
    if (match?._id) {
      try {
        await fetch(API_ENDPOINTS.MATCH_SCORE(match._id), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sport: 'basketball',
            action: 'time',
            team: 'teamA',
            details: {
              time: newTime,
              quarter: quarter
            }
          }),
        });
      } catch (error) {
        console.error('Error updating timer:', error);
      }
    }
    
    // Timer update logic - no completion check here
  };

  // Handle timer completion (when a quarter ends)
  const handleTimerComplete = () => {
    if (quarter < matchSettings.totalQuarters) {
      // Move to next quarter
      const nextQuarter = quarter + 1;
      setQuarter(nextQuarter);
      setQuarterTime(0);
      setTime(0);
      console.log(`Starting quarter ${nextQuarter}`);
    } else {
      // Match completed
      console.log('All quarters completed, match finished');
      setIsLive(false);
      setIsCompleted(true);
      // Determine winner based on points
      if (score.teamA.points > score.teamB.points) {
        setWinner('teamA');
      } else if (score.teamB.points > score.teamA.points) {
        setWinner('teamB');
      } else {
        setWinner('draw');
      }
      setWinningReason('Game completed');
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
      const response = await fetch(API_ENDPOINTS.MATCH_SCORE(match._id), {
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
    if (!teamNames.teamA.trim() || !teamNames.teamB.trim()) {
      setShowTeamNamesModal(true);
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
          sport: 'basketball',
          teamA: { name: teamNames.teamA },
          teamB: { name: teamNames.teamB },
          status: 'scheduled',
          venue: 'Basketball Court',
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
    
    console.log('Ending basketball match:', match._id);
    
    try {
      const response = await fetch(API_ENDPOINTS.MATCH_END(match._id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          winner: score.teamA.points > score.teamB.points ? 'teamA' : 
                  score.teamB.points > score.teamA.points ? 'teamB' : 'draw',
          winningReason: 'Match ended manually'
        }),
      });

      if (response.ok) {
        console.log('Basketball match ended successfully');
        setIsLive(false);
        setIsCompleted(true);
        setWinner(score.teamA.points > score.teamB.points ? 'teamA' : 
                  score.teamB.points > score.teamA.points ? 'teamB' : 'draw');
        setWinningReason('Match ended manually');
      } else {
        console.error('Failed to end match:', response.status);
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
              <span className="team">{match?.teamA?.name || 'Team A'}</span>
              <span className="vs">VS</span>
              <span className="team">{match?.teamB?.name || 'Team B'}</span>
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
                    {winner === 'teamA' ? 'Team A' : 
                     winner === 'teamB' ? 'Team B' : 
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
        <div className="basketball-controls">
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
          
          <Timer
            initialTime={0}
            onTimeUpdate={handleTimerUpdate}
            onHalfComplete={handleTimerComplete}
            className="basketball-timer"
            autoStart={isLive}
            halfDuration={matchSettings.quarterDuration * 60}
            shouldStop={isCompleted}
          />
          
          <div className="match-info-display">
            <div className="quarter-info">
              <span className="quarter-label">Quarter:</span>
              <span className="quarter-value">Q{quarter}</span>
            </div>
            <div className="quarter-progress">
              <span className="progress-label">Quarter {quarter} of {matchSettings.totalQuarters}</span>
            </div>
          </div>
        </div>

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
        sport="basketball"
        onSettingsChange={setMatchSettings}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      <TeamPlayerNamesModal
        isOpen={showTeamNamesModal}
        onClose={() => setShowTeamNamesModal(false)}
        onConfirm={(names) => {
          setTeamNames(names as { teamA: string; teamB: string });
          setShowTeamNamesModal(false);
          startMatch();
        }}
        type="teams"
        sport="basketball"
      />
    </>
  );
};

export default BasketballArena;
