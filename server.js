const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schemas
const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  email: { type: String, required: true },
  phone: String,
  role: { type: String, default: 'member' },
  familyRole: String,
  avatar: String,
  password: { type: String, required: true },
  createdAt: String
});

const MemberSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  familyRole: String,
  avatar: String,
  phone: String,
  userId: String
});

const ExpenseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  category: String,
  amount: Number,
  date: String,
  note: String,
  addedBy: String
});

const MealSchema = new mongoose.Schema({
  weekStart: { type: String, required: true, unique: true },
  data: mongoose.Schema.Types.Mixed
});

const TaskSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: String,
  type: String,
  priority: String,
  date: String,
  time: String,
  note: String,
  done: Boolean,
  addedBy: String
});

const MessageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: String,
  userName: String,
  avatar: String,
  text: String,
  time: String,
  reactions: [String]
});

const PhotoSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  url: String,
  caption: String,
  uploadedBy: String,
  date: String,
  likes: [String],
  comments: mongoose.Schema.Types.Mixed
});

const LocationSchema = new mongoose.Schema({
  id: { type: String, default: 'global' },
  data: mongoose.Schema.Types.Mixed
});

const SettingSchema = new mongoose.Schema({
  id: { type: String, default: 'global' },
  familyName: String,
  lang: String,
  darkMode: Boolean
});


// Models
const User = mongoose.model('User', UserSchema);
const Member = mongoose.model('Member', MemberSchema);
const Expense = mongoose.model('Expense', ExpenseSchema);
const Meal = mongoose.model('Meal', MealSchema);
const Task = mongoose.model('Task', TaskSchema);
const Message = mongoose.model('Message', MessageSchema);
const Photo = mongoose.model('Photo', PhotoSchema);
const Location = mongoose.model('Location', LocationSchema);
const Setting = mongoose.model('Setting', SettingSchema);

// Generic CRUD factory-ish routes
const setupRoutes = (path, Model) => {
  app.get(`/api/${path}`, async (req, res) => {
    try {
      const data = await Model.find();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post(`/api/${path}`, async (req, res) => {
    try {
      // If it's a save-all (array), clear and insert
      if (Array.isArray(req.body)) {
        await Model.deleteMany({});
        const data = await Model.insertMany(req.body);
        res.json(data);
      } else {
        // Individual save/update
        const filter = req.body.id ? { id: req.body.id } : { id: 'global' };
        const data = await Model.findOneAndUpdate(filter, req.body, { upsert: true, new: true });
        res.json(data);
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};

setupRoutes('users', User);
setupRoutes('members', Member);
setupRoutes('expenses', Expense);
setupRoutes('tasks', Task);
setupRoutes('messages', Message);
setupRoutes('photos', Photo);

// Special routes for non-standard structures
app.get('/api/meals', async (req, res) => {
  try {
    const data = await Meal.find();
    const result = {};
    data.forEach(m => result[m.weekStart] = m.data);
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/meals', async (req, res) => {
  try {
    // req.body is the entire meals object
    await Meal.deleteMany({});
    const entries = Object.entries(req.body).map(([ws, data]) => ({ weekStart: ws, data }));
    await Meal.insertMany(entries);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/locations', async (req, res) => {
  const loc = await Location.findOne({ id: 'global' });
  res.json(loc ? loc.data : {});
});

app.post('/api/locations', async (req, res) => {
  await Location.findOneAndUpdate({ id: 'global' }, { data: req.body }, { upsert: true });
  res.json({ success: true });
});

app.get('/api/settings', async (req, res) => {
  const s = await Setting.findOne({ id: 'global' });
  res.json(s || { familyName: 'आमचे कुटुंब', lang: 'mr', darkMode: false });
});

app.post('/api/settings', async (req, res) => {
  await Setting.findOneAndUpdate({ id: 'global' }, req.body, { upsert: true });
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
