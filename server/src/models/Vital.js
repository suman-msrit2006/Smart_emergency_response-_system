import mongoose from 'mongoose';

const vitalSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient is required'],
    },
    emergency: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Emergency',
    },
    consultation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consultation',
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recorded by user is required'],
    },
    bloodPressure: {
      systolic: {
        type: Number,
        min: [40, 'Systolic pressure must be at least 40 mmHg'],
        max: [300, 'Systolic pressure cannot exceed 300 mmHg'],
      },
      diastolic: {
        type: Number,
        min: [20, 'Diastolic pressure must be at least 20 mmHg'],
        max: [200, 'Diastolic pressure cannot exceed 200 mmHg'],
      },
      unit: {
        type: String,
        default: 'mmHg',
      },
    },
    heartRate: {
      value: {
        type: Number,
        min: [20, 'Heart rate must be at least 20 bpm'],
        max: [300, 'Heart rate cannot exceed 300 bpm'],
      },
      unit: {
        type: String,
        default: 'bpm',
      },
    },
    oxygenSaturation: {
      value: {
        type: Number,
        min: [0, 'Oxygen saturation cannot be negative'],
        max: [100, 'Oxygen saturation cannot exceed 100%'],
      },
      unit: {
        type: String,
        default: '%',
      },
    },
    temperature: {
      value: {
        type: Number,
        min: [80, 'Temperature must be at least 80°F'],
        max: [115, 'Temperature cannot exceed 115°F'],
      },
      unit: {
        type: String,
        enum: ['F', 'C'],
        default: 'F',
      },
    },
    respiratoryRate: {
      value: {
        type: Number,
        min: [5, 'Respiratory rate must be at least 5 breaths/min'],
        max: [60, 'Respiratory rate cannot exceed 60 breaths/min'],
      },
      unit: {
        type: String,
        default: 'breaths/min',
      },
    },
    bloodGlucose: {
      value: {
        type: Number,
        min: [20, 'Blood glucose must be at least 20 mg/dL'],
        max: [600, 'Blood glucose cannot exceed 600 mg/dL'],
      },
      unit: {
        type: String,
        default: 'mg/dL',
      },
    },
    weight: {
      value: {
        type: Number,
        min: [1, 'Weight must be at least 1'],
        max: [1000, 'Weight cannot exceed 1000'],
      },
      unit: {
        type: String,
        enum: ['kg', 'lbs'],
        default: 'lbs',
      },
    },
    height: {
      value: {
        type: Number,
        min: [20, 'Height must be at least 20'],
        max: [300, 'Height cannot exceed 300'],
      },
      unit: {
        type: String,
        enum: ['cm', 'inches'],
        default: 'inches',
      },
    },
    bmi: {
      type: Number,
      min: [10, 'BMI must be at least 10'],
      max: [100, 'BMI cannot exceed 100'],
    },
    painLevel: {
      type: Number,
      min: [0, 'Pain level must be at least 0'],
      max: [10, 'Pain level cannot exceed 10'],
    },
    consciousness: {
      type: String,
      enum: ['Alert', 'Verbal', 'Pain', 'Unresponsive'],
      default: 'Alert',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['Normal', 'Abnormal', 'Critical'],
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
    location: {
      type: String,
      enum: ['Home', 'Hospital', 'Ambulance', 'Clinic', 'Emergency Room', 'Other'],
      default: 'Hospital',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

vitalSchema.index({ patient: 1, recordedAt: -1 });
vitalSchema.index({ emergency: 1 });
vitalSchema.index({ consultation: 1 });
vitalSchema.index({ recordedBy: 1 });
vitalSchema.index({ createdAt: -1 });

vitalSchema.pre('save', function (next) {
  if (this.weight?.value && this.height?.value) {
    let weightKg = this.weight.value;
    let heightM = this.height.value;

    if (this.weight.unit === 'lbs') {
      weightKg = this.weight.value * 0.453592;
    }

    if (this.height.unit === 'inches') {
      heightM = this.height.value * 0.0254;
    } else {
      heightM = this.height.value / 100;
    }

    this.bmi = (weightKg / (heightM * heightM)).toFixed(2);
  }
  next();
});

vitalSchema.methods.assessStatus = function () {
  let criticalCount = 0;
  let abnormalCount = 0;

  if (this.bloodPressure?.systolic) {
    if (this.bloodPressure.systolic > 180 || this.bloodPressure.systolic < 90) {
      criticalCount++;
    } else if (this.bloodPressure.systolic > 140 || this.bloodPressure.systolic < 100) {
      abnormalCount++;
    }
  }

  if (this.heartRate?.value) {
    if (this.heartRate.value > 150 || this.heartRate.value < 40) {
      criticalCount++;
    } else if (this.heartRate.value > 100 || this.heartRate.value < 60) {
      abnormalCount++;
    }
  }

  if (this.oxygenSaturation?.value) {
    if (this.oxygenSaturation.value < 90) {
      criticalCount++;
    } else if (this.oxygenSaturation.value < 95) {
      abnormalCount++;
    }
  }

  if (this.temperature?.value) {
    if (this.temperature.value > 104 || this.temperature.value < 95) {
      criticalCount++;
    } else if (this.temperature.value > 100.4 || this.temperature.value < 97) {
      abnormalCount++;
    }
  }

  if (criticalCount > 0) {
    return 'Critical';
  } else if (abnormalCount > 0) {
    return 'Abnormal';
  } else {
    return 'Normal';
  }
};

const Vital = mongoose.model('Vital', vitalSchema);

export default Vital;
