const jwt = require('jsonwebtoken');
const Employee = require('../models/Employee');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, employeeId, country, salary, role, email, password } = req.body;

    // Check duplicate
    const existing = await Employee.findOne({ $or: [{ employeeId }, { email }] });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: existing.employeeId === employeeId
          ? 'Developer ID already exists.'
          : 'Email already registered.'
      });
    }

    const photo = req.file ? `/uploads/${req.file.filename}` : '';

    const employee = await Employee.create({
      name, employeeId, country, salary: Number(salary),
      role: role || 'Developer', email, password, photo
    });

    const token = signToken(employee._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: {
        _id: employee._id,
        name: employee.name,
        employeeId: employee.employeeId,
        role: employee.role,
        email: employee.email,
        photo: employee.photo,
        country: employee.country,
        salary: employee.salary
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    let { employeeId, password } = req.body;
    employeeId = employeeId?.toString().trim().toUpperCase();
    password = password?.toString();

    if (!employeeId || !password) {
      return res.status(400).json({ success: false, message: 'Developer ID and password are required.' });
    }

    const employee = await Employee.findOne({ employeeId }).select('+password');
    if (!employee) {
      return res.status(401).json({ success: false, message: 'Invalid Developer ID or password.' });
    }

    const isMatch = await employee.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid Developer ID or password.' });
    }

    const token = signToken(employee._id);

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        _id: employee._id,
        name: employee.name,
        employeeId: employee.employeeId,
        role: employee.role,
        email: employee.email,
        photo: employee.photo,
        country: employee.country,
        salary: employee.salary
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/forgot
exports.forgotPassword = async (req, res) => {
  try {
    let { email, newPassword } = req.body;
    email = email?.toString().trim().toLowerCase();
    newPassword = newPassword?.toString();
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email and new password are required.' });
    }

    const employee = await Employee.findOne({ email });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'No account found for this email.' });
    }

    employee.password = newPassword;
    await employee.save();
    res.json({ success: true, message: 'Password updated successfully. Please log in with your new password.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};
