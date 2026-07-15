import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient is required'],
    },
    type: {
      type: String,
      enum: ['feedback', 'emergency', 'system'],
      default: 'feedback',
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // Reference to the feedback document
    feedback: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Feedback',
      default: null,
    },
    // Snapshot data for quick display (avoids re-populating)
    meta: {
      patientName: { type: String, default: '' },
      patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      emergencyId: { type: String, default: '' },
      ambulanceNumber: { type: String, default: '' },
      hospitalName: { type: String, default: '' },
      rating: { type: Number, default: 0 },
      comment: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

notificationSchema.index({ recipient: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
