# Phase 2 Testing Guide - Patient Emergency Request Flow

## 🎯 Quick Test Instructions

### Prerequisites
1. Backend server running: `cd server && npm run dev`
2. Frontend server running: `cd client && npm run dev`
3. MongoDB connected
4. At least one ambulance seeded in database

---

## 📋 TEST SCENARIO 1: Happy Path

### Step 1: Login as Patient
```
Navigate to: http://localhost:5173/login
Select: "Patient Login" tab
Enter patient credentials
Click: "Sign In"
Expected: Redirect to /patient-dashboard
```

### Step 2: Access Emergency Page
```
From Patient Dashboard
Click: "SOS Emergency" card (red)
Expected: Navigate to /emergency
```

### Step 3: Search Location
```
Enter location: "Koramangala Bangalore"
Click: "Search" button
Expected:
- Loading spinner appears
- Toast: "Found Koramangala"
- Map centers on location
- Ambulances appear on map
- Available ambulances listed on right
- Stats panel shows counts
```

### Step 4: Select Ambulance
```
Click: Any ambulance card in the list
Expected:
- Card highlights in BLUE
- "SELECTED" badge appears
- "REQUEST THIS AMBULANCE" button shows
- Bottom section shows selected ambulance
```

### Step 5: Request Ambulance
```
Click: "REQUEST THIS AMBULANCE" button
Expected:
- Toast: "Creating emergency request..."
- Toast: "Emergency request created! Request ID: EMR-XXXXX-XXXX"
- UI changes to "Pending" state
- Loading spinner with message
- "Waiting for ambulance personnel to accept your request..."
```

### Step 6: Simulate Acceptance (Backend)
**Option A: Using Postman/Thunder Client**
```
PATCH /api/emergency-requests/:requestId/accept
Authorization: Bearer <ambulance_personnel_token>
Body: {
  "ambulanceId": "<ambulance_id_from_database>"
}
```

**Option B: Wait for Phase 3**
```
Login as Ambulance Personnel → Accept from dashboard
```

### Step 7: Verify Acceptance (Frontend)
```
Expected (automatically):
- Large ✅ checkmark appears
- Message: "Request Accepted!"
- Shows ambulance vehicle number
- Shows ambulance type
- Message: "Redirecting to hospital selection..."
- After 3 seconds: Navigate to /hospital
```

---

## 📋 TEST SCENARIO 2: Error Handling

### Test 2A: No Location Searched
```
1. Go to /emergency
2. Click any ambulance (none visible yet)
3. Expected: No action (list empty)
```

### Test 2B: Request Without Selection
```
1. Search location
2. Don't select any ambulance
3. Expected: Bottom section says "Select an ambulance from the list"
```

### Test 2C: API Failure
```
1. Stop backend server
2. Search location
3. Select ambulance
4. Click "REQUEST THIS AMBULANCE"
5. Expected:
   - Toast: "Failed to create emergency request. Please try again."
   - Status message shows error
   - Can try again
```

### Test 2D: Duplicate Request
```
1. Create emergency request
2. While pending, try to create another
3. Expected: Backend prevents duplicate (active request exists)
```

---

## 📋 TEST SCENARIO 3: Socket.IO Events

### Test 3A: Connection
```
Open Browser DevTools → Console
Look for: (silent in production, but socket should connect)
Check: socketService.socket.connected === true
```

### Test 3B: Event Reception
```
1. Create emergency request (status: PENDING)
2. From backend or Postman, accept the request
3. Expected:
   - Frontend instantly updates
   - No page refresh
   - Acceptance UI shows
```

### Test 3C: Ambulance Location Updates
```
1. Have accepted emergency request
2. From backend, emit ambulance location update
3. Expected:
   - Ambulance marker moves on map
   - No flicker or reload
   - Smooth transition
```

---

## 📋 TEST SCENARIO 4: UI States

### Test 4A: Initial State
```
- Search box empty
- No ambulances visible
- Map shows India (zoomed out)
- Stats panel hidden
- No selection
```

### Test 4B: After Location Search
```
- Search box shows location name
- Ambulances visible on map
- Ambulances listed on right
- Stats panel shows counts
- Map centered and zoomed
```

### Test 4C: Ambulance Selected
```
- Selected card highlighted BLUE
- "SELECTED" badge visible
- "REQUEST THIS AMBULANCE" button visible
- Bottom section shows selected ambulance details
```

### Test 4D: Request Pending
```
- Loading spinner visible
- Clear waiting message
- Selected ambulance info shown
- Cannot select another ambulance
- Cannot create another request
```

### Test 4E: Request Accepted
```
- ✅ Large checkmark
- Green success colors
- Ambulance details displayed
- Countdown message visible
- Auto-navigation pending
```

---

## 🔍 VERIFICATION CHECKLIST

### Database Verification
```bash
# Connect to MongoDB
mongosh

# Switch to database
use tracker_db

# Check emergency request created
db.emergencyrequests.find().pretty()

# Verify fields:
- requestId: EMR-XXXXX-XXXX
- patient: <patient_id>
- patientName: <name>
- patientPhone: <phone>
- location.coordinates: [lng, lat]
- status: "PENDING"
- isActive: true
- createdAt: <timestamp>
```

### Network Verification
```
Open Browser DevTools → Network tab
Filter: XHR

Look for:
1. POST /api/emergency-requests (201 Created)
2. WebSocket connection (Socket.IO)
3. GET /api/ambulances/available

Check headers:
- Authorization: Bearer <token>
- Content-Type: application/json
```

### Console Logs (Development)
```javascript
// In Emergency.jsx, temporarily add:
console.log('Emergency request created:', response);
console.log('Socket.IO connected:', socketService.socket.connected);
console.log('Request accepted:', data);
```

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue 1: Ambulances Not Showing
**Symptom:** List says "No Ambulances Nearby"

**Solutions:**
1. Check database has ambulances with location
2. Verify ambulances have `currentLocation` field
3. Check ambulances have `status: 'Available'`
4. Verify 50km radius covers seeded locations
5. Run seed script: `npm run seed:ambulances`

### Issue 2: Request Not Creating
**Symptom:** Toast shows error, no request in database

**Solutions:**
1. Verify user is logged in (token exists)
2. Check user role is "Patient"
3. Verify backend is running
4. Check MongoDB connection
5. Look at server logs for errors

### Issue 3: Socket.IO Not Receiving Events
**Symptom:** Acceptance doesn't trigger UI update

**Solutions:**
1. Check Socket.IO server is running
2. Verify token is passed in auth
3. Check user is in correct room
4. Look at browser console for errors
5. Verify backend emits event correctly

### Issue 4: Map Not Centering
**Symptom:** Map doesn't zoom to location

**Solutions:**
1. Check coordinates are valid [lng, lat]
2. Verify mapCenter state updates
3. Check MapUpdater component renders
4. Inspect Leaflet console errors

---

## 📊 EXPECTED API RESPONSES

### POST /api/emergency-requests
```json
{
  "status": "success",
  "message": "Emergency request created successfully",
  "data": {
    "emergencyRequest": {
      "_id": "6507f1234abcd5678efgh901",
      "requestId": "EMR-ABC123-XYZ",
      "patient": "6507e9876fedc5432ghij123",
      "patientName": "John Doe",
      "patientPhone": "+919876543210",
      "location": {
        "type": "Point",
        "coordinates": [77.6285, 12.9279],
        "address": "Koramangala, Bangalore"
      },
      "status": "PENDING",
      "emergencyType": "Medical",
      "severity": "High",
      "isActive": true,
      "createdAt": "2026-07-13T10:30:00.000Z"
    }
  }
}
```

### Socket.IO: emergency:request:accepted
```json
{
  "requestId": "6507f1234abcd5678efgh901",
  "request": {
    "id": "6507f1234abcd5678efgh901",
    "requestId": "EMR-ABC123-XYZ",
    "status": "ACCEPTED",
    "ambulance": {
      "id": "6507a5678bcde1234fghi567",
      "vehicleNumber": "KA-01-AB-1234",
      "type": "Advanced Life Support",
      "location": {
        "type": "Point",
        "coordinates": [77.6285, 12.9279]
      }
    },
    "personnel": {
      "id": "6507b9012cdef5678ijkl890",
      "name": "Driver Name",
      "phone": "+919876543210"
    },
    "acceptedAt": "2026-07-13T10:31:00.000Z"
  }
}
```

---

## 🎬 VIDEO TEST FLOW

### Recording Checklist
1. ✅ Login as patient
2. ✅ Navigate to emergency page
3. ✅ Search location (show loading)
4. ✅ View ambulances on map and list
5. ✅ Click ambulance card (show highlight)
6. ✅ Click "REQUEST THIS AMBULANCE"
7. ✅ Show pending state
8. ✅ Accept from backend
9. ✅ Show acceptance UI
10. ✅ Auto-navigate to hospital

---

## 📝 TEST REPORT TEMPLATE

```
TEST DATE: _________________
TESTER: ____________________

SCENARIO 1: HAPPY PATH
[ ] Login successful
[ ] Emergency page loads
[ ] Location search works
[ ] Ambulances display
[ ] Selection works
[ ] Request creates successfully
[ ] Pending state shows
[ ] Acceptance received
[ ] Navigation works

SCENARIO 2: ERROR HANDLING
[ ] No location prevents request
[ ] API failure handled
[ ] Toast notifications work
[ ] Error messages clear

SCENARIO 3: SOCKET.IO
[ ] Connection established
[ ] Events received
[ ] UI updates real-time
[ ] No console errors

ISSUES FOUND:
1. _________________________________
2. _________________________________
3. _________________________________

OVERALL STATUS: [ ] PASS  [ ] FAIL

NOTES:
_______________________________________
_______________________________________
_______________________________________
```

---

## ✅ PHASE 2 ACCEPTANCE CRITERIA

### Functional Requirements
- [x] Patient can search location
- [x] Patient can view available ambulances
- [x] Patient can select ambulance
- [x] Patient can request ambulance
- [x] System creates EmergencyRequest
- [x] Patient sees pending state
- [x] Patient receives real-time acceptance
- [x] Patient sees ambulance details
- [x] Auto-navigation to hospital

### Non-Functional Requirements
- [x] No auto-dispatch
- [x] No simulated timeouts
- [x] Real-time Socket.IO updates
- [x] User-friendly error messages
- [x] Loading states for async operations
- [x] Toast notifications for actions
- [x] Clean UI with clear feedback

### Technical Requirements
- [x] Uses emergencyRequestService
- [x] Socket.IO integration
- [x] Proper error handling
- [x] State management
- [x] localStorage persistence
- [x] Workflow context updates

---

**PHASE 2 STATUS: ✅ READY FOR TESTING**

All patient-facing emergency request features are implemented and ready for QA testing.

Next: Phase 3 - Ambulance Personnel Dashboard Integration
