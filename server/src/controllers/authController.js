import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import { generateToken } from '../utils/jwt.js';

export const register = catchAsync(async (req, res, next) => {
  const { 
    name, 
    email, 
    password, 
    phone, 
    role,
    // Patient fields
    age,
    gender,
    emergencyContactNumber,
    // Ambulance Personnel fields
    employeeId,
    ambulanceNumber,
    licenseNumber,
    organization,
  } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email already registered', 400));
  }

  const userData = {
    name,
    email,
    password,
    phone,
    role,
  };

  // Add role-specific fields
  if (role === 'Patient') {
    userData.age = age;
    userData.gender = gender;
    userData.emergencyContactNumber = emergencyContactNumber;
  } else if (role === 'Ambulance Personnel') {
    userData.employeeId = employeeId;
    userData.ambulanceNumber = ambulanceNumber;
    userData.licenseNumber = licenseNumber;
    userData.organization = organization;
  }

  const user = await User.create(userData);

  const token = generateToken(user._id);

  const userResponse = {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
  };

  // Add role-specific fields to response
  if (role === 'Patient') {
    userResponse.age = user.age;
    userResponse.gender = user.gender;
    userResponse.emergencyContactNumber = user.emergencyContactNumber;
  } else if (role === 'Ambulance Personnel') {
    userResponse.employeeId = user.employeeId;
    userResponse.ambulanceNumber = user.ambulanceNumber;
    userResponse.licenseNumber = user.licenseNumber;
    userResponse.organization = user.organization;
  }

  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    data: {
      token,
      user: userResponse,
    },
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (!user.isActive) {
    return next(
      new AppError('Your account has been deactivated. Please contact support.', 401)
    );
  }

  user.lastLogin = Date.now();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id);

  res.status(200).json({
    status: 'success',
    message: 'Login successful',
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        lastLogin: user.lastLogin,
      },
    },
  });
});

export const getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    },
  });
});

export const updateProfile = catchAsync(async (req, res, next) => {
  // Prevent password updates through this endpoint
  if (req.body.password) {
    return next(new AppError('Please use /change-password endpoint to update password', 400));
  }

  const allowedFields = ['firstName', 'lastName', 'email', 'phone', 'role'];
  const updates = {};

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  // Handle name field if firstName/lastName not provided
  if (req.body.name && !req.body.firstName && !req.body.lastName) {
    const nameParts = req.body.name.split(' ');
    updates.firstName = nameParts[0];
    updates.lastName = nameParts.slice(1).join(' ');
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    },
  });
});

export const updateSettings = catchAsync(async (req, res, next) => {
  const { email, phone, notifications } = req.body;

  const updates = {};

  if (email !== undefined) updates.email = email;
  if (phone !== undefined) updates.phone = phone;
  if (notifications !== undefined) {
    updates.notificationPreferences = notifications;
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    message: 'Settings updated successfully',
    data: {
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone,
        notificationPreferences: user.notificationPreferences,
      },
    },
  });
});
