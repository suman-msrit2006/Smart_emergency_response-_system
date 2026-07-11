import mongoose from 'mongoose';

const ambulanceSchema = new mongoose.Schema(
  {
    vehicleNumber: {
      type: String,
      required: [true, 'Vehicle number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      enum: ['Basic Life Support', 'Advanced Life Support', 'Air Ambulance', 'Patient Transport'],
      required: [true, 'Ambulance type is required'],
    },
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',
      required: [true, 'Associated hospital is required'],
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Driver is required'],
    },
    paramedics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    status: {
      type: String,
      enum: ['Available', 'En Route', 'On Scene', 'Transporting', 'At Hospital', 'Out of Service'],
      default: 'Available',
    },
    equipment: {
      defibrillator: {
        type: Boolean,
        default: false,
      },
      oxygenSupply: {
        type: Boolean,
        default: true,
      },
      ventilator: {
        type: Boolean,
        default: false,
      },
      stretcher: {
        type: Boolean,
        default: true,
      },
      firstAidKit: {
        type: Boolean,
        default: true,
      },
      spinalBoard: {
        type: Boolean,
        default: false,
      },
    },
    capacity: {
      type: Number,
      default: 2,
      min: [1, 'Capacity must be at least 1'],
      max: [6, 'Capacity cannot exceed 6'],
    },
    licensePlate: {
      type: String,
      required: [true, 'License plate is required'],
      trim: true,
      uppercase: true,
    },
    model: {
      type: String,
      trim: true,
    },
    year: {
      type: Number,
      min: [1990, 'Year must be 1990 or later'],
      max: [new Date().getFullYear() + 1, 'Year cannot be in the future'],
    },
    lastMaintenance: {
      type: Date,
    },
    nextMaintenance: {
      type: Date,
    },
    fuelLevel: {
      type: Number,
      min: [0, 'Fuel level cannot be negative'],
      max: [100, 'Fuel level cannot exceed 100%'],
      default: 100,
    },
    mileage: {
      type: Number,
      default: 0,
      min: [0, 'Mileage cannot be negative'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    currentEmergency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Emergency',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ambulanceSchema.index({ location: '2dsphere' });
ambulanceSchema.index({ vehicleNumber: 1 });
ambulanceSchema.index({ status: 1 });
ambulanceSchema.index({ hospital: 1 });
ambulanceSchema.index({ driver: 1 });

ambulanceSchema.virtual('isAvailable').get(function () {
  return this.status === 'Available' && this.isActive && this.fuelLevel > 10;
});

const Ambulance = mongoose.model('Ambulance', ambulanceSchema);

export default Ambulance;
