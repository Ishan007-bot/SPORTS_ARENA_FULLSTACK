const mongoose = require('mongoose');

const cricketScoreSchema = new mongoose.Schema({
  runs: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  overs: { type: Number, default: 0 },
  balls: { type: Number, default: 0 },
  extras: {
    wides: { type: Number, default: 0 },
    noBalls: { type: Number, default: 0 },
    byes: { type: Number, default: 0 },
    legByes: { type: Number, default: 0 }
  },
  currentBatsmen: [{
    name: String,
    runs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 }
  }],
  currentBowler: {
    name: String,
    overs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 },
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 }
  }
});

const footballScoreSchema = new mongoose.Schema({
  teamA: { 
    goals: { type: Number, default: 0 },
    cards: {
      yellow: { type: Number, default: 0 },
      red: { type: Number, default: 0 }
    }
  },
  teamB: { 
    goals: { type: Number, default: 0 },
    cards: {
      yellow: { type: Number, default: 0 },
      red: { type: Number, default: 0 }
    }
  },
  time: { type: Number, default: 0 }, // in minutes
  period: { type: String, enum: ['1st Half', '2nd Half', 'Extra Time', 'Penalties'], default: '1st Half' }
});

const basketballScoreSchema = new mongoose.Schema({
  teamA: { 
    points: { type: Number, default: 0 }, 
    fouls: { type: Number, default: 0 } 
  },
  teamB: { 
    points: { type: Number, default: 0 }, 
    fouls: { type: Number, default: 0 } 
  },
  quarter: { type: Number, default: 1 },
  time: { type: Number, default: 600 } // 10 minutes in seconds
});

const chessScoreSchema = new mongoose.Schema({
  result: { type: String, enum: ['1-0', '0-1', '1/2-1/2'], default: null },
  whiteTime: { type: Number, default: 0 }, // in seconds
  blackTime: { type: Number, default: 0 }, // in seconds
  currentPlayer: { type: String, enum: ['white', 'black'], default: 'white' }
});

const volleyballScoreSchema = new mongoose.Schema({
  teamA: { 
    points: { type: Number, default: 0 }, 
    sets: { type: Number, default: 0 } 
  },
  teamB: { 
    points: { type: Number, default: 0 }, 
    sets: { type: Number, default: 0 } 
  },
  currentSet: { type: Number, default: 1 },
  serving: { type: String, enum: ['teamA', 'teamB'], default: 'teamA' },
  setScores: [{ 
    teamA: { type: Number, default: 0 }, 
    teamB: { type: Number, default: 0 } 
  }] // Store individual set scores
});

const badmintonScoreSchema = new mongoose.Schema({
  playerA: { 
    points: { type: Number, default: 0 }, 
    games: { type: Number, default: 0 } 
  },
  playerB: { 
    points: { type: Number, default: 0 }, 
    games: { type: Number, default: 0 } 
  },
  currentGame: { type: Number, default: 1 },
  serving: { type: String, enum: ['playerA', 'playerB'], default: 'playerA' },
  gameScores: [{ 
    playerA: { type: Number, default: 0 }, 
    playerB: { type: Number, default: 0 } 
  }] // Store individual game scores
});

const tableTennisScoreSchema = new mongoose.Schema({
  playerA: { 
    points: { type: Number, default: 0 }, 
    games: { type: Number, default: 0 } 
  },
  playerB: { 
    points: { type: Number, default: 0 }, 
    games: { type: Number, default: 0 } 
  },
  currentGame: { type: Number, default: 1 },
  serving: { type: String, enum: ['playerA', 'playerB'], default: 'playerA' },
  gameScores: [{ 
    playerA: { type: Number, default: 0 }, 
    playerB: { type: Number, default: 0 } 
  }] // Store individual game scores
});

const matchSchema = new mongoose.Schema({
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament'
  },
  sport: {
    type: String,
    required: true,
    enum: ['cricket', 'football', 'basketball', 'volleyball', 'table-tennis', 'chess', 'badminton']
  },
  teamA: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'Team'
  },
  teamB: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'Team'
  },
  playerA: {
    name: String,
    team: String
  },
  playerB: {
    name: String,
    team: String
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  startTime: Date,
  endTime: Date,
  venue: String,
  // Sport-specific scores
  cricketScore: cricketScoreSchema,
  footballScore: footballScoreSchema,
  basketballScore: basketballScoreSchema,
  chessScore: chessScoreSchema,
  volleyballScore: volleyballScoreSchema,
  badmintonScore: badmintonScoreSchema,
  tableTennisScore: tableTennisScoreSchema,
  // Match settings
  matchSettings: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // General match info
  winner: {
    type: String,
    enum: ['teamA', 'teamB', 'draw']
  },
  winningReason: {
    type: String
  },
  completedAt: {
    type: Date
  },
  createdBy: {
    type: String,
    required: true
  },
  // History tracking
  scoreHistory: [{
    timestamp: { type: Date, default: Date.now },
    action: String,
    team: String,
    details: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Match', matchSchema);
