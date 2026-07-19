/**
 * Centralized role-based navigation utility
 * Returns the correct dashboard path based on user role
 */
export const getRoleDashboardPath = (userRole) => {
  if (!userRole) {
    return '/login';
  }

  switch (userRole) {
    case 'Patient':
      return '/patient-dashboard';
    case 'Ambulance Personnel':
      return '/ambulance-dashboard';
    default:
      return '/login';
  }
};

/**
 * Check if a user has permission to access a specific route based on their role
 * STRICT ENFORCEMENT: Each route must explicitly allow the role
 */
export const canAccessRoute = (userRole, routePath) => {
  // Public routes - accessible to all
  const publicRoutes = ['/', '/login', '/register', '/help', '/debug', '/cleanup'];
  if (publicRoutes.includes(routePath)) {
    return true;
  }

  // If no role, can't access protected routes
  if (!userRole) {
    return false;
  }

  // PATIENT-ONLY ROUTES
  if (routePath === '/patient-dashboard') {
    return userRole === 'Patient';
  }
  
  if (routePath === '/emergency') {
    return userRole === 'Patient';
  }

  if (routePath === '/feedback') {
    return userRole === 'Patient';
  }

  if (routePath === '/patient/tracking') {
    return userRole === 'Patient';
  }

  // AMBULANCE PERSONNEL-ONLY ROUTES
  if (routePath === '/ambulance-dashboard') {
    return userRole === 'Ambulance Personnel';
  }

  if (routePath === '/emergency-requests') {
    return userRole === 'Ambulance Personnel';
  }

  if (routePath === '/feedback-management') {
    return userRole === 'Ambulance Personnel';
  }

  if (routePath === '/ambulance/navigation') {
    return userRole === 'Ambulance Personnel';
  }

  // SHARED ROUTES - accessible to both authenticated roles
  // These are pages both Patient and Ambulance Personnel can access
  const sharedRoutes = [
    '/hospital',
    '/vitals',
    '/doctor',
    '/discharge',
    '/settings',
    '/profile',
  ];
  
  if (sharedRoutes.includes(routePath)) {
    return userRole === 'Patient' || userRole === 'Ambulance Personnel';
  }

  // Default deny for any unrecognized route
  return false;
};
