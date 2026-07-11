import Emergency from '../models/Emergency.js';
import Ambulance from '../models/Ambulance.js';
import Hospital from '../models/Hospital.js';
import AppError from '../utils/AppError.js';
import { getIO } from '../socket/index.js';
import { 
  emitEmergencyCreated, 
  emitEmergencyStatusChanged, 
  emitEmergencyAssignedToHospital, 
  emitEmergencyCancelled 
} from '../socket/emergency.socket.js';
import { emitAmbulanceAssignment } from '../socket/ambulance.socket.js';
import { logger } from '../utils/logger.js';
import { validateCoordinates, validateMaxDistance } from '../utils/validateCoordinates.js';

export const createEmergency = async (emergencyData) => {
  const emergency = await Emergency.create(emergencyData);

  // Emit real-time emergency created event via Socket.IO
  try {
    const io = getIO();
    if (io) {
      const populatedEmergency = await Emergency.findById(emergency._id)
        .populate('patient', 'name phone')
        .populate('ambulance', 'vehicleNumber type')
        .populate('assignedHospital', 'name address');
      emitEmergencyCreated(io, populatedEmergency);
    }
  } catch (error) {
    logger.error('Socket emit failed for emergency creation:', error);
  }

  return emergency;
};

export const getAllEmergencies = async (queryParams) => {
  const {
    page = 1,
    limit = 10,
    status,
    severity,
    patient,
    hospital,
    sortBy = 'createdAt',
    order = 'desc',
  } = queryParams;

  const query = { isActive: true };

  if (status) {
    query.status = status;
  }

  if (severity) {
    query.severity = severity;
  }

  if (patient) {
    query.patient = patient;
  }

  if (hospital) {
    query.assignedHospital = hospital;
  }

  const skip = (page - 1) * limit;
  const sortOrder = order === 'asc' ? 1 : -1;

  const emergencies = await Emergency.find(query)
    .populate('patient', 'name phone email')
    .populate('ambulance', 'vehicleNumber type status')
    .populate('assignedHospital', 'name address phone')
    .sort({ [sortBy]: sortOrder })
    .limit(parseInt(limit))
    .skip(skip);

  const total = await Emergency.countDocuments(query);

  return {
    emergencies,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit),
    },
  };
};

export const getEmergencyById = async (emergencyId) => {
  const emergency = await Emergency.findById(emergencyId)
    .populate('patient', 'name phone email')
    .populate('ambulance', 'vehicleNumber type status driver')
    .populate('assignedHospital', 'name address phone');

  if (!emergency) {
    throw new AppError('Emergency not found', 404);
  }

  return emergency;
};

export const updateEmergency = async (emergencyId, updateData) => {
  const emergency = await Emergency.findByIdAndUpdate(
    emergencyId,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!emergency) {
    throw new AppError('Emergency not found', 404);
  }

  return emergency;
};

export const updateStatus = async (emergencyId, status) => {
  const emergency = await Emergency.findById(emergencyId)
    .populate('patient', 'name phone')
    .populate('ambulance', 'vehicleNumber type')
    .populate('assignedHospital', 'name address');

  if (!emergency) {
    throw new AppError('Emergency not found', 404);
  }

  emergency.status = status;

  if (status === 'Ambulance Dispatched' && !emergency.responseTime.dispatchedAt) {
    emergency.responseTime.dispatchedAt = new Date();
  } else if (status === 'Ambulance On Scene' && !emergency.responseTime.arrivedAt) {
    emergency.responseTime.arrivedAt = new Date();
    emergency.actualArrival = new Date();
  } else if (status === 'Arrived at Hospital' && !emergency.responseTime.hospitalArrivalAt) {
    emergency.responseTime.hospitalArrivalAt = new Date();
  } else if (status === 'Completed') {
    emergency.isActive = false;
  }

  await emergency.save();

  // Emit real-time status change via Socket.IO
  try {
    const io = getIO();
    if (io) {
      emitEmergencyStatusChanged(io, emergency);
    }
  } catch (error) {
    logger.error('Socket emit failed for status change:', error);
  }

  return emergency;
};

export const assignAmbulance = async (emergencyId, ambulanceId, estimatedArrival) => {
  const emergency = await Emergency.findById(emergencyId);

  if (!emergency) {
    throw new AppError('Emergency not found', 404);
  }

  const ambulance = await Ambulance.findById(ambulanceId);

  if (!ambulance) {
    throw new AppError('Ambulance not found', 404);
  }

  if (ambulance.status !== 'Available') {
    throw new AppError('Ambulance is not available', 400);
  }

  emergency.ambulance = ambulanceId;
  emergency.status = 'Ambulance Dispatched';
  emergency.responseTime.dispatchedAt = new Date();

  if (estimatedArrival) {
    emergency.estimatedArrival = new Date(estimatedArrival);
  }

  await emergency.save();

  ambulance.status = 'En Route';
  ambulance.currentEmergency = emergencyId;
  await ambulance.save();

  // Emit real-time ambulance assignment via Socket.IO
  try {
    const io = getIO();
    if (io) {
      const populatedEmergency = await Emergency.findById(emergencyId)
        .populate('patient', 'name phone')
        .populate('ambulance', 'vehicleNumber type')
        .populate('assignedHospital', 'name address');
      emitAmbulanceAssignment(io, ambulanceId, emergencyId, populatedEmergency);
    }
  } catch (error) {
    logger.error('Socket emit failed for ambulance assignment:', error);
  }

  return emergency;
};

export const assignHospital = async (emergencyId, hospitalId) => {
  const emergency = await Emergency.findById(emergencyId);

  if (!emergency) {
    throw new AppError('Emergency not found', 404);
  }

  const hospital = await Hospital.findById(hospitalId);

  if (!hospital) {
    throw new AppError('Hospital not found', 404);
  }

  if (hospital.capacity.availableBeds === 0) {
    throw new AppError('Hospital has no available beds', 400);
  }

  emergency.assignedHospital = hospitalId;
  await emergency.save();

  // Emit real-time hospital assignment via Socket.IO
  try {
    const io = getIO();
    if (io) {
      const populatedEmergency = await Emergency.findById(emergencyId)
        .populate('patient', 'name phone')
        .populate('ambulance', 'vehicleNumber type')
        .populate('assignedHospital', 'name address');
      emitEmergencyAssignedToHospital(io, populatedEmergency, hospital);
    }
  } catch (error) {
    logger.error('Socket emit failed for hospital assignment:', error);
  }

  return emergency;
};

export const getNearbyEmergencies = async (longitude, latitude, maxDistance = 50000) => {
  // Validate coordinates before querying
  validateCoordinates([longitude, latitude], 'location coordinates');
  validateMaxDistance(maxDistance);

  const emergencies = await Emergency.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistance,
      },
    },
    status: { $nin: ['Completed', 'Cancelled'] },
    isActive: true,
  }).limit(20);

  return emergencies;
};

export const getPatientEmergencies = async (patientId) => {
  const emergencies = await Emergency.find({ patient: patientId })
    .populate('ambulance', 'vehicleNumber type')
    .populate('assignedHospital', 'name address')
    .sort({ createdAt: -1 });

  return emergencies;
};

export const deleteEmergency = async (emergencyId) => {
  const emergency = await Emergency.findById(emergencyId);

  if (!emergency) {
    throw new AppError('Emergency not found', 404);
  }

  emergency.isActive = false;
  emergency.status = 'Cancelled';
  await emergency.save();

  if (emergency.ambulance) {
    const ambulance = await Ambulance.findById(emergency.ambulance);
    if (ambulance) {
      ambulance.status = 'Available';
      ambulance.currentEmergency = null;
      await ambulance.save();
    }
  }

  // Emit real-time cancellation via Socket.IO
  try {
    const io = getIO();
    if (io) {
      emitEmergencyCancelled(io, emergencyId, 'Cancelled by user');
    }
  } catch (error) {
    logger.error('Socket emit failed for emergency cancellation:', error);
  }

  return emergency;
};
