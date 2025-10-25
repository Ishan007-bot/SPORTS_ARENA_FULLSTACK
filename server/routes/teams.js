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
const { verifyToken, getUserFromToken } = require('../middleware/auth');

// Public routes
router.get('/', getTeams);
router.get('/:id', getTeam);

// Protected routes
router.post('/', verifyToken, getUserFromToken, createTeam);
router.put('/:id', verifyToken, getUserFromToken, updateTeam);
router.delete('/:id', verifyToken, getUserFromToken, deleteTeam);
router.post('/:id/players', verifyToken, getUserFromToken, addPlayerToTeam);
router.delete('/:id/players/:playerId', verifyToken, getUserFromToken, removePlayerFromTeam);

module.exports = router;

