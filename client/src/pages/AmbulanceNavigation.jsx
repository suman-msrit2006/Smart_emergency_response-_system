import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import emergencyRequestService from '../services/emergencyRequestService';
import socketService from '../services/socketService';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useToast } from '../components/ToastContainer';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const createCustomIcon = (html) => L.divIcon({
  html,
  className: '',
  iconSize: [40, 50],
  iconAnchor: [20, 50],
});

const icons = {
  ambulance: createCustomIcon('<div style="background:#22c55e;color:white;font-weight:bold;padding:8px;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 4px 6px rgba(0,0,0,0.3);">🚑</div>'),
  patient: createCustomIcon('<div style="background:#ef4444;color:white;font-weight:bold;padding:8px;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 4px 6px rgba(0,0,0,0.3);">📍</div>'),
};

// MapUpdater component
function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || 13);
    }
  }, [center, zoom, map]);
  return null;
}

// Status configuration and transitions
const STATUS_CONFIG = {
  ACCEPTED: { label: 'Request Accepted', color: 'bg-blue-100 text-blue-800', icon: '✅', next: 'PATIENT_PICKED' },
  EN_ROUTE: { label: 'En Route to Patient', color: 'bg-indigo-100 text-indigo-800', icon: '🚑', next: 'ARRIVED' },
  ARRIVED: { label: 'Arrived at Patient', color: 'bg-green-100 text-green-800', icon: '📍', next: 'PATIENT_PICKED' },
  PATIENT_PICKED: { label: 'Patient Picked Up', color: 'bg-purple-100 text-purple-800', icon: '🏥', next: 'HOSPITAL_REACHED' },
  HOSPITAL_REACHED: { label: 'At Hospital', color: 'bg-teal-100 text-teal-800', icon: '🏥', next: 'COMPLETED' },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: '✅', next: null },
};

const STATUS_ACTIONS = {
  PATIENT_PICKED: '🧑‍⚕️ Patient Picked Up',
  EN_ROUTE: '🚑 Start Navigation (En Route)',
  ARRIVED: '📍 Mark Arrived at Patient',
  HOSPITAL_REACHED: '🏥 Reached Hospital',
  COMPLETED: '✅ Complete Handover',
};

// Haversine distance calculation
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Calculate ETA based on distance (assuming average speed of 40 km/h in city)
const calculateETA = (distance) => {
  const speed = 40; // km/h
  const hours = distance / speed;
  const minutes = Math.round(hours * 60);
  return minutes;
};

export default function AmbulanceNavigation() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [ambulanceLocation, setAmbulanceLocation] = useState(null);
  const [patientLocation, setPatientLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [eta, setEta] = useState(null);
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Role verification
  const isAmbulancePersonnel = user?.role === 'Ambulance Personnel';

  useEffect(() => {
    if (user && !isAmbulancePersonnel) {
      navigate('/patient-dashboard', { replace: true });
    }
  }, [user, isAmbulancePersonnel, navigate]);

  // Load active assignment
  const loadActiveAssignment = async () => {
    setLoading(true);
    try {
      const response = await emergencyRequestService.getActiveAssignment();
      if (response.data && response.data.request) {
        const assignment = response.data.request;
        setActiveAssignment(assignment);

        // Set patient location
        if (assignment.location?.coordinates) {
          const patientLoc = {
            lat: assignment.location.coordinates[1],
            lng: assignment.location.coordinates[0],
          };
          setPatientLocation(patientLoc);

          // Set ambulance location if available
          if (assignment.ambulance?.location?.coordinates) {
            const ambLoc = {
              lat: assignment.ambulance.location.coordinates[1],
              lng: assignment.ambulance.location.coordinates[0],
            };
            setAmbulanceLocation(ambLoc);

            // Calculate distance and ETA using LOCAL variables (not state)
            const dist = calculateDistance(
              ambLoc.lat,
              ambLoc.lng,
              patientLoc.lat,
              patientLoc.lng
            );
            setDistance(dist);
            setEta(calculateETA(dist));

            // Set route coordinates
            setRouteCoordinates([
              [ambLoc.lat, ambLoc.lng],
              [patientLoc.lat, patientLoc.lng],
            ]);

            // Center map between ambulance and patient
            const centerLat = (ambLoc.lat + patientLoc.lat) / 2;
            const centerLng = (ambLoc.lng + patientLoc.lng) / 2;
            setMapCenter([centerLat, centerLng]);
          } else {
            // If no ambulance location, center on patient
            setMapCenter([patientLoc.lat, patientLoc.lng]);
          }
        }
      } else {
        setActiveAssignment(null);
      }
    } catch (error) {
      console.error('Error loading active assignment:', error);
      setActiveAssignment(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (!user || !isAmbulancePersonnel) return;
    
    socketService.connect();
    loadActiveAssignment();

    return () => {
      socketService.disconnect();
    };
  }, [user, isAmbulancePersonnel]);

  // Real-time updates
  useEffect(() => {
    if (!user || !isAmbulancePersonnel) return;

    const handleStatusUpdate = (data) => {
      console.log('Status updated:', data);
      if (activeAssignment && data.requestId === activeAssignment._id) {
        setActiveAssignment(prev => ({ ...prev, status: data.status }));
      }
    };

    const handleAmbulanceLocationUpdate = (data) => {
      console.log('Ambulance location updated:', data);
      if (activeAssignment && data.ambulanceId === activeAssignment.ambulance?.id) {
        const ambLoc = {
          lat: data.location.coordinates[1],
          lng: data.location.coordinates[0],
        };
        setAmbulanceLocation(ambLoc);

        // Recalculate distance and ETA
        if (patientLocation) {
          const dist = calculateDistance(
            ambLoc.lat,
            ambLoc.lng,
            patientLocation.lat,
            patientLocation.lng
          );
          setDistance(dist);
          setEta(calculateETA(dist));

          // Update route
          setRouteCoordinates([
            [ambLoc.lat, ambLoc.lng],
            [patientLocation.lat, patientLocation.lng],
          ]);

          // Update map center
          const centerLat = (ambLoc.lat + patientLocation.lat) / 2;
          const centerLng = (ambLoc.lng + patientLocation.lng) / 2;
          setMapCenter([centerLat, centerLng]);
        }
      }
    };

    socketService.on('emergency:status:updated', handleStatusUpdate);
    socketService.on('ambulance:location:updated', handleAmbulanceLocationUpdate);

    return () => {
      socketService.off('emergency:status:updated', handleStatusUpdate);
      socketService.off('ambulance:location:updated', handleAmbulanceLocationUpdate);
    };
  }, [user, isAmbulancePersonnel, activeAssignment, patientLocation]);

  // Handle status update
  const handleUpdateStatus = async () => {
    if (!activeAssignment) return;

    const currentStatus = activeAssignment.status;
    const nextStatus = STATUS_CONFIG[currentStatus]?.next;

    if (!nextStatus) {
      toast.info('This is the final status.');
      return;
    }

    setUpdatingStatus(true);
    try {
      const response = await emergencyRequestService.updateRequestStatus(
        activeAssignment._id,
        nextStatus
      );
      
      setActiveAssignment(response.data?.request);
      toast.success(`Status updated to ${nextStatus.replace(/_/g, ' ')}`);

      // Navigate to hospital page when patient is picked up
      if (nextStatus === 'PATIENT_PICKED') {
        setTimeout(() => {
          navigate('/hospital');
        }, 1500);
      }

      // If completed, redirect to dashboard after 2 seconds
      if (nextStatus === 'COMPLETED') {
        setTimeout(() => {
          navigate('/ambulance-dashboard');
        }, 2000);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-6 py-12 flex justify-center">
          <LoadingSpinner size="lg" message="Loading navigation information..." />
        </div>
      </div>
    );
  }

  // No active assignment - Empty state
  if (!activeAssignment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto">
            <EmptyState
              icon="🚑"
              title="No Active Assignment"
              message="You don't have an active assignment. Accept an emergency request to start navigation."
              action={
                <button
                  onClick={() => navigate('/emergency-requests')}
                  className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
                >
                  View Emergency Requests
                </button>
              }
            />
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[activeAssignment.status] || STATUS_CONFIG.ACCEPTED;
  const nextStatus = statusConfig.next;
  const actionLabel = STATUS_ACTIONS[nextStatus];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Compact Header */}
      <div className="bg-white border-b border-gray-200 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚑</span>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Ambulance Navigation</h1>
                <p className="text-xs text-gray-500">Request ID: {activeAssignment.requestId}</p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-lg ${statusConfig.color} flex items-center gap-2`}>
              <span className="text-xl">{statusConfig.icon}</span>
              <span className="text-sm font-bold">{statusConfig.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
          {/* LEFT: Map Section (70%) */}
          <div className="lg:col-span-7 bg-white rounded-xl shadow-md overflow-hidden">
            <div style={{ height: '520px' }}>
              <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapUpdater center={mapCenter} zoom={13} />

                {/* Patient Location Marker */}
                {patientLocation && (
                  <Marker position={[patientLocation.lat, patientLocation.lng]} icon={icons.patient}>
                    <Popup>
                      <div className="text-center">
                        <strong>Patient Location</strong>
                        <br />
                        {activeAssignment.location?.address || 'Destination'}
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Ambulance Location Marker */}
                {ambulanceLocation && (
                  <Marker position={[ambulanceLocation.lat, ambulanceLocation.lng]} icon={icons.ambulance}>
                    <Popup>
                      <div className="text-center">
                        <strong>Your Location</strong>
                        <br />
                        {activeAssignment.ambulance?.vehicleNumber || 'Your Ambulance'}
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Route Line */}
                {routeCoordinates.length === 2 && (
                  <Polyline
                    positions={routeCoordinates}
                    color="#22c55e"
                    weight={5}
                    opacity={0.8}
                  />
                )}
              </MapContainer>
            </div>
          </div>

          {/* RIGHT: Info Panel (30%) */}
          <div className="lg:col-span-3 space-y-3">
            {/* Card 1: Distance & ETA */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-4 text-white">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">📍</span>
                <h3 className="text-sm font-bold">Distance & ETA</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs opacity-80">To Patient</p>
                  <p className="text-2xl font-bold">
                    {distance ? `${distance.toFixed(1)} km` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs opacity-80">Est. Time</p>
                  <p className="text-2xl font-bold">
                    {eta ? `${eta} min` : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2: Patient Information */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">👤</span>
                <h3 className="text-sm font-bold text-gray-900">Patient Information</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name</span>
                  <span className="font-semibold text-gray-900">{activeAssignment.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone</span>
                  <span className="font-semibold text-gray-900">
                    {activeAssignment.patientPhone || 'N/A'}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Address</p>
                  <p className="font-semibold text-gray-900 text-xs leading-tight">
                    {activeAssignment.location?.address || 'Address not available'}
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3: Emergency Details */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🚨</span>
                <h3 className="text-sm font-bold text-gray-900">Emergency Details</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="font-semibold text-gray-900">
                    {activeAssignment.emergencyType || 'Medical'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Severity</span>
                  <span className={`font-semibold ${
                    activeAssignment.severity === 'High' ? 'text-red-600' :
                    activeAssignment.severity === 'Medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {activeAssignment.severity || 'Medium'}
                  </span>
                </div>
                {activeAssignment.notes && (
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Notes</p>
                    <p className="text-xs text-gray-900 bg-yellow-50 p-2 rounded">
                      {activeAssignment.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Card 4: Patient Picked Up Button */}
            <button
              onClick={() => navigate('/hospital')}
              className="w-full px-4 py-3 bg-teal-600 text-white text-sm font-bold rounded-lg hover:bg-teal-700 transition shadow-md"
            >
              🧑‍⚕️ Patient Picked Up
            </button>

            {/* Card 5: Back Button */}
            <button
              onClick={() => navigate('/ambulance-dashboard')}
              className="w-full px-4 py-3 bg-gray-700 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition shadow-md"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
