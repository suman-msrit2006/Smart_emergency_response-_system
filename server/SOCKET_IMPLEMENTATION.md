# Socket.IO Real-Time Implementation

## Overview

This document provides comprehensive documentation for the Socket.IO real-time backend implementation for the TrackER AI platform. The implementation follows a modular architecture for maintainability and scalability.

## Architecture

```
server/src/socket/
├── index.js                  # Main Socket.IO configuration and initialization
├── ambulance.socket.js       # Ambulance tracking and status updates
├── emergency.socket.js       # Emergency status and coordination
└── vitals.socket.js         # Patient vitals monitoring
```

## Features Implemented

### 1. Real-Time Ambulance Tracking
- Live location updates
- Status changes (Available, En Route, On Scene, etc.)
- Ambulance assignment to emergencies
- Multiple ambulance tracking

### 2. Real-Time Emergency Management
- Emergency creation broadcasts
- Status change notifications
- Ambulance and hospital assignments
- Emergency cancellations
- ETA updates
- Emergency messaging

### 3. Real-Time Vitals Monitoring
- Live vitals streaming
- Critical vitals alerts
- Patient vitals monitoring
- Emergency-associated vitals
- Consultation vitals tracking

## Socket Events Reference

### Authentication

All socket connections require JWT authentication:

```javascript
// Client-side connection
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Connection Events

#### `connection:success`
Emitted when client successfully connects.

**Payload:**
```javascript
{
  message: 'Connected to TrackER AI real-time server',
  socketId: 'socket-id',
  userId: 'user-id',
  role: 'user-role',
  timestamp: Date
}
```

---

## Ambulance Events

### Client → Server Events

#### `ambulance:join`
Join an ambulance tracking room.

**Parameters:**
```javascript
socket.emit('ambulance:join', ambulanceId);
```

**Response:** `ambulance:joined`

---

#### `ambulance:updateLocation`
Update ambulance location in real-time.

**Parameters:**
```javascript
socket.emit('ambulance:updateLocation', {
  ambulanceId: 'ambulance-id',
  coordinates: [longitude, latitude],
  speed: 45.5,  // optional, in km/h
  heading: 180,  // optional, in degrees
  emergencyId: 'emergency-id'  // optional
});
```

**Response:** `ambulance:locationUpdated`

---

#### `ambulance:updateStatus`
Update ambulance status.

**Parameters:**
```javascript
socket.emit('ambulance:updateStatus', {
  ambulanceId: 'ambulance-id',
  status: 'En Route' // Available, En Route, On Scene, etc.
});
```

**Response:** `ambulance:statusUpdated`

---

#### `ambulance:trackMultiple`
Track multiple ambulances simultaneously.

**Parameters:**
```javascript
socket.emit('ambulance:trackMultiple', [
  'ambulance-id-1',
  'ambulance-id-2',
  'ambulance-id-3'
]);
```

**Response:** `ambulance:trackingMultiple`

---

#### `ambulance:stopTracking`
Stop tracking an ambulance.

**Parameters:**
```javascript
socket.emit('ambulance:stopTracking', ambulanceId);
```

**Response:** `ambulance:trackingStopped`

---

### Server → Client Events

#### `ambulance:locationUpdate`
Broadcasted when ambulance location changes.

**Payload:**
```javascript
{
  ambulanceId: 'ambulance-id',
  location: {
    type: 'Point',
    coordinates: [longitude, latitude]
  },
  speed: 45.5,
  heading: 180,
  timestamp: Date
}
```

---

#### `ambulance:statusUpdate`
Broadcasted when ambulance status changes.

**Payload:**
```javascript
{
  ambulanceId: 'ambulance-id',
  status: 'En Route',
  timestamp: Date,
  updatedBy: 'user-id'
}
```

---

#### `ambulance:assigned`
Emitted when ambulance is assigned to emergency.

**Payload:**
```javascript
{
  ambulanceId: 'ambulance-id',
  emergencyId: 'emergency-id',
  emergency: { /* emergency object */ },
  timestamp: Date
}
```

---

## Emergency Events

### Client → Server Events

#### `emergency:join`
Join an emergency tracking room.

**Parameters:**
```javascript
socket.emit('emergency:join', emergencyId);
```

**Response:** `emergency:joined`

---

#### `emergency:joinPatient`
Join patient emergency room (for patients to track their emergencies).

**Parameters:**
```javascript
socket.emit('emergency:joinPatient', patientId);
```

**Response:** `emergency:patientJoined`

---

#### `emergency:joinHospital`
Join hospital emergency room (for hospitals to see incoming emergencies).

**Parameters:**
```javascript
socket.emit('emergency:joinHospital', hospitalId);
```

**Response:** `emergency:hospitalJoined`

---

#### `emergency:updateStatus`
Update emergency status.

**Parameters:**
```javascript
socket.emit('emergency:updateStatus', {
  emergencyId: 'emergency-id',
  status: 'Ambulance Dispatched',
  notes: 'Optional notes'
});
```

**Response:** `emergency:statusUpdated`

---

#### `emergency:updateLocation`
Update emergency location (if patient moves).

**Parameters:**
```javascript
socket.emit('emergency:updateLocation', {
  emergencyId: 'emergency-id',
  coordinates: [longitude, latitude]
});
```

**Response:** `emergency:locationUpdated`

---

#### `emergency:sendMessage`
Send a message related to an emergency.

**Parameters:**
```javascript
socket.emit('emergency:sendMessage', {
  emergencyId: 'emergency-id',
  message: 'Message text',
  messageType: 'info' // info, warning, urgent
});
```

**Response:** `emergency:messageSent`

---

#### `emergency:updateETA`
Update estimated time of arrival.

**Parameters:**
```javascript
socket.emit('emergency:updateETA', {
  emergencyId: 'emergency-id',
  eta: 15, // in minutes
  distance: 5.2 // optional, in km
});
```

**Response:** `emergency:etaUpdated`

---

#### `emergency:trackMultiple`
Track multiple emergencies (for dispatch/admin).

**Parameters:**
```javascript
socket.emit('emergency:trackMultiple', [
  'emergency-id-1',
  'emergency-id-2'
]);
```

**Response:** `emergency:trackingMultiple`

---

### Server → Client Events

#### `emergency:created`
Broadcasted when new emergency is created.

**Payload:**
```javascript
{
  emergencyId: 'emergency-id',
  emergency: { /* emergency object */ },
  timestamp: Date
}
```

---

#### `emergency:statusChanged`
Broadcasted when emergency status changes.

**Payload:**
```javascript
{
  emergencyId: 'emergency-id',
  status: 'Ambulance On Scene',
  emergency: { /* emergency object */ },
  timestamp: Date
}
```

---

#### `emergency:hospitalAssigned`
Emitted when hospital is assigned to emergency.

**Payload:**
```javascript
{
  emergencyId: 'emergency-id',
  hospitalId: 'hospital-id',
  hospital: { /* hospital object */ },
  emergency: { /* emergency object */ },
  timestamp: Date
}
```

---

#### `emergency:cancelled`
Emitted when emergency is cancelled.

**Payload:**
```javascript
{
  emergencyId: 'emergency-id',
  reason: 'Cancellation reason',
  timestamp: Date
}
```

---

#### `emergency:message`
Broadcasted message for emergency.

**Payload:**
```javascript
{
  emergencyId: 'emergency-id',
  message: 'Message text',
  messageType: 'info',
  sender: {
    id: 'user-id',
    role: 'doctor'
  },
  timestamp: Date
}
```

---

#### `emergency:etaUpdate`
Broadcasted ETA update.

**Payload:**
```javascript
{
  emergencyId: 'emergency-id',
  eta: 15,
  distance: 5.2,
  timestamp: Date,
  updatedBy: 'user-id'
}
```

---

## Vitals Events

### Client → Server Events

#### `vitals:joinPatient`
Join patient vitals monitoring room.

**Parameters:**
```javascript
socket.emit('vitals:joinPatient', patientId);
```

**Response:** `vitals:patientJoined`

---

#### `vitals:joinEmergency`
Join emergency vitals room.

**Parameters:**
```javascript
socket.emit('vitals:joinEmergency', emergencyId);
```

**Response:** `vitals:emergencyJoined`

---

#### `vitals:stream`
Stream vital signs in real-time.

**Parameters:**
```javascript
socket.emit('vitals:stream', {
  patientId: 'patient-id',
  emergencyId: 'emergency-id', // optional
  consultationId: 'consultation-id', // optional
  heartRate: 75,
  bloodPressure: {
    systolic: 120,
    diastolic: 80
  },
  oxygenSaturation: 98,
  temperature: 37.2,
  respiratoryRate: 16,
  glucoseLevel: 95,
  notes: 'Optional notes'
});
```

**Response:** `vitals:streamedSuccess`

---

#### `vitals:alertCritical`
Send critical vitals alert.

**Parameters:**
```javascript
socket.emit('vitals:alertCritical', {
  patientId: 'patient-id',
  emergencyId: 'emergency-id', // optional
  vitalType: 'heartRate',
  value: 45,
  severity: 'critical'
});
```

**Response:** `vitals:alertSent`

---

#### `vitals:monitorMultiple`
Monitor vitals for multiple patients.

**Parameters:**
```javascript
socket.emit('vitals:monitorMultiple', [
  'patient-id-1',
  'patient-id-2'
]);
```

**Response:** `vitals:monitoringMultiple`

---

#### `vitals:stopMonitoring`
Stop monitoring patient vitals.

**Parameters:**
```javascript
socket.emit('vitals:stopMonitoring', patientId);
```

**Response:** `vitals:monitoringStopped`

---

### Server → Client Events

#### `vitals:new`
Broadcasted when new vitals are recorded.

**Payload:**
```javascript
{
  vitalId: 'vital-id',
  patientId: 'patient-id',
  emergencyId: 'emergency-id',
  consultationId: 'consultation-id',
  vital: { /* vital object */ },
  timestamp: Date
}
```

---

#### `vitals:streamed`
Real-time vitals streaming data.

**Payload:**
```javascript
{
  patientId: 'patient-id',
  emergencyId: 'emergency-id',
  consultationId: 'consultation-id',
  vitals: {
    heartRate: 75,
    bloodPressure: { systolic: 120, diastolic: 80 },
    oxygenSaturation: 98,
    temperature: 37.2,
    respiratoryRate: 16,
    glucoseLevel: 95
  },
  notes: 'Notes',
  timestamp: Date,
  recordedBy: 'user-id'
}
```

---

#### `vitals:updated`
Broadcasted when vitals are updated.

**Payload:**
```javascript
{
  vitalId: 'vital-id',
  patientId: 'patient-id',
  vital: { /* updated vital object */ },
  timestamp: Date
}
```

---

#### `vitals:criticalAlert`
Critical vitals alert broadcast.

**Payload:**
```javascript
{
  vitalId: 'vital-id',
  patientId: 'patient-id',
  emergencyId: 'emergency-id',
  vital: { /* vital object */ },
  severity: 'critical',
  timestamp: Date
}
```

---

#### `vitals:globalCriticalAlert`
Global broadcast to all medical staff for critical vitals.

**Payload:**
```javascript
{
  patientId: 'patient-id',
  emergencyId: 'emergency-id',
  vitalType: 'heartRate',
  value: 45,
  severity: 'critical',
  timestamp: Date,
  alertedBy: 'user-id'
}
```

---

## Room Naming Conventions

The Socket.IO implementation uses a structured room naming convention:

- **Ambulance Tracking**: `ambulance:{ambulanceId}`
- **Emergency Tracking**: `emergency:{emergencyId}`
- **Patient Emergencies**: `patient:{patientId}:emergencies`
- **Hospital Emergencies**: `hospital:{hospitalId}:emergencies`
- **Patient Vitals**: `patient:{patientId}:vitals`
- **Emergency Vitals**: `emergency:{emergencyId}:vitals`
- **Consultation Vitals**: `consultation:{consultationId}:vitals`

## Error Handling

All socket events include error handling. Errors are emitted back to the client:

```javascript
// Ambulance errors
socket.on('ambulance:error', (error) => {
  console.error('Ambulance error:', error.message);
});

// Emergency errors
socket.on('emergency:error', (error) => {
  console.error('Emergency error:', error.message);
});

// Vitals errors
socket.on('vitals:error', (error) => {
  console.error('Vitals error:', error.message);
});
```

## Critical Vitals Thresholds

The system automatically detects critical vitals based on these thresholds:

- **Heart Rate**: < 40 or > 140 bpm
- **Blood Pressure (Systolic)**: < 70 or > 180 mmHg
- **Oxygen Saturation**: < 90%
- **Temperature**: < 35°C or > 40°C
- **Respiratory Rate**: < 10 or > 30 breaths/min

When critical thresholds are detected, automatic alerts are broadcasted.

## Integration with Services

Socket emissions are integrated into the service layer:

### Ambulance Service
- `updateLocation()` → emits `ambulance:locationUpdate`
- `updateStatus()` → emits `ambulance:statusUpdate`
- `assignToEmergency()` → emits `ambulance:assigned`

### Emergency Service
- `createEmergency()` → emits `emergency:created`
- `updateStatus()` → emits `emergency:statusChanged`
- `assignAmbulance()` → emits `ambulance:assigned`
- `assignHospital()` → emits `emergency:hospitalAssigned`
- `deleteEmergency()` → emits `emergency:cancelled`

### Vital Service
- `createVital()` → emits `vitals:new` and critical alerts if needed
- `updateVital()` → emits `vitals:updated` and critical alerts if needed

## Testing Socket Events

### Using Socket.IO Client (Node.js)

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);
  
  // Join ambulance room
  socket.emit('ambulance:join', 'ambulance-id-123');
  
  // Listen for location updates
  socket.on('ambulance:locationUpdate', (data) => {
    console.log('Location update:', data);
  });
});

socket.on('connect_error', (error) => {
  console.error('Connection error:', error.message);
});
```

### Using Postman or Browser

1. Open Postman or browser console
2. Connect to `http://localhost:5000`
3. Provide JWT token in auth
4. Emit and listen for events

## Best Practices

1. **Always join rooms before expecting broadcasts**
   ```javascript
   socket.emit('emergency:join', emergencyId);
   ```

2. **Handle errors gracefully**
   ```javascript
   socket.on('error:occurred', handleError);
   ```

3. **Clean up on unmount/disconnect**
   ```javascript
   socket.emit('ambulance:leave', ambulanceId);
   socket.disconnect();
   ```

4. **Use room-specific events for targeted updates**
   - Don't broadcast globally when room-specific is sufficient

5. **Validate data before emitting**
   - All required fields should be present
   - Coordinates should be in correct format [longitude, latitude]

## Performance Considerations

- Socket.IO uses WebSocket when available, falls back to polling
- Rooms provide efficient targeting of messages
- Modular architecture allows independent scaling
- Error handling prevents cascading failures
- Graceful degradation if Socket.IO fails

## Security

- JWT authentication required for all connections
- User ID and role attached to socket for authorization
- Socket events validate user permissions
- Room joining is logged for audit trails
- Sensitive data is not exposed in broadcasts

## Future Enhancements

- Add socket event rate limiting
- Implement socket event logging and analytics
- Add reconnection strategies for clients
- Implement message queuing for offline clients
- Add socket event replay for missed messages
- Implement socket clustering for horizontal scaling

---

## Support

For issues or questions about the Socket.IO implementation, refer to:
- Socket.IO Documentation: https://socket.io/docs/
- Project API Documentation: `API_DOCUMENTATION.md`
- Emergency Contact: See project README
