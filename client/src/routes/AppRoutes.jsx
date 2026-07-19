import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import ProtectedRoute from "../components/ProtectedRoute";

// Lazy load pages for better performance
const PatientDashboard = lazy(() => import("../pages/PatientDashboard"));
const AmbulanceDashboard = lazy(() => import("../pages/AmbulanceDashboard"));
const Emergency = lazy(() => import("../pages/Emergency"));
const Hospital = lazy(() => import("../pages/Hospital"));
const Vitals = lazy(() => import("../pages/Vitals"));
const Doctor = lazy(() => import("../pages/Doctor"));
const Discharge = lazy(() => import("../pages/Discharge"));
const Feedback = lazy(() => import("../pages/Feedback"));
const EmergencyRequests = lazy(() => import("../pages/EmergencyRequests"));
const PatientTracking = lazy(() => import("../pages/PatientTracking"));
const AmbulanceNavigation = lazy(() => import("../pages/AmbulanceNavigation"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const Settings = lazy(() => import("../pages/Settings"));
const Help = lazy(() => import("../pages/Help"));
const Profile = lazy(() => import("../pages/Profile"));
const NotFound = lazy(() => import("../pages/NotFound"));
const FeedbackManagement = lazy(() => import("../pages/FeedbackManagement"));
const Debug = lazy(() => import("../pages/Debug"));
const Cleanup = lazy(() => import("../pages/Cleanup"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <LoadingSpinner size="lg" message="Loading..." />
  </div>
);

function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/help" element={<Help />} />
          
          {/* Dashboard Routes */}
          <Route 
            path="/patient-dashboard" 
            element={
              <ProtectedRoute>
                <PatientDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ambulance-dashboard" 
            element={
              <ProtectedRoute>
                <AmbulanceDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected Routes */}
          <Route 
            path="/emergency" 
            element={
              <ProtectedRoute>
                <Emergency />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/hospital" 
            element={
              <ProtectedRoute>
                <Hospital />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/vitals" 
            element={
              <ProtectedRoute>
                <Vitals />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctor" 
            element={
              <ProtectedRoute>
                <Doctor />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/discharge" 
            element={
              <ProtectedRoute>
                <Discharge />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/feedback" 
            element={
              <ProtectedRoute>
                <Feedback />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/emergency-requests" 
            element={
              <ProtectedRoute>
                <EmergencyRequests />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient/tracking" 
            element={
              <ProtectedRoute>
                <PatientTracking />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ambulance/navigation" 
            element={
              <ProtectedRoute>
                <AmbulanceNavigation />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/feedback-management" 
            element={
              <ProtectedRoute>
                <FeedbackManagement />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/debug" element={<Debug />} />
          <Route path="/cleanup" element={<Cleanup />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRoutes;