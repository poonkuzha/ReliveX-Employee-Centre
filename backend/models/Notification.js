const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  type: {
    type: String,
    enum: ['expense_submitted', 'expense_approved', 'expense_rejected', 'query_response', 'general'],
    default: 'general'
  },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  read:    { type: Boolean, default: false },
  refId:   { type: mongoose.Schema.Types.ObjectId }  // reference to expense/query
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
