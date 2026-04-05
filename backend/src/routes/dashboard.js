const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/coordinator', authorize('coordinator', 'admin'), ctrl.getCoordinatorDashboard);
router.get('/student', authorize('student'), ctrl.getStudentDashboard);

module.exports = router;
