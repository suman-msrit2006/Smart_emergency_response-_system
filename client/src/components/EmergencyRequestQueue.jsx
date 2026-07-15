import { useState, useEffect, useCallback } from 'react';
import emergencyRequestService from '../services/emergencyRequestService';
import socketService from '../services/socketService';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function RequestCard({ request, ambulanceCoords, onAccept, onReject, processingId }) {
  const [lng, lat] = request.location?.coordinates || [0, 0];
  const distance =
    ambulanceCoords && lat && lng
      ? haversineKm(ambulanceCoords.latitude, ambulanceCoords.longitude, lat, lng).toFixed(1)
      : null;

  const isProcessing = processingId === request._id;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wide text-red-600 bg-red-50 px-2 py-0.5 rounded">
              {request.severity || 'Medium'}
            </span>
            <span className="text-xs text-gray-500">{request.emergencyType || 'Emergency'}</span>
          </div>
          <h4 className="font-semibold text-gray-900">{request.patientName}</h4>
          <p className="text-sm text-gray-600 mt-1">{request.location?.address || 'Location unavailable'}</p>
          <p className="text-xs text-gray-500 mt-2">
            ID: {request.requestId}
            {distance && ` · ${distance} km away`}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => onAccept(request)}
            className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition"
          >
            {isProcessing ? 'Accepting...' : 'Accept'}
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => onReject(request)}
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 disabled:opacity-50 transition"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EmergencyRequestQueue({
  ambulanceId,
  ambulanceCoords,
  isOnline,
  onRequestAccepted,
  onNewRequest,
}) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const fetchPending = useCallback(async () => {
    if (!isOnline || !ambulanceCoords) return;

    setLoading(true);
    try {
      const response = await emergencyRequestService.getPendingRequests(
        ambulanceCoords.longitude,
        ambulanceCoords.latitude
      );
      setRequests(response.data?.requests || []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [isOnline, ambulanceCoords]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  useEffect(() => {
    const handleNewRequest = (data) => {
      const incoming = data.request;
      if (!incoming) return;

      setRequests((prev) => {
        const exists = prev.some((r) => r._id === incoming.id || r._id === data.requestId);
        if (exists) return prev;
        return [
          {
            _id: incoming.id || data.requestId,
            requestId: incoming.requestId,
            patientName: incoming.patientName,
            location: incoming.location,
            emergencyType: incoming.emergencyType,
            severity: incoming.severity,
            createdAt: incoming.createdAt,
          },
          ...prev,
        ];
      });
      onNewRequest?.(incoming);
    };

    const handleCancelled = (data) => {
      setRequests((prev) => prev.filter((r) => r._id !== data.requestId));
    };

    socketService.onEmergencyRequestNew(handleNewRequest);
    socketService.onEmergencyRequestCancelled(handleCancelled);

    return () => {
      socketService.off('emergency:request:new', handleNewRequest);
      socketService.off('emergency:request:cancelled', handleCancelled);
    };
  }, [onNewRequest]);

  const handleAccept = async (request) => {
    if (!ambulanceId) return;
    setProcessingId(request._id);
    try {
      const response = await emergencyRequestService.acceptRequest(request._id, ambulanceId);
      setRequests((prev) => prev.filter((r) => r._id !== request._id));
      onRequestAccepted?.(response.data?.request);
    } catch (err) {
      alert(err.message || 'Failed to accept request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (request) => {
    setProcessingId(request._id);
    try {
      await emergencyRequestService.rejectRequest(request._id, 'Unavailable');
      setRequests((prev) => prev.filter((r) => r._id !== request._id));
    } catch (err) {
      alert(err.message || 'Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  if (!isOnline) {
    return (
      <EmptyState
        title="Go online to receive requests"
        message="Toggle your status to Available to see nearby emergency requests."
      />
    );
  }

  if (!ambulanceCoords) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner message="Acquiring GPS location..." />
      </div>
    );
  }

  if (loading && requests.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner message="Loading emergency requests..." />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <EmptyState
        title="No pending requests"
        message="You will be notified when a new emergency request arrives nearby."
      />
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <RequestCard
          key={request._id}
          request={request}
          ambulanceCoords={ambulanceCoords}
          onAccept={handleAccept}
          onReject={handleReject}
          processingId={processingId}
        />
      ))}
    </div>
  );
}
