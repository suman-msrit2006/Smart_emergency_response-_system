import Hospital from '../models/Hospital.js';
import AppError from '../utils/AppError.js';
import { validateCoordinates, validateMaxDistance } from '../utils/validateCoordinates.js';

export const createHospital = async (hospitalData, adminId) => {
  const hospital = await Hospital.create({
    ...hospitalData,
    admin: adminId,
  });

  return hospital;
};

export const getAllHospitals = async (queryParams) => {
  const {
    page = 1,
    limit = 10,
    status,
    city,
    specialty,
    sortBy = 'createdAt',
    order = 'desc',
  } = queryParams;

  const query = {};

  if (status) {
    query.status = status;
  }

  if (city) {
    query['address.city'] = new RegExp(city, 'i');
  }

  if (specialty) {
    query.specialties = { $in: [new RegExp(specialty, 'i')] };
  }

  const skip = (page - 1) * limit;
  const sortOrder = order === 'asc' ? 1 : -1;

  const hospitals = await Hospital.find(query)
    .populate('admin', 'name email phone')
    .sort({ [sortBy]: sortOrder })
    .limit(parseInt(limit))
    .skip(skip);

  const total = await Hospital.countDocuments(query);

  return {
    hospitals,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: parseInt(limit),
    },
  };
};

export const getHospitalById = async (hospitalId) => {
  const hospital = await Hospital.findById(hospitalId).populate(
    'admin',
    'name email phone'
  );

  if (!hospital) {
    throw new AppError('Hospital not found', 404);
  }

  return hospital;
};

export const updateHospital = async (hospitalId, updateData, userId) => {
  const hospital = await Hospital.findById(hospitalId);

  if (!hospital) {
    throw new AppError('Hospital not found', 404);
  }

  Object.assign(hospital, updateData);
  await hospital.save();

  return hospital;
};

export const deleteHospital = async (hospitalId) => {
  const hospital = await Hospital.findByIdAndDelete(hospitalId);

  if (!hospital) {
    throw new AppError('Hospital not found', 404);
  }

  return hospital;
};

export const updateCapacity = async (hospitalId, capacityData) => {
  const hospital = await Hospital.findById(hospitalId);

  if (!hospital) {
    throw new AppError('Hospital not found', 404);
  }

  if (capacityData.availableBeds !== undefined) {
    if (capacityData.availableBeds > hospital.capacity.totalBeds) {
      throw new AppError(
        'Available beds cannot exceed total beds capacity',
        400
      );
    }
    hospital.capacity.availableBeds = capacityData.availableBeds;
  }

  if (capacityData.icuBeds !== undefined) {
    hospital.capacity.icuBeds = capacityData.icuBeds;
  }

  if (capacityData.emergencyBeds !== undefined) {
    hospital.capacity.emergencyBeds = capacityData.emergencyBeds;
  }

  await hospital.save();

  return hospital;
};

export const getNearbyHospitals = async (longitude, latitude, maxDistance = 10000) => {
  // Validate coordinates before querying
  validateCoordinates([longitude, latitude], 'location coordinates');
  validateMaxDistance(maxDistance);

  const hospitals = await Hospital.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistance,
      },
    },
    status: 'Active',
  }).limit(10);

  return hospitals;
};

export const getHospitalsBySpecialty = async (specialty) => {
  const hospitals = await Hospital.find({
    specialties: { $in: [new RegExp(specialty, 'i')] },
    status: 'Active',
  }).sort({ rating: -1 });

  return hospitals;
};
