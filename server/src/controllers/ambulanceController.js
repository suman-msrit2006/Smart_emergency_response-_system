import * as ambulanceService from '../services/ambulanceService.js';
import catchAsync from '../utils/catchAsync.js';

export const createAmbulance = catchAsync(async (req, res) => {
  const ambulance = await ambulanceService.createAmbulance(req.body);

  res.status(201).json({
    status: 'success',
    message: 'Ambulance created successfully',
    data: { ambulance },
  });
});

export const getAllAmbulances = catchAsync(async (req, res) => {
  const result = await ambulanceService.getAllAmbulances(req.query);

  res.status(200).json({
    status: 'success',
    data: result,
  });
});

export const getAmbulance = catchAsync(async (req, res) => {
  const ambulance = await ambulanceService.getAmbulanceById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: { ambulance },
  });
});

export const updateAmbulance = catchAsync(async (req, res) => {
  const ambulance = await ambulanceService.updateAmbulance(
    req.params.id,
    req.body
  );

  res.status(200).json({
    status: 'success',
    message: 'Ambulance updated successfully',
    data: { ambulance },
  });
});

export const deleteAmbulance = catchAsync(async (req, res) => {
  await ambulanceService.deleteAmbulance(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'Ambulance deactivated successfully',
    data: null,
  });
});

export const updateLocation = catchAsync(async (req, res) => {
  const { coordinates } = req.body;
  const ambulance = await ambulanceService.updateLocation(
    req.params.id,
    coordinates
  );

  res.status(200).json({
    status: 'success',
    message: 'Location updated successfully',
    data: { ambulance },
  });
});

export const updateStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const ambulance = await ambulanceService.updateStatus(req.params.id, status);

  res.status(200).json({
    status: 'success',
    message: 'Status updated successfully',
    data: { ambulance },
  });
});

export const updateFuel = catchAsync(async (req, res) => {
  const { fuelLevel } = req.body;
  const ambulance = await ambulanceService.updateFuel(req.params.id, fuelLevel);

  res.status(200).json({
    status: 'success',
    message: 'Fuel level updated successfully',
    data: { ambulance },
  });
});

export const getAvailableAmbulances = catchAsync(async (req, res) => {
  const { longitude, latitude, maxDistance } = req.query;

  const ambulances = await ambulanceService.getAvailableAmbulances(
    parseFloat(longitude),
    parseFloat(latitude),
    maxDistance ? parseInt(maxDistance) : undefined
  );

  res.status(200).json({
    status: 'success',
    results: ambulances.length,
    data: { ambulances },
  });
});
