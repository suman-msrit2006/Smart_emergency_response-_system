# Development Reset Guide

## Problem Solved
When repeatedly testing the SOS workflow, old emergency requests remain in the database. The backend returns **"You already have an active emergency request"** even when you want to start fresh.

This guide provides a **clean development reset mechanism** to clear all SOS workflow data while preserving user accounts and seeded data.

---

## What Gets Cleared

### ✅ Deleted (Reset to Fresh State)
1. **Emergency Requests** - All SOS requests (PENDING, ACCEPTED, COMPLETED, etc.)
2. **Emergencies** - All emergency records
3. **Ambulance Status** - Reset to "Available" and "Online"
4. **Ambulance Assignments** - Clear currentEmergency and currentRequest
5. **Vital Records** - All IoT vital monitoring data
6. **Consultations** - All doctor consultation records
7. **Notifications** - All notification records (feedback, alerts)
8. **Feedback** - All patient feedback records

### ✅ Preserved (Unchanged)
1. **User Accounts** - All patients, ambulance personnel, doctors
2. **Login Credentials** - All passwords and authentication tokens
3. **Hospitals** - All hospital data and locations
4. **Ambulance Vehicles** - Vehicle numbers, types, equipment (only status reset)
5. **Database Schemas** - No schema changes

---

## API Endpoints

### 1. Check System State
**GET** `/api/dev/state`

**Authentication:** Not required (public for dev convenience)

**Description:** View current counts of all data in the system

**Response:**
```json
{
  "status": "success",
  "data": {
    "state": {
      "emergencyRequests": {
        "total": 5,
        "active": 2,
        "pending": 1,
        "completed": 2
      },
      "emergencies": {
        "total": 3,
        "active": 1
      },
      "ambulances": {
        "total": 10,
        "available": 6,
        "online": 8,
        "busy": 2
      },
      "vitals": { "total": 150 },
      "consultations": { "total": 8 },
      "notifications": {
        "total": 25,
        "unread": 5
      },
      "feedback": { "total": 12 }
    }
  }
}
```

---

### 2. Reset SOS Workflow
**POST** `/api/dev/reset-sos`

**Authentication:** Required (any authenticated user)

**Description:** Clear all SOS workflow data for fresh testing

**Request:**
```bash
# You must be logged in (include Authorization header)
POST http://localhost:5000/api/dev/reset-sos
Headers:
  Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "status": "success",
  "message": "SOS workflow reset successfully. System is ready for fresh testing.",
  "data": {
    "summary": {
      "emergencyRequests": { "deleted": 5 },
      "emergencies": { "deleted": 3 },
      "ambulances": { "reset": 10 },
      "vitals": { "deleted": 150 },
      "consultations": { "deleted": 8 },
      "notifications": { "deleted": 25 },
      "feedback": { "deleted": 12 }
    },
    "preserved": {
      "users": "All user accounts preserved",
      "hospitals": "All hospital data preserved",
      "ambulanceVehicles": "Ambulance vehicle data preserved (status reset)",
      "authentication": "All login tokens still valid"
    },
    "note": "You can now start a fresh SOS test workflow without 'active request' errors."
  }
}
```

---

## Usage Guide

### Method 1: Using Postman/Thunder Client

1. **Check Current State (Optional)**
   ```
   GET http://localhost:5000/api/dev/state
   ```

2. **Login to Get Token**
   ```
   POST http://localhost:5000/api/auth/login
   Body:
   {
     "email": "patient@test.com",
     "password": "password123"
   }
   ```
   Copy the `token` from response.

3. **Reset SOS Workflow**
   ```
   POST http://localhost:5000/api/dev/reset-sos
   Headers:
     Authorization: Bearer <paste-token-here>
   ```

4. **Verify State After Reset**
   ```
   GET http://localhost:5000/api/dev/state
   ```
   All counts should be 0 or near 0.

---

### Method 2: Using cURL

```bash
# Step 1: Check current state
curl http://localhost:5000/api/dev/state

# Step 2: Login to get token
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient@test.com","password":"password123"}' \
  | jq -r '.data.token')

# Step 3: Reset SOS workflow
curl -X POST http://localhost:5000/api/dev/reset-sos \
  -H "Authorization: Bearer $TOKEN"

# Step 4: Verify reset
curl http://localhost:5000/api/dev/state
```

---

### Method 3: Create a Quick Reset Script

Create a file `reset-sos.sh` in your project root:

```bash
#!/bin/bash

# Configuration
API_URL="http://localhost:5000/api"
EMAIL="patient@test.com"
PASSWORD="password123"

echo "🔍 Checking current system state..."
curl -s "$API_URL/dev/state" | jq '.data.state'

echo ""
echo "🔑 Logging in to get token..."
TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  | jq -r '.data.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Login failed. Check credentials."
  exit 1
fi

echo "✅ Login successful"
echo ""
echo "🧹 Resetting SOS workflow..."
curl -s -X POST "$API_URL/dev/reset-sos" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

echo ""
echo "✅ Reset complete!"
echo ""
echo "🔍 Verifying system state..."
curl -s "$API_URL/dev/state" | jq '.data.state'
```

Make it executable and run:
```bash
chmod +x reset-sos.sh
./reset-sos.sh
```

---

## Testing Workflow After Reset

### Fresh SOS Test Scenario:

1. **Reset the system** using any method above

2. **Browser 1 - Patient:**
   - Login as Patient
   - Navigate to `/emergency`
   - Search location and select ambulance
   - Create SOS request
   - ✅ Should succeed without "active request" error

3. **Browser 2 - Ambulance Personnel:**
   - Login as Ambulance Personnel
   - Navigate to `/emergency-requests`
   - See the new pending request
   - Accept the request
   - Update status through workflow

4. **Browser 1 - Patient:**
   - Receive acceptance notification
   - Continue through hospital selection
   - Complete workflow

5. **Repeat Testing:**
   - Run reset script again
   - Start fresh without any conflicts

---

## Safety Features

### ✅ Built-in Safeguards:

1. **Development Only**
   - Routes only available when `NODE_ENV=development`
   - Automatically disabled in production

2. **Authentication Required**
   - Reset endpoint requires valid JWT token
   - Prevents accidental resets by unauthorized users

3. **Atomic Operations**
   - All deletions wrapped in try-catch
   - Partial reset summary provided if errors occur

4. **Detailed Logging**
   - All reset operations logged to console
   - Summary report shows exactly what was cleared

5. **No Schema Changes**
   - Only deletes documents, never modifies schemas
   - Database structure remains intact

---

## Production Considerations

### ⚠️ IMPORTANT:

**This endpoint is DISABLED in production environments.**

When `NODE_ENV=production`, the `/api/dev/*` routes are not registered.

If you accidentally deploy with development mode:
1. Change `NODE_ENV` to `production` in `.env`
2. Restart the server
3. Routes will be unavailable

---

## Technical Details

### Collections Affected:

```javascript
// Deleted entirely:
EmergencyRequest.deleteMany({})  // All SOS requests
Emergency.deleteMany({})         // All emergencies
Vital.deleteMany({})             // All vitals
Consultation.deleteMany({})      // All consultations
Notification.deleteMany({})      // All notifications
Feedback.deleteMany({})          // All feedback

// Updated (status reset):
Ambulance.updateMany({}, {
  status: 'Available',
  isOnline: true,
  currentEmergency: null,
  currentRequest: null
})
```

### In-Memory State:

Socket.IO state (rooms, connections) is automatically cleared when:
- Clients reconnect after reset
- No persistent in-memory state to clear
- New connections join fresh rooms

---

## Troubleshooting

### Issue: "Cannot POST /api/dev/reset-sos"
**Solution:** Check that `NODE_ENV=development` in your `.env` file

### Issue: "Authentication required"
**Solution:** Login first and include `Authorization: Bearer <token>` header

### Issue: "Some data still exists after reset"
**Solution:** 
- Check the reset summary in response
- Run `/api/dev/state` to see current counts
- If partial reset occurred, error details in response

### Issue: "No ambulances available after reset"
**Solution:** 
- Reset only changes ambulance STATUS
- Run ambulance seed script if vehicles are missing:
  ```bash
  npm run seed:ambulances
  ```

---

## Example: Complete Reset Workflow

```bash
# 1. Check what needs to be reset
curl http://localhost:5000/api/dev/state | jq '.data.state'

# Output shows:
# - 3 active emergency requests
# - 2 ambulances busy
# - 150 vital records

# 2. Login and reset
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient@test.com","password":"password123"}' \
  | jq -r '.data.token')

curl -X POST http://localhost:5000/api/dev/reset-sos \
  -H "Authorization: Bearer $TOKEN"

# 3. Verify everything is clean
curl http://localhost:5000/api/dev/state | jq '.data.state'

# Output shows:
# - 0 emergency requests
# - 10 ambulances available (all reset)
# - 0 vitals

# 4. Start fresh testing!
```

---

## Summary

✅ **Problem Solved:** No more "active request" errors during testing  
✅ **Data Preserved:** All user accounts and seeded data intact  
✅ **Quick Reset:** One API call clears all SOS workflow data  
✅ **Safe:** Development only, authentication required  
✅ **Automated:** Can be scripted for rapid testing cycles  

**Now you can test the complete SOS workflow as many times as needed!**
