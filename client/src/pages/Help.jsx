import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function Help() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Help Center</h1>
          <p className="text-gray-600">Find answers and get support</p>
        </div>

        <div className="space-y-6">
          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/" className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900">User Guide</h3>
                  <p className="text-sm text-gray-600">Getting started with TrackER</p>
                </div>
              </Link>
              <Link to="/" className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900">FAQs</h3>
                  <p className="text-sm text-gray-600">Frequently asked questions</p>
                </div>
              </Link>
            </div>
          </div>

          {/* FAQs */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer list-none p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <span className="font-medium text-gray-900">How do I track an ambulance?</span>
                  <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </summary>
                <div className="p-4 text-gray-600">
                  Navigate to the Emergency page, search for your location, and view available ambulances on the map with real-time tracking.
                </div>
              </details>

              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer list-none p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <span className="font-medium text-gray-900">How do I select a hospital?</span>
                  <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </summary>
                <div className="p-4 text-gray-600">
                  On the Hospital page, you can either select from the dropdown or search by location to find nearby hospitals, then click to select one.
                </div>
              </details>

              <details className="group">
                <summary className="flex justify-between items-center cursor-pointer list-none p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <span className="font-medium text-gray-900">What is IoT Vital Monitoring?</span>
                  <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </summary>
                <div className="p-4 text-gray-600">
                  IoT Vital Monitoring tracks patient vitals (heart rate, SpO₂, temperature, blood pressure) in real-time during ambulance transport.
                </div>
              </details>
            </div>
          </div>

          {/* Contact Support */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Support</h2>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <span>Email: support@tracker.com</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <span>Phone: 1-800-TRACKER</span>
              </div>
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Hours: 24/7 Emergency Support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Help;
