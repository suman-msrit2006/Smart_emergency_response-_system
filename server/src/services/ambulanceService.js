import Ambulance from '../models/Ambulance.js';
import AppError from '../utils/AppError.js';
import { getIO } from '../socket/index.js';
import { emitAmbulanceLocationUpdate, emitAmbulanceStatusChange } from '../socket/ambulance.socket.js';
import { logger } from '../utils/logger.js';
import { validateCoordinates, validateMaxDistance } from '../utils/validateCoordinates.js';

export const createAmbulance = async (ambulanceData) => {
  const existingAmbulance = await Ambulance.findOne({
    vehicleNumber: ambulanceData.vehicleNumber,
  });

  if (existingAmbulance) {
    throw new AppError('Ambulance with this vehicle number already exists', 400);
  }

  const ambulance = await Ambulance.create(ambulanceData);

  return ambulance;
};

export const getAllAmbulances = async (queryParams) => {
  const {
    page = 1,
    limit = 10,
    status,
    hospital,
    type,
    sortBy = 'createdAt',
    order = 'desc',
  } = queryParams;

  const query = {};

  if (status) {
    query.status = status;
  }

  if (hospital) {
    query.hospital = hospital;
  }

  if (type) {
    query.type = type;
  }

  query.isActive = true;

  const skip = (page - 1) * limit;
  const sortOrder = order === 'asc' ? 1 : -1;

  const ambulances = await Ambulance.find(query)
    .populate('hospital', 'name address phone')
    .populate('driver', 'name phone email')
    .populate('paramedics', 'name phone email')
    .populate('currentEmergency')
    .sort({ [sortBy]: sortOrder })
    .limit(parseInt(limit))
    .skip(skip);

  const total = await Ambulance.countDocuments(query);

  return {
    ambulances,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit),
    },
  };
};

export const getAmbulanceById = async (ambulanceId) => {
  const ambulance = await Ambulance.findById(ambulanceId)
    .populate('hospital', 'name address phone')
    .populate('driver', 'name phone email')
    .populate('paramedics', 'name phone email')
    .populate('currentEmergency');

  if (!ambulance) {
    throw new AppError('Ambulance not found', 404);
  }

  return ambulance;
};

export const updateAmbulance = async (ambulanceId, updateData) => {
  const ambulance = await Ambulance.findByIdAndUpdate(
    ambulanceId,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!ambulance) {
    throw new AppError('Ambulance not found', 404);
  }

  return ambulance;
};

export const deleteAmbulance = async (ambulanceId) => {
  const ambulance = await Ambulance.findById(ambulanceId);

  if (!ambulance) {
    throw new AppError('Ambulance not found', 404);
  }

  if (ambulance.status !== 'Available') {
    throw new AppError('Cannot delete ambulance that is currently in use', 400);
  }

  ambulance.isActive = false;
  await ambulance.save();

  return ambulance;
};

export const updateLocation = async (ambulanceId, coordinates) => {
  // Validate coordinates
  validateCoordinates(coordinates, 'location.coordinates');

  const ambulance = await Ambulance.findById(ambulanceId);

  if (!ambulance) {
    throw new AppError('Ambulance not found', 404);
  }

  ambulance.location.coordinates = coordinates;
  await ambulance.save();

  // Emit real-time location update via Socket.IO
  try {
    const io = getIO();
    if (io) {
      emitAmbulanceLocationUpdate(io, ambulanceId, {
        location: ambulance.location,
        speed: ambulance.speed || null,
        heading: ambulance.heading || null,
      });
    }
  } catch (error) {
    logger.error('Socket emit failed for ambulance location:', error);
  }

  return ambulance;
};

export const updateStatus = async (ambulanceId, status) => {
  const ambulance = await Ambulance.findById(ambulanceId);

  if (!ambulance) {
    throw new AppError('Ambulance not found', 404);
  }

  ambulance.status = status;

  if (status === 'Available') {
    ambulance.currentEmergency = null;
  }

  await ambulance.save();

  // Emit real-time status update via Socket.IO
  try {
    const io = getIO();
    if (io) {
      emitAmbulanceStatusChange(io, ambulance);
    }
  } catch (error) {
    logger.error('Socket emit failed for ambulance status:', error);
  }

  return ambulance;
};

export const updateFuel = async (ambulanceId, fuelLevel) => {
  const ambulance = await Ambulance.findById(ambulanceId);

  if (!ambulance) {
    throw new AppError('Ambulance not found', 404);
  }

  ambulance.fuelLevel = fuelLevel;
  await ambulance.save();

  return ambulance;
};

export const getAvailableAmbulances = async (longitude, latitude, maxDistance = 20000) => {
  // Validate coordinates
  validateCoordinates([longitude, latitude], 'query coordinates');
  validateMaxDistance(maxDistance);

  const ambulances = await Ambulance.find({
    status: 'Available',
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
  })
    .populate('hospital', 'name address phone')
    .populate('driver', 'name phone')
    .limit(10);

  return ambulances;
};

export const assignToEmergency = async (ambulanceId, emergencyId) => {
  const ambulance = await Ambulance.findById(ambulanceId);

  if (!ambulance) {
    throw new AppError('Ambulance not found', 404);
  }

  if (ambulance.status !== 'Available') {
    throw new AppError('Ambulance is not available', 400);
  }

  ambulance.status = 'En Route';
  ambulance.currentEmergency = emergencyId;
  await ambulance.save();

  return ambulance;
};
