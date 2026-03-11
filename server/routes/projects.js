const router = require('express').Router();
const Project = require('../../models/Project');
const Folder = require('../../models/Folder');
const auth = require('../middleware/auth');

// Get folders
router.get('/folders', auth, async (req, res) => {
  try {
    const folders = await Folder.find({ creator: req.user._id }).sort({ createdAt: -1 });
    res.json({ folders });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Create folder
router.post('/folders', auth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Folder name required' });
    const folder = new Folder({ name, creator: req.user._id });
    await folder.save();
    res.json({ folder });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get projects
router.get('/', auth, async (req, res) => {
  try {
    const { folder } = req.query;
    const query = { creator: req.user._id };
    if (folder) query.folderId = folder;
    const projects = await Project.find(query).sort({ updatedAt: -1 });
    res.json({ projects });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get single project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, creator: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ project });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Create project
router.post('/', auth, async (req, res) => {
  try {
    const { name, folderId, objects, events } = req.body;
    const project = new Project({ name, creator: req.user._id, folderId, objects: objects || [], events: events || [] });
    await project.save();
    res.json({ project });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, creator: req.user._id },
      { $set: req.body },
      { new: true }
    );
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ project });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    await Project.findOneAndDelete({ _id: req.params.id, creator: req.user._id });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
