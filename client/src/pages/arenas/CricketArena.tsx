import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { motion } from 'framer-motion';
import TeamPlayerNamesModal from '../../components/TeamPlayerNamesModal';
import { API_ENDPOINTS } from '../../config/api';
import './CricketArena.css';

const CricketArena: React.FC = () => {
  const [match, setMatch] = useState<any>(null);
  const [score, setScore] = useState({
    runs: 0,
    wickets: 0,
    overs: 0,
    balls: 0,
    extras: {
      wides: 0,
      noBalls: 0,
      byes: 0,
      legByes: 0
    }
  });
  const [isLive, setIsLive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [winningReason, setWinningReason] = useState<string | null>(null);
  const [showTeamNamesModal, setShowTeamNamesModal] = useState(false);
  const [teamNames, setTeamNames] = useState({
    teamA: '',
    teamB: ''
  });
  const { socket, joinMatch, leaveMatch } = useSocket();

  useEffect(() => {
    // Load existing match data on component mount
    const loadExistingMatch = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.LIVE_MATCHES);
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          const cricketMatch = data.data.find((match: any) => match.sport === 'cricket');
          if (cricketMatch) {
            console.log('Loading existing cricket match:', cricketMatch);
            setMatch(cricketMatch);
            setIsLive(cricketMatch.status === 'live');
            setIsCompleted(cricketMatch.status === 'completed');
            setWinner(cricketMatch.winner);
            setWinningReason(cricketMatch.winningReason);
            if (cricketMatch.cricketScore) {
              setScore(cricketMatch.cricketScore);
            }
          } else {
            console.log('No existing cricket match found');
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
      console.log('Starting polling for cricket match:', match._id);
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(API_ENDPOINTS.MATCH_BY_ID(match._id));
          const data = await response.json();
          if (data.success && data.data.cricketScore) {
            console.log('Cricket polling update received:', data.data.cricketScore);
            setScore(data.data.cricketScore);
          }
        } catch (error) {
          console.error('Cricket polling error:', error);
        }
      }, 2000); // Poll every 2 seconds

      return () => {
        console.log('Stopping cricket polling for match:', match._id);
        clearInterval(pollInterval);
      };
    }
  }, [match?._id, isLive]);

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

  const updateScore = async (action: string, details: any) => {
    if (!match?._id) return;
    
    try {
      const response = await fetch(API_ENDPOINTS.MATCH_SCORE(match._id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sport: 'cricket',
          action,
          team: 'teamA',
          details
        }),
      });

        if (response.ok) {
          const data = await response.json();
          // Update with backend score if available
          if (data.data.cricketScore) {
            setScore(data.data.cricketScore);
          }
        }
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  const startMatch = async () => {
    if (!teamNames.teamA.trim() || !teamNames.teamB.trim()) {
      setShowTeamNamesModal(true);
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
          sport: 'cricket',
          teamA: { name: teamNames.teamA },
          teamB: { name: teamNames.teamB },
          status: 'scheduled',
          venue: 'Cricket Ground'
        }),
      });

      if (createResponse.ok) {
        const matchData = await createResponse.json();
        console.log('Cricket match created:', matchData.data);
        setMatch(matchData.data);
        
        // Now start the match
        const startResponse = await fetch(API_ENDPOINTS.MATCH_START(matchData.data._id), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (startResponse.ok) {
          console.log('Cricket match started successfully');
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
          winner: score.wickets >= 10 ? 'teamB' : 'teamA',
          winningReason: 'Match ended manually'
        }),
      });

      if (response.ok) {
        setIsLive(false);
        setIsCompleted(true);
        setWinner(score.wickets >= 10 ? 'teamB' : 'teamA');
        setWinningReason('Match ended manually');
      }
    } catch (error) {
      console.error('Error ending match:', error);
    }
  };

  const addRuns = (runs: number) => {
    updateScore('runs', { runs });
  };

  const addBoundary = (runs: number) => {
    updateScore('boundary', { runs });
  };

  const addWicket = () => {
    updateScore('wicket', {});
  };

  const addExtra = (type: string) => {
    updateScore(type, {});
  };

  const undoLastBall = async () => {
    if (!match || !isLive) return;
    
    try {
      const response = await fetch(API_ENDPOINTS.MATCH_UNDO(match._id), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setScore(data.data.cricketScore);
          console.log('Last ball undone successfully');
        }
      }
    } catch (error) {
      console.error('Error undoing last ball:', error);
    }
  };

  return (
    <div className="cricket-arena">
      <div className="cricket-arena-container">
        <motion.div 
          className="arena-header"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="arena-title">Cricket Arena</h1>
          <div className="match-info">
            <div className="teams">
              <span className="team">{match?.teamA?.name}</span>
              <span className="vs">VS</span>
              <span className="team">{match?.teamB?.name}</span>
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
                    {winner === 'teamA' ? match?.teamA?.name : 
                     winner === 'teamB' ? match?.teamB?.name : 
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

        <div className="cricket-scoreboard">
          <motion.div 
            className="score-display"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="main-score">
              <span className="runs">{score.runs}</span>
              <span className="separator">/</span>
              <span className="wickets">{score.wickets}</span>
            </div>
            <div className="overs">
              {score.overs}.{score.balls} Overs
            </div>
            <div className="extras">
              Extras: {score.extras.wides + score.extras.noBalls + score.extras.byes + score.extras.legByes}
            </div>
          </motion.div>

          <motion.div 
            className="scorer-controls"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="runs-section">
              <h3>Runs</h3>
              <div className="runs-buttons">
                <button className="score-btn" onClick={() => addRuns(1)}>+1</button>
                <button className="score-btn" onClick={() => addRuns(2)}>+2</button>
                <button className="score-btn" onClick={() => addRuns(3)}>+3</button>
                <button className="score-btn boundary" onClick={() => addBoundary(4)}>+4</button>
                <button className="score-btn boundary" onClick={() => addBoundary(6)}>+6</button>
              </div>
            </div>

            <div className="wickets-section">
              <h3>Wickets</h3>
              <button className="score-btn wicket" onClick={addWicket}>
                WICKET
              </button>
            </div>

            <div className="extras-section">
              <h3>Extras</h3>
              <div className="extras-buttons">
                <button className="score-btn extra" onClick={() => addExtra('wide')}>
                  Wide
                </button>
                <button className="score-btn extra" onClick={() => addExtra('noBall')}>
                  No Ball
                </button>
                <button className="score-btn extra" onClick={() => addExtra('bye')}>
                  Bye
                </button>
                <button className="score-btn extra" onClick={() => addExtra('legBye')}>
                  Leg Bye
                </button>
              </div>
            </div>

            <div className="actions-section">
              <button className="action-btn undo" onClick={undoLastBall}>
                Undo Last Ball
              </button>
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

      <TeamPlayerNamesModal
        isOpen={showTeamNamesModal}
        onClose={() => setShowTeamNamesModal(false)}
        onConfirm={(names) => {
          setTeamNames(names as { teamA: string; teamB: string });
          setShowTeamNamesModal(false);
          createMatch();
        }}
        type="teams"
        sport="cricket"
      />
    </div>
  );
};

export default CricketArena;
