const Company = require('../models/Company');
const Application = require('../models/Application');
const { validationResult } = require('express-validator');

// ─── Get All Companies ────────────────────────────────────────────────────────
exports.getAllCompanies = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, industry, search, sort = '-createdAt' } = req.query;

    const filter = { isActive: true };
    if (status) filter.hiringStatus = status;
    if (industry) filter.industry = industry;
    if (search) filter.$text = { $search: search };

    const total = await Company.countDocuments(filter);
    const companies = await Company.find(filter)
      .populate('addedBy', 'name email')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: companies,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get Company by ID ────────────────────────────────────────────────────────
exports.getCompanyById = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate('addedBy', 'name email');

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    // Get applicant count
    const applicantCount = await Application.countDocuments({ company: req.params.id });
    const selectedCount = await Application.countDocuments({ company: req.params.id, status: 'selected' });

    res.json({ success: true, data: { ...company.toJSON(), applicantCount, selectedCount } });
  } catch (err) {
    next(err);
  }
};

// ─── Create Company ───────────────────────────────────────────────────────────
exports.createCompany = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const company = await Company.create({ ...req.body, addedBy: req.user.id });
    res.status(201).json({ success: true, data: company, message: 'Company added successfully' });
  } catch (err) {
    next(err);
  }
};

// ─── Update Company ───────────────────────────────────────────────────────────
exports.updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    res.json({ success: true, data: company, message: 'Company updated successfully' });
  } catch (err) {
    next(err);
  }
};

// ─── Delete Company ───────────────────────────────────────────────────────────
exports.deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id, { isActive: false }, { new: true }
    );
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    res.json({ success: true, message: 'Company removed successfully' });
  } catch (err) {
    next(err);
  }
};

// ─── Get Applicants for Company ───────────────────────────────────────────────
exports.getCompanyApplicants = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { company: req.params.id };
    if (status) filter.status = status;

    const applications = await Application.find(filter)
      .populate('student', 'name email studentProfile avatar')
      .sort('-appliedAt');

    res.json({ success: true, data: applications });
  } catch (err) {
    next(err);
  }
};
