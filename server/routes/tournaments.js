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
const auth = require('../middleware/auth');

// Public routes
router.get('/', getTournaments);
router.get('/:id', getTournament);

// Protected routes
router.post('/', auth, createTournament);
router.post('/:id/teams', auth, addTeamToTournament);
router.post('/:id/generate-matches', auth, generateMatches);
router.put('/:id/status', auth, updateTournamentStatus);

module.exports = router;

