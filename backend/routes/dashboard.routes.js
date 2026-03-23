const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Expense = require('../models/Expense');
const Employee = require('../models/Employee');
const Notification = require('../models/Notification');

router.get('/', protect, async (req, res) => {
  try {
    const user = req.user;
    let stats = {};

    if (user.role === 'Developer' || user.role === 'Employee') {
      const expenses = await Expense.find({ employeeId: user._id }).sort({ createdAt: -1 }).limit(8);
      stats = {
        totalExpenses: await Expense.countDocuments({ employeeId: user._id }),
        approved:   await Expense.countDocuments({ employeeId: user._id, finalStatus: 'Approved' }),
        rejected:   await Expense.countDocuments({ employeeId: user._id, finalStatus: 'Rejected' }),
        inProgress: await Expense.countDocuments({ employeeId: user._id, finalStatus: 'In Progress' }),
        myExpenses: expenses
      };
    } else if (user.role === 'Manager') {
      const [totalEmp, pendingMyWork, recentExpenses] = await Promise.all([
        Employee.countDocuments({ isActive: true }),
        Expense.countDocuments({ 'managerDecision.decision': 'Pending' }),
        Expense.find({ 'managerDecision.decision': 'Pending' }).sort({ createdAt: -1 }).limit(5).populate('employeeId', 'name employeeId')
      ]);
      stats = { totalEmployees: totalEmp, pendingMyWork, recentExpenses };
    } else if (user.role === 'Finance') {
      const [totalEmp, pendingMyWork, recentExpenses] = await Promise.all([
        Employee.countDocuments({ isActive: true }),
        Expense.countDocuments({ 'managerDecision.decision': 'Approved', 'financeDecision.decision': 'Pending' }),
        Expense.find({ 'managerDecision.decision': 'Approved', 'financeDecision.decision': 'Pending' }).sort({ createdAt: -1 }).limit(5).populate('employeeId', 'name employeeId')
      ]);
      stats = { totalEmployees: totalEmp, pendingMyWork, recentExpenses };
    } else if (user.role === 'CEO') {
      const [totalEmp, pendingMyWork, recentExpenses] = await Promise.all([
        Employee.countDocuments({ isActive: true }),
        Expense.countDocuments({ 'financeDecision.decision': 'Approved', 'ceoDecision.decision': 'Pending' }),
        Expense.find({ 'financeDecision.decision': 'Approved', 'ceoDecision.decision': 'Pending' }).sort({ createdAt: -1 }).limit(5).populate('employeeId', 'name employeeId')
      ]);
      stats = { totalEmployees: totalEmp, pendingMyWork, recentExpenses };
    } else {
      const [totalEmp, pendingMgr, pendingFin, pendingCEO, recentExpenses] = await Promise.all([
        Employee.countDocuments({ isActive: true }),
        Expense.countDocuments({ 'managerDecision.decision': 'Pending' }),
        Expense.countDocuments({ 'managerDecision.decision': 'Approved', 'financeDecision.decision': 'Pending' }),
        Expense.countDocuments({ 'financeDecision.decision': 'Approved', 'ceoDecision.decision': 'Pending' }),
        Expense.find().sort({ createdAt: -1 }).limit(5).populate('employeeId', 'name employeeId')
      ]);
      stats = { totalEmployees: totalEmp, pendingManager: pendingMgr, pendingFinance: pendingFin, pendingCEO, recentExpenses };
    }

    const notifications = await Notification.find({ userId: user._id, read: false }).sort({ createdAt: -1 }).limit(5);
    res.json({ success: true, data: { user, stats, notifications } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
