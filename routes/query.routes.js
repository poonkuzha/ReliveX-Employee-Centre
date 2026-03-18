// query.routes.js
const express = require('express');
const router = express.Router();
const { submitQuery, getMyQueries, getAllQueries } = require('../controllers/query.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
router.post('/',   protect, submitQuery);
router.get('/my',  protect, getMyQueries);
router.get('/all', protect, authorize('Manager','Finance','CEO'), getAllQueries);
module.exports = router;
