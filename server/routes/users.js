const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers
} = require('../controllers/userController');
const { verifyToken, getUserFromToken } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', verifyToken, getUserFromToken, getProfile);
router.put('/profile', verifyToken, getUserFromToken, updateProfile);
router.put('/change-password', verifyToken, getUserFromToken, changePassword);

// Admin routes
router.get('/all', verifyToken, getUserFromToken, getAllUsers);

module.exports = router;
