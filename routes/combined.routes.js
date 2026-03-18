// ── query.routes.js ──────────────────────────────────────────
const express = require('express');
const qRouter = express.Router();
const { submitQuery, getMyQueries, getAllQueries } = require('../controllers/query.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

qRouter.post('/',    protect, submitQuery);
qRouter.get('/my',   protect, getMyQueries);
qRouter.get('/all',  protect, authorize('Manager','Finance','CEO'), getAllQueries);

module.exports.queryRouter = qRouter;

// ── job.routes.js ─────────────────────────────────────────────
const jRouter = express.Router();
const { getJobs, getRecommended } = require('../controllers/job.controller');

jRouter.get('/',            protect, getJobs);
jRouter.get('/recommended', protect, getRecommended);

module.exports.jobRouter = jRouter;

// ── notification.routes.js ────────────────────────────────────
const nRouter = express.Router();
const Notification = require('../models/Notification');

nRouter.get('/', protect, async (req, res) => {
  try {
    const notifs = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(30);
    res.json({ success: true, data: notifs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

nRouter.put('/:id/read', protect, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true, message: 'Marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

nRouter.put('/mark-all-read', protect, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports.notificationRouter = nRouter;

// ── dashboard.routes.js ───────────────────────────────────────
const dRouter = express.Router();
const Expense = require('../models/Expense');
const Employee = require('../models/Employee');
const Notif = require('../models/Notification');

dRouter.get('/', protect, async (req, res) => {
  try {
    const user = req.user;
    let stats = {};

    if (user.role === 'Developer' || user.role === 'Employee') {
      const expenses = await Expense.find({ employeeId: user._id });
      stats = {
        totalExpenses: expenses.length,
        approved: expenses.filter(e => e.finalStatus === 'Approved').length,
        rejected: expenses.filter(e => e.finalStatus === 'Rejected').length,
        inProgress: expenses.filter(e => e.finalStatus === 'In Progress').length
      };
    } else {
      const [totalEmp, pendingMgr, pendingFin, pendingCEO, allExp] = await Promise.all([
        Employee.countDocuments({ isActive: true }),
        Expense.countDocuments({ currentStage: 'Manager' }),
        Expense.countDocuments({ currentStage: 'Finance' }),
        Expense.countDocuments({ currentStage: 'CEO' }),
        Expense.find().sort({ createdAt: -1 }).limit(5).populate('employeeId', 'name employeeId')
      ]);
      stats = { totalEmployees: totalEmp, pendingManager: pendingMgr, pendingFinance: pendingFin, pendingCEO, recentExpenses: allExp };
    }

    const notifications = await Notif.find({ userId: user._id, read: false }).limit(5).sort({ createdAt: -1 });
    res.json({ success: true, data: { user, stats, notifications } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports.dashboardRouter = dRouter;
