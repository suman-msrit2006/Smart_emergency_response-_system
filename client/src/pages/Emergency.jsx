import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useWorkflow } from '../context/WorkflowContext';
import { ambulanceService } from '../services/ambulanceService';
import emergencyRequestService from '../services/emergencyRequestService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastContainer';
import socketService from '../services/socketService';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

// Fix Leaflet icon issue with Vite
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
  iconSize: [50, 65],
  iconAnchor: [25, 65],
});

const icons = {
  available: createCustomIcon('<div style="background:#00ff88;color:black;font-weight:bold;padding:4px 8px;border-radius:12px;font-size:11px;text-align:center;">AVAILABLE</div>'),
  enroute: createCustomIcon('<div style="background:#ffaa00;color:black;font-weight:bold;padding:2px 6px;border-radius:8px;font-size:10px;text-align:center;">EN ROUTE</div>'),
  hospital: createCustomIcon('<div style="background:#ff4d4d;color:white;font-weight:bold;padding:3px 7px;border-radius:10px;font-size:10px;text-align:center;">HOSPITAL</div>'),
  user: createCustomIcon('<div style="background:#4488ff;color:white;font-weight:bold;padding:3px 8px;border-radius:10px;font-size:11px;text-align:center;margin-top:5px;">YOU</div>'),
};

// MapUpdater component to handle map view updates
function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 12);
    }
  }, [center, zoom, map]);
  return null;
}

export default function Emergency() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setUserLocation, setSelectedAmbulance, setWorkflowStep } = useWorkflow();
  const toast = useToast();

  // Role verification - redirect immediately if wrong role
  const isPatient = user?.role === 'Patient';

  // Redirect Ambulance Personnel to their dashboard BEFORE any logic executes
  useEffect(() => {
    if (user && !isPatient) {
      navigate('/ambulance-dashboard', { replace: true });
    }
  }, [user, isPatient, navigate]);
  
  const [placeSearch, setPlaceSearch] = useState('');
  const [searchStatus, setSearchStatus] = useState({ message: '', type: '' });
  const [userLoc, setUserLoc] = useState(null);
  const [ambulances, setAmbulances] = useState([]);
  const [stats, setStats] = useState({ total: 0, available: 0, enroute: 0, fastest: null });
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [mapZoom, setMapZoom] = useState(5);
  const [emergencyRequestId, setEmergencyRequestId] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedAmbulanceId, setSelectedAmbulanceId] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null); // 'pending', 'accepted', 'rejected'
  const [acceptedAmbulance, setAcceptedAmbulance] = useState(null);
  const [ambulanceLocation, setAmbulanceLocation] = useState(null);
  
  const intervalRef = useRef(null);

  // Connect to Socket.IO on mount - only for patients
  // CRITICAL: Wait for role verification before connecting
  useEffect(() => {
    if (!user) return; // Wait for user to load
    if (!isPatient) return; // Wrong role - will be redirected
    
    socketService.connect();

    return () => {
      socketService.disconnect();
    };
  }, [isPatient, user]);

  // Listen for emergency request acceptance - only for patients
  useEffect(() => {
    if (!user) return; // Wait for user to load
    if (!isPatient) return; // Wrong role - will be redirected
    
    const handleRequestAccepted = (data) => {
      console.log('Emergency request accepted:', data);
      
      setRequestStatus('accepted');
      setAcceptedAmbulance(data.request.ambulance);
      setAmbulanceLocation(data.request.ambulance.location);
      
      toast.success(`Ambulance ${data.request.ambulance.vehicleNumber} accepted your request!`);
      
      setSearchStatus({
        message: `✅ Ambulance ${data.request.ambulance.vehicleNumber} is on the way!`,
        type: 'success'
      });

      // Update selected ambulance with real data
      setSelectedAmbulance({
        id: data.request.ambulance.id,
        vehicleNumber: data.request.ambulance.vehicleNumber,
        type: data.request.ambulance.type,
        location: data.request.ambulance.location
      });

      // Navigate to hospital selection after 3 seconds
      setTimeout(() => {
        setWorkflowStep('hospital');
        navigate('/hospital');
      }, 3000);
    };

    const handleStatusUpdate = (data) => {
      console.log('Emergency status updated:', data);
      
      setSearchStatus({
        message: `Status: ${data.status}`,
        type: 'info'
      });
    };

    const handleAmbulanceLocationUpdate = (data) => {
      console.log('Ambulance location updated:', data);
      
      // Update ambulance location in real-time
      setAmbulanceLocation(data.location);
      
      // Update ambulance in list if it exists
      setAmbulances(prev => prev.map(amb => 
        amb.id === data.ambulanceId 
          ? { 
              ...amb, 
              lat: data.location.coordinates[1], 
              lng: data.location.coordinates[0] 
            }
          : amb
      ));
    };

    // Register event listeners
    socketService.on('emergency:request:accepted', handleRequestAccepted);
    socketService.on('emergency:status:updated', handleStatusUpdate);
    socketService.on('ambulance:location:updated', handleAmbulanceLocationUpdate);

    // Cleanup
    return () => {
      socketService.off('emergency:request:accepted', handleRequestAccepted);
      socketService.off('emergency:status:updated', handleStatusUpdate);
      socketService.off('ambulance:location:updated', handleAmbulanceLocationUpdate);
    };
  }, [isPatient, user, toast, navigate, setSelectedAmbulance, setWorkflowStep]);

  // Haversine distance calculation
  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Fetch ambulances from API
  const fetchAmbulances = async (longitude, latitude, maxDistance = 50000) => {
    try {
      const data = await ambulanceService.getAvailable(longitude, latitude, maxDistance);
      
      // Check if data exists and has ambulances array
      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid response from ambulance service');
      }
      
      // Transform API data to match existing format
      const transformedAmbulances = data.map(amb => ({
        id: amb._id || amb.id,
        vehicleNumber: amb.vehicleNumber,
        driverName: amb.driver?.name || 'Driver',
        hospitalName: amb.hospital?.name || 'Hospital',
        lat: amb.currentLocation?.coordinates?.[1] || 0,
        lng: amb.currentLocation?.coordinates?.[0] || 0,
        status: amb.status?.toLowerCase() || 'available', // Normalize to lowercase
        type: amb.type,
        equipment: amb.equipment,
      }));
      
      // Filter out ambulances with invalid coordinates
      const validAmbulances = transformedAmbulances.filter(
        amb => amb.lat !== 0 && amb.lng !== 0
      );
      
      if (validAmbulances.length > 0) {
        // Calculate distances immediately if user location is known
        let ambulancesWithDistance = validAmbulances;
        if (latitude && longitude) {
          ambulancesWithDistance = validAmbulances.map(amb => ({
            ...amb,
            distance: haversineDistance(latitude, longitude, amb.lat, amb.lng),
          }));
        }
        
        setAmbulances(ambulancesWithDistance);
        toast.success(`Found ${validAmbulances.length} ambulances nearby`);
        return;
      }
      
      // If no valid ambulances, fall through to mock data
      throw new Error('No valid ambulances found');
    } catch {
      toast.warning('Using demo ambulance data for your area');
      setSearchStatus({ message: 'Using demo ambulance data for your area.', type: 'info' });
      
      // Fallback to mock data around the searched location
      const generateLocalAmbulances = (baseLat, baseLng) => {
        const ambulances = [];
        const statuses = ['available', 'available', 'available', 'available', 'enroute'];
        
        for (let i = 1; i <= 10; i++) {
          // Generate ambulances within 5km radius
          const angle = Math.random() * 2 * Math.PI;
          const distance = Math.random() * 0.05; // ~5km in degrees
          const lat = baseLat + distance * Math.cos(angle);
          const lng = baseLng + distance * Math.sin(angle);
          
          ambulances.push({
            id: `AMB${String(i).padStart(3, '0')}`,
            vehicleNumber: `KA-${String(10 + i).padStart(2, '0')}-AB-${1000 + i}`,
            lat,
            lng,
            status: statuses[i % statuses.length],
            type: i % 3 === 0 ? 'ALS' : 'BLS',
          });
        }
        
        return ambulances;
      };
      
      // Use searched location or default to Bangalore
      const baseLat = latitude || 12.9716;
      const baseLng = longitude || 77.5946;
      
      setAmbulances(generateLocalAmbulances(baseLat, baseLng));
    }
  };

  // Initialize ambulances - only for patients
  // CRITICAL: Wait for role verification before making API calls
  useEffect(() => {
    if (!user) return; // Wait for user to load
    if (!isPatient) return; // Wrong role - will be redirected
    
    // Load all ambulances initially
    const loadInitialData = async () => {
      setInitialLoading(true);
      await fetchAmbulances(78.9629, 20.5937, 5000000); // All India
      setInitialLoading(false);
    };
    
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPatient, user]);

  // Live tracking simulation
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setAmbulances(prev => prev.map(amb => ({
        ...amb,
        lat: amb.lat + (Math.random() - 0.5) * 0.003,
        lng: amb.lng + (Math.random() - 0.5) * 0.003,
      })));
    }, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Update distances when user location changes
  useEffect(() => {
    if (userLoc && ambulances.length > 0) {
      const updated = ambulances.map(amb => ({
        ...amb,
        distance: haversineDistance(userLoc.lat, userLoc.lng, amb.lat, amb.lng),
      }));
      
      // Filter ambulances within 50km (not 5km)
      const nearby = updated.filter(amb => amb.distance <= 50);
      const available = nearby.filter(amb => amb.status === 'available').sort((a, b) => a.distance - b.distance);
      const enroute = nearby.filter(amb => amb.status === 'enroute');
      
      setStats({
        total: nearby.length,
        available: available.length,
        enroute: enroute.length,
        fastest: available.length > 0 ? available[0] : null,
      });
      
      // Only update ambulances if distances changed
      const hasDistanceChanges = updated.some((amb, idx) => 
        ambulances[idx]?.distance !== amb.distance
      );
      
      if (hasDistanceChanges) {
        setAmbulances(updated);
      }
    }
  }, [userLoc]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = async () => {
    if (!placeSearch.trim()) {
      setSearchStatus({ message: 'Please enter a location', type: 'warning' });
      toast.warning('Please enter a location');
      return;
    }

    setSearchLoading(true);
    setSearchStatus({ message: 'Searching for ambulances...', type: 'info' });

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeSearch)}, India&limit=1&countrycodes=in`
      );
      const data = await response.json();

      if (data.length === 0) {
        setSearchStatus({ message: 'Location not found. Try another place name.', type: 'danger' });
        toast.error('Location not found. Try another place name.');
        setSearchLoading(false);
        return;
      }

      const place = data[0];
      const newLocation = {
        lat: parseFloat(place.lat),
        lng: parseFloat(place.lon),
        name: place.display_name.split(',')[0],
      };

      setUserLoc(newLocation);
      setUserLocation(newLocation);
      setMapCenter([newLocation.lat, newLocation.lng]);
      setMapZoom(12);
      
      // Fetch nearby ambulances from API
      await fetchAmbulances(newLocation.lng, newLocation.lat, 50000); // 50km radius
      
      setSearchStatus({ message: `Found ${newLocation.name}`, type: 'success' });
      toast.success(`Found ${newLocation.name}`);
    } catch {
      setSearchStatus({ message: 'Search failed. Please try again.', type: 'danger' });
      toast.error('Search failed. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAcceptAmbulance = async (ambulanceId) => {
    // CRITICAL: Double-check role before making API call
    if (!user || !isPatient) {
      toast.error('Unauthorized action.');
      return;
    }
    
    if (!ambulanceId) {
      toast.warning('Please select an ambulance first');
      return;
    }

    if (!userLoc) {
      toast.error('Please search your location first');
      return;
    }

    const selectedAmb = ambulances.find(amb => amb.id === ambulanceId);
    if (!selectedAmb) {
      toast.error('Ambulance not found');
      return;
    }

    setSearchStatus({ 
      message: `Creating emergency request...`, 
      type: 'info' 
    });
    toast.info(`Creating emergency request...`);

    try {
      // Create emergency request
      const requestData = {
        patientName: user?.name || 'Patient',
        patientPhone: user?.phone || user?.phoneNumber || '1234567890',
        location: {
          longitude: userLoc.lng,
          latitude: userLoc.lat,
          address: userLoc.name || 'Unknown location',
        },
        emergencyType: 'Medical',
        severity: 'High',
        notes: `Emergency request for ambulance ${ambulanceId}`,
      };

      console.log('=== FRONTEND: Creating Emergency Request ===');
      console.log('Request Data:', JSON.stringify(requestData, null, 2));
      console.log('User:', user);
      console.log('User phone:', user?.phone);
      console.log('Token exists:', !!localStorage.getItem('token'));

      const response = await emergencyRequestService.createEmergencyRequest(requestData);
      
      console.log('=== FRONTEND: Response Received ===');
      console.log('Response:', JSON.stringify(response, null, 2));
      
      if (response.status === 'success' && response.data.emergencyRequest) {
        const requestId = response.data.emergencyRequest._id;
        setEmergencyRequestId(requestId);
        
        // Save to workflow context
        setSelectedAmbulance(selectedAmb);
        
        // Save to localStorage for persistence
        localStorage.setItem('emergency_request_id', requestId);
        localStorage.setItem('selected_ambulance_id', ambulanceId);
        localStorage.setItem('selected_ambulance', JSON.stringify(selectedAmb));
        
        setSearchStatus({ 
          message: `✅ Emergency request sent! Waiting for ambulance personnel to accept...`, 
          type: 'success' 
        });
        toast.success(`Emergency request created! Request ID: ${response.data.emergencyRequest.requestId}`);
        
        // Set pending status
        setRequestStatus('pending');
        setSelectedAmbulanceId(ambulanceId);
        
      } else {
        throw new Error('Failed to create emergency request');
      }
      
    } catch (error) {
      console.error('=== FRONTEND: Error Creating Emergency Request ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      console.error('Error status:', error.status);
      console.error('Error response:', error.response);
      
      setSearchStatus({ 
        message: `Failed to create emergency request. Please try again.`, 
        type: 'danger' 
      });
      toast.error(error.message || 'Failed to create emergency request. Please try again.');
      setRequestStatus(null);
      setSelectedAmbulanceId(null);
    }
  };

  const availableAmbulances = userLoc
    ? ambulances.filter(amb => amb.distance <= 50 && amb.status === 'available').sort((a, b) => a.distance - b.distance)
    : [];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="container mx-auto px-4 py-4">
        {/* HEADER - Reduced spacing */}
        <div className="text-center text-white mb-4">
          <h1 className="text-3xl font-bold mb-2">Live Ambulance Dashboard</h1>
          <p className="text-lg">Enter your location to find available ambulances nearby</p>
        </div>

        {/* SEARCH SECTION - Reduced padding and spacing */}
        <div className="max-w-5xl mx-auto mb-4">
          <div className="bg-white bg-opacity-95 rounded-2xl p-4 shadow-2xl">
            <h3 className="text-xl font-semibold text-blue-600 mb-3 text-center">Enter Your Location</h3>
            <div className="flex gap-3 flex-wrap">
              <input
                type="text"
                value={placeSearch}
                onChange={(e) => setPlaceSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                disabled={searchLoading}
                className="flex-1 px-4 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="Enter place name e.g., Connaught Place Delhi, Bandra Mumbai, etc."
              />
              <button 
                onClick={handleSearch} 
                disabled={searchLoading}
                className="px-6 py-2 bg-blue-600 text-white text-base font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {searchLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
            {searchLoading && (
              <div className="mt-3">
                <LoadingSpinner size="sm" message="" />
              </div>
            )}
            {searchStatus.message && !searchLoading && (
              <div className={`mt-3 p-3 rounded-lg font-bold text-center ${
                searchStatus.type === 'success' ? 'bg-green-100 text-green-800' :
                searchStatus.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                searchStatus.type === 'info' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
              }`}>
                {searchStatus.message}
              </div>
            )}
          </div>
        </div>

        {/* STATS PANEL - Reduced padding and spacing */}
        {userLoc && (
          <div className="max-w-5xl mx-auto mb-4">
            <div className="rounded-xl p-4 text-white shadow-xl" style={{ background: 'linear-gradient(135deg, #00b894, #00cec9)' }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">{stats.total}</div>
                  <div className="text-sm">Total Nearby (50km)</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1" style={{ color: '#00ff88', textShadow: '0 0 10px #00ff88' }}>
                    {stats.available}
                  </div>
                  <div className="text-sm"><strong>AVAILABLE</strong></div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1 text-yellow-300">{stats.enroute}</div>
                  <div className="text-sm">En Route</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1 animate-pulse">
                    {stats.fastest ? stats.fastest.id : '-'}
                  </div>
                  <div className="text-sm">{stats.fastest ? `${stats.fastest.distance.toFixed(1)} km` : '-'}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MAP & LIST - Reduced height and spacing */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* MAP */}
          <div className="lg:col-span-2 bg-white p-4 rounded-xl shadow-xl">
            <h4 className="text-lg font-semibold mb-3">Live Tracking Map</h4>
            <div style={{ height: '380px', borderRadius: '10px', overflow: 'hidden' }}>
              <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapUpdater center={mapCenter} zoom={mapZoom} />
                
                {userLoc && (
                  <Marker position={[userLoc.lat, userLoc.lng]} icon={icons.user}>
                    <Popup>
                      <strong>Your Location</strong><br />{userLoc.name}
                    </Popup>
                  </Marker>
                )}
                
                {ambulances.map(amb => (
                  <Marker
                    key={amb.id}
                    position={[amb.lat, amb.lng]}
                    icon={amb.status === 'available' ? icons.available : amb.status === 'enroute' ? icons.enroute : icons.hospital}
                  >
                    <Popup>
                      <div className="p-2">
                        <h6 className="font-bold text-sm">{amb.vehicleNumber}</h6>
                        <p className="text-xs text-gray-700 mt-1">👨‍⚕️ {amb.driverName}</p>
                        <p className="text-xs text-gray-600">🏥 {amb.hospitalName}</p>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold mt-2 ${
                          amb.status === 'available' ? 'bg-green-500 text-white' :
                          amb.status === 'enroute' ? 'bg-yellow-500 text-black' :
                          'bg-red-500 text-white'
                        }`}>
                          {amb.status.toUpperCase()}
                        </span>
                        {userLoc && amb.distance && (
                          <div className="font-bold mt-1 text-sm">{amb.distance.toFixed(1)} km away</div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* AMBULANCE LIST - Reduced height and spacing */}
          <div className="bg-white p-4 rounded-xl shadow-xl">
            <h4 className="text-lg font-semibold mb-3">Available Ambulances</h4>
            <div className="space-y-2 overflow-y-auto" style={{ maxHeight: '380px' }}>
              {initialLoading ? (
                <LoadingSpinner size="md" message="Loading ambulances..." />
              ) : availableAmbulances.length === 0 ? (
                <EmptyState
                  icon="🚑"
                  title={userLoc ? "No Ambulances Nearby" : "Search Your Location"}
                  message={userLoc ? "No available ambulances found within 50km of your location." : "Enter your location to find available ambulances nearby."}
                />
              ) : requestStatus === 'pending' ? (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-3"></div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">Request Sent</h3>
                  <p className="text-sm text-gray-600 mb-3">Waiting for ambulance personnel to accept your request...</p>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs text-blue-800">
                      <strong>Ambulance:</strong> {ambulances.find(a => a.id === selectedAmbulanceId)?.vehicleNumber || selectedAmbulanceId}
                    </p>
                  </div>
                </div>
              ) : requestStatus === 'accepted' ? (
                <div className="text-center py-6">
                  <div className="text-5xl mb-3">✅</div>
                  <h3 className="text-base font-bold text-green-600 mb-2">Request Accepted!</h3>
                  <p className="text-sm text-gray-600 mb-3">Ambulance {ambulances.find(a => a.id === selectedAmbulanceId)?.vehicleNumber || selectedAmbulanceId} is on the way</p>
                  <p className="text-xs text-gray-500">Redirecting to hospital selection...</p>
                </div>
              ) : (
                availableAmbulances.map((amb, index) => (
                  <div
                    key={amb.id}
                    className={`p-3 rounded-lg border-l-4 transition-all ${
                      selectedAmbulanceId === amb.id
                        ? 'bg-blue-100 border-blue-500 ring-2 ring-blue-300'
                        : index === 0
                        ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-red-500'
                        : 'bg-green-50 border-green-500 hover:bg-green-100 cursor-pointer'
                    }`}
                    onClick={() => setSelectedAmbulanceId(amb.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h5 className="font-bold text-base flex items-center gap-2 flex-wrap">
                          {amb.vehicleNumber}
                          <span className="bg-green-500 text-white px-2 py-0.5 rounded text-xs">AVAILABLE</span>
                          {index === 0 && <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs">FASTEST</span>}
                          {selectedAmbulanceId === amb.id && <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs">SELECTED</span>}
                        </h5>
                        <div className="mt-1 space-y-0.5">
                          <div className="text-gray-700 text-xs font-medium">
                            👨‍⚕️ {amb.driverName}
                          </div>
                          <div className="text-gray-600 text-xs">
                            🏥 {amb.hospitalName}
                          </div>
                          <div className="text-gray-600 text-xs">
                            {amb.type || 'Advanced Life Support'} • Live tracking active
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-3">
                        <div className="font-bold text-lg text-green-600">{amb.distance.toFixed(1)} km</div>
                        <div className="text-xs text-gray-600">~{Math.ceil(amb.distance * 4)} min</div>
                      </div>
                    </div>
                    {selectedAmbulanceId === amb.id && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptAmbulance(amb.id);
                        }}
                        className="mt-2 w-full bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                      >
                        ✅ REQUEST THIS AMBULANCE
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* REQUEST BUTTON - Improved visibility for bottom message */}
        {userLoc && !requestStatus && (
          <div className="max-w-3xl mx-auto">
            {selectedAmbulanceId ? (
              <div className="text-center">
                <button
                  onClick={() => handleAcceptAmbulance(selectedAmbulanceId)}
                  className="px-10 py-3 text-lg font-bold rounded-full transition shadow-lg bg-green-500 text-white hover:bg-green-600 cursor-pointer animate-pulse"
                >
                  ✅ REQUEST AMBULANCE {ambulances.find(a => a.id === selectedAmbulanceId)?.vehicleNumber || selectedAmbulanceId}
                </button>
                <p className="mt-3 text-white text-base bg-black bg-opacity-30 rounded-lg p-2 inline-block">
                  📍 {ambulances.find(a => a.id === selectedAmbulanceId)?.distance.toFixed(1)} km away • 
                  ⏱️ ~{Math.ceil(ambulances.find(a => a.id === selectedAmbulanceId)?.distance * 4)} min ETA
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-blue-300">
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-800 text-lg font-semibold">
                    👆 Select an ambulance from the list above to send a request
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* WAITING STATUS - Reduced size */}
        {requestStatus === 'pending' && (
          <div className="max-w-2xl mx-auto bg-white bg-opacity-95 rounded-xl p-6 shadow-lg">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">Request Sent to {selectedAmbulanceId}</h2>
            <p className="text-base text-gray-600 mb-3 text-center">
              Waiting for ambulance personnel to accept your request...
            </p>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800 text-center">
                <strong>Status:</strong> Pending Response<br />
                <strong>Ambulance:</strong> {selectedAmbulanceId}<br />
                <strong>Distance:</strong> {ambulances.find(a => a.id === selectedAmbulanceId)?.distance.toFixed(1)} km
              </p>
            </div>
          </div>
        )}

        {/* ACCEPTED STATUS - Reduced size */}
        {requestStatus === 'accepted' && acceptedAmbulance && (
          <div className="max-w-2xl mx-auto bg-white bg-opacity-95 rounded-xl p-6 shadow-lg">
            <div className="text-6xl mb-3 text-center">✅</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2 text-center">Request Accepted!</h2>
            <p className="text-base text-gray-600 mb-4 text-center">
              Ambulance {acceptedAmbulance.vehicleNumber} is on the way
            </p>
            <div className="bg-green-50 p-4 rounded-lg mb-3">
              <div className="grid grid-cols-2 gap-3 text-left">
                <div>
                  <p className="text-xs text-gray-600">Vehicle Number</p>
                  <p className="text-base font-bold text-gray-900">{acceptedAmbulance.vehicleNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Type</p>
                  <p className="text-base font-bold text-gray-900">{acceptedAmbulance.type}</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 text-center">Redirecting to hospital selection...</p>
          </div>
        )}
      </div>
    </div>
  );
}
