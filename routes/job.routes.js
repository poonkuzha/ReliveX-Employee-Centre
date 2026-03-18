const express = require('express');
const router = express.Router();
const { getJobs, getRecommended } = require('../controllers/job.controller');
const { protect } = require('../middleware/auth.middleware');
router.get('/',            protect, getJobs);
router.get('/recommended', protect, getRecommended);
module.exports = router;
