const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getAllEmployees } = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, upload.single('photo'), updateProfile);
router.get('/', protect, authorize('Manager', 'Finance', 'CEO'), getAllEmployees);

module.exports = router;
