import * as emergencyService from '../services/emergencyService.js';
import catchAsync from '../utils/catchAsync.js';

export const createEmergency = catchAsync(async (req, res) => {
  const emergency = await emergencyService.createEmergency(req.body);

  res.status(201).json({
    status: 'success',
    message: 'Emergency request created successfully',
    data: { emergency },
  });
});

export const getAllEmergencies = catchAsync(async (req, res) => {
  const result = await emergencyService.getAllEmergencies(req.query);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

export const getEmergency = catchAsync(async (req, res) => {
  const emergency = await emergencyService.getEmergencyById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: { emergency },
  });
});

export const updateEmergency = catchAsync(async (req, res) => {
  const emergency = await emergencyService.updateEmergency(
    req.params.id,
    req.body
  );

  res.status(200).json({
    status: 'success',
    message: 'Emergency updated successfully',
    data: { emergency },
  });
});

export const updateStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const emergency = await emergencyService.updateStatus(req.params.id, status);

  res.status(200).json({
    status: 'success',
    message: 'Emergency status updated successfully',
    data: { emergency },
  });
});

export const assignAmbulance = catchAsync(async (req, res) => {
  const { ambulanceId, estimatedArrival } = req.body;
  const emergency = await emergencyService.assignAmbulance(
    req.params.id,
    ambulanceId,
    estimatedArrival
  );

  res.status(200).json({
    status: 'success',
    message: 'Ambulance assigned successfully',
    data: { emergency },
  });
});

export const assignHospital = catchAsync(async (req, res) => {
  const { hospitalId } = req.body;
  const emergency = await emergencyService.assignHospital(
    req.params.id,
    hospitalId
  );

  res.status(200).json({
    status: 'success',
    message: 'Hospital assigned successfully',
    data: { emergency },
  });
});

export const getNearbyEmergencies = catchAsync(async (req, res) => {
  const { longitude, latitude, maxDistance } = req.query;

  const emergencies = await emergencyService.getNearbyEmergencies(
    parseFloat(longitude),
    parseFloat(latitude),
    maxDistance ? parseInt(maxDistance) : undefined
  );

  res.status(200).json({
    status: 'success',
    results: emergencies.length,
    data: { emergencies },
  });
});

export const getPatientEmergencies = catchAsync(async (req, res) => {
  const emergencies = await emergencyService.getPatientEmergencies(
    req.params.patientId
  );

  res.status(200).json({
    status: 'success',
    results: emergencies.length,
    data: { emergencies },
  });
});

export const deleteEmergency = catchAsync(async (req, res) => {
  await emergencyService.deleteEmergency(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Emergency cancelled successfully',
    data: null,
  });
});
