// routes/student.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', authorize('coordinator', 'admin'), ctrl.getAllStudents);
router.get('/stats', authorize('coordinator', 'admin'), ctrl.getPlacementStats);
router.get('/:id', authorize('coordinator', 'admin'), ctrl.getStudentById);
router.put('/profile', ctrl.updateProfile);
router.patch('/:id/status', authorize('coordinator', 'admin'), ctrl.updateStudentStatus);
router.delete('/:id', authorize('coordinator', 'admin'), ctrl.deleteStudent);
router.post('/bulk-import', authorize('coordinator', 'admin'), ctrl.bulkImport);

module.exports = router;
