const Match = require('../models/Match');
const Tournament = require('../models/Tournament');

// Get all matches
const getMatches = async (req, res) => {
  try {
    const matches = await Match.find()
      .populate('teamA teamB tournament')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: matches.length,
      data: matches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get live matches
const getLiveMatches = async (req, res) => {
  try {
    const liveMatches = await Match.find({ status: 'live' });
    
    // Transform matches to include current score in a 'score' field
    const transformedMatches = liveMatches.map(match => {
      const matchObj = match.toObject();
      matchObj.score = getCurrentScore(match);
      return matchObj;
    });
    
    res.json({
      success: true,
      count: transformedMatches.length,
      data: transformedMatches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get match by ID
const getMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({
        success: false,
        error: 'Match not found'
      });
    }
    
    res.json({
      success: true,
      data: match
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Create new match
const createMatch = async (req, res) => {
  try {
    // Add default createdBy if not provided
    const matchData = {
      ...req.body,
      createdBy: req.body.createdBy || 'admin'
    };
    
    const match = await Match.create(matchData);
    
    res.status(201).json({
      success: true,
      data: match
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update match score
const updateMatchScore = async (req, res) => {
  try {
    const { sport, action, team, details } = req.body;
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({
        success: false,
        error: 'Match not found'
      });
    }

    // Add to score history
    match.scoreHistory.push({
      action,
      team,
      details,
      timestamp: new Date()
    });

    // Update sport-specific score based on action
    switch (sport) {
      case 'cricket':
        await updateCricketScore(match, action, team, details);
        break;
      case 'football':
        await updateFootballScore(match, action, team, details);
        break;
      case 'basketball':
        await updateBasketballScore(match, action, team, details);
        break;
      case 'chess':
        await updateChessScore(match, action, team, details);
        break;
      case 'volleyball':
        await updateVolleyballScore(match, action, team, details);
        break;
      case 'badminton':
        await updateBadmintonScore(match, action, team, details);
        break;
      case 'table-tennis':
        await updateTableTennisScore(match, action, team, details);
        break;
    }

    await match.save();
    
    // Emit real-time update to match room
    const io = req.app.get('io');
    if (io) {
      const scoreUpdateData = {
        matchId: match._id,
        sport: match.sport,
        action,
        team,
        details,
        score: getCurrentScore(match),
        timestamp: new Date()
      };
      console.log('Emitting score-update to match room:', scoreUpdateData);
      io.to(`match-${match._id}`).emit('score-update', scoreUpdateData);
      
      // Also emit to live scoreboard room
      io.to('live-scoreboard').emit('live-score-update', {
        matchId: match._id,
        sport: match.sport,
        teamA: match.teamA,
        teamB: match.teamB,
        score: getCurrentScore(match),
        status: match.status,
        timestamp: new Date()
      });
    }
    
    res.json({
      success: true,
      data: match
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Sport-specific score update functions
const updateCricketScore = async (match, action, team, details) => {
  const scoreField = 'cricketScore';
  
  // Initialize cricket score if it doesn't exist
  if (!match[scoreField]) {
    match[scoreField] = {
      runs: 0,
      wickets: 0,
      overs: 0,
      balls: 0,
      extras: {
        wides: 0,
        noBalls: 0,
        byes: 0,
        legByes: 0
      }
    };
  }
  
  switch (action) {
    case 'runs':
      match[scoreField].runs += details.runs;
      if (details.runs === 1 || details.runs === 2 || details.runs === 3) {
        match[scoreField].balls += 1;
      }
      break;
    case 'boundary':
      match[scoreField].runs += details.runs;
      match[scoreField].balls += 1;
      break;
    case 'wicket':
      match[scoreField].wickets += 1;
      match[scoreField].balls += 1;
      break;
    case 'wide':
      match[scoreField].extras.wides += 1;
      match[scoreField].runs += 1;
      break;
    case 'noBall':
      match[scoreField].extras.noBalls += 1;
      match[scoreField].runs += 1;
      break;
  }
  
  // Update overs
  if (match[scoreField].balls >= 6) {
    match[scoreField].overs += 1;
    match[scoreField].balls = 0;
  }
};

const updateFootballScore = async (match, action, team, details) => {
  const scoreField = 'footballScore';
  
  // Initialize football score if it doesn't exist
  if (!match[scoreField]) {
    match[scoreField] = {
      teamA: { goals: 0, cards: { yellow: 0, red: 0 } },
      teamB: { goals: 0, cards: { yellow: 0, red: 0 } },
      time: 0,
      period: '1st Half'
    };
  }
  
  const teamField = team === 'teamA' ? 'teamA' : 'teamB';
  
  switch (action) {
    case 'goal':
      if (!match[scoreField][teamField]) {
        match[scoreField][teamField] = { goals: 0, cards: { yellow: 0, red: 0 } };
      }
      match[scoreField][teamField].goals += 1;
      break;
    case 'card':
      if (!match[scoreField][teamField]) {
        match[scoreField][teamField] = { goals: 0, cards: { yellow: 0, red: 0 } };
      }
      if (details.cardType === 'yellow') {
        match[scoreField][teamField].cards.yellow += 1;
      } else if (details.cardType === 'red') {
        match[scoreField][teamField].cards.red += 1;
      }
      break;
    case 'time':
      match[scoreField].time = details.time;
      match[scoreField].period = details.period;
      break;
  }
};

const updateBasketballScore = async (match, action, team, details) => {
  const scoreField = 'basketballScore';
  
  // Initialize basketball score if it doesn't exist
  if (!match[scoreField]) {
    match[scoreField] = {
      teamA: { points: 0, fouls: 0 },
      teamB: { points: 0, fouls: 0 },
      quarter: 1,
      time: 600
    };
  }
  
  const teamField = team === 'teamA' ? 'teamA' : 'teamB';
  
  switch (action) {
    case 'points':
      if (!match[scoreField][teamField]) {
        match[scoreField][teamField] = { points: 0, fouls: 0 };
      }
      match[scoreField][teamField].points += details.points;
      break;
    case 'foul':
      if (!match[scoreField][teamField]) {
        match[scoreField][teamField] = { points: 0, fouls: 0 };
      }
      match[scoreField][teamField].fouls += 1;
      break;
    case 'quarter':
      match[scoreField].quarter = details.quarter;
      match[scoreField].time = details.time;
      break;
  }
};

const updateChessScore = async (match, action, team, details) => {
  const scoreField = 'chessScore';
  
  // Initialize chess score if it doesn't exist
  if (!match[scoreField]) {
    match[scoreField] = {
      result: null,
      whiteTime: 1800,
      blackTime: 1800,
      currentPlayer: 'white'
    };
  }
  
  switch (action) {
    case 'result':
      match[scoreField].result = details.result;
      break;
    case 'time':
      if (details.player === 'white') {
        match[scoreField].whiteTime = details.time;
      } else {
        match[scoreField].blackTime = details.time;
      }
      break;
    case 'switch':
      match[scoreField].currentPlayer = details.currentPlayer;
      break;
  }
};

const updateVolleyballScore = async (match, action, team, details) => {
  const scoreField = 'volleyballScore';
  
  // Initialize volleyball score if it doesn't exist
  if (!match[scoreField]) {
    match[scoreField] = {
      teamA: { points: 0, sets: 0 },
      teamB: { points: 0, sets: 0 },
      currentSet: 1,
      serving: 'teamA'
    };
  }
  
  const teamField = team === 'teamA' ? 'teamA' : 'teamB';
  
  switch (action) {
    case 'point':
      if (!match[scoreField][teamField]) {
        match[scoreField][teamField] = { points: 0, sets: 0 };
      }
      match[scoreField][teamField].points += 1;
      break;
    case 'set':
      if (!match[scoreField][teamField]) {
        match[scoreField][teamField] = { points: 0, sets: 0 };
      }
      match[scoreField][teamField].sets += 1;
      match[scoreField].currentSet += 1;
      match[scoreField][teamField].points = 0;
      break;
    case 'serve':
      match[scoreField].serving = details.serving;
      break;
  }
};

const updateBadmintonScore = async (match, action, team, details) => {
  const scoreField = 'badmintonScore';
  
  // Initialize badminton score if it doesn't exist
  if (!match[scoreField]) {
    match[scoreField] = {
      playerA: { points: 0, games: 0 },
      playerB: { points: 0, games: 0 },
      currentGame: 1,
      serving: 'playerA'
    };
  }
  
  const playerField = team === 'teamA' ? 'playerA' : 'playerB';
  
  switch (action) {
    case 'point':
      if (!match[scoreField][playerField]) {
        match[scoreField][playerField] = { points: 0, games: 0 };
      }
      match[scoreField][playerField].points += 1;
      break;
    case 'game':
      if (!match[scoreField][playerField]) {
        match[scoreField][playerField] = { points: 0, games: 0 };
      }
      match[scoreField][playerField].games += 1;
      match[scoreField].currentGame += 1;
      match[scoreField][playerField].points = 0;
      break;
    case 'serve':
      match[scoreField].serving = details.serving;
      break;
  }
};

const updateTableTennisScore = async (match, action, team, details) => {
  const scoreField = 'tableTennisScore';
  
  // Initialize table tennis score if it doesn't exist
  if (!match[scoreField]) {
    match[scoreField] = {
      playerA: { points: 0, games: 0 },
      playerB: { points: 0, games: 0 },
      currentGame: 1,
      serving: 'playerA'
    };
  }
  
  const playerField = team === 'teamA' ? 'playerA' : 'playerB';
  
  switch (action) {
    case 'point':
      if (!match[scoreField][playerField]) {
        match[scoreField][playerField] = { points: 0, games: 0 };
      }
      match[scoreField][playerField].points += 1;
      break;
    case 'game':
      if (!match[scoreField][playerField]) {
        match[scoreField][playerField] = { points: 0, games: 0 };
      }
      match[scoreField][playerField].games += 1;
      match[scoreField].currentGame += 1;
      match[scoreField][playerField].points = 0;
      break;
    case 'serve':
      match[scoreField].serving = details.serving;
      break;
  }
};

// Helper function to get current score based on sport
const getCurrentScore = (match) => {
  switch (match.sport) {
    case 'cricket':
      return match.cricketScore;
    case 'football':
      return match.footballScore;
    case 'basketball':
      return match.basketballScore;
    case 'chess':
      return match.chessScore;
    case 'volleyball':
      return match.volleyballScore;
    case 'badminton':
      return match.badmintonScore;
    case 'table-tennis':
      return match.tableTennisScore;
    default:
      return {};
  }
};

// Start match
const startMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({
        success: false,
        error: 'Match not found'
      });
    }
    
    match.status = 'live';
    match.startTime = new Date();
    await match.save();
    
    // Emit match started event
    const io = req.app.get('io');
    if (io) {
      io.to(`match-${match._id}`).emit('match-started', {
        matchId: match._id,
        sport: match.sport,
        startTime: match.startTime
      });
      
      io.to('live-scoreboard').emit('match-started', {
        matchId: match._id,
        sport: match.sport,
        teamA: match.teamA,
        teamB: match.teamB,
        startTime: match.startTime
      });
    }
    
    res.json({
      success: true,
      data: match
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// End match
const endMatch = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({
        success: false,
        error: 'Match not found'
      });
    }
    
    match.status = 'completed';
    match.endTime = new Date();
    match.winner = req.body.winner;
    await match.save();
    
    // Emit match ended event
    const io = req.app.get('io');
    if (io) {
      io.to(`match-${match._id}`).emit('match-ended', {
        matchId: match._id,
        sport: match.sport,
        winner: match.winner,
        endTime: match.endTime,
        finalScore: getCurrentScore(match)
      });
      
      io.to('live-scoreboard').emit('match-ended', {
        matchId: match._id,
        sport: match.sport,
        teamA: match.teamA,
        teamB: match.teamB,
        winner: match.winner,
        endTime: match.endTime,
        finalScore: getCurrentScore(match)
      });
    }
    
    res.json({
      success: true,
      data: match
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getMatches,
  getLiveMatches,
  getMatch,
  createMatch,
  updateMatchScore,
  startMatch,
  endMatch
};
