import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canAccessRoute, getRoleDashboardPath } from '../utils/roleBasedNavigation';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // Check role-based access for dashboard routes
  const currentPath = location.pathname;
  const userRole = user?.role;

  // CRITICAL: Block access and redirect BEFORE rendering if wrong role
  // This prevents any useEffect or component logic from executing
  if (!canAccessRoute(userRole, currentPath)) {
    const correctDashboard = getRoleDashboardPath(userRole);
    return <Navigate to={correctDashboard} replace />;
  }

  return children;
}

export default ProtectedRoute;
