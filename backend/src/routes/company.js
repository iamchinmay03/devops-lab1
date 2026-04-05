const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', ctrl.getAllCompanies);
router.get('/:id', ctrl.getCompanyById);
router.get('/:id/applicants', authorize('coordinator', 'admin'), ctrl.getCompanyApplicants);
router.post('/', authorize('coordinator', 'admin'), ctrl.createCompany);
router.put('/:id', authorize('coordinator', 'admin'), ctrl.updateCompany);
router.delete('/:id', authorize('coordinator', 'admin'), ctrl.deleteCompany);

module.exports = router;
