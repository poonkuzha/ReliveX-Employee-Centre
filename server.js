const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ─── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:4200',
    'http://127.0.0.1:4200',
    'http://localhost:4210',
    'http://127.0.0.1:4210',
    'http://localhost:4220',
    'http://127.0.0.1:4220'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Routes ──────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth.routes'));
app.use('/api/users',         require('./routes/user.routes'));
app.use('/api/jobs',          require('./routes/job.routes'));
app.use('/api/query',         require('./routes/query.routes'));
app.use('/api/expense',       require('./routes/expense.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/dashboard',     require('./routes/dashboard.routes'));
// ─── Mock Slack Webhook (dev fallback) ──────────────────────────
app.post('/mock-slack', (req, res) => {
  console.log('🚀 Mock Slack received:', req.body);
  return res.status(200).json({ success: true, message: 'Mock Slack payload received' });
});
// ─── Health check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Relivex API running' }));

// ─── MongoDB Connection ───────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    let PORT = Number(process.env.PORT) || 5000;
    const startServer = () => {
      const server = app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE' && PORT < 5099) {
          console.warn(`⚠️ Port ${PORT} is in use, trying ${PORT + 1}...`);
          PORT += 1;
          startServer();
        } else if (err.code === 'EADDRINUSE') {
          console.error(`❌ Port ${PORT} is already in use. Set PORT in .env or stop the other process.`);
          process.exit(1);
        } else {
          throw err;
        }
      });
    };
    startServer();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
