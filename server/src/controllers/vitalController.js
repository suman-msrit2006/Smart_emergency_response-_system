import * as vitalService from '../services/vitalService.js';
import catchAsync from '../utils/catchAsync.js';

export const createVital = catchAsync(async (req, res) => {
  const vital = await vitalService.createVital(req.body, req.user._id);

  res.status(201).json({
    status: 'success',
    message: 'Vital signs recorded successfully',
    data: { vital },
  });
});

export const getAllVitals = catchAsync(async (req, res) => {
  const result = await vitalService.getAllVitals(req.query);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

export const getVital = catchAsync(async (req, res) => {
  const vital = await vitalService.getVitalById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: { vital },
  });
});

export const updateVital = catchAsync(async (req, res) => {
  const vital = await vitalService.updateVital(req.params.id, req.body);

  res.status(200).json({
    status: 'success',
    message: 'Vital signs updated successfully',
    data: { vital },
  });
});

export const deleteVital = catchAsync(async (req, res) => {
  await vitalService.deleteVital(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Vital record deleted successfully',
    data: null,
  });
});

export const getPatientVitals = catchAsync(async (req, res) => {
  const { limit } = req.query;
  const vitals = await vitalService.getPatientVitals(
    req.params.patientId,
    limit ? parseInt(limit) : undefined
  );

  res.status(200).json({
    status: 'success',
    results: vitals.length,
    data: { vitals },
  });
});

export const getLatestVital = catchAsync(async (req, res) => {
  const vital = await vitalService.getLatestVitalByPatient(req.params.patientId);

  res.status(200).json({
    status: 'success',
    data: { vital },
  });
});

export const getCriticalVitals = catchAsync(async (req, res) => {
  const vitals = await vitalService.getCriticalVitals();

  res.status(200).json({
    status: 'success',
    results: vitals.length,
    data: { vitals },
  });
});

export const getVitalsByEmergency = catchAsync(async (req, res) => {
  const vitals = await vitalService.getVitalsByEmergency(req.params.emergencyId);

  res.status(200).json({
    status: 'success',
    results: vitals.length,
    data: { vitals },
  });
});

export const getVitalsByConsultation = catchAsync(async (req, res) => {
  const vitals = await vitalService.getVitalsByConsultation(
    req.params.consultationId
  );

  res.status(200).json({
    status: 'success',
    results: vitals.length,
    data: { vitals },
  });
});
