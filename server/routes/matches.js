const express = require('express');
const router = express.Router();
const {
  getMatches,
  getLiveMatches,
  getMatch,
  createMatch,
  updateMatchScore,
  startMatch,
  endMatch,
  deleteMatch,
  undoLastBall
} = require('../controllers/matchController');
const { verifyToken, getUserFromToken } = require('../middleware/auth');

// Public routes
router.get('/', getMatches);
router.get('/live', getLiveMatches);
router.get('/:id', getMatch);

// Routes (temporarily without auth for testing)
router.post('/', createMatch);
router.put('/:id/score', updateMatchScore);
router.put('/:id/start', startMatch);
router.put('/:id/end', endMatch);
router.post('/:id/undo', undoLastBall);
router.delete('/:id', deleteMatch);

// Clear all matches (for debugging)
router.delete('/clear', async (req, res) => {
  try {
    const Match = require('../models/Match');
    await Match.deleteMany({});
    res.json({ success: true, message: 'All matches cleared' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
