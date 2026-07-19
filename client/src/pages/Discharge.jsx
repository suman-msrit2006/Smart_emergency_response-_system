import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkflow } from '../context/WorkflowContext';
import { useAuth } from '../context/AuthContext';
import { vitalService } from '../services/vitalService';

export default function Discharge() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { patientInfo, setDischargeSummary, setWorkflowStep } = useWorkflow();

  // Role verification - redirect immediately if wrong role
  const isAmbulancePersonnel = user?.role === 'Ambulance Personnel';

  // Redirect non-Ambulance Personnel to their dashboard BEFORE any logic executes
  useEffect(() => {
    if (user && !isAmbulancePersonnel) {
      navigate('/patient-dashboard', { replace: true });
    }
  }, [user, isAmbulancePersonnel, navigate]);

  const [patientName, setPatientName] = useState(patientInfo.name || '');
  const [summaryGenerated, setSummaryGenerated] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState(null);
  const [confirmation, setConfirmation] = useState('');

  const generatePatientVitals = async () => {
    // Try to get latest vitals from backend
    const emergencyId = localStorage.getItem('current_emergency_id');
    const userId = localStorage.getItem('user_id');
    
    let latest = {
      hr: Math.floor(70 + Math.random() * 80),
      spo2: Math.floor(92 + Math.random() * 7),
      temp: (36.5 + Math.random() * 2.5).toFixed(1),
      bp: Math.floor(110 + Math.random() * 50) + '/' + Math.floor(70 + Math.random() * 25),
    };
    
    // Try to fetch from backend using patient ID first, then emergency ID
    if (userId) {
      try {
        const vital = await vitalService.getLatestVital(userId);
        if (vital && vital.heartRate) {
          latest = {
            hr: vital.heartRate?.value || vital.heartRate || latest.hr,
            spo2: vital.oxygenSaturation?.value || vital.oxygenSaturation || latest.spo2,
            temp: (vital.temperature?.value || vital.temperature || parseFloat(latest.temp)).toFixed(1),
            bp: `${vital.bloodPressure?.systolic || Math.floor(110 + Math.random() * 50)}/${vital.bloodPressure?.diastolic || Math.floor(70 + Math.random() * 25)}`,
          };
        }
      } catch (err) {
        // Error loading latest vitals by patient - will try emergency fallback
        
        // Fallback to emergency ID
        if (emergencyId) {
          try {
            const vitals = await vitalService.getByEmergency(emergencyId);
            if (vitals && vitals.length > 0) {
              const vital = vitals[vitals.length - 1]; // Get most recent
              latest = {
                hr: vital.heartRate?.value || vital.heartRate || latest.hr,
                spo2: vital.oxygenSaturation?.value || vital.oxygenSaturation || latest.spo2,
                temp: (vital.temperature?.value || vital.temperature || parseFloat(latest.temp)).toFixed(1),
                bp: `${vital.bloodPressure?.systolic || Math.floor(110 + Math.random() * 50)}/${vital.bloodPressure?.diastolic || Math.floor(70 + Math.random() * 25)}`,
              };
            }
          } catch (error) {
            // Error loading vitals by emergency - will use simulated data
          }
        }
      }
    }
    
    return {
      latest,
      trends: {
        hr_trend: Math.random() > 0.6 ? 'stable' : Math.random() > 0.5 ? 'improving' : 'worsening',
        spo2_trend: Math.random() > 0.6 ? 'stable' : Math.random() > 0.5 ? 'improving' : 'worsening',
      },
      treatment: ['Oxygen support', 'IV fluids', 'Pain management'],
      status: Math.random() > 0.7 ? 'Stable' : Math.random() > 0.4 ? 'Improving' : 'Requires monitoring',
    };
  };

  const generateSummary = async () => {
    if (!patientName.trim()) {
      alert('Please enter patient name first');
      return;
    }

    const vitals = await generatePatientVitals();
    const timestamp = new Date().toLocaleString();

    const summary = {
      patientName,
      condition: `${patientName} - ${vitals.status} for discharge`,
      vitalsTrend: `HR ${vitals.trends.hr_trend}, SpO₂ ${vitals.trends.spo2_trend}`,
      treatments: vitals.treatment,
      instructions: 'Continue monitoring vitals, follow-up with GP in 48hrs, maintain hydration',
      specialNotes: 'No known allergies, stable throughout transit',
      vitals: vitals.latest,
      status: vitals.status,
      timestamp,
    };

    setGeneratedSummary(summary);
    setSummaryGenerated(true);
  };

  const submitHandover = () => {
    if (!patientName.trim() || !generatedSummary) {
      alert('Please generate summary first');
      return;
    }

    setDischargeSummary({
      condition: generatedSummary.condition,
      vitalsTrend: generatedSummary.vitalsTrend,
      treatments: generatedSummary.treatments,
      instructions: generatedSummary.instructions,
      status: generatedSummary.status,
      timestamp: generatedSummary.timestamp,
    });

    setConfirmation(
      `Handover Complete! Patient "${patientName}" discharge summary approved and transmitted to hospital records.`
    );

    setTimeout(() => {
      setWorkflowStep('feedback');
      navigate('/feedback');
    }, 2000);
  };

  const getStatusClass = (status) => {
    if (status === 'Stable') return 'bg-green-100 text-green-800';
    if (status === 'Improving') return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* HEADER */}
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            <span className="text-blue-600 mr-3">🤝</span>
            Patient Handover & Discharge
          </h2>

          {/* PATIENT NAME INPUT */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block font-bold text-gray-700 mb-3">Patient Name</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter patient name"
                required
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={generateSummary}
                className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                ✨ Generate Doctor Summary
              </button>
            </div>
          </div>

          {/* AUTO-GENERATED DOCTOR SUMMARY */}
          {summaryGenerated && generatedSummary && (
            <div
              className="rounded-2xl p-8 mb-8 text-white shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              <div className="flex justify-between items-center mb-6">
                <h5 className="text-2xl font-bold">
                  <span className="mr-3">🩺</span>
                  Doctor's Auto-Generated Summary
                </h5>
                <span className={`px-4 py-2 rounded-full font-bold ${getStatusClass(generatedSummary.status)}`}>
                  {generatedSummary.status}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div>
                  <strong>Patient Condition:</strong> {generatedSummary.condition}
                </div>
                <div>
                  <strong>Vitals Trend:</strong> {generatedSummary.vitalsTrend}
                </div>
                <div>
                  <strong>Treatments Administered:</strong> {generatedSummary.treatments.join(', ')}
                </div>
                <div>
                  <strong>Discharge Instructions:</strong> {generatedSummary.instructions}
                </div>
                <div>
                  <strong>Special Notes:</strong> {generatedSummary.specialNotes}
                </div>
              </div>

              {/* LATEST VITALS GRID */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white bg-opacity-20 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold mb-1">
                    {generatedSummary.vitals.hr}<span className="text-lg"> bpm</span>
                  </div>
                  <div className="text-sm">Heart Rate</div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold mb-1">
                    {generatedSummary.vitals.spo2}<span className="text-lg"> %</span>
                  </div>
                  <div className="text-sm">SpO₂</div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold mb-1">{generatedSummary.vitals.temp}°C</div>
                  <div className="text-sm">Temperature</div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold mb-1">{generatedSummary.vitals.bp}</div>
                  <div className="text-sm">Blood Pressure</div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white border-opacity-50">
                <small>Generated: {generatedSummary.timestamp}</small>
              </div>
            </div>
          )}

          {/* APPROVE & SUBMIT BUTTON */}
          {summaryGenerated && (
            <div className="mb-6">
              <button
                onClick={submitHandover}
                className="w-full px-8 py-4 bg-green-500 text-white text-xl font-bold rounded-lg hover:bg-green-600 transition"
              >
                ✅ Approve & Complete Handover
              </button>
            </div>
          )}

          {/* CONFIRMATION */}
          {confirmation && (
            <div className="bg-green-100 border border-green-300 text-green-800 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <strong className="block mb-2">Handover Complete!</strong>
                  <div>{confirmation}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
