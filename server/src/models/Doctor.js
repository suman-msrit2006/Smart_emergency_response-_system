import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor must be linked to a user account'],
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    specialty: {
      type: String,
      required: [true, 'Specialty is required'],
      enum: [
        'Emergency Medicine',
        'Cardiology',
        'Neurology',
        'Orthopedics',
        'Pediatrics',
        'General Surgery',
        'Internal Medicine',
        'Anesthesiology',
        'Radiology',
        'Other',
      ],
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: [true, 'Doctor must be assigned to a hospital'],
    },
    licenseNumber: {
      type: String,
      required: [true, 'License number is required'],
      unique: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    yearsOfExperience: {
      type: Number,
      min: 0,
      default: 0,
    },
    availability: {
      type: String,
      enum: ['Available', 'Busy', 'Off Duty'],
      default: 'Available',
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalConsultations: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
doctorSchema.index({ hospital: 1, specialty: 1 });
doctorSchema.index({ availability: 1 });
doctorSchema.index({ isActive: 1 });

// Virtual for full name
doctorSchema.virtual('fullName').get(function () {
  return `Dr. ${this.firstName} ${this.lastName}`;
});

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;
