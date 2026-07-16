# Development Reset Implementation Summary

## Problem Statement
During repeated SOS workflow testing, the backend returns:
> **"You already have an active emergency request"**

This occurs because old emergency requests remain in the database with `isActive: true` and statuses like `PENDING`, `ACCEPTED`, or `EN_ROUTE`.

---

## Solution Implemented

A **clean development reset mechanism** that clears all SOS workflow data while preserving user accounts and seeded data.

---

## Data Analysis

### Collections Storing SOS State:

#### 1. **EmergencyRequest Collection**
**Fields Blocking Fresh Tests:**
- `isActive: true`
- `status: ['PENDING', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'PATIENT_PICKED']`
- `patient: <userId>` (one active request per patient check)

**Issue:** The `createRequest` service checks:
```javascript
const activeRequest = await EmergencyRequest.findOne({
  patient: patientId,
  isActive: true,
  status: { $in: ['PENDING', 'ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'PATIENT_PICKED'] },
});

if (activeRequest) {
  throw new AppError('You already have an active emergency request', 400);
}
```

#### 2. **Emergency Collection**
**Fields:**
- `isActive: true`
- `status: various emergency states`
- Linked to ambulances and hospitals

**Issue:** Can contain old emergency records that interfere with fresh tests.

#### 3. **Ambulance Collection**
**Fields Needing Reset:**
- `status: 'En Route' | 'On Scene' | 'Transporting'` (should be `'Available'`)
- `isOnline: false` (should be `true` for testing)
- `currentEmergency: <emergencyId>` (should be `null`)
- `currentRequest: <requestId>` (should be `null`)

**Issue:** Ambulances stuck in busy states prevent them from accepting new requests.

#### 4. **Vital Collection**
**Impact:** Accumulates during testing, not blocking but clutters database.

#### 5. **Consultation Collection**
**Impact:** Accumulates during doctor consultation workflow.

#### 6. **Notification Collection**
**Impact:** Accumulates feedback notifications, clutters ambulance dashboard.

#### 7. **Feedback Collection**
**Impact:** Accumulates patient feedback records.

#### 8. **Socket.IO State**
**Type:** In-memory (not persistent)
**Impact:** Rooms and connections are temporary, cleared on disconnect/reconnect.
**No action needed:** Automatically cleared when clients reconnect.

---

## Files Created

### 1. Backend Controller
**File:** `server/src/controllers/devResetController.js`

**Functions:**
- `resetSOSWorkflow()` - Clears all SOS workflow data
- `getSystemState()` - Shows current system state counts

**Features:**
- Deletes all emergency requests
- Deletes all emergencies
- Resets all ambulances to Available/Online
- Deletes all vitals, consultations, notifications, feedback
- Provides detailed reset summary
- Error handling with partial reset reporting

### 2. Backend Routes
**File:** `server/src/routes/devResetRoutes.js`

**Endpoints:**
- `GET /api/dev/state` - View system state (public)
- `POST /api/dev/reset-sos` - Reset SOS workflow (authenticated)

**Security:**
- Authentication required for reset endpoint
- Only enabled in development environment

### 3. Route Registration
**File:** `server/src/routes/index.js`

**Changes:**
- Import devResetRoutes
- Register under `/api/dev/*` only if `NODE_ENV=development`
- Automatically disabled in production

### 4. Documentation
**File:** `DEV_RESET_GUIDE.md`

**Contents:**
- Problem explanation
- API endpoint documentation
- Usage guides (Postman, cURL, Scripts)
- Safety features
- Troubleshooting
- Testing workflow examples

### 5. Reset Scripts
**Files:** 
- `reset-sos.sh` (Linux/Mac)
- `reset-sos.bat` (Windows)

**Features:**
- One-command reset
- Color-coded output
- Automatic login and token handling
- Before/after state comparison
- Error handling

---

## Reset Operation Details

### What Gets Deleted:

```javascript
// 1. All Emergency Requests
EmergencyRequest.deleteMany({})
// Removes ALL requests regardless of status
// Clears: PENDING, ACCEPTED, COMPLETED, CANCELLED, REJECTED

// 2. All Emergencies
Emergency.deleteMany({})
// Removes all emergency records

// 3. All Vitals
Vital.deleteMany({})
// Removes all IoT vital monitoring records

// 4. All Consultations
Consultation.deleteMany({})
// Removes all doctor consultation records

// 5. All Notifications
Notification.deleteMany({})
// Removes all feedback notifications

// 6. All Feedback
Feedback.deleteMany({})
// Removes all patient feedback records
```

### What Gets Reset (Not Deleted):

```javascript
// Ambulances - Only status fields reset
Ambulance.updateMany({}, {
  $set: {
    status: 'Available',        // Make available for new requests
    isOnline: true,             // Make visible to patients
    currentEmergency: null,     // Clear current assignment
    currentRequest: null,       // Clear current request
    isActive: true,             // Ensure active
  }
})
// Vehicle data preserved: vehicleNumber, type, equipment, driver, hospital
```

### What Stays Unchanged:

- **User Collection** - All users (patients, ambulance personnel, doctors)
- **Hospital Collection** - All hospital data
- **Ambulance vehicles** - Vehicle details (only status reset)
- **Authentication tokens** - All JWT tokens remain valid
- **Database schemas** - No schema modifications

---

## Safety Features

### 1. Environment Protection
```javascript
// In routes/index.js
if (config.env === 'development') {
  router.use('/dev', devResetRoutes);
}
```
Routes only registered in development mode.

### 2. Authentication Required
```javascript
// In routes/devResetRoutes.js
router.post('/reset-sos', authenticate, resetSOSWorkflow);
```
Must be logged in to reset.

### 3. Atomic Operations
```javascript
try {
  const result = await EmergencyRequest.deleteMany({});
  summary.emergencyRequests.deleted = result.deletedCount;
} catch (error) {
  // Continue with other operations, report partial success
}
```
Each operation isolated, partial resets possible.

### 4. Detailed Logging
```javascript
logger.info('=== STARTING SOS WORKFLOW RESET (DEV ONLY) ===');
logger.info(`Deleted ${deletedCount} emergency requests`);
```
All operations logged for debugging.

### 5. Response Summary
```json
{
  "summary": {
    "emergencyRequests": { "deleted": 5 },
    "ambulances": { "reset": 10 }
  },
  "preserved": {
    "users": "All user accounts preserved",
    "authentication": "All login tokens still valid"
  }
}
```
Shows exactly what was changed.

---

## Usage Examples

### Quick Reset (Linux/Mac):
```bash
chmod +x reset-sos.sh
./reset-sos.sh
```

### Quick Reset (Windows):
```cmd
reset-sos.bat
```

### Manual Reset (cURL):
```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient@test.com","password":"password123"}' \
  | jq -r '.data.token')

# Reset
curl -X POST http://localhost:5000/api/dev/reset-sos \
  -H "Authorization: Bearer $TOKEN"
```

### Check State:
```bash
curl http://localhost:5000/api/dev/state
```

---

## Testing Workflow

### Before Reset:
1. Patient tries to create SOS request
2. Backend checks for active requests
3. Finds old request: `status: 'COMPLETED', isActive: true`
4. Returns: **"You already have an active emergency request"** ❌

### After Reset:
1. Run: `./reset-sos.sh`
2. All emergency requests deleted
3. Patient tries to create SOS request
4. Backend finds no active requests
5. Request created successfully ✅

### Complete Test Cycle:
```bash
# 1. Reset system
./reset-sos.sh

# 2. Test Patient SOS (Browser 1)
#    - Login as Patient
#    - Create emergency request ✅
#    - Wait for acceptance

# 3. Test Ambulance (Browser 2)
#    - Login as Ambulance Personnel
#    - Accept request ✅
#    - Update status through workflow

# 4. Complete workflow
#    - Hospital selection
#    - Vitals monitoring
#    - Doctor consultation
#    - Discharge

# 5. Reset again for next test
./reset-sos.sh
```

---

## Verification

### Before Reset:
```bash
curl http://localhost:5000/api/dev/state
```
Response:
```json
{
  "emergencyRequests": {
    "total": 5,
    "active": 2,
    "pending": 1
  },
  "ambulances": {
    "available": 6,
    "busy": 4
  }
}
```

### After Reset:
```bash
curl http://localhost:5000/api/dev/state
```
Response:
```json
{
  "emergencyRequests": {
    "total": 0,
    "active": 0,
    "pending": 0
  },
  "ambulances": {
    "available": 10,
    "busy": 0
  }
}
```

---

## Production Safety

### Automatic Disabling:
When `NODE_ENV=production`:
- `/api/dev/*` routes not registered
- Controller code exists but unreachable
- 404 error if attempted: `Cannot POST /api/dev/reset-sos`

### Environment Check:
```javascript
// In routes/index.js
if (config.env === 'development') {
  router.use('/dev', devResetRoutes);
}
// In production: this block never executes
```

### Configuration:
```bash
# .env file
NODE_ENV=production  # Routes disabled
NODE_ENV=development # Routes enabled
```

---

## Summary

| Aspect | Implementation |
|--------|---------------|
| **Problem** | "Active emergency request" error during testing |
| **Root Cause** | Old requests with `isActive: true` in database |
| **Solution** | Development reset endpoint to clear SOS data |
| **Data Cleared** | 7 collections (requests, vitals, consultations, etc.) |
| **Data Preserved** | Users, hospitals, ambulance vehicles |
| **Security** | Auth required, development only |
| **Automation** | Shell scripts for one-command reset |
| **Verification** | State endpoint shows before/after counts |
| **Production** | Automatically disabled in production |

---

## Result

✅ **Problem Solved:** No more "active request" errors  
✅ **Quick Reset:** One command clears all test data  
✅ **Safe Testing:** Data preserved, easy to reset  
✅ **Automated:** Scripts handle login and reset  
✅ **Production Safe:** Only works in development  

**You can now test the SOS workflow repeatedly without manual database cleanup!**
