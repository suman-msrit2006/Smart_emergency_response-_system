import mongoose from 'mongoose';

const emergencySchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient is required'],
    },
    type: {
      type: String,
      enum: [
        'Cardiac Arrest',
        'Accident',
        'Stroke',
        'Respiratory Distress',
        'Trauma',
        'Burn',
        'Poisoning',
        'Allergic Reaction',
        'Seizure',
        'Other',
      ],
      required: [true, 'Emergency type is required'],
    },
    severity: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      required: [true, 'Severity level is required'],
      default: 'Medium',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: [true, 'Location coordinates are required'],
      },
      address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
      },
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
    },
    ambulance: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ambulance',
    },
    assignedHospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
    },
    status: {
      type: String,
      enum: [
        'Pending',
        'Ambulance Dispatched',
        'Ambulance En Route',
        'Ambulance On Scene',
        'Transporting',
        'Arrived at Hospital',
        'Completed',
        'Cancelled',
      ],
      default: 'Pending',
    },
    priority: {
      type: Number,
      min: [1, 'Priority must be at least 1'],
      max: [5, 'Priority cannot exceed 5'],
      default: 3,
    },
    vitals: {
      bloodPressure: String,
      heartRate: Number,
      oxygenLevel: Number,
      temperature: Number,
      respiratoryRate: Number,
    },
    symptoms: [String],
    allergies: [String],
    currentMedications: [String],
    medicalHistory: String,
    responseTime: {
      dispatchedAt: Date,
      arrivedAt: Date,
      hospitalArrivalAt: Date,
    },
    estimatedArrival: {
      type: Date,
    },
    actualArrival: {
      type: Date,
    },
    notes: String,
    images: [String],
    audio: String,
    video: String,
    callerName: {
      type: String,
      trim: true,
    },
    callerRelation: {
      type: String,
      enum: ['Self', 'Family', 'Friend', 'Bystander', 'Healthcare Worker', 'Other'],
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

emergencySchema.index({ location: '2dsphere' });
emergencySchema.index({ patient: 1 });
emergencySchema.index({ status: 1 });
emergencySchema.index({ severity: 1 });
emergencySchema.index({ createdAt: -1 });
emergencySchema.index({ ambulance: 1 });
emergencySchema.index({ assignedHospital: 1 });

emergencySchema.virtual('totalResponseTime').get(function () {
  if (this.responseTime.dispatchedAt && this.responseTime.hospitalArrivalAt) {
    const diff = this.responseTime.hospitalArrivalAt - this.responseTime.dispatchedAt;
    return Math.round(diff / 1000 / 60);
  }
  return null;
});

const Emergency = mongoose.model('Emergency', emergencySchema);

export default Emergency;
