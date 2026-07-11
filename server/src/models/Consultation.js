import mongoose from 'mongoose';

const consultationSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient is required'],
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor is required'],
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: [true, 'Hospital is required'],
    },
    emergency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Emergency',
    },
    type: {
      type: String,
      enum: ['Emergency', 'Scheduled', 'Walk-in', 'Follow-up', 'Telemedicine'],
      required: [true, 'Consultation type is required'],
      default: 'Scheduled',
    },
    status: {
      type: String,
      enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled', 'No Show'],
      default: 'Scheduled',
    },
    scheduledAt: {
      type: Date,
      required: [true, 'Scheduled time is required'],
    },
    startedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    duration: {
      type: Number,
      min: [0, 'Duration cannot be negative'],
    },
    chiefComplaint: {
      type: String,
      required: [true, 'Chief complaint is required'],
      trim: true,
      minlength: [5, 'Chief complaint must be at least 5 characters long'],
      maxlength: [500, 'Chief complaint cannot exceed 500 characters'],
    },
    symptoms: [
      {
        name: String,
        severity: {
          type: String,
          enum: ['Mild', 'Moderate', 'Severe'],
        },
        duration: String,
      },
    ],
    diagnosis: {
      primary: {
        type: String,
        trim: true,
      },
      secondary: [String],
      icdCode: String,
    },
    examination: {
      generalAppearance: String,
      cardiovascular: String,
      respiratory: String,
      gastrointestinal: String,
      neurological: String,
      musculoskeletal: String,
      other: String,
    },
    vitals: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vital',
    },
    labTests: [
      {
        testName: String,
        orderedAt: Date,
        status: {
          type: String,
          enum: ['Ordered', 'In Progress', 'Completed', 'Cancelled'],
          default: 'Ordered',
        },
        results: String,
        completedAt: Date,
      },
    ],
    imaging: [
      {
        type: String,
        orderedAt: Date,
        status: {
          type: String,
          enum: ['Ordered', 'In Progress', 'Completed', 'Cancelled'],
          default: 'Ordered',
        },
        results: String,
        completedAt: Date,
      },
    ],
    prescriptions: [
      {
        medication: {
          type: String,
          required: true,
        },
        dosage: {
          type: String,
          required: true,
        },
        frequency: {
          type: String,
          required: true,
        },
        duration: {
          type: String,
          required: true,
        },
        instructions: String,
        refills: {
          type: Number,
          default: 0,
        },
      },
    ],
    procedures: [
      {
        name: String,
        performedAt: Date,
        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        notes: String,
      },
    ],
    referrals: [
      {
        specialty: String,
        doctor: String,
        hospital: String,
        reason: String,
        priority: {
          type: String,
          enum: ['Urgent', 'Routine'],
          default: 'Routine',
        },
      },
    ],
    treatmentPlan: {
      type: String,
      trim: true,
    },
    followUpRequired: {
      type: Boolean,
      default: false,
    },
    followUpDate: {
      type: Date,
    },
    followUpInstructions: String,
    admissionRequired: {
      type: Boolean,
      default: false,
    },
    admissionDetails: {
      ward: String,
      bedNumber: String,
      admittedAt: Date,
      expectedDischarge: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
    attachments: [
      {
        name: String,
        url: String,
        type: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    billingAmount: {
      type: Number,
      min: [0, 'Billing amount cannot be negative'],
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Partial', 'Paid', 'Insurance Claimed'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

consultationSchema.index({ patient: 1, scheduledAt: -1 });
consultationSchema.index({ doctor: 1, scheduledAt: -1 });
consultationSchema.index({ hospital: 1 });
consultationSchema.index({ status: 1 });
consultationSchema.index({ emergency: 1 });
consultationSchema.index({ createdAt: -1 });

consultationSchema.pre('save', function (next) {
  if (this.startedAt && this.completedAt) {
    const diff = this.completedAt - this.startedAt;
    this.duration = Math.round(diff / 1000 / 60);
  }
  next();
});

const Consultation = mongoose.model('Consultation', consultationSchema);

export default Consultation;
