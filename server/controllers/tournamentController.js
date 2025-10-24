const Tournament = require('../models/Tournament');
const Match = require('../models/Match');
const Team = require('../models/Team');

// Get all tournaments
const getTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find()
      .populate('teams winner runnerUp')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: tournaments.length,
      data: tournaments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get tournament by ID
const getTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('teams winner runnerUp matches');
    
    if (!tournament) {
      return res.status(404).json({
        success: false,
        error: 'Tournament not found'
      });
    }
    
    res.json({
      success: true,
      data: tournament
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Create new tournament
const createTournament = async (req, res) => {
  try {
    const tournament = await Tournament.create(req.body);
    
    res.status(201).json({
      success: true,
      data: tournament
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Add team to tournament
const addTeamToTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    
    if (!tournament) {
      return res.status(404).json({
        success: false,
        error: 'Tournament not found'
      });
    }
    
    tournament.teams.push(req.body.teamId);
    await tournament.save();
    
    res.json({
      success: true,
      data: tournament
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Generate tournament matches
const generateMatches = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('teams');
    
    if (!tournament) {
      return res.status(404).json({
        success: false,
        error: 'Tournament not found'
      });
    }
    
    const matches = [];
    const teams = tournament.teams;
    
    if (tournament.format === 'knockout') {
      // Generate knockout matches
      const numRounds = Math.ceil(Math.log2(teams.length));
      let currentTeams = [...teams];
      
      for (let round = 1; round <= numRounds; round++) {
        const roundMatches = [];
        const nextRoundTeams = [];
        
        for (let i = 0; i < currentTeams.length; i += 2) {
          if (i + 1 < currentTeams.length) {
            const match = await Match.create({
              tournament: tournament._id,
              sport: tournament.sport,
              teamA: currentTeams[i]._id,
              teamB: currentTeams[i + 1]._id,
              status: 'scheduled',
              createdBy: req.user.id
            });
            roundMatches.push(match);
            nextRoundTeams.push(null); // Placeholder for winner
          } else {
            // Odd team gets bye
            nextRoundTeams.push(currentTeams[i]);
          }
        }
        
        matches.push(...roundMatches);
        currentTeams = nextRoundTeams;
      }
    } else if (tournament.format === 'round-robin') {
      // Generate round-robin matches
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          const match = await Match.create({
            tournament: tournament._id,
            sport: tournament.sport,
            teamA: teams[i]._id,
            teamB: teams[j]._id,
            status: 'scheduled',
            createdBy: req.user.id
          });
          matches.push(match);
        }
      }
    }
    
    tournament.matches = matches.map(match => match._id);
    tournament.status = 'ongoing';
    await tournament.save();
    
    res.json({
      success: true,
      data: {
        tournament,
        matches
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update tournament status
const updateTournamentStatus = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    
    if (!tournament) {
      return res.status(404).json({
        success: false,
        error: 'Tournament not found'
      });
    }
    
    tournament.status = req.body.status;
    if (req.body.winner) tournament.winner = req.body.winner;
    if (req.body.runnerUp) tournament.runnerUp = req.body.runnerUp;
    
    await tournament.save();
    
    res.json({
      success: true,
      data: tournament
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getTournaments,
  getTournament,
  createTournament,
  addTeamToTournament,
  generateMatches,
  updateTournamentStatus
};

