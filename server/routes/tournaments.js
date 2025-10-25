const express = require('express');
const router = express.Router();
const {
  getTournaments,
  getTournament,
  createTournament,
  addTeamToTournament,
  generateMatches,
  updateTournamentStatus
} = require('../controllers/tournamentController');
const { verifyToken, getUserFromToken } = require('../middleware/auth');

// Public routes
router.get('/', getTournaments);
router.get('/:id', getTournament);

// Protected routes
router.post('/', verifyToken, getUserFromToken, createTournament);
router.post('/:id/teams', verifyToken, getUserFromToken, addTeamToTournament);
router.post('/:id/generate-matches', verifyToken, getUserFromToken, generateMatches);
router.put('/:id/status', verifyToken, getUserFromToken, updateTournamentStatus);

module.exports = router;

