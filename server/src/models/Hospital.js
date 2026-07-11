import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
      minlength: [3, 'Hospital name must be at least 3 characters long'],
      maxlength: [200, 'Hospital name cannot exceed 200 characters'],
    },
    address: {
      street: {
        type: String,
        required: [true, 'Street address is required'],
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
      },
      state: {
        type: String,
        required: [true, 'State is required'],
        trim: true,
      },
      zipCode: {
        type: String,
        required: [true, 'Zip code is required'],
        trim: true,
      },
      country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true,
        default: 'USA',
      },
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
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [
        /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
        'Please provide a valid phone number',
      ],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    emergencyContact: {
      type: String,
      required: [true, 'Emergency contact is required'],
      trim: true,
    },
    specialties: {
      type: [String],
      required: [true, 'At least one specialty is required'],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: 'At least one specialty must be specified',
      },
    },
    facilities: {
      emergencyRoom: {
        type: Boolean,
        default: true,
      },
      icu: {
        type: Boolean,
        default: false,
      },
      operationTheater: {
        type: Boolean,
        default: false,
      },
      ambulanceService: {
        type: Boolean,
        default: false,
      },
      pharmacy: {
        type: Boolean,
        default: false,
      },
      laboratory: {
        type: Boolean,
        default: false,
      },
      imaging: {
        type: Boolean,
        default: false,
      },
    },
    capacity: {
      totalBeds: {
        type: Number,
        required: [true, 'Total beds capacity is required'],
        min: [1, 'Total beds must be at least 1'],
      },
      availableBeds: {
        type: Number,
        required: [true, 'Available beds count is required'],
        min: [0, 'Available beds cannot be negative'],
      },
      icuBeds: {
        type: Number,
        default: 0,
        min: [0, 'ICU beds cannot be negative'],
      },
      emergencyBeds: {
        type: Number,
        default: 0,
        min: [0, 'Emergency beds cannot be negative'],
      },
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Under Maintenance'],
      default: 'Active',
    },
    rating: {
      type: Number,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5'],
      default: 0,
    },
    accreditation: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

hospitalSchema.index({ location: '2dsphere' });
hospitalSchema.index({ name: 1 });
hospitalSchema.index({ status: 1 });
hospitalSchema.index({ 'address.city': 1 });

hospitalSchema.virtual('occupancyRate').get(function () {
  if (this.capacity.totalBeds === 0) return 0;
  const occupiedBeds = this.capacity.totalBeds - this.capacity.availableBeds;
  return ((occupiedBeds / this.capacity.totalBeds) * 100).toFixed(2);
});

const Hospital = mongoose.model('Hospital', hospitalSchema);

export default Hospital;
