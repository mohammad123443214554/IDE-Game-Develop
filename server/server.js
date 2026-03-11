require('dotenv').config({ path: '.env.local' });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use(cors({
  origin: [process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ide-game-develop')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err.message));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/games', require('./routes/games'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/user', require('./routes/user'));
app.use('/api/upload', require('./routes/upload'));
app.post('/api/contact', (req, res) => { console.log('Contact:', req.body); res.json({ message: 'Received' }); });
app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '1.0' }));

app.listen(PORT, () => console.log('Server running on port ' + PORT));
