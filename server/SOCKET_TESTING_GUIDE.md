# Socket.IO Testing Guide

## Prerequisites

- Server running on `http://localhost:5000`
- Valid JWT token (login via `/api/auth/login`)
- Socket.IO client library installed

## Testing Tools

### 1. Node.js Script
### 2. Browser Console
### 3. Postman (WebSocket support)
### 4. Socket.IO Admin UI

---

## Setup Test Environment

### Install Socket.IO Client

```bash
npm install socket.io-client
```

### Get JWT Token

```bash
# Login to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Copy the token from response
```

---

## Test 1: Basic Connection

### Node.js Test Script

Create `test-socket.js`:

```javascript
import { io } from 'socket.io-client';

const token = 'YOUR_JWT_TOKEN_HERE';

const socket = io('http://localhost:5000', {
  auth: { token }
});

socket.on('connect', () => {
  console.log('✅ Connected successfully!');
  console.log('Socket ID:', socket.id);
});

socket.on('connection:success', (data) => {
  console.log('✅ Connection success event received:');
  console.log(data);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection failed:', error.message);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

// Keep alive
setTimeout(() => {}, 60000);
```

Run it:
```bash
node test-socket.js
```

**Expected Output:**
```
✅ Connected successfully!
Socket ID: abc123xyz
✅ Connection success event received:
{
  message: 'Connected to TrackER AI real-time server',
  socketId: 'abc123xyz',
  userId: 'user-id',
  role: 'patient',
  timestamp: 2024-01-15T10:30:00.000Z
}
```

---

## Test 2: Ambulance Location Tracking

Create `test-ambulance.js`:

```javascript
import { io } from 'socket.io-client';

const token = 'YOUR_JWT_TOKEN_HERE';
const ambulanceId = 'test-ambulance-id';

const socket = io('http://localhost:5000', {
  auth: { token }
});

socket.on('connect', () => {
  console.log('Connected!');
  
  // Join ambulance room
  socket.emit('ambulance:join', ambulanceId);
});

socket.on('ambulance:joined', (data) => {
  console.log('✅ Joined ambulance room:', data);
  
  // Simulate location update
  setInterval(() => {
    const longitude = -122.4194 + (Math.random() - 0.5) * 0.01;
    const latitude = 37.7749 + (Math.random() - 0.5) * 0.01;
    
    socket.emit('ambulance:updateLocation', {
      ambulanceId,
      coordinates: [longitude, latitude],
      speed: 45.5,
      heading: 180
    });
    
    console.log(`📍 Sent location: [${longitude}, ${latitude}]`);
  }, 5000);
});

socket.on('ambulance:locationUpdate', (data) => {
  console.log('✅ Location update received:', data);
});

socket.on('ambulance:locationUpdated', (data) => {
  console.log('✅ Location update acknowledged:', data);
});

socket.on('ambulance:error', (error) => {
  console.error('❌ Error:', error.message);
});
```

Run it:
```bash
node test-ambulance.js
```

**Expected Output:**
```
Connected!
✅ Joined ambulance room: { ambulanceId: 'test-ambulance-id', ... }
📍 Sent location: [-122.4194, 37.7749]
✅ Location update acknowledged: { success: true, ... }
✅ Location update received: { ambulanceId: 'test-ambulance-id', ... }
```

---

## Test 3: Emergency Status Updates

Create `test-emergency.js`:

```javascript
import { io } from 'socket.io-client';

const token = 'YOUR_JWT_TOKEN_HERE';
const emergencyId = 'test-emergency-id';

const socket = io('http://localhost:5000', {
  auth: { token }
});

socket.on('connect', () => {
  console.log('Connected!');
  
  // Join emergency room
  socket.emit('emergency:join', emergencyId);
});

socket.on('emergency:joined', (data) => {
  console.log('✅ Joined emergency room:', data);
  
  // Update status after 2 seconds
  setTimeout(() => {
    socket.emit('emergency:updateStatus', {
      emergencyId,
      status: 'Ambulance Dispatched',
      notes: 'Test status update'
    });
  }, 2000);
});

socket.on('emergency:statusUpdate', (data) => {
  console.log('✅ Status update received:', data);
});

socket.on('emergency:statusUpdated', (data) => {
  console.log('✅ Status update acknowledged:', data);
});

// Listen for new emergencies
socket.on('emergency:created', (data) => {
  console.log('🆕 New emergency created:', data);
});

// Listen for status changes
socket.on('emergency:statusChanged', (data) => {
  console.log('🔄 Emergency status changed:', data);
});

socket.on('emergency:error', (error) => {
  console.error('❌ Error:', error.message);
});
```

Run it:
```bash
node test-emergency.js
```

---

## Test 4: Vitals Monitoring

Create `test-vitals.js`:

```javascript
import { io } from 'socket.io-client';

const token = 'YOUR_JWT_TOKEN_HERE';
const patientId = 'test-patient-id';

const socket = io('http://localhost:5000', {
  auth: { token }
});

socket.on('connect', () => {
  console.log('Connected!');
  
  // Join patient vitals room
  socket.emit('vitals:joinPatient', patientId);
});

socket.on('vitals:patientJoined', (data) => {
  console.log('✅ Joined patient vitals room:', data);
  
  // Stream vitals every 3 seconds
  setInterval(() => {
    const vitals = {
      patientId,
      heartRate: 60 + Math.floor(Math.random() * 40),
      bloodPressure: {
        systolic: 110 + Math.floor(Math.random() * 30),
        diastolic: 70 + Math.floor(Math.random() * 20)
      },
      oxygenSaturation: 95 + Math.floor(Math.random() * 5),
      temperature: 36.5 + Math.random() * 1.5,
      respiratoryRate: 12 + Math.floor(Math.random() * 8)
    };
    
    socket.emit('vitals:stream', vitals);
    console.log('📊 Streamed vitals:', vitals);
  }, 3000);
});

socket.on('vitals:streamed', (data) => {
  console.log('✅ Vitals received:', data.vitals);
});

socket.on('vitals:new', (data) => {
  console.log('🆕 New vitals recorded:', data);
});

socket.on('vitals:criticalAlert', (data) => {
  console.log('🚨 CRITICAL ALERT:', data);
});

socket.on('vitals:error', (error) => {
  console.error('❌ Error:', error.message);
});
```

Run it:
```bash
node test-vitals.js
```

---

## Test 5: Multiple Client Simulation

Create `test-multiple-clients.js`:

```javascript
import { io } from 'socket.io-client';

const token = 'YOUR_JWT_TOKEN_HERE';
const ambulanceId = 'test-ambulance-id';

// Client 1: Ambulance Driver
const driver = io('http://localhost:5000', {
  auth: { token }
});

driver.on('connect', () => {
  console.log('🚑 Driver connected');
  driver.emit('ambulance:join', ambulanceId);
  
  // Send location updates
  setInterval(() => {
    driver.emit('ambulance:updateLocation', {
      ambulanceId,
      coordinates: [-122.4194, 37.7749],
      speed: 50
    });
  }, 5000);
});

driver.on('ambulance:locationUpdate', (data) => {
  console.log('🚑 Driver received location update:', data);
});

// Client 2: Dispatcher
const dispatcher = io('http://localhost:5000', {
  auth: { token }
});

dispatcher.on('connect', () => {
  console.log('👨‍💼 Dispatcher connected');
  dispatcher.emit('ambulance:join', ambulanceId);
});

dispatcher.on('ambulance:locationUpdate', (data) => {
  console.log('👨‍💼 Dispatcher received location update:', data.location.coordinates);
});

// Client 3: Hospital
const hospital = io('http://localhost:5000', {
  auth: { token }
});

hospital.on('connect', () => {
  console.log('🏥 Hospital connected');
  hospital.emit('ambulance:join', ambulanceId);
});

hospital.on('ambulance:locationUpdate', (data) => {
  console.log('🏥 Hospital received location update:', data.location.coordinates);
});
```

Run it:
```bash
node test-multiple-clients.js
```

**Expected Output:**
```
🚑 Driver connected
👨‍💼 Dispatcher connected
🏥 Hospital connected
🚑 Driver received location update: { ambulanceId: '...', ... }
👨‍💼 Dispatcher received location update: [-122.4194, 37.7749]
🏥 Hospital received location update: [-122.4194, 37.7749]
```

---

## Test 6: Critical Vitals Alert

Create `test-critical-vitals.js`:

```javascript
import { io } from 'socket.io-client';

const token = 'YOUR_JWT_TOKEN_HERE';
const patientId = 'test-patient-id';

const socket = io('http://localhost:5000', {
  auth: { token }
});

socket.on('connect', () => {
  console.log('Connected!');
  
  // Send critical heart rate
  socket.emit('vitals:alertCritical', {
    patientId,
    vitalType: 'heartRate',
    value: 35, // Critical low
    severity: 'critical'
  });
});

socket.on('vitals:alertSent', (data) => {
  console.log('✅ Critical alert sent:', data);
});

socket.on('vitals:criticalAlert', (data) => {
  console.log('🚨 Critical alert received:', data);
});

socket.on('vitals:globalCriticalAlert', (data) => {
  console.log('🚨🌍 Global critical alert:', data);
});
```

---

## Browser Console Testing

Open browser console at `http://localhost:5173` (your frontend):

```javascript
// Load Socket.IO client
const script = document.createElement('script');
script.src = 'https://cdn.socket.io/4.6.1/socket.io.min.js';
document.head.appendChild(script);

// After script loads
const socket = io('http://localhost:5000', {
  auth: { token: localStorage.getItem('token') }
});

socket.on('connect', () => {
  console.log('Connected!', socket.id);
});

// Join ambulance room
socket.emit('ambulance:join', 'ambulance-123');

// Listen for updates
socket.on('ambulance:locationUpdate', console.log);
socket.on('emergency:created', console.log);
socket.on('vitals:new', console.log);
```

---

## Integration Testing with API

### Test Emergency Creation → Socket Broadcast

```bash
# Terminal 1: Run socket listener
node test-emergency.js

# Terminal 2: Create emergency via API
curl -X POST http://localhost:5000/api/emergencies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "patient": "patient-id",
    "type": "Medical",
    "severity": "High",
    "location": {
      "coordinates": [-122.4194, 37.7749]
    }
  }'

# Terminal 1 should receive: emergency:created event
```

### Test Ambulance Location Update → Socket Broadcast

```bash
# Terminal 1: Run socket listener
node test-ambulance.js

# Terminal 2: Update location via API
curl -X PATCH http://localhost:5000/api/ambulances/AMBULANCE_ID/location \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "coordinates": [-122.4194, 37.7749]
  }'

# Terminal 1 should receive: ambulance:locationUpdate event
```

### Test Vitals Creation → Socket Broadcast

```bash
# Terminal 1: Run socket listener
node test-vitals.js

# Terminal 2: Create vitals via API
curl -X POST http://localhost:5000/api/vitals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "patient": "patient-id",
    "heartRate": 35,
    "bloodPressure": { "systolic": 120, "diastolic": 80 },
    "oxygenSaturation": 98
  }'

# Terminal 1 should receive: vitals:new AND vitals:criticalAlert
```

---

## Load Testing

Create `load-test.js`:

```javascript
import { io } from 'socket.io-client';

const token = 'YOUR_JWT_TOKEN_HERE';
const numClients = 100;
const clients = [];

console.log(`Creating ${numClients} clients...`);

for (let i = 0; i < numClients; i++) {
  const client = io('http://localhost:5000', {
    auth: { token }
  });
  
  client.on('connect', () => {
    console.log(`Client ${i + 1} connected`);
  });
  
  clients.push(client);
}

// Monitor connections
setTimeout(() => {
  console.log(`${clients.filter(c => c.connected).length} clients connected`);
}, 5000);
```

---

## Debugging

### Enable Socket.IO Debug Logs

**Server-side:**
```javascript
// In server.js
import { logger } from './utils/logger.js';

// Add this before socket initialization
process.env.DEBUG = 'socket.io:*';
```

**Client-side:**
```javascript
localStorage.debug = 'socket.io-client:*';

const socket = io('http://localhost:5000', {
  auth: { token },
  transports: ['websocket', 'polling']
});
```

### Check Server Logs

```bash
# Server should log:
Socket authenticated: abc123 (User: user-id, Role: patient)
Client connected: abc123 (User: user-id, Role: patient)
Socket abc123 joined ambulance room: ambulance-123
Ambulance location updated: ambulance-123 at [-122.4194, 37.7749]
```

---

## Common Issues & Solutions

### Issue: Connection Refused
**Solution:**
```bash
# Check server is running
curl http://localhost:5000/

# Check socket endpoint
curl http://localhost:5000/socket.io/
```

### Issue: Authentication Failed
**Solution:**
```javascript
// Verify token
const token = 'your-token';
console.log('Token:', token);

// Check token expiry
const jwt = require('jsonwebtoken');
const decoded = jwt.decode(token);
console.log('Expires:', new Date(decoded.exp * 1000));
```

### Issue: Not Receiving Events
**Solution:**
```javascript
// Ensure you joined the room first
socket.emit('ambulance:join', ambulanceId);

// Wait for confirmation
socket.on('ambulance:joined', () => {
  console.log('Now listening for updates');
});
```

### Issue: CORS Error
**Solution:**
Check server CORS configuration includes your client URL:
```javascript
// In socket/index.js
cors: {
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}
```

---

## Performance Monitoring

Create `monitor.js`:

```javascript
import { io } from 'socket.io-client';

const token = 'YOUR_JWT_TOKEN_HERE';
const socket = io('http://localhost:5000', {
  auth: { token }
});

let messageCount = 0;
let startTime = Date.now();

socket.on('connect', () => {
  console.log('Monitoring started...');
});

// Monitor all events
['ambulance:locationUpdate', 'emergency:statusChanged', 'vitals:new'].forEach(event => {
  socket.on(event, () => {
    messageCount++;
    const elapsed = (Date.now() - startTime) / 1000;
    const rate = (messageCount / elapsed).toFixed(2);
    console.log(`${event} - Total: ${messageCount}, Rate: ${rate} msg/sec`);
  });
});
```

---

## Success Criteria

✅ Connection established with JWT auth
✅ Room join/leave works
✅ Real-time location updates received
✅ Emergency status changes received
✅ Vitals streaming works
✅ Critical alerts triggered
✅ Multiple clients receive same broadcast
✅ API changes trigger socket broadcasts
✅ Error handling works
✅ Graceful disconnection

---

## Next Steps

After successful testing:
1. Integrate with frontend React app
2. Create custom hooks for socket connections
3. Add UI indicators for real-time updates
4. Implement notification system
5. Add reconnection strategies
6. Deploy to production

---

For complete documentation, see:
- `SOCKET_IMPLEMENTATION.md` - Full technical docs
- `SOCKET_QUICK_REFERENCE.md` - Quick reference guide
