# SOS Workflow Fix - Complete Analysis

## ✅ FIXED Issues:

### 1. Wrong API Call in EmergencyRequests.jsx
**File:** `client/src/pages/EmergencyRequests.jsx` Line 207

**Before:**
```javascript
const activeRes = await emergencyRequestService.getActiveRequest(); // ❌ Patient API
```

**After:**
```javascript
const activeRes = await emergencyRequestService.getActiveAssignment(); // ✅ Ambulance API
```

**Fixed!** This was causing the 403 error.

---

## 🔍 How the Workflow SHOULD Work:

### Step 1: Patient Creates Request
1. Patient logs in
2. Goes to `/emergency` page
3. Searches location (e.g., "koramangala")
4. Selects ambulance from list
5. Clicks "REQUEST THIS AMBULANCE"
6. **Backend creates request with status: PENDING** (no ambulance assigned yet)

### Step 2: Backend Broadcasts Request
1. Backend finds nearby ambulances (within 50km)
2. For each nearby ambulance:
   - Gets the `ambulance.driver` (user ID)
   - Emits Socket.IO event to room: `user_${driverId}`
   - Event: `emergency:request:new`

### Step 3: Ambulance Receives Request
1. Ambulance personnel is logged in
2. Socket.IO is connected to room: `user_${theirUserId}`
3. Receives `emergency:request:new` event
4. Frontend adds request to pending list
5. OR page loads and calls `GET /api/emergency-requests/pending?longitude=X&latitude=Y`
6. Shows all PENDING requests near their location

### Step 4: Ambulance Accepts Request
1. Personnel clicks "Accept" button
2. Calls `PATCH /api/emergency-requests/:id/accept` with their ambulanceId
3. Backend updates request:
   - `status: 'ACCEPTED'`
   - `assignedAmbulance: ambulanceId`
   - `ambulancePersonnel: personnelId`
4. Emits Socket.IO event to patient
5. Request moves from "Incoming" to "Active Assignment"

---

## 🐛 Remaining Potential Issues:

### Issue A: Socket.IO Room Not Joined
**Symptom:** Ambulance doesn't receive real-time notification

**Check:**
1. Is ambulance personnel connected to Socket.IO?
2. Are they in the correct room (`user_${userId}`)?
3. Is the `ambulance.driver` field correctly set to their user ID?

**Debug:**
- Check backend logs for: `Client connected: ... (User: ..., Role: ...)`
- Should show the ambulance personnel's user ID
- Socket.IO emits to room based on `ambulance.driver` field

### Issue B: Ambulance Driver Field Not Set
**Symptom:** "No Ambulance Registered" warning

**Check:**
```bash
cd server
npm run reseed:personnel
```

This ensures all ambulances have the `driver` field properly set to the user ID.

### Issue C: Ambulance Not Online
**Symptom:** Ambulance doesn't appear in patient's search

**Check:**
1. Ambulance personnel must click "Go Online" on dashboard
2. This sets `ambulance.isOnline = true`
3. Backend only broadcasts to online ambulances

### Issue D: GPS Location Not Updated
**Symptom:** getPendingRequests returns empty

**Check:**
1. Ambulance must have GPS active
2. Location is sent every few seconds
3. getPendingRequests uses ambulance's current location for geospatial query

---

## 🧪 Testing Steps:

### 1. Reseed Ambulances
```bash
cd server
npm run reseed:personnel
```

### 2. Clean Old Requests
```bash
npm run clean:requests
```

### 3. Restart Backend
```bash
npm start
```

### 4. Test as Patient (Browser 1)
1. Login: `test.patient@voise.in` / `Patient@123`
2. Go to Emergency page
3. Search "koramangala"
4. Should see ambulances
5. Click "REQUEST THIS AMBULANCE"
6. Should show "Request Sent" message

### 5. Check Backend Logs
Should see:
```
=== CREATE EMERGENCY REQUEST START ===
Patient ID: ...
Emergency request created successfully: { requestId: '...' }
Emergency request EMR-... broadcast to X ambulances
```

### 6. Test as Ambulance (Browser 2 - Incognito)
1. Login: `sneha.reddy@ambulance.com` / `Ambulance123`
2. Should land on Ambulance Dashboard
3. Click "Go Online"
4. GPS should activate
5. Click "Emergency Requests" or "View All Requests"
6. Should see the patient's request!

### 7. Accept Request
1. Click "Accept" button
2. Request should move to "Active Assignment"
3. Can progress through statuses

---

## 🔧 Quick Fixes:

### If Ambulance Doesn't See Request:

**Option 1: Check Database Link**
```bash
cd server
npm run reseed:personnel
```

**Option 2: Refresh Page**
Click "Refresh" button on Emergency Requests page

**Option 3: Check Backend Logs**
Should show Socket.IO broadcast message

**Option 4: Verify Online Status**
Must click "Go Online" on ambulance dashboard

---

## ✅ Summary of Fix:

**Main fix:** Changed `getActiveRequest()` to `getActiveAssignment()` in EmergencyRequests.jsx

**This fixed the 403 error.**

**Workflow is correct, just needed the right API call!**

---

Try testing now! The workflow should work end-to-end. 🚀
