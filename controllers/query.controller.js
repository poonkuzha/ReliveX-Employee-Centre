const Query = require('../models/Query');
const { createNotification, sendSlackNotification } = require('../config/notification.service');

// POST /api/query
exports.submitQuery = async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Subject and message are required.' });
    }

    const query = await Query.create({
      employeeId: req.user._id,
      employeeCode: req.user.employeeId,
      subject,
      message
    });

    await sendSlackNotification(
      `📬 *New Query* from ${req.user.name} (${req.user.employeeId})\nSubject: ${subject}\nMessage: ${message}`
    );

    res.status(201).json({ success: true, message: 'Query submitted successfully.', data: query });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/query/my
exports.getMyQueries = async (req, res) => {
  try {
    const queries = await Query.find({ employeeId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: queries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/query/all (Manager/Finance/CEO)
exports.getAllQueries = async (req, res) => {
  try {
    const queries = await Query.find()
      .populate('employeeId', 'name employeeId email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: queries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
