import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { motion } from 'framer-motion';
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
  const { socket, joinMatch, leaveMatch } = useSocket();

  useEffect(() => {
    // Load existing match data on component mount
    const loadExistingMatch = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/matches/live');
        const data = await response.json();
        if (data.success && data.data.length > 0) {
          const cricketMatch = data.data.find((match: any) => match.sport === 'cricket');
          if (cricketMatch) {
            console.log('Loading existing cricket match:', cricketMatch);
            setMatch(cricketMatch);
            setIsLive(true);
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
          const response = await fetch(`http://localhost:5000/api/matches/${match._id}`);
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

  const updateScore = async (action: string, details: any) => {
    if (!match?._id) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/matches/${match._id}/score`, {
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
    try {
      // First create a match in the database
      const createResponse = await fetch('http://localhost:5000/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sport: 'cricket',
          teamA: { name: 'Team A' },
          teamB: { name: 'Team B' },
          status: 'scheduled',
          venue: 'Cricket Ground'
        }),
      });

      if (createResponse.ok) {
        const matchData = await createResponse.json();
        console.log('Cricket match created:', matchData.data);
        setMatch(matchData.data);
        
        // Now start the match
        const startResponse = await fetch(`http://localhost:5000/api/matches/${matchData.data._id}/start`, {
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

  const undoLastBall = () => {
    // Implement undo functionality
    console.log('Undo last ball');
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
            <div className={`match-status ${isLive ? 'live' : 'scheduled'}`}>
              {isLive ? 'LIVE' : 'SCHEDULED'}
            </div>
          </div>
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

export default CricketArena;
