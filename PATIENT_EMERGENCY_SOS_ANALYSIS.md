# Patient Emergency (SOS) Page - Complete Technical Analysis

**Date:** Analysis Completed  
**Scope:** Frontend + Backend + Database + Socket.IO Integration  
**Status:** Current Implementation Review (No Code Modifications)

---

## Table of Contents

1. [Frontend Analysis](#1-frontend-analysis)
2. [Backend Analysis](#2-backend-analysis)
3. [Data Flow](#3-data-flow)
4. [Current Problems](#4-current-problems)
5. [Correct Workflow](#5-correct-workflow)
6. [Component Mapping](#6-component-mapping)

---

## 1. Frontend Analysis

### 1.1 React Component
**File:** `client/src/pages/Emergency.jsx`

**Purpose:** Renders the Patient Emergency SOS page where patients can:
- Search for their location
- View available ambulances on a map
- Request an ambulance
- Track ambulance response

### 1.2 Hooks Used

| Hook | Purpose |
|------|---------|
| `useState` | Managing local component state |
| `useEffect` | Side effects (fetching data, Socket.IO listeners, timers) |
| `useRef` | Reference to interval timer for live tracking simulation |
| `useNavigate` | Navigation to other pages (e.g., hospital selection) |
| `useWorkflow` | Global workflow context (stores location, ambulance) |
| `useAuth` | User authentication state |
| `useToast` | Toast notifications |


### 1.3 State Variables

```javascript
const [placeSearch, setPlaceSearch] = useState('');                    // User input for location
const [searchStatus, setSearchStatus] = useState({ message: '', type: '' }); // Status messages
const [userLoc, setUserLoc] = useState(null);                          // User's location {lat, lng, name}
const [ambulances, setAmbulances] = useState([]);                      // List of ambulances
const [stats, setStats] = useState({ total: 0, available: 0, enroute: 0, fastest: null }); // Statistics
const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);       // Map center coordinates
const [mapZoom, setMapZoom] = useState(5);                             // Map zoom level
const [emergencyRequestId, setEmergencyRequestId] = useState(null);   // Created emergency request ID
const [initialLoading, setInitialLoading] = useState(true);            // Initial data loading state
const [searchLoading, setSearchLoading] = useState(false);             // Search in progress
const [selectedAmbulanceId, setSelectedAmbulanceId] = useState(null); // Selected ambulance ID
const [requestStatus, setRequestStatus] = useState(null);              // 'pending', 'accepted', 'rejected'
const [acceptedAmbulance, setAcceptedAmbulance] = useState(null);     // Ambulance that accepted request
const [ambulanceLocation, setAmbulanceLocation] = useState(null);      // Real-time ambulance location
```

### 1.4 Location Search Workflow

**When user enters a location and clicks "Search":**

```javascript
handleSearch() → 
  1. Validate input
  2. Call OpenStreetMap Nominatim API
  3. Parse response
  4. Update userLoc state
  5. Update map center and zoom
  6. Call fetchAmbulances(lng, lat, 50000)  // 50km radius
```

**Function:** `handleSearch()`
- **External API:** OpenStreetMap Nominatim (geocoding)
- **Endpoint:** `https://nominatim.openstreetmap.org/search`
- **Parameters:** `format=json`, `q={location}`, `limit=1`, `countrycodes=in`
- **Result:** Sets `userLoc` with `{lat, lng, name}`


### 1.5 Demo Button Workflow

**When user clicks "Demo":**

```javascript
handleDemo() →
  1. Pick random demo location from hardcoded list:
     - Connaught Place Delhi
     - Bandra Mumbai
     - Koramangala Bangalore
     - T Nagar Chennai
  2. Set userLoc state
  3. Update map center and zoom
  4. Call fetchAmbulances(lng, lat, 50000)
```

**Function:** `handleDemo()`
- Uses hardcoded demo locations
- No external API call
- Sets `userLoc` directly

### 1.6 Fetching Available Ambulances

**Function:** `fetchAmbulances(longitude, latitude, maxDistance = 50000)`

**Flow:**
```
1. Call ambulanceService.getAvailable(longitude, latitude, maxDistance)
2. If API succeeds:
   - Transform data from backend format
   - Filter ambulances with valid coordinates
   - Update ambulances state
3. If API fails:
   - Fallback to MOCK DATA
   - Generate 10 random ambulances around searched location
   - Randomly assign statuses: 'available' or 'enroute'
   - Update ambulances state
```

**API Call:** `GET /api/ambulances/available`
**Parameters:**
- `longitude`: User's longitude
- `latitude`: User's latitude
- `maxDistance`: Maximum radius in meters (default: 50000m = 50km)


### 1.7 Map Rendering

**Library:** React Leaflet (Leaflet.js wrapper)
**Tiles:** OpenStreetMap tiles

**Components Used:**
- `MapContainer` - Main map container
- `TileLayer` - Map tiles from OpenStreetMap
- `Marker` - Markers for ambulances and user location
- `Popup` - Popup info when marker is clicked
- `MapUpdater` - Custom component to update map view

**Markers:**
1. **User Location (Blue):** Shows "YOU" marker at `userLoc`
2. **Available Ambulances (Green):** Shows "AVAILABLE" markers
3. **En Route Ambulances (Yellow):** Shows "EN ROUTE" markers
4. **Hospital Ambulances (Red):** Shows "HOSPITAL" markers

**Custom Icons:** Created with `L.divIcon()` - HTML-based markers

### 1.8 Available Ambulances Panel

**Location:** Right side panel on the page

**Population Logic:**
```javascript
// Filter ambulances within 50km and status === 'available'
const availableAmbulances = userLoc
  ? ambulances.filter(amb => amb.distance <= 50 && amb.status === 'available')
      .sort((a, b) => a.distance - b.distance)  // Sort by distance (closest first)
  : [];
```

**Display:**
- Shows ambulance ID
- Shows distance in km
- Shows estimated ETA (calculated as `distance * 4` minutes)
- Shows "FASTEST" badge for closest ambulance
- Shows "SELECTED" badge for selected ambulance
- Click to select an ambulance
- "REQUEST THIS AMBULANCE" button appears when selected


### 1.9 API Endpoints Called

| Endpoint | Method | Purpose | Parameters |
|----------|--------|---------|------------|
| `/api/ambulances/available` | GET | Get nearby available ambulances | `longitude`, `latitude`, `maxDistance` |
| `/api/emergency-requests` | POST | Create emergency request | `patientName`, `patientPhone`, `location`, `emergencyType`, `severity`, `notes` |

**Service Files:**
- `client/src/services/ambulanceService.js` - Ambulance API calls
- `client/src/services/emergencyRequestService.js` - Emergency request API calls
- `client/src/services/axiosInstance.js` - Axios HTTP client with auth token

### 1.10 Socket.IO Events Listened

**Socket Service:** `client/src/services/socketService.js`

**Events:**

| Event | Trigger | Handler | Purpose |
|-------|---------|---------|---------|
| `emergency:request:accepted` | Ambulance accepts request | `handleRequestAccepted()` | Update UI, show acceptance, redirect to hospital page |
| `emergency:status:updated` | Request status changes | `handleStatusUpdate()` | Update status message |
| `ambulance:location:updated` | Ambulance moves | `handleAmbulanceLocationUpdate()` | Update ambulance location on map |

**Connection:**
```javascript
useEffect(() => {
  socketService.connect();  // Connect on mount
  return () => socketService.disconnect();  // Disconnect on unmount
}, []);
```


### 1.11 Request Ambulance Workflow

**Function:** `handleAcceptAmbulance(ambulanceId)`

**Triggered:** When user clicks "REQUEST THIS AMBULANCE" button

**Flow:**
```javascript
1. Validate ambulanceId and userLoc
2. Create request data object:
   {
     patientName: user.name,
     patientPhone: user.phone,
     location: {
       longitude: userLoc.lng,
       latitude: userLoc.lat,
       address: userLoc.name
     },
     emergencyType: 'Medical',
     severity: 'High',
     notes: 'Emergency request for ambulance {ambulanceId}'
   }
3. Call emergencyRequestService.createEmergencyRequest(requestData)
4. Save emergencyRequestId to state and localStorage
5. Set requestStatus to 'pending'
6. Wait for Socket.IO event 'emergency:request:accepted'
```

**Result:**
- Creates emergency request in database
- Backend notifies nearby ambulance drivers via Socket.IO
- Patient waits for acceptance
- UI shows "Waiting for ambulance personnel to accept..."

### 1.12 Live Tracking Simulation

**Issue:** MOCK SIMULATION, NOT REAL TRACKING

```javascript
useEffect(() => {
  intervalRef.current = setInterval(() => {
    setAmbulances(prev => prev.map(amb => ({
      ...amb,
      lat: amb.lat + (Math.random() - 0.5) * 0.003,  // Random movement
      lng: amb.lng + (Math.random() - 0.5) * 0.003,
    })));
  }, 3000);  // Every 3 seconds
}, []);
```

**Problem:** This is CLIENT-SIDE simulation. Real ambulances are not moving!


---

## 2. Backend Analysis

### 2.1 API Endpoints

**File:** `server/src/routes/ambulanceRoutes.js` and `server/src/routes/emergencyRequestRoutes.js`

#### Get Available Ambulances

**Endpoint:** `GET /api/ambulances/available`
**Controller:** `ambulanceController.getAvailableAmbulances()`
**Service:** `ambulanceService.getAvailableAmbulances()`
**Query Parameters:**
- `longitude` (required)
- `latitude` (required)
- `maxDistance` (optional, default: 20000m = 20km)

#### Create Emergency Request

**Endpoint:** `POST /api/emergency-requests`
**Controller:** `emergencyRequestController.createEmergencyRequest()`
**Service:** `emergencyRequestService.createRequest()`
**Body:**
```json
{
  "patientName": "String",
  "patientPhone": "String",
  "location": {
    "longitude": Number,
    "latitude": Number,
    "address": "String"
  },
  "emergencyType": "Medical|Accident|Cardiac|Respiratory|Other",
  "severity": "Low|Medium|High|Critical",
  "notes": "String"
}
```


### 2.2 Controller Logic

**File:** `server/src/controllers/ambulanceController.js`

```javascript
export const getAvailableAmbulances = catchAsync(async (req, res) => {
  const { longitude, latitude, maxDistance } = req.query;

  const ambulances = await ambulanceService.getAvailableAmbulances(
    parseFloat(longitude),
    parseFloat(latitude),
    maxDistance ? parseInt(maxDistance) : undefined
  );

  res.status(200).json({
    status: 'success',
    results: ambulances.length,
    data: { ambulances },
  });
});
```

**File:** `server/src/controllers/emergencyRequestController.js`

```javascript
export const createEmergencyRequest = catchAsync(async (req, res) => {
  const emergencyRequest = await emergencyRequestService.createRequest(
    req.body,
    req.user._id  // Patient ID from auth middleware
  );

  res.status(201).json({
    status: 'success',
    message: 'Emergency request created successfully',
    data: { emergencyRequest },
  });
});
```


### 2.3 Service Layer Logic

**File:** `server/src/services/ambulanceService.js`

#### `getAvailableAmbulances(longitude, latitude, maxDistance = 20000)`

**Query Logic:**
```javascript
const ambulances = await Ambulance.find({
  status: 'Available',         // Only available ambulances
  isOnline: true,              // Only online ambulances
  isActive: true,              // Only active ambulances
  fuelLevel: { $gte: 20 },     // At least 20% fuel
  location: {
    $near: {                   // MongoDB geospatial query
      $geometry: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      $maxDistance: maxDistance,  // Within radius
    },
  },
})
.populate('hospital', 'name address phone')
.populate('driver', 'name phone')
.limit(10);  // Maximum 10 results
```

**Distance Calculation:** MongoDB's `$near` operator (uses Haversine formula internally)

**Result:** Returns array of ambulances sorted by distance (closest first)


**File:** `server/src/services/emergencyRequestService.js`

#### `createRequest(requestData, patientId)`

**Logic:**
```javascript
1. Check if patient has active request (prevent duplicates)
2. Validate coordinates
3. Create EmergencyRequest document in MongoDB:
   {
     patient: patientId,
     patientName,
     patientPhone,
     location: {
       type: 'Point',
       coordinates: [longitude, latitude],
       address
     },
     emergencyType,
     severity,
     notes,
     status: 'PENDING',
     isActive: true
   }
4. Find nearby available ambulances (50km radius)
5. Emit Socket.IO event to ambulance drivers:
   Event: 'emergency:request:new'
   Target: user_{ambulanceDriverId}
6. Return created emergency request
```

**Nearby Ambulance Query:**
```javascript
const nearbyAmbulances = await Ambulance.find({
  status: 'Available',
  isOnline: true,
  isActive: true,
  fuelLevel: { $gte: 20 },
  location: {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      $maxDistance: 50000,  // 50km
    },
  },
}).limit(10);
```

**Socket.IO Emission:**
```javascript
nearbyAmbulances.forEach((ambulance) => {
  if (ambulance.driver) {
    io.to(`user_${ambulance.driver.toString()}`).emit('emergency:request:new', {
      requestId: emergencyRequest._id,
      request: { /* request details */ }
    });
  }
});
```


### 2.4 Database Models

#### EmergencyRequest Model
**File:** `server/src/models/EmergencyRequest.js`

**Schema:**
```javascript
{
  requestId: String (unique, auto-generated),
  patient: ObjectId → User,
  patientName: String,
  patientPhone: String,
  location: {
    type: 'Point',
    coordinates: [longitude, latitude],
    address: String
  },
  status: Enum [
    'PENDING', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 
    'PATIENT_PICKED', 'HOSPITAL_REACHED', 'COMPLETED', 
    'CANCELLED', 'REJECTED'
  ],
  assignedAmbulance: ObjectId → Ambulance,
  ambulancePersonnel: ObjectId → User,
  acceptedAt: Date,
  arrivedAt: Date,
  pickedUpAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  estimatedArrival: Date,
  emergencyType: Enum ['Medical', 'Accident', 'Cardiac', 'Respiratory', 'Other'],
  severity: Enum ['Low', 'Medium', 'High', 'Critical'],
  notes: String,
  rejectionReason: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `requestId` (unique)
- `patient`
- `status`
- `assignedAmbulance`
- `location` (2dsphere - geospatial)
- `createdAt`


#### Ambulance Model
**File:** `server/src/models/Ambulance.js`

**Schema:**
```javascript
{
  vehicleNumber: String (unique),
  type: Enum ['Basic Life Support', 'Advanced Life Support', 'Air Ambulance', 'Patient Transport'],
  hospital: ObjectId → Hospital,
  driver: ObjectId → User,
  paramedics: [ObjectId → User],
  location: {
    type: 'Point',
    coordinates: [longitude, latitude]
  },
  currentLocation: {
    type: 'Point',
    coordinates: [longitude, latitude]
  },
  lastLocationUpdate: Date,
  isOnline: Boolean,
  status: Enum ['Available', 'En Route', 'On Scene', 'Transporting', 'At Hospital', 'Out of Service'],
  equipment: {
    defibrillator, oxygenSupply, ventilator, 
    stretcher, firstAidKit, spinalBoard
  },
  capacity: Number,
  licensePlate: String,
  model: String,
  year: Number,
  lastMaintenance: Date,
  nextMaintenance: Date,
  fuelLevel: Number (0-100),
  mileage: Number,
  isActive: Boolean,
  currentEmergency: ObjectId → Emergency,
  currentRequest: ObjectId → EmergencyRequest,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `location` (2dsphere - geospatial)
- `currentLocation` (2dsphere - geospatial)
- `vehicleNumber` (unique)
- `status`
- `hospital`
- `driver`
- `isOnline`


### 2.5 Socket.IO Events Emitted

**File:** `server/src/services/emergencyRequestService.js` and `server/src/socket/emergency.socket.js`

#### Event: `emergency:request:new`

**Emitted When:** Emergency request is created
**Target:** Ambulance drivers (`user_{driverId}`)
**Payload:**
```javascript
{
  requestId: String,
  request: {
    id: String,
    requestId: String,
    patientName: String,
    location: Object,
    emergencyType: String,
    severity: String,
    createdAt: Date
  }
}
```

#### Event: `emergency:request:accepted`

**Emitted When:** Ambulance personnel accepts request
**Target:** Patient (`user_{patientId}`)
**Payload:**
```javascript
{
  requestId: String,
  request: {
    id: String,
    requestId: String,
    status: 'ACCEPTED',
    ambulance: {
      id: String,
      vehicleNumber: String,
      type: String,
      location: Object
    },
    personnel: {
      id: String,
      name: String,
      phone: String
    },
    acceptedAt: Date
  }
}
```


#### Event: `emergency:status:updated`

**Emitted When:** Emergency request status changes
**Target:** Patient (`user_{patientId}`)
**Payload:**
```javascript
{
  requestId: String,
  status: String,
  updatedAt: Date
}
```

#### Event: `ambulance:location:updated`

**Emitted When:** Ambulance location is updated
**Target:** Patient with active request
**Payload:**
```javascript
{
  ambulanceId: String,
  location: {
    type: 'Point',
    coordinates: [longitude, latitude]
  },
  timestamp: Date
}
```

### 2.6 Files Involved in Workflow

| File | Purpose |
|------|---------|
| `server/src/routes/ambulanceRoutes.js` | Route definitions for ambulance endpoints |
| `server/src/routes/emergencyRequestRoutes.js` | Route definitions for emergency request endpoints |
| `server/src/controllers/ambulanceController.js` | Request handling for ambulance endpoints |
| `server/src/controllers/emergencyRequestController.js` | Request handling for emergency request endpoints |
| `server/src/services/ambulanceService.js` | Business logic for ambulance operations |
| `server/src/services/emergencyRequestService.js` | Business logic for emergency requests |
| `server/src/models/Ambulance.js` | Ambulance database schema |
| `server/src/models/EmergencyRequest.js` | Emergency request database schema |
| `server/src/socket/emergency.socket.js` | Socket.IO event handlers for emergency |
| `server/src/socket/ambulance.socket.js` | Socket.IO event handlers for ambulance |
| `server/src/socket/index.js` | Socket.IO initialization |


---

## 3. Data Flow

### Current Workflow - Patient Emergency Request

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PATIENT EMERGENCY PAGE                           │
└─────────────────────────────────────────────────────────────────────────┘

STEP 1: LOCATION SEARCH
━━━━━━━━━━━━━━━━━━━━━━━
Patient enters location (e.g., "Bandra Mumbai")
         ↓
handleSearch() function
         ↓
OpenStreetMap Nominatim API
  GET https://nominatim.openstreetmap.org/search
         ↓
Response: { lat: 19.0610, lng: 72.8348, name: "Bandra Mumbai" }
         ↓
setUserLoc({ lat, lng, name })
setMapCenter([lat, lng])
         ↓
STEP 2: FETCH AMBULANCES
━━━━━━━━━━━━━━━━━━━━━━━
fetchAmbulances(lng, lat, 50000)
         ↓
ambulanceService.getAvailable(longitude, latitude, maxDistance)
         ↓
API Call: GET /api/ambulances/available?longitude=72.8348&latitude=19.0610&maxDistance=50000
         ↓
Backend: ambulanceController.getAvailableAmbulances()
         ↓
Backend: ambulanceService.getAvailableAmbulances()
         ↓
MongoDB Query:
  Ambulance.find({
    status: 'Available',
    isOnline: true,
    isActive: true,
    fuelLevel: { $gte: 20 },
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [72.8348, 19.0610] },
        $maxDistance: 50000
      }
    }
  }).limit(10)
         ↓
IF MongoDB has ambulances:
  Response: [{ _id, vehicleNumber, type, currentLocation, status, ... }]
         ↓
ELSE (No ambulances or API fails):
  Generate MOCK DATA (10 random ambulances around location)
         ↓
setAmbulances(transformedData)
Map displays ambulance markers
Available Ambulances panel populated


STEP 3: SELECT AMBULANCE
━━━━━━━━━━━━━━━━━━━━━━━
Patient clicks on ambulance card
         ↓
setSelectedAmbulanceId(ambulanceId)
         ↓
"REQUEST THIS AMBULANCE" button appears
         ↓
Patient clicks "REQUEST THIS AMBULANCE"
         ↓
STEP 4: CREATE EMERGENCY REQUEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
handleAcceptAmbulance(ambulanceId)
         ↓
emergencyRequestService.createEmergencyRequest({
  patientName: user.name,
  patientPhone: user.phone,
  location: {
    longitude: userLoc.lng,
    latitude: userLoc.lat,
    address: userLoc.name
  },
  emergencyType: 'Medical',
  severity: 'High',
  notes: 'Emergency request for ambulance {ambulanceId}'
})
         ↓
API Call: POST /api/emergency-requests
         ↓
Backend: emergencyRequestController.createEmergencyRequest()
         ↓
Backend: emergencyRequestService.createRequest(requestData, patientId)
         ↓
MongoDB: Create EmergencyRequest document
  {
    requestId: 'EMR-...',
    patient: patientId,
    patientName, patientPhone, location,
    emergencyType, severity, notes,
    status: 'PENDING',
    isActive: true
  }
         ↓
MongoDB: Find nearby ambulances (50km)
  nearbyAmbulances = Ambulance.find({ status: 'Available', ... }).limit(10)
         ↓
Socket.IO: Emit to ambulance drivers
  FOR EACH ambulance:
    io.to(`user_${ambulance.driver}`).emit('emergency:request:new', { requestId, request })
         ↓
Response: { status: 'success', data: { emergencyRequest: { _id, requestId, ... } } }
         ↓
Frontend: setEmergencyRequestId(response.data.emergencyRequest._id)
Frontend: setRequestStatus('pending')
Frontend: Save to localStorage
Frontend: Display "Waiting for ambulance personnel to accept..."


STEP 5: AMBULANCE PERSONNEL ACCEPTS (On Ambulance Dashboard)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ambulance Personnel receives Socket.IO event 'emergency:request:new'
         ↓
Displays notification in Ambulance Dashboard
         ↓
Personnel clicks "Accept Request"
         ↓
API Call: PATCH /api/emergency-requests/{requestId}/accept
Body: { ambulanceId }
         ↓
Backend: emergencyRequestController.acceptRequest()
         ↓
Backend: emergencyRequestService.acceptRequest(requestId, ambulanceId, personnelId)
         ↓
MongoDB: Update EmergencyRequest
  {
    status: 'ACCEPTED',
    assignedAmbulance: ambulanceId,
    ambulancePersonnel: personnelId,
    acceptedAt: new Date()
  }
         ↓
MongoDB: Update Ambulance
  {
    status: 'En Route',
    currentEmergency: requestId,
    currentRequest: requestId
  }
         ↓
Socket.IO: Emit to patient
  io.to(`user_${patientId}`).emit('emergency:request:accepted', {
    requestId,
    request: { ambulance: { ... }, personnel: { ... } }
  })
         ↓
STEP 6: PATIENT RECEIVES ACCEPTANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Frontend: handleRequestAccepted() listener triggered
         ↓
setRequestStatus('accepted')
setAcceptedAmbulance(data.request.ambulance)
setAmbulanceLocation(data.request.ambulance.location)
         ↓
Display: "✅ Ambulance {vehicleNumber} is on the way!"
Toast: "Ambulance {vehicleNumber} accepted your request!"
         ↓
Wait 3 seconds
         ↓
setWorkflowStep('hospital')
navigate('/hospital')
         ↓
Patient redirected to Hospital Selection page
```

