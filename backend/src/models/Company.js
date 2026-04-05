const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [200, 'Company name cannot exceed 200 characters'],
  },
  logo: { type: String, default: '' },
  website: { type: String, trim: true },
  description: { type: String, maxlength: [2000, 'Description too long'] },
  industry: {
    type: String,
    enum: ['IT', 'Finance', 'Healthcare', 'Manufacturing', 'Consulting', 'E-Commerce', 'Telecom', 'Other'],
    required: true,
  },
  location: {
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true, default: 'India' },
  },
  roles: [{
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['Full-Time', 'Internship', 'Contract'],
      default: 'Full-Time',
    },
    package: { type: Number, required: true }, // in LPA
    stipend: { type: Number }, // for internships, per month
    description: { type: String },
    skills: [{ type: String }],
    openings: { type: Number, default: 1 },
    eligibility: {
      branches: [{
        type: String,
        enum: ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'MBA', 'MCA', 'OTHER', 'ALL'],
      }],
      minCGPA: { type: Number, default: 0 },
      maxBacklogs: { type: Number, default: 0 },
      tenthPercentage: { type: Number, default: 0 },
      twelfthPercentage: { type: Number, default: 0 },
    },
  }],
  driveDate: { type: Date },
  registrationDeadline: { type: Date },
  hiringStatus: {
    type: String,
    enum: ['upcoming', 'open', 'in_progress', 'completed', 'cancelled'],
    default: 'upcoming',
  },
  selectionProcess: [{
    round: { type: Number },
    name: { type: String },
    description: { type: String },
  }],
  hrContact: {
    name: { type: String, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
  },
  totalHired: { type: Number, default: 0 },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
companySchema.index({ name: 1 });
companySchema.index({ hiringStatus: 1 });
companySchema.index({ industry: 1 });
companySchema.index({ driveDate: 1 });
companySchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Company', companySchema);
