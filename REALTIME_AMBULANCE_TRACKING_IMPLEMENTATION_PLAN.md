# Real-Time Ambulance Tracking Implementation Plan

## Overview
This document outlines the implementation of real-time GPS-based ambulance tracking for the TrackER AI system, replacing demo data with live location tracking.

---

## Current State Analysis

### Frontend (Emergency.jsx)
- ✅ Leaflet map implementation exists
- ✅ Socket.IO client service exists  
- ✅ Ambulance service with API calls exists
- ❌ Uses demo/mock ambulance data
- ❌ Simulates movement with random coordinates
- ❌ No GPS tracking for ambulance personnel

### Backend
- ✅ Ambulance model with location field (GeoJSON Point)
- ✅ 2dsphere index on location field
- ✅ API endpoint `/ambulances/available` with geospatial query
- ✅ Socket.IO server configured
- ❌ No GPS location update endpoint for ambulance personnel
- ❌ No real-time location broadcasting

---

## Implementation Steps

### Phase 1: Backend - Location Update API
**File:** `server/src/controllers/ambulanceController.js`
**File:** `server/src/services/ambulanceService.js`
**File:** `server/src/routes/ambulanceRoutes.js`

**New Endpoint:**
```javascript
PUT /api/ambulances/location
Body: {
  latitude: Number,
  longitude: Number,
  timestamp: String,
  status: String (optional, default: "Available")
}
Headers: {
  Authorization: "Bearer <token>"
}
```

**Logic:**
1. Extract user ID from JWT token
2. Find ambulance by driver/paramedic user ID
3. Update or create location document
4. Update `location.coordinates` array [longitude, latitude]
5. Update `status` if provided
6. Save with timestamp
7. Emit Socket.IO event: `ambulance:location:updated`
8. Return updated ambulance

**Schema Addition to Ambulance Model:**
```javascript
lastLocationUpdate: {
  type: Date,
  default: Date.now
},
currentLocation: {
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    default: [0, 0]
  }
}
```

### Phase 2: Frontend - GPS Location Sharing (Ambulance Personnel)
**New File:** `client/src/utils/gpsTracking.js`

**Features:**
- Check GPS permission
- Request permission if needed
- Use `navigator.geolocation.watchPosition()`
- Throttle updates to every 5 seconds
- Send to backend via API
- Handle errors gracefully
- Stop tracking on logout

**Integration Points:**
- Call from AmbulanceDashboard.jsx `useEffect`
- Call from AuthContext logout function (cleanup)
- Show permission UI if denied

### Phase 3: Frontend - Real-Time Map Updates (Patient)
**File:** `client/src/pages/Emergency.jsx`

**Changes:**
1. Remove mock data generation
2. Remove random movement simulation
3. Subscribe to Socket.IO `ambulance:location:updated` event
4. Update ambulance markers in real-time
5. Keep existing map UI/styling
6. Show "No ambulances nearby" if result is empty

### Phase 4: Socket.IO Real-Time Broadcasting
**File:** `server/src/socket/handlers/ambulanceHandlers.js` (new)
**File:** `server/src/socket/index.js`

**Events:**
- Server emits: `ambulance:location:updated` with ambulance data
- Clients subscribe to this event
- Broadcast to all connected patients in nearby area

### Phase 5: Search Logic Enhancement
**File:** `server/src/services/ambulanceService.js`

**Endpoint:** `GET /api/ambulances/nearby`
**Query Params:**
- `latitude`: User's latitude
- `longitude`: User's longitude  
- `maxDistance`: Search radius in meters (default: 50000 = 50km)

**Logic:**
1. Use MongoDB `$geoNear` aggregation
2. Filter by `status === "Available"`
3. Filter by `isActive === true`
4. Filter by `lastLocationUpdate` within last 5 minutes (stale location check)
5. Sort by distance ascending
6. Return array of ambulances with distance

---

## Error Handling

### GPS Permission Denied
```javascript
UI Message: "Location access is required to appear in nearby ambulance searches."
Behavior: Show warning banner, don't crash app
```

### GPS Unavailable
```javascript
UI Message: "GPS is currently unavailable. Please check your device settings."
Behavior: Show error, retry after 30 seconds
```

### No Nearby Ambulances
```javascript
UI Message: "No available ambulances found within this area."
Behavior: Show empty state, suggest expanding search radius
```

### API Errors
```javascript
UI Message: "Failed to update location. Retrying..."
Behavior: Retry with exponential backoff
```

---

## Performance Optimizations

1. **Throttling:** Location updates limited to every 5 seconds
2. **Batch Updates:** Socket.IO room-based broadcasting
3. **Stale Data:** Only show ambulances updated within last 5 minutes
4. **Caching:** Redis cache for frequently queried areas (future enhancement)
5. **Indexes:** MongoDB 2dsphere index on location field

---

## Testing Checklist

### Ambulance Personnel Side
- [ ] Login as ambulance personnel
- [ ] GPS permission requested
- [ ] Grant permission → location updates sent
- [ ] Deny permission → warning message shown
- [ ] Location updates every 5 seconds
- [ ] Logout → tracking stops
- [ ] No app crashes

### Patient Side
- [ ] Search location → geocode to coordinates
- [ ] Call `/api/ambulances/nearby` with coordinates
- [ ] Display only available ambulances
- [ ] Markers show on map
- [ ] Real-time updates (ambulances move on map)
- [ ] No demo data shown
- [ ] Empty state when no ambulances

### Backend
- [ ] PUT `/api/ambulances/location` works
- [ ] Socket.IO broadcasts location updates
- [ ] GET `/api/ambulances/nearby` returns correct results
- [ ] Geospatial query performs well (<100ms)
- [ ] Stale locations filtered out

---

## Files to Create/Modify

### New Files
1. `client/src/utils/gpsTracking.js` - GPS tracking utility
2. `client/src/hooks/useGPSTracking.js` - React hook for GPS tracking
3. `server/src/socket/handlers/ambulanceHandlers.js` - Socket.IO handlers
4. `server/src/services/locationService.js` - Location update business logic

### Modified Files
1. `client/src/pages/Emergency.jsx` - Remove demo data, add real-time updates
2. `client/src/pages/AmbulanceDashboard.jsx` - Add GPS tracking
3. `client/src/services/ambulanceService.js` - Add location update method
4. `server/src/models/Ambulance.js` - Add lastLocationUpdate field
5. `server/src/controllers/ambulanceController.js` - Add updateMyLocation controller
6. `server/src/services/ambulanceService.js` - Add location update service
7. `server/src/routes/ambulanceRoutes.js` - Add location update route
8. `server/src/socket/index.js` - Register ambulance handlers
9. `client/src/context/AuthContext.jsx` - Add GPS cleanup on logout

---

## Security Considerations

1. **Authentication:** Location updates require valid JWT token
2. **Authorization:** Only ambulance personnel can update locations
3. **Rate Limiting:** Prevent spam updates (max 1 per 5 seconds per user)
4. **Data Validation:** Validate latitude/longitude ranges
5. **Privacy:** Don't expose personnel personal data to patients

---

## Backwards Compatibility

- ✅ All existing pages work unchanged
- ✅ All existing routes work unchanged
- ✅ All existing styling preserved
- ✅ Authentication unchanged
- ✅ Role management unchanged
- ✅ If GPS fails, show appropriate error (don't break app)

---

## Future Enhancements (Not in Scope)

- Historical location tracking
- Route optimization
- Predictive availability
- Driver/paramedic shift management
- Offline mode with location queue

---

## Success Criteria

1. Ambulance personnel login → GPS tracking starts automatically
2. Patient searches → sees only real ambulances within radius
3. Ambulance moves → patient map updates in real-time
4. No demo data visible to patients
5. All existing features work normally
6. No UI redesign
7. No breaking changes

---

This implementation will be done incrementally, testing each phase before moving to the next.
