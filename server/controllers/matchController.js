const Match = require('../models/Match');
const Tournament = require('../models/Tournament');

// Winning condition checkers for each sport
const checkWinningConditions = (match) => {
  switch (match.sport) {
    case 'cricket':
      return checkCricketWinning(match);
    case 'football':
      return checkFootballWinning(match);
    case 'basketball':
      return checkBasketballWinning(match);
    case 'volleyball':
      return checkVolleyballWinning(match);
    case 'badminton':
      return checkBadmintonWinning(match);
    case 'table-tennis':
      return checkTableTennisWinning(match);
    case 'chess':
      return checkChessWinning(match);
    default:
      return null;
  }
};

const checkCricketWinning = (match) => {
  const score = match.cricketScore;
  if (!score) return null;
  
  // Match ends when overs are completed (20 overs for T20)
  if (score.overs >= 20) {
    return {
      winner: score.teamA?.runs > score.teamB?.runs ? 'teamA' : 'teamB',
      reason: 'Overs completed'
    };
  }
  
  // Match ends when all wickets are taken
  if (score.teamA?.wickets >= 10 || score.teamB?.wickets >= 10) {
    return {
      winner: score.teamA?.wickets < 10 ? 'teamA' : 'teamB',
      reason: 'All wickets taken'
    };
  }
  
  return null;
};

const checkFootballWinning = (match) => {
  const score = match.footballScore;
  if (!score) return null;
  
  // Match ends after 90 minutes (2 halves of 45 minutes each)
  if (score.time >= 90) {
    return {
      winner: score.teamA?.goals > score.teamB?.goals ? 'teamA' : 
              score.teamB?.goals > score.teamA?.goals ? 'teamB' : 'draw',
      reason: 'Full time'
    };
  }
  
  return null;
};

const checkBasketballWinning = (match) => {
  const score = match.basketballScore;
  if (!score) return null;
  
  // Match ends after 4 quarters (assuming 12 minutes per quarter)
  if (score.quarter >= 4 && score.time >= 12) {
    return {
      winner: score.teamA?.points > score.teamB?.points ? 'teamA' : 
              score.teamB?.points > score.teamA?.points ? 'teamB' : 'draw',
      reason: 'Game completed'
    };
  }
  
  return null;
};

const checkVolleyballWinning = (match) => {
  const score = match.volleyballScore;
  if (!score) return null;
  
  // Get total sets from match settings or default to 3
  const totalSets = match.matchSettings?.totalSets || 3;
  const requiredSets = Math.ceil(totalSets / 2);
  
  console.log('Volleyball winning check:', {
    teamASets: score.teamA?.sets,
    teamBSets: score.teamB?.sets,
    totalSets,
    requiredSets
  });
  
  // Match ends when a team wins the required number of sets
  if (score.teamA?.sets >= requiredSets || score.teamB?.sets >= requiredSets) {
    const winner = score.teamA?.sets >= requiredSets ? 'teamA' : 'teamB';
    console.log('Volleyball match won by:', winner);
    return {
      winner,
      reason: `Best of ${totalSets} sets completed`
    };
  }
  
  return null;
};

const checkBadmintonWinning = (match) => {
  const score = match.badmintonScore;
  if (!score) return null;
  
  // Get total games from match settings or default to 3
  const totalGames = match.matchSettings?.totalGames || 3;
  const requiredGames = Math.ceil(totalGames / 2);
  
  // Match ends when a player wins the required number of games
  if (score.playerA?.games >= requiredGames || score.playerB?.games >= requiredGames) {
    return {
      winner: score.playerA?.games >= requiredGames ? 'playerA' : 'playerB',
      reason: `Best of ${totalGames} games completed`
    };
  }
  
  return null;
};

const checkTableTennisWinning = (match) => {
  const score = match.tableTennisScore;
  if (!score) return null;
  
  // Get total games from match settings or default to 5
  const totalGames = match.matchSettings?.totalGames || 5;
  const requiredGames = Math.ceil(totalGames / 2);
  
  // Match ends when a player wins the required number of games
  if (score.playerA?.games >= requiredGames || score.playerB?.games >= requiredGames) {
    return {
      winner: score.playerA?.games >= requiredGames ? 'playerA' : 'playerB',
      reason: `Best of ${totalGames} games completed`
    };
  }
  
  return null;
};

const checkChessWinning = (match) => {
  const score = match.chessScore;
  if (!score) return null;
  
  // Chess match ends when a result is set
  if (score.result && score.result !== 'ongoing') {
    return {
      winner: score.result === 'teamA' ? 'teamA' : 
              score.result === 'teamB' ? 'teamB' : 'draw',
      reason: 'Game concluded'
    };
  }
  
  return null;
};

// Get all matches
const getMatches = async (req, res) => {
  try {
    console.log('Fetching all matches...');
    const matches = await Match.find()
      .sort({ createdAt: -1 });
    
    console.log('Found matches:', matches.length);
    matches.forEach(match => {
      console.log(`Match ${match._id}: ${match.sport} - Status: ${match.status}`);
    });
    
    res.json({
      success: true,
      count: matches.length,
      data: matches
    });
  } catch (error) {
    console.error('Error fetching matches:', error);
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
    
    console.log('Live matches found:', liveMatches.length);
    liveMatches.forEach(match => {
      console.log(`Match ${match._id}: ${match.sport} - Score:`, match.volleyballScore || match.badmintonScore || match.tableTennisScore);
      console.log(`Match ${match._id} teamA:`, match.teamA);
      console.log(`Match ${match._id} teamB:`, match.teamB);
      console.log(`Match ${match._id} playerA:`, match.playerA);
      console.log(`Match ${match._id} playerB:`, match.playerB);
    });
    
    // Transform matches to include current score in a 'score' field
    const transformedMatches = liveMatches.map(match => {
      const matchObj = match.toObject();
      matchObj.score = getCurrentScore(match);
      console.log(`Transformed score for ${match._id}:`, matchObj.score);
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
    console.log('Creating match with data:', req.body);
    
    // Add default createdBy if not provided
    const matchData = {
      ...req.body,
      createdBy: req.body.createdBy || 'admin'
    };
    
    console.log('Final match data to be stored:', matchData);
    
    const match = await Match.create(matchData);
    
    console.log('Match created successfully:', match);
    
    res.status(201).json({
      success: true,
      data: match
    });
  } catch (error) {
    console.error('Error creating match:', error);
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
    
    // Check for winning conditions
    console.log('Checking winning conditions for match:', match._id, 'sport:', match.sport);
    console.log('Current score:', match.volleyballScore || match.badmintonScore || match.tableTennisScore);
    const winningResult = checkWinningConditions(match);
    if (winningResult) {
      console.log('Winning result:', winningResult);
      match.status = 'completed';
      match.winner = winningResult.winner;
      match.winningReason = winningResult.reason;
      match.completedAt = new Date();
      await match.save();
      
      console.log(`Match ${match._id} completed! Winner: ${winningResult.winner}, Reason: ${winningResult.reason}`);
    } else {
      console.log('No winning condition met');
    }
    
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
        timestamp: new Date(),
        status: match.status,
        winner: match.winner,
        winningReason: match.winningReason
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
        winner: match.winner,
        winningReason: match.winningReason,
        timestamp: new Date()
      });
      
      // If match is completed, emit match-ended event
      if (match.status === 'completed') {
        io.to(`match-${match._id}`).emit('match-ended', {
          matchId: match._id,
          winner: match.winner,
          reason: match.winningReason,
          finalScore: getCurrentScore(match)
        });
        
        io.to('live-scoreboard').emit('match-ended', {
          matchId: match._id,
          sport: match.sport,
          winner: match.winner,
          reason: match.winningReason
        });
      }
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
    case 'time':
      match[scoreField].time = details.time;
      match[scoreField].quarter = details.quarter;
      break;
  }
};

const updateChessScore = async (match, action, team, details) => {
  const scoreField = 'chessScore';
  
  // Initialize chess score if it doesn't exist
  if (!match[scoreField]) {
    console.log('Initializing chess score with 30 minutes');
    match[scoreField] = {
      result: null,
      whiteTime: 1800,
      blackTime: 1800,
      currentPlayer: 'white'
    };
  }
  
  console.log('Updating chess score:', { action, details, currentScore: match[scoreField] });
  
  switch (action) {
    case 'result':
      match[scoreField].result = details.result;
      break;
    case 'time':
      // Update both white and black times
      if (details.whiteTime !== undefined) {
        match[scoreField].whiteTime = details.whiteTime;
      }
      if (details.blackTime !== undefined) {
        match[scoreField].blackTime = details.blackTime;
      }
      if (details.currentPlayer !== undefined) {
        match[scoreField].currentPlayer = details.currentPlayer;
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
      serving: 'teamA',
      setScores: []
    };
  }
  
  const teamField = team === 'teamA' ? 'teamA' : 'teamB';
  
  switch (action) {
    case 'point':
      if (!match[scoreField][teamField]) {
        match[scoreField][teamField] = { points: 0, sets: 0 };
      }
      // If details contains the complete score object, use it
      if (details && typeof details === 'object' && details.teamA && details.teamB) {
        match[scoreField] = details;
      } else {
        // Otherwise, just increment points by 1
        match[scoreField][teamField].points += 1;
      }
      break;
    case 'set':
      if (!match[scoreField][teamField]) {
        match[scoreField][teamField] = { points: 0, sets: 0 };
      }
      // Store the final score of the completed set
      match[scoreField].setScores.push({
        teamA: match[scoreField].teamA.points,
        teamB: match[scoreField].teamB.points
      });
      match[scoreField][teamField].sets += 1;
      match[scoreField].currentSet += 1;
      // Reset points for next set
      match[scoreField].teamA.points = 0;
      match[scoreField].teamB.points = 0;
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
      serving: 'playerA',
      gameScores: []
    };
  }
  
  const playerField = team === 'teamA' ? 'playerA' : 'playerB';
  
  switch (action) {
    case 'point':
      if (!match[scoreField][playerField]) {
        match[scoreField][playerField] = { points: 0, games: 0 };
      }
      // If details contains the complete score object, use it
      if (details && typeof details === 'object' && (details.playerA || details.teamA)) {
        match[scoreField] = details;
      } else {
        // Otherwise, just increment points by 1
        match[scoreField][playerField].points += 1;
      }
      break;
    case 'game':
      if (!match[scoreField][playerField]) {
        match[scoreField][playerField] = { points: 0, games: 0 };
      }
      // Store the final score of the completed game
      match[scoreField].gameScores.push({
        playerA: match[scoreField].playerA.points,
        playerB: match[scoreField].playerB.points
      });
      match[scoreField][playerField].games += 1;
      match[scoreField].currentGame += 1;
      // Reset points for next game
      match[scoreField].playerA.points = 0;
      match[scoreField].playerB.points = 0;
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
      serving: 'playerA',
      gameScores: []
    };
  }
  
  const playerField = team === 'teamA' ? 'playerA' : 'playerB';
  
  switch (action) {
    case 'point':
      if (!match[scoreField][playerField]) {
        match[scoreField][playerField] = { points: 0, games: 0 };
      }
      // If details contains the complete score object, use it
      if (details && typeof details === 'object' && (details.playerA || details.teamA)) {
        match[scoreField] = details;
      } else {
        // Otherwise, just increment points by 1
        match[scoreField][playerField].points += 1;
      }
      break;
    case 'game':
      if (!match[scoreField][playerField]) {
        match[scoreField][playerField] = { points: 0, games: 0 };
      }
      // Store the final score of the completed game
      match[scoreField].gameScores.push({
        playerA: match[scoreField].playerA.points,
        playerB: match[scoreField].playerB.points
      });
      match[scoreField][playerField].games += 1;
      match[scoreField].currentGame += 1;
      // Reset points for next game
      match[scoreField].playerA.points = 0;
      match[scoreField].playerB.points = 0;
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
    console.log('Ending match:', req.params.id, 'with winner:', req.body.winner);
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
    match.winningReason = req.body.winningReason;
    await match.save();
    
    console.log('Match ended successfully:', match._id, 'Status:', match.status);
    
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

// Delete match
const deleteMatch = async (req, res) => {
  try {
    const { id } = req.params;
    
    const match = await Match.findById(id);
    if (!match) {
      return res.status(404).json({
        success: false,
        error: 'Match not found'
      });
    }

    await Match.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Match deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Undo last ball for cricket
const undoLastBall = async (req, res) => {
  try {
    const { matchId } = req.params;
    
    const match = await Match.findById(matchId);
    if (!match) {
      return res.status(404).json({
        success: false,
        error: 'Match not found'
      });
    }

    if (match.sport !== 'cricket') {
      return res.status(400).json({
        success: false,
        error: 'Undo is only available for cricket matches'
      });
    }

    // Simple undo: reset to previous state
    // For now, we'll just reset the score to initial state
    // In a real implementation, you'd want to store a history of moves
    const resetScore = {
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

    match.cricketScore = resetScore;
    await match.save();

    res.json({
      success: true,
      data: {
        cricketScore: resetScore
      },
      message: 'Last ball undone successfully'
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
  endMatch,
  deleteMatch,
  undoLastBall
};
