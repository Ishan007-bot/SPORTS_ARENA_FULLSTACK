const express = require('express');
const router = express.Router();
const {
  getTeams,
  getTeam,
  createTeam,
  updateTeam,
  deleteTeam,
  addPlayerToTeam,
  removePlayerFromTeam
} = require('../controllers/teamController');
const auth = require('../middleware/auth');

// Public routes
router.get('/', getTeams);
router.get('/:id', getTeam);

// Protected routes
router.post('/', auth, createTeam);
router.put('/:id', auth, updateTeam);
router.delete('/:id', auth, deleteTeam);
router.post('/:id/players', auth, addPlayerToTeam);
router.delete('/:id/players/:playerId', auth, removePlayerFromTeam);

module.exports = router;
