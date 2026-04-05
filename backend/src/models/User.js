const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  role: {
    type: String,
    enum: ['student', 'coordinator', 'admin'],
    default: 'student',
  },
  avatar: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
  // Student-specific fields
  studentProfile: {
    rollNumber: { type: String, trim: true },
    branch: {
      type: String,
      enum: ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'MBA', 'MCA', 'OTHER'],
    },
    year: { type: Number, min: 1, max: 4 },
    cgpa: { type: Number, min: 0, max: 10 },
    tenthPercentage: { type: Number, min: 0, max: 100 },
    twelfthPercentage: { type: Number, min: 0, max: 100 },
    skills: [{ type: String, trim: true }],
    phone: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    github: { type: String, trim: true },
    resume: { type: String }, // S3 URL
    placementStatus: {
      type: String,
      enum: ['not_placed', 'placed', 'in_process', 'opted_out'],
      default: 'not_placed',
    },
    placedCompany: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    placedPackage: { type: Number }, // in LPA
    backlogs: { type: Number, default: 0 },
  },
  // Coordinator-specific fields
  coordinatorProfile: {
    employeeId: { type: String, trim: true },
    department: { type: String, trim: true },
    phone: { type: String, trim: true },
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// ─── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'studentProfile.branch': 1 });
userSchema.index({ 'studentProfile.placementStatus': 1 });

// ─── Pre-save Hook ────────────────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ─── Instance Methods ─────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
