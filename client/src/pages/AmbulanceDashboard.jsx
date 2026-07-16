import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import { notificationService } from "../services/notificationService";
import { ambulanceService } from "../services/ambulanceService";
import emergencyRequestService from "../services/emergencyRequestService";
import socketService from "../services/socketService";
import { useGPSTracking } from "../hooks/useGPSTracking";
import { useToast } from "../components/ToastContainer";

const STATUS_FLOW = {
  ACCEPTED: { next: "EN_ROUTE", label: "Mark En Route" },
  EN_ROUTE: { next: "ARRIVED", label: "Mark Arrived" },
  ARRIVED: { next: "PATIENT_PICKED", label: "Patient Picked Up" },
  PATIENT_PICKED: { next: "HOSPITAL_REACHED", label: "Reached Hospital" },
  HOSPITAL_REACHED: { next: "COMPLETED", label: "Complete Handover" },
};

function AmbulanceDashboard() {
  const toast = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [unreadCount, setUnreadCount] = useState(0);
  const [latestFeedback, setLatestFeedback] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  const [ambulance, setAmbulance] = useState(null);
  const [ambulanceLoading, setAmbulanceLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [togglingOnline, setTogglingOnline] = useState(false);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const ambulanceId = ambulance?._id;
  
  // Role verification - redirect immediately if wrong role
  const isAmbulancePersonnel = user?.role === 'Ambulance Personnel';

  // Redirect Patients to their dashboard BEFORE any logic executes
  useEffect(() => {
    if (user && !isAmbulancePersonnel) {
      navigate('/patient-dashboard', { replace: true });
    }
  }, [user, isAmbulancePersonnel, navigate]);

  const handleGpsError = useCallback(
    (message) => toast.error(message),
    [toast]
  );

  const { position, gpsStatus } = useGPSTracking({
    enabled: isOnline && !!ambulanceId,
    ambulanceId,
    onError: handleGpsError,
  });

  const loadAmbulance = useCallback(async () => {
    setAmbulanceLoading(true);
    try {
      const response = await emergencyRequestService.getMyAmbulance();
      const amb = response.data?.ambulance;
      setAmbulance(amb);
      setIsOnline(amb?.isOnline ?? false);
    } catch {
      setAmbulance(null);
    } finally {
      setAmbulanceLoading(false);
    }
  }, []);

  const loadActiveAssignment = useCallback(async () => {
    try {
      const response = await emergencyRequestService.getActiveAssignment();
      setActiveAssignment(response.data?.request || null);
    } catch {
      setActiveAssignment(null);
    }
  }, []);

  const loadPendingCount = useCallback(async () => {
    if (!position) return;
    try {
      const response = await emergencyRequestService.getPendingRequests(
        position.longitude,
        position.latitude,
        50000
      );
      setPendingCount(response.data?.requests?.length || 0);
    } catch {
      setPendingCount(0);
    }
  }, [position]);

  // CRITICAL: Wait for role verification to complete before making API calls
  // This useEffect waits until after the redirect logic has had a chance to execute
  useEffect(() => {
    // If user exists but is not ambulance personnel, the earlier useEffect will redirect
    // So we only proceed if user is ambulance personnel
    if (!user) return; // Wait for user to load
    if (!isAmbulancePersonnel) return; // Wrong role - will be redirected by earlier useEffect
    
    // Only execute ambulance logic after role is verified
    socketService.connect();
    loadAmbulance();
    loadActiveAssignment();
  }, [isAmbulancePersonnel, user, loadAmbulance, loadActiveAssignment]);

  // Load pending count when position is available - only for ambulance personnel
  useEffect(() => {
    if (!user) return; // Wait for user to load
    if (!isAmbulancePersonnel) return; // Wrong role
    if (!isOnline || !position) return;
    
    loadPendingCount();
    // Refresh pending count every 30 seconds
    const interval = setInterval(loadPendingCount, 30000);
    return () => clearInterval(interval);
  }, [isAmbulancePersonnel, user, isOnline, position, loadPendingCount]);

  const fetchUnread = useCallback(async () => {
    if (!user) return; // Wait for user to load
    if (!isAmbulancePersonnel) return; // Wrong role
    
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
      if (count > 0) setShowBanner(true);
    } catch {
      // silently ignore
    }
  }, [isAmbulancePersonnel, user]);

  useEffect(() => {
    if (!user) return; // Wait for user to load
    if (!isAmbulancePersonnel) return; // Wrong role
    
    fetchUnread();
  }, [isAmbulancePersonnel, user, fetchUnread]);

  useEffect(() => {
    if (!user) return; // Wait for user to load
    if (!isAmbulancePersonnel) return; // Wrong role
    
    const handleNewNotification = ({ notification }) => {
      if (notification?.type === "feedback") {
        setUnreadCount((prev) => prev + 1);
        setLatestFeedback(notification);
        setShowBanner(true);
      }
    };

    const handleNewRequest = () => {
      // Increment pending count when new request arrives
      setPendingCount((prev) => prev + 1);
      toast.info('New emergency request received!');
    };

    const handleRequestAccepted = () => {
      // Reload assignment when a request is accepted
      loadActiveAssignment();
    };

    socketService.onNewNotification(handleNewNotification);
    socketService.onEmergencyRequestNew(handleNewRequest);
    socketService.on('emergency:request:accepted', handleRequestAccepted);

    return () => {
      socketService.offNewNotification(handleNewNotification);
      socketService.off('emergency:request:new', handleNewRequest);
      socketService.off('emergency:request:accepted', handleRequestAccepted);
    };
  }, [isAmbulancePersonnel, user, toast, loadActiveAssignment]);

  const handleToggleOnline = async () => {
    // CRITICAL: Double-check role before making API call
    if (!user || !isAmbulancePersonnel) {
      toast.error("Unauthorized action.");
      return;
    }
    
    if (!ambulanceId) {
      toast.error("No ambulance assigned to your account.");
      return;
    }

    setTogglingOnline(true);
    const nextOnline = !isOnline;

    try {
      const updated = await ambulanceService.updateOnlineStatus(ambulanceId, nextOnline);
      setIsOnline(updated.isOnline);
      setAmbulance((prev) => ({ ...prev, ...updated }));
      toast.success(nextOnline ? "You are now online and receiving requests" : "You are now offline");
    } catch (err) {
      toast.error(err.message || "Failed to update online status");
    } finally {
      setTogglingOnline(false);
    }
  };

  const handleRequestAccepted = () => {
    loadActiveAssignment();
    loadPendingCount();
  };

  const handleAdvanceStatus = async () => {
    // CRITICAL: Double-check role before making API call
    if (!user || !isAmbulancePersonnel) {
      toast.error("Unauthorized action.");
      return;
    }
    
    if (!activeAssignment) return;

    const flow = STATUS_FLOW[activeAssignment.status];
    if (!flow) return;

    setUpdatingStatus(true);
    try {
      const response = await emergencyRequestService.updateRequestStatus(
        activeAssignment._id,
        flow.next
      );
      const updated = response.data?.request;
      setActiveAssignment(updated);

      if (flow.next === "COMPLETED") {
        toast.success("Patient handover completed!");
        setActiveAssignment(null);
        if (ambulanceId) {
          await ambulanceService.updateStatus(ambulanceId, "Available");
        }
      } else {
        toast.info(`Status updated to ${flow.next.replace(/_/g, " ")}`);
      }
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const gpsBadge = {
    idle: { text: "GPS Off", color: "bg-gray-100 text-gray-600" },
    tracking: { text: "GPS Active", color: "bg-green-100 text-green-700" },
    denied: { text: "GPS Denied", color: "bg-red-100 text-red-700" },
    unavailable: { text: "GPS Unavailable", color: "bg-yellow-100 text-yellow-700" },
    error: { text: "GPS Error", color: "bg-red-100 text-red-700" },
  }[gpsStatus] || { text: "GPS Off", color: "bg-gray-100 text-gray-600" };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {showBanner && unreadCount > 0 && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-xl animate-bounce">⭐</span>
            <span className="font-semibold text-sm">
              {latestFeedback
                ? `New feedback from ${latestFeedback.meta?.patientName || "a patient"} — ${latestFeedback.meta?.rating}/5 stars`
                : `You have ${unreadCount} unread patient feedback notification${unreadCount > 1 ? "s" : ""}`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/feedback-management"
              className="bg-white text-orange-600 text-xs font-bold px-4 py-1.5 rounded-full hover:bg-orange-50 transition"
            >
              View Feedback
            </Link>
            <button
              onClick={() => setShowBanner(false)}
              className="text-white hover:text-orange-100 transition text-lg leading-none"
              aria-label="Dismiss banner"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Operational Control Panel */}
      <section className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          {ambulanceLoading ? (
            <div className="flex justify-center py-4">
              <LoadingSpinner message="Loading ambulance data..." />
            </div>
          ) : !ambulance ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
              No ambulance is linked to your account. Contact your administrator or run the ambulance seed script.
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {ambulance.vehicleNumber}
                  <span className="ml-2 text-sm font-normal text-gray-500">{ambulance.type}</span>
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Status: <span className="font-medium">{ambulance.status}</span>
                  {position && (
                    <span className="ml-3 text-xs text-gray-400">
                      ({position.latitude.toFixed(4)}, {position.longitude.toFixed(4)})
                    </span>
                  )}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${gpsBadge.color}`}>
                  {gpsBadge.text}
                </span>
                <span
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                    isOnline ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {isOnline ? "Online" : "Offline"}
                </span>
                <button
                  type="button"
                  onClick={handleToggleOnline}
                  disabled={togglingOnline || !!activeAssignment}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 ${
                    isOnline
                      ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      : "bg-teal-600 text-white hover:bg-teal-700"
                  }`}
                >
                  {togglingOnline ? "Updating..." : isOnline ? "Go Offline" : "Go Online"}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Active Assignment */}
      {activeAssignment && (
        <section className="px-6 py-6 bg-teal-50 border-b border-teal-100">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-teal-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Active Assignment</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Patient: <span className="font-medium">{activeAssignment.patientName}</span>
                    {" · "}ID: {activeAssignment.requestId}
                  </p>
                  <p className="text-sm text-gray-600">
                    {activeAssignment.location?.address}
                  </p>
                  <span className="inline-block mt-2 text-xs font-bold uppercase tracking-wide text-teal-700 bg-teal-100 px-2 py-1 rounded">
                    {activeAssignment.status?.replace(/_/g, " ")}
                  </span>
                </div>
                {STATUS_FLOW[activeAssignment.status] && (
                  <button
                    type="button"
                    onClick={handleAdvanceStatus}
                    disabled={updatingStatus}
                    className="px-5 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 disabled:bg-gray-400 transition shrink-0"
                  >
                    {updatingStatus ? "Updating..." : STATUS_FLOW[activeAssignment.status].label}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Emergency Request Queue - REMOVED, moved to /emergency-requests page */}
      {/* Summary Card Instead */}
      <section className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Emergency Requests</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {!isOnline ? (
                      'Go online to receive emergency requests'
                    ) : activeAssignment ? (
                      'Complete your active assignment before accepting new requests'
                    ) : pendingCount > 0 ? (
                      `${pendingCount} pending request${pendingCount > 1 ? 's' : ''} waiting for response`
                    ) : (
                      'No pending requests at this time'
                    )}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {isOnline && !activeAssignment && pendingCount > 0 && (
                  <div className="mb-2">
                    <span className="inline-block bg-red-500 text-white text-2xl font-bold px-4 py-2 rounded-full animate-pulse">
                      {pendingCount}
                    </span>
                  </div>
                )}
                <Link
                  to="/emergency-requests"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
                >
                  View All Requests
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-100 to-blue-50 py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Ambulance Operations
          </h1>
          <p className="text-gray-600 text-sm mb-12 max-w-2xl mx-auto">
            Your command center for emergency response, live GPS tracking, hospital coordination, and patient handover
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600 mb-1">{isOnline ? "Online" : "Offline"}</div>
              <div className="text-xs text-gray-600">Your Status</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600 mb-1">{gpsStatus === "tracking" ? "Live" : "—"}</div>
              <div className="text-xs text-gray-600">GPS Tracking</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600 mb-1">{activeAssignment ? "1" : "0"}</div>
              <div className="text-xs text-gray-600">Active Assignment</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-600 mb-1">{pendingCount}</div>
              <div className="text-xs text-gray-600">Pending Requests</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            <Link
              to="/emergency-requests"
              className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col relative"
            >
              {pendingCount > 0 && (
                <span className="absolute top-3 right-3 min-w-[28px] h-[28px] px-2 bg-red-500 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  {pendingCount > 99 ? '99+' : pendingCount}
                </span>
              )}
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-base font-semibold text-center text-red-700 mb-2">
                Emergency Requests
              </h3>
              <p className="text-xs text-gray-600 text-center mb-4 flex-grow">
                {pendingCount > 0 
                  ? `${pendingCount} pending request${pendingCount > 1 ? 's' : ''} waiting` 
                  : 'View and accept incoming emergency requests'}
              </p>
            </Link>

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
                Coordinate with hospitals for patient handover
              </p>
            </Link>

            <Link
              to="/vitals"
              className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col"
            >
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-base font-semibold text-center text-green-700 mb-2">
                IoT Vital Monitoring
              </h3>
              <p className="text-xs text-gray-600 text-center mb-4 flex-grow">
                Monitor and record patient vitals in real-time
              </p>
            </Link>

            <Link
              to="/doctor"
              className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col"
            >
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-base font-semibold text-center text-indigo-700 mb-2">
                Doctor Consultation Portal
              </h3>
              <p className="text-xs text-gray-600 text-center mb-4 flex-grow">
                Consult with specialists during patient transport
              </p>
            </Link>

            <Link
              to="/discharge"
              className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col"
            >
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-base font-semibold text-center text-orange-700 mb-2">
                Patient Handover &amp; Discharge
              </h3>
              <p className="text-xs text-gray-600 text-center mb-4 flex-grow">
                Complete patient handover documentation
              </p>
            </Link>

            <Link
              to="/feedback-management"
              className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-6 flex flex-col border-2 border-transparent hover:border-yellow-300"
            >
              {unreadCount > 0 && (
                <span className="absolute top-3 right-3 min-w-[22px] h-[22px] px-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
              <div className="flex justify-center mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${unreadCount > 0 ? "bg-yellow-100" : "bg-purple-100"}`}>
                  <svg className={`w-7 h-7 ${unreadCount > 0 ? "text-yellow-600" : "text-purple-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                  </svg>
                </div>
              </div>
              <h3 className={`text-base font-semibold text-center mb-2 ${unreadCount > 0 ? "text-yellow-700" : "text-purple-700"}`}>
                Patient Feedback
              </h3>
              <p className="text-xs text-gray-600 text-center mb-4 flex-grow">
                {unreadCount > 0
                  ? `${unreadCount} unread feedback notification${unreadCount > 1 ? "s" : ""}`
                  : "View patient feedback and ratings"}
              </p>
            </Link>

          </div>
        </div>
      </section>
    </div>
  );
}

export default AmbulanceDashboard;
