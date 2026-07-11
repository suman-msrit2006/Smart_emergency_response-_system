import * as hospitalService from '../services/hospitalService.js';
import catchAsync from '../utils/catchAsync.js';

export const createHospital = catchAsync(async (req, res) => {
  const hospital = await hospitalService.createHospital(req.body, req.user._id);

  res.status(201).json({
    status: 'success',
    message: 'Hospital created successfully',
    data: { hospital },
  });
});

export const getAllHospitals = catchAsync(async (req, res) => {
  const result = await hospitalService.getAllHospitals(req.query);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

export const getHospital = catchAsync(async (req, res) => {
  const hospital = await hospitalService.getHospitalById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: { hospital },
  });
});

export const updateHospital = catchAsync(async (req, res) => {
  const hospital = await hospitalService.updateHospital(
    req.params.id,
    req.body,
    req.user._id
  );

  res.status(200).json({
    status: 'success',
    message: 'Hospital updated successfully',
    data: { hospital },
  });
});

export const deleteHospital = catchAsync(async (req, res) => {
  await hospitalService.deleteHospital(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Hospital deleted successfully',
    data: null,
  });
});

export const updateCapacity = catchAsync(async (req, res) => {
  const hospital = await hospitalService.updateCapacity(req.params.id, req.body);

  res.status(200).json({
    status: 'success',
    message: 'Hospital capacity updated successfully',
    data: { hospital },
  });
});

export const getNearbyHospitals = catchAsync(async (req, res) => {
  const { longitude, latitude, maxDistance } = req.query;

  const hospitals = await hospitalService.getNearbyHospitals(
    parseFloat(longitude),
    parseFloat(latitude),
    maxDistance ? parseInt(maxDistance) : undefined
  );

  res.status(200).json({
    status: 'success',
    results: hospitals.length,
    data: { hospitals },
  });
});

export const getHospitalsBySpecialty = catchAsync(async (req, res) => {
  const { specialty } = req.params;

  const hospitals = await hospitalService.getHospitalsBySpecialty(specialty);

  res.status(200).json({
    status: 'success',
    results: hospitals.length,
    data: { hospitals },
  });
});
