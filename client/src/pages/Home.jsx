import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function Home() {
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
            Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Ambulance Dispatch Card */}
            <Link 
              to="/emergency"
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
                Ambulance Dispatch & Live Tracking
              </h3>
              <p className="text-xs text-gray-600 text-center mb-4 flex-grow">
                Real-time fleet status and emergency routing
              </p>
              <div className="flex justify-center">
                <svg className="w-4 h-4 text-gray-400 group-hover:text-teal-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </Link>

            {/* Hospital Coordination Card */}
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
                Hospital Coordination
              </h3>
              <p className="text-xs text-gray-600 text-center mb-4 flex-grow">
                Centralized unified data from 57 chercute
              </p>
              <div className="flex justify-center">
                <svg className="w-4 h-4 text-gray-400 group-hover:text-teal-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </Link>

            {/* IoT Vital Monitoring Card */}
            <Link 
              to="/vitals"
              className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col"
            >
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-base font-semibold text-center text-teal-700 mb-2">
                IoT Vital Monitoring System
              </h3>
              <p className="text-xs text-gray-600 text-center mb-4 flex-grow">
                Pre-hospital based toresammolites
              </p>
              <div className="flex justify-center">
                <svg className="w-4 h-4 text-gray-400 group-hover:text-teal-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </Link>

            {/* Doctor Consultation Card */}
            <Link 
              to="/doctor"
              className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col"
            >
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-base font-semibold text-center text-teal-700 mb-2">
                Doctor Consultation Portal
              </h3>
              <p className="text-xs text-gray-600 text-center mb-4 flex-grow">
                Secure find care consultation between ambulance staff and specialist doctor
              </p>
              <div className="flex justify-center">
                <svg className="w-4 h-4 text-gray-400 group-hover:text-teal-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </Link>

            {/* Patient Handover Card */}
            <Link 
              to="/discharge"
              className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col"
            >
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-base font-semibold text-center text-teal-700 mb-2">
                Patient Handover & Discharge
              </h3>
              <p className="text-xs text-gray-600 text-center mb-4 flex-grow">
                Seamless transitions and patient tracking
              </p>
              <div className="flex justify-center">
                <svg className="w-4 h-4 text-gray-400 group-hover:text-teal-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-base font-semibold text-center text-teal-700 mb-2">
                FeedBack
              </h3>
              <p className="text-xs text-gray-600 text-center mb-4 flex-grow">
                Patient feedback
              </p>
              <div className="flex justify-center">
                <svg className="w-4 h-4 text-gray-400 group-hover:text-teal-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

export default Home;