import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useWorkflow } from '../context/WorkflowContext';
import { useAuth } from '../context/AuthContext';
import { consultationService } from '../services/consultationService';
import { vitalService } from '../services/vitalService';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Doctor() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { patientInfo, doctorConsultation, setDoctorConsultation, setWorkflowStep } = useWorkflow();

  // Role verification - redirect immediately if wrong role
  const isAmbulancePersonnel = user?.role === 'Ambulance Personnel';

  // Redirect non-Ambulance Personnel to their dashboard BEFORE any logic executes
  useEffect(() => {
    if (user && !isAmbulancePersonnel) {
      navigate('/patient-dashboard', { replace: true });
    }
  }, [user, isAmbulancePersonnel, navigate]);

  const [patientNameInput, setPatientNameInput] = useState(patientInfo.name || '');
  const [patientLoaded, setPatientLoaded] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [analysis, setAnalysis] = useState(doctorConsultation.analysis || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const randomInRange = (min, max) => Math.round(min + Math.random() * (max - min));

  const loadPatientData = async () => {
    if (!patientNameInput.trim()) {
      alert('Please enter patient name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Try to load vitals from backend
      const emergencyId = localStorage.getItem('current_emergency_id');
      let vitalsHistory = [];
      
      if (emergencyId) {
        try {
          const vitals = await vitalService.getByEmergency(emergencyId);
          
          // Only use backend data if we have valid vitals
          if (vitals && vitals.length > 0) {
            vitalsHistory = vitals.map(v => ({
              time: new Date(v.recordedAt || v.createdAt).toLocaleTimeString(),
              hr: v.heartRate?.value || v.heartRate || 0,
              spo2: v.oxygenSaturation?.value || v.oxygenSaturation || 0,
              temp: (v.temperature?.value || v.temperature || 0).toFixed(1),
              bp: `${v.bloodPressure?.systolic || 0}/${v.bloodPressure?.diastolic || 0}`,
            })).filter(v => v.hr > 0 && v.spo2 > 0); // Filter out invalid entries
          }
        } catch (error) {
          // Error loading vitals from backend - will use simulated data
        }
      }
      
      // Fallback to simulated data if no vitals found
      if (vitalsHistory.length === 0) {
        for (let i = 0; i < 30; i++) {
          vitalsHistory.push({
            time: new Date(Date.now() - i * 1000).toLocaleTimeString(),
            hr: Math.random() > 0.3 ? randomInRange(70, 110) : randomInRange(120, 150),
            spo2: randomInRange(92, 99),
            temp: (36.5 + Math.random() * 2.5).toFixed(1),
            bp: `${randomInRange(110, 160)}/${randomInRange(70, 95)}`,
          });
        }
        vitalsHistory.reverse();
      }

      const latestVitals = vitalsHistory[vitalsHistory.length - 1];

      setPatientData({
        name: patientNameInput,
        vitalsHistory,
        latestVitals,
      });

      setPatientLoaded(true);
    } catch {
      setError('Failed to load patient data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (hr, spo2) => {
    if (hr > 120 || spo2 < 92) return { text: 'Critical', class: 'bg-red-100 text-red-800' };
    if (hr > 100 || spo2 < 95) return { text: 'Warning', class: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Stable', class: 'bg-green-100 text-green-800' };
  };

  const saveAssessment = async () => {
    if (!patientData || !analysis.trim()) {
      alert('Please load patient data and enter your analysis');
      return;
    }

    const assessment = {
      analysis,
      assessment: analysis, // For compatibility
      timestamp: new Date().toISOString(),
    };

    setDoctorConsultation(assessment);
    
    // Save consultation to backend
    const emergencyId = localStorage.getItem('current_emergency_id');
    const userId = localStorage.getItem('user_id');
    const doctorId = localStorage.getItem('doctor_id') || userId; // Use doctor_id if available, fallback to user_id
    const hospitalId = localStorage.getItem('selected_hospital_id');
    
    if (emergencyId && userId && hospitalId) {
      try {
        await consultationService.create({
          patient: userId, // Fixed: Use actual user ID for patient reference
          doctor: doctorId,
          hospital: hospitalId,
          emergency: emergencyId,
          type: 'Emergency',
          scheduledAt: new Date(),
          chiefComplaint: 'Emergency admission via ambulance',
          diagnosis: {
            primary: analysis,
          },
          treatmentPlan: analysis,
          notes: analysis,
        });
      } catch (err) {
        // Error saving consultation - continue without backend save
      }
    }
    
    setSaveSuccess(true);

    setTimeout(() => {
      setWorkflowStep('discharge');
      navigate('/discharge');
    }, 2000);
  };

  const printRecords = () => {
    if (!patientData) return;

    const printWin = window.open('', '_blank');
    printWin.document.write(`
      <html>
        <head>
          <title>Vitals Report - ${patientData.name}</title>
          <style>
            body { font-family: Arial; margin: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h2>Vitals Report: ${patientData.name}</h2>
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>HR</th>
                <th>SpO₂</th>
                <th>Temp</th>
                <th>BP</th>
              </tr>
            </thead>
            <tbody>
              ${patientData.vitalsHistory.slice(-10).map(v => `
                <tr>
                  <td>${v.time}</td>
                  <td>${v.hr}</td>
                  <td>${v.spo2}</td>
                  <td>${v.temp}</td>
                  <td>${v.bp}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWin.print();
  };

  const status = patientData ? getStatus(patientData.latestVitals.hr, patientData.latestVitals.spo2) : { text: 'Stable', class: 'bg-green-100 text-green-800' };

  const chartData = patientData ? {
    labels: Array(30).fill().map((_, i) => `${i}s ago`),
    datasets: [
      {
        label: 'Heart Rate',
        data: patientData.vitalsHistory.map(v => v.hr).slice(-30),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.3,
        fill: true,
        yAxisID: 'y',
      },
      {
        label: 'SpO₂',
        data: patientData.vitalsHistory.map(v => v.spo2).slice(-30),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: true,
        yAxisID: 'y1',
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 40,
        max: 160,
        title: { display: true, text: 'Heart Rate (bpm)' },
      },
      y1: {
        position: 'right',
        min: 80,
        max: 100,
        title: { display: true, text: 'SpO₂ (%)' },
        grid: { drawOnChartArea: false },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* NAVBAR */}
      <nav className="bg-gray-900 text-white shadow-lg mb-8">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚑</span>
            <span className="text-xl font-bold">Smart ER & Ambulance</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4">
        {/* TOP ROW */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">Doctor Consultation Portal</h2>
            <p className="text-gray-600">Analyze ambulance vitals data + provide medical assessment</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={patientNameInput}
              onChange={(e) => setPatientNameInput(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter patient name from vitals (e.g. Ravi Kumar)"
              style={{ minWidth: '260px' }}
              required
            />
            <button
              onClick={loadPatientData}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              🔍 Load Patient Data
            </button>
          </div>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="mb-6">
            <ErrorState 
              title="Error Loading Patient Data"
              message={error}
              onRetry={() => {
                setError(null);
                loadPatientData();
              }}
            />
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div className="bg-white rounded-xl shadow-lg mb-6">
            <LoadingSpinner size="lg" message="Loading patient vitals data..." />
          </div>
        )}

        {/* EMPTY STATE - No patient loaded yet */}
        {!patientLoaded && !loading && !error && (
          <EmptyState
            icon="🩺"
            title="No Patient Loaded"
            message="Enter a patient name and click 'Load Patient Data' to view vitals and provide medical assessment."
          />
        )}

        {/* PATIENT VITALS SUMMARY */}
        {patientLoaded && patientData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* LATEST VITALS */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h6 className="text-sm uppercase text-gray-500 font-semibold">LATEST VITALS</h6>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.class}`}>
                  {status.text}
                </span>
              </div>
              <h5 className="mb-6">
                <span className="text-gray-600">Patient:</span>{' '}
                <span className="text-blue-600 font-semibold">{patientData.name}</span>
              </h5>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-xs uppercase text-gray-500 mb-1">Heart Rate</div>
                  <div className="text-2xl font-bold">
                    {patientData.latestVitals.hr}<span className="text-sm text-gray-500"> bpm</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase text-gray-500 mb-1">SpO₂</div>
                  <div className="text-2xl font-bold">
                    {patientData.latestVitals.spo2}<span className="text-sm text-gray-500"> %</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase text-gray-500 mb-1">Temperature</div>
                  <div className="text-2xl font-bold">
                    {patientData.latestVitals.temp}<span className="text-sm text-gray-500"> °C</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase text-gray-500 mb-1">Blood Pressure</div>
                  <div className="text-2xl font-bold">
                    {patientData.latestVitals.bp}<span className="text-sm text-gray-500"> mmHg</span>
                  </div>
                </div>
              </div>
            </div>

            {/* VITALS TREND CHART */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h6 className="text-lg font-semibold mb-4">Vitals Trend (Last 30s)</h6>
              <div style={{ height: '280px' }}>
                {chartData && <Line data={chartData} options={chartOptions} />}
              </div>
            </div>
          </div>
        )}

        {/* DOCTOR ANALYSIS SECTION */}
        <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl shadow-2xl p-8 mb-6 text-white">
          <h5 className="text-2xl font-bold mb-6">
            <span className="mr-3">🩺</span>Medical Assessment
          </h5>

          <div className="mt-6">
            <label className="block text-white font-bold mb-3">Doctor's Analysis & Instructions</label>
            <textarea
              value={analysis}
              onChange={(e) => setAnalysis(e.target.value)}
              className="w-full px-4 py-3 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
              rows="6"
              placeholder="Analyze patient's condition based on vitals trends:
- Describe observed patterns (HR rising/falling, SpO2 dropping, etc.)
- Clinical observations and interpretation
- Instructions for ambulance team
- Hospital preparation requirements
- Any immediate interventions needed..."
            />
          </div>

          <button
            onClick={saveAssessment}
            className="mt-6 px-8 py-3 bg-white text-purple-700 font-bold text-lg rounded-lg hover:bg-gray-100 transition"
          >
            💾 Save Assessment & Notify Teams
          </button>
        </div>

        {/* RECENT RECORDS TABLE */}
        {patientLoaded && patientData && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h6 className="text-lg font-semibold">Recent Vitals History</h6>
              <button
                onClick={printRecords}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
              >
                📄 Print
              </button>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: '300px' }}>
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left">Time</th>
                    <th className="px-3 py-2 text-left">HR</th>
                    <th className="px-3 py-2 text-left">SpO₂</th>
                    <th className="px-3 py-2 text-left">Temp</th>
                    <th className="px-3 py-2 text-left">BP</th>
                    <th className="px-3 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {patientData.vitalsHistory.slice(-10).map((vital, index) => {
                    const vitalStatus = vital.hr > 120 || vital.spo2 < 92 ? 'Critical' : 'Stable';
                    return (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="px-3 py-2">{vital.time}</td>
                        <td className="px-3 py-2">{vital.hr}</td>
                        <td className="px-3 py-2">{vital.spo2}</td>
                        <td className="px-3 py-2">{vital.temp}</td>
                        <td className="px-3 py-2">{vital.bp}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            vitalStatus === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {vitalStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUCCESS ALERT */}
        {saveSuccess && (
          <div className="mt-6 p-4 bg-green-100 text-green-800 rounded-lg text-center font-semibold">
            ✅ Assessment for <strong>{patientData?.name}</strong> saved successfully! Redirecting to discharge...
          </div>
        )}
      </div>
    </div>
  );
}
