# Socket.IO Quick Reference Guide

## Connection Setup

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: { token: 'your-jwt-token' }
});

socket.on('connection:success', (data) => {
  console.log('Connected:', data);
});
```

---

## Ambulance Tracking

### Join Ambulance Room
```javascript
socket.emit('ambulance:join', 'ambulance-id');
```

### Update Location
```javascript
socket.emit('ambulance:updateLocation', {
  ambulanceId: 'ambulance-id',
  coordinates: [longitude, latitude],
  speed: 45.5,
  heading: 180
});
```

### Listen for Location Updates
```javascript
socket.on('ambulance:locationUpdate', (data) => {
  console.log('New location:', data.location.coordinates);
});
```

### Update Status
```javascript
socket.emit('ambulance:updateStatus', {
  ambulanceId: 'ambulance-id',
  status: 'En Route'
});
```

### Track Multiple Ambulances
```javascript
socket.emit('ambulance:trackMultiple', [
  'ambulance-1',
  'ambulance-2',
  'ambulance-3'
]);
```

---

## Emergency Management

### Join Emergency Room
```javascript
socket.emit('emergency:join', 'emergency-id');
```

### Join as Patient
```javascript
socket.emit('emergency:joinPatient', 'patient-id');
```

### Join as Hospital
```javascript
socket.emit('emergency:joinHospital', 'hospital-id');
```

### Listen for Emergency Creation
```javascript
socket.on('emergency:created', (data) => {
  console.log('New emergency:', data.emergency);
});
```

### Listen for Status Changes
```javascript
socket.on('emergency:statusChanged', (data) => {
  console.log('Status changed to:', data.status);
});
```

### Update Emergency Status
```javascript
socket.emit('emergency:updateStatus', {
  emergencyId: 'emergency-id',
  status: 'Ambulance On Scene',
  notes: 'Ambulance arrived'
});
```

### Send Emergency Message
```javascript
socket.emit('emergency:sendMessage', {
  emergencyId: 'emergency-id',
  message: 'Patient is stable',
  messageType: 'info'
});
```

### Update ETA
```javascript
socket.emit('emergency:updateETA', {
  emergencyId: 'emergency-id',
  eta: 10, // minutes
  distance: 3.5 // km
});
```

---

## Vitals Monitoring

### Join Patient Vitals Room
```javascript
socket.emit('vitals:joinPatient', 'patient-id');
```

### Join Emergency Vitals Room
```javascript
socket.emit('vitals:joinEmergency', 'emergency-id');
```

### Stream Vitals in Real-Time
```javascript
socket.emit('vitals:stream', {
  patientId: 'patient-id',
  emergencyId: 'emergency-id',
  heartRate: 75,
  bloodPressure: {
    systolic: 120,
    diastolic: 80
  },
  oxygenSaturation: 98,
  temperature: 37.2,
  respiratoryRate: 16
});
```

### Listen for New Vitals
```javascript
socket.on('vitals:new', (data) => {
  console.log('New vitals:', data.vital);
});
```

### Listen for Vitals Stream
```javascript
socket.on('vitals:streamed', (data) => {
  console.log('Heart rate:', data.vitals.heartRate);
  console.log('BP:', data.vitals.bloodPressure);
});
```

### Listen for Critical Alerts
```javascript
socket.on('vitals:criticalAlert', (data) => {
  alert(`Critical vitals for patient ${data.patientId}`);
  console.log('Critical vital:', data);
});
```

### Monitor Multiple Patients
```javascript
socket.emit('vitals:monitorMultiple', [
  'patient-1',
  'patient-2',
  'patient-3'
]);
```

### Send Critical Alert
```javascript
socket.emit('vitals:alertCritical', {
  patientId: 'patient-id',
  emergencyId: 'emergency-id',
  vitalType: 'heartRate',
  value: 45,
  severity: 'critical'
});
```

---

## Common Patterns

### Listen for Errors
```javascript
socket.on('ambulance:error', (error) => {
  console.error('Ambulance error:', error.message);
});

socket.on('emergency:error', (error) => {
  console.error('Emergency error:', error.message);
});

socket.on('vitals:error', (error) => {
  console.error('Vitals error:', error.message);
});
```

### Cleanup on Unmount
```javascript
// React example
useEffect(() => {
  socket.emit('ambulance:join', ambulanceId);
  
  return () => {
    socket.emit('ambulance:leave', ambulanceId);
  };
}, [ambulanceId]);
```

### Ping/Pong Heartbeat
```javascript
socket.emit('ping');

socket.on('pong', (data) => {
  console.log('Server responded at:', data.timestamp);
});
```

### Join/Leave Generic Room
```javascript
socket.emit('join:room', 'custom-room-name');
socket.emit('leave:room', 'custom-room-name');
```

---

## Critical Vitals Thresholds

| Vital | Critical Low | Critical High |
|-------|-------------|---------------|
| Heart Rate | < 40 bpm | > 140 bpm |
| Blood Pressure (Systolic) | < 70 mmHg | > 180 mmHg |
| Oxygen Saturation | < 90% | - |
| Temperature | < 35°C | > 40°C |
| Respiratory Rate | < 10 /min | > 30 /min |

---

## Complete Example: Emergency Tracking Dashboard

```javascript
import { io } from 'socket.io-client';

// Connect
const socket = io('http://localhost:5000', {
  auth: { token: localStorage.getItem('token') }
});

// Connection
socket.on('connect', () => {
  console.log('Connected to real-time server');
  
  // Join multiple emergency rooms
  socket.emit('emergency:trackMultiple', emergencyIds);
});

// Listen for all emergency events
socket.on('emergency:created', handleNewEmergency);
socket.on('emergency:statusChanged', handleStatusChange);
socket.on('emergency:hospitalAssigned', handleHospitalAssignment);
socket.on('ambulance:assigned', handleAmbulanceAssignment);
socket.on('ambulance:locationUpdate', handleLocationUpdate);
socket.on('emergency:etaUpdate', handleETAUpdate);
socket.on('vitals:criticalAlert', handleCriticalAlert);

// Error handling
socket.on('connect_error', (error) => {
  console.error('Connection failed:', error.message);
});

socket.on('emergency:error', (error) => {
  console.error('Error:', error.message);
});

// Cleanup
window.addEventListener('beforeunload', () => {
  socket.disconnect();
});
```

---

## Complete Example: Ambulance Driver App

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: { token: driverToken }
});

const ambulanceId = 'my-ambulance-id';

socket.on('connect', () => {
  // Join ambulance room
  socket.emit('ambulance:join', ambulanceId);
  
  // Start tracking emergency if assigned
  if (currentEmergencyId) {
    socket.emit('emergency:join', currentEmergencyId);
  }
});

// Update location every 5 seconds
setInterval(() => {
  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit('ambulance:updateLocation', {
      ambulanceId,
      coordinates: [
        position.coords.longitude,
        position.coords.latitude
      ],
      speed: position.coords.speed,
      heading: position.coords.heading,
      emergencyId: currentEmergencyId
    });
  });
}, 5000);

// Listen for new assignments
socket.on('ambulance:assigned', (data) => {
  console.log('New emergency assigned:', data.emergency);
  currentEmergencyId = data.emergencyId;
  socket.emit('emergency:join', data.emergencyId);
  
  // Update status
  socket.emit('ambulance:updateStatus', {
    ambulanceId,
    status: 'En Route'
  });
});

// Update status when arriving
function arriveAtScene() {
  socket.emit('ambulance:updateStatus', {
    ambulanceId,
    status: 'On Scene'
  });
  
  socket.emit('emergency:updateStatus', {
    emergencyId: currentEmergencyId,
    status: 'Ambulance On Scene'
  });
}
```

---

## Complete Example: Hospital Dashboard

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: { token: hospitalToken }
});

const hospitalId = 'my-hospital-id';

socket.on('connect', () => {
  // Join hospital emergency room
  socket.emit('emergency:joinHospital', hospitalId);
});

// Listen for incoming emergencies
socket.on('emergency:incoming', (data) => {
  console.log('New patient incoming:', data.emergency);
  showNotification(`Emergency assigned: ${data.emergency.type}`);
});

// Listen for ambulance arrivals
socket.on('emergency:statusChanged', (data) => {
  if (data.status === 'Arrived at Hospital') {
    console.log('Ambulance arrived with patient');
    prepareEmergencyRoom(data.emergency);
  }
});

// Monitor vitals for incoming patients
socket.on('vitals:new', (data) => {
  console.log('Patient vitals received:', data.vital);
  updatePatientMonitor(data.patientId, data.vital);
});

// Critical alerts
socket.on('vitals:globalCriticalAlert', (data) => {
  showCriticalAlert(data);
});
```

---

## Testing with curl (Socket.IO HTTP Polling)

```bash
# Initial handshake
curl "http://localhost:5000/socket.io/?EIO=4&transport=polling"

# With authentication
curl "http://localhost:5000/socket.io/?EIO=4&transport=polling&token=your-jwt-token"
```

Note: For proper testing, use Socket.IO client libraries or tools like Postman with WebSocket support.

---

## Environment Variables

```env
# Client URL for CORS
CLIENT_URL=http://localhost:5173

# Server Port
PORT=5000

# JWT Secret
JWT_SECRET=your-secret-key
```

---

## Troubleshooting

### Connection Refused
- Check if server is running on correct port
- Verify firewall settings
- Check CORS configuration

### Authentication Failed
- Verify JWT token is valid and not expired
- Check token is sent in `auth.token` or `Authorization` header
- Verify JWT secret matches between client and server

### Not Receiving Events
- Ensure you've joined the correct room
- Check event names match exactly (case-sensitive)
- Verify socket connection is established
- Check server logs for errors

### High Latency
- Check network connection
- Verify WebSocket transport is being used (not polling)
- Check server load and performance
- Consider implementing Redis adapter for scaling

---

For complete documentation, see `SOCKET_IMPLEMENTATION.md`
