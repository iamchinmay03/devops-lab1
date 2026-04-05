const Application = require('../models/Application');
const Company = require('../models/Company');
const User = require('../models/User');

// ─── Apply to Company ─────────────────────────────────────────────────────────
exports.applyToCompany = async (req, res, next) => {
  try {
    const { companyId, roleTitle } = req.body;

    // Check if company exists and is open
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
    if (!['open', 'upcoming'].includes(company.hiringStatus)) {
      return res.status(400).json({ success: false, message: 'Company is not accepting applications' });
    }

    // Check if already applied
    const existingApp = await Application.findOne({ student: req.user.id, company: companyId });
    if (existingApp) {
      return res.status(409).json({ success: false, message: 'Already applied to this company' });
    }

    // Check eligibility
    const student = await User.findById(req.user.id);
    const role = company.roles.find(r => r.title === roleTitle);
    if (role) {
      const elig = role.eligibility;
      const sp = student.studentProfile;

      if (elig.minCGPA && sp.cgpa < elig.minCGPA) {
        return res.status(403).json({ success: false, message: `Minimum CGPA required: ${elig.minCGPA}` });
      }
      if (elig.maxBacklogs !== undefined && sp.backlogs > elig.maxBacklogs) {
        return res.status(403).json({ success: false, message: 'Backlogs exceed allowed limit' });
      }
      if (elig.branches && !elig.branches.includes('ALL') && !elig.branches.includes(sp.branch)) {
        return res.status(403).json({ success: false, message: 'Your branch is not eligible for this role' });
      }
    }

    const application = await Application.create({
      student: req.user.id,
      company: companyId,
      roleTitle,
    });

    await application.populate([
      { path: 'company', select: 'name logo industry' },
      { path: 'student', select: 'name email' },
    ]);

    res.status(201).json({ success: true, data: application, message: 'Application submitted successfully' });
  } catch (err) {
    next(err);
  }
};

// ─── Get My Applications ──────────────────────────────────────────────────────
exports.getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ student: req.user.id })
      .populate('company', 'name logo industry hiringStatus driveDate')
      .sort('-appliedAt');

    res.json({ success: true, data: applications });
  } catch (err) {
    next(err);
  }
};

// ─── Update Application Status (Coordinator) ─────────────────────────────────
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, note, package: pkg, joiningDate } = req.body;

    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    application.status = status;
    application.timeline.push({ status, timestamp: new Date(), note, updatedBy: req.user.id });

    if (pkg) application.package = pkg;
    if (joiningDate) application.joiningDate = joiningDate;

    await application.save();

    // Update student placement status if selected
    if (status === 'selected') {
      await User.findByIdAndUpdate(application.student, {
        'studentProfile.placementStatus': 'placed',
        'studentProfile.placedCompany': application.company,
        'studentProfile.placedPackage': pkg,
      });

      await Company.findByIdAndUpdate(application.company, { $inc: { totalHired: 1 } });
    }

    await application.populate([
      { path: 'company', select: 'name logo' },
      { path: 'student', select: 'name email' },
    ]);

    res.json({ success: true, data: application, message: 'Application status updated' });
  } catch (err) {
    next(err);
  }
};

// ─── Withdraw Application ─────────────────────────────────────────────────────
exports.withdrawApplication = async (req, res, next) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      student: req.user.id,
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (['selected', 'rejected', 'withdrawn'].includes(application.status)) {
      return res.status(400).json({ success: false, message: 'Cannot withdraw this application' });
    }

    application.status = 'withdrawn';
    await application.save();

    res.json({ success: true, message: 'Application withdrawn successfully' });
  } catch (err) {
    next(err);
  }
};

// ─── Get All Applications (Coordinator) ──────────────────────────────────────
exports.getAllApplications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, company } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (company) filter.company = company;

    const total = await Application.countDocuments(filter);
    const applications = await Application.find(filter)
      .populate('student', 'name email studentProfile avatar')
      .populate('company', 'name logo industry')
      .sort('-appliedAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: applications,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};
