const User = require('../models/User');
const Application = require('../models/Application');
const { validationResult } = require('express-validator');

// ─── Get All Students (Coordinator) ──────────────────────────────────────────
exports.getAllStudents = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, branch, status, search, sort = '-createdAt' } = req.query;

    const filter = { role: 'student', isActive: true };
    if (branch) filter['studentProfile.branch'] = branch;
    if (status) filter['studentProfile.placementStatus'] = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'studentProfile.rollNumber': { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(filter);
    const students = await User.find(filter)
      .select('-password')
      .populate('studentProfile.placedCompany', 'name logo')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: students,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Get Student By ID ────────────────────────────────────────────────────────
exports.getStudentById = async (req, res, next) => {
  try {
    const student = await User.findOne({ _id: req.params.id, role: 'student' })
      .select('-password')
      .populate('studentProfile.placedCompany', 'name logo industry');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Get application history
    const applications = await Application.find({ student: req.params.id })
      .populate('company', 'name logo industry')
      .sort('-appliedAt');

    res.json({ success: true, data: { student, applications } });
  } catch (err) {
    next(err);
  }
};

// ─── Update Student Profile (Student self-update) ─────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const allowedFields = ['name', 'avatar', 'studentProfile'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // Prevent status manipulation by student
    if (updates.studentProfile) {
      delete updates.studentProfile.placementStatus;
      delete updates.studentProfile.placedCompany;
      delete updates.studentProfile.placedPackage;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

// ─── Update Student Status (Coordinator) ─────────────────────────────────────
exports.updateStudentStatus = async (req, res, next) => {
  try {
    const { placementStatus, placedCompany, placedPackage } = req.body;

    const updates = { 'studentProfile.placementStatus': placementStatus };
    if (placedCompany) updates['studentProfile.placedCompany'] = placedCompany;
    if (placedPackage) updates['studentProfile.placedPackage'] = placedPackage;

    const student = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'student' },
      updates,
      { new: true, runValidators: true }
    ).select('-password').populate('studentProfile.placedCompany', 'name logo');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, data: student, message: 'Student status updated successfully' });
  } catch (err) {
    next(err);
  }
};

// ─── Delete Student (Coordinator/Admin) ──────────────────────────────────────
exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'student' },
      { isActive: false },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, message: 'Student deactivated successfully' });
  } catch (err) {
    next(err);
  }
};

// ─── Bulk Import Students ─────────────────────────────────────────────────────
exports.bulkImport = async (req, res, next) => {
  try {
    const { students } = req.body;
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ success: false, message: 'Students array required' });
    }

    const results = { created: 0, failed: [], skipped: 0 };

    for (const s of students) {
      try {
        const exists = await User.findOne({ email: s.email });
        if (exists) { results.skipped++; continue; }
        await User.create({ ...s, role: 'student', password: s.password || 'Welcome@123' });
        results.created++;
      } catch (e) {
        results.failed.push({ email: s.email, error: e.message });
      }
    }

    res.json({ success: true, data: results, message: `Imported ${results.created} students` });
  } catch (err) {
    next(err);
  }
};

// ─── Get Placement Statistics ─────────────────────────────────────────────────
exports.getPlacementStats = async (req, res, next) => {
  try {
    const stats = await User.aggregate([
      { $match: { role: 'student', isActive: true } },
      {
        $group: {
          _id: '$studentProfile.placementStatus',
          count: { $sum: 1 },
          avgCGPA: { $avg: '$studentProfile.cgpa' },
        },
      },
    ]);

    const branchStats = await User.aggregate([
      { $match: { role: 'student', isActive: true } },
      {
        $group: {
          _id: '$studentProfile.branch',
          total: { $sum: 1 },
          placed: {
            $sum: { $cond: [{ $eq: ['$studentProfile.placementStatus', 'placed'] }, 1, 0] },
          },
          avgPackage: { $avg: '$studentProfile.placedPackage' },
        },
      },
    ]);

    res.json({ success: true, data: { statusStats: stats, branchStats } });
  } catch (err) {
    next(err);
  }
};
