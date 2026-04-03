const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected to Love Diary'))
  .catch(err => console.log(err));

// --- MODELS ---
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  name: { type: String, default: '' }
});
const User = mongoose.model('User', UserSchema);

const DiarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, default: '' },
  date: { type: String, required: true }, // Storing as YYYY-MM-DD
  background: { type: String, default: 'soft-cream' } // Store selected background
});
const Diary = mongoose.model('Diary', DiarySchema);

// --- MIDDLEWARE ---
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access Denied' });
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid Token' });
  }
};

// --- ROUTES ---

// 1. Auth: Signup
app.post('/api/signup', async (req, res) => {
  const { username, password, email } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const user = new User({ username, password: hashedPassword, email });
  await user.save();
  res.json({ message: 'User created' });
});

// 2. Auth: Login
app.post('/api/login', async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user) return res.status(400).json({ error: 'User not found' });
  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).json({ error: 'Invalid password' });
  
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
  res.json({ token, userId: user._id, name: user.name });
});

// 3. Auto-save / Get Today's Diary
// This endpoint handles the "Only Today" and "Auto-save on type" logic
app.post('/api/diary/today', verifyToken, async (req, res) => {
  // Use Asia/Kolkata timezone for IST (UTC+5:30)
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  const { content, background } = req.body;

  try {
    let diary = await Diary.findOne({ userId: req.user._id, date: today });
    
    // If auto-saving (content is provided)
    if (content !== undefined) {
      if (diary) {
        diary.content = content;
        if (background) diary.background = background;
        await diary.save();
      } else {
        diary = new Diary({ userId: req.user._id, content, date: today, background: background || 'soft-cream' });
        await diary.save();
      }
    } 
    // If just fetching today's diary
    else if (!diary) {
      diary = new Diary({ userId: req.user._id, content: '', date: today, background: 'soft-cream' });
      await diary.save();
    }
    
    res.json(diary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Get Diary History
app.get('/api/diary/history', verifyToken, async (req, res) => {
  try {
    // Finds all diaries for this user and sorts them by date (newest first)
    const diaries = await Diary.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(diaries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Get User Profile
app.get('/api/user/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`));