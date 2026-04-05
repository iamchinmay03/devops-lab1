// routes/application.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', authorize('student'), ctrl.applyToCompany);
router.get('/my', authorize('student'), ctrl.getMyApplications);
router.get('/', authorize('coordinator', 'admin'), ctrl.getAllApplications);
router.patch('/:id/status', authorize('coordinator', 'admin'), ctrl.updateApplicationStatus);
router.patch('/:id/withdraw', authorize('student'), ctrl.withdrawApplication);

module.exports = router;
