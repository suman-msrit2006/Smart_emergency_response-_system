import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkflow } from '../context/WorkflowContext';
import { hospitalService } from '../services/hospitalService';
import { emergencyService } from '../services/emergencyService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ToastContainer';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

export default function Hospital() {
  const navigate = useNavigate();
  const { selectedHospital, setSelectedHospital, setWorkflowStep } = useWorkflow();
  const { user } = useAuth();
  const toast = useToast();
  
  // Check user role
  const isAmbulancePersonnel = user?.role === 'Ambulance Personnel';
  const isPatient = user?.role === 'Patient' || !isAmbulancePersonnel;
  
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

  // MODERN REDESIGNED UI - AMBULANCE PERSONNEL VIEW
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* MODERN HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🏥 Hospital Selection
          </h1>
          <p className="text-lg text-gray-600">
            Find and select the most suitable hospital for emergency dispatch
          </p>
        </div>

        {/* MAIN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* LEFT: SEARCH PANEL (35-40%) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8 border border-gray-100">
              {/* Search Section */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center mr-2">
                    🔍
                  </span>
                  Find Hospital
                </h2>

                {loading ? (
                  <LoadingSpinner size="md" message="Loading hospitals..." />
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p className="text-red-600 text-sm">{error}</p>
                    <button
                      onClick={fetchHospitals}
                      className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Hospital Dropdown */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Select Hospital Directly
                      </label>
                      <select
                        value={hospitalSelect}
                        onChange={(e) => setHospitalSelect(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 transition"
                      >
                        <option value="">Choose a hospital...</option>
                        {hospitals.map(hosp => (
                          <option key={hosp.id} value={hosp.id}>
                            {hosp.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleDirectSelect}
                        disabled={!hospitalSelect}
                        className={`mt-3 w-full py-3 rounded-lg font-semibold transition-all ${
                          hospitalSelect
                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        ✓ Select This Hospital
                      </button>
                    </div>

                    {/* OR Divider */}
                    <div className="flex items-center my-6">
                      <div className="flex-1 border-t border-gray-300"></div>
                      <span className="px-4 text-sm font-medium text-gray-500">OR</span>
                      <div className="flex-1 border-t border-gray-300"></div>
                    </div>

                    {/* Location Search */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Search by Patient Location
                      </label>
                      <input
                        type="text"
                        value={patientLocation}
                        onChange={(e) => setPatientLocation(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearchHospitals()}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition"
                        placeholder="e.g., Koramangala, Whitefield..."
                      />
                      <button
                        onClick={handleSearchHospitals}
                        disabled={!patientLocation.trim()}
                        className={`mt-3 w-full py-3 rounded-lg font-semibold transition-all ${
                          patientLocation.trim()
                            ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-md hover:shadow-lg'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        🔍 Find Nearby Hospitals
                      </button>
                    </div>

                    {/* Status Message */}
                    {statusMsg.text && (
                      <div
                        className={`mt-4 p-3 rounded-lg text-sm font-medium ${
                          statusMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                          statusMsg.type === 'warning' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                          statusMsg.type === 'info' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {statusMsg.text}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Summary Stats Card */}
              {hospitals.length > 0 && (
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5 text-white shadow-md">
                  <h3 className="text-sm font-semibold opacity-90 mb-3">Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm opacity-90">Total Hospitals</span>
                      <span className="text-2xl font-bold">{hospitals.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm opacity-90">Nearby Results</span>
                      <span className="text-2xl font-bold">{stats.total || '-'}</span>
                    </div>
                    <div className="border-t border-white border-opacity-20 pt-3">
                      <span className="text-xs opacity-75 block mb-1">Selected Hospital</span>
                      <span className="text-sm font-semibold block truncate">
                        {selectedId ? hospitals.find(h => h.id === selectedId)?.name : 'None'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: HOSPITAL LIST (60-65%) */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                🏥 Available Hospitals
              </h2>
              <p className="text-gray-600 text-sm">
                Click on a hospital card to select it for dispatch
              </p>
            </div>

            {loading ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <LoadingSpinner size="lg" message="Loading hospitals..." />
              </div>
            ) : hospitals.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12">
                <EmptyState
                  icon="🏥"
                  title="No Hospitals Available"
                  message="No hospitals found in the system."
                />
              </div>
            ) : (
              <>
                {/* Hospital Cards */}
                <div className="space-y-4 mb-6 max-h-[600px] overflow-y-auto pr-2">
                  {(hospitalsToDisplay.length > 0 ? hospitalsToDisplay : hospitals).map((hosp, index) => {
                    const isSelected = selectedId === hosp.id;
                    const isNearest = index === 0 && hospitalsToDisplay.length > 0;
                    
                    return (
                      <div
                        key={hosp.id}
                        onClick={() => selectHospital(hosp.id)}
                        className={`bg-white rounded-xl p-5 border-2 cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${
                          isSelected
                            ? 'border-green-500 bg-green-50 shadow-lg'
                            : isNearest
                            ? 'border-orange-300 shadow-md'
                            : 'border-gray-200 hover:border-blue-300 shadow-sm'
                        }`}
                      >
                        {/* Header Row */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-1">
                              {hosp.name}
                            </h3>
                            {/* Badges */}
                            <div className="flex flex-wrap gap-2 mt-2">
                              {isSelected && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  ✓ Selected
                                </span>
                              )}
                              {isNearest && !isSelected && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                  ⭐ Nearest
                                </span>
                              )}
                              {hosp.doctors > 0 && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  🟢 Available
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              alert(`Calling ${hosp.name}...`);
                            }}
                            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold shadow-sm"
                          >
                            📞 Call
                          </button>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-100">
                          {hosp.distance && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Distance</p>
                              <p className="text-sm font-bold text-gray-900">
                                📍 {hosp.distance.toFixed(1)} km
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Select Button */}
                        {!isSelected && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              selectHospital(hosp.id);
                            }}
                            className="mt-4 w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-sm shadow-sm"
                          >
                            ✓ Select This Hospital
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Accept Button */}
                <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent pt-6 pb-2">
                  <button
                    onClick={handleAccept}
                    disabled={!selectedId}
                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-200 ${
                      selectedId
                        ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-2xl hover:scale-[1.02]'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {selectedId ? '✅ Accept Selected Hospital & Dispatch' : '⚠️ Please Select a Hospital First'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
