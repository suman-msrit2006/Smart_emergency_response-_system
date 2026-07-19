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
  patient: createCustomIcon('<div style="background:#3b82f6;color:white;font-weight:bold;padding:8px;border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 4px 6px rgba(0,0,0,0.3);">📍</div>'),
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

// Status configuration
const STATUS_CONFIG = {
  PENDING: { label: 'Waiting for Acceptance', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
  ACCEPTED: { label: 'Ambulance Accepted', color: 'bg-blue-100 text-blue-800', icon: '✅' },
  EN_ROUTE: { label: 'En Route to You', color: 'bg-indigo-100 text-indigo-800', icon: '🚑' },
  ARRIVED: { label: 'Ambulance Arrived', color: 'bg-green-100 text-green-800', icon: '📍' },
  PATIENT_PICKED: { label: 'Patient Picked Up', color: 'bg-purple-100 text-purple-800', icon: '🏥' },
  HOSPITAL_REACHED: { label: 'At Hospital', color: 'bg-teal-100 text-teal-800', icon: '🏥' },
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: '✅' },
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

export default function PatientTracking() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [activeRequest, setActiveRequest] = useState(null);
  const [ambulanceLocation, setAmbulanceLocation] = useState(null);
  const [patientLocation, setPatientLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [eta, setEta] = useState(null);
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]);
  const [routeCoordinates, setRouteCoordinates] = useState([]);

  // Role verification
  const isPatient = user?.role === 'Patient';

  useEffect(() => {
    if (user && !isPatient) {
      navigate('/ambulance-dashboard', { replace: true });
    }
  }, [user, isPatient, navigate]);

  // Load active emergency request
  const loadActiveRequest = async () => {
    setLoading(true);
    try {
      const response = await emergencyRequestService.getActiveRequest();
      if (response.data && response.data.request) {
        const request = response.data.request;
        setActiveRequest(request);

        // Set patient location
        if (request.location?.coordinates) {
          const patientLoc = {
            lat: request.location.coordinates[1],
            lng: request.location.coordinates[0],
          };
          setPatientLocation(patientLoc);

          // Set ambulance location if available
          if (request.ambulance?.location?.coordinates) {
            const ambLoc = {
              lat: request.ambulance.location.coordinates[1],
              lng: request.ambulance.location.coordinates[0],
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
        setActiveRequest(null);
      }
    } catch (error) {
      console.error('Error loading active request:', error);
      setActiveRequest(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (!user || !isPatient) return;
    
    socketService.connect();
    loadActiveRequest();

    return () => {
      socketService.disconnect();
    };
  }, [user, isPatient]);

  // Real-time updates
  useEffect(() => {
    if (!user || !isPatient) return;

    const handleStatusUpdate = (data) => {
      console.log('Status updated:', data);
      if (activeRequest && data.requestId === activeRequest._id) {
        setActiveRequest(prev => ({ ...prev, status: data.status }));
      }
    };

    const handleAmbulanceLocationUpdate = (data) => {
      console.log('Ambulance location updated:', data);
      if (activeRequest && data.ambulanceId === activeRequest.ambulance?.id) {
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
  }, [user, isPatient, activeRequest, patientLocation]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-6 py-12 flex justify-center">
          <LoadingSpinner size="lg" message="Loading tracking information..." />
        </div>
      </div>
    );
  }

  // No active request - Empty state
  if (!activeRequest) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-2xl mx-auto">
            <EmptyState
              icon="🚑"
              title="No Active Emergency Request"
              message="You don't have an active emergency request. Send an SOS request to start tracking your ambulance."
              action={
                <button
                  onClick={() => navigate('/emergency')}
                  className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
                >
                  🚨 Send SOS Request
                </button>
              }
            />
          </div>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[activeRequest.status] || STATUS_CONFIG.PENDING;

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
                <h1 className="text-xl font-bold text-gray-900">Live Ambulance Tracking</h1>
                <p className="text-xs text-gray-500">Request ID: {activeRequest.requestId}</p>
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
                        <strong>Your Location</strong>
                        <br />
                        {activeRequest.location?.address || 'Patient Location'}
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Ambulance Location Marker */}
                {ambulanceLocation && (
                  <Marker position={[ambulanceLocation.lat, ambulanceLocation.lng]} icon={icons.ambulance}>
                    <Popup>
                      <div className="text-center">
                        <strong>Ambulance Location</strong>
                        <br />
                        {activeRequest.ambulance?.vehicleNumber || 'Ambulance'}
                        <br />
                        <span className="text-sm text-gray-600">
                          {distance ? `${distance.toFixed(2)} km away` : ''}
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Route Line */}
                {routeCoordinates.length === 2 && (
                  <Polyline
                    positions={routeCoordinates}
                    color="#3b82f6"
                    weight={4}
                    opacity={0.7}
                    dashArray="10, 10"
                  />
                )}
              </MapContainer>
            </div>
          </div>

          {/* RIGHT: Info Panel (30%) */}
          <div className="lg:col-span-3 space-y-3">
            {/* Card 1: Distance & ETA */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-4 text-white">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">📍</span>
                <h3 className="text-sm font-bold">Distance & ETA</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs opacity-80">Distance</p>
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

            {/* Card 2: Ambulance Details */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🚑</span>
                <h3 className="text-sm font-bold text-gray-900">Ambulance Details</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Vehicle</span>
                  <span className="font-semibold text-gray-900">
                    {activeRequest.ambulance?.vehicleNumber || 'Not Assigned'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Driver</span>
                  <span className="font-semibold text-gray-900">
                    {activeRequest.ambulance?.driver?.name || 'Driver'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="font-semibold text-gray-900">
                    {activeRequest.ambulance?.type || 'ALS'}
                  </span>
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
                  <span className="text-gray-500">Patient</span>
                  <span className="font-semibold text-gray-900">{activeRequest.patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="font-semibold text-gray-900">
                    {activeRequest.emergencyType || 'Medical'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Severity</span>
                  <span className={`font-semibold ${
                    activeRequest.severity === 'High' ? 'text-red-600' :
                    activeRequest.severity === 'Medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {activeRequest.severity || 'Medium'}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 4: Back Button */}
            <button
              onClick={() => navigate('/patient-dashboard')}
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
