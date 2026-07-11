# Frontend API Integration Guide

## Quick Reference for Developers

This guide shows you how to use the API services in your React components.

---

## 🔐 Authentication

### Register a New User

```javascript
import { authService } from '../services/authService';

const handleRegister = async (formData) => {
  try {
    const response = await authService.register({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123',
      phone: '+1234567890',
      role: 'Patient'
    });
    // Token automatically stored in localStorage
    // Navigate to home page
  } catch (error) {
    console.error(error.message);
  }
};
```

### Login

```javascript
import { authService } from '../services/authService';

const handleLogin = async (credentials) => {
  try {
    const response = await authService.login({
      email: 'john@example.com',
      password: 'Password123'
    });
    // Token automatically stored
    // Navigate to home page
  } catch (error) {
    console.error(error.message);
  }
};
```

### Logout

```javascript
import { authService } from '../services/authService';

const handleLogout = () => {
  authService.logout();
  // Token removed from localStorage
  // Navigate to login page
};
```

### Get Current User

```javascript
import { authService } from '../services/authService';

const user = authService.getCurrentUser();
console.log(user.name, user.role, user.email);
```

### Check if Authenticated

```javascript
import { authService } from '../services/authService';

if (authService.isAuthenticated()) {
  // User is logged in
} else {
  // Redirect to login
}
```

---

## 🚨 Emergency Service

### Load All Emergencies

```javascript
import { emergencyService } from '../services/emergencyService';

const loadEmergencies = async () => {
  try {
    const result = await emergencyService.getAll({
      page: 1,
      limit: 20,
      status: 'Pending',
      severity: 'Critical'
    });
    
    console.log(result.emergencies);
    console.log(result.pagination);
  } catch (error) {
    console.error(error.message);
  }
};
```

### Create Emergency

```javascript
import { emergencyService } from '../services/emergencyService';

const createEmergency = async () => {
  try {
    const emergency = await emergencyService.create({
      type: 'Cardiac Arrest',
      severity: 'Critical',
      description: 'Patient experiencing chest pain',
      location: {
        address: '123 Main St, New York, NY',
        coordinates: [-73.935242, 40.730610]
      },
      contactNumber: '+1234567890',
      symptoms: ['Chest Pain', 'Shortness of Breath']
    });
    
    console.log('Emergency created:', emergency._id);
  } catch (error) {
    console.error(error.message);
  }
};
```

### Update Emergency Status

```javascript
import { emergencyService } from '../services/emergencyService';

const updateStatus = async (emergencyId) => {
  try {
    const emergency = await emergencyService.updateStatus(
      emergencyId,
      'Ambulance Dispatched'
    );
    
    console.log('Status updated:', emergency.status);
  } catch (error) {
    console.error(error.message);
  }
};
```

### Get Patient Emergencies

```javascript
import { emergencyService } from '../services/emergencyService';

const loadPatientEmergencies = async (patientId) => {
  try {
    const emergencies = await emergencyService.getPatientEmergencies(patientId);
    console.log(emergencies);
  } catch (error) {
    console.error(error.message);
  }
};
```

---

## 🏥 Hospital Service

### Load All Hospitals

```javascript
import { hospitalService } from '../services/hospitalService';

const loadHospitals = async () => {
  try {
    const result = await hospitalService.getAll({
      page: 1,
      limit: 20,
      city: 'New York',
      status: 'Active',
      specialty: 'Cardiology'
    });
    
    console.log(result.hospitals);
    console.log(result.pagination);
  } catch (error) {
    console.error(error.message);
  }
};
```

### Get Hospital Details

```javascript
import { hospitalService } from '../services/hospitalService';

const loadHospitalDetails = async (hospitalId) => {
  try {
    const hospital = await hospitalService.getById(hospitalId);
    console.log(hospital.name);
    console.log(hospital.capacity);
    console.log(hospital.specialties);
  } catch (error) {
    console.error(error.message);
  }
};
```

### Get Nearby Hospitals

```javascript
import { hospitalService } from '../services/hospitalService';

const findNearbyHospitals = async () => {
  try {
    const hospitals = await hospitalService.getNearby(
      -73.935242,  // longitude
      40.730610,   // latitude
      10000        // maxDistance in meters
    );
    
    console.log('Found', hospitals.length, 'hospitals nearby');
  } catch (error) {
    console.error(error.message);
  }
};
```

---

## 💓 Vital Signs Service

### Load Patient Vitals

```javascript
import { vitalService } from '../services/vitalService';

const loadVitals = async (patientId) => {
  try {
    const vitals = await vitalService.getPatientVitals(patientId, 20);
    console.log(vitals);
  } catch (error) {
    console.error(error.message);
  }
};
```

### Record New Vitals

```javascript
import { vitalService } from '../services/vitalService';

const recordVitals = async (patientId) => {
  try {
    const vital = await vitalService.create({
      patient: patientId,
      bloodPressure: {
        systolic: 120,
        diastolic: 80
      },
      heartRate: { value: 75 },
      oxygenSaturation: { value: 98 },
      temperature: {
        value: 98.6,
        unit: 'F'
      },
      respiratoryRate: { value: 16 },
      painLevel: 0,
      consciousness: 'Alert',
      location: 'Home',
      notes: 'Patient feeling well'
    });
    
    console.log('Vitals recorded:', vital._id);
  } catch (error) {
    console.error(error.message);
  }
};
```

### Get Latest Vitals

```javascript
import { vitalService } from '../services/vitalService';

const getLatestVitals = async (patientId) => {
  try {
    const vital = await vitalService.getLatestVital(patientId);
    console.log('Latest BP:', vital.bloodPressure);
    console.log('Latest HR:', vital.heartRate);
  } catch (error) {
    console.error(error.message);
  }
};
```

### Get Critical Vitals

```javascript
import { vitalService } from '../services/vitalService';

const getCriticalVitals = async () => {
  try {
    const criticalVitals = await vitalService.getCriticalVitals();
    console.log(criticalVitals.length, 'patients with critical vitals');
  } catch (error) {
    console.error(error.message);
  }
};
```

---

## 👨‍⚕️ Consultation Service

### Load Consultations

```javascript
import { consultationService } from '../services/consultationService';

const loadConsultations = async () => {
  try {
    const result = await consultationService.getAll({
      page: 1,
      limit: 20,
      status: 'Scheduled',
      doctor: 'doctor-id'
    });
    
    console.log(result.consultations);
    console.log(result.pagination);
  } catch (error) {
    console.error(error.message);
  }
};
```

### Create Consultation

```javascript
import { consultationService } from '../services/consultationService';

const createConsultation = async () => {
  try {
    const consultation = await consultationService.create({
      patient: 'patient-id',
      doctor: 'doctor-id',
      hospital: 'hospital-id',
      type: 'In-Person',
      chiefComplaint: 'Chronic headache',
      scheduledAt: new Date(),
      symptoms: [
        {
          name: 'Headache',
          severity: 'Moderate',
          duration: '3 days'
        }
      ]
    });
    
    console.log('Consultation scheduled:', consultation._id);
  } catch (error) {
    console.error(error.message);
  }
};
```

### Start/Complete Consultation

```javascript
import { consultationService } from '../services/consultationService';

// Start
const startConsultation = async (consultationId) => {
  try {
    const consultation = await consultationService.start(consultationId);
    console.log('Consultation started');
  } catch (error) {
    console.error(error.message);
  }
};

// Complete
const completeConsultation = async (consultationId) => {
  try {
    const consultation = await consultationService.complete(consultationId);
    console.log('Consultation completed');
  } catch (error) {
    console.error(error.message);
  }
};
```

---

## 📝 Feedback Service

### Load Feedback

```javascript
import { feedbackService } from '../services/feedbackService';

const loadFeedback = async () => {
  try {
    const result = await feedbackService.getAll({
      page: 1,
      limit: 20,
      type: 'Hospital'
    });
    
    console.log(result.feedbacks);
  } catch (error) {
    console.error(error.message);
  }
};
```

### Submit Feedback

```javascript
import { feedbackService } from '../services/feedbackService';

const submitFeedback = async () => {
  try {
    const feedback = await feedbackService.create({
      type: 'Hospital',
      relatedTo: {
        hospital: 'hospital-id'
      },
      rating: 5,
      title: 'Excellent Service',
      comment: 'Very satisfied with the care received',
      categories: ['Service Quality', 'Staff Behavior'],
      isAnonymous: false
    });
    
    console.log('Feedback submitted:', feedback._id);
  } catch (error) {
    console.error(error.message);
  }
};
```

### Vote on Feedback

```javascript
import { feedbackService } from '../services/feedbackService';

const voteFeedback = async (feedbackId) => {
  try {
    await feedbackService.vote(feedbackId, 'helpful');
    // or
    await feedbackService.vote(feedbackId, 'notHelpful');
    
    console.log('Vote recorded');
  } catch (error) {
    console.error(error.message);
  }
};
```

---

## 🚑 Ambulance Service

### Load Available Ambulances

```javascript
import { ambulanceService } from '../services/ambulanceService';

const loadAvailableAmbulances = async () => {
  try {
    const ambulances = await ambulanceService.getAvailable(
      -73.935242,  // longitude
      40.730610,   // latitude
      20000        // maxDistance in meters
    );
    
    console.log('Available:', ambulances.length, 'ambulances');
  } catch (error) {
    console.error(error.message);
  }
};
```

### Update Ambulance Location

```javascript
import { ambulanceService } from '../services/ambulanceService';

const updateAmbulanceLocation = async (ambulanceId) => {
  try {
    const ambulance = await ambulanceService.updateLocation(
      ambulanceId,
      [-73.935242, 40.730610]  // [longitude, latitude]
    );
    
    console.log('Location updated');
  } catch (error) {
    console.error(error.message);
  }
};
```

### Update Ambulance Status

```javascript
import { ambulanceService } from '../services/ambulanceService';

const updateAmbulanceStatus = async (ambulanceId) => {
  try {
    const ambulance = await ambulanceService.updateStatus(
      ambulanceId,
      'En Route'  // Available, En Route, On Scene, etc.
    );
    
    console.log('Status updated');
  } catch (error) {
    console.error(error.message);
  }
};
```

---

## 🎯 Complete Component Example

Here's a complete example of a component using the API:

```javascript
import { useState, useEffect } from 'react';
import { emergencyService } from '../services/emergencyService';
import { authService } from '../services/authService';

function EmergencyList() {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEmergencies();
  }, []);

  const loadEmergencies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const user = authService.getCurrentUser();
      let data;
      
      if (user?.role === 'Patient') {
        data = await emergencyService.getPatientEmergencies(user.id);
      } else {
        const result = await emergencyService.getAll({ limit: 20 });
        data = result.emergencies || [];
      }
      
      setEmergencies(data);
    } catch (err) {
      setError(err.message);
      console.error('Error loading emergencies:', err);
    } finally {
      setLoading(false);
    }
  };

  const createEmergency = async (formData) => {
    try {
      const user = authService.getCurrentUser();
      const emergency = await emergencyService.create({
        ...formData,
        patient: user.id
      });
      
      setEmergencies([emergency, ...emergencies]);
      alert('Emergency created successfully');
    } catch (err) {
      alert(err.message || 'Failed to create emergency');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Emergencies</h1>
      {emergencies.map(emergency => (
        <div key={emergency._id}>
          <h3>{emergency.type}</h3>
          <p>{emergency.description}</p>
          <span>{emergency.status}</span>
        </div>
      ))}
    </div>
  );
}

export default EmergencyList;
```

---

## 🔄 Real-Time Updates with Socket.IO

### Connect and Listen to Events

```javascript
import { useEffect } from 'react';
import socketService from '../services/socketService';

function EmergencyPage() {
  useEffect(() => {
    // Connect to socket
    socketService.connect();
    
    // Listen for emergency status changes
    socketService.onEmergencyStatusChanged((data) => {
      console.log('Emergency status changed:', data);
      // Update state
    });
    
    // Listen for new emergencies
    socketService.onEmergencyCreated((data) => {
      console.log('New emergency created:', data);
      // Add to list
    });
    
    // Cleanup
    return () => {
      socketService.off('emergency:statusChanged');
      socketService.off('emergency:created');
    };
  }, []);
  
  // Rest of component...
}
```

---

## 🛠️ Error Handling Best Practices

### Try-Catch Pattern

```javascript
const loadData = async () => {
  try {
    setLoading(true);
    const data = await someService.getData();
    setState(data);
  } catch (error) {
    // Error is already formatted by axios interceptor
    console.error(error.message);
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

### Display Errors to Users

```javascript
{error && (
  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
    {error}
  </div>
)}
```

---

## 📦 Import Paths

All services are located in `src/services/`:

```javascript
import { authService } from '../services/authService';
import { emergencyService } from '../services/emergencyService';
import { hospitalService } from '../services/hospitalService';
import { vitalService } from '../services/vitalService';
import { consultationService } from '../services/consultationService';
import { feedbackService } from '../services/feedbackService';
import { ambulanceService } from '../services/ambulanceService';
import { doctorService } from '../services/doctorService';
import socketService from '../services/socketService';
```

---

## 🔗 API Base URL

Configure in `.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Access in code:

```javascript
import { API_BASE_URL, SOCKET_URL } from '../config/api';
```

---

## ✅ Best Practices

1. **Always use try-catch** for API calls
2. **Show loading states** during API requests
3. **Display error messages** to users
4. **Clean up Socket.IO listeners** in useEffect cleanup
5. **Check authentication** before making API calls
6. **Use role-based data loading** when appropriate
7. **Validate forms** before sending to API
8. **Handle 401 errors** (already done by interceptor)

---

For complete API documentation, see:
- `API_DOCUMENTATION.md` in the server folder
- `SOCKET_IMPLEMENTATION.md` for real-time events
