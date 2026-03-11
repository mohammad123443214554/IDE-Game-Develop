// =============================================
// FILE 39: server/routes/games.js
// FOLDER: server/routes/
// PURPOSE: Backend API for games
// ENDPOINTS: GET POST PUT DELETE /api/games
// =============================================

const router = require('express').Router();
const Game = require('../../models/Game');
const Project = require('../../models/Project');
const User = require('../../models/User');
const auth = require('../middleware/auth');

// ─────────────────────────────────────────────
// GET /api/games
// Fetch all published games with filters
// ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const {
      search = '',
      genre,
      sort = 'newest',
      page = 1,
      limit = 12,
      creator,
    } = req.query;

    const query = { published: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (genre && genre !== 'All') query.genre = genre;

    if (creator) {
      const user = await User.findOne({ username: creator.toLowerCase() });
      if (user) query.creator = user._id;
      else return res.json({ games: [], total: 0 });
    }

    const sortMap = {
      newest: { createdAt: -1 },
      popular: { plays: -1 },
    };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Game.countDocuments(query);
    const games = await Game.find(query)
      .populate('creator', 'username fullName')
      .sort(sortMap[sort] || { createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    res.json({ games, total, page: parseInt(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/games/:id
// Get one game by ID
// ─────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id)
      .populate('creator', 'username fullName bio createdAt');
    if (!game) return res.status(404).json({ message: 'Game not found' });
    res.json({ game });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/games/:id/play
// Record 1 play — every 200 plays = $1 for creator
// ─────────────────────────────────────────────
router.post('/:id/play', async (req, res) => {
  try {
    const game = await Game.findByIdAndUpdate(
      req.params.id,
      { $inc: { plays: 1 } },
      { new: true }
    );
    if (!game) return res.status(404).json({ message: 'Game not found' });

    // Add to creator total plays
    await User.findByIdAndUpdate(game.creator, { $inc: { totalPlays: 1 } });

    // Every 200 plays = $1 earned
    if (game.plays % 200 === 0) {
      await User.findByIdAndUpdate(game.creator, {
        $inc: { totalEarnings: 1, availableBalance: 1 },
      });
    }

    res.json({ plays: game.plays });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/games/:id/like
// Like a game
// ─────────────────────────────────────────────
router.post('/:id/like', async (req, res) => {
  try {
    const game = await Game.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!game) return res.status(404).json({ message: 'Game not found' });
    res.json({ likes: game.likes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/games/publish
// Publish a game from the Lab (requires login)
// ─────────────────────────────────────────────
router.post('/publish', auth, async (req, res) => {
  try {
    const { projectId, title, description, genre, thumbnail } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Game title is required' });
    }

    let objects = [];
    let events = [];

    if (projectId) {
      const project = await Project.findOne({ _id: projectId, creator: req.user._id });
      if (!project) return res.status(404).json({ message: 'Project not found' });
      objects = project.objects || [];
      events = project.events || [];
    }

    const game = new Game({
      title: title.trim(),
      description: description || '',
      genre: genre || 'Other',
      creator: req.user._id,
      project: projectId || null,
      objects,
      events,
      thumbnail: thumbnail || '',
      published: true,
    });
    await game.save();

    if (projectId) {
      await Project.findByIdAndUpdate(projectId, {
        published: true,
        publishedGameId: game._id,
      });
    }

    await game.populate('creator', 'username fullName');
    res.status(201).json({ message: 'Game published!', game });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
// PUT /api/games/:id
// Update game info (creator only)
// ─────────────────────────────────────────────
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, genre, thumbnail } = req.body;
    const game = await Game.findOneAndUpdate(
      { _id: req.params.id, creator: req.user._id },
      { $set: { title, description, genre, thumbnail } },
      { new: true }
    ).populate('creator', 'username fullName');
    if (!game) return res.status(404).json({ message: 'Not found or not authorized' });
    res.json({ game });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/games/:id
// Delete a game (creator only)
// ─────────────────────────────────────────────
router.delete('/:id', auth, async (req, res) => {
  try {
    const game = await Game.findOneAndDelete({ _id: req.params.id, creator: req.user._id });
    if (!game) return res.status(404).json({ message: 'Not found or not authorized' });
    res.json({ message: 'Game deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
