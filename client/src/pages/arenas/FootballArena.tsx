import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '../../context/SocketContext';
import Timer from '../../components/Timer';
import MatchSettings from '../../components/MatchSettings';
import TeamPlayerNamesModal from '../../components/TeamPlayerNamesModal';
import { API_ENDPOINTS } from '../../config/api';
import './FootballArena.css';

const FootballArena: React.FC = () => {
  const [score, setScore] = useState({
    teamA: { goals: 0, cards: { yellow: 0, red: 0 } },
    teamB: { goals: 0, cards: { yellow: 0, red: 0 } }
  });
  const [time, setTime] = useState(0);
  const [period, setPeriod] = useState('1st Half');
  const [isLive, setIsLive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [winningReason, setWinningReason] = useState<string | null>(null);
  const [match, setMatch] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [matchSettings, setMatchSettings] = useState({
    halfDuration: 45,
    totalHalves: 2
  });
  const [currentHalf, setCurrentHalf] = useState(1);
  const [halfTime, setHalfTime] = useState(0);
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
          const response = await fetch(API_ENDPOINTS.MATCH_BY_ID(match._id));
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

  // Handle timer updates
  const handleTimerUpdate = async (newTime: number) => {
    setHalfTime(newTime);
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
            sport: 'football',
            action: 'time',
            team: 'teamA',
            details: {
              time: newTime,
              period: period
            }
          }),
        });
      } catch (error) {
        console.error('Error updating timer:', error);
      }
    }
    
    // Check if half is completed
    if (newTime >= matchSettings.halfDuration * 60) {
      if (currentHalf < matchSettings.totalHalves) {
        // Move to next half - this should be handled by the timer component reset
        console.log(`Half ${currentHalf} completed, moving to next half`);
        // The timer component will handle the reset
      } else {
        // Match completed
        console.log('All halves completed, match finished');
        setIsLive(false);
        setIsCompleted(true);
        // Determine winner based on goals
        if (score.teamA.goals > score.teamB.goals) {
          setWinner('teamA');
        } else if (score.teamB.goals > score.teamA.goals) {
          setWinner('teamB');
        } else {
          setWinner('draw');
        }
        setWinningReason('Full time');
      }
    }
  };

  // Handle timer completion (when a half ends)
  const handleTimerComplete = () => {
    if (currentHalf < matchSettings.totalHalves) {
      // Move to next half
      const nextHalf = currentHalf + 1;
      setCurrentHalf(nextHalf);
      setPeriod(`${nextHalf}${nextHalf === 1 ? 'st' : nextHalf === 2 ? 'nd' : nextHalf === 3 ? 'rd' : 'th'} Half`);
      setHalfTime(0);
      setTime(0);
      console.log(`Starting half ${nextHalf}`);
    } else {
      // Match completed
      console.log('All halves completed, match finished');
      setIsLive(false);
      setIsCompleted(true);
      // Determine winner based on goals
      if (score.teamA.goals > score.teamB.goals) {
        setWinner('teamA');
      } else if (score.teamB.goals > score.teamA.goals) {
        setWinner('teamB');
      } else {
        setWinner('draw');
      }
      setWinningReason('Full time');
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
      const response = await fetch(API_ENDPOINTS.MATCH_SCORE(match._id), {
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
          sport: 'football',
          teamA: { name: teamNames.teamA },
          teamB: { name: teamNames.teamB },
          status: 'scheduled',
          venue: 'Football Stadium',
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
          winner: score.teamA.goals > score.teamB.goals ? 'teamA' : 
                  score.teamB.goals > score.teamA.goals ? 'teamB' : 'draw',
          winningReason: 'Match ended manually'
        }),
      });

      if (response.ok) {
        setIsLive(false);
        setIsCompleted(true);
        setWinner(score.teamA.goals > score.teamB.goals ? 'teamA' : 
                  score.teamB.goals > score.teamA.goals ? 'teamB' : 'draw');
        setWinningReason('Match ended manually');
      }
    } catch (error) {
      console.error('Error ending match:', error);
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
                    {winner === 'teamA' ? (match?.teamA?.name || 'Team A') : 
                     winner === 'teamB' ? (match?.teamB?.name || 'Team B') : 
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
        <div className="football-controls">
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
            className="football-timer"
            autoStart={isLive}
            halfDuration={matchSettings.halfDuration * 60}
            shouldStop={isCompleted}
          />
          
          <div className="match-info-display">
            <div className="period-info">
              <span className="period-label">Period:</span>
              <span className="period-value">{period}</span>
            </div>
            <div className="half-info">
              <span className="half-label">Half {currentHalf} of {matchSettings.totalHalves}</span>
            </div>
          </div>
        </div>

        <div className="football-scoreboard">
          <motion.div 
            className="score-display"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="main-score">
              <div className="team-score">
                <span className="team-name">{match?.teamA?.name || 'Team A'}</span>
                <span className="goals">{score.teamA?.goals || 0}</span>
              </div>
              <div className="separator">-</div>
              <div className="team-score">
                <span className="goals">{score.teamB?.goals || 0}</span>
                <span className="team-name">{match?.teamB?.name || 'Team B'}</span>
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
                  {match?.teamA?.name || 'Team A'} Goal
                </button>
                <button className="score-btn" onClick={() => addGoal('teamB')}>
                  {match?.teamB?.name || 'Team B'} Goal
                </button>
              </div>
            </div>

            <div className="cards-section">
              <h3>Cards</h3>
              <div className="cards-buttons">
                <button className="card-btn yellow" onClick={() => addCard('teamA', 'yellow')}>
                  {match?.teamA?.name || 'Team A'} Yellow
                </button>
                <button className="card-btn red" onClick={() => addCard('teamA', 'red')}>
                  {match?.teamA?.name || 'Team A'} Red
                </button>
                <button className="card-btn yellow" onClick={() => addCard('teamB', 'yellow')}>
                  {match?.teamB?.name || 'Team B'} Yellow
                </button>
                <button className="card-btn red" onClick={() => addCard('teamB', 'red')}>
                  {match?.teamB?.name || 'Team B'} Red
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
      
      <MatchSettings
        sport="football"
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
        sport="football"
      />
    </div>
  );
};

export default FootballArena;
