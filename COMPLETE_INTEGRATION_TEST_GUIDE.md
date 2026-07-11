# Complete Integration Test Guide

## Overview
This guide provides step-by-step instructions to test the complete TrackER Emergency Management System with MongoDB Atlas integration.

---

## Pre-Test Checklist

### 1. Environment Setup ✅
- [ ] Node.js installed (v16 or higher)
- [ ] MongoDB Atlas account created
- [ ] MongoDB connection string in server `.env`
- [ ] Both server and client dependencies installed

### 2. Install Dependencies
```bash
# Backend
cd Hackathonproject/server
npm install

# Frontend
cd Hackathonproject/client
npm install
```

### 3. Verify Environment Variables
**Server `.env` file:**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://trackerAdmin:TRACKERadmin1234@cluster0.uuv6jrp.mongodb.net/
JWT_SECRET=tracker_ai_super_secret_key_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

**Client `.env` file:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## Test Procedure

### Step 1: Start Backend Server

```bash
cd Hackathonproject/server
npm start
```

**Expected Output:**
```
✅ MongoDB Connected: cluster0.uuv6jrp.mongodb.net
✅ Database: test (or your database name)
✅ Server running in development mode on port 5000
✅ API Health Check: http://localhost:5000/api/health
✅ Socket.IO ready for real-time connections
```

**Verification:**
- Open browser: `http://localhost:5000/api/health`
- Should see: `{"status":"success","message":"API is running"}`

---

### Step 2: Start Frontend Application

```bash
# New terminal
cd Hackathonproject/client
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Verification:**
- Open browser: `http://localhost:5173`
- Home page should load with TrackER logo and feature cards

---

### Step 3: Test Authentication Flow

#### 3.1 Register New User
1. Navigate to: `http://localhost:5173/register`
2. Fill in form:
   - Name: `Test Patient`
   - Email: `testpatient@example.com`
   - Password: `TestPass123!`
   - Phone: `1234567890`
   - Role: `Patient`
3. Click "Register"

**Expected Result:**
- Success message displayed
- User created in MongoDB `users` collection
- Automatic login
- Redirect to Home page

**MongoDB Verification:**
```javascript
// In MongoDB Atlas or Compass
db.users.findOne({ email: "testpatient@example.com" })
```

#### 3.2 Login
1. Navigate to: `http://localhost:5173/login`
2. Enter credentials:
   - Email: `testpatient@example.com`
   - Password: `TestPass123!`
3. Click "Login"

**Expected Result:**
- JWT token stored in localStorage
- Redirect to Home page
- Navbar shows user avatar/name

---

### Step 4: Test Emergency Workflow (End-to-End)

#### 4.1 Create Emergency Request

1. **Navigate to Emergency Page**
   - From Home, click "Emergency Request" feature card
   - OR go to: `http://localhost:5173/emergency`

2. **Search for Location**
   - Enter: `Connaught Place Delhi`
   - Click "Search"
   - OR click "Demo" button

**Expected Result:**
- Map centers on location
- Available ambulances displayed on map
- Stats panel shows:
  - Total Nearby (X ambulances)
  - Available (green count)
  - Fastest ambulance highlighted

**MongoDB Verification:**
```javascript
// Emergency document created
db.emergencies.find().sort({ createdAt: -1 }).limit(1)
```

**Check localStorage:**
- Open DevTools → Application → Local Storage
- Verify `current_emergency_id` is set

3. **Accept Ambulance**
   - Click "Ambulance Accept" button
   - System assigns fastest ambulance

**Expected Result:**
- Ambulance assigned to emergency in MongoDB
- Redirect to Hospital Selection page

**MongoDB Verification:**
```javascript
// Check emergency has ambulance assigned
db.emergencies.findOne({ _id: ObjectId("emergency_id") })
// Should have: ambulance: ObjectId("ambulance_id")

// Check ambulance status updated
db.ambulances.findOne({ _id: ObjectId("ambulance_id") })
// Should have: status: "En Route", currentEmergency: ObjectId("emergency_id")
```

---

#### 4.2 Select Hospital

1. **Choose Hospital**
   - Select from dropdown OR search by patient location
   - Click on a hospital on the map
   - Click "ACCEPT SELECTED HOSPITAL & DISPATCH"

**Expected Result:**
- Hospital assigned to emergency
- Redirect to Vitals Monitoring page

**MongoDB Verification:**
```javascript
db.emergencies.findOne({ _id: ObjectId("emergency_id") })
// Should have: assignedHospital: ObjectId("hospital_id")
```

**Check localStorage:**
- `selected_hospital_id` should be set

---

#### 4.3 Monitor Vitals

1. **Start Monitoring**
   - Enter patient name: `John Doe`
   - Click "▶ Start Monitoring"

2. **Observe Real-Time Data**
   - Vitals update every second
   - Chart shows heart rate and SpO₂
   - Records table populates

**Expected Result:**
- Vitals saved to MongoDB every second
- Chart animates with live data
- Status changes (Stable/Warning/Critical) based on values

**MongoDB Verification:**
```javascript
// Multiple vital documents created
db.vitals.find({ emergency: ObjectId("emergency_id") }).sort({ recordedAt: -1 })

// Check nested structure
db.vitals.findOne()
// Should have:
// {
//   heartRate: { value: 75, unit: "bpm" },
//   bloodPressure: { systolic: 120, diastolic: 80, unit: "mmHg" },
//   temperature: { value: 98.6, unit: "F" },
//   oxygenSaturation: { value: 98, unit: "%" }
// }
```

3. **Navigate to Doctor Portal**
   - Click "Doctor Consultation Portal" button

---

#### 4.4 Doctor Consultation

1. **Load Patient Data**
   - Enter patient name: `John Doe`
   - Click "🔍 Load Patient Data"

**Expected Result:**
- Vitals history loaded from MongoDB
- Chart displays vital trends
- Latest vitals shown in summary

2. **Enter Assessment**
   - Type medical analysis in textarea:
     ```
     Patient shows stable vitals throughout transit.
     HR fluctuating between 70-110 bpm (normal).
     SpO2 maintained above 95% (good).
     Recommend continued monitoring and standard care.
     ```
   - Click "💾 Save Assessment & Notify Teams"

**Expected Result:**
- Consultation document created in MongoDB
- Success message displayed
- Redirect to Discharge page

**MongoDB Verification:**
```javascript
db.consultations.find({ emergency: ObjectId("emergency_id") }).sort({ createdAt: -1 })
// Check fields:
// - chiefComplaint
// - diagnosis.primary
// - treatmentPlan
// - notes
```

---

#### 4.5 Patient Discharge

1. **Generate Summary**
   - Enter patient name: `John Doe`
   - Click "✨ Generate Doctor Summary"

**Expected Result:**
- Auto-generated summary with:
  - Latest vitals from MongoDB
  - Vital trends
  - Treatments administered
  - Discharge instructions
- Status badge (Stable/Improving/Critical)

2. **Approve Handover**
   - Click "✅ Approve & Complete Handover"

**Expected Result:**
- Discharge summary saved to workflow context
- Success message displayed
- Redirect to Feedback page

---

#### 4.6 Submit Feedback

1. **Rate Experience**
   - Click on stars (1-5)
   - Enter optional comments
   - Click "Submit Feedback"

**Expected Result:**
- Feedback document created in MongoDB
- Success animations displayed
- Final messages (Hospital acceptance, Doctor greeting, Recovery wishes)

**MongoDB Verification:**
```javascript
db.feedbacks.find({ relatedTo.emergency: ObjectId("emergency_id") }).sort({ createdAt: -1 })
// Check fields:
// - user
// - type: "Emergency"
// - rating
// - title
// - comment
// - relatedTo: { emergency: ObjectId, hospital: ObjectId }
```

2. **Return to Home**
   - Click "🏠 Return to Home"

---

### Step 5: Test Navigation & UI

#### 5.1 Navbar Features
- [ ] Home link works
- [ ] Settings link opens settings page
- [ ] Help link opens help page
- [ ] Profile avatar opens dropdown
- [ ] Dropdown shows user name, email, role
- [ ] Logout clears auth and redirects to login

#### 5.2 Profile Management
1. Go to Profile page
2. Update information:
   - Name: `Updated Name`
   - Email: `updated@example.com`
3. Click "Save Changes"

**Expected Result:**
- Success message
- Navbar dropdown immediately updates
- Data saved to localStorage
- MongoDB user document updated (if backend integrated)

#### 5.3 Settings Page
1. Go to Settings page
2. Toggle notification preferences
3. Click "Save Changes"

**Expected Result:**
- Success message
- Settings persisted

---

### Step 6: Test Error Handling & Fallbacks

#### 6.1 API Unavailable
1. **Stop backend server** (Ctrl+C)
2. **Try creating emergency**
   - Should show warning: "Failed to fetch ambulances. Using demo data."
   - Should still display mock ambulances
   - Should not crash

3. **Try other pages**
   - All pages should remain functional
   - Mock/dummy data displayed as fallback

**Expected Result:**
- Graceful degradation
- No white screens or crashes
- User-friendly error messages

#### 6.2 Restart Backend
1. Start server again: `npm start`
2. Refresh frontend
3. Test workflow again - should work normally

---

### Step 7: MongoDB Data Verification

#### 7.1 Check All Collections

**Users:**
```javascript
db.users.count()
db.users.find().pretty()
```

**Emergencies:**
```javascript
db.emergencies.count()
db.emergencies.find().sort({ createdAt: -1 }).limit(5)
```

**Ambulances:**
```javascript
db.ambulances.count()
db.ambulances.find({ status: "Available" })
```

**Hospitals:**
```javascript
db.hospitals.count()
db.hospitals.find({ status: "Active" })
```

**Vitals:**
```javascript
db.vitals.count()
db.vitals.find().sort({ recordedAt: -1 }).limit(10)
```

**Consultations:**
```javascript
db.consultations.count()
db.consultations.find().sort({ createdAt: -1 })
```

**Feedbacks:**
```javascript
db.feedbacks.count()
db.feedbacks.find().sort({ createdAt: -1 })
```

---

### Step 8: Test Geospatial Queries

#### 8.1 Test Nearby Ambulances API
```bash
curl "http://localhost:5000/api/ambulances/available?longitude=77.2090&latitude=28.6139&maxDistance=50000"
```

**Expected Response:**
```json
{
  "status": "success",
  "results": 5,
  "data": {
    "ambulances": [
      {
        "_id": "...",
        "vehicleNumber": "DL01AB1234",
        "type": "Advanced Life Support",
        "status": "Available",
        "currentLocation": {
          "type": "Point",
          "coordinates": [77.2090, 28.6139]
        }
      }
    ]
  }
}
```

#### 8.2 Test Nearby Hospitals API
```bash
curl "http://localhost:5000/api/hospitals/nearby?longitude=77.5946&latitude=12.9716&maxDistance=50000"
```

---

### Step 9: Test Authentication & Authorization

#### 9.1 Protected Routes
1. **Logout** from application
2. Try accessing: `http://localhost:5173/vitals`

**Expected Result:**
- Redirect to login page
- OR "Unauthorized" message

#### 9.2 JWT Token
1. **Login** again
2. Open DevTools → Application → Local Storage
3. Check for token (key might be `token`, `authToken`, or `user`)

4. **Test API call with token:**
```bash
# Replace YOUR_TOKEN with actual token
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/emergencies
```

---

### Step 10: Performance & Load Testing

#### 10.1 Create Multiple Emergencies
Run this script to create 10 emergencies:
```javascript
// In browser console (after login)
for (let i = 0; i < 10; i++) {
  fetch('http://localhost:5000/api/emergencies', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    },
    body: JSON.stringify({
      patient: 'patient-id',
      type: 'Accident',
      severity: 'High',
      description: `Test emergency ${i}`,
      location: {
        type: 'Point',
        coordinates: [77 + Math.random(), 12 + Math.random()],
        address: `Test location ${i}`
      },
      contactNumber: '1234567890'
    })
  }).then(r => r.json()).then(console.log);
}
```

#### 10.2 Verify Pagination
```bash
curl "http://localhost:5000/api/emergencies?page=1&limit=5"
curl "http://localhost:5000/api/emergencies?page=2&limit=5"
```

---

## Common Issues & Solutions

### Issue 1: MongoDB Connection Failed
**Error:** `MongooseServerSelectionError: connect ECONNREFUSED`

**Solutions:**
- Verify MongoDB Atlas connection string
- Check network connectivity
- Whitelist IP address in MongoDB Atlas
- Verify username/password

### Issue 2: CORS Error
**Error:** `Access to fetch at 'http://localhost:5000' from origin 'http://localhost:5173' has been blocked by CORS`

**Solution:**
- Verify `CLIENT_URL=http://localhost:5173` in server `.env`
- Check CORS middleware in server `app.js`

### Issue 3: Port Already in Use
**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solutions:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### Issue 4: JWT Token Invalid
**Error:** `JsonWebTokenError: invalid token`

**Solutions:**
- Clear localStorage and login again
- Verify JWT_SECRET matches in `.env`
- Check token expiration

### Issue 5: Vitals Not Saving
**Check:**
- localStorage has `current_emergency_id`
- Backend console for errors
- MongoDB vitals collection

**Debug:**
```javascript
console.log('Emergency ID:', localStorage.getItem('current_emergency_id'));
```

---

## Success Criteria Checklist

### ✅ Backend
- [ ] Server starts without errors
- [ ] MongoDB connection successful
- [ ] All API endpoints respond
- [ ] Socket.IO initializes
- [ ] Health check returns success

### ✅ Frontend
- [ ] App loads without errors
- [ ] No console errors
- [ ] All pages render correctly
- [ ] Navigation works smoothly

### ✅ Authentication
- [ ] User registration works
- [ ] User login works
- [ ] JWT token issued and stored
- [ ] Protected routes check auth
- [ ] Logout clears session

### ✅ Emergency Workflow
- [ ] Emergency created in MongoDB
- [ ] Ambulances fetched from API
- [ ] Ambulance assigned successfully
- [ ] Hospital assigned successfully
- [ ] Emergency ID persists across pages

### ✅ Vitals Monitoring
- [ ] Vitals save to MongoDB
- [ ] Real-time updates display
- [ ] Chart animates correctly
- [ ] Records table populates

### ✅ Doctor Consultation
- [ ] Vitals load from MongoDB
- [ ] Consultation saves successfully
- [ ] Analysis stored in database

### ✅ Discharge & Feedback
- [ ] Latest vitals retrieved
- [ ] Discharge summary generated
- [ ] Feedback saves to MongoDB

### ✅ MongoDB Integration
- [ ] All collections created
- [ ] Documents have correct schema
- [ ] Geospatial queries work
- [ ] References populate correctly
- [ ] Indexes created

### ✅ Error Handling
- [ ] API errors don't crash app
- [ ] Fallback data displays
- [ ] User-friendly error messages
- [ ] Graceful degradation

---

## Test Results Template

```
# Test Execution Report
Date: ___________
Tester: ___________

## Backend Server
- [✅/❌] Server starts: ______
- [✅/❌] MongoDB connects: ______
- [✅/❌] Health check passes: ______

## Frontend Application
- [✅/❌] App loads: ______
- [✅/❌] Home page renders: ______
- [✅/❌] No console errors: ______

## Authentication
- [✅/❌] Register works: ______
- [✅/❌] Login works: ______
- [✅/❌] JWT stored: ______

## Emergency Workflow
- [✅/❌] Emergency created: ______
- [✅/❌] Ambulance assigned: ______
- [✅/❌] Hospital assigned: ______
- [✅/❌] Vitals saved: ______
- [✅/❌] Consultation saved: ______
- [✅/❌] Feedback submitted: ______

## MongoDB Verification
- [✅/❌] Users collection: ______
- [✅/❌] Emergencies collection: ______
- [✅/❌] Vitals collection: ______
- [✅/❌] Consultations collection: ______
- [✅/❌] Feedbacks collection: ______

## Overall Result
- [✅/❌] PASSED / FAILED
- Notes: _______________
```

---

## Next Steps After Testing

### If All Tests Pass ✅
1. **Seed Database** with realistic data
2. **Configure Production MongoDB** Atlas cluster
3. **Set up CI/CD** pipeline
4. **Deploy Backend** (e.g., Render, Railway, AWS)
5. **Deploy Frontend** (e.g., Vercel, Netlify)
6. **Configure Production** environment variables
7. **Test Production** deployment

### If Tests Fail ❌
1. **Review error logs** in console and terminal
2. **Check MongoDB Atlas** connectivity
3. **Verify environment variables**
4. **Check network/firewall** settings
5. **Review modified files** for syntax errors
6. **Consult documentation** files

---

## Support & Documentation

### Documentation Files:
- `PART3A_API_INTEGRATION_SUMMARY.md` - API integration details
- `PART3B_API_INTEGRATION_COMPLETE.md` - Frontend-backend connection
- `MONGODB_INTEGRATION_COMPLETE.md` - MongoDB setup and schema
- `COMPLETE_INTEGRATION_TEST_GUIDE.md` - This file

### Key Files:
- Backend: `server/src/server.js`, `server/src/config/database.js`
- Frontend: `client/src/main.jsx`, `client/src/App.jsx`
- Models: `server/src/models/*.js`
- Services: `server/src/services/*.js`
- API Client: `client/src/services/*.js`

---

**Test Status: READY TO EXECUTE** ✅

This guide provides comprehensive testing coverage for the complete TrackER system with MongoDB integration.
