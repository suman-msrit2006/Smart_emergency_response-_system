import Feedback from '../models/Feedback.js';
import EmergencyRequest from '../models/EmergencyRequest.js';
import Ambulance from '../models/Ambulance.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { createNotification } from './notificationService.js';
import { logger } from '../utils/logger.js';

export const createFeedback = async (feedbackData, userId) => {
  const feedback = await Feedback.create({
    ...feedbackData,
    user: userId,
  });

  // ─── Auto-notify assigned ambulance personnel ─────────────────────────
  try {
    const emergencyId = feedbackData.relatedTo?.emergency;
    const ambulanceId = feedbackData.relatedTo?.ambulance;

    let personnelId = null;
    let ambulanceNumber = 'N/A';
    let hospitalName = 'N/A';
    let emergencyRequestId = 'N/A';

    // Try to resolve personnel from EmergencyRequest
    if (emergencyId) {
      const emergencyRequest = await EmergencyRequest.findById(emergencyId)
        .populate('ambulancePersonnel', 'name')
        .populate('assignedAmbulance', 'vehicleNumber')
        .lean();

      if (emergencyRequest) {
        personnelId = emergencyRequest.ambulancePersonnel?._id;
        ambulanceNumber = emergencyRequest.assignedAmbulance?.vehicleNumber || 'N/A';
        emergencyRequestId = emergencyRequest.requestId || emergencyId.toString();
      }
    }

    // Fallback: resolve personnel via Ambulance.driver
    if (!personnelId && ambulanceId) {
      const ambulance = await Ambulance.findById(ambulanceId).lean();
      if (ambulance) {
        personnelId = ambulance.driver;
        ambulanceNumber = ambulance.vehicleNumber || 'N/A';
      }
    }

    // Resolve hospital name
    if (feedbackData.relatedTo?.hospital) {
      const Hospital = (await import('../models/Hospital.js')).default;
      const hospital = await Hospital.findById(feedbackData.relatedTo.hospital).lean();
      if (hospital) hospitalName = hospital.name;
    }

    // Resolve patient name
    const patient = await User.findById(userId).lean();
    const patientName = patient?.name || 'Patient';

    if (personnelId) {
      await createNotification({
        recipientId: personnelId,
        type: 'feedback',
        title: '⭐ New Patient Feedback Received',
        message: `${patientName} rated your emergency service ${feedback.rating}/5 stars.`,
        feedbackId: feedback._id,
        meta: {
          patientName,
          patientId: userId,
          emergencyId: emergencyRequestId,
          ambulanceNumber,
          hospitalName,
          rating: feedback.rating,
          comment: feedback.comment,
        },
      });
      logger.info(`Feedback notification sent to ambulance personnel ${personnelId}`);
    } else {
      logger.warn(`Could not find ambulance personnel for feedback ${feedback._id} — no notification sent`);
    }
  } catch (notifError) {
    // Never fail feedback submission because of notification errors
    logger.error('Failed to create feedback notification:', notifError);
  }
  // ─────────────────────────────────────────────────────────────────────

  return feedback;
};

export const getAllFeedbacks = async (queryParams) => {
  const {
    page = 1,
    limit = 10,
    type,
    status,
    rating,
    hospital,
    doctor,
    sortBy = 'createdAt',
    order = 'desc',
  } = queryParams;

  const query = {};

  if (type) {
    query.type = type;
  }

  if (status) {
    query.status = status;
  }

  if (rating) {
    query.rating = parseInt(rating);
  }

  if (hospital) {
    query['relatedTo.hospital'] = hospital;
  }

  if (doctor) {
    query['relatedTo.doctor'] = doctor;
  }

  const skip = (page - 1) * limit;
  const sortOrder = order === 'asc' ? 1 : -1;

  const feedbacks = await Feedback.find(query)
    .populate('user', 'name email')
    .populate('relatedTo.hospital', 'name')
    .populate('relatedTo.doctor', 'name')
    .populate('relatedTo.ambulance', 'vehicleNumber')
    .populate('adminResponse.respondedBy', 'name')
    .sort({ [sortBy]: sortOrder })
    .limit(parseInt(limit))
    .skip(skip);

  const total = await Feedback.countDocuments(query);

  return {
    feedbacks,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit),
    },
  };
};

export const getFeedbackById = async (feedbackId) => {
  const feedback = await Feedback.findById(feedbackId)
    .populate('user', 'name email')
    .populate('relatedTo.hospital', 'name address')
    .populate('relatedTo.doctor', 'name email')
    .populate('relatedTo.ambulance', 'vehicleNumber')
    .populate('relatedTo.consultation')
    .populate('relatedTo.emergency')
    .populate('adminResponse.respondedBy', 'name email');

  if (!feedback) {
    throw new AppError('Feedback not found', 404);
  }

  return feedback;
};

export const updateFeedback = async (feedbackId, updateData, userId) => {
  const feedback = await Feedback.findById(feedbackId);

  if (!feedback) {
    throw new AppError('Feedback not found', 404);
  }

  if (updateData.status) {
    feedback.status = updateData.status;
  }

  if (updateData.adminResponse) {
    feedback.adminResponse = {
      respondedBy: userId,
      response: updateData.adminResponse.response,
      respondedAt: new Date(),
    };
    feedback.status = 'Reviewed';
  }

  await feedback.save();

  return feedback;
};

export const deleteFeedback = async (feedbackId) => {
  const feedback = await Feedback.findByIdAndDelete(feedbackId);

  if (!feedback) {
    throw new AppError('Feedback not found', 404);
  }

  return feedback;
};

export const voteFeedback = async (feedbackId, voteType) => {
  const feedback = await Feedback.findById(feedbackId);

  if (!feedback) {
    throw new AppError('Feedback not found', 404);
  }

  if (voteType === 'helpful') {
    feedback.helpful += 1;
  } else if (voteType === 'notHelpful') {
    feedback.notHelpful += 1;
  }

  await feedback.save();

  return feedback;
};

export const getHospitalFeedbacks = async (hospitalId) => {
  const feedbacks = await Feedback.find({
    'relatedTo.hospital': hospitalId,
  })
    .populate('user', 'name')
    .sort({ createdAt: -1 });

  const averageRating = await Feedback.aggregate([
    { $match: { 'relatedTo.hospital': hospitalId } },
    { $group: { _id: null, avgRating: { $avg: '$rating' } } },
  ]);

  return {
    feedbacks,
    averageRating: averageRating.length > 0 ? averageRating[0].avgRating.toFixed(2) : 0,
  };
};

export const getDoctorFeedbacks = async (doctorId) => {
  const feedbacks = await Feedback.find({
    'relatedTo.doctor': doctorId,
  })
    .populate('user', 'name')
    .sort({ createdAt: -1 });

  const averageRating = await Feedback.aggregate([
    { $match: { 'relatedTo.doctor': doctorId } },
    { $group: { _id: null, avgRating: { $avg: '$rating' } } },
  ]);

  return {
    feedbacks,
    averageRating: averageRating.length > 0 ? averageRating[0].avgRating.toFixed(2) : 0,
  };
};

export const getUserFeedbacks = async (userId) => {
  const feedbacks = await Feedback.find({ user: userId })
    .populate('relatedTo.hospital', 'name')
    .populate('relatedTo.doctor', 'name')
    .sort({ createdAt: -1 });

  return feedbacks;
};
