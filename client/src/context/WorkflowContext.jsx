import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const WorkflowContext = createContext();

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within WorkflowProvider');
  }
  return context;
};

export const WorkflowProvider = ({ children }) => {
  // Patient Information
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    age: null,
    gender: '',
    contactNumber: '',
  });

  // Emergency Request
  const [emergencyRequest, setEmergencyRequest] = useState(null);

  // Selected Ambulance
  const [selectedAmbulance, setSelectedAmbulance] = useState(null);

  // Selected Hospital
  const [selectedHospital, setSelectedHospital] = useState(null);

  // User Location
  const [userLocation, setUserLocation] = useState(null);

  // IoT Vitals Data
  const [vitalsData, setVitalsData] = useState({
    current: {
      heartRate: null,
      spo2: null,
      temperature: null,
      bloodPressure: { systolic: null, diastolic: null },
    },
    history: [],
    monitoring: false,
  });

  // Doctor Consultation
  const [doctorConsultation, setDoctorConsultation] = useState({
    analysis: '',
    assessment: '',
    timestamp: null,
  });

  // Discharge Summary
  const [dischargeSummary, setDischargeSummary] = useState({
    condition: '',
    vitalsTrend: '',
    treatments: [],
    instructions: '',
    status: '',
    timestamp: null,
  });

  // Patient Feedback
  const [feedback, setFeedback] = useState({
    rating: 0,
    comment: '',
    submitted: false,
    reference: null,
  });

  // Workflow Progress
  const [workflowStep, setWorkflowStep] = useState('home'); // home, emergency, hospital, vitals, doctor, discharge, feedback, complete

  // Update patient info
  const updatePatientInfo = useCallback((info) => {
    setPatientInfo((prev) => ({ ...prev, ...info }));
  }, []);

  // Update vitals
  const updateVitals = useCallback((vitals) => {
    setVitalsData((prev) => ({
      ...prev,
      current: { ...prev.current, ...vitals },
      history: [
        ...prev.history,
        {
          ...vitals,
          timestamp: new Date().toISOString(),
        },
      ].slice(-100), // Keep last 100 readings
    }));
  }, []);

  // Start/Stop Vitals Monitoring
  const toggleVitalsMonitoring = useCallback((status) => {
    setVitalsData((prev) => ({ ...prev, monitoring: status }));
  }, []);

  // Clear workflow (for new patient)
  const resetWorkflow = useCallback(() => {
    setPatientInfo({ name: '', age: null, gender: '', contactNumber: '' });
    setEmergencyRequest(null);
    setSelectedAmbulance(null);
    setSelectedHospital(null);
    setUserLocation(null);
    setVitalsData({
      current: {
        heartRate: null,
        spo2: null,
        temperature: null,
        bloodPressure: { systolic: null, diastolic: null },
      },
      history: [],
      monitoring: false,
    });
    setDoctorConsultation({ analysis: '', assessment: '', timestamp: null });
    setDischargeSummary({
      condition: '',
      vitalsTrend: '',
      treatments: [],
      instructions: '',
      status: '',
      timestamp: null,
    });
    setFeedback({ rating: 0, comment: '', submitted: false, reference: null });
    setWorkflowStep('home');
  }, []);

  // Persist to localStorage
  useEffect(() => {
    const savedWorkflow = localStorage.getItem('workflow_state');
    if (savedWorkflow) {
      try {
        const parsed = JSON.parse(savedWorkflow);
        setPatientInfo(parsed.patientInfo || { name: '', age: '', gender: '' });
        setSelectedAmbulance(parsed.selectedAmbulance || null);
        setSelectedHospital(parsed.selectedHospital || null);
        setWorkflowStep(parsed.workflowStep || 'home');
      } catch (error) {
        // Error loading workflow state - use defaults
      }
    }
  }, []);

  useEffect(() => {
    const stateToSave = {
      patientInfo,
      selectedAmbulance,
      selectedHospital,
      workflowStep,
    };
    localStorage.setItem('workflow_state', JSON.stringify(stateToSave));
  }, [patientInfo, selectedAmbulance, selectedHospital, workflowStep]);

  const value = useMemo(() => ({
    // State
    patientInfo,
    emergencyRequest,
    selectedAmbulance,
    selectedHospital,
    userLocation,
    vitalsData,
    doctorConsultation,
    dischargeSummary,
    feedback,
    workflowStep,

    // Actions
    updatePatientInfo,
    setEmergencyRequest,
    setSelectedAmbulance,
    setSelectedHospital,
    setUserLocation,
    updateVitals,
    toggleVitalsMonitoring,
    setVitalsData,
    setDoctorConsultation,
    setDischargeSummary,
    setFeedback,
    setWorkflowStep,
    resetWorkflow,
  }), [
    patientInfo,
    emergencyRequest,
    selectedAmbulance,
    selectedHospital,
    userLocation,
    vitalsData,
    doctorConsultation,
    dischargeSummary,
    feedback,
    workflowStep,
    updatePatientInfo,
    updateVitals,
    toggleVitalsMonitoring,
    resetWorkflow,
  ]);

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
};

export default WorkflowContext;
