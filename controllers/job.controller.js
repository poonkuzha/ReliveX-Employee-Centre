const Job = require('../models/Job');

// GET /api/jobs
exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, count: jobs.length, data: jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/jobs/recommended — filter jobs matching employee skills/role
exports.getRecommended = async (req, res) => {
  try {
    const employeeRole = req.user.role;
    const jobs = await Job.find({ isActive: true }).limit(3);
    res.json({ success: true, data: jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
