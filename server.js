const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const nodemailer = require('nodemailer');

const app = express();
const port = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
const REVIEWS_FILE = path.join(__dirname, 'reviews.json');
const ADMIN_PASSWORD = 'admin123';

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(session({
  secret: 'kzova-admin-secret-key-2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 4 } // 4 hours
}));

// Serve static files from the current directory
app.use(express.static(__dirname));

// ── Public API: Get data ──
app.get('/api/data', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to read data' });
    }
    try {
      res.json(JSON.parse(data));
    } catch (parseErr) {
      console.error(parseErr);
      res.status(500).json({ error: 'Failed to parse data' });
    }
  });
});

// ── Auth: Login ──
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    req.session.authenticated = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// ── Auth: Check status ──
app.get('/api/auth-check', (req, res) => {
  res.json({ authenticated: !!req.session.authenticated });
});

// ── Auth: Logout ──
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// ── Auth middleware ──
function requireAuth(req, res, next) {
  if (req.session.authenticated) {
    return next();
  }
  // Fallback: also accept password in body for backward compat
  if (req.body && req.body.password === ADMIN_PASSWORD) {
    req.session.authenticated = true;
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

// ── Protected API: Save data ──
app.post('/api/data', requireAuth, (req, res) => {
  const data = req.body.data || req.body;

  fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to save data' });
    }
    res.json({ success: true });
  });
});

// ── Public API: Submit review ──
app.post('/api/reviews', (req, res) => {
  const { name, email, rating, review } = req.body;
  if (!name || !review) {
    return res.status(400).json({ error: 'Name and review are required' });
  }

  const newReview = {
    id: Date.now().toString(),
    name,
    email: email || '',
    rating: parseInt(rating) || 5,
    review,
    date: new Date().toISOString()
  };

  fs.readFile(REVIEWS_FILE, 'utf8', (err, data) => {
    let reviews = [];
    if (!err && data) {
      try { reviews = JSON.parse(data); } catch (e) {}
    }
    reviews.push(newReview);
    
    fs.writeFile(REVIEWS_FILE, JSON.stringify(reviews, null, 2), (writeErr) => {
      if (writeErr) {
        console.error(writeErr);
        return res.status(500).json({ error: 'Failed to save review' });
      }
      
      // Email Notification
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'arionvpn1@gmail.com',
          pass: process.env.EMAIL_PASS
        }
      });

      const mailOptions = {
        from: '"Kzova Reviews" <arionvpn1@gmail.com>',
        to: 'arionvpn1@gmail.com',
        subject: `New Review from ${name} (${newReview.rating} Stars)`,
        text: `You have received a new review!\n\nName: ${name}\nEmail: ${newReview.email || 'N/A'}\nRating: ${newReview.rating}/5\n\nReview:\n${newReview.review}\n\nDate: ${newReview.date}`
      };

      if (process.env.EMAIL_PASS) {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error sending email:', error);
          } else {
            console.log('Review email sent:', info.response);
          }
        });
      } else {
        console.warn('Warning: EMAIL_PASS environment variable is not set. Email notification skipped.');
      }

      res.json({ success: true, review: newReview });
    });
  });
});

// ── Protected API: Get reviews ──
app.get('/api/reviews', requireAuth, (req, res) => {
  fs.readFile(REVIEWS_FILE, 'utf8', (err, data) => {
    if (err) {
      // If file doesn't exist yet, just return empty array
      return res.json([]);
    }
    try {
      res.json(JSON.parse(data));
    } catch (parseErr) {
      res.status(500).json({ error: 'Failed to parse reviews' });
    }
  });
});

app.listen(port, () => {
  console.log(`\n  🚀 Kzova Labs Server running at http://localhost:${port}`);
  console.log(`  📋 Admin panel at http://localhost:${port}/admin.html\n`);
});
