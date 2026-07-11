import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useWorkflow } from '../context/WorkflowContext';
import { hospitalService } from '../services/hospitalService';
import { emergencyService } from '../services/emergencyService';
import { useToast } from '../components/ToastContainer';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const createIcon = (html, size = [60, 75]) => L.divIcon({
  html,
  className: '',
  iconSize: size,
  iconAnchor: [size[0] / 2, size[1]],
});

const icons = {
  patient: createIcon('🚨<div style="background:#e74c3c;color:white;font-weight:bold;padding:4px 10px;border-radius:12px;font-size:12px;margin-top:5px;text-align:center;">PATIENT</div>', [55, 70]),
  hospital: createIcon('🏥<div style="background:#27ae60;color:white;font-weight:bold;padding:4px 10px;border-radius:12px;font-size:12px;margin-top:5px;text-align:center;">DOCTORS</div>', [60, 75]),
  selected: createIcon('⭐<div style="background:#f39c12;color:white;font-weight:bold;padding:4px 12px;border-radius:12px;font-size:12px;margin-top:5px;text-align:center;">SELECTED</div>', [65, 80]),
};

function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 12);
    }
  }, [center, zoom, map]);
  return null;
}

export default function Hospital() {
  const navigate = useNavigate();
  const { selectedHospital, setSelectedHospital, setWorkflowStep } = useWorkflow();
  const toast = useToast();
  
  const [hospitalSelect, setHospitalSelect] = useState('');
  const [patientLocation, setPatientLocation] = useState('');
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });
  const [patientMarker, setPatientMarker] = useState(null);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [selectedId, setSelectedId] = useState(selectedHospital?.id || null);
  const [stats, setStats] = useState({ total: 0, doctors: 0 });
  const [mapCenter, setMapCenter] = useState([12.9716, 77.5946]);
  const [mapZoom, setMapZoom] = useState(12);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all hospitals from API
  const fetchHospitals = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await hospitalService.getAll();
      
      // Transform API data to match existing format
      const transformedHospitals = data.hospitals.map(hosp => ({
        id: hosp._id || hosp.id,
        name: hosp.name,
        lat: hosp.location?.coordinates[1] || 0,
        lng: hosp.location?.coordinates[0] || 0,
        doctors: hosp.capacity?.availableDoctors || 3,
        beds: hosp.capacity?.availableBeds || 10,
        ambulances: hosp.capacity?.availableAmbulances || 2,
      }));
      
      setHospitals(transformedHospitals);
      toast.success(`Loaded ${transformedHospitals.length} hospitals`);
    } catch {
      const errorMsg = 'Failed to load hospitals. Using demo data.';
      setError(errorMsg);
      toast.warning(errorMsg);
      
      // Fallback to mock data
      const fallbackHospitals = [
        { id: 'H001', name: 'Apollo Hospital', lat: 12.907, lng: 77.597, doctors: 3 },
        { id: 'H002', name: 'Manipal Hospital', lat: 12.95, lng: 77.62, doctors: 2 },
        { id: 'H003', name: 'Sakra World Hospital', lat: 12.925, lng: 77.71, doctors: 4 },
        { id: 'H004', name: 'Fortis Hospital', lat: 12.91, lng: 77.6, doctors: 3 },
        { id: 'H005', name: 'Columbia Asia', lat: 12.9698, lng: 77.75, doctors: 2 },
        { id: 'H006', name: 'Vydehi Hospital', lat: 12.98, lng: 77.74, doctors: 4 },
        { id: 'H007', name: 'Sparsh Hospital', lat: 12.99, lng: 77.59, doctors: 3 },
      ];
      setHospitals(fallbackHospitals);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const selectHospital = (hospitalId) => {
    const hospital = hospitals.find(h => h.id === hospitalId);
    if (!hospital) {
      setStatusMsg({ text: 'Hospital not found. Please try again.', type: 'danger' });
      toast.error('Hospital not found. Please try again.');
      return;
    }

    setSelectedId(hospitalId);
    setSelectedHospital(hospital);
    setMapCenter([hospital.lat, hospital.lng]);
    setMapZoom(14);
    
    // Save hospital data to localStorage
    localStorage.setItem('selected_hospital_id', hospitalId);
    localStorage.setItem('selected_hospital', JSON.stringify(hospital));
    
    setStats(prev => ({
      ...prev,
      total: nearbyHospitals.length > 0 ? nearbyHospitals.length : hospitals.length,
    }));

    setStatusMsg({
      text: `✅ ${hospital.name} selected! Click ACCEPT to confirm.`,
      type: 'success',
    });
    toast.success(`${hospital.name} selected!`);
  };

  const handleDirectSelect = () => {
    if (!hospitalSelect) {
      setStatusMsg({ text: 'Please select a hospital from dropdown', type: 'warning' });
      toast.warning('Please select a hospital from dropdown');
      return;
    }
    selectHospital(hospitalSelect);
  };

  const handleSearchHospitals = async () => {
    if (!patientLocation.trim()) {
      setStatusMsg({ text: 'Please enter patient location.', type: 'warning' });
      toast.warning('Please enter patient location');
      return;
    }

    setStatusMsg({ text: '🔍 Finding nearby hospitals...', type: 'info' });
    toast.info('Finding nearby hospitals...');

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          patientLocation + ', Bangalore, India'
        )}&limit=1&countrycodes=in&viewbox=77.4,12.8,77.8,13.2&bounded=1`
      );
      const data = await res.json();

      if (!data[0]) {
        setStatusMsg({
          text: "Location not found. Try 'Koramangala' or 'Whitefield'.",
          type: 'danger',
        });
        toast.error("Location not found. Try 'Koramangala' or 'Whitefield'");
        return;
      }

      const lat = parseFloat(data[0].lat);
      const lng = parseFloat(data[0].lon);

      if (lat < 12.8 || lat > 13.2 || lng < 77.4 || lng > 77.8) {
        setStatusMsg({ text: 'Please enter a Bangalore location.', type: 'danger' });
        toast.error('Please enter a Bangalore location');
        return;
      }

      setPatientMarker({ lat, lng });
      setMapCenter([lat, lng]);
      setMapZoom(12);

      // Calculate distances
      const hospitalsWithDistance = hospitals.map(h => ({
        ...h,
        distance: calculateDistance(lat, lng, h.lat, h.lng),
      }));

      const nearby = hospitalsWithDistance
        .filter(h => h.distance <= 12 && h.doctors > 0)
        .sort((a, b) => a.distance - b.distance);

      setNearbyHospitals(nearby);
      setStats({
        total: nearby.length,
        doctors: nearby.reduce((sum, h) => sum + h.doctors, 0),
      });

      setStatusMsg({
        text: `${nearby.length} hospitals found. Click ONE to select.`,
        type: 'success',
      });
      toast.success(`Found ${nearby.length} hospitals nearby`);
    } catch {
      setStatusMsg({ text: 'Error finding location. Please try again.', type: 'danger' });
      toast.error('Error finding location. Please try again.');
    }
  };

  const handleAccept = async () => {
    if (!selectedId) {
      setStatusMsg({ text: 'Please select ONE hospital first!', type: 'warning' });
      toast.warning('Please select ONE hospital first!');
      return;
    }

    const hospital = hospitals.find(h => h.id === selectedId);
    if (!hospital) {
      setStatusMsg({ text: 'Selected hospital not found. Please select again.', type: 'danger' });
      toast.error('Selected hospital not found. Please select again.');
      return;
    }

    setStatusMsg({
      text: `🎉 ${hospital.name} ACCEPTED! Ambulance dispatched. ${hospital.doctors} doctors ready.`,
      type: 'success',
    });
    toast.success(`${hospital.name} accepted! Ambulance dispatched.`);

    // Save to workflow context
    setSelectedHospital(hospital);
    setWorkflowStep('vitals');

    // Assign hospital to emergency if emergency exists in workflow
    const emergencyId = localStorage.getItem('current_emergency_id');
    if (emergencyId) {
      try {
        await emergencyService.assignHospital(emergencyId, selectedId);
        toast.success('Hospital assignment confirmed');
      } catch (error) {
        // Error assigning hospital - continue since data is saved in context
        toast.warning('Proceeding (hospital assignment not confirmed with server)');
        // Continue anyway since it's saved in context
      }
    }

    setTimeout(() => navigate('/vitals'), 1500);
  };

  const hospitalsToDisplay = nearbyHospitals.length > 0 ? nearbyHospitals : [];

  return (
    <div className="min-h-screen py-8" style={{ background: 'linear-gradient(135deg, #00b894 0%, #00cec9 100%)' }}>
      <div className="container mx-auto px-4">
        {/* HEADER */}
        <h1 className="text-4xl font-bold text-white text-center mb-2">🏥 Bangalore Emergency Hospitals</h1>
        <p className="text-white text-center text-xl mb-8">Choose hospital directly OR enter location → Select ONE → Accept</p>

        {/* CONTROL PANEL */}
        <div className="max-w-5xl mx-auto bg-white bg-opacity-95 rounded-3xl p-8 shadow-2xl mb-8">
          {loading ? (
            <LoadingSpinner size="lg" message="Loading hospitals..." />
          ) : error ? (
            <ErrorState 
              title="Error Loading Hospitals"
              message={error}
              onRetry={fetchHospitals}
            />
          ) : hospitals.length === 0 ? (
            <EmptyState
              icon="🏥"
              title="No Hospitals Available"
              message="No hospitals found in the system. Please try again later."
              action={
                <button
                  onClick={fetchHospitals}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                >
                  Retry
                </button>
              }
            />
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-lg font-bold text-gray-800 mb-3">🏥 Choose Hospital Directly</label>
              <select
                value={hospitalSelect}
                onChange={(e) => setHospitalSelect(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">-- Select Any Hospital --</option>
                {hospitals.map(hosp => (
                  <option key={hosp.id} value={hosp.id}>
                    {hosp.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-lg font-bold text-gray-800 mb-3">📍 OR Patient Location</label>
              <input
                type="text"
                value={patientLocation}
                onChange={(e) => setPatientLocation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchHospitals()}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Koramangala, Whitefield, etc."
              />
            </div>
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={handleDirectSelect}
              className="px-8 py-4 bg-green-500 text-white text-lg font-bold rounded-lg hover:bg-green-600 transition"
            >
              ✅ SELECT CHOSEN HOSPITAL
            </button>
            <button
              onClick={handleSearchHospitals}
              className="px-8 py-4 bg-red-500 text-white text-lg font-bold rounded-lg hover:bg-red-600 transition"
            >
              🚨 FIND NEARBY HOSPITALS
            </button>
          </div>

          {statusMsg.text && (
            <div
              className={`mt-6 p-4 rounded-lg font-bold text-center ${
                statusMsg.type === 'success' ? 'bg-green-100 text-green-800' :
                statusMsg.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                statusMsg.type === 'info' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
              }`}
            >
              {statusMsg.text}
            </div>
          )}
            </>
          )}
        </div>

        {/* STATS PANEL */}
        {stats.total > 0 && (
          <div className="max-w-5xl mx-auto rounded-2xl p-8 mb-8 text-white shadow-xl" style={{ background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)' }}>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">{stats.total}</div>
                <span>Nearby Hospitals</span>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">{stats.doctors}</div>
                <span>Available Doctors</span>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">{selectedId ? hospitals.find(h => h.id === selectedId)?.name : 'None'}</div>
                <span>✅ Selected</span>
              </div>
            </div>
          </div>
        )}

        {/* MAP */}
        <div className="max-w-5xl mx-auto mb-8" style={{ height: '600px', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)' }}>
          <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater center={mapCenter} zoom={mapZoom} />

            {patientMarker && (
              <Marker position={[patientMarker.lat, patientMarker.lng]} icon={icons.patient}>
                <Popup>🚨 Patient Location</Popup>
              </Marker>
            )}

            {hospitalsToDisplay.map(hosp => (
              <Marker
                key={hosp.id}
                position={[hosp.lat, hosp.lng]}
                icon={selectedId === hosp.id ? icons.selected : icons.hospital}
                eventHandlers={{
                  click: () => selectHospital(hosp.id),
                }}
              >
                <Popup>
                  🏥 {hosp.name}<br />
                  {hosp.distance && `Distance: ${hosp.distance.toFixed(1)} km`}<br />
                  Doctors: {hosp.doctors}
                </Popup>
              </Marker>
            ))}

            {/* Show all hospitals if no search performed */}
            {hospitalsToDisplay.length === 0 && hospitals.map(hosp => (
              <Marker
                key={hosp.id}
                position={[hosp.lat, hosp.lng]}
                icon={selectedId === hosp.id ? icons.selected : icons.hospital}
                eventHandlers={{
                  click: () => selectHospital(hosp.id),
                }}
              >
                <Popup>
                  🏥 {hosp.name}<br />
                  Doctors: {hosp.doctors}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* HOSPITAL LIST */}
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h4 className="text-2xl font-bold text-red-600 text-center mb-6">👇 Click ONE Hospital to Select 👇</h4>
          <div className="space-y-4">
            {(hospitalsToDisplay.length > 0 ? hospitalsToDisplay : hospitals).map((hosp, index) => (
              <div
                key={hosp.id}
                onClick={() => selectHospital(hosp.id)}
                className={`p-6 rounded-xl cursor-pointer transition-all ${
                  selectedId === hosp.id
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-l-8 border-yellow-400 shadow-2xl'
                    : index === 0 && hospitalsToDisplay.length > 0
                    ? 'bg-gradient-to-r from-yellow-200 to-yellow-300 border-l-8 border-red-500 shadow-lg hover:shadow-xl'
                    : 'bg-gradient-to-r from-red-500 to-red-600 text-white border-l-8 border-red-700 hover:shadow-xl'
                } animate-pulse-slow`}
              >
                <div className="flex justify-content-between items-center">
                  <div>
                    <h5 className="text-xl font-bold mb-2">{hosp.name}</h5>
                    {hosp.distance && (
                      <div className="text-2xl font-bold mb-2">{hosp.distance.toFixed(1)} km away</div>
                    )}
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                      selectedId === hosp.id ? 'bg-white text-green-600' : 'bg-white bg-opacity-30'
                    }`}>
                      {hosp.doctors} Doctors
                    </span>
                  </div>
                  <button 
                    onClick={() => alert(`Calling ${hosp.name}...`)}
                    className="px-6 py-2 bg-white bg-opacity-90 text-gray-800 rounded-lg hover:bg-opacity-100 transition"
                  >
                    📞 Call
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ACCEPT BUTTON */}
        <div className="text-center">
          <button
            onClick={handleAccept}
            className={`px-12 py-4 text-xl font-bold rounded-full transition ${
              selectedId
                ? 'bg-green-500 text-white hover:bg-green-600 animate-bounce cursor-pointer'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
            disabled={!selectedId}
          >
            ✅ ACCEPT SELECTED HOSPITAL & DISPATCH
          </button>
        </div>
      </div>
    </div>
  );
}
