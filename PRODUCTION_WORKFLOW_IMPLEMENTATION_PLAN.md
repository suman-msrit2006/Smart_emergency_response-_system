# TrackER AI - Production Workflow Implementation Plan

## Project Overview
Transform the current demo application into a realistic emergency ambulance dispatch platform with proper role separation, real-time GPS tracking, and production-ready workflows.

---

## ⚠️ CRITICAL RULES

### DO NOT CHANGE:
- ❌ UI design, colors, layouts
- ❌ Route names or component names
- ❌ Authentication system
- ❌ Existing page structure
- ❌ Socket.IO configuration
- ❌ MongoDB connection
- ❌ Navigation system

### ONLY CHANGE:
- ✅ Business logic
- ✅ Workflow sequences
- ✅ Role-based access control
- ✅ Real-time data flow
- ✅ Database operations
- ✅ Socket.IO event handlers

---

## Implementation Phases

### Phase 1: Database Schema & Models ✅ PRIORITY
**Files to Modify:**
- `server/src/models/EmergencyRequest.js` (NEW or UPDATE)
- `server/src/models/Ambulance.js` (UPDATE)
- `server/src/models/User.js` (VERIFY)

**Changes:**
1. Create/Update EmergencyRequest model with proper schema
2. Add GPS tracking fields to Ambulance model
3. Add online/offline status to User model (ambulance personnel)

---

### Phase 2: Backend API Endpoints
**Files to Modify:**
- `server/src/controllers/emergencyRequestController.js` (NEW)
- `server/src/services/emergencyRequestService.js` (NEW)
- `server/src/routes/emergencyRequestRoutes.js` (NEW)
- `server/src/controllers/ambulanceController.js` (UPDATE)
- `server/src/services/ambulanceService.js` (UPDATE)

**New Endpoints:**
```
POST   /api/emergency-requests          - Create emergency request (Patient)
GET    /api/emergency-requests/my       - Get my requests (Patient)
GET    /api/emergency-requests/pending  - Get pending requests (Ambulance)
PUT    /api/emergency-requests/:id/accept    - Accept request (Ambulance)
PUT    /api/emergency-requests/:id/reject    - Reject request (Ambulance)
PUT    /api/emergency-requests/:id/status    - Update status (Ambulance)
PUT    /api/ambulances/my/location      - Update my location (Ambulance)
PUT    /api/ambulances/my/status        - Go online/offline (Ambulance)
```

---

### Phase 3: Socket.IO Real-Time Events
**Files to Modify:**
- `server/src/socket/handlers/emergencyRequestHandlers.js` (NEW)
- `server/src/socket/handlers/ambulanceHandlers.js` (UPDATE)
- `server/src/socket/index.js` (UPDATE)

**Events:**
```javascript
// Server emits to Patient:
'emergency:request:accepted'
'emergency:status:updated'
'ambulance:location:updated'
'ambulance:arrived'

// Server emits to Ambulance Personnel:
'emergency:request:new'
'emergency:request:cancelled'

// Client emits to Server:
'ambulance:location:update'
'ambulance:status:change'
```

---

### Phase 4: Frontend - Patient Dashboard
**Files to Modify:**
- `client/src/pages/PatientDashboard.jsx` (UPDATE - Remove inappropriate cards)
- `client/src/pages/Emergency.jsx` (UPDATE - Fix workflow)

**Patient Dashboard Changes:**
- ✅ Keep: Emergency Request, Live Tracking, Assigned Ambulance, IoT Vitals (View Only), Feedback
- ❌ Remove: Doctor Consultation Portal, Patient Handover (these are ambulance personnel functions)

**Emergency.jsx Changes:**
1. Remove auto-dispatch logic
2. Add "Request Ambulance" button
3. Show waiting state after request
4. Listen for Socket.IO acceptance event
5. Show accepted ambulance details
6. Real-time tracking of assigned ambulance

---

### Phase 5: Frontend - Ambulance Personnel Dashboard
**Files to Modify:**
- `client/src/pages/AmbulanceDashboard.jsx` (UPDATE - Remove search, add request queue)
- `client/src/hooks/useGPSTracking.js` (NEW)
- `client/src/components/EmergencyRequestQueue.jsx` (NEW)
- `client/src/components/GPSStatusIndicator.jsx` (NEW)

**Ambulance Dashboard Changes:**
- ❌ Remove: Search Location, Search Ambulances, Demo Button
- ✅ Add: Go Online/Offline toggle
- ✅ Add: Incoming Emergency Requests section
- ✅ Add: GPS status indicator
- ✅ Keep: All operational features (Doctor, Vitals, Hospital, Discharge)

**New Components:**
1. **EmergencyRequestQueue** - Shows pending requests with Accept/Reject
2. **GPSStatusIndicator** - Shows GPS permission status and last update time
3. **useGPSTracking** - React hook for continuous GPS tracking

---

### Phase 6: GPS Tracking Implementation
**Files to Create:**
- `client/src/utils/gpsTracking.js`
- `client/src/hooks/useGPSTracking.js`

**Functionality:**
1. Request GPS permission on ambulance login
2. Use `navigator.geolocation.watchPosition()`
3. Throttle updates to every 5 seconds
4. Send to backend API
5. Handle errors gracefully
6. Stop tracking on logout or offline

---

### Phase 7: Socket.IO Integration (Frontend)
**Files to Modify:**
- `client/src/services/socketService.js` (UPDATE)
- `client/src/pages/Emergency.jsx` (UPDATE)
- `client/src/pages/AmbulanceDashboard.jsx` (UPDATE)

**Patient Side:**
- Subscribe to: `emergency:request:accepted`, `ambulance:location:updated`, `emergency:status:updated`
- Update UI in real-time
- Show notifications

**Ambulance Side:**
- Subscribe to: `emergency:request:new`
- Show incoming requests
- Emit: `ambulance:location:update`

---

### Phase 8: Remove Inappropriate Features
**Patient Dashboard - Remove:**
- "Accept Ambulance" button → Patient cannot accept/dispatch
- "Hospital Coordination" card → Patient doesn't select hospital (Ambulance does)
- "Doctor Consultation Portal" card → Patient views summary only
- "Patient Handover & Discharge" card → Patient views summary only

**Ambulance Dashboard - Remove:**
- Search location input and button
- Demo button
- "Search nearby ambulances" functionality
- Patient feedback submission

---

### Phase 9: Testing & Validation
**Test Scenarios:**

**Patient Flow:**
1. Login → Patient Dashboard
2. Click Emergency Request
3. Enter location → Search ambulances
4. View available ambulances
5. Click "Request Ambulance"
6. See "Waiting for ambulance..." message
7. Ambulance accepts → Receive notification
8. Track ambulance in real-time
9. Complete workflow

**Ambulance Flow:**
1. Login → Ambulance Dashboard
2. Click "Go Online"
3. GPS permission granted
4. Location shared every 5 seconds
5. Receive incoming request notification
6. View request details
7. Click "Accept"
8. Patient notified via Socket.IO
9. Navigate to patient
10. Complete workflow

---

## Implementation Order (Sequential)

### Week 1: Backend Foundation
- [ ] Day 1-2: Database models
- [ ] Day 3-4: API endpoints
- [ ] Day 5: Socket.IO handlers

### Week 2: Frontend Patient Side
- [ ] Day 1-2: Patient dashboard cleanup
- [ ] Day 3-4: Emergency page workflow
- [ ] Day 5: Socket.IO integration

### Week 3: Frontend Ambulance Side
- [ ] Day 1-2: Ambulance dashboard cleanup
- [ ] Day 3-4: GPS tracking
- [ ] Day 5: Request queue component

### Week 4: Integration & Testing
- [ ] Day 1-2: End-to-end testing
- [ ] Day 3-4: Bug fixes
- [ ] Day 5: Documentation

---

## File Checklist

### Backend (Server)
- [ ] `models/EmergencyRequest.js` - Create/Update schema
- [ ] `models/Ambulance.js` - Add GPS fields
- [ ] `models/User.js` - Add online status
- [ ] `controllers/emergencyRequestController.js` - NEW
- [ ] `services/emergencyRequestService.js` - NEW
- [ ] `routes/emergencyRequestRoutes.js` - NEW
- [ ] `controllers/ambulanceController.js` - Update
- [ ] `services/ambulanceService.js` - Update
- [ ] `socket/handlers/emergencyRequestHandlers.js` - NEW
- [ ] `socket/handlers/ambulanceHandlers.js` - Update
- [ ] `socket/index.js` - Register new handlers

### Frontend (Client)
- [ ] `pages/PatientDashboard.jsx` - Remove cards
- [ ] `pages/AmbulanceDashboard.jsx` - Remove search, add queue
- [ ] `pages/Emergency.jsx` - Fix workflow
- [ ] `hooks/useGPSTracking.js` - NEW
- [ ] `utils/gpsTracking.js` - NEW
- [ ] `components/EmergencyRequestQueue.jsx` - NEW
- [ ] `components/GPSStatusIndicator.jsx` - NEW
- [ ] `services/socketService.js` - Add new events
- [ ] `services/emergencyRequestService.js` - NEW
- [ ] `services/ambulanceService.js` - Add location update

---

## Database Collections

### emergencyrequests
```javascript
{
  _id: ObjectId,
  requestId: String (unique),
  patient: ObjectId (ref: User),
  patientName: String,
  patientPhone: String,
  location: {
    type: "Point",
    coordinates: [longitude, latitude],
    address: String
  },
  status: Enum (PENDING, ACCEPTED, EN_ROUTE, ARRIVED, PATIENT_PICKED, HOSPITAL_REACHED, COMPLETED, CANCELLED),
  assignedAmbulance: ObjectId (ref: Ambulance),
  ambulancePersonnel: ObjectId (ref: User),
  createdAt: Date,
  acceptedAt: Date,
  completedAt: Date,
  estimatedArrival: Date,
  notes: String
}
```

### ambulances (update)
```javascript
{
  // ... existing fields
  currentLocation: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  lastLocationUpdate: Date,
  isOnline: Boolean,
  currentRequest: ObjectId (ref: EmergencyRequest)
}
```

### users (update)
```javascript
{
  // ... existing fields
  isOnline: Boolean, // for ambulance personnel
  lastSeen: Date
}
```

---

## Socket.IO Event Flow

### Patient Creates Request
```
Patient → Backend: POST /api/emergency-requests
Backend → Database: Store request (status: PENDING)
Backend → Socket.IO: Broadcast to nearby online ambulances
Ambulances receive: 'emergency:request:new'
```

### Ambulance Accepts Request
```
Ambulance → Backend: PUT /api/emergency-requests/:id/accept
Backend → Database: Update request (status: ACCEPTED)
Backend → Socket.IO: Emit to patient
Patient receives: 'emergency:request:accepted'
Patient UI updates automatically
```

### Ambulance Shares GPS
```
Ambulance → Backend: PUT /api/ambulances/my/location (every 5 sec)
Backend → Database: Update ambulance location
Backend → Socket.IO: Emit to assigned patient
Patient receives: 'ambulance:location:updated'
Patient map updates automatically
```

---

## Success Criteria

### Patient Experience
- [x] Can create emergency request
- [ ] Receives notification when ambulance accepts
- [ ] Can track ambulance in real-time
- [ ] Can view vitals (read-only)
- [ ] Can submit feedback
- [ ] Cannot dispatch or accept ambulances
- [ ] Cannot select hospital

### Ambulance Experience
- [ ] Can go online/offline
- [ ] Shares GPS continuously when online
- [ ] Receives incoming requests
- [ ] Can accept/reject requests
- [ ] Can update request status
- [ ] Can monitor vitals
- [ ] Can coordinate with hospital
- [ ] Can generate discharge
- [ ] Cannot search for ambulances
- [ ] Cannot submit patient feedback

### System Behavior
- [ ] Real-time updates via Socket.IO
- [ ] No page refreshes needed
- [ ] GPS updates every 5 seconds
- [ ] One active request per patient
- [ ] Proper status flow (PENDING → ACCEPTED → ... → COMPLETED)
- [ ] Error handling for GPS permission denied
- [ ] Graceful degradation if Socket.IO fails

---

## Current Status

**Completed:**
- ✅ Role-based dashboards separated
- ✅ Role-based login validation
- ✅ Database seeding for ambulances
- ✅ Basic ambulance list display
- ✅ Ambulance selection UI (partially)

**In Progress:**
- 🔄 Emergency request workflow
- 🔄 Socket.IO real-time updates
- 🔄 GPS tracking

**Not Started:**
- ⏳ EmergencyRequest model
- ⏳ Request API endpoints
- ⏳ GPS tracking hook
- ⏳ Request queue component
- ⏳ Role-specific feature removal

---

## Next Immediate Steps

1. **Create EmergencyRequest Model** (server/src/models/EmergencyRequest.js)
2. **Create Emergency Request Service** (server/src/services/emergencyRequestService.js)
3. **Create Emergency Request Controller** (server/src/controllers/emergencyRequestController.js)
4. **Create Emergency Request Routes** (server/src/routes/emergencyRequestRoutes.js)
5. **Update Emergency.jsx** to use new workflow
6. **Create GPS Tracking Hook** (client/src/hooks/useGPSTracking.js)
7. **Update Ambulance Dashboard** with request queue

---

This implementation will be done incrementally, testing each phase before moving to the next.
