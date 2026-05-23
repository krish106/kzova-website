require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const nodemailer = require('nodemailer');
const { MongoClient } = require('mongodb');

const app = express();
// Use process.env.PORT for Render deployment
const port = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const uri = process.env.MONGODB_URI || process.env.MONGODB_URL || process.env.MONGO_URI;
console.log('Available Env Keys:', Object.keys(process.env).join(', '));
let client;
let db;

async function connectDB() {
  if (!uri) {
    console.warn('⚠️ MONGODB_URI is not set. Database features will fail.');
    return { isConfigError: true, msg: 'MONGODB_URI is literally missing from Render environment variables.' };
  }
  if (!db) {
    try {
      client = new MongoClient(uri.replace(/\s+/g, '')); // Remove accidentally pasted spaces/newlines
      await client.connect();
      db = client.db('kzova');
      console.log('✅ Connected to MongoDB');
    } catch (err) {
      console.error('MongoDB Connection Error:', err.message);
      client = null;
      throw err; // Force the API to catch and return this error
    }
  }
  return db;
}
connectDB().catch(console.error);

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(session({
  secret: 'kzova-admin-secret-key-2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 4 } // 4 hours
}));

// Serve static files from the current directory
app.use(express.static(__dirname, { extensions: ['html'] }));

// ── Public API: Get data ──
app.get('/api/data', async (req, res) => {
  try {
    const database = await connectDB();
    if (!database) return res.status(500).json({ error: 'No database connection' });
    if (database.isConfigError) return res.status(500).json({ error: database.msg });
    
    const dataDoc = await database.collection('siteData').findOne({ _id: 'kzova_data' });
    if (dataDoc && dataDoc.data) {
      res.json(dataDoc.data);
    } else {
      res.json({});
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to read data from MongoDB' });
  }
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
  if (req.body && req.body.password === ADMIN_PASSWORD) {
    req.session.authenticated = true;
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

// ── Protected API: Save data ──
app.post('/api/data', requireAuth, async (req, res) => {
  const data = req.body.data || req.body;
  try {
    const database = await connectDB();
    if (!database) return res.status(500).json({ error: 'No database connection' });

    await database.collection('siteData').updateOne(
      { _id: 'kzova_data' },
      { $set: { data: data } },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save data to MongoDB' });
  }
});

// ── Public API: Submit review ──
app.post('/api/reviews', async (req, res) => {
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

  try {
    const database = await connectDB();
    if (!database) return res.status(500).json({ error: 'No database connection' });

    await database.collection('reviews').insertOne(newReview);
    
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save review to MongoDB' });
  }
});

// ── Protected API: Get reviews ──
app.get('/api/reviews', requireAuth, async (req, res) => {
  try {
    const database = await connectDB();
    if (!database) return res.status(500).json({ error: 'No database connection' });

    const reviews = await database.collection('reviews').find({}).toArray();
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reviews from MongoDB' });
  }
});

app.listen(port, () => {
  console.log(`\n  🚀 Kzova Labs Server running on port ${port}`);
});
