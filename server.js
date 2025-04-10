// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const LANG_FILE = path.join(__dirname, 'lang.json');

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(session({ secret: 'aqua-secret', resave: false, saveUninitialized: true }));

function loadData() {
  return JSON.parse(fs.readFileSync(DATA_FILE));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Language route
app.get('/lang', (req, res) => {
  const lang = JSON.parse(fs.readFileSync(LANG_FILE));
  res.json(lang);
});

// Login route
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const data = loadData();
  const user = data.users.find(u => u.username === username && u.password === password);
  if (user) {
    req.session.user = username;
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// Register route
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  const data = loadData();
  const exists = data.users.find(u => u.username === username);
  if (exists) {
    res.json({ success: false, message: 'ชื่อผู้ใช้นี้มีอยู่แล้ว' });
  } else {
    data.users.push({ username, password });
    saveData(data);
    res.json({ success: true });
  }
});

// Booking route
app.post('/api/book', (req, res) => {
  if (!req.session.user) return res.status(401).json({ success: false });
  const booking = req.body;
  const data = loadData();
  data.bookings.push(booking);
  saveData(data);
  res.json({ success: true });
});

// Middleware to protect booking.html
app.get('/booking.html', (req, res, next) => {
  if (!req.session.user) return res.redirect('/index.html');
  next();
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

app.get('/api/bookings', (req, res) => {
    const filePath = path.join(__dirname, 'data.json'); // ✅ แก้ตรงนี้
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const json = JSON.parse(raw);
      res.json(json.bookings || []); // ✅ คืนเฉพาะ bookings array
    } else {
      res.json([]);
    }
  });
  
  