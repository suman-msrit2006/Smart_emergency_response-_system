import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    type: {
      type: String,
      enum: ['Hospital', 'Ambulance', 'Doctor', 'Consultation', 'Emergency', 'General'],
      required: [true, 'Feedback type is required'],
    },
    relatedTo: {
      hospital: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hospital',
      },
      ambulance: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ambulance',
      },
      doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      consultation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consultation',
      },
      emergency: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Emergency',
      },
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    title: {
      type: String,
      required: [true, 'Feedback title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters long'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      trim: true,
      minlength: [10, 'Comment must be at least 10 characters long'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    categories: [
      {
        type: String,
        enum: [
          'Service Quality',
          'Staff Behavior',
          'Cleanliness',
          'Wait Time',
          'Equipment',
          'Communication',
          'Overall Experience',
        ],
      },
    ],
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['Pending', 'Reviewed', 'Resolved', 'Dismissed'],
      default: 'Pending',
    },
    adminResponse: {
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      response: String,
      respondedAt: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    helpful: {
      type: Number,
      default: 0,
      min: [0, 'Helpful count cannot be negative'],
    },
    notHelpful: {
      type: Number,
      default: 0,
      min: [0, 'Not helpful count cannot be negative'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

feedbackSchema.index({ user: 1 });
feedbackSchema.index({ type: 1 });
feedbackSchema.index({ 'relatedTo.hospital': 1 });
feedbackSchema.index({ 'relatedTo.doctor': 1 });
feedbackSchema.index({ rating: 1 });
feedbackSchema.index({ createdAt: -1 });

feedbackSchema.virtual('helpfulRatio').get(function () {
  const total = this.helpful + this.notHelpful;
  if (total === 0) return 0;
  return ((this.helpful / total) * 100).toFixed(2);
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
