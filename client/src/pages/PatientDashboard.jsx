import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

function PatientDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Role verification - redirect immediately if wrong role
  const isPatient = user?.role === 'Patient';

  // Redirect Ambulance Personnel to their dashboard BEFORE any logic executes
  useEffect(() => {
    if (user && !isPatient) {
      navigate('/ambulance-dashboard', { replace: true });
    }
  }, [user, isPatient, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-100 to-blue-50 py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Welcome to TrackER
          </h1>
          <p className="text-gray-600 text-sm mb-12 max-w-2xl mx-auto">
            Your unified command center for emergency medical response, ambulance tracking, hospital coordination, and life-saving analytics
          </p>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600 mb-1">450+</div>
              <div className="text-xs text-gray-600">Active Ambulances</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600 mb-1">85</div>
              <div className="text-xs text-gray-600">Partner Hospitals</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600 mb-1">8.2m</div>
              <div className="text-xs text-gray-600">Avg Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600 mb-1">98%</div>
              <div className="text-xs text-gray-600">System Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            Patient Dashboard
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* SOS Emergency Card */}
            <Link 
              to="/emergency"
              className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col"
            >
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-base font-semibold text-center text-red-700 mb-2">
                SOS Emergency
              </h3>
              <p className="text-xs text-gray-600 text-center mb-4 flex-grow">
                Request emergency ambulance service immediately
              </p>
              <div className="flex justify-center">
                <svg className="w-4 h-4 text-gray-400 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </Link>

            {/* Live Ambulance Tracking Card */}
            <Link 
              to="/patient/tracking"
              className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col"
            >
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-base font-semibold text-center text-teal-700 mb-2">
                Live Ambulance Tracking
              </h3>
              <p className="text-xs text-gray-600 text-center mb-4 flex-grow">
                Track your assigned ambulance in real-time
              </p>
              <div className="flex justify-center">
                <svg className="w-4 h-4 text-gray-400 group-hover:text-teal-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </Link>

            {/* Assigned Hospital Card */}
            <Link 
              to="/hospital"
              className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col"
            >
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-base font-semibold text-center text-teal-700 mb-2">
                Assigned Hospital
              </h3>
              <p className="text-xs text-gray-600 text-center mb-4 flex-grow">
                View your assigned hospital details and status
              </p>
              <div className="flex justify-center">
                <svg className="w-4 h-4 text-gray-400 group-hover:text-teal-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </Link>

            {/* IoT Vital Monitoring Card (View Only) */}
            <Link 
              to="/vitals"
              className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col"
            >
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-base font-semibold text-center text-blue-700 mb-2">
                IoT Vital Monitoring (View Only)
              </h3>
              <p className="text-xs text-gray-600 text-center mb-4 flex-grow">
                View your real-time vital signs during transport
              </p>
              <div className="flex justify-center">
                <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </Link>

            {/* Feedback Card */}
            <Link 
              to="/feedback"
              className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col"
            >
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-base font-semibold text-center text-purple-700 mb-2">
                Feedback
              </h3>
              <p className="text-xs text-gray-600 text-center mb-4 flex-grow">
                Rate your experience and provide feedback
              </p>
              <div className="flex justify-center">
                <svg className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </Link>

          </div>
        </div>
      </section>
    </div>
  );
}

export default PatientDashboard;
