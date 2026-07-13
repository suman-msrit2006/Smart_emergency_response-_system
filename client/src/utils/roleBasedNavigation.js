/**
 * Centralized role-based navigation utility
 * Returns the correct dashboard path based on user role
 */
export const getRoleDashboardPath = (userRole) => {
  if (!userRole) {
    return '/';
  }

  switch (userRole) {
    case 'Patient':
      return '/patient-dashboard';
    case 'Ambulance Personnel':
      return '/ambulance-dashboard';
    default:
      return '/';
  }
};

/**
 * Check if a user has permission to access a specific route based on their role
 */
export const canAccessRoute = (userRole, routePath) => {
  // Public routes - accessible to all
  const publicRoutes = ['/', '/login', '/register', '/help'];
  if (publicRoutes.includes(routePath)) {
    return true;
  }

  // If no role, can't access protected routes
  if (!userRole) {
    return false;
  }

  // Role-specific dashboard restrictions
  if (routePath === '/patient-dashboard') {
    return userRole === 'Patient';
  }
  
  if (routePath === '/ambulance-dashboard') {
    return userRole === 'Ambulance Personnel';
  }

  // All other protected routes are accessible to authenticated users
  // (emergency, hospital, vitals, doctor, discharge, feedback, settings, profile)
  return true;
};
