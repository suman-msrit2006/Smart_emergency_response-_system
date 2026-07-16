import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import { verifyToken } from '../utils/jwt.js';

export const protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please log in to get access.', 401)
    );
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return next(
      new AppError('Invalid token or token has expired. Please log in again.', 401)
    );
  }

  const currentUser = await User.findById(decoded.id).select('+password');

  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists.', 401)
    );
  }

  if (!currentUser.isActive) {
    return next(
      new AppError('Your account has been deactivated. Please contact support.', 401)
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password. Please log in again.', 401)
    );
  }

  // DEBUG: Log user role
  console.log('[AUTH] User authenticated:', {
    id: currentUser._id,
    email: currentUser.email,
    role: currentUser.role,
    name: currentUser.name,
  });

  req.user = currentUser;
  next();
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log('[AUTH] Checking role restriction:', {
      requiredRoles: roles,
      userRole: req.user?.role,
      userId: req.user?._id,
      allowed: roles.includes(req.user?.role),
    });

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};
