const User = require('../models/User');
const Company = require('../models/Company');
const Application = require('../models/Application');

// ─── Coordinator Dashboard ────────────────────────────────────────────────────
exports.getCoordinatorDashboard = async (req, res, next) => {
  try {
    const [
      totalStudents,
      placedStudents,
      totalCompanies,
      activeCompanies,
      totalApplications,
      recentApplications,
      placementByBranch,
      monthlyPlacements,
      topCompanies,
    ] = await Promise.all([
      User.countDocuments({ role: 'student', isActive: true }),
      User.countDocuments({ role: 'student', isActive: true, 'studentProfile.placementStatus': 'placed' }),
      Company.countDocuments({ isActive: true }),
      Company.countDocuments({ isActive: true, hiringStatus: { $in: ['open', 'in_progress'] } }),
      Application.countDocuments(),
      Application.find()
        .populate('student', 'name email studentProfile')
        .populate('company', 'name logo')
        .sort('-createdAt')
        .limit(10),

      User.aggregate([
        { $match: { role: 'student', isActive: true } },
        {
          $group: {
            _id: '$studentProfile.branch',
            total: { $sum: 1 },
            placed: { $sum: { $cond: [{ $eq: ['$studentProfile.placementStatus', 'placed'] }, 1, 0] } },
          },
        },
        { $sort: { total: -1 } },
      ]),

      Application.aggregate([
        { $match: { status: 'selected' } },
        {
          $group: {
            _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 },
      ]),

      Company.find({ isActive: true })
        .sort('-totalHired')
        .limit(5)
        .select('name logo totalHired industry'),
    ]);

    const placementRate = totalStudents > 0
      ? ((placedStudents / totalStudents) * 100).toFixed(1)
      : 0;

    // Average package
    const packageStats = await User.aggregate([
      { $match: { role: 'student', isActive: true, 'studentProfile.placementStatus': 'placed' } },
      {
        $group: {
          _id: null,
          avgPackage: { $avg: '$studentProfile.placedPackage' },
          maxPackage: { $max: '$studentProfile.placedPackage' },
          minPackage: { $min: '$studentProfile.placedPackage' },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalStudents,
          placedStudents,
          unplacedStudents: totalStudents - placedStudents,
          placementRate: Number(placementRate),
          totalCompanies,
          activeCompanies,
          totalApplications,
        },
        packageStats: packageStats[0] || { avgPackage: 0, maxPackage: 0, minPackage: 0 },
        recentApplications,
        placementByBranch,
        monthlyPlacements,
        topCompanies,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── Student Dashboard ────────────────────────────────────────────────────────
exports.getStudentDashboard = async (req, res, next) => {
  try {
    const student = await User.findById(req.user.id)
      .populate('studentProfile.placedCompany', 'name logo industry');

    const [myApplications, openCompanies, eligibleCompanies] = await Promise.all([
      Application.find({ student: req.user.id })
        .populate('company', 'name logo industry driveDate hiringStatus')
        .sort('-appliedAt'),
      Company.find({ hiringStatus: 'open', isActive: true })
        .select('name logo industry roles driveDate registrationDeadline hiringStatus')
        .sort('-createdAt')
        .limit(10),
      Company.find({
        hiringStatus: { $in: ['open', 'upcoming'] },
        isActive: true,
        'roles.eligibility.branches': {
          $in: ['ALL', student.studentProfile?.branch || 'CSE'],
        },
      }).select('name logo industry roles driveDate hiringStatus').limit(5),
    ]);

    const appliedCompanyIds = myApplications.map(a => a.company._id.toString());
    const applicationStats = {
      total: myApplications.length,
      applied: myApplications.filter(a => a.status === 'applied').length,
      shortlisted: myApplications.filter(a => ['shortlisted', 'interview_scheduled'].includes(a.status)).length,
      selected: myApplications.filter(a => a.status === 'selected').length,
      rejected: myApplications.filter(a => a.status === 'rejected').length,
    };

    res.json({
      success: true,
      data: {
        student: student.toPublicJSON(),
        applicationStats,
        myApplications,
        openCompanies,
        eligibleCompanies,
        appliedCompanyIds,
      },
    });
  } catch (err) {
    next(err);
  }
};
