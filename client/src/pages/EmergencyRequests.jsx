import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { getRoleDashboardPath } from '../utils/roleBasedNavigation';
import * as emergencyRequestService from '../services/emergencyRequestService';
import socketService from '../services/socketService';
import { ambulanceService } from '../services/ambulanceService';

/* ─── Status badge colours ───────────────────────────────────────────────── */
const STATUS_CONFIG = {
  PENDING:          { label: 'Waiting',          bg: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-400' },
  ACCEPTED:         { label: 'Accepted',          bg: 'bg-blue-100 text-blue-800',    dot: 'bg-blue-500' },
  EN_ROUTE:         { label: 'En Route',          bg: 'bg-indigo-100 text-indigo-800', dot: 'bg-indigo-500' },
  ARRIVED:          { label: 'Arrived',           bg: 'bg-purple-100 text-purple-800', dot: 'bg-purple-500' },
  PATIENT_PICKED:   { label: 'Patient Picked Up', bg: 'bg-orange-100 text-orange-800', dot: 'bg-orange-500' },
  HOSPITAL_REACHED: { label: 'At Hospital',       bg: 'bg-teal-100 text-teal-800',    dot: 'bg-teal-500' },
  COMPLETED:        { label: 'Completed',         bg: 'bg-green-100 text-green-800',  dot: 'bg-green-500' },
  CANCELLED:        { label: 'Cancelled',         bg: 'bg-red-100 text-red-800',      dot: 'bg-red-400' },
  REJECTED:         { label: 'Rejected',          bg: 'bg-gray-100 text-gray-600',    dot: 'bg-gray-400' },
};

/* ─── Next valid status transitions ─────────────────────────────────────── */
const NEXT_STATUS = {
  ACCEPTED:         'EN_ROUTE',
  EN_ROUTE:         'ARRIVED',
  ARRIVED:          'PATIENT_PICKED',
  PATIENT_PICKED:   'HOSPITAL_REACHED',
  HOSPITAL_REACHED: 'COMPLETED',
};

const NEXT_LABEL = {
  EN_ROUTE:         '🚑 Start Navigation (En Route)',
  ARRIVED:          '📍 Mark Arrived at Patient',
  PATIENT_PICKED:   '🧑‍⚕️ Patient Picked Up',
  HOSPITAL_REACHED: '🏥 Reached Hospital',
  COMPLETED:        '✅ Complete Handover',
};

/* ─── Incoming request card ──────────────────────────────────────────────── */
function IncomingCard({ request, onAccept, onReject, accepting, rejecting }) {
  const createdAt = new Date(request.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="bg-white border-l-4 border-red-500 rounded-xl shadow-md p-5 animate-pulse-slow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
            <span className="text-xs font-bold text-red-600 uppercase tracking-wide">New Request</span>
          </div>
          <h3 className="text-base font-bold text-gray-900">{request.patientName || 'Unknown Patient'}</h3>
          <p className="text-xs text-gray-500 mt-0.5">Received at {createdAt}</p>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
          request.severity === 'High' ? 'bg-red-100 text-red-700' :
          request.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
          'bg-green-100 text-green-700'
        }`}>
          {request.severity || 'Medium'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-xs text-gray-400 mb-0.5">Location</p>
          <p className="font-medium text-gray-800 truncate">
            {request.location?.address || `${request.location?.coordinates?.[1]?.toFixed(4)}, ${request.location?.coordinates?.[0]?.toFixed(4)}`}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-xs text-gray-400 mb-0.5">Emergency Type</p>
          <p className="font-medium text-gray-800">{request.emergencyType || 'Medical'}</p>
        </div>
      </div>

      {request.notes && (
        <p className="text-xs text-gray-500 bg-yellow-50 border border-yellow-100 rounded-lg p-2 mb-4">
          📋 {request.notes}
        </p>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => onAccept(request._id)}
          disabled={accepting}
          className="flex-1 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 transition disabled:opacity-60"
        >
          {accepting ? '...' : '✅ Accept'}
        </button>
        <button
          onClick={() => onReject(request._id)}
          disabled={rejecting}
          className="flex-1 py-2 bg-red-100 text-red-700 text-sm font-bold rounded-lg hover:bg-red-200 transition disabled:opacity-60"
        >
          {rejecting ? '...' : '✕ Reject'}
        </button>
      </div>
    </div>
  );
}

/* ─── Active assignment card ─────────────────────────────────────────────── */
function ActiveCard({ request, onUpdateStatus, updating }) {
  const cfg = STATUS_CONFIG[request.status] || STATUS_CONFIG.ACCEPTED;
  const nextStatus = NEXT_STATUS[request.status];
  const nextLabel = NEXT_LABEL[nextStatus];

  return (
    <div className="bg-white border-2 border-teal-300 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 text-base">Active Assignment</h3>
        <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${cfg.bg}`}>
          <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Patient</p>
          <p className="font-semibold text-gray-800">{request.patientName || 'Patient'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Request ID</p>
          <p className="font-semibold text-gray-800 font-mono text-xs">{request.requestId || request._id?.slice(-8)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Location</p>
          <p className="font-semibold text-gray-800 text-xs truncate">
            {request.location?.address || `${request.location?.coordinates?.[1]?.toFixed(4)}, ${request.location?.coordinates?.[0]?.toFixed(4)}`}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Severity</p>
          <p className={`font-bold text-sm ${request.severity === 'High' ? 'text-red-600' : 'text-yellow-600'}`}>
            {request.severity}
          </p>
        </div>
      </div>

      {nextStatus && (
        <button
          onClick={() => onUpdateStatus(request._id, nextStatus)}
          disabled={updating}
          className="w-full py-3 bg-teal-600 text-white font-bold text-sm rounded-xl hover:bg-teal-700 transition disabled:opacity-60"
        >
          {updating ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              Updating...
            </span>
          ) : nextLabel}
        </button>
      )}

      {request.status === 'COMPLETED' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <div className="text-3xl mb-2">🎉</div>
          <p className="font-bold text-green-700">Handover Complete!</p>
          <p className="text-xs text-gray-500 mt-1">Patient successfully handed over to hospital</p>
        </div>
      )}
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────────────────── */
export default function EmergencyRequests() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeRequest, setActiveRequest] = useState(null);
  const [myAmbulance, setMyAmbulance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const pollRef = useRef(null);

  // Role verification - redirect immediately if wrong role
  const isAmbulancePersonnel = user?.role === 'Ambulance Personnel';

  // Guard: only Ambulance Personnel - redirect BEFORE any API calls
  useEffect(() => {
    if (user && !isAmbulancePersonnel) {
      navigate(getRoleDashboardPath(user.role), { replace: true });
    }
  }, [user, isAmbulancePersonnel, navigate]);

  // Load my ambulance first
  const loadMyAmbulance = useCallback(async () => {
    try {
      const response = await emergencyRequestService.getMyAmbulance();
      setMyAmbulance(response.data?.ambulance);
    } catch {
      // no ambulance registered yet
      setMyAmbulance(null);
    }
  }, []);

  // Load pending + active requests
  const loadRequests = useCallback(async () => {
    try {
      // Active request for this personnel - USE CORRECT API
      const activeRes = await emergencyRequestService.getActiveAssignment();
      const active = activeRes?.data?.request || null;
      setActiveRequest(active);

      // Pending requests (only if no active request)
      if (!active) {
        // Use ambulance location if available, otherwise fallback coords
        const lng = myAmbulance?.location?.coordinates?.[0] || 77.5946;
        const lat = myAmbulance?.location?.coordinates?.[1] || 12.9716;
        const pendingRes = await emergencyRequestService.getPendingRequests(lng, lat, 50000);
        setPendingRequests(pendingRes?.data?.requests || []);
      } else {
        setPendingRequests([]);
      }
      setLastRefresh(new Date());
    } catch (err) {
      setError(err?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, [myAmbulance]);

  // Initial load - only for ambulance personnel
  // CRITICAL: Wait for user and role verification before making API calls
  useEffect(() => {
    if (!user) return; // Wait for user to load
    if (!isAmbulancePersonnel) return; // Wrong role - will be redirected
    
    loadMyAmbulance();
  }, [isAmbulancePersonnel, user, loadMyAmbulance]);

  useEffect(() => {
    if (!user) return; // Wait for user to load
    if (!isAmbulancePersonnel) return; // Wrong role - will be redirected
    
    loadRequests();
    // Poll every 15 seconds as fallback
    pollRef.current = setInterval(loadRequests, 15000);
    return () => clearInterval(pollRef.current);
  }, [isAmbulancePersonnel, user, loadRequests]);

  // Real-time: new emergency request - only for ambulance personnel
  useEffect(() => {
    if (!user) return; // Wait for user to load
    if (!isAmbulancePersonnel) return; // Wrong role - will be redirected
    
    const handleNewRequest = (data) => {
      const req = data.request;
      setPendingRequests((prev) => {
        if (prev.find((r) => r._id === req.id || r._id === req._id)) return prev;
        return [{ _id: req.id, ...req }, ...prev];
      });
    };

    const handleCancelled = (data) => {
      setPendingRequests((prev) => prev.filter((r) => r._id !== data.requestId));
      if (activeRequest?._id === data.requestId) {
        setActiveRequest(null);
        loadRequests();
      }
    };

    const handleStatusUpdate = (data) => {
      if (activeRequest?._id === data.requestId) {
        setActiveRequest((prev) => prev ? { ...prev, status: data.status } : prev);
      }
    };

    socketService.onEmergencyRequestNew(handleNewRequest);
    socketService.onEmergencyRequestCancelled(handleCancelled);
    socketService.onEmergencyStatusUpdated(handleStatusUpdate);

    return () => {
      socketService.off('emergency:request:new', handleNewRequest);
      socketService.off('emergency:request:cancelled', handleCancelled);
      socketService.off('emergency:status:updated', handleStatusUpdate);
    };
  }, [isAmbulancePersonnel, user, activeRequest, loadRequests]);

  const handleAccept = async (requestId) => {
    // CRITICAL: Double-check role before making API call
    if (!user || !isAmbulancePersonnel) {
      alert('Unauthorized action.');
      return;
    }
    
    try {
      setAccepting(true);
      
      // Fetch ambulance fresh if not already loaded
      let ambulanceId = myAmbulance?._id;
      
      if (!ambulanceId) {
        console.log('[handleAccept] myAmbulance not loaded, fetching fresh...');
        const freshData = await emergencyRequestService.getMyAmbulance();
        ambulanceId = freshData?.data?.ambulance?._id;
        
        if (!ambulanceId) {
          alert('No ambulance registered for your account. Please contact administrator.');
          return;
        }
        
        // Update state for future use
        setMyAmbulance(freshData?.data?.ambulance);
      }
      
      console.log('[handleAccept] Accepting request with ambulance:', ambulanceId);
      await emergencyRequestService.acceptRequest(requestId, ambulanceId);
      await loadRequests();
    } catch (err) {
      console.error('[handleAccept] Error:', err);
      alert(err?.message || 'Failed to accept request');
    } finally {
      setAccepting(false);
    }
  };

  const handleReject = async (requestId) => {
    // CRITICAL: Double-check role before making API call
    if (!user || !isAmbulancePersonnel) {
      alert('Unauthorized action.');
      return;
    }
    
    try {
      setRejecting(true);
      await emergencyRequestService.rejectRequest(requestId, 'Rejected by personnel');
      setPendingRequests((prev) => prev.filter((r) => r._id !== requestId));
    } catch (err) {
      alert(err?.message || 'Failed to reject request');
    } finally {
      setRejecting(false);
    }
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    // CRITICAL: Double-check role before making API call
    if (!user || !isAmbulancePersonnel) {
      alert('Unauthorized action.');
      return;
    }
    
    try {
      setUpdating(true);
      await emergencyRequestService.updateRequestStatus(requestId, newStatus);
      setActiveRequest((prev) => prev ? { ...prev, status: newStatus } : prev);

      // If completed, clear active and reload
      if (newStatus === 'COMPLETED') {
        setTimeout(() => {
          setActiveRequest(null);
          loadRequests();
        }, 2000);
      }
    } catch (err) {
      alert(err?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Emergency Requests</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {lastRefresh ? `Last updated: ${lastRefresh.toLocaleTimeString()}` : 'Loading...'}
            </p>
          </div>
          <button
            onClick={() => { setLoading(true); loadRequests(); }}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            Refresh
          </button>
        </div>

        {/* Ambulance warning */}
        {!loading && !myAmbulance && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-semibold text-yellow-800">No Ambulance Registered</p>
              <p className="text-sm text-yellow-700">You need a registered ambulance to accept requests. Contact your administrator.</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-center">
            <p className="text-red-600 font-semibold mb-2">{error}</p>
            <button onClick={loadRequests} className="text-sm text-red-600 underline">Retry</button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-500 text-sm">Loading emergency requests...</p>
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT: Active Assignment */}
            <div>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
                Current Assignment
              </h2>
              {activeRequest ? (
                <ActiveCard
                  request={activeRequest}
                  onUpdateStatus={handleUpdateStatus}
                  updating={updating}
                />
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <div className="text-5xl mb-3">🚑</div>
                  <p className="font-semibold text-gray-700 mb-1">No Active Assignment</p>
                  <p className="text-sm text-gray-500">Accept a request to begin your assignment</p>
                </div>
              )}
            </div>

            {/* RIGHT: Incoming Requests */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
                  Incoming Requests
                </h2>
                {pendingRequests.length > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {pendingRequests.length}
                  </span>
                )}
              </div>

              {activeRequest ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                  <p className="text-gray-500 text-sm">
                    Complete your current assignment before accepting new requests.
                  </p>
                </div>
              ) : pendingRequests.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <div className="text-5xl mb-3">📡</div>
                  <p className="font-semibold text-gray-700 mb-1">Waiting for Requests</p>
                  <p className="text-sm text-gray-500">
                    Nearby emergency requests will appear here automatically
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                  {pendingRequests.map((req) => (
                    <IncomingCard
                      key={req._id}
                      request={req}
                      onAccept={handleAccept}
                      onReject={handleReject}
                      accepting={accepting}
                      rejecting={rejecting}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
