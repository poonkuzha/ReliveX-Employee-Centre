const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  employeeCode: { type: String, required: true },
  subject:      { type: String, required: true, trim: true },
  message:      { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ['Open', 'In Review', 'Resolved'],
    default: 'Open'
  },
  adminResponse: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Query', querySchema);
