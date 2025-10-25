import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSocket } from '../../context/SocketContext';
import MatchSettings from '../../components/MatchSettings';
import TeamPlayerNamesModal from '../../components/TeamPlayerNamesModal';
import { API_ENDPOINTS } from '../../config/api';
import './VolleyballArena.css';

const VolleyballArena: React.FC = () => {
  const [score, setScore] = useState({
    teamA: { points: 0, sets: 0 },
    teamB: { points: 0, sets: 0 }
  });
  const [currentSet, setCurrentSet] = useState(1);
  const [serving, setServing] = useState<'teamA' | 'teamB'>('teamA');
  const [isLive, setIsLive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [winningReason, setWinningReason] = useState<string | null>(null);
  const [match, setMatch] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [matchSettings, setMatchSettings] = useState({
    totalSets: 3, // Default to 3 sets
    pointsPerSet: 25 // Default points per set
  });
  const [showTeamNamesModal, setShowTeamNamesModal] = useState(false);
  const [teamNames, setTeamNames] = useState({
    teamA: '',
    teamB: ''
  });
  const { socket, joinMatch, leaveMatch } = useSocket();

  // Debug: Log match data when it changes
  useEffect(() => {
    console.log('Rendering volleyball match:', match);
  }, [match]);

  // Load existing match data on component mount
  useEffect(() => {
    const loadExistingMatch = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.LIVE_MATCHES);
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          // Find the first live volleyball match
          const volleyballMatch = data.data.find((match: any) => match.sport === 'volleyball');
          if (volleyballMatch) {
            console.log('Loading existing volleyball match:', volleyballMatch);
            console.log('Team names in loaded match:', volleyballMatch.teamA, volleyballMatch.teamB);
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
          const response = await fetch(API_ENDPOINTS.MATCH_BY_ID(match._id));
          const data = await response.json();
          if (data.success && data.data.volleyballScore) {
            console.log('Volleyball polling update received:', data.data.volleyballScore);
            // Don't update score from polling since we're sending complete score objects
            // setScore(data.data.volleyballScore);
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
    
    let updatedScore;
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
        // Set won - store the final score of this set
        const setWonScore = {
          ...newScore,
          [team]: { ...newScore[team], sets: newScore[team].sets + 1, points: 0 },
          [otherTeam]: { ...newScore[otherTeam], points: 0 },
          setScores: [...((prev as any).setScores || []), {
            teamA: newScore.teamA.points,
            teamB: newScore.teamB.points
          }]
        };
        setCurrentSet(prev => prev + 1);
        updatedScore = setWonScore;
        return setWonScore;
      }

      // Switch serving team
      setServing(otherTeam);
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
          sport: 'volleyball',
          action: 'point',
          team,
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
          sport: 'volleyball',
          teamA: { name: teamNames.teamA },
          teamB: { name: teamNames.teamB },
          status: 'scheduled',
          venue: 'Volleyball Court',
          matchSettings: matchSettings
        }),
      });

      if (createResponse.ok) {
        const matchData = await createResponse.json();
        console.log('Volleyball match created:', matchData.data);
        console.log('Team names in response:', matchData.data.teamA, matchData.data.teamB);
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
          winner: score.teamA.sets > score.teamB.sets ? 'teamA' : 
                  score.teamB.sets > score.teamA.sets ? 'teamB' : 'draw',
          winningReason: 'Match ended manually'
        }),
      });

      if (response.ok) {
        setIsLive(false);
        setIsCompleted(true);
        setWinner(score.teamA.sets > score.teamB.sets ? 'teamA' : 
                  score.teamB.sets > score.teamA.sets ? 'teamB' : 'draw');
        setWinningReason('Match ended manually');
      }
    } catch (error) {
      console.error('Error ending match:', error);
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
              <span className="team">{match?.teamA?.name || 'Team A'}</span>
              <span className="vs">VS</span>
              <span className="team">{match?.teamB?.name || 'Team B'}</span>
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
                <span className="team-name">{match?.teamA?.name || 'Team A'}</span>
                <span className="points">{score.teamA?.points || 0}</span>
                <div className="sets">Sets: {score.teamA?.sets || 0}</div>
              </div>
              <div className="separator">-</div>
              <div className="team-score">
                <span className="points">{score.teamB?.points || 0}</span>
                <span className="team-name">{match?.teamB?.name || 'Team B'}</span>
                <div className="sets">Sets: {score.teamB?.sets || 0}</div>
              </div>
            </div>
            <div className="set-info">
              <span className="current-set">Set {currentSet}</span>
              <span className="serving">Serving: {serving === 'teamA' ? (match?.teamA?.name || 'Team A') : (match?.teamB?.name || 'Team B')}</span>
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
                  {match?.teamA?.name || 'Team A'} Point
                </button>
                <button className="score-btn" onClick={() => addPoint('teamB')}>
                  {match?.teamB?.name || 'Team B'} Point
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
        sport="volleyball"
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
          createMatch();
        }}
        type="teams"
        sport="volleyball"
      />
    </div>
  );
};

export default VolleyballArena;
