import * as emergencyRequestService from '../services/emergencyRequestService.js';
import catchAsync from '../utils/catchAsync.js';
import { logger } from '../utils/logger.js';

/**
 * Create a new emergency request (Patient only)
 */
export const createEmergencyRequest = catchAsync(async (req, res) => {
  // Log incoming request for debugging
  logger.info('Creating emergency request', {
    patient: req.user._id,
    patientEmail: req.user.email,
    location: req.body.location,
  });

  const emergencyRequest = await emergencyRequestService.createRequest(
    req.body,
    req.user._id
  );

  logger.info(`Emergency request created successfully: ${emergencyRequest.requestId}`, {
    requestId: emergencyRequest.requestId,
    patient: req.user.email,
    status: emergencyRequest.status,
  });

  res.status(201).json({
    status: 'success',
    message: 'Emergency request created successfully',
    data: { emergencyRequest },
  });
});

/**
 * Get all emergency requests for the logged-in patient
 */
export const getMyRequests = catchAsync(async (req, res) => {
  const requests = await emergencyRequestService.getMyRequests(req.user._id);

  res.status(200).json({
    status: 'success',
    results: requests.length,
    data: { requests },
  });
});

/**
 * Get current active request for the logged-in patient
 */
export const getActiveRequest = catchAsync(async (req, res) => {
  const request = await emergencyRequestService.getActiveRequest(req.user._id);

  res.status(200).json({
    status: 'success',
    data: { request },
  });
});

/**
 * Get pending emergency requests near ambulance location (Ambulance Personnel only)
 */
export const getPendingRequests = catchAsync(async (req, res) => {
  const { longitude, latitude, maxDistance } = req.query;

  if (!longitude || !latitude) {
    return res.status(400).json({
      status: 'fail',
      message: 'Longitude and latitude are required',
    });
  }

  const requests = await emergencyRequestService.getPendingRequests(
    parseFloat(longitude),
    parseFloat(latitude),
    maxDistance ? parseInt(maxDistance) : undefined
  );

  res.status(200).json({
    status: 'success',
    results: requests.length,
    data: { requests },
  });
});

/**
 * Accept an emergency request (Ambulance Personnel only)
 */
export const acceptRequest = catchAsync(async (req, res) => {
  const { ambulanceId } = req.body;

  if (!ambulanceId) {
    return res.status(400).json({
      status: 'fail',
      message: 'Ambulance ID is required',
    });
  }

  const request = await emergencyRequestService.acceptRequest(
    req.params.id,
    ambulanceId,
    req.user._id
  );

  res.status(200).json({
    status: 'success',
    message: 'Emergency request accepted successfully',
    data: { request },
  });
});

/**
 * Reject an emergency request (Ambulance Personnel only)
 */
export const rejectRequest = catchAsync(async (req, res) => {
  const { reason } = req.body;

  const request = await emergencyRequestService.rejectRequest(
    req.params.id,
    reason
  );

  res.status(200).json({
    status: 'success',
    message: 'Emergency request rejected',
    data: { request },
  });
});

/**
 * Update emergency request status (Ambulance Personnel only)
 */
export const updateStatus = catchAsync(async (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      status: 'fail',
      message: 'Status is required',
    });
  }

  const request = await emergencyRequestService.updateRequestStatus(
    req.params.id,
    status,
    req.user._id
  );

  res.status(200).json({
    status: 'success',
    message: 'Status updated successfully',
    data: { request },
  });
});

/**
 * Get active assignment for the logged-in Ambulance Personnel
 */
export const getActiveAssignment = catchAsync(async (req, res) => {
  const request = await emergencyRequestService.getActiveAssignment(req.user._id);

  res.status(200).json({
    status: 'success',
    data: { request },
  });
});

/**
 * Cancel an emergency request (Patient only)
 */
export const cancelRequest = catchAsync(async (req, res) => {
  const request = await emergencyRequestService.cancelRequest(
    req.params.id,
    req.user._id
  );

  res.status(200).json({
    status: 'success',
    message: 'Emergency request cancelled successfully',
    data: { request },
  });
});

/**
 * Get ambulance by driver (logged-in personnel)
 */
export const getMyAmbulance = catchAsync(async (req, res) => {
  const Ambulance = (await import('../models/Ambulance.js')).default;
  const ambulance = await Ambulance.findOne({ driver: req.user._id });

  res.status(200).json({
    status: 'success',
    data: { ambulance: ambulance || null },
  });
});
