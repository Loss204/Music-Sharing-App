// server/app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const musicRoutes = require('./routes/music');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Serve static files

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => console.error(err));

// Routes
app.use('/api/music', musicRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
// server/models/Music.js
const mongoose = require('mongoose');

const musicSchema = new mongoose.Schema({
  title: String,
  artist: String,
  album: String,
  genre: String,
  coverArt: String,
  audioFile: String,
});

const Music = mongoose.model('Music', musicSchema);
module.exports = Music;
// server/routes/music.js
const express = require('express');
const multer = require('multer');
const Music = require('../models/Music');
const path = require('path');

const router = express.Router();

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Add timestamp to the filename
  },
});

const upload = multer({ storage });

// Upload music file and cover art
router.post('/', upload.fields([{ name: 'audioFile' }, { name: 'coverArt' }]), async (req, res) => {
  const { title, artist, album, genre } = req.body;

  const music = new Music({
    title,
    artist,
    album,
    genre,
    audioFile: req.files.audioFile[0].path,
    coverArt: req.files.coverArt[0].path,
  });

  try {
    await music.save();
    res.status(201).json({ message: 'Music uploaded successfully', music });
  } catch (err) {
    res.status(500).json({ message: 'Error uploading music', error: err });
  }
});

// Get all music uploads
router.get('/', async (req, res) => {
  try {
    const musicUploads = await Music.find();
    res.json(musicUploads);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching music uploads', error: err });
  }
});

module.exports = router;
