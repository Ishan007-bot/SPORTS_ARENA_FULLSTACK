const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  jerseyNumber: {
    type: Number,
    min: 1,
    max: 99
  }
});

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  players: [playerSchema],
  captain: {
    type: String,
    trim: true
  },
  coach: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    default: '#000000'
  },
  logo: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Team', teamSchema);

