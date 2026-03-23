const Expense = require('../models/Expense');
const Employee = require('../models/Employee');
const { calculatePriority, financeApprovalLogic, ceoApprovalLogic } = require('../config/priority');
const { createNotification, sendEmail, sendSlackNotification, expenseEmailHtml } = require('../config/notification.service');

// POST /api/expense — Submit expense request
exports.submitExpense = async (req, res) => {
  try {
    const { amount, reason } = req.body;
    const employee = req.user;

    if (!amount || !reason) {
      return res.status(400).json({ success: false, message: 'Amount and reason are required.' });
    }
    if (amount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0.' });
    }

    const expense = await Expense.create({
      employeeId:   employee._id,
      employeeName: employee.name,
      employeeCode: employee.employeeId,
      country:      employee.country,
      salary:       employee.salary,
      amount:       Number(amount),
      reason,
      currentStage: 'Manager'
    });

    // Notify employee
    await createNotification(
      employee._id,
      'expense_submitted',
      'Expense Request Submitted',
      `Your expense request of $${amount} has been submitted and is awaiting manager approval.`,
      expense._id
    );

    // Notify all managers
    const managers = await Employee.find({ role: 'Manager' });
    for (const mgr of managers) {
      await createNotification(
        mgr._id,
        'general',
        'New Expense Request',
        `${employee.name} (${employee.employeeId}) has submitted an expense request of $${amount}.`,
        expense._id
      );
    }

    await sendSlackNotification(
      `💰 *New Expense Request* | ${employee.name} (${employee.employeeId}) | Amount: $${amount} | Reason: ${reason}`
    );

    res.status(201).json({ success: true, message: 'Expense request submitted successfully.', data: expense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/expense/my — Employee's own expenses
exports.getMyExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ employeeId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: expenses.length, data: expenses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/expense/pending-manager — Expenses awaiting manager (Manager role)
exports.getPendingManager = async (req, res) => {
  try {
    const expenses = await Expense.find({ currentStage: 'Manager' })
      .populate('employeeId', 'name employeeId email')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: expenses.length, data: expenses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/expense/pending-finance — Expenses awaiting finance
exports.getPendingFinance = async (req, res) => {
  try {
    const expenses = await Expense.find({ currentStage: 'Finance' })
      .populate('employeeId', 'name employeeId email')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: expenses.length, data: expenses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/expense/pending-ceo — Expenses awaiting CEO
exports.getPendingCEO = async (req, res) => {
  try {
    const expenses = await Expense.find({ currentStage: 'CEO' })
      .populate('employeeId', 'name employeeId email')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: expenses.length, data: expenses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/expense/all — All expenses (Manager/Finance/CEO)
exports.getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find()
      .populate('employeeId', 'name employeeId email')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: expenses.length, data: expenses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/expense/:id
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('employeeId', 'name employeeId email country salary');
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found.' });
    res.json({ success: true, data: expense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/expense/:id/manager ─────────────────────────────
exports.managerDecision = async (req, res) => {
  try {
    const { decision, remarks } = req.body;
    if (!['Approved', 'Rejected'].includes(decision)) {
      return res.status(400).json({ success: false, message: 'Decision must be Approved or Rejected.' });
    }

    const expense = await Expense.findById(req.params.id).populate('employeeId');
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found.' });
    if (expense.currentStage !== 'Manager') {
      return res.status(400).json({ success: false, message: 'Expense is not in Manager stage.' });
    }

    // Calculate priority
    const priority = calculatePriority(expense.amount, expense.country, expense.salary);

    expense.priority = priority;
    expense.managerDecision = { decision, decidedBy: req.user._id, decidedAt: new Date(), remarks: remarks || '' };

    const employee = expense.employeeId;

    if (decision === 'Rejected') {
      expense.finalStatus = 'Rejected';
      expense.currentStage = 'Completed';
      expense.rejectionReason = remarks || 'Rejected by Manager';

      await createNotification(employee._id, 'expense_rejected',
        'Expense Request Rejected',
        `Your expense request of $${expense.amount} was rejected by Manager. Reason: ${remarks || 'Not specified'}`,
        expense._id
      );
      await sendEmail(employee.email, 'Expense Request Rejected',
        expenseEmailHtml(employee, expense, 'Rejected', remarks)
      );
      await sendSlackNotification(
        `❌ Expense *Rejected* by Manager | ${employee.name} | $${expense.amount} | Priority: ${priority} | Reason: ${remarks}`
      );
    } else {
      // Approved → send to Finance
      expense.currentStage = 'Finance';
      await createNotification(employee._id, 'general',
        'Expense Approved by Manager',
        `Your expense request of $${expense.amount} has been approved by Manager and forwarded to Finance. Priority: ${priority}`,
        expense._id
      );

      const financeTeam = await Employee.find({ role: 'Finance' });
      for (const f of financeTeam) {
        await createNotification(f._id, 'general',
          'Expense Pending Finance Approval',
          `${employee.name}'s expense of $${expense.amount} (Priority: ${priority}) is awaiting Finance approval.`,
          expense._id
        );
      }
      await sendSlackNotification(
        `✅ Expense *Manager Approved* | ${employee.name} | $${expense.amount} | Priority: ${priority} → Forwarded to Finance`
      );
    }

    await expense.save();
    res.json({ success: true, message: `Manager decision: ${decision}`, data: expense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/expense/:id/finance ─────────────────────────────
exports.financeDecision = async (req, res) => {
  try {
    const { remarks } = req.body;

    const expense = await Expense.findById(req.params.id).populate('employeeId');
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found.' });
    if (expense.currentStage !== 'Finance') {
      return res.status(400).json({ success: false, message: 'Expense is not in Finance stage.' });
    }

    // Auto-calculate based on logic
    const decision = financeApprovalLogic(expense.priority, expense.order);

    expense.financeDecision = { decision, decidedBy: req.user._id, decidedAt: new Date(), remarks: remarks || '' };

    const employee = expense.employeeId;

    if (decision === 'Rejected') {
      expense.finalStatus = 'Rejected';
      expense.currentStage = 'Completed';
      expense.rejectionReason = 'Rejected by Finance based on priority and order rules.';

      await createNotification(employee._id, 'expense_rejected',
        'Expense Rejected by Finance',
        `Your expense of $${expense.amount} was rejected by Finance. Priority: ${expense.priority}, Order: ${expense.order}`,
        expense._id
      );
      await sendEmail(employee.email, 'Expense Request Rejected by Finance',
        expenseEmailHtml(employee, expense, 'Rejected', 'Rejected by Finance based on priority/order rules.')
      );

      // Notify Manager
      const managers = await Employee.find({ role: 'Manager' });
      for (const mgr of managers) {
        await createNotification(mgr._id, 'expense_rejected',
          'Expense Rejected at Finance',
          `${employee.name}'s expense of $${expense.amount} was rejected by Finance.`,
          expense._id
        );
      }
      await sendSlackNotification(
        `❌ Expense *Rejected by Finance* | ${employee.name} | $${expense.amount} | Priority: ${expense.priority} | Order: ${expense.order}`
      );
    } else {
      // Approved → send to CEO
      expense.currentStage = 'CEO';
      await createNotification(employee._id, 'general',
        'Expense Approved by Finance',
        `Your expense of $${expense.amount} has been approved by Finance and forwarded to CEO.`,
        expense._id
      );

      const ceos = await Employee.find({ role: 'CEO' });
      for (const c of ceos) {
        await createNotification(c._id, 'general',
          'Expense Pending CEO Approval',
          `${employee.name}'s expense of $${expense.amount} (Priority: ${expense.priority}) requires your approval.`,
          expense._id
        );
      }
      await sendSlackNotification(
        `✅ Expense *Finance Approved* | ${employee.name} | $${expense.amount} → Forwarded to CEO`
      );
    }

    await expense.save();
    res.json({ success: true, message: `Finance auto-decision: ${decision}`, data: expense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/expense/:id/ceo ──────────────────────────────────
exports.ceoDecision = async (req, res) => {
  try {
    const { decision, remarks } = req.body;
    if (!['Approved', 'Rejected'].includes(decision)) {
      return res.status(400).json({ success: false, message: 'Decision must be Approved or Rejected.' });
    }

    const expense = await Expense.findById(req.params.id).populate('employeeId');
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found.' });
    if (expense.currentStage !== 'CEO') {
      return res.status(400).json({ success: false, message: 'Expense is not in CEO stage.' });
    }

    // Validate CEO logic
    const autoDecision = ceoApprovalLogic(expense.priority, expense.order, expense.country, expense.salary);
    const finalDecision = decision === 'Approved' && autoDecision === 'Approved' ? 'Approved' : 'Rejected';

    expense.ceoDecision = { decision: finalDecision, decidedBy: req.user._id, decidedAt: new Date(), remarks: remarks || '' };
    expense.currentStage = 'Completed';

    const employee = expense.employeeId;

    if (finalDecision === 'Approved') {
      expense.finalStatus = 'Approved';
      expense.approvedDate = new Date();
      expense.expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // +1 year

      await createNotification(employee._id, 'expense_approved',
        'Expense Request Approved!',
        `Congratulations! Your expense of $${expense.amount} has been fully approved by CEO. Valid for 1 year.`,
        expense._id
      );
      await sendEmail(employee.email, '✅ Expense Request Approved',
        expenseEmailHtml(employee, expense, 'Approved')
      );
      await sendSlackNotification(
        `🎉 Expense *FULLY APPROVED* by CEO | ${employee.name} | $${expense.amount} | Priority: ${expense.priority}`
      );
    } else {
      expense.finalStatus = 'Rejected';
      expense.rejectionReason = remarks || `CEO rejected: does not meet ${expense.priority} priority criteria for order ${expense.order}.`;

      await createNotification(employee._id, 'expense_rejected',
        'Expense Rejected by CEO',
        `Your expense of $${expense.amount} was rejected by CEO. Reason: ${expense.rejectionReason}`,
        expense._id
      );
      await sendEmail(employee.email, 'Expense Request Rejected by CEO',
        expenseEmailHtml(employee, expense, 'Rejected', expense.rejectionReason)
      );

      const managers = await Employee.find({ role: { $in: ['Manager', 'Finance'] } });
      for (const m of managers) {
        await createNotification(m._id, 'expense_rejected',
          'Expense Rejected at CEO Level',
          `${employee.name}'s expense of $${expense.amount} was rejected by CEO.`,
          expense._id
        );
      }
      await sendSlackNotification(
        `❌ Expense *Rejected by CEO* | ${employee.name} | $${expense.amount} | Reason: ${expense.rejectionReason}`
      );
    }

    await expense.save();
    res.json({ success: true, message: `CEO decision: ${finalDecision}`, data: expense });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
