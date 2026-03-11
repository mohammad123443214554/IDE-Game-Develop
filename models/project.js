const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  folderId: { type: String, required: true },
  objects: [{ type: mongoose.Schema.Types.Mixed }],
  events: [{ type: mongoose.Schema.Types.Mixed }],
  published: { type: Boolean, default: false },
  publishedGameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
