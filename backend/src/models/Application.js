const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  roleTitle: { type: String, required: true },
  status: {
    type: String,
    enum: [
      'applied',
      'shortlisted',
      'aptitude_scheduled',
      'aptitude_cleared',
      'aptitude_failed',
      'gd_scheduled',
      'gd_cleared',
      'gd_failed',
      'interview_scheduled',
      'interview_cleared',
      'interview_failed',
      'hr_scheduled',
      'selected',
      'rejected',
      'withdrawn',
    ],
    default: 'applied',
  },
  timeline: [{
    status: { type: String },
    timestamp: { type: Date, default: Date.now },
    note: { type: String },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],
  offerLetter: { type: String }, // S3 URL
  package: { type: Number }, // final offered package
  joiningDate: { type: Date },
  remarks: { type: String },
  appliedAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
applicationSchema.index({ student: 1, company: 1 }, { unique: true });
applicationSchema.index({ status: 1 });
applicationSchema.index({ company: 1 });
applicationSchema.index({ student: 1 });

// ─── Pre-save: Add to timeline ────────────────────────────────────────────────
applicationSchema.pre('save', function (next) {
  if (this.isModified('status') && !this.isNew) {
    this.timeline.push({ status: this.status, timestamp: new Date() });
  }
  if (this.isNew) {
    this.timeline.push({ status: 'applied', timestamp: new Date() });
  }
  next();
});

module.exports = mongoose.model('Application', applicationSchema);
