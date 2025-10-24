import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './Tournament.css';

const Tournament: React.FC = () => {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTournament, setNewTournament] = useState({
    name: '',
    sport: '',
    format: '',
    startDate: '',
    endDate: '',
    venue: '',
    description: ''
  });

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await fetch('/api/tournaments');
      const data = await response.json();
      if (data.success) {
        setTournaments(data.data);
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/tournaments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newTournament,
          createdBy: 'admin' // In real app, this would be from auth context
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTournaments(prev => [data.data, ...prev]);
        setShowCreateForm(false);
        setNewTournament({
          name: '',
          sport: '',
          format: '',
          startDate: '',
          endDate: '',
          venue: '',
          description: ''
        });
      }
    } catch (error) {
      console.error('Error creating tournament:', error);
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
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="tournament">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading tournaments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tournament">
      <div className="tournament-container">
        <motion.div 
          className="tournament-header"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="tournament-title">Tournament Management</h1>
          <p className="tournament-description">
            Create and manage tournaments across multiple sports
          </p>
          <button 
            className="btn btn-primary create-btn"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : 'Create Tournament'}
          </button>
        </motion.div>

        {showCreateForm && (
          <motion.div 
            className="create-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <form onSubmit={createTournament}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Tournament Name</label>
                  <input
                    type="text"
                    value={newTournament.name}
                    onChange={(e) => setNewTournament(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Sport</label>
                  <select
                    value={newTournament.sport}
                    onChange={(e) => setNewTournament(prev => ({ ...prev, sport: e.target.value }))}
                    required
                  >
                    <option value="">Select Sport</option>
                    <option value="cricket">Cricket</option>
                    <option value="football">Football</option>
                    <option value="basketball">Basketball</option>
                    <option value="volleyball">Volleyball</option>
                    <option value="badminton">Badminton</option>
                    <option value="table-tennis">Table Tennis</option>
                    <option value="chess">Chess</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Format</label>
                  <select
                    value={newTournament.format}
                    onChange={(e) => setNewTournament(prev => ({ ...prev, format: e.target.value }))}
                    required
                  >
                    <option value="">Select Format</option>
                    <option value="knockout">Knockout</option>
                    <option value="round-robin">Round Robin</option>
                    <option value="league">League</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={newTournament.startDate}
                    onChange={(e) => setNewTournament(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={newTournament.endDate}
                    onChange={(e) => setNewTournament(prev => ({ ...prev, endDate: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Venue</label>
                  <input
                    type="text"
                    value={newTournament.venue}
                    onChange={(e) => setNewTournament(prev => ({ ...prev, venue: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newTournament.description}
                  onChange={(e) => setNewTournament(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Create Tournament
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        <motion.div 
          className="tournaments-list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {tournaments.length === 0 ? (
            <div className="no-tournaments">
              <div className="no-tournaments-icon">🏆</div>
              <h2>No tournaments found</h2>
              <p>Create your first tournament to get started!</p>
            </div>
          ) : (
            <div className="tournaments-grid">
              {tournaments.map((tournament, index) => (
                <motion.div
                  key={tournament._id}
                  className="tournament-card"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="tournament-header">
                    <div className="sport-info">
                      <span className="sport-icon">{getSportIcon(tournament.sport)}</span>
                      <span className="sport-name">{getSportName(tournament.sport)}</span>
                    </div>
                    <div className={`status-badge ${tournament.status}`}>
                      {tournament.status.toUpperCase()}
                    </div>
                  </div>

                  <div className="tournament-content">
                    <h3 className="tournament-name">{tournament.name}</h3>
                    <p className="tournament-format">{tournament.format}</p>
                    <div className="tournament-dates">
                      <span>{formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}</span>
                    </div>
                    {tournament.venue && (
                      <div className="tournament-venue">
                        <span>📍 {tournament.venue}</span>
                      </div>
                    )}
                    {tournament.description && (
                      <p className="tournament-description">{tournament.description}</p>
                    )}
                  </div>

                  <div className="tournament-footer">
                    <div className="teams-count">
                      {tournament.teams?.length || 0} Teams
                    </div>
                    <div className="matches-count">
                      {tournament.matches?.length || 0} Matches
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Tournament;

