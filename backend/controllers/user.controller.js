const Employee = require('../models/Employee');

// GET /api/users/profile
exports.getProfile = async (req, res) => {
  res.json({ success: true, data: req.user });
};

// PUT /api/users/profile
exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'country', 'email', 'salary'];
    const updates = {};
    allowedFields.forEach(f => {
      if (req.body[f] !== undefined && req.body[f] !== null && req.body[f] !== '') {
        updates[f] = f === 'salary' ? Number(req.body[f]) : req.body[f];
      }
    });
    if (req.file) updates.photo = `/uploads/${req.file.filename}`;

    if (Object.keys(updates).length === 0 && !req.file) {
      return res.status(400).json({ success: false, message: 'No profile fields to update.' });
    }

    const updated = await Employee.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, message: 'Profile updated.', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/users — all employees (Manager/Finance/CEO)
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, count: employees.length, data: employees });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
