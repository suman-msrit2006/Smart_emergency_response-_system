import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useWorkflow } from '../context/WorkflowContext';
import { ambulanceService } from '../services/ambulanceService';
import { emergencyService } from '../services/emergencyService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastContainer';
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
  const { setUserLocation, setSelectedAmbulance, setWorkflowStep } = useWorkflow();
  const { user } = useAuth();
  const toast = useToast();
  
  const [placeSearch, setPlaceSearch] = useState('');
  const [searchStatus, setSearchStatus] = useState({ message: '', type: '' });
  const [userLoc, setUserLoc] = useState(null);
  const [ambulances, setAmbulances] = useState([]);
  const [stats, setStats] = useState({ total: 0, available: 0, enroute: 0, fastest: null });
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);
  const [mapZoom, setMapZoom] = useState(5);
  const [emergencyId, setEmergencyId] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  
  const intervalRef = useRef(null);

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
        lat: amb.currentLocation?.coordinates?.[1] || 0,
        lng: amb.currentLocation?.coordinates?.[0] || 0,
        status: amb.status,
        type: amb.type,
        equipment: amb.equipment,
      }));
      
      // Filter out ambulances with invalid coordinates
      const validAmbulances = transformedAmbulances.filter(
        amb => amb.lat !== 0 && amb.lng !== 0
      );
      
      if (validAmbulances.length > 0) {
        setAmbulances(validAmbulances);
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

  // Initialize ambulances
  useEffect(() => {
    // Load all ambulances initially
    const loadInitialData = async () => {
      setInitialLoading(true);
      await fetchAmbulances(78.9629, 20.5937, 5000000); // All India
      setInitialLoading(false);
    };
    
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      
      const nearby = updated.filter(amb => amb.distance <= 5);
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
      
      // Create emergency request
      const userId = user?.id || user?._id;
      try {
        const emergencyData = {
          patient: userId || 'guest-patient',
          type: 'Other',
          severity: 'High',
          description: 'Emergency request from live dashboard',
          location: {
            type: 'Point',
            coordinates: [newLocation.lng, newLocation.lat],
            address: place.display_name,
          },
          contactNumber: user?.phone || '911',
        };
        
        const emergency = await emergencyService.create(emergencyData);
        
        if (emergency && (emergency._id || emergency.id)) {
          const emergId = emergency._id || emergency.id;
          setEmergencyId(emergId);
          localStorage.setItem('current_emergency_id', emergId);
          toast.success('Emergency request created successfully');
        }
        
        // Save user info regardless of emergency creation success
        if (userId) {
          localStorage.setItem('user_id', userId);
        }
        localStorage.setItem('user_phone', user?.phone || '911');
        localStorage.setItem('user_location', JSON.stringify(newLocation));
      } catch (error) {
        // Error creating emergency - continue without emergency ID
        toast.warning('Location found, but emergency record not created');
        // Continue without emergency ID - ambulance dispatch will still work
      }
      
      setSearchStatus({ message: `Found ${newLocation.name}`, type: 'success' });
      toast.success(`Found ${newLocation.name}`);
    } catch {
      setSearchStatus({ message: 'Search failed. Please try again.', type: 'danger' });
      toast.error('Search failed. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleDemo = async () => {
    const demos = [
      { name: 'Connaught Place Delhi', lat: 28.6315, lng: 77.2199 },
      { name: 'Bandra Mumbai', lat: 19.0610, lng: 72.8348 },
      { name: 'Koramangala Bangalore', lat: 12.9279, lng: 77.6285 },
      { name: 'T Nagar Chennai', lat: 13.0400, lng: 80.2300 },
    ];
    const demo = demos[Math.floor(Math.random() * demos.length)];
    setPlaceSearch(demo.name);
    const newLocation = { lat: demo.lat, lng: demo.lng, name: demo.name };
    setUserLoc(newLocation);
    setUserLocation(newLocation);
    setMapCenter([demo.lat, demo.lng]);
    setMapZoom(12);
    
    // Fetch nearby ambulances
    await fetchAmbulances(demo.lng, demo.lat, 50000);
    
    // Create demo emergency request
    const userId = user?.id || user?._id;
    try {
      const emergencyData = {
        patient: userId || 'guest-patient',
        type: 'Other',
        severity: 'High',
        description: 'Demo emergency request',
        location: {
          type: 'Point',
          coordinates: [demo.lng, demo.lat],
          address: demo.name,
        },
        contactNumber: user?.phone || '911',
      };
      
      const emergency = await emergencyService.create(emergencyData);
      
      if (emergency && (emergency._id || emergency.id)) {
        const emergId = emergency._id || emergency.id;
        setEmergencyId(emergId);
        localStorage.setItem('current_emergency_id', emergId);
      }
      
      // Save user info regardless
      if (userId) {
        localStorage.setItem('user_id', userId);
      }
      localStorage.setItem('user_phone', user?.phone || '911');
      localStorage.setItem('user_location', JSON.stringify(newLocation));
      
      setSearchStatus({ message: `Demo location: ${demo.name}`, type: 'success' });
    } catch (error) {
      // Error creating demo emergency - continue with demo location
      setSearchStatus({ message: `Demo location: ${demo.name}`, type: 'success' });
    }
  };

  const handleAcceptAmbulance = async () => {
    if (!stats.fastest) {
      setSearchStatus({ 
        message: 'No available ambulance found. Please search for your location first.', 
        type: 'warning' 
      });
      toast.warning('No available ambulance found. Please search for your location first.');
      return;
    }

    setSearchStatus({ 
      message: `Dispatching ${stats.fastest.id}... Please wait.`, 
      type: 'info' 
    });
    toast.info(`Dispatching ${stats.fastest.id}...`);

    // Save to workflow context
    setSelectedAmbulance(stats.fastest);
    
    // Save to localStorage for persistence
    localStorage.setItem('selected_ambulance_id', stats.fastest.id);
    localStorage.setItem('selected_ambulance', JSON.stringify(stats.fastest));
    
    // Assign ambulance to emergency if emergency was created
    if (emergencyId) {
      try {
        const estimatedArrival = new Date(Date.now() + 15 * 60000).toISOString(); // 15 minutes estimated arrival
        await emergencyService.assignAmbulance(
          emergencyId,
          stats.fastest.id,
          estimatedArrival
        );
        
        setSearchStatus({ 
          message: `✅ ${stats.fastest.id} dispatched! Proceeding to hospital selection...`, 
          type: 'success' 
        });
        toast.success(`${stats.fastest.id} dispatched successfully!`);
      } catch (error) {
        // Error assigning ambulance - continue anyway since data is saved in context and localStorage
        setSearchStatus({ 
          message: `${stats.fastest.id} selected. Proceeding to hospital selection...`, 
          type: 'success' 
        });
        toast.warning('Ambulance selected (assignment not confirmed with server)');
      }
    } else {
      setSearchStatus({ 
        message: `${stats.fastest.id} selected. Proceeding to hospital selection...`, 
        type: 'success' 
      });
      toast.success(`${stats.fastest.id} selected!`);
    }
    
    setWorkflowStep('hospital');
    setTimeout(() => navigate('/hospital'), 1500);
  };

  const availableAmbulances = userLoc
    ? ambulances.filter(amb => amb.distance <= 5 && amb.status === 'available').sort((a, b) => a.distance - b.distance)
    : [];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="container mx-auto px-4 py-8">
        {/* HEADER */}
        <div className="text-center text-white mb-8">
          <h1 className="text-4xl font-bold mb-3">Live Ambulance Dashboard</h1>
          <p className="text-xl">Enter your location to find available ambulances nearby</p>
        </div>

        {/* SEARCH SECTION */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="bg-white bg-opacity-95 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-semibold text-blue-600 mb-6 text-center">Enter Your Location</h3>
            <div className="flex gap-3 flex-wrap">
              <input
                type="text"
                value={placeSearch}
                onChange={(e) => setPlaceSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                disabled={searchLoading}
                className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="Enter place name e.g., Connaught Place Delhi, Bandra Mumbai, etc."
              />
              <button 
                onClick={handleSearch} 
                disabled={searchLoading}
                className="px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {searchLoading ? 'Searching...' : 'Search'}
              </button>
              <button 
                onClick={handleDemo} 
                disabled={searchLoading}
                className="px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 text-lg font-semibold rounded-lg hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Demo
              </button>
            </div>
            {searchLoading && (
              <div className="mt-4">
                <LoadingSpinner size="sm" message="" />
              </div>
            )}
            {searchStatus.message && !searchLoading && (
              <div className={`mt-4 p-4 rounded-lg font-bold text-center ${
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

        {/* STATS PANEL */}
        {userLoc && (
          <div className="max-w-5xl mx-auto mb-8">
            <div className="rounded-2xl p-8 text-white shadow-xl" style={{ background: 'linear-gradient(135deg, #00b894, #00cec9)' }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{stats.total}</div>
                  <div>Total Nearby (5km)</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2" style={{ color: '#00ff88', textShadow: '0 0 10px #00ff88' }}>
                    {stats.available}
                  </div>
                  <div><strong>AVAILABLE</strong></div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2 text-yellow-300">{stats.enroute}</div>
                  <div>En Route</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2 animate-pulse">
                    {stats.fastest ? stats.fastest.id : '-'}
                  </div>
                  <div>{stats.fastest ? `${stats.fastest.distance.toFixed(1)} km` : '-'}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MAP & LIST */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* MAP */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-xl">
            <h4 className="text-xl font-semibold mb-4">Live Tracking Map</h4>
            <div style={{ height: '500px', borderRadius: '10px', overflow: 'hidden' }}>
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
                        <h6 className="font-bold">{amb.id}</h6>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                          amb.status === 'available' ? 'bg-green-500 text-white' :
                          amb.status === 'enroute' ? 'bg-yellow-500 text-black' :
                          'bg-red-500 text-white'
                        }`}>
                          {amb.status.toUpperCase()}
                        </span>
                        {userLoc && amb.distance && (
                          <div className="font-bold mt-1">{amb.distance.toFixed(1)} km away</div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* AMBULANCE LIST */}
          <div className="bg-white p-6 rounded-2xl shadow-xl">
            <h4 className="text-xl font-semibold mb-4">Available Ambulances</h4>
            <div className="space-y-3 overflow-y-auto" style={{ maxHeight: '500px' }}>
              {initialLoading ? (
                <LoadingSpinner size="md" message="Loading ambulances..." />
              ) : availableAmbulances.length === 0 ? (
                <EmptyState
                  icon="🚑"
                  title={userLoc ? "No Ambulances Nearby" : "Search Your Location"}
                  message={userLoc ? "No available ambulances found within 5km of your location." : "Enter your location to find available ambulances nearby."}
                />
              ) : (
                availableAmbulances.map((amb, index) => (
                  <div
                    key={amb.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      index === 0
                        ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-red-500'
                        : 'bg-green-50 border-green-500'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-bold text-lg flex items-center gap-2">
                          {amb.id}
                          <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">AVAILABLE</span>
                          {index === 0 && <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">FASTEST</span>}
                        </h5>
                        <small className="text-gray-600">Live tracking active</small>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-xl text-green-600">{amb.distance.toFixed(1)} km away</div>
                        <button 
                          onClick={() => alert(`Calling ambulance ${amb.id}...`)}
                          className="mt-2 bg-green-500 text-white px-4 py-1 rounded text-sm hover:bg-green-600 transition"
                        >
                          CALL NOW
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ACCEPT BUTTON */}
        <div className="text-center">
          <button
            onClick={handleAcceptAmbulance}
            disabled={!stats.fastest}
            className={`px-12 py-4 text-xl font-bold rounded-full transition shadow-lg ${
              stats.fastest
                ? 'bg-green-500 text-white hover:bg-green-600 cursor-pointer animate-pulse'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
            title={!stats.fastest ? 'Search for your location first' : `Dispatch ${stats.fastest.id}`}
          >
            {stats.fastest 
              ? `✅ ACCEPT & DISPATCH ${stats.fastest.id}` 
              : '🔍 Search Location First'}
          </button>
          {stats.fastest && (
            <p className="mt-4 text-white text-lg">
              📍 {stats.fastest.distance.toFixed(1)} km away • ⏱️ ~{Math.ceil(stats.fastest.distance * 4)} min ETA
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
