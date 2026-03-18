const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  department:  { type: String, required: true },
  location:    { type: String, required: true },
  type:        { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Remote'], default: 'Full-time' },
  salaryRange: { min: Number, max: Number, currency: { type: String, default: 'USD' } },
  description: { type: String },
  requirements: [String],
  skills: [String],
  isActive:    { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Job', jobSchema);
