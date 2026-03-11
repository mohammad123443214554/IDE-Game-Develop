const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  genre: { type: String, default: 'Other' },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  objects: [{ type: mongoose.Schema.Types.Mixed }],
  events: [{ type: mongoose.Schema.Types.Mixed }],
  thumbnail: { type: String, default: '' },
  plays: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  published: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Game', gameSchema);
