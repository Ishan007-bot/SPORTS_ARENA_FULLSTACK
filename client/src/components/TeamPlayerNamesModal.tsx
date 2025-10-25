import React, { useState } from 'react';
import './TeamPlayerNamesModal.css';

interface TeamPlayerNamesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (names: { teamA?: string; teamB?: string; playerA?: string; playerB?: string }) => void;
  type: 'teams' | 'players';
  sport: string;
}

const TeamPlayerNamesModal: React.FC<TeamPlayerNamesModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  type,
  sport
}) => {
  const [names, setNames] = useState({
    teamA: '',
    teamB: '',
    playerA: '',
    playerB: ''
  });

  const handleConfirm = () => {
    if (type === 'teams') {
      if (names.teamA.trim() && names.teamB.trim()) {
        onConfirm({ teamA: names.teamA, teamB: names.teamB });
        setNames({ teamA: '', teamB: '', playerA: '', playerB: '' });
      }
    } else {
      if (names.playerA.trim() && names.playerB.trim()) {
        onConfirm({ playerA: names.playerA, playerB: names.playerB });
        setNames({ teamA: '', teamB: '', playerA: '', playerB: '' });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Enter {type === 'teams' ? 'Team' : 'Player'} Names</h3>
        <div className="name-inputs">
          {type === 'teams' ? (
            <>
              <div className="input-group">
                <label>Team A:</label>
                <input
                  type="text"
                  value={names.teamA}
                  onChange={(e) => setNames(prev => ({ ...prev, teamA: e.target.value }))}
                  placeholder="Enter Team A name"
                />
              </div>
              <div className="input-group">
                <label>Team B:</label>
                <input
                  type="text"
                  value={names.teamB}
                  onChange={(e) => setNames(prev => ({ ...prev, teamB: e.target.value }))}
                  placeholder="Enter Team B name"
                />
              </div>
            </>
          ) : (
            <>
              <div className="input-group">
                <label>Player A:</label>
                <input
                  type="text"
                  value={names.playerA}
                  onChange={(e) => setNames(prev => ({ ...prev, playerA: e.target.value }))}
                  placeholder="Enter Player A name"
                />
              </div>
              <div className="input-group">
                <label>Player B:</label>
                <input
                  type="text"
                  value={names.playerB}
                  onChange={(e) => setNames(prev => ({ ...prev, playerB: e.target.value }))}
                  placeholder="Enter Player B name"
                />
              </div>
            </>
          )}
        </div>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-confirm" onClick={handleConfirm}>
            Start Match
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamPlayerNamesModal;
