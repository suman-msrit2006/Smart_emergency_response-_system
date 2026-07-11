import Vital from '../models/Vital.js';
import AppError from '../utils/AppError.js';
import { getIO } from '../socket/index.js';
import { emitNewVitals, emitVitalsUpdate, emitCriticalVitalsAlert, isVitalCritical } from '../socket/vitals.socket.js';
import { logger } from '../utils/logger.js';

export const createVital = async (vitalData, recordedById) => {
  const vital = await Vital.create({
    ...vitalData,
    recordedBy: recordedById,
  });

  vital.status = vital.assessStatus();
  await vital.save();

  await vital.populate([
    { path: 'patient', select: 'name email' },
    { path: 'recordedBy', select: 'name role' },
  ]);

  // Emit real-time vitals via Socket.IO
  try {
    const io = getIO();
    if (io) {
      emitNewVitals(io, vital);
      
      // Check if vitals are critical and send alert
      if (isVitalCritical(vital)) {
        emitCriticalVitalsAlert(io, vital);
      }
    }
  } catch (error) {
    logger.error('Socket emit failed for new vitals:', error);
  }

  return vital;
};

export const getAllVitals = async (queryParams) => {
  const {
    page = 1,
    limit = 10,
    patient,
    emergency,
    consultation,
    status,
    location,
    sortBy = 'recordedAt',
    order = 'desc',
  } = queryParams;

  const query = {};

  if (patient) {
    query.patient = patient;
  }

  if (emergency) {
    query.emergency = emergency;
  }

  if (consultation) {
    query.consultation = consultation;
  }

  if (status) {
    query.status = status;
  }

  if (location) {
    query.location = location;
  }

  const skip = (page - 1) * limit;
  const sortOrder = order === 'asc' ? 1 : -1;

  const vitals = await Vital.find(query)
    .populate('patient', 'name email phone')
    .populate('recordedBy', 'name role')
    .populate('emergency', 'type severity status')
    .populate('consultation', 'type status')
    .sort({ [sortBy]: sortOrder })
    .limit(parseInt(limit))
    .skip(skip);

  const total = await Vital.countDocuments(query);

  return {
    vitals,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit),
    },
  };
};

export const getVitalById = async (vitalId) => {
  const vital = await Vital.findById(vitalId)
    .populate('patient', 'name email phone')
    .populate('recordedBy', 'name role')
    .populate('emergency', 'type severity status')
    .populate('consultation', 'type status');

  if (!vital) {
    throw new AppError('Vital record not found', 404);
  }

  return vital;
};

export const updateVital = async (vitalId, updateData) => {
  const vital = await Vital.findByIdAndUpdate(vitalId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!vital) {
    throw new AppError('Vital record not found', 404);
  }

  vital.status = vital.assessStatus();
  await vital.save();

  // Emit real-time vitals update via Socket.IO
  try {
    const io = getIO();
    if (io) {
      emitVitalsUpdate(io, vital);
      
      // Check if updated vitals are critical
      if (isVitalCritical(vital)) {
        emitCriticalVitalsAlert(io, vital);
      }
    }
  } catch (error) {
    logger.error('Socket emit failed for vitals update:', error);
  }

  return vital;
};

export const deleteVital = async (vitalId) => {
  const vital = await Vital.findByIdAndDelete(vitalId);

  if (!vital) {
    throw new AppError('Vital record not found', 404);
  }

  return vital;
};

export const getPatientVitals = async (patientId, limit = 10) => {
  const vitals = await Vital.find({ patient: patientId })
    .populate('recordedBy', 'name role')
    .sort({ recordedAt: -1 })
    .limit(limit);

  return vitals;
};

export const getLatestVitalByPatient = async (patientId) => {
  const vital = await Vital.findOne({ patient: patientId })
    .populate('recordedBy', 'name role')
    .sort({ recordedAt: -1 });

  if (!vital) {
    throw new AppError('No vital records found for this patient', 404);
  }

  return vital;
};

export const getCriticalVitals = async () => {
  const vitals = await Vital.find({ status: 'Critical' })
    .populate('patient', 'name phone')
    .populate('recordedBy', 'name role')
    .sort({ recordedAt: -1 })
    .limit(50);

  return vitals;
};

export const getVitalsByEmergency = async (emergencyId) => {
  const vitals = await Vital.find({ emergency: emergencyId })
    .populate('recordedBy', 'name role')
    .sort({ recordedAt: -1 });

  return vitals;
};

export const getVitalsByConsultation = async (consultationId) => {
  const vitals = await Vital.find({ consultation: consultationId })
    .populate('recordedBy', 'name role')
    .sort({ recordedAt: -1 });

  return vitals;
};
