const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.post('/register', upload.single('photo'), register);
router.post('/login', login);
router.post('/forgot', forgotPassword);
router.get('/me', protect, getMe);

module.exports = router;
