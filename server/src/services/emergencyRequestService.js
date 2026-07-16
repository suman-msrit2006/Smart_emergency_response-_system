import EmergencyRequest from '../models/EmergencyRequest.js';
import Ambulance from '../models/Ambulance.js';
import AppError from '../utils/AppError.js';
import { getIO } from '../socket/index.js';
import { logger } from '../utils/logger.js';
import { validateCoordinates, validateMaxDistance } from '../utils/validateCoordinates.js';

/**
 * Create a new emergency request
 * @param {Object} requestData - Emergency request data
 * @param {String} patientId - Patient user ID
 */
export const createRequest = async (requestData, patientId) => {
  try {
    logger.info('=== CREATE EMERGENCY REQUEST START ===');
    logger.info('Patient ID:', patientId);
    logger.info('Request Data:', JSON.stringify(requestData, null, 2));

    // Check if patient has an active request
    const activeRequest = await EmergencyRequest.findOne({
      patient: patientId,
      isActive: true,
      status: { $in: ['PENDING', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'PATIENT_PICKED'] },
    });

    if (activeRequest) {
      logger.warn('Patient already has active request:', activeRequest.requestId);
      throw new AppError('You already have an active emergency request', 400);
    }

    // Validate location coordinates
    const { longitude, latitude } = requestData.location;
    logger.info('Validating coordinates:', { longitude, latitude });
    validateCoordinates([longitude, latitude], 'location');

    // Prepare emergency request data
    const emergencyData = {
      patient: patientId,
      patientName: requestData.patientName,
      patientPhone: requestData.patientPhone,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
        address: requestData.location.address,
      },
      emergencyType: requestData.emergencyType || 'Other',
      severity: requestData.severity || 'Medium',
      notes: requestData.notes || '',
    };

    logger.info('Creating emergency request with data:', JSON.stringify(emergencyData, null, 2));

    // Create emergency request
    const emergencyRequest = await EmergencyRequest.create(emergencyData);

    logger.info('Emergency request created successfully:', {
      id: emergencyRequest._id,
      requestId: emergencyRequest.requestId,
    });

    // Find nearby available ambulances
    const maxDistance = 50000; // 50km
    const nearbyAmbulances = await Ambulance.find({
      status: 'Available',
      isOnline: true,
      isActive: true,
      fuelLevel: { $gte: 20 },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: maxDistance,
        },
      },
    }).limit(10);

    // Emit real-time notification to nearby ambulances via Socket.IO
    try {
      const io = getIO();
      if (io && nearbyAmbulances.length > 0) {
        nearbyAmbulances.forEach((ambulance) => {
          if (ambulance.driver) {
            io.to(`user_${ambulance.driver.toString()}`).emit('emergency:request:new', {
              requestId: emergencyRequest._id,
              request: {
                id: emergencyRequest._id,
                requestId: emergencyRequest.requestId,
                patientName: emergencyRequest.patientName,
                location: emergencyRequest.location,
                emergencyType: emergencyRequest.emergencyType,
                severity: emergencyRequest.severity,
                createdAt: emergencyRequest.createdAt,
              },
            });
          }
        });

        logger.info(`Emergency request ${emergencyRequest.requestId} broadcast to ${nearbyAmbulances.length} ambulances`);
      }
    } catch (error) {
      logger.error('Socket emit failed for emergency request:', error);
    }

    logger.info('=== CREATE EMERGENCY REQUEST END (SUCCESS) ===');
    return emergencyRequest;

  } catch (error) {
    logger.error('=== CREATE EMERGENCY REQUEST FAILED ===');
    logger.error('Error type:', error.name);
    logger.error('Error message:', error.message);
    logger.error('Error stack:', error.stack);
    if (error.errors) {
      logger.error('Validation errors:', JSON.stringify(error.errors, null, 2));
    }
    throw error;
  }
};

/**
 * Get all emergency requests for a patient
 * @param {String} patientId - Patient user ID
 */
export const getMyRequests = async (patientId) => {
  const requests = await EmergencyRequest.find({ patient: patientId })
    .populate('assignedAmbulance', 'vehicleNumber type location status')
    .populate('ambulancePersonnel', 'name phone')
    .sort({ createdAt: -1 })
    .limit(20);

  return requests;
};

/**
 * Get current active request for a patient
 * @param {String} patientId - Patient user ID
 */
export const getActiveRequest = async (patientId) => {
  const request = await EmergencyRequest.findOne({
    patient: patientId,
    isActive: true,
    status: { $in: ['PENDING', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'PATIENT_PICKED', 'HOSPITAL_REACHED'] },
  })
    .populate('assignedAmbulance', 'vehicleNumber type location status driver')
    .populate('ambulancePersonnel', 'name phone');

  return request;
};

/**
 * Get pending emergency requests near ambulance location
 * @param {Number} longitude - Ambulance longitude
 * @param {Number} latitude - Ambulance latitude
 * @param {Number} maxDistance - Maximum distance in meters (default 50km)
 */
export const getPendingRequests = async (longitude, latitude, maxDistance = 50000) => {
  // Validate coordinates
  validateCoordinates([longitude, latitude], 'location');
  validateMaxDistance(maxDistance);

  const requests = await EmergencyRequest.find({
    status: 'PENDING',
    isActive: true,
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistance,
      },
    },
  })
    .populate('patient', 'name phone')
    .sort({ createdAt: 1 })
    .limit(10);

  return requests;
};

/**
 * Accept an emergency request
 * @param {String} requestId - Emergency request ID
 * @param {String} ambulanceId - Ambulance ID
 * @param {String} personnelId - Ambulance personnel user ID
 */
export const acceptRequest = async (requestId, ambulanceId, personnelId) => {
  // Find the request
  const request = await EmergencyRequest.findById(requestId);

  if (!request) {
    throw new AppError('Emergency request not found', 404);
  }

  if (request.status !== 'PENDING') {
    throw new AppError('This request has already been accepted or completed', 400);
  }

  // Find the ambulance
  const ambulance = await Ambulance.findById(ambulanceId);

  if (!ambulance) {
    throw new AppError('Ambulance not found', 404);
  }

  if (ambulance.status !== 'Available') {
    throw new AppError('Ambulance is not available', 400);
  }

  // Update request
  request.status = 'ACCEPTED';
  request.assignedAmbulance = ambulanceId;
  request.ambulancePersonnel = personnelId;
  request.acceptedAt = new Date();
  await request.save();

  // Update ambulance
  ambulance.status = 'En Route';
  ambulance.currentEmergency = requestId;
  ambulance.currentRequest = requestId;
  await ambulance.save();

  // Populate request data
  await request.populate('assignedAmbulance', 'vehicleNumber type location status');
  await request.populate('ambulancePersonnel', 'name phone');

  // Emit real-time notification to patient via Socket.IO
  try {
    const io = getIO();
    if (io) {
      io.to(`user_${request.patient.toString()}`).emit('emergency:request:accepted', {
        requestId: request._id,
        request: {
          id: request._id,
          requestId: request.requestId,
          status: request.status,
          ambulance: {
            id: ambulance._id,
            vehicleNumber: ambulance.vehicleNumber,
            type: ambulance.type,
            location: ambulance.location,
          },
          personnel: {
            id: personnelId,
            name: request.ambulancePersonnel?.name,
            phone: request.ambulancePersonnel?.phone,
          },
          acceptedAt: request.acceptedAt,
        },
      });

      logger.info(`Emergency request ${request.requestId} accepted by ambulance ${ambulance.vehicleNumber}`);
    }
  } catch (error) {
    logger.error('Socket emit failed for request acceptance:', error);
  }

  return request;
};

/**
 * Reject an emergency request
 * @param {String} requestId - Emergency request ID
 * @param {String} reason - Rejection reason
 */
export const rejectRequest = async (requestId, reason) => {
  const request = await EmergencyRequest.findById(requestId);

  if (!request) {
    throw new AppError('Emergency request not found', 404);
  }

  if (request.status !== 'PENDING') {
    throw new AppError('This request has already been accepted or completed', 400);
  }

  request.status = 'REJECTED';
  request.rejectionReason = reason || 'No reason provided';
  request.isActive = false;
  await request.save();

  return request;
};

/**
 * Update emergency request status
 * @param {String} requestId - Emergency request ID
 * @param {String} newStatus - New status
 */
export const updateRequestStatus = async (requestId, newStatus, personnelId) => {
  const request = await EmergencyRequest.findById(requestId);

  if (!request) {
    throw new AppError('Emergency request not found', 404);
  }

  // Verify the personnel is assigned to this request
  if (request.ambulancePersonnel && request.ambulancePersonnel.toString() !== personnelId) {
    throw new AppError('You are not authorized to update this request', 403);
  }

  // Validate status transition
  const validTransitions = {
    PENDING: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
    ACCEPTED: ['EN_ROUTE', 'CANCELLED'],
    EN_ROUTE: ['ARRIVED', 'CANCELLED'],
    ARRIVED: ['PATIENT_PICKED', 'CANCELLED'],
    PATIENT_PICKED: ['HOSPITAL_REACHED', 'CANCELLED'],
    HOSPITAL_REACHED: ['COMPLETED', 'CANCELLED'],
  };

  if (!validTransitions[request.status]?.includes(newStatus)) {
    throw new AppError(`Cannot transition from ${request.status} to ${newStatus}`, 400);
  }

  request.status = newStatus;
  await request.save();

  // Update ambulance status if request is completed
  if (newStatus === 'COMPLETED' || newStatus === 'CANCELLED') {
    const ambulance = await Ambulance.findById(request.assignedAmbulance);
    if (ambulance) {
      ambulance.status = 'Available';
      ambulance.currentEmergency = null;
      await ambulance.save();
    }
  }

  // Populate request data
  await request.populate('assignedAmbulance', 'vehicleNumber type location status');
  await request.populate('ambulancePersonnel', 'name phone');

  // Emit real-time status update to patient via Socket.IO
  try {
    const io = getIO();
    if (io) {
      io.to(`user_${request.patient.toString()}`).emit('emergency:status:updated', {
        requestId: request._id,
        status: newStatus,
        updatedAt: new Date(),
      });

      logger.info(`Emergency request ${request.requestId} status updated to ${newStatus}`);
    }
  } catch (error) {
    logger.error('Socket emit failed for status update:', error);
  }

  return request;
};

/**
 * Cancel an emergency request (by patient)
 * @param {String} requestId - Emergency request ID
 * @param {String} patientId - Patient user ID
 */
export const cancelRequest = async (requestId, patientId) => {
  const request = await EmergencyRequest.findById(requestId);

  if (!request) {
    throw new AppError('Emergency request not found', 404);
  }

  if (request.patient.toString() !== patientId) {
    throw new AppError('You are not authorized to cancel this request', 403);
  }

  if (!['PENDING', 'ACCEPTED'].includes(request.status)) {
    throw new AppError('Cannot cancel request at this stage', 400);
  }

  request.status = 'CANCELLED';
  request.isActive = false;
  await request.save();

  // Update ambulance if already assigned
  if (request.assignedAmbulance) {
    const ambulance = await Ambulance.findById(request.assignedAmbulance);
    if (ambulance) {
      ambulance.status = 'Available';
      ambulance.currentEmergency = null;
      await ambulance.save();
    }

    // Notify ambulance personnel
    try {
      const io = getIO();
      if (io && request.ambulancePersonnel) {
        io.to(`user_${request.ambulancePersonnel.toString()}`).emit('emergency:request:cancelled', {
          requestId: request._id,
          message: 'Emergency request has been cancelled by patient',
        });
      }
    } catch (error) {
      logger.error('Socket emit failed for request cancellation:', error);
    }
  }

  return request;
};

/**
 * Get active assignment for Ambulance Personnel
 * @param {String} personnelId - Ambulance Personnel user ID
 */
export const getActiveAssignment = async (personnelId) => {
  const request = await EmergencyRequest.findOne({
    ambulancePersonnel: personnelId,
    isActive: true,
    status: { $in: ['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'PATIENT_PICKED', 'HOSPITAL_REACHED'] },
  })
    .populate('patient', 'name phone')
    .populate('assignedAmbulance', 'vehicleNumber type location');

  return request;
};
