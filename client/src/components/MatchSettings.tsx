import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './MatchSettings.css';

interface MatchSettingsProps {
  sport: string;
  onSettingsChange: (settings: any) => void;
  isOpen: boolean;
  onClose: () => void;
}

const MatchSettings: React.FC<MatchSettingsProps> = ({ 
  sport, 
  onSettingsChange, 
  isOpen, 
  onClose 
}) => {
  const [settings, setSettings] = useState(() => {
    switch (sport) {
      case 'football':
        return { halfDuration: 45, totalHalves: 2 };
      case 'basketball':
        return { quarterDuration: 12, totalQuarters: 4 };
      case 'cricket':
        return { totalOvers: 20 };
      case 'volleyball':
        return { totalSets: 5, pointsPerSet: 25 };
      case 'badminton':
        return { totalGames: 3, pointsPerGame: 21 };
      case 'table-tennis':
        return { totalGames: 5, pointsPerGame: 11 };
      case 'chess':
        return { timeControl: 30 }; // 30 minutes per player
      default:
        return {};
    }
  });

  const handleSettingChange = (key: string, value: number) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const renderSportSettings = () => {
    switch (sport) {
      case 'football':
        return (
          <div className="settings-group">
            <h3>Football Match Settings</h3>
            <div className="setting-item">
              <label>Half Duration (minutes)</label>
              <input
                type="number"
                value={settings.halfDuration}
                onChange={(e) => handleSettingChange('halfDuration', parseInt(e.target.value))}
                min="1"
                max="90"
              />
            </div>
            <div className="setting-item">
              <label>Total Halves</label>
              <input
                type="number"
                value={settings.totalHalves}
                onChange={(e) => handleSettingChange('totalHalves', parseInt(e.target.value))}
                min="1"
                max="4"
              />
            </div>
          </div>
        );

      case 'basketball':
        return (
          <div className="settings-group">
            <h3>Basketball Match Settings</h3>
            <div className="setting-item">
              <label>Quarter Duration (minutes)</label>
              <input
                type="number"
                value={settings.quarterDuration}
                onChange={(e) => handleSettingChange('quarterDuration', parseInt(e.target.value))}
                min="1"
                max="20"
              />
            </div>
            <div className="setting-item">
              <label>Total Quarters</label>
              <input
                type="number"
                value={settings.totalQuarters}
                onChange={(e) => handleSettingChange('totalQuarters', parseInt(e.target.value))}
                min="1"
                max="8"
              />
            </div>
          </div>
        );

      case 'cricket':
        return (
          <div className="settings-group">
            <h3>Cricket Match Settings</h3>
            <div className="setting-item">
              <label>Total Overs</label>
              <input
                type="number"
                value={settings.totalOvers}
                onChange={(e) => handleSettingChange('totalOvers', parseInt(e.target.value))}
                min="1"
                max="50"
              />
            </div>
          </div>
        );

      case 'volleyball':
        return (
          <div className="settings-group">
            <h3>Volleyball Match Settings</h3>
            <div className="setting-item">
              <label>Total Sets (Best of)</label>
              <input
                type="number"
                value={settings.totalSets}
                onChange={(e) => handleSettingChange('totalSets', parseInt(e.target.value))}
                min="1"
                max="7"
              />
            </div>
            <div className="setting-item">
              <label>Points per Set</label>
              <input
                type="number"
                value={settings.pointsPerSet}
                onChange={(e) => handleSettingChange('pointsPerSet', parseInt(e.target.value))}
                min="15"
                max="30"
              />
            </div>
          </div>
        );

      case 'badminton':
        return (
          <div className="settings-group">
            <h3>Badminton Match Settings</h3>
            <div className="setting-item">
              <label>Total Games (Best of)</label>
              <input
                type="number"
                value={settings.totalGames}
                onChange={(e) => handleSettingChange('totalGames', parseInt(e.target.value))}
                min="1"
                max="5"
              />
            </div>
            <div className="setting-item">
              <label>Points per Game</label>
              <input
                type="number"
                value={settings.pointsPerGame}
                onChange={(e) => handleSettingChange('pointsPerGame', parseInt(e.target.value))}
                min="11"
                max="30"
              />
            </div>
          </div>
        );

      case 'table-tennis':
        return (
          <div className="settings-group">
            <h3>Table Tennis Match Settings</h3>
            <div className="setting-item">
              <label>Total Games (Best of)</label>
              <input
                type="number"
                value={settings.totalGames}
                onChange={(e) => handleSettingChange('totalGames', parseInt(e.target.value))}
                min="1"
                max="7"
              />
            </div>
            <div className="setting-item">
              <label>Points per Game</label>
              <input
                type="number"
                value={settings.pointsPerGame}
                onChange={(e) => handleSettingChange('pointsPerGame', parseInt(e.target.value))}
                min="11"
                max="21"
              />
            </div>
          </div>
        );

      case 'chess':
        return (
          <div className="settings-group">
            <h3>Chess Match Settings</h3>
            <div className="setting-item">
              <label>Time Control (minutes per player)</label>
              <input
                type="number"
                value={settings.timeControl}
                onChange={(e) => handleSettingChange('timeControl', parseInt(e.target.value))}
                min="1"
                max="180"
              />
            </div>
          </div>
        );

      default:
        return <div>No settings available for this sport.</div>;
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      className="match-settings-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="match-settings-modal"
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 50 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="settings-header">
          <h2>Match Settings</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="settings-content">
          {renderSportSettings()}
        </div>
        
        <div className="settings-footer">
          <button className="settings-btn settings-btn-save" onClick={onClose}>
            Save Settings
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MatchSettings;
