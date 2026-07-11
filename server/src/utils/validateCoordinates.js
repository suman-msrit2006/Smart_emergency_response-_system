import AppError from './AppError.js';

/**
 * Validate geographical coordinates
 * @param {Array} coordinates - [longitude, latitude]
 * @param {string} fieldName - Name of the field for error messages
 * @returns {boolean} - True if valid
 * @throws {AppError} - If coordinates are invalid
 */
export const validateCoordinates = (coordinates, fieldName = 'coordinates') => {
  // Check if coordinates exist
  if (!coordinates) {
    throw new AppError(`${fieldName} are required`, 400);
  }

  // Check if coordinates are an array
  if (!Array.isArray(coordinates)) {
    throw new AppError(`${fieldName} must be an array`, 400);
  }

  // Check if array has exactly 2 elements
  if (coordinates.length !== 2) {
    throw new AppError(
      `${fieldName} must contain exactly 2 elements [longitude, latitude]`,
      400
    );
  }

  const [longitude, latitude] = coordinates;

  // Check if values are numbers
  if (typeof longitude !== 'number' || typeof latitude !== 'number') {
    throw new AppError(`${fieldName} must be numeric values`, 400);
  }

  // Check for NaN or Infinity
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
    throw new AppError(`${fieldName} must be finite numbers`, 400);
  }

  // Validate longitude range (-180 to 180)
  if (longitude < -180 || longitude > 180) {
    throw new AppError(
      `Longitude must be between -180 and 180 degrees (received: ${longitude})`,
      400
    );
  }

  // Validate latitude range (-90 to 90)
  if (latitude < -90 || latitude > 90) {
    throw new AppError(
      `Latitude must be between -90 and 90 degrees (received: ${latitude})`,
      400
    );
  }

  return true;
};

/**
 * Validate maxDistance parameter for geospatial queries
 * @param {number} maxDistance - Distance in meters
 * @returns {boolean} - True if valid
 * @throws {AppError} - If maxDistance is invalid
 */
export const validateMaxDistance = (maxDistance) => {
  if (maxDistance === undefined || maxDistance === null) {
    return true; // Optional parameter
  }

  if (typeof maxDistance !== 'number') {
    throw new AppError('maxDistance must be a number', 400);
  }

  if (!Number.isFinite(maxDistance)) {
    throw new AppError('maxDistance must be a finite number', 400);
  }

  if (maxDistance <= 0) {
    throw new AppError('maxDistance must be greater than 0', 400);
  }

  // Reasonable maximum distance (half Earth's circumference: ~20,000 km)
  if (maxDistance > 20000000) {
    throw new AppError('maxDistance cannot exceed 20,000,000 meters (20,000 km)', 400);
  }

  return true;
};

export default {
  validateCoordinates,
  validateMaxDistance,
};
