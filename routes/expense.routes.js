const express = require('express');
const router = express.Router();
const {
  submitExpense, getMyExpenses, getPendingManager,
  getPendingFinance, getPendingCEO, getAllExpenses,
  getExpenseById, managerDecision, financeDecision, ceoDecision
} = require('../controllers/expense.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.post('/',                protect, submitExpense);
router.get('/my',               protect, getMyExpenses);
router.get('/pending-manager',  protect, authorize('Manager','Finance','CEO'), getPendingManager);
router.get('/pending-finance',  protect, authorize('Finance','CEO'), getPendingFinance);
router.get('/pending-ceo',      protect, authorize('CEO'), getPendingCEO);
router.get('/all',              protect, authorize('Manager','Finance','CEO'), getAllExpenses);
router.get('/:id',              protect, getExpenseById);
router.put('/:id/manager',      protect, authorize('Manager'), managerDecision);
router.put('/:id/finance',      protect, authorize('Finance'), financeDecision);
router.put('/:id/ceo',          protect, authorize('CEO'), ceoDecision);

module.exports = router;
