import { useState, useEffect, useRef } from 'react';
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
import { vitalService } from '../services/vitalService';

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

const MAX_POINTS = 30;

export default function Vitals() {
  const navigate = useNavigate();
  const { patientInfo, updatePatientInfo, vitalsData, updateVitals, toggleVitalsMonitoring, setWorkflowStep } = useWorkflow();

  const [patientName, setPatientName] = useState(patientInfo.name || '');
  const [currentVitals, setCurrentVitals] = useState({
    hr: '--',
    spo2: '--',
    temp: '--',
    bp: '--/--',
  });
  const [status, setStatus] = useState({ text: 'Stable', class: 'bg-green-100 text-green-800' });
  const [monitoring, setMonitoring] = useState(vitalsData.monitoring || false);
  const [chartData, setChartData] = useState({
    labels: Array.from({ length: MAX_POINTS }, (_, i) => `-${MAX_POINTS - i}s`),
    datasets: [
      {
        label: 'Heart Rate (bpm)',
        data: Array(MAX_POINTS).fill(null),
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        tension: 0.3,
        fill: true,
        yAxisID: 'y',
      },
      {
        label: 'SpO₂ (%)',
        data: Array(MAX_POINTS).fill(null),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.12)',
        tension: 0.3,
        fill: true,
        yAxisID: 'y1',
      },
    ],
  });
  const [records, setRecords] = useState([]);
  const timerRef = useRef(null);

  const randomInRange = (min, max) => Math.round(min + Math.random() * (max - min));

  const updateStatus = (hr, spo2, temp) => {
    let statusText = 'Stable';
    let statusClass = 'bg-green-100 text-green-800';
    if (hr > 120 || hr < 50 || spo2 < 92 || temp > 39) {
      statusText = 'Critical';
      statusClass = 'bg-red-100 text-red-800';
    } else if (hr > 100 || spo2 < 95 || temp > 37.8) {
      statusText = 'Warning';
      statusClass = 'bg-yellow-100 text-yellow-800';
    }
    setStatus({ text: statusText, class: statusClass });
    return statusText;
  };

  const pushData = async () => {
    const hr = randomInRange(70, 120);
    const spo2 = randomInRange(93, 99);
    const temp = (36.5 + Math.random() * 2).toFixed(1);
    const sys = randomInRange(100, 150);
    const dia = randomInRange(60, 95);
    const bp = `${sys}/${dia}`;

    setCurrentVitals({ hr, spo2, temp, bp });

    const statusText = updateStatus(hr, spo2, temp);

    // Update chart
    setChartData(prev => {
      const newHrData = [...prev.datasets[0].data, hr];
      const newSpo2Data = [...prev.datasets[1].data, spo2];
      
      if (newHrData.length > MAX_POINTS) {
        newHrData.shift();
        newSpo2Data.shift();
      }

      return {
        ...prev,
        datasets: [
          { ...prev.datasets[0], data: newHrData },
          { ...prev.datasets[1], data: newSpo2Data },
        ],
      };
    });

    // Update context
    updateVitals({
      heartRate: hr,
      spo2,
      temperature: parseFloat(temp),
      bloodPressure: { systolic: sys, diastolic: dia },
    });

    // Save to backend API
    const emergencyId = localStorage.getItem('current_emergency_id');
    const userId = localStorage.getItem('user_id');
    if (emergencyId && userId) {
      try {
        await vitalService.create({
          patient: userId, // Use actual user ID for patient reference
          emergency: emergencyId,
          heartRate: {
            value: hr,
            unit: 'bpm',
          },
          bloodPressure: {
            systolic: sys,
            diastolic: dia,
            unit: 'mmHg',
          },
          temperature: {
            value: parseFloat(temp),
            unit: 'C', // Fixed: Changed from 'F' to 'C' to match display
          },
          oxygenSaturation: {
            value: spo2,
            unit: '%',
          },
          location: 'Ambulance',
        });
      } catch (error) {
        // Failed to save vitals to backend - continue monitoring
      }
    }

    // Add to records table
    const now = new Date();
    const timeStr = now.toLocaleTimeString();
    const patient = patientName || 'Unknown';
    
    setRecords(prev => [
      { time: timeStr, patient, hr, spo2, temp, bp, status: statusText },
      ...prev,
    ]);
  };

  const startMonitoring = () => {
    const name = patientName.trim();
    updatePatientInfo({ name: name === '' ? 'Unknown patient' : name });
    
    setMonitoring(true);
    toggleVitalsMonitoring(true);
    timerRef.current = setInterval(pushData, 1000);
  };

  const stopMonitoring = () => {
    setMonitoring(false);
    toggleVitalsMonitoring(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const clearTable = () => {
    setRecords([]);
  };

  const handleDoctorPortal = () => {
    setWorkflowStep('doctor');
    navigate('/doctor');
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
    },
    scales: {
      y: {
        title: { display: true, text: 'Heart Rate (bpm)' },
        min: 40,
        max: 160,
      },
      y1: {
        position: 'right',
        title: { display: true, text: 'SpO₂ (%)' },
        min: 80,
        max: 100,
        grid: { drawOnChartArea: false },
      },
      x: {
        ticks: { display: false },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* NAVBAR */}
      <nav className="bg-gray-900 text-white shadow-lg mb-8">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🚑</span>
              <span className="text-xl font-bold">IOT Vitals</span>
            </div>
            <ul className="flex gap-6">
              <li><button onClick={() => navigate('/vitals')} className="hover:text-blue-400 transition">IoT Vitals</button></li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4">
        {/* TOP ROW */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">IoT Vital Monitoring</h2>
            <p className="text-gray-600">
              Simulated real-time vitals from wearable sensors inside the ambulance (heart rate, SpO₂, temperature, blood pressure).
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter patient name (e.g. Unknown Male 30yrs)"
              style={{ minWidth: '260px' }}
            />
            <button
              onClick={monitoring ? stopMonitoring : startMonitoring}
              className={`px-6 py-2 font-semibold rounded-lg transition ${
                monitoring
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {monitoring ? '⏹ Stop Monitoring' : '▶ Start Monitoring'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* VITALS CARD */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h6 className="text-sm uppercase text-gray-500 font-semibold">Current Patient</h6>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.class}`}>
                  {status.text}
                </span>
              </div>
              <h5 className="mb-2">
                <span className="text-gray-600">Name:</span>{' '}
                <span className="text-blue-600 font-semibold">
                  {patientName || 'Not set'}
                </span>
              </h5>
              <h6 className="text-gray-600 text-sm mb-6">
                Live stream from ambulance IoT hub – updated every second (simulated).
              </h6>

              <div className="border-t pt-6 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xs uppercase text-gray-500 mb-1">Heart Rate</div>
                    <div className="text-2xl font-bold">
                      {currentVitals.hr}<span className="text-sm text-gray-500"> bpm</span>
                    </div>
                  </div>
                  <span className="text-4xl text-red-500">❤️</span>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xs uppercase text-gray-500 mb-1">SpO₂</div>
                    <div className="text-2xl font-bold">
                      {currentVitals.spo2}<span className="text-sm text-gray-500"> %</span>
                    </div>
                  </div>
                  <span className="text-4xl text-blue-500">🫁</span>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xs uppercase text-gray-500 mb-1">Temperature</div>
                    <div className="text-2xl font-bold">
                      {currentVitals.temp}<span className="text-sm text-gray-500"> °C</span>
                    </div>
                  </div>
                  <span className="text-4xl text-yellow-500">🌡️</span>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xs uppercase text-gray-500 mb-1">Blood Pressure</div>
                    <div className="text-2xl font-bold">
                      {currentVitals.bp}<span className="text-sm text-gray-500"> mmHg</span>
                    </div>
                  </div>
                  <span className="text-4xl text-green-500">🩺</span>
                </div>

                {/* DOCTOR PORTAL BUTTON */}
                <div className="pt-4">
                  <button
                    onClick={handleDoctorPortal}
                    className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                  >
                    Doctor Consultation Portal
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              In a real deployment, these values are pushed from IoT devices via MQTT/WebSocket to the hospital dashboard and stored in the EMR for later review.
            </div>
          </div>

          {/* CHART + SAVED RECORDS */}
          <div className="lg:col-span-2">
            {/* CHART */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h5 className="text-xl font-semibold">Real-Time Vitals Graph</h5>
                <span className="text-sm text-gray-500">Last 30 seconds</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Shows heart rate and SpO₂ trend; helps doctors detect sudden deterioration in transit.
              </p>
              <div style={{ height: '280px' }}>
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* SAVED RECORDS */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h5 className="text-xl font-semibold">Saved Records (Local)</h5>
                <button
                  onClick={clearTable}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
                >
                  Clear Table
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Every second a new reading is logged with timestamp and patient name. Doctors can scroll, take a screenshot, or copy this table to Excel for reference.
              </p>
              <div className="overflow-y-auto" style={{ maxHeight: '220px' }}>
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left">Time</th>
                      <th className="px-3 py-2 text-left">Patient</th>
                      <th className="px-3 py-2 text-left">HR (bpm)</th>
                      <th className="px-3 py-2 text-left">SpO₂ (%)</th>
                      <th className="px-3 py-2 text-left">Temp (°C)</th>
                      <th className="px-3 py-2 text-left">BP (mmHg)</th>
                      <th className="px-3 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="px-3 py-2">{record.time}</td>
                        <td className="px-3 py-2">{record.patient}</td>
                        <td className="px-3 py-2">{record.hr}</td>
                        <td className="px-3 py-2">{record.spo2}</td>
                        <td className="px-3 py-2">{record.temp}</td>
                        <td className="px-3 py-2">{record.bp}</td>
                        <td className="px-3 py-2">{record.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
