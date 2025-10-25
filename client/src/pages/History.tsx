import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API_ENDPOINTS } from '../config/api';
import './History.css';

const History: React.FC = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [deletingMatch, setDeletingMatch] = useState<string | null>(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      console.log('Fetching matches for history...');
      const response = await fetch(API_ENDPOINTS.MATCHES);
      const data = await response.json();
      console.log('All matches received:', data);
      
      if (data.success) {
        console.log('Total matches:', data.data.length);
        // Filter for completed matches only
        const completedMatches = data.data.filter((match: any) => match.status === 'completed');
        console.log('Completed matches:', completedMatches.length, completedMatches);
        setMatches(completedMatches);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSportIcon = (sport: string) => {
    const icons: { [key: string]: string } = {
      cricket: '🏏',
      football: '⚽',
      basketball: '🏀',
      volleyball: '🏐',
      badminton: '🏸',
      'table-tennis': '🏓',
      chess: '♟️'
    };
    return icons[sport] || '🏆';
  };

  const getSportName = (sport: string) => {
    const names: { [key: string]: string } = {
      cricket: 'Cricket',
      football: 'Football',
      basketball: 'Basketball',
      volleyball: 'Volleyball',
      badminton: 'Badminton',
      'table-tennis': 'Table Tennis',
      chess: 'Chess'
    };
    return names[sport] || sport;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFinalScore = (match: any) => {
    const sport = match.sport;
    
    switch (sport) {
      case 'cricket':
        return {
          teamA: `${match.cricketScore?.runs || 0}/${match.cricketScore?.wickets || 0}`,
          teamB: `${match.cricketScore?.runs || 0}/${match.cricketScore?.wickets || 0}`
        };
      
      case 'football':
        return {
          teamA: match.footballScore?.teamA?.goals || 0,
          teamB: match.footballScore?.teamB?.goals || 0
        };
      
      case 'basketball':
        return {
          teamA: match.basketballScore?.teamA?.points || 0,
          teamB: match.basketballScore?.teamB?.points || 0
        };
      
      case 'volleyball':
        const volleyballSets = match.volleyballScore?.setScores || [];
        const volleyballSetScores = volleyballSets.map((set: any, index: number) => 
          `Set ${index + 1}: ${set.teamA}-${set.teamB}`
        ).join(', ');
        return {
          teamA: `${match.volleyballScore?.teamA?.sets || 0} sets`,
          teamB: `${match.volleyballScore?.teamB?.sets || 0} sets`,
          details: volleyballSetScores || 'No set scores available'
        };
      
      case 'badminton':
        const badmintonGames = match.badmintonScore?.gameScores || [];
        const badmintonGameScores = badmintonGames.map((game: any, index: number) => 
          `Game ${index + 1}: ${game.playerA}-${game.playerB}`
        ).join(', ');
        return {
          playerA: `${match.badmintonScore?.playerA?.games || 0} games`,
          playerB: `${match.badmintonScore?.playerB?.games || 0} games`,
          details: badmintonGameScores || 'No game scores available'
        };
      
      case 'table-tennis':
        const tableTennisGames = match.tableTennisScore?.gameScores || [];
        const tableTennisGameScores = tableTennisGames.map((game: any, index: number) => 
          `Game ${index + 1}: ${game.playerA}-${game.playerB}`
        ).join(', ');
        return {
          playerA: `${match.tableTennisScore?.playerA?.games || 0} games`,
          playerB: `${match.tableTennisScore?.playerB?.games || 0} games`,
          details: tableTennisGameScores || 'No game scores available'
        };
      
      case 'chess':
        return {
          result: match.chessScore?.result || 'Draw',
          whiteTime: `${Math.floor((match.chessScore?.whiteTime || 0) / 60)}:${((match.chessScore?.whiteTime || 0) % 60).toString().padStart(2, '0')}`,
          blackTime: `${Math.floor((match.chessScore?.blackTime || 0) / 60)}:${((match.chessScore?.blackTime || 0) % 60).toString().padStart(2, '0')}`
        };
      
      default:
        return { teamA: 'N/A', teamB: 'N/A' };
    }
  };

  const deleteMatch = async (matchId: string) => {
    if (!window.confirm('Are you sure you want to delete this match? This action cannot be undone.')) {
      return;
    }

    setDeletingMatch(matchId);
    try {
      const response = await fetch(API_ENDPOINTS.MATCH_BY_ID(matchId), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Remove the match from the local state
        setMatches(prevMatches => prevMatches.filter(match => match._id !== matchId));
      } else {
        const errorData = await response.json();
        alert(`Failed to delete match: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting match:', error);
      alert('Failed to delete match. Please try again.');
    } finally {
      setDeletingMatch(null);
    }
  };

  const filteredMatches = matches.filter(match => {
    if (filter === 'all') return true;
    return match.sport === filter;
  });

  if (loading) {
    return (
      <div className="history">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading match history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history">
      <div className="history-container">
        <motion.div 
          className="history-header"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="history-title">Match History</h1>
          <p className="history-description">
            View all completed matches and tournaments
          </p>
        </motion.div>

        <motion.div 
          className="filter-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Sports
            </button>
            <button 
              className={`filter-btn ${filter === 'cricket' ? 'active' : ''}`}
              onClick={() => setFilter('cricket')}
            >
              Cricket
            </button>
            <button 
              className={`filter-btn ${filter === 'football' ? 'active' : ''}`}
              onClick={() => setFilter('football')}
            >
              Football
            </button>
            <button 
              className={`filter-btn ${filter === 'basketball' ? 'active' : ''}`}
              onClick={() => setFilter('basketball')}
            >
              Basketball
            </button>
          </div>
        </motion.div>

        {filteredMatches.length === 0 ? (
          <motion.div 
            className="no-matches"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="no-matches-icon">📊</div>
            <h2>No matches found</h2>
            <p>Start a match to see it in your history!</p>
          </motion.div>
        ) : (
          <motion.div 
            className="matches-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {filteredMatches.map((match, index) => (
              <motion.div
                key={match._id}
                className="match-item"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="match-header">
                  <div className="sport-info">
                    <span className="sport-icon">{getSportIcon(match.sport)}</span>
                    <span className="sport-name">{getSportName(match.sport)}</span>
                  </div>
                  <div className="match-date">
                    {formatDate(match.createdAt)}
                  </div>
                </div>

                <div className="match-content">
                  <div className="teams">
                    <div className="team">
                      <div className="team-name">
                        {match.sport === 'badminton' || match.sport === 'table-tennis' 
                          ? (match.playerA?.name || 'Player A')
                          : (match.teamA?.name || 'Team A')
                        }
                      </div>
                      <div className="team-score">
                        {(() => {
                          const score = getFinalScore(match);
                          if (match.sport === 'chess') {
                            return score.result;
                          } else if (match.sport === 'badminton' || match.sport === 'table-tennis') {
                            return score.playerA;
                          } else {
                            return score.teamA;
                          }
                        })()}
                      </div>
                    </div>
                    
                    <div className="vs">VS</div>
                    
                    <div className="team">
                      <div className="team-name">
                        {match.sport === 'badminton' || match.sport === 'table-tennis' 
                          ? (match.playerB?.name || 'Player B')
                          : (match.teamB?.name || 'Team B')
                        }
                      </div>
                      <div className="team-score">
                        {(() => {
                          const score = getFinalScore(match);
                          if (match.sport === 'chess') {
                            return `White: ${score.whiteTime} | Black: ${score.blackTime}`;
                          } else if (match.sport === 'badminton' || match.sport === 'table-tennis') {
                            return score.playerB;
                          } else {
                            return score.teamB;
                          }
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="match-result">
                    <div className="result-info">
                      <div className={`status-badge ${match.status}`}>
                        {match.status.toUpperCase()}
                      </div>
                      {match.winner && (
                        <div className="winner">
                          Winner: {match.winner === 'teamA' ? 
                            (match.sport === 'badminton' || match.sport === 'table-tennis' 
                              ? (match.playerA?.name || 'Player A')
                              : (match.teamA?.name || 'Team A')
                            ) : 
                            (match.sport === 'badminton' || match.sport === 'table-tennis' 
                              ? (match.playerB?.name || 'Player B')
                              : (match.teamB?.name || 'Team B')
                            )
                          }
                        </div>
                      )}
                      {match.winningReason && (
                        <div className="winning-reason">
                          {match.winningReason}
                        </div>
                      )}
                      {(() => {
                        const score = getFinalScore(match);
                        if (score.details && (match.sport === 'volleyball' || match.sport === 'badminton' || match.sport === 'table-tennis')) {
                          return (
                            <div className="detailed-scores">
                              <div className="scores-label">Detailed Scores:</div>
                              <div className="scores-details">{score.details}</div>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    <button 
                      className="delete-btn"
                      onClick={() => deleteMatch(match._id)}
                      disabled={deletingMatch === match._id}
                      title="Delete Match"
                    >
                      {deletingMatch === match._id ? '⏳' : '🗑️'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default History;

