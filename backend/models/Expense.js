const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  employeeName:  { type: String, required: true },
  employeeCode:  { type: String, required: true },
  country:       { type: String, required: true },
  salary:        { type: Number, required: true },
  amount:        { type: Number, required: true, min: 1 },
  reason:        { type: String, required: true, trim: true },
  order: {
    type: Number,
    default: 1
  },

  // ── Priority calculated by Manager logic ──
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low', 'Default', 'Pending'],
    default: 'Pending'
  },

  // ── Approval stages ──
  managerDecision: {
    decision:   { type: String, enum: ['Approved', 'Rejected', 'Pending'], default: 'Pending' },
    decidedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    decidedAt:  { type: Date },
    remarks:    { type: String, default: '' }
  },
  financeDecision: {
    decision:   { type: String, enum: ['Approved', 'Rejected', 'Pending'], default: 'Pending' },
    decidedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    decidedAt:  { type: Date },
    remarks:    { type: String, default: '' }
  },
  ceoDecision: {
    decision:   { type: String, enum: ['Approved', 'Rejected', 'Pending'], default: 'Pending' },
    decidedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    decidedAt:  { type: Date },
    remarks:    { type: String, default: '' }
  },

  // ── Final outcome ──
  finalStatus: {
    type: String,
    enum: ['Approved', 'Rejected', 'In Progress'],
    default: 'In Progress'
  },
  currentStage: {
    type: String,
    enum: ['Manager', 'Finance', 'CEO', 'Completed'],
    default: 'Manager'
  },
  rejectionReason: { type: String, default: '' },

  // ── Approval dates (for result page) ──
  approvedDate: { type: Date },
  expiryDate:   { type: Date }   // approvedDate + 1 year
}, {
  timestamps: true
});

// Auto-calculate order per employee
expenseSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments({ employeeId: this.employeeId });
    this.order = count + 1;
  }
  next();
});

module.exports = mongoose.model('Expense', expenseSchema);
